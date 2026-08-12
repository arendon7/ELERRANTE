(()=>{'use strict';
const VERSION='3.7.4.1';
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
function pilotState(){return window.EL_ERRANTE_PILOT_V37?.pilotState?.()||{status:'NOT_STARTED',label:'No iniciado',period:null}}
function setDisabled(el,disabled){if(!el)return;el.disabled=!!disabled;el.setAttribute('aria-disabled',disabled?'true':'false')}
function note(container,text,kind='info'){
  if(!container)return;
  let el=container.querySelector('[data-v3741-readiness-note]');
  if(!el){el=document.createElement('p');el.dataset.v3741ReadinessNote='';el.className='v3741-readiness-note';container.append(el)}
  if(el.dataset.kind!==kind)el.dataset.kind=kind;
  if(el.textContent!==text)el.textContent=text;
}
function apply(){
  const root=qs('#pilot-operations-v37');if(!root)return;
  document.documentElement.dataset.pilotReadinessVersion=VERSION;
  const state=pilotState(),active=state.status==='ACTIVE';
  const form=qs('#v37-start-form');
  if(form){
    qsa('#v37-start-form input,#v37-start-form textarea,#v37-start-form button').forEach(el=>setDisabled(el,active));
    form.dataset.pilotState=state.status;
    if(active) note(form,`Piloto activo ${state.period?.start||''} → ${state.period?.end||''}. El preflight queda bloqueado hasta cerrar este periodo.`,'locked');
    else if(state.status==='ENDED') note(form,'El piloto anterior está cerrado. Puedes iniciar un nuevo periodo cuando corresponda.','ready');
    else note(form,'Completa los cinco controles antes de iniciar el primer periodo real.','ready');
  }
  const checkpoint=qs('#v37-checkpoint'),end=qs('#v37-end'),checkpointNote=qs('#v37-checkpoint-note'),endNote=qs('#v37-end-note');
  [checkpoint,end,checkpointNote,endNote].forEach(el=>setDisabled(el,!active));
  const checkpointPanel=checkpoint?.closest('.v37-panel');
  if(checkpointPanel){
    checkpointPanel.dataset.pilotState=state.status;
    note(checkpointPanel,active?'Piloto activo: checkpoints y cierre habilitados.':'Inicia un piloto para habilitar checkpoints y cierre.',active?'ready':'locked');
  }
}
function boot(){
  const root=qs('#pilot-operations-v37');if(!root)return;
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})};
  apply();
  const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('storage',e=>{if(e.key==='ee_v37_pilot_events')schedule()});
}
window.EL_ERRANTE_PILOT_READINESS_V3741={VERSION,apply,pilotState};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();