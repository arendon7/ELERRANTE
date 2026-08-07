#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
ERRORS=[]
EXPECTED_CACHE='el-errante-v2-8-brand-canon-2'

def read(path:str)->str:
    target=ROOT/path
    if not target.is_file():
        ERRORS.append(f'Falta {path}')
        return ''
    return target.read_text(encoding='utf-8')

brand=read('assets/brand-canon-v28.js')
data=read('assets/data.js')
host=read('assets/host-mode.js')
sw=read('service-worker.js')
deploy=read('deploy-version.txt')

required_assets=[
    'home-hero.webp','home-hero-mobile.webp','home-masa-fuego.webp','home-fermentacion.webp',
    'home-ingredientes.webp','home-compartir.webp','home-en-casa.webp','home-despensa.webp',
    'evento-hero.webp','evento-noche.webp','evento-servicio.webp','og-el-errante.webp',
    'producto-harina.webp','producto-crea-tuya.webp','producto-margherita.webp','producto-diavola.webp',
    'producto-bosque.webp','producto-cuatro-quesos.webp','producto-la-errante.webp',
    'producto-salsa-tomate.webp','producto-reduccion-balsamica.webp','producto-panela-maracuya.webp',
    'producto-combo-primera-ruta.webp'
]
for name in required_assets:
    path=ROOT/'assets/images/brand-final'/name
    if not path.is_file() or path.stat().st_size<10_000:
        ERRORS.append(f'Activo canónico faltante o inválido: {path.relative_to(ROOT)}')

checks=[
    ('versión de marca', "const VERSION='2.8.0'" in brand),
    ('caché canónica', EXPECTED_CACHE in brand and 'const CACHE=BRAND.cache' in sw),
    ('datos usan canon', 'BRAND.applyToData(window.EE_DATA)' in data),
    ('host sin mapa duplicado', 'const VISUALS=' not in host and 'BRAND.applyToDom' in host),
    ('service worker importa canon', "importScripts('./assets/brand-canon-v28.js')" in sw),
    ('release V2.8', 'version=2.8.0' in deploy and f'cache={EXPECTED_CACHE}' in deploy),
]
for label,ok in checks:
    if not ok:ERRORS.append(f'Falla: {label}')

for html in ROOT.glob('*.html'):
    text=html.read_text(encoding='utf-8',errors='ignore')
    for forbidden in ('brand-final-editorial.js','brand-final-products-a.js','brand-final-products-b.js','brand-final-products-c.js'):
        if forbidden in text:ERRORS.append(f'{html.name} carga módulo visual superpuesto: {forbidden}')

if ERRORS:
    print('CANON DE MARCA V2.8: ERROR')
    for error in ERRORS:print('-',error)
    sys.exit(1)

print('CANON DE MARCA V2.8: OK')
print(f'- {len(required_assets)} activos HQ verificados')
print('- una sola tabla de aliases y activos')
print('- catálogo normalizado antes de renderizar')
print('- DOM y service worker usan el mismo canon')
print('- módulos visuales superpuestos no están activos')
