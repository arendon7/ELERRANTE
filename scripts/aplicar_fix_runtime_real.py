#!/usr/bin/env python3
"""Materializa el runtime canónico y alinea Pages, caché y health checks."""
from __future__ import annotations

from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / ".bootstrap-canonical"
CACHE = "el-errante-v0-6-8"


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


# 1. Materializar exactamente el artefacto auditado.
required = ["canonical-data.js", "canonical-data.json", "canonical-report.json", "canonical-report.md"]
for name in required:
    source = ART / name
    if not source.is_file():
        raise SystemExit(f"Falta el archivo auditado {source}")

expected = {
    "canonical-data.js": "52bc3a6510a11235cef851fe59bf85bc36b2ec1e3c2cbd288b113f630cbd42b0",
    "canonical-data.json": "6e7e05865780b17c2c70ddae22eaf0875377599e0ee25171948dd4c739f50190",
    "canonical-report.json": "da6aa02fce8f1103934b6c5edb6ea1a64ff4603c7898e146e0b999b6ab3eb56c",
    "canonical-report.md": "3d9fc0a4316ff808254829d75f97b061db05a4f532a221408425306af7aaa33b",
}
for name, expected_sha in expected.items():
    observed = hashlib.sha256((ART / name).read_bytes()).hexdigest()
    if observed != expected_sha:
        raise SystemExit(f"Hash inesperado para {name}: {observed}")

shutil.copyfile(ART / "canonical-data.js", ROOT / "assets/canonical-data.js")
shutil.copyfile(ART / "canonical-data.json", ROOT / "assets/canonical-data.json")
shutil.copyfile(ART / "canonical-report.json", ROOT / "documentacion/CANONICAL_DATA_REPORT.json")
shutil.copyfile(ART / "canonical-report.md", ROOT / "documentacion/CANONICAL_DATA_REPORT.md")
write(
    "documentacion/CANONICAL_DATA_SHA256.txt",
    "canonical-data.js  52bc3a6510a11235cef851fe59bf85bc36b2ec1e3c2cbd288b113f630cbd42b0\n"
    "canonical-data.json  6e7e05865780b17c2c70ddae22eaf0875377599e0ee25171948dd4c739f50190\n",
)

# 2. Runtime directo: un único archivo canónico.
write(
    "assets/data.js",
    """(()=>{\n  const request=new XMLHttpRequest();\n  request.open(\"GET\",\"assets/canonical-data.js\",false);\n  request.send(null);\n  if(request.status!==200&&request.status!==0){\n    throw new Error(\"No se pudo cargar assets/canonical-data.js\");\n  }\n  (0,eval)(request.responseText);\n  if(!window.EE_DATA||!Array.isArray(window.EE_DATA.products)||window.EE_DATA.products.length!==11){\n    throw new Error(\"La fuente canónica directa no produjo los 11 productos esperados\");\n  }\n})();\n""",
)

content = read("assets/content-v5.js")
content = content.replace(
    'source:"assets/data.js + assets/preprod.js + assets/products-v6.js"',
    'source:"assets/canonical-data.js + assets/preprod.js"',
)
write("assets/content-v5.js", content)

# 3. Cachear el runtime real; conservar fuentes históricas en el repo, no en ejecución.
sw = read("service-worker.js").replace("el-errante-v0-6-7", CACHE)
sw = sw.replace(
    "'./assets/styles.css','./assets/data.js','./assets/products-v6.js','./assets/runtime.js','./assets/app.js',",
    "'./assets/styles.css','./assets/data.js','./assets/canonical-data.js','./assets/canonical-data.json','./assets/runtime.js','./assets/app.js',",
)
sw = "\n".join(
    line for line in sw.splitlines()
    if "./assets/source/v040-data-" not in line
) + "\n"
write("service-worker.js", sw)
write("assets/host-mode.js", read("assets/host-mode.js").replace("el-errante-v0-6-7", CACHE))

marker = read("deploy-version.txt") if (ROOT / "deploy-version.txt").is_file() else ""
if "cache=" in marker:
    lines = [f"cache={CACHE}" if line.startswith("cache=") else line for line in marker.splitlines()]
    marker = "\n".join(lines) + "\n"
else:
    marker += f"cache={CACHE}\n"
write("deploy-version.txt", marker)

