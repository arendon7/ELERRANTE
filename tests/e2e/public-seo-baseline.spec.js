const { test, expect } = require('@playwright/test');

test.describe('Public SEO baseline', () => {
  test('publica robots.txt con sitemap y frontera interna explícita', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('Sitemap: https://arendon7.github.io/ELERRANTE/sitemap.xml');
    expect(body).toContain('Disallow: /admin.html');
    expect(body).toContain('Disallow: /operacion.html');
    expect(body).toContain('Disallow: /finanzas.html');
    expect(body).toContain('Disallow: /checkout.html');
  });

  test('sitemap incluye destinos públicos y excluye superficies internas o transaccionales', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();

    for (const publicPath of [
      '/',
      '/tienda.html',
      '/en-casa.html',
      '/en-movimiento.html',
      '/metodo.html',
      '/historia.html',
      '/juan-david-ocampo.html',
      '/bitacora.html',
      '/recetas.html',
      '/ayuda.html'
    ]) {
      expect(body).toContain(`https://arendon7.github.io/ELERRANTE${publicPath}`);
    }

    for (const forbiddenPath of [
      'admin.html',
      'control.html',
      'operacion.html',
      'finanzas.html',
      'centro-interno.html',
      'checkout.html',
      'cuenta.html',
      'acceso.html'
    ]) {
      expect(body).not.toContain(forbiddenPath);
    }
  });
});
