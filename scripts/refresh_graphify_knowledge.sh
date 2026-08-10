#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRAPHIFY_VERSION="${GRAPHIFY_VERSION:-0.9.26}"
GRAPHIFY_FULL_OBSIDIAN="${GRAPHIFY_FULL_OBSIDIAN:-0}"
cd "$ROOT"

if command -v uvx >/dev/null 2>&1; then
  GRAPHIFY=(uvx --from "graphifyy[sql]==${GRAPHIFY_VERSION}" graphify)
elif command -v graphify >/dev/null 2>&1; then
  GRAPHIFY=(graphify)
else
  echo "ERROR: instala uv (recomendado) o graphifyy antes de continuar." >&2
  echo "Con uv instalado puedes ejecutar este script sin instalación global de Graphify." >&2
  exit 1
fi

echo "==> Graphify ${GRAPHIFY_VERSION}: extracción estructural local"
"${GRAPHIFY[@]}" extract . --code-only

test -s graphify-out/graph.json

echo "==> Generando reporte arquitectónico"
"${GRAPHIFY[@]}" cluster-only . --no-viz

test -s graphify-out/GRAPH_REPORT.md

echo "==> Exportando wiki compacta navegable por ChatGPT y Obsidian"
"${GRAPHIFY[@]}" export wiki

test -s graphify-out/wiki/index.md

# Graphify puede conservar backups fechados del grafo anterior. Son útiles para
# depuración puntual pero no para la memoria viva. Este glob funciona también
# con el find/BSD shell de macOS.
for snapshot in graphify-out/????-??-??; do
  [ -d "$snapshot" ] && rm -rf "$snapshot"
done

# El export Obsidian detallado por nodo es opcional. En ELERRANTE produce del
# orden de miles de notas regenerables, por lo que nunca se versiona.
if [ "$GRAPHIFY_FULL_OBSIDIAN" = "1" ]; then
  rm -rf knowledge/90_GRAPHIFY_AUTO
  mkdir -p knowledge/90_GRAPHIFY_AUTO
  echo "==> Exportando vault Graphify detallado (local, no versionado)"
  "${GRAPHIFY[@]}" export obsidian --dir knowledge/90_GRAPHIFY_AUTO
fi

printf '\nGraphify listo.\n- graphify-out/graph.json\n- graphify-out/GRAPH_REPORT.md\n- graphify-out/wiki/\n'
if [ "$GRAPHIFY_FULL_OBSIDIAN" = "1" ]; then
  printf '%s\n' '- knowledge/90_GRAPHIFY_AUTO/ (local, ignorado por Git)'
fi
