# EL ERRANTE · Canon de marca y contenido V2.8

## Decisión canónica

La segunda edición local V2.7 es la referencia aprobada para imágenes, contenidos y tratamiento de marca. La V2.8 consolida esa experiencia y evita que fuentes históricas modifiquen la interfaz según el entorno, el orden de carga o la caché.

## Problema corregido

La aplicación acumulaba varias capas con capacidad de sobrescribir imágenes o contenidos:

1. fuente histórica reconstruida desde fragmentos Base64;
2. ampliación editorial y comercial de `products-v6.js`;
3. remapeo visual dentro de `data.js`;
4. un segundo mapa de reemplazo dentro de `host-mode.js`;
5. service workers y workflows que todavía esperaban versiones V1.1.1 o V2.4.

Esa superposición explicaba que dos paquetes derivados del proyecto mostraran composiciones, textos o tratamiento de marca diferentes.

## Arquitectura V2.8

- `assets/brand-canon-v28.js` es la única fuente activa de logos, activos HQ, aliases históricos, imagen primaria y galería de cada producto.
- `assets/data.js` conserva las fichas y la redacción ampliada de la segunda versión local, pero normaliza todos los campos visuales antes de exponer `EE_DATA`.
- `assets/host-mode.js` ya no mantiene un mapa visual propio; aplica el canon compartido al DOM y administra únicamente entorno, navegación y actualización de caché.
- `service-worker.js` importa el mismo canon, intercepta solicitudes de rutas históricas y sirve el activo HQ equivalente.
- La caché cambia a `el-errante-v2-8-brand-canon-1`, eliminando combinaciones anteriores.
- `verificar_demo.py` y `scripts/verificar_canon_marca_v28.py` bloquean regresiones de marca, activos degradados, rutas faltantes, lanzadores obsoletos y overlays activos.
- Los cuatro paquetes visuales embebidos y su materializador fueron movidos a `archive/legacy-brand-overlays/`. Se conservan para trazabilidad, pero no participan en runtime, pruebas ni despliegue.
- Los workflows de validación, auditoría, Playwright, Pages y salud pública utilizan la misma expectativa V2.8.

## Regla de precedencia

`canon V2.8 -> activo brand-final HQ -> ficha ampliada de la segunda versión local -> fuente histórica solo como compatibilidad de datos`.

Ninguna ruta histórica puede gobernar la interfaz ni la caché.

## Deuda residual controlada

La reconstrucción Base64 de `data`, `app` y `preprod` todavía funciona como puente de compatibilidad porque esta sesión no pudo extraer los blobs completos sin truncamiento. La V2.8 impide que ese puente decida imágenes, galerías, versión, caché o identidad de marca. Su materialización en JavaScript legible será un cierre estructural posterior que no deberá cambiar la experiencia aprobada.
