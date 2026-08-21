const { test, expect } = require('@playwright/test');

async function openAccount(page) {
  await page.goto('/cuenta.html');
  await page.waitForFunction(() => document.documentElement.dataset.eePublicCommerce === 'not-connected');
  await expect(page.locator('.ee-v29-account-offline')).toBeVisible();
}

test.describe('V4 cuenta y seguimiento', () => {
  test('preview conserva una sola fuente real y no simula seguimiento local', async ({ page }) => {
    await openAccount(page);

    await expect(page.locator('link[href="assets/brand-v4-account.css?v=4.3.0"]')).toHaveCount(1);
    await expect(page.locator('.v4-account-intro')).toBeVisible();
    await expect(page.locator('.account-nav a[aria-current="page"]')).toHaveText('Seguimiento');
    await expect(page.locator('#account-content input, #account-content textarea, #account-content select')).toHaveCount(0);
    await expect(page.locator('.ee-v29-account-offline')).toContainText('Seguimiento online todavía no activado');
    await expect(page.locator('.ee-v29-account-offline')).toContainText('no consulta pedidos reales');
    await expect(page.locator('.v4-account-principles .feature-card')).toHaveCount(3);
  });

  test('desktop usa índice + estado editorial y elimina card-wall', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Gate desktop');
    await openAccount(page);

    const layout = await page.locator('.account-layout').evaluate(node => {
      const css = getComputedStyle(node);
      const nav = node.querySelector('.account-nav').getBoundingClientRect();
      const status = node.querySelector('.v4-account-status').getBoundingClientRect();
      return {
        columns: css.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
        ordered: nav.right <= status.left + 1
      };
    });
    expect(layout.columns).toBe(2);
    expect(layout.ordered).toBe(true);

    const cardStyle = await page.locator('.v4-account-principles .feature-card').first().evaluate(node => {
      const css = getComputedStyle(node);
      return { radius: css.borderRadius, background: css.backgroundColor, shadow: css.boxShadow };
    });
    expect(cardStyle.radius).toBe('0px');
    expect(cardStyle.background).toBe('rgba(0, 0, 0, 0)');
    expect(cardStyle.shadow).toBe('none');
  });

  test('móvil mantiene índice accesible, estado y principios dentro del viewport', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Gate móvil');
    await openAccount(page);

    const geometry = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      columns: getComputedStyle(document.querySelector('.account-layout')).gridTemplateColumns,
      navDisplay: getComputedStyle(document.querySelector('.account-nav')).display,
      statusBorder: getComputedStyle(document.querySelector('.v4-account-status')).borderLeftWidth
    }));
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1);
    expect(geometry.columns.trim().split(/\s+/).length).toBe(1);
    expect(geometry.navDisplay).toBe('flex');
    expect(geometry.statusBorder).toBe('0px');
    await expect(page.locator('.ee-v29-account-offline .btn')).toBeVisible();
    await expect(page.locator('.v4-account-principles .feature-card')).toHaveCount(3);
  });
});