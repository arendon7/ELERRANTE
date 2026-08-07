#!/usr/bin/env python3
"""Verifica la colección física WebP V1.3 dentro del canon de aplicación V2.8."""
from pathlib import Path
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []
EXPECTED_CACHE = 'el-errante-v2-8-brand-canon-2'
VISUALS = [
    'home-hero','home-hero-mobile','home-masa-fuego','home-fermentacion',
    'home-ingredientes','home-compartir','home-en-casa','home-despensa',
    'evento-hero','evento-noche','evento-operacion','evento-servicio','og-el-errante',
    'producto-harina','producto-crea-tuya','producto-margherita','producto-diavola',
    'producto-bosque','producto-cuatro-quesos','producto-la-errante',
    'producto-salsa-tomate','producto-reduccion-balsamica','producto-panela-maracuya',
    'producto-combo-primera-ruta'
]
PRODUCT_IDS = [
    'harina-aire-y-tiempo','crea-la-tuya','margherita-del-taller','diavola-errante',
    'bosque','cuatro-quesos-montana','la-errante','salsa-tomate',
    'reduccion-balsamica','panela-maracuya','combo-primera-ruta'
]

visual_dir = ROOT / 'assets/images/brand-final'
for name in VISUALS:
    path = visual_dir / f'{name}.webp'
    if not path.is_file() or path.stat().st_size < 100_000:
        ISSUES.append(f'Visual HQ faltante o insuficiente: {name}.webp')
        continue
    header = path.read_bytes()[:12]
    if not (header.startswith(b'RIFF') and header[8:12] == b'WEBP'):
        ISSUES.append(f'Formato WebP inválido: {name}.webp')

manifest_path = visual_dir / 'manifest-hq-v13.json'
if not manifest_path.is_file():
    ISSUES.append('Manifest HQ V1.3 faltante')
else:
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest.get('version') != '1.3.0': ISSUES.append('Manifest HQ no declara 1.3.0')
    if manifest.get('unique_assets') != 23: ISSUES.append('Manifest HQ no declara 23 activos únicos')
    if manifest.get('aliases', {}).get('evento-servicio.webp') != 'evento-operacion.webp':
        ISSUES.append('Alias evento-servicio incompleto')
    for item in manifest.get('assets', []):
        path = visual_dir / item.get('file', '')
        if not path.is_file():
            ISSUES.append(f"Activo declarado pero ausente: {item.get('file')}")
            continue
        if hashlib.sha256(path.read_bytes()).hexdigest() != item.get('sha256'):
            ISSUES.append(f"SHA-256 inconsistente: {item.get('file')}")
        if path.stat().st_size != item.get('bytes'):
            ISSUES.append(f"Tamaño inconsistente: {item.get('file')}")
        if int(item.get('width', 0)) < 960 or int(item.get('height', 0)) < 630:
            ISSUES.append(f"Resolución insuficiente: {item.get('file')}")

brand = (ROOT / 'assets/brand-canon-v28.js').read_text(encoding='utf-8')
worker = (ROOT / 'service-worker.js').read_text(encoding='utf-8')
deploy = (ROOT / 'deploy-version.txt').read_text(encoding='utf-8')
for marker in ["const VERSION='2.8.0'", EXPECTED_CACHE, 'home-hero-mobile.webp', 'producto-panela-maracuya.webp']:
    if marker not in brand: ISSUES.append(f'Canon V2.8 incompleto: {marker}')
for product_id in PRODUCT_IDS:
    if product_id not in brand: ISSUES.append(f'Producto sin activo canónico: {product_id}')
if "importScripts('./assets/brand-canon-v28.js')" not in worker:
    ISSUES.append('Service worker no importa el canon V2.8')
if 'version=2.8.0' not in deploy or f'cache={EXPECTED_CACHE}' not in deploy:
    ISSUES.append('deploy-version no corresponde a V2.8')
for obsolete in ['assets/brand-final-editorial.js','assets/brand-final-products-a.js','assets/brand-final-products-b.js','assets/brand-final-products-c.js']:
    if (ROOT / obsolete).exists(): ISSUES.append(f'Overlay heredado permanece activo: {obsolete}')

print('EL ERRANTE V2.8 — INTEGRIDAD WEBP HQ V1.3')
print(f'Rutas WebP: {len(VISUALS)}')
print(f'Productos canónicos: {len(PRODUCT_IDS)}')
print(f'Problemas: {len(ISSUES)}')
for issue in ISSUES: print('-', issue)
if ISSUES: sys.exit(1)
print('RESULTADO: PASS')
