const { test, expect } = require('@playwright/test');

const utilityPages=['/ayuda.html','/cobertura.html','/checkout.html','/legal.html','/cuenta.html','/recetas.html','/receta.html','/herramientas.html','/articulo.html','/caso-evento.html'];

test.describe('V4 utility public system',()=>{
  test('Ayuda conserva FAQ y borrador local dentro del shell V4',async({page})=>{
    await page.goto('/ayuda.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.locator('.v4-public-header')).toBeVisible();
    await expect(page.getByRole('heading',{name:'Primero resolvamos lo que pueda resolverse con información clara.'})).toBeVisible();
    await expect(page.locator('#faq-list')).toBeVisible();
    await expect(page.locator('#ee-v29-help-form')).toBeVisible();
    await expect(page.getByText('este formulario no envía información a El Errante',{exact:false})).toBeVisible();
    await expect(page.locator('#ee-v29-help-status')).not.toHaveClass(/show/);
  });

  test('Cobertura conserva consulta y tabla sin prometer entrega',async({page})=>{
    await page.goto('/cobertura.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.getByRole('heading',{name:'Cada producto necesita una ruta adecuada.'})).toBeVisible();
    await expect(page.locator('.coverage-form')).toBeVisible();
    await expect(page.locator('#coverage-table')).toBeVisible();
    await expect(page.getByText('La entrega se confirma después de revisar inventario, capacidad de ruta, fecha y características del pedido.')).toBeVisible();
  });

  test('Checkout mantiene verdad comercial y no simula un pedido real',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('ee_v2_cart',JSON.stringify([{id:'la-errante',variant:'unidad',qty:1}])));
    await page.goto('/checkout.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.locator('.v4-public-header')).toBeVisible();
    await expect(page.locator('#checkout-lines')).toContainText('La Errante');
    await expect(page.getByText('Compra online todavía no activada',{exact:true})).toBeVisible();
    await expect(page.locator('#ee-receipt')).toHaveCount(0);
  });

  test('Centro de confianza y seguimiento usan el mismo sistema sin inventar backend',async({page})=>{
    await page.goto('/legal.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.getByRole('heading',{name:'La información importante debe estar clara antes de pedir un dato, un pago o una decisión.'})).toBeVisible();
    await expect(page.locator('link[rel="icon"][href*="logo-mark"]')).toHaveCount(0);
    await page.goto('/cuenta.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.getByRole('heading',{name:'Seguimiento real cuando exista una fuente real.'})).toBeVisible();
    await expect(page.getByText('Seguimiento online todavía no activado',{exact:true})).toBeVisible();
    await expect(page.locator('#account-content')).toHaveAttribute('data-v29-commerce-guard','true');
  });

  test('Recetas y herramientas mantienen contenido dinámico bajo V4',async({page})=>{
    await page.goto('/recetas.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.locator('.v4-public-header')).toBeVisible();
    await page.goto('/herramientas.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.getByRole('heading',{name:'Convierte una idea en una primera fórmula.'})).toBeVisible();
  });

  test('Caso de evento conserva el contenido operativo pero entra al lenguaje V4',async({page})=>{
    await page.goto('/caso-evento.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
    await expect(page.locator('.v4-public-header')).toBeVisible();
    await expect(page.getByRole('heading',{name:'Una noche, dos hornos y una cocina en movimiento.'})).toBeVisible();
    await expect(page.locator('.hero-media img')).toHaveAttribute('src','assets/images/brand-v4/eventos-v4.webp');
    await expect(page.getByText('Las cifras son ilustrativas y deben ajustarse',{exact:false})).toBeVisible();
  });

  for(const path of utilityPages){
    test(`${path} activa V4 sin logo legado ni overflow móvil`,async({page},testInfo)=>{
      test.skip(!testInfo.project.name.toLowerCase().includes('mobile'),'Gate móvil');
      await page.goto(path);
      await expect(page.locator('body')).toHaveAttribute('data-v4-public','true');
      await expect(page.locator('body')).toHaveAttribute('data-v4-utility','true');
      await expect(page.locator('.v4-public-header')).toBeVisible();
      await expect(page.locator('link[href="assets/brand-v4-utility.css"]')).toHaveCount(1);
      await expect(page.locator('link[rel="icon"][href*="logo-mark"]')).toHaveCount(0);
      const toggle=page.locator('.v4-public-menu-toggle');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(page.locator('.v4-public-drawer')).toHaveClass(/open/);
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded','false');
      const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      expect(width.scroll).toBeLessThanOrEqual(width.client+1);
    });
  }
});