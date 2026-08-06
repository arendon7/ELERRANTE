#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
python3 scripts/verificar_canon_marca_v28.py
python3 - <<'PY'
from pathlib import Path
root=Path('.')
files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts]
webps=list((root/'assets/images/brand-final').glob('*.webp'))
print(f'Archivos físicos: {len(files)}')
print(f'Activos WebP canónicos: {len(webps)}')
print(f'Tamaño descomprimido: {sum(p.stat().st_size for p in files)/1024/1024:.2f} MB')
PY
read -r -p "Presiona Enter para cerrar..."
