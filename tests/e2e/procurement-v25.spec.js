const {test,expect}=require('@playwright/test');

async function seed(page,{stock={'MP-HFS':100},purchases=[]}={}){
  await page.addInitScript(({stock,purchases})=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'EE-V25-ORDER',status:'approved',createdAt:'2026-08-06T10:00:00.000Z',
      customer:{name:'Cliente V25'},delivery:{city:'Medellín',requestedDate:'2026-08-10'},
      items:[{productId:'la-errante',name:'La Errante',quantity:2}]
    }]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify(stock));
    localStorage.setItem('ee_v24_material_purchases',JSON.stringify(purchases));
    localStorage.removeItem('ee_v25_purchase_orders');
    sessionStorage.setItem('ee_v22_selected_date','2026-08-10');
  },{stock,purchases});
}

async function openAdmin(page){
  await page.goto('/admin.html');
  await page.getByRole('button',{name:'Abrir simulación local'}).click();
  const panel=page.locator('#procurement-v25');
  await expect(panel.getByRole('heading',{name:'Comprar con evidencia y autorización.'})).toBeVisible();
  return panel;
}

async function acceptAndClick(page,button){
  page.once('dialog',dialog=>dialog.accept());
  await button.click();
}

test.describe('Abastecimiento controlado V2.5',()=>{
  test('convierte un faltante confirmado en borrador sin aprobarlo ni emitirlo',async({page})=>{
    await seed(page);
    const panel=await openAdmin(page);
    const suggestion=panel.locator('[data-v25-suggestion="MP-HFS"]');
    await expect(suggestion).toContainText('275');
    await suggestion.getByRole('button',{name:'Crear borrador'}).click();
    const form=panel.locator('#ee-v25-order-form');
    await expect(form.locator('input[name="requestedQty"]')).toHaveValue('275');
    await form.locator('input[name="supplier"]').fill('Proveedor de prueba');
    await form.getByRole('button',{name:'Guardar borrador'}).click();
    await expect(panel.getByText('Borrador creado. Aún no está aprobado ni emitido.')).toBeVisible();
    const orders=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v25_purchase_orders')||'[]'));
    expect(orders).toHaveLength(1);
    expect(orders[0].status).toBe('draft');
    expect(orders[0].requestedQty).toBe(275);
  });

  test('exige autorización separada y referencia externa antes de emitir',async({page})=>{
    await seed(page);
    const panel=await openAdmin(page);
    await panel.locator('[data-v25-suggestion="MP-HFS"]').getByRole('button',{name:'Crear borrador'}).click();
    let form=panel.locator('#ee-v25-order-form');
    await form.locator('input[name="supplier"]').fill('Proveedor de harina');
    await form.locator('input[name="unitCost"]').fill('3');
    await form.getByRole('button',{name:'Guardar borrador'}).click();
    let row=panel.locator('[data-v25-order-row]');
    await acceptAndClick(page,row.getByRole('button',{name:'Aprobar'}));
    await expect(panel.getByText('Orden aprobada. Aún no ha sido emitida al proveedor.')).toBeVisible();
    row=panel.locator('[data-v25-order-row]');
    await acceptAndClick(page,row.getByRole('button',{name:'Marcar emitida'}));
    await expect(panel.getByText('La orden debe estar aprobada y tener costo unitario acordado con una referencia externa antes de emitirla.')).toBeVisible();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v25_purchase_orders')||'[]')[0]);
    expect(stored.status).toBe('approved');
  });

  test('reconcilia una recepción parcial con factura e inventario contado',async({page})=>{
    await seed(page);
    const panel=await openAdmin(page);
    await panel.locator('[data-v25-suggestion="MP-HFS"]').getByRole('button',{name:'Crear borrador'}).click();
    let form=panel.locator('#ee-v25-order-form');
    await form.locator('input[name="supplier"]').fill('Proveedor de harina');
    await form.locator('input[name="unitCost"]').fill('3');
    await form.locator('input[name="externalReference"]').fill('COT-001');
    await form.getByRole('button',{name:'Guardar borrador'}).click();
    let row=panel.locator('[data-v25-order-row]');
    await acceptAndClick(page,row.getByRole('button',{name:'Aprobar'}));
    row=panel.locator('[data-v25-order-row]');
    await acceptAndClick(page,row.getByRole('button',{name:'Marcar emitida'}));
    await expect(panel.getByText('Orden marcada como emitida. Queda pendiente la recepción.')).toBeVisible();
    row=panel.locator('[data-v25-order-row]');
    await row.getByRole('button',{name:'Registrar recepción'}).click();
    const receipt=panel.locator('#ee-v25-receipt-form');
    await receipt.locator('input[name="quantity"]').fill('100');
    await receipt.locator('input[name="totalCost"]').fill('300');
    await receipt.locator('input[name="invoiceReference"]').fill('FAC-001');
    await receipt.locator('input[name="updateStock"]').check();
    await receipt.getByRole('button',{name:'Confirmar recepción'}).click();
    await expect(panel.getByText('Recepción registrada, factura observada e inventario actualizado.')).toBeVisible();
    const state=await page.evaluate(()=>({
      stock:JSON.parse(localStorage.getItem('ee_v23_material_stock')||'{}'),
      purchases:JSON.parse(localStorage.getItem('ee_v24_material_purchases')||'[]'),
      orders:JSON.parse(localStorage.getItem('ee_v25_purchase_orders')||'[]')
    }));
    expect(state.stock['MP-HFS']).toBe(200);
    expect(state.purchases).toHaveLength(1);
    expect(state.purchases[0].invoiceReference).toBe('FAC-001');
    expect(state.purchases[0].unitCost).toBe(3);
    expect(state.orders[0].receivedQty).toBe(100);
    expect(state.orders[0].status).toBe('partial');
  });

  test('compara proveedores únicamente con compras observadas',async({page})=>{
    await seed(page,{purchases:[
      {id:'P1',materialId:'MP-HFS',supplier:'Molino observado',receivedDate:'2026-08-01',quantity:100,totalCost:300,unitCost:3},
      {id:'P2',materialId:'MP-HFS',supplier:'Molino observado',receivedDate:'2026-08-05',quantity:100,totalCost:400,unitCost:4}
    ]});
    const panel=await openAdmin(page);
    const comparison=panel.locator('details').filter({hasText:'Comparar proveedores observados'});
    await comparison.getByText('Comparar proveedores observados').click();
    const row=comparison.locator('tbody tr').filter({hasText:'Molino observado'});
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('2');
    await expect(row).toContainText('2026-08-05');
  });

  test('mantiene controles plegados y sin desbordamiento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);
    const panel=await openAdmin(page);
    await expect(panel.locator('details')).toHaveCount(4);
    for(const detail of await panel.locator('details').all())await expect(detail).not.toHaveAttribute('open','');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await expect(page.locator('html')).toHaveAttribute('data-procurement-version','2.5.0');
  });

  test('activos V2.5 no exponen secretos de servidor',async({request})=>{
    for(const path of ['/assets/procurement-v25.js','/backend/supabase/schema-v25.sql']){
      const response=await request.get(path);expect(response.ok()).toBeTruthy();
      const body=(await response.text()).toLowerCase();
      expect(body).not.toContain('service_role');
      expect(body).not.toContain('postgres://');
    }
  });
});
