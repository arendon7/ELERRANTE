const { test, expect } = require('@playwright/test');

const LOCAL_KEY='ee_v14_settings';
const ADMIN_SESSION={user:{id:'admin-promotion-v42',email:'admin@elerrante.co',is_anonymous:false}};

async function prepare(page,{local={},remote={}}={}){
  await page.route('**/assets/commerce-runtime-config.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:'window.EL_ERRANTE_RUNTIME_CONFIG=Object.freeze({environment:"test-remote",backend:{provider:"supabase",url:"https://promotion.supabase.invalid",publishableKey:"public-test",receiptBucket:"payment-receipts",shopperStorageKey:"ee-shopper-auth-v15",adminStorageKey:"ee-admin-auth-v15"}});'
  }));

  await page.addInitScript(({remote})=>{
    const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
    window.__promotionHarness={
      session:null,
      isAdmin:false,
      authCallback:null,
      rows:clone(remote),
      upsertAttempts:0,
      writes:0,
      upsertError:'',
      readError:''
    };

    function publicSettingsQuery(){
      let key='';
      return {
        select(){return this;},
        eq(_field,value){key=value;return this;},
        async maybeSingle(){
          if(window.__promotionHarness.readError)return {data:null,error:{message:window.__promotionHarness.readError}};
          const value=window.__promotionHarness.rows[key];
          if(value===undefined||value===null)return {data:null,error:null};
          return {data:{key,value:clone(value),updated_at:'2026-09-07T00:00:00Z'},error:null};
        },
        async upsert(payload){
          window.__promotionHarness.upsertAttempts+=1;
          if(window.__promotionHarness.upsertError)return {data:null,error:{message:window.__promotionHarness.upsertError}};
          window.__promotionHarness.rows[payload.key]=clone(payload.value);
          window.__promotionHarness.writes+=1;
          return {data:null,error:null};
        }
      };
    }

    const client={
      auth:{
        async getSession(){return {data:{session:window.__promotionHarness.session},error:null};},
        async signInWithPassword(){return {data:{session:null},error:{message:'Login deshabilitado en harness'}};},
        async signOut(){window.__promotionHarness.session=null;window.__promotionHarness.authCallback?.('SIGNED_OUT',null);return {error:null};},
        onAuthStateChange(callback){
          window.__promotionHarness.authCallback=callback;
          return {data:{subscription:{unsubscribe(){if(window.__promotionHarness.authCallback===callback)window.__promotionHarness.authCallback=null;}}}};
        }
      },
      async rpc(name){
        if(name!=='is_admin')throw new Error(`RPC inesperado: ${name}`);
        return {data:window.__promotionHarness.isAdmin,error:null};
      },
      from(name){
        if(name!=='public_settings')throw new Error(`Tabla inesperada en harness: ${name}`);
        return publicSettingsQuery();
      }
    };
    window.__EE_ADMIN_SUPABASE__=client;
    window.__EE_PUBLIC_CHANNEL_SUPABASE__=client;
  },{remote});

  await page.goto('/admin.html',{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.configPromotionVersion||''))
    .toBe('4.2.0');

  await page.evaluate(({local,session})=>{
    localStorage.setItem('ee_v14_settings',JSON.stringify(local));
    window.__promotionHarness.session=session;
    window.__promotionHarness.isAdmin=true;
    const root=document.getElementById('admin-dynamic');
    root.innerHTML='<div class="ee-v15-sessionbar"><div><strong>Administración conectada</strong></div></div><div class="ee-v14-grid"></div>';
  },{local,session:ADMIN_SESSION});

  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
    .toBe('CONNECTED');
  await expect(page.locator('[data-config-promotion-v42]')).toBeVisible();
}

const group= (page,name)=>page.locator(`[data-promotion-group="${name}"]`);
const status=(page,name)=>group(page,name).locator('[data-promotion-status]');

async function promote(page,name,field){
  await group(page,name).locator(`[data-promote-field="${name}:${field}"]`).check();
  page.once('dialog',dialog=>dialog.accept());
  await group(page,name).locator(`[data-promote-group="${name}"]`).click();
}

async function harness(page){
  return page.evaluate(key=>({
    rows:JSON.parse(JSON.stringify(window.__promotionHarness.rows)),
    upsertAttempts:window.__promotionHarness.upsertAttempts,
    writes:window.__promotionHarness.writes,
    local:localStorage.getItem(key),
    connectivity:document.documentElement.dataset.adminConnectivityState||''
  }),LOCAL_KEY);
}

