const { test, expect } = require('@playwright/test');

async function openLocalAdmin(page){
  await page.goto('/admin.html',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Abrir simulación local'}).click();
  const settings=page.locator('[data-public-channel-settings]');
  await expect(settings).toBeVisible();
  await expect(settings.getByRole('heading',{name:'WhatsApp y correo para Ayuda y eventos'})).toBeVisible();
  return settings;
}

async function prepareHelpDraft(page){
  await page.goto('/ayuda.html#reporte',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
  const form=page.locator('#ee-v29-help-form');
  await form.locator('[name="name"]').fill('Prueba QA');
  await form.locator('[name="email"]').fill('qa@example.com');
  await form.locator('[name="reason"]').selectOption({label:'Producto y lote'});
  await form.locator('[name="message"]').fill('Validación integrada de canales públicos.');
  await form.locator('#ee-v29-help-copy').click();
}

test.describe('V4 configuración operativa de canales públicos',()=>{
  test('admin local configura WhatsApp y correo que Ayuda consume en el mismo navegador',async({page})=>{
    const settings=await openLocalAdmin(page);
    await settings.locator('#ee-public-whatsapp').fill('+57 300 123 4567');
    await settings.locator('#ee-public-email').fill('hola@elerrante.co');
    await settings.locator('#ee-public-response-hours').fill('12');
    await settings.locator('#ee-save-public-channels').click();
    await expect(settings.locator('#ee-public-channel-status')).toContainText('Canales guardados en esta simulación');

    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v14_settings')||'{}').ordering||{});
    expect(saved.supportWhatsapp).toBe('+57 300 123 4567');
    expect(saved.supportEmail).toBe('hola@elerrante.co');
    expect(saved.expectedResponseHours).toBe(12);

    await prepareHelpDraft(page);
    const whatsapp=page.locator('[data-public-action-channel="whatsapp"]');
    const email=page.locator('[data-public-action-channel="email"]');
    await expect(whatsapp).toBeVisible();
    await expect(email).toBeVisible();
    await expect(whatsapp).toHaveAttribute('href',/wa\.me\/573001234567\?text=/);
    await expect(email).toHaveAttribute('href',/^mailto:hola%40elerrante\.co\?subject=/);
  });

  test('vaciar los canales desde admin vuelve a ocultar los handoffs públicos',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('ee_v14_settings',JSON.stringify({ordering:{supportWhatsapp:'+57 300 111 2233',supportEmail:'hola@elerrante.co'}})));
    const settings=await openLocalAdmin(page);
    await settings.locator('#ee-public-whatsapp').fill('');
    await settings.locator('#ee-public-email').fill('');
    await settings.locator('#ee-save-public-channels').click();
    await expect(settings.locator('#ee-public-channel-status')).toContainText('Canales guardados en esta simulación');

    await prepareHelpDraft(page);
    await expect(page.locator('[data-public-action-channel]')).toHaveCount(0);
    await expect(page.locator('#ee-v29-help-status')).toContainText(/borrador|resumen/i);
  });
});
