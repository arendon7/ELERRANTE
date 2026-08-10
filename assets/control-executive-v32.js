(()=>{
'use strict';
const VERSION='3.2.0';
const ROOT_ID='control-v30';
const DATA=window.EL_ERRANTE_MATERIALS_V23||{products:[],materials:[]};
const KEYS={orders:'ee_v14_orders',stock:'ee_v23_material_stock',fulfillment:'ee_v22_fulfillment',purchases:'ee_v25_purchase_orders'};
const ACTIVE=new Set(['approved','preparing','dispatched']);
const PRODUCE=new Set(['approved','preparing']);
const OPEN_PURCHASES=new Set(['draft','approved','ordered','partial']);
const CHECKS=['productReady','packagingReady','quantityChecked','deliveryCoordinated'];
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const num=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const selectedDate=()=>sessionStorage.getItem('ee_v22_selected_date')||today();
const itemQty=item=>num(item.quantity);
const itemName=item=>item.name||item.product_name||'Producto';
function orderDate(order){return String(order.delivery?.requestedDate||order.requested_date||'');}
function findProduct(item){
 const ids=[item.productId,item.product_id,item.variantId,item.variant_id].filter(Boolean).map(String);
 const name=norm(itemName(item));
 return DATA.products.find(product=>(product.ids||[]).some(id=>ids.includes(String(id)))||(product.names||[]).some(candidate=>norm(candidate)===name)||norm(product.name)===name)||null;
}
function explode(product,amount,bag=new Map(),seen=new Set()){
 if(!product||seen.has(product.sku))return bag;
 const next=new Set(seen);next.add(product.sku);
 (product.bom||[]).forEach(line=>bag.set(line.materialId,(bag.get(line.materialId)||0)+num(line.qty)*amount));
 (product.components||[]).forEach(component=>explode(DATA.products.find(item=>item.sku===component.sku),amount*num(component.qty),bag,next));
 return bag;
}
function compute(){
 const date=selectedDate();
 const orders=read(KEYS.orders,[]),stock=read(KEYS.stock,{}),fulfillment=read(KEYS.fulfillment,{}),purchaseOrders=read(KEYS.purchases,[]);
 const day=orders.filter(order=>ACTIVE.has(String(order.status))&&orderDate(order)===date);
 const toProduce=day.filter(order=>PRODUCE.has(String(order.status)));
 const status={approved:0,preparing:0,dispatched:0};
 day.forEach(order=>{if(Object.prototype.hasOwnProperty.call(status,String(order.status)))status[String(order.status)]++;});
 const requirements=new Map();let unmatched=0;
 toProduce.forEach(order=>(order.items||[]).forEach(item=>{const product=findProduct(item);if(product)explode(product,itemQty(item),requirements);else unmatched+=itemQty(item);}));
 const materials=[...requirements.entries()].map(([id,required])=>{const material=DATA.materials.find(item=>item.id===id)||{id,name:id,unit:'unidad'};const known=stock[id]!==undefined&&stock[id]!==null&&stock[id]!=='';const available=known?num(stock[id]):null;return {material,required,available,gap:known?Math.max(0,required-available):null};});
 const shortages=materials.filter(row=>row.gap!==null&&row.gap>0),unknown=materials.filter(row=>row.available===null),covered=materials.filter(row=>row.gap===0);
 const incomplete=day.filter(order=>String(order.status)==='preparing').filter(order=>{const f=fulfillment[order.id]||{};return !CHECKS.every(key=>Boolean(f[key]));});
 const undated=orders.filter(order=>ACTIVE.has(String(order.status))&&!orderDate(order));
 const openPurchases=purchaseOrders.filter(order=>OPEN_PURCHASES.has(String(order.status)));
 const units=toProduce.flatMap(order=>order.items||[]).reduce((sum,item)=>sum+itemQty(item),0);
 const critical=shortages.length+(unmatched>0?1:0),warnings=unknown.length+incomplete.length+undated.length;
 return {date,day,toProduce,status,materials,shortages,unknown,covered,incomplete,undated,openPurchases,unmatched,units,critical,warnings};
}
function bar(label,value,max,tone,detail){const width=max?Math.max(value?6:0,(value/max)*100):0;return `<div class="v32c-bar"><div class="v32c-bar-label"><span>${esc(label)}</span><strong>${esc(value)}</strong></div><div class="v32c-track" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><i class="${esc(tone)}" style="width:${width.toFixed(1)}%"></i></div><small>${esc(detail)}</small></div>`;}
function actions(state){
 const list=[];
 if(state.shortages.length)list.push({tone:'critical',title:'Resolver faltantes confirmados',text:`${state.shortages.length} material(es) tienen conteo insuficiente para la producción comprometida.`,href:'operacion.html#compras',cta:'Revisar compras'});
 if(state.unmatched)list.push({tone:'critical',title:'Corregir productos sin BOM',text:`${state.unmatched} unidad(es) no pueden explotar requerimientos de materiales.`,href:'studio.html',cta:'Abrir Datos maestros'});
 if(state.unknown.length)list.push({tone:'warning',title:'Completar conteos físicos',text:`${state.unknown.length} material(es) requeridos siguen desconocidos. Desconocido no significa cero.`,href:'operacion.html#materiales',cta:'Contar materiales'});
 if(state.incomplete.length)list.push({tone:'warning',title:'Cerrar alistamientos',text:`${state.incomplete.length} pedido(s) en preparación tienen controles pendientes antes del despacho.`,href:'operacion.html#produccion',cta:'Abrir producción'});
 if(state.undated.length)list.push({tone:'warning',title:'Asignar fechas comprometidas',text:`${state.undated.length} pedido(s) activo(s) están fuera de agenda por falta de fecha.`,href:'operacion.html#agenda',cta:'Abrir agenda'});
 if(!list.length)list.push({tone:'ok',title:'No hay bloqueos detectados',text:'Con los datos disponibles, la fecha no muestra faltantes, conteos pendientes ni alistamientos incompletos.',href:'operacion.html',cta:'Abrir Operación'});
 return list.slice(0,5);
}
function statusTitle(state){if(state.critical)return ['Bloqueado','Hay decisiones que impiden confiar en el plan del día.','critical'];if(state.warnings)return ['Requiere atención','La operación puede avanzar, pero quedan datos o controles por cerrar.','warning'];return ['Listo para ejecutar','No se detectan excepciones críticas con los datos disponibles.','ok'];}
function materialStack(state){const total=Math.max(1,state.materials.length),covered=state.covered.length,short=state.shortages.length,unknown=state.unknown.length;return `<div class="v32c-stack" role="img" aria-label="Materiales: ${covered} cubiertos, ${short} con faltante, ${unknown} sin conteo"><i class="covered" style="width:${covered/total*100}%"></i><i class="short" style="width:${short/total*100}%"></i><i class="unknown" style="width:${unknown/total*100}%"></i></div><div class="v32c-legend"><span><i class="covered"></i>${covered} cubiertos</span><span><i class="short"></i>${short} faltantes</span><span><i class="unknown"></i>${unknown} sin conteo</span></div>`;}
function html(state){
 const [title,detail,tone]=statusTitle(state),max=Math.max(1,...Object.values(state.status));
 return `<section class="v32c-executive" data-control-v32 data-signature=""><div class="v32c-head"><div><p class="eyebrow">Control V3.2 · lectura ejecutiva</p><h2>Entender el día antes de ejecutarlo.</h2><p>Una lectura visual de pedidos, producción y materiales. No crea compras ni completa datos faltantes por inferencia.</p></div><div class="v32c-date"><label><span>Fecha operativa</span><input type="date" value="${esc(state.date)}" data-v32c-date></label><button type="button" data-v32c-today>Hoy</button></div></div><div class="v32c-status ${tone}"><div><small>Estado de la fecha</small><strong>${esc(title)}</strong><span>${esc(detail)}</span></div><div class="v32c-status-kpis"><span><strong>${state.day.length}</strong> pedidos</span><span><strong>${state.units}</strong> unidades por producir</span><span><strong>${state.openPurchases.length}</strong> compras abiertas</span></div></div><div class="v32c-grid"><article class="v32c-card"><header><div><small>Flujo de pedidos</small><h3>¿Dónde está el trabajo?</h3></div><a href="operacion.html#agenda">Abrir agenda →</a></header><div class="v32c-bars">${bar('Aprobados',state.status.approved,max,'approved','Esperan producción o alistamiento')}${bar('En preparación',state.status.preparing,max,'preparing','Trabajo en curso')}${bar('Despachados',state.status.dispatched,max,'dispatched','Compromiso ya movilizado')}</div></article><article class="v32c-card"><header><div><small>Cobertura de materiales</small><h3>¿Podemos producir con lo contado?</h3></div><a href="operacion.html#materiales">Ver materiales →</a></header>${materialStack(state)}<p class="v32c-note">La cobertura usa exclusivamente conteos conocidos. Un material sin conteo permanece como desconocido.</p></article></div><article class="v32c-card v32c-actions"><header><div><small>Prioridad operativa</small><h3>Qué hacer ahora.</h3></div><span>${state.critical} crítico(s) · ${state.warnings} atención</span></header><div class="v32c-action-grid">${actions(state).map((item,index)=>`<a class="v32c-action ${item.tone}" href="${item.href}"><small>0${index+1}</small><div><strong>${esc(item.title)}</strong><span>${esc(item.text)}</span></div><b>${esc(item.cta)} →</b></a>`).join('')}</div></article></section>`;
}
function signature(state){return JSON.stringify([state.date,state.day.map(o=>[o.id,o.status]),state.materials.map(r=>[r.material.id,r.required,r.available]),state.incomplete.map(o=>o.id),state.undated.map(o=>o.id),state.openPurchases.map(o=>[o.id,o.status]),state.unmatched]);}
let decorating=false;
function decorate(force=false){if(decorating)return;decorating=true;try{const root=document.getElementById(ROOT_ID);if(!root)return;const state=compute(),sig=signature(state),existing=root.querySelector('[data-control-v32]');if(!force&&existing?.dataset.signature===sig)return;existing?.remove();root.insertAdjacentHTML('afterbegin',html(state));const next=root.querySelector('[data-control-v32]');if(next)next.dataset.signature=sig;document.documentElement.dataset.controlExecutiveVersion=VERSION;}finally{decorating=false;}}
function bind(){const root=document.getElementById(ROOT_ID);if(!root||root.dataset.v32cBound)return;root.dataset.v32cBound='1';root.addEventListener('change',event=>{const input=event.target.closest('[data-v32c-date]');if(!input)return;sessionStorage.setItem('ee_v22_selected_date',input.value||today());window.dispatchEvent(new Event('ee:v22:reload'));decorate(true);});root.addEventListener('click',event=>{const button=event.target.closest('[data-v32c-today]');if(!button)return;sessionStorage.setItem('ee_v22_selected_date',today());window.dispatchEvent(new Event('ee:v22:reload'));decorate(true);});}
function start(){bind();decorate();const root=document.getElementById(ROOT_ID);if(!root)return;let queued=false;new MutationObserver(()=>{if(queued||decorating)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate();});}).observe(root,{childList:true,subtree:true});['ee:v21:reload','ee:v22:reload','ee:v24:stock-updated'].forEach(name=>window.addEventListener(name,()=>decorate(true)));window.addEventListener('storage',()=>decorate(true));}
window.EL_ERRANTE_CONTROL_V32={version:VERSION,compute};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
