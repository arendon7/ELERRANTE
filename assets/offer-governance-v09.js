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

  function governance(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{return {}}
  }

  function applyTranslation(){
    const studio=document.querySelector('[data-offer-studio-v09]');
    if(!studio) return;
    const productId=studio.querySelector('tr.selected[data-offer-product]')?.dataset.offerProduct;
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

  function init(){
    const host=document.querySelector('#studio-app');
    if(!host) return;
    const observer=new MutationObserver(()=>queueMicrotask(applyTranslation));
    observer.observe(host,{childList:true,subtree:true});
    applyTranslation();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
