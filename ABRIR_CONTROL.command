#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
PORT=""
if [ -f ".demo_port" ]; then PORT="$(cat .demo_port)"; fi
if [ -n "$PORT" ]; then
  open "http://127.0.0.1:${PORT}/control.html"
else
  echo "La demo no está corriendo. Iniciándola..."
  ./ABRIR_EL_ERRANTE.command
fi
