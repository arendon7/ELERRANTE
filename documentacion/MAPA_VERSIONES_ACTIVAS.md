# Mapa de versiones activas — El Errante

Este documento separa las líneas de versión que conviven legítimamente en El Errante. Una capa modular puede avanzar sin obligar a renumerar la release integral, el runtime o los motores base que siguen siendo contractualmente vigentes.

## Regla principal

La **release integral** identifica la distribución publicada como conjunto. Las versiones de **runtime, canon, shell, motor, módulo, overlay operativo/gerencial y perfil de datos** pueden avanzar de forma independiente.

No debe deducirse la versión integral a partir del número más alto visible en una superficie.

## Estado vigente

| Capa | Versión efectiva | Función | Observación |
|---|---:|---|---|
| Release integral | **3.1.1** | Distribución pública e interna | Sigue siendo la referencia integral de Pages. |
| Runtime / materialización | **2.8.0** | Fuente materializada, cache y superficie ejecutable | Contrato técnico vigente. |
| Canon de marca y activos | **2.8** | Identidad y activos | `assets/brand-canon-v28.js`. |
| Línea pública/editorial | **2.9** | Narrativa y recorrido público | Compatible con runtime V2.8. |
| Arquitectura interna | **3.1** | Control / Operación / Finanzas + herramientas auxiliares | Studio y Actas permanecen como gobierno. |
| Shell y sesión | **3.1.1** | Guard local, navegación y expiración | No equivale a autorización servidor. |
| Motor Control | **3.0** | Priorización operativa base | `control-v30.js`. |
| Evidencia operativa | **3.3.0** | Readiness y ledger de evidencia | `operational-evidence-v330.js`. |
| Horizonte operativo | **3.4.0** | Próximos siete días, BOM, faltantes y compras | `business-pulse-v34.js`. |
| Cierre gerencial / capacidad | **3.5.0** | Capacidad observada y puente gerencial/tesorería | `management-pulse-v35.js`. |
| Cierre diario / continuidad | **3.6.0** | Cola accionable, cierre append-only y arrastre inteligente | `daily-close-v36.js`. |
| Superficie Control efectiva | **V3.6** | Control V3.0 + overlays V3.4/V3.5/V3.6 | No escribe Finanzas ni hechos operativos. |
| Superficie Operación efectiva | **V3.6** | V2.1–V2.5 + V3.0 + V3.3–V3.6 | Cierre diario coordina hechos existentes. |
| Workbench Financiero base | **3.1.0** | Baseline + working model | `finance-workbench-v31.js`. |
| Profundidad financiera | **3.2.0–3.2.9** | Ledger, economía unitaria, caja, escenarios, decisiones y readiness | Capas acumulativas. |
| Puente financiero operativo | **3.4.0** | Contexto de compromisos operativos | No convierte pedido en ingreso/caja. |
| Cierre gerencial financiero | **3.5.0** | Cierre mensual, tesorería corta y capacidad | Preserva profundidad V3.4. |
| Inventario valorizado | **V1.5.0** | Valorización y variaciones sobre costo histórico | Consume V1.4. |
| Costo histórico | **V1.4.0** | Snapshot económico `as-of` | No recalcula hechos antiguos con el estándar actual. |
| Datos maestros / estándar | **core V1.0 / propuestas V1.1 / materialización V1.2 / puente V1.3** | Gobierno de materiales, proveedores y costos | Separado de hechos históricos. |
| Snapshot MFO | **schema 3.0 / workbook profile v3.3** | Perfil del MFO privado | XLSX real fuera del repo. |
| Supabase | **preparado, inactivo** | Futuro Auth/RLS/persistencia compartida | No es backend activo todavía. |

## Composición efectiva de Control V3.6

`control.html` combina:

- motor Control V3.0;
- horizonte V3.4;
- capacidad V3.5;
- continuidad/cierre V3.6.

Control sólo resume y enlaza. La acción de registrar/corregir el cierre vive en Operación. No carga `finance-workbench-v31.js`.

## Composición efectiva de Operación V3.6

`operacion.html` combina:

1. Pedidos V2.1.
2. Producción V2.2.
3. Materiales/BOM V2.3.
4. Medición V2.4.
5. Abastecimiento V2.5.
6. Control base V3.0.
7. Evidencia y readiness V3.3.
8. Horizonte V3.4.
9. Capacidad V3.5.
10. Cierre diario y continuidad V3.6.

V3.6 no duplica esas fuentes. Consume sus APIs/stores y escribe sólo `ee_v36_daily_close_events`.

## Contrato del cierre V3.6

Estados derivados:

- `Sin actividad`;
- `Pendiente`;
- `Lista para cerrar`;
- `Cerrada`;
- `Cerrada con excepciones`;
- `Cierre requiere revisión`;
- `Periodo futuro`.

Un cierre con bloqueos exige justificación. Cada corrección crea un nuevo evento con `supersedes`. Si cambia la evidencia después del cierre, el fingerprint deja de coincidir y la jornada exige revisión.

El arrastre al día siguiente sólo conserva señales que siguen abiertas. Resolver un pendiente elimina su continuidad; no se copia por calendario.

## Composición financiera vigente

`finanzas.html` conserva:

- workbench V3.1;
- capas V3.2.0–V3.2.9;
- costos históricos V1.4;
- inventario valorizado V1.5;
- puente operativo V3.4;
- cierre gerencial, tesorería y capacidad V3.5.

Finanzas no escribe cierres V3.6. La intención es que, en una fase posterior, pueda usar la calidad del cierre como señal de confiabilidad sin convertirlo en dato contable.

## Cadena de costos

- **V1.0:** gobierno base de materiales/proveedores.
- **V1.1:** propuestas append-only; propuesta aprobada ≠ estándar vigente.
- **V1.2:** materialización versionada.
- **V1.3:** estándar efectivo prospectivo para Operación/Finanzas.
- **V1.4:** costo histórico `as-of` para hechos.
- **V1.5:** valorización/variaciones que consume V1.4.

Regla esencial:

`estándar vigente hoy ≠ costo histórico del hecho`

Costo desconocido nunca equivale a cero.

## Marcadores de despliegue

Los marcadores históricos de `deploy-version.txt` se conservan mientras describan los motores base:

- `release_version=3.1.1`
- `version=2.8.0`
- `internal_architecture=v3.1-acceso-operacion-finanzas`
- `session_shell=v3.1.1`
- `control_engine=v3.0`
- `operation_module=v3.3.0`
- `finance_workbench_core=v3.1.0`
- `finance_module=v3.2.9`

`operation_module=v3.3.0` identifica el motor/base operativo persistente; no pretende describir los overlays V3.4–V3.6. Los health-checks específicos certifican esos overlays por separado.

## Invariantes

1. No renombrar assets históricos sólo para hacer coincidir numeración.
2. No llamar V3.6 a toda la web por existir una superficie operativa V3.6.
3. El guard local no es seguridad backend.
4. Supabase sigue inactivo hasta un gate explícito de Auth + RLS + migración + auditoría.
5. Hecho y plan permanecen separados.
6. Una compra observada no cambia automáticamente el costo estándar.
7. Una propuesta aprobada no es estándar hasta una materialización válida.
8. Un hecho histórico no se recalcula retroactivamente.
9. Desconocido no equivale a cero.
10. V3.6 no puede modificar pedidos, stock, BOM, compras, mediciones, costos o Finanzas al cerrar una jornada.
11. Una corrección V3.6 conserva el cierre anterior mediante `supersedes`.
12. Un cierre desactualizado por nuevos hechos debe señalar revisión, no permanecer silenciosamente como cerrado.
