(()=>{
  'use strict';
  const VERSION='2.9.0';
  const config=()=>window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const connected=()=>Boolean(config()?.backend?.url&&config()?.backend?.publishableKey);
  const checkoutMarkup=`<div class="ee-v29-commerce-offline"><p class="eyebrow">Compra online todavía no activada</p><h2>Tu carrito está listo. El canal que debe recibir el pedido todavía no.</h2><p>Este sitio no tiene un backend comercial conectado ni datos de pago públicos validados. Por eso no te pediremos dirección, comprobante ni datos personales para guardar una “solicitud” que solo existiría en este navegador.</p><div class="data-note"><strong>Qué sí puedes hacer ahora</strong><br>Revisar productos, construir el carrito, consultar preparación y cobertura. Cuando el canal comercial esté conectado, este mismo paso podrá confirmar el pedido de forma real.</div><div class="button-row"><a class="btn btn-dark" href="tienda.html">Volver a la tienda</a><a class="btn btn-outline" href="cobertura.html">Consultar cobertura</a></div></div>`;
  const accountMarkup=`<div class="form-card ee-v29-account-offline"><p class="eyebrow">Seguimiento online todavía no activado</p><h2>No vamos a mostrar un estado local como si viniera de El Errante.</h2><p>Mientras el backend comercial permanezca desconectado, esta página no consulta pedidos reales. Cuando el canal esté activo, la referencia y el correo permitirán consultar únicamente la información pública de seguimiento.</p><a class="btn btn-dark" href="tienda.html">Volver a la tienda</a></div>`;
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const number=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);

  function setText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
  function readCart(){try{const cart=JSON.parse(localStorage.getItem('ee_v2_cart')||'[]');return Array.isArray(cart)?cart:[];}catch(_){return [];}}

  function cartItems(){
    const catalog=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
    return readCart().map(row=>{
      const productId=row.productId||row.product_id||row.id;
      const product=catalog.find(item=>item.id===productId)||{};
      const variants=Array.isArray(product.variants)?product.variants:[];
      const variantId=row.variantId||row.variant_id||row.variant;
      const variant=variants.find(item=>item.id===variantId)||variants[0]||{};
      const quantity=Math.max(1,number(row.quantity??row.qty??1));
      const unitPrice=number(row.price??variant.price??product.price);
      return {productId,variantId:variant.id||variantId||'',name:row.name||product.name||product.title||variant.name||'Producto El Errante',quantity,unitPrice,lineTotal:quantity*unitPrice};
    });
  }

  function renderCheckoutSummary(){
    const lines=document.querySelector('#checkout-lines');
    const subtotalNode=document.querySelector('#checkout-subtotal');
    const totalNode=document.querySelector('#checkout-total');
    if(!lines||!subtotalNode||!totalNode)return;
    const items=cartItems();
    const subtotal=items.reduce((sum,item)=>sum+item.lineTotal,0);
    const signature=JSON.stringify(items.map(item=>[item.productId,item.variantId,item.name,item.quantity,item.unitPrice,item.lineTotal]));
    if(lines.dataset.v29CartSignature!==signature){
      lines.innerHTML=items.length
        ? items.map(item=>`<div class="summary-row ee-v29-summary-line"><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong>${money(item.lineTotal)}</strong></div>`).join('')
        : '<p class="muted ee-v29-empty-cart">Tu carrito está vacío.</p>';
      lines.dataset.v29CartSignature=signature;
    }
    setText(subtotalNode,money(subtotal));
    setText(totalNode,money(subtotal));
  }

  function checkoutPreview(){
    if(document.body?.dataset?.page!=='checkout'||connected())return;
    document.documentElement.dataset.eePublicCommerce='not-connected';
    const form=document.querySelector('#checkout-form-v14,#checkout-form');
    if(form&&!form.querySelector('.ee-v29-commerce-offline')){
      form.dataset.v29CommerceGuard='true';
      form.innerHTML=checkoutMarkup;
    }
    setText(document.querySelector('main h1'),'Revisa tu selección. Confirmaremos cuando el canal esté conectado.');
    setText(document.querySelector('main .lead'),'El carrito y el total pueden revisarse aquí. La compra online permanece desactivada hasta que exista un canal capaz de recibir el pedido, validar el pago y coordinar la entrega fuera de este dispositivo.');
    setText(document.querySelector('.checkout-summary .summary-row:last-of-type span'),'Total estimado');
    renderCheckoutSummary();
  }

  function accountPreview(){
    if(document.body?.dataset?.page!=='cuenta'||connected())return;
    document.documentElement.dataset.eePublicCommerce='not-connected';
    const content=document.querySelector('#account-content');
    if(content&&!content.querySelector('.ee-v29-account-offline')){
      content.dataset.v29CommerceGuard='true';
      content.innerHTML=accountMarkup;
    }
    setText(document.querySelector('main h1'),'Seguimiento real cuando exista una fuente real.');
    setText(document.querySelector('main .lead'),'El seguimiento público se habilitará cuando los pedidos estén sincronizados con el backend comercial. Hasta entonces no usamos registros de este navegador como si fueran estados confirmados.');
  }

  function apply(){checkoutPreview();accountPreview();}
  document.addEventListener('submit',event=>{
    if(connected())return;
    if(event.target?.matches?.('#checkout-form,#checkout-form-v14')){
      event.preventDefault();
      event.stopImmediatePropagation();
      checkoutPreview();
    }
  },true);

  function init(){
    apply();
    const main=document.querySelector('main');
    if(main)new MutationObserver(apply).observe(main,{childList:true,subtree:true});
    requestAnimationFrame(apply);
    setTimeout(apply,100);
    setTimeout(apply,500);
    setTimeout(apply,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.EE_PUBLIC_COMMERCE_GUARD_V29={version:VERSION,connected,renderCheckoutSummary};
})();
