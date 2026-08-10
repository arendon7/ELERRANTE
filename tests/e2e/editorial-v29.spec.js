const { test, expect } = require('@playwright/test');

const v30Ids=['margherita-del-taller','la-errante','bosque','diavola-errante','cuatro-quesos-montana'];

test.describe('Editorial y autoridad V3.0 candidate', () => {
  test('inicio presenta obra, autor, método y carta por territorios', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.getByRole('heading', { name: 'Una tradición aprendida viajando. Una cocina construida desde aquí.' })).toBeVisible();
    await expect(page.getByText('No queríamos imitar una pizza. Queríamos entender qué la hacía posible.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Antes de estudiar pizza, aprendió a cocinar.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cinco pizzas. Cinco maneras de pensar.' })).toBeVisible();
    await expect(page.getByText('En Casa nombra una línea clara para el cliente.')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-ee-editorial-version', '3.0');
  });

  test('navegación pública prioriza método y autoría y no expone equipo genérico', async ({ page }) => {
    await page.goto('/index.html');
    const nav=page.locator('.main-nav');
    await expect(nav.getByRole('link',{name:'Método'})).toHaveAttribute('href','metodo.html');
    await expect(nav.getByRole('link',{name:'Juan David'})).toHaveAttribute('href','juan-david-ocampo.html');
    await expect(nav.getByRole('link',{name:'En Casa'})).toHaveAttribute('href','en-casa.html');
    await expect(nav.getByRole('link',{name:'Bitácora'})).toHaveAttribute('href','bitacora.html');
    await expect(nav.locator('a[href="equipo.html"]')).toHaveCount(0);
    await expect(nav.locator('a[href="nosotros.html"]')).toHaveCount(0);
  });

  test('página de Juan David funciona como perfil de autor y no como página de socios', async ({ page }) => {
    await page.goto('/juan-david-ocampo.html');
    await expect(page.getByRole('heading',{name:'Cocinar antes de hacer pizza.'})).toBeVisible();
    await expect(page.getByText('La Colegiatura', { exact:false })).toBeVisible();
    await expect(page.getByText('El Cielo', { exact:false })).toBeVisible();
    await expect(page.getByText('Carmen', { exact:false })).toBeVisible();
    await expect(page.getByRole('heading',{name:'Lo que creo hoy'})).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Dirección de producto y marca');
    await expect(page.locator('main')).not.toContainText('socios');
  });

  test('método separa En Casa de Segundo Fuego', async ({ page }) => {
    await page.goto('/metodo.html');
    await expect(page.getByRole('heading',{name:'La pizza es la parte visible de muchas decisiones invisibles.'})).toBeVisible();
    await expect(page.getByText('En Casa nombra la línea. Segundo Fuego explica la investigación detrás.')).toBeVisible();
    await expect(page.getByText('El primero puede impresionar. El cuarto empieza a decir la verdad.')).toBeVisible();
  });

  test('historia narra el arco autoral sin convertir hipótesis técnicas en claims', async ({ page }) => {
    await page.goto('/historia.html');
    await expect(page.getByRole('heading',{name:'Viajar hasta una tradición para aprender a no copiarla.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Primero estuvo la cocina.'})).toBeVisible();
    await expect(page.getByText('Juan David Ocampo', { exact:false })).toBeVisible();
    await expect(page.getByText('El reloj organiza. La masa confirma.')).toBeVisible();
    const main=page.locator('main');
    await expect(main).not.toContainText('A 400 grados');
    await expect(main).not.toContainText('400 °C');
    await expect(main).not.toContainText('Trabajamos tomate San Marzano');
    await expect(main).not.toContainText('Usamos tomate San Marzano');
    await expect(main).not.toContainText('Trabajamos con biga y masa madre');
    await expect(main).not.toContainText('Biga · Masa madre · Tiempo');
  });

  test('bitácora es un archivo firmado, versionado y seguro frente a claims abiertos', async ({ page }) => {
    await page.goto('/bitacora.html');
    await expect(page.getByText('Por Juan David Ocampo · Chef · El Errante')).toBeVisible();
    await expect(page.getByText('MAS-001 · En prueba')).toBeVisible();
    await expect(page.getByText('RIT-001 · Abierta')).toBeVisible();
    await expect(page.getByText('FER-001 · En prueba')).toBeVisible();
    await expect(page.getByText('MGH-001 · Prioritaria')).toBeVisible();
    await expect(page.getByText('Poolish, biga o masa madre no son una identidad.')).toBeVisible();
    await expect(page.getByText('La cocina genera contenido. El contenido no genera cocina.')).toBeVisible();
    const main=page.locator('main');
    await expect(main).not.toContainText('A 400 grados');
    await expect(main).not.toContainText('400 °C');
    await expect(main).not.toContainText('Trabajamos tomate San Marzano');
    await expect(main).not.toContainText('Usamos tomate San Marzano');
    await expect(main).not.toContainText('Trabajamos con biga y masa madre');
    await expect(main).not.toContainText('Biga · Masa madre · Tiempo');
  });

  test('cinco pizzas reciben el contrato gastronómico V3 sin perder catálogo', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11 && window.EE_DATA.products.some(p=>p.editorial_version==='3.0'));
    const products=await page.evaluate(ids=>ids.map(id=>{const p=window.EE_DATA.products.find(x=>x.id===id);return {id,territory:p?.territory,question:p?.workshop_question,decision:p?.workshop_decision,profile:p?.sensory_profile,home:p?.home_enabled,second:p?.second_fire_enabled};}),v30Ids);
    expect(products).toHaveLength(5);
    for(const product of products){
      expect(product.territory.length,`${product.id}: territory`).toBeGreaterThan(5);
      expect(product.question.length,`${product.id}: question`).toBeGreaterThan(25);
      expect(product.decision.length,`${product.id}: decision`).toBeGreaterThan(100);
      expect(Object.keys(product.profile||{}).length,`${product.id}: profile`).toBeGreaterThanOrEqual(5);
      expect(product.home).toBe(true);
      expect(product.second).toBe(true);
    }
    expect(new Set(products.map(p=>p.territory)).size).toBe(5);
  });

  test('ficha dinámica conserva comercio y añade profundidad V3', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v30Ready === 'true');
    await expect(page.locator('[data-v30-territory]')).toContainText('Territorio');
    await expect(page.locator('[data-v30-block="identity"]')).toContainText('Cómo se siente');
    await expect(page.locator('[data-v30-block="workshop"]')).toContainText('¿Cómo puede una técnica aprendida afuera empezar a hablar desde Colombia?');
    await expect(page.locator('[data-v30-block="second-fire"]')).toContainText('En Casa · Segundo Fuego');
    await expect(page.locator('[data-v30-block="author"]')).toContainText('Juan David Ocampo');
    await expect(page.locator('#dynamic-product')).toContainText('La Errante');
  });

  test('V3 no convierte precios demo ni hipótesis en verdad comercial', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.EE_DATA?.settings?.editorial_release === 'v3.0-authority-candidate');
    const snapshot=await page.evaluate(()=>({settings:window.EE_DATA.settings,products:window.EE_DATA.products.filter(p=>p.editorial_version==='3.0').map(p=>({id:p.id,canon_note:p.canon_note||'',workshop:p.workshop_decision||''}))}));
    expect(snapshot.settings.editorial_release).toBe('v3.0-authority-candidate');
    expect(JSON.stringify(snapshot.products).toLowerCase()).not.toContain('la mejor pizza de colombia');
    expect(JSON.stringify(snapshot.products).toLowerCase()).not.toContain('auténtica napolitana certificada');
    const qso=snapshot.products.find(p=>p.id==='cuatro-quesos-montana');
    expect(qso.canon_note).toContain('validación');
  });

  test('centro interno conserva la separación de sesión y módulos', async ({ page }) => {
    await page.goto('/centro-interno.html');
    await expect(page).toHaveURL(/acceso\.html/);
    await page.evaluate(()=>sessionStorage.setItem('ee_v31_session',JSON.stringify({version:'3.1.0',username:'qa',displayName:'QA',role:'Administrador',issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString()})));
    await page.goto('/centro-interno.html');
    await expect(page.getByRole('heading', { name: 'Elige dónde quieres trabajar.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Abrir Panel de control/ })).toHaveAttribute('href','control.html');
    await expect(page.getByRole('link', { name: /Entrar a Operación/ })).toHaveAttribute('href','operacion.html');
    await expect(page.getByRole('link', { name: /Entrar a Finanzas/ })).toHaveAttribute('href','finanzas.html');
  });
});