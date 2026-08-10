#!/usr/bin/env python3
"""Barrera de integridad para el puente prospectivo Datos maestros V1.3."""
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
issues=[]

def read(path):
    file=ROOT/path
    if not file.is_file():
        issues.append(f'Falta {path}')
        return ''
    return file.read_text(encoding='utf-8',errors='ignore')

def require(condition,message):
    if not condition:
        issues.append(message)

def ordered(text,*markers):
    positions=[text.find(marker) for marker in markers]
    return all(pos>=0 for pos in positions) and positions==sorted(positions)

def aggregate_compatible(text,prefix):
    return any(f'{prefix}v{version}' in text for version in ('1.3.0','1.4.0'))

bridge=read('assets/master-cost-prospective-v13.js')
materials=read('assets/materials-v23.js')
finance=read('assets/finance-unit-economics-v322.js')
operation=read('operacion.html')
finance_html=read('finanzas.html')
admin=read('admin.html')
test=read('tests/e2e/master-cost-bridge-v13.spec.js')
worker=read('service-worker.js')
deploy=read('deploy-version.txt')
pages=read('.github/workflows/pages.yml')
audit=read('.github/workflows/canonical-audit.yml')
health=read('.github/workflows/public-health.yml')

require("const VERSION='1.3.0'" in bridge,'Puente no declara V1.3.0')
require("MATERIALIZATION_KEY='ee_v12_cost_materialization_events'" in bridge,'Puente no está anclado al ledger V1.2')
for marker in ('standardMaterial','resolveMaterial','productCost','originLabel','signature','snapshot','integrityUnchanged'):
    require(marker in bridge,f'Falta contrato V1.3: {marker}')
for marker in ('CANONICAL_BASELINE','MATERIALIZED_STANDARD','SIMULATION'):
    require(marker in bridge,f'Falta origen de costo V1.3: {marker}')
require('localStorage.setItem' not in bridge,'El puente V1.3 debe ser de solo lectura')
require('fetch(' not in bridge and 'XMLHttpRequest' not in bridge and 'axios' not in bridge,'El puente V1.3 no debe tener red propia')
require("ee:v13:standard-changed" in bridge and "ee:v12:standard-materialized" in bridge,'Falta propagación de cambios de estándar')

load_chain=('assets/materials-data-v23.js','assets/master-cost-materialization-v12.js?v=1.2.0','assets/master-cost-prospective-v13.js?v=1.3.0')
for name,html,consumer in (
    ('Operación',operation,'assets/materials-v23.js'),
    ('Finanzas',finance_html,'assets/finance-unit-economics-v322.js'),
    ('Administración heredada',admin,'assets/materials-v23.js'),
):
    require(ordered(html,*load_chain,consumer),f'{name} no carga materials → V1.2 → V1.3 antes del consumidor')

require('estimatedCost+=product.cost*amount' not in materials,'Operación todavía calcula plan con product.cost estático')
require('standardProductCost(product)*amount' in materials,'Operación no usa costo estándar efectivo en el plan')
require('bridge()?.standardMaterial?.(base)' in materials,'Materiales no resuelve estándar efectivo por material')
require("ee:v13:standard-changed" in materials,'Operación no reacciona a una nueva revisión estándar')
require("dataset.masterCostBridge='1.3.0'" in materials,'Operación no expone versión del puente')
require('Costo estándar prospectivo' in materials,'Operación no distingue costo prospectivo de histórico')

require('function standardMaterial(material)' in finance,'Finanzas no resuelve estándar efectivo')
require("costOrigin:'SIMULATION'" in finance,'Finanzas no conserva simulación como capa superior separada')
require('const standard=n(base?.standardCost??base?.cost)' in finance,'Guardar simulación no compara contra el estándar efectivo')
require("bridge()?.signature?.()" in finance,'Finanzas no invalida su cálculo cuando cambia el estándar')
require("ee:v13:standard-changed" in finance,'Finanzas no reacciona a una nueva revisión estándar')
require('a los valores de materiales V2.3' not in finance,'Reset financiero todavía vuelve al baseline V2.3')
require('estándar efectivo vigente de Datos maestros' in finance,'Reset financiero no declara retorno al estándar efectivo')
require('Baseline canónico → estándar materializado → simulación' in finance,'Finanzas no documenta precedencia V1.3')
require("dataset.masterCostBridge='1.3.0'" in finance,'Finanzas no expone versión del puente')

for marker in (
    'Operación usa el estándar materializado sin reescribir pedido, stock, compra ni baseline',
    'Finanzas respeta baseline → estándar materializado → simulación y al restablecer vuelve al estándar',
    'el puente V1.3 es de solo lectura y calcular no altera hechos ni fuentes',
    'sin revisiones materializadas conserva exactamente el baseline',
    'no genera desbordamiento horizontal en Operación móvil',
):
    require(marker in test,f'Falta regresión V1.3: {marker}')

require('./assets/master-cost-prospective-v13.js' in worker,'Service worker no precachea V1.3')
require("endsWith('/assets/master-cost-prospective-v13.js')" in worker,'Service worker no sirve fresco V1.3')
require(aggregate_compatible(deploy,'master_data_module=') and 'master_cost_bridge=v1.3.0' in deploy,'Metadata no preserva V1.3 dentro del agregado vigente')
require(aggregate_compatible(pages,'master_data_module=') and 'master_cost_bridge=v1.3.0' in pages,'Pages no preserva V1.3 dentro del agregado vigente')
require('verificar_master_cost_bridge_v13.py' in pages and 'verificar_master_cost_bridge_v13.py' in audit,'CI no ejecuta barrera V1.3')
require(aggregate_compatible(health,'EXPECTED_MASTER_DATA: ') and 'EXPECTED_COST_BRIDGE: v1.3.0' in health,'Health-check no preserva V1.3 dentro del agregado vigente')

for forbidden in ('service_role','postgres://','private_key','supabase_service'):
    require(forbidden not in bridge.lower(),f'Posible secreto en V1.3: {forbidden}')

print('EL ERRANTE — DATOS MAESTROS V1.3 · PUENTE PROSPECTIVO')
print('='*66)
print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues:
        print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS')
print('precedencia=baseline>materialized_standard>simulation')
print('operation=prospective_effective_bom')
print('finance=effective_standard_plus_simulation')
print('historical_facts=no_mutation')
print('bridge=read_only')

v14=ROOT/'scripts/verificar_historical_cost_snapshots_v14.py'
if not v14.is_file():
    print('Falta scripts/verificar_historical_cost_snapshots_v14.py')
    sys.exit(1)
result=subprocess.run([sys.executable,str(v14)],cwd=ROOT)
if result.returncode:
    sys.exit(result.returncode)
