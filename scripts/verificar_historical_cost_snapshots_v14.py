#!/usr/bin/env python3
"""Barrera de integridad para snapshots históricos de costo Datos maestros V1.4."""
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
issues=[]
def read(path):
    file=ROOT/path
    if not file.is_file(): issues.append(f'Falta {path}'); return ''
    return file.read_text(encoding='utf-8',errors='ignore')
def require(condition,message):
    if not condition: issues.append(message)
def ordered(text,*markers):
    positions=[text.find(marker) for marker in markers]
    return all(pos>=0 for pos in positions) and positions==sorted(positions)

core=read('assets/historical-cost-snapshots-v14.js')
view=read('assets/finance-historical-cost-v14.js')
css=read('assets/historical-cost-v14.css')
operation=read('operacion.html')
finance=read('finanzas.html')
test=read('tests/e2e/historical-cost-snapshots-v14.spec.js')
worker=read('service-worker.js')
deploy=read('deploy-version.txt')
pages=read('.github/workflows/pages.yml')
audit=read('.github/workflows/canonical-audit.yml')
health=read('.github/workflows/public-health.yml')

require("const VERSION='1.4.0'" in core,'Core V1.4 no declara versión 1.4.0')
for marker in ("EVENT_KEY='ee_v14_cost_snapshot_events'","STATE_KEY='ee_v14_cost_snapshot_state'","MATERIALIZATION_KEY='ee_v12_cost_materialization_events'"):
    require(marker in core,f'Falta clave V1.4: {marker}')
for marker in ('materialAt','signatureAt','productCostAt','productSnapshot','captureOrder','capturePurchase','captureMovement','historicalOrder','historicalPurchase','historicalMargin','scanNewFacts'):
    require(marker in core,f'Falta contrato V1.4: {marker}')
for marker in ('CANONICAL_BASELINE','MATERIALIZED_STANDARD','LEGACY_EMBEDDED','OBSERVED_AT_MOVEMENT','UNKNOWN','OBSERVED_ONLY_STANDARD_UNKNOWN'):
    require(marker in core,f'Falta semántica de origen histórico: {marker}')
require("event.type==='MATERIALIZED'" in core,'V1.4 no reconstruye materializaciones del ledger V1.2')
require("event._time<=cutoff" in core or 'event._time<=cutoff' in core,'V1.4 no filtra revisiones por fecha efectiva')
require('LEGACY_ORDER_COST' in core and "unitCost??item.unit_cost_snapshot" in core,'Migración legado no conserva costo embebido')
require("unitCostSnapshot:null" in core and "costOrigin:'UNKNOWN'" in core,'V1.4 no representa explícitamente costo desconocido')
require('fetch(' not in core and 'XMLHttpRequest' not in core and 'axios' not in core,'V1.4 no debe tener red propia')

chain=('assets/materials-data-v23.js','assets/master-cost-materialization-v12.js?v=1.2.0','assets/master-cost-prospective-v13.js?v=1.3.0','assets/historical-cost-snapshots-v14.js?v=1.4.0')
require(ordered(operation,*chain,'assets/daily-ops-v21.js'),'Operación no carga V1.2 → V1.3 → V1.4 antes de pedidos')
require(ordered(operation,*chain,'assets/procurement-v25.js'),'Operación no carga V1.4 antes de compras')
require(ordered(finance,*chain,'assets/finance-workbench-v31.js'),'Finanzas no carga V1.4 antes del workbench')
require('assets/historical-cost-v14.css' in finance,'Finanzas no carga estilos V1.4')
require('assets/finance-historical-cost-v14.js?v=1.4.0' in finance,'Finanzas no carga la vista histórica V1.4')
require("dataset.historicalCostSnapshots=VERSION" in core,'V1.4 no expone marcador runtime')
require("PANEL_ID='finance-historical-cost-v14'" in view and 'Incompleto' in view,'Vista financiera no distingue cobertura incompleta')
require('estándar vigente de hoy' in view,'Vista financiera no declara no-retroactividad')

for marker in (
  'un pedido aprobado a las 06:00 congela r1 aunque r2 ya exista al capturar',
  'cambiar el estándar después no reescribe COGS ni margen histórico',
  'primera activación no backfillea hechos existentes con el estándar de hoy',
  'un pedido legado conserva el costo embebido que ya tenía, sin crear snapshot V1.4',
  'una recepción nueva conserva costo observado y estándar as-of, no el estándar posterior',
  'leer y reconstruir histórico no muta pedidos, compras, ledger V1.2 ni canon',
  'Finanzas muestra incompleto y no sustituye un costo histórico faltante',
  'no genera desbordamiento horizontal en Finanzas móvil',
): require(marker in test,f'Falta regresión V1.4: {marker}')

require('./assets/historical-cost-snapshots-v14.js' in worker,'Service worker no precachea core V1.4')
require('./assets/finance-historical-cost-v14.js' in worker,'Service worker no precachea vista V1.4')
require('./assets/historical-cost-v14.css' in worker,'Service worker no precachea CSS V1.4')
require("endsWith('/assets/historical-cost-snapshots-v14.js')" in worker,'Service worker no sirve fresco core V1.4')
require('master_data_module=v1.4.0' in deploy and 'historical_cost_snapshots=v1.4.0' in deploy,'Metadata no declara V1.4')
require('master_data_module=v1.4.0' in pages and 'historical_cost_snapshots=v1.4.0' in pages,'Pages no certifica V1.4')
require('verificar_historical_cost_snapshots_v14.py' in pages and 'verificar_historical_cost_snapshots_v14.py' in audit,'CI no ejecuta barrera V1.4')
require('EXPECTED_MASTER_DATA: v1.4.0' in health and 'EXPECTED_HISTORICAL_COST: v1.4.0' in health,'Health-check no espera V1.4')
for forbidden in ('service_role','postgres://','private_key','supabase_service'):
    require(forbidden not in core.lower(),f'Posible secreto en V1.4: {forbidden}')

print('EL ERRANTE — DATOS MAESTROS V1.4 · SNAPSHOTS HISTÓRICOS')
print('='*68);print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues: print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS')
print('historical_cost=as_of_materialization_ledger')
print('legacy_backfill=forbidden')
print('unknown_cost=explicit')
print('historical_margin=no_current_standard_substitution')
