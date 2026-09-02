const { test, expect } = require('@playwright/test');

const PUBLIC_BASE = 'https://arendon7.github.io/ELERRANTE';

const canonicalPages = new Map([
  ['/', `${PUBLIC_BASE}/`],
  ['/tienda.html', `${PUBLIC_BASE}/tienda.html`],
  ['/en-casa.html', `${PUBLIC_BASE}/en-casa.html`],
  ['/en-movimiento.html', `${PUBLIC_BASE}/en-movimiento.html`],
  ['/caso-evento.html', `${PUBLIC_BASE}/caso-evento.html`],
  ['/metodo.html', `${PUBLIC_BASE}/metodo.html`],
  ['/historia.html', `${PUBLIC_BASE}/historia.html`],
  ['/juan-david-ocampo.html', `${PUBLIC_BASE}/juan-david-ocampo.html`],
  ['/bitacora.html', `${PUBLIC_BASE}/bitacora.html`],
  ['/recetas.html', `${PUBLIC_BASE}/recetas.html`],
  ['/herramientas.html', `${PUBLIC_BASE}/herramientas.html`],
  ['/cobertura.html', `${PUBLIC_BASE}/cobertura.html`],
  ['/ayuda.html', `${PUBLIC_BASE}/ayuda.html`],
  ['/legal.html', `${PUBLIC_BASE}/legal.html`]
]);

const noindexPages = [
  '/producto.html?id=harina-aire-y-tiempo',
  '/articulo.html?id=metodo',
  '/receta.html?id=masa',
  '/checkout.html',
  '/cuenta.html',
  '/offline.html',
  '/presentacion.html'
];

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

    for (const publicPath of canonicalPages.keys()) {
      expect(body).toContain(`${PUBLIC_BASE}${publicPath}`);
    }

    for (const forbiddenPath of [
      'admin.html',
      'control.html',
      'operacion.html',
      'finanzas.html',
      'centro-interno.html',
      'checkout.html',
      'cuenta.html',
      'acceso.html',
      'producto.html',
      'articulo.html',
      'receta.html'
    ]) {
      expect(body).not.toContain(forbiddenPath);
    }
  });

  test('cada destino público indexable materializa un canonical absoluto', async ({ request }) => {
    for (const [path, canonical] of canonicalPages) {
      const response = await request.get(path);
      expect(response.ok(), path).toBeTruthy();
      const body = await response.text();
      expect(body, path).toContain(`<link rel="canonical" href="${canonical}">`);
      expect(body, path).not.toMatch(/<meta\s+name=["']robots["'][^>]*noindex/i);
    }
  });

  test('templates dinámicos y superficies no orgánicas permanecen noindex', async ({ request }) => {
    for (const path of noindexPages) {
      const response = await request.get(path);
      expect(response.ok(), path).toBeTruthy();
      const body = await response.text();
      expect(body, path).toContain('<meta name="robots" content="noindex,follow">');
    }
  });

  test('Home publica JSON-LD base sin inventar dirección, horarios ni ofertas', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('type="application/ld+json" data-seo-schema="v4"');
    expect(body).toContain(`"@id":"${PUBLIC_BASE}/#organization"`);
    expect(body).toContain(`"@id":"${PUBLIC_BASE}/#website"`);
    expect(body).toContain('"inLanguage":"es-CO"');
    expect(body).not.toContain('openingHours');
    expect(body).not.toContain('streetAddress');
    expect(body).not.toContain('priceCurrency');
  });
});
