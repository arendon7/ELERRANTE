const { test, expect } = require('@playwright/test');

function observe(page) {
  const pageErrors = [];
  const consoleErrors = [];
  const failedLocal = [];
  const damagedSourceRequests = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', request => {
    const url = request.url();
    if (
      url.includes('/assets/chunks/app-') ||
      url.includes('/assets/chunks/data-') ||
      url.includes('/assets/chunks/preprod-')
    ) {
      damagedSourceRequests.push(url);
    }
  });
  page.on('requestfailed', request => {
    const url = request.url();
    const reason = request.failure()?.errorText || 'unknown';
    if (url.startsWith('http://127.0.0.1:4173') && !reason.includes('ERR_ABORTED')) {
      failedLocal.push(`${url}: ${reason}`);
    }
  });

  return async () => {
    expect(pageErrors, 'Excepciones JavaScript').toEqual([]);
    expect(consoleErrors, 'Errores de consola').toEqual([]);
    expect(failedLocal, 'Recursos locales fallidos').toEqual([]);
    expect(damagedSourceRequests, 'Solicitudes a fuentes truncadas').toEqual([]);
  };
}

async function open(page, path, needsData = true) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  if (needsData) {
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
  }
  await page.waitForTimeout(150);
}

async function runtimeState(page) {
  return page.evaluate(() => ({
    products: window.EE_DATA?.products?.length || 0,
    variants: window.EE_DATA?.products?.reduce((sum, product) => sum + product.variants.length, 0) || 0,
    recipes: window.EE_DATA?.recipes?.length || 0,
    articles: window.EE_DATA?.articles?.length || 0,
    faqs: window.EE_DATA?.faqs?.length || 0,
    coverage: window.EE_DATA?.coverage?.length || 0,
    ready: window.EE_CONTENT_STATUS?.ready,
    source: window.EE_CONTENT_STATUS?.source || ''
  }));
}

test.describe('Runtime recuperado', () => {
  test('inicio carga modelo, marca y visuales recuperados', async ({ page }) => {
    const clean = observe(page);
    await open(page, '/index.html');

    expect(await runtimeState(page)).toEqual({
      products: 11,
      variants: 14,
      recipes: 5,
      articles: 5,
      faqs: 5,
      coverage: 6,
      ready: true,
      source: 'assets/data.js + assets/preprod.js + assets/products-v6.js'
    });

    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('#site-header')).not.toBeEmpty();
    await expect(page.locator('#site-footer')).not.toBeEmpty();

    const visuals = page.locator('img[src*="assets/images/v040/"]');
    const visualCount = await visuals.count();
    expect(visualCount).toBeGreaterThanOrEqual(2);
    await visuals.evaluateAll(images => images.forEach(image => {
      image.loading = 'eager';
    }));
    await expect.poll(() => visuals.evaluateAll(images =>
      images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src'))
    )).toEqual([]);
    await clean();
  });

  test('tienda representa las once referencias recuperadas', async ({ page }) => {
    const clean = observe(page);
    await open(page, '/tienda.html');
    const grid = page.locator('#product-grid');
    await expect(grid).toBeVisible();
    await expect.poll(() => grid.locator(':scope > *').count()).toBe(11);

    const productTargets = await grid.locator('a[href*="producto.html?id="]').evaluateAll(links =>
      [...new Set(links.map(link => new URL(link.href).searchParams.get('id')).filter(Boolean))]
    );
    expect(productTargets.length).toBe(11);
    await clean();
  });

  test('ficha dinámica agrega una variante al carrito real', async ({ page }) => {
    const clean = observe(page);
    await open(page, '/producto.html?id=harina-aire-y-tiempo');
    await expect(page.locator('main h1').first()).toContainText('Aire y Tiempo');

    const add = page.locator('.buy-product').first();
    await expect(add).toBeVisible();
    await add.click();

    await expect.poll(() => page.evaluate(() => {
      const lines = JSON.parse(localStorage.getItem('ee_v2_cart') || '[]');
      return lines.reduce((sum, line) => sum + Number(line.qty || 0), 0);
    })).toBeGreaterThan(0);

    const count = await page.locator('.cart-count').allTextContents();
    expect(count.some(value => Number(value) > 0)).toBe(true);
    await clean();
  });
});

test.describe('Conversión', () => {
  test('checkout lee el carrito y conserva total positivo', async ({ page }) => {
    const clean = observe(page);
    await page.addInitScript(() => {
      localStorage.setItem('ee_v2_cart', JSON.stringify([
        { id: 'la-errante', variant: 'unidad', qty: 1 }
      ]));
    });
    await open(page, '/checkout.html');

    const body = await page.locator('body').innerText();
    expect(body).toContain('La Errante');
    expect(body).toMatch(/\$\s?[\d.]+/);
    await expect(page.locator('form').first()).toBeVisible();
    await clean();
  });

  test('cotización contiene tres pasos y avanza al segundo', async ({ page }) => {
    const clean = observe(page);
    await open(page, '/en-movimiento.html#cotizar');

    const form = page.locator('form.multi-step');
    await expect(form).toBeVisible();
    await expect(form.locator('.form-step')).toHaveCount(3);

    const first = form.locator('.form-step.active');
    await expect(first).toBeVisible();
    await first.locator('select').selectOption({ index: 1 });
    await first.locator('input[type="number"]').fill('40');
    await first.locator('input[type="date"]').fill('2026-12-12');
    await first.locator('input[required]').last().fill('Medellín');
    await first.locator('[data-next]').click();
    await expect(form.locator('.form-step').nth(1)).toHaveClass(/active/);
    await expect(form.locator('.form-step.active')).toHaveCount(1);
    await clean();
  });
});

test.describe('Superficies públicas', () => {
  const pages = [
    '/historia.html', '/en-casa.html', '/bitacora.html', '/recetas.html',
    '/herramientas.html', '/cobertura.html', '/ayuda.html', '/cuenta.html',
    '/nosotros.html'
  ];

  test('todas las superficies abren con contenido y sin errores', async ({ page }) => {
    for (const path of pages) {
      await test.step(path, async () => {
        const clean = observe(page);
        await open(page, path);
        await expect(page.locator('main')).toBeVisible();
        expect((await page.locator('main').innerText()).trim().length).toBeGreaterThan(120);
        await clean();
      });
    }
  });
});

test.describe('Demo integral', () => {
  const modules = [
    ['/equipo.html', 'main', true],
    ['/admin.html', '#admin-dynamic', true],
    ['/control.html', '#control-center', true],
    ['/operacion.html', '#operations-app', true],
    ['/studio.html', '#studio-app', true],
    ['/presentacion.html', '.presentation-slide.active', false]
  ];

  for (const [path, selector, needsData] of modules) {
    test(`${path} renderiza su modelo`, async ({ page }) => {
      const clean = observe(page);
      await open(page, path, needsData);
      const target = page.locator(selector).first();
      await expect(target).toBeVisible();
      expect((await target.innerText()).trim().length).toBeGreaterThan(20);
      await clean();
    });
  }
});

test('menú móvil abre y enlaza el centro integral', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Prueba exclusiva del proyecto móvil');
  const clean = observe(page);
  await open(page, '/index.html');
  const toggle = page.locator('.menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const drawer = page.locator('.mobile-drawer');
  await expect(drawer).toHaveClass(/open/);
  await expect(drawer.locator('a[href="equipo.html"]')).toBeVisible();
  await clean();
});
