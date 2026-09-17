(()=>{
  'use strict';
  const VERSION='4.2.5';

  function reconcile(){
    if(document.body?.dataset.page!=='admin')return;
    const root=document.getElementById('admin-dynamic');
    if(!root)return;
    const accountLabel=root.querySelector('label[for="ee-bank-account"]');
    if(accountLabel&&accountLabel.textContent!=='Número de cuenta')accountLabel.textContent='Número de cuenta';
    root.querySelectorAll('.ee-v14-card h2').forEach(title=>{
      if(/Datos bancarios visibles en checkout/i.test(title.textContent||''))title.textContent='Datos de transferencia visibles en checkout';
    });
  }

  function init(){
    if(document.body?.dataset.page!=='admin')return;
    const root=document.getElementById('admin-dynamic');
    if(!root)return;
    new MutationObserver(reconcile).observe(root,{childList:true,subtree:true,characterData:true});
    reconcile();
    document.documentElement.dataset.adminPaymentTruthVersion=VERSION;
  }

  window.EL_ERRANTE_ADMIN_PAYMENT_TRUTH=Object.freeze({version:VERSION,reconcile});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();