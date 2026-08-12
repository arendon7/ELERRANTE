# Piloto operativo controlado V3.7

## Objetivo

V3.7 prepara a El Errante para usar durante un periodo corto los flujos ya construidos con datos reales, sin activar todavía persistencia compartida ni convertir la aplicación en un ERP.

El piloto debe probar una cadena de hechos completa:

`pedido → producción → inventario → compra/recepción → cierre diario → caja → checkpoint → reconciliación → aprendizaje`

La superficie efectiva vigente es **V3.7.4**. El motor de backup, ledger y reconciliación permanece en **V3.7.1**; V3.7.2 aporta la entrada interna local de pedidos; V3.7.3 registra el aprendizaje de salida; y V3.7.4 añade una guía diaria para operar el piloto sin duplicar hechos ni cargar motores propietarios dentro de la superficie piloto.

## Contrato del piloto

1. Un único navegador/dispositivo controlado.
2. Datos reales y privados permanecen fuera del repositorio público.
3. Las demos operativa V3.1.1 y financiera V3.2.9 deben estar desactivadas.
4. Supabase permanece inactivo.
5. V3.7.1 no reescribe pedidos, producción, compras, inventario, cierres ni Finanzas salvo durante una restauración explícita y validada.
6. V3.7.2 puede crear pedidos nuevos en `ee_v14_orders` y anexar su comprobante local; no modifica el checkout público.
7. La aprobación de pago sigue perteneciendo a Operación V2.1.
8. Los eventos propios del motor V3.7 son append-only en `ee_v37_pilot_events`.
9. Una restauración nunca reemplaza el ledger V3.7 actual; registra un evento `RESTORE` nuevo.
10. V3.7.3 guarda revisiones de salida append-only en `ee_v373_pilot_exit_reviews`.
11. V3.7.4 guarda observaciones diarias append-only en `ee_v374_pilot_daily_observations` y no duplica pedidos, mediciones, compras, cierres o caja.
12. Cuenta local, sesión, marcadores de demo y secretos/backend quedan fuera del respaldo V3.7.

## Preflight

Antes de iniciar se confirma:

- dispositivo/navegador único;
- catálogo/SKU revisados;
- inventario inicial contado o marcado explícitamente como desconocido;
- baseline/costos reales tratados como privados;
- punto de partida de caja observado o documentado como no aplicable.

El inicio genera primero un respaldo integral y luego agrega un evento `START` con periodo, actor local, timestamp, controles confirmados y checksum SHA-256 del respaldo.

## Captura interna local de pedidos V3.7.2

El checkout público sigue bloqueado mientras no exista un backend capaz de recibir datos personales y sincronizar pedidos fuera del dispositivo.

`pilot-order-intake-v372` permite registrar internamente pedidos recibidos por WhatsApp, teléfono o coordinación directa.

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

El comprobante se guarda como `receiptDataUrl`, compatible con el guard existente de Operación V2.1. Sólo se aceptan JPG/PNG/WEBP y la imagen se reduce localmente antes de persistirla.

## Jornada real V3.7.4

`pilot-daily-v374` convierte el piloto en una rutina diaria guiada. Lee, sin reescribir, los stores propietarios de pedidos, producción, compras, cierre diario, caja y eventos del piloto.

Estados diarios:

- `PILOT_INACTIVE`;
- `OUTSIDE_PERIOD`;
- `NO_ACTIVITY`;
- `IN_PROGRESS`;
- `READY_FOR_CHECKPOINT`;
- `DAY_COMPLETE`.

Señales derivadas:

- pagos abiertos;
- actividad sin cierre V3.6;
- cierre con excepciones;
- pedidos entregados/despachados sin conteo de caja;
- actividad sin medición de producción;
- observación diaria faltante;
- cierre sin checkpoint privado.

Las acciones correctivas se ejecutan en sus módulos propietarios mediante enlaces directos. La superficie piloto no carga `daily-close-v36.js`, `finance-cash-trends-v323.js` ni otros motores de Operación/Finanzas.

### Observaciones diarias

Store: `ee_v374_pilot_daily_observations`.

Cada observación conserva fecha, actor, nota, fricción clasificada, snapshot resumido, fingerprint de hechos visibles y `supersedes` cuando una revisión posterior corrige la anterior.

Clasificaciones de fricción:

- `workflow`;
- `data`;
- `permissions`;
- `usability`;
- `performance`;
- `other`.

V3.7.4 interpreta timestamps de eventos con `America/Bogota`, de modo que un checkpoint nocturno no cambie artificialmente de jornada por UTC.

### Checkpoint diario

El botón **Checkpoint + respaldo privado** delega en `EL_ERRANTE_PILOT_V37.checkpoint()`; por ello el backup y el ledger siguen siendo los de V3.7.1.

V3.7.4 no modifica silenciosamente el schema `el-errante-pilot-backup`. Sus observaciones pueden exportarse junto al resumen de jornada mediante `el-errante-pilot-day`.

## Respaldo integral privado

Formato: `el-errante-pilot-backup`  
Versión generada por el motor vigente: `3.7.1`

Incluye únicamente datasets permitidos por `DATASETS` en `assets/pilot-operations-v37.js`:

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

Como `ee_v14_orders` forma parte del backup, los comprobantes locales anexados al pedido también forman parte del respaldo privado.

