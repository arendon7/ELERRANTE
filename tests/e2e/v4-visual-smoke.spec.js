const { test, expect } = require('@playwright/test');

const routes = [
  ['home', '/index.html'],
  ['tienda', '/tienda.html'],
  ['metodo', '/metodo.html'],
  ['historia', '/historia.html'],
  ['en-casa', '/en-casa.html'],
  ['en-movimiento', '/en-movimiento.html'],
  ['juan-david-ocampo', '/juan-david-ocampo.html']
];

test.describe('V4 visual smoke evidence', () => {
  for (const [slug, route] of routes) {
    test(`${slug} conserva evidencia visual auditable`, async ({ page }, testInfo) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      expect(response, `${route} debe responder`).not.toBeNull();
      expect(response.status(), `${route} debe cargar sin error HTTP`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();

      await page.waitForLoadState('load');
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });
      await page.waitForTimeout(250);

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
