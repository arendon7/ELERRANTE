const { test, expect } = require('@playwright/test');

async function source(page,path){
  const response=await page.request.get('/'+path);
  expect(response.ok()).toBeTruthy();
  return response.text();
}

test.describe('V4 offline fallback',()=>{
  test('offline.html es estático y usa la identidad canónica',async({page})=>{
    const html=await source(page,'offline.html');
    expect(html).toContain('data-v4-public="true"');
    expect(html).toContain('data-v4-utility="true"');
    expect(html).toContain('assets/images/brand-v4/pizzaiolo-mark-v4.webp');
    expect(html).toContain('Pizza contemporánea · Est. 2019');
    expect(html).toContain('assets/brand-v4-public.css');
    expect(html).not.toContain('assets/logo-lockup.svg');
    expect(html).not.toContain('assets/host-mode.js');
  });

  test('fallback offline conserva mensaje y reintento visibles',async({page})=>{
    await page.goto('/offline.html');
    await expect(page.getByRole('heading',{name:/El fuego sigue/})).toBeVisible();
    await expect(page.getByText('Pizza contemporánea · Est. 2019',{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Reintentar'})).toBeVisible();
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(width.scroll).toBeLessThanOrEqual(width.client+1);
  });
});