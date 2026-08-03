#!/usr/bin/env python3
"""Valida que el runtime use la fuente canónica directa y sea reproducible."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []


def read(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        ISSUES.append(f"Archivo faltante: {relative}")
        return ""
    return path.read_text(encoding="utf-8")


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


canonical_json_text = read("assets/canonical-data.json")
canonical_js_text = read("assets/canonical-data.js")
report_text = read("documentacion/CANONICAL_DATA_REPORT.json")
data_loader = read("assets/data.js")
content_contract = read("assets/content-v5.js")
service_worker = read("service-worker.js")
host_mode = read("assets/host-mode.js")
deploy_marker = read("deploy-version.txt")
pages_workflow = read(".github/workflows/pages.yml")
audit_workflow = read(".github/workflows/canonical-audit.yml")

try:
    canonical = json.loads(canonical_json_text)
except Exception as error:
    canonical = {}
    ISSUES.append(f"canonical-data.json inválido: {error}")

try:
    report = json.loads(report_text)
except Exception as error:
    report = {}
    ISSUES.append(f"CANONICAL_DATA_REPORT.json inválido: {error}")

prefix = "window.EE_DATA="
position = canonical_js_text.find(prefix)
if position < 0:
    embedded = None
    ISSUES.append("canonical-data.js no contiene window.EE_DATA=")
else:
    raw = canonical_js_text[position + len(prefix):].strip()
    if raw.endswith(";"):
        raw = raw[:-1]
    try:
        embedded = json.loads(raw)
    except Exception as error:
        embedded = None
        ISSUES.append(f"canonical-data.js no contiene JSON ejecutable válido: {error}")

if embedded is not None and canonical and embedded != canonical:
    ISSUES.append("canonical-data.js y canonical-data.json no son equivalentes")

products = canonical.get("products", []) if isinstance(canonical, dict) else []
counts = {
    "products": len(products),
    "variants": sum(len(product.get("variants", [])) for product in products),
    "recipes": len(canonical.get("recipes", [])) if isinstance(canonical, dict) else 0,
    "articles": len(canonical.get("articles", [])) if isinstance(canonical, dict) else 0,
    "faqs": len(canonical.get("faqs", [])) if isinstance(canonical, dict) else 0,
    "coverage": len(canonical.get("coverage", [])) if isinstance(canonical, dict) else 0,
}
expected = {
    "products": 11,
    "variants": 14,
    "recipes": 5,
    "articles": 5,
    "faqs": 5,
    "coverage": 6,
}
if counts != expected:
    ISSUES.append(f"Conteos canónicos inesperados: {counts}")

if canonical_json_text and report.get("canonical_json_sha256") != sha256(canonical_json_text):
    ISSUES.append("El hash de canonical-data.json no coincide con el informe")
if canonical_js_text and report.get("canonical_js_sha256") != sha256(canonical_js_text):
    ISSUES.append("El hash de canonical-data.js no coincide con el informe")

if "assets/canonical-data.js" not in data_loader:
    ISSUES.append("assets/data.js no carga assets/canonical-data.js")
for forbidden in (
    "assets/source/v040-data-",
    "assets/chunks/data-",
    "assets/products-v6.js",
):
    if forbidden in data_loader:
        ISSUES.append(f"assets/data.js todavía depende de {forbidden}")

if "assets/canonical-data.js" not in content_contract:
    ISSUES.append("content-v5.js no declara la fuente canónica directa")
if "assets/products-v6.js" in content_contract:
    ISSUES.append("content-v5.js todavía declara el overlay como fuente activa")

if "./assets/canonical-data.js" not in service_worker:
    ISSUES.append("service-worker.js no cachea canonical-data.js")
if "./assets/canonical-data.json" not in service_worker:
    ISSUES.append("service-worker.js no cachea canonical-data.json")
for forbidden in (
    "./assets/source/v040-data-001.b64",
    "./assets/source/v040-data-002.b64",
    "./assets/source/v040-data-003.b64",
    "./assets/source/v040-data-004.b64",
):
    if forbidden in service_worker:
        ISSUES.append(f"service-worker.js todavía cachea la fuente transitoria {forbidden}")

cache_match = re.search(r"^cache=(.+)$", deploy_marker, re.M)
cache_name = cache_match.group(1).strip() if cache_match else ""
if not cache_name:
    ISSUES.append("deploy-version.txt no declara cache=")
else:
    if cache_name not in service_worker:
        ISSUES.append(f"service-worker.js no usa {cache_name}")
    if cache_name not in host_mode:
        ISSUES.append(f"host-mode.js no usa {cache_name}")

for workflow_name, workflow in {
    "pages.yml": pages_workflow,
    "canonical-audit.yml": audit_workflow,
}.items():
    if "python3 scripts/verificar_runtime_canonico.py" not in workflow:
        ISSUES.append(f"{workflow_name} no ejecuta verificar_runtime_canonico.py")
    if "cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js" not in workflow:
        ISSUES.append(f"{workflow_name} no compara el JavaScript generado")
    if "cmp .artifacts/canonical/canonical-data.json assets/canonical-data.json" not in workflow:
        ISSUES.append(f"{workflow_name} no compara el JSON generado")

print("EL ERRANTE — RUNTIME CANÓNICO")
print("=" * 38)
for key, value in counts.items():
    print(f"{key}: {value}")
print(f"cache: {cache_name or 'NO DEFINIDA'}")
print(f"problemas: {len(ISSUES)}")

if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)

print("RESULTADO: PASS")
