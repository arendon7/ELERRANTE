(()=>{
'use strict';
const VERSION='3.2.8';
const ROOT_ID='finance-workbench-v31';
const MONTH_KEY='ee_v327_executive_month';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0;};
const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const integer=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(n(v));
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const currentMonth=()=>today().slice(0,7);
function working(){return window.EL_ERRANTE_FINANCE_V31?.working?.()||null;}
function months(data){return [...new Set((data?.planSales||[]).map(r=>r.month).filter(Boolean))].sort();}
function selectedMonth(data){const ms=months(data);let month=sessionStorage.getItem(MONTH_KEY)||currentMonth();if(ms.length&&!ms.includes(month))month=ms[0];return month;}
function status(tone,label,detail,go){return {tone,label,detail,go};}
function readiness(data,month=selectedMonth(data)){
 const close=window.EL_ERRANTE_FINANCE_V32?.closeData?.(data,month)||null;
 const count=window.EL_ERRANTE_FINANCE_V323?.latestCount?.(month)||null;
 const procurement=window.EL_ERRANTE_FINANCE_V326?.monthSummary?.(data,month)||null;
 const future=month>currentMonth();
 const planRows=(data.planSales||[]).filter(r=>r.month===month);
 const cashRow=(data.cashFlow||[]).find(r=>r.month===month)||null;
 const quality=close?.quality||{products:(data.productCosts||[]).length,confirmed:0,pending:0,zero:0};
 const pending=(data.pending||[]).filter(Boolean);
 const checks=[];
 checks.push(planRows.length&&cashRow?status('good','Plan mensual listo',`${planRows.length} línea(s) de venta y flujo de caja presentes.`,'plan'):status('bad','Plan mensual incompleto',`${planRows.length?'Ventas presentes':'Faltan ventas'} · ${cashRow?'Caja presente':'falta flujo de caja'}.`,'plan'));
 if(quality.zero>0)checks.push(status('bad','Costos maestros incompletos',`${integer(quality.zero)} producto(s) con costo directo en cero.`,'unit'));
 else if(quality.products&&quality.confirmed<quality.products)checks.push(status('warn','Costos por validar',`${integer(quality.confirmed)}/${integer(quality.products)} costos están confirmados.`,'unit'));
 else checks.push(status('good','Costos maestros listos',`${integer(quality.confirmed)}/${integer(quality.products)} costos confirmados y ninguno en cero.`,'unit'));
 if(future)checks.push(status('neutral','COGS histórico aún no aplica','El mes es futuro; no se presenta ausencia de hechos como error.','close'));
 else if(!close?.a?.orders?.length)checks.push(status('neutral','COGS histórico sin ventas','No hay pedidos aprobados en este mes; no hay COGS real que completar.','close'));
 else if(close.a.cogs===null)checks.push(status('bad','COGS histórico incompleto',`${integer(close.a.missing)} unidad(es) vendidas sin snapshot histórico de costo.`,'close'));
 else checks.push(status('good','COGS histórico trazable',`${integer(close.a.orders.length)} pedido(s) aprobado(s) con costo histórico completo.`,'close'));
 if(future)checks.push(status('neutral','Conteo de caja aún no aplica','El mes es futuro; la caja observada no se anticipa.','cash'));
 else if(count)checks.push(status('good','Caja observada respaldada',`${count.date||month} · evidencia ${count.evidence||'registrada'}.`,'cash'));
 else checks.push(status('warn','Falta conteo de caja','La caja real no se infiere: registra un conteo observado para este mes.','cash'));
 if(!procurement)checks.push(status('neutral','Abastecimiento sin lectura','No hay una lectura de compras e inventario disponible para este mes.','procurement'));
 else if(n(procurement.unknownStock)>0)checks.push(status('warn','Conteos de stock pendientes',`${integer(procurement.unknownStock)} material(es) requeridos sin conteo físico.`,'procurement'));
 else checks.push(status('good','Stock requerido con lectura',`${integer(procurement?.ops?.orders?.length||0)} pedido(s) de compra activo(s); sin conteos requeridos faltantes.`,'procurement'));
 if(pending.length)checks.push(status('warn','Auditoría MFO con pendientes',`${integer(pending.length)} hallazgo(s) permanecen explícitos en el modelo.`,'model'));
 else checks.push(status('good','Auditoría MFO sin pendientes','El snapshot no reporta hallazgos pendientes.','model'));
 const counts=checks.reduce((acc,item)=>{acc[item.tone]=(acc[item.tone]||0)+1;return acc;},{good:0,warn:0,bad:0,neutral:0});
 const state=counts.bad?'bloqueado':counts.warn?'atencion':'listo';
 return {month,future,checks,counts,state};
}
const stateLabel=s=>s==='bloqueado'?'Requiere corrección':s==='atencion'?'Listo con pendientes':'Dato listo';
const actionLabel={plan:'Revisar preparación · Plan',unit:'Revisar preparación · Costos',close:'Revisar preparación · Cierre',cash:'Revisar preparación · Caja',procurement:'Revisar preparación · Abastecimiento',model:'Revisar preparación · Auditoría'};
function html(data){const r=readiness(data);return `<section class="v328-readiness ${r.state}" data-v328-readiness><div class="v328-summary"><div><p class="eyebrow">Preparación del dato · Finanzas V3.2.8</p><h3>${esc(stateLabel(r.state))} para ${esc(r.month)}</h3><p>Valida evidencia y completitud antes de interpretar el mes. No crea hechos ni corrige datos automáticamente.</p></div><div class="v328-counts"><span class="good">${r.counts.good} listos</span>${r.counts.warn?`<span class="warn">${r.counts.warn} atención</span>`:''}${r.counts.bad?`<span class="bad">${r.counts.bad} críticos</span>`:''}${r.counts.neutral?`<span>${r.counts.neutral} no aplica</span>`:''}</div></div><details class="v328-details"><summary>Ver controles de preparación</summary><div class="v328-checks">${r.checks.map(item=>`<article class="v328-check ${item.tone}"><div><strong>${esc(item.label)}</strong><span>${esc(item.detail)}</span></div><button type="button" data-v328-go="${esc(item.go)}">${esc(actionLabel[item.go]||'Revisar preparación')}</button></article>`).join('')}</div></details><p class="v328-rule"><strong>Regla de evidencia.</strong> “No aplica” no equivale a cero; “atención” no se completa con el plan; y un faltante crítico permanece visible hasta que exista evidencia en su fuente correspondiente.</p></section>`;}
const selectors={plan:'[data-tab="plan"]',unit:'[data-v322-unit="1"]',close:'[data-v32-close="1"]',cash:'[data-v323-cash="1"]',procurement:'[data-v326-procurement="1"]',model:'[data-tab="model"]'};
function bind(root){if(root.dataset.v328Bound)return;root.dataset.v328Bound='1';root.addEventListener('click',e=>{const button=e.target.closest('[data-v328-go]');if(!button)return;root.querySelector(selectors[button.dataset.v328Go]||'__none__')?.click();});}
function signature(data){const month=selectedMonth(data);const close=window.EL_ERRANTE_FINANCE_V32?.closeData?.(data,month)||null;const count=window.EL_ERRANTE_FINANCE_V323?.latestCount?.(month)||null;const procurement=window.EL_ERRANTE_FINANCE_V326?.monthSummary?.(data,month)||null;return JSON.stringify([month,(data.planSales||[]).filter(r=>r.month===month),(data.cashFlow||[]).find(r=>r.month===month)||null,(data.productCosts||[]).map(p=>[p.sku,p.directCost,p.status]),close?.a?.orders?.map(o=>o.id)||[],close?.a?.missing??null,count?.id||count?.date||null,procurement?.unknownStock??null,procurement?.ops?.orders?.length??null,(data.pending||[]).map(p=>[p.name,p.finding,p.status,p.priority])]);}
let decorating=false;
function decorate(force=false){if(decorating)return;decorating=true;try{const root=document.getElementById(ROOT_ID),data=working(),dashboard=root?.querySelector('[data-section="dashboard"]'),executive=dashboard?.querySelector('[data-v327-executive]');if(!root||!data||!dashboard||!executive)return;const sig=signature(data),existing=dashboard.querySelector('[data-v328-readiness]');if(force||!existing||existing.dataset.signature!==sig){existing?.remove();executive.insertAdjacentHTML('afterend',html(data));const next=dashboard.querySelector('[data-v328-readiness]');if(next)next.dataset.signature=sig;}bind(root);document.documentElement.dataset.financeReadinessVersion=VERSION;}finally{decorating=false;}}
function start(){decorate();const root=document.getElementById(ROOT_ID);if(!root)return;let queued=false;new MutationObserver(()=>{if(queued||decorating)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate();});}).observe(root,{childList:true,subtree:true});window.addEventListener('storage',()=>decorate(true));}
window.EL_ERRANTE_FINANCE_V328={version:VERSION,readiness};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();