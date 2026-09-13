(()=>{
  'use strict';
  const VERSION='4.2.3';
  const ROOT_ID='ee-v423-internal-intake';
  const RECEIPT_TYPES=new Set(['image/jpeg','image/png','application/pdf']);
  const RECEIPT_MAX=10*1024*1024;
  let rows=[];

  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const n=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n(value));
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const guard=()=>window.EL_ERRANTE_ADMIN_CONNECTIVITY||null;
  const db=()=>window.__EE_ADMIN_SUPABASE__||null;
  const connected=()=>Boolean(guard()&&db()&&guard().state===guard().states.CONNECTED);

  function canonicalRows(){
    const products=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
    return products.map(product=>{
      const variant=Array.isArray(product.variants)?product.variants[0]||{}:{};
      const id=product.id||variant.id;
      if(!id)return null;
      return {id:String(id),variantId:String(variant.id||''),name:String(product.name||product.title||variant.name||id),price:n(variant.price??product.price),unitCost:n(product.unitCost),active:product.active!==false};
    }).filter(Boolean);
  }

  async function loadRows(){
    const base=canonicalRows();
    const client=db();
    if(!client)return base.filter(row=>row.active);
    const result=await client.from('product_operations').select('product_id,product_name,sale_price,unit_cost,active').order('product_name',{ascending:true});
    if(result.error)throw result.error;
    const remote=new Map((result.data||[]).map(row=>[String(row.product_id),row]));
    const merged=base.map(row=>{
      const saved=remote.get(row.id);
      return saved?{...row,name:saved.product_name||row.name,price:n(saved.sale_price)||row.price,unitCost:n(saved.unit_cost),active:saved.active!==false}:row;
    });
    (result.data||[]).forEach(saved=>{
      const id=String(saved.product_id||'');
      if(!id||merged.some(row=>row.id===id))return;
      merged.push({id,variantId:'',name:saved.product_name||id,price:n(saved.sale_price),unitCost:n(saved.unit_cost),active:saved.active!==false});
    });
    return merged.filter(row=>row.active);
  }

  function options(){return ['<option value="">Selecciona producto</option>',...rows.map(row=>`<option value="${esc(row.id)}">${esc(row.name)}</option>`)].join('');}
  function line(index=0){return `<div class="ee-v423-line" data-v423-line style="display:grid;grid-template-columns:minmax(180px,2fr) repeat(3,minmax(110px,1fr)) auto;gap:10px;align-items:end;margin-top:10px"><label>Producto<select data-field="productId">${options()}</select></label><label>Cantidad<input data-field="quantity" type="number" min="1" step="1" value="1"></label><label>Precio unitario<input data-field="unitPrice" type="number" min="1" step="1" value="0"></label><label>Costo unitario<input data-field="unitCost" type="number" min="0" step="1" value="0"></label>${index?'<button type="button" class="btn btn-outline btn-small" data-remove-line>Quitar</button>':'<span></span>'}</div>`;}

  function template(){return `<section id="${ROOT_ID}" class="ee-v14-card" style="margin:18px 0"><p class="eyebrow">Entrada comercial conectada · V${VERSION}</p><h2>Registrar pedido recibido por WhatsApp o teléfono</h2><p class="ee-v14-help">Crea el pedido directamente en Supabase con la sesión administrativa validada. El pedido nace como pago pendiente; sólo pasa a revisión cuando existe un comprobante privado.</p><form id="ee-v423-intake-form"><div class="ee-v14-form-grid"><div class="ee-v14-field"><label>Cliente<input name="customerName" required autocomplete="name"></label></div><div class="ee-v14-field"><label>Teléfono / WhatsApp<input name="customerPhone" required autocomplete="tel"></label></div><div class="ee-v14-field"><label>Correo opcional<input name="customerEmail" type="email" autocomplete="email"></label></div><div class="ee-v14-field"><label>Canal<select name="channel"><option value="whatsapp">WhatsApp</option><option value="phone">Teléfono</option><option value="direct">Coordinación directa</option></select></label></div><div class="ee-v14-field"><label>Ciudad<input name="city" value="Medellín" required></label></div><div class="ee-v14-field"><label>Barrio / sector<input name="neighborhood"></label></div><div class="ee-v14-field full"><label>Dirección o punto de entrega<input name="address"></label></div><div class="ee-v14-field"><label>Fecha preferida<input name="requestedDate" type="date" value="${today()}"></label></div><div class="ee-v14-field"><label>Flete / entrega<input name="deliveryFee" type="number" min="0" step="1" value="0"></label></div><div class="ee-v14-field"><label>Referencia de pago<input name="paymentReference" autocomplete="off"></label></div><div class="ee-v14-field full"><label>Nota operativa<textarea name="notes" placeholder="Horario, origen del contacto, coordinación u observación"></textarea></label></div><div class="ee-v14-field full"><label>Comprobante opcional<input name="receipt" type="file" accept="image/jpeg,image/png,application/pdf"><small>JPG, PNG o PDF, máximo 10 MB. Si se adjunta, el pedido pasa a comprobante por revisar.</small></label></div></div><div id="ee-v423-lines">${line()}</div><div class="button-row" style="margin-top:12px"><button type="button" class="btn btn-outline btn-small" id="ee-v423-add-line">Agregar producto</button><strong id="ee-v423-total">${money(0)}</strong></div><div id="ee-v423-message" class="form-alert" aria-live="polite"></div><button type="submit" class="btn btn-primary" style="margin-top:14px">Registrar pedido conectado</button></form></section>`;}

  function selected(id){return rows.find(row=>row.id===id)||null;}
  function total(){const subtotal=[...document.querySelectorAll('#ee-v423-lines [data-v423-line]')].reduce((sum,node)=>sum+Math.max(0,n(node.querySelector('[data-field="quantity"]')?.value))*Math.max(0,n(node.querySelector('[data-field="unitPrice"]')?.value)),0);const fee=Math.max(0,n(document.querySelector('#ee-v423-intake-form [name="deliveryFee"]')?.value));return subtotal+fee;}
  function updateTotal(){const node=document.getElementById('ee-v423-total');if(node)node.textContent=money(total());}
  function hydrateLine(node){const product=selected(node.querySelector('[data-field="productId"]')?.value);if(!product)return;node.querySelector('[data-field="unitPrice"]').value=String(product.price||0);node.querySelector('[data-field="unitCost"]').value=String(product.unitCost||0);updateTotal();}
  function collectItems(){return [...document.querySelectorAll('#ee-v423-lines [data-v423-line]')].map(node=>{const product=selected(node.querySelector('[data-field="productId"]')?.value);const quantity=Math.max(0,n(node.querySelector('[data-field="quantity"]')?.value));const unitPrice=Math.max(0,n(node.querySelector('[data-field="unitPrice"]')?.value));const unitCost=Math.max(0,n(node.querySelector('[data-field="unitCost"]')?.value));if(!product||quantity<=0||unitPrice<=0)throw new Error('Cada línea necesita producto, cantidad y precio mayores que cero.');return {product_id:product.id,variant_id:product.variantId||null,product_name:product.name,quantity,unit_price:unitPrice,unit_cost_snapshot:unitCost};});}
  function msg(text,type=''){const node=document.getElementById('ee-v423-message');if(node){node.textContent=text;node.dataset.type=type;}}
  function safeName(name){return String(name||'comprobante').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-100);}

  async function attachReceipt(orderId,file){
    if(!file)return false;
    if(!RECEIPT_TYPES.has(file.type))throw new Error('El comprobante debe ser JPG, PNG o PDF.');
    if(file.size>RECEIPT_MAX)throw new Error('El comprobante supera 10 MB.');
    const client=db();
    const sessionResult=await client.auth.getSession();
    if(sessionResult.error)throw sessionResult.error;
    const user=sessionResult.data.session?.user;
    if(!user||user.is_anonymous)throw new Error('La sesión administrativa ya no está disponible.');
    const path=`${user.id}/${orderId}/internal-${Date.now()}-${safeName(file.name)}`;
    const upload=await client.storage.from('payment-receipts').upload(path,file,{upsert:false,contentType:file.type});
    if(upload.error)throw upload.error;
    const receipt=await client.from('payment_receipts').insert({order_id:orderId,owner_id:user.id,storage_path:path,status:'pending'});
    if(receipt.error)throw receipt.error;
    const transition=await client.rpc('transition_order_v22',{p_order_id:orderId,p_new_status:'payment_review',p_note:'Comprobante recibido desde intake conectado V4.2.3'});
    if(transition.error)throw transition.error;
    return true;
  }

  async function submit(form){
    const g=guard();
    await g.assertConnected();
    const data=new FormData(form);
    const items=collectItems();
    const payload={customer_name:String(data.get('customerName')||'').trim(),customer_phone:String(data.get('customerPhone')||'').trim(),customer_email:String(data.get('customerEmail')||'').trim(),channel:String(data.get('channel')||'direct'),city:String(data.get('city')||'').trim(),neighborhood:String(data.get('neighborhood')||'').trim(),address:String(data.get('address')||'').trim(),requested_date:String(data.get('requestedDate')||'').trim(),delivery_fee:Math.max(0,n(data.get('deliveryFee'))),payment_reference:String(data.get('paymentReference')||'').trim(),delivery_notes:String(data.get('notes')||'').trim(),items};
    const created=await db().rpc('create_internal_order_v29',{p_payload:payload});
    if(created.error)throw created.error;
    const orderId=created.data?.order_id;
    if(!orderId)throw new Error('Supabase no devolvió la referencia del pedido.');
    const file=form.elements.namedItem('receipt')?.files?.[0]||null;
    let attached=false;
    let warning='';
    if(file){
      try{attached=await attachReceipt(orderId,file);}catch(error){warning=` El pedido quedó como pago pendiente porque el comprobante no pudo adjuntarse: ${error.message}`;}
    }
    window.dispatchEvent(new CustomEvent('ee:order:status-changed',{detail:{orderId,status:attached?'payment_review':'pending_payment',source:'admin-order-intake-v423'}}));
    document.querySelector('#ee-refresh-admin')?.click();
    form.reset();
    form.elements.namedItem('city').value='Medellín';
    form.elements.namedItem('requestedDate').value=today();
    document.getElementById('ee-v423-lines').innerHTML=line();
    updateTotal();
    msg(`Pedido ${orderId} registrado en Supabase${attached?' con comprobante por revisar.':'.'}${warning}`,warning?'error':'ok');
  }

  function bind(section){
    section.addEventListener('click',event=>{if(event.target.closest('#ee-v423-add-line')){const wrap=document.getElementById('ee-v423-lines');wrap.insertAdjacentHTML('beforeend',line(wrap.children.length));return;}const remove=event.target.closest('[data-remove-line]');if(remove){remove.closest('[data-v423-line]')?.remove();updateTotal();}});
    section.addEventListener('change',event=>{const lineNode=event.target.closest('[data-v423-line]');if(lineNode&&event.target.matches('[data-field="productId"]'))hydrateLine(lineNode);updateTotal();});
    section.addEventListener('input',updateTotal);
    section.querySelector('#ee-v423-intake-form').addEventListener('submit',async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;msg('Registrando pedido…');try{await submit(event.currentTarget);}catch(error){console.error(error);msg(error.message||'No fue posible registrar el pedido.','error');}finally{button.disabled=false;}});
  }

  async function render(){
    if(document.body?.dataset.page!=='admin')return;
    const existing=document.getElementById(ROOT_ID);
    if(!connected()){existing?.remove();return;}
    if(existing)return;
    try{rows=await loadRows();}catch(error){console.warn('No fue posible cargar catálogo operativo remoto.',error);rows=canonicalRows().filter(row=>row.active);}
    const admin=document.getElementById('admin-dynamic');
    if(!admin?.parentElement)return;
    admin.insertAdjacentHTML('beforebegin',template());
    bind(document.getElementById(ROOT_ID));
    updateTotal();
  }

  window.addEventListener('ee:admin-connectivity',()=>void render());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>void render(),0),{once:true});else setTimeout(()=>void render(),0);
  window.EL_ERRANTE_ADMIN_ORDER_INTAKE_V423=Object.freeze({version:VERSION,connected,render});
})();
