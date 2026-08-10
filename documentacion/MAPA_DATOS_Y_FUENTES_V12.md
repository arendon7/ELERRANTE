# Mapa de datos y fuentes — extensión V1.2

## Costos de materiales

| Concepto | Fuente | Naturaleza | Puede reescribir hechos |
|---|---|---|---|
| Baseline de material | `assets/materials-data-v23.js` | Canon técnico provisional | No |
| Compra observada | `ee_v24_material_purchases` | Hecho histórico | No |
| Gobierno de material/proveedor | `ee_v10_master_governance` | Metadata de gobierno | No |
| Propuesta de costo | `ee_v11_cost_proposal_events` | Decisión en trámite / aprobada | No |
| Materialización de estándar | `ee_v12_cost_materialization_events` | Revisión prospectiva versionada | No |
| Estándar efectivo | Resolver V1.2 | Vista derivada baseline + ledger | No |
| Override de Finanzas | `ee_v322_material_cost_overrides` | Simulación local | No |

## Precedencia para cálculos prospectivos

La precedencia objetivo para un material es:

1. baseline canónico;
2. última revisión materializada V1.2 = estándar efectivo;
3. override financiero, si existe, únicamente para simulación del escenario financiero.

La compra observada nunca ocupa automáticamente el lugar del estándar.

## Hechos históricos

Pedidos aprobados, compras recibidas, movimientos de inventario y demás hechos deben conservar sus snapshots históricos. Una nueva revisión del estándar no recalcula retroactivamente esos registros.

## Contrato de integración siguiente

Operación y Finanzas pueden leer el estándar efectivo V1.2 para cálculos prospectivos, pero deben mantener visible el origen del valor (`CANONICAL_BASELINE`, `MATERIALIZED` o `SIMULATION`) y nunca confundirlo con costo observado o costo histórico.