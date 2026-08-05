#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def load(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def save(path: str, content: str) -> None:
    (ROOT / path).write_text(content, encoding="utf-8")


def replace_required(content: str, old: str, new: str, label: str) -> str:
    if old not in content and new not in content:
        raise RuntimeError(f"No se encontró el marcador requerido: {label}")
    return content if new in content else content.replace(old, new)


checkout = load("checkout.html")
checkout = replace_required(
    checkout,
    '<form class="form-card" id="checkout-form"><h3>Preparando el formulario…</h3></form>',
    '<form class="form-card" id="checkout-form"><div class="ee-v14-legacy-bridge" aria-hidden="true"><label for="checkout-city">Compatibilidad de entrega</label><select id="checkout-city"><option value="">Entrega por coordinar</option></select><div id="shipping-message"></div><button type="submit">Continuar</button></div><h3>Preparando el formulario…</h3></form>',
    "puente del checkout legado",
)
save("checkout.html", checkout)

commerce = load("assets/commerce-v14.js")
commerce = commerce.replace(
    "const variantId = row.variantId || row.variant_id;",
    "const variantId = row.variantId || row.variant_id || row.variant;",
)
commerce = commerce.replace(
    '<input id="ee-city" name="city" required placeholder=',
    '<input id="ee-city" name="city" type="text" required placeholder=',
)
save("assets/commerce-v14.js", commerce)

css = load("assets/commerce-v14.css")
responsive_patch = """
.ee-v14-legacy-bridge{display:none!important}.ee-v14-auth{position:relative;overflow:hidden}.ee-v14-auth h1{position:relative!important;transform:none!important;max-width:100%;overflow-wrap:anywhere;pointer-events:none}.ee-v14-auth .ee-v14-btn{position:relative;z-index:3}.admin-main{min-width:0;overflow-x:hidden}@media(max-width:640px){.admin-top{align-items:flex-start;gap:12px;flex-wrap:wrap}.admin-top h1,.ee-v14-auth h1{font-size:clamp(2.15rem,12vw,3.7rem)!important;line-height:.94!important;letter-spacing:-.035em!important}.ee-v14-auth{margin:24px auto;padding:20px}.admin-main{padding-left:16px!important;padding-right:16px!important}}
""".strip()
if ".ee-v14-legacy-bridge" not in css:
    css = css.rstrip() + "\n" + responsive_patch + "\n"
save("assets/commerce-v14.css", css)

tests = r'''const { test, expect } = require('@playwright/test');

async function seedCart(page) {
  await page.addInitScript(() => localStorage.setItem('ee_v2_cart', JSON.stringify([
    { id: 'la-errante', variant: 'unidad', qty: 1 }
  ])));
}

test.describe('Operación comercial V1.4', () => {
  test('checkout usa transferencia, comprobante y cobertura abierta', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByRole('heading', { name: 'Tu pedido comienza aquí.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '3. Transferencia y comprobante' })).toBeVisible();
    await expect(page.locator('#ee-receipt')).toBeVisible();
    await expect(page.locator('#ee-city')).toHaveAttribute('type', 'text');
    await expect(page.getByText('No cerramos el pedido por rutas fijas ni por días predeterminados.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'PSE' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Tarjeta' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Nequi' })).toHaveCount(0);
  });

  test('administración local expone finanzas, pedidos y catálogo editable', async ({ page }) => {
    await page.goto('/admin.html');
    await expect(page.getByRole('heading', { name: 'Panel operativo en preparación.' })).toBeVisible();
    await page.getByRole('button', { name: 'Abrir vista local de revisión' }).click();
    await expect(page.getByText('Ventas aprobadas')).toBeVisible();
    await expect(page.getByText('Balance del mes')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Precios, costos e inventario' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gastos fijos' })).toBeVisible();
    await expect(page.getByText('$ 6.000.000', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Datos bancarios visibles en checkout' })).toBeVisible();
  });

  test('datos bancarios de revisión persisten en el navegador', async ({ page }) => {
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Abrir vista local de revisión' }).click();
    await page.locator('#ee-bank-holder').fill('El Errante Cocina');
    await page.locator('#ee-bank-account').fill('123456789');
    await page.locator('#ee-bank-key').fill('errante@banco');
    await page.getByRole('button', { name: 'Guardar datos de transferencia' }).click();
    await seedCart(page);
    await page.goto('/checkout.html');
    await expect(page.getByText('El Errante Cocina')).toBeVisible();
    await expect(page.getByText('123456789')).toBeVisible();
    await expect(page.getByText('errante@banco')).toBeVisible();
  });
});
'''
save("tests/e2e/commerce-v14.spec.js", tests)

