(()=>{
  'use strict';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  if(!DATA)return;
  const KEYS={orders:'ee_v14_orders',stock:'ee_v23_material_stock',measurements:'ee_v24_production_measurements',purchases:'ee_v24_material_purchases'};
  const DATE_KEY='ee_v22_selected_date';
  const ACTIVE=new Set(['approved','preparing']);
  const POLICY={yieldTolerancePercent:5,wasteAlertPercent:5,costVariancePercent:10,safetyPercent:Number(DATA.stockPolicy?.safetyPercent)||10};
  let flash='';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const num=(value,digits=2)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(Number(value)||0);
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const selectedDate=()=>sessionStorage.getItem(DATE_KEY)||today();
  const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  function findProduct(item){
    const ids=[item.productId,item.product_id,item.variantId,item.variant_id].filter(Boolean).map(String);
    const name=norm(item.name||item.product_name);
    return DATA.products.find(product=>product.ids.some(id=>ids.includes(id))||product.names.some(candidate=>norm(candidate)===name)||norm(product.name)===name)||null;
  }
  function explode(product,amount,bag=new Map(),seen=new Set()){
    if(!product||seen.has(product.sku))return bag;
    const next=new Set(seen);next.add(product.sku);
    (product.bom||[]).forEach(line=>bag.set(line.materialId,(bag.get(line.materialId)||0)+(Number(line.qty)||0)*amount));
    (product.components||[]).forEach(component=>explode(DATA.products.find(item=>item.sku===component.sku),amount*(Number(component.qty)||0),bag,next));
    return bag;
  }
  function currentRequirements(){
    const date=selectedDate();
    const materials=new Map();
    read(KEYS.orders,[]).filter(order=>ACTIVE.has(String(order.status))&&(order.delivery?.requestedDate||order.requested_date)===date).forEach(order=>{
      (order.items||[]).forEach(item=>{const product=findProduct(item);if(product)explode(product,Number(item.quantity)||0,materials);});
    });
    return materials;
  }
  function latestPurchaseMap(){
    const map=new Map();
    read(KEYS.purchases,[]).slice().sort((a,b)=>String(b.receivedDate||b.createdAt).localeCompare(String(a.receivedDate||a.createdAt))).forEach(item=>{if(!map.has(item.materialId))map.set(item.materialId,item);});
    return map;
  }
  function purchaseRows(){
    const requirements=currentRequirements();
    const stock=read(KEYS.stock,{});
    const latest=latestPurchaseMap();
    return [...requirements.entries()].map(([materialId,required])=>{
      const material=DATA.materials.find(item=>item.id===materialId)||{id:materialId,name:materialId,unit:'unidad',cost:0,status:'PENDIENTE'};
      const known=stock[materialId]!==undefined&&stock[materialId]!==null&&stock[materialId]!=='';
      const available=known?Number(stock[materialId]):null;
      const gap=known?Math.max(0,required-available):null;
      const suggested=gap===null?null:gap>0?gap*(1+POLICY.safetyPercent/100):0;
      const observed=latest.get(materialId);
      const unitCost=observed?.unitCost??material.cost??0;
      const source=observed?'Última compra':'Costo provisional';
      return {material,required,available,gap,suggested,unitCost,source,status:!known?'count':gap>0?'buy':'covered'};
    }).sort((a,b)=>({buy:0,count:1,covered:2}[a.status]-{buy:0,count:1,covered:2}[b.status])||a.material.name.localeCompare(b.material.name,'es'));
  }
  function measurementMetrics(item){
    const expected=Number(item.expectedQty)||0,actual=Number(item.actualQty)||0,waste=Number(item.wasteQty)||0;
    const attainment=expected>0?(actual/expected)*100:0;
    const wasteRate=(actual+waste)>0?(waste/(actual+waste))*100:0;
    const alert=attainment<(100-POLICY.yieldTolerancePercent)||wasteRate>POLICY.wasteAlertPercent;
    return {attainment,wasteRate,alert};
  }
  function measuredCostAlerts(){
    const latest=latestPurchaseMap();
    return DATA.materials.map(material=>{
      const purchase=latest.get(material.id);if(!purchase||!(material.cost>0))return null;
      const variance=((purchase.unitCost-material.cost)/material.cost)*100;
      return {material,purchase,variance,alert:Math.abs(variance)>POLICY.costVariancePercent};
    }).filter(Boolean);
  }

  function suggestionsTable(rows){
    const actionable=rows.filter(row=>row.status!=='covered');
    if(!actionable.length)return '<div class="ee-v24-empty">No hay compras sugeridas ni conteos pendientes para la fecha seleccionada.</div>';
    return `<div class="ee-v24-table-wrap"><table class="ee-v24-table"><thead><tr><th>Material</th><th>Necesidad</th><th>Existencia</th><th>Acción sugerida</th><th>Costo de referencia</th></tr></thead><tbody>${actionable.map(row=>`<tr data-v24-suggestion="${esc(row.material.id)}"><td><strong>${esc(row.material.name)}</strong><small>${esc(row.material.unit)}</small></td><td>${num(row.required)} ${esc(row.material.unit)}</td><td>${row.available===null?'Sin conteo':`${num(row.available)} ${esc(row.material.unit)}`}</td><td><span class="ee-v24-state" data-state="${row.status}">${row.status==='buy'?`Comprar ${num(row.suggested)} ${esc(row.material.unit)}`:'Contar antes de comprar'}</span></td><td>${row.status==='buy'?`${money(row.suggested*row.unitCost)}<small>${esc(row.source)}</small>`:'—'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function measurementAlertsTable(items){
    const rows=items.map(item=>({item,metric:measurementMetrics(item)})).filter(row=>row.metric.alert).slice(0,8);
    if(!rows.length)return '<div class="ee-v24-empty">No hay desviaciones de rendimiento registradas.</div>';
    return `<div class="ee-v24-table-wrap"><table class="ee-v24-table"><thead><tr><th>Lote</th><th>Referencia</th><th>Cumplimiento</th><th>Merma</th><th>Decisión</th></tr></thead><tbody>${rows.map(({item,metric})=>`<tr data-v24-batch="${esc(item.id)}"><td><strong>${esc(item.batchCode||item.id)}</strong><small>${esc(item.productionDate)}</small></td><td>${esc(item.referenceName)}</td><td>${num(metric.attainment,1)} %</td><td>${num(metric.wasteRate,1)} %</td><td><span class="ee-v24-state" data-state="review">Revisar lote</span></td></tr>`).join('')}</tbody></table></div>`;
  }
  function purchaseForm(){
    const options=DATA.materials.map(material=>`<option value="${esc(material.id)}">${esc(material.name)} · ${esc(material.unit)}</option>`).join('');
    const suppliers=[...new Set(read(KEYS.purchases,[]).map(item=>item.supplier).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    return `<details class="ee-v24-details"><summary>Registrar compra y proveedor</summary><form class="ee-v24-form" id="ee-v24-purchase-form"><div class="ee-v24-form-grid"><label><span>Material</span><select name="materialId" required>${options}</select></label><label><span>Proveedor</span><input name="supplier" list="ee-v24-suppliers" required placeholder="Nombre real del proveedor"><datalist id="ee-v24-suppliers">${suppliers.map(name=>`<option value="${esc(name)}"></option>`).join('')}</datalist></label><label><span>Fecha de recepción</span><input type="date" name="receivedDate" value="${today()}" required></label><label><span>Factura o referencia</span><input name="invoiceReference" placeholder="Opcional"></label><label><span>Cantidad recibida</span><input type="number" min="0.0001" step="0.0001" name="quantity" required></label><label><span>Costo total pagado</span><input type="number" min="0" step="1" name="totalCost" required></label></div><label class="ee-v24-check"><input type="checkbox" name="updateStock"><span>Sumar esta compra al inventario. Solo funciona cuando ya existe un conteo físico del material.</span></label><label><span>Nota</span><textarea name="note" rows="2" placeholder="Presentación, condición o aclaración"></textarea></label><button class="ee-v24-button" type="submit">Guardar compra</button></form></details>`;
  }
  function measurementForm(){
    const recipe=DATA.recipes[0];
    const options=[`<option value="recipe:${esc(recipe.id)}" data-unit="g" data-expected="${recipe.yieldGrams}">${esc(recipe.name)}</option>`,...DATA.products.map(product=>`<option value="product:${esc(product.sku)}" data-unit="unidad" data-expected="${Math.max(1,product.physicalUnits||1)}">${esc(product.name)}</option>`)].join('');
    return `<details class="ee-v24-details"><summary>Registrar lote, rendimiento y merma</summary><form class="ee-v24-form" id="ee-v24-measurement-form"><p class="ee-v24-note">El registro documenta lo ocurrido. No modifica automáticamente la receta, la BOM ni el costo estándar.</p><div class="ee-v24-form-grid"><label><span>Referencia medida</span><select name="reference" id="ee-v24-reference" required>${options}</select></label><label><span>Código de lote</span><input name="batchCode" required placeholder="Ej. MASA-2026-08-06-01"></label><label><span>Fecha de producción</span><input type="date" name="productionDate" value="${today()}" required></label><label><span>Cantidad planeada</span><input type="number" min="0.0001" step="0.0001" name="expectedQty" value="${recipe.yieldGrams}" required></label><label><span>Cantidad utilizable</span><input type="number" min="0" step="0.0001" name="actualQty" required></label><label><span>Merma registrada</span><input type="number" min="0" step="0.0001" name="wasteQty" value="0" required></label></div><p class="ee-v24-unit">Unidad de medición: <strong id="ee-v24-unit">g</strong></p><label><span>Observación</span><textarea name="note" rows="2" placeholder="Temperatura, fermentación, error, ajuste o evento relevante"></textarea></label><button class="ee-v24-button" type="submit">Guardar medición</button></form></details>`;
  }
  function historyDetails(measurements,purchases,costAlerts){
    const recentMeasurements=measurements.slice(0,10);
    const recentPurchases=purchases.slice(0,10);
    return `<details class="ee-v24-details"><summary>Historial de mediciones, proveedores y costos</summary><div class="ee-v24-history"><h4>Últimos lotes</h4>${recentMeasurements.length?`<div class="ee-v24-table-wrap"><table class="ee-v24-table"><thead><tr><th>Fecha</th><th>Lote</th><th>Referencia</th><th>Planeado</th><th>Utilizable</th><th>Merma</th></tr></thead><tbody>${recentMeasurements.map(item=>`<tr><td>${esc(item.productionDate)}</td><td>${esc(item.batchCode)}</td><td>${esc(item.referenceName)}</td><td>${num(item.expectedQty)} ${esc(item.unit)}</td><td>${num(item.actualQty)} ${esc(item.unit)}</td><td>${num(item.wasteQty)} ${esc(item.unit)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="ee-v24-empty">Aún no hay lotes medidos.</div>'}<h4>Últimas compras</h4>${recentPurchases.length?`<div class="ee-v24-table-wrap"><table class="ee-v24-table"><thead><tr><th>Fecha</th><th>Material</th><th>Proveedor</th><th>Cantidad</th><th>Costo unitario</th><th>Factura</th></tr></thead><tbody>${recentPurchases.map(item=>{const material=DATA.materials.find(m=>m.id===item.materialId);return `<tr><td>${esc(item.receivedDate)}</td><td>${esc(material?.name||item.materialId)}</td><td>${esc(item.supplier)}</td><td>${num(item.quantity)} ${esc(material?.unit||'')}</td><td>${money(item.unitCost)}</td><td>${esc(item.invoiceReference||'—')}</td></tr>`;}).join('')}</tbody></table></div>`:'<div class="ee-v24-empty">Aún no hay compras registradas.</div>'}<h4>Variaciones frente al costo provisional</h4>${costAlerts.filter(item=>item.alert).length?`<ul class="ee-v24-variance">${costAlerts.filter(item=>item.alert).map(item=>`<li><strong>${esc(item.material.name)}</strong><span>${item.variance>0?'+':''}${num(item.variance,1)} % · observado ${money(item.purchase.unitCost)} por ${esc(item.material.unit)}</span></li>`).join('')}</ul>`:'<div class="ee-v24-empty">No hay variaciones superiores al ${POLICY.costVariancePercent} %.</div>'}</div></details>`;
  }

  function bind(target){
    const reference=target.querySelector('#ee-v24-reference');
    reference?.addEventListener('change',()=>{const option=reference.selectedOptions[0];target.querySelector('#ee-v24-unit').textContent=option.dataset.unit||'unidad';target.querySelector('[name="expectedQty"]').value=option.dataset.expected||1;});
    target.querySelector('#ee-v24-measurement-form')?.addEventListener('submit',event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);const option=reference.selectedOptions[0];const [kind,id]=String(fd.get('reference')).split(':');
      const referenceName=kind==='recipe'?DATA.recipes.find(item=>item.id===id)?.name:DATA.products.find(item=>item.sku===id)?.name;
      const item={id:uid('MED'),kind,referenceId:id,referenceName:referenceName||id,batchCode:String(fd.get('batchCode')).trim(),productionDate:String(fd.get('productionDate')),expectedQty:Number(fd.get('expectedQty')),actualQty:Number(fd.get('actualQty')),wasteQty:Number(fd.get('wasteQty')),unit:option.dataset.unit||'unidad',note:String(fd.get('note')||'').trim(),createdAt:new Date().toISOString(),dataStatus:'MEDIDO'};
      const rows=read(KEYS.measurements,[]);rows.unshift(item);write(KEYS.measurements,rows);flash='Medición guardada. La receta y el costo estándar permanecen sin cambios.';render();
    });
    target.querySelector('#ee-v24-purchase-form')?.addEventListener('submit',event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);const materialId=String(fd.get('materialId'));const quantity=Number(fd.get('quantity'));const totalCost=Number(fd.get('totalCost'));
      const purchase={id:uid('COM'),materialId,supplier:String(fd.get('supplier')).trim(),invoiceReference:String(fd.get('invoiceReference')||'').trim(),receivedDate:String(fd.get('receivedDate')),quantity,totalCost,unitCost:quantity>0?totalCost/quantity:0,note:String(fd.get('note')||'').trim(),createdAt:new Date().toISOString(),dataStatus:'OBSERVADO'};
      const rows=read(KEYS.purchases,[]);rows.unshift(purchase);write(KEYS.purchases,rows);
      if(fd.get('updateStock')){const stock=read(KEYS.stock,{});if(stock[materialId]===undefined||stock[materialId]===null||stock[materialId]===''){flash='Compra guardada. El inventario no cambió porque este material aún no tiene conteo físico.';}else{stock[materialId]=Number(stock[materialId])+quantity;write(KEYS.stock,stock);flash='Compra guardada e inventario actualizado desde el conteo existente.';window.dispatchEvent(new CustomEvent('ee:admin:ready',{detail:{mode:'local'}}));}}else flash='Compra guardada. El inventario no fue modificado.';
      render();
    });
  }
  function render(){
    const target=document.querySelector('#measurement-v24');if(!target)return;
    const suggestions=purchaseRows();
    const measurements=read(KEYS.measurements,[]).slice().sort((a,b)=>String(b.productionDate||b.createdAt).localeCompare(String(a.productionDate||a.createdAt)));
    const purchases=read(KEYS.purchases,[]).slice().sort((a,b)=>String(b.receivedDate||b.createdAt).localeCompare(String(a.receivedDate||a.createdAt)));
    const costAlerts=measuredCostAlerts();
    const buyCount=suggestions.filter(row=>row.status==='buy').length;
    const countPending=suggestions.filter(row=>row.status==='count').length;
    const yieldAlerts=measurements.filter(item=>measurementMetrics(item).alert).length;
    const costAlertCount=costAlerts.filter(item=>item.alert).length;
    target.innerHTML=`<section class="ee-v24-shell"><div class="ee-v24-heading"><div><p class="eyebrow">Medición real y compras · V2.4</p><h2>Medir primero. Ajustar después.</h2><p>El panel separa observaciones reales de supuestos provisionales y convierte faltantes confirmados en decisiones de compra.</p></div><span class="ee-v24-mode">Registro local controlado</span></div>${flash?`<div class="ee-v24-flash">${esc(flash)}</div>`:''}<div class="ee-v24-notice"><strong>Regla de gobierno</strong><span>Una factura crea un costo observado y un lote crea un rendimiento medido. Ninguno reemplaza automáticamente la receta, la BOM o el costo estándar.</span></div><div class="ee-v24-metrics"><article><small>Compras sugeridas</small><strong>${buyCount}</strong></article><article><small>Conteos pendientes</small><strong>${countPending}</strong></article><article><small>Lotes por revisar</small><strong>${yieldAlerts}</strong></article><article><small>Variaciones de costo</small><strong>${costAlertCount}</strong></article></div><div class="ee-v24-grid"><section class="ee-v24-panel"><div class="ee-v24-panel-head"><div><p class="eyebrow">Comprar o contar</p><h3>Decisiones para ${esc(selectedDate())}</h3></div><span>Seguridad provisional ${POLICY.safetyPercent} %</span></div>${suggestionsTable(suggestions)}</section><section class="ee-v24-panel"><div class="ee-v24-panel-head"><div><p class="eyebrow">Rendimiento</p><h3>Desviaciones que requieren revisión</h3></div><span>Tolerancia ±${POLICY.yieldTolerancePercent} %</span></div>${measurementAlertsTable(measurements)}</section></div>${purchaseForm()}${measurementForm()}${historyDetails(measurements,purchases,costAlerts)}</section>`;
    flash='';bind(target);document.documentElement.dataset.measurementVersion='2.4.0';
  }
  window.addEventListener('ee:admin:ready',render);
  window.addEventListener('ee:v22:reload',render);
  window.addEventListener('storage',event=>{if(Object.values(KEYS).includes(event.key))render();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(render,80),{once:true});else setTimeout(render,80);
})();
