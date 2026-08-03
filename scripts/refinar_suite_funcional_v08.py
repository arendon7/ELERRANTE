#!/usr/bin/env python3
"""Reemplaza la suite inicial por una regresión funcional menos frágil."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEST = ROOT / "tests/e2e/experiencia.spec.js"

TEST.write_text(r'''const { test, expect } = require('@playwright/test');

function observe(page) {
  const pageErrors = [];
  const consoleErrors = [];
  const failedLocal = [];
  const legacyRequests = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', request => {
    if (request.url().includes('/assets/chunks/')) legacyRequests.push(request.url());
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
    expect(legacyRequests, 'Solicitudes a chunks heredados').toEqual([]);
  };
}

async function open(page, path, needsData = true) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  if (needsData) {
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
  }
  await page.waitForTimeout(120);
}

async function canonicalState(page) {
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

test.describe('Runtime canónico', () => {
  test('inicio carga modelo, marca y visuales recuperados', async ({ page }) => {
    const clean = observe(page);
    await open(page, '/index.html');

    expect(await canonicalState(page)).toEqual({
      products: 11,
      variants: 14,
      recipes: 5,
      articles: 5,
      faqs: 5,
      coverage: 6,
      ready: true,
      source: 'assets/canonical-data.js + assets/preprod.js'
    });

    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('#site-header')).not.toBeEmpty();
    await expect(page.locator('#site-footer')).not.toBeEmpty();

    const visualCount = await page.locator('img[src*="assets/images/v040/"]').count();
    expect(visualCount).toBeGreaterThanOrEqual(2);
    const unloaded = await page.locator('img[src*="assets/images/v040/"]').evaluateAll(images =>
      images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src'))
    );
    expect(unloaded).toEqual([]);
    await clean();
  });

  test('tienda representa las once referencias canónicas', async ({ page }) => {
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

    const count = await page.locator('[data-cart-count]').allTextContents();
    expect(count.some(value => Number(value) > 0)).toBe(true);
    await clean();
  });
});

test.describe('Conversión', () => {
  test('checkout lee el carrito y conserva total positivo', async ({ page }) => {
    const clean = observe(page);
    await page.addInitScript(() => {
      localStorage.setItem('ee_v2_cart', JSON.stringify([
        { productId: 'la-errante', variantId: 'unidad', qty: 1 }
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

    const first = form.locator('.form-step').first();
    await first.locator('select').selectOption({ index: 1 });
    await first.locator('input[type="number"]').fill('40');
    await first.locator('input[type="date"]').fill('2026-12-12');
    await first.locator('input').nth(2).fill('Medellín');
    await first.locator('[data-next]').click();
    await expect(form.locator('.form-step').nth(1)).toBeVisible();
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
    const clean = observe(page);
    for (const path of pages) {
      await test.step(path, async () => {
        await open(page, path);
        await expect(page.locator('main')).toBeVisible();
        expect((await page.locator('main').innerText()).trim().length).toBeGreaterThan(120);
      });
    }
    await clean();
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
  const toggle = page.locator('[data-menu-toggle]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const drawer = page.locator('.mobile-drawer');
  await expect(drawer).toHaveClass(/open/);
  await expect(drawer.locator('a[href="equipo.html"]')).toBeVisible();
  await clean();
});
''', encoding='utf-8')

print('Suite funcional v0.8 refinada.')