# 4. Validador de procedencia: historia íntegra + runtime directo.
write(
    "scripts/verificar_fuentes.py",
    '''#!/usr/bin/env python3
from __future__ import annotations
import base64
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
ISSUES=[]
DATA_PARTS=[f"assets/source/v040-data-{n:03d}.b64" for n in range(1,5)]
PREPROD_PARTS=[
 "assets/source/v040-preprod-001a.b64","assets/source/v040-preprod-001b.b64",
 "assets/source/v040-preprod-001c.b64","assets/source/v040-preprod-001d.b64",
 "assets/source/v040-preprod-002.b64","assets/source/v040-preprod-003.b64"]

def read(path):
 p=ROOT/path
 if not p.is_file(): ISSUES.append(f"Archivo faltante: {path}"); return ""
 return p.read_text(encoding="utf-8").strip()

def decode(name,parts):
 try: return base64.b64decode("".join(read(p) for p in parts),validate=True).decode("utf-8")
 except Exception as e: ISSUES.append(f"{name}: {e}"); return ""

data=decode("baseline",DATA_PARTS)
preprod=decode("preprod",PREPROD_PARTS)
loader=read("assets/data.js")
sw=read("service-worker.js")
host=read("assets/host-mode.js")
deploy=read("deploy-version.txt")
pages=read(".github/workflows/pages.yml")
audit=read(".github/workflows/canonical-audit.yml")
legacy=read("assets/chunks/data-003.txt")
incident=read("documentacion/INCIDENTE_CHUNKS_TRUNCADOS.md")

if not data.startswith("window.EE_DATA=") or not data.rstrip().endswith("};"): ISSUES.append("Baseline v0.4 incompleto")
if "initOperations" not in preprod or not preprod.rstrip().endswith("})();"): ISSUES.append("Preprod íntegro incompleto")
if "assets/canonical-data.js" not in loader: ISSUES.append("data.js no carga canonical-data.js")
for forbidden in ("assets/source/v040-data-","assets/chunks/data-","assets/products-v6.js"):
 if forbidden in loader: ISSUES.append(f"data.js depende de {forbidden}")
if "./assets/canonical-data.js" not in sw or "./assets/canonical-data.json" not in sw: ISSUES.append("Service worker no cachea canónico")
for part in DATA_PARTS:
 if f"./{part}" in sw: ISSUES.append(f"Service worker cachea fuente transitoria {part}")
for part in PREPROD_PARTS:
 if Path(part).name not in read("assets/preprod.js"): ISSUES.append(f"preprod.js no carga {part}")
 if f"./{part}" not in sw: ISSUES.append(f"Service worker no cachea {part}")
if "[... ELLIPSIZATION ...]" not in legacy: ISSUES.append("No se conserva evidencia de truncamiento")
if "truncated-ellipsized-do-not-use" not in incident: ISSUES.append("Incidente sin clasificación")
cache=re.search(r"^cache=(.+)$",deploy,re.M)
cache=cache.group(1).strip() if cache else ""
if cache!="el-errante-v0-6-8": ISSUES.append(f"Caché declarada inesperada: {cache}")
if cache not in sw or cache not in host: ISSUES.append("Caché no sincronizada")
for name,wf in (("pages",pages),("audit",audit)):
 for required in ("verificar_fuentes.py","verificar_runtime_canonico.py","exportar-fuente-canonica.mjs","cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js","cmp .artifacts/canonical/canonical-data.json assets/canonical-data.json"):
  if required not in wf: ISSUES.append(f"{name}: falta {required}")
print("EL ERRANTE — PROCEDENCIA REAL")
print(f"baseline_bytes={len(data.encode()) if data else 0}")
print(f"preprod_bytes={len(preprod.encode()) if preprod else 0}")
print(f"cache={cache}")
print(f"problemas={len(ISSUES)}")
for issue in ISSUES: print("-",issue)
if ISSUES: sys.exit(1)
print("RESULTADO: PASS")
''',
)

# 5. Workflows permanentes alineados con los archivos reales.
write(
    ".github/workflows/canonical-audit.yml",
    '''name: Auditar fuente canónica

on:
  pull_request:
    branches: ["main"]
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  canonical:
    name: Fuente canónica real
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validar procedencia
        run: python3 scripts/verificar_fuentes.py
      - name: Validar runtime directo
        run: python3 scripts/verificar_runtime_canonico.py
      - name: Reconstruir fuente efectiva
        run: node scripts/exportar-fuente-canonica.mjs --output=.artifacts/canonical
      - name: Comparar generado y versionado
        run: |
          cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js
          cmp .artifacts/canonical/canonical-data.json assets/canonical-data.json
          cmp .artifacts/canonical/canonical-report.json documentacion/CANONICAL_DATA_REPORT.json
      - name: Conservar evidencia
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: fuente-canonica-${{ github.sha }}
          path: .artifacts/canonical
          if-no-files-found: error
          retention-days: 14
''',
)

