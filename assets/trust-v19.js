(()=>{
  'use strict';

  const BASE=window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const KEYS={orders:'ee_v14_orders',settings:'ee_v14_settings'};
  const STATUS={
    pending_payment:{label:'Pago pendiente',copy:'Aún falta completar o validar la transferencia.',step:1},
    payment_review:{label:'Comprobante por revisar',copy:'Recibimos el comprobante y está pendiente de verificación.',step:2},
    approved:{label:'Pago aprobado',copy:'El pago fue verificado. Coordinaremos la preparación y entrega.',step:3},
    preparing:{label:'En preparación',copy:'El pedido entró a preparación según la coordinación acordada.',step:4},
    dispatched:{label:'Despachado',copy:'El pedido salió para entrega o recogida.',step:5},
    delivered:{label:'Entregado',copy:'El pedido fue marcado como entregado.',step:6},
    rejected:{label:'Revisión requerida',copy:'El comprobante o la solicitud requiere una revisión directa.',step:0},
    cancelled:{label:'Cancelado',copy:'La solicitud fue cancelada. Contacta a El Errante si necesitas aclaración.',step:0}
  };

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
  const backendReady=()=>Boolean(BASE.backend?.url&&BASE.backend?.publishableKey);
  const normalizeEmail=value=>String(value||'').trim().toLowerCase();

  function settings(){
    const saved=read(KEYS.settings,{});
    return {...(BASE.ordering||{}),...(saved.ordering||{})};
  }

  async function publicClient(){
    if(window.__EE_STATUS_SUPABASE__)return window.__EE_STATUS_SUPABASE__;
    if(!backendReady())throw new Error('Backend no configurado');
    const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    window.__EE_STATUS_SUPABASE__=module.createClient(BASE.backend.url,BASE.backend.publishableKey,{
      auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
    });
    return window.__EE_STATUS_SUPABASE__;
  }

  function localLookup(orderId,email){
    const order=read(KEYS.orders,[]).find(item=>String(item.id).toUpperCase()===String(orderId).trim().toUpperCase()&&normalizeEmail(item.customer?.email)===normalizeEmail(email));
    if(!order)return null;
    const timeline=Array.isArray(order.statusTimeline)?order.statusTimeline:[{status:order.status,createdAt:order.updatedAt||order.createdAt,note:'Estado guardado en este dispositivo'}];
    return {order_id:order.id,status:order.status,total:order.total,created_at:order.createdAt,updated_at:order.updatedAt||order.createdAt,requested_date:order.delivery?.requestedDate||null,receipt_status:order.receiptDataUrl?'pending':'pending',timeline};
  }

  async function remoteLookup(orderId,email){
    const client=await publicClient();
    const result=await client.rpc('lookup_order_status_v19',{p_order_id:String(orderId).trim(),p_email:normalizeEmail(email)});
    if(result.error)throw result.error;
    return Array.isArray(result.data)?result.data[0]||null:result.data||null;
  }

  function timelineHtml(order){
    const current=STATUS[order.status]||{label:order.status,copy:'Estado operativo actualizado.',step:0};
    const normal=['pending_payment','payment_review','approved','preparing','dispatched','delivered'];
    const progress=normal.map((status,index)=>{
      const item=STATUS[status];
      const active=current.step>=index+1;
      const currentStep=order.status===status;
      return `<li class="${active?'is-complete':''} ${currentStep?'is-current':''}"><span>${index+1}</span><div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.copy)}</small></div></li>`;
    }).join('');
    const events=(Array.isArray(order.timeline)?order.timeline:[]).map(event=>{
      const item=STATUS[event.status]||{label:event.status};
      const date=event.createdAt||event.created_at;
      return `<li><strong>${escapeHtml(item.label)}</strong><span>${date?escapeHtml(new Date(date).toLocaleString('es-CO')):''}</span>${event.note?`<small>${escapeHtml(event.note)}</small>`:''}</li>`;
    }).join('');
    return `<section class="ee-v19-result" aria-live="polite"><div class="ee-v19-status-head"><div><p class="eyebrow">Pedido ${escapeHtml(order.order_id)}</p><h2>${escapeHtml(current.label)}</h2><p>${escapeHtml(current.copy)}</p></div><strong>${money(order.total)}</strong></div><ol class="ee-v19-progress">${progress}</ol><div class="ee-v19-result-grid"><div><small>Solicitud registrada</small><strong>${order.created_at?escapeHtml(new Date(order.created_at).toLocaleDateString('es-CO')):'—'}</strong></div><div><small>Última actualización</small><strong>${order.updated_at?escapeHtml(new Date(order.updated_at).toLocaleString('es-CO')):'—'}</strong></div><div><small>Fecha preferida</small><strong>${order.requested_date?escapeHtml(new Date(`${order.requested_date}T12:00:00`).toLocaleDateString('es-CO')):'Por coordinar'}</strong></div></div>${events?`<details class="ee-v19-events"><summary>Ver historial del pedido</summary><ul>${events}</ul></details>`:''}<p class="ee-v19-privacy">Esta consulta no muestra dirección, teléfono, comprobante ni notas internas.</p></section>`;
  }

  function supportHtml(){
    const config=settings();
    const actions=[];
    if(config.supportWhatsapp){
      const clean=String(config.supportWhatsapp).replace(/\D/g,'');
      if(clean)actions.push(`<a class="btn btn-primary btn-small" href="https://wa.me/${clean}" target="_blank" rel="noopener">Escribir por WhatsApp</a>`);
    }
    if(config.supportEmail)actions.push(`<a class="btn btn-outline btn-small" href="mailto:${encodeURIComponent(config.supportEmail)}">Enviar correo</a>`);
    return actions.length?`<div class="button-row ee-v19-support-actions">${actions.join('')}</div>`:'<p class="muted">Los canales directos aparecerán aquí cuando sean configurados desde Administración.</p>';
  }

  function initAccount(){
    if(document.body?.dataset.page!=='cuenta')return;
    const root=document.querySelector('#account-content');
    if(!root)return;
    const config=settings();
    const params=new URLSearchParams(location.search);
    root.innerHTML=`<section class="ee-v19-tracker"><p class="eyebrow">Consulta segura · V1.9</p><h2>Revisa el estado de tu solicitud.</h2><p>Usa la referencia recibida al finalizar la compra y el mismo correo registrado. Solo mostramos información operativa limitada.</p><form id="ee-v19-track-form" class="ee-v19-track-form"><div class="ee-v14-field"><label for="ee-v19-order">Referencia del pedido</label><input id="ee-v19-order" name="order" required autocomplete="off" placeholder="EE-20260805-…" value="${escapeHtml(params.get('pedido')||'')}"></div><div class="ee-v14-field"><label for="ee-v19-email">Correo usado en la compra</label><input id="ee-v19-email" name="email" type="email" required autocomplete="email"></div><button class="btn btn-primary" type="submit">Consultar estado</button></form><div id="ee-v19-track-message" class="form-alert" aria-live="polite"></div><div id="ee-v19-track-result"></div></section><section class="ee-v19-trust"><div><p class="eyebrow">Coordinación comercial</p><h2>La solicitud se confirma antes de preparar.</h2><p>${escapeHtml(config.coverageDetails||config.deliveryPolicy||'Confirmamos disponibilidad y logística antes de preparar el pedido.')}</p><p><strong>Tarifa de entrega:</strong> ${escapeHtml(config.deliveryFeePolicy||'Se confirma según dirección y alternativa logística.')}</p><p><strong>Tiempo objetivo de respuesta:</strong> ${escapeHtml(config.expectedResponseHours||24)} horas hábiles.</p>${supportHtml()}</div></section>`;
    root.querySelector('#ee-v19-track-form').addEventListener('submit',async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const button=form.querySelector('button');
      const message=root.querySelector('#ee-v19-track-message');
      const result=root.querySelector('#ee-v19-track-result');
      const data=new FormData(form);
      button.disabled=true;button.textContent='Consultando…';message.textContent='';result.innerHTML='';
      try{
        const order=backendReady()?await remoteLookup(data.get('order'),data.get('email')):localLookup(data.get('order'),data.get('email'));
        if(!order){message.textContent='No encontramos una solicitud con esa referencia y correo. Revisa los datos o contacta a El Errante.';return;}
        result.innerHTML=timelineHtml(order);
      }catch(error){
        console.error(error);
        message.textContent='No fue posible consultar el estado en este momento. Inténtalo nuevamente o usa el canal de soporte.';
      }finally{button.disabled=false;button.textContent='Consultar estado';}
    });
    document.documentElement.dataset.trustVersion='1.9.0';
  }

  function confirmationLink(){
    if(document.body?.dataset.page!=='checkout')return;
    const main=document.querySelector('#main');
    if(!main)return;
    const enhance=()=>{
      const success=main.querySelector('.ee-v14-order-success');
      if(!success||success.dataset.v19Enhanced)return;
      const reference=[...success.querySelectorAll('strong')].map(node=>node.textContent.trim()).find(value=>value.startsWith('EE-'));
      if(!reference)return;
      success.dataset.v19Enhanced='true';
      success.insertAdjacentHTML('beforeend',`<div class="ee-v19-confirmation"><h3>Consulta el avance cuando lo necesites.</h3><p>Guarda la referencia y utiliza el mismo correo registrado.</p><a class="btn btn-outline" href="cuenta.html?pedido=${encodeURIComponent(reference)}">Consultar este pedido</a></div>`);
    };
    enhance();
    new MutationObserver(enhance).observe(main,{childList:true,subtree:true});
  }

  function adminCard(){
    if(document.body?.dataset.page!=='admin')return;
    const root=document.querySelector('#admin-dynamic');
    if(!root)return;
    const observer=new MutationObserver(async()=>{
      const grid=root.querySelector('.ee-v14-grid');
      if(!grid||grid.querySelector('[data-v19-admin]'))return;
      let config=settings();
      const remote=backendReady()&&window.__EE_ADMIN_SUPABASE__;
      if(remote){
        const response=await window.__EE_ADMIN_SUPABASE__.from('public_settings').select('value').eq('key','ordering').maybeSingle();
        if(!response.error&&response.data?.value)config={...config,...response.data.value};
      }
      grid.insertAdjacentHTML('beforeend',`<section class="ee-v14-card ee-v19-admin" data-v19-admin><p class="eyebrow">Confianza comercial · V1.9</p><h2>Cobertura, soporte y seguimiento</h2><p class="ee-v14-help">Esta información aparece en Checkout y en la consulta pública del pedido. No publiques números personales sin autorización.</p><div class="ee-v14-form-grid"><div class="ee-v14-field full"><label>Política de cobertura</label><textarea id="ee-v19-coverage">${escapeHtml(config.coverageDetails||config.deliveryPolicy||'')}</textarea></div><div class="ee-v14-field full"><label>Política de tarifa de entrega</label><textarea id="ee-v19-delivery-fee">${escapeHtml(config.deliveryFeePolicy||'')}</textarea></div><div class="ee-v14-field"><label>WhatsApp de soporte con indicativo</label><input id="ee-v19-whatsapp" value="${escapeHtml(config.supportWhatsapp||'')}" placeholder="573001234567"></div><div class="ee-v14-field"><label>Correo de soporte</label><input id="ee-v19-support-email" type="email" value="${escapeHtml(config.supportEmail||'')}"></div><div class="ee-v14-field"><label>Respuesta objetivo en horas</label><input id="ee-v19-response-hours" type="number" min="1" max="168" value="${Number(config.expectedResponseHours)||24}"></div></div><button class="ee-v14-btn terracotta" id="ee-v19-save-trust" style="margin-top:16px">Guardar configuración comercial</button><div id="ee-v19-admin-message" class="ee-v15-message" aria-live="polite"></div></section>`);
      grid.querySelector('#ee-v19-save-trust').addEventListener('click',async()=>{
        const payload={
          ...config,
          deliveryPolicy:grid.querySelector('#ee-v19-coverage').value.trim(),
          coverageDetails:grid.querySelector('#ee-v19-coverage').value.trim(),
          deliveryFeePolicy:grid.querySelector('#ee-v19-delivery-fee').value.trim(),
          supportWhatsapp:grid.querySelector('#ee-v19-whatsapp').value.trim(),
          supportEmail:grid.querySelector('#ee-v19-support-email').value.trim(),
          expectedResponseHours:Number(grid.querySelector('#ee-v19-response-hours').value)||24
        };
        const message=grid.querySelector('#ee-v19-admin-message');
        try{
          if(remote){
            const saved=await window.__EE_ADMIN_SUPABASE__.from('public_settings').upsert({key:'ordering',value:payload,updated_at:new Date().toISOString()},{onConflict:'key'});
            if(saved.error)throw saved.error;
          }else{
            const local=read(KEYS.settings,{});local.ordering=payload;write(KEYS.settings,local);
          }
          config=payload;message.textContent='Configuración comercial guardada.';message.dataset.type='ok';
        }catch(error){console.error(error);message.textContent='No fue posible guardar la configuración.';message.dataset.type='error';}
      });
      grid.querySelectorAll('[data-order-status]').forEach(select=>{
        const cell=select.closest('td');
        if(!cell||cell.querySelector('[data-v19-copy-status]'))return;
        const orderId=select.dataset.orderStatus;
        cell.insertAdjacentHTML('beforeend',`<button type="button" class="ee-v19-copy-update" data-v19-copy-status="${escapeHtml(orderId)}">Copiar actualización</button>`);
        cell.querySelector('[data-v19-copy-status]').addEventListener('click',async event=>{
          const status=STATUS[select.value]||{label:select.value,copy:'Estado actualizado.'};
          const text=`Hola. El pedido ${orderId} está en estado: ${status.label}. ${status.copy} Puedes consultarlo con tu referencia y correo en ${location.origin}${location.pathname.replace(/admin\.html$/,'cuenta.html')}`;
          try{await navigator.clipboard.writeText(text);event.currentTarget.textContent='Actualización copiada';setTimeout(()=>event.currentTarget.textContent='Copiar actualización',1600);}catch(_){event.currentTarget.textContent='No fue posible copiar';}
        });
      });
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initAccount();confirmationLink();adminCard();},{once:true});
  else{initAccount();confirmationLink();adminCard();}
})();
