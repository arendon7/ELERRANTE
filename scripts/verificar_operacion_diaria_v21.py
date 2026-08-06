from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
problems=[]
required=[
    'assets/daily-ops-v21.js','assets/daily-ops-v21.css','backend/supabase/schema-v21.sql',
    'tests/e2e/daily-ops-v21.spec.js','admin.html','service-worker.js','deploy-version.txt'
]
for path in required:
    if not (ROOT/path).is_file(): problems.append(f'Falta {path}.')

def require(path,marker,label):
    text=(ROOT/path).read_text(encoding='utf-8')
    if marker not in text: problems.append(f'{label}: falta {marker!r} en {path}.')

require('assets/daily-ops-v21.js','Mesa de pedidos y continuidad local','La mesa diaria no está declarada')
require('assets/daily-ops-v21.js','transition_order_v21','La transición segura no está conectada')
require('assets/daily-ops-v21.js','compactLegacyOrders','La tabla heredada de pedidos no se sustituye')
require('assets/daily-ops-v21.js','dialogOpen','El diálogo no está protegido frente a reconstrucciones concurrentes')
require('assets/daily-ops-v21.js','el-errante-local-backup','El respaldo local no tiene contrato')
require('assets/daily-ops-v21.js','Exportar CSV operativo','La exportación operativa no existe')
require('assets/daily-ops-v21.js','No se puede aprobar el pago sin comprobante','No se exige comprobante')
require('assets/daily-ops-v21.css','.ee-v21-dialog','Faltan estilos del detalle de pedido')
require('backend/supabase/schema-v21.sql','create or replace function public.transition_order_v21','Falta RPC segura')
require('backend/supabase/schema-v21.sql',"payment receipt required before approval",'La RPC no exige comprobante')
require('backend/supabase/schema-v21.sql',"'2.1'",'La migración no queda registrada')
require('admin.html','id="daily-ops-v21"','Admin no expone la mesa diaria')
require('admin.html','assets/daily-ops-v21.js','Admin no carga el runtime V2.1')
require('admin.html','assets/daily-ops-v21.css','Admin no carga los estilos V2.1')
require('service-worker.js','assets/daily-ops-v21.js','Service Worker no cachea el runtime V2.1')
require('service-worker.js','backend/supabase/schema-v21.sql','Service Worker no incluye la migración V2.1')
require('deploy-version.txt','version=2.4.0','El marcador público no declara V2.3')
require('deploy-version.txt','cache=el-errante-v2-4-0','El marcador público no declara caché V2.3')

for path in ('assets/daily-ops-v21.js','assets/commerce-runtime-config.js'):
    text=(ROOT/path).read_text(encoding='utf-8').lower()
    for forbidden in ('service_role','postgres://'):
        if forbidden in text: problems.append(f'{path} contiene {forbidden}.')

print('EL ERRANTE V2.1 — BARRERA DE OPERACIÓN DIARIA')
print(f'Archivos requeridos: {len(required)}')
print(f'Problemas: {len(problems)}')
for problem in problems: print('-',problem)
if problems: raise SystemExit(1)
print('RESULTADO: PASS')