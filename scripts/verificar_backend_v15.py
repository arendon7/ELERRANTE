#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROBLEMS = []


def text(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        PROBLEMS.append(f"Falta archivo requerido: {path}")
        return ""
    return target.read_text(encoding="utf-8")


def require(content: str, marker: str, label: str) -> None:
    if marker not in content:
        PROBLEMS.append(label)


runtime = text("assets/commerce-runtime-config.js")
config = text("assets/commerce-config-v14.js")
checkout = text("assets/checkout-v15.js")
admin = text("assets/admin-v15.js")
admin_html = text("admin.html")
checkout_html = text("checkout.html")
schema = text("backend/supabase/schema-v15.sql")
worker = text("service-worker.js")
host = text("assets/host-mode.js")
pages = text(".github/workflows/pages.yml")
health = text(".github/workflows/public-health.yml")

for path in [
    "assets/commerce-v15.css",
    "tests/e2e/commerce-v14.spec.js",
    "backend/supabase/schema-v14.sql",
    "documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md",
]:
    text(path)

require(config, 'version: "2.0.0"', "La configuración comercial no declara V1.9.0.")
require(config, 'shopperStorageKey', "No se separó la sesión del comprador.")
require(config, 'adminStorageKey', "No se separó la sesión administrativa.")
require(config, 'amount: 2000000', "Falta el costo demo del trabajador.")
require(config, 'amount: 2500000', "Falta el costo demo de sede.")

require(checkout, 'storageKey:config.backend.shopperStorageKey', "Checkout no usa almacenamiento de sesión aislado.")
require(checkout, '.from("public_settings")', "Checkout no sincroniza configuración pública.")
require(checkout, 'window.__EE_SUPABASE__ = client', "Checkout no entrega el cliente aislado al runtime de pedidos.")

require(admin, 'storageKey:BASE.backend.adminStorageKey', "Administración no usa sesión aislada.")
require(admin, 'signInWithPassword', "Administración no implementa autenticación por usuario.")
require(admin, 'rpc("is_admin")', "Administración no verifica el rol con RLS.")
require(admin, 'createSignedUrl', "Los comprobantes no se abren mediante enlace privado temporal.")
require(admin, 'signOut()', "Administración no permite cerrar sesión.")
require(admin, '.from("public_settings")', "Administración no sincroniza datos públicos del checkout.")

require(admin_html, 'assets/commerce-runtime-config.js', "Admin no carga configuración runtime.")
require(admin_html, 'assets/admin-v15.js', "Admin no carga el runtime V1.5.")
if 'assets/commerce-v14.js' in admin_html:
    PROBLEMS.append("Admin todavía carga el runtime administrativo legado V1.4.")
require(checkout_html, 'assets/commerce-runtime-config.js', "Checkout no carga configuración runtime.")
require(checkout_html, 'assets/checkout-v15.js', "Checkout no carga el bootstrap V1.5.")

require(schema, 'admin_audit_log', "La migración V1.5 no incluye auditoría administrativa.")
require(schema, 'enable row level security', "La migración V1.5 no conserva RLS.")
require(schema, 'record_admin_event', "La migración V1.5 no incluye registro seguro de eventos.")
require(schema, 'service_role debe permanecer exclusivamente en servidor', "Falta advertencia explícita sobre service_role.")

require(worker, 'el-errante-v2-0-0', "Service worker no usa caché V1.9.0.")
for asset in ['commerce-runtime-config.js','checkout-v15.js','admin-v15.js','commerce-v15.css']:
    require(worker, asset, f"Service worker no incluye {asset}.")
require(host, 'PUBLIC_VERSION="2.0.0"', "Host mode no declara V1.9.0.")
require(host, 'ACTIVE_CACHE="el-errante-v2-0-0"', "Host mode no apunta a la caché V1.9.0.")
require(pages, 'SUPABASE_URL', "Pages no contempla la URL de Supabase.")
require(pages, 'SUPABASE_PUBLISHABLE_KEY', "Pages no contempla la publishable key.")
require(pages, 'commerce-runtime-config.js', "Pages no genera la configuración runtime.")
require(health, 'el-errante-v2-0-0', "Public Health no verifica la caché V1.9.0.")

for label, content in {
    "runtime": runtime,
    "config": config,
    "checkout": checkout,
    "admin": admin,
    "admin.html": admin_html,
    "checkout.html": checkout_html,
}.items():
    lowered = content.lower()
    if "service_role" in lowered:
        PROBLEMS.append(f"Se encontró service_role en superficie pública: {label}.")
    if "supabase_service" in lowered:
        PROBLEMS.append(f"Se encontró un identificador de secreto de servidor en {label}.")

if 'url: ""' not in runtime or 'publishableKey: ""' not in runtime:
    PROBLEMS.append("La configuración runtime versionada debe conservar valores vacíos.")

print("EL ERRANTE V1.5 — BARRERA BACKEND Y ACCESO PRIVADO")
print("Archivos auditados: 15")
print("Sesiones separadas: comprador / administrador")
print("Gastos fijos demo: $6,000,000 COP")
print(f"Problemas: {len(PROBLEMS)}")
for problem in PROBLEMS:
    print(f"- {problem}")
if PROBLEMS:
    raise SystemExit(1)
print("RESULTADO: PASS")
