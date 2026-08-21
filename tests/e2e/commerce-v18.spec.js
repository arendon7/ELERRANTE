const { test, expect } = require('@playwright/test');

async function seedCart(page, qty = 1) {
  await page.addInitScript(quantity => {
    localStorage.setItem('ee_v2_cart', JSON.stringify([{ id: 'la-errante', variant: 'unidad', qty: quantity }]));
  }, qty);
}

async function configurePreviewBank(page) {
  await page.route('**/assets/commerce-config-v14.js', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: `(()=>{window.EL_ERRANTE_COMMERCE_CONFIG=Object.freeze({version:'2.9.0',environment:'preview',backend:{provider:'supabase',url:'',publishableKey:''},payment:{bank:'Bancolombia',accountNumber:'123456789',key:'errante@banco',accountHolder:'El Errante Cocina'},finance:{currency:'COP',monthlyFixedCosts:[]},ordering:{requireReceipt:true}});})();`
    });
  });
}

test.describe('Experiencia comercial V3.0 + superficie V4', () => {
  test('tienda conserva la jerarquía comercial y la expresa con la nueva superficie V4', async ({ page }) => {
    await page.goto('/tienda.html');
    await expect(page.getByRole('heading', { name: 'Entra al proceso donde quieras.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Elige qué parte quieres hacer tú.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Once referencias. Una razón para cada una.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No la recalientas. La terminas.' })).toBeVisible();
    await expect(page.locator('[data-v18="store-trust"]')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-commerce-ux-version', '1.8.0');
  });

  test('ficha conserva historia V2.9 y añade la capa gastronómica V3 sin recorrido V1.8', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await expect(page.locator('[data-v29-product-story]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Una receta que no intenta fingir otra geografía.' })).toBeVisible();
    await expect(page.getByText('Compra sabiendo qué parte del proceso es nuestra y cuál será tuya.')).toBeVisible();
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v30Ready === 'true');
    await expect(page.locator('[data-v30-block="identity"]')).toBeVisible();
    await expect(page.locator('[data-v18]')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-commerce-ux-version', '1.8.0');
  });

  test('datos bancarios de preview no convierten un backend vacío en compra real', async ({ page }) => {
    await seedCart(page);
    await configurePreviewBank(page);
    await page.goto('/checkout.html');
    await expect(page.locator('html')).toHaveAttribute('data-ee-public-commerce', 'not-connected');
    await expect(page.getByText('Compra online todavía no activada', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tu carrito está listo. El canal que debe recibir el pedido todavía no.' })).toBeVisible();
    await expect(page.getByText('123456789')).toHaveCount(0);
    await expect(page.getByText('errante@banco')).toHaveCount(0);
    await expect(page.locator('[data-checkout-step]')).toHaveCount(0);
    await expect(page.locator('#ee-receipt')).toHaveCount(0);
  });

  test('checkout desconectado conserva carrito pero no crea pedidos locales', async ({ page }) => {
    await seedCart(page, 2);
    await page.goto('/checkout.html');
    await expect(page.locator('#checkout-lines')).toContainText('La Errante × 2');
    await expect(page.locator('#checkout-total')).not.toHaveText('');
    await expect(page.getByRole('heading', { name: 'Tu carrito está listo. El canal que debe recibir el pedido todavía no.' })).toBeVisible();
    const state = await page.evaluate(() => ({ cart: JSON.parse(localStorage.getItem('ee_v2_cart') || '[]'), orders: JSON.parse(localStorage.getItem('ee_v14_orders') || '[]') }));
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].qty).toBe(2);
    expect(state.orders).toHaveLength(0);
  });

  test('móvil mantiene visible el estado real del canal', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'), 'Validación exclusiva de proyecto móvil');
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByText('Compra online todavía no activada', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tu carrito está listo. El canal que debe recibir el pedido todavía no.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Volver a la tienda' })).toBeVisible();
    await expect(page.locator('[data-v18="mobile-total"]')).toHaveCount(0);
  });

  test('el guard comercial no contiene promesas absolutas', async ({ request }) => {
    const response = await request.get('/assets/public-commerce-guard-v29.js');
    expect(response.ok()).toBeTruthy();
    const body = (await response.text()).toLowerCase();
    expect(body).not.toContain('entrega garantizada');
    expect(body).not.toContain('disponibilidad garantizada');
    expect(body).not.toContain('pago garantizado');
  });
});