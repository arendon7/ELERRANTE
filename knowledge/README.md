# ELERRANTE Knowledge

Este directorio es la memoria persistente del proyecto y puede abrirse directamente como vault de Obsidian.

## Autoridad

1. **GitHub `main`**: verdad técnica y ejecutable.
2. **`00_CANON/ESTADO_ACTUAL.md`**: resumen humano del estado certificado. Si contradice `main`, gana `main` y esta nota debe corregirse.
3. **`graphify-out/`**: mapa estructural generado automáticamente desde el código.
4. **`90_GRAPHIFY_AUTO/`**: notas Obsidian generadas por Graphify. Es una zona desechable/regenerable y nunca se edita a mano.
5. **`10_DECISIONES/`**: decisiones humanas y su razonamiento.

## Protocolo para ChatGPT al retomar trabajo

Antes de reconstruir el repositorio archivo por archivo:

1. Leer `knowledge/00_CANON/ESTADO_ACTUAL.md`.
2. Leer `graphify-out/GRAPH_REPORT.md` si existe.
3. Consultar `graphify-out/wiki/` o buscar en `knowledge/90_GRAPHIFY_AUTO/` el módulo implicado.
4. Verificar en GitHub únicamente los archivos fuente afectados y el SHA actual de `main`.
5. Antes de modificar, identificar dependencias y contratos de prueba relacionados.
6. Después de un merge importante, actualizar `ESTADO_ACTUAL.md` y regenerar Graphify.

## Obsidian

En Obsidian: **Open folder as vault** → seleccionar `knowledge/`.

La configuración local `.obsidian/` no se versiona. Esto evita imponer plugins, apariencia o preferencias personales al repositorio.
