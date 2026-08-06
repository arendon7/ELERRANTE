#!/usr/bin/env python3
"""Verificación modular vigente de El Errante bajo el canon integral V2.8."""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []
CHECKED = 0


def read(path: str) -> str:
    global CHECKED
    target = ROOT / path
    if not target.is_file():
        ERRORS.append(f'Falta {path}')
        return ''
    CHECKED += 1
    return target.read_text(encoding='utf-8', errors='ignore')


def require(path: str, *markers: str) -> str:
    text = read(path)
    for marker in markers:
        if marker not in text:
            ERRORS.append(f'{path}: falta {marker!r}')
    return text


admin = require(
    'admin.html',
    '· V2.8', 'id="daily-ops-v21"', 'id="production-v22"', 'id="materials-v23"',
    'id="measurement-v24"', 'id="procurement-v25"', 'id="finance-v27"',
    'assets/brand-canon-v28.js', 'assets/finance-v27.js', 'assets/procurement-v25.js',
    'Activación V2.5', 'noindex,nofollow'
)
activation = require('activacion.html', 'Activación V2.5', 'assets/activation-v25.js', 'noindex,nofollow')
config = require(
    'assets/commerce-config-v14.js', 'version: "2.4.0"', 'stage: "Piloto"',
    'dataStatus: "ESTIMADO"', 'monthlyFixedCosts', 'notice:'
)
runtime_config = require('assets/commerce-runtime-config.js', 'url: ""', 'publishableKey: ""')

amounts = [int(value) for value in re.findall(r'amount:\s*(\d+)', config)]
if sum(amounts) != 370_000:
    ERRORS.append(f'Gastos fijos provisionales distintos de $370.000 COP: {sum(amounts)}')

require(
    'assets/daily-ops-v21.js', 'Mesa de pedidos y continuidad local', 'transition_order_v21',
    'Exportar CSV operativo', 'No se puede aprobar el pago sin comprobante', 'el-errante-local-backup'
)
require('backend/supabase/schema-v21.sql', 'transition_order_v21', 'payment receipt required before approval', "values ('2.1'")

production = require(
    'assets/production-v22.js', "FULFILLMENT_KEY='ee_v22_fulfillment'", 'Agenda de alistamiento por fecha',
    'transition_order_v22', 'save_order_fulfillment_v22', "dataset.productionVersion='2.2.0'",
    'Completa y guarda los cuatro controles antes de despachar'
)
require('backend/supabase/schema-v22.sql', 'order_fulfillment', 'save_order_fulfillment_v22', 'transition_order_v22', "values ('2.2'")

materials_data = require(
    'assets/materials-data-v23.js', "version:'2.3.0'", 'EE-MAR-01', 'EE-CPR-01',
    'REC-MASA-BASE-V23', 'Agua adicional inferida', "stage:'Piloto'", 'monthly:370000'
)
materials = require(
    'assets/materials-v23.js', 'Lo necesario para producir, sin saturar el panel.',
    'Faltantes confirmados', 'Conteos pendientes', 'Actualizar conteo de materiales',
    "dataset.materialsVersion='2.3.0'", 'explodeProduct'
)
require('backend/supabase/schema-v23.sql', 'material_master', 'product_bom', 'material_inventory', 'save_material_inventory_v23', "values ('2.3'")
if 'Sin conteo' not in materials or 'Cero' not in materials:
    ERRORS.append('Materiales V2.3 no distingue inventario desconocido de cero confirmado')

measurement = require(
    'assets/measurement-v24.js', "measurementVersion='2.4.0'", 'Medir primero. Ajustar después.',
    'Contar antes de comprar', 'Registrar compra y proveedor', 'Registrar lote, rendimiento y merma',
    'La receta y el costo estándar permanecen sin cambios', 'ee_v24_production_measurements',
    'ee_v24_material_purchases', 'updateStock', 'POLICY.safetyPercent'
)
require('backend/supabase/schema-v24.sql', 'production_measurements', 'material_suppliers', 'material_purchases', 'save_production_measurement_v24', 'save_material_purchase_v24', "values('2.4'")
if 'stock[materialId]===undefined' not in measurement:
    ERRORS.append('Medición V2.4 no protege inventario sin conteo físico')

