#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

python3 - <<'PY'
from pathlib import Path
import sys

root = Path('.')
required = [
    'index.html', 'tienda.html', 'admin.html', 'activacion.html',
    'assets/finance-v27.js', 'assets/finance-v27.css',
    'assets/procurement-v25.js', 'assets/procurement-v25.css',
    'assets/procurement-v25-guard.js',
    'assets/commerce-runtime-config.js',
    'assets/images/brand-final/home-hero.webp',
    'assets/images/brand-final/home-hero-mobile.webp',
    'assets/images/brand-final/producto-margherita.webp',
    'assets/images/brand-final/producto-la-errante.webp',
    'assets/images/brand-final/producto-diavola.webp',
    'assets/images/brand-final/producto-bosque.webp',
    'assets/images/brand-final/producto-cuatro-quesos.webp',
    'service-worker.js', 'servidor_demo.py',
    'tests/e2e/finance-v27.spec.js',
    'tests/e2e/procurement-v25.spec.js'
]
missing = [p for p in required if not (root / p).is_file()]
empty = [p for p in required if (root / p).is_file() and (root / p).stat().st_size == 0]
files = [p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts]
total = sum(p.stat().st_size for p in files)
webps = list((root / 'assets/images').rglob('*.webp'))
config = (root / 'assets/commerce-runtime-config.js').read_text(encoding='utf-8') if (root / 'assets/commerce-runtime-config.js').is_file() else ''
errors = []
if missing: errors.append(f'Archivos faltantes: {missing}')
if empty: errors.append(f'Archivos vacíos: {empty}')
if len(webps) < 10: errors.append(f'Solo se encontraron {len(webps)} imágenes WebP; el paquete está incompleto.')
if total < 4_000_000: errors.append(f'El contenido descomprimido pesa solo {total/1024/1024:.2f} MB; se esperaba un paquete completo superior a 4 MB.')
if 'url: ""' not in config or 'publishableKey: ""' not in config:
    errors.append('Supabase no aparece inactivo como se esperaba.')

print('EL ERRANTE LOCAL V2.7 — VERIFICACIÓN')
print(f'Archivos físicos: {len(files)}')
print(f'Imágenes WebP: {len(webps)}')
print(f'Tamaño descomprimido: {total/1024/1024:.2f} MB')
if errors:
    print('\nERROR: EL PAQUETE NO ESTÁ COMPLETO O NO ES SEGURO')
    for error in errors:
        print('-', error)
    sys.exit(1)
print('\nOK: paquete completo, activos presentes y Supabase inactivo.')
PY

read -r -p "Presiona Enter para cerrar..."
