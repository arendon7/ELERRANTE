const { test, expect } = require('@playwright/test');

const rejected=[
  '14-crea-la-tuya-v4.webp',
  '16-ayuda-v4.webp',
  '19-seguimiento-v4.webp',
  '20-logo-lockup-v4-candidate.webp'
];

async function source(page,path){
  const response=await page.request.get('/'+path);
  expect(response.ok()).toBeTruthy();
  return response.text();
}

const expectStaticUtilityV4=html=>{
  expect(html).toContain('data-v4-public="true"');
  expect(html).toContain('data-v4-utility="true"');
  expect(html).toContain('assets/brand-v4-public.css');
  expect(html).toContain('assets/brand-v4-utility.css');
  expect(html).toContain('assets/brand-v4-assets.css');
  expect(html).not.toContain('href="assets/logo-mark.svg"');
};

test.describe('V4 static first paint',()=>{
  test('Home nace con identidad, hero y social card V4 antes de ejecutar promociones dinámicas',async({page})=>{
    const html=await source(page,'index.html');
    expect(html).toContain('assets/brand-v4-assets.css');
    expect(html).toContain('assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    expect(html).toContain('assets/images/brand-v4/generated-01-20/01-home-hero-v4.webp');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('01-home-hero-v4.webp');
    expect(html).not.toContain('data-master-status="awaiting-approved-binary"');
    expect(html).not.toContain('src="assets/images/brand-final/producto-margherita.webp" alt="" width="1122" height="1402" fetchpriority="high"');
  });

  test('Tienda, Método y Bitácora cargan sus heroes V4 directamente desde HTML',async({page})=>{
    const store=await source(page,'tienda.html');
    const method=await source(page,'metodo.html');
    const journal=await source(page,'bitacora.html');
    expect(store).toContain('11-tienda-hero-v4.webp');
    expect(method).toContain('12-metodo-hero-v4.webp');
    expect(journal).toContain('13-bitacora-hero-v4.webp');
    for(const html of [store,method,journal])expect(html).toContain('assets/brand-v4-assets.css');
  });

  test('Tienda y Producto promueven visuales aprobados después del canon y antes de app.js',async({page})=>{
    const store=await source(page,'tienda.html');
    const product=await source(page,'producto.html');
    for(const html of [store,product]){
      const dataIndex=html.indexOf('assets/data.js');
      const visualIndex=html.indexOf('assets/brand-v4-product-data.js');
      const appIndex=html.indexOf('assets/app.js');
      expect(dataIndex).toBeGreaterThan(-1);
      expect(visualIndex).toBeGreaterThan(dataIndex);
      expect(appIndex).toBeGreaterThan(visualIndex);
    }
    const layer=await source(page,'assets/brand-v4-product-data.js');
    expect(layer).toContain("'margherita-del-taller':'02-margherita-v4.webp'");
    expect(layer).toContain("'la-errante':'03-la-errante-v4.webp'");
    expect(layer).toContain("product.id==='combo-primera-ruta'");
    for(const asset of rejected)expect(layer).not.toContain(asset);
  });

  test('En Casa, En Movimiento e Historia no descargan un hero legado antes del master V4',async({page})=>{
    const casa=await source(page,'en-casa.html');
    const movement=await source(page,'en-movimiento.html');
    const history=await source(page,'historia.html');
    expect(casa).toContain('assets/images/brand-v4/segundo-fuego-v4.webp');
    expect(casa).toContain('08-proceso-v4.webp');
    expect(movement).toContain('assets/images/brand-v4/eventos-v4.webp');
    expect(movement).toContain('08-proceso-v4.webp');
    expect(history).toContain('assets/images/brand-v4/historia-v4.webp');
  });

  test('Recetas, Herramientas y Cobertura nacen ya en sistema visual V4',async({page})=>{
    const recipes=await source(page,'recetas.html');
    const tools=await source(page,'herramientas.html');
    const coverage=await source(page,'cobertura.html');
    for(const html of [recipes,tools,coverage]){
      expectStaticUtilityV4(html);
      expect(html).not.toContain('assets/images/v040/');
    }
    expect(recipes).toContain('08-proceso-v4.webp');
    expect(recipes).toContain('09-ingredientes-v4.webp');
    expect(recipes).toContain('07-despensa-v4.webp');
    expect(tools).toContain('08-proceso-v4.webp');
    expect(tools).toContain('09-ingredientes-v4.webp');
    expect(coverage).toContain('17-cobertura-v4.webp');
  });

  test('Ayuda nace con V4 aprobado y mantiene bloqueado el visual rechazado',async({page})=>{
    const help=await source(page,'ayuda.html');
    expectStaticUtilityV4(help);
    expect(help).toContain('08-proceso-v4.webp');
    expect(help).not.toContain('assets/images/brand-final/home-masa-fuego.webp');
    expect(help).not.toContain('16-ayuda-v4.webp');
  });

  test('Legal y Cuenta nacen con tokens V4 sin inventar reemplazos visuales',async({page})=>{
    const legal=await source(page,'legal.html');
    const account=await source(page,'cuenta.html');
    expectStaticUtilityV4(legal);
    expectStaticUtilityV4(account);
    expect(account).not.toContain('19-seguimiento-v4.webp');
    const assetsCss=await source(page,'assets/brand-v4-assets.css');
    expect(assetsCss).toContain('images/brand-v4/confianza-v4.webp');
  });

  test('Receta y Artículo cargan el shell visual V4 antes de su render dinámico',async({page})=>{
    const recipe=await source(page,'receta.html');
    const article=await source(page,'articulo.html');
    expectStaticUtilityV4(recipe);
    expectStaticUtilityV4(article);
    expect(recipe).toContain('id="recipe-page"');
    expect(article).toContain('id="article-detail"');
  });

  test('Caso de evento abandona v040 desde el HTML inicial',async({page})=>{
    const eventCase=await source(page,'caso-evento.html');
    expectStaticUtilityV4(eventCase);
    expect(eventCase).toContain('assets/images/brand-v4/eventos-v4.webp');
    expect(eventCase).toContain('08-proceso-v4.webp');
    expect(eventCase).not.toContain('assets/images/v040/');
    expect(eventCase).toContain('assets/brand-v4-public.js');
  });

  test('Checkout muestra confianza V4 desde HTML sin esperar promoción dinámica',async({page})=>{
    const checkout=await source(page,'checkout.html');
    expectStaticUtilityV4(checkout);
    expect(checkout).toContain('v4-checkout-trust');
    expect(checkout).toContain('18-confianza-v4-alt.webp');
  });

  test('ninguna superficie de first paint incorpora assets en cuarentena',async({page})=>{
    const pages=['index.html','tienda.html','producto.html','metodo.html','bitacora.html','en-casa.html','en-movimiento.html','historia.html','recetas.html','herramientas.html','cobertura.html','checkout.html','ayuda.html','legal.html','cuenta.html','receta.html','articulo.html','caso-evento.html'];
    for(const path of pages){
      const html=await source(page,path);
      for(const asset of rejected)expect(html).not.toContain(asset);
    }
  });

  test('service worker trata las capas visuales V4 como recursos frescos y cacheables',async({page})=>{
    const sw=await source(page,'service-worker.js');
    expect(sw).toContain("'./assets/brand-v4-assets.css'");
    expect(sw).toContain("url.pathname.endsWith('/assets/brand-v4-assets.css')");
    expect(sw).toContain("'./assets/brand-v4-product-data.js'");
    expect(sw).toContain("url.pathname.endsWith('/assets/brand-v4-product-data.js')");
  });
});