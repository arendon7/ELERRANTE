(()=>{
  'use strict';

  const PACK_URL='documentacion/sesiones/aire-y-tiempo-paquete-comite-v09.json';
  const PRODUCT_ID='harina-aire-y-tiempo';
  const CRITICAL_GATES=[
    'formula','costo_unitario','precio_final','margen','empaque_fisico','etiqueta','sanitario',
    'vida_util','conservacion_validada','capacidad_produccion','inventario_real','cobertura_real',
    'instrucciones_validadas'
  ];
  const PLACEHOLDER_PATTERN=/(por asignar|pendiente de asignar|nombre pendiente|sin definir|n\/a)/i;

  let pack=null;
  let lastForm=null;

  const escapeHTML=value=>String(value??'').replace(/[&<>'"]/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[char]);

  function lines(value){
    return String(value||'').split(/\n+/).map(item=>item.trim()).filter(Boolean);
  }

  function message(form,text,type='ok'){
    const box=form?.querySelector('[data-act-message]');
    if(!box) return;
    box.className=`form-alert ${type}`;
    box.textContent=text;
    box.style.display='block';
  }

  function gateRow(form,key){
    return form.querySelector(`[data-act-gate="${CSS.escape(key)}"]`);
  }

  function currentProductId(form){
    return form?.querySelector('[data-product-select]')?.value||'';
  }

  function validateNames(form){
    const problems=[];
    const participants=lines(form.elements.participants?.value);
    const signatories=lines(form.elements.signatories?.value);
    if(participants.some(item=>PLACEHOLDER_PATTERN.test(item))) problems.push('Reemplaza los marcadores genéricos de participantes por nombres reales.');
    if(signatories.some(item=>PLACEHOLDER_PATTERN.test(item))) problems.push('Reemplaza los marcadores genéricos de firmantes por nombres reales.');
    return problems;
  }

  function guidedIssues(form){
    if(!form||currentProductId(form)!==PRODUCT_ID) return [];
    const issues=[...validateNames(form)];
    const reviewed=[...form.querySelectorAll('[data-act-gate]')].filter(row=>row.querySelector('[data-gate-reviewed]')?.checked);

    reviewed.forEach(row=>{
      const label=row.querySelector('.act-gate-title strong')?.textContent?.trim()||row.dataset.actGate;
      const status=row.querySelector('[data-gate-status]')?.value||'pendiente';
      const evidence=(row.querySelector('[data-gate-evidence]')?.value||'').trim();
      const condition=(row.querySelector('[data-gate-condition]')?.value||'').trim();
      const validUntil=row.querySelector('[data-gate-valid-until]')?.value||'';
      if(!evidence) issues.push(`${label}: registra evidencia real o una referencia verificable.`);
      if(status==='aprobado_con_condiciones'&&!condition) issues.push(`${label}: describe la condición de aprobación.`);
      if(status==='aprobado_con_condiciones'&&!validUntil) issues.push(`${label}: define la vigencia de la condición.`);
    });

    if(form.elements.overall_decision?.value==='aprobado'){
      const unresolved=CRITICAL_GATES.filter(key=>{
        const row=gateRow(form,key);
        if(!row?.querySelector('[data-gate-reviewed]')?.checked) return true;
        return !['aprobado','no_aplica'].includes(row.querySelector('[data-gate-status]')?.value||'pendiente');
      });
      if(unresolved.length) issues.push(`La aprobación general exige resolver las ${unresolved.length} puertas críticas pendientes.`);
    }
    return issues;
  }

  function readiness(form){
    const rows=[...form.querySelectorAll('[data-act-gate]')];
    const reviewed=rows.filter(row=>row.querySelector('[data-gate-reviewed]')?.checked);
    const withEvidence=reviewed.filter(row=>(row.querySelector('[data-gate-evidence]')?.value||'').trim());
    const namedParticipants=lines(form.elements.participants?.value).filter(item=>!PLACEHOLDER_PATTERN.test(item));
    const namedSignatories=lines(form.elements.signatories?.value).filter(item=>!PLACEHOLDER_PATTERN.test(item));
    return {
      total:rows.length,
      reviewed:reviewed.length,
      withEvidence:withEvidence.length,
      participants:namedParticipants.length,
      signatories:namedSignatories.length,
      issues:guidedIssues(form).length
    };
  }

  function updateReadiness(form){
    const panel=document.querySelector('[data-committee-readiness]');
    if(!panel||!form) return;

    if(currentProductId(form)!==PRODUCT_ID){
      const stateKey='inactive';
      if(panel.dataset.readinessState===stateKey) return;
      panel.dataset.readinessState=stateKey;
      panel.innerHTML='<p class="muted">La preparación guiada se activa al seleccionar Harina Aire y Tiempo.</p>';
      return;
    }

    const state=readiness(form);
    const stateKey=JSON.stringify(state);
    if(panel.dataset.readinessState===stateKey) return;
    panel.dataset.readinessState=stateKey;
    panel.innerHTML=`
      <div><strong>${state.reviewed}/${state.total}</strong><span>puertas revisadas</span></div>
      <div><strong>${state.withEvidence}/${Math.max(state.reviewed,1)}</strong><span>con evidencia</span></div>
      <div><strong>${state.participants}</strong><span>participantes identificados</span></div>
      <div><strong>${state.signatories}</strong><span>firmantes identificados</span></div>
      <div class="${state.issues?'committee-alert':'committee-ok'}"><strong>${state.issues}</strong><span>bloqueos de preflight</span></div>`;
  }

  function guideForGate(key){
    return pack?.gates?.[key]||null;
  }

  function decorateForm(form){
    if(!pack||!form) return;
    lastForm=form;
    form.dataset.committeePack=PRODUCT_ID;

    form.querySelectorAll('[data-act-gate]').forEach(row=>{
      if(row.querySelector('[data-committee-gate-guide]')) return;
      const guide=guideForGate(row.dataset.actGate);
      if(!guide) return;
      const details=document.createElement('details');
      details.className='committee-gate-guide';
      details.dataset.committeeGateGuide='';
      details.innerHTML=`
        <summary>Guía de preparación</summary>
        <div><p><strong>Pregunta:</strong> ${escapeHTML(guide.question)}</p>
        <p><strong>Responsable:</strong> ${escapeHTML(guide.owner_role)}</p>
        <p><strong>Evidencia esperada:</strong></p><ul>${guide.expected_evidence.map(item=>`<li>${escapeHTML(item)}</li>`).join('')}</ul>
        <p><strong>Decisión mínima:</strong> ${escapeHTML(guide.minimum_decision)}</p></div>`;
      row.append(details);
    });

    if(!form.dataset.committeeListeners){
      form.dataset.committeeListeners='true';
      form.addEventListener('input',()=>updateReadiness(form));
      form.addEventListener('change',()=>updateReadiness(form));
    }
    updateReadiness(form);
  }

  function nextStepsText(){
    return pack.initial_next_steps.map((item,index)=>`${index+1}. ${item}`).join('\n');
  }

  function applyTemplate(form){
    if(!form||!pack) return;
    const productSelect=form.querySelector('[data-product-select]');
    if(productSelect&&productSelect.value!==PRODUCT_ID){
      productSelect.value=PRODUCT_ID;
      productSelect.dispatchEvent(new Event('change',{bubbles:true}));
      setTimeout(()=>applyTemplate(document.querySelector('[data-act-form]')),160);
      return;
    }

    const assign=(name,value)=>{
      const control=form.elements[name];
      if(!control) return;
      control.value=value;
      control.dispatchEvent(new Event('input',{bubbles:true}));
      control.dispatchEvent(new Event('change',{bubbles:true}));
    };

    assign('place',pack.session.proposed_place);
    assign('objective',pack.session.objective);
    assign('scope',`${pack.session.scope}\n\nLímite: ${pack.disclaimer}`);
    assign('next_steps',nextStepsText());

    form.querySelectorAll('[data-act-variant]').forEach(input=>{
      input.checked=input.value==='EE-HAT-1000';
      input.dispatchEvent(new Event('change',{bubbles:true}));
    });

    form.querySelectorAll('[data-act-gate]').forEach(row=>{
      const reviewed=row.querySelector('[data-gate-reviewed]');
      if(reviewed) reviewed.checked=false;
      const evidence=row.querySelector('[data-gate-evidence]');
      const condition=row.querySelector('[data-gate-condition]');
      const validUntil=row.querySelector('[data-gate-valid-until]');
      if(evidence) evidence.value='';
      if(condition) condition.value='';
      if(validUntil) validUntil.value='';
    });

    form.dataset.committeeTemplateLoaded='true';
    message(form,'Paquete cargado. Se precargaron agenda lógica, alcance, 1 kg como propuesta y próximos pasos; participantes, evidencias, firmantes y aprobaciones permanecen vacíos.','ok');
    updateReadiness(form);
  }

  function rolesHTML(){
    return pack.roles_required.map(role=>`<article><strong>${escapeHTML(role.discipline)}</strong><p>${escapeHTML(role.role)}</p><span>Nombre por asignar en el acta</span></article>`).join('');
  }

  function agendaHTML(){
    return pack.session.agenda.map(item=>`<li><strong>${item.minutes} min · ${escapeHTML(item.topic)}</strong><span>${escapeHTML(item.output)}</span></li>`).join('');
  }

  function renderPanel(){
    const host=document.querySelector('#acts-app');
    if(!host||host.querySelector('[data-committee-panel]')) return;
    const hero=host.querySelector('.acts-hero');
    if(!hero) return;
    const section=document.createElement('section');
    section.className='admin-card committee-panel';
    section.dataset.committeePanel='';
    section.innerHTML=`
      <div class="committee-panel-head">
        <div><p class="eyebrow">Primera sesión guiada</p><h2>Aire y Tiempo · paquete de comité</h2><p>${escapeHTML(pack.disclaimer)}</p></div>
        <div class="button-row"><button class="btn btn-primary" type="button" data-load-committee-pack>Cargar paquete</button><a class="btn btn-outline" href="documentacion/sesiones/AIRE_Y_TIEMPO_PAQUETE_COMITE_V09.md" target="_blank" rel="noopener">Abrir guía</a><a class="btn btn-outline" href="${PACK_URL}" download>Descargar JSON</a></div>
      </div>
      <div class="committee-readiness" data-committee-readiness></div>
      <div class="committee-panel-grid">
        <details open><summary>Agenda · ${pack.session.duration_minutes} minutos</summary><ol class="committee-agenda">${agendaHTML()}</ol></details>
        <details><summary>Participantes requeridos</summary><div class="committee-roles">${rolesHTML()}</div></details>
        <details><summary>Reglas de cierre</summary><ul>${pack.preflight_rules.map(rule=>`<li>${escapeHTML(rule)}</li>`).join('')}</ul></details>
      </div>`;
    hero.insertAdjacentElement('afterend',section);
    section.querySelector('[data-load-committee-pack]')?.addEventListener('click',()=>applyTemplate(document.querySelector('[data-act-form]')));
    updateReadiness(document.querySelector('[data-act-form]'));
  }

  function interceptFinalize(event){
    const button=event.target.closest?.('[data-finalize-act]');
    if(!button) return;
    const form=button.closest('[data-act-form]');
    const issues=guidedIssues(form);
    if(!issues.length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    message(form,`No se puede finalizar: ${issues.slice(0,4).join(' ')}${issues.length>4?` Hay ${issues.length-4} bloqueos adicionales.`:''}`,'danger');
    form.querySelector('[data-act-message]')?.scrollIntoView({block:'center',behavior:'auto'});
  }

  function observeApp(){
    const host=document.querySelector('#acts-app');
    if(!host) return;
    let refreshScheduled=false;

    const refresh=()=>{
      refreshScheduled=false;
      renderPanel();
      const form=host.querySelector('[data-act-form]');
      if(!form) return;
      const guideCount=form.querySelectorAll('[data-committee-gate-guide]').length;
      const expectedGuides=Object.keys(pack.gates).length;
      if(form!==lastForm||guideCount!==expectedGuides) decorateForm(form);
    };

    const scheduleRefresh=()=>{
      if(refreshScheduled) return;
      refreshScheduled=true;
      setTimeout(refresh,0);
    };

    const observer=new MutationObserver(scheduleRefresh);
    observer.observe(host,{childList:true,subtree:true});
    refresh();
  }

  async function init(){
    const host=document.querySelector('#acts-app');
    if(!host) return;
    try{
      const response=await fetch(PACK_URL,{cache:'no-store'});
      if(!response.ok) throw new Error(`No fue posible cargar el paquete (${response.status}).`);
      pack=await response.json();
      if(pack.product_id!==PRODUCT_ID||!pack.gates||Object.keys(pack.gates).length!==17) throw new Error('El paquete de comité no cumple el contrato esperado.');
      document.addEventListener('click',interceptFinalize,true);
      observeApp();
      window.EE_AIRE_TIEMPO_COMMITTEE_V09={ready:true,source:PACK_URL,product_id:PRODUCT_ID,gates:17,version:pack.version};
    }catch(error){
      window.EE_AIRE_TIEMPO_COMMITTEE_V09={ready:false,error:error.message};
      console.error(error);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