test.describe('V4.2 promoción explícita local → remoto',()=>{
  test('local == remoto queda IGUAL y no requiere escritura',async({page})=>{
    const payment={accountNumber:'123456'};
    await prepare(page,{local:{payment},remote:{payment}});
    await expect(status(page,'payment')).toHaveText('IGUAL');
    await expect(group(page,'payment').locator('[data-promote-group="payment"]')).toBeDisabled();
    expect((await harness(page)).writes).toBe(0);
  });

  test('SÓLO LOCAL promueve selección explícita, ignora campos desconocidos y conserva local',async({page})=>{
    const local={payment:{accountNumber:'123456',futureSecret:'NO-COPIAR'}};
    await prepare(page,{local,remote:{payment:null}});
    await expect(status(page,'payment')).toHaveText('SÓLO LOCAL');
    await expect(group(page,'payment').locator('[data-unknown-local-fields]')).toContainText('futureSecret');

    await promote(page,'payment','accountNumber');
    await expect(group(page,'payment').locator('[data-promotion-result]')).toContainText('Promoción confirmada');
    const state=await harness(page);
    expect(state.rows.payment).toEqual({accountNumber:'123456'});
    expect(state.rows.payment.futureSecret).toBeUndefined();
    expect(JSON.parse(state.local)).toEqual(local);
    expect(state.writes).toBe(1);
  });

  test('SÓLO REMOTO permite conservar remoto sin ninguna escritura',async({page})=>{
    await prepare(page,{local:{},remote:{ordering:{supportEmail:'remoto@elerrante.co'}}});
    await expect(status(page,'ordering')).toHaveText('SÓLO REMOTO');
    await group(page,'ordering').locator('[data-keep-remote="ordering"]').click();
    await expect(group(page,'ordering').locator('[data-promotion-result]')).toContainText('No se realizó ninguna escritura');
    expect((await harness(page)).writes).toBe(0);
  });

  test('DIFERENTE promueve sólo campos marcados y preserva campos remotos no conocidos',async({page})=>{
    const local={payment:{accountHolder:'Titular local',accountNumber:'111',localUnknown:'NO-COPIAR'}};
    const remote={payment:{accountHolder:'Titular remoto',accountNumber:'222',serverOnly:'PRESERVAR'}};
    await prepare(page,{local,remote});
    await expect(status(page,'payment')).toHaveText('DIFERENTE');

    await promote(page,'payment','accountNumber');
    await expect(group(page,'payment').locator('[data-promotion-result]')).toContainText('Promoción confirmada');
    const state=await harness(page);
    expect(state.rows.payment).toEqual({accountHolder:'Titular remoto',accountNumber:'111',serverOnly:'PRESERVAR'});
    expect(state.rows.payment.localUnknown).toBeUndefined();
    expect(JSON.parse(state.local)).toEqual(local);
  });

  test('si remoto cambia antes de guardar entra CONFLICT, refresca la vista y hace cero overwrite',async({page})=>{
    const local={payment:{accountNumber:'111'}};
    await prepare(page,{local,remote:{payment:{accountNumber:'222'}}});
    await group(page,'payment').locator('[data-promote-field="payment:accountNumber"]').check();
    await page.evaluate(()=>{window.__promotionHarness.rows.payment={accountNumber:'333',serverOnly:'nuevo'};});
    page.once('dialog',dialog=>dialog.accept());
    await group(page,'payment').locator('[data-promote-group="payment"]').click();

    await expect(status(page,'payment')).toHaveText('CONFLICT');
    await expect(group(page,'payment').locator('[data-promotion-result]')).toContainText('valores visibles fueron actualizados');
    await expect(group(page,'payment').locator('[data-promotion-field-row="payment:accountNumber"] td').nth(3)).toHaveText('333');
    const state=await harness(page);
    expect(state.writes).toBe(0);
    expect(state.upsertAttempts).toBe(0);
    expect(state.rows.payment).toEqual({accountNumber:'333',serverOnly:'nuevo'});
  });

  test('sesión expirada durante confirmación cancela antes del upsert y no toca local',async({page})=>{
    const local={ordering:{supportEmail:'local@elerrante.co'}};
    await prepare(page,{local,remote:{ordering:{supportEmail:'remoto@elerrante.co'}}});
    await group(page,'ordering').locator('[data-promote-field="ordering:supportEmail"]').check();
    await page.evaluate(()=>{window.__promotionHarness.session=null;});
    page.once('dialog',dialog=>dialog.accept());
    await group(page,'ordering').locator('[data-promote-group="ordering"]').click();

    await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.adminConnectivityState||''))
      .toBe('AUTH_REQUIRED');
    const state=await harness(page);
    expect(state.upsertAttempts).toBe(0);
    expect(state.writes).toBe(0);
    expect(JSON.parse(state.local)).toEqual(local);
  });

  for(const failure of ['RLS reject','network unavailable']){
    test(`${failure} produce cero mutación remota confirmada, cero fallback y conserva local`,async({page})=>{
      const local={payment:{accountNumber:'111'}};
      await prepare(page,{local,remote:{payment:{accountNumber:'222'}}});
      await page.evaluate(message=>{window.__promotionHarness.upsertError=message;},failure);
      await promote(page,'payment','accountNumber');
      await expect(group(page,'payment').locator('[data-promotion-result]')).toContainText(failure);
      const state=await harness(page);
      expect(state.upsertAttempts).toBe(1);
      expect(state.writes).toBe(0);
      expect(state.rows.payment).toEqual({accountNumber:'222'});
      expect(JSON.parse(state.local)).toEqual(local);
    });
  }
});
