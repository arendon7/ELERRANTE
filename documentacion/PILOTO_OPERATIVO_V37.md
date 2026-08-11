# Piloto operativo controlado V3.7

## Objetivo

V3.7 prepara a El Errante para usar durante un periodo corto los flujos ya construidos con datos reales, sin activar todavía persistencia compartida ni convertir la aplicación en un ERP.

El piloto debe probar una cadena de hechos completa:

`pedido → producción → inventario → compra/recepción → cierre diario → caja → reconciliación`

V3.7 no duplica esos formularios. Añade una superficie auxiliar para controlar el experimento, respaldar los datos locales y hacer visibles las brechas que determinen el siguiente paso técnico.

El runtime vigente del piloto es **3.7.1**. El patch V3.7.1 conserva la arquitectura V3.7 y corrige la reconciliación de recepciones V2.5 para reconocer `receivedDate` / `received_date` como fecha efectiva de compra/recepción.

## Contrato del piloto

1. Un único navegador/dispositivo controlado.
2. Datos reales y privados permanecen fuera del repositorio público.
3. Las demos operativa V3.1.1 y financiera V3.2.9 deben estar desactivadas.
4. Supabase permanece inactivo.
5. El piloto no reescribe pedidos, producción, compras, inventario, cierres ni Finanzas salvo cuando el usuario ejecuta explícitamente una restauración de respaldo.
6. Los eventos propios de V3.7 son append-only en `ee_v37_pilot_events`.
7. Una restauración nunca reemplaza el ledger V3.7 actual; registra un evento `RESTORE` nuevo.
8. Cuenta local, sesión, marcadores de demo y secretos/backend quedan fuera del respaldo V3.7.

## Preflight

Antes de iniciar se confirma:

- dispositivo/navegador único;
- catálogo/SKU revisados;
- inventario inicial contado o marcado explícitamente como desconocido;
- baseline/costos reales tratados como privados;
- punto de partida de caja observado o documentado como no aplicable.

El botón de inicio genera primero un respaldo integral y luego agrega un evento `START` con periodo, actor local, timestamp, controles confirmados y checksum SHA-256 del respaldo.

## Respaldo integral privado

Formato: `el-errante-pilot-backup`  
Versión: `3.7.1`

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

La restauración valida formato, versión y SHA-256 antes de cambiar cualquier dato. Genera un respaldo `pre-restore`, reemplaza únicamente datasets permitidos, no restaura cuenta/sesión/demo y agrega un evento `RESTORE` al ledger V3.7 actual.

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

## Ensayo integral previo V3.7.1

Antes de introducir datos reales se ejecuta `tests/e2e/pilot-rehearsal-v371.spec.js` como prueba de jornada completa.

El ensayo usa únicamente dos entradas controladas que hoy no pueden nacer desde una superficie pública real porque el backend sigue deliberadamente inactivo:

- un pedido inicial aprobado con fecha y costo histórico capturado;
- un baseline financiero privado mínimo para habilitar la observación de caja.

A partir de esas entradas, la prueba recorre las superficies reales de usuario y exige que funcionen de manera integrada:

1. inicio del piloto y respaldo desde `piloto-operativo.html`;
2. conteo físico desde Materiales;
3. transición `Pago aprobado → En preparación`, alistamiento 4/4 y despacho desde Producción;
4. lote, rendimiento y merma desde Medición;
5. borrador, aprobación, emisión y recepción desde Abastecimiento;
6. evidencias de inventario, recepción y tiempo desde Evidencia V3.3;
7. cierre limpio desde Cierre diario V3.6;
8. conteo observado desde Finanzas V3.2.3;
9. checkpoint, reconciliación y cierre desde V3.7.

El ensayo sólo se considera exitoso cuando la reconciliación final tiene `blockers=0`, `reviews=0`, contabiliza la recepción V2.5 del periodo y termina con `exitGate=EVIDENCE_COMPLETE`; además, el ledger debe terminar exactamente en `START → CHECKPOINT → END`.

Este ensayo no sustituye el piloto real. Su función es separar defectos de integración de los hallazgos propios del uso real, para que el siguiente ciclo no confunda errores técnicos con necesidades de negocio.

## Cierre del piloto

Cerrar exige una nota mínima, genera respaldo final, calcula reconciliación y agrega un evento `END` con periodo, nota, checksum final, resumen y hallazgos.

## Gate Supabase posterior

El piloto debe responder, con evidencia, cuáles datos necesitan realmente persistencia compartida, identidad real, permisos por rol, RLS, idempotencia, auditoría servidor, storage privado, concurrencia y reconciliación multiusuario.

Supabase sólo se propone después de revisar el informe del piloto. V3.7 no activa backend.

## Certificación

Para integrar V3.7.1 y su ensayo previo:

1. `scripts/verificar_piloto_v37.py` = PASS;
2. Playwright desktop + móvil = PASS, incluido `tests/e2e/pilot-operations-v37.spec.js`;
3. `tests/e2e/pilot-rehearsal-v371.spec.js` = PASS en escritorio usando las superficies reales del flujo;
4. la regresión específica prueba que `receivedDate` de V2.5 cuenta como compra/recepción del periodo;
5. auditoría canónica = PASS;
6. validación/materialización = PASS;
7. Pages = publicado;
8. health-check público V3.7.1 = PASS;
9. Graphify = actualizado;
10. no quedan PR redundantes del ciclo.
