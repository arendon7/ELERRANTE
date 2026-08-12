const {test,expect}=require('@playwright/test');

async function seedInternalSession(page){
  await page.addInitScript(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'juan',displayName:'Juan',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*3600000).toISOString()})));
}
async function waitForV40(page){
  await page.waitForFunction(()=>document.documentElement.dataset.operationalFormsVersion==='4.0.0');
  await page.waitForFunction(()=>document.querySelectorAll('form[data-v40-enhanced="true"]').length>=4);
}

test.describe('UX formularios operativos V4.0',()=>{
  test.beforeEach(async({page})=>{await seedInternalSession(page);});

  test('monta asistencia progresiva sobre V2.4 y V2.5 sin sustituir sus formularios',async({page})=>{
    await page.goto('/operacion.html',{waitUntil:'domcontentloaded'});
    await waitForV40(page);
    await expect(page.locator('body')).toHaveAttribute('data-v31-authenticated','true');
    await expect(page.locator('html')).toHaveAttribute('data-operational-forms-version','4.0.0');
    for(const selector of ['#ee-v24-purchase-form','#ee-v24-measurement-form','#ee-v25-order-form','#ee-v25-receipt-form']){
      const form=page.locator(selector);
      await expect(form).toHaveAttribute('data-v40-enhanced','true');
      await expect(form.locator(':scope > [data-v40-guide]')).toHaveCount(1);
      await expect(form.locator(':scope > [data-v40-preview]')).toHaveCount(1);
    }
    expect(await page.evaluate(()=>localStorage.getItem('ee_v24_production_measurements'))).toBeNull();
    expect(await page.evaluate(()=>localStorage.getItem('ee_v25_purchase_orders'))).toBeNull();
  });

  test('guía la medición al siguiente campo pendiente, calcula preview y conserva el guardado V2.4',async({page})=>{
    await page.goto('/operacion.html#medicion',{waitUntil:'domcontentloaded'});
    await waitForV40(page);
    const panel=page.locator('#measurement-v24');
    await panel.getByText('Registrar lote, rendimiento y merma').click();
    const form=panel.locator('#ee-v24-measurement-form');
    const guide=form.locator('[data-v40-guide]');
    await expect(guide).toContainText('2 campos esenciales pendientes');
    await guide.locator('[data-v40-next]').click();
    await expect(form.locator('input[name="batchCode"]')).toBeFocused();
    await form.locator('input[name="batchCode"]').fill('MASA-V40-001');
    await guide.locator('[data-v40-next]').click();
    await expect(form.locator('input[name="actualQty"]')).toBeFocused();
    await form.locator('input[name="actualQty"]').fill('11000');
    await form.locator('input[name="wasteQty"]').fill('700');
    await expect(guide).toContainText('Listo para guardar');
    await expect(form.locator('[data-v40-preview]')).toContainText('Rendimiento');
    await form.getByRole('button',{name:'Guardar medición'}).click();
    await expect(panel.getByText('Medición guardada. La receta y el costo estándar permanecen sin cambios.')).toBeVisible();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v24_production_measurements')||'[]')[0]);
    expect(saved.batchCode).toBe('MASA-V40-001');
    expect(saved.dataStatus).toBe('MEDIDO');
  });

  test('muestra costo unitario antes de guardar una compra sin modificar inventario',async({page})=>{
    await page.goto('/operacion.html#medicion',{waitUntil:'domcontentloaded'});
    await waitForV40(page);
    const panel=page.locator('#measurement-v24');
    await panel.getByText('Registrar compra y proveedor').click();
    const form=panel.locator('#ee-v24-purchase-form');
    await form.locator('input[name="supplier"]').fill('Proveedor V40');
    await form.locator('input[name="quantity"]').fill('100');
    await form.locator('input[name="totalCost"]').fill('3000');
    await expect(form.locator('[data-v40-preview]')).toContainText('Costo observado por unidad');
    await expect(form.locator('[data-v40-preview]')).toContainText('30');
    expect(await page.evaluate(()=>localStorage.getItem('ee_v24_material_purchases'))).toBeNull();
  });

  test('mantiene validación nativa visible y anticipa compromiso del borrador V2.5',async({page})=>{
    await page.goto('/operacion.html#compras',{waitUntil:'domcontentloaded'});
    await waitForV40(page);
    const panel=page.locator('#procurement-v25');
    await panel.getByText('Crear o editar borrador de compra').click();
    const form=panel.locator('#ee-v25-order-form');
    const qty=form.locator('input[name="requestedQty"]');
    await form.getByRole('button',{name:'Guardar borrador'}).click();
    await expect(qty).toHaveAttribute('aria-invalid','true');
    await expect(form.locator('[data-v40-guide]')).toContainText('Revisa');
    await qty.fill('10');
    await form.locator('input[name="unitCost"]').fill('2000');
    await expect(form.locator('[data-v40-preview]')).toContainText('Compromiso estimado del borrador');
    await expect(form.locator('[data-v40-guide]')).toContainText('Listo para guardar');
  });

  test('no introduce desbordamiento horizontal en formularios móviles',async({page},testInfo)=>{
    test.skip(!testInfo.project.name.includes('mobile'),'Validación móvil');
    await page.goto('/operacion.html#medicion',{waitUntil:'domcontentloaded'});
    await waitForV40(page);
    await page.locator('#measurement-v24').getByText('Registrar lote, rendimiento y merma').click();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
