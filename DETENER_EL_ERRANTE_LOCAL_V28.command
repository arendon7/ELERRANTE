#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PORT="$(cat .demo_port 2>/dev/null || true)"
if [ -n "$PORT" ]; then
  PIDS="$(lsof -ti "tcp:$PORT" 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    kill $PIDS
    echo "Servidor local de El Errante V2.8 detenido en el puerto $PORT."
  else
    echo "El archivo de puerto existía, pero el servidor ya no estaba activo."
  fi
  rm -f .demo_port
else
  echo "No había un servidor local de El Errante registrado."
fi
read -r -p "Presiona Enter para cerrar..."
