(()=>{
  'use strict';

  const VERSION='1.1.0';
  const EVENTS_KEY='ee_v11_cost_proposal_events';
  const PURCHASES_KEY='ee_v24_material_purchases';
  const DATA=window.EL_ERRANTE_MATERIALS_V23;
  const MASTER=window.EL_ERRANTE_MASTER_DATA_V10;
  const target=document.querySelector('#master-cost-proposals-v11');
  const TERMINAL=new Set(['APPROVED','REJECTED']);

  const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const writeEvents=events=>localStorage.setItem(EVENTS_KEY,JSON.stringify(events));
  const esc=value=>String(value??'').replace(/[&<>'\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:2}).format(Number(value)||0);
  const nowISO=()=>new Date().toISOString();
  const id=()=>`COST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const actorDefault=()=>{try{const s=JSON.parse(sessionStorage.getItem('ee_v31_session')||'{}');return String(s.displayName||s.username||'Usuario local').trim();}catch(_){return 'Usuario local';}};

  function purchases(){const rows=readJSON(PURCHASES_KEY,[]);return Array.isArray(rows)?rows:[];}
  function events(){const rows=readJSON(EVENTS_KEY,[]);return Array.isArray(rows)?rows:[];}
  function material(id){return DATA?.materials?.find(item=>item.id===id)||null;}
  function standardMaterial(id){return window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12?.effectiveMaterial(id)||material(id);}
  function purchaseId(row){return String(row.id||row.purchaseId||row.purchase_id||'');}
  function purchaseMaterial(row){return String(row.materialId||row.material_id||'');}
  function purchaseCost(row){return Number(row.unitCost??row.unit_cost)||0;}
  function purchaseSupplier(row){return String(row.supplier||row.supplier_name_snapshot||'').trim();}
  function purchaseDate(row){return String(row.receivedDate||row.received_date||row.createdAt||row.created_at||'').slice(0,10);}
  function evidenceForMaterial(materialId){return purchases().filter(row=>purchaseMaterial(row)===materialId).sort((a,b)=>purchaseDate(b).localeCompare(purchaseDate(a)));}
  function integritySnapshot(){
    return {
      purchasesText:localStorage.getItem(PURCHASES_KEY),
      materials:JSON.stringify(DATA?.materials?.map(item=>({id:item.id,cost:item.cost,status:item.status,confidence:item.confidence}))||[]),
      products:JSON.stringify(DATA?.products||[])
    };
  }
  function integrityUnchanged(before){
    return before.purchasesText===localStorage.getItem(PURCHASES_KEY)
      && before.materials===JSON.stringify(DATA?.materials?.map(item=>({id:item.id,cost:item.cost,status:item.status,confidence:item.confidence}))||[])
      && before.products===JSON.stringify(DATA?.products||[]);
  }
  function append(event){const before=integritySnapshot();const log=events();log.push(Object.freeze({...event}));writeEvents(log);if(!integrityUnchanged(before))throw new Error('La propuesta alteró hechos o estándar');return event;}
  function proposalState(proposalId){
    const log=events().filter(event=>event.proposalId===proposalId);
    if(!log.length)return null;
    const created=log.find(event=>event.type==='CREATED');
    const last=log[log.length-1];
    let status=last.type==='CREATED'?'DRAFT':last.type==='SUBMITTED'?'IN_REVIEW':last.type==='APPROVED'?'APPROVED_FOR_MATERIALIZATION':'REJECTED';
    if(last.type==='APPROVED'&&window.EL_ERRANTE_MASTER_COST_MATERIALIZATION_V12?.materializationForProposal(proposalId))status='MATERIALIZED';
    return {
      proposalId,
      materialId:created.materialId,
      materialName:created.materialName,
      unit:created.unit,
      standardCost:created.standardCost,
      proposedCost:created.proposedCost,
      evidence:created.evidence,
      rationale:created.rationale,
      createdAt:created.at,
      createdBy:created.actor,
      status,
      lastEvent:last,
      events:log
    };
  }
  function proposals(){
    const ids=[...new Set(events().map(event=>event.proposalId))];
    return ids.map(proposalState).filter(Boolean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  }
  function openForMaterial(materialId){return proposals().find(item=>item.materialId===materialId&&!TERMINAL.has(item.lastEvent.type));}
  function createProposal(input={}){
    const materialId=String(input.materialId||'').trim();
    const master=standardMaterial(materialId);
    if(!master)throw new Error('Material maestro inexistente');
    if(openForMaterial(materialId))throw new Error('Ya existe una propuesta abierta para este material');
    const proposedCost=Number(input.proposedCost);
    if(!(proposedCost>0))throw new Error('Costo propuesto inválido');
    const evidenceRows=evidenceForMaterial(materialId);
    const selected=input.evidencePurchaseId?evidenceRows.find(row=>purchaseId(row)===String(input.evidencePurchaseId)):evidenceRows[0];
    if(!selected)throw new Error('La propuesta requiere una compra observada del mismo material');
    const rationale=String(input.rationale||'').trim();
    if(rationale.length<8)throw new Error('Justificación insuficiente');
    const proposalId=id();
    append({
      eventId:id(),proposalId,type:'CREATED',at:nowISO(),actor:String(input.actor||actorDefault()).trim()||actorDefault(),
      materialId,materialName:master.name,unit:master.unit,standardCost:Number(master.cost)||0,proposedCost,
      evidence:{purchaseId:purchaseId(selected),unitCost:purchaseCost(selected),supplier:purchaseSupplier(selected),date:purchaseDate(selected)},
      rationale
    });
    return proposalState(proposalId);
  }
  function submitProposal(proposalId,input={}){
    const current=proposalState(proposalId);
    if(!current)throw new Error('Propuesta inexistente');
    if(current.lastEvent.type!=='CREATED')throw new Error('Sólo un borrador puede enviarse a revisión');
    return append({eventId:id(),proposalId,type:'SUBMITTED',at:nowISO(),actor:String(input.actor||actorDefault()).trim()||actorDefault(),note:String(input.note||'').trim()}),proposalState(proposalId);
  }
  function decideProposal(proposalId,decision,input={}){
    const current=proposalState(proposalId);
    if(!current)throw new Error('Propuesta inexistente');
    if(current.lastEvent.type!=='SUBMITTED')throw new Error('La propuesta debe estar en revisión');
    const type=String(decision||'').toUpperCase()==='APPROVE'?'APPROVED':String(decision||'').toUpperCase()==='REJECT'?'REJECTED':'';
    if(!type)throw new Error('Decisión inválida');
    const reason=String(input.reason||'').trim();
    if(reason.length<8)throw new Error('La decisión requiere una razón explícita');
    append({eventId:id(),proposalId,type,at:nowISO(),actor:String(input.actor||actorDefault()).trim()||actorDefault(),reason});
    return proposalState(proposalId);
  }
  function latestObserved(materialId){return evidenceForMaterial(materialId)[0]||null;}
  function pctDelta(base,next){return base?((next-base)/base)*100:0;}

  function statusLabel(status){return ({DRAFT:'Borrador',IN_REVIEW:'En revisión',APPROVED_FOR_MATERIALIZATION:'Aprobada para materialización',MATERIALIZED:'Materializada',REJECTED:'Rechazada'})[status]||status;}
  function statusClass(status){return status.toLowerCase().replaceAll('_','-');}
  function evidenceOptions(materialId){return evidenceForMaterial(materialId).map(row=>`<option value="${esc(purchaseId(row))}">${esc(purchaseDate(row))} · ${esc(purchaseSupplier(row)||'Sin proveedor')} · ${money(purchaseCost(row))}</option>`).join('');}
  function materialOptions(){return (DATA?.materials||[]).map(item=>`<option value="${esc(item.id)}">${esc(item.name)} · ${esc(item.id)}</option>`).join('');}
  function proposalCards(){
    const rows=proposals();
    if(!rows.length)return '<div class="md-v11-empty">No hay propuestas de cambio de costo.</div>';
    return rows.map(row=>{
      const delta=pctDelta(row.standardCost,row.proposedCost);
      const timeline=row.events.map(event=>`<li><strong>${esc(event.type)}</strong><span>${esc(event.actor)} · ${esc(event.at.slice(0,16).replace('T',' '))}</span>${event.reason?`<small>${esc(event.reason)}</small>`:''}${event.note?`<small>${esc(event.note)}</small>`:''}</li>`).join('');
      const actions=row.status==='DRAFT'?`<button type="button" data-md-v11-submit="${esc(row.proposalId)}">Enviar a revisión</button>`:row.status==='IN_REVIEW'?`<button type="button" data-md-v11-approve="${esc(row.proposalId)}">Aprobar para materializar</button><button type="button" class="secondary" data-md-v11-reject="${esc(row.proposalId)}">Rechazar</button>`:'';
      return `<article class="md-v11-card" data-md-v11-proposal="${esc(row.proposalId)}"><header><div><strong>${esc(row.materialName)}</strong><small>${esc(row.materialId)} · ${esc(row.proposalId)}</small></div><span class="md-v11-status ${statusClass(row.status)}">${esc(statusLabel(row.status))}</span></header><div class="md-v11-costs"><div><small>Estándar vigente al crear</small><strong>${money(row.standardCost)}</strong></div><div><small>Propuesto</small><strong>${money(row.proposedCost)}</strong></div><div><small>Variación</small><strong>${delta>=0?'+':''}${delta.toFixed(1)}%</strong></div></div><p>${esc(row.rationale)}</p><div class="md-v11-evidence"><strong>Evidencia observada</strong><span>${esc(row.evidence.date)} · ${esc(row.evidence.supplier||'Sin proveedor')} · ${money(row.evidence.unitCost)}</span></div>${row.status==='APPROVED_FOR_MATERIALIZATION'?'<div class="md-v11-warning"><strong>No aplicada.</strong> La aprobación autoriza una materialización futura; el estándar vigente sigue intacto.</div>':row.status==='MATERIALIZED'?'<div class="md-v11-warning"><strong>Materializada.</strong> V1.2 conserva la revisión efectiva y toda su trazabilidad.</div>':''}<details><summary>Historial (${row.events.length})</summary><ol>${timeline}</ol></details>${actions?`<div class="md-v11-actions">${actions}</div>`:''}</article>`;
    }).join('');
  }
  function render(){
    if(!target||!DATA||!MASTER)return;
    const first=DATA.materials?.[0];
    const evidence=first?latestObserved(first.id):null;
    target.innerHTML=`<section class="md-v11-shell" data-master-cost-version="${VERSION}"><header class="md-v11-head"><div><p class="eyebrow">Datos maestros V1.1 · costos</p><h2>De la evidencia a una propuesta, nunca a un cambio automático.</h2><p>Una compra observada puede sustentar un cambio de costo, pero sólo mediante propuesta, revisión y decisión explícita. Incluso aprobada, la propuesta queda pendiente de materialización y no reescribe el estándar.</p></div><span>Ledger local append-only</span></header><details class="md-v11-create"><summary>Nueva propuesta de costo</summary><form id="md-v11-form"><label><span>Material</span><select name="materialId">${materialOptions()}</select></label><label><span>Compra observada</span><select name="evidencePurchaseId">${first?evidenceOptions(first.id):''}</select></label><label><span>Costo propuesto por unidad</span><input name="proposedCost" type="number" min="0.0001" step="0.0001" value="${evidence?esc(purchaseCost(evidence)):''}" required></label><label class="wide"><span>Justificación</span><textarea name="rationale" rows="2" minlength="8" required placeholder="Por qué esta evidencia justifica revisar el estándar"></textarea></label><button type="submit">Crear borrador</button></form></details><div class="md-v11-grid">${proposalCards()}</div></section>`;
    bind();
  }
  function refreshEvidence(select){
    const form=target.querySelector('#md-v11-form');if(!form)return;
    const materialId=select.value;
    const purchaseSelect=form.elements.evidencePurchaseId;
    purchaseSelect.innerHTML=evidenceOptions(materialId);
    const latest=latestObserved(materialId);
    form.elements.proposedCost.value=latest?purchaseCost(latest):'';
  }
  function askReason(message){return String(window.prompt(message)||'').trim();}
  function bind(){
    const form=target.querySelector('#md-v11-form');
    form?.elements.materialId.addEventListener('change',event=>refreshEvidence(event.currentTarget));
    form?.addEventListener('submit',event=>{event.preventDefault();const fd=new FormData(event.currentTarget);createProposal({materialId:fd.get('materialId'),evidencePurchaseId:fd.get('evidencePurchaseId'),proposedCost:fd.get('proposedCost'),rationale:fd.get('rationale')});render();});
    target.querySelectorAll('[data-md-v11-submit]').forEach(button=>button.addEventListener('click',()=>{submitProposal(button.dataset.mdV11Submit,{note:'Enviada desde Studio'});render();}));
    target.querySelectorAll('[data-md-v11-approve]').forEach(button=>button.addEventListener('click',()=>{const reason=askReason('Razón de aprobación (obligatoria)');if(reason){decideProposal(button.dataset.mdV11Approve,'APPROVE',{reason});render();}}));
    target.querySelectorAll('[data-md-v11-reject]').forEach(button=>button.addEventListener('click',()=>{const reason=askReason('Razón de rechazo (obligatoria)');if(reason){decideProposal(button.dataset.mdV11Reject,'REJECT',{reason});render();}}));
  }

  const API=Object.freeze({version:VERSION,eventsKey:EVENTS_KEY,events,proposals,proposalState,evidenceForMaterial,createProposal,submitProposal,decideProposal,integritySnapshot,integrityUnchanged});
  window.EL_ERRANTE_MASTER_COST_PROPOSALS_V11=API;
  window.addEventListener('ee:v12:standard-materialized',render);
  if(target&&DATA&&MASTER)render();
})();