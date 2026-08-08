(()=>{
'use strict';
const VERSION='3.1.1';
const MARKER_KEY='ee_v311_operational_demo';
const FINANCE_KEYS=['ee_v30_mfo_snapshot','ee_v31_finance_working_model','ee_v329_finance_demo'];
const KEYS={
  orders:'ee_v14_orders',
  fulfillment:'ee_v22_fulfillment',
  stock:'ee_v23_material_stock',
  measurements:'ee_v24_production_measurements',
  purchases:'ee_v24_material_purchases',
  purchaseOrders:'ee_v25_purchase_orders'
};
const SESSION_KEYS=['ee_v22_selected_date'];
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const shift=(date,days)=>{const value=new Date(`${date}T12:00:00-05:00`);value.setDate(value.getDate()+days);return value.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});};
const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
const financeState=()=>FINANCE_KEYS.some(key=>localStorage.getItem(key)!==null);
const hasOperationalState=()=>Object.values(KEYS).some(key=>localStorage.getItem(key)!==null);
const active=()=>Boolean(read(MARKER_KEY,null));
function backup(){
  const local={};Object.values(KEYS).forEach(key=>{local[key]=localStorage.getItem(key);});
  const session={};SESSION_KEYS.forEach(key=>{session[key]=sessionStorage.getItem(key);});
  return {version:VERSION,createdAt:new Date().toISOString(),local,session};
}
function restore(marker){
  Object.values(KEYS).forEach(key=>{const value=marker?.local?.[key];if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,value);});
  SESSION_KEYS.forEach(key=>{const value=marker?.session?.[key];if(value===null||value===undefined)sessionStorage.removeItem(key);else sessionStorage.setItem(key,value);});
  localStorage.removeItem(MARKER_KEY);
}
function makeDemo(){
  const date=today(),previous=shift(date,-1),expected=shift(date,2),stamp=new Date().toISOString();
  return {
    date,
    orders:[
      {id:'DEMO-OP-001',status:'preparing',createdAt:`${date}T09:10:00-05:00`,updatedAt:stamp,subtotal:51800,deliveryFee:0,total:51800,customer:{name:'Cliente demo · Mesa Medellín',email:'demo-operacion@example.invalid',phone:'3000000000'},delivery:{city:'Medellín',neighborhood:'Laureles',address:'Dirección sintética de demostración',requestedDate:date,notes:'Pedido sintético para recorrer producción y despacho.'},items:[{productId:'la-errante',variantId:'la-errante',name:'La Errante',quantity:2,unitPrice:25900,lineTotal:51800,demoV311:true}],statusTimeline:[{status:'approved',createdAt:`${date}T08:55:00-05:00`,note:'Pago sintético aprobado para demostración.'},{status:'preparing',createdAt:`${date}T09:10:00-05:00`,note:'Preparación sintética iniciada.'}],demoV311:true,dataStatus:'DEMO',source:'Demo operativa V3.1.1'},
      {id:'DEMO-OP-002',status:'approved',createdAt:`${date}T09:30:00-05:00`,updatedAt:stamp,subtotal:20900,deliveryFee:0,total:20900,customer:{name:'Cliente demo · Pedido individual',email:'demo-pedido@example.invalid',phone:'3000000001'},delivery:{city:'Medellín',neighborhood:'El Poblado',address:'Dirección sintética de demostración',requestedDate:date,notes:'Pedido sintético pendiente de iniciar producción.'},items:[{productId:'margherita-del-taller',variantId:'margherita-del-taller',name:'Margherita del Taller',quantity:1,unitPrice:20900,lineTotal:20900,demoV311:true}],statusTimeline:[{status:'approved',createdAt:`${date}T09:30:00-05:00`,note:'Pago sintético aprobado para demostración.'}],demoV311:true,dataStatus:'DEMO',source:'Demo operativa V3.1.1'}
    ],
    fulfillment:{'DEMO-OP-001':{productReady:true,packagingReady:true,quantityChecked:false,deliveryCoordinated:false,note:'Demo: producto y empaque listos; faltan cantidad y coordinación.',updatedAt:stamp}},
    stock:{'MP-HFS':100,'MP-HHO':100,'MP-MOZ':260},
    measurements:[{id:'DEMO-MED-001',kind:'recipe',referenceId:'REC-MASA-BASE-V23',referenceName:'Masa base con poolish',batchCode:`DEMO-MASA-${date}`,productionDate:date,expectedQty:12516,actualQty:11600,wasteQty:916,unit:'g',note:'Medición sintética con desviación deliberada para mostrar la alerta de rendimiento.',createdAt:stamp,dataStatus:'DEMO',demoV311:true}],
    purchases:[{id:'DEMO-COM-001',materialId:'MP-HFS',supplier:'Molino demo',receivedDate:previous,invoiceReference:'DEMO-FAC-001',quantity:1000,totalCost:2800,unitCost:2.8,note:'Compra observada sintética para demostración.',createdAt:stamp,dataStatus:'DEMO',demoV311:true}],
    purchaseOrders:[{id:'DEMO-PO-001',code:'DEMO-OC-001',materialId:'MP-HFS',supplier:'Molino demo',status:'draft',requestedQty:150,receivedQty:0,unitCost:2.8,expectedDate:expected,externalReference:'DEMO-COT-001',note:'Borrador sintético; no representa una compra real.',createdAt:stamp,updatedAt:stamp,dataStatus:'DEMO',demoV311:true}]
  };
}
function writeDemo(data){
  localStorage.setItem(KEYS.orders,JSON.stringify(data.orders));
  localStorage.setItem(KEYS.fulfillment,JSON.stringify(data.fulfillment));
  localStorage.setItem(KEYS.stock,JSON.stringify(data.stock));
  localStorage.setItem(KEYS.measurements,JSON.stringify(data.measurements));
  localStorage.setItem(KEYS.purchases,JSON.stringify(data.purchases));
  localStorage.setItem(KEYS.purchaseOrders,JSON.stringify(data.purchaseOrders));
  sessionStorage.setItem('ee_v22_selected_date',data.date);
}
function loadDemo(){
  if(active()){location.href='control.html';return;}
  if(financeState()){alert('La demo operativa no se activa mientras exista un baseline, modelo de trabajo o demo financiera en este navegador. Conservamos así separados los hechos sintéticos del análisis financiero.');return;}
  if(hasOperationalState()&&!confirm('Este navegador ya contiene datos operativos locales. La demo guardará una copia exacta, los sustituirá temporalmente por datos sintéticos y los restaurará al salir. ¿Continuar?'))return;
  const marker=backup();
  try{
    localStorage.setItem(MARKER_KEY,JSON.stringify(marker));
    writeDemo(makeDemo());
    location.href='control.html';
  }catch(error){restore(marker);throw error;}
}
function clearDemo(){
  const marker=read(MARKER_KEY,null);if(!marker)return;
  if(!confirm('¿Salir de la demo operativa y restaurar exactamente los datos locales anteriores?'))return;
  restore(marker);location.href='centro-interno.html';
}
function button(label,action){const control=document.createElement('button');control.type='button';control.className='v31-btn';control.textContent=label;control.addEventListener('click',action);return control;}
function centerPanel(){
  if(document.body?.dataset?.page!=='centro-interno')return;
  const main=document.querySelector('.v30-main'),grid=main?.querySelector('.v31-module-grid');if(!main||!grid||main.querySelector('[data-v311-operational-demo-panel]'))return;
  const panel=document.createElement('section');panel.className='v30-panel';panel.dataset.v311OperationalDemoPanel='1';
  const isActive=active(),blocked=financeState();
  panel.innerHTML=`<div class="v30-panel-head"><div><p class="eyebrow">Demo operativa reversible · V3.1.1</p><h2>${isActive?'Datos sintéticos operativos activos.':'Recorre el flujo completo sin cargar datos reales.'}</h2><p>${isActive?'Control y Operación están leyendo un escenario local sintético. Puedes recorrer pedidos, producción, BOM, inventario, medición y compras; al salir se restaura el navegador anterior.':blocked?'Hay un contexto financiero activo en este navegador. Por seguridad, restaura o retira ese modelo antes de sustituir temporalmente hechos operativos.':'Carga dos pedidos sintéticos y evidencia operativa mínima en este navegador. La demo no toca Supabase, no crea compras reales y no modifica ningún MFO.'}</p></div><div data-v311-demo-actions></div></div>`;
  const actions=panel.querySelector('[data-v311-demo-actions]');
  if(isActive){actions.appendChild(button('Salir y restaurar demo',clearDemo));}
  else{const load=button('Cargar demo operativa',loadDemo);if(blocked){load.disabled=true;load.title='Existe un contexto financiero activo';}actions.appendChild(load);}
  grid.parentNode.insertBefore(panel,grid);
}
function activeBanner(){
  if(!active())return;
  const page=document.body?.dataset?.page||'';if(!['control','operacion','finanzas'].includes(page))return;
  const main=document.querySelector('.v30-main'),hero=main?.querySelector('.v31-module-hero');if(!main||main.querySelector('[data-v311-operational-demo-banner]'))return;
  const panel=document.createElement('section');panel.className='v30-panel';panel.dataset.v311OperationalDemoBanner='1';
  const finance=page==='finanzas';
  panel.innerHTML=`<div class="v30-panel-head"><div><p class="eyebrow">Modo demo operativa · V3.1.1</p><h2>Hechos sintéticos activos</h2><p>${finance?'Los pedidos, conteos y compras visibles provienen de la demo operativa. No cargues ni analices un MFO privado hasta salir y restaurar los hechos anteriores.':'Este módulo está leyendo pedidos, conteos, alistamiento, mediciones y compras sintéticas. Nada de este escenario debe interpretarse como evidencia real.'}</p></div><div data-v311-demo-actions></div></div>`;
  panel.querySelector('[data-v311-demo-actions]').appendChild(button('Salir y restaurar demo',clearDemo));
  if(hero)hero.insertAdjacentElement('afterend',panel);else main.prepend(panel);
  document.documentElement.dataset.operationalDemoVersion=VERSION;
}
function start(){centerPanel();activeBanner();}
window.EL_ERRANTE_INTERNAL_DEMO_V311={version:VERSION,markerKey:MARKER_KEY,keys:{...KEYS},makeDemo,loadDemo,clearDemo,active,financeState};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();