No incluye cuenta local, sesión, marcadores de demo, credenciales, `service_role`, secretos de Supabase ni el ledger V3.7.4, para no cambiar silenciosamente el contrato de backup V3.7.1.

## Restauración

La restauración valida formato, versión y SHA-256 antes de cambiar cualquier dato. V3.7.1 genera backups `3.7.1`, pero acepta respaldos íntegros `3.7.0` emitidos previamente.

Cada restauración genera un respaldo `pre-restore`, reemplaza únicamente datasets permitidos, no restaura cuenta/sesión/demo y agrega un evento `RESTORE` al ledger V3.7 actual.

V3.7.2, V3.7.3 y V3.7.4 no cambian el formato de backup.

## Checkpoints

Mientras el piloto está activo, cada checkpoint genera un respaldo y agrega un evento `CHECKPOINT`. No modifica los hechos operativos. V3.7.4 facilita este paso desde la jornada diaria.

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

Para compras/recepciones, V3.7.1 reconoce `purchaseDate`, `purchase_date`, `receivedDate`, `received_date`, `receivedAt`, `date` y `createdAt`.

Niveles:

- `BLOCKER`: invalida el piloto como evidencia real;
- `REVIEW`: exige reconciliación;
- `INFO`: señal que debe explicarse.

Gate calculado: `BLOCKED`, `NEEDS_REVIEW` o `EVIDENCE_COMPLETE`.

`EVIDENCE_COMPLETE` no significa auditoría, cierre contable, declaración fiscal ni exactitud económica absoluta; sólo indica que los controles automáticos V3.7 no detectan una brecha pendiente.

## Salida y aprendizaje V3.7.3

Una vez cerrado el piloto, `pilot-exit-v373` convierte la experiencia real en clasificaciones explícitas sobre:

- qué datos pueden seguir locales y cuáles necesitan persistencia compartida;
- qué acciones pueden seguir bajo control local y cuáles necesitan identidad/rol real;
- qué superficies se usaron diariamente, ocasionalmente, con fricción o no se usaron.

Cada snapshot queda en `ee_v373_pilot_exit_reviews` y conserva historia mediante `supersedes`.

Una conclusión final exige piloto cerrado, reconciliación `EVIDENCE_COMPLETE`, revisión vigente y todas las clasificaciones resueltas.

Resultados finales:

- `LOCAL_MODEL_SUFFICIENT`;
- `BACKEND_DESIGN_CANDIDATE`.

`BACKEND_DESIGN_CANDIDATE` no activa Supabase. Sólo autoriza diseñar Auth, RLS, storage privado, migración, auditoría servidor, concurrencia e idempotencia.

## Ensayos integrales

- `tests/e2e/pilot-operations-v37.spec.js`: motor, backup y reconciliación.
- `tests/e2e/pilot-rehearsal-v371.spec.js`: cadena integral controlada.
- `tests/e2e/pilot-intake-v372.spec.js`: frontera de entrada.
- `tests/e2e/pilot-exit-v373.spec.js`: frontera de salida y decisión.
- `tests/e2e/pilot-daily-v374.spec.js`: continuidad diaria, observaciones, cierre/checkpoint y móvil.

El conjunto verifica que el pedido puede nacer desde una superficie interna legítima, que los hechos continúan en sus stores propietarios, que el día puede cerrarse y respaldarse, que la reconciliación detecta brechas y que el aprendizaje posterior no activa backend por intuición.

## Cierre del piloto

Cerrar exige una nota mínima, genera respaldo final, calcula reconciliación y agrega un evento `END` con periodo, nota, checksum final, resumen y hallazgos. El cierre operativo precede a la revisión V3.7.3.

## Gate Supabase posterior

El piloto debe responder, con evidencia, cuáles datos necesitan realmente persistencia compartida, identidad real, permisos por rol, RLS, idempotencia, auditoría servidor, storage privado, concurrencia y reconciliación multiusuario.

Supabase sólo se diseña después de obtener el gate V3.7.3 correspondiente. V3.7.4 ayuda a producir la evidencia diaria; no activa backend.

## Certificación

Para integrar la superficie efectiva V3.7.4:

1. `scripts/verificar_piloto_v37.py` = PASS;
2. Playwright desktop + móvil = PASS;
3. `tests/e2e/pilot-operations-v37.spec.js` = PASS;
4. `tests/e2e/pilot-rehearsal-v371.spec.js` = PASS;
5. `tests/e2e/pilot-intake-v372.spec.js` = PASS;
6. `tests/e2e/pilot-exit-v373.spec.js` = PASS;
7. `tests/e2e/pilot-daily-v374.spec.js` = PASS;
8. costo histórico, comprobante y guard V2.1 permanecen intactos;
9. backups V3.7.0 siguen siendo aceptados por V3.7.1;
10. V3.7.4 no duplica hechos ni cambia el schema de backup V3.7.1;
11. observaciones V3.7.4 son append-only y usan fecha Bogotá;
12. revisiones V3.7.3 siguen siendo append-only;
13. auditoría canónica = PASS;
14. validación/materialización = PASS;
15. Pages = publicado;
16. health-check público V3.7.4 = PASS;
17. Graphify = actualizado;
18. Supabase continúa inactivo;
19. no quedan PR redundantes del ciclo.