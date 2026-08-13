const { test, expect } = require('@playwright/test');

test.describe('Home V4 brand and UX gates', () => {
  test('usa la identidad V4 con isotipo aprobado y wordmark vivo', async ({ page }) => {
    await page.goto('/index.html');
    const brand=page.locator('.v4-brand-fallback');
    await expect(brand).toBeVisible();
    await expect(brand).not.toHaveAttribute('data-master-status','awaiting-approved-binary');
    await expect(brand.locator('.v4-home-brand-mark')).toHaveAttribute('src','assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    await expect(brand).toContainText('EL ERRANTE');
    await expect(brand).toContainText('Pizza contemporánea · Est. 2019');
    await expect(page.locator('.v4-header img[src*="logo-mark"]')).toHaveCount(0);
    await expect(page.locator('#site-header')).not.toBeVisible();
  });

  test('conserva rutas comerciales principales en el primer viewport', async ({ page }) => {
    await page.goto('/index.html');
    const hero=page.locator('.v4-hero');
    await expect(hero.getByRole('link',{name:'Ver las pizzas'})).toHaveAttribute('href','tienda.html?category=en-casa');
    await expect(hero.getByRole('link',{name:'Cotizar un evento'})).toHaveAttribute('href','en-movimiento.html#cotizar');
    await expect(page.locator('.v4-header').getByRole('link',{name:/Carrito/})).toHaveAttribute('href','checkout.html');
  });

  test('móvil tiene navegación usable y no desborda horizontalmente', async ({ page }) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/index.html');
    const toggle=page.locator('.v4-menu-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('.v4-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client+1);
  });

  test('media principal declara dimensiones y el contenido inferior usa lazy loading', async ({ page }) => {
    await page.goto('/index.html');
    const hero=page.locator('.v4-hero-media img');
    await expect(hero).toHaveAttribute('width','1122');
    await expect(hero).toHaveAttribute('height','1402');
    await expect(hero).toHaveAttribute('fetchpriority','high');
    const lazyImages=page.locator('main img[loading="lazy"]');
    expect(await lazyImages.count()).toBeGreaterThanOrEqual(8);
  });

  test('el manifiesto visual V4 mantiene negro, marfil y oro como sistema', async ({ page }) => {
    await page.goto('/index.html');
    const values=await page.locator('body').evaluate(el=>{
      const s=getComputedStyle(el);
      return {
        carbon:s.getPropertyValue('--v4-carbon').trim(),
        ivory:s.getPropertyValue('--v4-ivory').trim(),
        gold:s.getPropertyValue('--v4-gold').trim()
      };
    });
    expect(values).toEqual({carbon:'#11110f',ivory:'#f1ebdd',gold:'#b79a5b'});
  });
});