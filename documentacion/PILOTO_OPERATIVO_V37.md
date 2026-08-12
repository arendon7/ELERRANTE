# Piloto operativo controlado V3.7

## Objetivo

V3.7 prepara a El Errante para usar durante un periodo corto los flujos ya construidos con datos reales, sin activar todavía persistencia compartida ni convertir la aplicación en un ERP.

El piloto debe probar una cadena de hechos completa:

`pedido → producción → inventario → compra/recepción → cierre diario → caja → reconciliación → aprendizaje`

La superficie efectiva vigente es **V3.7.3**. El motor de backup, ledger y reconciliación permanece en **V3.7.1**; V3.7.2 aporta la entrada interna local de pedidos y V3.7.3 registra el aprendizaje de salida para decidir, con evidencia, si el modelo local sigue siendo suficiente o si corresponde diseñar persistencia compartida e identidad real.

## Contrato del piloto

1. Un único navegador/dispositivo controlado.
2. Datos reales y privados permanecen fuera del repositorio público.
3. Las demos operativa V3.1.1 y financiera V3.2.9 deben estar desactivadas.
4. Supabase permanece inactivo.
5. V3.7.1 no reescribe pedidos, producción, compras, inventario, cierres ni Finanzas salvo cuando el usuario ejecuta explícitamente una restauración de respaldo.
6. V3.7.2 puede **crear pedidos nuevos** en `ee_v14_orders` y anexar su comprobante local mediante la entrada interna; no modifica el checkout público.
7. La aprobación de pago sigue perteneciendo a Operación V2.1 y conserva la exigencia de soporte.
8. Los eventos propios de V3.7 son append-only en `ee_v37_pilot_events`.
9. Una restauración nunca reemplaza el ledger V3.7 actual; registra un evento `RESTORE` nuevo.
10. V3.7.3 guarda revisiones de salida append-only en `ee_v373_pilot_exit_reviews`; una revisión nueva referencia la anterior mediante `supersedes`.
11. Cuenta local, sesión, marcadores de demo y secretos/backend quedan fuera del respaldo V3.7.

## Preflight

Antes de iniciar se confirma:

- dispositivo/navegador único;
- catálogo/SKU revisados;
- inventario inicial contado o marcado explícitamente como desconocido;
- baseline/costos reales tratados como privados;
- punto de partida de caja observado o documentado como no aplicable.

El botón de inicio genera primero un respaldo integral y luego agrega un evento `START` con periodo, actor local, timestamp, controles confirmados y checksum SHA-256 del respaldo.

## Captura interna local de pedidos V3.7.2

El checkout público sigue bloqueado correctamente mientras no exista un backend capaz de recibir datos personales y sincronizar pedidos fuera del dispositivo.

Para que ese bloqueo no impida el piloto, `piloto-operativo.html` carga `pilot-order-intake-v372` como adaptador interno. Se usa únicamente cuando un pedido llega por WhatsApp, teléfono o coordinación directa.

La entrada V3.7.2:

- toma el catálogo canónico y overrides locales;
- reutiliza `ee_v14_orders`;
- exige producto, cantidad, precio y costo histórico positivos por línea;
- guarda `unitCost` y `unit_cost_snapshot`;
- permite iniciar en `pending_payment` o `payment_review`;
- exige comprobante cuando el estado inicial es `payment_review`;
- permite anexar posteriormente el comprobante de un pedido pendiente y moverlo a `payment_review`;
- conserva fecha operativa, cliente, logística, flete y referencia de pago local;
- marca `source = pilot-local-intake-v372`;
- no aprueba pagos por sí misma;
- no activa checkout público, Supabase, Auth, RLS ni storage remoto.

El comprobante se guarda como `receiptDataUrl`, compatible con el guard existente de Operación V2.1. Sólo se aceptan JPG/PNG/WEBP; la imagen se reduce localmente antes de persistirla para limitar presión sobre `localStorage`. No se envía a ningún servicio remoto.

Después de que Operación aprueba el pago, preparación, despacho, producción, inventario, abastecimiento, cierre y caja continúan en sus módulos existentes.

## Respaldo integral privado

Formato: `el-errante-pilot-backup`  
Versión generada por el motor vigente: `3.7.1`

Incluye sólo datasets de negocio explícitamente permitidos por `DATASETS` en `assets/pilot-operations-v37.js`:

- pedidos y despacho;
- inventario conocido;
- mediciones de producción;
- compras/recepciones y órdenes de abastecimiento;
- evidencia V3.3 y cierres V3.6;
- gobierno de datos maestros y propuestas de costo;
- catálogo/configuración/costos fijos locales;
- baseline, working model, historial y movimientos financieros;
- conteos de caja.

El paquete agrega manifiesto, snapshot del ledger V3.7 y checksum SHA-256. Debe guardarse en almacenamiento privado.

Como `ee_v14_orders` forma parte del backup, los comprobantes locales anexados al pedido también forman parte del respaldo privado. No deben subirse al repositorio ni compartirse salvo necesidad expresa de soporte.

No incluye cuenta local, sesión, marcadores de demo, credenciales, `service_role` ni secretos de Supabase.

## Restauración

La restauración valida formato, versión y SHA-256 antes de cambiar cualquier dato. V3.7.1 genera backups `3.7.1`, pero acepta restaurar backups íntegros `3.7.0` ya emitidos por la versión publicada anterior; el checksum se valida usando la versión original del paquete.

Cada restauración genera un respaldo `pre-restore`, reemplaza únicamente datasets permitidos, no restaura cuenta/sesión/demo y agrega un evento `RESTORE` al ledger V3.7 actual, incluyendo la versión del backup restaurado.

