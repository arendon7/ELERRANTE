# ELERRANTE Knowledge

Esta carpeta es la memoria humana persistente del proyecto. Graphify mantiene una segunda memoria, estructural y regenerable, publicada fuera de `main`.

## Autoridad

1. **GitHub `main`**: verdad técnica y ejecutable.
2. **`knowledge/00_CANON/ESTADO_ACTUAL.md` en `main`**: resumen humano del estado certificado. Si contradice `main`, gana `main` y la nota debe corregirse.
3. **Rama `knowledge/graphify-live`**: grafo, reporte y wiki generados automáticamente desde el `main` que indica el propio reporte.
4. **`knowledge/10_DECISIONES/`**: decisiones humanas y su razonamiento.
5. **`knowledge/90_GRAPHIFY_AUTO/`**: export Obsidian detallado opcional y local; nunca se versiona.

## Protocolo para ChatGPT al retomar trabajo

1. Confirmar el SHA actual de `main`.
2. Leer `knowledge/00_CANON/ESTADO_ACTUAL.md` desde `main`.
3. Leer `graphify-out/GRAPH_REPORT.md` desde `knowledge/graphify-live`.
4. Verificar que `Built from commit` corresponda al `main` actual. Si no coincide, considerar el grafo obsoleto y usar `main` como autoridad.
5. Consultar `graphify-out/wiki/` en `knowledge/graphify-live` para el módulo implicado.
6. Verificar en `main` únicamente los archivos fuente y tests relevantes antes de modificar.
7. Una relación `EXTRACTED` sirve para navegación. Toda relación `INFERRED` debe confirmarse contra el código antes de justificar una decisión.

## Obsidian en Mac

Abre la raíz local de `ELERRANTE/` como vault. Después ejecuta:

```bash
./scripts/refresh_graphify_knowledge.sh
```

Obsidian podrá navegar simultáneamente:

- `knowledge/`: memoria humana.
- `graphify-out/wiki/`: mapa estructural compacto.

Si quieres la exploración detallada por nodo:

```bash
GRAPHIFY_FULL_OBSIDIAN=1 ./scripts/refresh_graphify_knowledge.sh
```

Ese export se crea en `knowledge/90_GRAPHIFY_AUTO/` y puede borrarse sin pérdida.
