#!/usr/bin/env python3
"""Barrera de integridad para el core Datos maestros V1.0."""
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

studio=read('studio.html')
module=read('assets/master-data-v10.js')
styles=read('assets/master-data-v10.css')
test=read('tests/e2e/master-data-v10.spec.js')
worker=read('service-worker.js')
deploy=read('deploy-version.txt')
pages=read('.github/workflows/pages.yml')

for marker in ('id="master-data-v10"','assets/materials-data-v23.js','assets/master-data-v10.js?v=1.0.0','assets/master-data-v10.css?v=1.0.0'):
    require(marker in studio,f'Studio no integra {marker}')
require('data-v31-protected' in studio and 'assets/internal-shell-v31.js' in studio,'Datos maestros debe permanecer detrás de shell V3.1.1')
require("const VERSION='1.0.0'" in module,'Core Datos maestros no declara V1.0.0')
require("STORAGE_KEY='ee_v10_master_governance'" in module,'Falta overlay de gobierno separado')
require("PURCHASES_KEY='ee_v24_material_purchases'" in module,'Falta lectura explícita de compras observadas')
for marker in ('saveMaterialGovernance','saveSupplierGovernance','materialRows','supplierRows','integrityUnchanged'):
    require(marker in module,f'Falta contrato {marker}')
require(module.count('writeJSON(STORAGE_KEY,store)')==2,'El core debe escribir únicamente el overlay de gobierno')
require('writeJSON(PURCHASES_KEY' not in module,'Datos maestros V1.0 no puede escribir el historial de compras')
require('DATA.materials=' not in module and '.cost=' not in module,'Datos maestros V1.0 no puede reescribir materiales/costos maestros')
require('fetch(' not in module and 'XMLHttpRequest' not in module and 'axios' not in module,'Datos maestros V1.0 debe operar localmente sin red propia')
require(len(styles)>2000 and '.md-v10-table-wrap{overflow:auto' in styles,'Capa visual/responsive incompleta')
for marker in ('no altera compras, BOM ni costo maestro','no crea ni modifica hechos de compra','no genera desbordamiento horizontal'):
    require(marker in test,f'Falta regresión: {marker}')
require('./assets/master-data-v10.js' in worker and './assets/master-data-v10.css' in worker,'Service worker no precachea core V1.0')
require("endsWith('/assets/master-data-v10.js')" in worker and "endsWith('/assets/master-data-v10.css')" in worker,'Service worker no sirve fresco core V1.0')
require('master_data_governance_core=v1.0.0' in deploy,'Metadata no preserva core Datos maestros V1.0')
require('_site/assets/master-data-v10.js' in pages,'Pages no certifica el core Datos maestros V1.0')
for forbidden in ('service_role','postgres://','private_key','supabase_service'):
    require(forbidden not in module.lower(),f'Posible secreto en master-data-v10.js: {forbidden}')

print('EL ERRANTE — DATOS MAESTROS CORE V1.0')
print('='*47)
print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues:
        print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS')
print('persistencia=overlay_local_separado')
print('compras=solo_lectura_observada')
print('bom_y_costos=sin_mutacion')
