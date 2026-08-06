#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$HOME/Desktop/EL_ERRANTE_RETORNO_GITHUB_V27_${STAMP}.zip"
cd "$DIR"
/usr/bin/zip -qry "$OUT" . \
  -x '*.DS_Store' \
  -x 'test-results/*' \
  -x 'playwright-report/*' \
  -x '.git/*'
echo "Paquete de retorno creado:"
echo "$OUT"
open -R "$OUT"
read -r -p "Presiona Enter para cerrar..."
