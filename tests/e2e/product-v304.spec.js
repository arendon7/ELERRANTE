const { test, expect } = require('@playwright/test');

const pizzas = [
  'margherita-del-taller',
  'la-errante',
  'bosque',
  'diavola-errante',
  'cuatro-quesos-montana'
];

test.describe('Elección y conversión V3.0.4', () => {
  test('la tienda permite elegir las cinco pizzas por antojo', async ({ page }) => {
    await page.goto('/tienda.html');
    const selector = page.locator('[data-v304-layer="store-selector"]');
    await expect(selector).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No empieces por el nombre. Empieza por lo que quieres comer.' })).toBeVisible();
    await expect(selector.locator('[data-v304-choice]')).toHaveCount(5);
    await expect(selector.getByText('Quiero una pizza limpia y esencial.')).toBeVisible();
    await expect(selector.getByText('Quiero conocer la firma de El Errante.')).toBeVisible();
    await expect(selector.getByText('Quiero profundidad vegetal y umami.')).toBeVisible();
    await expect(selector.getByText('Quiero picante con sabor y progresión.')).toBeVisible();
    await expect(selector.getByText('Quiero una pizza cremosa y envolvente.')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-ee-commerce-editorial-version', '3.0.4');
  });

  test('cada pizza V3 conserva su ficha y suma decisión rápida más dos alternativas', async ({ page }) => {
    for (const id of pizzas) {
      await page.goto(`/producto.html?id=${id}`);
      await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v304Ready === 'true');
      const root = page.locator('#dynamic-product');
      await expect(root).toHaveAttribute('data-v304-ready', 'true');
      await expect(root.locator('[data-v304-layer="quick-decision"]')).toHaveCount(1);
      await expect(root.locator('[data-v304-layer="comparison"]')).toHaveCount(1);
      await expect(root.locator('[data-v304-compare-card]')).toHaveCount(2);
      await expect(root.locator('[data-v303-layer]')).toHaveCount(1);
      await expect(root.locator('[data-v302-block="craft-proof"]')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('data-ee-commerce-editorial-version', '3.0.4');
      await expect(page.locator('#v304-ficha')).toHaveCount(1);
    }
  });

  test('el CTA V3.0.4 delega en el carrito existente', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v304Ready === 'true');
    await page.evaluate(() => localStorage.removeItem('ee_v2_cart'));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v304Ready === 'true');

    const add = page.locator('[data-v304-add]');
    await expect(add).toBeVisible();
    await add.click();
    await expect.poll(async () => page.evaluate(() => {
      try {
        const cart = JSON.parse(localStorage.getItem('ee_v2_cart') || '[]');
        return Array.isArray(cart) && cart.some(item => item === 'la-errante' || item?.id === 'la-errante' || item?.productId === 'la-errante');
      } catch (_) {
        return false;
      }
    })).toBeTruthy();
    await expect(page.locator('[data-v303-layer]')).toHaveCount(1);
  });

  test('otras referencias no reciben la capa comercial de las cinco pizzas', async ({ page }) => {
    for (const id of ['salsa-tomate', 'harina-aire-y-tiempo', 'crea-la-tuya']) {
      await page.goto(`/producto.html?id=${id}`);
      await expect(page.locator('[data-v304-layer]')).toHaveCount(0);
      await expect(page.locator('[data-v304-mobile-buy]')).toHaveCount(0);
    }
  });

  test('móvil mantiene visible la decisión y la barra de compra dentro del viewport', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'), 'Validación exclusiva de proyecto móvil');
    await page.goto('/producto.html?id=margherita-del-taller');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v304Ready === 'true');
    const quick = await page.locator('[data-v304-layer="quick-decision"]').boundingBox();
    const bar = await page.locator('[data-v304-mobile-buy]').boundingBox();
    const viewport = page.viewportSize();
    expect(quick).not.toBeNull();
    expect(bar).not.toBeNull();
    expect(quick.x).toBeGreaterThanOrEqual(-1);
    expect(quick.x + quick.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(bar.x).toBeGreaterThanOrEqual(-1);
    expect(bar.x + bar.width).toBeLessThanOrEqual(viewport.width + 1);
  });
});
