(()=>{
'use strict';
const VERSION='3.3.0';
const target=document.querySelector('#operational-evidence-v330');
if(!target)return;
const KEY='ee_v330_operational_evidence';
const DATE_KEY='ee_v22_selected_date';
const KEYS={orders:'ee_v14_orders',fulfillment:'ee_v22_fulfillment',stock:'ee_v23_material_stock',measurements:'ee_v24_production_measurements',purchases:'ee_v24_material_purchases',purchaseOrders:'ee_v25_purchase_orders'};
const TYPES={
  production_lot:{label:'Lote / producción',short:'Producción'},
  inventory_count:{label:'Conteo físico de inventario',short:'Inventario'},
  purchase_receipt:{label:'Recepción / soporte de compra',short:'Recepción'},
  time_incident:{label:'Tiempo / novedad operativa',short:'Tiempo'},
  adjustment:{label:'Ajuste / corrección operativa',short:'Ajuste'},
  other:{label:'Otra evidencia',short:'Otra'}
};
const STATUSES=new Set(['OBSERVADO','CONFIRMADO']);
const ACTIVE_PRODUCTION=new Set(['approved','preparing']);
let flash='';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const num=(value,digits=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(Number(value)||0);
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const selectedDate=()=>sessionStorage.getItem(DATE_KEY)||today();
const uid=()=>`EVI-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const dateOnly=value=>String(value||'').slice(0,10);
const isFuture=date=>date>today();
const sessionUser=()=>{try{const s=JSON.parse(sessionStorage.getItem('ee_v31_session'));return s?.displayName||s?.username||'Usuario local';}catch(_){return 'Usuario local';}};
function allEvidence(){return read(KEY,[]).filter(row=>row&&row.id&&row.date&&TYPES[row.kind]);}
function supersededIds(rows=allEvidence()){return new Set(rows.map(row=>row.supersedes).filter(Boolean));}
function activeEvidence(date=null){const rows=allEvidence(),superseded=supersededIds(rows);return rows.filter(row=>!superseded.has(row.id)&&(!date||row.date===date));}
function validate(payload){
  const date=String(payload.date||'').trim();
  const kind=String(payload.kind||'').trim();
  const reference=String(payload.reference||'').trim();
  const supportRef=String(payload.supportRef||'').trim();
  const status=String(payload.status||'OBSERVADO').trim().toUpperCase();
  const durationRaw=payload.durationMinutes;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('La fecha de evidencia no es válida.');
  if(!TYPES[kind])throw new Error('Selecciona un tipo de evidencia válido.');
  if(!reference)throw new Error('La referencia es obligatoria.');
  if(!STATUSES.has(status))throw new Error('El estado de evidencia no es válido.');
  if(status==='CONFIRMADO'&&['purchase_receipt','adjustment'].includes(kind)&&!supportRef)throw new Error('Una recepción o ajuste confirmado exige una referencia de soporte.');
  let durationMinutes=null;
  if(durationRaw!==''&&durationRaw!==null&&durationRaw!==undefined){durationMinutes=Number(durationRaw);if(!Number.isFinite(durationMinutes)||durationMinutes<0)throw new Error('La duración debe ser un valor válido mayor o igual a cero.');}
  const supersedes=payload.supersedes?String(payload.supersedes):null;
  if(supersedes){
    const rows=allEvidence();
    const prior=rows.find(row=>row.id===supersedes);
    if(!prior)throw new Error('No se encontró la evidencia que intentas corregir.');
    if(supersededIds(rows).has(supersedes))throw new Error('Esa evidencia ya tiene una corrección posterior.');
  }
  return {date,kind,reference,supportRef,status,durationMinutes,supersedes,note:String(payload.note||'').trim()};
}
function recordEvidence(payload){
  const clean=validate(payload);
  const row={id:uid(),...clean,createdAt:new Date().toISOString(),createdBy:sessionUser(),dataStatus:clean.status};
  const rows=allEvidence();rows.unshift(row);write(KEY,rows);
  window.dispatchEvent(new CustomEvent('ee:v330:evidence',{detail:{id:row.id,date:row.date,kind:row.kind}}));
  return row;
}
function sourceFacts(date=selectedDate()){
  const orders=read(KEYS.orders,[]).filter(order=>String(order.delivery?.requestedDate||order.requested_date||'')===date);
  const productionOrders=orders.filter(order=>ACTIVE_PRODUCTION.has(String(order.status)));
  const measurements=read(KEYS.measurements,[]).filter(row=>String(row.productionDate||'')===date);
  const purchases=read(KEYS.purchases,[]).filter(row=>String(row.receivedDate||row.received_date||'')===date);
  const purchaseOrders=read(KEYS.purchaseOrders,[]).filter(row=>['received','partial'].includes(String(row.status))&&dateOnly(row.updatedAt||row.updated_at)===date);
  const stock=read(KEYS.stock,{});
  const knownStock=Object.values(stock).filter(value=>value!==null&&value!==undefined&&value!=='').length;
  return {orders,productionOrders,measurements,purchases,purchaseOrders,knownStock};
}
function readiness(date=selectedDate()){
  if(isFuture(date))return [
    {id:'production',label:'Producción y lote',state:'na',detail:'Periodo futuro: aún no se exige evidencia.'},
    {id:'yield',label:'Rendimiento y merma',state:'na',detail:'Periodo futuro: sin hechos que evaluar.'},
    {id:'inventory',label:'Conteo físico',state:'na',detail:'Periodo futuro: sin conteo exigible.'},
    {id:'receipt',label:'Recepción y soporte',state:'na',detail:'Periodo futuro: sin recepción que evaluar.'},
    {id:'time',label:'Tiempo / novedad',state:'na',detail:'Periodo futuro: sin jornada que cerrar.'}
  ];
  const facts=sourceFacts(date),evidence=activeEvidence(date);
  const has=(kind,predicate=()=>true)=>evidence.some(row=>row.kind===kind&&predicate(row));
  const productionApplicable=facts.productionOrders.length>0||facts.measurements.length>0;
  const productionReady=facts.measurements.length>0||has('production_lot');
  const yieldReady=facts.measurements.length>0;
  const inventoryApplicable=facts.productionOrders.length>0||facts.knownStock>0||has('inventory_count');
  const inventoryReady=has('inventory_count');
  const receiptApplicable=facts.purchases.length>0||facts.purchaseOrders.length>0||has('purchase_receipt');
  const receiptsSupported=facts.purchases.length>0&&facts.purchases.every(row=>String(row.invoiceReference||row.invoice_reference||'').trim());
  const receiptReady=receiptsSupported||has('purchase_receipt',row=>Boolean(row.supportRef));
  const timeApplicable=facts.productionOrders.length>0||has('time_incident');
  const timeReady=has('time_incident',row=>Number(row.durationMinutes)>0||Boolean(row.note));
  return [
    {id:'production',label:'Producción y lote',state:!productionApplicable?'na':productionReady?'ready':'attention',detail:!productionApplicable?'Sin producción aplicable.':productionReady?`${facts.measurements.length} medición(es) o evidencia de lote.`:`${facts.productionOrders.length} pedido(s) productivo(s) sin evidencia de lote.`},
    {id:'yield',label:'Rendimiento y merma',state:!productionApplicable?'na':yieldReady?'ready':'attention',detail:!productionApplicable?'Sin producción aplicable.':yieldReady?`${facts.measurements.length} medición(es) con utilizable y merma.`:'Hay producción, pero no existe medición de rendimiento/merma.'},
    {id:'inventory',label:'Conteo físico',state:!inventoryApplicable?'na':inventoryReady?'ready':'attention',detail:!inventoryApplicable?'Sin inventario aplicable.':inventoryReady?'Existe evidencia fechada de conteo físico.':facts.knownStock?`${facts.knownStock} existencia(s) disponibles, pero sin evidencia fechada de conteo.`:'La jornada requiere inventario, pero no hay evidencia de conteo.'},
    {id:'receipt',label:'Recepción y soporte',state:!receiptApplicable?'na':receiptReady?'ready':'attention',detail:!receiptApplicable?'Sin recepciones aplicables.':receiptReady?'Recepción respaldada por factura/referencia o evidencia adicional.':'Hay recepción observada sin referencia de soporte suficiente.'},
    {id:'time',label:'Tiempo / novedad',state:!timeApplicable?'na':timeReady?'ready':'attention',detail:!timeApplicable?'Sin jornada productiva aplicable.':timeReady?'Existe tiempo o novedad operativa documentada.':'Hay producción del día, pero no se documentó tiempo ni novedad.'}
  ];
}
function summary(rows){
  const applicable=rows.filter(row=>row.state!=='na');
  const ready=applicable.filter(row=>row.state==='ready').length;
  const pending=applicable.filter(row=>row.state==='attention').length;
  return {applicable:applicable.length,ready,pending,complete:applicable.length>0&&pending===0};
}
function statusLabel(state){return state==='ready'?'Listo':state==='attention'?'Atención':'No aplica';}
function cardsHtml(date){
  const rows=readiness(date),sum=summary(rows);
  return `<div class="v330-summary"><div><small>Cierre de evidencia · ${esc(date)}</small><strong>${sum.applicable?`${sum.ready}/${sum.applicable}`:'Sin controles aplicables'}</strong><span>${sum.pending?`${sum.pending} control(es) requieren evidencia.`:sum.applicable?'La evidencia mínima aplicable está cubierta.':'No hay hechos operativos que cerrar para esta fecha.'}</span></div><span class="v330-summary-state" data-state="${sum.pending?'attention':sum.applicable?'ready':'na'}">${sum.pending?'Cierre incompleto':sum.applicable?'Cierre cubierto':'Sin actividad'}</span></div><div class="v330-readiness">${rows.map(row=>`<article data-v330-readiness="${row.id}" data-state="${row.state}"><div><small>${esc(row.label)}</small><strong>${statusLabel(row.state)}</strong></div><p>${esc(row.detail)}</p></article>`).join('')}</div>`;
}
function factsHtml(date){
  const facts=sourceFacts(date);
  const waste=facts.measurements.reduce((sum,row)=>sum+(Number(row.wasteQty)||0),0);
  const durations=activeEvidence(date).filter(row=>row.kind==='time_incident').reduce((sum,row)=>sum+(Number(row.durationMinutes)||0),0);
  return `<div class="v330-facts"><article><small>Pedidos del día</small><strong>${facts.orders.length}</strong></article><article><small>Lotes medidos</small><strong>${facts.measurements.length}</strong><span>${waste>0?`${num(waste,2)} de merma registrada`:'Sin merma cuantificada'}</span></article><article><small>Recepciones</small><strong>${facts.purchases.length}</strong><span>${facts.purchases.filter(row=>String(row.invoiceReference||'').trim()).length} con referencia</span></article><article><small>Tiempo documentado</small><strong>${durations?`${num(durations,0)} min`:'—'}</strong></article></div>`;
}
function formHtml(date){
  const options=Object.entries(TYPES).map(([value,item])=>`<option value="${value}">${esc(item.label)}</option>`).join('');
  return `<details class="v330-details" id="v330-form-details"><summary>Registrar evidencia o novedad</summary><form id="v330-form" class="v330-form"><input type="hidden" name="supersedes"><div class="v330-form-grid"><label><span>Fecha</span><input type="date" name="date" value="${esc(date)}" required></label><label><span>Tipo</span><select name="kind" required>${options}</select></label><label><span>Estado</span><select name="status"><option value="OBSERVADO">Observado</option><option value="CONFIRMADO">Confirmado</option></select></label><label><span>Referencia</span><input name="reference" required maxlength="120" placeholder="Lote, orden, material o evento"></label><label><span>Referencia de soporte</span><input name="supportRef" maxlength="160" placeholder="Factura, remisión, foto, acta o URL externa"></label><label><span>Duración (minutos)</span><input type="number" name="durationMinutes" min="0" step="1" placeholder="Opcional"></label></div><label><span>Nota</span><textarea name="note" rows="3" maxlength="500" placeholder="Qué ocurrió, qué se verificó o por qué se corrige"></textarea></label><div class="v330-form-actions"><button type="submit" class="v31-btn">Guardar evidencia</button><button type="button" class="v31-btn secondary" data-v330-cancel hidden>Cancelar corrección</button></div><p class="v330-rule">Una corrección crea un registro nuevo y conserva el anterior. No modifica pedidos, inventario, recetas, compras ni Finanzas.</p></form></details>`;
}
function historyHtml(date){
  const rows=allEvidence().filter(row=>row.date===date).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  if(!rows.length)return '<div class="v330-empty">Aún no hay evidencia adicional registrada para esta fecha. Los hechos de Producción, Medición y Compras siguen visibles arriba.</div>';
  const superseded=supersededIds(rows);
  return `<div class="v330-table-wrap"><table class="v330-table"><thead><tr><th>Hora / estado</th><th>Tipo y referencia</th><th>Soporte</th><th>Detalle</th><th></th></tr></thead><tbody>${rows.map(row=>`<tr data-v330-evidence="${esc(row.id)}" class="${superseded.has(row.id)?'is-superseded':''}"><td><strong>${esc(row.status)}</strong><small>${esc(new Date(row.createdAt).toLocaleString('es-CO',{timeZone:'America/Bogota',hour:'2-digit',minute:'2-digit'}))} · ${esc(row.createdBy||'Usuario local')}</small>${superseded.has(row.id)?'<span class="v330-old">Reemplazado por corrección</span>':''}</td><td><strong>${esc(TYPES[row.kind]?.short||row.kind)}</strong><small>${esc(row.reference)}</small>${row.supersedes?`<span>Corrige ${esc(row.supersedes)}</span>`:''}</td><td>${esc(row.supportRef||'—')}</td><td>${row.durationMinutes!==null&&row.durationMinutes!==undefined?`<strong>${num(row.durationMinutes,0)} min</strong>`:''}<small>${esc(row.note||'Sin nota adicional')}</small></td><td>${superseded.has(row.id)?'':`<button type="button" class="v330-correct" data-v330-correct="${esc(row.id)}">Corregir</button>`}</td></tr>`).join('')}</tbody></table></div>`;
}
function render(){
  const date=selectedDate();
  target.innerHTML=`<section class="v330-shell"><div class="v330-head"><div><p class="eyebrow">Evidencia y cierre · V3.3.0</p><h3>Hechos trazables antes de interpretar el día.</h3><p>Conecta producción, mediciones, inventario y recepciones. La bitácora adicional documenta soportes, tiempos, novedades y correcciones sin reescribir los motores existentes.</p></div><label class="v330-date"><span>Fecha de trabajo</span><input type="date" id="v330-date" value="${esc(date)}"></label></div><div id="v330-message" class="v330-message" aria-live="polite">${esc(flash)}</div>${cardsHtml(date)}${factsHtml(date)}${formHtml(date)}<section class="v330-history"><div class="v330-history-head"><div><p class="eyebrow">Trazabilidad</p><h4>Evidencia adicional del día</h4></div><span>Append-only · las correcciones no borran historia</span></div>${historyHtml(date)}</section></section>`;
  bind();flash='';document.documentElement.dataset.operationalEvidenceVersion=VERSION;
}
function cancelCorrection(){
  const form=target.querySelector('#v330-form');if(!form)return;
  form.reset();form.elements.date.value=selectedDate();form.elements.supersedes.value='';
  target.querySelector('[data-v330-cancel]').hidden=true;
  target.querySelector('#v330-form-details').open=false;
}
function startCorrection(id){
  const prior=allEvidence().find(row=>row.id===id);if(!prior)return;
  const form=target.querySelector('#v330-form');if(!form)return;
  target.querySelector('#v330-form-details').open=true;
  form.elements.supersedes.value=prior.id;form.elements.date.value=prior.date;form.elements.kind.value=prior.kind;form.elements.status.value=prior.status;form.elements.reference.value=prior.reference;form.elements.supportRef.value=prior.supportRef||'';form.elements.durationMinutes.value=prior.durationMinutes??'';form.elements.note.value=prior.note?`Corrección de ${prior.id}: ${prior.note}`:`Corrección de ${prior.id}`;
  target.querySelector('[data-v330-cancel]').hidden=false;form.elements.reference.focus();
}
function bind(){
  target.querySelector('#v330-date')?.addEventListener('change',event=>{const value=event.currentTarget.value||today();sessionStorage.setItem(DATE_KEY,value);render();window.dispatchEvent(new CustomEvent('ee:v21:reload'));window.dispatchEvent(new CustomEvent('ee:v22:reload'));});
  target.querySelector('#v330-form')?.addEventListener('submit',event=>{
    event.preventDefault();const fd=new FormData(event.currentTarget);
    try{const row=recordEvidence(Object.fromEntries(fd.entries()));flash=`Evidencia ${row.id} guardada sin alterar los hechos de origen.`;render();}
    catch(error){flash=error.message||'No fue posible guardar la evidencia.';render();target.querySelector('#v330-form-details').open=true;}
  });
  target.querySelectorAll('[data-v330-correct]').forEach(button=>button.addEventListener('click',()=>startCorrection(button.dataset.v330Correct)));
  target.querySelector('[data-v330-cancel]')?.addEventListener('click',cancelCorrection);
}
window.EL_ERRANTE_OPERATION_V330={version:VERSION,key:KEY,allEvidence,activeEvidence,recordEvidence,sourceFacts,readiness,summary,selectedDate};
window.addEventListener('ee:v22:reload',()=>requestAnimationFrame(()=>{if(target.isConnected&&selectedDate()!==target.querySelector('#v330-date')?.value)render();}));
window.addEventListener('ee:v24:reload',render);
window.addEventListener('ee:v25:reload',render);
render();
})();