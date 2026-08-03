#!/usr/bin/env python3
"""Valida la procedencia y el ensamblaje de las fuentes recuperadas."""

from __future__ import annotations

import base64
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []

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


def read(relative_path: str) -> str:
    path = ROOT / relative_path
    if not path.is_file():
        ISSUES.append(f"Archivo faltante: {relative_path}")
        return ""
    return path.read_text(encoding="utf-8").strip()


def decode_group(name: str, parts: list[str]) -> str:
    encoded = "".join(read(part) for part in parts)
    try:
        raw = base64.b64decode(encoded, validate=True)
    except Exception as error:
        ISSUES.append(f"{name}: Base64 inválido: {error}")
        return ""
    try:
        source = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError as error:
        ISSUES.append(f"{name}: UTF-8 inválido: {error}")
        return ""
    if "[... ELLIPSIZATION ...]" in source:
        ISSUES.append(f"{name}: contiene el marcador de truncación")
    return source


data_source = decode_group("Fuente de datos v0.4", DATA_PARTS)
preprod_source = decode_group("Lógica funcional v0.4", PREPROD_PARTS)

if data_source and not data_source.startswith("window.EE_DATA="):
    ISSUES.append("La fuente de datos íntegra no inicia con window.EE_DATA=")
if data_source and not data_source.rstrip().endswith("};"):
    ISSUES.append("La fuente de datos íntegra parece incompleta")
if preprod_source and "initOperations" not in preprod_source:
    ISSUES.append("La lógica funcional íntegra no contiene initOperations")
if preprod_source and not preprod_source.rstrip().endswith("})();"):
    ISSUES.append("La lógica funcional íntegra parece incompleta")

data_loader = read("assets/data.js")
preprod_loader = read("assets/preprod.js")
service_worker = read("service-worker.js")
workflow = read(".github/workflows/pages.yml")
incident = read("documentacion/INCIDENTE_CHUNKS_TRUNCADOS.md")
legacy_data = read("assets/chunks/data-003.txt")

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
if "el-errante-v0-6-7" not in service_worker:
    ISSUES.append("service-worker.js no usa la caché v0.6.7")
if "python3 scripts/verificar_fuentes.py" not in workflow:
    ISSUES.append("El workflow no ejecuta verificar_fuentes.py")
if "node scripts/exportar-fuente-canonica.mjs" not in workflow:
    ISSUES.append("El workflow no reconstruye la fuente canónica")

print("EL ERRANTE — VALIDACIÓN DE FUENTES")
print("=" * 42)
print(f"Datos íntegros: {len(data_source.encode('utf-8')) if data_source else 0} bytes")
print(f"Lógica íntegra: {len(preprod_source.encode('utf-8')) if preprod_source else 0} bytes")
print(f"Problemas: {len(ISSUES)}")

if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)

print("RESULTADO: PASS")
