# Datos maestros V1.2 — materialización controlada de costos

## Propósito

V1.2 cierra la separación entre **observar**, **proponer**, **aprobar** y **hacer vigente** un cambio de costo estándar. Una compra observada continúa siendo un hecho histórico; una propuesta V1.1 continúa siendo una decisión en trámite; una aprobación continúa siendo una autorización. Sólo V1.2 puede convertir esa autorización en una nueva revisión del estándar prospectivo.

## Principio de arquitectura

La fuente `assets/materials-data-v23.js` es un **baseline canónico inmutable**. V1.2 no la edita en runtime y no reescribe `DATA.materials`, productos, BOM, compras, recetas ni históricos. El estándar efectivo se reconstruye como:

`baseline canónico + ledger V1.2 ordenado = estándar efectivo`

El ledger local es `ee_v12_cost_materialization_events` y es append-only.

## Flujo de gobierno

1. Una compra observada queda registrada en el historial de compras.
2. V1.1 crea una propuesta anclada a una compra del mismo material y guarda un snapshot del estándar vigente al momento de crearla.
3. La propuesta pasa por `CREATED → SUBMITTED → APPROVED` o `REJECTED`.
4. Una aprobación no modifica todavía el estándar.
5. V1.2 verifica que la propuesta siga vigente contra el estándar actual.
6. Un usuario autorizado materializa explícitamente la aprobación y registra razón, actor y fecha.
7. Se agrega un evento `MATERIALIZED` con revisión anterior y nueva.
8. Los consumidores prospectivos pueden consultar `effectiveStandardCost`, `effectiveMaterial` o `effectiveProductCost` sin alterar hechos históricos.

## Contrato del evento MATERIALIZED

Cada evento conserva como mínimo:

- `eventId`
- `proposalId`
- `materialId`, nombre y unidad
- `fromRevision` y `toRevision`
- `baselineCost`
- `fromCost` y `toCost`
- `approvalEventId`, fecha y actor de aprobación
- fecha y actor de materialización
- razón explícita de materialización
- snapshot de la evidencia observada
- justificación original de la propuesta

## Control contra decisiones obsoletas

V1.2 aplica control optimista de concurrencia. Antes de materializar compara el costo estándar vigente con `standardCost`, el snapshot contra el que nació la propuesta.

Si son diferentes, la propuesta queda **obsoleta** y no puede aplicarse. Debe crearse una propuesta nueva contra el estándar vigente. Esto evita que dos aprobaciones paralelas reescriban silenciosamente una decisión más reciente.

## Doble aplicación

Un `proposalId` sólo puede materializarse una vez. Un segundo intento se rechaza aunque el costo coincidiera.

## Integridad histórica

Materializar no puede modificar:

- `ee_v24_material_purchases`;
- `ee_v11_cost_proposal_events`;
- el arreglo canónico de materiales;
- productos y BOM;
- ventas, pedidos o inventarios;
- hechos financieros históricos.

El ledger V1.2 es la única escritura permitida por el motor V1.2.

## Semántica del costo efectivo

- **Baseline:** costo incluido en la fuente canónica V2.3.
- **Estándar efectivo:** última revisión materializada; si no existe, baseline.
- **Costo observado:** precio unitario de una compra real; no sustituye automáticamente el estándar.
- **Simulación:** override financiero local; no se convierte en estándar.
- **Costo histórico:** snapshot asociado a un hecho pasado; no se recalcula cuando cambia el estándar.

## Siguiente integración

La fase posterior debe conectar este resolver exclusivamente con cálculos **prospectivos** de Operación y Finanzas: requerimientos valorizados, BOM recalculada, costo estándar esperado y margen planificado. Los hechos ya ocurridos deben continuar usando sus snapshots históricos.
