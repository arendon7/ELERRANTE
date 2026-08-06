const {test,expect}=require('@playwright/test');

async function seed(page,stockOverrides={}){
  await page.addInitScript(overrides=>{
    localStorage.setItem('ee_v14_orders',JSON.stringify([{
      id:'EE-V24-ORDER',status:'approved',createdAt:'2026-08-06T10:00:00.000Z',
      customer:{name:'Cliente V24'},delivery:{city:'Medellín',requestedDate:'2026-08-10'},
      items:[{productId:'la-errante',name:'La Errante',quantity:2}]
    }]));
    localStorage.setItem('ee_v23_material_stock',JSON.stringify(Object.assign({'MP-HFS':100,'MP-HHO':100},overrides||{})));
    sessionStorage.setItem('ee_v22_selected_date','2026-08-10');
  },stockOverrides);
}

test.describe('Medición real y compras V2.4',()=>{
  test('convierte faltantes confirmados en sugerencias de compra',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const panel=page.locator('#measurement-v24');
    await expect(panel.getByRole('heading',{name:'Medir primero. Ajustar después.'})).toBeVisible();
    await expect(panel.locator('[data-v24-suggestion="MP-HFS"]')).toContainText('Comprar');
    await expect(panel.locator('[data-v24-suggestion="MP-HHO"]')).toContainText('Comprar');
    await expect(panel.getByText('Contar antes de comprar').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-measurement-version','2.4.0');
  });

  test('registra una compra sin alterar inventario cuando no existe conteo',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const panel=page.locator('#measurement-v24');
    await panel.getByText('Registrar compra y proveedor').click();
    const form=panel.locator('#ee-v24-purchase-form');
    await form.locator('select[name="materialId"]').selectOption('MP-MOZ');
    await form.locator('input[name="supplier"]').fill('Proveedor real de prueba');
    await form.locator('input[name="quantity"]').fill('1000');
    await form.locator('input[name="totalCost"]').fill('30000');
    await form.locator('input[name="updateStock"]').check();
    await form.getByRole('button',{name:'Guardar compra'}).click();
    await expect(panel.getByText('Compra guardada. El inventario no cambió porque este material aún no tiene conteo físico.')).toBeVisible();
    const stock=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v23_material_stock')));
    expect(stock['MP-MOZ']).toBeUndefined();
    const purchases=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v24_material_purchases')));
    expect(purchases[0].supplier).toBe('Proveedor real de prueba');
    expect(purchases[0].unitCost).toBe(30);
  });

  test('suma una compra cuando existe conteo físico previo',async({page})=>{
    await seed(page,{'MP-MOZ':200});
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const panel=page.locator('#measurement-v24');
    await panel.getByText('Registrar compra y proveedor').click();
    const form=panel.locator('#ee-v24-purchase-form');
    await form.locator('select[name="materialId"]').selectOption('MP-MOZ');
    await form.locator('input[name="supplier"]').fill('Proveedor de mozzarella');
    await form.locator('input[name="quantity"]').fill('100');
    await form.locator('input[name="totalCost"]').fill('3000');
    await form.locator('input[name="updateStock"]').check();
    await form.getByRole('button',{name:'Guardar compra'}).click();
    await expect(panel.getByText('Compra guardada e inventario actualizado desde el conteo existente.')).toBeVisible();
    const stock=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v23_material_stock')));
    expect(stock['MP-MOZ']).toBe(300);
  });

  test('registra rendimiento medido sin cambiar receta ni BOM',async({page})=>{
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const panel=page.locator('#measurement-v24');
    await panel.getByText('Registrar lote, rendimiento y merma').click();
    const form=panel.locator('#ee-v24-measurement-form');
    await form.locator('input[name="batchCode"]').fill('MASA-V24-001');
    await form.locator('input[name="actualQty"]').fill('11000');
    await form.locator('input[name="wasteQty"]').fill('700');
    await form.getByRole('button',{name:'Guardar medición'}).click();
    await expect(panel.getByText('Medición guardada. La receta y el costo estándar permanecen sin cambios.')).toBeVisible();
    await expect(panel.locator('[data-v24-batch]').filter({hasText:'MASA-V24-001'})).toContainText('Revisar lote');
    const measurement=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v24_production_measurements'))[0]);
    expect(measurement.dataStatus).toBe('MEDIDO');
    expect(measurement.referenceId).toBe('REC-MASA-BASE-V23');
  });

  test('mantiene formularios e historial plegados y sin desbordamiento móvil',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await seed(page);
    await page.goto('/admin.html');
    await page.getByRole('button',{name:'Abrir simulación local'}).click();
    const panel=page.locator('#measurement-v24');
    await expect(panel.locator('details')).toHaveCount(3);
    for(const detail of await panel.locator('details').all())await expect(detail).not.toHaveAttribute('open','');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
