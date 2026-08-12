# Mapa de versiones activas — El Errante

Este documento separa las líneas de versión que conviven legítimamente en El Errante. Una capa modular puede avanzar sin obligar a renumerar la release integral, el runtime o los motores base que siguen siendo contractualmente vigentes.

## Regla principal

La **release integral** identifica la distribución publicada como conjunto. Las versiones de **runtime, canon, shell, motor, módulo, overlay operativo/gerencial y perfil de datos** pueden avanzar de forma independiente.

No debe deducirse la versión integral a partir del número más alto visible en una superficie.

## Estado vigente

| Capa | Versión efectiva | Función | Observación |
|---|---:|---|---|
| Release integral | **3.1.1** | Distribución pública e interna | Referencia integral de Pages. |
| Runtime / materialización | **2.8.0** | Fuente materializada, cache y superficie ejecutable | Contrato técnico vigente. |
| Canon de marca y activos | **2.8** | Identidad y activos | `assets/brand-canon-v28.js`. |
| Línea pública/editorial | **2.9** | Narrativa y recorrido público | Compatible con runtime V2.8. |
| Arquitectura interna | **3.1** | Control / Operación / Finanzas + herramientas auxiliares | Studio, Actas y Piloto permanecen auxiliares. |
| Shell y sesión | **3.1.1** | Guard local, navegación y expiración | No equivale a autorización servidor. |
| Motor Control | **3.0** | Priorización operativa base | `control-v30.js`. |
| Motor Materiales / BOM | **2.3.1** | Requerimientos, stock visible y valoración prospectiva | Motor `materials-v23.js` sobre pack de datos V2.3.0. |
| Módulo Operativo base | **3.3.0** | Ejecución + evidencia | Motor/base operativo persistente. |
| Evidencia operativa | **3.3.0** | Readiness y ledger de evidencia | `operational-evidence-v330.js`. |
| Horizonte operativo | **3.4.0** | Próximos siete días, BOM, faltantes y compras | `business-pulse-v34.js`. |
| Cierre gerencial / capacidad | **3.5.0** | Capacidad observada y puente gerencial/tesorería | `management-pulse-v35.js`. |
| Cierre diario / continuidad | **3.6.0** | Cola accionable, cierre append-only y arrastre | `daily-close-v36.js`. |
| Piloto: motor | **3.7.1** | Backup, ledger, restauración y reconciliación | Conserva backups íntegros V3.7.0. |
| Piloto: intake | **3.7.2** | Entrada interna local de pedidos y comprobantes | No modifica checkout público. |
| Piloto: salida | **3.7.3** | Aprendizaje, clasificación y gate de persistencia | No activa backend. |
| Superficie Control efectiva | **V3.6** | Control V3.0 + overlays V3.4/V3.5/V3.6 | No escribe Finanzas ni hechos operativos. |
| Superficie Operación efectiva | **V3.6** | V2.1–V2.5 + V3.0 + V3.3–V3.6 | Cierre diario coordina hechos existentes. |
| Superficie Piloto efectiva | **V3.7.3** | Prueba real local + entrada V3.7.2 + salida V3.7.3 | Reutiliza motores existentes; Supabase inactivo. |
| Workbench Financiero base | **3.1.0** | Baseline + working model | `finance-workbench-v31.js`. |
| Módulo Financiero base | **3.2.9** | Profundidad financiera acumulativa | Motor base preservado. |
| Profundidad financiera | **3.2.0–3.2.9** | Ledger, economía unitaria, caja, escenarios, decisiones y readiness | Capas acumulativas. |
| Puente financiero operativo | **3.4.0** | Contexto de compromisos operativos | No convierte pedido en ingreso/caja. |
| Cierre gerencial financiero | **3.5.0** | Cierre mensual, tesorería corta y capacidad | Preserva profundidad V3.4. |
| Mesa financiera clara | **3.5.1** | Edición directa de plan, caja y movimientos reales con historia | Overlay de usabilidad; ventas reales siguen en Operación. |
| Inventario valorizado | **V1.5.0** | Valorización y variaciones sobre costo histórico | Consume V1.4. |
| Costo histórico | **V1.4.0** | Snapshot económico `as-of` | No recalcula hechos antiguos. |
| Datos maestros / estándar | **core V1.0 / propuestas V1.1 / materialización V1.2 / puente V1.3** | Gobierno de materiales, proveedores y costos | Separado de hechos históricos. |
| Snapshot MFO | **schema 3.0 / workbook profile v3.3** | Perfil del MFO privado | XLSX real fuera del repo. |
| Supabase | **preparado, inactivo** | Futuro Auth/RLS/persistencia compartida | Sólo puede avanzar tras gate explícito. |

## Composición efectiva de Control V3.6

`control.html` combina motor Control V3.0, horizonte V3.4, capacidad V3.5 y continuidad/cierre V3.6. Control resume y enlaza; la acción de cerrar vive en Operación. No carga `finance-workbench-v31.js`.

## Composición efectiva de Operación V3.6

`operacion.html` combina Pedidos V2.1, Producción V2.2, Materiales/BOM V2.3.1, Medición V2.4, Abastecimiento V2.5, Control V3.0, Evidencia V3.3, Horizonte V3.4, Capacidad V3.5 y Cierre diario V3.6.

