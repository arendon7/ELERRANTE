(()=>{
  'use strict';

  const VERSION='4.4.0';
  const SETTINGS_KEY='ee_v14_settings';
  const ROOT_ID='admin-dynamic';

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const base=()=>window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const backendReady=()=>Boolean(base().backend?.url&&base().backend?.publishableKey);

  function localOrdering(){
    const saved=read(SETTINGS_KEY,{});
    return {...(base().ordering||{}),...(saved.ordering||{})};
  }

  function modeOf(root){
    const label=root.querySelector('.ee-v15-sessionbar strong')?.textContent||'';
    if(/Administración conectada/i.test(label))return 'remote';
    if(/Simulación local/i.test(label))return 'local';
    return '';
  }

  async function supabaseClient(){
    if(window.__EE_PUBLIC_CHANNEL_SUPABASE__)return window.__EE_PUBLIC_CHANNEL_SUPABASE__;
    if(!backendReady())throw new Error('Backend no configurado');
    const module=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const cfg=base();
    window.__EE_PUBLIC_CHANNEL_SUPABASE__=module.createClient(cfg.backend.url,cfg.backend.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:cfg.backend.adminStorageKey||'ee-admin-auth-v15'}
    });
    return window.__EE_PUBLIC_CHANNEL_SUPABASE__;
  }

  async function remoteOrdering(){
    const client=await supabaseClient();
    const authorized=await client.rpc('is_admin');
    if(authorized.error)throw authorized.error;
    if(authorized.data!==true)throw new Error('La sesión no tiene permisos administrativos.');
    const result=await client.from('public_settings').select('value').eq('key','ordering').maybeSingle();
    if(result.error)throw result.error;
    return {client,ordering:{...(base().ordering||{}),...(result.data?.value||{})}};
  }

  function markup(mode,ordering){
    const remote=mode==='remote';
    return `<section class="ee-v14-card" data-public-channel-settings data-version="${VERSION}">
      <p class="eyebrow">Canales públicos</p>
      <h2>WhatsApp y correo para Ayuda y eventos</h2>
      <p class="ee-v14-help">${remote?'Estos datos se sincronizan con la configuración pública y quedan disponibles en Ayuda y En Movimiento.':'Esta simulación guarda los canales únicamente en este navegador. No los publica para otros usuarios.'} Deja un campo vacío para ocultar ese canal.</p>
      <div class="ee-v14-form-grid">
        <div class="ee-v14-field"><label for="ee-public-whatsapp">WhatsApp público</label><input id="ee-public-whatsapp" inputmode="tel" autocomplete="tel" placeholder="+57 300 123 4567" value="${escapeHtml(ordering.supportWhatsapp||'')}"></div>
        <div class="ee-v14-field"><label for="ee-public-email">Correo público</label><input id="ee-public-email" type="email" autocomplete="email" placeholder="hola@elerrante.co" value="${escapeHtml(ordering.supportEmail||'')}"></div>
        <div class="ee-v14-field"><label for="ee-public-response-hours">Respuesta esperada (horas)</label><input id="ee-public-response-hours" type="number" min="1" max="168" step="1" value="${Number(ordering.expectedResponseHours)||24}"></div>
      </div>
      <div class="ee-v14-actions" style="margin-top:16px"><button class="ee-v14-btn terracotta" id="ee-save-public-channels" type="button">Guardar canales públicos</button></div>
      <p class="ee-v14-help" id="ee-public-channel-status" aria-live="polite" style="margin-top:12px">Abrir WhatsApp o correo nunca envía el mensaje automáticamente: el cliente revisa y confirma el envío en el canal externo.</p>
    </section>`;
  }

  function collect(section,current){
    const email=section.querySelector('#ee-public-email');
    if(email&&!email.reportValidity())throw new Error('Revisa el correo público.');
    const whatsapp=section.querySelector('#ee-public-whatsapp')?.value.trim()||'';
    const digits=whatsapp.replace(/\D/g,'');
    if(whatsapp&&digits.length<10)throw new Error('Revisa el número de WhatsApp.');
    const hours=Math.max(1,Math.min(168,Number(section.querySelector('#ee-public-response-hours')?.value)||24));
    return {...current,supportWhatsapp:whatsapp,supportEmail:email?.value.trim()||'',expectedResponseHours:hours};
  }

  function setStatus(section,text,type='ok'){
    const status=section.querySelector('#ee-public-channel-status');
    if(!status)return;
    status.textContent=text;
    status.dataset.type=type;
  }

  async function install(root,mode){
    const grid=root.querySelector('.ee-v14-grid');
    if(!grid)return;
    const existing=grid.querySelector('[data-public-channel-settings]');
    if(existing?.dataset.mode===mode)return;
    existing?.remove();

    let current=localOrdering();
    let client=null;
    if(mode==='remote'){
      try{
        const remote=await remoteOrdering();
        current=remote.ordering;
        client=remote.client;
      }catch(error){
        const section=document.createElement('section');
        section.className='ee-v14-card';
        section.dataset.publicChannelSettings='error';
        section.innerHTML='<p class="eyebrow">Canales públicos</p><h2>No fue posible cargar la configuración.</h2><p class="ee-v14-help"></p>';
        section.querySelector('.ee-v14-help').textContent=error?.message||'Error de autorización.';
        grid.append(section);
        return;
      }
    }

    const holder=document.createElement('div');
    holder.innerHTML=markup(mode,current).trim();
    const section=holder.firstElementChild;
    section.dataset.mode=mode;
    grid.append(section);

    section.querySelector('#ee-save-public-channels')?.addEventListener('click',async()=>{
      const button=section.querySelector('#ee-save-public-channels');
      button.disabled=true;
      try{
        current=collect(section,current);
        if(mode==='local'){
          const saved=read(SETTINGS_KEY,{});
          saved.ordering={...(saved.ordering||{}),...current};
          write(SETTINGS_KEY,saved);
          setStatus(section,'Canales guardados en esta simulación. Ayuda y En Movimiento los usarán en este navegador.');
          return;
        }
        const result=await client.from('public_settings').upsert({key:'ordering',value:current,updated_at:new Date().toISOString()},{onConflict:'key'});
        if(result.error)throw result.error;
        setStatus(section,'Canales públicos sincronizados. Ayuda y En Movimiento usarán esta configuración.');
      }catch(error){
        setStatus(section,error?.message||'No fue posible guardar los canales.','error');
      }finally{
        button.disabled=false;
      }
    });
  }

  function init(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    let active='';
    let busy=false;
    const sync=async()=>{
      const mode=modeOf(root);
      if(!mode||busy)return;
      const existing=root.querySelector('[data-public-channel-settings]');
      if(mode===active&&existing)return;
      busy=true;
      try{await install(root,mode);active=mode;}finally{busy=false;}
    };
    new MutationObserver(sync).observe(root,{childList:true,subtree:true,characterData:true});
    sync();
    document.documentElement.dataset.publicChannelSettingsVersion=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
