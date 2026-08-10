# Roadmap operativo posterior a Datos maestros V1.2

## V1.2 — materialización controlada

Objetivo: convertir una propuesta aprobada en una revisión efectiva y trazable del costo estándar sin mutar baseline ni hechos históricos.

Estado objetivo: resolver estándar efectivo por material y producto mediante ledger append-only.

## V1.3 — puente prospectivo Operación / Finanzas

Objetivo: hacer que los cálculos prospectivos consuman el estándar efectivo V1.2.

Alcance:

- BOM recalculada con estándar efectivo;
- requerimientos valorizados de producción;
- costo estándar esperado por producto;
- margen planificado con origen del costo visible;
- Finanzas mantiene sus overrides como simulación por encima del estándar, nunca como dato maestro;
- ningún pedido, compra o movimiento histórico se recalcula retroactivamente.

## V1.4 — snapshots de costo en hechos

Objetivo: asegurar que cada hecho económico relevante preserve el costo que regía cuando ocurrió.

Alcance:

- snapshot de costo estándar/evidencia en órdenes y movimientos relevantes;
- diferenciación entre costo estándar, acordado, observado e histórico;
- reconstrucción de margen histórico sin depender del estándar vigente de hoy.

## V1.5 — inventario valorizado y variaciones

Objetivo: conectar cantidades físicas con valoración sin convertir la aplicación en un ERP pesado.

Alcance:

- inventario valorizado por material;
- compras comprometidas vs. recibidas;
- variación precio de compra vs. estándar;
- alertas por desviaciones relevantes;
- cobertura y exposición de caja.

## V1.6 — costo de producción y merma

Objetivo: incorporar rendimientos, mermas y consumos reales cuando exista evidencia suficiente.

Alcance:

- estándar vs. consumo observado;
- merma registrada y explicada;
- rendimiento por lote;
- costo esperado vs. costo de producción observado;
- trazabilidad hasta producto/lote cuando el dato exista.

## V1.7 — cierre y recomendación de decisiones

Objetivo: convertir los datos anteriores en una capa ejecutiva simple.

Alcance:

- margen por producto y periodo;
- drivers de desviación;
- alertas priorizadas;
- recomendaciones de revisión de costo/precio;
- propuestas de cambio que regresan al flujo de gobierno, nunca se aplican automáticamente.

## Principio transversal

Cada nueva capa debe separar explícitamente:

`hecho observado ≠ estándar vigente ≠ simulación ≠ decisión propuesta ≠ decisión aprobada ≠ revisión materializada`
