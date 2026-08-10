(()=>{
'use strict';

const VERSION='3.5.0';
const CAPACITY_KEY='ee_v35_capacity_history';
const CLOSE_MONTH_KEY='ee_v32_finance_close_month';
const ACTIVE_EVENTS=['ee:v21:reload','ee:v22:reload','ee:v23:reload','ee:v24:reload','ee:v25:reload','ee:v24:stock-updated','ee:order:status-changed','ee:v323-cash-count','ee:v35-capacity'];

const n=value=>{const x=Number(value);return Number.isFinite(x)?x:0;};
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n(value));
const integer=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(n(value));
const pct=value=>new Intl.NumberFormat('es-CO',{style:'percent',maximumFractionDigits:0}).format(n(value));
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const currentMonth=()=>today().slice(0,7);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

function capacityHistory(){const rows=read(CAPACITY_KEY,[]);return Array.isArray(rows)?rows:[];}
function currentCapacity(){return capacityHistory().slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0]||null;}
function recordCapacity({dailyUnits,note=''}){
  const units=Number(dailyUnits);
  if(!Number.isFinite(units)||units<=0)throw new Error('La capacidad diaria debe ser un número mayor que cero.');
  const rows=capacityHistory();
  const previous=currentCapacity();
  const row={id:uid('CAP'),dailyUnits:units,note:String(note||'').trim(),effectiveDate:today(),createdAt:new Date().toISOString(),supersedes:previous?.id||null,source:'management-pulse-v35'};
  rows.push(row);write(CAPACITY_KEY,rows);
  window.dispatchEvent(new CustomEvent('ee:v35-capacity',{detail:row}));
  return row;
}

function operationState(){return window.EL_ERRANTE_BUSINESS_PULSE_V34?.compute?.(today())||null;}
function financeModel(){return window.EL_ERRANTE_FINANCE_V31?.working?.()||null;}
function financeMonths(data){return [...new Set((data?.planSales||[]).map(row=>row.month).filter(Boolean))].sort();}
function selectedCloseMonth(data){const months=financeMonths(data);let month=sessionStorage.getItem(CLOSE_MONTH_KEY)||currentMonth();if(months.length&&!months.includes(month))month=months[0];return month;}
function closeState(data,month){return window.EL_ERRANTE_FINANCE_V32?.closeData?.(data,month)||null;}
function latestCash(month){return window.EL_ERRANTE_FINANCE_V323?.latestCount?.(month)||null;}

function capacityState(state){
  const policy=currentCapacity();
  const daily=n(policy?.dailyUnits);
  const rows=(state?.days||[]).map(row=>({...row,utilization:daily>0?n(row.units)/daily:null,buffer:daily>0?daily-n(row.units):null}));
  const overloaded=daily>0?rows.filter(row=>row.utilization>1):[];
  const high=daily>0?rows.filter(row=>row.utilization>.85&&row.utilization<=1):[];
  const peak=rows.reduce((best,row)=>n(row.units)>n(best.units)?row:best,{date:today(),units:0,utilization:daily>0?0:null,buffer:daily>0?daily:null});
  return {policy,daily,rows,overloaded,high,peak};
}

function treasuryState(state){
  const issued=state?.issuedPurchases||[];
  const end=state?.end||today();
  const due=issued.filter(row=>row.expectedDate&&row.expectedDate<=end).map(row=>({...row,outstanding:Math.max(0,n(row.requestedQty)-n(row.receivedQty))})).filter(row=>row.outstanding>0);
  const undated=issued.filter(row=>!row.expectedDate).map(row=>({...row,outstanding:Math.max(0,n(row.requestedQty)-n(row.receivedQty))})).filter(row=>row.outstanding>0);
  const dueValue=due.reduce((sum,row)=>sum+row.outstanding*n(row.unitCost),0);
  const undatedValue=undated.reduce((sum,row)=>sum+row.outstanding*n(row.unitCost),0);
  const cash=latestCash(currentMonth());
  const observed=cash?Math.max(0,n(cash.amount)):null;
  const buffer=observed===null?null:observed-dueValue;
  return {due,undated,dueValue,undatedValue,cash,observed,buffer};
}