El Módulo Operativo base sigue siendo **3.3.0**; V3.4–V3.6 son overlays compatibles que amplían lectura y coordinación sin reemplazar stores de ejecución.

## Piloto operativo V3.7.1–V3.7.3

`piloto-operativo.html` es una herramienta auxiliar, no un cuarto contexto principal ni un dashboard nuevo.

### V3.7.1 — motor del piloto

- exige demos desactivadas;
- usa un navegador/dispositivo controlado;
- genera backups privados `el-errante-pilot-backup` con SHA-256;
- excluye cuenta local, sesión y secretos;
- escribe `START`, `CHECKPOINT`, `RESTORE` y `END` en `ee_v37_pilot_events`;
- reconcilia pedidos, producción, compras, inventario, cierres y caja;
- calcula `BLOCKED`, `NEEDS_REVIEW` o `EVIDENCE_COMPLETE`;
- mantiene Supabase inactivo.

### V3.7.2 — frontera de entrada

- reutiliza `ee_v14_orders` para pedidos recibidos por WhatsApp, teléfono o coordinación directa;
- exige precio y costo histórico positivos y guarda `unit_cost_snapshot`;
- admite `pending_payment` o `payment_review`;
- exige comprobante para revisión de pago y conserva el guard V2.1;
- no aprueba pagos, no modifica checkout público y no activa backend.

### V3.7.3 — frontera de salida

- guarda revisiones append-only en `ee_v373_pilot_exit_reviews`;
- clasifica persistencia de datos, necesidad de roles y uso real de superficies;
- una revisión posterior usa `supersedes` y conserva la anterior;
- exige piloto cerrado y reconciliación `EVIDENCE_COMPLETE` para una conclusión final;
- puede concluir `LOCAL_MODEL_SUFFICIENT` o `BACKEND_DESIGN_CANDIDATE`;
- `BACKEND_DESIGN_CANDIDATE` autoriza **diseño técnico**, nunca activación automática de Supabase.

Una restauración sigue siendo la única acción del motor V3.7.1 que puede reemplazar datasets origen. V3.7.2 sí agrega pedidos/comprobantes por su contrato de entrada. V3.7.3 sólo agrega revisiones de aprendizaje y no modifica hechos operativos.

## Contrato del cierre V3.6

Estados derivados: `Sin actividad`, `Pendiente`, `Lista para cerrar`, `Cerrada`, `Cerrada con excepciones`, `Cierre requiere revisión` y `Periodo futuro`.

Un cierre con bloqueos exige justificación. Cada corrección crea un nuevo evento con `supersedes`. Si cambia la evidencia después del cierre, la jornada exige revisión. El arrastre sólo conserva señales que siguen abiertas.

## Composición financiera vigente

`finanzas.html` conserva workbench V3.1, módulo base V3.2.9, capas V3.2.0–V3.2.9, costos históricos V1.4, inventario valorizado V1.5, puente operativo V3.4, cierre gerencial/capacidad V3.5 y mesa clara V3.5.1.

V3.5.1 edita planeación sobre `ee_v31_finance_working_model`, usa correcciones append-only para movimientos reales y conserva las ventas reales como hechos de Operación. Finanzas no escribe cierres V3.6 ni eventos/revisiones del piloto.

## Cadena de costos

- **V1.0:** gobierno base de materiales/proveedores.
- **V1.1:** propuestas append-only; propuesta aprobada ≠ estándar vigente.
- **V1.2:** materialización versionada.
- **V1.3:** estándar efectivo prospectivo para Operación/Finanzas.
- **V1.4:** costo histórico `as-of` para hechos.
- **V1.5:** valorización/variaciones que consume V1.4.

Regla esencial: `estándar vigente hoy ≠ costo histórico del hecho`. Costo desconocido nunca equivale a cero.

## Marcadores de despliegue

Los marcadores históricos de `deploy-version.txt` se conservan mientras describan motores base. Los health-checks específicos certifican overlays y herramientas posteriores por separado.

## Invariantes

1. No renombrar assets históricos sólo para hacer coincidir numeración.
2. No llamar V3.7 a toda la web por existir una herramienta auxiliar V3.7.
3. El guard local no es seguridad backend.
4. Supabase sigue inactivo hasta un gate explícito de Auth + RLS + migración + auditoría.
5. Hecho y plan permanecen separados.
6. Una compra observada no cambia automáticamente el costo estándar.
7. Una propuesta aprobada no es estándar hasta una materialización válida.
8. Un hecho histórico no se recalcula retroactivamente.
9. Desconocido no equivale a cero.
10. V3.6 no puede modificar pedidos, stock, BOM, compras, mediciones, costos o Finanzas al cerrar una jornada.
11. Una corrección V3.6 conserva el cierre anterior mediante `supersedes`.
12. V3.7.1 sólo reemplaza datasets origen durante una restauración explícita y validada.
13. V3.7.2 sólo agrega la entrada interna necesaria para el piloto y no salta la revisión de pago.
14. V3.7.3 no modifica hechos operativos; sólo registra aprendizaje append-only.
15. `BACKEND_DESIGN_CANDIDATE` no equivale a backend activo.
16. Backups, clientes, comprobantes, costos y demás datos reales del piloto nunca se versionan en el repositorio público.