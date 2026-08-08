(()=>{
  'use strict';

  const BASE=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const ORDER_KEY='ee_v14_orders';
  const FULFILLMENT_KEY='ee_v22_fulfillment';
  const DATE_KEY='ee_v22_selected_date';
  const ACTIVE=new Set(['approved','preparing','dispatched','delivered']);
  const PRODUCTION=new Set(['approved','preparing']);
  const STATUS={
    approved:'Pago aprobado',
    preparing:'En preparación',
    dispatched:'Despachado',
    delivered:'Entregado'
  };
  const CHECKS=[
    ['productReady','Producto listo'],
    ['packagingReady','Empaque y etiqueta'],
    ['quantityChecked','Cantidad verificada'],
    ['deliveryCoordinated','Entrega coordinada']
  ];
  let renderGeneration=0;

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const number=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
  const dateLabel=value=>value?new Date(`${value}T12:00:00-05:00`).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'}):'Sin fecha';
  const isRemote=()=>Boolean(BASE.backend?.url&&BASE.backend?.publishableKey&&window.__EE_ADMIN_SUPABASE__)&&document.querySelector('#admin-dynamic .ee-v15-sessionbar')?.textContent.includes('Administración conectada');
  const allowsLocalSurface=host=>host?.dataset.v22LocalSurface==='true';
  const itemId=item=>item.productId||item.product_id||item.variantId||item.variant_id||item.name||item.product_name||'producto';
  const itemName=item=>item.name||item.product_name||'Producto El Errante';
  const itemQty=item=>number(item.quantity);
  const complete=fulfillment=>CHECKS.every(([key])=>Boolean(fulfillment?.[key]));
  const progress=fulfillment=>CHECKS.filter(([key])=>Boolean(fulfillment?.[key])).length;

  function normalizeOrder(order,fulfillment={}){
    return {
      id:String(order.id||''),
      status:String(order.status||''),
      createdAt:order.createdAt||order.created_at,
      customer:order.customer||{name:order.customer_name},
      delivery:order.delivery||{city:order.city,neighborhood:order.neighborhood,requestedDate:order.requested_date},
      items:Array.isArray(order.items)?order.items:[],
      fulfillment:{
        productReady:Boolean(fulfillment.productReady??fulfillment.product_ready),
        packagingReady:Boolean(fulfillment.packagingReady??fulfillment.packaging_ready),
        quantityChecked:Boolean(fulfillment.quantityChecked??fulfillment.quantity_checked),
        deliveryCoordinated:Boolean(fulfillment.deliveryCoordinated??fulfillment.delivery_coordinated),
        note:String(fulfillment.note||''),
        updatedAt:fulfillment.updatedAt||fulfillment.updated_at||''
      }
    };
  }

  function localOrders(){
    const fulfillment=read(FULFILLMENT_KEY,{});
    return read(ORDER_KEY,[]).map(order=>normalizeOrder(order,fulfillment[order.id]||{}));
  }

  async function remoteOrders(){
    const client=window.__EE_ADMIN_SUPABASE__;
    const [orders,items,fulfillment]=await Promise.all([
      client.from('orders').select('*').order('requested_date',{ascending:true,nullsFirst:false}),
      client.from('order_items').select('*'),
      client.from('order_fulfillment').select('*')
    ]);
    const failed=[orders,items,fulfillment].find(result=>result.error);
    if(failed)throw failed.error;
    const rows=items.data||[];
    const checks=fulfillment.data||[];
    return (orders.data||[]).map(order=>normalizeOrder({...order,items:rows.filter(item=>item.order_id===order.id)},checks.find(item=>item.order_id===order.id)||{}));
  }

  async function loadOrders(){return isRemote()?remoteOrders():localOrders();}

  function initialDate(orders){
    const saved=sessionStorage.getItem(DATE_KEY);
    if(saved)return saved;
    const activeDates=orders.filter(order=>ACTIVE.has(order.status)).map(order=>order.delivery?.requestedDate).filter(Boolean).sort();
    const current=today();
    if(activeDates.includes(current))return current;
    return activeDates.find(value=>value>=current)||activeDates[0]||current;
  }

  function scheduled(orders,date){return orders.filter(order=>ACTIVE.has(order.status)&&order.delivery?.requestedDate===date);}

  function aggregate(orders){
    const rows=new Map();
    orders.filter(order=>PRODUCTION.has(order.status)).forEach(order=>{
      order.items.forEach(item=>{
        const id=itemId(item);
        const row=rows.get(id)||{id,name:itemName(item),approved:0,preparing:0,total:0};
        const quantity=itemQty(item);
        row[order.status]+=quantity;
        row.total+=quantity;
        rows.set(id,row);
      });
    });
    return [...rows.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
  }

  function consolidatedHtml(orders){
    const rows=aggregate(orders);
    if(!rows.length)return '<div class="ee-v22-empty">No hay unidades pendientes de producción para esta fecha.</div>';
    return `<div class="ee-v22-table-wrap"><table class="ee-v22-table"><thead><tr><th>Producto</th><th>Por iniciar</th><th>En proceso</th><th>Total pendiente</th></tr></thead><tbody>${rows.map(row=>`<tr data-v22-product="${escapeHtml(row.id)}"><td><strong>${escapeHtml(row.name)}</strong></td><td>${row.approved}</td><td>${row.preparing}</td><td><strong>${row.total}</strong></td></tr>`).join('')}</tbody></table></div>`;
  }

  function itemSummary(order){
    return order.items.map(item=>`${itemQty(item)} × ${itemName(item)}`).join(' · ')||'Sin productos registrados';
  }

  function actionFor(order){
    if(order.status==='approved')return {status:'preparing',label:'Iniciar preparación',disabled:false};
    if(order.status==='preparing')return {status:'dispatched',label:'Despachar pedido',disabled:!complete(order.fulfillment)};
    if(order.status==='dispatched')return {status:'delivered',label:'Marcar entregado',disabled:false};
    return null;
  }

  function orderCard(order){
    const done=progress(order.fulfillment);
    const action=actionFor(order);
    const readOnly=['dispatched','delivered'].includes(order.status);
    return `<article class="ee-v22-order" data-v22-order="${escapeHtml(order.id)}">
      <div class="ee-v22-order-head"><div><span class="ee-v22-status" data-status="${escapeHtml(order.status)}">${escapeHtml(STATUS[order.status]||order.status)}</span><h3>${escapeHtml(order.id)}</h3><p>${escapeHtml(order.customer?.name||'Cliente')} · ${escapeHtml(order.delivery?.city||'Ciudad pendiente')}</p></div><div class="ee-v22-progress"><strong>${done}/4</strong><small>alistamiento</small></div></div>
      <p class="ee-v22-items">${escapeHtml(itemSummary(order))}</p>
      <div class="ee-v22-checks">${CHECKS.map(([key,label])=>`<label><input type="checkbox" data-v22-check="${key}" ${order.fulfillment[key]?'checked':''} ${readOnly?'disabled':''}><span>${escapeHtml(label)}</span></label>`).join('')}</div>
      <label class="ee-v22-note"><span>Nota de producción o despacho</span><input data-v22-note maxlength="180" value="${escapeHtml(order.fulfillment.note)}" placeholder="Lote, empaque, novedad o coordinación" ${readOnly?'disabled':''}></label>
      <div class="ee-v22-actions">${readOnly?'':`<button type="button" class="ee-v22-button secondary" data-v22-save>Guardar alistamiento</button>`}${action?`<button type="button" class="ee-v22-button" data-v22-transition="${action.status}" ${action.disabled?'disabled title="Completa y guarda los cuatro controles"':''}>${action.label}</button>`:''}</div>
    </article>`;
  }

  function ordersHtml(orders){return orders.length?orders.map(orderCard).join(''):'<div class="ee-v22-empty">No hay pedidos programados para esta fecha.</div>';}

  function metrics(orders){
    const units=orders.filter(order=>PRODUCTION.has(order.status)).flatMap(order=>order.items).reduce((sum,item)=>sum+itemQty(item),0);
    return {
      orders:orders.length,
      units,
      ready:orders.filter(order=>order.status==='preparing'&&complete(order.fulfillment)).length,
      dispatched:orders.filter(order=>['dispatched','delivered'].includes(order.status)).length
    };
  }

  function shellHtml(allOrders,date){
    const dayOrders=scheduled(allOrders,date);
    const values=metrics(dayOrders);
    const undated=allOrders.filter(order=>ACTIVE.has(order.status)&&!order.delivery?.requestedDate).length;
    return `<section class="ee-v22-shell">
      <div class="ee-v22-heading"><div><p class="eyebrow">Producción y despacho · V2.2</p><h2>Agenda de alistamiento por fecha</h2><p>Consolida lo que debe producirse, controla cada pedido y evita despachos incompletos.</p></div><span class="ee-v22-mode">${isRemote()?'Datos conectados':'Simulación local'}</span></div>
      <div id="ee-v22-message" class="ee-v15-message" aria-live="polite"></div>
      <div class="ee-v22-toolbar"><label><span>Fecha comprometida</span><input id="ee-v22-date" type="date" value="${escapeHtml(date)}"></label><div><button type="button" class="ee-v22-button secondary" id="ee-v22-today">Hoy</button><button type="button" class="ee-v22-button secondary" id="ee-v22-export">Exportar preparación</button><button type="button" class="ee-v22-button secondary" id="ee-v22-print">Imprimir lista</button></div></div>
      ${undated?`<div class="ee-v22-warning"><strong>${undated} pedido(s) activo(s) sin fecha comprometida</strong><span>Asigna o confirma una fecha desde la ficha del pedido antes de programar producción.</span></div>`:''}
      <div class="ee-v22-metrics"><article><small>Pedidos del día</small><strong>${values.orders}</strong></article><article><small>Unidades pendientes</small><strong>${values.units}</strong></article><article><small>Listos para despacho</small><strong>${values.ready}</strong></article><article><small>Despachados o entregados</small><strong>${values.dispatched}</strong></article></div>
      <section class="ee-v22-panel"><div class="ee-v22-section-head"><div><p class="eyebrow">Consolidado</p><h3>Producción requerida · ${escapeHtml(dateLabel(date))}</h3></div></div><div id="ee-v22-consolidated">${consolidatedHtml(dayOrders)}</div></section>
      <section class="ee-v22-panel"><div class="ee-v22-section-head"><div><p class="eyebrow">Control por pedido</p><h3>Alistamiento y salida</h3></div><span>El despacho solo se habilita con 4 de 4 controles guardados.</span></div><div id="ee-v22-orders" class="ee-v22-orders">${ordersHtml(dayOrders)}</div></section>
    </section>`;
  }

  function setMessage(text,type='ok'){
    const box=document.querySelector('#ee-v22-message');
    if(!box)return;
    box.textContent=text;box.dataset.type=type;
  }

  async function saveFulfillment(order,card){
    const data=Object.fromEntries(CHECKS.map(([key])=>[key,Boolean(card.querySelector(`[data-v22-check="${key}"]`)?.checked)]));
    data.note=String(card.querySelector('[data-v22-note]')?.value||'').trim();
    data.updatedAt=new Date().toISOString();
    if(isRemote()){
      const result=await window.__EE_ADMIN_SUPABASE__.rpc('save_order_fulfillment_v22',{
        p_order_id:order.id,
        p_product_ready:data.productReady,
        p_packaging_ready:data.packagingReady,
        p_quantity_checked:data.quantityChecked,
        p_delivery_coordinated:data.deliveryCoordinated,
        p_note:data.note||null
      });
      if(result.error)throw result.error;
    }else{
      const all=read(FULFILLMENT_KEY,{});
      all[order.id]=data;
      write(FULFILLMENT_KEY,all);
    }
    setMessage(complete(data)?'Alistamiento completo. El pedido puede avanzar a despacho.':'Avance de alistamiento guardado.');
    window.dispatchEvent(new CustomEvent('ee:v22:reload'));
  }

  async function transition(order,newStatus){
    const allowed=(order.status==='approved'&&newStatus==='preparing')||(order.status==='preparing'&&newStatus==='dispatched')||(order.status==='dispatched'&&newStatus==='delivered');
    if(!allowed)throw new Error('La transición no corresponde al estado actual.');
    if(newStatus==='dispatched'&&!complete(order.fulfillment))throw new Error('Completa y guarda los cuatro controles antes de despachar.');
    if(!window.confirm(`¿Cambiar ${order.id} a “${STATUS[newStatus]}”?`))return;
    if(isRemote()){
      const result=await window.__EE_ADMIN_SUPABASE__.rpc('transition_order_v22',{p_order_id:order.id,p_new_status:newStatus,p_note:'Actualizado desde Producción V2.2'});
      if(result.error)throw result.error;
    }else{
      const orders=read(ORDER_KEY,[]);
      const target=orders.find(item=>item.id===order.id);
      if(!target)throw new Error('No se encontró el pedido en el navegador.');
      target.status=newStatus;
      target.updatedAt=new Date().toISOString();
      target.statusTimeline=Array.isArray(target.statusTimeline)?target.statusTimeline:[];
      target.statusTimeline.push({status:newStatus,createdAt:target.updatedAt,note:'Actualizado desde Producción V2.2'});
      write(ORDER_KEY,orders);
    }
    document.querySelector('#ee-refresh-admin')?.click();
    setMessage(`Pedido ${order.id} actualizado a ${STATUS[newStatus]}.`);
    window.dispatchEvent(new CustomEvent('ee:v21:reload'));
    window.dispatchEvent(new CustomEvent('ee:v22:reload'));
  }

  function exportPreparation(orders,date){
    const dayOrders=scheduled(orders,date);
    const rows=[['Fecha','Producto','Cantidad pendiente','Pedidos']];
    aggregate(dayOrders).forEach(product=>{
      const refs=dayOrders.filter(order=>PRODUCTION.has(order.status)&&order.items.some(item=>itemId(item)===product.id)).map(order=>order.id).join(' | ');
      rows.push([date,product.name,product.total,refs]);
    });
    const csv=rows.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob=new Blob([`\ufeff${csv}`],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`el-errante-preparacion-${date}.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function syncLegacyDispatchGuard(){
    const button=document.querySelector('#ee-v21-dialog [data-v21-transition="dispatched"]');
    if(!button)return;
    const orderId=document.querySelector('#ee-v21-dialog h2')?.textContent?.trim();
    const fulfillment=read(FULFILLMENT_KEY,{})[orderId]||{};
    if(!isRemote()){
      button.disabled=!complete(fulfillment);
      button.title=button.disabled?'Completa y guarda el alistamiento en Producción V2.2':'';
      let note=document.querySelector('#ee-v21-dialog [data-v22-guard-note]');
      if(button.disabled&&!note){note=document.createElement('small');note.dataset.v22GuardNote='true';note.textContent='El despacho requiere 4 de 4 controles guardados en Producción V2.2.';button.parentElement?.append(note);}
      if(!button.disabled&&note)note.remove();
    }
  }

  async function render(){
    const host=document.querySelector('#production-v22');
    if(!host)return;
    const session=document.querySelector('#admin-dynamic .ee-v15-sessionbar');
    if(!session&&!allowsLocalSurface(host)){host.innerHTML='<div class="ee-v16-pending">La agenda de producción se habilita al ingresar o abrir una superficie local autorizada.</div>';return;}
    const generation=++renderGeneration;
    try{
      const orders=await loadOrders();
      if(generation!==renderGeneration)return;
      const selected=initialDate(orders);
      host.innerHTML=shellHtml(orders,selected);
      bind(host,orders,selected);
      document.documentElement.dataset.productionVersion='2.2.0';
      syncLegacyDispatchGuard();
    }catch(error){
      console.error(error);
      host.innerHTML='<div class="ee-v16-pending">No fue posible cargar Producción V2.2. En modo conectado, verifica que la migración schema-v22.sql esté aplicada.</div>';
    }
  }

  function bind(host,orders,selected){
    host.querySelector('#ee-v22-date')?.addEventListener('change',event=>{sessionStorage.setItem(DATE_KEY,event.target.value||today());render();});
    host.querySelector('#ee-v22-today')?.addEventListener('click',()=>{sessionStorage.setItem(DATE_KEY,today());render();});
    host.querySelector('#ee-v22-export')?.addEventListener('click',()=>exportPreparation(orders,selected));
    host.querySelector('#ee-v22-print')?.addEventListener('click',()=>window.print());
    host.querySelectorAll('[data-v22-order]').forEach(card=>{
      const order=orders.find(item=>item.id===card.dataset.v22Order);if(!order)return;
      card.querySelector('[data-v22-save]')?.addEventListener('click',async buttonEvent=>{
        const button=buttonEvent.currentTarget;button.disabled=true;
        try{await saveFulfillment(order,card);}catch(error){console.error(error);setMessage(error.message||'No fue posible guardar el alistamiento.','error');button.disabled=false;}
      });
      card.querySelector('[data-v22-transition]')?.addEventListener('click',async event=>{
        const button=event.currentTarget;button.disabled=true;
        try{await transition(order,button.dataset.v22Transition);}catch(error){console.error(error);setMessage(error.message||'No fue posible actualizar el pedido.','error');button.disabled=false;}
      });
    });
  }

  function observe(){
    const admin=document.querySelector('#admin-dynamic');
    if(admin){let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,120);}).observe(admin,{childList:true,subtree:true});}
    const daily=document.querySelector('#daily-ops-v21');
    if(daily)new MutationObserver(()=>queueMicrotask(syncLegacyDispatchGuard)).observe(daily,{childList:true,subtree:true});
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#ee-v21-dialog [data-v21-transition="dispatched"]');
      if(!button||isRemote())return;
      const orderId=document.querySelector('#ee-v21-dialog h2')?.textContent?.trim();
      const fulfillment=read(FULFILLMENT_KEY,{})[orderId]||{};
      if(!complete(fulfillment)){event.preventDefault();event.stopImmediatePropagation();setMessage('Completa y guarda el alistamiento antes de despachar.','error');}
    },true);
    render();
  }

  window.addEventListener('ee:v22:reload',()=>setTimeout(render,60));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
})();