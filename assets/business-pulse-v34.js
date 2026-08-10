(()=>{
'use strict';

const VERSION='3.4.0';
const DAYS=7;
const DATA=window.EL_ERRANTE_MATERIALS_V23||{products:[],materials:[]};
const KEYS={
  orders:'ee_v14_orders',
  stock:'ee_v23_material_stock',
  fulfillment:'ee_v22_fulfillment',
  purchaseOrders:'ee_v25_purchase_orders'
};
const DATE_KEY='ee_v22_selected_date';
const ACTIVE=new Set(['approved','preparing','dispatched']);
const PRODUCTION=new Set(['approved','preparing']);
const ISSUED_PURCHASES=new Set(['ordered','partial']);
const OPEN_PURCHASES=new Set(['draft','approved','ordered','partial']);
const CHECKS=['productReady','packagingReady','quantityChecked','deliveryCoordinated'];

const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
const n=value=>{const x=Number(value);return Number.isFinite(x)?x:0;};
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n(value));
const integer=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(n(value));
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const selectedDate=()=>sessionStorage.getItem(DATE_KEY)||today();
const addDays=(date,days)=>{const value=new Date(`${date}T12:00:00-05:00`);value.setDate(value.getDate()+days);return value.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});};
const dateLabel=date=>new Date(`${date}T12:00:00-05:00`).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'}).replace('.','');
const orderDate=order=>String(order.delivery?.requestedDate||order.requested_date||'').slice(0,10);
const orderValue=order=>{const explicit=n(order.total);if(explicit>0)return explicit;return (order.items||[]).reduce((sum,item)=>sum+n(item.lineTotal??item.line_total??(n(item.quantity)*n(item.unitPrice??item.unit_price))),0);};
const itemQty=item=>n(item.quantity);
const itemName=item=>item.name||item.product_name||'Producto';

function findProduct(item){
  const ids=[item.productId,item.product_id,item.variantId,item.variant_id].filter(Boolean).map(String);
  const name=norm(itemName(item));
  return (DATA.products||[]).find(product=>
    (Array.isArray(product.ids)?product.ids:[]).some(id=>ids.includes(String(id)))||
    (Array.isArray(product.names)?product.names:[]).some(candidate=>norm(candidate)===name)||
    norm(product.name)===name||String(product.sku||'')===String(item.productId||item.product_id||'')
  )||null;
}

function explode(product,amount,bag=new Map(),seen=new Set()){
  if(!product||seen.has(product.sku))return bag;
  const next=new Set(seen);next.add(product.sku);
  (product.bom||[]).forEach(line=>bag.set(line.materialId,(bag.get(line.materialId)||0)+n(line.qty)*amount));
  (product.components||[]).forEach(component=>explode((DATA.products||[]).find(item=>item.sku===component.sku),amount*n(component.qty),bag,next));
  return bag;
}

function normalizePurchase(row){
  return {
    id:String(row.id||''),
    materialId:String(row.materialId||row.material_id||''),
    status:String(row.status||''),
    requestedQty:n(row.requestedQty??row.requested_quantity),
    receivedQty:n(row.receivedQty??row.received_quantity),
    unitCost:n(row.unitCost??row.unit_cost_snapshot),
    expectedDate:String(row.expectedDate||row.expected_date||'').slice(0,10)
  };
}

function requirementsFor(orders){
  const bag=new Map();let unmatched=0;
  orders.filter(order=>PRODUCTION.has(String(order.status))).forEach(order=>{
    (order.items||[]).forEach(item=>{
      const product=findProduct(item);
      if(product)explode(product,itemQty(item),bag);
      else unmatched+=itemQty(item);
    });
  });
  return {bag,unmatched};
}

