const { test, expect } = require('@playwright/test');

const LOCAL_KEY='ee_v14_settings';
const ADMIN_SESSION={user:{id:'admin-v42',email:'admin@elerrante.co',is_anonymous:false}};

async function prepare(page){
  await page.route('**/assets/commerce-runtime-config.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:`window.EL_ERRANTE_RUNTIME_CONFIG=Object.freeze({environment:"test-remote",backend:{provider:"supabase",url:"https://trap.supabase.invalid",publishableKey:"public-test",receiptBucket:"payment-receipts",shopperStorageKey:"ee-shopper-auth-v15",adminStorageKey:"ee-admin-auth-v15"}});`
  }));

  await page.addInitScript(session=>{
    window.__v42Connectivity={session:null,isAdmin:false,rpcError:'',upserts:0,authEvents:[]};
    window.__v42ConnectivityAuthCallback=null;

    window.__EE_ADMIN_SUPABASE__={
      auth:{
        async getSession(){return {data:{session:window.__v42Connectivity.session},error:null};},
        async signInWithPassword(){return {data:{session:null},error:{message:'Login deshabilitado en harness V4.2'}};},
        async signOut(){
          window.__v42Connectivity.session=null;
          window.__v42ConnectivityAuthCallback?.('SIGNED_OUT',null);
          return {error:null};
        },
        onAuthStateChange(callback){
          window.__v42ConnectivityAuthCallback=callback;
          return {data:{subscription:{unsubscribe(){if(window.__v42ConnectivityAuthCallback===callback)window.__v42ConnectivityAuthCallback=null;}}}};
        }
      },
      async rpc(name){
        if(name!=='is_admin')throw new Error(`RPC inesperado: ${name}`);
        if(window.__v42Connectivity.rpcError)return {data:null,error:{message:window.__v42Connectivity.rpcError}};
        return {data:window.__v42Connectivity.isAdmin,error:null};
      }
    };

    const publicTable=()=>({
      select(){return this;},
      eq(){return this;},
      async maybeSingle(){return {data:{value:{supportWhatsapp:'+57 300 000 0000',supportEmail:'hola@elerrante.co',expectedResponseHours:12}},error:null};},
      async upsert(){window.__v42Connectivity.upserts+=1;return {data:null,error:null};}
    });
    window.__EE_PUBLIC_CHANNEL_SUPABASE__={
      async rpc(){return {data:true,error:null};},
      from(name){if(name!=='public_settings')throw new Error(`Tabla inesperada: ${name}`);return publicTable();}
    };
    window.__V42_ADMIN_SESSION__=session;
  },ADMIN_SESSION);

  await page.goto('/admin.html',{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityVersion||''))
    .toBe('4.2.0');
}

async function mountRemote(page){
  await page.evaluate(()=>{
    window.__v42Connectivity.session=window.__V42_ADMIN_SESSION__;
    window.__v42Connectivity.isAdmin=true;
    const root=document.getElementById('admin-dynamic');
    root.innerHTML='<div class="ee-v15-sessionbar"><div><strong>Administración conectada</strong></div></div><div class="ee-v14-grid"></div>';
  });
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
    .toBe('CONNECTED');
  await expect(page.locator('[data-public-channel-settings][data-mode="remote"]')).toBeVisible();
}

async function emit(page,event,patch={}){
  await page.evaluate(({event,patch})=>{
    Object.assign(window.__v42Connectivity,patch);
    const session=window.__v42Connectivity.session;
    window.__v42Connectivity.authEvents.push(event);
    window.__v42ConnectivityAuthCallback?.(event,session);
  },{event,patch});
}

async function snapshot(page){
  return page.evaluate(key=>({
    state:document.documentElement.dataset.adminConnectivityState||'',
    inert:document.getElementById('admin-dynamic')?.inert||false,
    local:localStorage.getItem(key),
    upserts:window.__v42Connectivity.upserts
  }),LOCAL_KEY);
}

