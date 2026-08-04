(()=>{
  'use strict';

  const PRODUCT_ID='harina-aire-y-tiempo';
  const CRITICAL_GATES=[
    'formula','costo_unitario','precio_final','margen','empaque_fisico','etiqueta','sanitario',
    'vida_util','conservacion_validada','capacidad_produccion','inventario_real','cobertura_real',
    'instrucciones_validadas'
  ];
  const PLACEHOLDER_PATTERN=/(por asignar|pendiente de asignar|nombre pendiente|sin definir|n\/a)/i;
  const boundButtons=new WeakSet();

  function lines(value){
    return String(value||'').split(/\n+/).map(item=>item.trim()).filter(Boolean);
  }

  function gateRow(form,key){
    return form.querySelector(`[data-act-gate="${CSS.escape(key)}"]`);
  }

  function collectIssues(form){
    if(!form||form.querySelector('[data-product-select]')?.value!==PRODUCT_ID) return [];
    const issues=[];
    const participants=lines(form.elements.participants?.value);
    const signatories=lines(form.elements.signatories?.value);
    if(participants.some(item=>PLACEHOLDER_PATTERN.test(item))) issues.push('Reemplaza los marcadores genéricos de participantes por nombres reales.');
    if(signatories.some(item=>PLACEHOLDER_PATTERN.test(item))) issues.push('Reemplaza los marcadores genéricos de firmantes por nombres reales.');

    form.querySelectorAll('[data-act-gate]').forEach(row=>{
      if(!row.querySelector('[data-gate-reviewed]')?.checked) return;
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

  function showIssues(form,issues){
    const box=form.querySelector('[data-act-message]');
    if(!box) return;
    box.className='form-alert danger';
    box.textContent=`No se puede finalizar: ${issues.slice(0,4).join(' ')}${issues.length>4?` Hay ${issues.length-4} bloqueos adicionales.`:''}`;
    box.style.display='block';
    box.scrollIntoView({block:'center',behavior:'auto'});
  }

  function beforeFinalize(event){
    const button=event.composedPath().find(node=>node?.matches?.('[data-finalize-act]'));
    if(!button) return;
    const form=button.closest('[data-act-form]');
    const issues=collectIssues(form);
    if(!issues.length) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showIssues(form,issues);
  }

  function bindButtons(root=document){
    root.querySelectorAll?.('[data-finalize-act]').forEach(button=>{
      if(boundButtons.has(button)) return;
      button.addEventListener('click',beforeFinalize,true);
      boundButtons.add(button);
    });
  }

  function init(){
    window.addEventListener('click',beforeFinalize,true);
    bindButtons();
    const host=document.querySelector('#acts-app')||document.body;
    const observer=new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(node=>{
        if(node.nodeType!==Node.ELEMENT_NODE) return;
        if(node.matches?.('[data-finalize-act]')) bindButtons(node.parentElement||document);
        else bindButtons(node);
      }));
    });
    observer.observe(host,{childList:true,subtree:true});
    window.EE_VALIDATION_ACTS_PREFLIGHT_V09={
      ready:true,
      product_id:PRODUCT_ID,
      critical_gates:CRITICAL_GATES.length,
      binding:'window-capture+button-capture'
    };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
