(()=>{
  'use strict';

  const STORAGE_KEY='ee_v09_offer_governance';
  const BASE_TO_COMMITTEE={
    'Aprobado base':'aprobado',
    'Referencia aprobada':'aprobado',
    'En revisión':'en_revision',
    'Pendiente de validación':'en_revision',
    'Provisional demo':'en_revision',
    'Pendiente':'pendiente'
  };
  const STATUS_LABELS={
    pendiente:'Pendiente',en_prueba:'En prueba',en_revision:'En revisión',
    aprobado_con_condiciones:'Aprobado con condiciones',aprobado:'Aprobado',descartado:'Descartado'
  };

  function governance(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'?value:{};
    }catch{
      return {};
    }
  }

  function saveGovernance(state){
    const next={...state,schema:'ee-offer-governance-v09',updated_at:new Date().toISOString()};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
    return next;
  }

  function selectedProductId(studio){
    return studio.querySelector('tr.selected[data-offer-product]')?.dataset.offerProduct||'';
  }

  function statusGroup(status){
    if(status==='aprobado') return 'ok';
    if(['en_prueba','en_revision','aprobado_con_condiciones'].includes(status)) return 'review';
    if(status==='descartado') return 'off';
    return 'pending';
  }

  function arrangeMobileDetail(studio){
    if(!window.matchMedia('(max-width:760px)').matches) return;
    const detail=studio.querySelector('[data-offer-detail]');
    const gates=detail?.querySelector('.offer-gates');
    const form=detail?.querySelector('.offer-governance-form');
    const gateHeading=gates?.previousElementSibling;
    if(!detail||!gates||!form||!gateHeading) return;
    if(form.nextElementSibling!==gateHeading) detail.insertBefore(form,gateHeading);
  }

  function applyTranslation(){
    const studio=document.querySelector('[data-offer-studio-v09]');
    if(!studio) return;
    arrangeMobileDetail(studio);
    const productId=selectedProductId(studio);
    if(!productId) return;
    const saved=governance().products?.[productId]?.gates||{};
    studio.querySelectorAll('.offer-gate[data-gate]').forEach(row=>{
      const key=row.dataset.gate;
      if(saved[key]?.status) return;
      const base=(row.querySelector('small')?.textContent||'').replace(/^Base:\s*/,'').trim();
      const select=row.querySelector('[data-gate-status]');
      const translated=BASE_TO_COMMITTEE[base];
      if(select&&translated&&[...select.options].some(option=>option.value===translated)) select.value=translated;
    });
  }

  function persistForm(form){
    const studio=form.closest('[data-offer-studio-v09]');
    const productId=studio?selectedProductId(studio):'';
    if(!studio||!productId) return;

    const formData=Object.fromEntries(new FormData(form).entries());
    const gates={};
    studio.querySelectorAll('.offer-gate[data-gate]').forEach(row=>{
      gates[row.dataset.gate]={
        status:row.querySelector('[data-gate-status]')?.value||'pendiente',
        evidence:(row.querySelector('[data-gate-evidence]')?.value||'').trim(),
        updated_at:new Date().toISOString()
      };
    });

    let state=governance();
    state.products=state.products||{};
    state.products[productId]={
      ...(state.products[productId]||{}),
      ...formData,
      gates,
      updated_at:new Date().toISOString()
    };
    state=saveGovernance(state);

    const status=formData.overall_status||'pendiente';
    const label=STATUS_LABELS[status]||status.replaceAll('_',' ');
    studio.querySelectorAll('.offer-status').forEach(chip=>{
      const inSelectedRow=chip.closest(`tr[data-offer-product="${CSS.escape(productId)}"]`);
      const inDetail=chip.closest('[data-offer-detail]');
      if(!inSelectedRow&&!inDetail) return;
      chip.className=`offer-status ${statusGroup(status)}`;
      chip.textContent=label;
    });

    const approved=Object.values(state.products||{}).filter(product=>product.overall_status==='aprobado').length;
    const approvedKpi=studio.querySelector('[data-kpi-approved]');
    if(approvedKpi) approvedKpi.textContent=String(approved);

    const message=form.querySelector('.offer-save-status');
    if(message) message.textContent='Decisión guardada únicamente en este navegador.';
    form.dataset.savedAt=new Date().toISOString();
  }

  function init(){
    const host=document.querySelector('#studio-app');
    if(!host) return;

    const observer=new MutationObserver(()=>queueMicrotask(applyTranslation));
    observer.observe(host,{childList:true,subtree:true});
    applyTranslation();

    host.addEventListener('click',event=>{
      const button=event.target.closest('.offer-governance-form button[type="submit"]');
      if(!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      persistForm(button.closest('.offer-governance-form'));
    },true);

    host.addEventListener('submit',event=>{
      const form=event.target.closest('.offer-governance-form');
      if(!form) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      persistForm(form);
    },true);

    window.matchMedia('(max-width:760px)').addEventListener?.('change',applyTranslation);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
