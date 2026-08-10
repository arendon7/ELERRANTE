#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRAPHIFY_VERSION="${GRAPHIFY_VERSION:-0.9.26}"
cd "$ROOT"

if command -v uvx >/dev/null 2>&1; then
  GRAPHIFY=(uvx --from "graphifyy==${GRAPHIFY_VERSION}" graphify)
elif command -v graphify >/dev/null 2>&1; then
  GRAPHIFY=(graphify)
else
  echo "ERROR: instala uv (recomendado) o graphifyy antes de continuar." >&2
  echo "macOS: brew install uv && uv tool install graphifyy" >&2
  exit 1
fi

echo "==> Graphify ${GRAPHIFY_VERSION}: extracción estructural local"
"${GRAPHIFY[@]}" extract . --code-only --out graphify-out

test -s graphify-out/graph.json

# Esta carpeta es 100 % regenerable. Nunca guardar notas humanas aquí.
rm -rf knowledge/90_GRAPHIFY_AUTO
mkdir -p knowledge/90_GRAPHIFY_AUTO

echo "==> Exportando vault automático para Obsidian"
"${GRAPHIFY[@]}" export obsidian --dir knowledge/90_GRAPHIFY_AUTO

# La wiki es la superficie más cómoda para agentes; no bloquea el grafo si una
# versión de Graphify no puede regenerarla por falta de análisis auxiliar.
echo "==> Exportando wiki navegable para agentes"
"${GRAPHIFY[@]}" export wiki || echo "AVISO: wiki no generada; graph.json y Obsidian siguen siendo válidos."

printf '\nGraphify listo.\n- graphify-out/graph.json\n- graphify-out/GRAPH_REPORT.md (si la versión lo genera)\n- graphify-out/wiki/ (si disponible)\n- knowledge/90_GRAPHIFY_AUTO/\n'
