const { test, expect } = require('@playwright/test');

async function backgroundOf(locator,pseudo){return locator.evaluate((node,p)=>getComputedStyle(node,p||null).backgroundImage,pseudo||null);}

test.describe('V4 promoted brand assets',()=>{
  test('el shell público compartido usa el pizzaiolo V4 con wordmark vivo',async({page})=>{
    await page.goto('/tienda.html');
    const brand=page.locator('.v4-public-brand');
    await expect(brand).toBeVisible();
    await expect(brand.locator('.v4-public-brand-mark')).toHaveAttribute('src','assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    await expect(brand.getByText('EL ERRANTE',{exact:true})).toBeVisible();
    await expect(brand.getByText('Pizza contemporánea · Est. 2019',{exact:true})).toBeVisible();
    await expect(brand).not.toHaveAttribute('data-master-status','awaiting-approved-binary');
    await expect(page.locator('#site-header img[src*="logo-mark"]')).toHaveCount(0);
  });

  test('Home reutiliza únicamente los masters V4 aprobados para Segundo Fuego y En Movimiento',async({page})=>{
    await page.goto('/index.html');
    await expect(page.locator('.v4-fire-media img')).toHaveAttribute('src','assets/images/brand-v4/segundo-fuego-v4.webp');
    await expect(page.locator('.v4-movement-main img')).toHaveAttribute('src','assets/images/brand-v4/eventos-v4.webp');
  });

  test('Historia promueve la escena V4 sin reemplazar su copy canónico',async({page})=>{
    await page.goto('/historia.html');
    await expect(page.getByRole('heading',{name:'Viajar hasta una tradición para aprender a no copiarla.'})).toBeVisible();
    expect(await backgroundOf(page.locator('.v4ed-hero-media'))).toContain('assets/images/brand-v4/historia-v4.webp');
    await expect(page.locator('.v4ed-hero-media img')).toHaveCSS('opacity','0');
  });

  test('Centro de confianza incorpora la pieza V4 sin alterar su verdad operativa',async({page})=>{
    await page.goto('/legal.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.getByRole('heading',{name:'La información importante debe estar clara antes de pedir un dato, un pago o una decisión.'})).toBeVisible();
    const note=page.locator('main .data-note').first();
    expect(await backgroundOf(note,'::after')).toContain('assets/images/brand-v4/confianza-v4.webp');
    await expect(note).toContainText('El backend comercial y los canales centrales de soporte/cotización siguen sin estar conectados');
  });

  test('En Casa usa Segundo Fuego sin tocar instrucciones ni productos',async({page})=>{
    await page.goto('/en-casa.html');
    await expect(page.getByRole('heading',{name:/Nosotros hacemos el tiempo/})).toBeVisible();
    expect(await backgroundOf(page.locator('.v4p-hero-media'))).toContain('assets/images/brand-v4/segundo-fuego-v4.webp');
    await expect(page.locator('.v4p-hero-media img')).toHaveCSS('opacity','0');
    await expect(page.locator('#casa-products .product-card')).toHaveCount(5);
  });

  test('En Movimiento usa Eventos manteniendo el borrador local',async({page})=>{
    await page.goto('/en-movimiento.html');
    await expect(page.getByRole('heading',{name:/No llevamos una caja de pizzas/})).toBeVisible();
    expect(await backgroundOf(page.locator('.v4p-hero-media'))).toContain('assets/images/brand-v4/eventos-v4.webp');
    await expect(page.locator('.v4p-hero-media img')).toHaveCSS('opacity','0');
    await expect(page.getByText('Este formulario guarda un borrador únicamente en tu navegador',{exact:false})).toBeVisible();
  });
});