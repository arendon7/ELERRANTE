#!/bin/bash
PORT=8787
PIDS="$(lsof -ti tcp:$PORT 2>/dev/null || true)"
if [ -n "$PIDS" ]; then
  kill $PIDS
  echo "Servidor local de El Errante detenido."
else
  echo "No había un servidor local activo en el puerto $PORT."
fi
read -r -p "Presiona Enter para cerrar..."
