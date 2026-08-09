const {test,expect}=require('@playwright/test');

async function prepare(page){
  await page.route('**/assets/commerce-runtime-config.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:`window.EL_ERRANTE_RUNTIME_CONFIG=Object.freeze({environment:"test-remote",backend:{provider:"supabase",url:"https://trap.supabase.invalid",publishableKey:"trap-key",receiptBucket:"payment-receipts",shopperStorageKey:"ee-shopper-auth-v15",adminStorageKey:"ee-admin-auth-v15"}});`
  }));
  await page.addInitScript(()=>{
    if(!sessionStorage.getItem('ee_v311_demo_isolation_clean')){
      sessionStorage.setItem('ee_v311_demo_isolation_clean','1');
      sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
      ['ee_v311_operational_demo','ee_v30_mfo_snapshot','ee_v31_finance_working_model','ee_v329_finance_demo','ee_v14_orders','ee_v22_fulfillment','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders'].forEach(key=>localStorage.removeItem(key));
      sessionStorage.removeItem('ee_v22_selected_date');
    }
    window.__demoRemoteCalls=0;
    let chain;
    chain=new Proxy({}, {
      get(_target,prop){
        if(prop==='then')return resolve=>resolve({data:[],error:null});
        return (..._args)=>chain;
      }
    });
    window.__EE_ADMIN_SUPABASE__=new Proxy({}, {
      get(_target,prop){
        if(prop==='from'||prop==='rpc')return (..._args)=>{window.__demoRemoteCalls+=1;return chain;};
        return undefined;
      }
    });
    document.addEventListener('DOMContentLoaded',()=>{
      let root=document.querySelector('#admin-dynamic');
      if(!root){root=document.createElement('div');root.id='admin-dynamic';root.hidden=true;document.body.appendChild(root);}
      let bar=root.querySelector('.ee-v15-sessionbar');
      if(!bar){bar=document.createElement('div');bar.className='ee-v15-sessionbar';root.appendChild(bar);}
      bar.textContent='Administración conectada';
    },{once:true});
  });
}

async function activateDemo(page){
  await page.goto('/centro-interno.html');
  await expect(page.getByRole('button',{name:'Cargar demo operativa',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cargar demo operativa',exact:true}).click();
  await expect(page).toHaveURL(/\/control\.html$/);
  await expect(page.locator('html')).toHaveAttribute('data-operational-demo-version','3.1.1');
}

test.describe('Aislamiento local estricto de demo operativa V3.1.1',()=>{
  test('anula credenciales remotas en Operación y no invoca Supabase durante la demo',async({page})=>{
    await prepare(page);
    await activateDemo(page);
    await page.goto('/operacion.html');

    const backend=await page.evaluate(()=>window.EL_ERRANTE_COMMERCE_CONFIG?.backend||null);
    expect(backend).not.toBeNull();
    expect(backend.url).toBe('');
    expect(backend.publishableKey).toBe('');

    await expect(page.locator('#daily-ops-v21 [data-v21-order="DEMO-OP-001"]')).toBeVisible();
    await expect(page.locator('#production-v22 [data-v22-order="DEMO-OP-001"]')).toBeVisible();
    await expect(page.locator('#procurement-v25 [data-v25-order-row="DEMO-PO-001"]')).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>window.__demoRemoteCalls)).toBe(0);
  });

  test('al salir de la demo restaura la configuración remota sin conservar el aislamiento',async({page})=>{
    await prepare(page);
    await activateDemo(page);
    await page.goto('/operacion.html');
    await expect.poll(()=>page.evaluate(()=>window.EL_ERRANTE_COMMERCE_CONFIG.backend.url)).toBe('');

    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Salir y restaurar demo',exact:true}).click();
    await expect(page).toHaveURL(/\/centro-interno\.html$/);
    expect(await page.evaluate(()=>localStorage.getItem('ee_v311_operational_demo'))).toBeNull();

    await page.goto('/operacion.html');
    const backend=await page.evaluate(()=>window.EL_ERRANTE_COMMERCE_CONFIG?.backend||null);
    expect(backend.url).toBe('https://trap.supabase.invalid');
    expect(backend.publishableKey).toBe('trap-key');
    await expect.poll(()=>page.evaluate(()=>window.__demoRemoteCalls)).toBeGreaterThan(0);
  });
});