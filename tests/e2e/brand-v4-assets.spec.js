const { test, expect } = require('@playwright/test');

async function backgroundOf(locator,pseudo){return locator.evaluate((node,p)=>getComputedStyle(node,p||null).backgroundImage,pseudo||null);}
const GENERATED='assets/images/brand-v4/generated-01-20/';

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
    await expect(page.locator('img[src$="20-logo-lockup-v4-candidate.webp"]')).toHaveCount(0);
    await expect(page.locator('.v4-public-header')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-ee-v4-public-shell','ready');
  });

  test('Home promueve el banco individual 01-08 y conserva masters superiores ya aprobados',async({page})=>{
    await page.goto('/index.html');
    const hero=page.locator('.v4-hero-media img');
    await expect(hero).toHaveAttribute('src',GENERATED+'01-home-hero-v4.webp');
    await expect(hero).toHaveAttribute('width','1672');
    await expect(hero).toHaveAttribute('height','941');
    await expect(hero).toHaveAttribute('fetchpriority','high');
    await expect(page.locator('.v4-manifesto-media img')).toHaveAttribute('src',GENERATED+'08-proceso-v4.webp');
    await expect(page.locator('.v4-manifesto-media img')).toHaveAttribute('width','1122');
    await expect(page.locator('.v4-manifesto-media img')).toHaveAttribute('height','1402');
    await expect(page.locator('.v4-menu-feature-media img')).toHaveAttribute('src',GENERATED+'03-la-errante-v4.webp');
    await expect(page.locator('.v4-menu-item[href*="margherita-del-taller"] img')).toHaveAttribute('src',GENERATED+'02-margherita-v4.webp');
    await expect(page.locator('.v4-menu-item[href*="bosque"] img')).toHaveAttribute('src',GENERATED+'04-bosque-v4.webp');
    await expect(page.locator('.v4-menu-item[href*="diavola-errante"] img')).toHaveAttribute('src',GENERATED+'05-diavola-v4.webp');
    await expect(page.locator('.v4-menu-item[href*="cuatro-quesos-montana"] img')).toHaveAttribute('src',GENERATED+'06-cuatro-quesos-v4.webp');
    await expect(page.locator('.v4-pantry-media img')).toHaveAttribute('src',GENERATED+'07-despensa-v4.webp');
    await expect(page.locator('.v4-fire-media img')).toHaveAttribute('src','assets/images/brand-v4/segundo-fuego-v4.webp');
    await expect(page.locator('.v4-movement-main img')).toHaveAttribute('src','assets/images/brand-v4/eventos-v4.webp');
  });

  test('Tienda, Método y Bitácora usan sus heroes generados V4 con geometría estable',async({page})=>{
    await page.goto('/tienda.html');
    const storeHero=page.locator('.v4p-hero-media img');
    await expect(storeHero).toHaveAttribute('src',GENERATED+'11-tienda-hero-v4.webp');
    await expect(storeHero).toHaveAttribute('width','1672');
    await expect(storeHero).toHaveAttribute('height','941');
    await page.goto('/metodo.html');
    const methodHero=page.locator('.v4ed-hero-media img');
    await expect(methodHero).toHaveAttribute('src',GENERATED+'12-metodo-hero-v4.webp');
    await expect(methodHero).toHaveAttribute('width','1672');
    await expect(methodHero).toHaveAttribute('height','941');
    await page.goto('/bitacora.html');
    const journalHero=page.locator('.v4ed-hero-media img');
    await expect(journalHero).toHaveAttribute('src',GENERATED+'13-bitacora-hero-v4.webp');
    await expect(journalHero).toHaveAttribute('width','1672');
    await expect(journalHero).toHaveAttribute('height','941');
  });

  test('el menú móvil compartido expone estado accesible y no deja listeners/shells duplicados',async({page})=>{
    await page.setViewportSize({width:700,height:900});
    await page.goto('/tienda.html');
    const toggle=page.locator('.v4-public-menu-toggle');
    const drawer=page.locator('#v4-public-drawer');
    await expect(page.locator('.v4-public-header')).toHaveCount(1);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(toggle).toHaveAttribute('aria-label','Abrir navegación');
    await expect(drawer).toHaveAttribute('aria-hidden','true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(toggle).toHaveAttribute('aria-label','Cerrar navegación');
    await expect(drawer).toHaveAttribute('aria-hidden','false');
    await expect(page.locator('body')).toHaveClass(/v4-public-menu-open/);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(drawer).toHaveAttribute('aria-hidden','true');
    await expect(page.locator('body')).not.toHaveClass(/v4-public-menu-open/);
    await expect(toggle).toBeFocused();
  });

  test('Recetas y Herramientas reutilizan proceso e ingredientes V4 en lugar de visuales heredados',async({page})=>{
    await page.goto('/recetas.html');
    await expect(page.locator('.hero-media img')).toHaveAttribute('src',GENERATED+'08-proceso-v4.webp');
    const recipeVisuals=page.locator('.visual-card img');
    await expect(recipeVisuals.nth(0)).toHaveAttribute('src',GENERATED+'09-ingredientes-v4.webp');
    await expect(recipeVisuals.nth(1)).toHaveAttribute('src',GENERATED+'07-despensa-v4.webp');

    await page.goto('/herramientas.html');
    await expect(page.locator('.hero-media img')).toHaveAttribute('src',GENERATED+'08-proceso-v4.webp');
    await expect(page.locator('.section-dark .visual-card img')).toHaveAttribute('src',GENERATED+'09-ingredientes-v4.webp');
  });

  test('Ayuda y Seguimiento bloquean assets rechazados; Cobertura conserva su pieza aprobada',async({page})=>{
    await page.goto('/ayuda.html');
    await expect(page.locator('.hero-media img')).not.toHaveAttribute('src',GENERATED+'16-ayuda-v4.webp');
    await expect(page.getByText('no envía información a El Errante',{exact:false})).toBeVisible();

    await page.goto('/cobertura.html');
    await expect(page.locator('.hero-media img')).toHaveAttribute('src',GENERATED+'17-cobertura-v4.webp');

    await page.goto('/cuenta.html');
    await expect(page.locator('.v4-generated-tracking')).toHaveCount(0);
    await expect(page.locator(`img[src="${GENERATED}19-seguimiento-v4.webp"]`)).toHaveCount(0);
    await expect(page.getByText('Seguimiento online todavía no activado',{exact:false})).toBeVisible();
  });

  test('Checkout incorpora Confianza-alt sin falsear el estado real del canal',async({page})=>{
    await page.goto('/checkout.html');
    const trust=page.locator('.v4-checkout-trust img');
    await expect(trust).toHaveAttribute('src',GENERATED+'18-confianza-v4-alt.webp');
    await expect(trust).toHaveAttribute('width','1672');
    await expect(trust).toHaveAttribute('height','941');
    await expect(page.getByText('Compra online todavía no activada',{exact:true})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Tu carrito está listo. El canal que debe recibir el pedido todavía no.'})).toBeVisible();
    await expect(page.locator('#checkout-v29-status')).toHaveAttribute('data-v29-commerce-guard','true');
  });

  test('Crea la Tuya no reutiliza el asset 14 mal clasificado',async({page})=>{
    await page.goto('/producto.html?id=crea-la-tuya');
    await expect(page.locator(`img[src="${GENERATED}14-crea-la-tuya-v4.webp"]`)).toHaveCount(0);
  });

  test('la ficha de La Errante usa el nuevo hero de producto sin tocar la lógica comercial',async({page})=>{
    await page.goto('/producto.html?id=la-errante');
    const primary=page.locator('#dynamic-product .v305-frame-primary img, #dynamic-product .product-gallery img').first();
    await expect(primary).toBeVisible();
    await expect(primary).toHaveAttribute('src',GENERATED+'03-la-errante-v4.webp');
    await expect(primary).toHaveAttribute('width','1122');
    await expect(primary).toHaveAttribute('height','1402');
    await expect(page.locator('.product-buy')).toBeVisible();
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

  test('En Casa usa Segundo Fuego, proceso y ritual sin tocar instrucciones ni productos',async({page})=>{
    await page.goto('/en-casa.html');
    await expect(page.getByRole('heading',{name:/Nosotros hacemos el tiempo/})).toBeVisible();
    expect(await backgroundOf(page.locator('.v4p-hero-media'))).toContain('assets/images/brand-v4/segundo-fuego-v4.webp');
    await expect(page.locator('.v4p-hero-media img')).toHaveCSS('opacity','0');
    const process=page.locator('.v4p-section--paper .v4p-media img').first();
    await expect(process).toHaveAttribute('src',GENERATED+'08-proceso-v4.webp');
    await expect(process).toHaveAttribute('width','1122');
    await expect(process).toHaveAttribute('height','1402');
    const ritual=page.locator('.v4-ritual-endcap img');
    await expect(ritual).toHaveAttribute('src',GENERATED+'10-ritual-v4.webp');
    await expect(ritual).toHaveAttribute('width','1672');
    await expect(ritual).toHaveAttribute('height','941');
    await expect(page.locator('#casa-products .product-card')).toHaveCount(5);
  });

  test('En Movimiento usa Eventos manteniendo el borrador local',async({page})=>{
    await page.goto('/en-movimiento.html');
    await expect(page.getByRole('heading',{name:/No llevamos una caja de pizzas/})).toBeVisible();
    expect(await backgroundOf(page.locator('.v4p-hero-media'))).toContain('assets/images/brand-v4/eventos-v4.webp');
    await expect(page.locator('.v4p-hero-media img')).toHaveCSS('opacity','0');
    await expect(page.getByText('Este formulario guarda un borrador únicamente en tu navegador',{exact:false})).toBeVisible();
  });

  test('el manifiesto PWA usa el pizzaiolo aprobado y no el logo heredado',async({page})=>{
    const manifest=await page.request.get('/manifest.webmanifest');
    expect(manifest.ok()).toBeTruthy();
    const data=await manifest.json();
    expect(data.icons?.[0]?.src).toBe('assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    expect(JSON.stringify(data)).not.toContain('assets/logo-mark.svg');
  });
});