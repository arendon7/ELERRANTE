#!/usr/bin/env python3
"""Valida la procedencia y el ensamblaje de las fuentes recuperadas."""

from __future__ import annotations

import base64
import hashlib
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []

APP_PARTS = [
    "assets/source/v040-app-001.b64",
    "assets/source/v040-app-002.b64",
    "assets/source/v040-app-003.b64",
    "assets/source/v040-app-004.b64",
    "assets/source/v040-app-005.b64",
    "assets/source/v040-app-006.b64",
]
DATA_PARTS = [
    "assets/source/v040-data-001.b64",
    "assets/source/v040-data-002.b64",
    "assets/source/v040-data-003.b64",
    "assets/source/v040-data-004.b64",
]
PREPROD_PARTS = [
    "assets/source/v040-preprod-001a.b64",
    "assets/source/v040-preprod-001b.b64",
    "assets/source/v040-preprod-001c.b64",
    "assets/source/v040-preprod-001d.b64",
    "assets/source/v040-preprod-002.b64",
    "assets/source/v040-preprod-003.b64",
]
APP_SHA256 = "9745984b131f5c1697d0700e5ad7b397e9b2fc17356842804f22bba140fe3e3c"


def read(relative_path: str) -> str:
    path = ROOT / relative_path
    if not path.is_file():
        ISSUES.append(f"Archivo faltante: {relative_path}")
        return ""
    return path.read_text(encoding="utf-8").strip()


def decode_group(name: str, parts: list[str]) -> tuple[str, bytes]:
    encoded = "".join("".join(read(part).split()) for part in parts)
    try:
        raw = base64.b64decode(encoded, validate=True)
    except Exception as error:
        ISSUES.append(f"{name}: Base64 inválido: {error}")
        return "", b""
    try:
        source = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError as error:
        ISSUES.append(f"{name}: UTF-8 inválido: {error}")
        return "", raw
    if "[... ELLIPSIZATION ...]" in source:
        ISSUES.append(f"{name}: contiene el marcador de truncación")
    return source, raw


app_source, app_raw = decode_group("Aplicación v0.4", APP_PARTS)
data_source, data_raw = decode_group("Fuente de datos v0.4", DATA_PARTS)
preprod_source, preprod_raw = decode_group("Lógica funcional v0.4", PREPROD_PARTS)

if app_raw and len(app_raw) != 32630:
    ISSUES.append(f"La aplicación íntegra tiene {len(app_raw)} bytes; se esperaban 32630")
if app_raw and hashlib.sha256(app_raw).hexdigest() != APP_SHA256:
    ISSUES.append("La aplicación íntegra no coincide con el SHA-256 canónico")
if app_source and "function initAccount()" not in app_source:
    ISSUES.append("La aplicación íntegra no contiene initAccount")
if app_source and "window.EE=" not in app_source:
    ISSUES.append("La aplicación íntegra no expone window.EE")
if app_source and not app_source.rstrip().endswith("})();"):
    ISSUES.append("La aplicación íntegra parece incompleta")
if data_source and not data_source.startswith("window.EE_DATA="):
    ISSUES.append("La fuente de datos íntegra no inicia con window.EE_DATA=")
if data_source and not data_source.rstrip().endswith("};"):
    ISSUES.append("La fuente de datos íntegra parece incompleta")
if preprod_source and "initOperations" not in preprod_source:
    ISSUES.append("La lógica funcional íntegra no contiene initOperations")
if preprod_source and not preprod_source.rstrip().endswith("})();"):
    ISSUES.append("La lógica funcional íntegra parece incompleta")

app_loader = read("assets/app.js")
data_loader = read("assets/data.js")
preprod_loader = read("assets/preprod.js")
service_worker = read("service-worker.js")
workflow = read(".github/workflows/pages.yml")
incident = read("documentacion/INCIDENTE_CHUNKS_TRUNCADOS.md")
legacy_data = read("assets/chunks/data-003.txt")

for part in APP_PARTS:
    name = Path(part).name
    if name not in app_loader:
        ISSUES.append(f"assets/app.js no carga {name}")
    if f"./{part}" not in service_worker:
        ISSUES.append(f"service-worker.js no cachea {part}")
for part in DATA_PARTS:
    name = Path(part).name
    if name not in data_loader:
        ISSUES.append(f"assets/data.js no carga {name}")
    if f"./{part}" not in service_worker:
        ISSUES.append(f"service-worker.js no cachea {part}")
for part in PREPROD_PARTS:
    name = Path(part).name
    if name not in preprod_loader:
        ISSUES.append(f"assets/preprod.js no carga {name}")
    if f"./{part}" not in service_worker:
        ISSUES.append(f"service-worker.js no cachea {part}")

if "assets/chunks/app-" in app_loader:
    ISSUES.append("assets/app.js volvió a enlazar los chunks de aplicación truncados")
if "assets/chunks/data-" in data_loader:
    ISSUES.append("assets/data.js volvió a enlazar los chunks de datos truncados")
if "assets/chunks/preprod-" in preprod_loader:
    ISSUES.append("assets/preprod.js volvió a enlazar los chunks funcionales heredados")
if "v040-preprod-001.b64" in preprod_loader:
    ISSUES.append("assets/preprod.js todavía enlaza el bloque funcional alterado")
if "[... ELLIPSIZATION ...]" not in legacy_data:
    ISSUES.append("No se conserva la evidencia del truncamiento en data-003.txt")
if "truncated-ellipsized-do-not-use" not in incident:
    ISSUES.append("La documentación no clasifica los chunks como no utilizables")
if "el-errante-v0-6-8" not in service_worker:
    ISSUES.append("service-worker.js no usa la caché v0.6.8")
if "python3 scripts/verificar_fuentes.py" not in workflow:
    ISSUES.append("El workflow no ejecuta verificar_fuentes.py")
if "node scripts/exportar-fuente-canonica.mjs" not in workflow:
    ISSUES.append("El workflow no reconstruye la fuente canónica")

print("EL ERRANTE — VALIDACIÓN DE FUENTES")
print("=" * 42)
print(f"Aplicación íntegra: {len(app_raw)} bytes")
print(f"Aplicación SHA-256: {hashlib.sha256(app_raw).hexdigest() if app_raw else 'NO DISPONIBLE'}")
print(f"Datos íntegros: {len(data_raw)} bytes")
print(f"Lógica íntegra: {len(preprod_raw)} bytes")
print(f"Problemas: {len(ISSUES)}")

if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)

print("RESULTADO: PASS")
