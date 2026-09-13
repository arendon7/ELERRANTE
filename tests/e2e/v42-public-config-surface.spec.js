const { test, expect } = require('@playwright/test');

const LOCAL_KEY='ee_v14_settings';
const ADMIN_SESSION={user:{id:'admin-public-config-v42',email:'admin@elerrante.co',is_anonymous:false}};

async function remoteHarness(page,{local={},remote={},products=[]}={}){
  await page.route('**/assets/commerce-runtime-config.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:'window.EL_ERRANTE_RUNTIME_CONFIG=Object.freeze({environment:"test-remote",backend:{provider:"supabase",url:"https://public-config.supabase.invalid",publishableKey:"public-test",receiptBucket:"payment-receipts",shopperStorageKey:"ee-shopper-auth-v15",adminStorageKey:"ee-admin-auth-v15"}});'
  }));

  await page.addInitScript(({remote,products,session})=>{
    const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
    window.__publicConfigHarness={
      session,
      isAdmin:true,
      rpcError:'',
      authCallback:null,
      rows:clone(remote),
      products:clone(products),
      writes:0,
      upsertAttempts:0,
      upsertError:''
    };

    function settingsQuery(){
      let key='';
      return {
        select(){return this;},
        eq(_field,value){key=value;return this;},
        async maybeSingle(){
          const value=window.__publicConfigHarness.rows[key];
          if(value===undefined||value===null)return {data:null,error:null};
          return {data:{key,value:clone(value),updated_at:'2026-09-07T12:00:00Z'},error:null};
        },
        async upsert(payload){
          window.__publicConfigHarness.upsertAttempts+=1;
          if(window.__publicConfigHarness.upsertError)return {data:null,error:{message:window.__publicConfigHarness.upsertError}};
          window.__publicConfigHarness.rows[payload.key]=clone(payload.value);
          window.__publicConfigHarness.writes+=1;
          return {data:null,error:null};
        }
      };
    }

    const client={
      auth:{
        async getSession(){return {data:{session:window.__publicConfigHarness.session},error:null};},
        async signInWithPassword(){return {data:{session:null},error:{message:'Login no usado en harness conectado'}};},
        async signOut(){
          window.__publicConfigHarness.session=null;
          window.__publicConfigHarness.authCallback?.('SIGNED_OUT',null);
          return {error:null};
        },
        onAuthStateChange(callback){
          window.__publicConfigHarness.authCallback=callback;
          return {data:{subscription:{unsubscribe(){if(window.__publicConfigHarness.authCallback===callback)window.__publicConfigHarness.authCallback=null;}}}};
        }
      },
      async rpc(name){
        if(name!=='is_admin')throw new Error(`RPC inesperado: ${name}`);
        if(window.__publicConfigHarness.rpcError)return {data:null,error:{message:window.__publicConfigHarness.rpcError}};
        return {data:window.__publicConfigHarness.isAdmin,error:null};
      },
      from(name){
        if(name==='public_settings')return settingsQuery();
        if(name==='product_operations')return {
          select(){return this;},
          async order(){return {data:clone(window.__publicConfigHarness.products),error:null};}
        };
        throw new Error(`Tabla inesperada: ${name}`);
      }
    };
    window.__EE_ADMIN_SUPABASE__=client;
  },{remote,products,session:ADMIN_SESSION});

  await page.addInitScript(local=>localStorage.setItem('ee_v14_settings',JSON.stringify(local)),local);
  await page.goto('/configuracion-publica.html',{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.publicConfigMode||''))
    .toBe('CONNECTED');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
    .toBe('CONNECTED');
}

async function state(page){
  return page.evaluate(key=>({
    local:localStorage.getItem(key),
    rows:JSON.parse(JSON.stringify(window.__publicConfigHarness?.rows||{})),
    writes:window.__publicConfigHarness?.writes||0,
    attempts:window.__publicConfigHarness?.upsertAttempts||0,
    connectivity:document.documentElement.dataset.adminConnectivityState||''
  }),LOCAL_KEY);
}

