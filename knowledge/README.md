# ELERRANTE Knowledge

Este directorio contiene la memoria humana persistente del proyecto. La raíz completa del repositorio puede abrirse como vault de Obsidian para navegar conjuntamente esta memoria y la wiki generada por Graphify.

## Autoridad

1. **GitHub `main`**: verdad técnica y ejecutable.
2. **`knowledge/00_CANON/ESTADO_ACTUAL.md`**: resumen humano del estado certificado. Si contradice `main`, gana `main` y esta nota debe corregirse.
3. **`graphify-out/GRAPH_REPORT.md` + `graphify-out/wiki/`**: mapa estructural generado automáticamente desde el código.
4. **`knowledge/10_DECISIONES/`**: decisiones humanas y su razonamiento.
5. **`knowledge/90_GRAPHIFY_AUTO/`**: export Obsidian detallado opcional, local y regenerable; nunca se versiona.

## Protocolo para ChatGPT al retomar trabajo

Antes de reconstruir el repositorio archivo por archivo:

1. Leer `knowledge/00_CANON/ESTADO_ACTUAL.md`.
2. Leer `graphify-out/GRAPH_REPORT.md`.
3. Consultar `graphify-out/wiki/` para el módulo implicado.
4. Verificar en GitHub únicamente los archivos fuente afectados y el SHA actual de `main`.
5. Las relaciones `EXTRACTED` sirven para navegación; toda relación `INFERRED` debe confirmarse contra el código antes de justificar un cambio.
6. Antes de modificar, identificar dependencias y contratos de prueba relacionados.
7. Después de un cambio importante, actualizar `ESTADO_ACTUAL.md` y regenerar Graphify.

## Obsidian

En Obsidian: **Open folder as vault** → seleccionar la raíz del repositorio `ELERRANTE/`.

Así quedan visibles al mismo tiempo:

- `knowledge/`: decisiones, estado y handoffs humanos.
- `graphify-out/wiki/`: mapa Markdown compacto generado por Graphify.

La configuración `.obsidian/` no se versiona.

Para generar además el vault Graphify detallado por nodo en tu Mac:

```bash
GRAPHIFY_FULL_OBSIDIAN=1 ./scripts/refresh_graphify_knowledge.sh
```

Ese export vive en `knowledge/90_GRAPHIFY_AUTO/`, está ignorado por Git y puede borrarse/reconstruirse sin pérdida.
