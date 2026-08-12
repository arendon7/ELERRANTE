(()=>{
  'use strict';

  const VERSION='3.7.4';
  const OBS_KEY='ee_v374_pilot_daily_observations';
  const ORDER_KEY='ee_v14_orders';
  const MEASURE_KEY='ee_v24_production_measurements';
  const PURCHASE_KEY='ee_v24_material_purchases';
  const CLOSE_KEY='ee_v36_daily_close_events';
  const CASH_KEY='ee_v323_cash_counts';
  const FRICTION=['workflow','data','permissions','usability','performance','other'];

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const arr=value=>Array.isArray(value)?value:[];
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const actor=()=>window.EL_ERRANTE_INTERNAL_V31?.session?.()?.displayName||'Usuario local';
  const uid=()=>`PILOT-DAY-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
  const pilot=()=>window.EL_ERRANTE_PILOT_V37;
  const isoDate=value=>String(value||'').slice(0,10);

  function eventDate(value){
    const direct=value?.date||value?.requestedDate||value?.purchaseDate||value?.purchase_date||value?.receivedDate||value?.received_date||value?.operationalDate||value?.createdAt||'';
    return isoDate(direct);
  }
  function orderDate(order){return isoDate(order?.delivery?.requestedDate||order?.requestedDate||order?.operationalDate||order?.createdAt||'');}
  function activeRows(rows){
    const list=arr(rows),superseded=new Set(list.map(row=>row?.supersedes).filter(Boolean));
    return list.filter(row=>row?.id&&!superseded.has(row.id));
  }
  function activeClose(date){
    return activeRows(read(CLOSE_KEY,[])).filter(row=>isoDate(row.date)===date).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0]||null;
  }
  function countsForDate(date){return arr(read(CASH_KEY,[])).filter(row=>isoDate(row.date)===date);}
  function observations(){return arr(read(OBS_KEY,[]));}
  function observationsForDate(date){return observations().filter(row=>row.date===date);}
  function latestObservation(date){
    const rows=observationsForDate(date),superseded=new Set(rows.map(row=>row.supersedes).filter(Boolean));
    return rows.filter(row=>!superseded.has(row.id)).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0]||null;
  }

  function periodState(date,pilotState){
    if(!pilotState||pilotState.status!=='ACTIVE')return 'PILOT_INACTIVE';
    if(!pilotState.start||!pilotState.end||date<pilotState.start||date>pilotState.end)return 'OUTSIDE_PERIOD';
    return 'IN_PERIOD';
  }

  function dayState(date=today()){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Fecha de jornada inválida.');
    const engine=pilot();
    if(!engine)throw Error('El motor del piloto V3.7 no está disponible.');
    const p=engine.pilotState();
    const period=periodState(date,p);
    const orders=arr(read(ORDER_KEY,[])).filter(order=>orderDate(order)===date);
    const measurements=arr(read(MEASURE_KEY,[])).filter(row=>eventDate(row)===date);
    const purchases=arr(read(PURCHASE_KEY,[])).filter(row=>eventDate(row)===date);
    const close=activeClose(date);
    const cashCounts=countsForDate(date);
    const pendingPayment=orders.filter(order=>['pending_payment','payment_review','rejected'].includes(String(order.status||'')));
    const delivered=orders.filter(order=>['delivered','dispatched'].includes(String(order.status||'')));
    const hasActivity=Boolean(orders.length||measurements.length||purchases.length);
    const pilotEvents=arr(engine.events?.()||[]);
    const checkpoints=pilotEvents.filter(event=>event.kind==='CHECKPOINT'&&isoDate(event.createdAt)===date);
    const observation=latestObservation(date);
    const issues=[];
    if(period==='IN_PERIOD'){
      if(pendingPayment.length)issues.push({code:'PAYMENT_OPEN',level:'attention',label:`${pendingPayment.length} pedido(s) con pago por resolver`,href:'operacion.html#pedidos'});
      if(hasActivity&&!close)issues.push({code:'DAILY_CLOSE_MISSING',level:'blocker',label:'La jornada tiene actividad y aún no tiene cierre V3.6',href:'operacion.html#cierre-diario'});
      if(close&&String(close.status||'').toUpperCase().includes('EXCEPTION'))issues.push({code:'DAILY_CLOSE_EXCEPTION',level:'attention',label:'El cierre vigente contiene excepciones',href:'operacion.html#cierre-diario'});
      if(delivered.length&&!cashCounts.length)issues.push({code:'CASH_COUNT_MISSING',level:'attention',label:'Hay pedidos entregados/despachados sin conteo de caja del día',href:'finanzas.html'});
      if(hasActivity&&!measurements.length)issues.push({code:'MEASUREMENT_EMPTY',level:'info',label:'No hay medición de producción registrada para esta fecha',href:'operacion.html#medicion'});
      if(hasActivity&&!observation)issues.push({code:'OBSERVATION_MISSING',level:'info',label:'Falta la observación operativa breve de la jornada',href:'#pilot-daily-v374'});
      if(close&&!checkpoints.length)issues.push({code:'CHECKPOINT_MISSING',level:'attention',label:'La jornada cerró pero falta checkpoint privado del piloto',href:'#pilot-daily-v374'});
    }
    let code=period;
    if(period==='IN_PERIOD'){
      if(!hasActivity)code='NO_ACTIVITY';
      else if(issues.some(x=>x.level==='blocker'))code='IN_PROGRESS';
      else if(close&&!checkpoints.length)code='READY_FOR_CHECKPOINT';
      else if(close&&checkpoints.length)code='DAY_COMPLETE';
      else code='IN_PROGRESS';
    }
    return {version:VERSION,date,pilotStatus:p.status,period,code,orders,pendingPayment,delivered,measurements,purchases,close,cashCounts,checkpoints,observation,hasActivity,issues};
  }

  function fingerprint(state){
    const payload={date:state.date,orders:state.orders.map(x=>[x.id,x.status,x.updatedAt||x.createdAt]),measurements:state.measurements.map(x=>[x.id,eventDate(x),x.createdAt]),purchases:state.purchases.map(x=>[x.id,eventDate(x),x.createdAt]),close:state.close?[state.close.id,state.close.status,state.close.createdAt]:null,cash:state.cashCounts.map(x=>[x.id,x.amount,x.createdAt]),checkpoints:state.checkpoints.map(x=>[x.id,x.createdAt])};
    return JSON.stringify(payload);
  }

  function saveObservation(input={}){
    const date=String(input.date||today()),state=dayState(date);
    if(state.period!=='IN_PERIOD')throw Error('Sólo puedes registrar observaciones dentro de un piloto activo y su periodo.');
    const note=String(input.note||'').trim();
    if(note.length<12)throw Error('Escribe una observación de al menos 12 caracteres.');
    const friction=arr(input.friction).filter(value=>FRICTION.includes(value));
    const previous=latestObservation(date);
    const row={id:uid(),version:VERSION,date,createdAt:new Date().toISOString(),actor:actor(),note,friction:[...new Set(friction)],supersedes:previous?.id||null,stateCode:state.code,stateFingerprint:fingerprint(state),snapshot:{orders:state.orders.length,pendingPayment:state.pendingPayment.length,measurements:state.measurements.length,purchases:state.purchases.length,closeId:state.close?.id||null,cashCounts:state.cashCounts.length,checkpoints:state.checkpoints.length}};
    const rows=observations();rows.push(row);write(OBS_KEY,rows);
    window.dispatchEvent(new CustomEvent('ee:pilot-daily-observation',{detail:{id:row.id,date}}));
    return row;
  }

  async function checkpointDay(date=today(),note='Checkpoint diario del piloto'){
    const state=dayState(date);
    if(state.period!=='IN_PERIOD')throw Error('El checkpoint diario sólo aplica dentro del periodo activo.');
    const text=String(note||'').trim();
    if(text.length<6)throw Error('Describe brevemente el checkpoint.');
    const result=await pilot().checkpoint({note:`${date} · ${text}`,downloadBackup:true});
    return {result,state:dayState(date)};
  }

  function exportDay(date=today()){
    const state=dayState(date),payload={format:'el-errante-pilot-day',version:VERSION,exportedAt:new Date().toISOString(),date,state:{code:state.code,pilotStatus:state.pilotStatus,hasActivity:state.hasActivity,orders:state.orders.length,pendingPayment:state.pendingPayment.length,delivered:state.delivered.length,measurements:state.measurements.length,purchases:state.purchases.length,close:state.close?{id:state.close.id,status:state.close.status,createdAt:state.close.createdAt}:null,cashCounts:state.cashCounts.map(x=>({id:x.id,date:x.date,amount:x.amount,evidence:x.evidence,createdAt:x.createdAt})),checkpoints:state.checkpoints.map(x=>({id:x.id,createdAt:x.createdAt,note:x.note||''})),issues:state.issues},observations:observationsForDate(date)};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`el-errante-piloto-jornada-${date}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return payload;
  }

  const labels={PILOT_INACTIVE:'Piloto no activo',OUTSIDE_PERIOD:'Fuera del periodo',NO_ACTIVITY:'Sin actividad registrada',IN_PROGRESS:'Jornada en curso',READY_FOR_CHECKPOINT:'Lista para checkpoint',DAY_COMPLETE:'Jornada completa'};
  const tones={PILOT_INACTIVE:'muted',OUTSIDE_PERIOD:'muted',NO_ACTIVITY:'neutral',IN_PROGRESS:'warn',READY_FOR_CHECKPOINT:'ready',DAY_COMPLETE:'ok'};
  function metric(label,value,detail=''){return `<article class="v374-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></article>`}
  function issueHtml(issue){return `<a class="v374-issue ${esc(issue.level)}" href="${esc(issue.href)}"><span>${esc(issue.label)}</span><b>${issue.level==='blocker'?'Resolver':issue.level==='attention'?'Revisar':'Ver'}</b></a>`}
  function frictionHtml(selected=[]){return FRICTION.map(value=>`<label><input type="checkbox" name="friction" value="${value}" ${selected.includes(value)?'checked':''}><span>${esc({workflow:'Flujo',data:'Datos',permissions:'Permisos',usability:'Usabilidad',performance:'Rendimiento',other:'Otro'}[value])}</span></label>`).join('')}

  function template(){return `<section class="v37-panel v374-panel" id="pilot-daily-v374" data-pilot-daily-v374>
    <div class="v37-panel-head"><div><p class="eyebrow">1 · Jornada real</p><h2>Qué falta hoy para que el piloto produzca evidencia útil</h2></div><span>V${VERSION}</span></div>
    <div class="v374-toolbar"><label>Fecha<input id="v374-date" type="date" value="${today()}"></label><button type="button" class="v37-secondary" id="v374-refresh">Actualizar</button><button type="button" class="v37-secondary" id="v374-intake">Registrar pedido</button></div>
    <div id="v374-message" class="v37-message"></div>
    <div id="v374-state"></div>
    <div class="v374-columns">
      <div><h3>Acciones de jornada</h3><div class="v374-links"><a href="operacion.html#pedidos">Pedidos y pagos</a><a href="operacion.html#medicion">Producción / medición</a><a href="operacion.html#compras">Compras / recepciones</a><a href="operacion.html#cierre-diario">Cierre diario V3.6</a><a href="finanzas.html">Caja / Finanzas</a></div></div>
      <div><h3>Observación operativa</h3><form id="v374-observation-form"><textarea name="note" minlength="12" required placeholder="Qué funcionó, dónde hubo fricción o qué dato faltó hoy."></textarea><div class="v374-friction">${frictionHtml()}</div><button class="v37-primary" type="submit">Guardar observación append-only</button></form></div>
    </div>
    <div class="v374-bottom"><label>Nota de checkpoint<input id="v374-checkpoint-note" value="Checkpoint al cierre de la jornada"></label><button class="v37-primary" type="button" id="v374-checkpoint">Checkpoint + respaldo privado</button><button class="v37-secondary" type="button" id="v374-export">Exportar jornada</button></div>
    <p class="v374-foot"><strong>No duplica hechos.</strong> Pedidos, producción, compras, cierres y caja siguen viviendo en sus módulos originales; esta capa sólo los lee, orienta el siguiente paso y conserva aprendizaje operativo.</p>
  </section>`}

  function message(text,error=false){const node=document.querySelector('#v374-message');if(node){node.textContent=text;node.dataset.type=error?'error':'ok'}}
  function currentDate(){return document.querySelector('#v374-date')?.value||today()}
  function render(){
    const node=document.querySelector('#v374-state');if(!node)return;
    try{
      const s=dayState(currentDate()),obs=s.observation;
      node.innerHTML=`<div class="v374-summary ${tones[s.code]||'neutral'}"><div><small>Estado de jornada</small><strong>${esc(labels[s.code]||s.code)}</strong><span>${esc(s.date)} · piloto ${esc(s.pilotStatus)}</span></div><div class="v374-metrics">${metric('Pedidos',s.orders.length,`${s.pendingPayment.length} pago(s) abiertos`)}${metric('Mediciones',s.measurements.length,'producción registrada')}${metric('Compras',s.purchases.length,'hechos del día')}${metric('Cierre',s.close?'Sí':'No',s.close?.status||'sin cierre')}${metric('Caja',s.cashCounts.length,'conteo(s)')}${metric('Checkpoint',s.checkpoints.length,'respaldo(s)')}</div></div><div class="v374-issues">${s.issues.length?s.issues.map(issueHtml).join(''):'<div class="v374-clear"><strong>Sin brechas detectadas por la guía diaria.</strong><span>Continúa operando en los módulos fuente y conserva el checkpoint cuando corresponda.</span></div>'}</div>${obs?`<div class="v374-observation"><small>Última observación vigente</small><strong>${esc(obs.actor)} · ${esc(obs.createdAt)}</strong><p>${esc(obs.note)}</p><span>${obs.friction.length?esc(obs.friction.join(' · ')):'Sin fricción clasificada'}${obs.supersedes?' · corrige una observación anterior':''}</span></div>`:''}`;
      const form=document.querySelector('#v374-observation-form');if(form){form.elements.note.value=obs?.note||'';[...form.querySelectorAll('[name="friction"]')].forEach(input=>input.checked=Boolean(obs?.friction?.includes(input.value)))}
      document.documentElement.dataset.pilotDailyState=s.code;
    }catch(error){node.innerHTML=`<div class="v37-blocker"><strong>No fue posible calcular la jornada</strong><p>${esc(error.message)}</p></div>`}
  }

  function bind(){
    document.querySelector('#v374-refresh')?.addEventListener('click',render);
    document.querySelector('#v374-date')?.addEventListener('change',render);
    document.querySelector('#v374-intake')?.addEventListener('click',()=>{const target=document.querySelector('[data-pilot-intake-v372]');if(target){target.scrollIntoView({behavior:'smooth',block:'start'});target.querySelector('input,select,textarea')?.focus()}});
    document.querySelector('#v374-observation-form')?.addEventListener('submit',event=>{event.preventDefault();try{const data=new FormData(event.currentTarget),row=saveObservation({date:currentDate(),note:data.get('note'),friction:data.getAll('friction')});message(`Observación guardada: ${row.id}`);render()}catch(error){message(error.message,true)}});
    document.querySelector('#v374-checkpoint')?.addEventListener('click',async()=>{try{const note=document.querySelector('#v374-checkpoint-note')?.value||'';await checkpointDay(currentDate(),note);message('Checkpoint registrado y respaldo privado generado.');render()}catch(error){message(error.message,true)}});
    document.querySelector('#v374-export')?.addEventListener('click',()=>{try{exportDay(currentDate());message('Jornada exportada.')}catch(error){message(error.message,true)}});
    ['ee:pilot-order-created','ee:order:status-changed','ee:v323-cash-count','ee:v36-close-changed','ee:pilot-daily-observation'].forEach(name=>window.addEventListener(name,render));
  }

  function mount(){
    const shell=document.querySelector('#pilot-operations-v37 .v37-shell');
    if(!shell||shell.querySelector('[data-pilot-daily-v374]'))return false;
    const intake=shell.querySelector('[data-pilot-intake-v372]');
    if(intake)intake.insertAdjacentHTML('afterend',template());else shell.insertAdjacentHTML('afterbegin',template());
    document.documentElement.dataset.pilotDailyVersion=VERSION;bind();render();return true;
  }
  function init(){if(mount())return;const root=document.querySelector('#pilot-operations-v37');if(root)new MutationObserver(()=>mount()).observe(root,{childList:true,subtree:true});setTimeout(mount,100);setTimeout(mount,500)}

  window.EL_ERRANTE_PILOT_DAILY_V374={VERSION,OBS_KEY,FRICTION,observations,observationsForDate,latestObservation,dayState,saveObservation,checkpointDay,exportDay,mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();