test.describe('V4.2 superficie administrativa coherente de configuración pública',()=>{
  test('preview local usa sólo ee_v14_settings y preserva campos locales desconocidos',async({page})=>{
    await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({ordering:{futureLocal:'preservar',supportEmail:'viejo@elerrante.co'}})),LOCAL_KEY);
    await page.goto('/configuracion-publica.html',{waitUntil:'load'});

    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.publicConfigMode||''))
      .toBe('LOCAL_PREVIEW');
    await expect(page.locator('.ee-v15-sessionbar strong')).toHaveText('Simulación local');
    await page.locator('[data-public-config-card="ordering"] [data-field="supportEmail"]').fill('nuevo@elerrante.co');
    await page.locator('[data-public-config-form="ordering"] button[type="submit"]').click();
    await expect(page.locator('[data-public-config-form="ordering"] [data-public-config-message]')).toContainText('simulación local');

    const local=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),LOCAL_KEY);
    expect(local.ordering.supportEmail).toBe('nuevo@elerrante.co');
    expect(local.ordering.futureLocal).toBe('preservar');
  });

  test('modo conectado lee remoto y no presenta la copia local como compartida',async({page})=>{
    await remoteHarness(page,{
      local:{ordering:{supportEmail:'local@elerrante.co'}},
      remote:{ordering:{supportEmail:'remoto@elerrante.co'},payment:{accountNumber:'999'}},
      products:[{product_id:'pizza-1',product_name:'Pizza uno',inventory:null,active:true,sale_price:25000}]
    });

    await expect(page.locator('.ee-v15-sessionbar strong')).toHaveText('Administración conectada');
    await expect(page.locator('[data-public-config-card="ordering"] [data-field="supportEmail"]')).toHaveValue('remoto@elerrante.co');
    await expect(page.locator('[data-public-config-card="payment"] [data-field="accountNumber"]')).toHaveValue('999');
    await expect(page.locator('[data-public-config-availability]')).toContainText('stock desconocido: 1');
    await expect(page.locator('[data-public-config-availability] input')).toHaveCount(0);
  });

  test('guardar ordering remoto preserva campos desconocidos y confirma por relectura',async({page})=>{
    const local={ordering:{supportEmail:'local@elerrante.co'}};
    await remoteHarness(page,{local,remote:{ordering:{supportEmail:'remoto@elerrante.co',serverOnly:'PRESERVAR'},payment:{}}});

    await page.locator('[data-public-config-card="ordering"] [data-field="supportEmail"]').fill('nuevo@elerrante.co');
    await page.locator('[data-public-config-card="ordering"] [data-field="coverageDetails"]').fill('Cobertura revisada');
    await page.locator('[data-public-config-form="ordering"] button[type="submit"]').click();
    await expect(page.locator('[data-public-config-form="ordering"] [data-public-config-message]')).toContainText('confirmada por relectura');

    const value=await state(page);
    expect(value.rows.ordering.supportEmail).toBe('nuevo@elerrante.co');
    expect(value.rows.ordering.coverageDetails).toBe('Cobertura revisada');
    expect(value.rows.ordering.serverOnly).toBe('PRESERVAR');
    expect(JSON.parse(value.local)).toEqual(local);
    expect(value.writes).toBe(1);
  });

  test('guardar payment remoto preserva campos desconocidos y no toca local',async({page})=>{
    const local={payment:{accountNumber:'LOCAL'}};
    await remoteHarness(page,{local,remote:{ordering:{},payment:{accountNumber:'111',serverOnly:'PRESERVAR'}}});

    await page.locator('[data-public-config-card="payment"] [data-field="accountNumber"]').fill('222');
    await page.locator('[data-public-config-card="payment"] [data-field="accountHolder"]').fill('El Errante');
    await page.locator('[data-public-config-form="payment"] button[type="submit"]').click();
    await expect(page.locator('[data-public-config-form="payment"] [data-public-config-message]')).toContainText('confirmada por relectura');

    const value=await state(page);
    expect(value.rows.payment.accountNumber).toBe('222');
    expect(value.rows.payment.accountHolder).toBe('El Errante');
    expect(value.rows.payment.serverOnly).toBe('PRESERVAR');
    expect(JSON.parse(value.local)).toEqual(local);
  });

  test('sesión expirada antes del save produce AUTH_REQUIRED y cero fallback local',async({page})=>{
    const local={ordering:{supportEmail:'local@elerrante.co'}};
    await remoteHarness(page,{local,remote:{ordering:{supportEmail:'remoto@elerrante.co'},payment:{}}});
    await page.locator('[data-public-config-card="ordering"] [data-field="supportEmail"]').fill('intento@elerrante.co');
    await page.evaluate(()=>{window.__publicConfigHarness.session=null;});
    await page.locator('[data-public-config-form="ordering"] button[type="submit"]').click();

    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('AUTH_REQUIRED');
    const value=await state(page);
    expect(value.attempts).toBe(0);
    expect(value.writes).toBe(0);
    expect(JSON.parse(value.local)).toEqual(local);
  });

  for(const failure of ['RLS reject','network unavailable']){
    test(`${failure} deja cero mutación confirmada y cero fallback local`,async({page})=>{
      const local={payment:{accountNumber:'LOCAL'}};
      await remoteHarness(page,{local,remote:{ordering:{},payment:{accountNumber:'111'}}});
      await page.evaluate(message=>{window.__publicConfigHarness.upsertError=message;},failure);
      await page.locator('[data-public-config-card="payment"] [data-field="accountNumber"]').fill('222');
      await page.locator('[data-public-config-form="payment"] button[type="submit"]').click();
      await expect(page.locator('[data-public-config-form="payment"] [data-public-config-message]')).toContainText(failure);

      const value=await state(page);
      expect(value.attempts).toBe(1);
      expect(value.writes).toBe(0);
      expect(value.rows.payment.accountNumber).toBe('111');
      expect(JSON.parse(value.local)).toEqual(local);
    });
  }

  test('la página no carga motores funcionales de Operación o Finanzas',async({page})=>{
    const requests=[];
    page.on('request',request=>requests.push(new URL(request.url()).pathname));
    await page.goto('/configuracion-publica.html',{waitUntil:'load'});
    const joined=requests.join('\n');
    expect(joined).not.toContain('finance-v27.js');
    expect(joined).not.toContain('operations-v16.js');
    expect(joined).not.toContain('daily-ops-v21.js');
    expect(joined).not.toContain('production-v22.js');
  });

  test('Centro y Admin enlazan explícitamente la nueva superficie',async({page})=>{
    const centerResponse=await page.request.get('/centro-interno.html');
    expect(centerResponse.ok()).toBeTruthy();
    expect(await centerResponse.text()).toContain('href="configuracion-publica.html"');

    const adminResponse=await page.request.get('/admin.html');
    expect(adminResponse.ok()).toBeTruthy();
    const adminHtml=await adminResponse.text();
    expect(adminHtml).toContain('href="configuracion-publica.html"');
    expect(adminHtml).toContain('Configuración pública V4.2');
  });
});