write(
    ".github/workflows/pages.yml",
    f'''name: Validar y publicar El Errante

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages-${{{{ github.ref }}}}"
  cancel-in-progress: true

jobs:
  validate:
    name: Regresión integral
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python3 verificar_demo.py
      - run: python3 scripts/verificar_fuentes.py
      - run: python3 scripts/verificar_runtime_canonico.py
      - run: node scripts/exportar-fuente-canonica.mjs --output=.artifacts/canonical
      - name: Comparar canónico generado y versionado
        run: |
          cmp .artifacts/canonical/canonical-data.js assets/canonical-data.js
          cmp .artifacts/canonical/canonical-data.json assets/canonical-data.json
          cmp .artifacts/canonical/canonical-report.json documentacion/CANONICAL_DATA_REPORT.json
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: fuente-canonica-${{{{ github.sha }}}}
          path: .artifacts/canonical
          if-no-files-found: warn
          retention-days: 14

  deploy:
    name: Publicar GitHub Pages
    if: github.event_name != 'pull_request'
    needs: validate
    environment:
      name: github-pages
      url: ${{{{ steps.deployment.outputs.page_url }}}}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - name: Preparar sitio completo
        shell: bash
        run: |
          mkdir -p _site
          rsync -av ./ _site/ --exclude '.git/' --exclude '.github/' --exclude '_site/' --exclude '__pycache__/' --exclude '.artifacts/'
          printf 'EL ERRANTE PUBLIC RELEASE\\nversion=0.8.0\\ndeploy_source=main\\nrelease_commit=%s\\ncache={CACHE}\\nupdated=%s\\n' "$GITHUB_SHA" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" > _site/deploy-version.txt
          touch _site/.nojekyll
      - name: Verificar artefacto publicable real
        run: |
          grep -q 'version=0.8.0' _site/deploy-version.txt
          grep -q 'cache={CACHE}' _site/deploy-version.txt
          grep -q "release_commit=${{{{ GITHUB_SHA }}}}" _site/deploy-version.txt
          test -f _site/assets/canonical-data.js
          test -f _site/assets/canonical-data.json
          grep -q 'assets/canonical-data.js' _site/assets/data.js
          ! grep -q 'assets/source/v040-data-' _site/assets/data.js
          ! grep -q 'assets/products-v6.js' _site/assets/data.js
          grep -q '{CACHE}' _site/service-worker.js
          for page in historia nosotros equipo admin control operacion studio presentacion; do test -f "_site/${{page}}.html"; done
      - uses: actions/upload-pages-artifact@v4
        with:
          path: _site
      - id: deployment
        uses: actions/deploy-pages@v4
''',
)

