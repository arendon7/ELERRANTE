const { test, expect } = require('@playwright/test');

async function seedCart(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v2_cart', JSON.stringify([
    { id: 'la-errante', variant: 'unidad', qty: 1 }
  ])));
}

async function assertPublicCommerceBlocked(page) {
  await expect(page.locator('html')).toHaveAttribute('data-ee-public-commerce', 'not-connected');
  await expect(page.getByText('Compra online todavía no activada', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu carrito está listo. El canal que debe recibir el pedido todavía no.' })).toBeVisible();
  await page.waitForTimeout(1400);
  await expect(page.getByText('Compra online todavía no activada', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu carrito está listo. El canal que debe recibir el pedido todavía no.' })).toBeVisible();
  await expect(page.locator('#ee-name')).toHaveCount(0);
  await expect(page.locator('#ee-email')).toHaveCount(0);
  await expect(page.locator('#ee-address')).toHaveCount(0);
  await expect(page.locator('#ee-receipt')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /enviar pedido|confirmar solicitud/i })).toHaveCount(0);
}

test.describe('Operación comercial V2.9', () => {
  test('checkout público no solicita datos ni comprobante sin backend', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.locator('html')).toHaveAttribute('data-ee-commerce-backend', /preview|degraded/);
    await assertPublicCommerceBlocked(page);
    await expect(page.getByRole('button', { name: 'PSE' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Tarjeta' })).toHaveCount(0);
  });

  test('administración conserva una simulación interna explícita', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Acceso administrativo seguro.' })).toBeVisible();
    await expect(page.getByText('No existe una contraseña maestra dentro del código.')).toBeVisible();
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    const adminPanel = page.locator('#admin-dynamic');
    await expect(adminPanel.getByText('Ventas aprobadas')).toBeVisible();
    await expect(adminPanel.getByText('Balance del mes')).toBeVisible();
    await expect(adminPanel.getByRole('heading', { name: 'Precios, costos e inventario' })).toBeVisible();
    await expect(adminPanel.getByRole('heading', { name: 'Gastos fijos' })).toBeVisible();
    await expect(adminPanel.getByText('$ 370.000', { exact: true })).toBeVisible();
    await expect(adminPanel.getByRole('heading', { name: 'Datos bancarios visibles en checkout' })).toBeVisible();
  });

  test('datos bancarios de una simulación interna no se exponen como canal público', async ({ page }) => {
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    await page.locator('#ee-bank-holder').fill('El Errante Cocina');
    await page.locator('#ee-bank-account').fill('123456789');
    await page.locator('#ee-bank-key').fill('errante@banco');
    await page.getByRole('button', { name: 'Guardar datos de transferencia' }).click();
    await seedCart(page);
    await page.goto('/checkout.html');
    await assertPublicCommerceBlocked(page);
    await expect(page.getByText('123456789')).toHaveCount(0);
    await expect(page.getByText('errante@banco')).toHaveCount(0);
  });

  test('superficies públicas no contienen secretos de servidor', async ({ request }) => {
    for (const path of ['/assets/commerce-runtime-config.js','/assets/commerce-config-v14.js','/assets/checkout-v15.js','/assets/public-commerce-guard-v29.js','/assets/admin-v15.js']) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      const body = (await response.text()).toLowerCase();
      expect(body).not.toContain('service_role');
      expect(body).not.toContain('supabase_service');
    }
  });
});