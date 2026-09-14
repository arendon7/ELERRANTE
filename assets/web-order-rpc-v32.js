(()=>{
  'use strict';
  const VERSION='3.2.0';
  const REQUEST_KEY='ee_v32_checkout_request_id';
  const CART_KEY='ee_v2_cart';
  const guard=()=>window.EE_PUBLIC_COMMERCE_GUARD_V29||null;
  const config=()=>window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const client=()=>window.__EE_SUPABASE__||null;
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const readCart=()=>{try{const rows=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return Array.isArray(rows)?rows:[];}catch(_){return [];}};
  const safeName=name=>String(name||'comprobante').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-120)||'comprobante';

  function requestId(){
    let id='';
    try{id=localStorage.getItem(REQUEST_KEY)||'';}catch(_){/* noop */}
    if(!id){
      id=crypto.randomUUID();
      try{localStorage.setItem(REQUEST_KEY,id);}catch(_){/* noop */}
    }
    return id;
  }

  function itemsPayload(){
    return readCart().map(row=>({
      product_id:String(row.productId||row.product_id||row.id||'').trim(),
      variant_id:String(row.variantId||row.variant_id||row.variant||'').trim(),
      quantity:Math.max(1,Number(row.quantity??row.qty??1)||1)
    })).filter(row=>row.product_id);
  }

  async function ensureAnonymousSession(db){
    const current=await db.auth.getSession();
    if(current?.error)throw current.error;
    let session=current?.data?.session||null;
    if(!session){
      const signed=await db.auth.signInAnonymously();
      if(signed?.error)throw signed.error;
      session=signed?.data?.session||null;
    }
    if(!session?.user?.id)throw new Error('No fue posible crear la sesión segura del pedido.');
    if(session.user.is_anonymous===false)throw new Error('El checkout requiere una sesión shopper aislada.');
    return session;
  }

  function humanError(error){
    const message=String(error?.message||error||'');
    if(/commerce is not enabled/i.test(message))return 'La compra online todavía no está habilitada para el piloto.';
    if(/commercial price not approved/i.test(message))return 'Uno de los productos todavía no tiene precio comercial aprobado.';
    if(/delivery policy not approved|delivery quote required|delivery tariff not approved/i.test(message))return 'Todavía no existe una tarifa de entrega aprobada para este destino.';
    if(/payment configuration is not ready/i.test(message))return 'Los datos reales de transferencia todavía no están completos.';
    if(/anonymous|sign.?in/i.test(message))return 'No fue posible iniciar la sesión segura del pedido. La compra sigue protegida.';
    return 'No pudimos registrar el pedido de forma segura. No se realizó ningún cobro.';
  }

  async function uploadReceipt(db,session,orderId,file){
    if(!file)return false;
    const max=10*1024*1024;
    if(file.size>max)throw new Error('El comprobante supera 10 MB.');
    const allowed=new Set(['image/jpeg','image/png','application/pdf']);
    if(!allowed.has(file.type))throw new Error('El comprobante debe ser JPG, PNG o PDF.');
    const path=`${session.user.id}/${orderId}/${Date.now()}-${safeName(file.name)}`;
    const bucket=config().backend?.receiptBucket||'payment-receipts';
    const uploaded=await db.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type});
    if(uploaded?.error)throw uploaded.error;
    const metadata=await db.from('payment_receipts').insert({
      order_id:orderId,
      owner_id:session.user.id,
      storage_path:path,
      status:'pending'
    });
    if(metadata?.error)throw metadata.error;
    return true;
  }

  function success(form,result,receiptAttached){
    try{localStorage.removeItem(CART_KEY);localStorage.removeItem(REQUEST_KEY);}catch(_){/* noop */}
    const root=form.closest('.form-card')||form;
    root.innerHTML=`<div class="ee-v14-order-success"><p class="eyebrow">Pedido recibido</p><h2>La referencia ya quedó registrada.</h2><p>Referencia: <strong>${escapeHtml(result.order_id)}</strong></p><p>Total confirmado por el servidor: <strong>${money(result.total)}</strong></p><p>${receiptAttached?'El comprobante privado quedó vinculado y pasará a revisión.':'El pedido quedó pendiente de comprobante.'}</p><p class="ee-v14-help">Subtotal ${money(result.subtotal)} · Entrega ${money(result.delivery_fee)}</p><a class="btn btn-primary" href="cuenta.html?order=${encodeURIComponent(result.order_id)}" style="margin-top:18px">Consultar pedido</a></div>`;
    document.querySelector('#checkout-lines')?.replaceChildren();
    window.dispatchEvent(new CustomEvent('ee:web-order-created',{detail:{orderId:result.order_id,total:result.total,version:VERSION}}));
  }

  async function submit(event,form){
    event.preventDefault();
    event.stopImmediatePropagation();
    const db=client();
    const commerce=guard();
    if(!db||!commerce?.connected?.())return;

    const errorBox=form.querySelector('#ee-checkout-error');
    const button=form.querySelector('button[type="submit"]');
    if(errorBox)errorBox.textContent='';
    if(button){button.disabled=true;button.textContent='Confirmando precio y pedido…';}
    try{
      const items=itemsPayload();
      if(!items.length)throw new Error('Tu carrito está vacío.');
      const data=new FormData(form);
      const session=await ensureAnonymousSession(db);
      const payload={
        client_request_id:requestId(),
        customer_name:String(data.get('name')||'').trim(),
        customer_email:String(data.get('email')||'').trim(),
        customer_phone:String(data.get('phone')||'').trim(),
        city:String(data.get('city')||'').trim(),
        neighborhood:String(data.get('neighborhood')||'').trim(),
        address:String(data.get('address')||'').trim(),
        requested_date:String(data.get('requestedDate')||'').trim()||null,
        delivery_notes:String(data.get('notes')||'').trim()||null,
        items
      };
      const created=await db.rpc('create_web_order_v32',{p_payload:payload});
      if(created?.error)throw created.error;
      const result=created?.data||{};
      if(!result.order_id)throw new Error('El servidor no devolvió referencia de pedido.');
      const receipt=form.querySelector('#ee-receipt')?.files?.[0]||null;
      const receiptAttached=await uploadReceipt(db,session,result.order_id,receipt);
      success(form,result,receiptAttached);
    }catch(error){
      console.error(error);
      if(errorBox)errorBox.textContent=humanError(error);
      if(button){button.disabled=false;button.textContent='Enviar pedido y comprobante';}
    }
  }

  function intercept(event){
    const form=event.target instanceof HTMLFormElement?event.target:null;
    if(!form||form.id!=='checkout-form-v14')return;
    if(!guard()?.connected?.())return;
    void submit(event,form);
  }

  document.addEventListener('submit',intercept,true);
  window.EL_ERRANTE_WEB_ORDER_RPC_V32=Object.freeze({version:VERSION,itemsPayload,requestId});
})();
