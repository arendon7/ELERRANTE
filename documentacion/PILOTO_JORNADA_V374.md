# Piloto operativo V3.7.4 — jornada real y continuidad diaria

## Objetivo

V3.7.4 convierte el piloto ya instrumentado en una rutina operativa diaria fácil de ejecutar. No crea otro dashboard ni reemplaza los módulos fuente.

La guía lee los hechos existentes de:

- pedidos `ee_v14_orders`;
- mediciones de producción `ee_v24_production_measurements`;
- compras/recepciones `ee_v24_material_purchases`;
- cierres V3.6 `ee_v36_daily_close_events`;
- conteos de caja `ee_v323_cash_counts`;
- eventos/checkpoints del piloto `ee_v37_pilot_events`.

## Principio

`piloto-operativo.html` debe indicar **qué falta para completar la jornada**, pero la corrección del hecho se hace en su módulo propietario.

Por tanto V3.7.4:

- no aprueba pagos;
- no crea mediciones de producción;
- no registra compras;
- no ejecuta el cierre V3.6;
- no registra conteos de caja;
- no reescribe hechos operativos o financieros;
- sí puede invocar el checkpoint privado ya existente en V3.7.1;
- sí registra aprendizaje/observaciones propios del piloto.

## Estados diarios

- `PILOT_INACTIVE`: no existe un piloto activo.
- `OUTSIDE_PERIOD`: la fecha no pertenece al periodo activo.
- `NO_ACTIVITY`: fecha válida, pero todavía no hay hechos de pedidos, medición o compras.
- `IN_PROGRESS`: hay actividad y faltan controles obligatorios o el cierre.
- `READY_FOR_CHECKPOINT`: existe cierre y no hay bloqueos diarios, pero falta el checkpoint privado.
- `DAY_COMPLETE`: existe cierre y checkpoint para la fecha.

Estos estados son de continuidad del piloto; no equivalen a cierre contable ni auditoría.

## Señales

La guía puede señalar:

- `PAYMENT_OPEN`: pedidos con pago pendiente/revisión/rechazo;
- `DAILY_CLOSE_MISSING`: existe actividad y falta cierre V3.6;
- `DAILY_CLOSE_EXCEPTION`: el cierre vigente contiene excepciones;
- `CASH_COUNT_MISSING`: existen pedidos entregados/despachados sin conteo de caja de la fecha;
- `MEASUREMENT_EMPTY`: hay actividad pero no medición de producción;
- `OBSERVATION_MISSING`: falta una observación breve del uso real;
- `CHECKPOINT_MISSING`: existe cierre pero falta checkpoint privado.

Sólo `DAILY_CLOSE_MISSING` se trata como bloqueo de continuidad. Las demás señales orientan revisión y aprendizaje sin inventar hechos.

## Observaciones append-only

Store: `ee_v374_pilot_daily_observations`.

Cada registro conserva:

- fecha operativa;
- actor local;
- nota;
- fricciones clasificadas (`workflow`, `data`, `permissions`, `usability`, `performance`, `other`);
- snapshot resumido del estado observado;
- fingerprint de los hechos visibles;
- `supersedes` cuando una observación posterior corrige la anterior.

Nunca se elimina o sobrescribe una observación anterior.

## Checkpoint

El botón **Checkpoint + respaldo privado** delega en `EL_ERRANTE_PILOT_V37.checkpoint()`.

Por tanto:

- el backup continúa usando el contrato V3.7.1;
- se mantiene SHA-256 y descarga privada;
- V3.7.4 no altera el schema de backup;
- el checkpoint queda en el ledger V3.7 existente.

La guía interpreta timestamps de eventos usando `America/Bogota`, evitando que una jornada nocturna cambie artificialmente de fecha por UTC.

## Exportación de jornada

V3.7.4 puede descargar un JSON `el-errante-pilot-day` con:

- estado resumido de la fecha;
- conteos y referencias mínimas de hechos;
- issues derivados;
- observaciones V3.7.4 de esa jornada.

Esta exportación es local y privada. No se envía a GitHub ni a un backend.

## Privacidad y backend

- Supabase permanece inactivo.
- No se usa `createClient`, Auth, RLS ni storage remoto.
- Los datos reales continúan en el navegador controlado y en backups/exportaciones privadas.
- V3.7.4 no cambia el checkout público.

## Certificación

La integración exige:

1. `scripts/verificar_piloto_v37.py` = PASS con V3.7.4;
2. `tests/e2e/pilot-daily-v374.spec.js` = PASS desktop y móvil;
3. piloto inactivo no permite observaciones/checkpoints diarios;
4. actividad real sin cierre produce `IN_PROGRESS`;
5. cierre sin checkpoint produce `READY_FOR_CHECKPOINT`;
6. cierre + checkpoint produce `DAY_COMPLETE`;
7. observaciones son append-only con `supersedes`;
8. la guía no duplica hechos fuente;
9. timestamps de checkpoint se asignan a fecha Bogotá;
10. Playwright completo = PASS;
11. auditoría canónica, publicación y health-check = PASS;
12. Graphify sincronizado;
13. Supabase continúa inactivo.