# 6. Health check: mensajes separados y evidencia en issue.
write(
    ".github/workflows/public-health.yml",
    f'''name: Verificar publicación real

on:
  workflow_run:
    workflows: ["Validar y publicar El Errante"]
    types: [completed]

permissions:
  contents: read
  issues: write

env:
  PUBLIC_BASE: https://arendon7.github.io/ELERRANTE
  EXPECTED_CACHE: {CACHE}

jobs:
  health:
    name: GitHub Pages corresponde a main
    if: github.event.workflow_run.event == 'push'
    runs-on: ubuntu-latest
    timeout-minutes: 6
    steps:
      - name: Definir expectativa
        run: |
          echo "EXPECTED_SHA=${{{{ github.event.workflow_run.head_sha }}}}" >> "$GITHUB_ENV"
          echo "SOURCE_CONCLUSION=${{{{ github.event.workflow_run.conclusion }}}}" >> "$GITHUB_ENV"
      - name: Exigir despliegue fuente exitoso
        run: test "$SOURCE_CONCLUSION" = "success"
      - name: Esperar marcador coherente
        shell: bash
        run: |
          set -euo pipefail
          success=0
          for attempt in $(seq 1 12); do
            curl --fail --silent --show-error --location --max-time 20 -H 'Cache-Control: no-cache' "$PUBLIC_BASE/deploy-version.txt?sha=$EXPECTED_SHA&attempt=$attempt" > deploy-version-observed.txt || true
            observed_sha="$(sed -n 's/^release_commit=//p' deploy-version-observed.txt | tr -d '\r')"
            observed_cache="$(sed -n 's/^cache=//p' deploy-version-observed.txt | tr -d '\r')"
            observed_source="$(sed -n 's/^deploy_source=//p' deploy-version-observed.txt | tr -d '\r')"
            if [ "$observed_sha" = "$EXPECTED_SHA" ] && [ "$observed_cache" = "$EXPECTED_CACHE" ] && [ "$observed_source" = "main" ]; then
              success=1; echo "Marcador público coherente en intento $attempt."; break
            fi
            echo "Intento $attempt — diagnóstico:"
            [ "$observed_sha" = "$EXPECTED_SHA" ] || echo "  SHA: esperado=$EXPECTED_SHA observado=${{observed_sha:-vacío}}"
            [ "$observed_cache" = "$EXPECTED_CACHE" ] || echo "  caché: esperada=$EXPECTED_CACHE observada=${{observed_cache:-vacía}}"
            [ "$observed_source" = "main" ] || echo "  fuente: esperada=main observada=${{observed_source:-vacía}}"
            sleep 10
          done
          [ "$success" -eq 1 ] || {{ echo "El marcador público no es coherente."; exit 1; }}
      - name: Verificar runtime canónico publicado
        run: |
          curl --fail --silent --show-error --location -H 'Cache-Control: no-cache' "$PUBLIC_BASE/assets/data.js?sha=$EXPECTED_SHA" > public-data-loader.js
          curl --fail --silent --show-error --location -H 'Cache-Control: no-cache' "$PUBLIC_BASE/assets/canonical-data.js?sha=$EXPECTED_SHA" > public-canonical-data.js
          grep -q 'assets/canonical-data.js' public-data-loader.js
          ! grep -q 'assets/source/v040-data-' public-data-loader.js
          ! grep -q 'assets/products-v6.js' public-data-loader.js
          grep -q 'window.EE_DATA=' public-canonical-data.js
          grep -q 'harina-aire-y-tiempo' public-canonical-data.js
          grep -q 'combo-primera-ruta' public-canonical-data.js
      - name: Verificar superficies
        run: |
          for page in historia nosotros equipo; do curl --fail --silent --show-error --location "$PUBLIC_BASE/${{page}}.html?sha=$EXPECTED_SHA" > "public-${{page}}.html"; done
          grep -q 'personas-proyecto' public-historia.html
          grep -q 'Personas y proyecto' public-nosotros.html
          grep -q 'Demo integral' public-equipo.html
      - name: Publicar PASS
        if: success()
        uses: actions/github-script@v7
        with:
          script: |
            const marker='<!-- el-errante-public-health -->';
            const body=`${{marker}}\n## Public health: PASS\n\n- Commit servido: \`${{process.env.EXPECTED_SHA}}\`.\n- Fuente: \`main\`.\n- Caché: \`${{process.env.EXPECTED_CACHE}}\`.\n- Runtime canónico directo: verificado.\n- Verificación: ${{new Date().toISOString()}}.`;
            const {{data:comments}}=await github.rest.issues.listComments({{owner:context.repo.owner,repo:context.repo.repo,issue_number:11,per_page:100}});
            const existing=comments.find(c=>c.body?.includes(marker));
            if(existing) await github.rest.issues.updateComment({{owner:context.repo.owner,repo:context.repo.repo,comment_id:existing.id,body}});
            else await github.rest.issues.createComment({{owner:context.repo.owner,repo:context.repo.repo,issue_number:11,body}});
      - name: Publicar FAIL
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const marker='<!-- el-errante-public-health -->';
            const body=`${{marker}}\n## Public health: FAIL\n\nLa publicación no superó la validación real del commit \`${{process.env.EXPECTED_SHA}}\`.\n\n- Caché esperada: \`${{process.env.EXPECTED_CACHE}}\`.\n- Revisar el log por diferencias separadas de SHA, caché, fuente o runtime.\n- Verificación: ${{new Date().toISOString()}}.`;
            const {{data:comments}}=await github.rest.issues.listComments({{owner:context.repo.owner,repo:context.repo.repo,issue_number:11,per_page:100}});
            const existing=comments.find(c=>c.body?.includes(marker));
            if(existing) await github.rest.issues.updateComment({{owner:context.repo.owner,repo:context.repo.repo,comment_id:existing.id,body}});
            else await github.rest.issues.createComment({{owner:context.repo.owner,repo:context.repo.repo,issue_number:11,body}});
''',
)

# El bootstrap y el generador obsoleto no deben quedar en la rama final.
for obsolete in [
    ROOT / ".github/workflows/bootstrap-runtime-real.yml",
    ROOT / ".github/workflows/augment-public-health-evidence.yml",
]:
    if obsolete.exists():
        obsolete.unlink()

print("Runtime canónico materializado y workflows alineados.")
