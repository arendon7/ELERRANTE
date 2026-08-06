#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: no se encontró Python 3."
  read -r -p "Presiona Enter para cerrar..."
  exit 1
fi

python3 verificar_demo.py
python3 scripts/verificar_canon_marca_v28.py
python3 scripts/verificar_activos_hq_v28.py
python3 scripts/verificar_modulos_v28.py

python3 - <<'PY'
from pathlib import Path
root=Path('.')
files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts]
webps=list((root/'assets/images/brand-final').glob('*.webp'))
print('')
print('PAQUETE LOCAL V2.8')
print(f'Archivos físicos: {len(files)}')
print(f'Activos WebP canónicos: {len(webps)}')
print(f'Tamaño descomprimido: {sum(p.stat().st_size for p in files)/1024/1024:.2f} MB')
print('RESULTADO FINAL: OK')
PY
read -r -p "Presiona Enter para cerrar..."
