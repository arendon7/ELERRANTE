const { test, expect } = require('@playwright/test');

async function source(page,path){
  const response=await page.request.get('/'+path);
  expect(response.ok()).toBeTruthy();
  return response.text();
}

test.describe('V4 authenticated entry brand',()=>{
  test('Acceso usa la identidad canónica sin cambiar el motor V3.1.1',async({page})=>{
    const html=await source(page,'acceso.html');
    const js=await source(page,'assets/access-v31.js');
    expect(html).toContain('assets/access-v4.css');
    expect(html).toContain('assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    expect(html).not.toContain('assets/logo-mark.svg');
    expect(js).toContain("const VERSION='3.1.1'");
    expect(js).toContain("name:'PBKDF2'");
    expect(js).toContain('iterations:150000');
    expect(js).toContain('pizzaiolo-mark-v4.webp');
    expect(js).not.toContain('assets/logo-lockup.svg');
  });

  test('La pantalla de acceso conserva formularios y jerarquía bajo V4',async({page})=>{
    await page.goto('/acceso.html');
    await expect(page.locator('.v31-access-brand img')).toHaveAttribute('src','assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    await expect(page.getByText('EL ERRANTE',{exact:true})).toBeVisible();
    await expect(page.getByText('Pizza contemporánea · Est. 2019',{exact:true})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Configura el primer acceso local.'})).toBeVisible();
    await expect(page.locator('#v31-setup-form input[name="username"]')).toBeVisible();
    await expect(page.locator('#v31-setup-form input[name="password"]')).toBeVisible();
    await expect(page.locator('link[href="assets/access-v4.css"]')).toHaveCount(1);
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(width.scroll).toBeLessThanOrEqual(width.client+1);
  });

  test('PWA incluye el caso de evento y la capa visual de acceso',async({page})=>{
    const sw=await source(page,'service-worker.js');
    expect(sw).toContain("'./caso-evento.html'");
    expect(sw).toContain("'./assets/access-v4.css'");
    expect(sw).toContain("url.pathname.endsWith('/assets/access-v4.css')");
  });
});