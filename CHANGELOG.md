# Changelog

## [2.8.0] — Canon transversal y superficie materializada

### Consolidado

- La segunda versión local V2.7 se adopta como referencia visual y editorial aprobada.
- `assets/brand-canon-v28.js` queda como única fuente activa de identidad, aliases, imágenes y galerías.
- Se conservan Abastecimiento V2.5 y Finanzas Operativas V2.7 dentro de la aplicación integral V2.8.
- La caché global se unifica en `el-errante-v2-8-brand-canon-1`.

### Separación fuente / ejecución

- `scripts/materializar_fuentes_locales_v28.py` genera `data-v28.js`, `app-v28.js`, `preprod-v28.js` y un manifiesto SHA-256.
- `scripts/preparar_sitio_materializado_v28.py` construye `.local_site` para Mac y Playwright, y `_site` para Pages.
- Los HTML ejecutables cargan directamente las fuentes generadas y sus contratos V2.8.
- La superficie ejecutable excluye físicamente Base64, chunks, loaders heredados, overlays, archivos archivados y reportes históricos.
- Playwright sirve `.local_site`, de modo que escritorio, móvil y Mac prueban la misma superficie.

### Corregido

- Eliminada la competencia entre `data.js`, `host-mode.js`, service worker y overlays históricos.
- Corregidos workflows que todavía esperaban V2.4.
- Corregida la activación para la superficie V2.5 y el canon global V2.8.
- Unificados los lanzadores y el servidor local de macOS.
- Actualizado el exportador canónico para aplicar `brand-final` y `brand_asset_version=2.8.0`.
- Alineada la configuración comercial efectiva V2.5.

### Archivado

- Overlays: `archive/legacy-brand-overlays/`.
- Validadores globales antiguos: `archive/legacy-verifiers/`.
- Informes V0.x: `archive/early-iterations/`.

### Validación

- Barrera integral de estructura, referencias y seguridad.
- Canon visual único.
- Integridad física de WebP HQ.
- Verificación modular de operación, backend, activación, materiales, medición, abastecimiento y finanzas.
- Comprobación de fuentes generadas y ausencia de loaders Base64 en la superficie ejecutable.
- Playwright desktop/móvil y Pages pendientes de ejecución remota cuando GitHub Actions esté operativo.

## [2.7.0] — Finanzas Operativas

- Ventas, costo de ventas, margen, gastos, caja y punto de equilibrio.
- Separación entre COGS, compras, CAPEX, aportes y retiros.

## [2.5.0] — Abastecimiento controlado

- Borradores, aprobación, emisión, recepción, reconciliación y cancelación.
- Inventario actualizado únicamente con conteo físico y autorización.

## [2.4.0] — Medición y compras observadas

- Lotes, rendimiento, merma, proveedores y compras observadas.

## [0.5.0] — Gold Master Content

- Catálogo ampliado, biblioteca visual, eventos, recetas y entorno demostrativo inicial.
