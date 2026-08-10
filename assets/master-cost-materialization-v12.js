(()=>{
  'use strict';

  const VERSION='1.2.0';
  const EVENTS_KEY='ee_v12_cost_materialization_events';
  const PURCHASES_KEY='ee_v24_material_purchases';
  const PROPOSALS_KEY='ee_v11_cost_proposal_events';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  const target=document.querySelector('#master-cost-materialization-v12');
  const EPSILON=1e-9;

  const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const writeEvents=events=>localStorage.setItem(EVENTS_KEY,JSON.stringify(events));
  const esc=value=>String(value??'').replace(/[&<>'\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:4}).format(Number(value)||0);
  const nowISO=()=>new Date().toISOString();
  const id=()=>`STD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const actorDefault=()=>{try{const s=JSON.parse(sessionStorage.getItem('ee_v31_session')||'{}');return String(s.displayName||s.username||'Usuario local').trim();}catch(_){return 'Usuario local';}};
  const proposalsApi=()=>window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11||null;

  function events(){const rows=readJSON(EVENTS_KEY,[]);return Array.isArray(rows)?rows:[];}
  function material(id){return DATA?.materials?.find(item=>item.id===id)||null;}
  function materialEvents(materialId){return events().filter(event=>event.type==='MATERIALIZED'&&event.materialId===materialId).sort((a,b)=>(Number(a.toRevision)||0)-(Number(b.toRevision)||0)||String(a.at).localeCompare(String(b.at)));}
  function materializationForProposal(proposalId){return events().find(event=>event.type==='MATERIALIZED'&&event.proposalId===proposalId)||null;}
  function currentStandard(materialId){
    const base=material(materialId);
    if(!base)return null;
    const history=materialEvents(materialId);
    const latest=history[history.length-1]||null;
    return {
      materialId:base.id,
      materialName:base.name,
      unit:base.unit,
      baselineCost:Number(base.cost)||0,
      cost:latest?Number(latest.toCost)||0:Number(base.cost)||0,
      revision:latest?Number(latest.toRevision)||0:0,
      source:latest?'MATERIALIZED':'CANONICAL_BASELINE',
      lastEvent:latest,
      history
    };
  }
  function effectiveStandardCost(materialId){return currentStandard(materialId)?.cost??0;}
  function effectiveMaterial(materialId){
    const base=material(materialId);
    const standard=currentStandard(materialId);
    if(!base||!standard)return null;
    return {...base,cost:standard.cost,baselineCost:standard.baselineCost,standardRevision:standard.revision,standardSource:standard.source,materializationEventId:standard.lastEvent?.eventId||null};
  }
  function effectiveProductCost(product,seen=new Set()){
    if(!product)return 0;
    const sku=String(product.sku||product.name||'');
    if(seen.has(sku))return 0;
    const next=new Set(seen);next.add(sku);
    let total=0;
    (product.bom||[]).forEach(line=>{total+=(Number(line.qty)||0)*effectiveStandardCost(String(line.materialId));});
    (product.components||[]).forEach(line=>{const child=DATA?.products?.find(item=>item.sku===line.sku);total+=(Number(line.qty)||0)*effectiveProductCost(child,next);});
    return total;
  }
  function snapshot(){
    return {
      purchasesText:localStorage.getItem(PURCHASES_KEY),
      proposalsText:localStorage.getItem(PROPOSALS_KEY),
      materials:JSON.stringify(DATA?.materials?.map(item=>({id:item.id,cost:item.cost,status:item.status,confidence:item.confidence}))||[]),
      products:JSON.stringify(DATA?.products||[])
    };
  }
  function integrityUnchanged(before){
    return before.purchasesText===localStorage.getItem(PURCHASES_KEY)
      && before.proposalsText===localStorage.getItem(PROPOSALS_KEY)
      && before.materials===JSON.stringify(DATA?.materials?.map(item=>({id:item.id,cost:item.cost,status:item.status,confidence:item.confidence}))||[])
      && before.products===JSON.stringify(DATA?.products||[]);
  }
  function append(event){
    const before=snapshot();
    const log=events();
    log.push(Object.freeze({...event}));
    writeEvents(log);
    if(!integrityUnchanged(before))throw new Error('La materialización alteró hechos, propuestas o fuente canónica');
    return event;
  }
  function approvedProposals(){
    const api=proposalsApi();
    if(!api)return [];
    return api.proposals().filter(proposal=>proposal.lastEvent?.type==='APPROVED');
  }
  function pendingApproved(){return approvedProposals().filter(proposal=>!materializationForProposal(proposal.proposalId));}
  function isStale(proposal){
    const current=currentStandard(proposal.materialId);
    return !current||Math.abs(Number(current.cost)-Number(proposal.standardCost))>EPSILON;
  }
  function materializeProposal(proposalId,input={}){
    const api=proposalsApi();
    if(!api)throw new Error('Motor de propuestas V1.1 no disponible');
    const proposal=api.proposalState(proposalId);
    if(!proposal)throw new Error('Propuesta inexistente');
    if(proposal.lastEvent?.type!=='APPROVED')throw new Error('Sólo una propuesta aprobada puede materializarse');
    if(materializationForProposal(proposalId))throw new Error('La propuesta ya fue materializada');
    const current=currentStandard(proposal.materialId);
    if(!current)throw new Error('Material maestro inexistente');
    if(Math.abs(Number(current.cost)-Number(proposal.standardCost))>EPSILON)throw new Error('Propuesta obsoleta: el estándar cambió desde que fue creada');
    const nextCost=Number(proposal.proposedCost);
    if(!(nextCost>0))throw new Error('Costo aprobado inválido');
    if(Math.abs(nextCost-current.cost)<=EPSILON)throw new Error('El costo aprobado ya coincide con el estándar vigente');
    const reason=String(input.reason||'').trim();
    if(reason.length<8)throw new Error('La materialización requiere una razón explícita');
    const actor=String(input.actor||actorDefault()).trim()||actorDefault();
    const event=append({
      eventId:id(),type:'MATERIALIZED',at:nowISO(),actor,reason,
      proposalId:proposal.proposalId,materialId:proposal.materialId,materialName:proposal.materialName,unit:proposal.unit,
      fromRevision:current.revision,toRevision:current.revision+1,baselineCost:current.baselineCost,fromCost:current.cost,toCost:nextCost,
      approvalEventId:proposal.lastEvent.eventId||null,approvedAt:proposal.lastEvent.at||null,approvedBy:proposal.lastEvent.actor||null,
      proposalCreatedAt:proposal.createdAt,proposalCreatedBy:proposal.createdBy,proposalRationale:proposal.rationale,
      evidence:{...proposal.evidence}
    });
    const standard=currentStandard(proposal.materialId);
    window.dispatchEvent(new CustomEvent('ee:v12:standard-materialized',{detail:{event,standard}}));
    render();
    return {event,standard};
  }
  function standards(){return (DATA?.materials||[]).map(item=>currentStandard(item.id));}
  function statusFor(proposal){return isStale(proposal)?'Obsoleta':'Lista para materializar';}
  function pendingCards(){
    const rows=pendingApproved();
    if(!rows.length)return '<div class="md-v12-empty">No hay propuestas aprobadas pendientes de materialización.</div>';
    return rows.map(row=>{const current=currentStandard(row.materialId);const stale=isStale(row);return `<article class="md-v12-card" data-md-v12-proposal="${esc(row.proposalId)}"><header><div><strong>${esc(row.materialName)}</strong><small>${esc(row.materialId)} · ${esc(row.proposalId)}</small></div><span class="md-v12-status ${stale?'stale':'ready'}">${statusFor(row)}</span></header><div class="md-v12-costs"><div><small>Estándar al crear</small><strong>${money(row.standardCost)}</strong></div><div><small>Vigente ahora</small><strong>${money(current?.cost)}</strong></div><div><small>Aprobado</small><strong>${money(row.proposedCost)}</strong></div></div><p>${esc(row.rationale)}</p><div class="md-v12-evidence"><strong>Evidencia preservada</strong><span>${esc(row.evidence?.date||'—')} · ${esc(row.evidence?.supplier||'Sin proveedor')} · ${money(row.evidence?.unitCost)}</span></div>${stale?'<div class="md-v12-warning"><strong>No se puede aplicar.</strong> El estándar cambió después de crear esta propuesta. Debe abrirse una propuesta nueva contra el estándar vigente.</div>':`<button type="button" data-md-v12-materialize="${esc(row.proposalId)}">Materializar estándar aprobado</button>`}</article>`;}).join('');
  }
  function historyTable(){
    const rows=events().slice().reverse();
    if(!rows.length)return '<div class="md-v12-empty">Aún no hay cambios de estándar materializados.</div>';
    return `<div class="md-v12-table-wrap"><table class="md-v12-table"><thead><tr><th>Material</th><th>Versión</th><th>Antes</th><th>Después</th><th>Decisión</th></tr></thead><tbody>${rows.map(row=>`<tr><td><strong>${esc(row.materialName)}</strong><small>${esc(row.materialId)}</small></td><td>r${esc(row.fromRevision)} → r${esc(row.toRevision)}<small>${esc(String(row.at).slice(0,16).replace('T',' '))}</small></td><td>${money(row.fromCost)}</td><td>${money(row.toCost)}</td><td>${esc(row.actor)}<small>${esc(row.reason)}</small></td></tr>`).join('')}</tbody></table></div>`;
  }
  function standardTable(){
    const rows=standards();
    return `<div class="md-v12-table-wrap"><table class="md-v12-table"><thead><tr><th>Material</th><th>Baseline</th><th>Estándar efectivo</th><th>Revisión</th><th>Origen</th></tr></thead><tbody>${rows.map(row=>`<tr data-md-v12-standard="${esc(row.materialId)}"><td><strong>${esc(row.materialName)}</strong><small>${esc(row.materialId)} · ${esc(row.unit)}</small></td><td>${money(row.baselineCost)}</td><td><strong>${money(row.cost)}</strong></td><td>r${esc(row.revision)}</td><td><span class="md-v12-source ${row.source==='MATERIALIZED'?'materialized':'baseline'}">${row.source==='MATERIALIZED'?'Materializado':'Baseline canónico'}</span></td></tr>`).join('')}</tbody></table></div>`;
  }
  function askReason(){return String(window.prompt('Razón de materialización (obligatoria)')||'').trim();}
  function bind(){target?.querySelectorAll('[data-md-v12-materialize]').forEach(button=>button.addEventListener('click',()=>{const reason=askReason();if(reason)materializeProposal(button.dataset.mdV12Materialize,{reason});}));}
  function render(){
    if(!target||!DATA)return;
    const materialized=events().length;
    const pending=pendingApproved().length;
    target.innerHTML=`<section class="md-v12-shell" data-master-materialization-version="${VERSION}"><header class="md-v12-head"><div><p class="eyebrow">Datos maestros V1.2 · estándar efectivo</p><h2>Aprobar no cambia el costo. Materializar sí crea una nueva revisión trazable.</h2><p>La fuente canónica permanece inmutable. Cada materialización agrega un evento versionado que conserva el estándar anterior, el nuevo costo, la propuesta aprobada, la evidencia, el responsable y la razón.</p></div><span>Ledger append-only · ${materialized} cambio${materialized===1?'':'s'}</span></header><div class="md-v12-rule"><strong>Control de concurrencia</strong><span>Si el estándar vigente ya no coincide con el estándar contra el que nació la propuesta, la aplicación se bloquea y exige una propuesta nueva.</span></div><section class="md-v12-section"><div class="md-v12-section-head"><div><h3>Pendientes de materialización</h3><p>${pending} propuesta${pending===1?'':'s'} aprobada${pending===1?'':'s'} pendiente${pending===1?'':'s'}.</p></div></div><div class="md-v12-grid">${pendingCards()}</div></section><section class="md-v12-section"><div class="md-v12-section-head"><div><h3>Estándar efectivo</h3><p>Baseline canónico + revisiones materializadas. Este resolver será la fuente para los cálculos prospectivos posteriores.</p></div></div>${standardTable()}</section><section class="md-v12-section"><div class="md-v12-section-head"><div><h3>Historial de revisiones</h3><p>Reconstrucción completa del estándar sin borrar versiones anteriores.</p></div></div>${historyTable()}</section></section>`;
    bind();
  }

  const API=Object.freeze({version:VERSION,eventsKey:EVENTS_KEY,events,materialEvents,materializationForProposal,currentStandard,effectiveStandardCost,effectiveMaterial,effectiveProductCost,standards,pendingApproved,isStale,materializeProposal,snapshot,integrityUnchanged});
  window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12=API;
  if(target&&DATA)render();
})();