const { test, expect } = require('@playwright/test');

test.describe('V4 promoted brand assets',()=>{
  test('el shell público usa el pizzaiolo V4 con wordmark vivo',async({page})=>{
    await page.goto('/index.html');
    const brand=page.locator('.v4-public-brand');
    await expect(brand).toBeVisible();
    await expect(brand.locator('.v4-public-brand-mark')).toHaveAttribute('src','assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    await expect(brand.getByText('EL ERRANTE',{exact:true})).toBeVisible();
    await expect(brand.getByText('Pizza contemporánea · Est. 2019',{exact:true})).toBeVisible();
    await expect(brand).not.toHaveAttribute('data-master-status','awaiting-approved-binary');
    await expect(page.locator('#site-header img[src*="logo-mark"]')).toHaveCount(0);
  });

  test('Historia promueve la escena V4 sin reemplazar su copy canónico',async({page})=>{
    await page.goto('/historia.html');
    await expect(page.getByRole('heading',{name:'Viajar hasta una tradición para aprender a no copiarla.'})).toBeVisible();
    const background=await page.locator('.v4ed-hero-media').evaluate(node=>getComputedStyle(node).backgroundImage);
    expect(background).toContain('assets/images/brand-v4/historia-v4.webp');
    await expect(page.locator('.v4ed-hero-media img')).toHaveCSS('opacity','0');
  });

  test('Centro de confianza incorpora la pieza V4 sin alterar su verdad operativa',async({page})=>{
    await page.goto('/legal.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.getByRole('heading',{name:'La información importante debe estar clara antes de pedir un dato, un pago o una decisión.'})).toBeVisible();
    const note=page.locator('main .data-note').first();
    const background=await note.evaluate(node=>getComputedStyle(node,'::after').backgroundImage);
    expect(background).toContain('assets/images/brand-v4/confianza-v4.webp');
    await expect(page.getByText('El backend comercial y los canales centrales de soporte/cotización siguen sin estar conectados',{exact:false})).toBeVisible();
  });
});
