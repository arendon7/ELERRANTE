#!/usr/bin/env python3
"""Valida los invariantes de separación introducidos en V3.0.

La UI puede evolucionar (V3.1+), pero estas propiedades no deben degradarse:
Operación y Finanzas siguen siendo contextos separados; el MFO es privado;
plan/escenario no reescribe hechos; COGS real exige costo histórico; y una
necesidad teórica no se convierte automáticamente en compra o inventario.
"""
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]

def text(path):
    p=ROOT/path
    if not p.is_file():
        errors.append(f'Falta {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='ignore')

hub=text('centro-interno.html')
control=text('control.html')
ops=text('operacion.html')
finance=text('finanzas.html')
ctrl_js=text('assets/control-v30.js')
mfo_js=text('assets/mfo-v30.js')
workbench=text('assets/finance-workbench-v31.js')
daily_js=text('assets/daily-ops-v21.js')
production_js=text('assets/production-v22.js')
css=text('assets/internal-v30.css')+text('assets/internal-v31.css')
test=text('tests/e2e/internal-v30.spec.js')
mfo_doc=text('documentacion/MFO_SNAPSHOT_V30.md')
mfo_exporter=text('scripts/exportar_mfo_v30.py')
gitignore=text('.gitignore')
worker=text('service-worker.js')
pages_workflow=text('.github/workflows/pages.yml')
health_workflow=text('.github/workflows/public-health.yml')

canonical_mfo_sheets=(
    '00_INICIO','05_PRODUCTOS_SUPUESTOS','01_PLAN_VENTAS','02_PRODUCCION_COMPRAS',
    '03_RESULTADOS_CAJA','04_DASHBOARD','06_AUDITORIA','07_REAL_VS_PLAN',
    '08_DECISIONES_ESCENARIOS'
)
export_anchors=(
    'MFO_V3_3_DECISIONES_ESCENARIOS',
    'EL ERRANTE — MFO v3 · Planeación y Caja',
    'Flujo de caja y disponibilidad',
    'Hallazgos y decisiones pendientes',
    'Escenarios de sensibilidad — año 1',
    'reconciliation',
)

checks={
    'hub separa operación y finanzas':'href="operacion.html"' in hub and 'href="finanzas.html"' in hub,
    'control V3.0 sigue disponible':'id="control-v30"' in control and 'assets/control-v30.js' in control,
    'control no carga finanzas':'assets/finance-v27.js' not in control and 'finance-workbench-v31.js' not in control,
    'operación incorpora resumen':'id="control-v30"' in ops and 'assets/control-v30.js' in ops,
    'operación conserva agenda':'id="daily-ops-v21"' in ops and 'assets/daily-ops-v21.js' in ops,
    'operación autoriza agenda local':'data-v21-local-surface="true"' in ops and 'v21LocalSurface' in daily_js,
    'operación conserva producción':'id="production-v22"' in ops and 'assets/production-v22.js' in ops,
    'operación autoriza producción local':'data-v22-local-surface="true"' in ops and 'v22LocalSurface' in production_js,
    'modo remoto heredado sigue ligado a sesión':'Administración conectada' in daily_js and 'Administración conectada' in production_js,
    'operación conserva materiales':'id="materials-v23"' in ops and 'assets/materials-v23.js' in ops,
    'operación conserva abastecimiento':'id="procurement-v25"' in ops and 'assets/procurement-v25.js' in ops,
    'operación no carga finanzas':'assets/finance-v27.js' not in ops and 'finance-workbench-v31.js' not in ops,
    'finanzas no carga producción':all(token not in finance for token in ('assets/production-v22.js','assets/materials-v23.js','assets/procurement-v25.js')),
    'finanzas monta workbench separado':'id="finance-workbench-v31"' in finance and 'assets/finance-workbench-v31.js' in finance,
    'baseline MFO sigue separado':"SNAPSHOT_KEY='ee_v30_mfo_snapshot'" in workbench and "WORKING_KEY='ee_v31_finance_working_model'" in workbench,
    'MFO legado se conserva solo local':'ee_v30_mfo_snapshot' in mfo_js and 'localStorage.setItem(STORAGE_KEY' in mfo_js,
    'MFO legado no hace red':'fetch(' not in mfo_js and 'XMLHttpRequest' not in mfo_js,
    'workbench financiero no hace red':all(token not in workbench for token in ('fetch(','XMLHttpRequest','axios')),
    'MFO no sobrescribe operación':all(key not in mfo_js for key in ('ee_v23_material_stock','ee_v22_fulfillment','ee_v25_purchase_orders')),
    'working model no escribe inventario/producción':all(key not in workbench for key in ('ee_v23_material_stock','ee_v22_fulfillment','ee_v25_purchase_orders')),
    'COGS real exige snapshot histórico':'unit_cost_snapshot' in workbench and 'unitCostSnapshot' in workbench and 'missing' in workbench,
    'COGS real no usa catálogo actual como fallback':'function actual(month)' in workbench and 'byId' not in workbench,
    'MFO conserva estados de calidad':all(state in workbench for state in ('CONFIRMADO','ESTIMADO','INFERIDO','CONTRADICTORIO','PENDIENTE')),
    'MFO incorpora decisiones y escenarios':'Decisiones del modelo' in workbench and 'Escenarios' in workbench,
    'control conserva desconocido != cero':'available===null' in ctrl_js and 'Sin conteo' in ctrl_js,
    'estilos internos presentes':'.v30-shell' in css and '.v31-module-grid' in css and '@media' in css,
    'regresión protege plan vs real':'sin modificar el baseline' in test and 'stored.baseline.planSales' in test,
    'regresión protege cadena operativa':'Operación reúne resumen, pedidos' in test and 'Mesa de pedidos y continuidad local' in test,
    'esquema MFO documentado':'Plan / escenario' in mfo_doc and 'unit_cost_snapshot' in mfo_doc and 'no almacena el workbook ni sus cifras' in mfo_doc,
    'documentación reconoce nueve hojas':all(name in mfo_doc for name in canonical_mfo_sheets),
    'exportador MFO presente':'exportar_mfo_v30.py' in mfo_doc and 'perfil exacto' in mfo_exporter,
    'exportador reconoce perfil real':all(name in mfo_exporter for name in canonical_mfo_sheets) and all(anchor in mfo_exporter for anchor in export_anchors),
    'exportador reconcilia totales':'y1Sales' in mfo_exporter and 'y2Sales' in mfo_exporter and 'endingCash' in mfo_exporter and 'El snapshot no reconcilia' in mfo_exporter,
    'exportador no necesita mapeo provisional':'--mapping' not in mfo_exporter and 'MFO_MAPEO_V30' not in mfo_doc,
    'datos financieros privados ignorados':'private-data/' in gitignore,
    'documentación mantiene datos privados':'private-data/mfo_snapshot_v30.json' in mfo_doc and '--inspect' in mfo_doc,
    'service worker conserva base V3.0':'./finanzas.html' in worker and './assets/control-v30.js' in worker and './assets/mfo-v30.js' in worker and './assets/internal-v30.css' in worker,
    'service worker incorpora V3.1':'./assets/finance-workbench-v31.js' in worker and './assets/internal-v31.css' in worker,
    'Pages ejecuta invariantes V3.0':'scripts/verificar_v30_separacion.py' in pages_workflow,
    'Pages ejecuta barrera V3.1':'scripts/verificar_v31_interno.py' in pages_workflow,
    'health público conserva verificación financiera':'public-finanzas.html' in health_workflow,
}
for label,ok in checks.items():
    if not ok: errors.append(label)

if mfo_exporter:
    try:
        compile(mfo_exporter, 'scripts/exportar_mfo_v30.py', 'exec')
    except SyntaxError as exc:
        errors.append(f'exportador MFO: sintaxis inválida: {exc}')
    lowered_exporter=mfo_exporter.lower()
    for forbidden in ('requests.', 'urllib.request', 'http://', 'https://', 'subprocess'):
        if forbidden in lowered_exporter:
            errors.append(f'exportador MFO: transporte o ejecución externa no permitida: {forbidden}')

for path,content in [('control',control+ctrl_js),('operacion',ops),('finanzas',finance+mfo_js+workbench)]:
    lowered=content.lower()
    for forbidden in ('service_role','postgres://','supabase_service'):
        if forbidden in lowered: errors.append(f'{path}: posible secreto {forbidden}')

print('EL ERRANTE — INVARIANTES DE SEPARACIÓN V3.0 → V3.1')
print('='*57)
print(f'Controles: {len(checks)}')
print(f'Problemas: {len(errors)}')
if errors:
    for error in errors: print('-',error)
    sys.exit(1)
print('RESULTADO: PASS')
