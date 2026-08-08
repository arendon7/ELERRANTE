const { test, expect } = require('@playwright/test');

async function seedOrder(page) {
  await page.addInitScript(() => {
    localStorage.setItem('ee_v14_orders', JSON.stringify([{
      id:'EE-20260805-PRUEBA19',createdAt:'2026-08-05T20:00:00.000Z',status:'approved',total:50000,
      customer:{name:'Cliente prueba',email:'cliente@example.com',phone:'3000000000'},
      delivery:{city:'Medellín',address:'Dato que no debe mostrarse'}
    }]));
  });
}

async function seedCart(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v2_cart', JSON.stringify([{ id:'la-errante', variant:'unidad', qty:1 }])));
}

test.describe('Confianza comercial V2.9', () => {
  test('seguimiento público no presenta un pedido local como estado real', async ({ page }) => {
    await seedOrder(page);
    await page.goto('/cuenta.html?pedido=EE-20260805-PRUEBA19');
    await expect(page.locator('html')).toHaveAttribute('data-ee-public-commerce', 'not-connected');
    await expect(page.getByRole('heading', { name: 'No vamos a mostrar un estado local como si viniera de El Errante.' })).toBeVisible();
    await expect(page.getByText('Cliente prueba')).toHaveCount(0);
    await expect(page.getByText('Dato que no debe mostrarse')).toHaveCount(0);
    await expect(page.getByText(/Pago aprobado/i)).toHaveCount(0);
    await expect(page.locator('#ee-v19-email')).toHaveCount(0);
  });

  test('un carrito público desconectado no genera referencia de pedido local', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByText('Compra online todavía no activada', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tu carrito está listo. El canal que debe recibir el pedido todavía no.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Confirmar solicitud|Enviar pedido/i })).toHaveCount(0);
    const state=await page.evaluate(()=>({orders:JSON.parse(localStorage.getItem('ee_v14_orders')||'[]'),cart:JSON.parse(localStorage.getItem('ee_v2_cart')||'[]')}));
    expect(state.orders).toHaveLength(0);
    expect(state.cart).toHaveLength(1);
  });

  test('administración local conserva configuración de cobertura y soporte como simulación', async ({ page }) => {
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

  test('activos de confianza y guard no contienen secretos ni promesas absolutas', async ({ request }) => {
    for(const path of ['/assets/trust-v19.js','/assets/public-commerce-guard-v29.js']){
      const response=await request.get(path);
      expect(response.ok()).toBeTruthy();
      const body=(await response.text()).toLowerCase();
      expect(body).not.toContain('service_role');
      expect(body).not.toContain('entrega garantizada');
      expect(body).not.toContain('disponibilidad garantizada');
    }
  });
});