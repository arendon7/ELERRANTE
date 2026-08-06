(()=>{
  'use strict';
  const PURCHASES_KEY='ee_v24_material_purchases';
  const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const remoteReady=()=>Boolean(window.EL_ERRANTE_COMMERCE_CONFIG?.backend?.url&&window.EL_ERRANTE_COMMERCE_CONFIG?.backend?.publishableKey&&window.__EE_ADMIN_SUPABASE__);
  const purchases=()=>{try{return JSON.parse(localStorage.getItem(PURCHASES_KEY)||'[]');}catch(_){return [];}};

  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!(form instanceof HTMLFormElement)||form.id!=='ee-v25-receipt-form'||remoteReady())return;
    const fd=new FormData(form);
    const orderId=String(fd.get('orderId')||'');
    const invoice=String(fd.get('invoiceReference')||'').trim();
    const input=form.elements.invoiceReference;
    if(input instanceof HTMLInputElement)input.setCustomValidity('');
    const duplicate=purchases().some(item=>String(item.sourceOrderId||item.source_order_id||'')===orderId&&normalize(item.invoiceReference||item.invoice_reference)===normalize(invoice));
    if(!duplicate)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const message='Esta factura o remisión ya fue registrada para la orden.';
    if(input instanceof HTMLInputElement){input.setCustomValidity(message);input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});}
  },true);
})();