#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
required=[
    'piloto-operativo.html',
    'assets/pilot-operations-v37.js',
    'assets/pilot-operations-v37.css',
    'assets/pilot-order-intake-v372.js',
    'assets/pilot-order-intake-v372.css',
    'assets/pilot-exit-v373.js',
    'assets/pilot-exit-v373.css',
    'documentacion/PILOTO_OPERATIVO_V37.md',
    'documentacion/PILOTO_SALIDA_V373.md',
    'tests/e2e/pilot-operations-v37.spec.js',
    'tests/e2e/pilot-intake-v372.spec.js',
    'tests/e2e/pilot-exit-v373.spec.js',
]
missing=[path for path in required if not (ROOT/path).is_file()]
if missing: raise SystemExit(f'V3.7 incompleto: {missing}')

html=(ROOT/'piloto-operativo.html').read_text(encoding='utf-8')
js=(ROOT/'assets/pilot-operations-v37.js').read_text(encoding='utf-8')
css=(ROOT/'assets/pilot-operations-v37.css').read_text(encoding='utf-8')
intake=(ROOT/'assets/pilot-order-intake-v372.js').read_text(encoding='utf-8')
intake_css=(ROOT/'assets/pilot-order-intake-v372.css').read_text(encoding='utf-8')
exit_js=(ROOT/'assets/pilot-exit-v373.js').read_text(encoding='utf-8')
exit_css=(ROOT/'assets/pilot-exit-v373.css').read_text(encoding='utf-8')
center=(ROOT/'centro-interno.html').read_text(encoding='utf-8')

def require(text,needle,label):
    if needle not in text: raise SystemExit(f'Falta contrato V3.7: {label}')

require(html,'data-v31-protected','protección de sesión')
require(html,'assets/data.js','catálogo canónico para intake')
require(html,'assets/pilot-operations-v37.js?v=3.7.1','JS V3.7.1')
require(html,'assets/pilot-operations-v37.css?v=3.7.0','CSS V3.7')
require(html,'assets/pilot-order-intake-v372.js?v=3.7.2','intake V3.7.2')
require(html,'assets/pilot-order-intake-v372.css?v=3.7.2','CSS intake V3.7.2')
require(html,'assets/pilot-exit-v373.js?v=3.7.3','salida V3.7.3')
require(html,'assets/pilot-exit-v373.css?v=3.7.3','CSS salida V3.7.3')
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
require(intake,"const VERSION='3.7.2'",'versión intake V3.7.2')
require(intake,"ORDER_KEY='ee_v14_orders'",'misma fuente de pedidos')
require(intake,"source:'pilot-local-intake-v372'",'origen trazable de pedido')
require(intake,'unit_cost_snapshot:x.unitCost','snapshot histórico por línea')
require(intake,"unitPrice<=0||x.unitCost<=0",'precios y costos positivos obligatorios')
require(intake,"['pending_payment','payment_review'].includes(status)",'estados iniciales controlados')
require(intake,"status==='payment_review'&&!receiptFile",'comprobante obligatorio para revisión de pago')
require(intake,"receiptDataUrl:receipt?.dataUrl||''",'comprobante local compatible con Operación V2.1')
require(intake,"order.status='payment_review'",'pago posterior pasa a revisión')
require(intake,"RECEIPT_TYPES=new Set(['image/jpeg','image/png','image/webp'])",'tipos de comprobante permitidos')
require(intake,"canvas.toDataURL('image/jpeg',0.72)",'reducción local de comprobante')
require(exit_js,"const VERSION='3.7.3'",'versión salida V3.7.3')
require(exit_js,"REVIEW_KEY='ee_v373_pilot_exit_reviews'",'ledger de revisiones de salida')
require(exit_js,'supersedes:previous?.id||null','historia append-only de revisiones')
require(exit_js,"code='BACKEND_DESIGN_CANDIDATE'",'gate candidato a diseño')
require(exit_js,"code='LOCAL_MODEL_SUFFICIENT'",'gate modelo local suficiente')
require(exit_js,"code='EVIDENCE_GAPS'",'brechas bloquean decisión')
require(exit_js,"reconciliation.summary.exitGate!=='EVIDENCE_COMPLETE'",'dependencia de reconciliación')
require(exit_js,'Supabase permanece inactivo.','gate no activa backend')
require(exit_css,'.v373-panel','estilos salida aislados')
require(exit_css,'.v373-columns','layout de clasificación')
require(intake_css,'.v372-panel','estilos intake aislados')
require(intake_css,'.v372-payment-box','estilos de pago posterior')
require(center,'href="piloto-operativo.html"','entrada desde Centro interno')
require(css,'.v37-shell','estilos V3.7')

for source_name,source in [('piloto',js),('intake',intake),('salida',exit_js)]:
    for forbidden in ('service_role','supabase.auth','createClient('):
        if forbidden.lower() in source.lower(): raise SystemExit(f'V3.7 activa o expone backend prohibido en {source_name}: {forbidden}')
for forbidden in ("'ee_v31_local_account'", "'ee_v31_session'"):
    if forbidden in js: raise SystemExit(f'V3.7 no debe respaldar credenciales/sesión: {forbidden}')
if any('localStorage.clear' in source for source in (js,intake,exit_js)): raise SystemExit('V3.7 no puede limpiar todo localStorage')

print('PILOTO OPERATIVO V3.7.3: PASS')
print('- backend/Supabase: inactivo')
print('- checkout público: no modificado')
print('- captura interna local V3.7.2: presente')
print('- snapshot de costo y comprobante local: preservados')
print('- backup integral privado V3.7.1: contrato presente')
print('- ledger piloto append-only: presente')
print('- reconciliación y gate operativo: presentes')
print('- salida V3.7.3: persistencia, roles y uso real clasificados')
print('- revisiones V3.7.3: append-only con supersedes')
print('- gate de backend: sólo diseño candidato, nunca activación')