worker = load("service-worker.js").replace("el-errante-v1-3-1", "el-errante-v1-4-0")
worker = replace_required(
    worker,
    "'./assets/preprod.js','./assets/content-v5.js','./assets/host-mode.js','./assets/control.js','./assets/presentation.js',",
    "'./assets/preprod.js','./assets/content-v5.js','./assets/host-mode.js','./assets/commerce-config-v14.js','./assets/commerce-v14.js','./assets/commerce-v14.css','./assets/control.js','./assets/presentation.js',",
    "activos comerciales en service worker",
)
save("service-worker.js", worker)

host = load("assets/host-mode.js")
host = host.replace('PUBLIC_VERSION="1.3.1"', 'PUBLIC_VERSION="1.4.0"')
host = host.replace('ACTIVE_CACHE="el-errante-v1-3-1"', 'ACTIVE_CACHE="el-errante-v1-4-0"')
save("assets/host-mode.js", host)

release = load("scripts/verificar_release_v13.py")
release = release.replace('PUBLIC_VERSION="1.3.1"', 'PUBLIC_VERSION="1.4.0"')
release = release.replace('ACTIVE_CACHE="el-errante-v1-3-1"', 'ACTIVE_CACHE="el-errante-v1-4-0"')
release = release.replace("el-errante-v1-3-1", "el-errante-v1-4-0")
save("scripts/verificar_release_v13.py", release)

pages = load(".github/workflows/pages.yml")
pages = pages.replace("version=1.3.1", "version=1.4.0")
pages = pages.replace("el-errante-v1-3-1", "el-errante-v1-4-0")
validation = "      - name: Validar operación comercial V1.4\n        run: python3 scripts/verificar_operacion_v14.py\n"
marker = "      - name: Validar matriz maestra de oferta\n"
if validation not in pages:
    pages = replace_required(pages, marker, validation + marker, "validador comercial en Pages")
artifact_checks = "          grep -q 'commerce-v14.js' _site/checkout.html\n          grep -q 'commerce-v14.js' _site/admin.html\n          grep -q 'assets/commerce-v14.js' _site/service-worker.js\n"
checks_marker = "          grep -q 'home-hero-mobile.webp' _site/assets/host-mode.js\n"
if artifact_checks not in pages:
    pages = replace_required(pages, checks_marker, checks_marker + artifact_checks, "barrera del artefacto V1.4")
save(".github/workflows/pages.yml", pages)

health = load(".github/workflows/public-health.yml")
health = health.replace("el-errante-v1-3-1", "el-errante-v1-4-0")
health = health.replace('PUBLIC_VERSION="1.3.1"', 'PUBLIC_VERSION="1.4.0"')
health = health.replace("V1.3.1 HQ", "V1.4.0 OPERACIÓN COMERCIAL")
health = health.replace(
    "for page in index tienda producto en-movimiento; do",
    "for page in index tienda producto en-movimiento checkout admin; do",
)
health_assertions = "          assert_contains public-checkout.html 'Compra directa · transferencia bancaria' 'Checkout no conserva el flujo de transferencia.'\n          assert_contains public-checkout.html 'assets/commerce-v14.js' 'Checkout no carga el runtime comercial V1.4.'\n          assert_contains public-admin.html 'Operación comercial · V1.4' 'Administración no conserva el contrato V1.4.'\n"
health_marker = "          assert_contains public-en-movimiento.html 'data-page=\"movimiento\"' 'En Movimiento no conserva su contrato de página.'\n"
if health_assertions not in health:
    health = replace_required(health, health_marker, health_marker + health_assertions, "comprobación pública V1.4")
health = health.replace(
    "          grep -q 'home-hero-mobile.webp' public-host-mode.js\n",
    "          grep -q 'home-hero-mobile.webp' public-host-mode.js\n          grep -q 'assets/commerce-v14.js' public-service-worker.js\n",
)
health = health.replace(
    "            public-en-movimiento.html\n",
    "            public-en-movimiento.html\n            public-checkout.html\n            public-admin.html\n",
)
save(".github/workflows/public-health.yml", health)

audit = load(".github/workflows/canonical-audit.yml")
audit_validation = "      - name: Validar operación comercial V1.4\n        run: python3 scripts/verificar_operacion_v14.py\n\n"
audit_marker = "      - name: Reconstruir fuente efectiva\n"
if audit_validation not in audit:
    audit = replace_required(audit, audit_marker, audit_validation + audit_marker, "validador comercial en auditoría")
save(".github/workflows/canonical-audit.yml", audit)

deploy = load("deploy-version.txt")
deploy = re.sub(r"^version=.*$", "version=1.4.0", deploy, flags=re.MULTILINE)
deploy = re.sub(r"^cache=.*$", "cache=el-errante-v1-4-0", deploy, flags=re.MULTILINE)
save("deploy-version.txt", deploy)

print("Parche de operación comercial V1.4 aplicado correctamente.")
