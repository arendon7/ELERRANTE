const { test, expect } = require('@playwright/test');

async function seedCart(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v2_cart', JSON.stringify([
    { id: 'la-errante', variant: 'unidad', qty: 1 }
  ])));
}

test.describe('Operación comercial V1.4', () => {
  test('checkout usa transferencia, comprobante y cobertura abierta', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByRole('heading', { name: 'Tu pedido comienza aquí.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '3. Transferencia y comprobante' })).toBeVisible();
    await expect(page.locator('#ee-receipt')).toBeVisible();
    await expect(page.locator('#ee-city')).toHaveAttribute('type', 'text');
    await expect(page.getByText('No cerramos el pedido por rutas fijas ni por días predeterminados.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'PSE' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Tarjeta' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Nequi' })).toHaveCount(0);
  });

  test('administración local expone finanzas, pedidos y catálogo editable', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Panel operativo en preparación.' })).toBeVisible();
    await page.getByRole('button', { name: 'Abrir vista local de revisión' }).click();
    await expect(page.getByText('Ventas aprobadas')).toBeVisible();
    await expect(page.getByText('Balance del mes')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Precios, costos e inventario' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gastos fijos' })).toBeVisible();
    await expect(page.getByText('$ 6.000.000', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Datos bancarios visibles en checkout' })).toBeVisible();
  });

  test('datos bancarios de revisión persisten en el navegador', async ({ page }) => {
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir vista local de revisión' }).click();
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
});
