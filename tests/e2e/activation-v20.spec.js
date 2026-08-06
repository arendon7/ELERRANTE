const { test, expect } = require('@playwright/test');

test.describe('Activación operativa V2.3', () => {
  test('muestra el estado previo sin fingir conexión', async ({ page }) => {
    await page.goto('/activacion.html');
    await expect(page.getByRole('heading', { name: 'La web sigue en modo previo.' })).toBeVisible();
    await expect(page.getByText('Supabase aún no está conectado')).toBeVisible();
    await expect(page.getByText('No se enviarán pedidos ni comprobantes a una base central')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-activation-version', '2.3.0');
    await expect(page.getByText(/V2.2 y V2.3/)).toBeVisible();
  });

  test('no solicita credenciales cuando el backend no está configurado', async ({ page }) => {
    await page.goto('/activacion.html');
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.getByText('SUPABASE_URL', { exact: true })).toBeVisible();
    await expect(page.getByText('SUPABASE_PUBLISHABLE_KEY', { exact: true })).toBeVisible();
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('postgres://');
    expect(body).not.toContain('eyJhbGciOi');
  });

  test('Administración enlaza el centro de activación vigente', async ({ page }) => {
    await page.goto('/admin.html');
    const link = page.getByRole('link', { name: 'Activación V2.3' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'activacion.html');
  });

  test('la página es privada para buscadores y usable en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/activacion.html');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('los activos públicos no contienen credenciales privadas', async ({ request }) => {
    for (const path of ['/assets/activation-v20.js','/assets/activation-v23.js']) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      const body = (await response.text()).toLowerCase();
      expect(body).not.toContain('supabase_service');
      expect(body).not.toContain('postgres://');
      expect(body).not.toContain('eyjhbGcioi');
    }
  });
});