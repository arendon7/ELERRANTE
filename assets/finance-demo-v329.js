(()=>{
'use strict';
const VERSION='3.2.9';
const ROOT_ID='finance-workbench-v31';
const SNAPSHOT_KEY='ee_v30_mfo_snapshot';
const WORKING_KEY='ee_v31_finance_working_model';
const HISTORY_KEY='ee_v31_finance_history';
const ORDER_KEY='ee_v14_orders';
const MOVE_KEY='ee_v27_finance_movements';
const CASH_KEY='ee_v323_cash_counts';
const STOCK_KEY='ee_v23_material_stock';
const MATERIAL_PURCHASE_KEY='ee_v24_material_purchases';
const PURCHASE_ORDER_KEY='ee_v25_purchase_orders';
const MARKER_KEY='ee_v329_finance_demo';
const MANAGED=[SNAPSHOT_KEY,WORKING_KEY,HISTORY_KEY,ORDER_KEY,MOVE_KEY,CASH_KEY,STOCK_KEY,MATERIAL_PURCHASE_KEY,PURCHASE_ORDER_KEY];
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0;};
const money=v=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n(v));
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const currentMonth=()=>today().slice(0,7);
const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
function backup(){const values={};MANAGED.forEach(key=>{values[key]=localStorage.getItem(key);});return {version:VERSION,createdAt:new Date().toISOString(),values};}
function restore(marker){MANAGED.forEach(key=>{const value=marker?.values?.[key];if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,value);});localStorage.removeItem(MARKER_KEY);}
function makeDemo(){
 const base=window.EL_ERRANTE_FINANCE_STARTER_V31?.starter?.();if(!base)throw new Error('No está disponible el modelo financiero base.');
 const ratios=[.38,.42,.35,.46,.40];
 base.meta={...base.meta,modelName:'Demo financiera guiada · El Errante',modelDate:today(),status:'ESTIMADO',confidence:'DEMO',source:'Datos sintéticos generados localmente para demostración',workbookProfile:'DEMO_GUIDED_V329',reconciliation:'DEMO',demoVersion:VERSION};
 base.productCosts=base.productCosts.map((p,i)=>({...p,directCost:Math.round(n(p.price)*ratios[i%ratios.length]),status:'ESTIMADO',confidence:'DEMO',source:'Costo sintético V3.2.9 · no usar como costo real'}));
 const costBySku=new Map(base.productCosts.map(p=>[String(p.sku),p]));
 const monthIndex=new Map([...new Set(base.planSales.map(r=>r.month))].sort().map((m,i)=>[m,i]));
 base.planSales=base.planSales.map((r,i)=>{const p=costBySku.get(String(r.sku));const mi=monthIndex.get(r.month)||0;const productIndex=base.productCosts.findIndex(x=>String(x.sku)===String(r.sku));const active=productIndex>=0&&productIndex<Math.min(5,base.productCosts.length);const quantity=active?Math.max(2,Math.round(5+productIndex*2+mi*.55)):0;const price=n(p?.price||r.unitPrice);const unitCost=n(p?.directCost);return {...r,quantity,unitPrice:price,sales:quantity*price,unitCost,cogs:quantity*unitCost,status:'ESTIMADO',confidence:'DEMO',source:'Plan sintético V3.2.9'};});
 const rowsByMonth=new Map();base.planSales.forEach(r=>{if(!rowsByMonth.has(r.month))rowsByMonth.set(r.month,[]);rowsByMonth.get(r.month).push(r);});
 let opening=2000000;base.cashFlow=base.cashFlow.map(r=>{const rows=rowsByMonth.get(r.month)||[];const sales=rows.reduce((s,x)=>s+n(x.sales),0);const cogs=rows.reduce((s,x)=>s+n(x.cogs),0);const salesCash=Math.round(sales*.9);const purchases=Math.round(cogs*.75);const operatingExpenses=Math.max(180000,Math.round(sales*.12));const taxReserve=Math.round(sales*.06);const capex=0;const endingCash=opening+salesCash-purchases-operatingExpenses-taxReserve-capex;const out={...r,openingCash:opening,salesCash,purchases,operatingExpenses,auxiliaryPayroll:0,juanCash:0,taxReserve,rent:0,capex,endingCash,status:'ESTIMADO',confidence:'DEMO',source:'Flujo sintético V3.2.9'};opening=endingCash;return out;});
 base.assumptions=[{name:'Caja inicial',category:'Caja',value:2000000,unit:'COP',status:'ESTIMADO',confidence:'DEMO',note:'Valor sintético para demostración.',source:'Demo V3.2.9'},{name:'Caja mínima',category:'Caja',value:900000,unit:'COP',status:'ESTIMADO',confidence:'DEMO',note:'Umbral sintético para mostrar alertas de liquidez.',source:'Demo V3.2.9'},{name:'Reserva tributaria',category:'Impuestos',value:.06,unit:'%',status:'ESTIMADO',confidence:'DEMO',note:'Supuesto didáctico; no constituye criterio tributario.',source:'Demo V3.2.9'}];
 base.decisions=[{id:'DEMO-D1',name:'Revisar capacidad operativa',configuredMonth:4,recommendedMonth:5,differenceMonths:-1,decisionState:'PENDIENTE',condition:'Crecimiento sostenido del volumen',impact:'Capacidad',suggestedAction:'Validar carga antes de ampliar capacidad',status:'INFERIDO',confidence:'DEMO',source:'Demo V3.2.9'}];
 base.pending=[{priority:'Media',finding:'Validar costos directos con evidencia real',impact:'La demo usa costos sintéticos para explicar el flujo.',recommendedDecision:'Sustituirlos por costos confirmados antes de usar el modelo para decisiones reales.',status:'PENDIENTE',confidence:'DEMO',source:'Demo V3.2.9'}];
 return base;
}
function demoFacts(model){
 const products=model.productCosts.filter(p=>n(p.price)>0).slice(0,3);const month=currentMonth();const date=today();const items=products.slice(0,2).map((p,i)=>({productId:p.sku,name:p.name,quantity:i+1,unitPrice:n(p.price),unit_cost_snapshot:n(p.directCost),demoV329:true}));const total=items.reduce((s,x)=>s+x.quantity*x.unitPrice,0);const planCash=model.cashFlow.find(r=>r.month===month)?.endingCash||2000000;
 return {
  orders:[{id:'DEMO-V329-ORDER-1',status:'approved',createdAt:`${date}T10:00:00-05:00`,total,items,demoV329:true,source:'Demo financiera V3.2.9'}],
  moves:[{id:'DEMO-V329-MOVE-1',date,type:'operating_expense',amount:Math.max(25000,Math.round(total*.08)),evidence:'ESTIMADO',description:'Gasto operativo sintético',demoV329:true},{id:'DEMO-V329-MOVE-2',date,type:'inventory_purchase',amount:Math.max(30000,Math.round(total*.16)),evidence:'ESTIMADO',description:'Compra sintética de inventario',demoV329:true}],
  cash:[{id:'DEMO-V329-CASH-1',month,date,amount:Math.max(0,Math.round(n(planCash)*.94)),evidence:'ESTIMADO',createdAt:new Date().toISOString(),demoV329:true}],
  stock:{},materialPurchases:[],purchaseOrders:[]
 };
}
function loadDemo(){
 if(localStorage.getItem(SNAPSHOT_KEY)){alert('Ya existe un baseline financiero en este navegador. La demo solo se activa desde una superficie financiera vacía para no mezclar información.');return;}
 const marker=backup();const model=makeDemo(),facts=demoFacts(model);localStorage.setItem(MARKER_KEY,JSON.stringify(marker));localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(model));localStorage.removeItem(WORKING_KEY);localStorage.removeItem(HISTORY_KEY);localStorage.setItem(ORDER_KEY,JSON.stringify(facts.orders));localStorage.setItem(MOVE_KEY,JSON.stringify(facts.moves));localStorage.setItem(CASH_KEY,JSON.stringify(facts.cash));localStorage.setItem(STOCK_KEY,JSON.stringify(facts.stock));localStorage.setItem(MATERIAL_PURCHASE_KEY,JSON.stringify(facts.materialPurchases));localStorage.setItem(PURCHASE_ORDER_KEY,JSON.stringify(facts.purchaseOrders));sessionStorage.setItem('ee_v31_finance_tab','dashboard');sessionStorage.setItem('ee_v327_executive_month',currentMonth());location.reload();
}
function clearDemo(){const marker=read(MARKER_KEY,null);if(!marker)return;restore(marker);sessionStorage.removeItem('ee_v327_executive_month');sessionStorage.setItem('ee_v31_finance_tab','dashboard');location.reload();}
function emptyEnhance(root){if(localStorage.getItem(SNAPSHOT_KEY)||read(MARKER_KEY,null))return;const row=root.querySelector('.v31-empty .v31-import-row');if(!row||row.querySelector('[data-v329-load-demo]'))return;const button=document.createElement('button');button.type='button';button.className='v31-btn';button.dataset.v329LoadDemo='1';button.textContent='Cargar demo financiera';button.addEventListener('click',loadDemo);row.appendChild(button);const note=document.createElement('p');note.className='v31-inline-note v329-demo-note';note.innerHTML='<strong>Demo aislada y reversible.</strong> Carga cifras sintéticas, pedidos, movimientos y caja de ejemplo únicamente en este navegador. No publica costos reales y al salir restaura el estado local anterior.';root.querySelector('.v31-empty')?.appendChild(note);}
function activeEnhance(root){const marker=read(MARKER_KEY,null),data=window.EL_ERRANTE_FINANCE_V31?.working?.();if(!marker||data?.meta?.demoVersion!==VERSION)return;const finance=root.querySelector('.v31-finance');if(!finance||finance.querySelector('[data-v329-demo-banner]'))return;const banner=document.createElement('div');banner.className='v329-demo-banner';banner.dataset.v329DemoBanner='1';banner.innerHTML=`<div><small>Modo demo financiero · V3.2.9</small><strong>Datos sintéticos activos</strong><span>Explora ventas, costos, caja, escenarios y alertas sin usar cifras privadas. Nada de esta demo debe interpretarse como dato real.</span></div><button type="button" class="v31-btn" data-v329-clear-demo>Salir y restaurar datos</button>`;finance.prepend(banner);banner.querySelector('[data-v329-clear-demo]').addEventListener('click',clearDemo);document.documentElement.dataset.financeDemoVersion=VERSION;}
let decorating=false;function enhance(){if(decorating)return;decorating=true;try{const root=document.getElementById(ROOT_ID);if(!root)return;emptyEnhance(root);activeEnhance(root);}finally{decorating=false;}}
function start(){enhance();const root=document.getElementById(ROOT_ID);if(!root)return;let queued=false;new MutationObserver(()=>{if(queued||decorating)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}).observe(root,{childList:true,subtree:true});}
window.EL_ERRANTE_FINANCE_DEMO_V329={version:VERSION,makeDemo,demoFacts,loadDemo,clearDemo};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();