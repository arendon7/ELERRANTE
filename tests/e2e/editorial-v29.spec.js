const { test, expect } = require('@playwright/test');

const v30Ids=['margherita-del-taller','la-errante','bosque','diavola-errante','cuatro-quesos-montana'];
const forbiddenClosedClaims=['A 400 grados','todas nuestras pizzas se hornean a 400 °C','la temperatura exacta de cocción es 400 °C','Trabajamos tomate San Marzano','Usamos tomate San Marzano','Trabajamos con biga y masa madre','Biga · Masa madre · Tiempo'];

test.describe('Editorial V3 truth + Home V4 brand candidate', () => {
  test('inicio V4 prioriza deseo, producto, movimiento y luego profundidad', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.getByRole('heading', { name: 'Pizza contemporánea. En movimiento.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aprendida viajando. Interpretada desde aquí.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cinco pizzas. Cinco decisiones.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nosotros hacemos el tiempo. Tú completas el fuego.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'El lugar cambia. La cocina no.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Antes de una receta, una pregunta.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La técnica sólo importa si termina en ganas de otro bocado.' })).toBeVisible();
    await expect(page.getByText('Italia fue escuela. Colombia es el lugar desde donde seguimos construyendo.')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-ee-editorial-version', '3.0');
  });

  test('navegación V4 prioriza comercio, método, autoría y movimiento sin equipo genérico', async ({ page }) => {
    await page.goto('/index.html');
    const nav=page.locator('.v4-nav');
    await expect(nav.locator('a[href="tienda.html"]')).toHaveAttribute('href','tienda.html');
    await expect(nav.locator('a[href="metodo.html"]')).toHaveAttribute('href','metodo.html');
    await expect(nav.locator('a[href="juan-david-ocampo.html"]')).toHaveAttribute('href','juan-david-ocampo.html');
    await expect(nav.locator('a[href="en-casa.html"]')).toHaveAttribute('href','en-casa.html');
    await expect(nav.locator('a[href="bitacora.html"]')).toHaveAttribute('href','bitacora.html');
    await expect(nav.locator('a[href="en-movimiento.html"]')).toHaveAttribute('href','en-movimiento.html');
    await expect(nav.locator('a[href="equipo.html"]')).toHaveCount(0);
    await expect(nav.locator('a[href="nosotros.html"]')).toHaveCount(0);
    await expect(page.locator('#site-header')).not.toBeVisible();
  });

  test('página de Juan David funciona como perfil de autor y no como página de socios', async ({ page }) => {
    await page.goto('/juan-david-ocampo.html');
    await expect(page.getByRole('heading',{name:'Cocinar antes de hacer pizza.'})).toBeVisible();
    await expect(page.getByText('La Colegiatura', { exact:false })).toBeVisible();
    await expect(page.getByText('El Cielo', { exact:false })).toBeVisible();
    await expect(page.getByText('Carmen', { exact:false })).toBeVisible();
    await expect(page.getByText('Lo que creo hoy', { exact:true })).toBeVisible();
    await expect(page.getByRole('heading',{name:'Cinco ideas que siguen ordenando el trabajo.'})).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Dirección de producto y marca');
    await expect(page.locator('main')).not.toContainText('socios');
  });

  test('método separa En Casa de Segundo Fuego y explica el régimen térmico', async ({ page }) => {
    await page.goto('/metodo.html');
    await expect(page.getByRole('heading',{name:'La pizza es la parte visible de muchas decisiones invisibles.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Cerca de 400 °C, el orden de las cosas cambia.'})).toBeVisible();
    await expect(page.getByText('No usamos esa cifra como un setpoint universal para todas las pizzas', { exact:false })).toBeVisible();
    await expect(page.getByText('El fuego no corrige el proceso. Lo vuelve visible.')).toBeVisible();
    await expect(page.getByText('En Casa nombra la línea. Segundo Fuego explica la investigación detrás.')).toBeVisible();
    await expect(page.getByText('El primero puede impresionar. El cuarto empieza a decir la verdad.')).toBeVisible();
  });

  test('historia narra el arco autoral y Bitácora queda firmada y versionada', async ({ page }) => {
    await page.goto('/historia.html');
    await expect(page.getByRole('heading',{name:'Viajar hasta una tradición para aprender a no copiarla.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Primero estuvo la cocina.'})).toBeVisible();
    await expect(page.getByText('Juan David Ocampo', { exact:false })).toBeVisible();
    await expect(page.getByText('El reloj organiza. La masa confirma.')).toBeVisible();
    await page.goto('/bitacora.html');
    await expect(page.getByText('Por Juan David Ocampo · Chef · El Errante')).toBeVisible();
    await expect(page.getByText('MAS-001 · En prueba')).toBeVisible();
    await expect(page.getByText('RIT-001 · Abierta')).toBeVisible();
    await expect(page.getByText('FER-001 · En prueba')).toBeVisible();
    await expect(page.getByText('MGH-001 · Prioritaria')).toBeVisible();
    await expect(page.getByText('Poolish, biga o masa madre no son una identidad.')).toBeVisible();
    await expect(page.getByText('La cocina genera contenido. El contenido no genera cocina.')).toBeVisible();
  });

  test('superficies públicas centrales no convierten hipótesis técnicas en claims cerrados', async ({ page }) => {
    for(const path of ['/index.html','/historia.html','/bitacora.html','/tienda.html','/en-casa.html','/metodo.html','/juan-david-ocampo.html']){
      await page.goto(path,{waitUntil:'domcontentloaded'});
      const main=page.locator('main');
      for(const claim of forbiddenClosedClaims) await expect(main,`${path}: ${claim}`).not.toContainText(claim);
    }
    await page.goto('/ayuda.html',{waitUntil:'domcontentloaded'});
    const faqSnapshot=await page.evaluate(()=>JSON.stringify(window.EE_DATA?.public_faqs||[]));
    expect(faqSnapshot).not.toContain('San Marzano');
    expect(faqSnapshot).not.toContain('Trabajamos con biga y masa madre');
    expect(faqSnapshot).toContain('Segundo Fuego');
  });

  test('En Casa mantiene claridad comercial y convierte Segundo Fuego en sistema tangible', async ({ page }) => {
    await page.goto('/en-casa.html');
    await expect(page.getByRole('heading',{name:'Nosotros hacemos el tiempo. Tú completas el fuego.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Tu horno no necesita comportarse como el nuestro.'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'No congelamos una pizza terminada. Diseñamos una pizza para terminarse dos veces.'})).toBeVisible();
    await expect(page.getByText('1 · Primer Fuego')).toBeVisible();
    await expect(page.getByText('2 · Transición')).toBeVisible();
    await expect(page.getByText('3 · Segundo Fuego')).toBeVisible();
    await expect(page.getByText('Segundo Fuego es el nombre que damos a la investigación detrás de En Casa.')).toBeVisible();
    await expect(page.getByText('La etiqueta tiene la última palabra.')).toBeVisible();
  });

  test('cinco pizzas reciben contrato gastronómico y prueba de oficio V3.0.2 sin perder catálogo', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11 && window.EE_DATA.products.some(p=>p.editorial_version==='3.0'));
    const products=await page.evaluate(ids=>ids.map(id=>{const p=window.EE_DATA.products.find(x=>x.id===id);return {id,territory:p?.territory,question:p?.workshop_question,decision:p?.workshop_decision,profile:p?.sensory_profile,home:p?.home_enabled,second:p?.second_fire_enabled,craft:p?.craft_proof,secondFocus:p?.second_fire_focus,secondFinish:p?.second_fire_finish,detailRelease:p?.product_detail_release};}),v30Ids);
    expect(products).toHaveLength(5);
    for(const product of products){
      expect(product.territory.length,`${product.id}: territory`).toBeGreaterThan(5);
      expect(product.question.length,`${product.id}: question`).toBeGreaterThan(25);
      expect(product.decision.length,`${product.id}: decision`).toBeGreaterThan(100);
      expect(Object.keys(product.profile||{}).length,`${product.id}: profile`).toBeGreaterThanOrEqual(5);
      expect(product.craft?.axis?.length,`${product.id}: craft axis`).toBeGreaterThan(8);
      expect(product.craft?.problem?.length,`${product.id}: craft problem`).toBeGreaterThan(100);
      expect(product.craft?.observation?.length,`${product.id}: craft observation`).toBeGreaterThan(100);
      expect(product.craft?.decision?.length,`${product.id}: craft decision`).toBeGreaterThan(100);
      expect(product.craft?.result?.length,`${product.id}: craft result`).toBeGreaterThan(100);
      expect(product.secondFocus?.length,`${product.id}: second fire focus`).toBeGreaterThan(60);
      expect(product.secondFinish?.length,`${product.id}: second fire finish`).toBeGreaterThan(60);
      expect(product.detailRelease).toBe('3.0.2');
      expect(product.home).toBe(true);
      expect(product.second).toBe(true);
    }
    expect(new Set(products.map(p=>p.territory)).size).toBe(5);
    expect(new Set(products.map(p=>p.craft.axis)).size).toBe(5);
  });

  test('ficha dinámica conserva comercio y hace visible la prueba de oficio V3.0.2', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => document.querySelector('#dynamic-product')?.dataset?.v302Ready === 'true' && document.querySelector('[data-v302-block="craft-proof"]'));
    await expect(page.locator('[data-v30-territory]')).toContainText('Territorio');
    await expect(page.locator('[data-v30-block="identity"]')).toContainText('Cómo se siente');
    await expect(page.locator('[data-v302-block="craft-proof"]')).toContainText('Ritmo entre grasa, dulzor y acidez');
    await expect(page.locator('[data-v302-block="craft-proof"]')).toContainText('Qué observamos');
    await expect(page.locator('[data-v302-block="craft-proof"]')).toContainText('Qué hacemos con esa información');
    await expect(page.locator('[data-v302-block="craft-proof"]')).toContainText('Qué debe ocurrir en el bocado');
    await expect(page.locator('[data-v30-block="workshop"]')).toContainText('¿Cómo puede una técnica aprendida afuera empezar a hablar desde Colombia?');
    await expect(page.locator('[data-v30-block="second-fire"]')).toContainText('En Casa · Segundo Fuego');
    await expect(page.locator('[data-v302-fire-specific]')).toContainText('Integrar la grasa del chorizo sin prolongar el fuego');
    await expect(page.locator('[data-v30-block="author"]')).toContainText('Juan David Ocampo');
    await expect(page.locator('#dynamic-product')).toContainText('La Errante');
    await expect(page.locator('#dynamic-product')).toHaveAttribute('data-v302-ready','true');
  });

  test('V3 no convierte precios demo ni hipótesis en verdad comercial', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.EE_DATA?.settings?.editorial_release === 'v3.0-authority-candidate');
    const snapshot=await page.evaluate(()=>({settings:window.EE_DATA.settings,products:window.EE_DATA.products.filter(p=>p.editorial_version==='3.0').map(p=>({id:p.id,canon_note:p.canon_note||'',workshop:p.workshop_decision||'',craft:p.craft_proof||{}}))}));
    expect(snapshot.settings.editorial_release).toBe('v3.0-authority-candidate');
    expect(snapshot.settings.product_detail_release).toBe('v3.0.2-pruebas-de-oficio');
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
