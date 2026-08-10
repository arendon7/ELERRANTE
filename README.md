# El Errante V3.1.1

**Masa · Fuego · Territorio**

Webapp pública e interna de El Errante. La release integral vigente es **V3.1.1**, construida sobre el canon técnico/materializado V2.8 y la línea pública/editorial V2.9. Dentro de esa distribución, los motores base conservan sus contratos históricos —**Operación V3.3.0** y **Finanzas V3.2.9**— mientras las superficies internas han evolucionado mediante overlays compatibles: horizonte V3.4, cierre gerencial/capacidad V3.5 y cierre diario/continuidad V3.6.

La numeración de módulo no sustituye automáticamente la versión integral. El mapa completo y las reglas de versionado están en `documentacion/MAPA_VERSIONES_ACTIVAS.md`.

## Estado canónico

- Release integral: `3.1.1`.
- Release integral anterior estable: `3.1.0`.
- Runtime / materialización: `2.8.0`.
- Canon de identidad, imágenes y activos: V2.8.
- Línea pública/editorial: V2.9.
- Arquitectura interna: V3.1.
- Shell y sesión interna: V3.1.1.
- Panel de control: shell V3.1.1 sobre motor Control V3.0; superficie efectiva con overlays V3.4–V3.6.
- Módulo Operativo efectivo: **V3.3.0**. Este marcador identifica el motor/base contractual; `operacion.html` presenta la superficie efectiva V3.6 mediante overlays compatibles V3.4–V3.6.
- Workbench Financiero base: V3.1.0.
- Módulo Financiero efectivo: **V3.2.9**. Este marcador identifica la profundidad base histórica; `finanzas.html` incorpora además V3.4 y V3.5 sin sustituir ese núcleo.
- Cierre diario y continuidad: V3.6.0, ledger local `ee_v36_daily_close_events`.
- MFO privado de referencia: workbook profile v3.3, snapshot schema V3.0.
- Catálogo público: 11 productos y 14 variantes.
- Persistencia actual de las superficies internas: navegador (`localStorage` / `sessionStorage`).
- Supabase: preparado pero inactivo mientras no se apruebe y certifique la persistencia multiusuario con Auth + RLS.

La numeración V2.8 permanece en marca, materialización, cache y activos porque sigue siendo el canon técnico validado. Los nombres de archivos históricos no se renombran únicamente para hacerlos coincidir con la versión modular más alta.

## Flujo interno

La web pública incorpora un enlace discreto **Acceso usuarios** en el footer.

```text
Web pública
   ↓
Acceso usuarios
   ↓
Usuario + contraseña
   ↓
Centro interno
   ├── Panel de control · motor V3.0 + overlays V3.4–V3.6
   ├── Operación · base V3.3.0 + superficie V3.6
   ├── Finanzas · base V3.2.9 + overlays V3.4–V3.5
   ├── Datos maestros · auxiliar
   └── Actas · auxiliar
```

El Centro interno es el punto normal de entrada después del login. Control, Operación y Finanzas son los tres contextos principales; Datos maestros y Actas son herramientas auxiliares de gobierno. **Todas esas superficies del mapa interno comparten la shell/sesión local V3.1.1.**

### Acceso local V3.1.1

`acceso.html` permite configurar el primer usuario del navegador. La contraseña no se guarda como texto: se conserva únicamente un derivado PBKDF2/SHA-256 con sal aleatoria.

La sesión local:

- expira después de ocho horas;
- revalida expiración en pestañas que permanecen abiertas;
- preserva únicamente destinos internos permitidos mediante `?next=`;
- permite volver de forma segura a Control, Operación, Finanzas, Datos maestros o Actas;
- conserva deep links operativos permitidos, incluidos `operacion.html#evidencia` y `operacion.html#cierre-diario`;
- se limpia al cerrar sesión.

Esta capa protege la experiencia local, pero GitHub Pages continúa siendo un host estático. No sustituye autorización servidor. La seguridad multiusuario real corresponde a una futura fase Supabase Auth + RLS.

## Panel de control · superficie V3.6

`control.html` es la vista ejecutiva operativa. Conserva el motor Control V3.0 y agrega overlays de sólo lectura/coordination:

- horizonte operativo V3.4;
- capacidad observada V3.5;
- estado de cierre y continuidad V3.6.

Resume pedidos comprometidos, alistamiento, BOM, inventario conocido/desconocido, faltantes, compras abiertas, carga/capacidad y estado del cierre diario. El Panel no calcula margen, resultado ni caja y **no expone el formulario de cierre**; enlaza a Operación cuando hace falta actuar.

## Operación · base V3.3.0, superficie V3.6

`operacion.html` es la superficie operativa única. Compone motores previamente certificados y overlays que no duplican sus stores:

