#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []

required = [
    "assets/commerce-config-v14.js",
    "assets/commerce-v14.js",
    "assets/commerce-v14.css",
    "assets/checkout-v15.js",
    "assets/admin-v15.js",
    "backend/supabase/schema-v14.sql",
    "documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md",
    "tests/e2e/commerce-v14.spec.js",
    "admin.html",
    "checkout.html",
]
for relative in required:
    if not (ROOT / relative).is_file():
        ISSUES.append(f"Archivo comercial faltante: {relative}")

config = (ROOT / "assets/commerce-config-v14.js").read_text(encoding="utf-8")
checkout = (ROOT / "checkout.html").read_text(encoding="utf-8")
admin = (ROOT / "admin.html").read_text(encoding="utf-8")
commerce = (ROOT / "assets/commerce-v14.js").read_text(encoding="utf-8")
checkout_boot = (ROOT / "assets/checkout-v15.js").read_text(encoding="utf-8")
admin_runtime = (ROOT / "assets/admin-v15.js").read_text(encoding="utf-8")
schema = (ROOT / "backend/supabase/schema-v14.sql").read_text(encoding="utf-8")
worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
host = (ROOT / "assets/host-mode.js").read_text(encoding="utf-8")

amounts = [int(value) for value in re.findall(r"amount:\s*(\d+)", config)]
if sum(amounts) != 6_000_000:
    ISSUES.append(f"Gastos fijos demo distintos de $6.000.000: {sum(amounts)}")

for marker in [
    'version: "1.8.0"',
    'provider: runtimeBackend.provider || "supabase"',
    'accountNumber: ""',
    'key: ""',
    'requireReceipt: true',
]:
    if marker not in config:
        ISSUES.append(f"Configuración comercial incompleta: {marker}")

for forbidden in ["service_role", "SUPABASE_SERVICE", "postgres://", "eyJhbGciOi"]:
    for label, content in [("config",config),("checkout",checkout_boot),("admin",admin_runtime)]:
        if forbidden.lower() in content.lower():
            ISSUES.append(f"Posible secreto expuesto en {label}: {forbidden}")

for marker in [
    "transferencia bancaria",
    "adjunta el comprobante",
    "No dependes de una ruta o un día fijo",
    "checkout-v15.js",
    "commerce-v14.css",
    'id="checkout-city"',
]:
    if marker not in checkout:
        ISSUES.append(f"Checkout comercial incompleto: {marker}")

for marker in ["Operación y finanzas · V1.6", "admin-v15.js", "commerce-v14.css", "noindex,nofollow"]:
    if marker not in admin:
        ISSUES.append(f"Administración comercial incompleta: {marker}")
if "assets/commerce-v14.js" in admin:
    ISSUES.append("Administración conserva el runtime legado V1.4.")

for marker in ["signInAnonymously", "payment_review", "monthlyFixedCosts", 'type="text"']:
    if marker not in commerce:
        ISSUES.append(f"Runtime de pedidos incompleto: {marker}")
for marker in ["public_settings", "shopperStorageKey", "window.__EE_SUPABASE__"]:
    if marker not in checkout_boot:
        ISSUES.append(f"Bootstrap de checkout V1.5 incompleto: {marker}")
for marker in ["signInWithPassword", 'rpc("is_admin")', "createSignedUrl", "adminStorageKey"]:
    if marker not in admin_runtime:
        ISSUES.append(f"Runtime administrativo V1.5 incompleto: {marker}")

for marker in [
    "enable row level security",
    "public.is_admin()",
    "payment-receipts",
    "public=false",
    "shopper inserts own order",
    "admins update orders",
]:
    if marker not in schema:
        ISSUES.append(f"Esquema seguro incompleto: {marker}")

if "el-errante-v1-8-0" not in worker:
    ISSUES.append("Service worker no usa la caché V1.5")
for marker in ["commerce-config-v14.js", "commerce-v14.js", "commerce-v14.css", "checkout-v15.js", "admin-v15.js"]:
    if marker not in worker:
        ISSUES.append(f"Activo comercial no precargado: {marker}")
if 'PUBLIC_VERSION="1.8.0"' not in host or 'ACTIVE_CACHE="el-errante-v1-8-0"' not in host:
    ISSUES.append("Host público no declara la versión/caché V1.5")

print("EL ERRANTE V1.5 — BARRERA DE OPERACIÓN COMERCIAL")
print(f"Archivos requeridos: {len(required)}")
print(f"Gastos fijos demo: ${sum(amounts):,} COP")
print(f"Problemas: {len(ISSUES)}")
for issue in ISSUES:
    print("-", issue)
if ISSUES:
    sys.exit(1)
print("RESULTADO: PASS")
