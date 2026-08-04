(()=>{
  'use strict';

  const MODEL_URL='documentacion/modelo-oferta-v09.json';
  const ACTS_KEY='ee_v09_validation_acts';
  const GOVERNANCE_KEY='ee_v09_offer_governance';
  const ACT_VERSION='0.9-draft-1';
  const GATE_LABELS={
    concepto_y_rol:'Concepto y rol',narrativa_comercial:'Narrativa comercial',visual_editorial:'Visual editorial',
    formula:'Fórmula y proceso',costo_unitario:'Costo unitario',precio_final:'Precio final',margen:'Margen',
    empaque_fisico:'Empaque físico',etiqueta:'Etiqueta',sanitario:'Sanitario',vida_util:'Vida útil',
    conservacion_validada:'Conservación validada',fotografia_fisica:'Fotografía física',
    capacidad_produccion:'Capacidad de producción',inventario_real:'Inventario real',
    cobertura_real:'Cobertura real',instrucciones_validadas:'Instrucciones validadas'
  };
  const GATE_STATUSES=['pendiente','en_prueba','en_revision','aprobado_con_condiciones','aprobado','no_aplica'];
  const DECISIONS=['pendiente','en_prueba','aprobado_con_condiciones','aprobado','descartado'];
  const STATUS_LABELS={
    pendiente:'Pendiente',en_prueba:'En prueba',en_revision:'En revisión',
    aprobado_con_condiciones:'Aprobado con condiciones',aprobado:'Aprobado',
    descartado:'Descartado',no_aplica:'No aplica',borrador:'Borrador',finalizada:'Finalizada',aplicada:'Aplicada'
  };

  const escapeHTML=value=>String(value??'').replace(/[&<>'"]/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[char]);
  const statusLabel=value=>STATUS_LABELS[value]||String(value||'').replaceAll('_',' ');
  const nowISO=()=>new Date().toISOString();
  const localDate=()=>new Date().toISOString().slice(0,10);

  function readJSON(key,fallback){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'null');
      return value??fallback;
    }catch{
      return fallback;
    }
  }

  function loadActs(){
    const value=readJSON(ACTS_KEY,[]);
    return Array.isArray(value)?value:[];
  }

  function saveActs(acts){
    localStorage.setItem(ACTS_KEY,JSON.stringify(acts));
    return acts;
  }

  function parseLines(value,fields){
    return String(value||'').split(/\n+/).map(line=>line.trim()).filter(Boolean).map(line=>{
      const parts=line.split('|').map(part=>part.trim());
      return Object.fromEntries(fields.map((field,index)=>[field,parts[index]||'']));
    });
  }

  function participantsToText(items){
    return (items||[]).map(item=>[item.name,item.discipline,item.role].filter(Boolean).join(' | ')).join('\n');
  }

  function signatoriesToText(items){
    return (items||[]).map(item=>[item.name,item.role].filter(Boolean).join(' | ')).join('\n');
  }

  function makeActId(product,date,acts){
    const prefix=(product.id||'producto').split('-').map(part=>part[0]).join('').slice(0,4).toUpperCase();
    const day=String(date||localDate()).replaceAll('-','');
    const base=`ACT-${prefix}-${day}`;
    const count=acts.filter(act=>String(act.id||'').startsWith(base)).length+1;
    return `${base}-${String(count).padStart(3,'0')}`;
  }

  function statusOptions(selected,values){
    return values.map(value=>`<option value="${value}" ${value===selected?'selected':''}>${escapeHTML(statusLabel(value))}</option>`).join('');
  }

  function defaultAct(product,acts){
    return {
      id:makeActId(product,localDate(),acts),
      version:ACT_VERSION,
      status:'borrador',
      product_id:product.id,
      product_name:product.name,
      session_date:localDate(),
      place:'Medellín',
      objective:`Revisar las puertas de lanzamiento de ${product.name} y documentar decisiones para el piloto.`,
      scope:'Sesión interna de demostración. No constituye autorización de venta, registro sanitario ni aprobación jurídica.',
      variants:(product.variants||[]).map(variant=>variant.sku),
      participants:[],
      gates:Object.fromEntries(Object.entries(product.gates||{}).map(([key,base])=>[key,{
        reviewed:false,status:normalizeBaseStatus(base),base_status:base,evidence:'',condition:'',valid_until:''
      }])),
      overall_decision:'pendiente',
      overall_conditions:'',
      next_steps:product.next_decision||'',
      signatories:[],
      created_at:nowISO(),
      updated_at:nowISO(),
      finalized_at:null,
      applied_at:null
    };
  }

  function normalizeBaseStatus(base){
    const map={aprobado_base:'aprobado',aprobado_referencia:'aprobado',en_revision:'en_revision',pendiente_validacion:'en_revision',provisional_demo:'en_revision'};
    return map[base]||'pendiente';
  }

  function validateAct(act){
    const issues=[];
    if(!act.session_date) issues.push('La fecha de la sesión es obligatoria.');
    if(!act.objective.trim()) issues.push('El objetivo es obligatorio.');
    if(!act.participants.length) issues.push('Debe existir al menos un participante.');
    if(!Object.values(act.gates||{}).some(gate=>gate.reviewed)) issues.push('Debe revisarse al menos una puerta.');
    if(!act.signatories.length) issues.push('Debe existir al menos un firmante responsable.');
    if(act.overall_decision==='pendiente') issues.push('La decisión general no puede permanecer pendiente al finalizar.');
    if(act.overall_decision==='aprobado_con_condiciones'&&!act.overall_conditions.trim()) issues.push('Una aprobación con condiciones debe describirlas.');
    return issues;
  }

  function actStatusClass(status){
    if(status==='aplicada') return 'ok';
    if(status==='finalizada') return 'review';
    return 'pending';
  }

  function reviewedGates(act){
    return Object.entries(act.gates||{}).filter(([,gate])=>gate.reviewed);
  }

  function actFromForm(form,current,product){
    const data=Object.fromEntries(new FormData(form).entries());
    const variants=[...form.querySelectorAll('[data-act-variant]:checked')].map(input=>input.value);
    const gates={};
    form.querySelectorAll('[data-act-gate]').forEach(row=>{
      const key=row.dataset.actGate;
      gates[key]={
        reviewed:Boolean(row.querySelector('[data-gate-reviewed]')?.checked),
        status:row.querySelector('[data-gate-status]')?.value||'pendiente',
        base_status:current.gates?.[key]?.base_status||product.gates?.[key]||'pendiente',
        evidence:(row.querySelector('[data-gate-evidence]')?.value||'').trim(),
        condition:(row.querySelector('[data-gate-condition]')?.value||'').trim(),
        valid_until:row.querySelector('[data-gate-valid-until]')?.value||''
      };
    });
    return {
      ...current,
      product_id:product.id,
      product_name:product.name,
      session_date:data.session_date||'',
      place:(data.place||'').trim(),
      objective:(data.objective||'').trim(),
      scope:(data.scope||'').trim(),
      variants,
      participants:parseLines(data.participants,['name','discipline','role']),
      gates,
      overall_decision:data.overall_decision||'pendiente',
      overall_conditions:(data.overall_conditions||'').trim(),
      next_steps:(data.next_steps||'').trim(),
      signatories:parseLines(data.signatories,['name','role']),
      updated_at:nowISO()
    };
  }

  function upsertAct(acts,act){
    const index=acts.findIndex(item=>item.id===act.id);
    if(index>=0) acts[index]=act;
    else acts.unshift(act);
    return saveActs(acts);
  }

  function downloadJSON(filename,value){
    const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function applyToGovernance(act){
    const governance=readJSON(GOVERNANCE_KEY,{});
    governance.products=governance.products||{};
    const current=governance.products[act.product_id]||{};
    const gates={...(current.gates||{})};
    reviewedGates(act).forEach(([key,gate])=>{
      gates[key]={
        status:gate.status,
        evidence:[gate.evidence,gate.condition?`Condición: ${gate.condition}`:'',`Acta: ${act.id}`].filter(Boolean).join(' · '),
        valid_until:gate.valid_until||'',
        source_act_id:act.id,
        updated_at:nowISO()
      };
    });
    const nextReview=reviewedGates(act).map(([,gate])=>gate.valid_until).filter(Boolean).sort()[0]||current.next_review||'';
    governance.products[act.product_id]={
      ...current,
      overall_status:act.overall_decision,
      owner:act.signatories.map(item=>item.name).filter(Boolean).join(', ')||current.owner||'',
      next_review:nextReview,
      notes:[act.overall_conditions,act.next_steps,`Aplicado desde ${act.id}`].filter(Boolean).join('\n'),
      gates,
      source_act_id:act.id,
      updated_at:nowISO()
    };
    governance.schema='ee-offer-governance-v09';
    governance.updated_at=nowISO();
    localStorage.setItem(GOVERNANCE_KEY,JSON.stringify(governance));
  }

  function previewHTML(act){
    const gates=reviewedGates(act);
    return `
      <article class="act-document" data-act-document>
        <header class="act-document-head">
          <div><p class="eyebrow">El Errante · Acta de validación</p><h2>${escapeHTML(act.product_name)}</h2></div>
          <div class="act-code"><strong>${escapeHTML(act.id)}</strong><span>Versión ${escapeHTML(act.version)}</span><span>${escapeHTML(statusLabel(act.status))}</span></div>
        </header>
        <section class="act-document-meta">
          <div><strong>Fecha</strong><span>${escapeHTML(act.session_date||'Pendiente')}</span></div>
          <div><strong>Lugar</strong><span>${escapeHTML(act.place||'Pendiente')}</span></div>
          <div><strong>Decisión</strong><span>${escapeHTML(statusLabel(act.overall_decision))}</span></div>
          <div><strong>Variantes</strong><span>${escapeHTML((act.variants||[]).join(', ')||'Sin variantes')}</span></div>
        </section>
        <section><h3>Objetivo</h3><p>${escapeHTML(act.objective||'Pendiente')}</p></section>
        <section><h3>Alcance</h3><p>${escapeHTML(act.scope||'Pendiente')}</p></section>
        <section><h3>Participantes</h3>${act.participants.length?`<table><thead><tr><th>Nombre</th><th>Disciplina</th><th>Rol</th></tr></thead><tbody>${act.participants.map(item=>`<tr><td>${escapeHTML(item.name)}</td><td>${escapeHTML(item.discipline)}</td><td>${escapeHTML(item.role)}</td></tr>`).join('')}</tbody></table>`:'<p>Sin participantes registrados.</p>'}</section>
        <section><h3>Puertas revisadas</h3>${gates.length?`<table class="act-gates-table"><thead><tr><th>Puerta</th><th>Decisión</th><th>Evidencia</th><th>Condición</th><th>Vigencia</th></tr></thead><tbody>${gates.map(([key,gate])=>`<tr><td>${escapeHTML(GATE_LABELS[key]||key)}</td><td>${escapeHTML(statusLabel(gate.status))}</td><td>${escapeHTML(gate.evidence||'—')}</td><td>${escapeHTML(gate.condition||'—')}</td><td>${escapeHTML(gate.valid_until||'—')}</td></tr>`).join('')}</tbody></table>`:'<p>No se han marcado puertas como revisadas.</p>'}</section>
        <section><h3>Condiciones generales</h3><p>${escapeHTML(act.overall_conditions||'Sin condiciones registradas.')}</p></section>
        <section><h3>Próximos pasos</h3><p>${escapeHTML(act.next_steps||'Sin próximos pasos registrados.')}</p></section>
        <section><h3>Responsables firmantes</h3><div class="act-signatures">${act.signatories.length?act.signatories.map(item=>`<div><span class="signature-line"></span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.role)}</small></div>`).join(''):'<p>Sin firmantes registrados.</p>'}</div></section>
        <footer><p>Acta de demostración generada localmente. No constituye firma electrónica, autorización sanitaria, jurídica ni comercial.</p></footer>
      </article>`;
  }

  function renderApp(model){
    const host=document.querySelector('#acts-app');
    if(!host) return;
    let acts=loadActs();
    let product=model.products.find(item=>item.id==='harina-aire-y-tiempo')||model.products[0];
    let current=defaultAct(product,acts);

    host.innerHTML=`
      <section class="admin-card acts-hero">
        <div><p class="eyebrow">Sesiones y actas · v0.9</p><h2>Decidir con evidencia, condiciones y vigencia.</h2><p>Las actas organizan el comité de producto. Permanecen en este navegador y no activan productos ni reemplazan aprobaciones regulatorias.</p></div>
        <div class="button-row"><button class="btn btn-dark" type="button" data-new-act>Nueva sesión</button><a class="btn btn-outline" href="studio.html">Volver a Studio</a></div>
      </section>
      <div class="acts-layout">
        <section class="admin-card acts-editor">
          <form data-act-form></form>
        </section>
        <aside class="admin-card acts-history">
          <div class="admin-card-head"><div><p class="eyebrow">Historial local</p><h3>Actas y borradores</h3></div><span class="demo-badge" data-act-count></span></div>
          <div data-act-history></div>
        </aside>
      </div>
      <section class="admin-card acts-preview"><div class="admin-card-head"><div><p class="eyebrow">Vista previa</p><h3>Documento de sesión</h3></div><div class="button-row"><button class="btn btn-outline btn-small" type="button" data-export-act>Exportar JSON</button><button class="btn btn-dark btn-small" type="button" data-print-act>Imprimir</button></div></div><div data-act-preview></div></section>`;

    const form=host.querySelector('[data-act-form]');
    const history=host.querySelector('[data-act-history]');
    const preview=host.querySelector('[data-act-preview]');
    const count=host.querySelector('[data-act-count]');

    function renderForm(){
      const gates=Object.entries(current.gates||{});
      form.innerHTML=`
        <div class="admin-card-head"><div><p class="eyebrow">Sesión activa</p><h3>${escapeHTML(current.id)}</h3></div><span class="offer-status ${actStatusClass(current.status)}">${escapeHTML(statusLabel(current.status))}</span></div>
        <div class="data-note">Producto piloto recomendado: Aire y Tiempo. Puedes seleccionar otra referencia sin alterar la tienda pública.</div>
        <div class="form-grid acts-main-fields">
          <div class="field"><label>Producto</label><select name="product_id" data-product-select>${model.products.map(item=>`<option value="${escapeHTML(item.id)}" ${item.id===product.id?'selected':''}>${escapeHTML(item.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Fecha</label><input name="session_date" type="date" value="${escapeHTML(current.session_date)}" required></div>
          <div class="field"><label>Lugar</label><input name="place" value="${escapeHTML(current.place)}"></div>
          <div class="field"><label>Estado del acta</label><input value="${escapeHTML(statusLabel(current.status))}" disabled></div>
          <div class="field full"><label>Objetivo</label><textarea name="objective" required>${escapeHTML(current.objective)}</textarea></div>
          <div class="field full"><label>Alcance y límites</label><textarea name="scope">${escapeHTML(current.scope)}</textarea></div>
        </div>
        <fieldset class="acts-fieldset"><legend>Variantes revisadas</legend><div class="acts-check-grid">${(product.variants||[]).map(variant=>`<label><input type="checkbox" data-act-variant value="${escapeHTML(variant.sku)}" ${current.variants.includes(variant.sku)?'checked':''}> <span><strong>${escapeHTML(variant.label)}</strong><small>${escapeHTML(variant.sku)}</small></span></label>`).join('')}</div></fieldset>
        <div class="field"><label>Participantes</label><textarea name="participants" placeholder="Nombre | Disciplina | Rol\nNombre | Disciplina | Rol">${escapeHTML(participantsToText(current.participants))}</textarea><small>Una persona por línea. Ejemplo: Ana Pérez | Operación y frío | Responsable técnico.</small></div>
        <section class="acts-gates"><div class="admin-card-head"><div><p class="eyebrow">Puertas</p><h3>Decisiones por evidencia</h3></div><span>${gates.length} puertas</span></div>${gates.map(([key,gate])=>`<div class="act-gate" data-act-gate="${escapeHTML(key)}"><label class="act-gate-title"><input type="checkbox" data-gate-reviewed ${gate.reviewed?'checked':''}><span><strong>${escapeHTML(GATE_LABELS[key]||key)}</strong><small>Base: ${escapeHTML(statusLabel(gate.base_status))}</small></span></label><select data-gate-status>${statusOptions(gate.status,GATE_STATUSES)}</select><input data-gate-evidence value="${escapeHTML(gate.evidence)}" placeholder="Evidencia o referencia"><input data-gate-condition value="${escapeHTML(gate.condition)}" placeholder="Condición o limitación"><input data-gate-valid-until type="date" value="${escapeHTML(gate.valid_until)}" aria-label="Vigencia"></div>`).join('')}</section>
        <section class="acts-decision"><p class="eyebrow">Decisión general</p><div class="form-grid"><div class="field"><label>Resultado</label><select name="overall_decision">${statusOptions(current.overall_decision,DECISIONS)}</select></div><div class="field"><label>Firmantes responsables</label><textarea name="signatories" placeholder="Nombre | Rol">${escapeHTML(signatoriesToText(current.signatories))}</textarea></div><div class="field full"><label>Condiciones generales</label><textarea name="overall_conditions">${escapeHTML(current.overall_conditions)}</textarea></div><div class="field full"><label>Próximos pasos</label><textarea name="next_steps">${escapeHTML(current.next_steps)}</textarea></div></div></section>
        <div class="acts-actions"><button class="btn btn-outline" type="button" data-save-draft>Guardar borrador</button><button class="btn btn-primary" type="button" data-finalize-act>Finalizar acta</button><button class="btn btn-dark" type="button" data-apply-act ${current.status==='finalizada'?'':'disabled'}>Aplicar al expediente</button></div>
        <div class="form-alert" data-act-message role="status"></div>`;

      form.querySelector('[data-product-select]')?.addEventListener('change',event=>{
        current=actFromForm(form,current,product);
        product=model.products.find(item=>item.id===event.target.value)||product;
        current=defaultAct(product,acts);
        renderAll();
      });
      form.querySelectorAll('input,select,textarea').forEach(control=>{
        if(control.matches('[data-product-select]')) return;
        control.addEventListener('input',()=>{
          current=actFromForm(form,current,product);
          renderPreview();
        });
        control.addEventListener('change',()=>{
          current=actFromForm(form,current,product);
          renderPreview();
        });
      });
      form.querySelector('[data-save-draft]')?.addEventListener('click',()=>{
        current={...actFromForm(form,current,product),status:'borrador'};
        acts=upsertAct(acts,current);
        showMessage('Borrador guardado únicamente en este navegador.','ok');
        renderHistory();renderPreview();
      });
      form.querySelector('[data-finalize-act]')?.addEventListener('click',()=>{
        const candidate=actFromForm(form,current,product);
        const issues=validateAct(candidate);
        if(issues.length){
          showMessage(issues.join(' '),'danger');
          return;
        }
        current={...candidate,status:'finalizada',finalized_at:nowISO()};
        acts=upsertAct(acts,current);
        renderAll();
        showMessage('Acta finalizada. Aún no ha sido aplicada al expediente.','ok');
      });
      form.querySelector('[data-apply-act]')?.addEventListener('click',()=>{
        if(current.status!=='finalizada') return;
        if(!confirm(`¿Aplicar ${current.id} al expediente local de ${current.product_name}? Esta acción no modifica la tienda pública.`)) return;
        applyToGovernance(current);
        current={...current,status:'aplicada',applied_at:nowISO(),updated_at:nowISO()};
        acts=upsertAct(acts,current);
        renderAll();
        showMessage('Acta aplicada al expediente local. La tienda y EE_DATA permanecen intactos.','ok');
      });
    }

    function showMessage(message,type='ok'){
      const box=form.querySelector('[data-act-message]');
      if(!box) return;
      box.className=`form-alert ${type}`;
      box.textContent=message;
      box.style.display='block';
    }

    function renderHistory(){
      count.textContent=`${acts.length} registros`;
      history.innerHTML=acts.length?acts.map(act=>`<button type="button" class="act-history-item ${act.id===current.id?'active':''}" data-load-act="${escapeHTML(act.id)}"><span class="offer-status ${actStatusClass(act.status)}">${escapeHTML(statusLabel(act.status))}</span><strong>${escapeHTML(act.product_name)}</strong><small>${escapeHTML(act.id)} · ${escapeHTML(act.session_date)}</small></button>`).join(''):'<p class="muted">Todavía no hay actas ni borradores guardados.</p>';
      history.querySelectorAll('[data-load-act]').forEach(button=>button.addEventListener('click',()=>{
        const found=acts.find(act=>act.id===button.dataset.loadAct);
        if(!found) return;
        current=structuredClone(found);
        product=model.products.find(item=>item.id===current.product_id)||product;
        renderAll();
      }));
    }

    function renderPreview(){
      preview.innerHTML=previewHTML(current);
    }

    function renderAll(){
      renderForm();renderHistory();renderPreview();
      window.EE_VALIDATION_ACTS_V09={ready:true,source:MODEL_URL,acts:acts.length,current_id:current.id,current_status:current.status,product_id:current.product_id};
    }

    host.querySelector('[data-new-act]')?.addEventListener('click',()=>{
      product=model.products.find(item=>item.id==='harina-aire-y-tiempo')||model.products[0];
      current=defaultAct(product,acts);
      renderAll();
    });
    host.querySelector('[data-export-act]')?.addEventListener('click',()=>downloadJSON(`${current.id}.json`,current));
    host.querySelector('[data-print-act]')?.addEventListener('click',()=>window.print());

    renderAll();
  }

  async function init(){
    const host=document.querySelector('#acts-app');
    if(!host) return;
    try{
      const response=await fetch(MODEL_URL,{cache:'no-store'});
      if(!response.ok) throw new Error(`No fue posible cargar la matriz (${response.status}).`);
      const model=await response.json();
      if(!Array.isArray(model.products)||model.products.length!==11) throw new Error('La matriz no contiene las 11 referencias esperadas.');
      renderApp(model);
    }catch(error){
      window.EE_VALIDATION_ACTS_V09={ready:false,error:error.message};
      host.innerHTML=`<div class="data-note">Actas de validación no disponibles: ${escapeHTML(error.message)}</div>`;
      console.error(error);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
