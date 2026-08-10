# Changelog

## Estado modular vigente sobre release integral 3.1.1

Esta sección registra capas compatibles incorporadas después de la publicación integral V3.1.1. **No implica que toda la aplicación haya cambiado su release integral a 3.2.9 o 3.3.0.**

### Operación V3.3.0 — evidencia y cierre trazable

- `operacion.html` incorpora **06 · Evidencia y cierre**.
- Nueva bitácora `ee_v330_operational_evidence` para soportes, tiempos, novedades y correcciones.
- Cinco controles de cierre: producción/lote, rendimiento/merma, conteo físico, recepción/soporte y tiempo/novedad.
- Las correcciones son append-only mediante `supersedes`; el registro anterior permanece intacto.
- Se rechaza evidencia con fecha futura y un periodo futuro se interpreta como `No aplica`, no como cero o incumplimiento.
- La nueva capa lee Producción, Medición y Compras sin modificar sus fuentes.
- La demo operativa respalda y restaura también la bitácora V3.3.0.
- Responsive móvil certificado sin overflow horizontal.

### Finanzas V3.2.0–V3.2.9 — profundidad acumulativa

El núcleo `finance-workbench-v31.js` permanece como contrato V3.1.0. Sobre él se cargan capas compatibles:

- V3.2.0 — profundidad financiera.
- V3.2.1 — ledger / movimientos trazables.
- V3.2.2 — economía unitaria.
- V3.2.3 — caja y tendencias.
- V3.2.4 — escenarios.
- V3.2.5 — decisiones.
- V3.2.6 — compras e inventario leídos desde Finanzas sin mutar Operación.
- V3.2.7 — resumen ejecutivo.
- V3.2.8 — readiness / calidad del dato.
- V3.2.9 — demo financiera sintética, aislada y reversible.

La profundidad efectiva actual del módulo financiero es V3.2.9.

### Hardening de shell V3.1.1

- Panel de control protegido por la misma sesión que Operación y Finanzas.
- Retorno seguro a destinos internos permitidos mediante `?next=`.
- Expiración efectiva en pestañas abiertas con revalidación de sesión.
- Demo operativa reversible y aislamiento de configuración remota.
- Navegación cruzada coherente entre Control, Operación y Finanzas.

### Gobierno de versiones

- Release integral: V3.1.1.
- Runtime/materialización: V2.8.0.
- Arquitectura interna: V3.1.
- Shell/sesión: V3.1.1.
- Operación: V3.3.0.
- Finanzas: V3.2.9.
- La matriz canónica vive en `documentacion/MAPA_VERSIONES_ACTIVAS.md`.

## [3.1.1] — Navegación interna y acceso explícito a Control / Operación / Finanzas

### Acceso y navegación

- `centro-interno.html` pasa de dos a tres destinos explícitos: **Panel de control**, **Operación** y **Finanzas**.
- `control.html` se incorpora formalmente a la shell V3.1, exige sesión y ofrece navegación directa a Operación y Finanzas.
- Operación y Finanzas incorporan acceso visible al Panel de control y navegación cruzada consistente.
- El selector interno adopta una composición responsive de tres tarjetas con jerarquía visual diferenciada.

### Calidad

- La regresión E2E exige que el primer acceso permita llegar a Panel de control y Finanzas.
- La barrera V3.1 valida que Control use el mismo guard de sesión y que los tres destinos estén conectados.
- El health-check público comprueba que `control.html` esté protegido y que la navegación V3.1.1 exista en Pages.

## [3.1.0] — Acceso, Operación consolidada y Financial Workbench

### Acceso y arquitectura

- Nuevo `acceso.html` como puerta de usuarios desde un enlace discreto en el footer público.
- Configuración local del primer usuario sin contraseñas embebidas: PBKDF2/SHA-256, sal aleatoria y sesión de ocho horas.
- `centro-interno.html` pasa a ser selector explícito entre **Operación** y **Finanzas**.
- Guard de sesión compartido y acción de cambiar módulo/cerrar sesión.
- La UI local queda preparada para sustituir el proveedor de autenticación por Supabase Auth + RLS en una fase posterior.

### Operación

- `operacion.html` se consolida como módulo operativo único.
- El resumen `control-v30` se integra antes de Pedidos, Producción, Materiales, Inventario/Medición y Compras.
- Se preservan los motores validados V2.1–V2.5 sin introducir métricas financieras dentro del flujo de ejecución.
- Se mantienen las reglas: necesidad teórica ≠ compra, inventario desconocido ≠ cero y plan financiero ≠ hecho operativo.

### Finanzas

- Nuevo `finance-workbench-v31.js` sustituye la yuxtaposición visible MFO V3.0 + Finanzas V2.7 por una sola aplicación financiera.
- Snapshot MFO privado tratado como **baseline inmutable**.
- Nuevo **working model** editable e independiente.
- Plan de ventas 24M editable por SKU/mes con recálculo de ventas, COGS y caja.
- Precio, costo directo y calidad del costo editables.
- Compras, gasto operativo, auxiliares, pago de Juan, reserva tributaria, arriendo y CAPEX plan editables.
- Registro de movimientos reales separado del plan.
- Dashboard con KPIs y gráficas SVG autocontenidas para Plan vs. Real, ventas por producto y caja.
- Escenarios, decisiones y supuestos editables.
- Historial local de cambios y exportación del working model.
- COGS real conserva el costo histórico de la línea del pedido y nunca hace fallback al costo actual del catálogo.

### Diseño y experiencia

- Nuevo sistema `internal-v31.css` para acceso, selección de módulos, KPIs, navegación sticky, tablas editables, formularios, estados, gráficas y responsive.
- Acceso de usuarios integrado de forma pequeña y secundaria en el footer público.
- Navegación interna reestructurada por contexto en lugar de exponer una colección de pantallas técnicas.

### Calidad

- Nueva barrera `scripts/verificar_v31_interno.py`.
- `scripts/verificar_v30_separacion.py` pasa a validar invariantes heredados, no una composición visual congelada.
- Playwright cubre acceso, aislamiento del baseline, edición, gráficos, separación de módulos, footer público y móvil.
- Service worker incorpora las nuevas superficies V3.1.
- Supabase permanece inactivo deliberadamente durante esta release.

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
