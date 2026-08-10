const { test, expect } = require('@playwright/test');

const expected = {
  'margherita-del-taller': 'producto-margherita.webp',
  'la-errante': 'producto-la-errante.webp',
  'bosque': 'producto-bosque.webp',
  'diavola-errante': 'producto-diavola.webp',
  'cuatro-quesos-montana': 'producto-cuatro-quesos.webp'
};

const pizzas = Object.keys(expected);

test.describe('Dirección visual de producto V3.0.5', () => {
  test('cada pizza conserva una pieza principal específica y separa contexto de materia/proceso', async ({ page }) => {
    for (const id of pizzas) {
      await page.goto(`/producto.html?id=${id}`);
      await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v305Ready === 'true');

      const root = page.locator('#dynamic-product');
      const gallery = root.locator('[data-v305-gallery="true"]');
      await expect(root).toHaveAttribute('data-v305-ready', 'true');
      await expect(gallery).toHaveCount(1);
      await expect(gallery.locator('[data-v305-frame="primary"]')).toHaveCount(1);
      await expect(gallery.locator('[data-v305-frame="material"]')).toHaveCount(1);
      await expect(gallery.locator('[data-v305-frame="process"]')).toHaveCount(1);
      await expect(gallery.locator('[data-v305-gallery-head]')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('data-ee-product-visual-version', '3.0.5');

      const primarySrc = await gallery.locator('[data-v305-frame="primary"] img').getAttribute('src');
      expect(primarySrc).toContain(expected[id]);
      expect(primarySrc).not.toContain('home-ingredientes.webp');
      expect(primarySrc).not.toContain('home-masa-fuego.webp');

      const sources = await gallery.locator('[data-v305-frame] img').evaluateAll(images => images.map(image => image.getAttribute('src')));
      expect(new Set(sources).size).toBe(sources.length);

      await expect(root.locator('[data-v303-layer]')).toHaveCount(1);
      await expect(root.locator('[data-v304-layer="quick-decision"]')).toHaveCount(1);
      await expect(root.locator('[data-v304-layer="comparison"]')).toHaveCount(1);
    }
  });

  test('la capa visual no se filtra a otras referencias', async ({ page }) => {
    for (const id of ['salsa-tomate', 'harina-aire-y-tiempo', 'crea-la-tuya', 'reduccion-balsamica']) {
      await page.goto(`/producto.html?id=${id}`);
      await expect(page.locator('[data-v305-gallery]')).toHaveCount(0);
      await expect(page.locator('[data-v305-frame]')).toHaveCount(0);
    }
  });

  test('los contextos visuales no se presentan como evidencia de fórmula o lote', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v305Ready === 'true');
    const gallery = page.locator('[data-v305-gallery="true"]');
    await expect(gallery.getByText('Materia · contexto')).toBeVisible();
    await expect(gallery.getByText('Proceso · contexto')).toBeVisible();
    const copy = (await gallery.innerText()).toLowerCase();
    expect(copy).not.toContain('fotografía de lote');
    expect(copy).not.toContain('prueba de formulación');
    expect(copy).not.toContain('ingredientes exactos');
  });

  test('móvil mantiene la galería V3.0.5 dentro del viewport', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'), 'Validación exclusiva de proyecto móvil');
    await page.goto('/producto.html?id=bosque');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v305Ready === 'true');
    const box = await page.locator('[data-v305-gallery="true"]').boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    await expect(page.locator('[data-v304-mobile-buy]')).toBeVisible();
  });
});
