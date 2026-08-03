const { test, expect } = require('@playwright/test');

function monitorRuntime(page) {
  const errors = [];
  const failedLocalRequests = [];
  const chunkRequests = [];

  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('request', request => {
    if (request.url().includes('/assets/chunks/')) chunkRequests.push(request.url());
  });
  page.on('requestfailed', request => {
    const url = request.url();
    const reason = request.failure()?.errorText || 'unknown';
    if (url.startsWith('http://127.0.0.1:4173') && !reason.includes('ERR_ABORTED')) {
      failedLocalRequests.push(`${url}: ${reason}`);
    }
  });

  return async () => {
    expect(errors, 'Errores JavaScript o de consola').toEqual([]);
    expect(failedLocalRequests, 'Recursos locales fallidos').toEqual([]);
    expect(chunkRequests, 'El runtime volvió a solicitar chunks heredados').toEqual([]);
  };
}

async function openStable(page, path) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
}

test.describe('Fuente canónica y navegación pública', () => {
  test('inicio carga la marca, los datos y los visuales recuperados', async ({ page }) => {
    const assertRuntime = monitorRuntime(page);
    await openStable(page, '/index.html');

    await expect(page.locator('h1')).toContainText('Desarrollamos la masa');
    await expect(page.locator('#site-header')).not.toBeEmpty();
    await expect(page.locator('#site-footer')).not.toBeEmpty();

    const state = await page.evaluate(() => ({
      products: window.EE_DATA?.products?.length,
      recipes: window.EE_DATA?.recipes?.length,
      articles: window.EE_DATA?.articles?.length,
      faqs: window.EE_DATA?.faqs?.length,
      coverage: window.EE_DATA?.coverage?.length,
      contentReady: window.EE_CONTENT_STATUS?.ready,
      source: window.EE_CONTENT_STATUS?.source
    }));

    expect(state).toEqual({
      products: 11,
      recipes: 5,
      articles: 5,
      faqs: 5,
      coverage: 6,
      contentReady: true,
      source: 'assets/canonical-data.js + assets/preprod.js'
    });

    const recoveredImages = page.locator('img[src*="assets/images/v040/"]');
    await expect(recoveredImages.first()).toBeVisible();
    expect(await recoveredImages.count()).toBeGreaterThanOrEqual(2);

    await assertRuntime();
  });

  test('tienda muestra las once referencias y permite filtrar', async ({ page }) => {
    const assertRuntime = monitorRuntime(page);
    await openStable(page, '/tienda.html');

    await expect(page.locator('h1')).toContainText('Productos nacidos');
    const productLinks = page.locator('#product-grid a[href*="producto.html?id="]');
    await expect.poll(() => productLinks.count()).toBe(11);

    const filter = page.locator('[data-filter="en-casa"]');
    await expect(filter).toBeVisible();
    await filter.click();
    await expect.poll(async () => {
      const visible = page.locator('#product-grid .product-card:visible');
      return visible.count();
    }).toBeGreaterThan(0);

    await assertRuntime();
  });

  test('ficha de harina permite seleccionar variante y agregar al carrito', async ({ page }) => {
    const assertRuntime = monitorRuntime(page);
    await openStable(page, '/producto.html?id=harina-aire-y-tiempo');

    await expect(page.locator('h1')).toContainText('Harina Aire y Tiempo');
    await expect(page.locator('img[src*="v040-harina"]')).toHaveCountGreaterThan?.call;

    const variantSelect = page.locator('select').filter({ has: page.locator('option') }).first();
    if (await variantSelect.count()) {
      const options = await variantSelect.locator('option').count();
      expect(options).toBeGreaterThanOrEqual(2);
      await variantSelect.selectOption({ index: 1 });
    }

    const addButton = page.locator('button.buy-product, button:has-text("Agregar")').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect.poll(async () => page.evaluate(() => {
      const cart = JSON.parse(localStorage.getItem('ee_v2_cart') || '[]');
      return cart.reduce((sum, line) => sum + Number(line.qty || 0), 0);
    })).toBeGreaterThan(0);

    await expect.poll(async () => {
      const values = await page.locator('[data-cart-count]').allTextContents();
      return values.some(value => Number(value) > 0);
    }).toBe(true);

    await assertRuntime();
  });
});

test.describe('Conversión y formularios', () => {
  test('carrito agregado llega al checkout con total positivo', async ({ page }) => {
    const assertRuntime = monitorRuntime(page);
    await openStable(page, '/producto.html?id=la-errante');
    await page.locator('button.buy-product, button:has-text("Agregar")').first().click();
    await openStable(page, '/checkout.html');

    await expect(page.locator('h1')).toContainText(/Pedido|Finaliza/i);
    const totalText = await page.locator('.checkout-total, [data-checkout-total], .order-total, .summary-total').allTextContents();
    const bodyText = await page.locator('body').innerText();
    expect(totalText.join(' ') + bodyText).toMatch(/\$\s?\d/);
    await expect(page.locator('form').first()).toBeVisible();

    await assertRuntime();
  });

  test('cotización de evento avanza entre pasos', async ({ page }) => {
    const assertRuntime = monitorRuntime(page);
    await openStable(page, '/en-movimiento.html#cotizar');

    const form = page.locator('form.multi-step');
    await expect(form).toBeVisible();
    await form.locator('select').first().selectOption({ index: 1 });
    await form.locator('input[type="number"]').first().fill('40');
    await form.locator('input[type="date"]').first().fill('2026-12-12');
    await form.locator('input:not([type])').first().fill('Medellín');
    await form.locator('[data-next]').first().click();

    const steps = form.locator('.form-step');
    await expect(steps.nth(1)).toBeVisible();
    await assertRuntime();
  });

  test('cobertura, ayuda y cuenta abren sin errores', async ({ page }) => {
    const assertRuntime = monitorRuntime(page);
    for (const path of ['/cobertura.html', '/ayuda.html', '/cuenta.html']) {
      await openStable(page, path);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
    await assertRuntime();
  });
});

test.describe('Demo integral', () => {
  const modules = [
    ['/equipo.html', 'main'],
    ['/admin.html', '#admin-dynamic'],
    ['/control.html', '#control-center'],
    ['/operacion.html', '#operations-app'],
    ['/studio.html', '#studio-app'],
    ['/presentacion.html', '.presentation-slide.active']
  ];

  for (const [path, selector] of modules) {
    test(`${path} renderiza su modelo`, async ({ page }) => {
      const assertRuntime = monitorRuntime(page);
      await openStable(page, path);
      const target = page.locator(selector).first();
      await expect(target).toBeVisible();
      await expect(target).not.toBeEmpty();
      await assertRuntime();
    });
  }
});

test.describe('Responsive móvil', () => {
  test('menú móvil abre y conserva acceso al centro integral', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Solo aplica al proyecto móvil');
    const assertRuntime = monitorRuntime(page);
    await openStable(page, '/index.html');

    const toggle = page.locator('[data-menu-toggle]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    const drawer = page.locator('.mobile-drawer');
    await expect(drawer).toHaveClass(/open/);
    await expect(drawer.locator('a[href="equipo.html"]')).toBeVisible();

    await assertRuntime();
  });
});