procurement = require(
    'assets/procurement-v25.js', "dataset.procurementVersion='2.5.0'", 'Comprar con evidencia y autorización.',
    'Crear borrador', 'Marcar emitida', 'Registrar recepción', 'Comparar proveedores observados',
    'ee_v25_purchase_orders', 'save_material_purchase_order_v25', 'transition_material_purchase_order_v25',
    'receive_material_purchase_order_v25', 'referencia externa antes de emitirla', 'updateStock&&hasCount'
)
require('assets/procurement-v25-guard.js', 'invoice', 'duplicate')
require(
    'backend/supabase/schema-v25.sql', 'material_purchase_orders_v25', 'material_purchase_receipts_v25',
    'save_material_purchase_order_v25', 'transition_material_purchase_order_v25',
    'receive_material_purchase_order_v25', 'Solo una orden aprobada puede emitirse',
    'invoice_reference es obligatorio', 'unique(purchase_order_id, invoice_reference)', "values('2.5'"
)
if 'row.observed?.lastUnitCost??0' not in procurement:
    ERRORS.append('Abastecimiento V2.5 no prioriza costo observado')

finance = require(
    'assets/finance-v27.js', 'const VERSION="2.7.0"', 'inventory_purchase', 'operating_expense',
    'capital_contribution', 'owner_withdrawal', 'capex', 'CONFIRMADO', 'CONTRADICTORIO',
    'ee_v27_finance_movements', 'ee_v27_finance_settings'
)
require('assets/finance-v27.css', '.ee-v27', '@media')
require('tests/e2e/finance-v27.spec.js', 'Compra de inventario', 'caja')
require('tests/e2e/procurement-v25.spec.js', 'Borrador creado. Aún no está aprobado ni emitido.', 'Comparar proveedores observados')

require('assets/trust-v19.js', 'lookup_order_status_v19', 'Esta consulta no muestra dirección, teléfono, comprobante ni notas internas', "dataset.trustVersion='1.9.0'")
require('backend/supabase/schema-v19.sql', 'lookup_order_status_v19', 'No devuelve dirección, teléfono, comprobante ni notas internas')
require('assets/activation-v25.js', "dataset.activationVersion='2.5.0'", 'schema-v25.sql', 'Abastecimiento controlado V2.5')

worker = require(
    'service-worker.js', "importScripts('./assets/brand-canon-v28.js')", 'const CACHE=BRAND.cache',
    'assets/daily-ops-v21.js', 'assets/production-v22.js', 'assets/materials-v23.js',
    'assets/measurement-v24.js', 'assets/procurement-v25.js', 'assets/finance-v27.js',
    'backend/supabase/schema-v25.sql'
)
require('deploy-version.txt', 'version=2.8.0', 'cache=el-errante-v2-8-brand-canon-1')

ordered = [
    'assets/daily-ops-v21.js','assets/production-v22.js','assets/materials-v23.js',
    'assets/measurement-v24.js','assets/procurement-v25.js','assets/finance-v27.js','assets/operations-v16.js'
]
positions = [admin.find(marker) for marker in ordered]
if any(position < 0 for position in positions) or positions != sorted(positions):
    ERRORS.append('El orden de carga de módulos administrativos no corresponde al flujo operativo')

for label, text in {
    'runtime config': runtime_config, 'producción': production, 'materiales': materials_data + materials,
    'medición': measurement, 'abastecimiento': procurement, 'finanzas': finance, 'service worker': worker
}.items():
    for forbidden in ('service_role', 'postgres://', 'SUPABASE_SERVICE'):
        if forbidden.lower() in text.lower():
            ERRORS.append(f'Posible credencial o privilegio en {label}: {forbidden}')

print('EL ERRANTE V2.8 — VERIFICACIÓN MODULAR')
print('=' * 44)
print(f'Archivos comprobados: {CHECKED}')
print(f'Gastos fijos provisionales: ${sum(amounts):,} COP')
print(f'Problemas: {len(ERRORS)}')
if ERRORS:
    for error in ERRORS: print('-', error)
    sys.exit(1)
print('RESULTADO: PASS')