function closeReadiness(data,month){
  const close=closeState(data,month);
  if(!close)return null;
  const cash=latestCash(month);
  const future=month>currentMonth();
  const gates=[
    {key:'cogs',label:'COGS histórico completo',ok:close.a.cogs!==null,detail:close.a.cogs===null?`${integer(close.a.missing)} unidad(es) sin costo histórico`:'Ventas reales con costo histórico disponible'},
    {key:'costs',label:'Costos directos sin ceros',ok:n(close.quality.zero)===0,detail:n(close.quality.zero)?`${integer(close.quality.zero)} producto(s) con costo directo en cero`:'Modelo unitario sin costos directos en cero'},
    {key:'cash',label:'Caja observada del mes',ok:Boolean(cash),detail:cash?`${money(cash.amount)} observados el ${esc(cash.date||month)}`:'Sin conteo de caja registrado'}
  ];
  const completed=gates.filter(row=>row.ok).length;
  return {close,cash,gates,completed,total:gates.length,future};
}

function loadBars(capacity){
  const max=Math.max(1,...capacity.rows.map(row=>n(row.units)),capacity.daily||0);
  return `<div class="v35-load-list">${capacity.rows.map(row=>{
    const width=capacity.daily>0?Math.min(100,n(row.units)/capacity.daily*100):Math.min(100,n(row.units)/max*100);
    const tone=capacity.daily>0&&row.utilization>1?'over':capacity.daily>0&&row.utilization>.85?'high':'ok';
    return `<div class="v35-load-row"><div><strong>${esc(row.date)}</strong><span>${integer(row.units)} unidades${capacity.daily>0?` · ${pct(row.utilization)}`:''}</span></div><div class="v35-load-track"><i class="${tone}" style="width:${Math.max(row.units?4:0,width)}%"></i></div><b>${capacity.daily>0?(row.buffer>=0?`${integer(row.buffer)} libres`:`${integer(Math.abs(row.buffer))} sobre`):'carga'}</b></div>`;
  }).join('')}</div>`;
}

function capacitySummary(capacity){
  if(!capacity.daily)return {tone:'warning',title:'Capacidad diaria no definida',text:'La carga se puede observar, pero todavía no es correcto afirmar utilización, holgura o sobrecarga.'};
  if(capacity.overloaded.length)return {tone:'critical',title:`${capacity.overloaded.length} día(s) sobre capacidad`,text:`El pico llega a ${pct(capacity.peak.utilization)} de la capacidad registrada.`};
  if(capacity.high.length)return {tone:'warning',title:'Horizonte con poca holgura',text:`Hay ${capacity.high.length} día(s) por encima del 85 % de la capacidad registrada.`};
  return {tone:'ok',title:'Capacidad con holgura',text:'La carga programada de siete días permanece dentro de la capacidad registrada.'};
}

function controlHtml(state,capacity){
  const summary=capacitySummary(capacity);
  return `<section class="v35-shell v35-control" data-management-v35 data-surface="control"><div class="v35-head"><div><p class="eyebrow">Capacidad operativa · V3.5</p><h2>Carga versus capacidad, sin inventar el umbral.</h2><p>Control mantiene una lectura estrictamente operativa. La capacidad sólo se compara cuando existe una observación registrada desde Operación.</p></div><a href="operacion.html#resumen">Gestionar capacidad →</a></div><div class="v35-metrics"><article><small>Capacidad diaria</small><strong>${capacity.daily?`${integer(capacity.daily)} un.`:'No definida'}</strong><span>${capacity.policy?`Registrada ${esc(capacity.policy.effectiveDate)}`:'Sin política registrada'}</span></article><article><small>Pico de carga · 7 días</small><strong>${integer(capacity.peak.units)}</strong><span>${esc(capacity.peak.date)}</span></article><article><small>Días sobre capacidad</small><strong>${capacity.daily?capacity.overloaded.length:'—'}</strong><span>${capacity.daily?'Comparación habilitada':'Requiere definir capacidad'}</span></article><article><small>Unidades programadas</small><strong>${integer(state.productionUnits)}</strong><span>${state.horizon.length} pedido(s) con fecha</span></article></div><div class="v35-status ${summary.tone}"><strong>${esc(summary.title)}</strong><span>${esc(summary.text)}</span></div></section>`;
}

