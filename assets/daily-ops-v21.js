(()=>{
  'use strict';

  const BASE=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const KEYS={
    orders:'ee_v14_orders',
    settings:'ee_v14_settings',
    products:'ee_v14_products',
    fixedCosts:'ee_v14_fixed_costs',
    movements:'ee_v16_inventory_movements'
  };
  const STATUS={
    pending_payment:{label:'Pago pendiente',tone:'pending',group:'review'},
    payment_review:{label:'Comprobante por revisar',tone:'review',group:'review'},
    approved:{label:'Pago aprobado',tone:'approved',group:'production'},
    preparing:{label:'En preparación',tone:'preparing',group:'production'},
    dispatched:{label:'Despachado',tone:'dispatched',group:'delivery'},
    delivered:{label:'Entregado',tone:'delivered',group:'closed'},
    rejected:{label:'Revisión requerida',tone:'rejected',group:'review'},
    cancelled:{label:'Cancelado',tone:'cancelled',group:'closed'}
  };
  const ACTIONS={
    pending_payment:[{status:'payment_review',label:'Comprobante recibido'},{status:'cancelled',label:'Cancelar solicitud',secondary:true}],
    payment_review:[{status:'approved',label:'Aprobar pago',requiresReceipt:true},{status:'rejected',label:'Solicitar revisión',secondary:true},{status:'cancelled',label:'Cancelar solicitud',secondary:true}],
    rejected:[{status:'payment_review',label:'Volver a revisión'},{status:'cancelled',label:'Cancelar solicitud',secondary:true}],
    approved:[{status:'preparing',label:'Iniciar preparación'},{status:'cancelled',label:'Cancelar solicitud',secondary:true}],
    preparing:[{status:'dispatched',label:'Marcar despachado'},{status:'approved',label:'Volver a aprobado',secondary:true},{status:'cancelled',label:'Cancelar y reintegrar',secondary:true}],
    dispatched:[{status:'delivered',label:'Marcar entregado'},{status:'preparing',label:'Corregir a preparación',secondary:true}],
    delivered:[{status:'dispatched',label:'Corregir a despachado',secondary:true}],
    cancelled:[{status:'pending_payment',label:'Reabrir solicitud',secondary:true}]
  };
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const number=value=>Number(String(value??'').replace(/[^0-9.-]/g,''))||0;
  const backendReady=()=>Boolean(BASE.backend?.url&&BASE.backend?.publishableKey);
  const dateTime=value=>value?new Date(value).toLocaleString('es-CO'):'—';
  const dateOnly=value=>value?new Date(`${String(value).slice(0,10)}T12:00:00`).toLocaleDateString('es-CO'):'Por coordinar';
  const download=(filename,text,type='application/json')=>{
    const blob=new Blob([text],{type:`${type};charset=utf-8`});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const statusMeta=value=>STATUS[value]||{label:value||'Sin estado',tone:'pending',group:'review'};

  function isRemote(){
    return backendReady()&&Boolean(document.querySelector('#admin-dynamic .ee-v15-sessionbar'))&&document.querySelector('#admin-dynamic .ee-v15-sessionbar')?.textContent.includes('Administración conectada');
  }

  function localOrders(){
    return read(KEYS.orders,[]).map(order=>({
      id:order.id,
      createdAt:order.createdAt,
      updatedAt:order.updatedAt||order.createdAt,
      status:order.status,
      total:number(order.total),
      subtotal:number(order.subtotal),
      deliveryFee:number(order.deliveryFee),
      customer:order.customer||{},
      delivery:order.delivery||{},
      items:Array.isArray(order.items)?order.items:[],
      receiptPath:order.receiptPath||'',
      receiptDataUrl:order.receiptDataUrl||'',
      receiptStatus:order.receiptStatus||(order.receiptDataUrl?'pending':''),
      timeline:Array.isArray(order.statusTimeline)?order.statusTimeline:[]
    }));
  }

  async function remoteOrders(){
    const client=window.__EE_ADMIN_SUPABASE__;
    if(!client)throw new Error('La sesión administrativa conectada no está disponible.');
    const [orders,items,receipts,events]=await Promise.all([
      client.from('orders').select('*').order('created_at',{ascending:false}),
      client.from('order_items').select('*'),
      client.from('payment_receipts').select('order_id,storage_path,status,notes,created_at,reviewed_at'),
      client.from('order_status_events').select('order_id,status,note,created_at').order('created_at',{ascending:true})
    ]);
    const failed=[orders,items,receipts,events].find(result=>result.error);
    if(failed)throw failed.error;
    const itemRows=items.data||[];
    const receiptRows=receipts.data||[];
    const eventRows=events.data||[];
    return (orders.data||[]).map(order=>{
      const receipt=receiptRows.find(row=>row.order_id===order.id)||{};
      return {
        id:order.id,
        createdAt:order.created_at,
        updatedAt:order.updated_at||order.created_at,
        status:order.status,
        total:number(order.total),
        subtotal:number(order.subtotal),
        deliveryFee:number(order.delivery_fee),
        customer:{name:order.customer_name,email:order.customer_email,phone:order.customer_phone},
        delivery:{city:order.city,neighborhood:order.neighborhood,address:order.address,requestedDate:order.requested_date,notes:order.delivery_notes},
        items:itemRows.filter(item=>item.order_id===order.id).map(item=>({productId:item.product_id,variantId:item.variant_id,name:item.product_name,quantity:number(item.quantity),unitPrice:number(item.unit_price),unitCost:number(item.unit_cost_snapshot),lineTotal:number(item.line_total)})),
        receiptPath:receipt.storage_path||'',
        receiptStatus:receipt.status||'',
        receiptNotes:receipt.notes||'',
        timeline:eventRows.filter(event=>event.order_id===order.id).map(event=>({status:event.status,note:event.note,createdAt:event.created_at}))
      };
    });
  }

  async function loadOrders(){return isRemote()?remoteOrders():localOrders();}

  function counters(orders){
    return {
      review:orders.filter(order=>statusMeta(order.status).group==='review').length,
      production:orders.filter(order=>statusMeta(order.status).group==='production').length,
      delivery:orders.filter(order=>statusMeta(order.status).group==='delivery').length,
      closed:orders.filter(order=>statusMeta(order.status).group==='closed').length,
      total:orders.length
    };
  }

  function filtered(orders,filter,query){
    const normalized=String(query||'').trim().toLowerCase();
    return orders.filter(order=>{
      const matchesGroup=filter==='all'||statusMeta(order.status).group===filter;
      const haystack=[order.id,order.customer?.name,order.customer?.email,order.customer?.phone,order.delivery?.city,order.delivery?.neighborhood].join(' ').toLowerCase();
      return matchesGroup&&(!normalized||haystack.includes(normalized));
    });
  }

  function cardsHtml(orders){
    if(!orders.length)return '<div class="ee-v21-empty">No hay pedidos que coincidan con esta vista.</div>';
    return orders.map(order=>{
      const meta=statusMeta(order.status);
      return `<article class="ee-v21-order-card" data-v21-order="${escapeHtml(order.id)}"><div class="ee-v21-order-main"><div><span class="ee-v21-status ${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span><h3>${escapeHtml(order.id)}</h3><p>${escapeHtml(order.customer?.name||'Cliente sin nombre')} · ${escapeHtml(order.delivery?.city||'Ciudad pendiente')}</p></div><div class="ee-v21-order-money"><strong>${money(order.total)}</strong><small>${dateTime(order.createdAt)}</small></div></div><div class="ee-v21-order-meta"><span>Fecha preferida: <strong>${escapeHtml(dateOnly(order.delivery?.requestedDate))}</strong></span><span>${order.receiptPath||order.receiptDataUrl?'<strong>Comprobante adjunto</strong>':'Sin comprobante adjunto'}</span></div><button type="button" class="ee-v21-open" data-v21-open="${escapeHtml(order.id)}">Abrir pedido</button></article>`;
    }).join('');
  }

  function actionButtons(order){
    const hasReceipt=Boolean(order.receiptPath||order.receiptDataUrl);
    return (ACTIONS[order.status]||[]).map(action=>`<button type="button" class="ee-v21-action ${action.secondary?'secondary':''}" data-v21-transition="${escapeHtml(action.status)}" ${action.requiresReceipt&&!hasReceipt?'disabled title="Se requiere comprobante"':''}>${escapeHtml(action.label)}</button>`).join('');
  }

  function detailsHtml(order){
    const meta=statusMeta(order.status);
    const items=(order.items||[]).map(item=>`<tr><td>${escapeHtml(item.name||'Producto')}</td><td>${number(item.quantity)}</td><td>${money(item.unitPrice)}</td><td>${money(item.lineTotal||number(item.quantity)*number(item.unitPrice))}</td></tr>`).join('')||'<tr><td colspan="4">Sin detalle de productos.</td></tr>';
    const timeline=(order.timeline||[]).map(event=>`<li><strong>${escapeHtml(statusMeta(event.status).label)}</strong><span>${dateTime(event.createdAt||event.created_at)}</span>${event.note?`<small>${escapeHtml(event.note)}</small>`:''}</li>`).join('');
    return `<div class="ee-v21-dialog-head"><div><span class="ee-v21-status ${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span><h2>${escapeHtml(order.id)}</h2><p>Solicitud registrada ${dateTime(order.createdAt)}</p></div><button type="button" class="ee-v21-close" aria-label="Cerrar">×</button></div><div class="ee-v21-detail-grid"><section><p class="eyebrow">Cliente</p><h3>${escapeHtml(order.customer?.name||'—')}</h3><p>${escapeHtml(order.customer?.phone||'—')}<br>${escapeHtml(order.customer?.email||'—')}</p></section><section><p class="eyebrow">Entrega</p><h3>${escapeHtml(order.delivery?.city||'—')} · ${escapeHtml(order.delivery?.neighborhood||'—')}</h3><p>${escapeHtml(order.delivery?.address||'—')}<br>Fecha preferida: ${escapeHtml(dateOnly(order.delivery?.requestedDate))}</p>${order.delivery?.notes?`<small>${escapeHtml(order.delivery.notes)}</small>`:''}</section></div><section class="ee-v21-items"><p class="eyebrow">Contenido del pedido</p><div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>${items}</tbody></table></div><dl><div><dt>Subtotal</dt><dd>${money(order.subtotal)}</dd></div><div><dt>Entrega</dt><dd>${money(order.deliveryFee)}</dd></div><div><dt>Total</dt><dd>${money(order.total)}</dd></div></dl></section><section class="ee-v21-payment"><div><p class="eyebrow">Transferencia</p><h3>${order.receiptPath||order.receiptDataUrl?'Comprobante disponible':'Sin comprobante'}</h3><p>Estado: ${escapeHtml(order.receiptStatus||'pendiente')}</p>${order.receiptNotes?`<small>${escapeHtml(order.receiptNotes)}</small>`:''}</div>${order.receiptPath||order.receiptDataUrl?'<button type="button" class="ee-v21-action secondary" data-v21-receipt>Ver comprobante</button>':''}</section><section class="ee-v21-actions"><p class="eyebrow">Siguiente acción</p><div>${actionButtons(order)}</div><label for="ee-v21-note">Nota operativa opcional</label><input id="ee-v21-note" maxlength="180" placeholder="Ej.: pago verificado, cliente confirmó horario…"></section>${timeline?`<details class="ee-v21-timeline"><summary>Ver historial del pedido</summary><ul>${timeline}</ul></details>`:''}`;
  }

  async function viewReceipt(order){
    if(order.receiptDataUrl){window.open(order.receiptDataUrl,'_blank','noopener');return;}
    if(!order.receiptPath)throw new Error('El pedido no tiene comprobante.');
    const client=window.__EE_ADMIN_SUPABASE__;
    if(!client)throw new Error('No hay sesión conectada.');
    const result=await client.storage.from(BASE.backend?.receiptBucket||'payment-receipts').createSignedUrl(order.receiptPath,120);
    if(result.error)throw result.error;
    window.open(result.data.signedUrl,'_blank','noopener,noreferrer');
  }

  async function transition(order,newStatus,note){
    const action=(ACTIONS[order.status]||[]).find(item=>item.status===newStatus);
    if(!action)throw new Error('La transición seleccionada no está permitida desde el estado actual.');
    if(action.requiresReceipt&&!order.receiptPath&&!order.receiptDataUrl)throw new Error('No se puede aprobar el pago sin comprobante.');
    if(!window.confirm(`¿Cambiar ${order.id} a “${statusMeta(newStatus).label}”?`))return false;
    if(isRemote()){
      const client=window.__EE_ADMIN_SUPABASE__;
      const result=await client.rpc('transition_order_v21',{p_order_id:order.id,p_new_status:newStatus,p_note:String(note||'').trim()||null});
      if(result.error)throw result.error;
      await document.querySelector('#ee-refresh-admin')?.click();
      return true;
    }
    const select=document.querySelector(`[data-order-status="${CSS.escape(order.id)}"]`);
    if(!select)throw new Error('No fue posible localizar el pedido en Administración.');
    select.value=newStatus;
    select.dataset.v21Note=String(note||'').trim()||'Estado actualizado desde la mesa diaria';
    select.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }

  function exportCsv(orders){
    const headers=['Referencia','Creado','Estado','Cliente','Ciudad','Fecha preferida','Total'];
    const rows=orders.map(order=>[order.id,order.createdAt,statusMeta(order.status).label,order.customer?.name||'',order.delivery?.city||'',order.delivery?.requestedDate||'',order.total]);
    const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
    download(`el-errante-pedidos-${new Date().toISOString().slice(0,10)}.csv`,`\ufeff${csv}`,'text/csv');
  }

  function backupPayload(){
    return {
      format:'el-errante-local-backup',
      version:'2.1.0',
      exportedAt:new Date().toISOString(),
      data:Object.fromEntries(Object.entries(KEYS).map(([name,key])=>[name,read(key,['products','settings'].includes(name)?{}:[])]))
    };
  }

  function exportBackup(){
    const payload=backupPayload();
    download(`el-errante-respaldo-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,JSON.stringify(payload,null,2));
  }

  function validateBackup(payload){
    if(!payload||payload.format!=='el-errante-local-backup'||typeof payload.data!=='object')throw new Error('El archivo no corresponde a un respaldo válido de El Errante.');
    if(!Array.isArray(payload.data.orders))throw new Error('El respaldo no contiene una lista válida de pedidos.');
    if(payload.data.products!==undefined&&(payload.data.products===null||typeof payload.data.products!=='object'||Array.isArray(payload.data.products)))throw new Error('El catálogo del respaldo no es válido.');
    return payload.data;
  }

  async function restoreBackup(file){
    const payload=JSON.parse(await file.text());
    const data=validateBackup(payload);
    if(!window.confirm('Esta restauración reemplazará los datos locales actuales de este navegador. ¿Continuar?'))return false;
    exportBackup();
    Object.entries(KEYS).forEach(([name,key])=>{
      if(data[name]!==undefined)write(key,data[name]);
    });
    return true;
  }

  function shellHtml(orders){
    const c=counters(orders);
    return `<section class="ee-v21-shell"><div class="ee-v21-heading"><div><p class="eyebrow">Operación diaria · V2.1</p><h2>Mesa de pedidos y continuidad local</h2><p>Prioriza comprobantes, preparación y entregas. Abre cada pedido para revisar cliente, dirección, productos, pago y siguiente acción.</p></div><span class="ee-v21-mode">${isRemote()?'Datos conectados':'Simulación local'}</span></div><div id="ee-v21-message" class="ee-v15-message" aria-live="polite"></div><div class="ee-v21-metrics"><button data-v21-filter="review"><small>Por revisar</small><strong>${c.review}</strong></button><button data-v21-filter="production"><small>Preparación</small><strong>${c.production}</strong></button><button data-v21-filter="delivery"><small>Despacho</small><strong>${c.delivery}</strong></button><button data-v21-filter="closed"><small>Cerrados</small><strong>${c.closed}</strong></button><button data-v21-filter="all" class="active"><small>Total</small><strong>${c.total}</strong></button></div><div class="ee-v21-toolbar"><label><span>Buscar pedido</span><input id="ee-v21-search" type="search" placeholder="Referencia, cliente, ciudad…"></label><div><button type="button" class="ee-v21-action secondary" id="ee-v21-export-csv">Exportar CSV operativo</button>${isRemote()?'':'<button type="button" class="ee-v21-action secondary" id="ee-v21-export-backup">Descargar respaldo</button><label class="ee-v21-import">Restaurar respaldo<input id="ee-v21-import-backup" type="file" accept="application/json"></label>'}</div></div>${isRemote()?'':'<div class="ee-v21-warning"><strong>Continuidad local</strong><p>Los pedidos, comprobantes, inventario y configuración de esta simulación permanecen en este navegador. Descarga un respaldo periódico y consérvalo en una ubicación privada.</p></div>'}<div id="ee-v21-orders" class="ee-v21-orders">${cardsHtml(orders)}</div><dialog id="ee-v21-dialog" class="ee-v21-dialog"><div id="ee-v21-dialog-content"></div></dialog></section>`;
  }

  async function render(){
    const host=document.querySelector('#daily-ops-v21');
    if(!host)return;
    const session=document.querySelector('#admin-dynamic .ee-v15-sessionbar');
    if(!session){host.innerHTML='<div class="ee-v16-pending">La mesa diaria se habilita al ingresar o abrir la simulación local.</div>';return;}
    try{
      const orders=await loadOrders();
      host.innerHTML=shellHtml(orders);
      let filter='all';
      const search=host.querySelector('#ee-v21-search');
      const list=host.querySelector('#ee-v21-orders');
      const dialog=host.querySelector('#ee-v21-dialog');
      const content=host.querySelector('#ee-v21-dialog-content');
      const message=host.querySelector('#ee-v21-message');
      const refresh=()=>{list.innerHTML=cardsHtml(filtered(orders,filter,search.value));};
      const setMessage=(text,type='ok')=>{message.textContent=text;message.dataset.type=type;};
      host.querySelectorAll('[data-v21-filter]').forEach(button=>button.addEventListener('click',()=>{
        filter=button.dataset.v21Filter;
        host.querySelectorAll('[data-v21-filter]').forEach(item=>item.classList.toggle('active',item===button));
        refresh();
      }));
      search.addEventListener('input',refresh);
      host.querySelector('#ee-v21-export-csv').addEventListener('click',()=>exportCsv(orders));
      host.querySelector('#ee-v21-export-backup')?.addEventListener('click',()=>{exportBackup();setMessage('Respaldo local descargado. Guárdalo en una ubicación privada.');});
      host.querySelector('#ee-v21-import-backup')?.addEventListener('change',async event=>{
        const file=event.target.files?.[0];if(!file)return;
        try{if(await restoreBackup(file)){setMessage('Respaldo restaurado. Recargando la operación…');document.querySelector('#ee-refresh-admin')?.click();setTimeout(render,150);}}
        catch(error){console.error(error);setMessage(error.message||'No fue posible restaurar el respaldo.','error');}
        finally{event.target.value='';}
      });
      host.addEventListener('click',async event=>{
        const open=event.target.closest('[data-v21-open]');
        if(open){
          const order=orders.find(item=>item.id===open.dataset.v21Open);if(!order)return;
          content.innerHTML=detailsHtml(order);dialog.showModal();
          content.querySelector('.ee-v21-close').addEventListener('click',()=>dialog.close());
          content.querySelector('[data-v21-receipt]')?.addEventListener('click',async()=>{try{await viewReceipt(order);}catch(error){setMessage(error.message,'error');}});
          content.querySelectorAll('[data-v21-transition]').forEach(button=>button.addEventListener('click',async()=>{
            button.disabled=true;
            try{
              const changed=await transition(order,button.dataset.v21Transition,content.querySelector('#ee-v21-note')?.value);
              if(changed){dialog.close();setMessage('Estado actualizado y operación recalculada.');setTimeout(render,220);}
            }catch(error){console.error(error);setMessage(error.message||'No fue posible actualizar el pedido.','error');button.disabled=false;}
          }));
        }
      });
      dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
      document.documentElement.dataset.dailyOpsVersion='2.1.0';
    }catch(error){
      console.error(error);
      host.innerHTML='<div class="ee-v16-pending">No fue posible cargar la mesa diaria. Revisa la conexión, la sesión administrativa y la migración V2.1.</div>';
    }
  }

  function observeAdmin(){
    const admin=document.querySelector('#admin-dynamic');
    if(!admin)return;
    let timer;
    new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,90);}).observe(admin,{childList:true,subtree:true});
    render();
  }

  window.addEventListener('ee:v21:reload',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeAdmin,{once:true});else observeAdmin();
})();
