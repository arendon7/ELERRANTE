const { test, expect } = require('@playwright/test');

async function seedCart(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v2_cart', JSON.stringify([
    { id: 'la-errante', variant: 'unidad', qty: 1 }
  ])));
}

test.describe('Operación comercial V1.5', () => {
  test('checkout conserva transferencia y usa bootstrap aislado', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByRole('heading', { name: 'Confirma tu pedido con claridad.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '3. Transferencia y comprobante' })).toBeVisible();
    await expect(page.locator('#ee-receipt')).toBeVisible();
    await expect(page.locator('#ee-city')).toHaveAttribute('type', 'text');
    await expect(page.getByText('No cerramos el pedido por rutas fijas ni por días predeterminados.')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-ee-commerce-backend', /preview|degraded/);
    await expect(page.getByRole('button', { name: 'PSE' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Tarjeta' })).toHaveCount(0);
  });

  test('administración presenta acceso seguro y simulación local honesta', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Acceso administrativo seguro.' })).toBeVisible();
    await expect(page.getByText('No existe una contraseña maestra dentro del código.')).toBeVisible();
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    const adminPanel = page.locator('#admin-dynamic');
    await expect(adminPanel.getByText('Ventas aprobadas')).toBeVisible();
    await expect(adminPanel.getByText('Balance del mes')).toBeVisible();
    await expect(adminPanel.getByRole('heading', { name: 'Precios, costos e inventario' })).toBeVisible();
    await expect(adminPanel.getByRole('heading', { name: 'Gastos fijos' })).toBeVisible();
    await expect(adminPanel.getByText('$ 6.000.000', { exact: true })).toBeVisible();
    await expect(adminPanel.getByRole('heading', { name: 'Datos bancarios visibles en checkout' })).toBeVisible();
  });

  test('datos bancarios de simulación persisten en el checkout', async ({ page }) => {
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    await page.locator('#ee-bank-holder').fill('El Errante Cocina');
    await page.locator('#ee-bank-account').fill('123456789');
    await page.locator('#ee-bank-key').fill('errante@banco');
    await page.getByRole('button', { name: 'Guardar datos de transferencia' }).click();
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByText('El Errante Cocina')).toBeVisible();
    await expect(page.getByText('123456789')).toBeVisible();
    await expect(page.getByText('errante@banco')).toBeVisible();
  });

  test('superficies públicas no contienen secretos de servidor', async ({ request }) => {
    for (const path of ['/assets/commerce-runtime-config.js','/assets/commerce-config-v14.js','/assets/checkout-v15.js','/assets/admin-v15.js']) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      const body = (await response.text()).toLowerCase();
      expect(body).not.toContain('service_role');
      expect(body).not.toContain('supabase_service');
    }
  });
});
