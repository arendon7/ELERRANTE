# Cómo retomar ELERRANTE en un chat nuevo

Mensaje recomendado:

> Retoma ELERRANTE desde su memoria canónica. Confirma primero el SHA actual de `main` y lee `knowledge/00_CANON/ESTADO_ACTUAL.md`. Luego consulta `graphify-out/GRAPH_REPORT.md` y la wiki en la rama `knowledge/graphify-live`, verificando que el reporte corresponda al `main` actual. Usa después solamente los archivos fuente y tests relevantes de `main`. No reconstruyas el proyecto desde conversaciones antiguas si el repositorio ya contiene información más reciente.

## Orden

1. `main` + estado canónico.
2. Graphify vivo.
3. fuentes y tests afectados.
4. historial/PR únicamente si es necesario.

Las relaciones `INFERRED` de Graphify nunca sustituyen la verificación del código.

## Ruta de continuidad actualizada para Codex (12-oct-2026)

La ruta histórica anterior permanece válida para ubicar Graphify, pero la sesión nueva debe empezar por **[`INDICE_CODEX_2026-10-12.md`](INDICE_CODEX_2026-10-12.md)**. Allí están el dossier integral, el inventario de fuentes originales, la matriz de **65** Prompt Specs y la ruta verificable del piloto de 30 días.

El `main` observado sigue en `a6edba45...` y Graphify indica `Built from commit a6edba45`; volver a comprobar ambos antes de continuar. El proyecto Supabase `el-errante-production` estaba **INACTIVE** al 12-oct-2026, así que no se puede inferir disponibilidad real a partir de schemas o CI en verde. Esta actualización está propuesta en la rama `docs/codex-handoff-20261007`/PR #190, no fusionada todavía.
