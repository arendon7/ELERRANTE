#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
required=[
    'piloto-operativo.html',
    'assets/pilot-operations-v37.js',
    'assets/pilot-operations-v37.css',
    'documentacion/PILOTO_OPERATIVO_V37.md',
    'tests/e2e/pilot-operations-v37.spec.js',
]
missing=[path for path in required if not (ROOT/path).is_file()]
if missing: raise SystemExit(f'V3.7 incompleto: {missing}')

html=(ROOT/'piloto-operativo.html').read_text(encoding='utf-8')
js=(ROOT/'assets/pilot-operations-v37.js').read_text(encoding='utf-8')
css=(ROOT/'assets/pilot-operations-v37.css').read_text(encoding='utf-8')
center=(ROOT/'centro-interno.html').read_text(encoding='utf-8')

def require(text,needle,label):
    if needle not in text: raise SystemExit(f'Falta contrato V3.7: {label}')

require(html,'data-v31-protected','protección de sesión')
require(html,'assets/pilot-operations-v37.js?v=3.7.1','JS V3.7.1')
require(html,'assets/pilot-operations-v37.css?v=3.7.0','CSS V3.7')
require(js,"const VERSION='3.7.1'",'versión patch V3.7.1')
require(js,"BACKUP_VERSIONS=new Set(['3.7.0',VERSION])",'compatibilidad de backups V3.7.0')
require(js,"EVENT_KEY='ee_v37_pilot_events'",'ledger append-only')
require(js,"format:'el-errante-pilot-backup'",'formato de backup')
require(js,"algorithm:'SHA-256'",'checksum')
require(js,"appendEvent('RESTORE'",'restauración trazable')
require(js,'backupVersion:p.version','traza de versión restaurada')
require(js,'exitGate','gate de salida')
require(js,'ee_v36_daily_close_events','cierres V3.6')
require(js,'ee_v323_cash_counts','conteos de caja')
require(js,'ee_v330_operational_evidence','evidencia V3.3')
require(js,'ee_v24_production_measurements','medición de producción')
require(js,'ee_v24_material_purchases','compras observadas')
require(js,"'receivedDate','received_date'",'fecha de recepción V2.5 reconciliable')
require(center,'href="piloto-operativo.html"','entrada desde Centro interno')
require(css,'.v37-shell','estilos V3.7')

for forbidden in ('service_role','supabase.auth','createClient('):
    if forbidden.lower() in js.lower(): raise SystemExit(f'V3.7 activa o expone backend prohibido: {forbidden}')
for forbidden in ("'ee_v31_local_account'", "'ee_v31_session'"):
    if forbidden in js: raise SystemExit(f'V3.7 no debe respaldar credenciales/sesión: {forbidden}')
if 'localStorage.clear' in js: raise SystemExit('V3.7 no puede limpiar todo localStorage')

print('PILOTO OPERATIVO V3.7.1: PASS')
print('- backend/Supabase: inactivo')
print('- backup integral privado: contrato presente')
print('- backups V3.7.0 válidos: restaurables')
print('- ledger piloto append-only: presente')
print('- reconciliación y gate: presentes')
print('- compras V2.5 por receivedDate: reconciliables')
