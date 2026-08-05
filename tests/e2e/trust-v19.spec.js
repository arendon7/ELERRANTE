const { test, expect } = require('@playwright/test');

async function seedOrder(page, status = 'approved') {
  await page.addInitScript(({ currentStatus }) => {
    localStorage.setItem('ee_v14_orders', JSON.stringify([{
      id: 'EE-20260805-PRUEBA19',
      createdAt: '2026-08-05T20:00:00.000Z',
      updatedAt: '2026-08-05T21:00:00.000Z',
      month: '2026-08',
      status: currentStatus,
      total: 50000,
      customer: { name: 'Cliente prueba', email: 'cliente@example.com', phone: '3000000000' },
      delivery: { city: 'Medellín', address: 'Dato que no debe mostrarse', requestedDate: '2026-08-08' },
      statusTimeline: [
        { status: 'payment_review', createdAt: '2026-08-05T20:00:00.000Z', note: 'Comprobante recibido' },
        { status: currentStatus, createdAt: '2026-08-05T21:00:00.000Z', note: 'Estado actualizado' }
      ]
    }]));
  }, { currentStatus: status });
}

async function seedCart(page) {
  await page.addInitScript(() => {
    localStorage.setItem('ee_v2_cart', JSON.stringify([{ id: 'la-errante', variant: 'unidad', qty: 1 }]));
    localStorage.setItem('ee_v4_overrides', JSON.stringify({ products: { 'la-errante': { variants: { unidad: { stock: 10 } } } } }));
    localStorage.setItem('ee_v14_products', JSON.stringify({ 'la-errante': { inventory: 10 } }));
  });
}

async function completeCheckout(page) {
  await page.locator('#ee-name').fill('Cliente V19');
  await page.locator('#ee-phone').fill('3000000000');
  await page.locator('#ee-email').fill('cliente@example.com');
  await page.locator('#ee-city').fill('Medellín');
  await page.locator('#ee-neighborhood').fill('Laureles');
  await page.locator('#ee-address').fill('Carrera 70 # 10-20');
  await page.locator('#ee-receipt').setInputFiles({ name: 'comprobante.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') });
  await page.locator('input[name="consent"]').check();
}

test.describe('Confianza comercial y seguimiento V1.9', () => {
  test('consulta un pedido local con referencia y correo', async ({ page }) => {
    await seedOrder(page, 'approved');
    await page.goto('/cuenta.html?pedido=EE-20260805-PRUEBA19');
    await expect(page.getByRole('heading', { name: 'Revisa el estado de tu solicitud.' })).toBeVisible();
    await page.locator('#ee-v19-email').fill('cliente@example.com');
    await page.getByRole('button', { name: 'Consultar estado' }).click();
    await expect(page.getByRole('heading', { name: 'Pago aprobado' })).toBeVisible();
    await expect(page.getByText('$ 50.000')).toBeVisible();
    await expect(page.getByText('Esta consulta no muestra dirección, teléfono, comprobante ni notas internas.')).toBeVisible();
    await expect(page.getByText('Dato que no debe mostrarse')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-trust-version', '1.9.0');
  });

  test('correo incorrecto no revela si existe la referencia', async ({ page }) => {
    await seedOrder(page);
    await page.goto('/cuenta.html?pedido=EE-20260805-PRUEBA19');
    await page.locator('#ee-v19-email').fill('otro@example.com');
    await page.getByRole('button', { name: 'Consultar estado' }).click();
    await expect(page.getByText('No encontramos una solicitud con esa referencia y correo.')).toBeVisible();
    await expect(page.getByText('Cliente prueba')).toHaveCount(0);
  });

  test('checkout entrega acceso directo a la consulta después de registrar', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout.html');
    await completeCheckout(page);
    await page.getByRole('button', { name: 'Confirmar solicitud y enviar comprobante' }).click();
    await expect(page.getByRole('heading', { name: 'Consulta el avance cuando lo necesites.' })).toBeVisible();
    const link = page.getByRole('link', { name: 'Consultar este pedido' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /cuenta\.html\?pedido=EE-/);
  });

  test('administración local configura cobertura y soporte', async ({ page }) => {
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    await expect(page.getByRole('heading', { name: 'Cobertura, soporte y seguimiento' })).toBeVisible();
    await page.locator('#ee-v19-coverage').fill('Medellín y municipios cercanos sujetos a coordinación.');
    await page.locator('#ee-v19-delivery-fee').fill('La tarifa se confirma antes de aprobar el pedido.');
    await page.locator('#ee-v19-whatsapp').fill('573001234567');
    await page.locator('#ee-v19-support-email').fill('pedidos@example.com');
    await page.getByRole('button', { name: 'Guardar configuración comercial' }).click();
    await expect(page.getByText('Configuración comercial guardada.')).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ee_v14_settings')));
    expect(saved.ordering.supportWhatsapp).toBe('573001234567');
    expect(saved.ordering.supportEmail).toBe('pedidos@example.com');
  });

  test('los activos no contienen secretos ni promesas absolutas', async ({ request }) => {
    const response = await request.get('/assets/trust-v19.js');
    expect(response.ok()).toBeTruthy();
    const body = (await response.text()).toLowerCase();
    expect(body).not.toContain('service_role');
    expect(body).not.toContain('entrega garantizada');
    expect(body).not.toContain('disponibilidad garantizada');
  });
});
