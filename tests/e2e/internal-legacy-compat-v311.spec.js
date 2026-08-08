const { test, expect } = require('@playwright/test');

test.describe('Compatibilidad de superficies heredadas V3.1.1', () => {
  test('Administración conserva su motor histórico y apunta al sistema actual', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Administración heredada.' })).toBeVisible();
    await expect(page.getByText('Superficie conservada por compatibilidad.', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Centro interno', exact: true }).first()).toHaveAttribute('href', 'centro-interno.html');
    await expect(page.getByRole('link', { name: 'Panel de control', exact: true }).first()).toHaveAttribute('href', 'control.html');
    await expect(page.getByRole('link', { name: 'Finanzas', exact: true }).first()).toHaveAttribute('href', 'finanzas.html');
    await expect(page.locator('a[href="equipo.html"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Acceso administrativo seguro.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abrir simulación local' })).toBeVisible();
  });

  test('Activación conserva diagnóstico V2.5 y navegación vigente', async ({ page }) => {
    await page.goto('/activacion.html');
    await expect(page.getByText('Herramienta técnica auxiliar.', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Centro interno', exact: true }).first()).toHaveAttribute('href', 'centro-interno.html');
    await expect(page.locator('a[href="equipo.html"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'La web sigue en modo previo.' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-activation-version', '2.5.0');
  });

  test('la presentación diferencia Centro interno de Equipo público', async ({ page }) => {
    await page.goto('/presentacion.html');
    await expect(page.locator('a[href="centro-interno.html"]', { hasText: 'Centro interno' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Equipo', exact: true })).toHaveAttribute('href', 'equipo.html');
    await expect(page.getByRole('link', { name: 'Centro integral', exact: true })).toHaveCount(0);
    await expect(page.getByText('Contextos principales', { exact: true })).toBeAttached();
  });

  test('Administración sigue permitiendo la simulación local histórica', async ({ page }) => {
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir simulación local' }).click();
    const panel = page.locator('#admin-dynamic');
    await expect(panel.getByText('Ventas aprobadas')).toBeVisible();
    await expect(panel.getByText('Balance del mes')).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Precios, costos e inventario' })).toBeVisible();
  });

  test('la navegación de compatibilidad no desborda en móvil', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes('mobile'), 'Validación móvil');
    for (const path of ['/admin.html', '/activacion.html']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `overflow en ${path}`).toBeLessThanOrEqual(2);
    }
  });
});