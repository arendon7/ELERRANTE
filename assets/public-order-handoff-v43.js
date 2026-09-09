(()=>{
  'use strict';

  const VERSION='4.3.0';
  const SETTINGS_KEY='ee_v14_settings';
  const CART_KEY='ee_v2_cart';
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const number=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};

  function backendReady(){
    const backend=window.EL_ERRANTE_COMMERCE_CONFIG?.backend||{};
    return Boolean(backend.url&&backend.publishableKey);
  }

  function ordering(){
    const base=window.EL_ERRANTE_COMMERCE_CONFIG?.ordering||{};
    const saved=read(SETTINGS_KEY,{})?.ordering||{};
    return backendReady()?{...saved,...base}:{...base,...saved};
  }

  function whatsapp(){
    const digits=String(ordering().supportWhatsapp||'').replace(/\D/g,'');
    return digits.length>=10?digits:'';
  }

  function cartItems(){
    const rows=read(CART_KEY,[]);
    const catalog=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
    if(!Array.isArray(rows))return [];
    return rows.map(row=>{
      const productId=row.productId||row.product_id||row.id;
      const product=catalog.find(item=>item.id===productId)||{};
      const variants=Array.isArray(product.variants)?product.variants:[];
      const variantId=row.variantId||row.variant_id||row.variant;
      const variant=variants.find(item=>item.id===variantId)||variants[0]||{};
      const quantity=Math.max(1,number(row.quantity??row.qty??1));
      const unitPrice=number(row.price??variant.price??product.price);
      return {
        name:row.name||product.name||product.title||variant.name||'Producto El Errante',
        quantity,
        unitPrice,
        lineTotal:quantity*unitPrice
      };
    }).filter(item=>item.quantity>0);
  }

  function summary(){
    const items=cartItems();
    const subtotal=items.reduce((sum,item)=>sum+item.lineTotal,0);
    const lines=['PEDIDO · EL ERRANTE',''];
    if(items.length){
      items.forEach(item=>lines.push(`${item.name} × ${item.quantity} — ${money(item.lineTotal)}`));
      lines.push('',`Total estimado: ${money(subtotal)}`);
    }else{
      lines.push('El carrito está vacío.');
    }
    lines.push(
      '',
      'Entrega y disponibilidad: por confirmar con El Errante.',
      'Este mensaje inicia la coordinación; el pedido queda confirmado únicamente cuando El Errante responda y valide disponibilidad, entrega y pago.'
    );
    return lines.join('\n');
  }

  function markup(){
    const phone=whatsapp();
    const items=cartItems();
    if(!phone){
      return '<div class="data-note ee-v43-order-handoff" data-v43-order-handoff="missing"><strong>Pedidos por WhatsApp aún no habilitados.</strong><br>Tu carrito permanece guardado. El canal comercial debe configurarse antes de poder enviarlo directamente desde esta página.</div>';
    }
    if(!items.length){
      return '<div class="data-note ee-v43-order-handoff" data-v43-order-handoff="empty"><strong>Agrega productos antes de enviar el pedido.</strong><br>Vuelve a la tienda, arma tu carrito y regresa aquí.</div>';
    }
    const href=`https://wa.me/${phone}?text=${encodeURIComponent(summary())}`;
    return `<div class="ee-v43-order-handoff" data-v43-order-handoff="ready"><p class="eyebrow">Pedido asistido · piloto</p><h3>¿Prefieres cerrar el pedido por WhatsApp?</h3><p>Enviaremos el resumen de tu carrito para que El Errante confirme disponibilidad, entrega y pago. Abrir WhatsApp no confirma el pedido por sí solo.</p><div class="button-row"><a class="btn btn-primary" data-v43-order-whatsapp href="${escapeHtml(href)}" target="_blank" rel="noopener">Enviar pedido por WhatsApp</a></div><span class="ee-v29-handoff-note">Revisa el mensaje y presiona enviar en WhatsApp. El pedido se considera confirmado sólo después de la respuesta de El Errante.</span></div>`;
  }

  function mount(){
    if((location.pathname.split('/').pop()||'').toLowerCase()!=='checkout.html')return;
    const root=document.querySelector('.ee-v29-commerce-offline');
    if(!root)return;
    const current=root.querySelector('[data-v43-order-handoff]');
    const next=markup();
    const shell=document.createElement('div');shell.innerHTML=next;
    const fresh=shell.firstElementChild;
    if(!fresh)return;
    if(current){
      if(current.outerHTML!==fresh.outerHTML)current.replaceWith(fresh);
      return;
    }
    const actions=root.querySelector('.button-row');
    if(actions)actions.insertAdjacentElement('beforebegin',fresh);else root.appendChild(fresh);
  }

  function init(){
    document.documentElement.dataset.eePilotOrderHandoff=VERSION;
    mount();
    const main=document.querySelector('main');
    if(main)new MutationObserver(mount).observe(main,{childList:true,subtree:true});
    document.addEventListener('ee:checkout-runtime',mount);
    window.addEventListener('storage',event=>{if([SETTINGS_KEY,CART_KEY].includes(event.key))mount();});
    setTimeout(mount,100);setTimeout(mount,500);setTimeout(mount,1200);
  }

  window.EL_ERRANTE_PUBLIC_ORDER_HANDOFF_V43={version:VERSION,ordering,whatsapp,cartItems,summary,mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
