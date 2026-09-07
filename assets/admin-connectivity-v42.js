(()=>{
  'use strict';

  const VERSION='4.2.0';
  const SUPPORTED_PAGES=new Set(['admin','configuracion-publica']);
  const STATES=Object.freeze({
    CONNECTED:'CONNECTED',
    AUTH_REQUIRED:'AUTH_REQUIRED',
    FORBIDDEN:'FORBIDDEN',
    REMOTE_ERROR:'REMOTE_ERROR',
    LOCAL_PREVIEW:'LOCAL_PREVIEW'
  });
  const REGION_IDS=[
    'admin-dynamic','daily-ops-v21','production-v22','materials-v23',
    'measurement-v24','procurement-v25','finance-v27','operations-v16'
  ];
  const MUTATION_SELECTOR=[
    '#ee-save-products','#ee-save-costs','#ee-save-payment','#ee-save-public-channels',
    '#ee-v19-save-trust','[data-order-status]','[data-v25-action]','button[type="submit"]'
  ].join(',');

  const root=document.documentElement;
  const adminRoot=()=>document.querySelector('[data-admin-connectivity-root]')||document.getElementById('admin-dynamic');
  const config=()=>window.EL_ERRANTE_COMMERCE_CONFIG||{};
  const backendReady=()=>Boolean(config().backend?.url&&config().backend?.publishableKey);

  let state='';
  let detail='';
  let remoteSeen=false;
  let validationPromise=null;
  let observedMode='';
  let subscribedClient=null;
  let subscription=null;

  function modeOf(){
    const container=adminRoot();
    const label=container?.querySelector('.ee-v15-sessionbar strong')?.textContent||'';
    if(/Administración conectada/i.test(label))return 'remote';
    if(/Simulación local/i.test(label))return 'local';
    if(container?.querySelector('#ee-admin-login'))return 'login';
    return '';
  }

  function ensureBanner(){
    let banner=document.getElementById('ee-admin-connectivity-v42');
    if(banner)return banner;
    const container=adminRoot();
    if(!container?.parentElement)return null;
    banner=document.createElement('section');
    banner.id='ee-admin-connectivity-v42';
    banner.className='data-note';
    banner.setAttribute('aria-live','polite');
    banner.style.marginTop='18px';
    banner.hidden=true;
    banner.innerHTML='<strong data-connectivity-title></strong><span data-connectivity-copy style="display:block;margin-top:4px"></span><div class="button-row" data-connectivity-actions style="margin-top:10px"></div>';
    container.parentElement.insertBefore(banner,container);
    return banner;
  }

  function copyFor(next){
    if(next===STATES.CONNECTED)return ['Conexión administrativa validada.','Sesión vigente y autorización administrativa confirmada. Las mutaciones remotas están habilitadas.'];
    if(next===STATES.AUTH_REQUIRED)return ['Sesión administrativa requerida.','La sesión conectada ya no es válida. Las mutaciones remotas permanecen bloqueadas hasta autenticar nuevamente.'];
    if(next===STATES.FORBIDDEN)return ['Acceso administrativo no autorizado.','Existe una sesión, pero is_admin ya no autoriza esta superficie. No se enviarán cambios remotos.'];
    if(next===STATES.REMOTE_ERROR)return ['No fue posible validar la conexión.','La sesión no se considera segura mientras falle la verificación remota. Los formularios se conservan, pero las mutaciones quedan bloqueadas.'];
    return ['Simulación local.','Los datos permanecen en este navegador. Este estado no se presenta como una conexión remota.'];
  }

  function applyLock(next){
    const blocked=remoteSeen&&![STATES.CONNECTED,STATES.LOCAL_PREVIEW].includes(next);
    const loginVisible=Boolean(adminRoot()?.querySelector('#ee-admin-login'));
    REGION_IDS.forEach(id=>{
      const node=document.getElementById(id);
      if(!node)return;
      const shouldBlock=blocked&&!(id==='admin-dynamic'&&loginVisible);
      node.inert=shouldBlock;
      if(shouldBlock)node.setAttribute('aria-disabled','true');
      else node.removeAttribute('aria-disabled');
    });
  }

  function renderBanner(next,message=''){
    const banner=ensureBanner();
    if(!banner)return;
    const [title,copy]=copyFor(next);
    banner.hidden=false;
    banner.dataset.state=next;
    banner.querySelector('[data-connectivity-title]').textContent=title;
    banner.querySelector('[data-connectivity-copy]').textContent=message?`${copy} ${message}`:copy;
    const actions=banner.querySelector('[data-connectivity-actions]');
    actions.innerHTML='';
    if(next===STATES.AUTH_REQUIRED){
      const button=document.createElement('button');
      button.type='button';
      button.className='btn btn-outline btn-small';
      button.dataset.connectivityReload='true';
      button.textContent='Volver a iniciar sesión';
      actions.append(button);
    }else if(next===STATES.FORBIDDEN||next===STATES.REMOTE_ERROR||next===STATES.CONNECTED){
      const button=document.createElement('button');
      button.type='button';
      button.className='btn btn-outline btn-small';
      button.dataset.connectivityRevalidate='true';
      button.textContent='Revalidar conexión';
      actions.append(button);
    }
  }

  function setState(next,message=''){
    state=next;
    detail=message||'';
    root.dataset.adminConnectivityState=next;
    root.dataset.adminConnectivityVersion=VERSION;
    applyLock(next);
    renderBanner(next,detail);
    window.dispatchEvent(new CustomEvent('ee:admin-connectivity',{detail:{state:next,message:detail,version:VERSION}}));
    return next;
  }

  function adminClient(){
    return window.__EE_ADMIN_SUPABASE__||null;
  }

  function unsubscribe(){
    try{subscription?.unsubscribe?.();}catch(_){/* noop */}
    subscription=null;
    subscribedClient=null;
  }

  function subscribe(client){
    if(!client?.auth?.onAuthStateChange||subscribedClient===client)return;
    unsubscribe();
    subscribedClient=client;
    const result=client.auth.onAuthStateChange((event,session)=>{
      setTimeout(()=>{
        if(event==='SIGNED_OUT'||!session){
          remoteSeen=true;
          setState(STATES.AUTH_REQUIRED);
          return;
        }
        if(['SIGNED_IN','TOKEN_REFRESHED','USER_UPDATED','INITIAL_SESSION'].includes(event)){
          validateRemote(`Evento de sesión: ${event}`).catch(()=>{});
        }
      },0);
    });
    subscription=result?.data?.subscription||null;
  }

  function validateRemote(context=''){
    if(validationPromise)return validationPromise;
    validationPromise=(async()=>{
      const client=adminClient();
      if(!client){
        if(remoteSeen)setState(STATES.REMOTE_ERROR,'El cliente administrativo no está disponible.');
        return state;
      }
      try{
        subscribe(client);
        const sessionResult=await client.auth.getSession();
        if(sessionResult?.error)throw sessionResult.error;
        const session=sessionResult?.data?.session;
        if(!session||session.user?.is_anonymous){
          remoteSeen=true;
          return setState(STATES.AUTH_REQUIRED);
        }
        const authorized=await client.rpc('is_admin');
        if(authorized?.error)throw authorized.error;
        remoteSeen=true;
        if(authorized?.data!==true)return setState(STATES.FORBIDDEN);
        return setState(STATES.CONNECTED,context&&context!=='dom'?'Verificación actualizada.':'');
      }catch(error){
        remoteSeen=true;
        return setState(STATES.REMOTE_ERROR,error?.message||'Error remoto de validación.');
      }
    })().finally(()=>{validationPromise=null;});
    return validationPromise;
  }

  async function assertConnected(){
    await validateRemote('mutation');
    if(state!==STATES.CONNECTED){
      const error=new Error(
        state===STATES.AUTH_REQUIRED?'La sesión administrativa ya no está disponible.':
        state===STATES.FORBIDDEN?'La sesión no tiene autorización administrativa.':
        'No fue posible validar la conexión administrativa.'
      );
      error.code=`EE_ADMIN_${state||'UNKNOWN'}`;
      throw error;
    }
    return true;
  }

  async function syncFromDom(){
    const mode=modeOf();
    if(mode===observedMode)return;
    observedMode=mode;
    if(mode==='local'){
      remoteSeen=false;
      unsubscribe();
      setState(STATES.LOCAL_PREVIEW);
      return;
    }
    if(mode==='login'){
      if(!remoteSeen)unsubscribe();
      setState(STATES.AUTH_REQUIRED);
      return;
    }
    if(mode==='remote'){
      remoteSeen=true;
      await validateRemote('dom');
      return;
    }
    if(!backendReady()&&!remoteSeen)setState(STATES.LOCAL_PREVIEW);
  }

  function blockStaleMutation(event){
    if(!remoteSeen||state===STATES.CONNECTED||state===STATES.LOCAL_PREVIEW)return;
    const target=event.target instanceof Element?event.target:null;
    if(!target?.closest(MUTATION_SELECTOR))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderBanner(state,detail);
  }

  function bindActions(){
    document.addEventListener('click',blockStaleMutation,true);
    document.addEventListener('change',blockStaleMutation,true);
    document.addEventListener('submit',blockStaleMutation,true);
    document.addEventListener('click',event=>{
      const target=event.target instanceof Element?event.target:null;
      if(target?.closest('[data-connectivity-reload]'))location.reload();
      if(target?.closest('[data-connectivity-revalidate]'))validateRemote('manual').catch(()=>{});
    });
  }

  function init(){
    if(!SUPPORTED_PAGES.has(document.body?.dataset.page||''))return;
    const container=adminRoot();
    if(!container)return;
    ensureBanner();
    bindActions();
    new MutationObserver(()=>{syncFromDom().catch(()=>{});}).observe(container,{childList:true,subtree:true,characterData:true});
    syncFromDom().catch(()=>{});
  }

  const api=Object.freeze({
    version:VERSION,
    states:STATES,
    get state(){return state;},
    get detail(){return detail;},
    revalidate:()=>validateRemote('manual'),
    assertConnected
  });
  window.EL_ERRANTE_ADMIN_CONNECTIVITY=api;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
