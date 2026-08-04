#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
issues=[]
def require(value,message):
    if not value: issues.append(message)
def read(path):
    file=ROOT/path
    require(file.exists(),f'Falta {path}')
    return file.read_text(encoding='utf-8') if file.exists() else ''
html=read(Path('actas.html')); js=read(Path('assets/offer-acts-v09.js')); css=read(Path('assets/offer-acts-v09.css')); worker=read(Path('service-worker.js'))
require('id="acts-app"' in html,'Falta contenedor de Actas')
require('assets/offer-acts-v09.js' in html and 'assets/offer-acts-v09.css' in html,'Actas no enlaza sus recursos')
for marker in ['ee_v09_validation_acts','ee_v09_offer_governance','EE_VALIDATION_ACTS_V09','applyToGovernance','window.print','documentacion/modelo-oferta-v09.json']:
    require(marker in js,f'Falta contrato {marker}')
require('window.EE_DATA' not in js,'Actas no debe mutar EE_DATA')
require(len(css)>1500,'CSS de actas parece incompleto')
for asset in ['./actas.html','./assets/offer-acts-v09.js','./assets/offer-acts-v09.css']:
    require(asset in worker,f'Caché no incluye {asset}')
for page in ['admin.html','operacion.html','studio.html','control.html']:
    require('href="actas.html"' in read(Path(page)),f'{page} no enlaza Actas')
for page in ['index.html','tienda.html','producto.html','checkout.html']:
    require('offer-acts-v09.js' not in read(Path(page)),f'{page} carga Actas internas')
if issues:
    print('ACTAS DE OFERTA V0.9: FAIL')
    for issue in issues: print('-',issue)
    sys.exit(1)
print('ACTAS DE OFERTA V0.9: PASS')
print('persistencia=local_separada')
print('aplicacion_expediente=explicita')
print('tienda_publica=aislada')
