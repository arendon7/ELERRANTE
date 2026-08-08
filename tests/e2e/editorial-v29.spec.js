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

  test('el lenguaje compartido ya no reduce la marca a una réplica napolitana', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.EE_DATA?.settings?.content_ready === true);
    const settings=await page.evaluate(()=>window.EE_DATA.settings);
    expect(settings.descriptor).toContain('Pizza contemporánea hecha en Colombia');
    expect(settings.commercial_signature).toBe('Aprendida viajando. Hecha desde Colombia.');
    await expect(page.locator('body')).not.toContainText('Pizza napolitana, donde sea.');
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
    await expect(page.getByRole('heading', { name: 'El criterio no aparece solo. Hay alguien respondiendo por cada decisión.' })).toBeVisible();
    await expect(page.getByText('Dirección gastronómica', { exact: true })).toBeVisible();
    await expect(page.getByText('Dirección de producto y marca', { exact: true })).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Abrir centro de control');
    await page.goto('/centro-interno.html');
    await expect(page.getByRole('heading', { name: 'Modelo y operación de El Errante.' })).toBeVisible();
  });

  test('Ayuda no finge enviar un caso sin canal conectado', async ({ page }) => {
    await page.goto('/ayuda.html');
    await expect(page.getByText(/este formulario no envía información a El Errante/i)).toBeVisible();
    await expect(page.locator('#ee-v29-help-copy')).toHaveAttribute('type','button');
    await expect(page.locator('#ee-v29-help-copy')).toContainText('Guardar y copiar');
  });

  test('Eventos prepara un borrador local en lugar de simular una cotización enviada', async ({ page }) => {
    await page.goto('/en-movimiento.html#cotizar');
    await expect(page.locator('#cotizar')).toContainText('no envía ni reserva el evento');
    await expect(page.locator('#ee-v29-quote-copy')).toHaveAttribute('type','button');
    await expect(page.locator('#ee-v29-quote-copy')).toContainText('Guardar y copiar');
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
