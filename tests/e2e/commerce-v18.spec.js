const { test, expect } = require('@playwright/test');

async function seedCart(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v2_cart', JSON.stringify([
    { id: 'la-errante', variant: 'unidad', qty: 1 }
  ])));
}

async function seedBank(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v14_settings', JSON.stringify({
    payment: {
      accountHolder: 'El Errante Cocina',
      accountNumber: '123456789',
      key: 'errante@banco'
    }
  })));
}

test.describe('Experiencia de compra V1.8', () => {
  test('tienda explica el recorrido antes del catálogo', async ({ page }) => {
    await page.goto('/tienda.html');
    await expect(page.getByText('Elige con información')).toBeVisible();
    await expect(page.getByText('Entrega coordinada')).toBeVisible();
    await expect(page.getByText('Una compra en tres decisiones')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-commerce-ux-version', '1.8.0');
    await expect(page.getByText('Pizza insignia').first()).toBeVisible();
  });

  test('la ficha aclara recepción conservación y terminado', async ({ page }) => {
    await page.goto('/producto.html?id=la-errante');
    await expect(page.getByRole('heading', { name: 'Antes de llevarlo, entiende el recorrido completo.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Qué recibes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cómo conservar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cómo disfrutar' })).toBeVisible();
    await expect(page.getByText('La etiqueta y el empaque real prevalecen')).toBeVisible();
  });

  test('checkout guía datos entrega y pago sin alterar la transferencia', async ({ page }) => {
    await seedCart(page);
    await seedBank(page);
    await page.goto('/checkout.html');
    await expect(page.getByRole('heading', { name: 'Confirma tu pedido con claridad.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tus datos/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrega/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pago/ })).toBeVisible();
    await expect(page.getByText('Sin producción anticipada')).toBeVisible();
    await expect(page.getByText('Total transparente')).toBeVisible();
    await expect(page.locator('[data-checkout-step="1"]')).toBeVisible();
    await expect(page.locator('[data-checkout-step="2"]')).toBeVisible();
    await expect(page.locator('[data-checkout-step="3"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar solicitud y enviar comprobante' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Copiar número de cuenta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Copiar llave/i })).toBeVisible();
    await expect(page.getByText('Ningún archivo seleccionado')).toBeVisible();
    await expect(page.getByText('Qué ocurre después')).toBeVisible();
  });

  test('checkout vacío evita pedir datos innecesarios', async ({ page }) => {
    await page.goto('/checkout.html');
    await expect(page.getByRole('heading', { name: 'Primero elige qué quieres llevar al fuego.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explorar la tienda' })).toBeVisible();
    await expect(page.locator('.checkout-layout')).toBeHidden();
  });

  test('móvil mantiene visible el total y el acceso al formulario', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.toLowerCase().includes('mobile'), 'Validación exclusiva de proyecto móvil');
    await seedCart(page);
    await page.goto('/checkout.html');
    const bar = page.locator('[data-v18="mobile-total"]');
    await expect(bar).toBeVisible();
    await expect(bar.getByText('Total del pedido')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Continuar' })).toBeVisible();
  });

  test('los activos V1.8 no contienen promesas no sustentadas', async ({ request }) => {
    for (const path of ['/assets/commerce-ux-v18.js','/assets/commerce-v18.css']) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      const body = (await response.text()).toLowerCase();
      expect(body).not.toContain('entrega garantizada');
      expect(body).not.toContain('disponibilidad garantizada');
      expect(body).not.toContain('pago garantizado');
    }
  });
});
