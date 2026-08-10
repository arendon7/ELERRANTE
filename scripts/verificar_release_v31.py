#!/usr/bin/env python3
"""Barrera de coherencia de release integral V3.1.1 y módulos activos."""
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
control=read('control.html')
operation=read('operacion.html')
finance=read('finanzas.html')
studio=read('studio.html')
acts=read('actas.html')
host=read('assets/host-mode.js')
access_js=read('assets/access-v31.js')
shell_js=read('assets/internal-shell-v31.js')
materials_js=read('assets/materials-v23.js')
operation_v330=read('assets/operational-evidence-v330.js')
finance_js=read('assets/finance-workbench-v31.js')
starter_js=read('assets/finance-starter-v31.js')
finance_v329=read('assets/finance-demo-v329.js')
worker=read('service-worker.js')
architecture=read('documentacion/ARQUITECTURA_INTERNA_V31.md')
version_map=read('documentacion/MAPA_VERSIONES_ACTIVAS.md')

try:
    package=json.loads(package_text)
except Exception as exc:
    package={}
    errors.append(f'package.json inválido: {exc}')

checks={
    'package declara release integral 3.1.1':package.get('version')=='3.1.1',
    'package conserva referencia a 3.1.0':package.get('releaseHistory',{}).get('previousStable',{}).get('version')=='3.1.0',
    'package describe módulos vigentes':'Operación V3.3.0' in package.get('description','') and 'Finanzas V3.2.9' in package.get('description',''),
    'README declara release integral y matriz':readme.startswith('# El Errante V3.1.1') and 'Release integral: `3.1.1`' in readme and 'Módulo Operativo efectivo: **V3.3.0**' in readme and 'Módulo Financiero efectivo: **V3.2.9**' in readme,
    'changelog conserva release 3.1.1':'## [3.1.1]' in changelog and changelog.index('## [3.1.1]') < changelog.index('## [3.1.0]'),
    'changelog declara estado modular':'Estado modular vigente sobre release integral 3.1.1' in changelog and 'Operación V3.3.0' in changelog and 'Finanzas V3.2.0–V3.2.9' in changelog,
    'changelog registra Materiales V2.3.1':'Materiales / BOM V2.3.1' in changelog and 'no requeridos ese día' in changelog,
    'marcador declara release 3.1.1':'release_version=3.1.1' in deploy and 'previous_release_version=3.1.0' in deploy,
    'marcador conserva runtime 2.8':'version=2.8.0' in deploy and 'cache=el-errante-v2-8-brand-canon-2' in deploy,
    'marcador separa arquitectura y shell':'internal_architecture=v3.1-acceso-operacion-finanzas' in deploy and 'session_shell=v3.1.1' in deploy and 'control_engine=v3.0' in deploy,
    'marcador declara módulos efectivos':'operation_module=v3.3.0' in deploy and 'finance_workbench_core=v3.1.0' in deploy and 'finance_module=v3.2.9' in deploy and 'finance_demo=v3.2.9' in deploy,
    'Pages genera release 3.1.1':'release_version=3.1.1' in pages and 'Publicar GitHub Pages V3.1.1' in pages,
    'Pages publica matriz modular':'operation_module=v3.3.0' in pages and 'finance_workbench_core=v3.1.0' in pages and 'finance_module=v3.2.9' in pages,
    'Pages verifica módulos vigentes':'operational-evidence-v330.js' in pages and 'finance-demo-v329.js' in pages,
    'Pages verifica perímetro auxiliar':'_site/studio.html' in pages and '_site/actas.html' in pages and "grep -q 'data-v31-protected' _site/studio.html" in pages and "grep -q 'data-v31-protected' _site/actas.html" in pages,
    'Pages ejecuta barrera release':'scripts/verificar_release_v31.py' in pages,
    'health espera release 3.1.1':'EXPECTED_RELEASE: 3.1.1' in health,
    'health espera arquitectura 3.1':'v3.1-acceso-operacion-finanzas' in health,
    'health verifica matriz modular':'EXPECTED_OPERATION: v3.3.0' in health and 'EXPECTED_FINANCE: v3.2.9' in health and 'finance_workbench_core' in health,
    'health verifica Materiales V2.3.1':'materials-v23.js' in health and "const VERSION='2.3.1'" in health,
    'health verifica perímetro principal':'public-control.html' in health and 'public-operacion.html' in health and 'public-finanzas.html' in health,
    'health verifica perímetro auxiliar':'public-studio.html' in health and 'public-actas.html' in health and "grep -q 'data-v31-protected' public-studio.html" in health and "grep -q 'data-v31-protected' public-actas.html" in health,
    'auditoría ejecuta barrera release':'scripts/verificar_release_v31.py' in canonical,
    'regresión ejecuta barrera release':'scripts/verificar_release_v31.py' in functional,
    'portal acceso V3.1':'id="access-v31"' in access and 'assets/access-v31.js' in access,
    'acceso declara metadata V3.1.1':"const VERSION='3.1.1'" in access_js,
    'shell declara metadata V3.1.1':"const VERSION='3.1.1'" in shell_js,
    'destinos seguros incluyen auxiliares':"'studio.html':new Set([''])" in access_js and "'actas.html':new Set([''])" in access_js,
    'destino seguro incluye evidencia V3.3.0':"'#evidencia'" in access_js,
    'centro protegido':'data-v31-protected' in center and 'assets/internal-shell-v31.js' in center,
    'centro selector de tres destinos':all(token in center for token in ('Abrir Panel de control','Entrar a Operación','Entrar a Finanzas')),
    'centro conecta herramientas auxiliares':'href="studio.html"' in center and 'href="actas.html"' in center,
    'control protegido':'data-v31-protected' in control and 'assets/internal-shell-v31.js' in control,
    'control conecta operación y finanzas':'href="operacion.html"' in control and 'href="finanzas.html"' in control,
    'operación protegida':'data-v31-protected' in operation and 'assets/internal-shell-v31.js' in operation,
    'operación integra motores heredados':all(token in operation for token in ('id="control-v30"','id="daily-ops-v21"','id="production-v22"','id="materials-v23"','id="measurement-v24"','id="procurement-v25"')),
    'motor Materiales declara V2.3.1':"const VERSION='2.3.1'" in materials_js and 'saveVisibleStock' in materials_js,
    'motor Materiales preserva stock no visible':'{...current}' in materials_js and 'delete values[id]' in materials_js,
    'service worker sirve fresco Materiales':'./assets/materials-v23.js' in worker and "endsWith('/assets/materials-v23.js')" in worker,
    'mapa registra Materiales V2.3.1':'Motor Materiales / BOM' in version_map and '**2.3.1**' in version_map and 'pack de datos V2.3.0' in version_map,
    'operación monta evidencia V3.3.0':'id="operational-evidence-v330"' in operation and 'assets/operational-evidence-v330.js' in operation and "const VERSION='3.3.0'" in operation_v330,
    'finanzas protegidas':'data-v31-protected' in finance and 'assets/internal-shell-v31.js' in finance,
    'finanzas accesible desde navegación':'href="control.html"' in finance and 'href="operacion.html"' in finance,
    'finanzas monta workbench base':'id="finance-workbench-v31"' in finance and 'assets/finance-workbench-v31.js' in finance,
    'finanzas monta starter seguro':'assets/finance-starter-v31.js' in finance and 'Crear modelo desde cero' in starter_js and 'LOCAL_STARTER_V31' in starter_js,
    'finanzas alcanza profundidad 3.2.9':all(token in finance for token in ('assets/finance-depth-v32.js','assets/finance-ledger-v321.js','assets/finance-unit-economics-v322.js','assets/finance-cash-trends-v323.js','assets/finance-scenarios-v324.js','assets/finance-decisions-v325.js','assets/finance-procurement-v326.js','assets/finance-executive-v327.js','assets/finance-readiness-v328.js','assets/finance-demo-v329.js')) and "const VERSION='3.2.9'" in finance_v329,
    'finanzas no monta producción':'assets/production-v22.js' not in finance,
    'datos maestros protegido':'data-v31-protected' in studio and 'assets/internal-shell-v31.js' in studio,
    'actas protegidas':'data-v31-protected' in acts and 'assets/internal-shell-v31.js' in acts,
    'footer público prepara acceso':'ensureUserAccess' in host and "href='acceso.html'" in host,
    'login no contiene contraseña fija':'password="' not in access_js.lower() and 'service_role' not in access_js.lower(),
    'guard comparte sesión V3.1':'ee_v31_session' in shell_js and 'acceso.html' in shell_js,
    'workbench baseline/working separados':"SNAPSHOT_KEY='ee_v30_mfo_snapshot'" in finance_js and "WORKING_KEY='ee_v31_finance_working_model'" in finance_js,
    'workbench sin red':all(token not in finance_js for token in ('fetch(','XMLHttpRequest','axios')),
    'starter sin red y sin costo privado':all(token not in starter_js.lower() for token in ('fetch(','xmlhttprequest','axios','service_role','postgres://','private_key')) and 'directCost:0' in starter_js,
    'service worker publica acceso y auxiliares':'./acceso.html' in worker and './studio.html' in worker and './actas.html' in worker and './assets/access-v31.js' in worker,
    'service worker publica módulos actuales':'./assets/operational-evidence-v330.js' in worker and './assets/finance-demo-v329.js' in worker and './assets/internal-v31.css' in worker,
    'mapa de versiones vigente':'# Mapa de versiones activas' in version_map and 'Release integral' in version_map and '**3.3.0**' in version_map and '**3.2.9**' in version_map,
    'documentación arquitectura vigente':'# Arquitectura interna V3.1' in architecture and 'Working Model' in architecture and 'Operación V3.3.0' in architecture and 'Finanzas V3.2.9' in architecture,
}

for label,ok in checks.items():
    if not ok: errors.append(label)

for name,content in [('access',access_js),('shell',shell_js),('materials',materials_js),('operation-v330',operation_v330),('finance',finance_js),('starter',starter_js),('finance-v329',finance_v329)]:
    lower=content.lower()
    for forbidden in ('service_role','postgres://','private_key','supabase_service'):
        if forbidden in lower:
            errors.append(f'{name}: posible secreto {forbidden}')

print('EL ERRANTE V3.1.1 — COHERENCIA DE RELEASE, MÓDULOS Y PERÍMETRO')
print('='*70)
print(f'Controles: {len(checks)}')
print(f'Problemas: {len(errors)}')
if errors:
    for error in errors: print('-',error)
    sys.exit(1)
print('RESULTADO: PASS')
