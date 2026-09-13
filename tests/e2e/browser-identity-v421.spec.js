const { test, expect } = require('@playwright/test');

const pages=[
  ['index.html',/El Errante/i],
  ['tienda.html',/El Errante/i],
  ['checkout.html',/El Errante/i],
  ['ayuda.html',/El Errante/i]
];

test.describe('V4.2.1 · identidad de navegador',()=>{
  for(const [path,title] of pages){
    test(`${path} conserva título y favicon V4`,async({page})=>{
      await page.goto('/'+path);
      await expect(page).toHaveTitle(title);
      await expect.poll(async()=>page.locator('link[rel~="icon"]').first().getAttribute('href')).toBe('assets/images/brand-v4/pizzaiolo-mark-v4.webp');
      await expect(page.locator('html')).toHaveAttribute('data-ee-browser-identity','v4.2.1');
    });
  }
});
