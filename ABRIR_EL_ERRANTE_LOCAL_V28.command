#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
PORT=8787

if ! command -v python3 >/dev/null 2>&1; then
  osascript -e 'display alert "El Errante" message "No se encontró Python 3. Instala Python 3 o las herramientas de desarrollo de macOS." as critical'
  exit 1
fi

python3 scripts/verificar_canon_marca_v28.py

if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  open "http://127.0.0.1:$PORT/index.html?brand=2.8.0"
  exit 0
fi

echo "EL ERRANTE LOCAL V2.8 · CANON DE MARCA"
echo "Servidor: http://127.0.0.1:$PORT"
echo "Para detenerlo presiona Control + C."
(sleep 1; open "http://127.0.0.1:$PORT/index.html?brand=2.8.0") &
exec python3 -m http.server "$PORT" --bind 127.0.0.1
