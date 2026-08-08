const {test,expect}=require('@playwright/test');

const sessionPayload=()=>({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()});
async function cleanSession(page){
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('ee_v311_demo_clean_boot'))return;
    sessionStorage.setItem('ee_v311_demo_clean_boot','1');
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
    ['ee_v311_operational_demo','ee_v30_mfo_snapshot','ee_v31_finance_working_model','ee_v329_finance_demo','ee_v14_orders','ee_v22_fulfillment','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders'].forEach(key=>localStorage.removeItem(key));
    sessionStorage.removeItem('ee_v22_selected_date');
  });
}
async function loadDemo(page){
  await page.goto('/centro-interno.html');
  await expect(page.getByRole('button',{name:'Cargar demo operativa',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cargar demo operativa',exact:true}).click();
  await expect(page).toHaveURL(/\/control\.html$/);
  await expect(page.locator('html')).toHaveAttribute('data-operational-demo-version','3.1.1');
}

test.describe('Demo operativa reversible V3.1.1',()=>{
  test('carga hechos sintéticos y activa prioridades reales de Control',async({page})=>{
    await cleanSession(page);await loadDemo(page);
    await expect(page.getByText('Hechos sintéticos activos',{exact:true})).toBeVisible();
    const ordersMetric=page.locator('.v30-metric').filter({hasText:'Pedidos comprometidos'});
    await expect(ordersMetric.locator('strong')).toHaveText('2');
    await expect(page.getByText(/faltante\(s\) confirmados/).first()).toBeVisible();
    await expect(page.getByText(/conteo\(s\) pendientes/).first()).toBeVisible();
    await expect(page.getByText(/pedido\(s\) en preparación incompletos/).first()).toBeVisible();
    const state=await page.evaluate(()=>({
      marker:JSON.parse(localStorage.getItem('ee_v311_operational_demo')),
      orders:JSON.parse(localStorage.getItem('ee_v14_orders')),
      stock:JSON.parse(localStorage.getItem('ee_v23_material_stock')),
      purchaseOrders:JSON.parse(localStorage.getItem('ee_v25_purchase_orders')),
      date:sessionStorage.getItem('ee_v22_selected_date'),
      today:new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'}),
      finance:localStorage.getItem('ee_v30_mfo_snapshot')
    }));
    expect(state.marker.version).toBe('3.1.1');
    expect(state.orders).toHaveLength(2);
    expect(state.orders.every(order=>order.demoV311===true&&order.dataStatus==='DEMO')).toBe(true);
    expect(state.stock['MP-HFS']).toBe(100);
    expect(state.purchaseOrders[0].status).toBe('draft');
    expect(state.date).toBe(state.today);
    expect(state.finance).toBeNull();
  });

  test('recorre pedido, producción, BOM, medición y compra con los mismos hechos',async({page})=>{
    await cleanSession(page);await loadDemo(page);
    await page.goto('/operacion.html');
    await expect(page.locator('[data-v311-operational-demo-banner]')).toBeVisible();
    await expect(page.locator('#daily-ops-v21 [data-v21-order="DEMO-OP-001"]')).toBeVisible();
    await expect(page.locator('#production-v22 [data-v22-order="DEMO-OP-001"]')).toBeVisible();
    await expect(page.locator('#materials-v23 [data-v23-material="MP-HFS"]')).toBeVisible();
    await expect(page.locator('#procurement-v25 [data-v25-order-row="DEMO-PO-001"]')).toBeVisible();
    const state=await page.evaluate(()=>({fulfillment:JSON.parse(localStorage.getItem('ee_v22_fulfillment')),measurements:JSON.parse(localStorage.getItem('ee_v24_production_measurements')),purchases:JSON.parse(localStorage.getItem('ee_v24_material_purchases'))}));
    expect(state.fulfillment['DEMO-OP-001'].productReady).toBe(true);
    expect(state.fulfillment['DEMO-OP-001'].quantityChecked).toBe(false);
    expect(state.measurements[0].referenceId).toBe('REC-MASA-BASE-V23');
    expect(state.measurements[0].dataStatus).toBe('DEMO');
    expect(state.purchases[0].supplier).toBe('Molino demo');
  });

  test('restaura exactamente el estado operativo anterior al salir',async({page})=>{
    await page.addInitScript(()=>{
      if(sessionStorage.getItem('ee_v311_demo_restore_boot'))return;
      sessionStorage.setItem('ee_v311_demo_restore_boot','1');
      sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
      localStorage.removeItem('ee_v311_operational_demo');localStorage.removeItem('ee_v30_mfo_snapshot');localStorage.removeItem('ee_v31_finance_working_model');localStorage.removeItem('ee_v329_finance_demo');
      localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'PREVIO-1',status:'approved',items:[]}]))
      localStorage.setItem('ee_v22_fulfillment',JSON.stringify({'PREVIO-1':{productReady:true}}));
      localStorage.setItem('ee_v23_material_stock',JSON.stringify({'MP-HFS':777}));
      localStorage.setItem('ee_v24_production_measurements',JSON.stringify([{id:'MED-PREVIA'}]));
      localStorage.setItem('ee_v24_material_purchases',JSON.stringify([{id:'COM-PREVIA'}]));
      localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([{id:'OC-PREVIA'}]));
      sessionStorage.setItem('ee_v22_selected_date','2026-07-31');
    });
    await page.goto('/centro-interno.html');
    const before=await page.evaluate(()=>({local:Object.fromEntries(['ee_v14_orders','ee_v22_fulfillment','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders'].map(key=>[key,localStorage.getItem(key)])),date:sessionStorage.getItem('ee_v22_selected_date')}));
    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Cargar demo operativa',exact:true}).click();
    await expect(page).toHaveURL(/\/control\.html$/);
    page.once('dialog',dialog=>dialog.accept());
    await page.getByRole('button',{name:'Salir y restaurar demo',exact:true}).click();
    await expect(page).toHaveURL(/\/centro-interno\.html$/);
    const after=await page.evaluate(()=>({local:Object.fromEntries(['ee_v14_orders','ee_v22_fulfillment','ee_v23_material_stock','ee_v24_production_measurements','ee_v24_material_purchases','ee_v25_purchase_orders'].map(key=>[key,localStorage.getItem(key)])),date:sessionStorage.getItem('ee_v22_selected_date'),marker:localStorage.getItem('ee_v311_operational_demo')}));
    expect(after.local).toEqual(before.local);expect(after.date).toBe(before.date);expect(after.marker).toBeNull();
  });

  test('bloquea la demo operativa cuando existe contexto financiero',async({page})=>{
    await page.addInitScript(()=>{
      sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
      localStorage.removeItem('ee_v311_operational_demo');
      localStorage.setItem('ee_v30_mfo_snapshot',JSON.stringify({schemaVersion:'3.0',meta:{modelName:'MFO privado'}}));
    });
    await page.goto('/centro-interno.html');
    const button=page.getByRole('button',{name:'Cargar demo operativa',exact:true});
    await expect(button).toBeDisabled();
    await expect(page.getByText(/Hay un contexto financiero activo en este navegador/)).toBeVisible();
    expect(await page.evaluate(()=>localStorage.getItem('ee_v311_operational_demo'))).toBeNull();
  });

  test('una demo operativa activa bloquea la demo financiera para no apilar datos',async({page})=>{
    await cleanSession(page);await loadDemo(page);
    await page.goto('/finanzas.html');
    await expect(page.locator('[data-v311-operational-demo-banner]')).toBeVisible();
    await expect(page.locator('[data-v329-blocked-by-operational]')).toHaveCount(1);
    await expect(page.getByRole('button',{name:'Cargar demo financiera',exact:true})).toHaveCount(0);
    expect(await page.evaluate(()=>localStorage.getItem('ee_v30_mfo_snapshot'))).toBeNull();
  });

  test('panel y banner no generan desbordamiento horizontal en móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await cleanSession(page);
    await page.goto('/centro-interno.html');
    await expect(page.locator('[data-v311-operational-demo-panel]')).toBeVisible();
    let overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
    await page.getByRole('button',{name:'Cargar demo operativa',exact:true}).click();
    await expect(page.locator('[data-v311-operational-demo-banner]')).toBeVisible();
    overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
    await page.goto('/operacion.html');
    await expect(page.locator('[data-v311-operational-demo-banner]')).toBeVisible();
    overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
  });
});
