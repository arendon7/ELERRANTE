const { test, expect } = require('@playwright/test');

async function seedCart(page) {
  await page.addInitScript(() => {
    localStorage.setItem('ee_v2_cart', JSON.stringify([
      { productId: 'la-errante', quantity: 1 },
      { productId: 'panela-maracuya', quantity: 1 }
    ]));
  });
}

async function openCheckout(page) {
  await seedCart(page);
  await page.goto('/checkout.html');
  await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
  await page.waitForFunction(() => document.documentElement.dataset.eePublicCommerce === 'not-connected');
  await page.evaluate(() => window.EE_PUBLIC_COMMERCE_GUARD_V29?.renderCheckoutSummary?.());
}

test.describe('V4 checkout', () => {
  test('offline conserva verdad comercial y resumen sin capturar datos personales', async ({ page }) => {
    await openCheckout(page);

    await expect(page.locator('link[href="assets/brand-v4-checkout.css?v=4.2.0"]')).toHaveCount(1);
    await expect(page.locator('.v4-checkout-intro')).toBeVisible();
    await expect(page.locator('.ee-v29-commerce-offline')).toBeVisible();
    await expect(page.locator('.ee-v29-summary-line')).toHaveCount(2);
    await expect(page.locator('#checkout-v29-status input, #checkout-v29-status textarea, #checkout-v29-status select')).toHaveCount(0);
    await expect(page.locator('#checkout-v29-status')).toContainText('Compra online todavía no activada');
    await expect(page.locator('#checkout-v29-status')).toContainText('no te pediremos dirección, comprobante ni datos personales');
    await expect(page.locator('.checkout-summary')).toContainText('Total estimado');
  });

  test('preview desktop usa composición V4 y neutraliza chrome heredado', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Gate desktop');
    await openCheckout(page);

    const style = await page.locator('.ee-v29-commerce-offline .btn').first().evaluate(node => {
      const css = getComputedStyle(node);
      return {
        radius: css.borderRadius,
        shadow: css.boxShadow,
        background: css.backgroundColor
      };
    });
    expect(style.radius).toBe('0px');
    expect(style.shadow).toBe('none');
    expect(style.background).toBe('rgb(17, 17, 15)');

    const layout = await page.locator('.checkout-layout').evaluate(node => {
      const css = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const form = node.querySelector('.form-card').getBoundingClientRect();
      const summary = node.querySelector('.checkout-summary').getBoundingClientRect();
      return {
        display: css.display,
        width: rect.width,
        ordered: form.right <= summary.left + 1
      };
    });
    expect(layout.display).toBe('grid');
    expect(layout.width).toBeGreaterThan(600);
    expect(layout.ordered).toBe(true);
  });

  test('checkout móvil mantiene resumen, acciones y ancho útil', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Gate móvil');
    await openCheckout(page);

    const geometry = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      layoutColumns: getComputedStyle(document.querySelector('.checkout-layout')).gridTemplateColumns,
      actionColumns: getComputedStyle(document.querySelector('.ee-v29-commerce-offline .button-row')).gridTemplateColumns
    }));
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1);
    expect(geometry.layoutColumns.trim().split(/\s+/).length).toBe(1);
    expect(geometry.actionColumns.trim().split(/\s+/).length).toBe(1);
    await expect(page.locator('.checkout-summary')).toBeVisible();
    await expect(page.locator('.ee-v29-commerce-offline .btn')).toHaveCount(2);
  });
});