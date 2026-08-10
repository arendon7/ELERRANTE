# Mapa de versiones activas — El Errante

Este documento separa las distintas líneas de versión que conviven legítimamente en El Errante. No todas representan una release integral del sitio.

## Regla principal

La **release integral** identifica la distribución pública e interna publicada como conjunto. Las versiones de **módulo**, **motor**, **shell**, **runtime**, **canon** o **perfil de datos** pueden avanzar de forma independiente mientras mantengan sus contratos e invariantes.

Por tanto, no debe deducirse la versión integral a partir del número más alto visible en un módulo.

## Estado vigente

| Capa | Versión efectiva | Función | Observación |
|---|---:|---|---|
| Release integral | **3.1.1** | Distribución publicada y certificada | Sigue siendo la referencia de package, Pages y health-check. |
| Runtime / materialización | **2.8.0** | Fuente materializada, cache y superficie ejecutable | No se renombra mientras el contrato técnico siga siendo el mismo. |
| Canon de marca y activos | **2.8** | Identidad, imágenes, aliases y materialización | `assets/brand-canon-v28.js`. |
| Línea pública/editorial | **2.9** | Narrativa y recorrido público | Compatible con el runtime V2.8. |
| Arquitectura interna | **3.1** | Tres contextos principales + herramientas auxiliares | Control / Operación / Finanzas; Studio y Actas como gobierno. |
| Shell y sesión interna | **3.1.1** | Guard local, navegación, retorno seguro, expiración y demo operativa reversible | Cubre Centro, Control, Operación, Finanzas, Datos maestros y Actas; no equivale a autorización servidor. |
| Panel de control | **shell 3.1.1 / motor 3.0** | Priorización operativa | `control-v30.js` permanece como motor. |
| Módulo Operativo | **3.3.0** | Ejecución + evidencia y cierre | Compone motores V2.1–V2.5, Control V3.0 y evidencia V3.3.0. |
| Motor Materiales / BOM | **2.3.1** + puente V1.3 | Requerimientos, lectura de stock, conteos y valoración prospectiva | `materials-v23.js`; cantidades siguen V2.3.1 sobre pack de datos V2.3.0 y costos prospectivos usan el estándar efectivo V1.3. |
| Workbench Financiero base | **3.1.0** | Baseline + working model | Núcleo `finance-workbench-v31.js`. |
| Módulo Financiero efectivo | **3.2.9** + puente V1.3 + histórico V1.4 | Profundidad financiera acumulativa | Economía unitaria usa V1.3; margen histórico usa snapshots V1.4 sin recalcular el pasado. |
| Datos maestros / estándar | **core V1.0.0 / propuestas V1.1.0 / materialización V1.2.0 / puente V1.3.0** | Gobierno y consumo controlado de materiales, proveedores y costos | V1.3 resuelve el estándar efectivo prospectivo. |
| Costo histórico | **V1.4.0** | Snapshot económico `as-of` para pedidos, compras y movimientos | Reconstruye revisiones aplicables por fecha; nunca completa hechos antiguos con el estándar actual. |
| Actas | **shell 3.1.1 / motores oferta V0.9** | Trazabilidad de sesiones, evidencia y decisiones | Superficie auxiliar `actas.html`. |
| Demo financiera | **3.2.9** | Escenario sintético local y reversible | No contiene cifras privadas reales. |
| Snapshot MFO | **schema 3.0 / workbook profile v3.3** | Perfil de importación del MFO privado | El XLSX real permanece fuera del repositorio. |
| Supabase | **preparado, inactivo** | Futuro Auth, RLS y persistencia multiusuario | No se declara backend activo en esta release. |

## Perímetro de shell V3.1.1

Comparten la misma barrera local de sesión:

- `centro-interno.html`;
- `control.html`;
- `operacion.html`;
- `finanzas.html`;
- `studio.html`;
- `actas.html`.

El retorno seguro mediante `?next=` sólo admite esos destinos y hashes operativos expresamente permitidos, incluido `operacion.html#evidencia`.

Esta coherencia de shell no cambia la limitación esencial: GitHub Pages es estático y la sesión local no es autorización servidor.

## Cadena de costos V1.0–V1.4

El gobierno y consumo de costos se compone de capas compatibles:

- **Core V1.0.0**: gobierno de materiales/proveedores sobre `materials-data-v23.js`, con metadata propia en `ee_v10_master_governance`.
- **Propuestas V1.1.0**: ledger append-only `ee_v11_cost_proposal_events`; una compra observada puede sustentar una propuesta, pero no modifica el estándar.
- **Materialización V1.2.0**: ledger `ee_v12_cost_materialization_events`; crea revisiones efectivas sin editar el baseline canónico ni reescribir hechos.
- **Puente prospectivo V1.3.0**: resuelve `baseline → estándar materializado → simulación financiera` para Operación y Finanzas.
- **Costo histórico V1.4.0**: congela o reconstruye `as-of` el costo que correspondía a un hecho, mediante `ee_v14_cost_snapshot_events`.
- **Gobierno de oferta V0.9**: conserva expediente de producto/SKU, contenido, fuentes y gates de lanzamiento.

### V1.1 — propuesta no es estándar

El flujo es:

`CREATED → SUBMITTED → APPROVED / REJECTED`

`APPROVED_FOR_MATERIALIZATION` sólo habilita una materialización controlada. V1.1 no expone una función de aplicación, no reescribe `materials-data-v23.js`, no modifica BOM/productos y no altera compras.

### V1.2 — estándar versionado

Cada `MATERIALIZED` conserva revisión anterior/nueva, costo anterior/nuevo, propuesta, aprobación, evidencia, actor, razón y fecha. El estándar efectivo se reconstruye como `baseline canónico + revisiones materializadas`.

