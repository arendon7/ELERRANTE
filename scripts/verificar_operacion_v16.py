#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []
required = [
    "assets/operations-v16.js",
    "assets/commerce-v16.css",
    "backend/supabase/schema-v16.sql",
    "tests/e2e/operations-v16.spec.js",
    "admin.html",
]
for relative in required:
    if not (ROOT / relative).is_file():
        ISSUES.append(f"Archivo V1.6 faltante: {relative}")

admin = (ROOT / "admin.html").read_text(encoding="utf-8")
runtime = (ROOT / "assets/operations-v16.js").read_text(encoding="utf-8")
schema = (ROOT / "backend/supabase/schema-v16.sql").read_text(encoding="utf-8")
worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
host = (ROOT / "assets/host-mode.js").read_text(encoding="utf-8")

for marker in ["Operación y finanzas · V1.6", 'id="operations-v16"', "operations-v16.js", "commerce-v16.css"]:
    if marker not in admin:
        ISSUES.append(f"Administración V1.6 incompleta: {marker}")

for marker in [
    "Inventario, margen y punto de equilibrio",
    "record_inventory_movement_v16",
    "ee_v16_inventory_movements",
    "Ventas de equilibrio",
    "Kardex básico",
    "inventoryCommitted",
]:
    if marker not in runtime:
        ISSUES.append(f"Runtime V1.6 incompleto: {marker}")

for marker in [
    "inventory_movements",
    "inventory_committed",
    "low_stock_threshold",
    "sync_order_inventory_v16",
    "record_inventory_movement_v16",
    "Salida automática al iniciar preparación",
]:
    if marker not in schema:
        ISSUES.append(f"Esquema V1.6 incompleto: {marker}")

for forbidden in ["service_role", "SUPABASE_SERVICE", "postgres://"]:
    if forbidden.lower() in runtime.lower():
        ISSUES.append(f"Posible secreto expuesto en V1.6: {forbidden}")

for marker in ["assets/operations-v16.js", "assets/commerce-v16.css"]:
    if marker not in worker:
        ISSUES.append(f"Activo V1.6 no precargado: {marker}")
if "el-errante-v1-7-0" not in worker:
    ISSUES.append("Service worker no usa caché V1.6")
if 'PUBLIC_VERSION="1.7.0"' not in host or 'ACTIVE_CACHE="el-errante-v1-7-0"' not in host:
    ISSUES.append("Host público no declara versión/caché V1.6")

print("EL ERRANTE V1.6 — BARRERA DE OPERACIÓN Y FINANZAS")
print(f"Archivos requeridos: {len(required)}")
print(f"Problemas: {len(ISSUES)}")
for issue in ISSUES:
    print("-", issue)
if ISSUES:
    sys.exit(1)
print("RESULTADO: PASS")
