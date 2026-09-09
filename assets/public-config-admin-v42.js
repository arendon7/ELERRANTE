(()=>{
  'use strict';

  const VERSION='4.2.0';
  const ROOT_ID='admin-dynamic';
  const SETTINGS_KEY='ee_v14_settings';
  const PRODUCTS_KEY='ee_v14_products';
  const GROUPS=Object.freeze({
    ordering:Object.freeze(['deliveryPolicy','deliveryFeePolicy','coverageDetails','supportWhatsapp','supportEmail','expectedResponseHours','requireReceipt','maxReceiptBytesPreview']),
    payment:Object.freeze(['bank','accountType','accountHolder','accountNumber','key','instructions'])
  });
  const BASE=()=>window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const root=()=>document.getElementById(ROOT_ID);
  const isRecord=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
  const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const backendReady=()=>Boolean(BASE().backend?.url&&BASE().backend?.publishableKey);

  let client=null;
  let mode='';
  let currentSettings={ordering:{},payment:{}};
  let busy=false;

  function readJson(key,fallback){
    try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}
  }

  function writeJson(key,value){
    localStorage.setItem(key,JSON.stringify(value));
  }

  function canonical(value){
    if(Array.isArray(value))return value.map(canonical);
    if(isRecord(value))return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
    return value;
  }

  const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));

  function localRaw(){
    const value=readJson(SETTINGS_KEY,{});
    return isRecord(value)?value:{};
  }

  function localSettings(){
    const raw=localRaw();
    return {
      ordering:{...(BASE().ordering||{}),...(isRecord(raw.ordering)?raw.ordering:{})},
      payment:{...(BASE().payment||{}),...(isRecord(raw.payment)?raw.payment:{})}
    };
  }

  async function adminClient(){
    if(window.__EE_ADMIN_SUPABASE__)return window.__EE_ADMIN_SUPABASE__;
    if(!backendReady())throw new Error('Backend no configurado.');
    const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const cfg=BASE();
    window.__EE_ADMIN_SUPABASE__=module.createClient(cfg.backend.url,cfg.backend.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:cfg.backend.adminStorageKey||'ee-admin-auth-v15'}
    });
    return window.__EE_ADMIN_SUPABASE__;
  }

  async function authorized(db){
    const result=await db.rpc('is_admin');
    if(result.error)throw result.error;
    return result.data===true;
  }

  async function readRemoteGroup(db,group){
    const result=await db.from('public_settings').select('key,value,updated_at').eq('key',group).maybeSingle();
    if(result.error)throw result.error;
    return {exists:Boolean(result.data),raw:isRecord(result.data?.value)?clone(result.data.value):{},updatedAt:result.data?.updated_at||''};
  }

  async function remoteSettings(db){
    const [ordering,payment]=await Promise.all([readRemoteGroup(db,'ordering'),readRemoteGroup(db,'payment')]);
    return {
      ordering:{...(BASE().ordering||{}),...ordering.raw},
      payment:{...(BASE().payment||{}),...payment.raw}
    };
  }

  function catalogueRowsLocal(){
    const overrides=readJson(PRODUCTS_KEY,{});
    const products=Array.isArray(window.EE_DATA?.products)?window.EE_DATA.products:[];
    return products.map(product=>{
      const variant=Array.isArray(product.variants)?product.variants[0]||{}:{};
      const id=product.id||variant.id;
      if(!id)return null;
      const saved=isRecord(overrides[id])?overrides[id]:{};
      const inventoryKnown=hasOwn(saved,'inventory')||hasOwn(product,'inventory')||hasOwn(variant,'inventory');
      const inventory=hasOwn(saved,'inventory')?saved.inventory:(hasOwn(product,'inventory')?product.inventory:variant.inventory);
      const active=hasOwn(saved,'active')?saved.active!==false:(hasOwn(product,'active')?product.active!==false:true);
      return {id,name:product.name||product.title||variant.name||id,active,inventoryKnown,inventory:inventoryKnown?Number(inventory):null};
    }).filter(Boolean);
  }

  async function catalogueRowsRemote(db){
    const result=await db.from('product_operations').select('product_id,product_name,inventory,active,sale_price').order('product_name',{ascending:true});
    if(result.error)throw result.error;
    return (result.data||[]).map(item=>({
      id:item.product_id,
      name:item.product_name||item.product_id,
      active:item.active!==false,
      inventoryKnown:item.inventory!==null&&item.inventory!==undefined&&item.inventory!=='',
      inventory:item.inventory===null||item.inventory===undefined||item.inventory===''?null:Number(item.inventory)
    }));
  }

  function availabilityMarkup(rows,error=''){
    if(error)return `<section class="ee-v14-card" data-public-config-availability><p class="eyebrow">Disponibilidad comercial</p><h2>Lectura derivada</h2><p class="ee-v14-help">No fue posible derivar la disponibilidad del catálogo: ${escapeHtml(error)}</p><p class="ee-v14-note">No existe un setting manual de disponibilidad en V4.2.</p></section>`;
    const active=rows.filter(item=>item.active).length;
    const known=rows.filter(item=>item.inventoryKnown).length;
    const pending=rows.length-known;
    const positive=rows.filter(item=>item.active&&item.inventoryKnown&&Number(item.inventory)>0).length;
    const sample=rows.slice(0,8).map(item=>`<tr><td>${escapeHtml(item.name)}</td><td>${item.active?'Activa':'Inactiva'}</td><td>${item.inventoryKnown?escapeHtml(item.inventory):'Desconocido'}</td></tr>`).join('');
    return `<section class="ee-v14-card" data-public-config-availability><p class="eyebrow">Disponibilidad comercial · sólo lectura</p><h2>Derivada del catálogo, no de un setting inventado.</h2><p class="ee-v14-help">Referencias: <strong>${rows.length}</strong> · activas: <strong>${active}</strong> · stock conocido: <strong>${known}</strong> · stock desconocido: <strong>${pending}</strong> · activas con stock positivo conocido: <strong>${positive}</strong>.</p>${sample?`<div class="ee-v14-table-wrap"><table class="ee-v14-table"><thead><tr><th>Referencia</th><th>Estado</th><th>Inventario</th></tr></thead><tbody>${sample}</tbody></table></div>`:'<p class="ee-v14-empty">No hay referencias de catálogo para resumir.</p>'}<p class="ee-v14-note" style="margin-top:12px">“Desconocido” se conserva como desconocido; esta vista no convierte ausencia de dato en cero. La cobertura y coordinación se editan en <code>ordering</code>.</p></section>`;
  }

  function orderingMarkup(settings){
    const value=settings.ordering||{};
    return `<section class="ee-v14-card" data-public-config-card="ordering"><p class="eyebrow">Atención, cobertura y comprobante</p><h2>Pedidos y coordinación pública</h2><form data-public-config-form="ordering"><div class="ee-v14-form-grid"><div class="ee-v14-field full"><label for="pc-delivery-policy">Política de entrega</label><textarea id="pc-delivery-policy" data-field="deliveryPolicy">${escapeHtml(value.deliveryPolicy||'')}</textarea></div><div class="ee-v14-field full"><label for="pc-delivery-fee">Política de tarifa</label><textarea id="pc-delivery-fee" data-field="deliveryFeePolicy">${escapeHtml(value.deliveryFeePolicy||'')}</textarea></div><div class="ee-v14-field full"><label for="pc-coverage">Cobertura</label><textarea id="pc-coverage" data-field="coverageDetails">${escapeHtml(value.coverageDetails||'')}</textarea></div><div class="ee-v14-field"><label for="pc-whatsapp">WhatsApp público</label><input id="pc-whatsapp" data-field="supportWhatsapp" inputmode="tel" value="${escapeHtml(value.supportWhatsapp||'')}"></div><div class="ee-v14-field"><label for="pc-email">Correo público</label><input id="pc-email" data-field="supportEmail" type="email" value="${escapeHtml(value.supportEmail||'')}"></div><div class="ee-v14-field"><label for="pc-response-hours">Respuesta objetivo (horas)</label><input id="pc-response-hours" data-field="expectedResponseHours" type="number" min="1" max="168" value="${Number(value.expectedResponseHours)||24}"></div><div class="ee-v14-field"><label for="pc-max-receipt">Máximo comprobante preview (bytes)</label><input id="pc-max-receipt" data-field="maxReceiptBytesPreview" type="number" min="100000" max="20000000" step="100000" value="${Number(value.maxReceiptBytesPreview)||5000000}"></div><div class="ee-v14-field full"><label><input data-field="requireReceipt" type="checkbox" ${value.requireReceipt!==false?'checked':''}> Exigir comprobante cuando aplique el flujo de transferencia</label></div></div><button class="ee-v14-btn terracotta" type="submit">Guardar pedidos y cobertura</button><p class="ee-v14-help" data-public-config-message aria-live="polite" style="margin-top:10px"></p></form></section>`;
  }

  function paymentMarkup(settings){
    const value=settings.payment||{};
    return `<section class="ee-v14-card" data-public-config-card="payment"><p class="eyebrow">Checkout y transferencia</p><h2>Datos públicos de pago</h2><p class="ee-v14-help">Nunca se almacenan aquí contraseñas bancarias. Estos datos son visibles para el comprador cuando el flujo de transferencia está habilitado.</p><form data-public-config-form="payment"><div class="ee-v14-form-grid"><div class="ee-v14-field"><label for="pc-bank">Banco</label><input id="pc-bank" data-field="bank" value="${escapeHtml(value.bank||'')}"></div><div class="ee-v14-field"><label for="pc-account-type">Tipo de cuenta</label><input id="pc-account-type" data-field="accountType" value="${escapeHtml(value.accountType||'')}"></div><div class="ee-v14-field"><label for="pc-holder">Titular</label><input id="pc-holder" data-field="accountHolder" value="${escapeHtml(value.accountHolder||'')}"></div><div class="ee-v14-field"><label for="pc-account">Número de cuenta</label><input id="pc-account" data-field="accountNumber" value="${escapeHtml(value.accountNumber||'')}"></div><div class="ee-v14-field full"><label for="pc-key">Llave / identificador</label><input id="pc-key" data-field="key" value="${escapeHtml(value.key||'')}"></div><div class="ee-v14-field full"><label for="pc-instructions">Instrucciones de pago</label><textarea id="pc-instructions" data-field="instructions">${escapeHtml(value.instructions||'')}</textarea></div></div><button class="ee-v14-btn terracotta" type="submit">Guardar datos de pago</button><p class="ee-v14-help" data-public-config-message aria-live="polite" style="margin-top:10px"></p></form></section>`;
  }

  function sessionBar(currentMode,user=null){
    if(currentMode==='remote')return `<div class="ee-v15-sessionbar"><div><strong>Administración conectada</strong><span>${escapeHtml(user?.email||'Usuario autorizado')} · public_settings</span></div><div class="ee-v14-actions"><button class="ee-v14-btn secondary" type="button" data-public-config-refresh>Actualizar</button><button class="ee-v14-btn" type="button" data-public-config-signout>Cerrar sesión</button></div></div>`;
    return `<div class="ee-v15-sessionbar"><div><strong>Simulación local</strong><span>Los cambios permanecen únicamente en este navegador.</span></div><div class="ee-v14-actions"><button class="ee-v14-btn secondary" type="button" data-public-config-refresh>Actualizar</button>${backendReady()?'<button class="ee-v14-btn" type="button" data-public-config-connect>Conectar administración</button>':''}</div></div>`;
  }

  function loginMarkup(message=''){
    return `<section class="ee-v14-card" data-public-config-login><p class="eyebrow">V4.2 · sesión administrativa</p><h2>Conectar configuración compartida</h2><p class="ee-v14-help">La conexión remota no usa la copia local como fallback. Si prefieres revisar sin publicar, entra explícitamente a simulación local.</p><form id="ee-admin-login" class="ee-v14-form-grid"><div class="ee-v14-field"><label for="pc-login-email">Correo</label><input id="pc-login-email" name="email" type="email" autocomplete="username" required></div><div class="ee-v14-field"><label for="pc-login-password">Contraseña</label><input id="pc-login-password" name="password" type="password" autocomplete="current-password" required></div><div class="ee-v14-field full"><div class="ee-v14-actions"><button class="ee-v14-btn terracotta" type="submit">Conectar</button><button class="ee-v14-btn secondary" type="button" data-public-config-local>Usar simulación local</button></div></div></form><p class="ee-v14-help" data-public-config-login-message aria-live="polite">${escapeHtml(message)}</p></section>`;
  }

  function setMessage(form,text,type='ok'){
    const node=form.querySelector('[data-public-config-message]');
    if(!node)return;
    node.textContent=text;
    node.dataset.type=type;
  }

  function collectGroup(form,group){
    const result={};
    for(const field of GROUPS[group]){
      const node=form.querySelector(`[data-field="${CSS.escape(field)}"]`);
      if(!node)continue;
      if(node.type==='checkbox')result[field]=Boolean(node.checked);
      else if(field==='expectedResponseHours')result[field]=Math.max(1,Math.min(168,Number(node.value)||24));
      else if(field==='maxReceiptBytesPreview')result[field]=Math.max(100000,Math.min(20000000,Number(node.value)||5000000));
      else result[field]=String(node.value||'').trim();
    }
    const email=form.querySelector('[data-field="supportEmail"]');
    if(email&&!email.reportValidity())throw new Error('Revisa el correo público.');
    return result;
  }

  async function availability(currentMode,db){
    try{
      const rows=currentMode==='remote'?await catalogueRowsRemote(db):catalogueRowsLocal();
      return availabilityMarkup(rows);
    }catch(error){return availabilityMarkup([],error?.message||'Error de lectura.');}
  }

  async function renderDashboard(currentMode,user=null){
    const container=root();
    if(!container)return;
    mode=currentMode;
    busy=true;
    try{
      currentSettings=currentMode==='remote'?await remoteSettings(client):localSettings();
      const availabilityHtml=await availability(currentMode,client);
      container.innerHTML=`${sessionBar(currentMode,user)}<div id="ee-admin-message" class="ee-v15-message" aria-live="polite"></div><div class="ee-v14-grid" style="margin-top:16px">${orderingMarkup(currentSettings)}${paymentMarkup(currentSettings)}${availabilityHtml}</div>`;
      document.documentElement.dataset.publicConfigMode=currentMode==='remote'?'CONNECTED':'LOCAL_PREVIEW';
    }finally{busy=false;}
  }

  function renderLogin(message=''){
    const container=root();
    if(!container)return;
    mode='login';
    container.innerHTML=loginMarkup(message);
    document.documentElement.dataset.publicConfigMode='AUTH_REQUIRED';
  }

  async function bootstrap(){
    if(!backendReady()){
      await renderDashboard('local');
      return;
    }
    try{
      client=await adminClient();
      const sessionResult=await client.auth.getSession();
      if(sessionResult.error)throw sessionResult.error;
      const session=sessionResult.data?.session;
      if(!session||session.user?.is_anonymous){renderLogin();return;}
      if(!await authorized(client)){renderLogin('La sesión existe, pero no tiene autorización administrativa.');return;}
      await renderDashboard('remote',session.user);
    }catch(error){
      renderLogin(error?.message||'No fue posible validar la sesión administrativa.');
    }
  }

  async function refreshPromotionGuard(){
    const container=root();
    container?.querySelector('[data-config-promotion-v42]')?.remove();
    try{await window.EL_ERRANTE_ADMIN_CONNECTIVITY?.revalidate?.();}catch(_){/* el guard ya presenta el error */}
  }

  async function saveLocal(form,group){
    const patch=collectGroup(form,group);
    const raw=localRaw();
    const current=isRecord(raw[group])?raw[group]:{};
    raw[group]={...current,...patch};
    writeJson(SETTINGS_KEY,raw);
    currentSettings=localSettings();
    setMessage(form,'Configuración guardada únicamente en esta simulación local.');
    window.dispatchEvent(new CustomEvent('ee:public-settings-updated',{detail:{group,mode:'local'}}));
  }

  async function saveRemote(form,group){
    const guard=window.EL_ERRANTE_ADMIN_CONNECTIVITY;
    if(!guard?.assertConnected)throw new Error('No está disponible el guard administrativo V4.2.');
    await guard.assertConnected();
    const db=client||await adminClient();
    const before=await readRemoteGroup(db,group);
    const patch=collectGroup(form,group);
    const next={...before.raw,...patch};
    await guard.assertConnected();
    const result=await db.from('public_settings').upsert({key:group,value:next,updated_at:new Date().toISOString()},{onConflict:'key'});
    if(result.error)throw result.error;
    const confirmed=await readRemoteGroup(db,group);
    if(!confirmed.exists||!same(confirmed.raw,next))throw new Error('La escritura respondió, pero la relectura no confirmó exactamente la configuración.');
    setMessage(form,'Configuración remota confirmada por relectura.');
    window.dispatchEvent(new CustomEvent('ee:public-settings-updated',{detail:{group,mode:'remote'}}));
    await refreshPromotionGuard();
  }

  async function onSubmit(event){
    const form=event.target.closest('[data-public-config-form]');
    if(!form)return;
    event.preventDefault();
    if(busy)return;
    const group=form.dataset.publicConfigForm;
    if(!GROUPS[group])return;
    const button=form.querySelector('button[type="submit"]');
    if(button)button.disabled=true;
    try{
      if(mode==='remote')await saveRemote(form,group);else if(mode==='local')await saveLocal(form,group);else throw new Error('Selecciona un modo administrativo antes de guardar.');
    }catch(error){setMessage(form,error?.message||'No fue posible guardar la configuración.','error');}
    finally{if(button)button.disabled=false;}
  }

  async function onLogin(event){
    const form=event.target.closest('#ee-admin-login');
    if(!form)return;
    event.preventDefault();
    const message=form.parentElement.querySelector('[data-public-config-login-message]');
    const button=form.querySelector('button[type="submit"]');
    if(button)button.disabled=true;
    try{
      client=await adminClient();
      const data=new FormData(form);
      const result=await client.auth.signInWithPassword({email:String(data.get('email')||'').trim(),password:String(data.get('password')||'')});
      if(result.error)throw result.error;
      const session=result.data?.session;
      if(!session||session.user?.is_anonymous)throw new Error('La autenticación no produjo una sesión administrativa válida.');
      if(!await authorized(client)){
        await client.auth.signOut();
        throw new Error('La cuenta no tiene autorización administrativa.');
      }
      await renderDashboard('remote',session.user);
    }catch(error){if(message){message.textContent=error?.message||'No fue posible iniciar sesión.';message.dataset.type='error';}}
    finally{if(button)button.disabled=false;}
  }

  async function onClick(event){
    const target=event.target instanceof Element?event.target:null;
    if(target?.closest('[data-public-config-local]')){await renderDashboard('local');return;}
    if(target?.closest('[data-public-config-connect]')){renderLogin();return;}
    if(target?.closest('[data-public-config-refresh]')){
      if(mode==='remote'){
        const session=(await client.auth.getSession()).data?.session;
        await renderDashboard('remote',session?.user||null);
      }else await renderDashboard('local');
      await refreshPromotionGuard();
      return;
    }
    if(target?.closest('[data-public-config-signout]')){
      try{await client?.auth?.signOut?.();}finally{renderLogin();}
    }
  }

  function init(){
    if(document.body?.dataset.page!=='configuracion-publica')return;
    const container=root();
    if(!container)return;
    document.addEventListener('submit',onSubmit);
    document.addEventListener('submit',onLogin);
    document.addEventListener('click',event=>{onClick(event).catch(()=>{});});
    bootstrap().catch(error=>renderLogin(error?.message||'Error de inicialización.'));
    document.documentElement.dataset.publicConfigVersion=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
