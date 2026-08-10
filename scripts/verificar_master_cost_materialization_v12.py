#!/usr/bin/env python3
"""Barrera de integridad para materialización controlada de costos Datos maestros V1.2."""
from pathlib import Path
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

def aggregate_compatible(text,prefix):
    return any(f'{prefix}v{version}' in text for version in ('1.2.0','1.3.0'))

studio=read('studio.html')
centro=read('centro-interno.html')
module=read('assets/master-cost-materialization-v12.js')
styles=read('assets/master-cost-materialization-v12.css')
test=read('tests/e2e/master-cost-materialization-v12.spec.js')
worker=read('service-worker.js')
deploy=read('deploy-version.txt')
pages=read('.github/workflows/pages.yml')
health=read('.github/workflows/public-health.yml')

for marker in ('id="master-cost-materialization-v12"','assets/master-cost-materialization-v12.js?v=1.2.0','assets/master-cost-materialization-v12.css?v=1.2.0'):
    require(marker in studio,f'Studio no integra {marker}')
for marker in ('Elige dónde quieres trabajar.','Abrir Panel de control','Entrar a Operación','Entrar a Finanzas'):
    require(marker in centro,f'V1.2 no puede degradar navegación interna: falta {marker}')
require("const VERSION='1.2.0'" in module,'Motor de materialización no declara V1.2.0')
require("EVENTS_KEY='ee_v12_cost_materialization_events'" in module,'Falta ledger separado V1.2')
require("PROPOSALS_KEY='ee_v11_cost_proposal_events'" in module,'Falta anclaje explícito al ledger de propuestas')
require("PURCHASES_KEY='ee_v24_material_purchases'" in module,'Falta protección explícita de compras observadas')
for marker in ('materializeProposal','currentStandard','effectiveStandardCost','effectiveMaterial','effectiveProductCost','materializationForProposal','integrityUnchanged','isStale'):
    require(marker in module,f'Falta contrato V1.2: {marker}')
for marker in ("type:'MATERIALIZED'",'fromRevision','toRevision','fromCost','toCost','approvalEventId','proposalRationale','evidence:{...proposal.evidence}'):
    require(marker in module,f'Ledger V1.2 incompleto: {marker}')
require("proposal.lastEvent?.type!=='APPROVED'" in module,'Sólo una aprobación explícita debe poder materializarse')
require('Propuesta obsoleta: el estándar cambió desde que fue creada' in module,'Falta guard contra aprobación obsoleta')
require('La propuesta ya fue materializada' in module,'Falta guard contra doble materialización')
require('reason.length<8' in module,'Materializar debe exigir razón explícita')
require('toRevision' in module and 'Number(a.toRevision)' in module,'La reconstrucción del estándar debe ordenar por revisión materializada')
require('writeEvents=events=>localStorage.setItem(EVENTS_KEY' in module,'V1.2 debe escribir únicamente su ledger')
require('localStorage.setItem(PURCHASES_KEY' not in module,'V1.2 no puede escribir compras')
require('localStorage.setItem(PROPOSALS_KEY' not in module,'V1.2 no puede reescribir decisiones V1.1')
require('DATA.materials=' not in module and '.cost=' not in module,'V1.2 no puede mutar fuente canónica')
require('fetch(' not in module and 'XMLHttpRequest' not in module and 'axios' not in module,'V1.2 debe operar localmente sin red propia')
require(len(styles)>2000 and '@media(max-width:850px)' in styles,'Capa responsive V1.2 incompleta')
for marker in ('materializa una aprobación como nueva revisión sin mutar fuente ni hechos','bloquea doble materialización y aprobación obsoleta','resolver recalcula costos prospectivos','una propuesta posterior captura el estándar efectivo materializado','UI conserva aprobación pendiente tras recargar','no genera desbordamiento horizontal en móvil'):
    require(marker in test,f'Falta regresión V1.2: {marker}')
require('./assets/master-cost-materialization-v12.js' in worker and './assets/master-cost-materialization-v12.css' in worker,'Service worker no precachea V1.2')
require("endsWith('/assets/master-cost-materialization-v12.js')" in worker and "endsWith('/assets/master-cost-materialization-v12.css')" in worker,'Service worker no sirve fresco V1.2')
require(aggregate_compatible(deploy,'master_data_module=') and 'master_cost_materialization=v1.2.0' in deploy,'Metadata no declara V1.2 dentro de un agregado compatible')
require(aggregate_compatible(pages,'master_data_module=') and 'master_cost_materialization=v1.2.0' in pages,'Pages no certifica V1.2 dentro de un agregado compatible')
require(aggregate_compatible(health,'EXPECTED_MASTER_DATA: ') and 'EXPECTED_COST_MATERIALIZATION: v1.2.0' in health,'Health-check no preserva V1.2 dentro del agregado vigente')
require("grep -q 'Entrar a Finanzas' public-centro-interno.html" in health,'Health-check público debe conservar acceso a Finanzas')
for forbidden in ('service_role','postgres://','private_key','supabase_service'):
    require(forbidden not in module.lower(),f'Posible secreto en V1.2: {forbidden}')

print('EL ERRANTE — DATOS MAESTROS V1.2 · MATERIALIZACIÓN CONTROLADA')
print('='*68)
print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues:
        print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS')
print('ledger=append_only_local')
print('baseline=immutable')
print('approval=required')
print('stale_guard=enabled')
print('navigation_guard=preserved')
print('compatibilidad_agregado=v1.2_o_superior_certificado')
print('effective_standard=versioned_overlay')