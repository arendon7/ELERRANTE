from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def read(path):
    target=ROOT/path
    if not target.is_file():
        raise SystemExit(f'Falta {path}')
    return target.read_text(encoding='utf-8')


def require(path,*markers):
    text=read(path)
    for marker in markers:
        if marker not in text:
            raise SystemExit(f'{path} no contiene: {marker}')
    return text


js=require(
    'assets/procurement-v25.js',
    "dataset.procurementVersion='2.5.0'",
    'Comprar con evidencia y autorización.',
    'Crear borrador',
    'Marcar emitida',
    'Registrar recepción',
    'Comparar proveedores observados',
    "ee_v25_purchase_orders",
    'save_material_purchase_order_v25',
    'transition_material_purchase_order_v25',
    'receive_material_purchase_order_v25',
    'referencia externa antes de emitirla',
    "updateStock&&hasCount",
)
for forbidden in ('service_role','postgres://','SUPABASE_SERVICE'):
    if forbidden.lower() in js.lower():
        raise SystemExit(f'Posible secreto en procurement-v25.js: {forbidden}')
if "row.observed?.lastUnitCost??0" not in js:
    raise SystemExit('El borrador debe usar costo observado o quedar en cero, no asumir costo provisional como acordado')
if "unitCost>0" not in js or "externalReference" not in js:
    raise SystemExit('Faltan barreras para emitir una orden')

require('assets/procurement-v25.css','.ee-v25-grid','.ee-v25-state[data-state="received"]','@media(max-width:620px)')

admin=require(
    'admin.html',
    'id="procurement-v25"',
    'assets/procurement-v25.css',
    'assets/procurement-v25.js',
    'Operación, producción, materiales, medición, compras, abastecimiento y despacho · V2.5',
    'Activación V2.5',
    'Iteración 12',
)
if admin.index('assets/measurement-v24.js')>admin.index('assets/procurement-v25.js'):
    raise SystemExit('V2.5 debe cargar después de medición y compras observadas V2.4')
if admin.index('id="procurement-v25"')>admin.index('id="operations-v16"'):
    raise SystemExit('V2.5 debe aparecer antes del análisis financiero avanzado')

activation=require('activacion.html','Activación V2.5','assets/activation-v25.js','Iteración 12')
require('assets/activation-v25.js',"dataset.activationVersion='2.5.0'",'schema-v25.sql','Abastecimiento controlado V2.5')

schema=require(
    'backend/supabase/schema-v25.sql',
    'create table if not exists public.material_purchase_orders_v25',
    'create table if not exists public.material_purchase_receipts_v25',
    'save_material_purchase_order_v25',
    'transition_material_purchase_order_v25',
    'receive_material_purchase_order_v25',
    "status in ('draft','approved','ordered','partial','received','cancelled')",
    'Solo una orden aprobada puede emitirse',
    'invoice_reference es obligatorio',
    'where material_id=v_order.material_id',
    'public.record_admin_event',
    "values('2.5'",
)
if 'service_role' in schema.lower() or 'postgres://' in schema.lower():
    raise SystemExit('schema-v25 no debe contener credenciales ni depender de service_role')
if "external_reference),'')=''" not in schema:
    raise SystemExit('La emisión remota no exige evidencia externa')
if 'unique(purchase_order_id, invoice_reference)' not in schema:
    raise SystemExit('Falta barrera contra doble recepción de la misma factura')

require(
    'tests/e2e/procurement-v25.spec.js',
    'Borrador creado. Aún no está aprobado ni emitido.',
    'COT-001',
    'FAC-001',
    "status).toBe('partial')",
    'Comparar proveedores observados',
    'desbordamiento móvil',
)

require('deploy-version.txt','version=2.5.0','cache=el-errante-v2-5-0')
require('assets/host-mode.js','PUBLIC_VERSION="2.5.0"','ACTIVE_CACHE="el-errante-v2-5-0"')
require('service-worker.js',"const CACHE = 'el-errante-v2-5-0'",'assets/procurement-v25.js','backend/supabase/schema-v25.sql')

print('OK: abastecimiento, autorización, recepción y reconciliación V2.5 verificados')
