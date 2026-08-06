from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def read(path):
    target=ROOT/path
    if not target.is_file(): raise SystemExit(f'Falta {path}')
    return target.read_text(encoding='utf-8')


def require(path,*markers):
    text=read(path)
    for marker in markers:
        if marker not in text: raise SystemExit(f'{path} no contiene: {marker}')
    return text

js=require(
    'assets/measurement-v24.js',
    "measurementVersion='2.4.0'",
    'Medir primero. Ajustar después.',
    'Contar antes de comprar',
    'Registrar compra y proveedor',
    'Registrar lote, rendimiento y merma',
    'La receta y el costo estándar permanecen sin cambios',
    "ee_v24_production_measurements",
    "ee_v24_material_purchases",
    "updateStock",
    "POLICY.safetyPercent",
)
for forbidden in ('service_role','postgres://','SUPABASE_SERVICE'):
    if forbidden.lower() in js.lower(): raise SystemExit(f'Posible secreto en measurement-v24.js: {forbidden}')
if "stock[materialId]===undefined" not in js:
    raise SystemExit('La compra no protege inventario sin conteo físico')
if "unitCost:quantity>0?totalCost/quantity:0" not in js:
    raise SystemExit('Falta cálculo de costo observado')

require('assets/measurement-v24.css','.ee-v24-grid','.ee-v24-details','@media(max-width:620px)')

admin=require(
    'admin.html',
    'id="measurement-v24"',
    'assets/measurement-v24.css',
    'assets/measurement-v24.js',
    'Activación V2.4',
    'Iteración 11',
)
if admin.index('assets/materials-v23.js')>admin.index('assets/measurement-v24.js'):
    raise SystemExit('V2.4 debe cargar después del maestro de materiales')
if admin.index('id="measurement-v24"')>admin.index('id="operations-v16"'):
    raise SystemExit('V2.4 debe aparecer antes del análisis financiero avanzado')

schema=require(
    'backend/supabase/schema-v24.sql',
    'create table if not exists public.production_measurements',
    'create table if not exists public.material_suppliers',
    'create table if not exists public.material_purchases',
    'material_suppliers_name_lower_uidx',
    'save_production_measurement_v24',
    'save_material_purchase_v24',
    'public.is_admin()',
    "values('2.4'",
)
if 'unique(lower(name))' in schema:
    raise SystemExit('El esquema usa una restricción de expresión inválida')
if 'service_role' in schema.lower():
    raise SystemExit('schema-v24 no debe depender de service_role')

require('tests/e2e/measurement-v24.spec.js','Contar antes de comprar','MASA-V24-001','no tiene conteo físico','desbordamiento móvil')
print('OK: medición real, compras, proveedores y sugerencias V2.4 verificados')
