#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise SystemExit(f"FAIL: falta {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, marker: str, message: str) -> None:
    if marker not in text:
        raise SystemExit(f"FAIL: {message}")


def forbid(text: str, marker: str, message: str) -> None:
    if marker in text:
        raise SystemExit(f"FAIL: {message}")


page = read("configuracion-publica.html")
asset = read("assets/public-config-admin-v42.js")
connectivity = read("assets/admin-connectivity-v42.js")
promotion = read("assets/admin-config-promotion-v42.js")
admin = read("admin.html")
center = read("centro-interno.html")
e2e = read("tests/e2e/v42-public-config-surface.spec.js")

# Página dedicada y orden de capas V4.2.
require(page, 'data-page="configuracion-publica"', "la página no declara su superficie V4.2")
require(page, 'data-admin-connectivity-root', "falta root gobernado por conectividad")
for marker in (
    'assets/public-config-admin-v42.js',
    'assets/admin-connectivity-v42.js',
    'assets/admin-config-promotion-v42.js',
):
    require(page, marker, f"falta asset requerido en configuración pública: {marker}")
if not (page.index('assets/public-config-admin-v42.js') < page.index('assets/admin-connectivity-v42.js') < page.index('assets/admin-config-promotion-v42.js')):
    raise SystemExit("FAIL: orden incorrecto de runtime → guard → promoción")

# La nueva superficie no debe cargar motores funcionales internos.
for marker in (
    'assets/finance-v27.js',
    'assets/operations-v16.js',
    'assets/daily-ops-v21.js',
    'assets/production-v22.js',
    'assets/materials-v23.js',
    'assets/procurement-v25.js',
):
    forbid(page, marker, f"configuración pública carga motor interno fuera de alcance: {marker}")

# Contrato de fuentes: sólo settings locales y public_settings remotos.
require(asset, "SETTINGS_KEY='ee_v14_settings'", "falta store local canónico")
require(asset, "PRODUCTS_KEY='ee_v14_products'", "falta fuente de catálogo local para disponibilidad derivada")
require(asset, "ordering:Object.freeze(['deliveryPolicy','deliveryFeePolicy','coverageDetails','supportWhatsapp','supportEmail','expectedResponseHours','requireReceipt','maxReceiptBytesPreview'])", "allowlist ordering incompleta")
require(asset, "payment:Object.freeze(['bank','accountType','accountHolder','accountNumber','key','instructions'])", "allowlist payment incompleta")
require(asset, "from('public_settings').select('key,value,updated_at').eq('key',group).maybeSingle()", "falta lectura remota por fila")
require(asset, "from('public_settings').upsert({key:group,value:next", "falta escritura remota gobernada")
require(asset, "const next={...before.raw,...patch}", "la escritura remota no preserva campos desconocidos")
require(asset, "const confirmed=await readRemoteGroup(db,group)", "falta relectura posterior")
require(asset, "!confirmed.exists||!same(confirmed.raw,next)", "la confirmación remota no compara valor exacto")
require(asset, "window.__EE_ADMIN_SUPABASE__", "la superficie no comparte el cliente administrativo")
require(asset, "window.EL_ERRANTE_ADMIN_CONNECTIVITY", "falta dependencia del guard V4.2")
if asset.count("await guard.assertConnected();") < 2:
    raise SystemExit("FAIL: la escritura remota requiere preflight antes de leer y antes de upsert")
forbid(asset.lower(), "service_role", "la superficie cliente referencia service_role")
forbid(asset, "localStorage.removeItem", "la superficie no debe borrar configuración local")

# Disponibilidad es derivada/read-only y conserva desconocido.
require(asset, "from('product_operations').select('product_id,product_name,inventory,active,sale_price')", "falta lectura de catálogo remoto para disponibilidad derivada")
require(asset, "catalogueRowsLocal", "falta disponibilidad derivada del catálogo local")
require(asset, "stock desconocido", "la UX no conserva semántica de inventario desconocido")
require(asset, "sólo lectura", "la UX no declara disponibilidad read-only")
forbid(asset, "data-field=\"availability\"", "se inventó un setting editable availability")
forbid(asset, "key:'availability'", "se inventó una fila remota availability")

# El guard debe gobernar tanto la superficie legacy como la contemporánea.
require(connectivity, "new Set(['admin','configuracion-publica'])", "el guard no reconoce la nueva superficie")
require(connectivity, "document.querySelector('[data-admin-connectivity-root]')", "el guard no acepta root explícito")
require(promotion, "ROOT_ID='admin-dynamic'", "el asistente de promoción dejó de poder reutilizarse en la página nueva")

# Navegación y jerarquía: admin heredado deja de ser propietario preferente.
require(admin, 'href="configuracion-publica.html"', "admin heredado no enlaza la superficie contemporánea")
require(admin, "Configuración pública V4.2", "admin heredado no explica la transición")
require(admin, "compatibilidad con módulos heredados", "admin heredado no declara su rol de compatibilidad")
require(center, 'href="configuracion-publica.html"', "Centro interno no enlaza Configuración pública")

# E2E mínimo del issue #173.
for marker in (
    "preview local usa sólo ee_v14_settings",
    "modo conectado lee remoto",
    "guardar ordering remoto preserva campos desconocidos",
    "guardar payment remoto preserva campos desconocidos",
    "sesión expirada antes del save produce AUTH_REQUIRED",
    "RLS reject",
    "network unavailable",
    "stock desconocido: 1",
    "la página no carga motores funcionales de Operación o Finanzas",
    "Centro y Admin enlazan explícitamente la nueva superficie",
):
    require(e2e, marker, f"E2E V4.2 no cubre contrato: {marker}")

print("PASS: configuración pública V4.2 unifica ordering/payment, deriva disponibilidad y mantiene admin legacy aislado")
