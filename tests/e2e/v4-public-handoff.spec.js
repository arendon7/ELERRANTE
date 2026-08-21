const { test, expect } = require('@playwright/test');

async function open(page,path){
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.EE_DATA?.products?.length===11);
}

test.describe('V4 public action handoff',()=>{
  test('Ayuda conserva verdad operativa cuando no hay canal configurado',async({page})=>{
    await open(page,'/ayuda.html#reporte');
    const form=page.locator('#ee-v29-help-form');
    await form.locator('[name="name"]').fill('Prueba QA');
    await form.locator('[name="email"]').fill('qa@example.com');
    await form.locator('[name="reason"]').selectOption({label:'Preparación'});
    await form.locator('[name="message"]').fill('Validación del flujo sin canal configurado.');
    await form.locator('#ee-v29-help-copy').click();

    await expect(page.locator('#ee-v29-help-status')).toContainText(/borrador|resumen/i);
    await expect(page.locator('[data-public-action-channel]')).toHaveCount(0);
    const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('ee_v29_help_draft')||'null'));
    expect(draft?.version).toBe('2.9.1');
    expect(draft?.text).toContain('No ha sido enviado automáticamente.');
  });

  test('En Movimiento ofrece WhatsApp solo cuando el canal está configurado',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('ee_v14_settings',JSON.stringify({ordering:{supportWhatsapp:'+57 300 123 4567',supportEmail:''}})));
    await open(page,'/en-movimiento.html#cotizar');
    const form=page.locator('#ee-v29-quote-form');

    await form.locator('[name="eventType"]').selectOption({label:'Empresa'});
    await form.locator('[name="guests"]').fill('40');
    await form.locator('[name="date"]').fill('2026-12-12');
    await form.locator('[name="place"]').fill('Medellín');
    await form.locator('[data-next]').first().click();
    await expect(form.locator('.form-step').nth(1)).toHaveClass(/active/);

    await form.locator('[name="experience"]').fill('Integración de equipo con servicio de pizza en sitio.');
    await form.locator('.form-step').nth(1).locator('[data-next]').click();
    await expect(form.locator('.form-step').nth(2)).toHaveClass(/active/);

    await form.locator('[name="name"]').fill('Prueba QA');
    await form.locator('[name="email"]').fill('qa@example.com');
    await form.locator('[name="phone"]').fill('3001234567');
    await form.locator('#ee-v29-quote-copy').click();

    const whatsapp=page.locator('[data-public-action-channel="whatsapp"]');
    await expect(whatsapp).toBeVisible();
    await expect(page.locator('[data-public-action-channel="email"]')).toHaveCount(0);
    const href=await whatsapp.getAttribute('href');
    expect(href).toContain('https://wa.me/573001234567?text=');
    expect(decodeURIComponent(href.split('?text=')[1])).toContain('BORRADOR DE COTIZACIÓN · EL ERRANTE EN MOVIMIENTO');
    await expect(page.locator('#ee-v29-quote-status')).toContainText('revisa el mensaje y confirma el envío');
  });

  test('Ayuda ofrece correo preparado sin afirmar que ya fue enviado',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('ee_v14_settings',JSON.stringify({ordering:{supportWhatsapp:'',supportEmail:'soporte@example.com'}})));
    await open(page,'/ayuda.html#reporte');
    const form=page.locator('#ee-v29-help-form');
    await form.locator('[name="name"]').fill('Prueba QA');
    await form.locator('[name="email"]').fill('qa@example.com');
    await form.locator('[name="reason"]').selectOption({label:'Producto y lote'});
    await form.locator('[name="productLot"]').fill('L-001');
    await form.locator('[name="message"]').fill('Validación del handoff por correo.');
    await form.locator('#ee-v29-help-copy').click();

    const email=page.locator('[data-public-action-channel="email"]');
    await expect(email).toBeVisible();
    const href=await email.getAttribute('href');
    expect(href).toContain('mailto:soporte%40example.com?subject=');
    expect(decodeURIComponent(href)).toContain('SOLICITUD DE AYUDA · EL ERRANTE');
    await expect(page.locator('#ee-v29-help-status')).not.toContainText('enviado a El Errante');
  });
});