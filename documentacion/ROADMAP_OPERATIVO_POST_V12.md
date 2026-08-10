# Roadmap operativo posterior a Datos maestros V1.2

## Estado de la secuencia

- **V1.2 — certificada en main**: materialización controlada y versionada del estándar.
- **V1.3 — certificada en main**: puente prospectivo hacia Operación y Finanzas.
- **V1.4 — certificada en main**: snapshots históricos de costo y margen no retroactivo.
- **V1.5 — candidato actual**: inventario valorizado, variaciones y exposición.
- **Siguiente frente al certificar V1.5: V1.6** — costo real de producción y merma.

## V1.2 — materialización controlada

Objetivo: convertir una propuesta aprobada en una revisión efectiva y trazable del costo estándar sin mutar baseline ni hechos históricos.

Resultado: estándar efectivo por material y producto reconstruible mediante ledger append-only, con bloqueo de doble aplicación y de propuestas obsoletas.

## V1.3 — puente prospectivo Operación / Finanzas

Objetivo: hacer que los cálculos prospectivos consuman el estándar efectivo V1.2.

Alcance:

- BOM recalculada con estándar efectivo;
- requerimientos valorizados de producción;
- costo estándar esperado por producto;
- margen planificado con origen del costo visible;
- Finanzas mantiene sus overrides como simulación por encima del estándar, nunca como dato maestro;
- restablecer una simulación vuelve al estándar vigente, no al baseline original;
- Operación no consume simulaciones financieras;
- ningún pedido, compra, conteo o movimiento histórico se recalcula retroactivamente.

Criterio de cierre: audit, validación/publicación, Playwright desktop/móvil y health-check público verdes sobre el SHA fusionado en `main`.

## V1.4 — snapshots de costo en hechos

Objetivo: asegurar que cada hecho económico relevante preserve el costo que regía cuando ocurrió.

Alcance:

- definir qué eventos necesitan snapshot de costo y en qué momento se congela;
- snapshot de estándar, origen y revisión en órdenes/movimientos relevantes;
- diferenciación entre costo estándar, acordado, observado e histórico;
- reconstrucción de margen histórico sin depender del estándar vigente de hoy;
- migración compatible para hechos existentes sin inventar datos que nunca fueron observados.

## V1.5 — inventario valorizado y variaciones

Objetivo: conectar cantidades físicas con valoración sin convertir la aplicación en un ERP pesado.

Alcance:

- inventario valorizado por material, manteniendo separado valor estándar y referencia observada;
- compras comprometidas vs. recibidas;
- variación precio de compra vs. estándar histórico preservado por V1.4;
- alertas por desviaciones relevantes;
- cobertura de pedidos activos y exposición de caja;
- inventario desconocido permanece desconocido: nunca se interpreta como cero;
- no se declara FIFO, promedio ponderado ni valorización contable por lotes sin evidencia de lotes de adquisición.

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

`hecho observado ≠ baseline ≠ estándar vigente ≠ simulación ≠ decisión propuesta ≠ decisión aprobada ≠ revisión materializada ≠ costo histórico ≠ referencia gerencial de valoración`
