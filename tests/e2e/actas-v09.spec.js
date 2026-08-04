const { test, expect } = require('@playwright/test');

async function openActs(page){
  await page.goto('/actas.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EE_VALIDATION_ACTS_V09?.ready===true);
}

test.describe('Actas de validación v0.9',()=>{
  test('inicia con Aire y Tiempo y las 17 puertas',async({page})=>{
    await openActs(page);
    await expect(page.locator('[data-act-form]')).toContainText('Harina Aire y Tiempo');
    await expect(page.locator('[data-act-gate]')).toHaveCount(17);
    await expect(page.locator('[data-act-variant]')).toHaveCount(3);
    expect(await page.evaluate(()=>window.EE_VALIDATION_ACTS_V09.product_id)).toBe('harina-aire-y-tiempo');
  });

  test('guarda, finaliza y aplica un acta sin alterar el catálogo público',async({page})=>{
    await openActs(page);
    const form=page.locator('[data-act-form]');
    await form.locator('[name="participants"]').fill('Ana Pérez | Dirección gastronómica | Responsable');
    await form.locator('[name="signatories"]').fill('Ana Pérez | Responsable de fórmula');
    await form.locator('[name="overall_decision"]').selectOption('aprobado_con_condiciones');
    await form.locator('[name="overall_conditions"]').fill('Validar costo y empaque antes del piloto.');
    const firstGate=form.locator('[data-act-gate]').first();
    await firstGate.locator('[data-gate-reviewed]').check();
    await firstGate.locator('[data-gate-status]').selectOption('aprobado');
    await firstGate.locator('[data-gate-evidence]').fill('Acta de concepto revisada.');
    await form.locator('[data-save-draft]').click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v09_validation_acts')||'[]').length)).toBe(1);
    await form.locator('[data-finalize-act]').click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v09_validation_acts')||'[]')[0]?.status)).toBe('finalizada');
    page.once('dialog',dialog=>dialog.accept());
    await form.locator('[data-apply-act]').click();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v09_validation_acts')||'[]')[0]?.status)).toBe('aplicada');
    const result=await page.evaluate(()=>({
      governance:JSON.parse(localStorage.getItem('ee_v09_offer_governance')||'{}').products?.['harina-aire-y-tiempo'],
      count:window.EE_DATA.products.length,
      price:window.EE_DATA.products.find(product=>product.id==='harina-aire-y-tiempo').variants[0].price
    }));
    expect(result.governance.overall_status).toBe('aprobado_con_condiciones');
    expect(result.governance.source_act_id).toContain('ACT-');
    expect(result.count).toBe(11);
    expect(result.price).toBe(18900);
  });

  test('la tienda no carga el módulo interno de actas',async({page})=>{
    await page.goto('/tienda.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
    expect(await page.evaluate(()=>typeof window.EE_VALIDATION_ACTS_V09)).toBe('undefined');
    expect(await page.evaluate(()=>localStorage.getItem('ee_v09_validation_acts'))).toBeNull();
  });
});
