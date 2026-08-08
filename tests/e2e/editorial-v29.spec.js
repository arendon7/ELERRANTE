const { test, expect } = require('@playwright/test');

const productIds=['harina-aire-y-tiempo','crea-la-tuya','margherita-del-taller','diavola-errante','bosque','cuatro-quesos-montana','la-errante','salsa-tomate','reduccion-balsamica','panela-maracuya','combo-primera-ruta'];

test.describe('Editorial y experiencia V2.9', () => {
  test('inicio cuenta el origen antes de abrir el catálogo', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.getByRole('heading', { name: 'Una pizza aprendida viajando. Hecha para encontrar su lugar aquí.' })).toBeVisible();
    await expect(page.getByText('No queríamos imitar una pizza. Queríamos entender qué la hacía posible.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Elegir pizzas para casa' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-ee-editorial-version', '2.9.0');
  });

  test('tienda ordena la elección por nivel de participación', async ({ page }) => {
    await page.goto('/tienda.html');
    await expect(page.getByRole('heading', { name: 'Elige cuánto trabajo quieres hacer tú.' })).toBeVisible();
    await expect(page.getByText('Cuatro puertas. La misma cocina detrás.')).toBeVisible();
    await expect(page.locator('#product-grid')).toBeVisible();
  });

  test('las once referencias tienen copy profundo y diferenciado', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
    const editorial=await page.evaluate(ids=>ids.map(id=>{const product=window.EE_DATA.products.find(item=>item.id===id);return {id,tag:product?.tag||'',headline:product?.headline||'',summary:product?.summary||'',promise:product?.promise||'',story:product?.story||'',sensory:product?.sensory||'',process:product?.process||[]};}),productIds);
    expect(editorial).toHaveLength(11);
    for(const product of editorial){
      expect(product.tag.length,`${product.id}: tag`).toBeGreaterThan(5);
      expect(product.headline.length,`${product.id}: headline`).toBeGreaterThan(20);
      expect(product.summary.length,`${product.id}: summary`).toBeGreaterThan(70);
      expect(product.promise.length,`${product.id}: promise`).toBeGreaterThan(180);
      expect(product.story.length,`${product.id}: story`).toBeGreaterThan(120);
      expect(product.sensory.length,`${product.id}: sensory`).toBeGreaterThan(40);
      expect(product.process.length,`${product.id}: process`).toBeGreaterThanOrEqual(4);
    }
    expect(new Set(editorial.map(product=>product.headline)).size).toBe(11);
  });

  test('la ficha de La Errante integra producto y narrativa', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
    const product = await page.evaluate(() => window.EE_DATA.products.find(item => item.id === 'la-errante'));
    expect(product.tag).toBe('La pizza de la casa');
    expect(product.promise).toContain('chorizo aporta profundidad');
    expect(product.story_title).toContain('otra geografía');
    await expect(page.locator('[data-v29-product-story]')).toBeVisible();
  });

  test('Aire y Tiempo no inventa especificaciones todavía no validadas', async ({ page }) => {
    await page.goto('/producto.html?id=harina-aire-y-tiempo');
    await page.waitForFunction(() => window.EE_DATA?.products?.length === 11);
    const technical = await page.evaluate(() => window.EE_DATA.products.find(item => item.id === 'harina-aire-y-tiempo').technical);
    expect(technical).toHaveLength(4);
    expect(JSON.stringify(technical)).toContain('valid');
    expect(JSON.stringify(technical)).not.toMatch(/\bW\s*[:=]\s*\d/i);
    await expect(page.getByRole('heading', { name: 'Los números tienen que poder sostenerse.' })).toBeVisible();
  });

  test('En Casa explica por qué terminar no es recalentar', async ({ page }) => {
    await page.goto('/en-casa.html');
    await expect(page.getByRole('heading', { name: 'Nosotros hacemos el tiempo. Tú haces el último fuego.' })).toBeVisible();
    await expect(page.getByText('Tu horno no necesita comportarse como el nuestro.')).toBeVisible();
  });

  test('Bitácora contiene notas editoriales completas', async ({ page }) => {
    await page.goto('/bitacora.html');
    await expect(page.locator('#harina')).toContainText('La receta estaba bien. La pregunta estaba incompleta.');
    await expect(page.locator('#fermentar')).toContainText('Decir “fermentación larga” explica muy poco.');
    await expect(page.locator('#fuego')).toContainText('Un horno de 400 °C no es un horno de casa acelerado.');
    await expect(page.locator('#territorio')).toContainText('Aprender de Italia no nos obliga a fingir que estamos allí.');
  });

  test('Equipo es público y el centro interno queda separado', async ({ page }) => {
    await page.goto('/equipo.html');
    await expect(page.getByRole('heading', { name: 'El criterio no aparece solo. Hay alguien mirando cada decisión.' })).toBeVisible();
    await expect(page.getByText('Cocina y desarrollo gastronómico')).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Abrir centro de control');
    await page.goto('/centro-interno.html');
    await expect(page.getByRole('heading', { name: 'Modelo y operación de El Errante.' })).toBeVisible();
  });

  test('el activo editorial no contiene promesas comparativas no sustentadas', async ({ request }) => {
    const response = await request.get('/assets/editorial-v29.js');
    expect(response.ok()).toBeTruthy();
    const body = (await response.text()).toLowerCase();
    expect(body).not.toContain('la mejor pizza de colombia');
    expect(body).not.toContain('auténtica napolitana certificada');
    expect(body).not.toContain('igual a caputo');
  });
});
