(()=>{
  'use strict';
  const VERSION='3.7.2';
  const ORDER_KEY='ee_v14_orders';
  const PRODUCT_KEY='ee_v14_products';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const number=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(number(value));
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const uid=()=>`EE-PILOT-${today().replaceAll('-','')}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase()}`;

  function catalog(){
    const overrides=read(PRODUCT_KEY,{});
    const products=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
    return products.map(product=>{
      const variants=Array.isArray(product.variants)?product.variants:[];
      const variant=variants[0]||{};
      const id=product.id||variant.id;
      const saved=overrides[id]||{};
      return {
        id,
        variantId:variant.id||null,
        name:product.name||product.title||variant.name||id,
        price:number(saved.price??variant.price??product.price),
        unitCost:number(saved.unitCost??product.unitCost),
        active:saved.active!==false
      };
    }).filter(item=>item.id&&item.active);
  }

  function productOptions(){
    return ['<option value="">Selecciona un producto</option>',...catalog().map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`)].join('');
  }

  function lineTemplate(index=0){
    return `<div class="v372-line" data-v372-line>
      <label>Producto<select name="productId" data-v372-product>${productOptions()}</select></label>
      <label>Cantidad<input name="quantity" type="number" min="1" step="1" value="1"></label>
      <label>Precio unitario<input name="unitPrice" type="number" min="0" step="1" value="0"></label>
      <label>Costo histórico unitario<input name="unitCost" type="number" min="0" step="1" value="0"></label>
      <div class="v372-line-total"><small>Total línea</small><strong data-v372-line-total>${money(0)}</strong></div>
      ${index?'<button type="button" class="v372-remove" data-v372-remove>Quitar</button>':''}
    </div>`;
  }

  function formTemplate(){
    const hasCatalog=catalog().length>0;
    if(!hasCatalog)return `<section class="v37-panel v372-panel" data-pilot-intake-v372><div class="v37-blocker"><strong>Catálogo no disponible</strong><p>No se puede capturar un pedido real hasta cargar el catálogo canónico.</p></div></section>`;
    return `<section class="v37-panel v372-panel" data-pilot-intake-v372>
      <div class="v37-panel-head"><div><p class="eyebrow">0 · Entrada real</p><h2>Capturar pedido recibido fuera del checkout</h2></div><span>V${VERSION}</span></div>
      <p class="v372-help">Usa esta entrada sólo durante el piloto local para pedidos recibidos por WhatsApp, teléfono o coordinación directa. No activa comercio público ni backend.</p>
      <div id="v372-message" class="v37-message"></div>
      <form id="v372-order-form">
        <div class="v372-grid">
          <label>Cliente<input name="customerName" required autocomplete="off"></label>
          <label>Teléfono / WhatsApp<input name="customerPhone" required autocomplete="off"></label>
          <label>Fecha operativa<input name="requestedDate" type="date" required value="${today()}"></label>
          <label>Estado inicial<select name="status"><option value="pending_payment">Pago pendiente</option><option value="payment_review" selected>Comprobante recibido / por revisar</option></select></label>
          <label>Ciudad<input name="city" value="Medellín" required></label>
          <label>Barrio / sector<input name="neighborhood"></label>
          <label class="v372-span-2">Dirección o punto de entrega<input name="address"></label>
          <label>Flete / entrega<input name="deliveryFee" type="number" min="0" step="1" value="0"></label>
          <label>Referencia pago<input name="paymentReference" autocomplete="off"></label>
          <label class="v372-span-2">Nota operativa<textarea name="notes" placeholder="Canal de entrada, horario, pago, coordinación u observación"></textarea></label>
        </div>
        <div class="v372-lines" id="v372-lines">${lineTemplate()}</div>
        <div class="v372-actions"><button type="button" class="v37-secondary" id="v372-add-line">Agregar producto</button><div><small>Total pedido</small><strong id="v372-total">${money(0)}</strong></div></div>
        <button class="v37-primary" type="submit">Registrar pedido real local</button>
      </form>
    </section>`;
  }

  function selectedProduct(id){return catalog().find(p=>p.id===id)||null}
  function updateLine(line,hydrate=false){
    const id=line.querySelector('[name="productId"]')?.value||'';
    const product=selectedProduct(id);
    if(hydrate&&product){
      line.querySelector('[name="unitPrice"]').value=String(product.price||0);
      line.querySelector('[name="unitCost"]').value=String(product.unitCost||0);
    }
    const quantity=Math.max(0,number(line.querySelector('[name="quantity"]')?.value));
    const price=Math.max(0,number(line.querySelector('[name="unitPrice"]')?.value));
    line.querySelector('[data-v372-line-total]').textContent=money(quantity*price);
    updateTotal();
  }
  function updateTotal(){
    const subtotal=[...document.querySelectorAll('[data-v372-line]')].reduce((sum,line)=>sum+Math.max(0,number(line.querySelector('[name="quantity"]')?.value))*Math.max(0,number(line.querySelector('[name="unitPrice"]')?.value)),0);
    const delivery=Math.max(0,number(document.querySelector('#v372-order-form [name="deliveryFee"]')?.value));
    const node=document.querySelector('#v372-total');if(node)node.textContent=money(subtotal+delivery);
  }
  function message(text,error=false){const node=document.querySelector('#v372-message');if(node){node.textContent=text;node.dataset.type=error?'error':'ok'}}

  function collectLines(){
    const lines=[...document.querySelectorAll('[data-v372-line]')].map(line=>{
      const product=selectedProduct(line.querySelector('[name="productId"]')?.value);
      const quantity=Math.max(0,number(line.querySelector('[name="quantity"]')?.value));
      const unitPrice=Math.max(0,number(line.querySelector('[name="unitPrice"]')?.value));
      const unitCost=Math.max(0,number(line.querySelector('[name="unitCost"]')?.value));
      return {product,quantity,unitPrice,unitCost};
    });
    if(!lines.length||lines.some(x=>!x.product||x.quantity<=0||x.unitPrice<=0||x.unitCost<=0))throw Error('Cada línea necesita producto, cantidad, precio y costo histórico mayores que cero.');
    const ids=lines.map(x=>x.product.id);if(new Set(ids).size!==ids.length)throw Error('No repitas el mismo producto; ajusta la cantidad en una sola línea.');
    return lines.map(x=>({
      productId:x.product.id,
      variantId:x.product.variantId,
      name:x.product.name,
      quantity:x.quantity,
      unitPrice:x.unitPrice,
      unitCost:x.unitCost,
      unit_cost_snapshot:x.unitCost,
      lineTotal:x.quantity*x.unitPrice
    }));
  }

  function createOrder(form){
    const data=new FormData(form);
    const customerName=String(data.get('customerName')||'').trim();
    const customerPhone=String(data.get('customerPhone')||'').trim();
    const requestedDate=String(data.get('requestedDate')||'').trim();
    if(customerName.length<2)throw Error('Registra el nombre del cliente.');
    if(customerPhone.length<6)throw Error('Registra un teléfono o WhatsApp válido para el piloto.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate))throw Error('Registra una fecha operativa válida.');
    const items=collectLines();
    const subtotal=items.reduce((sum,item)=>sum+item.lineTotal,0);
    const deliveryFee=Math.max(0,number(data.get('deliveryFee')));
    const now=new Date();
    const order={
      id:uid(),
      createdAt:now.toISOString(),
      month:now.toISOString().slice(0,7),
      status:String(data.get('status')||'payment_review'),
      customer:{name:customerName,phone:customerPhone,email:''},
      delivery:{city:String(data.get('city')||'').trim(),neighborhood:String(data.get('neighborhood')||'').trim(),address:String(data.get('address')||'').trim(),requestedDate,notes:String(data.get('notes')||'').trim()},
      items,
      subtotal,
      deliveryFee,
      total:subtotal+deliveryFee,
      paymentReference:String(data.get('paymentReference')||'').trim(),
      source:'pilot-local-intake-v372',
      pilotIntakeVersion:VERSION
    };
    const orders=read(ORDER_KEY,[]);orders.unshift(order);write(ORDER_KEY,orders);
    window.dispatchEvent(new CustomEvent('ee:pilot-order-created',{detail:{orderId:order.id}}));
    return order;
  }

  function bind(){
    const form=document.querySelector('#v372-order-form');if(!form)return;
    document.querySelector('#v372-add-line')?.addEventListener('click',()=>{const wrap=document.querySelector('#v372-lines');wrap.insertAdjacentHTML('beforeend',lineTemplate(wrap.children.length));});
    form.addEventListener('change',event=>{const line=event.target.closest('[data-v372-line]');if(line)updateLine(line,event.target.matches('[data-v372-product]'));if(event.target.name==='deliveryFee')updateTotal();});
    form.addEventListener('input',event=>{const line=event.target.closest('[data-v372-line]');if(line)updateLine(line,false);if(event.target.name==='deliveryFee')updateTotal();});
    form.addEventListener('click',event=>{const button=event.target.closest('[data-v372-remove]');if(!button)return;button.closest('[data-v372-line]')?.remove();updateTotal();});
    form.addEventListener('submit',event=>{event.preventDefault();try{const order=createOrder(form);message(`Pedido ${order.id} registrado localmente por ${money(order.total)}. Ahora revisa/aprueba el pago y continúa en Operación.`);form.reset();const dateField=form.elements.namedItem('requestedDate'),cityField=form.elements.namedItem('city');if(dateField)dateField.value=today();if(cityField)cityField.value='Medellín';document.querySelector('#v372-lines').innerHTML=lineTemplate();updateTotal();}catch(error){message(error.message,true)}});
  }

  function mount(){
    const shell=document.querySelector('#pilot-operations-v37 .v37-shell');if(!shell||shell.querySelector('[data-pilot-intake-v372]'))return false;
    const grids=shell.querySelectorAll('.v37-grid');const anchor=grids[0]||shell.querySelector('.v37-panel');
    anchor?.insertAdjacentHTML('afterend',formTemplate());
    document.documentElement.dataset.pilotIntakeVersion=VERSION;
    bind();return true;
  }
  function init(){if(mount())return;const root=document.querySelector('#pilot-operations-v37');if(root)new MutationObserver(()=>mount()).observe(root,{childList:true,subtree:true});setTimeout(mount,100);setTimeout(mount,500)}
  window.EL_ERRANTE_PILOT_INTAKE_V372={VERSION,catalog,createOrder,mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();