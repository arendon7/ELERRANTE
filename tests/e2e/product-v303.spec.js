const { test, expect } = require('@playwright/test');

const pizzas = [
  'margherita-del-taller',
  'la-errante',
  'bosque',
  'diavola-errante',
  'cuatro-quesos-montana'
];

test.describe('Ficha de producto V3.0.3', () => {
  test('La Errante separa datos confirmados, provisionales y de etiqueta', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v303Ready === 'true');

    const root = page.locator('#dynamic-product');
    await expect(root).toHaveAttribute('data-v303-ready', 'true');
    await expect(page.locator('[data-v303-block="essential"]')).toBeVisible();
    await expect(page.locator('[data-v303-block="service"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Qué llega a tu horno.' })).toBeVisible();
    await expect(page.getByText('Lo confirmado y lo que falta cerrar.')).toBeVisible();

    await expect(page.locator('[data-v303-status="confirmed"]')).toHaveCount(1);
    await expect(page.locator('[data-v303-status="provisional"]')).toHaveCount(3);
    await expect(page.locator('[data-v303-status="label"]')).toHaveCount(2);
    await expect(page.locator('[data-v303-layer]')).toHaveAttribute('data-v303-provisional-count', '3');

    await expect(page.getByText('≈ 28–30 cm')).toBeVisible();
    await expect(page.getByText('≈ 420 g')).toBeVisible();
    await expect(page.getByText('Mantener congelada', { exact: true })).toBeVisible();
    await expect(page.getByText(/no sustituyen etiqueta, especificación sanitaria/i)).toBeVisible();
  });

  test('la ficha esencial aparece antes del relato largo V2.9', async ({ page }) => {
    await page.goto('/producto.html?id=margherita-del-taller');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v303Ready === 'true');
    const order = await page.evaluate(() => {
      const essential = document.querySelector('[data-v303-layer]');
      const story = document.querySelector('[data-v29-product-story]');
      return Boolean(essential && story && (essential.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(order).toBeTruthy();
    await expect(page.getByText('Composición por función')).toBeVisible();
    await expect(page.getByText('Señales de punto')).toBeVisible();
  });

  test('las cinco pizzas reciben V3.0.3 sin convertir las otras referencias', async ({ page }) => {
    for (const id of pizzas) {
      await page.goto(`/producto.html?id=${id}`);
      await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v303Ready === 'true');
      await expect(page.locator('html')).toHaveAttribute('data-ee-product-detail-version', '3.0.3');
      await expect(page.locator('[data-v303-layer]')).toHaveCount(1);
      await expect(page.locator('[data-v302-block="craft-proof"]')).toHaveCount(1);
    }

    await page.goto('/producto.html?id=salsa-tomate');
    await expect(page.locator('[data-v303-layer]')).toHaveCount(0);
  });

  test('V3.0.3 no publica vida útil ni cronómetro universal como aproximación', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v303Ready === 'true');
    const layer = page.locator('[data-v303-layer]');
    const text = (await layer.innerText()).toLowerCase();
    expect(text).not.toMatch(/vida útil\s*[=:]\s*≈/);
    expect(text).not.toMatch(/\b≈\s*\d+\s*(min|minutos|días|meses)\b/);
    expect(text).toContain('la instrucción del empaque prevalece');
  });

  test('móvil mantiene el pasaporte dentro del viewport', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'), 'Validación exclusiva de proyecto móvil');
    await page.goto('/producto.html?id=cuatro-quesos-montana');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v303Ready === 'true');
    const box = await page.locator('.v303-passport').boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  });
});