function compute(start=selectedDate()){
  const dates=Array.from({length:DAYS},(_,index)=>addDays(start,index));
  const end=dates.at(-1);
  const orders=read(KEYS.orders,[]);
  const stock=read(KEYS.stock,{});
  const fulfillment=read(KEYS.fulfillment,{});
  const purchaseOrders=read(KEYS.purchaseOrders,[]).map(normalizePurchase);
  const active=orders.filter(order=>ACTIVE.has(String(order.status)));
  const horizon=active.filter(order=>dates.includes(orderDate(order)));
  const production=horizon.filter(order=>PRODUCTION.has(String(order.status)));
  const undated=active.filter(order=>!orderDate(order));
  const {bag,unmatched}=requirementsFor(horizon);

  const inbound=new Map();
  purchaseOrders.filter(order=>ISSUED_PURCHASES.has(order.status)&&order.expectedDate>=start&&order.expectedDate<=end).forEach(order=>{
    const outstanding=Math.max(0,order.requestedQty-order.receivedQty);
    inbound.set(order.materialId,(inbound.get(order.materialId)||0)+outstanding);
  });

  const materials=[...bag.entries()].map(([materialId,required])=>{
    const material=(DATA.materials||[]).find(item=>item.id===materialId)||{id:materialId,name:materialId,unit:'unidad'};
    const known=stock[materialId]!==undefined&&stock[materialId]!==null&&stock[materialId]!=='';
    const available=known?n(stock[materialId]):null;
    const incoming=n(inbound.get(materialId));
    const gap=known?Math.max(0,required-available-incoming):null;
    return {material,required,available,incoming,gap};
  });

  const days=dates.map(date=>{
    const rows=horizon.filter(order=>orderDate(order)===date);
    const prod=rows.filter(order=>PRODUCTION.has(String(order.status)));
    return {
      date,
      orders:rows.length,
      units:prod.flatMap(order=>order.items||[]).reduce((sum,item)=>sum+itemQty(item),0),
      value:rows.reduce((sum,order)=>sum+orderValue(order),0),
      ready:rows.filter(order=>String(order.status)==='preparing'&&CHECKS.every(key=>Boolean(fulfillment[order.id]?.[key]))).length
    };
  });

  const issued=purchaseOrders.filter(order=>ISSUED_PURCHASES.has(order.status));
  const open=purchaseOrders.filter(order=>OPEN_PURCHASES.has(order.status));
  const overdue=issued.filter(order=>order.expectedDate&&order.expectedDate<start&&Math.max(0,order.requestedQty-order.receivedQty)>0);
  const shortages=materials.filter(row=>row.gap!==null&&row.gap>0);
  const unknown=materials.filter(row=>row.available===null);
  const covered=materials.filter(row=>row.gap===0);
  const busiest=days.reduce((best,row)=>row.units>best.units?row:best,{date:start,orders:0,units:0,value:0,ready:0});
  const purchaseCommitment=issued.reduce((sum,row)=>sum+Math.max(0,row.requestedQty-row.receivedQty)*row.unitCost,0);

  return {
    start,end,days,horizon,production,undated,materials,shortages,unknown,covered,unmatched,openPurchases:open,issuedPurchases:issued,overduePurchases:overdue,busiest,
    committedValue:horizon.reduce((sum,order)=>sum+orderValue(order),0),
    productionUnits:production.flatMap(order=>order.items||[]).reduce((sum,item)=>sum+itemQty(item),0),
    purchaseCommitment
  };
}

function riskCount(state){return state.shortages.length+state.unknown.length+(state.unmatched>0?1:0)+state.overduePurchases.length+(state.undated.length?1:0);}

function horizonBars(state){
  const max=Math.max(1,...state.days.map(row=>row.units));
  return `<div class="v34-horizon-bars" role="img" aria-label="Carga de producción de los próximos siete días">${state.days.map(row=>`<div class="v34-day"><div class="v34-day-bar"><i style="height:${Math.max(row.units?8:0,row.units/max*100)}%"><span>${row.units?integer(row.units):''}</span></i></div><strong>${esc(dateLabel(row.date).split(' ')[0])}</strong><small>${esc(row.date.slice(8))}</small></div>`).join('')}</div>`;
}

