#!/usr/bin/env python3
"""Migra la rama v0.8 al runtime canónico directo de forma idempotente."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CACHE_OLD = "el-errante-v0-6-7"
CACHE_NEW = "el-errante-v0-6-8"


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def write(relative: str, content: str) -> None:
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


# 1. Cargador de datos directo.
write(
    "assets/data.js",
    """(()=>{\n"
    "  const request=new XMLHttpRequest();\n"
    "  request.open(\"GET\",\"assets/canonical-data.js\",false);\n"
    "  request.send(null);\n"
    "  if(request.status!==200&&request.status!==0) throw new Error(\"No se pudo cargar assets/canonical-data.js\");\n"
    "  (0,eval)(request.responseText);\n"
    "  if(!window.EE_DATA||!Array.isArray(window.EE_DATA.products)||window.EE_DATA.products.length!==11){\n"
    "    throw new Error(\"La fuente canónica directa no produjo los 11 productos esperados\");\n"
    "  }\n"
    "})();\n"""
    .replace('"\n    "', "")
)

# 2. Contrato de contenido: la fuente activa deja de ser baseline + overlay.
content = read("assets/content-v5.js")
content = content.replace(
    'source:"assets/data.js + assets/preprod.js + assets/products-v6.js"',
    'source:"assets/canonical-data.js + assets/preprod.js"',
)
write("assets/content-v5.js", content)

# 3. Service worker: canónico directo y caché nueva.
sw = read("service-worker.js").replace(CACHE_OLD, CACHE_NEW)
lines = [
    line for line in sw.splitlines()
    if "./assets/source/v040-data-" not in line
]
sw = "\n".join(lines) + "\n"
if "'./assets/canonical-data.js'" not in sw:
    sw = sw.replace(
        "'./assets/styles.css','./assets/data.js','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',",
        "'./assets/styles.css','./assets/data.js','./assets/canonical-data.js','./assets/canonical-data.json','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',",
    )
write("service-worker.js", sw)

# 4. Runtime y marcador sincronizados.
write("assets/host-mode.js", read("assets/host-mode.js").replace(CACHE_OLD, CACHE_NEW))
write("deploy-version.txt", read("deploy-version.txt").replace(CACHE_OLD, CACHE_NEW))

# 5. Verificador de procedencia adaptado al runtime directo.
write(
    "scripts/verificar_fuentes.py",
    r'''#!/usr/bin/env python3
"""Valida procedencia, recuperación histórica y exclusión de fuentes dañadas."""

from __future__ import annotations

import base64
from pathlib import Path
import re
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


def read(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        ISSUES.append(f"Archivo faltante: {relative}")
        return ""
    return path.read_text(encoding="utf-8").strip()


def decode(name: str, parts: list[str]) -> str:
    encoded = "".join(read(part) for part in parts)
    try:
        raw = base64.b64decode(encoded, validate=True)
        source = raw.decode("utf-8", errors="strict")
    except Exception as error:
        ISSUES.append(f"{name}: fuente inválida: {error}")
        return ""
    if "[... ELLIPSIZATION ...]" in source:
        ISSUES.append(f"{name}: contiene marcador de truncación")
    return source


data_source = decode("Baseline de datos v0.4", DATA_PARTS)
preprod_source = decode("Lógica funcional v0.4", PREPROD_PARTS)
data_loader = read("assets/data.js")
preprod_loader = read("assets/preprod.js")
service_worker = read("service-worker.js")
workflow = read(".github/workflows/pages.yml")
audit_workflow = read(".github/workflows/canonical-audit.yml")
exporter = read("scripts/exportar-fuente-canonica.mjs")
incident = read("documentacion/INCIDENTE_CHUNKS_TRUNCADOS.md")
legacy = read("assets/chunks/data-003.txt")
deploy = read("deploy-version.txt")

if data_source and not data_source.startswith("window.EE_DATA="):
    ISSUES.append("El baseline íntegro no inicia con window.EE_DATA=")
if data_source and not data_source.rstrip().endswith("};"):
    ISSUES.append("El baseline íntegro parece incompleto")
if preprod_source and "initOperations" not in preprod_source:
    ISSUES.append("La lógica íntegra no contiene initOperations")
if preprod_source and not preprod_source.rstrip().endswith("})();"):
    ISSUES.append("La lógica íntegra parece incompleta")

if "assets/canonical-data.js" not in data_loader:
    ISSUES.append("assets/data.js no carga canonical-data.js")
for forbidden in ("assets/source/v040-data-", "assets/chunks/data-", "assets/products-v6.js"):
    if forbidden in data_loader:
        ISSUES.append(f"assets/data.js volvió a depender de {forbidden}")

for part in PREPROD_PARTS:
    name = Path(part).name
    if name not in preprod_loader:
        ISSUES.append(f"assets/preprod.js no carga {name}")
    if f"./{part}" not in service_worker:
        ISSUES.append(f"service-worker.js no cachea {part}")

for part in DATA_PARTS:
    if part not in exporter:
        ISSUES.append(f"El exportador no conserva la procedencia {part}")
    if f"./{part}" in service_worker:
        ISSUES.append(f"El service worker todavía cachea la fuente transitoria {part}")

if "[... ELLIPSIZATION ...]" not in legacy:
    ISSUES.append("No se conserva la evidencia del truncamiento")
if "truncated-ellipsized-do-not-use" not in incident:
    ISSUES.append("El incidente no clasifica los chunks heredados")
if "v040-preprod-001.b64" in preprod_loader or "v040-preprod-001.b64" in service_worker:
    ISSUES.append("El bloque funcional alterado volvió al runtime")

cache_match = re.search(r"^cache=(.+)$", deploy, re.M)
cache_name = cache_match.group(1).strip() if cache_match else ""
if not cache_name:
    ISSUES.append("deploy-version.txt no declara caché")
elif cache_name not in service_worker:
    ISSUES.append(f"service-worker.js no usa {cache_name}")

for name, content in {"pages.yml": workflow, "canonical-audit.yml": audit_workflow}.items():
    for required in (
        "python3 scripts/verificar_fuentes.py",
        "python3 scripts/verificar_runtime_canonico.py",
        "node scripts/exportar-fuente-canonica.mjs",
        "cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js",
        "cmp .artifacts/canonical/canonical-data.json assets/canonical-data.json",
    ):
        if required not in content:
            ISSUES.append(f"{name}: falta {required}")

print("EL ERRANTE — PROCEDENCIA DE FUENTES")
print("=" * 43)
print(f"baseline_datos_bytes: {len(data_source.encode('utf-8')) if data_source else 0}")
print(f"logica_funcional_bytes: {len(preprod_source.encode('utf-8')) if preprod_source else 0}")
print(f"cache: {cache_name or 'NO DEFINIDA'}")
print(f"problemas: {len(ISSUES)}")
if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)
print("RESULTADO: PASS")
'''
)

# 6. Verificador general: incluye la equivalencia directa.
demo = read("verificar_demo.py")
needle = '"python3 scripts/verificar_fuentes.py",\n    "node scripts/exportar-fuente-canonica.mjs",'
replacement = '"python3 scripts/verificar_fuentes.py",\n    "python3 scripts/verificar_runtime_canonico.py",\n    "node scripts/exportar-fuente-canonica.mjs",'
if needle in demo:
    demo = demo.replace(needle, replacement)
write("verificar_demo.py", demo)


def migrate_workflow(relative: str) -> None:
    workflow = read(relative).replace(CACHE_OLD, CACHE_NEW)

    if "python3 scripts/verificar_runtime_canonico.py" not in workflow:
        workflow = workflow.replace(
            "      - name: Reconstruir fuente canónica efectiva\n",
            "      - name: Validar runtime canónico directo\n"
            "        run: python3 scripts/verificar_runtime_canonico.py\n\n"
            "      - name: Reconstruir fuente canónica efectiva\n",
        )
        workflow = workflow.replace(
            "      - name: Reconstruir fuente efectiva\n",
            "      - name: Validar runtime canónico directo\n"
            "        run: python3 scripts/verificar_runtime_canonico.py\n\n"
            "      - name: Reconstruir fuente efectiva\n",
        )

    if "cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js" not in workflow:
        marker = "      - name: Publicar fuente o diagnóstico para auditoría\n"
        compare = (
            "      - name: Comparar canónico generado y versionado\n"
            "        run: |\n"
            "          cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js\n"
            "          cmp .artifacts/canonical/canonical-data.json assets/canonical-data.json\n"
            "          cmp .artifacts/canonical/canonical-report.json documentacion/CANONICAL_DATA_REPORT.json\n\n"
        )
        if marker in workflow:
            workflow = workflow.replace(marker, compare + marker)
        else:
            marker = "      - name: Conservar artefacto canónico\n"
            workflow = workflow.replace(marker, compare + marker)

    # Publicación: el runtime directo debe estar dentro del artefacto.
    if relative.endswith("pages.yml"):
        if "test -f _site/assets/canonical-data.js" not in workflow:
            workflow = workflow.replace(
                "          grep -q 'Masa · Fuego · Territorio' _site/index.html\n",
                "          grep -q 'Masa · Fuego · Territorio' _site/index.html\n"
                "          test -f _site/assets/canonical-data.js\n"
                "          test -f _site/assets/canonical-data.json\n",
            )
        # Las partes de datos quedan en el repo, no en la ruta crítica de Pages.
        workflow = re.sub(
            r"\s*v040-data-001\.b64 v040-data-002\.b64 v040-data-003\.b64 v040-data-004\.b64 \\\n",
            "",
            workflow,
        )

    write(relative, workflow)


migrate_workflow(".github/workflows/pages.yml")
migrate_workflow(".github/workflows/canonical-audit.yml")

print("Migración v0.8 aplicada.")
