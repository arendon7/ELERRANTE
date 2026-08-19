const { test, expect } = require('@playwright/test');

const routes = [
  ['home', '/index.html'],
  ['tienda', '/tienda.html'],
  ['producto-la-errante', '/producto.html?id=la-errante'],
  ['checkout', '/checkout.html'],
  ['metodo', '/metodo.html'],
  ['historia', '/historia.html'],
  ['en-casa', '/en-casa.html'],
  ['en-movimiento', '/en-movimiento.html'],
  ['juan-david-ocampo', '/juan-david-ocampo.html']
];

async function prepareRouteState(page, slug) {
  if (slug !== 'checkout') return;
  await page.addInitScript(() => {
    localStorage.setItem('ee_v2_cart', JSON.stringify([
      { productId: 'la-errante', quantity: 1 },
      { productId: 'panela-maracuya', quantity: 1 }
    ]));
  });
}

async function waitForSurfaceReady(page, slug) {
  if (slug === 'producto-la-errante') {
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v303Ready === 'true');
    await expect(page.locator('.product-detail')).toBeVisible();
    await expect(page.locator('.v305-gallery')).toBeVisible();
    return;
  }
  if (slug === 'checkout') {
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
    await page.waitForFunction(() => document.documentElement.dataset.eePublicCommerce === 'not-connected');
    await page.evaluate(() => window.EE_PUBLIC_COMMERCE_GUARD_V29?.renderCheckoutSummary?.());
    await expect(page.locator('.ee-v29-commerce-offline')).toBeVisible();
    await expect(page.locator('.ee-v29-summary-line')).toHaveCount(2);
  }
}

async function dismissCookieForVisualEvidence(page) {
  const necessary = page.locator('.cookie-banner.show [data-cookie="necessary"]').first();
  if (await necessary.count() && await necessary.isVisible()) {
    await necessary.click();
    await expect(page.locator('.cookie-banner')).not.toHaveClass(/show/);
    await page.waitForTimeout(80);
    const savedToast = page.getByText('Preferencias guardadas.', { exact: true });
    if (await savedToast.count()) {
      await savedToast.evaluateAll(nodes => nodes.forEach(node => node.remove()));
    }
  }
}

async function hydrateVisualSurface(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const scrollHeight = () => Math.max(
      document.body?.scrollHeight || 0,
      document.documentElement?.scrollHeight || 0
    );
    const step = Math.max(Math.floor(window.innerHeight * 0.75), 320);

    // Recorre la superficie para disparar IntersectionObserver, reveals y lazy-load.
    for (let pass = 0; pass < 2; pass += 1) {
      const height = scrollHeight();
      for (let y = 0; y <= height; y += step) {
        window.scrollTo(0, y);
        await sleep(45);
      }
      window.scrollTo(0, scrollHeight());
      await sleep(120);
    }

    // Da una ventana acotada a las imágenes ya solicitadas para decodificarse.
    const decodes = Array.from(document.images).map(async (image) => {
      try {
        if (!image.complete) {
          await Promise.race([
            new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            }),
            sleep(1200)
          ]);
        }
        if (typeof image.decode === 'function') await image.decode();
      } catch (_) {
        // La regresión funcional valida fallos reales de recursos; aquí solo hidratamos evidencia visual.
      }
    });

    await Promise.race([Promise.all(decodes), sleep(1800)]);
    window.scrollTo(0, 0);
    await sleep(180);
  });
}

test.describe('V4 visual smoke evidence', () => {
  for (const [slug, route] of routes) {
    test(`${slug} conserva evidencia visual auditable`, async ({ page }, testInfo) => {
      await prepareRouteState(page, slug);
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      expect(response, `${route} debe responder`).not.toBeNull();
      expect(response.status(), `${route} debe cargar sin error HTTP`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();

      await page.waitForLoadState('load');
      await waitForSurfaceReady(page, slug);
      await dismissCookieForVisualEvidence(page);
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });
      await hydrateVisualSurface(page);

      const screenshotPath = testInfo.outputPath(`${slug}-${testInfo.project.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        animations: 'disabled'
      });

      await testInfo.attach(`visual-${slug}-${testInfo.project.name}`, {
        path: screenshotPath,
        contentType: 'image/png'
      });
    });
  }
});