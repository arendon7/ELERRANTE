const { test, expect } = require('@playwright/test');

async function openActs(page){
  await page.goto('/actas.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EE_VALIDATION_ACTS_V09?.ready===true);
  await page.waitForFunction(()=>window.EE_AIRE_TIEMPO_COMMITTEE_V09?.ready===true);
}

test.describe('Actas de validación v0.9',()=>{
  test('inicia con Aire y Tiempo, las 17 puertas y el paquete de comité',async({page})=>{
    await openActs(page);
    await expect(page.locator('[data-act-form]')).toContainText('Harina Aire y Tiempo');
    await expect(page.locator('[data-act-gate]')).toHaveCount(17);
    await expect(page.locator('[data-act-variant]')).toHaveCount(3);
    await expect(page.locator('[data-committee-panel]')).toBeVisible();
    await expect(page.locator('[data-committee-gate-guide]')).toHaveCount(17);
    expect(await page.evaluate(()=>window.EE_VALIDATION_ACTS_V09.product_id)).toBe('harina-aire-y-tiempo');
    expect(await page.evaluate(()=>window.EE_AIRE_TIEMPO_COMMITTEE_V09.gates)).toBe(17);
  });

  test('precarga la sesión sin inventar participantes, evidencia, firmas ni aprobaciones',async({page})=>{
    await openActs(page);
    await page.locator('[data-load-committee-pack]').click();
    const form=page.locator('[data-act-form]');
    await expect(form.locator('[name="objective"]')).toHaveValue(/Definir con evidencia/);
    await expect(form.locator('[name="scope"]')).toHaveValue(/no autoriza venta/i);
    await expect(form.locator('[name="participants"]')).toHaveValue('');
    await expect(form.locator('[name="signatories"]')).toHaveValue('');
    await expect(form.locator('[data-gate-reviewed]:checked')).toHaveCount(0);
    await expect(form.locator('[data-gate-evidence]')).toHaveCount(17);
    expect(await form.locator('[data-gate-evidence]').evaluateAll(items=>items.every(item=>item.value===''))).toBeTruthy();
    expect(await form.locator('[data-act-variant]').evaluateAll(items=>items.filter(item=>item.checked).map(item=>item.value))).toEqual(['EE-HAT-1000']);
    await expect(form.locator('[data-act-message]')).toContainText('participantes, evidencias, firmantes y aprobaciones permanecen vacíos');
  });

  test('bloquea la finalización con marcadores genéricos o puertas sin evidencia',async({page})=>{
    await openActs(page);
    await page.locator('[data-load-committee-pack]').click();
    const form=page.locator('[data-act-form]');
    await form.locator('[name="participants"]').fill('Por asignar | Operación y calidad | Responsable');
    await form.locator('[name="signatories"]').fill('Por asignar | Responsable técnico');
    await form.locator('[name="overall_decision"]').selectOption('en_prueba');
    await form.locator('[data-act-gate]').first().locator('[data-gate-reviewed]').check();
    await form.locator('[data-finalize-act]').click();
    await expect(form.locator('[data-act-message]')).toContainText('No se puede finalizar');
    await expect(form.locator('[data-act-message]')).toContainText('nombres reales');
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v09_validation_acts')||'[]').length)).toBe(0);
  });

  test('guarda, finaliza y aplica un acta con evidencia sin alterar el catálogo público',async({page})=>{
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

  test('la tienda no carga módulos internos de actas ni comité',async({page})=>{
    await page.goto('/tienda.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
    expect(await page.evaluate(()=>typeof window.EE_VALIDATION_ACTS_V09)).toBe('undefined');
    expect(await page.evaluate(()=>typeof window.EE_AIRE_TIEMPO_COMMITTEE_V09)).toBe('undefined');
    expect(await page.evaluate(()=>localStorage.getItem('ee_v09_validation_acts'))).toBeNull();
  });
});
