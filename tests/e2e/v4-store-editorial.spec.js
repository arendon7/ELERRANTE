const { test, expect } = require('@playwright/test');

const ids = [
  'margherita-del-taller',
  'la-errante',
  'bosque',
  'diavola-errante',
  'cuatro-quesos-montana'
];

test.describe('V4 store editorial selector', () => {
  test('mantiene las cinco decisiones comerciales y abandona el card wall V3', async ({ page }, testInfo) => {
    const response = await page.goto('/tienda.html', { waitUntil: 'domcontentloaded' });
    expect(response).not.toBeNull();
    expect(response.status()).toBeLessThan(400);

    const selector = page.locator('[data-v304-layer="store-selector"]');
    await expect(selector).toBeVisible();

    const choices = selector.locator('[data-v304-choice]');
    await expect(choices).toHaveCount(5);

    for (const id of ids) {
      const choice = selector.locator(`[data-v304-choice="${id}"]`);
      await expect(choice).toHaveAttribute('href', `producto.html?id=${id}`);
    }

    const selectorStyle = await selector.evaluate(node => {
      const style = getComputedStyle(node);
      return { backgroundColor: style.backgroundColor, color: style.color };
    });
    expect(selectorStyle.backgroundColor).toBe('rgb(17, 17, 15)');

    const signature = selector.locator('[data-v304-choice="la-errante"]');
    const signatureStyle = await signature.evaluate(node => {
      const style = getComputedStyle(node);
      return { radius: style.borderTopLeftRadius, shadow: style.boxShadow };
    });
    expect(signatureStyle.radius).toBe('0px');
    expect(signatureStyle.shadow).toBe('none');

    const accent = await signature.locator('.v304-choice-copy > small').evaluate(node => getComputedStyle(node).color);
    expect(accent).toBe('rgb(183, 154, 91)');
    expect(accent).not.toBe('rgb(164, 78, 53)');

    if (testInfo.project.name === 'desktop-chromium') {
      const signatureBox = await signature.boundingBox();
      const margheritaBox = await selector.locator('[data-v304-choice="margherita-del-taller"]').boundingBox();
      expect(signatureBox).not.toBeNull();
      expect(margheritaBox).not.toBeNull();
      expect(signatureBox.width).toBeGreaterThan(margheritaBox.width * 1.15);
      expect(signatureBox.height).toBeGreaterThan(margheritaBox.height * 2.2);
    }
  });
});
