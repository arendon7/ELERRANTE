# El Errante V3.1.1

**Masa · Fuego · Territorio**

Webapp pública e interna de El Errante. La release integral vigente es **V3.1.1**, construida sobre el canon técnico/materializado V2.8 y la línea pública/editorial V2.9. Dentro de esa distribución, los módulos internos han seguido evolucionando de forma compatible: **Operación está en V3.3.0** y **Finanzas en V3.2.9**.

La numeración de módulo no sustituye automáticamente la versión integral. El mapa completo y las reglas de versionado están en `documentacion/MAPA_VERSIONES_ACTIVAS.md`.

## Estado canónico

- Release integral: `3.1.1`.
- Release integral anterior estable: `3.1.0`.
- Runtime / materialización: `2.8.0`.
- Canon de identidad, imágenes y activos: V2.8.
- Línea pública/editorial: V2.9.
- Arquitectura interna: V3.1.
- Shell y sesión interna: V3.1.1.
- Panel de control: shell V3.1.1 sobre motor Control V3.0.
- Módulo Operativo efectivo: **V3.3.0**.
- Workbench Financiero base: V3.1.0.
- Módulo Financiero efectivo: **V3.2.9**.
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
   ├── Panel de control
   ├── Operación V3.3.0
   └── Finanzas V3.2.9
```

El Centro interno es el punto normal de entrada después del login. Control, Operación y Finanzas comparten shell y sesión, pero conservan responsabilidades separadas.

### Acceso local V3.1.1

`acceso.html` permite configurar el primer usuario del navegador. La contraseña no se guarda como texto: se conserva únicamente un derivado PBKDF2/SHA-256 con sal aleatoria.

La sesión local:

- expira después de ocho horas;
- revalida expiración en pestañas que permanecen abiertas;
- preserva únicamente destinos internos permitidos mediante `?next=`;
- permite volver de forma segura a la sección interna solicitada;
- se limpia al cerrar sesión.

Esta capa protege la experiencia local, pero GitHub Pages continúa siendo un host estático. No sustituye autorización servidor. La seguridad multiusuario real corresponde a una futura fase Supabase Auth + RLS.

## Panel de control

`control.html` es la vista ejecutiva operativa. Resume pedidos comprometidos, alistamiento, BOM, inventario conocido/desconocido, faltantes y compras abiertas antes de entrar al flujo completo.

- Shell / sesión: V3.1.1.
- Motor de control: V3.0.

El Panel no calcula margen, resultado ni caja. Su responsabilidad es priorizar la operación.

## Operación V3.3.0

`operacion.html` es la superficie operativa única. Compone motores previamente certificados y añade una capa transversal de evidencia:

1. Resumen y prioridades — Control V3.0.
2. Pedidos y continuidad — Agenda V2.1.
3. Producción y alistamiento — Producción V2.2.
4. Materiales / BOM — V2.3.
5. Inventario, lotes, rendimiento y merma — Medición V2.4.
6. Compras y recepción — Abastecimiento V2.5.
7. **Evidencia y cierre — V3.3.0.**

### Evidencia y cierre V3.3.0

La capa V3.3.0 consolida hechos existentes sin duplicarlos y añade la bitácora local `ee_v330_operational_evidence`.

Controla cinco frentes de cierre:

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

La demo operativa V3.1.1 respalda y restaura también esta bitácora. Los datos sintéticos no sobreviven a la salida de la demo.

## Finanzas V3.2.9

`finanzas.html` mantiene como núcleo el **Financial Workbench V3.1** y carga capas acumulativas hasta V3.2.9.

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

La profundidad efectiva vigente del módulo es **V3.2.9**. El archivo `finance-workbench-v31.js` conserva su nombre porque sigue siendo el núcleo contractual sobre el que se montan las capas posteriores.

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

## Marcador de despliegue

`deploy-version.txt` distingue explícitamente las líneas de versión:

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

No debe utilizarse un único número para inferir todas las capas.

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

La integración a `main` requiere auditoría canónica, validación/materialización, Playwright desktop+móvil y health-check real de GitHub Pages sobre el mismo SHA.

## Seguridad y datos

- Nunca versionar XLSX financieros, snapshots reales, contraseñas, `service_role`, tokens, cadenas de conexión o datos personales reales.
- El login local no se presenta como seguridad servidor.
- MFO, escenario y decisión son plan; no sobrescriben hechos operativos.
- El starter financiero no inventa costos privados.
- La autenticación multiusuario, roles, persistencia compartida y auditoría servidor quedan para una fase posterior con Auth + RLS.

## Documentación principal

- `documentacion/MAPA_VERSIONES_ACTIVAS.md`
- `documentacion/ARQUITECTURA_INTERNA_V31.md`
- `documentacion/MFO_SNAPSHOT_V30.md`
- `documentacion/CANON_MARCA_CONTENIDO_V28.md`
- `documentacion/FINANZAS_OPERATIVAS_V27.md`
- `documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md`
- `documentacion/MAPA_DATOS_Y_FUENTES.md`
