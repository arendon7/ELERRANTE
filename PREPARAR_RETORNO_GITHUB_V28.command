#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$HOME/Desktop/EL_ERRANTE_RETORNO_GITHUB_V28_${STAMP}.zip"
cd "$DIR"

python3 verificar_demo.py
python3 scripts/verificar_canon_marca_v28.py
python3 scripts/verificar_activos_hq_v28.py
python3 scripts/verificar_modulos_v28.py

/usr/bin/zip -qry "$OUT" . \
  -x '*.DS_Store' \
  -x 'test-results/*' \
  -x 'playwright-report/*' \
  -x '.git/*' \
  -x '.demo_port'

echo "Paquete de retorno V2.8 creado:"
echo "$OUT"
open -R "$OUT"
read -r -p "Presiona Enter para cerrar..."
