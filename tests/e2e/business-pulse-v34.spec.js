const {test,expect}=require('@playwright/test');

async function internalSession(page){
  await page.addInitScript(()=>{
    sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'demo',displayName:'Demo',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()}));
  });
}

async function seedPulse(page){
  return page.evaluate(()=>{
    const data=window.EL_ERRANTE_MATERIALS_V23;
    const product=(data?.products||[]).find(row=>(row.bom||[]).length);
    if(!product)return null;
    const materialId=product.bom[0].materialId;
    const productId=(product.ids||[])[0]||product.sku;
    sessionStorage.setItem('ee_v22_selected_date','2030-01-10');
    localStorage.setItem('ee_v14_orders',JSON.stringify([
      {id:'PULSE-1',status:'approved',total:50000,delivery:{requestedDate:'2030-01-11'},items:[{productId,name:product.name,quantity:2,unitPrice:25000}]},
      {id:'PULSE-2',status:'preparing',total:25000,delivery:{requestedDate:'2030-01-13'},items:[{productId,name:product.name,quantity:1,unitPrice:25000}]},
      {id:'PULSE-UNDATED',status:'approved',total:17000,delivery:{},items:[{productId,name:product.name,quantity:1,unitPrice:17000}]}
    ]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify({[materialId]:0}));
    localStorage.setItem('ee_v25_purchase_orders',JSON.stringify([
      {id:'PO-PULSE',materialId,status:'ordered',requestedQty:1,receivedQty:0,unitCost:10000,expectedDate:'2030-01-12'}
    ]));
    ['ee:v21:reload','ee:v22:reload','ee:v23:reload','ee:v24:reload','ee:v25:reload'].forEach(name=>window.dispatchEvent(new Event(name)));
    return {materialId};
  });
}

for(const pageName of ['control.html','operacion.html']){
  test(`${pageName} muestra horizonte operativo V3.4 sin métricas financieras`,async({page})=>{
    await internalSession(page);
    await page.goto(`/${pageName}`);
    expect(await seedPulse(page)).not.toBeNull();
    await expect(page.locator('html')).toHaveAttribute('data-business-pulse-version','3.4.0');
    const pulse=page.locator('[data-business-pulse-v34]');
    await expect(pulse).toBeVisible();
    await expect(pulse.getByRole('heading',{name:'Próximos 7 días, antes de que se vuelvan urgentes.'})).toBeVisible();
    await expect(pulse.getByText('Pedidos programados',{exact:true})).toBeVisible();
    await expect(pulse.getByText('Unidades por producir',{exact:true})).toBeVisible();
    await expect(pulse.getByText('Pedidos sin fecha',{exact:true})).toBeVisible();
    await expect(pulse.getByText('Margen',{exact:true})).toHaveCount(0);
    await expect(pulse.getByText('Caja',{exact:true})).toHaveCount(0);
    await expect(pulse.locator('.v34-day')).toHaveCount(7);
  });
}

test('Finanzas V3.4 incorpora contexto operativo sin reconocer ingreso o caja',async({page})=>{
  await internalSession(page);
  await page.goto('/finanzas.html');
  expect(await seedPulse(page)).not.toBeNull();
  await expect(page.locator('html')).toHaveAttribute('data-business-pulse-version','3.4.0');
  const pulse=page.locator('#finance-operational-pulse-v34 [data-business-pulse-v34]');
  await expect(pulse).toBeVisible();
  await expect(pulse.getByRole('heading',{name:'Lo comprometido en Operación, sin mezclarlo con el plan.'})).toBeVisible();
  await expect(pulse.getByText('Valor bruto comprometido · 7 días',{exact:true})).toBeVisible();
  await expect(pulse.getByText('2 pedido(s) activos con fecha',{exact:true})).toBeVisible();
  await expect(pulse.getByText(/no es caja cobrada ni reconocimiento contable de ingreso/i)).toBeVisible();
  await expect(pulse.getByText('Compras emitidas pendientes',{exact:true})).toBeVisible();
});

test('V3.4 móvil conserva horizonte dentro del viewport',async({page},testInfo)=>{
  test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Validación móvil');
  await internalSession(page);
  await page.goto('/operacion.html');
  await seedPulse(page);
  const pulse=page.locator('[data-business-pulse-v34]');
  await expect(pulse).toBeVisible();
  const geometry=await page.evaluate(()=>{
    const root=document.querySelector('[data-business-pulse-v34]');
    const box=root.getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,left:box.left,right:box.right,viewport:innerWidth};
  });
  expect(geometry.overflow).toBeLessThanOrEqual(2);
  expect(geometry.left).toBeGreaterThanOrEqual(-2);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+2);
});
