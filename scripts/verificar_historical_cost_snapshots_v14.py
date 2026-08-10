#!/usr/bin/env python3
"""Barrera de integridad para snapshots históricos de costo Datos maestros V1.4."""
from pathlib import Path
import subprocess
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
core=read('assets/historical-cost-snapshots-v14.js'); view=read('assets/finance-historical-cost-v14.js'); css=read('assets/historical-cost-v14.css'); operation=read('operacion.html'); finance=read('finanzas.html'); test=read('tests/e2e/historical-cost-snapshots-v14.spec.js'); bridge_gate=read('scripts/verificar_master_cost_bridge_v13.py'); workflow=read('.github/workflows/historical-cost-v14.yml'); marker=read('historical-cost-version.txt')
require("const VERSION='1.4.0'" in core,'Core V1.4 no declara versión 1.4.0')
for token in ("EVENT_KEY='ee_v14_cost_snapshot_events'","STATE_KEY='ee_v14_cost_snapshot_state'","MATERIALIZATION_KEY='ee_v12_cost_materialization_events'"): require(token in core,f'Falta clave V1.4: {token}')
for token in ('materialAt','signatureAt','productCostAt','productSnapshot','captureOrder','capturePurchase','captureMovement','historicalOrder','historicalPurchase','historicalMargin','scanNewFacts'): require(token in core,f'Falta contrato V1.4: {token}')
for token in ('CANONICAL_BASELINE','MATERIALIZED_STANDARD','LEGACY_EMBEDDED','OBSERVED_AT_MOVEMENT','UNKNOWN','OBSERVED_ONLY_STANDARD_UNKNOWN'): require(token in core,f'Falta semántica de origen histórico: {token}')
require("row?.type==='MATERIALIZED'" in core,'V1.4 no reconstruye materializaciones del ledger V1.2'); require('event._time<=cutoff' in core,'V1.4 no filtra revisiones por fecha efectiva'); require('LEGACY_ORDER_COST' in core and "unitCost??item.unit_cost_snapshot" in core,'Migración legado no conserva costo embebido'); require("unitCostSnapshot:null" in core and "costOrigin:'UNKNOWN'" in core,'V1.4 no representa explícitamente costo desconocido'); require('fetch(' not in core and 'XMLHttpRequest' not in core and 'axios' not in core,'V1.4 no debe tener red propia'); require('localStorage.setItem(KEYS.orders' not in core and 'localStorage.setItem(KEYS.purchases' not in core,'V1.4 no puede reescribir hechos fuente')
chain=('assets/materials-data-v23.js','assets/master-cost-materialization-v12.js?v=1.2.0','assets/master-cost-prospective-v13.js?v=1.3.0','assets/historical-cost-snapshots-v14.js?v=1.4.0')
require(ordered(operation,*chain,'assets/daily-ops-v21.js'),'Operación no carga V1.2 → V1.3 → V1.4 antes de pedidos'); require(ordered(operation,*chain,'assets/procurement-v25.js'),'Operación no carga V1.4 antes de compras'); require(ordered(finance,*chain,'assets/finance-workbench-v31.js'),'Finanzas no carga V1.4 antes del workbench'); require('assets/historical-cost-v14.css' in finance,'Finanzas no carga estilos V1.4'); require('assets/finance-historical-cost-v14.js?v=1.4.0' in finance,'Finanzas no carga la vista histórica V1.4'); require("dataset.historicalCostSnapshots=VERSION" in core,'V1.4 no expone marcador runtime'); require("PANEL_ID='finance-historical-cost-v14'" in view and 'Incompleto' in view,'Vista financiera no distingue cobertura incompleta'); require('estándar vigente de hoy' in view,'Vista financiera no declara no-retroactividad'); require(len(css)>1000 and '@media(max-width:640px)' in css,'Capa responsive V1.4 incompleta')
for token in ('un pedido aprobado a las 06:00 congela r1 aunque r2 ya exista al capturar','cambiar el estándar después no reescribe COGS ni margen histórico','primera activación no backfillea hechos existentes con el estándar de hoy','un pedido legado conserva el costo embebido que ya tenía, sin crear snapshot V1.4','una recepción nueva conserva costo observado y estándar as-of, no el estándar posterior','leer y reconstruir histórico no muta pedidos, compras, ledger V1.2 ni canon','Finanzas muestra incompleto y no sustituye un costo histórico faltante','no genera desbordamiento horizontal en Finanzas móvil'): require(token in test,f'Falta regresión V1.4: {token}')
require('verificar_historical_cost_snapshots_v14.py' in bridge_gate,'La barrera V1.3 no encadena V1.4 para audit/Pages existentes')
for token in ('Certificar costo histórico V1.4','historical-cost-version.txt','EXPECTED_SHA','historical-cost-snapshots-v14.js','finance-historical-cost-v14.js','operacion.html','finanzas.html'): require(token in workflow,f'Workflow V1.4 incompleto: {token}')
require('historical_cost_snapshots=v1.4.0' in marker,'Marcador público no declara V1.4'); require('legacy_backfill=forbidden' in marker and 'unknown_cost=explicit' in marker,'Marcador público no declara reglas de migración')
for forbidden in ('service_role','postgres://','private_key','supabase_service'): require(forbidden not in core.lower(),f'Posible secreto en V1.4: {forbidden}')
print('EL ERRANTE — DATOS MAESTROS V1.4 · SNAPSHOTS HISTÓRICOS'); print('='*68);print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues: print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS'); print('historical_cost=as_of_materialization_ledger'); print('legacy_backfill=forbidden'); print('unknown_cost=explicit'); print('historical_margin=no_current_standard_substitution'); print('certification=composable_plus_public_health')
v15=ROOT/'scripts/verificar_inventory_valuation_v15.py'
if not v15.is_file(): print('Falta scripts/verificar_inventory_valuation_v15.py'); sys.exit(1)
result=subprocess.run([sys.executable,str(v15)],cwd=ROOT)
if result.returncode: sys.exit(result.returncode)
