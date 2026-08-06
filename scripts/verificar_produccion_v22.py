#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
errors=[]

def require(path,*needles):
    target=ROOT/path
    if not target.exists():
        errors.append(f'Falta {path}')
        return ''
    text=target.read_text(encoding='utf-8')
    for needle in needles:
        if needle not in text:
            errors.append(f'{path}: falta {needle!r}')
    return text

admin=require(Path('admin.html'),'production-v22','producción, materiales y despacho · V2.3','assets/production-v22.js','assets/production-v22.css')
js=require(Path('assets/production-v22.js'),"FULFILLMENT_KEY='ee_v22_fulfillment'",'Agenda de alistamiento por fecha','Exportar preparación','transition_order_v22','save_order_fulfillment_v22',"dataset.productionVersion='2.2.0'",'Completa y guarda los cuatro controles antes de despachar')
css=require(Path('assets/production-v22.css'),'.ee-v22-shell','@media(max-width:520px)','@media print')
schema=require(Path('backend/supabase/schema-v22.sql'),'create table if not exists public.order_fulfillment','alter table public.order_fulfillment enable row level security','save_order_fulfillment_v22','transition_order_v22','fulfillment checklist required before dispatch',"'schema_version','2.2'", "values ('2.2'")
test=require(Path('tests/e2e/production-v22.spec.js'),'Producción y despacho V2.2','solo entonces permite despachar','datos personales','desbordamiento horizontal')
worker=require(Path('service-worker.js'),"el-errante-v2-3-0",'production-v22.js','production-v22.css','schema-v22.sql')
host=require(Path('assets/host-mode.js'),'PUBLIC_VERSION="2.3.0"','ACTIVE_CACHE="el-errante-v2-3-0"')
version=require(Path('deploy-version.txt'),'version=2.3.0')
activation=require(Path('assets/activation-v23.js'),"dataset.activationVersion='2.3.0'",'schema-v23.sql')

for private in ['customer?.phone','customer?.email','delivery?.address']:
    export_section=js[js.find('function exportPreparation'):js.find('function syncLegacyDispatchGuard')]
    if private in export_section:
        errors.append(f'La exportación V2.2 incluye dato privado: {private}')

if 'service_role' in js.lower() or 'service_role' in admin.lower():
    errors.append('La interfaz pública no puede contener service_role')

if errors:
    print('BARRERA V2.2: ERROR')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)

print('BARRERA V2.2: OK')
print('Agenda, consolidado, checklist, privacidad y despacho seguro preservados dentro de V2.3.')