#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
clear
if ! command -v python3 >/dev/null 2>&1; then
  echo "No se encontró Python 3."
  echo "Instálalo desde python.org o mediante Homebrew y vuelve a intentar."
  read -n 1 -s -r -p "Presiona cualquier tecla para cerrar."
  exit 1
fi
python3 "$DIR/servidor_demo.py"
