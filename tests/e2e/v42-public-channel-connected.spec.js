const { test, expect } = require('@playwright/test');

const LOCAL_KEY='ee_v14_settings';
const REMOTE_DEFAULT={
  supportWhatsapp:'+57 300 700 8000',
  supportEmail:'remoto@elerrante.co',
  expectedResponseHours:6
};

async function prepareConnected(page,overrides={}){
  const scenario={
    isAdmin:true,
    rpcError:'',
    readError:'',
    upsertError:'',
    remoteValue:REMOTE_DEFAULT,
    ...overrides
  };

  await page.route('**/assets/commerce-runtime-config.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:`window.EL_ERRANTE_RUNTIME_CONFIG=Object.freeze({environment:"test-remote",backend:{provider:"supabase",url:"https://trap.supabase.invalid",publishableKey:"public-test",receiptBucket:"payment-receipts",shopperStorageKey:"ee-shopper-auth-v15",adminStorageKey:"ee-admin-auth-v15"}});`
  }));

  await page.addInitScript(config=>{
    window.__v42Calls={rpc:[],reads:0,upserts:[]};

    const publicTable=()=>({
      select(){return this;},
      eq(){return this;},
      async maybeSingle(){
        window.__v42Calls.reads+=1;
        if(config.readError)return {data:null,error:{message:config.readError}};
        return {data:{value:config.remoteValue},error:null};
      },
      async upsert(payload,options){
        window.__v42Calls.upserts.push({payload,options});
        if(config.upsertError)return {data:null,error:{message:config.upsertError}};
        return {data:null,error:null};
      }
    });

    window.__EE_PUBLIC_CHANNEL_SUPABASE__={
      async rpc(name){
        window.__v42Calls.rpc.push(name);
        if(config.rpcError)return {data:null,error:{message:config.rpcError}};
        return {data:config.isAdmin,error:null};
      },
      from(name){
        if(name!=='public_settings')throw new Error(`Tabla remota inesperada: ${name}`);
        return publicTable();
      }
    };

    // Mantiene admin-v15 completamente aislado de red. La suite prueba el contrato
    // del módulo V4, no autenticación real de Supabase.
    window.__EE_ADMIN_SUPABASE__={
      auth:{
        async getSession(){return {data:{session:null},error:null};},
        async signInWithPassword(){return {data:{session:null},error:{message:'Login deshabilitado en harness V4.2'}};},
        async signOut(){return {error:null};}
      },
      async rpc(){return {data:false,error:null};}
    };
  },scenario);

  await page.goto('/admin.html',{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.publicChannelSettingsVersion||''))
    .toBe('4.4.0');
}

async function mountRemote(page,localSeed={ordering:{supportWhatsapp:'LOCAL-ONLY',supportEmail:'local@example.com',expectedResponseHours:48,sentinel:'preserve'}}){
  await page.evaluate(({key,seed})=>{
    localStorage.setItem(key,JSON.stringify(seed));
    const root=document.getElementById('admin-dynamic');
    if(!root)throw new Error('Falta #admin-dynamic');
    root.innerHTML=`<section data-v42-remote-harness>
      <div class="ee-v15-sessionbar"><strong>Administración conectada</strong></div>
      <div class="ee-v14-grid"></div>
    </section>`;
  },{key:LOCAL_KEY,seed:localSeed});
  return localSeed;
}

async function localSnapshot(page){
  return page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),LOCAL_KEY);
}

async function remoteCalls(page){
  return page.evaluate(()=>JSON.parse(JSON.stringify(window.__v42Calls)));
}

