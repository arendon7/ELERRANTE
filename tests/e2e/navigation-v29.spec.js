const { test, expect } = require('@playwright/test');

const publicPages=['/index.html','/tienda.html','/en-casa.html','/historia.html','/metodo.html','/juan-david-ocampo.html','/bitacora.html','/en-movimiento.html'];

function isLocalNavigable(href){
  if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return false;
  try{const url=new URL(href,'http://127.0.0.1:4173/');return url.origin==='http://127.0.0.1:4173';}catch(_){return false;}
}

test.describe('Navegación pública V3 truth + V4',()=>{
  for(const path of publicPages){
    test(`${path} no expone CTAs locales rotos`,async({page,request})=>{
      await page.goto(path,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(200);
      const links=await page.locator('main a[href], #site-header a[href], #site-footer a[href], .v4-header a[href], .v4-footer a[href]').evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute('href'),text:(node.textContent||'').trim()})));
      const unique=[...new Map(links.filter(item=>isLocalNavigable(item.href)).map(item=>[item.href,item])).values()];
      for(const link of unique){
        const target=new URL(link.href,'http://127.0.0.1:4173/');
        const response=await request.get(target.pathname+target.search);
        expect(response.ok(),`${path}: “${link.text}” -> ${link.href}`).toBeTruthy();
      }
    });
  }

  test('la navegación principal Home V4 prioriza seis destinos públicos',async({page})=>{
    await page.goto('/index.html');
    const nav=page.locator('.v4-nav');
    await expect(nav.locator('a')).toHaveCount(6);
    for(const [href,label] of [['tienda.html','Tienda'],['en-casa.html','En Casa'],['metodo.html','Método'],['bitacora.html','Bitácora'],['juan-david-ocampo.html','Juan David'],['en-movimiento.html','En Movimiento']]){
      await expect(nav.locator(`a[href="${href}"]`)).toContainText(label);
    }
    for(const href of ['nosotros.html','equipo.html','producto.html','cuenta.html','admin.html','control.html','operacion.html','studio.html','centro-interno.html'])await expect(nav.locator(`a[href^="${href}"]`)).toHaveCount(0);
  });

  test('la PWA incluye rutas editoriales y todas las capas V4 activas',async({request})=>{
    const response=await request.get('/service-worker.js');
    expect(response.ok()).toBeTruthy();
    const source=await response.text();
    for(const token of [
      './metodo.html','./juan-david-ocampo.html','./assets/editorial-v30.css','./assets/products-v30.js','./assets/product-v30.js',
      './assets/brand-v4-home.css','./assets/brand-v4-home.js',
      './assets/brand-v4-public.css','./assets/brand-v4-public.js','./assets/brand-v4-product.css','./assets/brand-v4-events.css','./assets/brand-v4-editorial.css'
    ]) expect(source).toContain(token);
  });

  test('la cabecera y el pie V4 no anuncian funciones que todavía no existen',async({page})=>{
    await page.goto('/index.html');
    await expect(page.locator('.v4-header a[href="cuenta.html"]')).toHaveCount(0);
    await expect(page.locator('.v4-footer a[href="cuenta.html"]')).toHaveCount(0);
    await expect(page.locator('.v4-header a[href="en-movimiento.html"]')).toContainText('En Movimiento');
    await expect(page.locator('.v4-footer')).not.toContainText('Club demo');
    await expect(page.locator('.v4-footer')).not.toContainText('[Razón social');
    await expect(page.locator('.v4-footer a[href="en-movimiento.html#mesa"]')).toHaveCount(0);
  });

  test('todos los botones públicos describen una acción real',async({page})=>{
    for(const path of publicPages){
      await page.goto(path,{waitUntil:'domcontentloaded'});
      const empty=await page.locator('a.btn, a.text-link, a.intent-card, a.v4-button, a.v4-text-link, a.v4p-btn, a.v4p-link').evaluateAll(nodes=>nodes.filter(node=>!(node.textContent||'').trim()||!node.getAttribute('href')).map(node=>node.outerHTML));
      expect(empty,`CTA sin texto o destino en ${path}`).toEqual([]);
    }
  });
});