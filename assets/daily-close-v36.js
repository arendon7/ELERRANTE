(()=>{
'use strict';

const VERSION='3.6.0';
const KEY='ee_v36_daily_close_events';
const DATE_KEY='ee_v22_selected_date';
const ACTIVE_EVENTS=['ee:v21:reload','ee:v22:reload','ee:v23:reload','ee:v24:reload','ee:v25:reload','ee:v24:stock-updated','ee:order:status-changed','ee:v330:evidence','ee:v35-capacity','ee:v36:closed'];
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const n=value=>{const x=Number(value);return Number.isFinite(x)?x:0;};
const integer=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(n(value));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const selectedDate=()=>window.EL_ERRANTE_OPERATION_V330?.selectedDate?.()||sessionStorage.getItem(DATE_KEY)||today();
const addDays=(date,days)=>{const value=new Date(`${date}T12:00:00-05:00`);value.setDate(value.getDate()+days);return value.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});};
const isFuture=date=>date>today();
const uid=()=>`CLOSE-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const sessionUser=()=>{try{const row=JSON.parse(sessionStorage.getItem('ee_v31_session'));return row?.displayName||row?.username||'Usuario local';}catch(_){return 'Usuario local';}};

function history(){const rows=read(KEY,[]);return Array.isArray(rows)?rows:[];}
function supersededIds(rows=history()){return new Set(rows.map(row=>row?.supersedes).filter(Boolean));}
function activeClose(date){const rows=history(),superseded=supersededIds(rows);return rows.filter(row=>row?.date===date&&!superseded.has(row.id)).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0]||null;}
function operationalApi(){return window.EL_ERRANTE_OPERATION_V330||null;}
function pulse(date){return window.EL_ERRANTE_BUSINESS_PULSE_V34?.compute?.(date)||null;}
function capacityPolicy(){return window.EL_ERRANTE_MANAGEMENT_V35?.currentCapacity?.()||null;}

function evidenceIssues(date){
  const api=operationalApi();
  if(!api)return [];
  const href={production:'operacion.html#produccion',yield:'operacion.html#medicion',inventory:'operacion.html#medicion',receipt:'operacion.html#compras',time:'operacion.html#evidencia'};
  return api.readiness(date).filter(row=>row.state==='attention').map(row=>({
    id:`evidence:${row.id}`,kind:'evidence',severity:'critical',blockClose:true,carryover:true,label:row.label,detail:row.detail,href:href[row.id]||'operacion.html#evidencia',cta:'Resolver evidencia'
  }));
}

function continuityIssues(date){
  const state=pulse(date);if(!state)return [];
  const out=[];
  if(state.shortages.length)out.push({id:'continuity:shortages',kind:'continuity',severity:'warning',blockClose:false,carryover:true,label:'Faltantes del horizonte',detail:`${state.shortages.length} material(es) siguen insuficientes considerando compras emitidas.`,href:'operacion.html#compras',cta:'Revisar abastecimiento'});
  if(state.unknown.length)out.push({id:'continuity:unknown-stock',kind:'continuity',severity:'warning',blockClose:false,carryover:true,label:'Conteos pendientes del horizonte',detail:`${state.unknown.length} material(es) requeridos no tienen conteo físico conocido.`,href:'operacion.html#materiales',cta:'Completar conteos'});
  if(state.unmatched>0)out.push({id:'continuity:unmatched-bom',kind:'governance',severity:'critical',blockClose:false,carryover:true,label:'Productos sin BOM resoluble',detail:`${integer(state.unmatched)} unidad(es) comprometidas no pueden convertirse en requerimientos.`,href:'studio.html',cta:'Abrir datos maestros'});
  if(state.overduePurchases.length)out.push({id:'continuity:overdue-purchases',kind:'continuity',severity:'warning',blockClose:false,carryover:true,label:'Compras emitidas vencidas',detail:`${state.overduePurchases.length} orden(es) siguen pendientes después de su fecha esperada.`,href:'operacion.html#compras',cta:'Revisar órdenes'});
  if(state.undated.length)out.push({id:'continuity:undated-orders',kind:'continuity',severity:'warning',blockClose:false,carryover:true,label:'Pedidos activos sin fecha',detail:`${state.undated.length} pedido(s) quedan fuera del horizonte por no tener fecha operativa.`,href:'operacion.html#pedidos',cta:'Asignar fecha'});
  return out;
}

function capacityIssues(date){
  const state=pulse(date),policy=capacityPolicy();if(!state||!policy||n(policy.dailyUnits)<=0)return [];
  const row=(state.days||[]).find(item=>item.date===date);if(!row)return [];
  const utilization=n(row.units)/n(policy.dailyUnits);
  return utilization>1?[{id:'capacity:overload',kind:'capacity',severity:'critical',blockClose:true,carryover:true,label:'Carga por encima de capacidad',detail:`${integer(row.units)} unidades programadas frente a ${integer(policy.dailyUnits)} unidades/día registradas.`,href:'operacion.html#resumen',cta:'Reprogramar carga'}]:[];
}

function facts(date){
  const api=operationalApi();
  if(!api)return {orders:0,productionOrders:0,measurements:0,purchases:0,evidence:0,applicable:0};
  const source=api.sourceFacts(date),evidence=api.activeEvidence(date),readiness=api.readiness(date);
  return {orders:source.orders.length,productionOrders:source.productionOrders.length,measurements:source.measurements.length,purchases:source.purchases.length,evidence:evidence.length,applicable:readiness.filter(row=>row.state!=='na').length};
}

function issueQueue(date=selectedDate()){
  const rows=[...evidenceIssues(date),...capacityIssues(date),...continuityIssues(date)];
  const seen=new Set();return rows.filter(row=>{if(seen.has(row.id))return false;seen.add(row.id);return true;});
}
function fingerprint(rows){return rows.map(row=>`${row.id}:${row.severity}:${row.blockClose?'1':'0'}`).sort().join('|');}

function dayState(date=selectedDate()){
  if(isFuture(date))return {date,status:'future',label:'Periodo futuro',issues:[],blocking:[],carryover:[],facts:facts(date),close:null,stale:false};
  const issues=issueQueue(date),blocking=issues.filter(row=>row.blockClose),carry=issues.filter(row=>row.carryover),dayFacts=facts(date),close=activeClose(date),mark=fingerprint(issues);
  const activity=Object.values(dayFacts).some(value=>Number(value)>0);
  const stale=Boolean(close&&close.fingerprint!==mark);
  let status='ready',label='Lista para cerrar';
  if(close&&!stale){status='closed';label=close.status==='CLOSED_EXCEPTION'?'Cerrada con excepciones':'Cerrada';}
  else if(close&&stale){status='review';label='Cierre requiere revisión';}
  else if(blocking.length){status='pending';label='Pendiente';}
  else if(!activity){status='idle';label='Sin actividad';}
  return {date,status,label,issues,blocking,carryover:carry,facts:dayFacts,close,stale,fingerprint:mark};
}

function closeDay({date=selectedDate(),note=''}){
  if(isFuture(date))throw new Error('No se puede cerrar una jornada futura.');
  const state=dayState(date),cleanNote=String(note||'').trim();
  if(state.blocking.length&&cleanNote.length<12)throw new Error('Un cierre con excepciones exige una justificación de al menos 12 caracteres.');
  const prior=activeClose(date);
  const row={
    id:uid(),date,status:state.blocking.length?'CLOSED_EXCEPTION':'CLOSED',note:cleanNote,createdAt:new Date().toISOString(),createdBy:sessionUser(),supersedes:prior?.id||null,
    fingerprint:state.fingerprint,
    facts:{...state.facts},
    issueSnapshot:state.issues.map(({id,kind,severity,blockClose,carryover,label,detail,href})=>({id,kind,severity,blockClose,carryover,label,detail,href})),
    carryover:state.carryover.map(({id,label,detail,href,severity})=>({id,label,detail,href,severity})),source:'daily-close-v36'
  };
  const rows=history();rows.push(row);write(KEY,rows);window.dispatchEvent(new CustomEvent('ee:v36:closed',{detail:{id:row.id,date:row.date,status:row.status}}));return row;
}

function carryoverFromPrevious(date=selectedDate()){
  const previous=activeClose(addDays(date,-1));if(!previous)return [];
  const current=new Map(issueQueue(date).map(row=>[row.id,row]));
  return (previous.carryover||[]).map(row=>current.get(row.id)).filter(Boolean);
}

function weeklySummary(end=selectedDate()){
  const dates=Array.from({length:7},(_,index)=>addDays(end,index-6));
  const closes=dates.map(date=>activeClose(date)).filter(Boolean);
  const exceptions=closes.filter(row=>row.status==='CLOSED_EXCEPTION').length;
  const counts=new Map();
  closes.flatMap(row=>row.issueSnapshot||[]).forEach(issue=>counts.set(issue.label,(counts.get(issue.label)||0)+1));
  const recurrent=[...counts.entries()].filter(([,count])=>count>1).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([label,count])=>({label,count}));
  return {dates,closed:closes.length,exceptions,recurrent};
}

function stateClass(status){return ['closed','ready','idle'].includes(status)?'ok':status==='future'?'neutral':status==='review'?'warning':'critical';}
function issueHtml(issue){return `<a class="v36-issue ${esc(issue.severity)}" href="${esc(issue.href)}"><div><small>${issue.blockClose?'Bloquea cierre':'Continuidad'}</small><strong>${esc(issue.label)}</strong><span>${esc(issue.detail)}</span></div><b>${esc(issue.cta||'Abrir')} →</b></a>`;}
function carryHtml(rows){return rows.length?`<div class="v36-carry">${rows.map(row=>`<a href="${esc(row.href)}"><strong>${esc(row.label)}</strong><span>${esc(row.detail)}</span></a>`).join('')}</div>`:'<p class="v36-empty">No hay pendientes del cierre anterior que sigan abiertos hoy.</p>';}

function controlHtml(state){
  const top=state.issues.slice(0,3),tone=stateClass(state.status);
  return `<section class="v36-shell v36-control" data-daily-close-v36 data-surface="control"><div class="v36-head"><div><p class="eyebrow">Cierre diario · V3.6</p><h2>¿Qué falta para terminar bien el día?</h2><p>Control muestra la continuidad y el estado del último cierre. La evidencia detallada y la acción de cerrar permanecen en Operación.</p></div><span class="v36-state ${tone}">${esc(state.label)}</span></div><div class="v36-metrics"><article><small>Pendientes visibles</small><strong>${state.issues.length}</strong><span>${state.blocking.length} bloquean el cierre</span></article><article><small>Último cierre</small><strong>${state.close?esc(state.close.status==='CLOSED_EXCEPTION'?'Con excepciones':'Registrado'):'No registrado'}</strong><span>${state.close?esc(new Date(state.close.createdAt).toLocaleString('es-CO',{timeZone:'America/Bogota'})):'Abrir Operación para cerrar'}</span></article><article><small>Continuidad</small><strong>${state.carryover.length}</strong><span>Ítems que pueden seguir vivos mañana</span></article></div>${top.length?`<div class="v36-issues">${top.map(issueHtml).join('')}</div>`:'<div class="v36-empty strong">No hay bloqueos detectados con la evidencia accesible desde Control.</div>'}<a class="v36-primary-link" href="operacion.html#cierre-diario">Abrir cierre diario en Operación →</a></section>`;
}

function operationHtml(state){
  const tone=stateClass(state.status),previous=carryoverFromPrevious(state.date),week=weeklySummary(state.date),canClose=!['future'].includes(state.status);
  const buttonLabel=state.status==='closed'?'Registrar actualización de cierre':state.status==='idle'?'Registrar día sin actividad':state.blocking.length?'Cerrar con excepciones':'Cerrar jornada';
  return `<section id="cierre-diario" class="v36-shell v36-operation" data-daily-close-v36 data-surface="operation"><div class="v36-head"><div><p class="eyebrow">Cierre diario y continuidad · V3.6</p><h2>Resolver, justificar y cerrar sin borrar la historia.</h2><p>La cola enlaza hechos existentes. Cerrar no modifica pedidos, inventario, compras ni Finanzas; sólo registra el estado de la jornada y qué quedó vivo para continuidad.</p></div><span class="v36-state ${tone}">${esc(state.label)}</span></div><div class="v36-metrics"><article><small>Controles que bloquean</small><strong>${state.blocking.length}</strong><span>${state.blocking.length?'Requieren evidencia o justificación':'No hay bloqueos actuales'}</span></article><article><small>Pendientes de continuidad</small><strong>${state.carryover.length}</strong><span>No impiden un cierre limpio si la evidencia del día está completa</span></article><article><small>Hechos del día</small><strong>${state.facts.orders+state.facts.measurements+state.facts.purchases}</strong><span>${state.facts.evidence} evidencia(s) adicional(es)</span></article><article><small>Cierres · 7 días</small><strong>${week.closed}/7</strong><span>${week.exceptions} con excepciones</span></article></div>${state.stale?'<div class="v36-alert warning"><strong>El cierre registrado quedó desactualizado.</strong><span>La evidencia o los pendientes cambiaron después del cierre. Registra una actualización para conservar la trazabilidad.</span></div>':''}<div class="v36-grid"><article class="v36-card"><header><div><small>Qué requiere atención</small><h3>Cola accionable</h3></div><span>${state.issues.length} señal(es)</span></header>${state.issues.length?`<div class="v36-issues">${state.issues.map(issueHtml).join('')}</div>`:'<p class="v36-empty strong">No hay pendientes detectados para esta fecha.</p>'}</article><article class="v36-card"><header><div><small>Arrastre inteligente</small><h3>Lo del cierre anterior que sigue abierto</h3></div></header>${carryHtml(previous)}<p class="v36-rule">Sólo reaparece un pendiente si su identificador sigue presente en la evidencia actual. Un problema resuelto no se copia al día siguiente.</p></article></div><div class="v36-grid"><article class="v36-card"><header><div><small>Registrar cierre</small><h3>${esc(state.date)} · ${esc(state.label)}</h3></div></header>${state.close?`<div class="v36-close-meta"><strong>${esc(state.close.createdBy||'Usuario local')}</strong><span>${esc(new Date(state.close.createdAt).toLocaleString('es-CO',{timeZone:'America/Bogota'}))}${state.close.note?` · ${esc(state.close.note)}`:''}</span></div>`:''}<form id="v36-close-form"><label><span>Justificación / nota de cierre</span><textarea name="note" rows="3" maxlength="500" placeholder="Obligatoria si cierras con excepciones"></textarea></label><div class="v36-actions"><button type="submit" ${canClose?'':'disabled'}>${esc(buttonLabel)}</button><button type="button" data-v36-print>Imprimir resumen</button><button type="button" data-v36-export>Exportar JSON</button></div></form><p class="v36-rule">Si quedan controles bloqueantes puedes cerrar únicamente con una justificación explícita. La corrección genera un evento nuevo mediante <code>supersedes</code>.</p></article><article class="v36-card"><header><div><small>Lectura semanal</small><h3>Disciplina de cierre, no otro dashboard</h3></div></header><div class="v36-week"><div><strong>${week.closed}</strong><span>días con cierre registrado</span></div><div><strong>${week.exceptions}</strong><span>cierres con excepciones</span></div></div>${week.recurrent.length?`<div class="v36-recurrent">${week.recurrent.map(row=>`<div><strong>${esc(row.label)}</strong><span>${row.count} aparición(es) en cierres de la semana</span></div>`).join('')}</div>`:'<p class="v36-empty">Todavía no hay señales recurrentes suficientes en los cierres registrados.</p>'}</article></div></section>`;
}

function ensureMount(){
  const page=document.body?.dataset?.page;if(!['control','operacion'].includes(page))return null;
  let mount=document.getElementById('daily-close-v36');if(mount)return mount;
  mount=document.createElement('div');mount.id='daily-close-v36';mount.dataset.dailyCloseSurface=page==='control'?'control':'operation';
  const anchor=document.getElementById('management-pulse-v35')||document.getElementById('business-pulse-v34')||document.getElementById('control-v30');
  if(anchor)anchor.insertAdjacentElement('afterend',mount);return mount;
}

function printSummary(state){
  let sheet=document.getElementById('v36-print-sheet');if(sheet)sheet.remove();sheet=document.createElement('section');sheet.id='v36-print-sheet';
  sheet.innerHTML=`<h1>El Errante · cierre diario ${esc(state.date)}</h1><p><strong>Estado:</strong> ${esc(state.label)}</p><p><strong>Registrado por:</strong> ${esc(state.close?.createdBy||'—')}</p><h2>Hechos</h2><ul><li>Pedidos: ${state.facts.orders}</li><li>Mediciones: ${state.facts.measurements}</li><li>Recepciones: ${state.facts.purchases}</li><li>Evidencias adicionales: ${state.facts.evidence}</li></ul><h2>Pendientes</h2>${state.issues.length?`<ul>${state.issues.map(row=>`<li><strong>${esc(row.label)}</strong> — ${esc(row.detail)}</li>`).join('')}</ul>`:'<p>Sin pendientes detectados.</p>'}<h2>Nota de cierre</h2><p>${esc(state.close?.note||'Sin nota')}</p>`;
  document.body.appendChild(sheet);window.print();setTimeout(()=>sheet.remove(),500);
}
function exportSummary(state){
  const payload={version:VERSION,exportedAt:new Date().toISOString(),state,weekly:weeklySummary(state.date)};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`el-errante-cierre-${state.date}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

let lastState=null,queued=false;
function render(){const mount=ensureMount();if(!mount)return;const state=dayState();lastState=state;mount.innerHTML=mount.dataset.dailyCloseSurface==='control'?controlHtml(state):operationHtml(state);document.documentElement.dataset.dailyCloseVersion=VERSION;}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
function bind(){
  document.addEventListener('submit',event=>{if(event.target.id!=='v36-close-form')return;event.preventDefault();const fd=new FormData(event.target);try{closeDay({date:selectedDate(),note:fd.get('note')});render();}catch(error){alert(error.message||'No fue posible registrar el cierre.');}});
  document.addEventListener('click',event=>{if(event.target.closest('[data-v36-print]')&&lastState)printSummary(lastState);if(event.target.closest('[data-v36-export]')&&lastState)exportSummary(lastState);});
}
function start(){bind();render();ACTIVE_EVENTS.forEach(name=>window.addEventListener(name,schedule));window.addEventListener('storage',schedule);}

window.EL_ERRANTE_DAILY_CLOSE_V36={version:VERSION,key:KEY,history,activeClose,issueQueue,dayState,closeDay,carryoverFromPrevious,weeklySummary};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
