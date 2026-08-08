#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]

def text(path):
    p=ROOT/path
    if not p.is_file():
        errors.append(f'Falta {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='ignore')

hub=text('centro-interno.html')
control=text('control.html')
ops=text('operacion.html')
finance=text('finanzas.html')
ctrl_js=text('assets/control-v30.js')
daily_js=text('assets/daily-ops-v21.js')
production_js=text('assets/production-v22.js')
css=text('assets/internal-v30.css')
test=text('tests/e2e/internal-v30.spec.js')

checks={
    'hub enlaza panel operativo':'href="control.html"' in hub,
    'hub enlaza finanzas':'href="finanzas.html"' in hub,
    'control monta V3.0':'id="control-v30"' in control and 'assets/control-v30.js' in control,
    'control no carga finanzas':'assets/finance-v27.js' not in control and 'id="finance-v27"' not in control,
    'operación conserva agenda':'id="daily-ops-v21"' in ops and 'assets/daily-ops-v21.js' in ops,
    'operación autoriza agenda local':'data-v21-local-surface="true"' in ops and 'v21LocalSurface' in daily_js,
    'operación conserva producción':'id="production-v22"' in ops and 'assets/production-v22.js' in ops,
    'operación autoriza producción local':'data-v22-local-surface="true"' in ops and 'v22LocalSurface' in production_js,
    'modo remoto sigue ligado a sesión':'Administración conectada' in daily_js and 'Administración conectada' in production_js,
    'operación conserva materiales':'id="materials-v23"' in ops and 'assets/materials-v23.js' in ops,
    'operación conserva abastecimiento':'id="procurement-v25"' in ops and 'assets/procurement-v25.js' in ops,
    'operación no carga finanzas':'assets/finance-v27.js' not in ops and 'id="finance-v27"' not in ops,
    'finanzas monta motor V2.7':'id="finance-v27"' in finance and 'assets/finance-v27.js' in finance,
    'finanzas no carga producción':'assets/production-v22.js' not in finance and 'id="production-v22"' not in finance,
    'finanzas declara MFO':'Mapa de migración del MFO' in finance and 'Flujo 24M' in finance,
    'control conserva desconocido != cero':'available===null' in ctrl_js and 'Sin conteo' in ctrl_js,
    'estilos V3 presentes':'.v30-shell' in css and '@media' in css,
    'regresión V3 presente':'Arquitectura interna V3.0' in test and "'/finanzas.html'" in test and 'Mesa de pedidos y continuidad local' in test,
}
for label,ok in checks.items():
    if not ok: errors.append(label)

for path,content in [('control',control+ctrl_js),('operacion',ops),('finanzas',finance)]:
    lowered=content.lower()
    for forbidden in ('service_role','postgres://','supabase_service'):
        if forbidden in lowered: errors.append(f'{path}: posible secreto {forbidden}')

print('EL ERRANTE V3.0 — SEPARACIÓN OPERACIÓN / FINANZAS')
print('='*52)
print(f'Controles: {len(checks)}')
print(f'Problemas: {len(errors)}')
if errors:
    for error in errors: print('-',error)
    sys.exit(1)
print('RESULTADO: PASS')
