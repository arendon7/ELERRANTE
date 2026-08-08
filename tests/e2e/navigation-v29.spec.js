const { test, expect } = require('@playwright/test');

const publicPages=['/index.html','/tienda.html','/en-casa.html','/historia.html','/nosotros.html','/equipo.html','/bitacora.html','/en-movimiento.html'];

function isLocalNavigable(href){
  if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return false;
  try{const url=new URL(href,'http://127.0.0.1:4173/');return url.origin==='http://127.0.0.1:4173';}catch(_){return false;}
}

test.describe('Navegación y CTAs V2.9',()=>{
  for(const path of publicPages){
    test(`${path} no expone CTAs locales rotos`,async({page,request})=>{
      await page.goto(path,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(200);
      const links=await page.locator('main a[href], #site-header a[href], #site-footer a[href]').evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute('href'),text:(node.textContent||'').trim()})));
      const unique=[...new Map(links.filter(item=>isLocalNavigable(item.href)).map(item=>[item.href,item])).values()];
      for(const link of unique){
        const target=new URL(link.href,'http://127.0.0.1:4173/');
        const response=await request.get(target.pathname+target.search);
        expect(response.ok(),`${path}: “${link.text}” -> ${link.href}`).toBeTruthy();
      }
    });
  }

  test('la navegación principal prioriza cinco destinos y no expone herramientas internas',async({page})=>{
    await page.goto('/index.html');
    const nav=page.locator('.main-nav');
    for(const [href,label] of [['tienda.html','Tienda'],['en-casa.html','En casa'],['nosotros.html','Nuestra cocina'],['bitacora.html','Bitácora'],['en-movimiento.html','Eventos']]){
      await expect(nav.locator(`a[href="${href}"]`)).toContainText(label);
    }
    for(const href of ['admin.html','control.html','operacion.html','studio.html','centro-interno.html'])await expect(nav.locator(`a[href="${href}"]`)).toHaveCount(0);
  });

  test('todos los botones públicos describen una acción real',async({page})=>{
    for(const path of publicPages){
      await page.goto(path,{waitUntil:'domcontentloaded'});
      const empty=await page.locator('a.btn, a.text-link, a.intent-card').evaluateAll(nodes=>nodes.filter(node=>!(node.textContent||'').trim()||!node.getAttribute('href')).map(node=>node.outerHTML));
      expect(empty,`CTA sin texto o destino en ${path}`).toEqual([]);
    }
  });
});