1. Resumen y prioridades — Control V3.0.
2. Pedidos y continuidad — Agenda V2.1.
3. Producción y alistamiento — Producción V2.2.
4. Materiales / BOM — motor V2.3.1 sobre pack V2.3.0.
5. Inventario, lotes, rendimiento y merma — Medición V2.4.
6. Compras y recepción — Abastecimiento V2.5.
7. Evidencia/readiness — V3.3.0.
8. Horizonte operativo de siete días — V3.4.0.
9. Capacidad observada y versionada — V3.5.0.
10. **Cierre diario y continuidad — V3.6.0.**

### Evidencia V3.3.0

La capa V3.3.0 consolida hechos existentes sin duplicarlos y añade la bitácora local `ee_v330_operational_evidence`.

Controla cinco frentes de evidencia:

- producción / lote;
- rendimiento y merma;
- conteo físico;
- recepción y soporte;
- tiempo / novedad operativa.

Principios:

- una necesidad teórica no es una compra;
- inventario desconocido no equivale a cero;
- una fecha futura no se interpreta como falta operativa ni admite evidencia retrospectivamente inventada;
- una corrección crea un nuevo registro mediante `supersedes` y conserva el anterior;
- registrar evidencia no modifica pedidos, stock, recetas, BOM, compras ni Finanzas;
- los hechos operativos pueden ser leídos por Finanzas, pero Finanzas no los reescribe.

### Cierre diario y continuidad V3.6

V3.6 consume la evidencia V3.3, el horizonte V3.4 y la capacidad V3.5 para responder:

1. ¿Qué pasó hoy?
2. ¿Qué quedó pendiente?
3. ¿Puedo cerrar la jornada con confianza?

El ledger `ee_v36_daily_close_events` es append-only. Un cierre con controles bloqueantes exige justificación; una corrección crea un evento nuevo con `supersedes`; si los hechos cambian después del cierre, el fingerprint deja de coincidir y la jornada pasa a **Cierre requiere revisión**.

Los pendientes sólo se arrastran al día siguiente cuando continúan realmente abiertos. V3.6 permite imprimir un resumen y exportar JSON local, pero cerrar la jornada **no modifica pedidos, stock, BOM, compras, mediciones, costos ni Finanzas**.

El contrato completo está en `documentacion/CIERRE_DIARIO_V36.md`.

La demo operativa V3.1.1 respalda y restaura los stores locales cubiertos por su contrato. Los datos sintéticos no deben interpretarse como operación real.

## Finanzas · base V3.2.9, overlays V3.4–V3.5

`finanzas.html` mantiene como núcleo el **Financial Workbench V3.1** y carga capas acumulativas V3.2.0–V3.2.9, más los overlays compatibles de contexto operativo y cierre gerencial.

### Capas activas

- V3.1.0 — baseline + working model.
- V3.2.0 — profundidad financiera.
- V3.2.1 — ledger / movimientos trazables.
- V3.2.2 — economía unitaria.
- V3.2.3 — caja y tendencias.
- V3.2.4 — escenarios.
- V3.2.5 — decisiones.
- V3.2.6 — lectura financiera de compras e inventario sin mutar Operación.
- V3.2.7 — resumen ejecutivo.
- V3.2.8 — readiness / calidad del dato.
- V3.2.9 — demo financiera aislada y reversible.
- V3.4.0 — puente de compromisos operativos de siete días.
- V3.5.0 — cierre gerencial, tesorería corta y señal de capacidad.
- V1.4/V1.5 — costo histórico e inventario valorizado como capas de hechos económicos.

El archivo `finance-workbench-v31.js` conserva su nombre porque sigue siendo el núcleo contractual sobre el que se montan las capas posteriores. Pedidos futuros son contexto comercial-operativo: no se convierten automáticamente en ingreso, caja ni COGS.

### Dos formas de empezar

El módulo financiero nunca publica cifras privadas por defecto:

1. **Importar baseline MFO:** carga un snapshot privado exportado desde el MFO v3.3.
2. **Crear modelo desde cero:** genera localmente un horizonte editable de 24 meses usando productos y precios públicos; costos, volúmenes y supuestos sensibles nacen en cero o `PENDIENTE`.

### Baseline y Working Model

Baseline inmutable:

`ee_v30_mfo_snapshot`

Modelo editable:

`ee_v31_finance_working_model`

El working model permite editar plan de ventas, unidades, precio, costo directo, gastos, compras planificadas, caja, CAPEX, escenarios, decisiones, supuestos y calidad del dato. Restaurar el baseline no elimina hechos reales.

### Real vs. Plan

