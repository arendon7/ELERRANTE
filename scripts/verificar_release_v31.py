#!/usr/bin/env python3
"""Barrera de coherencia de release para El Errante V3.1."""
from pathlib import Path
import json
import sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]

def read(path):
    p=ROOT/path
    if not p.is_file():
        errors.append(f'Falta {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='ignore')

package_text=read('package.json')
readme=read('README.md')
changelog=read('CHANGELOG.md')
deploy=read('deploy-version.txt')
pages=read('.github/workflows/pages.yml')
health=read('.github/workflows/public-health.yml')
canonical=read('.github/workflows/canonical-audit.yml')
functional=read('.github/workflows/functional-regression.yml')
access=read('acceso.html')
center=read('centro-interno.html')
operation=read('operacion.html')
finance=read('finanzas.html')
host=read('assets/host-mode.js')
access_js=read('assets/access-v31.js')
shell_js=read('assets/internal-shell-v31.js')
finance_js=read('assets/finance-workbench-v31.js')
worker=read('service-worker.js')
architecture=read('documentacion/ARQUITECTURA_INTERNA_V31.md')

try:
    package=json.loads(package_text)
except Exception as exc:
    package={}
    errors.append(f'package.json inválido: {exc}')

checks={
    'package declara 3.1.0':package.get('version')=='3.1.0',
    'package conserva referencia a 3.0.0':package.get('releaseHistory',{}).get('previousStable',{}).get('version')=='3.0.0',
    'README declara V3.1':readme.startswith('# El Errante V3.1') and 'Financial Workbench V3.1' in readme,
    'changelog abre con V3.1':'## [3.1.0]' in changelog and changelog.index('## [3.1.0]') < changelog.index('## [3.0.0]'),
    'marcador fuente declara release 3.1':'release_version=3.1.0' in deploy and 'previous_release_version=3.0.0' in deploy,
    'marcador conserva runtime 2.8':'version=2.8.0' in deploy and 'cache=el-errante-v2-8-brand-canon-2' in deploy,
    'marcador declara arquitectura 3.1':'internal_architecture=v3.1-acceso-operacion-finanzas' in deploy and 'finance_workbench=v3.1.0' in deploy,
    'Pages genera release 3.1':'release_version=3.1.0' in pages and 'Publicar GitHub Pages V3.1' in pages,
    'Pages verifica arquitectura 3.1':'internal_architecture=v3.1-acceso-operacion-finanzas' in pages and 'finance_workbench=v3.1.0' in pages,
    'Pages ejecuta barrera release':'scripts/verificar_release_v31.py' in pages,
    'health espera release 3.1':'EXPECTED_RELEASE: 3.1.0' in health,
    'health espera arquitectura 3.1':'v3.1-acceso-operacion-finanzas' in health,
    'auditoría ejecuta barrera release':'scripts/verificar_release_v31.py' in canonical,
    'regresión ejecuta barrera release':'scripts/verificar_release_v31.py' in functional,
    'portal acceso V3.1':'id="access-v31"' in access and 'assets/access-v31.js' in access,
    'centro protegido':'data-v31-protected' in center and 'assets/internal-shell-v31.js' in center,
    'centro selector de módulos':'Entrar a Operación' in center and 'Entrar a Finanzas' in center,
    'operación protegida':'data-v31-protected' in operation and 'assets/internal-shell-v31.js' in operation,
    'operación integra control y pedidos':'id="control-v30"' in operation and 'id="daily-ops-v21"' in operation,
    'finanzas protegidas':'data-v31-protected' in finance and 'assets/internal-shell-v31.js' in finance,
    'finanzas monta workbench':'id="finance-workbench-v31"' in finance and 'assets/finance-workbench-v31.js' in finance,
    'finanzas no monta producción':'assets/production-v22.js' not in finance,
    'footer público prepara acceso':'ensureUserAccess' in host and "href='acceso.html'" in host,
    'login no contiene contraseña fija':'password="' not in access_js.lower() and 'service_role' not in access_js.lower(),
    'guard comparte sesión V3.1':'ee_v31_session' in shell_js and 'acceso.html' in shell_js,
    'workbench baseline/working separados':"SNAPSHOT_KEY='ee_v30_mfo_snapshot'" in finance_js and "WORKING_KEY='ee_v31_finance_working_model'" in finance_js,
    'workbench sin red':all(token not in finance_js for token in ('fetch(','XMLHttpRequest','axios')),
    'service worker publica acceso':'./acceso.html' in worker and './assets/access-v31.js' in worker,
    'service worker publica workbench':'./assets/internal-shell-v31.js' in worker and './assets/finance-workbench-v31.js' in worker and './assets/internal-v31.css' in worker,
    'documentación V3.1 vigente':'# Arquitectura interna V3.1' in architecture and 'Working Model' in architecture,
}

for label,ok in checks.items():
    if not ok: errors.append(label)

# Sólo inspeccionamos artefactos que podrían publicar secretos directamente.
# Los workflows contienen deliberadamente nombres de secretos y grep defensivos.
for name,content in [('access',access_js),('shell',shell_js),('finance',finance_js)]:
    lower=content.lower()
    for forbidden in ('service_role','postgres://','private_key','supabase_service'):
        if forbidden in lower:
            errors.append(f'{name}: posible secreto {forbidden}')

print('EL ERRANTE V3.1 — COHERENCIA DE RELEASE')
print('='*43)
print(f'Controles: {len(checks)}')
print(f'Problemas: {len(errors)}')
if errors:
    for error in errors: print('-',error)
    sys.exit(1)
print('RESULTADO: PASS')