function capacityHistoryHtml(){
  const rows=capacityHistory().slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,4);
  if(!rows.length)return '<p class="v35-empty">Aún no hay observaciones de capacidad.</p>';
  return `<div class="v35-history">${rows.map((row,index)=>`<div><strong>${integer(row.dailyUnits)} unidades/día${index===0?' · vigente':''}</strong><span>${esc(row.effectiveDate||'')} ${row.note?`· ${esc(row.note)}`:''}</span></div>`).join('')}</div>`;
}

function operationHtml(state,capacity){
  const summary=capacitySummary(capacity);
  return `<section class="v35-shell v35-operation" data-management-v35 data-surface="operation"><div class="v35-head"><div><p class="eyebrow">Capacidad y carga · V3.5</p><h2>Una referencia explícita para saber cuándo el día deja de ser ejecutable.</h2><p>La carga proviene de pedidos aprobados o en preparación. La capacidad es una política observada y versionada: nunca se infiere automáticamente a partir de un día tranquilo.</p></div><span>${esc(state.start)} → ${esc(state.end)}</span></div><div class="v35-metrics"><article><small>Capacidad vigente</small><strong>${capacity.daily?`${integer(capacity.daily)} un./día`:'No definida'}</strong><span>${capacity.policy?.note?esc(capacity.policy.note):'Registra una observación para activar utilización'}</span></article><article><small>Pico programado</small><strong>${integer(capacity.peak.units)}</strong><span>${esc(capacity.peak.date)}</span></article><article><small>Utilización pico</small><strong>${capacity.daily?pct(capacity.peak.utilization):'—'}</strong><span>${capacity.daily?`${capacity.overloaded.length} día(s) sobre 100 %`:'Sin denominador válido'}</span></article><article><small>Holgura del pico</small><strong>${capacity.daily?(capacity.peak.buffer>=0?`${integer(capacity.peak.buffer)} un.`:`−${integer(Math.abs(capacity.peak.buffer))} un.`):'—'}</strong><span>${capacity.daily?'Capacidad − carga':'Define capacidad primero'}</span></article></div><div class="v35-grid"><article class="v35-card"><header><div><small>Horizonte</small><h3>Carga diaria y utilización</h3></div></header>${loadBars(capacity)}<div class="v35-status ${summary.tone}"><strong>${esc(summary.title)}</strong><span>${esc(summary.text)}</span></div></article><article class="v35-card"><header><div><small>Política operativa</small><h3>Registrar una nueva capacidad</h3></div></header><form id="v35-capacity-form" class="v35-form"><label><span>Unidades terminadas por día</span><input name="dailyUnits" type="number" min="0.01" step="0.01" required value="${capacity.daily||''}" placeholder="Ej.: 80"></label><label><span>Nota / fundamento</span><input name="note" maxlength="180" placeholder="Ej.: turno actual, horno y equipo disponibles"></label><button type="submit">Registrar nueva observación</button></form><p class="v35-note">Una nueva observación no borra la anterior. Este dato es una política operativa, no una estimación financiera.</p>${capacityHistoryHtml()}</article></div></section>`;
}