test.describe('V4.2 contrato conectado de canales públicos',()=>{
  test('admin autorizado carga remoto, sincroniza y no muta la simulación local',async({page})=>{
    await prepareConnected(page);
    const localSeed=await mountRemote(page);

    const settings=page.locator('[data-public-channel-settings][data-mode="remote"]');
    await expect(settings).toBeVisible();
    await expect(settings.locator('#ee-public-whatsapp')).toHaveValue(REMOTE_DEFAULT.supportWhatsapp);
    await expect(settings.locator('#ee-public-email')).toHaveValue(REMOTE_DEFAULT.supportEmail);
    await expect(settings.locator('#ee-public-response-hours')).toHaveValue(String(REMOTE_DEFAULT.expectedResponseHours));

    await settings.locator('#ee-public-whatsapp').fill('+57 301 222 3344');
    await settings.locator('#ee-public-email').fill('canales@elerrante.co');
    await settings.locator('#ee-public-response-hours').fill('10');
    await settings.locator('#ee-save-public-channels').click();
    await expect(settings.locator('#ee-public-channel-status')).toContainText('Canales públicos sincronizados');

    const calls=await remoteCalls(page);
    expect(calls.rpc).toEqual(['is_admin']);
    expect(calls.reads).toBe(1);
    expect(calls.upserts).toHaveLength(1);
    expect(calls.upserts[0].payload.key).toBe('ordering');
    expect(calls.upserts[0].payload.value.supportWhatsapp).toBe('+57 301 222 3344');
    expect(calls.upserts[0].payload.value.supportEmail).toBe('canales@elerrante.co');
    expect(calls.upserts[0].payload.value.expectedResponseHours).toBe(10);
    expect(calls.upserts[0].options).toEqual({onConflict:'key'});
    expect(await localSnapshot(page)).toEqual(localSeed);
  });

  test('is_admin=false bloquea el editor remoto y no cae a configuración local',async({page})=>{
    await prepareConnected(page,{isAdmin:false});
    const localSeed=await mountRemote(page);

    const error=page.locator('[data-public-channel-settings="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('La sesión no tiene permisos administrativos.');
    await expect(page.locator('#ee-save-public-channels')).toHaveCount(0);

    const calls=await remoteCalls(page);
    expect(calls.rpc).toEqual(['is_admin']);
    expect(calls.reads).toBe(0);
    expect(calls.upserts).toHaveLength(0);
    expect(await localSnapshot(page)).toEqual(localSeed);
  });

  test('sesión expirada o RPC fallida muestra error y no sustituye remoto por local',async({page})=>{
    await prepareConnected(page,{rpcError:'JWT expired'});
    const localSeed=await mountRemote(page);

    const error=page.locator('[data-public-channel-settings="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('JWT expired');

    const calls=await remoteCalls(page);
    expect(calls.rpc).toEqual(['is_admin']);
    expect(calls.reads).toBe(0);
    expect(calls.upserts).toHaveLength(0);
    expect(await localSnapshot(page)).toEqual(localSeed);
  });

  test('fallo de lectura remota no usa silenciosamente ee_v14_settings',async({page})=>{
    await prepareConnected(page,{readError:'network unavailable'});
    const localSeed=await mountRemote(page);

    const error=page.locator('[data-public-channel-settings="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('network unavailable');
    await expect(page.locator('#ee-public-whatsapp')).toHaveCount(0);

    const calls=await remoteCalls(page);
    expect(calls.rpc).toEqual(['is_admin']);
    expect(calls.reads).toBe(1);
    expect(calls.upserts).toHaveLength(0);
    expect(await localSnapshot(page)).toEqual(localSeed);
  });

  test('rechazo RLS al guardar conserva error visible y cero mutación local',async({page})=>{
    await prepareConnected(page,{upsertError:'new row violates row-level security policy'});
    const localSeed=await mountRemote(page);

    const settings=page.locator('[data-public-channel-settings][data-mode="remote"]');
    await expect(settings).toBeVisible();
    await settings.locator('#ee-public-whatsapp').fill('+57 302 999 1122');
    await settings.locator('#ee-save-public-channels').click();
    await expect(settings.locator('#ee-public-channel-status')).toContainText('new row violates row-level security policy');
    await expect(settings.locator('#ee-public-channel-status')).toHaveAttribute('data-type','error');

    const calls=await remoteCalls(page);
    expect(calls.rpc).toEqual(['is_admin']);
    expect(calls.reads).toBe(1);
    expect(calls.upserts).toHaveLength(1);
    expect(await localSnapshot(page)).toEqual(localSeed);
  });
});
