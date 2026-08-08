(()=>{
'use strict';
const VERSION='3.1.0';
const SNAPSHOT_KEY='ee_v30_mfo_snapshot';
const WORKING_KEY='ee_v31_finance_working_model';
const HISTORY_KEY='ee_v31_finance_history';
const ROOT_ID='finance-workbench-v31';
const monthString=date=>`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;
function months24(){const local=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});const [year,month]=local.split('-').map(Number);const start=new Date(Date.UTC(year,month-1,1));return Array.from({length:24},(_,i)=>monthString(new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+i,1))));}
function publicSkuRows(){
 const products=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
 const rows=[];
 products.forEach(product=>{
  const variants=Array.isArray(product.variants)&&product.variants.length?product.variants:[product];
  variants.forEach(variant=>{
   const sku=String(variant.id||variant.sku||product.id||`SKU-${rows.length+1}`);
   const name=String(variant.name||product.name||product.title||sku);
   const raw=variant.price??product.price??0;
   const price=Number(raw)||0;
   rows.push({sku,name,category:String(product.category||product.type||''),price,directCost:0,validFrom:'',status:'PENDIENTE',confidence:'',source:'Modelo local V3.1 · catálogo público'});
  });
 });
 return rows;
}
function starter(){
 const months=months24();
 const products=publicSkuRows();
 const planSales=[];
 months.forEach(month=>products.forEach(product=>planSales.push({month,sku:product.sku,quantity:0,unitPrice:product.price,sales:0,unitCost:0,cogs:0,status:'PENDIENTE',confidence:'',source:'Modelo local V3.1'})));
 const cashFlow=months.map(month=>({month,openingCash:0,salesCash:0,purchases:0,operatingExpenses:0,auxiliaryPayroll:0,juanCash:0,taxReserve:0,rent:0,capex:0,endingCash:0,status:'PENDIENTE',confidence:'',source:'Modelo local V3.1'}));
 return {
  schemaVersion:'3.0',
  meta:{modelName:'Modelo financiero local El Errante',modelDate:'',exportedAt:new Date().toISOString(),status:'PENDIENTE',confidence:'',source:'Creado en este navegador; sin cifras privadas publicadas',workbookProfile:'LOCAL_STARTER_V31',reconciliation:'LOCAL'},
  planSales,
  productCosts:products,
  cashFlow,
  scenarios:[
   {name:'Conservador',volumeFactor:.75,directCostFactor:1.05,status:'PENDIENTE',source:'Modelo local V3.1'},
   {name:'Base',volumeFactor:1,directCostFactor:1,status:'PENDIENTE',source:'Modelo local V3.1'},
   {name:'Crecimiento',volumeFactor:1.25,directCostFactor:1,status:'PENDIENTE',source:'Modelo local V3.1'},
   {name:'Personalizado',volumeFactor:1,directCostFactor:1,status:'PENDIENTE',source:'Modelo local V3.1'}
  ],
  assumptions:[
   {name:'Caja inicial',category:'Caja',value:0,unit:'COP',status:'PENDIENTE',note:'Completar con valor validado.',source:'Modelo local V3.1'},
   {name:'Caja mínima',category:'Caja',value:0,unit:'COP',status:'PENDIENTE',note:'Definir política de liquidez.',source:'Modelo local V3.1'},
   {name:'Reserva tributaria',category:'Impuestos',value:0,unit:'COP',status:'PENDIENTE',note:'Validar con criterio tributario.',source:'Modelo local V3.1'}
  ],
  decisions:[],
  pending:[{priority:'Alta',finding:'Completar el modelo financiero local',impact:'Las proyecciones permanecen en cero hasta ingresar supuestos, costos y volúmenes.',recommendedDecision:'Ingresar datos confirmados o importar el snapshot privado del MFO.',status:'PENDIENTE',source:'Modelo local V3.1'}]
 };
}
function create(){
 if(localStorage.getItem(SNAPSHOT_KEY)&&!confirm('Ya existe un baseline financiero local. ¿Reemplazarlo por un modelo nuevo desde cero?'))return;
 localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(starter()));
 localStorage.removeItem(WORKING_KEY);
 localStorage.removeItem(HISTORY_KEY);
 location.reload();
}
function enhance(){
 const root=document.getElementById(ROOT_ID);if(!root||localStorage.getItem(SNAPSHOT_KEY))return;
 const empty=root.querySelector('.v31-empty');const row=empty?.querySelector('.v31-import-row');if(!row||row.querySelector('#v31-create-starter'))return;
 const button=document.createElement('button');button.type='button';button.id='v31-create-starter';button.className='v31-btn terra';button.textContent='Crear modelo desde cero';button.addEventListener('click',create);row.appendChild(button);
 const note=document.createElement('p');note.className='v31-inline-note';note.innerHTML='<strong>Sin datos privados por defecto.</strong> El modelo nuevo usa únicamente los productos y precios públicos disponibles, deja costos y volúmenes en cero y marca los supuestos como PENDIENTE para que tú los completes.';empty.appendChild(note);
}
window.EL_ERRANTE_FINANCE_STARTER_V31={version:VERSION,starter,create};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();