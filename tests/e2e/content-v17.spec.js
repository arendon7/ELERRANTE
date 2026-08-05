const { test, expect } = require('@playwright/test');

test.describe('Contenido gastronómico y conversión V1.7', () => {
  test('inicio comunica masa, fuego y calidad con claridad', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.getByRole('heading', { name: 'Masa con tiempo. Fuego con carácter.' })).toBeVisible();
    await expect(page.getByText('Calidad que puede explicarse y también probarse.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Elegir pizzas para casa' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-content-version', '1.7.0');
  });

  test('tienda presenta propuesta premium y catálogo intencional', async ({ page }) => {
    await page.goto('/tienda.html');
    await expect(page.getByRole('heading', { name: 'Elige cómo quieres vivir la pizza.' })).toBeVisible();
    await expect(page.getByText('Una colección breve, construida con intención.')).toBeVisible();
    await expect(page.getByText('Masa protagonista')).toBeVisible();
  });

  test('las fichas reciben copy premium antes del render', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await expect(page.getByText('Territorio, contraste y una firma que permanece.')).toBeVisible();
    const product = await page.evaluate(() => window.EE_DATA.products.find(item => item.id === 'la-errante'));
    expect(product.tag).toBe('Nuestra pizza insignia');
    expect(product.promise).toContain('chorizo aporta profundidad');
  });

  test('en casa diferencia terminar de recalentar', async ({ page }) => {
    await page.goto('/en-casa.html');
    await expect(page.getByRole('heading', { name: 'El último fuego cambia todo.' })).toBeVisible();
    await expect(page.getByText('No la calientes. Devuélvela al fuego.')).toBeVisible();
  });

  test('eventos vende una experiencia gastronómica completa', async ({ page }) => {
    await page.goto('/en-movimiento.html');
    await expect(page.getByRole('heading', { name: 'Una pizzería encendida dentro de tu evento.' })).toBeVisible();
    await expect(page.getByText('No entregamos bandejas. Construimos el momento.')).toBeVisible();
    await expect(page.getByText('Masa preparada para la jornada')).toBeVisible();
  });

  test('el activo editorial no incluye afirmaciones no sustentadas', async ({ request }) => {
    const response = await request.get('/assets/content-v17.js');
    expect(response.ok()).toBeTruthy();
    const body = (await response.text()).toLowerCase();
    expect(body).not.toContain('la mejor pizza de colombia');
    expect(body).not.toContain('auténtica napolitana certificada');
  });
});
