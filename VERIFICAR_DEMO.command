#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
python3 verificar_demo.py
echo ""
read -n 1 -s -r -p "Presiona cualquier tecla para cerrar."
