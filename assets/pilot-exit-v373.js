(()=>{
  'use strict';
  const VERSION='3.7.3';
  const REVIEW_KEY='ee_v373_pilot_exit_reviews';
  const DATA_AREAS=[
    ['orders','Pedidos y estado comercial'],
    ['receipts','Comprobantes de pago'],
    ['inventory','Inventario y conteos'],
    ['production','Producción y mediciones'],
    ['procurement','Compras y recepciones'],
    ['evidence','Evidencia operativa'],
    ['dailyClose','Cierre diario'],
    ['finance','Modelo y movimientos financieros'],
    ['cash','Conteos de caja']
  ];
  const ACTION_AREAS=[
    ['approvePayment','Aprobar pagos'],
    ['inventoryCorrection','Corregir inventario'],
    ['authorizePurchase','Autorizar compras'],
    ['financeCorrection','Corregir movimientos financieros'],
    ['closeDay','Cerrar jornada'],
    ['restoreBackup','Restaurar respaldos']
  ];
  const SURFACES=[
    ['orders','Pedidos / Operación'],
    ['production','Producción'],
    ['materials','Materiales'],
    ['procurement','Abastecimiento'],
    ['dailyClose','Cierre diario'],
    ['finance','Finanzas'],
    ['pilot','Piloto / reconciliación']
  ];
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const arr=value=>Array.isArray(value)?value:[];
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const actor=()=>window.EL_ERRANTE_INTERNAL_V31?.session?.()?.displayName||'Usuario local';
  const uid=()=>`pilot-exit-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
  const reviews=()=>arr(read(REVIEW_KEY,[]));
  const latestReview=()=>reviews().at(-1)||null;
  const base=()=>window.EL_ERRANTE_PILOT_V37;
  const option=(value,label,selected='')=>`<option value="${value}" ${selected===value?'selected':''}>${label}</option>`;
  const classificationComplete=review=>review&&Object.values(review.dataPersistence||{}).every(v=>v!=='undecided')&&Object.values(review.roleNeeds||{}).every(v=>v!=='undecided')&&Object.values(review.surfaceUse||{}).every(v=>v!=='undecided');

  function normalizeMap(source,definitions,allowed){
    return Object.fromEntries(definitions.map(([key])=>[key,allowed.includes(source?.[key])?source[key]:'undecided']));
  }

  async function saveReview(input={}){
    if(!base())throw Error('El motor del piloto V3.7 no está disponible.');
    const note=String(input.note||'').trim();
    if(note.length<12)throw Error('Documenta el aprendizaje del piloto con al menos 12 caracteres.');
    const reconciliation=await base().reconciliation();
    const previous=latestReview();
    const review={
      id:uid(),
      version:VERSION,
      createdAt:new Date().toISOString(),
      actor:actor(),
      supersedes:previous?.id||null,
      reconciliationFingerprint:reconciliation.fingerprint,
      reconciliationGate:reconciliation.summary.exitGate,
      dataPersistence:normalizeMap(input.dataPersistence,DATA_AREAS,['local','shared','undecided']),
      roleNeeds:normalizeMap(input.roleNeeds,ACTION_AREAS,['single','role','undecided']),
      surfaceUse:normalizeMap(input.surfaceUse,SURFACES,['daily','occasional','unused','friction','undecided']),
      note
    };
    const ledger=reviews();ledger.push(review);write(REVIEW_KEY,ledger);
    return review;
  }

  async function decision(){
    if(!base())throw Error('El motor del piloto V3.7 no está disponible.');
    const pilot=base().pilotState(),reconciliation=await base().reconciliation(),review=latestReview();
    let code='PILOT_NOT_CLOSED',label='Piloto sin cerrar';
    if(pilot.status==='ENDED'&&!review){code='REVIEW_REQUIRED';label='Falta revisión de salida';}
    else if(pilot.status==='ENDED'&&review?.reconciliationFingerprint!==reconciliation.fingerprint){code='REVIEW_STALE';label='Revisión desactualizada';}
    else if(pilot.status==='ENDED'&&reconciliation.summary.exitGate!=='EVIDENCE_COMPLETE'){code='EVIDENCE_GAPS';label='Hay brechas por reconciliar';}
    else if(pilot.status==='ENDED'&&!classificationComplete(review)){code='DECISION_PENDING';label='Faltan clasificaciones';}
    else if(pilot.status==='ENDED'){
      const shared=Object.values(review.dataPersistence).filter(v=>v==='shared').length;
      const roles=Object.values(review.roleNeeds).filter(v=>v==='role').length;
      if(shared||roles){code='BACKEND_DESIGN_CANDIDATE';label='Candidato a diseño de persistencia';}
      else{code='LOCAL_MODEL_SUFFICIENT';label='El modelo local sigue siendo suficiente';}
    }
    const counts=review?{
      sharedData:Object.values(review.dataPersistence).filter(v=>v==='shared').length,
      roleActions:Object.values(review.roleNeeds).filter(v=>v==='role').length,
      frictionSurfaces:Object.values(review.surfaceUse).filter(v=>v==='friction').length,
      unusedSurfaces:Object.values(review.surfaceUse).filter(v=>v==='unused').length
    }:{sharedData:0,roleActions:0,frictionSurfaces:0,unusedSurfaces:0};
    return {version:VERSION,generatedAt:new Date().toISOString(),code,label,pilotStatus:pilot.status,reconciliationGate:reconciliation.summary.exitGate,reconciliationFingerprint:reconciliation.fingerprint,reviewId:review?.id||null,counts,review,reconciliation};
  }

  function download(name,text){const blob=new Blob([text],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  async function exportDecision(){const payload=await decision();download(`el-errante-piloto-salida-v373-${Date.now()}.json`,JSON.stringify(payload,null,2));return payload;}

  function dataRows(review){return DATA_AREAS.map(([key,label])=>`<label class="v373-row"><span>${esc(label)}</span><select name="data:${key}">${option('undecided','Por decidir',review?.dataPersistence?.[key])}${option('local','Puede seguir local',review?.dataPersistence?.[key])}${option('shared','Necesita persistencia compartida',review?.dataPersistence?.[key])}</select></label>`).join('')}
  function roleRows(review){return ACTION_AREAS.map(([key,label])=>`<label class="v373-row"><span>${esc(label)}</span><select name="role:${key}">${option('undecided','Por decidir',review?.roleNeeds?.[key])}${option('single','Control local suficiente',review?.roleNeeds?.[key])}${option('role','Necesita identidad / rol real',review?.roleNeeds?.[key])}</select></label>`).join('')}
  function surfaceRows(review){return SURFACES.map(([key,label])=>`<label class="v373-row"><span>${esc(label)}</span><select name="surface:${key}">${option('undecided','Por decidir',review?.surfaceUse?.[key])}${option('daily','Uso diario',review?.surfaceUse?.[key])}${option('occasional','Uso ocasional',review?.surfaceUse?.[key])}${option('friction','Se usa con fricción',review?.surfaceUse?.[key])}${option('unused','No se usó',review?.surfaceUse?.[key])}</select></label>`).join('')}

  function template(){
    const review=latestReview();
    return `<section class="v37-panel v373-panel" data-pilot-exit-v373>
      <div class="v37-panel-head"><div><p class="eyebrow">5 · Salida del piloto</p><h2>Convertir uso real en decisiones de arquitectura</h2></div><span>V${VERSION}</span></div>
      <p class="v373-help">Clasifica lo observado. Este gate no activa Supabase: sólo determina si existe evidencia suficiente para diseñar persistencia compartida, identidad y roles.</p>
      <div id="v373-message" class="v37-message"></div>
      <div id="v373-decision" class="v373-decision"></div>
      <form id="v373-form">
        <div class="v373-columns">
          <fieldset><legend>Datos</legend><p>¿Qué debe salir del navegador único?</p>${dataRows(review)}</fieldset>
          <fieldset><legend>Permisos</legend><p>¿Qué acciones requieren identidad y rol real?</p>${roleRows(review)}</fieldset>
          <fieldset><legend>Uso real</legend><p>¿Qué superficies aportaron valor durante el piloto?</p>${surfaceRows(review)}</fieldset>
        </div>
        <label class="v373-note">Aprendizaje / decisión<textarea name="note" required minlength="12" placeholder="Qué funcionó, qué sobró, qué debe persistir y por qué.">${esc(review?.note||'')}</textarea></label>
        <div class="v373-actions"><button class="v37-primary" type="submit">Registrar revisión append-only</button><button class="v37-secondary" type="button" id="v373-export">Exportar decisión</button></div>
      </form>
      <p class="v373-foot"><strong>Supabase permanece inactivo.</strong> “Candidato a diseño” autoriza estudiar la arquitectura; no autoriza activarla.</p>
    </section>`;
  }

  function formMap(form,prefix,definitions){return Object.fromEntries(definitions.map(([key])=>[key,String(new FormData(form).get(`${prefix}:${key}`)||'undecided')]))}
  function message(text,error=false){const node=document.querySelector('#v373-message');if(node){node.textContent=text;node.dataset.type=error?'error':'ok'}}
  async function renderDecision(){const node=document.querySelector('#v373-decision');if(!node)return;try{const value=await decision();node.dataset.gate=value.code;node.innerHTML=`<div><small>Gate de persistencia</small><strong>${esc(value.label)}</strong><span>${esc(value.code)}</span></div><div class="v373-metrics"><span><b>${value.counts.sharedData}</b> datos compartidos</span><span><b>${value.counts.roleActions}</b> acciones con rol</span><span><b>${value.counts.frictionSurfaces}</b> superficies con fricción</span><span><b>${value.counts.unusedSurfaces}</b> no usadas</span></div>`}catch(error){node.innerHTML=`<div class="v37-blocker">${esc(error.message)}</div>`}}
  function bind(){
    const form=document.querySelector('#v373-form');if(!form)return;
    form.addEventListener('submit',async event=>{event.preventDefault();try{await saveReview({dataPersistence:formMap(form,'data',DATA_AREAS),roleNeeds:formMap(form,'role',ACTION_AREAS),surfaceUse:formMap(form,'surface',SURFACES),note:new FormData(form).get('note')});message('Revisión registrada sin reescribir la anterior.');await renderDecision()}catch(error){message(error.message,true)}});
    document.querySelector('#v373-export')?.addEventListener('click',()=>exportDecision().then(()=>message('Decisión exportada.')).catch(error=>message(error.message,true)));
  }
  function mount(){const shell=document.querySelector('#pilot-operations-v37 .v37-shell');if(!shell||shell.querySelector('[data-pilot-exit-v373]'))return false;const footer=shell.querySelector('.v37-foot');if(footer)footer.insertAdjacentHTML('beforebegin',template());else shell.insertAdjacentHTML('beforeend',template());document.documentElement.dataset.pilotExitVersion=VERSION;bind();renderDecision();return true}
  function init(){if(mount())return;const root=document.querySelector('#pilot-operations-v37');if(root)new MutationObserver(()=>mount()).observe(root,{childList:true,subtree:true});setTimeout(mount,100);setTimeout(mount,500)}

  window.EL_ERRANTE_PILOT_EXIT_V373={VERSION,REVIEW_KEY,DATA_AREAS,ACTION_AREAS,SURFACES,reviews,latestReview,saveReview,decision,exportDecision,mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();