V3.7.2 y V3.7.3 no cambian el formato de backup ni invalidan respaldos anteriores.

## Checkpoints

Mientras el piloto está activo, cada checkpoint genera un respaldo y agrega un evento `CHECKPOINT`. No modifica los hechos operativos.

## Reconciliación automática mínima

V3.7 no intenta hacer contabilidad automática. Lee las fuentes vigentes y señala, como mínimo:

- demo activa;
- pedidos activos sin fecha operativa;
- líneas de pedido sin costo histórico capturado;
- órdenes de compra vencidas/incompletas;
- inventario explícitamente desconocido;
- días con actividad sin cierre diario;
- cierres con excepciones;
- pedidos entregados/despachados sin conteo de caja en el periodo.

Para compras/recepciones, V3.7.1 reconoce de forma compatible `purchaseDate`, `purchase_date`, `receivedDate`, `received_date`, `receivedAt`, `date` y `createdAt`. Esto alinea el reconciliador con los hechos que realmente produce Abastecimiento V2.5.

Niveles:

- `BLOCKER`: invalida el piloto como evidencia real;
- `REVIEW`: exige reconciliación;
- `INFO`: señal que debe explicarse.

Gate calculado: `BLOCKED`, `NEEDS_REVIEW` o `EVIDENCE_COMPLETE`.

`EVIDENCE_COMPLETE` no significa auditoría, cierre contable, declaración fiscal ni exactitud económica absoluta; sólo indica que los controles automáticos V3.7 no detectan una brecha pendiente.

## Salida y aprendizaje V3.7.3

Una vez cerrado el piloto, `pilot-exit-v373` obliga a convertir la experiencia real en clasificaciones explícitas sobre:

- qué datos pueden seguir locales y cuáles necesitan persistencia compartida;
- qué acciones pueden seguir bajo control local y cuáles necesitan identidad/rol real;
- qué superficies se usaron diariamente, ocasionalmente, con fricción o no se usaron.

La revisión no modifica hechos operativos. Cada snapshot queda en `ee_v373_pilot_exit_reviews` y conserva historia mediante `supersedes`.

El gate de persistencia sólo puede llegar a una conclusión final cuando el piloto está cerrado, la reconciliación es `EVIDENCE_COMPLETE`, la revisión corresponde a la reconciliación vigente y no quedan clasificaciones por decidir.

Resultados finales posibles:

- `LOCAL_MODEL_SUFFICIENT`: el piloto no demuestra todavía necesidad de backend compartido;
- `BACKEND_DESIGN_CANDIDATE`: el piloto sí demuestra que debe diseñarse la siguiente arquitectura.

El segundo estado **no activa Supabase**. Autoriza únicamente pasar al diseño técnico de Auth, RLS, storage privado, migración, auditoría servidor, concurrencia e idempotencia.

## Ensayo integral previo

`tests/e2e/pilot-rehearsal-v371.spec.js` conserva el ensayo integral V3.7.1 que recorre inventario, producción, compra, evidencia, cierre, caja, checkpoint y reconciliación sobre una entrada determinística controlada.

`tests/e2e/pilot-intake-v372.spec.js` certifica la frontera de entrada real y `tests/e2e/pilot-exit-v373.spec.js` certifica la frontera de salida y decisión.

El conjunto verifica que:

- el pedido puede nacer desde una superficie interna legítima;
- queda en `ee_v14_orders` y conserva snapshot histórico de costo;
- `payment_review` exige comprobante y la aprobación sigue en Operación V2.1;
- la cadena de hechos puede reconciliarse;
- un piloto cerrado sin revisión no puede declarar decisión de arquitectura;
- brechas de reconciliación bloquean la candidatura;
- las revisiones de salida son append-only;
- una revisión completa puede concluir modelo local suficiente o candidato a diseño de backend sin activarlo.

## Cierre del piloto

Cerrar exige una nota mínima, genera respaldo final, calcula reconciliación y agrega un evento `END` con periodo, nota, checksum final, resumen y hallazgos. El cierre operativo precede a la revisión V3.7.3.

## Gate Supabase posterior

El piloto debe responder, con evidencia, cuáles datos necesitan realmente persistencia compartida, identidad real, permisos por rol, RLS, idempotencia, auditoría servidor, storage privado, concurrencia y reconciliación multiusuario.

Supabase sólo se diseña después de obtener el gate V3.7.3 correspondiente. V3.7.3 no activa backend.

## Certificación

Para integrar la superficie efectiva V3.7.3:

1. `scripts/verificar_piloto_v37.py` = PASS;
2. Playwright desktop + móvil = PASS;
3. `tests/e2e/pilot-operations-v37.spec.js` = PASS;
4. `tests/e2e/pilot-rehearsal-v371.spec.js` = PASS;
5. `tests/e2e/pilot-intake-v372.spec.js` = PASS;
6. `tests/e2e/pilot-exit-v373.spec.js` = PASS;
7. costo histórico, comprobante y guard V2.1 permanecen intactos;
8. backups V3.7.0 siguen siendo aceptados por V3.7.1;
9. las revisiones V3.7.3 son append-only y `EVIDENCE_GAPS` impide declarar candidato;
10. auditoría canónica = PASS;
11. validación/materialización = PASS;
12. Pages = publicado;
13. health-check público V3.7.3 = PASS;
14. Graphify = actualizado;
15. Supabase continúa inactivo;
16. no quedan PR redundantes del ciclo.