function coverage(state){
  const total=Math.max(1,state.materials.length);
  return `<div class="v34-coverage" role="img" aria-label="Cobertura del horizonte: ${state.covered.length} materiales cubiertos, ${state.shortages.length} con faltante y ${state.unknown.length} sin conteo"><div class="v34-stack"><i class="covered" style="width:${state.covered.length/total*100}%"></i><i class="short" style="width:${state.shortages.length/total*100}%"></i><i class="unknown" style="width:${state.unknown.length/total*100}%"></i></div><div class="v34-legend"><span><i class="covered"></i>${state.covered.length} cubiertos</span><span><i class="short"></i>${state.shortages.length} faltantes</span><span><i class="unknown"></i>${state.unknown.length} sin conteo</span></div></div>`;
}

function action(state){
  if(state.shortages.length)return {tone:'critical',title:'Cubrir faltantes del horizonte',text:`${state.shortages.length} material(es) siguen insuficientes incluso considerando compras emitidas con llegada dentro de los próximos 7 días.`,href:'operacion.html#compras',cta:'Revisar abastecimiento'};
  if(state.unknown.length)return {tone:'warning',title:'Completar conteos físicos',text:`${state.unknown.length} material(es) requeridos no tienen conteo. La cobertura no puede darse por confirmada.`,href:'operacion.html#materiales',cta:'Abrir materiales'};
  if(state.unmatched)return {tone:'critical',title:'Resolver productos sin BOM',text:`${integer(state.unmatched)} unidad(es) comprometidas no pueden convertirse en requerimientos de materiales.`,href:'studio.html',cta:'Abrir datos maestros'};
  if(state.overduePurchases.length)return {tone:'warning',title:'Revisar compras vencidas',text:`${state.overduePurchases.length} orden(es) emitidas siguen pendientes después de su fecha esperada.`,href:'operacion.html#compras',cta:'Revisar órdenes'};
  if(state.undated.length)return {tone:'warning',title:'Asignar fechas a pedidos activos',text:`${state.undated.length} pedido(s) comprometidos quedan fuera del horizonte porque no tienen fecha operativa.`,href:'operacion.html#pedidos',cta:'Abrir pedidos'};
  return {tone:'ok',title:'Horizonte ejecutable',text:'Con la evidencia disponible no aparecen faltantes, conteos desconocidos ni compras vencidas para los próximos 7 días.',href:'operacion.html',cta:'Abrir Operación'};
}

function operationalHtml(state,surface){
  const next=action(state);
  const surfaceCopy=surface==='control'?'Anticipa carga y bloqueos sin convertir este panel en un módulo financiero.':'Ordena los próximos compromisos antes de entrar al detalle diario.';
  return `<section class="v34-pulse v34-operational" data-business-pulse-v34 data-surface="${esc(surface)}"><div class="v34-head"><div><p class="eyebrow">Horizonte operativo · V3.4</p><h2>Próximos 7 días, antes de que se vuelvan urgentes.</h2><p>${esc(surfaceCopy)} El cálculo usa pedidos comprometidos, BOM, conteos y compras emitidas; no inventa inventario ni proyecta ventas.</p></div><span>${esc(state.start)} → ${esc(state.end)}</span></div><div class="v34-metrics"><article><small>Pedidos programados</small><strong>${state.horizon.length}</strong><span>${state.days.filter(row=>row.orders>0).length} día(s) con carga</span></article><article><small>Unidades por producir</small><strong>${integer(state.productionUnits)}</strong><span>Solo aprobados y en preparación</span></article><article><small>Día más cargado</small><strong>${state.busiest.units?esc(dateLabel(state.busiest.date)):'—'}</strong><span>${state.busiest.units?`${integer(state.busiest.units)} unidades`:'Sin producción programada'}</span></article><article><small>Pedidos sin fecha</small><strong>${state.undated.length}</strong><span>Quedan fuera del horizonte</span></article></div><div class="v34-grid"><article class="v34-card"><header><div><small>Carga</small><h3>Unidades pendientes por día</h3></div><a href="operacion.html#produccion">Abrir producción →</a></header>${horizonBars(state)}</article><article class="v34-card"><header><div><small>Cobertura</small><h3>Materiales requeridos en el horizonte</h3></div><a href="operacion.html#materiales">Abrir materiales →</a></header>${coverage(state)}<p class="v34-note">Las compras solo reducen el faltante cuando están emitidas o parcialmente recibidas y su fecha esperada cae dentro del horizonte.</p></article></div><a class="v34-action ${next.tone}" href="${next.href}"><div><small>Siguiente atención</small><strong>${esc(next.title)}</strong><span>${esc(next.text)}</span></div><b>${esc(next.cta)} →</b></a></section>`;
}

