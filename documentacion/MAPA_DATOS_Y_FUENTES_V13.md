# Mapa de datos y fuentes — Datos maestros V1.3

## Matriz de costos

| Dato | Fuente | Naturaleza | Consumidor | Escritura permitida |
|---|---|---|---|---|
| Baseline de material | `assets/materials-data-v23.js` | Referencia técnica canónica | Studio / Operación / Finanzas | No en runtime |
| Compra observada | `ee_v24_material_purchases` | Hecho histórico | Operación / Studio / Finanzas | Sólo flujo de compras |
| Propuesta | `ee_v11_cost_proposal_events` | Decisión en trámite | Studio | Sólo V1.1 |
| Revisión materializada | `ee_v12_cost_materialization_events` | Estándar prospectivo versionado | Studio / puente V1.3 | Sólo V1.2 |
| Estándar efectivo | `master-cost-prospective-v13.js` | Vista derivada | Operación / Finanzas | No |
| Override financiero | `ee_v322_material_cost_overrides` | Simulación local | Finanzas | Sólo Finanzas |
| Costo histórico | snapshot del hecho | Hecho pasado | Finanzas / auditoría | Inmutable una vez registrado |

## Precedencia prospectiva

Para valorizar una BOM futura:

1. partir del baseline;
2. si existe una revisión V1.2, usar la última revisión materializada;
3. en Finanzas, si existe un override de simulación, usarlo únicamente en ese escenario.

Formalmente:

`costo_financiero_simulado = override ?? estándar_materializado ?? baseline`

Operación no consume overrides de Finanzas.

## Separación por contexto

### Operación

Lee cantidades de BOM, pedidos activos, stock y estándar efectivo. Puede registrar conteos y hechos mediante sus motores existentes. V1.3 sólo modifica la **valoración prospectiva**, no las cantidades ni la historia.

### Finanzas

Lee el mismo estándar efectivo como base de economía unitaria. Puede superponer simulaciones locales y copiar una BOM a un costo planificado/estimado del modelo de trabajo, pero no puede aplicar esa simulación al maestro.

### Studio

Sigue siendo la única superficie que gobierna propuesta, aprobación y materialización de estándares.

## Regla histórica

Un cambio del estándar hoy no debe alterar el costo asociado a una compra, venta, pedido o movimiento ocurrido ayer. V1.4 formalizará de manera uniforme esos snapshots para nuevos hechos.