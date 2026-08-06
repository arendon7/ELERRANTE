# EL ERRANTE · Canon de marca y contenido V2.8

## Decisión canónica

La segunda edición local V2.7 es la referencia aprobada para imágenes, contenidos y tratamiento de marca. La V2.8 consolida esa experiencia y evita que fuentes históricas modifiquen la interfaz según el entorno, el orden de carga o la caché.

## Problema corregido

La aplicación acumulaba cuatro capas con capacidad de sobrescribir imágenes o contenidos:

1. fuente histórica reconstruida desde fragmentos Base64;
2. ampliación `products-v6.js`;
3. remapeo visual dentro de `data.js`;
4. un segundo mapa de reemplazo dentro de `host-mode.js`.

Además, el service worker podía conservar una combinación anterior de HTML, scripts e imágenes. Esto explicaba que la versión local y la publicada mostraran composiciones diferentes.

## Arquitectura V2.8

- `assets/brand-canon-v28.js` es la única fuente activa de logos, activos HQ, aliases históricos, imagen primaria y galería de cada producto.
- `assets/data.js` conserva las fichas y la redacción ampliada de la segunda versión local, pero normaliza todos los campos visuales antes de exponer `EE_DATA`.
- `assets/host-mode.js` ya no mantiene un mapa visual propio; aplica el canon compartido al DOM y administra únicamente entorno, navegación y actualización de caché.
- `service-worker.js` importa el mismo canon, intercepta solicitudes de rutas históricas y sirve el activo HQ equivalente.
- La caché cambia a `el-errante-v2-8-brand-canon-1`, eliminando combinaciones anteriores.
- `scripts/verificar_canon_marca_v28.py` bloquea regresiones de marca, activos faltantes y módulos visuales superpuestos.

## Regla de precedencia

`canon V2.8 -> activo brand-final HQ -> ficha ampliada de la segunda versión local -> fuente histórica solo como compatibilidad de datos`.

Una ruta histórica puede existir en el repositorio mientras se completa la materialización del catálogo, pero no puede gobernar la interfaz ni la caché.

## Próximo cierre estructural

Después de validar la V2.8 en escritorio y móvil, se podrá materializar la fuente Base64 en archivos JavaScript legibles y mover los fragmentos históricos a `archive/legacy-runtime/`. Ese cierre no debe cambiar contenidos ni visuales; únicamente retirará el puente de compatibilidad.
