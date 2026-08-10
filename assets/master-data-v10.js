(()=>{
  'use strict';

  const VERSION='1.0.0';
  const STORAGE_KEY='ee_v10_master_governance';
  const PURCHASES_KEY='ee_v24_material_purchases';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  const target=document.querySelector('#master-data-v10');
  const QUALITY=new Set(['PENDIENTE','PARCIAL','REVISADO','VALIDADO']);
  const SENSITIVITY=new Set(['SIN_CLASIFICAR','BAJA','MEDIA','ALTA','CRITICA']);

  const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const writeJSON=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:2}).format(Number(value)||0);
  const dateOnly=value=>String(value||'').slice(0,10);
  const nowISO=()=>new Date().toISOString();

  function blankStore(){return {version:VERSION,materials:{},suppliers:{}};}
  function readGovernance(){
    const raw=readJSON(STORAGE_KEY,blankStore());
    return {
      version:VERSION,
      materials:raw&&typeof raw.materials==='object'&&raw.materials?raw.materials:{},
      suppliers:raw&&typeof raw.suppliers==='object'&&raw.suppliers?raw.suppliers:{}
    };
  }
  function cleanMeta(input={}){
    const quality=String(input.quality||'PENDIENTE').toUpperCase();
    const sensitivity=String(input.sensitivity||'SIN_CLASIFICAR').toUpperCase();
    return {
      owner:String(input.owner||'').trim(),
      source:String(input.source||'').trim(),
      reviewedAt:dateOnly(input.reviewedAt),
      quality:QUALITY.has(quality)?quality:'PENDIENTE',
      sensitivity:SENSITIVITY.has(sensitivity)?sensitivity:'SIN_CLASIFICAR',
      note:String(input.note||'').trim(),
      updatedAt:nowISO()
    };
  }
  function saveMaterialGovernance(materialId,input={}){
    if(!DATA?.materials?.some(item=>item.id===materialId))throw new Error('Material maestro inexistente');
    const store=readGovernance();
    store.materials[materialId]=cleanMeta(input);
    writeJSON(STORAGE_KEY,store);
    return store.materials[materialId];
  }
  function saveSupplierGovernance(name,input={}){
    const canonical=String(name||'').trim();
    const key=norm(canonical);
    if(!key)throw new Error('Proveedor requerido');
    const store=readGovernance();
    store.suppliers[key]={name:canonical,...cleanMeta(input)};
    writeJSON(STORAGE_KEY,store);
    return store.suppliers[key];
  }
  function purchases(){
    const rows=readJSON(PURCHASES_KEY,[]);
    return Array.isArray(rows)?rows:[];
  }
  function purchaseDate(row){return String(row.receivedDate||row.received_date||row.createdAt||row.created_at||'');}
  function purchaseMaterial(row){return String(row.materialId||row.material_id||'');}
  function purchaseSupplier(row){return String(row.supplier||row.supplier_name_snapshot||'').trim();}
  function purchaseUnitCost(row){return Number(row.unitCost??row.unit_cost)||0;}
  function latestPurchaseMap(){
    const map=new Map();
    purchases().slice().sort((a,b)=>purchaseDate(b).localeCompare(purchaseDate(a))).forEach(row=>{
      const id=purchaseMaterial(row);
      if(id&&!map.has(id))map.set(id,row);
    });
    return map;
  }
  function supplierStats(){
    const grouped=new Map();
    purchases().forEach(row=>{
      const supplier=purchaseSupplier(row);
      if(!supplier)return;
      const key=norm(supplier);
      const current=grouped.get(key)||{key,name:supplier,count:0,materials:new Set(),lastDate:'',lastUnitCost:0};
      current.count+=1;
      const materialId=purchaseMaterial(row);
      if(materialId)current.materials.add(materialId);
      const date=purchaseDate(row);
      if(!current.lastDate||date>current.lastDate){
        current.lastDate=date;
        current.lastUnitCost=purchaseUnitCost(row);
        current.name=supplier;
      }
      grouped.set(key,current);
    });
    return grouped;
  }
  function materialRows(){
    if(!DATA?.materials)return [];
    const store=readGovernance();
    const latest=latestPurchaseMap();
    return DATA.materials.map(material=>({
      material,
      governance:store.materials[material.id]||null,
      observed:latest.get(material.id)||null
    }));
  }
  function supplierRows(){
    const store=readGovernance();
    const stats=supplierStats();
    Object.entries(store.suppliers).forEach(([key,meta])=>{
      if(!stats.has(key))stats.set(key,{key,name:meta.name||key,count:0,materials:new Set(),lastDate:'',lastUnitCost:0});
    });
    return [...stats.values()].map(row=>({...row,materials:[...row.materials],governance:store.suppliers[row.key]||null}))
      .sort((a,b)=>a.name.localeCompare(b.name,'es'));
  }
  function snapshot(){
    const purchaseText=localStorage.getItem(PURCHASES_KEY);
    const materialSignature=DATA?.materials?.map(item=>({id:item.id,cost:item.cost,status:item.status,confidence:item.confidence}))||[];
    return {purchaseText,materialSignature};
  }
  function integrityUnchanged(before){
    return JSON.stringify(before.materialSignature)===JSON.stringify(DATA?.materials?.map(item=>({id:item.id,cost:item.cost,status:item.status,confidence:item.confidence}))||[])
      && before.purchaseText===localStorage.getItem(PURCHASES_KEY);
  }
  function badge(meta){
    if(!meta)return '<span class="md-v10-badge pending">Sin gobierno</span>';
    return `<span class="md-v10-badge ${meta.quality.toLowerCase()}">${esc(meta.quality)}</span><small>${esc(meta.sensitivity.replace('_',' '))}</small>`;
  }
  function metrics(){
    const rows=materialRows(), suppliers=supplierRows();
    return {
      materials:rows.length,
      withObserved:rows.filter(row=>row.observed).length,
      governed:rows.filter(row=>row.governance).length,
      suppliers:suppliers.length,
      suppliersGoverned:suppliers.filter(row=>row.governance).length
    };
  }
  function materialTable(){
    const rows=materialRows();
    return `<div class="md-v10-table-wrap"><table class="md-v10-table"><thead><tr><th>Material maestro</th><th>Estándar provisional</th><th>Última evidencia observada</th><th>Gobierno</th><th></th></tr></thead><tbody>${rows.map(({material,observed,governance})=>`
      <tr data-md-material-row="${esc(material.id)}">
        <td><strong>${esc(material.name)}</strong><small>${esc(material.id)} · ${esc(material.unit)}</small></td>
        <td>${money(material.cost)} / ${esc(material.unit)}<small>${esc(material.status)} · confianza ${esc(material.confidence)}</small></td>
        <td>${observed?`${money(purchaseUnitCost(observed))} / ${esc(material.unit)}<small>${esc(purchaseSupplier(observed)||'Proveedor sin nombre')} · ${esc(dateOnly(purchaseDate(observed))||'sin fecha')}</small>`:'<span class="md-v10-muted">Sin compra observada</span>'}</td>
        <td>${badge(governance)}${governance?.owner?`<small>Resp. ${esc(governance.owner)}</small>`:''}</td>
        <td><button type="button" class="md-v10-link" data-md-edit-material="${esc(material.id)}">Gobernar</button></td>
      </tr>`).join('')}</tbody></table></div>`;
  }
  function supplierTable(){
    const rows=supplierRows();
    if(!rows.length)return '<div class="md-v10-empty">Aún no hay proveedores observados ni registrados en gobierno.</div>';
    return `<div class="md-v10-table-wrap"><table class="md-v10-table"><thead><tr><th>Proveedor</th><th>Evidencia de compra</th><th>Materiales</th><th>Gobierno</th><th></th></tr></thead><tbody>${rows.map(row=>`
      <tr data-md-supplier-row="${esc(row.key)}">
        <td><strong>${esc(row.name)}</strong></td>
        <td>${row.count?`${row.count} compra${row.count===1?'':'s'}<small>Última ${esc(dateOnly(row.lastDate))} · ${money(row.lastUnitCost)}</small>`:'<span class="md-v10-muted">Sin compras</span>'}</td>
        <td>${row.materials.length}<small>${esc(row.materials.slice(0,3).join(', ')||'Sin asociación observada')}</small></td>
        <td>${badge(row.governance)}${row.governance?.owner?`<small>Resp. ${esc(row.governance.owner)}</small>`:''}</td>
        <td><button type="button" class="md-v10-link" data-md-edit-supplier="${esc(row.key)}">Gobernar</button></td>
      </tr>`).join('')}</tbody></table></div>`;
  }
  const options=(items,current)=>items.map(item=>`<option value="${item}"${item===current?' selected':''}>${item.replaceAll('_',' ')}</option>`).join('');
  function formFields(meta={}){
    return `<div class="md-v10-form-grid">
      <label><span>Responsable</span><input name="owner" value="${esc(meta.owner||'')}" placeholder="Nombre o rol responsable"></label>
      <label><span>Fuente específica</span><input name="source" value="${esc(meta.source||'')}" placeholder="Factura, ficha, conversación, documento"></label>
      <label><span>Fecha de revisión</span><input type="date" name="reviewedAt" value="${esc(dateOnly(meta.reviewedAt))}"></label>
      <label><span>Calidad de gobierno</span><select name="quality">${options([...QUALITY],meta.quality||'PENDIENTE')}</select></label>
      <label><span>Sensibilidad operativa</span><select name="sensitivity">${options([...SENSITIVITY],meta.sensitivity||'SIN_CLASIFICAR')}</select></label>
    </div><label><span>Nota de gobierno</span><textarea name="note" rows="2" placeholder="Qué falta confirmar, por qué importa o cuándo revisar">${esc(meta.note||'')}</textarea></label>`;
  }
  function forms(){
    const materialOptions=(DATA?.materials||[]).map(item=>`<option value="${esc(item.id)}">${esc(item.name)} · ${esc(item.id)}</option>`).join('');
    const supplierOptions=supplierRows().map(item=>`<option value="${esc(item.name)}"></option>`).join('');
    return `<div class="md-v10-forms">
      <details id="md-v10-material-details"><summary>Gobernar material</summary><form id="md-v10-material-form"><label><span>Material</span><select name="materialId">${materialOptions}</select></label><div data-md-material-fields>${formFields()}</div><button type="submit" class="md-v10-primary">Guardar gobierno del material</button></form></details>
      <details id="md-v10-supplier-details"><summary>Gobernar proveedor</summary><form id="md-v10-supplier-form"><label><span>Proveedor</span><input name="supplier" list="md-v10-supplier-list" required placeholder="Proveedor observado o nuevo"><datalist id="md-v10-supplier-list">${supplierOptions}</datalist></label><div data-md-supplier-fields>${formFields()}</div><button type="submit" class="md-v10-primary">Guardar gobierno del proveedor</button></form></details>
    </div>`;
  }
  function render(){
    if(!target||!DATA)return;
    const m=metrics();
    target.innerHTML=`<section class="md-v10-shell" data-master-data-version="${VERSION}">
      <header class="md-v10-head"><div><p class="eyebrow">Datos maestros V1.0</p><h2>Materiales, proveedores y evidencia sin alterar los hechos.</h2><p>Esta capa gobierna responsables, fuentes, calidad y sensibilidad. Las compras observadas permanecen como evidencia; la BOM y el costo estándar/provisional no se reescriben desde aquí.</p></div><span class="md-v10-local">Overlay local · no autoriza producción</span></header>
      <div class="md-v10-metrics"><article><strong>${m.materials}</strong><span>materiales</span></article><article><strong>${m.withObserved}</strong><span>con compra observada</span></article><article><strong>${m.governed}</strong><span>gobernados</span></article><article><strong>${m.suppliers}</strong><span>proveedores</span></article></div>
      ${forms()}
      <section class="md-v10-section"><div class="md-v10-section-head"><h3>Materiales</h3><p>Comparación entre estándar provisional y última evidencia observada.</p></div>${materialTable()}</section>
      <section class="md-v10-section"><div class="md-v10-section-head"><h3>Proveedores</h3><p>La evidencia se deriva del historial de compras; el gobierno se guarda por separado.</p></div>${supplierTable()}</section>
    </section>`;
    bind();
  }
  function fillMaterial(id){
    const form=target?.querySelector('#md-v10-material-form'); if(!form)return;
    const meta=readGovernance().materials[id]||{};
    form.elements.materialId.value=id;
    form.querySelector('[data-md-material-fields]').innerHTML=formFields(meta);
    target.querySelector('#md-v10-material-details').open=true;
    target.querySelector('#md-v10-material-details').scrollIntoView({block:'nearest'});
  }
  function fillSupplier(key){
    const row=supplierRows().find(item=>item.key===key); if(!row)return;
    const form=target?.querySelector('#md-v10-supplier-form'); if(!form)return;
    form.elements.supplier.value=row.governance?.name||row.name;
    form.querySelector('[data-md-supplier-fields]').innerHTML=formFields(row.governance||{});
    target.querySelector('#md-v10-supplier-details').open=true;
    target.querySelector('#md-v10-supplier-details').scrollIntoView({block:'nearest'});
  }
  function formMeta(fd){return {owner:fd.get('owner'),source:fd.get('source'),reviewedAt:fd.get('reviewedAt'),quality:fd.get('quality'),sensitivity:fd.get('sensitivity'),note:fd.get('note')};}
  function bind(){
    target.querySelectorAll('[data-md-edit-material]').forEach(button=>button.addEventListener('click',()=>fillMaterial(button.dataset.mdEditMaterial)));
    target.querySelectorAll('[data-md-edit-supplier]').forEach(button=>button.addEventListener('click',()=>fillSupplier(button.dataset.mdEditSupplier)));
    target.querySelector('#md-v10-material-form')?.addEventListener('submit',event=>{
      event.preventDefault();
      const before=snapshot(), fd=new FormData(event.currentTarget);
      saveMaterialGovernance(String(fd.get('materialId')),formMeta(fd));
      if(!integrityUnchanged(before))throw new Error('La capa de gobierno alteró hechos o estándar');
      render();
    });
    target.querySelector('#md-v10-supplier-form')?.addEventListener('submit',event=>{
      event.preventDefault();
      const before=snapshot(), fd=new FormData(event.currentTarget);
      saveSupplierGovernance(String(fd.get('supplier')),formMeta(fd));
      if(!integrityUnchanged(before))throw new Error('La capa de gobierno alteró hechos o estándar');
      render();
    });
  }

  const API=Object.freeze({
    version:VERSION,
    storageKey:STORAGE_KEY,
    purchasesKey:PURCHASES_KEY,
    readGovernance,
    saveMaterialGovernance,
    saveSupplierGovernance,
    materialRows,
    supplierRows,
    integritySnapshot:snapshot,
    integrityUnchanged
  });
  window.EL_ERRANTE_MASTER_DATA_V10=API;
  if(DATA&&target)render();
})();