function gateHtml(readiness){
  if(!readiness)return '<p class="v35-empty">El modelo financiero aún no está disponible.</p>';
  if(readiness.future)return '<p class="v35-empty">El mes seleccionado es futuro. El cierre real se habilita cuando exista el periodo y sus hechos.</p>';
  return `<div class="v35-gates">${readiness.gates.map(row=>`<div class="${row.ok?'ok':'warning'}"><i>${row.ok?'✓':'!'}</i><div><strong>${esc(row.label)}</strong><span>${esc(row.detail)}</span></div></div>`).join('')}</div>`;
}

function financeHtml(data,state,capacity,treasury,readiness,month){
  const close=readiness?.close||null;
  const realResult=close?.realResult;
  const salesGap=close?close.a.sales-close.plan.sales:null;
  const closingTone=readiness&&!readiness.future&&readiness.completed===readiness.total?'ok':'warning';
  const bufferTone=treasury.buffer===null?'neutral':treasury.buffer<0?'critical':'ok';
  return `<section class="v35-shell v35-finance" data-management-v35 data-surface="finance"><div class="v35-head"><div><p class="eyebrow">Finanzas V3.5 · cierre gerencial y tesorería</p><h2>Qué cerró, qué exige caja y dónde la operación puede tensionar el modelo.</h2><p>Esta capa reutiliza el cierre V3.2, caja observada V3.2.3 y horizonte V3.4. No crea una contabilidad paralela ni convierte pedidos futuros en cobros.</p></div><span>Mes de cierre · ${esc(month)}</span></div><div class="v35-metrics"><article><small>Resultado real simplificado</small><strong>${realResult===null||realResult===undefined?'Incompleto':money(realResult)}</strong><span>${realResult===null||realResult===undefined?'Requiere COGS histórico completo':`${salesGap>=0?'+':''}${money(salesGap)} ventas vs. plan`}</span></article><article class="${closingTone}"><small>Evidencias de cierre</small><strong>${readiness?.future?'No aplica':readiness?`${readiness.completed}/${readiness.total}`:'—'}</strong><span>${readiness?.future?'Mes futuro':'COGS · costos · caja observada'}</span></article><article><small>Caja observada vigente</small><strong>${treasury.observed===null?'Sin conteo':money(treasury.observed)}</strong><span>${treasury.cash?`${esc(treasury.cash.date||currentMonth())} · ${esc(treasury.cash.evidence||'observada')}`:'No se usa caja plan como sustituto'}</span></article><article class="${bufferTone}"><small>Buffer conservador · 7 días</small><strong>${treasury.buffer===null?'No estimable':money(treasury.buffer)}</strong><span>Caja observada − compras emitidas vencidas/próximas</span></article></div><div class="v35-grid v35-finance-grid"><article class="v35-card"><header><div><small>Cierre gerencial</small><h3>¿Qué falta para confiar en el mes?</h3></div><button type="button" data-v35-open-close>Abrir cierre mensual →</button></header>${gateHtml(readiness)}<p class="v35-note">Estas señales evalúan evidencia gerencial mínima; no certifican un cierre contable, fiscal o de auditoría.</p></article><article class="v35-card"><header><div><small>Tesorería corta</small><h3>Compromisos conocidos frente a caja observada</h3></div><button type="button" data-v35-open-cash>Abrir caja →</button></header><div class="v35-stat-list"><div><span>Compras emitidas vencidas/próximas</span><strong>${money(treasury.dueValue)}</strong></div><div><span>Órdenes emitidas sin fecha esperada</span><strong>${treasury.undated.length} · ${money(treasury.undatedValue)}</strong></div><div><span>Valor comercial comprometido · 7 días</span><strong>${money(state.committedValue)}</strong></div><div><span>Caja observada menos compras fechadas</span><strong>${treasury.buffer===null?'No estimable':money(treasury.buffer)}</strong></div></div><p class="v35-note">El valor de pedidos próximos se muestra como contexto comercial. No se suma a caja porque no existe evidencia de cobro. El buffer tampoco incluye nómina, OPEX, impuestos u otras salidas no fechadas aquí.</p></article></div><article class="v35-card v35-capacity-finance"><header><div><small>Capacidad</small><h3>¿La ejecución puede convertirse en un cuello de botella?</h3></div><a href="operacion.html#resumen">Gestionar en Operación →</a></header><div class="v35-capacity-finance-row"><div><span>Capacidad diaria registrada</span><strong>${capacity.daily?`${integer(capacity.daily)} un.`:'No definida'}</strong></div><div><span>Pico de carga</span><strong>${integer(capacity.peak.units)} un.</strong></div><div><span>Utilización pico</span><strong>${capacity.daily?pct(capacity.peak.utilization):'—'}</strong></div><div><span>Días sobre capacidad</span><strong>${capacity.daily?capacity.overloaded.length:'—'}</strong></div></div><p class="v35-note">Finanzas recibe sólo la señal de capacidad. La programación y el registro de la política permanecen en Operación.</p></article></section>`;
}

