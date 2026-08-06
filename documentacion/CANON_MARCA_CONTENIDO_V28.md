# EL ERRANTE · Canon de marca y contenido V2.8

## Decisión canónica

La segunda edición local V2.7 es la referencia aprobada para imágenes, contenidos y tratamiento de marca. V2.8 conserva sus mejores activos y elimina la posibilidad de que capas históricas alteren el resultado según entorno, orden de carga o caché.

## Causa raíz corregida

La aplicación acumulaba fuente Base64, ampliaciones de catálogo, remapeos en `data.js`, otro mapa en `host-mode.js`, overlays visuales, service workers y verificadores con expectativas globales diferentes. Esa superposición explicaba que dos paquetes mostraran marcas, imágenes o contenidos distintos.

## Fuente única de marca

`assets/brand-canon-v28.js` gobierna exclusivamente:

- logo y lockup;
- activos WebP HQ;
- aliases de rutas históricas;
- imagen principal y galería de los 11 productos;
- versión integral `2.8.0`;
- caché `el-errante-v2-8-brand-canon-1`.

`host-mode.js`, el catálogo exportado y el service worker consumen este mismo canon.

## Separación fuente / ejecución

### Árbol fuente

Conserva fragmentos Base64 en `assets/source/` para trazabilidad y recuperación, loaders de compatibilidad, documentación, pruebas y archivos históricos bajo `archive/`.

### Superficie materializada

Se construye con:

```text
scripts/materializar_fuentes_locales_v28.py
scripts/preparar_sitio_materializado_v28.py
```

El primer script genera:

```text
assets/generated/data-v28.js
assets/generated/app-v28.js
assets/generated/preprod-v28.js
assets/generated/manifest-v28.json
```

El segundo crea `.local_site` o `_site`, sustituye las referencias HTML y excluye Base64, chunks, loaders y archivos históricos. La superficie ejecutable carga directamente las fuentes generadas y los contratos:

```text
assets/data-finalize-v28.js
assets/app-contract-v28.js
assets/preprod-contract-v28.js
```

Mac sirve `.local_site`; Playwright prueba `.local_site`; Pages publica `_site`. Las tres rutas usan la misma construcción.

## Regla de precedencia

`canon V2.8 -> WebP brand-final -> ficha ampliada local aprobada -> fuente JavaScript materializada`.

Base64 no participa en la ejecución normal. Solo puede actuar como contingencia al servir el árbol fuente sin materializar, una ruta no utilizada por Mac, Playwright ni Pages.

## Aislamiento histórico

- Overlays y materializador visual: `archive/legacy-brand-overlays/`.
- Validadores acoplados a versiones antiguas: `archive/legacy-verifiers/`.
- Reportes V0.x: `archive/early-iterations/`.

Nada bajo `archive/` se copia a la superficie ejecutable.

## Barreras vigentes

- `verificar_demo.py`: estructura, referencias, seguridad y coherencia integral.
- `scripts/verificar_canon_marca_v28.py`: identidad y aliases.
- `scripts/verificar_activos_hq_v28.py`: integridad física de WebP.
- `scripts/verificar_modulos_v28.py`: operación, backend, activación, materiales, medición, abastecimiento, finanzas y fuentes generadas.
- `scripts/preparar_sitio_materializado_v28.py`: ausencia de Base64 y loaders en la superficie.
- Playwright: escritorio y móvil sobre `.local_site`.

## Versiones funcionales preservadas

La versión integral es V2.8. Los módulos conservan su propia trazabilidad:

- confianza V1.9;
- operación diaria V2.1;
- producción V2.2;
- materiales V2.3;
- medición V2.4;
- abastecimiento V2.5;
- finanzas V2.7.

Estas versiones describen contratos funcionales; ninguna vuelve a gobernar marca, caché o versión global.

## Estado de deuda técnica

La deuda activa que generaba diferencias de marca, contenido e imágenes queda retirada de la superficie ejecutable. Los elementos históricos se mantienen deliberadamente como evidencia y recuperación, pero están aislados y excluidos del sitio local y público.

La integración a `main` permanece condicionada a auditoría canónica, Playwright desktop/móvil y publicación Pages exitosos sobre el mismo SHA final.