- **Plan**: working model derivado del baseline.
- **Real**: pedidos, movimientos, compras y conteos observados según su contrato.
- **COGS real**: sólo costo histórico almacenado en la línea del pedido (`unit_cost_snapshot` o equivalente).
- Si falta costo histórico, el dato permanece incompleto; no se rellena con el costo actual.
- Compras ≠ COGS ≠ inventario ≠ caja.

### Demo financiera V3.2.9

La demo financiera genera únicamente cifras sintéticas locales. No publica costos reales y se bloquea mientras esté activa la demo operativa. Al salir, restaura el estado local anterior.

## Datos maestros y Actas

`studio.html` y `actas.html` son superficies auxiliares dentro del mismo perímetro local V3.1.1.

- **Datos maestros:** producto, SKU, contenido, fuente, estado de evidencia y gobierno de oferta.
- **Actas:** sesiones, evidencia, condiciones y decisiones de validación.

No constituyen nuevos flujos de ejecución ni reemplazan Operación/Finanzas. Las actas locales tampoco equivalen a firma electrónica, autorización regulatoria o auditoría servidor.

## MFO v3.3

El exportador privado `scripts/exportar_mfo_v30.py` reconoce las nueve hojas del workbook validado:

```text
00_INICIO
05_PRODUCTOS_SUPUESTOS
01_PLAN_VENTAS
02_PRODUCCION_COMPRAS
03_RESULTADOS_CAJA
04_DASHBOARD
06_AUDITORIA
07_REAL_VS_PLAN
08_DECISIONES_ESCENARIOS
```

El XLSX y los snapshots con cifras privadas deben permanecer fuera del repositorio, bajo `private-data/` o almacenamiento privado equivalente.

## Fuente y superficie ejecutable

La superficie que usan Mac, Playwright y GitHub Pages se construye mediante:

```text
scripts/materializar_fuentes_locales_v28.py
scripts/preparar_sitio_materializado_v28.py
```

Estos nombres se mantienen porque corresponden al runtime/canon técnico V2.8. La superficie publicable excluye Base64, chunks, loaders heredados e históricos archivados.

El mapa de fuentes distingue explícitamente materialización pública, datos maestros, hechos operativos, Finanzas, demos y backend preparado: `documentacion/MAPA_DATOS_Y_FUENTES.md`.

## Marcador de despliegue

`deploy-version.txt` distingue explícitamente las líneas de versión base:

```text
release_version=3.1.1
version=2.8.0
internal_architecture=v3.1-acceso-operacion-finanzas
session_shell=v3.1.1
control_engine=v3.0
operation_module=v3.3.0
finance_workbench_core=v3.1.0
finance_module=v3.2.9
mfo_baseline=v3.0-schema-mfo-v3.3
```

Los overlays V3.4–V3.6 se certifican mediante sus activos, pruebas y health-checks específicos; no se debe utilizar un único número para inferir todas las capas.

## Validación vigente

```text
verificar_demo.py
scripts/verificar_canon_marca_v28.py
scripts/verificar_activos_hq_v28.py
scripts/verificar_modulos_v28.py
scripts/verificar_v30_separacion.py
scripts/verificar_v31_interno.py
scripts/verificar_release_v31.py
scripts/preparar_sitio_materializado_v28.py
tests/e2e/
```

La integración a `main` requiere auditoría canónica, validación/materialización, Playwright desktop+móvil, Graphify y health-check real de GitHub Pages sobre el mismo SHA. V3.6 añade `.github/workflows/public-health-v36.yml`.

## Seguridad y datos

- Nunca versionar XLSX financieros, snapshots reales, contraseñas, `service_role`, tokens, cadenas de conexión o datos personales reales.
- No existen credenciales demo fijas como contrato vigente; el primer usuario se crea localmente por navegador.
- El login local no se presenta como seguridad servidor.
- MFO, escenario y decisión son plan; no sobrescriben hechos operativos.
- El cierre V3.6 no sobrescribe hechos ni crea datos financieros.
- El starter financiero no inventa costos privados.
- La autenticación multiusuario, roles, persistencia compartida y auditoría servidor quedan para una fase posterior con Auth + RLS.

## Documentación principal

Empieza por el índice de documentación activa:

- `documentacion/INDICE_DOCUMENTACION_ACTIVA.md`
- `documentacion/MAPA_VERSIONES_ACTIVAS.md`
- `documentacion/ARQUITECTURA_INTERNA_V31.md`
- `documentacion/MAPA_DATOS_Y_FUENTES.md`
- `documentacion/ROADMAP_ACTIVO_V33.md`
- `documentacion/CIERRE_DIARIO_V36.md`
- `documentacion/ACCESOS_DEMO.md`
- `documentacion/MFO_SNAPSHOT_V30.md`
- `documentacion/CANON_MARCA_CONTENIDO_V28.md`

`documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md` se conserva como **histórico**, no como backlog vigente.
