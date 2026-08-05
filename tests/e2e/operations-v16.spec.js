const { test, expect } = require('@playwright/test');

async function seedOperation(page) {
  await page.addInitScript(() => {
    const month = new Date().toISOString().slice(0, 7);
    localStorage.setItem('ee_v14_products', JSON.stringify({
      'la-errante': { price: 25000, unitCost: 10000, inventory: 10, threshold: 3 }
    }));
    localStorage.setItem('ee_v14_orders', JSON.stringify([{
      id: 'EE-TEST-V16',
      createdAt: new Date().toISOString(),
      month,
      status: 'approved',
      inventoryCommitted: false,
      total: 25000,
      customer: { name: 'Cliente prueba', phone: '3000000000' },
      items: [{ productId: 'la-errante', name: 'La Errante', quantity: 1, unitPrice: 25000, unitCost: 10000 }]
    }]));
  });
}

test.describe('Operación y finanzas V1.6', () => {
  test('panel muestra margen, equilibrio, alertas y kardex', async ({ page }) => {
    await seedOperation(page);
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    const panel = page.locator('#operations-v16');
    await expect(panel.getByRole('heading', { name: 'Inventario, margen y punto de equilibrio' })).toBeVisible();
    await expect(panel.getByText('Margen de contribución')).toBeVisible();
    await expect(panel.getByText('Ventas de equilibrio')).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Últimos movimientos de inventario' })).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Precio, costo, margen e inventario' })).toBeVisible();
  });

  test('movimiento de producción incrementa inventario y crea kardex', async ({ page }) => {
    await seedOperation(page);
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    const panel = page.locator('#operations-v16');
    const form = panel.locator('#ee-v16-movement-form');
    await form.locator('select[name="productId"]').selectOption('la-errante');
    await form.locator('select[name="type"]').selectOption('production');
    await form.locator('input[name="quantity"]').fill('5');
    await form.locator('input[name="unitCost"]').fill('9500');
    await form.locator('input[name="note"]').fill('Lote de prueba');
    await form.getByRole('button', { name: 'Registrar movimiento' }).click();
    await expect(panel.getByText('Movimiento registrado y balance actualizado.')).toBeVisible();
    await expect(panel.getByRole('cell', { name: 'Producción', exact: true })).toBeVisible();
    const productRow = panel.locator('tbody tr').filter({ hasText: 'la-errante' });
    await expect(productRow).toHaveCount(1);
    await expect(productRow).toContainText('15');
  });

  test('al entrar en preparación descuenta inventario una sola vez', async ({ page }) => {
    await seedOperation(page);
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    await page.locator('[data-order-status="EE-TEST-V16"]').selectOption('preparing');
    const panel = page.locator('#operations-v16');
    await expect(panel.getByRole('cell', { name: 'Salida por pedido', exact: true })).toBeVisible();
    const productRow = panel.locator('tbody tr').filter({ hasText: 'la-errante' });
    await expect(productRow).toHaveCount(1);
    await expect(productRow).toContainText('9');
    const movements = await page.evaluate(() => JSON.parse(localStorage.getItem('ee_v16_inventory_movements') || '[]'));
    expect(movements.filter(item => item.orderId === 'EE-TEST-V16' && item.type === 'sale')).toHaveLength(1);
  });

  test('activos V1.6 no exponen secretos de servidor', async ({ request }) => {
    for (const path of ['/assets/operations-v16.js', '/backend/supabase/schema-v16.sql']) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      const body = (await response.text()).toLowerCase();
      expect(body).not.toContain('supabase_service');
      expect(body).not.toContain('postgres://');
    }
  });
});
