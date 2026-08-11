# Piloto operativo controlado V3.7

## Objetivo

V3.7 prepara a El Errante para usar durante un periodo corto los flujos ya construidos con datos reales, sin activar todavía persistencia compartida ni convertir la aplicación en un ERP.

El piloto debe probar una cadena de hechos completa:

`pedido → producción → inventario → compra/recepción → cierre diario → caja → reconciliación`

La superficie efectiva vigente es **V3.7.2**. El motor de backup, ledger y reconciliación permanece en **3.7.1**; V3.7.2 añade únicamente una entrada interna local para que un pedido real recibido fuera del checkout pueda nacer desde UI sin activar Supabase.

## Contrato del piloto

1. Un único navegador/dispositivo controlado.
2. Datos reales y privados permanecen fuera del repositorio público.
3. Las demos operativa V3.1.1 y financiera V3.2.9 deben estar desactivadas.
4. Supabase permanece inactivo.
5. V3.7.1 no reescribe pedidos, producción, compras, inventario, cierres ni Finanzas salvo cuando el usuario ejecuta explícitamente una restauración de respaldo.
6. V3.7.2 puede **crear pedidos nuevos** en `ee_v14_orders` mediante la entrada interna local; no modifica el checkout público.
7. Los eventos propios de V3.7 son append-only en `ee_v37_pilot_events`.
8. Una restauración nunca reemplaza el ledger V3.7 actual; registra un evento `RESTORE` nuevo.
9. Cuenta local, sesión, marcadores de demo y secretos/backend quedan fuera del respaldo V3.7.

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
- conserva fecha operativa, cliente, logística, flete y referencia de pago local;
- marca `source = pilot-local-intake-v372`;
- no adjunta comprobantes;
- no activa checkout público, Supabase, Auth, RLS ni storage remoto.

Después de crear el pedido, la aprobación, preparación, despacho, producción, inventario, abastecimiento, cierre y caja continúan en sus módulos existentes.

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

No incluye cuenta local, sesión, marcadores de demo, credenciales, `service_role` ni secretos de Supabase.

## Restauración

La restauración valida formato, versión y SHA-256 antes de cambiar cualquier dato. V3.7.1 genera backups `3.7.1`, pero acepta restaurar backups íntegros `3.7.0` ya emitidos por la versión publicada anterior; el checksum se valida usando la versión original del paquete.

Cada restauración genera un respaldo `pre-restore`, reemplaza únicamente datasets permitidos, no restaura cuenta/sesión/demo y agrega un evento `RESTORE` al ledger V3.7 actual, incluyendo la versión del backup restaurado.

V3.7.2 no cambia el formato de backup ni invalida respaldos anteriores.

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

## Ensayo integral previo

`tests/e2e/pilot-rehearsal-v371.spec.js` conserva el ensayo integral V3.7.1 que recorre inventario, producción, compra, evidencia, cierre, caja, checkpoint y reconciliación sobre una entrada determinística controlada.

V3.7.2 añade `tests/e2e/pilot-intake-v372.spec.js`, que certifica el hueco que antes obligaba al ensayo a sembrar el pedido inicial:

- el pedido puede nacer desde una superficie interna legítima;
- queda en `ee_v14_orders`;
- el snapshot histórico de costo se conserva;
- una línea con costo cero/desconocido no puede guardarse.

El ensayo integral V3.7.1 se mantiene estable como regresión histórica y el test V3.7.2 certifica específicamente la nueva frontera de entrada. Juntos separan defectos de integración de hallazgos propios del uso real.

## Cierre del piloto

Cerrar exige una nota mínima, genera respaldo final, calcula reconciliación y agrega un evento `END` con periodo, nota, checksum final, resumen y hallazgos.

## Gate Supabase posterior

El piloto debe responder, con evidencia, cuáles datos necesitan realmente persistencia compartida, identidad real, permisos por rol, RLS, idempotencia, auditoría servidor, storage privado, concurrencia y reconciliación multiusuario.

Supabase sólo se propone después de revisar el informe del piloto. V3.7.2 no activa backend.

## Certificación

Para integrar la superficie efectiva V3.7.2:

1. `scripts/verificar_piloto_v37.py` = PASS;
2. Playwright desktop + móvil = PASS;
3. `tests/e2e/pilot-operations-v37.spec.js` = PASS;
4. `tests/e2e/pilot-rehearsal-v371.spec.js` = PASS;
5. `tests/e2e/pilot-intake-v372.spec.js` = PASS;
6. la captura V3.7.2 conserva costo histórico y bloquea costo cero;
7. la regresión V3.7.1 prueba que `receivedDate` de V2.5 cuenta como compra/recepción del periodo;
8. la regresión valida que un backup íntegro V3.7.0 sigue siendo aceptado por V3.7.1;
9. auditoría canónica = PASS;
10. validación/materialización = PASS;
11. Pages = publicado;
12. health-check público V3.7.2 = PASS;
13. Graphify = actualizado;
14. no quedan PR redundantes del ciclo.