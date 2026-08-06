# EL ERRANTE · Canon de marca y contenido V2.8

## Decisión canónica

La segunda edición local V2.7 es la referencia aprobada para imágenes, contenidos y tratamiento de marca. La V2.8 consolida esa experiencia y evita que fuentes históricas modifiquen la interfaz según el entorno, el orden de carga o la caché.

## Problema corregido

La aplicación acumulaba varias capas con capacidad de sobrescribir imágenes o contenidos:

1. fuente histórica reconstruida desde fragmentos Base64;
2. ampliación editorial y comercial de `products-v6.js`;
3. remapeo visual dentro de `data.js`;
4. un segundo mapa de reemplazo dentro de `host-mode.js`;
5. service workers, verificadores y workflows que todavía esperaban versiones V1.1.1, V1.3, V2.4 o V2.5 como versión global.

Esa superposición explicaba que dos paquetes derivados del proyecto mostraran composiciones, textos o tratamiento de marca diferentes.

## Arquitectura V2.8

- `assets/brand-canon-v28.js` es la única fuente activa de logos, activos HQ, aliases históricos, imagen primaria y galería de cada producto.
- `assets/data.js` conserva las fichas y la redacción ampliada de la segunda versión local, pero normaliza todos los campos visuales antes de exponer `EE_DATA`.
- `assets/host-mode.js` ya no mantiene un mapa visual propio; aplica el canon compartido al DOM y administra únicamente entorno, navegación y actualización de caché.
- `service-worker.js` importa el mismo canon, intercepta solicitudes de rutas históricas y sirve el activo HQ equivalente.
- La caché cambia a `el-errante-v2-8-brand-canon-1`, eliminando combinaciones anteriores.
- `scripts/exportar-fuente-canonica.mjs` aplica el manifiesto V2.8 antes de generar el JSON y JavaScript canónicos.
- Los cuatro paquetes visuales embebidos y su materializador fueron movidos a `archive/legacy-brand-overlays/`.
- Los validadores que mezclaban la versión funcional de un módulo con la versión global fueron movidos a `archive/legacy-verifiers/`.
- Los workflows de validación, auditoría, Playwright, Pages y salud pública utilizan la misma expectativa V2.8.

## Materialización de fuentes

Los fragmentos Base64 se conservan como fuente histórica reproducible, no como formato de ejecución preferido. El proceso:

```text
scripts/materializar_fuentes_locales_v28.py
```

concatena, valida y decodifica los fragmentos originales; comprueba contratos mínimos; genera salidas atómicas; y registra tamaños y SHA-256 en:

```text
assets/generated/manifest-v28.json
```

Las salidas son:

```text
assets/generated/data-v28.js
assets/generated/app-v28.js
assets/generated/preprod-v28.js
```

La edición local materializa antes de verificar y abrir. Los workflows materializan antes de auditar, ejecutar Playwright y construir `_site`. `data.js`, `app.js` y `preprod.js` usan las fuentes legibles cuando están presentes y solo recurren a Base64 como fallback de compatibilidad.

`assets/generated/` no se versiona porque es un producto reproducible; sí se incluye físicamente en la edición local después de la primera verificación y en el artefacto de Pages.

## Barreras vigentes

- `verificar_demo.py`: estructura, referencias, seguridad, fuentes materializadas y coherencia integral.
- `scripts/verificar_canon_marca_v28.py`: fuente única de identidad y aliases.
- `scripts/verificar_activos_hq_v28.py`: integridad, tamaño, formato y hashes de los WebP.
- `scripts/verificar_modulos_v28.py`: pedidos, backend, confianza, activación, producción, materiales, medición, abastecimiento, finanzas y materialización.
- Playwright: comportamiento en escritorio y móvil.

## Regla de precedencia

`canon V2.8 -> activo brand-final HQ -> ficha ampliada de la segunda versión local -> fuente materializada legible -> Base64 únicamente como fallback`.

Ninguna ruta histórica puede gobernar la interfaz, el catálogo exportado ni la caché.

## Estado de deuda técnica

La deuda activa que causaba diferencias de marca, imágenes y contenidos queda eliminada de las rutas de ejecución preferidas. Se mantienen archivos históricos en `archive/` y fragmentos Base64 en `assets/source/` por trazabilidad y recuperación, pero están aislados del control visual y solo actúan como fuente reproducible o contingencia.

La validación funcional completa de navegador continúa requiriendo Playwright de escritorio y móvil sobre el mismo SHA final antes de integrar a `main`.