function ensureMounts(){
  const page=document.body?.dataset?.page;
  if((page==='control'||page==='operacion')&&!document.getElementById('management-pulse-v35')){
    const anchor=document.getElementById('business-pulse-v34');
    if(anchor)anchor.insertAdjacentHTML('afterend',`<div id="management-pulse-v35" data-management-surface="${page==='control'?'control':'operation'}"></div>`);
  }
  if(page==='finanzas'&&!document.getElementById('finance-management-v35')){
    const anchor=document.getElementById('finance-operational-pulse-v34');
    if(anchor)anchor.insertAdjacentHTML('afterend','<div id="finance-management-v35"></div>');
  }
}

let queued=false;
function render(){
  ensureMounts();
  const state=operationState();
  if(!state)return;
  const capacity=capacityState(state);
  const opMount=document.getElementById('management-pulse-v35');
  if(opMount){opMount.innerHTML=opMount.dataset.managementSurface==='control'?controlHtml(state,capacity):operationHtml(state,capacity);}
  const financeMount=document.getElementById('finance-management-v35');
  if(financeMount){
    const data=financeModel();
    if(!data){financeMount.innerHTML='';return;}
    const month=selectedCloseMonth(data);
    const readiness=closeReadiness(data,month);
    const treasury=treasuryState(state);
    financeMount.innerHTML=financeHtml(data,state,capacity,treasury,readiness,month);
  }
  document.documentElement.dataset.managementPulseVersion=VERSION;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
function bind(){
  document.addEventListener('submit',event=>{
    if(event.target.id!=='v35-capacity-form')return;
    event.preventDefault();const fd=new FormData(event.target);
    try{recordCapacity({dailyUnits:fd.get('dailyUnits'),note:fd.get('note')});}
    catch(error){alert(error.message);}
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-v35-open-close]')){document.querySelector('#finance-workbench-v31 [data-v32-close="1"]')?.click();}
    if(event.target.closest('[data-v35-open-cash]')){document.querySelector('#finance-workbench-v31 [data-v323-cash="1"]')?.click();}
  });
}
function start(){
  bind();render();
  ACTIVE_EVENTS.forEach(name=>window.addEventListener(name,schedule));
  window.addEventListener('storage',schedule);
  ['business-pulse-v34','finance-operational-pulse-v34','finance-workbench-v31','control-v30','production-v22','procurement-v25'].forEach(id=>{const node=document.getElementById(id);if(node)new MutationObserver(schedule).observe(node,{childList:true,subtree:true});});
}

window.EL_ERRANTE_MANAGEMENT_V35={version:VERSION,capacityHistory,currentCapacity,recordCapacity,compute:()=>{const operational=operationState();return operational?{operational,capacity:capacityState(operational),treasury:treasuryState(operational)}:null;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
