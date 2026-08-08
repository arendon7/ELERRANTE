# Changelog

## [3.0.0] — Operación y Finanzas separadas

### Arquitectura interna

- `centro-interno.html` pasa a ser la puerta interna de El Errante.
- `control.html` concentra prioridades y alertas operativas.
- `operacion.html` compone Agenda V2.1, Producción V2.2, Materiales/BOM V2.3, Medición V2.4 y Abastecimiento V2.5.
- `finanzas.html` queda aislado de producción e inventario operativo.
- `admin.html` permanece temporalmente como superficie heredada de compatibilidad.

### Panel operativo

- Pedidos comprometidos se convierten en prioridades diarias.
- Explosión BOM y lectura de requerimientos sin generar compras automáticas.
- Distinción estricta entre inventario desconocido y cero confirmado.
- Alertas por SKU sin BOM, pedidos sin fecha, faltantes físicos y alistamientos incompletos.

### MFO / Finanzas

- Finanzas V2.7 conserva hechos locales y V3.0 añade Plan vs. Real.
- El snapshot MFO se guarda únicamente en el navegador y nunca sobrescribe hechos operativos.
- COGS real exige costo capturado en la línea del pedido; no se reconstruye desde el plan.
- Compras, COGS, inventario y caja permanecen separados.
- Integración del perfil real `MFO v3.3` de nueve hojas.
- Exportador privado con reconciliación de plan, costos, caja, supuestos, escenarios, decisiones y auditoría.
- Panel enriquecido con decisiones del modelo, escenarios del año 1 y pendientes de calidad.

### Seguridad y calidad

- `private-data/` queda fuera de Git.
- El workbook financiero y snapshots con cifras no se versionan.
- Barrera `scripts/verificar_v30_separacion.py` y regresión Playwright desktop/móvil.
- Supabase continúa inactivo deliberadamente.

## [2.9.0] — Narrativa, contenido y recorrido de cliente

- Home reorganizada como recorrido de origen → método → elección → credibilidad → conversión.
- Historia, Nuestra cocina, Equipo y Bitácora pasan a tener funciones editoriales diferenciadas.
- Las 11 referencias reciben relato, perfil, proceso, uso y límites propios.
- Equipo deja de ser una superficie técnica; las herramientas internas pasan a `centro-interno.html`.
- Navegación pública simplificada.
- Checkout, Ayuda, Eventos y Seguimiento dejan de simular acciones que el backend inactivo no puede confirmar.
- Correcciones responsive y de checkout validadas en desktop y móvil.

## [2.8.0] — Canon transversal y superficie materializada

### Consolidado

- La segunda versión local V2.7 se adopta como referencia visual y editorial aprobada.
- `assets/brand-canon-v28.js` queda como única fuente activa de identidad, aliases, imágenes y galerías.
- Se conservan Abastecimiento V2.5 y Finanzas Operativas V2.7 dentro de la aplicación integral V2.8.
- La caché global se unifica bajo el canon V2.8.

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
