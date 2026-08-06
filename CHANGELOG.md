# Changelog

## [2.8.0] — Canon transversal de marca y contenido

### Consolidado

- Se adopta la segunda versión local V2.7 como referencia visual y editorial aprobada.
- Se crea `assets/brand-canon-v28.js` como única fuente activa de identidad, aliases, imágenes y galerías.
- Se normaliza el catálogo antes del renderizado y antes de la exportación canónica.
- Se unifica la caché en `el-errante-v2-8-brand-canon-1`.
- Se conservan Abastecimiento V2.5 y Finanzas Operativas V2.7 dentro de la aplicación integral V2.8.

### Fuentes ejecutables

- Se añade `scripts/materializar_fuentes_locales_v28.py`.
- `data`, `app` y `preprod` se materializan como JavaScript legible y determinista antes de abrir localmente, validar o publicar.
- `assets/generated/manifest-v28.json` registra tamaño y SHA-256 de salidas y fragmentos de origen.
- Los loaders priorizan las fuentes materializadas y mantienen Base64 únicamente como fallback de compatibilidad.
- El service worker cachea opcionalmente las fuentes generadas sin bloquear el fallback.

### Corregido

- Eliminada la competencia entre remapeos de `data.js`, `host-mode.js`, service worker y overlays históricos.
- Corregidos workflows que todavía esperaban V2.4.
- Corregido el test de activación para la superficie V2.5 y el canon global V2.8.
- Unificados los lanzadores locales y el servidor de macOS.
- Actualizado el exportador para producir datos con imágenes `brand-final` y `brand_asset_version=2.8.0`.
- Alineada la configuración comercial efectiva V2.5 con la aplicación integral V2.8.

### Archivado

- Overlays y materializador visual trasladados a `archive/legacy-brand-overlays/`.
- Validadores acoplados a versiones globales antiguas trasladados a `archive/legacy-verifiers/`.
- Informes de iteraciones V0.1–V0.6 trasladados a `archive/early-iterations/`.

### Validación

- Barrera integral de estructura, referencias y seguridad.
- Barrera de canon visual.
- Integridad física de WebP HQ.
- Barrera modular de operación, backend, activación, materiales, medición, abastecimiento y finanzas.
- Control de existencia e integridad de las tres fuentes materializadas.
- Suite Playwright de escritorio y móvil pendiente de ejecución remota cuando GitHub Actions esté operativo.

## [2.7.0] — Finanzas Operativas

- Resumen mensual de ventas, costo de ventas, margen, gastos y caja.
- Separación entre COGS, compras de inventario, CAPEX, aportes y retiros.
- Punto de equilibrio, alertas, evidencia del dato y exportación CSV.

## [2.5.0] — Abastecimiento controlado

- Borradores de compra desde faltantes confirmados.
- Aprobación, emisión, recepción, reconciliación y cancelación separadas.
- Barreras contra emisión sin evidencia y recepción duplicada.
- Inventario actualizado únicamente con conteo físico y autorización.

## [2.4.0] — Medición y compras observadas

- Registro de lotes, rendimiento y merma.
- Proveedores y compras observadas.
- Protección de inventario sin conteo físico.

## [0.5.0] — Gold Master Content

- Catálogo ampliado, biblioteca visual, eventos, recetas y entorno demostrativo inicial.
