const { test, expect } = require('@playwright/test');

const editorialPages=['/metodo.html','/historia.html','/bitacora.html','/juan-david-ocampo.html'];

test.describe('V4 editorial system',()=>{
  test('Método conserva contratos técnicos dentro de la nueva jerarquía',async({page})=>{
    await page.goto('/metodo.html');
    await expect(page.locator('body')).toHaveAttribute('data-v4-editorial','true');
    await expect(page.getByRole('heading',{name:'La pizza es la parte visible de muchas decisiones invisibles.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Cerca de 400 °C, el orden de las cosas cambia.'})).toBeVisible();
    await expect(page.getByText('No usamos esa cifra como un setpoint universal para todas las pizzas',{exact:false})).toBeVisible();
    await expect(page.getByText('El fuego no corrige el proceso. Lo vuelve visible.')).toBeVisible();
    await expect(page.getByText('En Casa nombra la línea. Segundo Fuego explica la investigación detrás.')).toBeVisible();
    await expect(page.getByRole('heading',{name:'El primero puede impresionar. El cuarto empieza a decir la verdad.'})).toBeVisible();
    await expect(page.locator('.section-terracotta')).toHaveCount(0);
  });

  test('Historia se convierte en cronología sin perder el arco autoral',async({page})=>{
    await page.goto('/historia.html');
    await expect(page.getByRole('heading',{name:'Viajar hasta una tradición para aprender a no copiarla.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Primero estuvo la cocina.'})).toBeVisible();
    await expect(page.getByText('Juan David Ocampo',{exact:false})).toBeVisible();
    await expect(page.getByText('El reloj organiza. La masa confirma.')).toBeVisible();
    await expect(page.locator('.v4ed-timeline')).toBeVisible();
    await expect(page.locator('.section-terracotta')).toHaveCount(0);
    await expect(page.locator('.v4ed-hero img[src*="home-hero.webp"]')).toHaveCount(0);
  });

  test('Bitácora conserva estados, autoría y regla de publicación',async({page})=>{
    await page.goto('/bitacora.html');
    await expect(page.getByText('Por Juan David Ocampo · Chef · El Errante')).toBeVisible();
    await expect(page.getByText('MAS-001 · En prueba')).toBeVisible();
    await expect(page.getByText('RIT-001 · Abierta')).toBeVisible();
    await expect(page.getByText('FER-001 · En prueba')).toBeVisible();
    await expect(page.getByText('MGH-001 · Prioritaria')).toBeVisible();
    await expect(page.getByText('Poolish, biga o masa madre no son una identidad.')).toBeVisible();
    await expect(page.getByText('La cocina genera contenido. El contenido no genera cocina.')).toBeVisible();
    await expect(page.locator('.v4ed-notebooks')).toBeVisible();
    await expect(page.locator('.section-terracotta')).toHaveCount(0);
  });

  test('Juan David se presenta como autor culinario, no como ficha corporativa',async({page})=>{
    await page.goto('/juan-david-ocampo.html');
    await expect(page.getByRole('heading',{name:'Cocinar antes de hacer pizza.'})).toBeVisible();
    await expect(page.getByText('La Colegiatura',{exact:false})).toBeVisible();
    await expect(page.getByText('El Cielo',{exact:false})).toBeVisible();
    await expect(page.getByText('Carmen',{exact:false})).toBeVisible();
    await expect(page.getByText('Lo que creo hoy',{exact:true})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Cinco ideas que siguen ordenando el trabajo.'})).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Dirección de producto y marca');
    await expect(page.locator('main')).not.toContainText('socios');
    await expect(page.locator('.v4ed-profile')).toBeVisible();
  });

  for(const path of editorialPages){
    test(`${path} usa shell editorial V4 y no desborda en móvil`,async({page},testInfo)=>{
      test.skip(!testInfo.project.name.includes('mobile'),'Gate móvil');
      await page.goto(path);
      await expect(page.locator('.v4-public-header')).toBeVisible();
      await expect(page.locator('link[href="assets/brand-v4-editorial.css"]')).toHaveCount(1);
      const toggle=page.locator('.v4-public-menu-toggle');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(page.locator('.v4-public-drawer')).toHaveClass(/open/);
      await page.keyboard.press('Escape');
      const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      expect(width.scroll).toBeLessThanOrEqual(width.client+1);
    });
  }
});
