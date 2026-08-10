(()=>{
  'use strict';
  const VERSION='2.3.1';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  if(!DATA)return;
  const ORDER_KEY='ee_v14_orders';
  const STOCK_KEY='ee_v23_material_stock';
  const DATE_KEY='ee_v22_selected_date';
  const ACTIVE=new Set(['approved','preparing']);
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const qty=(value,unit)=>`${new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(Number(value)||0)} ${unit}`;
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const selectedDate=()=>sessionStorage.getItem(DATE_KEY)||new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});

  function findProduct(item){
    const ids=[item.productId,item.product_id,item.variantId,item.variant_id].filter(Boolean).map(String);
    const name=norm(item.name||item.product_name);
    return DATA.products.find(product=>product.ids.some(id=>ids.includes(id))||product.names.some(candidate=>norm(candidate)===name)||norm(product.name)===name)||null;
  }

  function explodeProduct(product,amount,bag=new Map(),seen=new Set()){
    if(!product||seen.has(product.sku))return bag;
    const next=new Set(seen);next.add(product.sku);
    (product.bom||[]).forEach(line=>bag.set(line.materialId,(bag.get(line.materialId)||0)+(line.qty*amount)));
    (product.components||[]).forEach(component=>explodeProduct(DATA.products.find(item=>item.sku===component.sku),amount*component.qty,bag,next));
    return bag;
  }

  function dayOrders(){
    const date=selectedDate();
    return read(ORDER_KEY,[]).filter(order=>ACTIVE.has(String(order.status))&&(order.delivery?.requestedDate||order.requested_date)===date);
  }

  function plan(){
    const orders=dayOrders();
    const products=new Map();
    const materials=new Map();
    let estimatedCost=0;
    let unmatched=0;
    orders.forEach(order=>(order.items||[]).forEach(item=>{
      const amount=Number(item.quantity)||0;
      const product=findProduct(item);
      if(!product){unmatched+=amount;return;}
      const row=products.get(product.sku)||{product,qty:0};row.qty+=amount;products.set(product.sku,row);
      estimatedCost+=product.cost*amount;
      explodeProduct(product,amount,materials);
    }));
    return {date:selectedDate(),orders,products:[...products.values()],materials,estimatedCost,unmatched};
  }

  function materialRows(planData){
    const stock=read(STOCK_KEY,{});
    return [...planData.materials.entries()].map(([id,required])=>{
      const material=DATA.materials.find(item=>item.id===id)||{id,name:id,unit:'unidad',cost:0,status:'PENDIENTE'};
      const raw=stock[id];
      const known=raw!==undefined&&raw!==null&&raw!=='';
      const available=known?Number(raw):null;
      const gap=known?Math.max(0,required-available):null;
      const status=!known?'pending':gap>0?'short':'ok';
      return {material,required,available,gap,status};
    }).sort((a,b)=>({short:0,pending:1,ok:2}[a.status]-{short:0,pending:1,ok:2}[b.status])||a.material.name.localeCompare(b.material.name,'es'));
  }

  function productTable(rows){
    if(!rows.length)return '<div class="ee-v23-empty">No hay productos aprobados o en preparación para la fecha seleccionada.</div>';
    return `<div class="ee-v23-table-wrap"><table class="ee-v23-table"><thead><tr><th>Producto</th><th>Unidades</th><th>Físicas</th><th>Costo variable aprox.</th></tr></thead><tbody>${rows.map(({product,qty:amount})=>`<tr data-v23-product="${esc(product.sku)}"><td><strong>${esc(product.name)}</strong><small>${esc(product.status)}</small></td><td>${amount}</td><td>${amount*product.physicalUnits}</td><td>${money(product.cost*amount)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function requirementTable(rows){
    if(!rows.length)return '<div class="ee-v23-empty">La agenda todavía no genera requerimientos de materiales.</div>';
    return `<div class="ee-v23-table-wrap"><table class="ee-v23-table"><thead><tr><th>Materia prima o empaque</th><th>Requerido</th><th>Disponible</th><th>Decisión</th></tr></thead><tbody>${rows.map(row=>`<tr data-v23-material="${esc(row.material.id)}"><td><strong>${esc(row.material.name)}</strong><small>${esc(row.material.status)} · confianza ${esc(row.material.confidence||'pendiente')}</small></td><td>${qty(row.required,row.material.unit)}</td><td>${row.available===null?'<span class="ee-v23-muted">Sin conteo</span>':qty(row.available,row.material.unit)}</td><td><span class="ee-v23-state" data-state="${row.status}">${row.status==='ok'?'Cubierto':row.status==='short'?`Faltan ${qty(row.gap,row.material.unit)}`:'Contar inventario'}</span></td></tr>`).join('')}</tbody></table></div>`;
  }

  function stockEditor(rows){
    return `<details class="ee-v23-details" id="ee-v23-stock"><summary>Actualizar conteo de materiales</summary><div class="ee-v23-editor"><p>Deja el campo vacío cuando no exista conteo. <strong>Cero</strong> significa inventario físico confirmado en cero.</p><div class="ee-v23-stock-grid">${rows.map(row=>`<label><span>${esc(row.material.name)} <small>(${esc(row.material.unit)})</small></span><input type="number" min="0" step="0.01" data-v23-stock="${esc(row.material.id)}" value="${row.available===null?'':esc(row.available)}" placeholder="Sin conteo"></label>`).join('')}</div><button type="button" class="ee-v23-button" id="ee-v23-save-stock">Guardar conteo</button></div></details>`;
  }

  function saveVisibleStock(root){
    const current=read(STOCK_KEY,{});
    const values=current&&typeof current==='object'&&!Array.isArray(current)?{...current}:{};
    root.querySelectorAll('[data-v23-stock]').forEach(input=>{
      const id=input.dataset.v23Stock;
      const raw=String(input.value??'').trim();
      if(raw===''){delete values[id];return;}
      const value=Number(raw);
      if(Number.isFinite(value)&&value>=0)values[id]=value;
    });
    write(STOCK_KEY,values);
    return values;
  }

  function recipeExplorer(){
    const options=DATA.products.map(product=>`<option value="${esc(product.sku)}">${esc(product.name)}</option>`).join('');
    return `<details class="ee-v23-details"><summary>Consultar receta y costo provisional</summary><div class="ee-v23-recipe"><label><span>Producto</span><select id="ee-v23-recipe-select">${options}</select></label><div id="ee-v23-recipe-output"></div><div class="ee-v23-master-recipe"><h4>Masa base con poolish</h4><p>${esc(DATA.recipes[0].note)}</p></div></div></details>`;
  }

  function renderRecipe(sku){
    const target=document.querySelector('#ee-v23-recipe-output');
    const product=DATA.products.find(item=>item.sku===sku);
    if(!target||!product)return;
    const lines=(product.components?.length?product.components.map(component=>{const child=DATA.products.find(item=>item.sku===component.sku);return `${component.qty} × ${child?.name||component.sku}`;}):product.bom.map(line=>{const material=DATA.materials.find(item=>item.id===line.materialId);return `${qty(line.qty,material?.unit||'unidad')} · ${material?.name||line.materialId}`;}));
    target.innerHTML=`<div class="ee-v23-recipe-head"><div><h4>${esc(product.name)}</h4><p>${esc(product.sku)} · ${esc(product.status)}</p></div><strong>${money(product.cost)}</strong></div><ul>${lines.map(line=>`<li>${esc(line)}</li>`).join('')}</ul><p class="ee-v23-note">Costo directo provisional. No incluye mano de obra formal, impuestos definitivos ni validación de rendimiento.</p>`;
  }

  function wrapFinance(){
    const finance=document.querySelector('#operations-v16');
    if(!finance||finance.closest('.ee-v23-finance'))return;
    const details=document.createElement('details');details.className='ee-v23-finance';
    const summary=document.createElement('summary');summary.innerHTML='<span><strong>Resumen financiero y análisis avanzado</strong><small>Ventas, margen, equilibrio e inventario terminado</small></span><span>Ver análisis</span>';
    finance.parentNode.insertBefore(details,finance);details.append(summary,finance);
  }

  function shell(){
    const target=document.querySelector('#materials-v23');
    if(!target)return;
    const p=plan();const rows=materialRows(p);
    const shortages=rows.filter(row=>row.status==='short').length;
    const unknown=rows.filter(row=>row.status==='pending').length;
    target.innerHTML=`<section class="ee-v23-shell"><div class="ee-v23-heading"><div><p class="eyebrow">Materias primas e inventario inteligente · V${VERSION}</p><h2>Lo necesario para producir, sin saturar el panel.</h2><p>La agenda se convierte en requerimientos de materiales y costos provisionales. Solo aparecen decisiones que requieren atención.</p></div><span class="ee-v23-mode">Modelo provisional</span></div><div class="ee-v23-notice"><strong>Lectura responsable del dato</strong><span>${esc(DATA.notice)}</span></div><div class="ee-v23-metrics"><article><small>Pedidos de la fecha</small><strong>${p.orders.length}</strong></article><article><small>Costo variable aprox.</small><strong>${money(p.estimatedCost)}</strong></article><article><small>Faltantes confirmados</small><strong>${shortages}</strong></article><article><small>Conteos pendientes</small><strong>${unknown}</strong></article></div><div class="ee-v23-grid"><section class="ee-v23-panel"><div class="ee-v23-panel-head"><div><p class="eyebrow">Qué producir</p><h3>Productos comprometidos · ${esc(p.date)}</h3></div></div>${productTable(p.products)}</section><section class="ee-v23-panel"><div class="ee-v23-panel-head"><div><p class="eyebrow">Qué hace falta</p><h3>Materiales y empaques</h3></div><span>${rows.length} requerimientos</span></div>${requirementTable(rows)}</section></div>${stockEditor(rows)}${recipeExplorer()}${p.unmatched?`<div class="ee-v23-warning"><strong>${p.unmatched} unidad(es) sin BOM reconocida</strong><span>Revisa el nombre o variante antes de usar este cálculo para comprar.</span></div>`:''}</section>`;
    target.querySelector('#ee-v23-save-stock')?.addEventListener('click',()=>{saveVisibleStock(target);shell();});
    const select=target.querySelector('#ee-v23-recipe-select');select?.addEventListener('change',()=>renderRecipe(select.value));if(select)renderRecipe(select.value);
    document.documentElement.dataset.materialsVersion=VERSION;
    wrapFinance();
  }

  const boot=()=>{shell();wrapFinance();};
  window.addEventListener('ee:v22:reload',shell);
  window.addEventListener('ee:admin:ready',shell);
  window.addEventListener('ee:v24:stock-updated',shell);
  window.addEventListener('storage',event=>{if([ORDER_KEY,STOCK_KEY].includes(event.key))shell();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50),{once:true});else setTimeout(boot,50);
})();