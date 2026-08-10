#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]

def read(path):
    p=ROOT/path
    if not p.is_file():
        errors.append(f'Falta {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='ignore')

access=read('acceso.html')
access_js=read('assets/access-v31.js')
shell=read('assets/internal-shell-v31.js')
css=read('assets/internal-v31.css')
hub=read('centro-interno.html')
control=read('control.html')
ops=read('operacion.html')
finance=read('finanzas.html')
studio=read('studio.html')
acts=read('actas.html')
workbench=read('assets/finance-workbench-v31.js')
starter=read('assets/finance-starter-v31.js')
host=read('assets/host-mode.js')
worker=read('service-worker.js')
test=read('tests/e2e/internal-v30.spec.js')
continuity=read('tests/e2e/access-continuity-v311.spec.js')

checks={
 'portal de acceso V3.1':'id="access-v31"' in access and 'assets/access-v31.js' in access,
 'metadata de acceso V3.1.1':"const VERSION='3.1.1'" in access_js,
 'metadata de shell V3.1.1':"const VERSION='3.1.1'" in shell,
 'acceso no contiene credencial fija':all(token not in access_js.lower() for token in ('password="','service_role','supabase_service')),
 'contraseña derivada con PBKDF2':"name:'PBKDF2'" in access_js and "hash:'SHA-256'" in access_js and 'iterations:150000' in access_js,
 'sal aleatoria por cuenta':'crypto.getRandomValues' in access_js and 'salt:b64' in access_js,
 'sesión expira':'expiresAt' in access_js and 'SESSION_HOURS=8' in access_js,
 'destinos seguros incluyen auxiliares y evidencia':all(token in access_js for token in ("'studio.html':new Set([''])","'actas.html':new Set([''])","'#evidencia'")),
 'guard de páginas internas':'ee_v31_session' in shell and 'location.replace' in shell and 'acceso.html' in shell,
 'centro exige sesión':'data-v31-protected' in hub and 'assets/internal-shell-v31.js' in hub,
 'centro ofrece tres destinos':all(token in hub for token in ('Abrir Panel de control','Entrar a Operación','Entrar a Finanzas','href="control.html"','href="operacion.html"','href="finanzas.html"')),
 'centro enlaza herramientas auxiliares':'href="studio.html"' in hub and 'href="actas.html"' in hub,
 'control exige sesión':'data-v31-protected' in control and 'assets/internal-shell-v31.js' in control,
 'control conecta módulos':all(token in control for token in ('href="operacion.html"','href="finanzas.html"','href="centro-interno.html"','id="control-v30"')),
 'operación exige sesión':'data-v31-protected' in ops and 'assets/internal-shell-v31.js' in ops,
 'operación enlaza panel control':'href="control.html"' in ops,
 'operación consolida resumen':'id="control-v30"' in ops and 'assets/control-v30.js' in ops,
 'operación conserva pedidos':'id="daily-ops-v21"' in ops and 'assets/daily-ops-v21.js' in ops,
 'operación conserva producción':'id="production-v22"' in ops and 'assets/production-v22.js' in ops,
 'operación conserva materiales':'id="materials-v23"' in ops and 'assets/materials-v23.js' in ops,
 'operación conserva medición':'id="measurement-v24"' in ops and 'assets/measurement-v24.js' in ops,
 'operación conserva compras':'id="procurement-v25"' in ops and 'assets/procurement-v25.js' in ops,
 'operación conserva evidencia V3.3.0':'id="operational-evidence-v330"' in ops and 'assets/operational-evidence-v330.js' in ops,
 'operación no monta workbench financiero':'finance-workbench-v31.js' not in ops,
 'finanzas exige sesión':'data-v31-protected' in finance and 'assets/internal-shell-v31.js' in finance,
 'finanzas enlaza panel control':'href="control.html"' in finance and 'href="operacion.html"' in finance,
 'finanzas monta único workbench':'id="finance-workbench-v31"' in finance and 'assets/finance-workbench-v31.js' in finance,
 'finanzas incorpora arranque local':'assets/finance-starter-v31.js' in finance and 'Crear modelo desde cero' in starter,
 'finanzas no monta motores de ejecución':all(token not in finance for token in ('assets/production-v22.js','assets/materials-v23.js','assets/procurement-v25.js')),
 'datos maestros exige sesión':'data-v31-protected' in studio and 'assets/internal-shell-v31.js' in studio,
 'datos maestros permanece auxiliar':'data-page="studio"' in studio and 'id="studio-app"' in studio and 'href="actas.html"' in studio,
 'actas exige sesión':'data-v31-protected' in acts and 'assets/internal-shell-v31.js' in acts,
 'actas permanece auxiliar':'data-page="actas"' in acts and 'id="acts-app"' in acts and 'href="studio.html"' in acts,
 'baseline separado del working model':"SNAPSHOT_KEY='ee_v30_mfo_snapshot'" in workbench and "WORKING_KEY='ee_v31_finance_working_model'" in workbench,
 'baseline no se sobreescribe al editar':'write(SNAPSHOT_KEY' in workbench and 'write(WORKING_KEY' in workbench and 'baseline.planSales' in test,
 'starter sólo usa catálogo público':'window.EE_DATA?.products' in starter and 'directCost:0' in starter and "status:'PENDIENTE'" in starter,
 'starter crea 24 meses':'Array.from({length:24}' in starter and 'planSales' in starter and 'cashFlow' in starter,
 'starter no contiene red ni secreto':all(token not in starter.lower() for token in ('fetch(','xmlhttprequest','axios','service_role','postgres://','private_key')),
 'plan 24M editable':'data-plan-qty' in workbench and 'Plan de ventas' in workbench and 'yearMonths' in workbench,
 'precios y costos editables':'data-product-price' in workbench and 'data-product-cost' in workbench,
 'caja plan editable':'data-cash' in workbench and 'collectionRate' in workbench and 'endingCash' in workbench,
 'movimientos reales separados':'MOVES_KEY' in workbench and 'v31-move-form' in workbench,
 'COGS real usa snapshot histórico':'unit_cost_snapshot' in workbench and 'unitCostSnapshot' in workbench,
 'COGS real no usa costo actual como fallback':'productMap(data)' in workbench and 'function actual(month)' in workbench and 'byId' not in workbench,
 'dashboard contiene visualización SVG':'lineChart' in workbench and 'barChart' in workbench and 'v31-chart' in workbench,
 'dashboard compara plan y real':'Ventas · Plan vs. real' in workbench,
 'escenarios editables':'data-scenario' in workbench and 'Factor volumen' in workbench and 'Factor costo' in workbench,
 'decisiones editables':'data-decision' in workbench and 'Decisiones del modelo' in workbench,
 'supuestos editables y auditables':'data-assumption' in workbench and 'HISTORY_KEY' in workbench,
 'workbench no usa red':all(token not in workbench for token in ('fetch(','XMLHttpRequest','axios','service_role')),
 'host reconoce finanzas interna':"'finanzas'" in host and "'finanzas.html'" in host,
 'host crea acceso de usuarios':'ensureUserAccess' in host and "href='acceso.html'" in host,
 'service worker incluye V3.1':all(token in worker for token in ('./acceso.html','./studio.html','./actas.html','./assets/access-v31.js','./assets/internal-shell-v31.js','./assets/finance-workbench-v31.js','./assets/finance-starter-v31.js','./assets/internal-v31.css')),
 'service worker refresca JS V3.1':all(token in worker for token in ("endsWith('/assets/access-v31.js')","endsWith('/assets/internal-shell-v31.js')","endsWith('/assets/finance-workbench-v31.js')","endsWith('/assets/finance-starter-v31.js')")),
 'estilos selector tres módulos':'.v31-module-card.control' in css and 'repeat(3,minmax(0,1fr))' in css,
 'estilos responsive V3.1':'.v31-access-card' in css and '.v31-module-grid' in css and '.v31-kpis' in css and '@media(max-width:760px)' in css,
 'regresión cubre login':'primer acceso crea credenciales locales' in test,
 'regresión cubre panel control':'Abrir Panel de control' in test and 'Panel de control exige sesión' in test,
 'regresión cubre acceso finanzas':'Entrar a Finanzas' in test and 'finanzas.html' in test,
 'regresión cubre arranque desde cero':'Crear modelo desde cero' in test and 'LOCAL_STARTER_V31' in test,
 'regresión cubre aislamiento baseline':'sin modificar el baseline' in test,
 'regresión cubre gráficas':"locator('.v31-chart')" in test,
 'regresión cubre edición':'Plan de ventas modificado' in test and 'data-product-price' in test and 'data-scenario' in test,
 'regresión cubre móvil':'no desbordan en móvil' in test,
 'continuidad cubre datos maestros':'Datos maestros exige sesión' in continuity and "'/studio.html'" in continuity,
 'continuidad cubre actas':'Actas exige sesión' in continuity and "'/actas.html'" in continuity,
 'continuidad cubre evidencia V3.3.0':'#evidencia' in continuity and 'data-operational-evidence-version' in continuity,
 'continuidad conserva sesión previa':'sesión V3.1.0 vigente sigue siendo compatible' in continuity and "data-internal-version','3.1.1'" in continuity,
}
for label,ok in checks.items():
    if not ok: errors.append(label)

for name,content in [('acceso',access_js),('shell',shell),('finanzas',workbench),('starter',starter)]:
    lowered=content.lower()
    for forbidden in ('service_role','postgres://','supabase_service','private_key'):
        if forbidden in lowered: errors.append(f'{name}: posible secreto {forbidden}')

print('EL ERRANTE V3.1.1 — PERÍMETRO INTERNO / CONTROL / OPERACIÓN / FINANZAS')
print('='*76)
print(f'Controles: {len(checks)}')
print(f'Problemas: {len(errors)}')
if errors:
    for error in errors: print('-',error)
    sys.exit(1)
print('RESULTADO: PASS')