La materialización usa control optimista de concurrencia: si el estándar vigente ya no coincide con el snapshot contra el que nació la propuesta, se bloquea. Una misma propuesta tampoco puede materializarse dos veces.

### V1.3 — consumo prospectivo

`master-cost-prospective-v13.js` deriva una vista de solo lectura sobre V1.2. Operación usa esa vista para valorar BOM y producción futura; Finanzas la usa como base de economía unitaria y puede superponer una simulación local. Restablecer una simulación vuelve al estándar efectivo, no al baseline antiguo.

V1.3 no modifica el ledger V1.2, pedidos, compras, stock ni la fuente canónica.

### V1.4 — hechos históricos no retroactivos

`historical-cost-snapshots-v14.js` añade una capa distinta: el costo histórico de un hecho. Su regla principal es:

`estándar vigente hoy ≠ costo histórico del hecho`

Cuando existe una fecha/hora del hecho, V1.4 reconstruye qué revisiones V1.2 estaban vigentes en ese instante y valoriza la BOM con ese conjunto. Una captura tardía no usa automáticamente la revisión más reciente.

Para hechos anteriores a V1.4:

- un costo ya embebido se conserva como legado;
- un costo faltante se declara desconocido/incompleto;
- no se hace backfill con el estándar actual.

Para compras nuevas, V1.4 separa costo observado de la recepción y estándar `as-of`, preparando variaciones V1.5. Para movimientos, sólo conserva costo si el hecho lo trae; de lo contrario queda `UNKNOWN`.

Finanzas calcula contribución histórica sólo cuando el costo está completo. Un faltante no se trata como costo cero.

## Composición del módulo Operativo V3.3.0

`operacion.html` conserva y compone motores previamente certificados:

- Agenda / pedidos: V2.1.
- Producción: V2.2.
- Materiales / BOM: motor V2.3.1 sobre pack de datos V2.3.0 + valoración prospectiva V1.3.
- Medición: V2.4.
- Abastecimiento: V2.5.
- Resumen de control: V3.0.
- Shell / sesión: V3.1.1.
- Evidencia y cierre: V3.3.0.
- Captura transversal de costo histórico: V1.4.

V1.3 modifica únicamente la valoración prospectiva. V1.4 escucha nuevos hechos económicos para conservar su costo histórico, pero no cambia cantidades, stock, pedidos ni compras fuente.

## Composición del módulo Financiero V3.2.9

`finanzas.html` monta el workbench V3.1 y las capas acumulativas V3.2.0–V3.2.9. V3.2.2 usa el estándar efectivo V1.3 como base de simulación.

V1.4 añade una lectura transversal adicional de:

- ventas en estados económicos;
- COGS histórico conocido;
- contribución histórica conocida;
- cobertura de costo;
- origen y completitud del snapshot.

Esto no renumera el módulo financiero: V1.4 es una dependencia de datos históricos, no una nueva versión del workbench.

## Marcadores de despliegue

El marcador integral conserva:

- `release_version=3.1.1`
- `version=2.8.0`
- `internal_architecture=v3.1-acceso-operacion-finanzas`
- `session_shell=v3.1.1`
- `control_engine=v3.0`
- `operation_module=v3.3.0`
- `master_data_governance_core=v1.0.0`
- `master_data_module=v1.3.0`
- `master_cost_proposals=v1.1.0`
- `master_cost_materialization=v1.2.0`
- `master_cost_bridge=v1.3.0`
- `finance_workbench_core=v3.1.0`
- `finance_module=v3.2.9`

V1.4 posee además `historical-cost-version.txt` con `historical_cost_snapshots=v1.4.0`. Se separa deliberadamente porque el agregado `master_data_module` describe el estándar prospectivo hasta V1.3, mientras V1.4 gobierna hechos históricos.

## Certificación V1.4

La barrera V1.3 invoca `scripts/verificar_historical_cost_snapshots_v14.py`, por lo que los workflows canónico y Pages existentes validan la nueva capa sin duplicar su lógica.

`.github/workflows/historical-cost-v14.yml` añade:

1. una barrera estructural independiente en PR;
2. un health-check posterior al workflow de Pages;
3. verificación del SHA real publicado mediante `deploy-version.txt`;
4. comprobación pública de marcador, JS, CSS y cadenas de carga V1.4.

## Invariantes de numeración y gobierno

1. No renombrar activos V2.8 sólo para coincidir con la versión más alta.
2. No llamar V3.3.0 a toda la web porque Operación esté en V3.3.0.
3. No presentar el guard local V3.1.1 como seguridad backend.
4. No declarar Supabase activo mientras Auth, RLS y persistencia compartida no estén habilitados y certificados.
5. Una compra observada no puede convertirse automáticamente en costo estándar.
6. Una propuesta aprobada no es costo vigente hasta existir `MATERIALIZED` válido.
7. El ledger V1.2 no puede reescribir baseline, compras, propuestas, BOM, productos ni hechos.
8. Los cálculos prospectivos consumen V1.3; los hechos históricos no se recalculan retroactivamente.
9. La simulación financiera nunca puede convertirse en dato maestro ni costo histórico por efecto lateral.
10. V1.3 es de solo lectura respecto de hechos y materialización.
11. V1.4 no puede completar un hecho antiguo con el estándar vigente actual.
12. Costo desconocido no equivale a cero.
13. Un snapshot V1.4 existente es inmutable frente a revisiones posteriores del estándar.
14. Una captura tardía debe reconstruir el estándar `as-of` el momento económico del hecho.
15. V1.5 deberá consumir V1.4 para variaciones e inventario valorizado, no volver a inferir históricos por su cuenta.
