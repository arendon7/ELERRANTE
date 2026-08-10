#!/usr/bin/env python3
"""Barrera de integridad para propuestas de costo Datos maestros V1.1."""
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
    return any(f'{prefix}v{version}' in text for version in ('1.1.0','1.2.0','1.3.0'))

studio=read('studio.html')
module=read('assets/master-cost-proposals-v11.js')
styles=read('assets/master-cost-proposals-v11.css')
test=read('tests/e2e/master-cost-proposals-v11.spec.js')
worker=read('service-worker.js')
deploy=read('deploy-version.txt')
pages=read('.github/workflows/pages.yml')
health=read('.github/workflows/public-health.yml')

for marker in ('id="master-cost-proposals-v11"','assets/master-cost-proposals-v11.js?v=1.1.0','assets/master-cost-proposals-v11.css?v=1.1.0'):
    require(marker in studio,f'Studio no integra {marker}')
require("const VERSION='1.1.0'" in module,'Motor de propuestas no declara V1.1.0')
require("EVENTS_KEY='ee_v11_cost_proposal_events'" in module,'Falta ledger separado de propuestas')
require("PURCHASES_KEY='ee_v24_material_purchases'" in module,'Falta lectura explícita de compras observadas')
for marker in ('createProposal','submitProposal','decideProposal','integritySnapshot','integrityUnchanged','APPROVED_FOR_MATERIALIZATION'):
    require(marker in module,f'Falta contrato V1.1: {marker}')
for event in ("type:'CREATED'","type:'SUBMITTED'","'APPROVED'","'REJECTED'"):
    require(event in module,f'Falta transición/evento {event}')
require('writeEvents=events=>localStorage.setItem(EVENTS_KEY' in module,'El ledger debe escribir únicamente su clave propia')
require('localStorage.setItem(PURCHASES_KEY' not in module,'V1.1 no puede escribir compras observadas')
require('DATA.materials=' not in module and '.cost=' not in module,'V1.1 no puede reescribir materiales/costos maestros')
require('applyProposal' not in module,'No debe existir aplicación automática del costo propuesto')
require("current.lastEvent.type!=='CREATED'" in module and "current.lastEvent.type!=='SUBMITTED'" in module,'Faltan guards de transición')
require('reason.length<8' in module,'Aprobar/rechazar debe exigir razón explícita')
require('evidenceForMaterial(materialId)' in module,'La propuesta debe anclarse a evidencia del mismo material')
require('fetch(' not in module and 'XMLHttpRequest' not in module and 'axios' not in module,'V1.1 debe operar localmente sin red propia')
require(len(styles)>2000 and '@media(max-width:850px)' in styles,'Capa responsive V1.1 incompleta')
for marker in ('aprobar añade evento pero no aplica costo al maestro','rechazar conserva historia','impide propuestas sin compra observada','no genera desbordamiento horizontal'):
    require(marker in test,f'Falta regresión V1.1: {marker}')
require('./assets/master-cost-proposals-v11.js' in worker and './assets/master-cost-proposals-v11.css' in worker,'Service worker no precachea V1.1')
require("endsWith('/assets/master-cost-proposals-v11.js')" in worker and "endsWith('/assets/master-cost-proposals-v11.css')" in worker,'Service worker no sirve fresco V1.1')
require('master_data_governance_core=v1.0.0' in deploy,'Metadata no preserva core V1.0.0')
require('master_cost_proposals=v1.1.0' in deploy,'Metadata no preserva propuestas V1.1.0')
require(aggregate_compatible(deploy,'master_data_module='),'Metadata no declara un agregado compatible con V1.1')
require('master_cost_proposals=v1.1.0' in pages,'Pages no certifica propuestas V1.1')
require(aggregate_compatible(pages,'master_data_module='),'Pages no certifica agregado compatible')
require('EXPECTED_COST_PROPOSALS: v1.1.0' in health,'Health-check no preserva V1.1')
require(aggregate_compatible(health,'EXPECTED_MASTER_DATA: '),'Health-check no acepta agregado compatible')
for forbidden in ('service_role','postgres://','private_key','supabase_service'):
    require(forbidden not in module.lower(),f'Posible secreto en V1.1: {forbidden}')

print('EL ERRANTE — DATOS MAESTROS V1.1 · PROPUESTAS DE COSTO')
print('='*60)
print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues:
        print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS')
print('ledger=append_only_local')
print('aprobacion=explicita_sin_aplicacion_directa')
print('compatibilidad_agregado=v1.1_o_superior_certificado')
print('compras_bom_costos=sin_mutacion')