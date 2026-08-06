#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: no se encontró Python 3."
  read -r -p "Presiona Enter para cerrar..."
  exit 1
fi

python3 scripts/materializar_fuentes_locales_v28.py
python3 verificar_demo.py
python3 scripts/verificar_canon_marca_v28.py
python3 scripts/verificar_activos_hq_v28.py
python3 scripts/verificar_modulos_v28.py
python3 scripts/preparar_sitio_materializado_v28.py --output .local_site

python3 - <<'PY'
from pathlib import Path
import json
root=Path('.')
site=root/'.local_site'
files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and '.local_site' not in p.parts]
site_files=[p for p in site.rglob('*') if p.is_file()]
webps=list((root/'assets/images/brand-final').glob('*.webp'))
generated=list((root/'assets/generated').glob('*'))
site_manifest=json.loads((site/'materialized-site-v28.json').read_text(encoding='utf-8'))
assert site_manifest['mode']=='materialized-no-base64-runtime'
assert not (site/'assets/source').exists()
assert not (site/'assets/data.js').exists()
assert 'assets/generated/data-v28.js' in (site/'index.html').read_text(encoding='utf-8')
print('')
print('PAQUETE LOCAL V2.8')
print(f'Archivos fuente: {len(files)}')
print(f'Archivos ejecutables materializados: {len(site_files)}')
print(f'Activos WebP canónicos: {len(webps)}')
print(f'Fuentes legibles generadas: {len(generated)}')
print(f'Tamaño fuente: {sum(p.stat().st_size for p in files)/1024/1024:.2f} MB')
print(f'Tamaño sitio ejecutable: {sum(p.stat().st_size for p in site_files)/1024/1024:.2f} MB')
print('Loaders Base64 activos en el sitio: 0')
print('RESULTADO FINAL: OK')
PY
read -r -p "Presiona Enter para cerrar..."
