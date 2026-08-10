# Datos maestros V1.4 — snapshots históricos de costo

## Propósito

V1.4 cierra la brecha entre el **estándar vigente** y el **costo que pertenecía a un hecho cuando ocurrió**. V1.3 sigue resolviendo costos prospectivos; V1.4 conserva evidencia económica histórica para que una revisión posterior del estándar no cambie el margen de pedidos, compras o movimientos ya ocurridos.

## Regla cardinal

`estándar vigente hoy ≠ costo histórico del hecho`

Un cálculo histórico nunca puede completar un costo faltante usando el estándar actual. Si el hecho no trae costo embebido y no existe un snapshot válido, el costo se declara **DESCONOCIDO / INCOMPLETO**.

## Capas

- `assets/historical-cost-snapshots-v14.js` — ledger y reconstrucción histórica.
- `assets/finance-historical-cost-v14.js` — lectura de cobertura, COGS y contribución histórica en Finanzas.
- `assets/historical-cost-v14.css` — presentación responsive.
- `ee_v14_cost_snapshot_events` — ledger local append-only de snapshots.
- `ee_v14_cost_snapshot_state` — cursor de activación/detección; no contiene la historia económica.
- `historical-cost-version.txt` — marcador público de la capa.

## Reconstrucción `as-of`

V1.4 no depende del estándar que esté vigente cuando el usuario abre el sistema. Lee `ee_v12_cost_materialization_events` y reconstruye, para una fecha/hora determinada:

1. baseline canónico del material;
2. revisiones `MATERIALIZED` cuya fecha sea menor o igual al momento del hecho;
3. última revisión aplicable por material;
4. BOM del producto valorizada con ese conjunto histórico de revisiones.

Esto permite capturar tarde un pedido aprobado a las 06:00 aunque a las 07:00 ya exista una revisión nueva: el pedido sigue usando la revisión que estaba vigente a las 06:00.

## Pedidos

Al entrar por primera vez a un estado económico (`approved`, `preparing`, `dispatched`, `delivered`), V1.4 puede registrar un `ORDER_COST_SNAPSHOT` con:

- pedido y estado;
- `effectiveAt` del hecho;
- actor y momento de captura;
- firma de revisiones estándar aplicables;
- producto/SKU, cantidad y precio;
- costo unitario histórico;
- origen (`CANONICAL_BASELINE` o `MATERIALIZED_STANDARD`);
- revisión estándar;
- detalle de BOM con costos unitarios y aportes;
- COGS conocido y bandera de completitud.

Un snapshot existente es idempotente: cambiar el estándar después no lo reescribe.

## Migración de pedidos anteriores

La primera activación guarda un cursor de los hechos ya existentes y **no crea snapshots retroactivos** con el estándar vigente.

Para un pedido anterior:

- si la línea ya contiene `unitCost` / `unit_cost_snapshot`, se conserva como `LEGACY_EMBEDDED`;
- si no contiene costo histórico, queda `UNKNOWN` e incompleto;
- no se usa V1.3 para rellenar el vacío.

## Compras

Una recepción nueva puede registrar `PURCHASE_STANDARD_SNAPSHOT` con dos valores separados:

- **costo observado** de la compra/recepción;
- **estándar que estaba vigente en ese momento**, reconstruido `as-of`.

Esto prepara V1.5 para calcular variaciones compra-vs-estándar correctamente, sin comparar una factura histórica contra el estándar de hoy.

Para compras anteriores sin snapshot V1.4 se conserva sólo el costo observado. El estándar histórico se declara desconocido en vez de inferirse.

## Movimientos

Los movimientos de inventario sólo usan un costo embebido/observado si el hecho lo trae. Un movimiento sin costo queda explícitamente `UNKNOWN`; V1.4 no lo valoriza retroactivamente con el estándar actual.

## Finanzas

La vista V1.4 muestra:

- ventas en estados económicos;
- COGS histórico conocido;
- contribución conocida;
- cobertura de costo;
- pedidos completos/incompletos;
- origen del costo histórico.

La contribución y el margen sólo se calculan cuando el snapshot es completo. Un pedido incompleto no entra al COGS conocido como si su costo fuera cero.

## Invariantes

1. V1.4 no modifica `materials-data-v23.js`.
2. V1.4 no modifica `ee_v12_cost_materialization_events`.
3. V1.4 no reescribe pedidos, compras ni movimientos fuente.
4. El ledger V1.4 es append-only por hecho.
5. Una revisión posterior del estándar no cambia un snapshot existente.
6. Una captura tardía usa el estándar vigente `as-of` el momento del hecho, no el vigente al momento de capturar.
7. Migrar hechos antiguos no autoriza inventar costos.
8. Costo desconocido no equivale a cero.
9. La simulación financiera V1.3/V3.2.2 nunca forma parte de un costo histórico.
10. V1.4 prepara variaciones e inventario valorizado, pero no los implementa todavía.

## Certificación

La capa se certifica de forma componible:

- `scripts/verificar_master_cost_bridge_v13.py` encadena `scripts/verificar_historical_cost_snapshots_v14.py`, por lo que las barreras canónica y Pages existentes incluyen V1.4 sin duplicar la arquitectura de publicación;
- `.github/workflows/historical-cost-v14.yml` añade una barrera PR propia y un health-check público posterior al despliegue;
- el health-check exige el SHA real publicado mediante `deploy-version.txt` y luego verifica el marcador y los activos V1.4 servidos por Pages;
- Playwright cubre no-retroactividad, captura tardía, migración, compras, integridad y responsive.

## Siguiente capa

V1.5 debe usar estos snapshots para construir **inventario valorizado y variaciones**. No debe intentar resolver por sí misma qué costo histórico correspondía a cada hecho; esa responsabilidad queda centralizada en V1.4.
