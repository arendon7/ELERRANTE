const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}

async function financeDemo(page){
  await internalSession(page);
  await page.goto('/finanzas.html');
  await page.evaluate(()=>{
    [
      'ee_v30_mfo_snapshot','ee_v31_finance_working_model','ee_v31_finance_history','ee_v329_finance_demo','ee_v311_operational_demo',
      'ee_v14_orders','ee_v27_finance_movements','ee_v323_cash_counts','ee_v23_material_stock','ee_v24_material_purchases','ee_v25_purchase_orders','ee_v35_capacity_history'
    ].forEach(key=>localStorage.removeItem(key));
  });
  await page.reload();
  const load=page.getByRole('button',{name:'Cargar demo financiera',exact:true});
  await expect(load).toBeVisible();
  await load.click();
  await page.waitForFunction(()=>document.documentElement.dataset.financeDemoVersion==='3.2.9');
  await expect(page.locator('[data-management-v35][data-surface="finance"]')).toBeVisible();
}

async function seedCapacityLoad(page,quantity=12){
  return page.evaluate(qty=>{
    const data=window.EL_ERRANTE_MATERIALS_V23;
    const product=(data.products||[]).find(item=>(item.bom||[]).length);
    if(!product)return false;
    const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
    const item={quantity:qty,name:product.name,productId:(product.ids||[])[0]||product.sku};
    localStorage.setItem('ee_v14_orders',JSON.stringify([{id:'V35-CAPACITY',status:'approved',total:250000,delivery:{requestedDate:date},items:[item]}]));
    localStorage.removeItem('ee_v35_capacity_history');
    window.dispatchEvent(new Event('ee:v22:reload'));
    return true;
  },quantity);
}

test.describe('V3.5 · cierre gerencial, capacidad y tesorería',()=>{
  test('Control no inventa capacidad ni introduce métricas financieras',async({page})=>{
    await internalSession(page);
    await page.goto('/control.html');
    await page.evaluate(()=>localStorage.removeItem('ee_v35_capacity_history'));
    await page.reload();
    const surface=page.locator('[data-management-v35][data-surface="control"]');
    await expect(surface).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-management-pulse-version','3.5.0');
    await expect(surface.getByText('Capacidad diaria no definida',{exact:true})).toBeVisible();
    await expect(surface.getByText('No definida',{exact:true}).first()).toBeVisible();
    await expect(surface.getByText(/Caja observada/i)).toHaveCount(0);
    await expect(surface.getByText(/Resultado real/i)).toHaveCount(0);
  });

  test('Operación registra capacidad como observaciones sucesivas y detecta sobrecarga',async({page})=>{
    await internalSession(page);
    await page.goto('/operacion.html');
    expect(await seedCapacityLoad(page,12)).toBe(true);
    const surface=page.locator('[data-management-v35][data-surface="operation"]');
    await expect(surface).toBeVisible();
    await expect(surface.getByText('Capacidad diaria no definida',{exact:true})).toBeVisible();

    await surface.locator('input[name="dailyUnits"]').fill('10');
    await surface.locator('input[name="note"]').fill('Turno de prueba');
    await surface.getByRole('button',{name:'Registrar nueva observación'}).click();
    await expect(surface.getByText('10 un./día',{exact:true})).toBeVisible();
    await expect(surface.getByText('1 día(s) sobre capacidad',{exact:true})).toBeVisible();
    await expect(surface.getByText('120 %',{exact:true}).or(surface.getByText('120 %',{exact:true}))).toBeVisible();

    await surface.locator('input[name="dailyUnits"]').fill('15');
    await surface.locator('input[name="note"]').fill('Segundo turno observado');
    await surface.getByRole('button',{name:'Registrar nueva observación'}).click();
    const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v35_capacity_history')||'[]'));
    expect(history).toHaveLength(2);
    expect(history[1].supersedes).toBe(history[0].id);
    expect(history[1].dailyUnits).toBe(15);
    await expect(surface.getByText('15 un./día',{exact:true})).toBeVisible();
  });

  test('Finanzas usa caja observada y compras emitidas sin convertir pedidos en cobros',async({page})=>{
    await financeDemo(page);
    await page.evaluate(()=>{
      const date=new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
      localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([{id:'PO-V35',code:'PO-V35',materialId:'TEST',status:'ordered',requestedQty:10,receivedQty:0,unitCost:20000,expectedDate:date}]));
      window.EL_ERRANTE_FINANCE_V323.recordCashCount({month:date.slice(0,7),date,amount:1000000,evidence:'CONFIRMADO',note:'Conteo V3.5'});
      window.dispatchEvent(new Event('ee:v25:reload'));
    });
    const surface=page.locator('[data-management-v35][data-surface="finance"]');
    await expect(surface).toBeVisible();
    await expect(surface.getByText('Caja observada vigente',{exact:true})).toBeVisible();
    await expect(surface.getByText(/1\.000\.000/).first()).toBeVisible();
    await expect(surface.getByText('Compras emitidas vencidas/próximas',{exact:true})).toBeVisible();
    await expect(surface.getByText(/200\.000/).first()).toBeVisible();
    await expect(surface.getByText(/800\.000/).first()).toBeVisible();
    await expect(surface.getByText(/No se suma a caja porque no existe evidencia de cobro/)).toBeVisible();

    await surface.getByRole('button',{name:/Abrir cierre mensual/}).click();
    await expect(page.locator('.v32-close-section')).toHaveClass(/active/);
    await surface.getByRole('button',{name:/Abrir caja/}).click();
    await expect(page.locator('.v323-section')).toHaveClass(/active/);
  });

  test('móvil mantiene la capa V3.5 dentro del viewport',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
    await internalSession(page);
    await page.goto('/operacion.html');
    const surface=page.locator('[data-management-v35][data-surface="operation"]');
    await expect(surface).toBeVisible();
    const geometry=await page.evaluate(()=>{const r=document.querySelector('[data-management-v35]').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:r.left,right:r.right,viewport:innerWidth};});
    expect(geometry.overflow).toBeLessThanOrEqual(2);
    expect(geometry.left).toBeGreaterThanOrEqual(-2);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+2);
  });
});
