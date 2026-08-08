#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGE="${1:-index.html}"
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  osascript -e 'display alert "El Errante" message "No se encontró Python 3. Instala Python 3 o las herramientas de desarrollo de macOS." as critical'
  exit 1
fi

if [ -f .demo_port ]; then
  PORT="$(cat .demo_port 2>/dev/null || true)"
  if [ -n "$PORT" ] && lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
    open "http://127.0.0.1:${PORT}/${PAGE}?brand=2.8.0&release=3.1.1"
    exit 0
  fi
  rm -f .demo_port
fi

python3 scripts/materializar_fuentes_locales_v28.py
python3 verificar_demo.py
python3 scripts/verificar_canon_marca_v28.py
python3 scripts/verificar_activos_hq_v28.py
python3 scripts/verificar_modulos_v28.py
python3 scripts/verificar_v30_separacion.py
python3 scripts/verificar_v31_interno.py
python3 scripts/verificar_release_v31.py
python3 scripts/preparar_sitio_materializado_v28.py --output .local_site

exec python3 servidor_demo.py "$PAGE"
