#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRAPHIFY_VERSION="${GRAPHIFY_VERSION:-0.9.26}"
cd "$ROOT"

if command -v uvx >/dev/null 2>&1; then
  # Incluimos el extra SQL porque ELERRANTE contiene migraciones/esquemas que
  # deben formar parte del mapa estructural.
  GRAPHIFY=(uvx --from "graphifyy[sql]==${GRAPHIFY_VERSION}" graphify)
elif command -v graphify >/dev/null 2>&1; then
  GRAPHIFY=(graphify)
else
  echo "ERROR: instala uv (recomendado) o graphifyy antes de continuar." >&2
  echo "macOS: brew install uv && uv tool install 'graphifyy[sql]'" >&2
  exit 1
fi

echo "==> Graphify ${GRAPHIFY_VERSION}: extracción estructural local"
# Sin --out: Graphify usa su ruta canónica <repo>/graphify-out/. Pasar
# --out graphify-out crea un graphify-out/graphify-out en v0.9.26.
"${GRAPHIFY[@]}" extract . --code-only

test -s graphify-out/graph.json

# El headless extract deja el grafo y el análisis; cluster-only materializa el
# reporte humano y etiquetas sin volver a extraer el corpus.
echo "==> Generando reporte arquitectónico"
"${GRAPHIFY[@]}" cluster-only graphify-out --no-viz

test -s graphify-out/GRAPH_REPORT.md

# Esta carpeta es 100 % regenerable. Nunca guardar notas humanas aquí.
rm -rf knowledge/90_GRAPHIFY_AUTO
mkdir -p knowledge/90_GRAPHIFY_AUTO

echo "==> Exportando vault automático para Obsidian"
"${GRAPHIFY[@]}" export obsidian --dir knowledge/90_GRAPHIFY_AUTO

echo "==> Exportando wiki navegable para agentes"
"${GRAPHIFY[@]}" export wiki || echo "AVISO: wiki no generada; graph.json, reporte y Obsidian siguen siendo válidos."

printf '\nGraphify listo.\n- graphify-out/graph.json\n- graphify-out/GRAPH_REPORT.md\n- graphify-out/wiki/ (si disponible)\n- knowledge/90_GRAPHIFY_AUTO/\n'