function financeHtml(state){
  const issues=riskCount(state);
  const tone=issues?'warning':'ok';
  return `<section class="v34-pulse v34-finance" data-business-pulse-v34 data-surface="finance"><div class="v34-head"><div><p class="eyebrow">Finanzas V3.4 · puente operativo</p><h2>Lo comprometido en Operación, sin mezclarlo con el plan.</h2><p>Esta franja trae hechos operativos al contexto financiero. Ayuda a leer el modelo con la ejecución a la vista, pero no convierte pedidos futuros en ingreso, caja o COGS real.</p></div><a href="operacion.html">Abrir Operación →</a></div><div class="v34-finance-strip"><article><small>Valor bruto comprometido · 7 días</small><strong>${money(state.committedValue)}</strong><span>${state.horizon.length} pedido(s) activos con fecha</span></article><article><small>Unidades por producir</small><strong>${integer(state.productionUnits)}</strong><span>Aprobadas o en preparación</span></article><article><small>Compras emitidas pendientes</small><strong>${money(state.purchaseCommitment)}</strong><span>No incluye borradores ni aprobaciones sin emitir</span></article><article class="${tone}"><small>Señales operativas</small><strong>${issues}</strong><span>${issues?'Revisar antes de confiar en la lectura':'Sin bloqueos detectados'}</span></article></div><div class="v34-finance-note ${tone}"><strong>${issues?'La operación todavía condiciona algunas decisiones.':'La ejecución no muestra bloqueos estructurales inmediatos.'}</strong><span>El valor bruto comprometido es contexto comercial-operativo: <b>no es caja cobrada ni reconocimiento contable de ingreso</b>. El margen real continúa dependiendo de costos históricos y hechos cerrados.</span><a href="operacion.html#resumen">Ver horizonte operativo →</a></div></section>`;
}

let lastOperational='';
let lastFinance='';
function signature(state){return JSON.stringify([state.start,state.days.map(row=>[row.date,row.orders,row.units,row.value]),state.materials.map(row=>[row.material.id,row.required,row.available,row.incoming,row.gap]),state.undated.length,state.unmatched,state.purchaseCommitment,state.overduePurchases.map(row=>row.id)]);}
function render(){
  const state=compute();
  const sig=signature(state);
  const operational=document.getElementById('business-pulse-v34');
  if(operational&&sig!==lastOperational){operational.innerHTML=operationalHtml(state,operational.dataset.pulseSurface||document.body.dataset.page||'operation');lastOperational=sig;}
  const finance=document.getElementById('finance-operational-pulse-v34');
  if(finance&&sig!==lastFinance){finance.innerHTML=financeHtml(state);lastFinance=sig;}
  if(operational||finance)document.documentElement.dataset.businessPulseVersion=VERSION;
}

function schedule(){requestAnimationFrame(render);}
function observe(id){const node=document.getElementById(id);if(!node)return;new MutationObserver(schedule).observe(node,{childList:true,subtree:true});}
function start(){
  render();
  ['ee:v21:reload','ee:v22:reload','ee:v23:reload','ee:v24:reload','ee:v25:reload','ee:v24:stock-updated','ee:order:status-changed'].forEach(name=>window.addEventListener(name,schedule));
  window.addEventListener('storage',schedule);
  document.addEventListener('click',event=>{if(event.target.closest?.('#ee-refresh-admin'))setTimeout(render,180);});
  ['daily-ops-v21','production-v22','materials-v23','procurement-v25','finance-workbench-v31'].forEach(observe);
}

window.EL_ERRANTE_BUSINESS_PULSE_V34={version:VERSION,compute};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