test.describe('V4.2 verdad de sesión y conectividad administrativa',()=>{
  test('sesión admin válida expone CONNECTED y conserva regiones operables',async({page})=>{
    await prepare(page);
    await mountRemote(page);

    await expect(page.locator('#ee-admin-connectivity-v42')).toHaveAttribute('data-state','CONNECTED');
    await expect(page.locator('#ee-admin-connectivity-v42')).toContainText('Conexión administrativa validada');
    expect((await snapshot(page)).inert).toBe(false);
  });

  test('SIGNED_OUT cambia a AUTH_REQUIRED y bloquea mutaciones sin fallback local',async({page})=>{
    await prepare(page);
    await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({ordering:{sentinel:'preserve'}})),LOCAL_KEY);
    await mountRemote(page);

    await emit(page,'SIGNED_OUT',{session:null});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('AUTH_REQUIRED');
    await expect(page.locator('#ee-admin-connectivity-v42')).toContainText('Sesión administrativa requerida');

    await page.evaluate(()=>document.querySelector('#ee-save-public-channels')?.click());
    const value=await snapshot(page);
    expect(value.inert).toBe(true);
    expect(value.upserts).toBe(0);
    expect(JSON.parse(value.local)).toEqual({ordering:{sentinel:'preserve'}});
  });

  test('preflight detecta expiración silenciosa justo antes del upsert',async({page})=>{
    await prepare(page);
    await mountRemote(page);

    await page.evaluate(()=>{window.__v42Connectivity.session=null;});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('CONNECTED');

    await page.locator('#ee-save-public-channels').click();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('AUTH_REQUIRED');
    await expect(page.locator('#ee-public-channel-status')).toContainText('sesión administrativa', {ignoreCase:true});
    const value=await snapshot(page);
    expect(value.upserts).toBe(0);
    expect(value.inert).toBe(true);
  });

  test('pérdida de is_admin cambia a FORBIDDEN y mantiene cero escrituras',async({page})=>{
    await prepare(page);
    await mountRemote(page);

    await emit(page,'TOKEN_REFRESHED',{session:ADMIN_SESSION,isAdmin:false});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('FORBIDDEN');
    await expect(page.locator('#ee-admin-connectivity-v42')).toContainText('Acceso administrativo no autorizado');

    await page.evaluate(()=>document.querySelector('#ee-save-public-channels')?.click());
    const value=await snapshot(page);
    expect(value.inert).toBe(true);
    expect(value.upserts).toBe(0);
  });

  test('fallo temporal de RPC produce REMOTE_ERROR sin borrar formularios',async({page})=>{
    await prepare(page);
    await mountRemote(page);
    const email=page.locator('#ee-public-email');
    await email.fill('borrador@elerrante.co');

    await emit(page,'TOKEN_REFRESHED',{session:ADMIN_SESSION,isAdmin:true,rpcError:'network unavailable'});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('REMOTE_ERROR');
    await expect(page.locator('#ee-admin-connectivity-v42')).toContainText('network unavailable');
    await expect(email).toHaveValue('borrador@elerrante.co');
    expect((await snapshot(page)).inert).toBe(true);
  });

  test('una sesión admin válida recupera CONNECTED y retira inert',async({page})=>{
    await prepare(page);
    await mountRemote(page);

    await emit(page,'TOKEN_REFRESHED',{session:ADMIN_SESSION,isAdmin:false});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('FORBIDDEN');

    await emit(page,'SIGNED_IN',{session:ADMIN_SESSION,isAdmin:true,rpcError:''});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('CONNECTED');
    expect((await snapshot(page)).inert).toBe(false);
  });

  test('simulación local queda LOCAL_PREVIEW y no se bloquea',async({page})=>{
    await prepare(page);
    await page.evaluate(()=>{
      const root=document.getElementById('admin-dynamic');
      root.innerHTML='<div class="ee-v15-sessionbar"><div><strong>Simulación local</strong></div></div><div class="ee-v14-grid"></div>';
    });
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('LOCAL_PREVIEW');
    await expect(page.locator('#ee-admin-connectivity-v42')).toContainText('Simulación local');
    expect((await snapshot(page)).inert).toBe(false);
  });
});
