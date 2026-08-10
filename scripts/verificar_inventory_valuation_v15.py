#!/usr/bin/env python3
"""Barrera de integridad para inventario valorizado y variaciones V1.5."""
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
    positions=[text.find(marker) for marker in markers]; return all(pos>=0 for pos in positions) and positions==sorted(positions)
core=read('assets/inventory-valuation-v15.js'); view=read('assets/finance-inventory-valuation-v15.js'); css=read('assets/inventory-valuation-v15.css'); finance=read('finanzas.html'); test=read('tests/e2e/inventory-valuation-v15.spec.js'); workflow=read('.github/workflows/inventory-valuation-v15.yml'); marker=read('inventory-valuation-version.txt'); builder=read('scripts/preparar_sitio_materializado_v28.py'); doc=read('documentacion/DATOS_MAESTROS_V15_INVENTARIO_VALORIZADO.md')
require("const VERSION='1.5.0'" in core,'Core V1.5 no declara versión 1.5.0')
for token in ("stock:'ee_v23_material_stock'","purchases:'ee_v24_material_purchases'","purchaseOrders:'ee_v25_purchase_orders'","orders:'ee_v14_orders'"): require(token in core,f'Falta fuente V1.5: {token}')
for token in ('operationalRequirements','supplyByMaterial','currentStandard','purchaseEvidence','latestObservedMap','materialRows','purchaseVariances','summary','alerts','snapshot'): require(token in core,f'Falta contrato V1.5: {token}')
require("V14()?.materialAt?.(materialId,asOf)" in core,'V1.5 no consume estándar efectivo reconstruible desde V1.4'); require("V14()?.historicalPurchase?.(purchase)" in core,'V1.5 no usa snapshot histórico de recepción V1.4'); require('const ALERT_THRESHOLD=0.10' in core,'V1.5 no fija umbral inicial de desviación de 10%'); require("coverageStatus=requirementQty<=0?'not_required':!stockKnown?'unknown':gapQty>0?'short':'covered'" in core,'V1.5 no mantiene inventario desconocido separado de cero'); require('totalCashExposure:supply.committedCash+additionalGapExposure' in core,'V1.5 no separa compromiso emitido y exposición adicional'); require('localStorage.setItem' not in core and 'sessionStorage.setItem' not in core,'V1.5 debe ser de solo lectura sobre hechos'); require('fetch(' not in core and 'XMLHttpRequest' not in core and 'axios' not in core,'V1.5 no debe tener red propia'); require("dataset.inventoryValuation=VERSION" in core,'V1.5 no expone marcador runtime')
chain=('assets/materials-data-v23.js','assets/master-cost-materialization-v12.js?v=1.2.0','assets/master-cost-prospective-v13.js?v=1.3.0','assets/historical-cost-snapshots-v14.js?v=1.4.0','assets/inventory-valuation-v15.js?v=1.5.0')
require(ordered(finance,*chain,'assets/finance-workbench-v31.js'),'Finanzas no carga V1.2 → V1.3 → V1.4 → V1.5 antes del workbench'); require('id="finance-inventory-valuation-v15"' in finance,'Finanzas no expone target V1.5'); require('assets/inventory-valuation-v15.css' in finance,'Finanzas no carga estilos V1.5'); require('assets/finance-inventory-valuation-v15.js?v=1.5.0' in finance,'Finanzas no carga vista V1.5'); require("PANEL_ID='finance-inventory-valuation-v15'" in view,'Vista financiera V1.5 no apunta al panel canónico')
for phrase in ('Referencia observada','no FIFO','estándar histórico','Exposición de caja'): require(phrase.lower() in view.lower() or phrase.lower() in doc.lower(),f'Falta semántica V1.5: {phrase}')
require(len(css)>1800 and '@media(max-width:640px)' in css,'Capa responsive V1.5 incompleta')
for token in ('valor estándar y referencia observada permanecen separados','variación de compra usa estándar histórico de V1.4 y no el estándar vigente posterior','inventario sin conteo permanece desconocido y no se convierte en cero','compromiso emitido y recepción observada no se confunden','leer V1.5 no muta stock, compras, órdenes, pedidos ni ledger histórico','Finanzas explica que la referencia observada no es valorización contable por lotes','no genera desbordamiento horizontal en Finanzas móvil con V1.5'): require(token in test,f'Falta regresión V1.5: {token}')
require('inventory-valuation-version.txt' in builder,'Constructor materializado no copia marcador V1.5'); require("'inventory-valuation-version.txt'" in builder,'Superficie materializada no exige marcador V1.5')
for token in ('Certificar inventario valorizado V1.5','inventory-valuation-version.txt','EXPECTED_SHA','inventory-valuation-v15.js','finance-inventory-valuation-v15.js','finanzas.html'): require(token in workflow,f'Workflow V1.5 incompleto: {token}')
require('inventory_valuation=v1.5.0' in marker,'Marcador público no declara V1.5'); require('unknown_stock=explicit' in marker and 'accounting_lot_valuation=not_claimed' in marker and 'finance_mutation=forbidden' in marker,'Marcador V1.5 no declara límites de interpretación')
for forbidden in ('service_role','postgres://','private_key','supabase_service'): require(forbidden not in core.lower(),f'Posible secreto en V1.5: {forbidden}')
print('EL ERRANTE — DATOS MAESTROS V1.5 · INVENTARIO VALORIZADO'); print('='*68); print(f'Problemas: {len(issues)}')
if issues:
    for issue in issues: print('-',issue)
    sys.exit(1)
print('RESULTADO: PASS'); print('inventory=physical_count_read_only'); print('valuation=standard_plus_observed_reference_separate'); print('purchase_variance=historical_standard_only'); print('cash_exposure=issued_commitment_plus_additional_gap'); print('unknown_stock=explicit')
