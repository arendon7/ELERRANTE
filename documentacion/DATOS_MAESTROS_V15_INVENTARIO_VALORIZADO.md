# Datos maestros V1.5 — inventario valorizado y variaciones

## Objetivo

Conectar cantidades físicas con una lectura económica útil sin convertir El Errante en un ERP ni atribuir al dato una precisión que todavía no existe.

## Fuentes

V1.5 no crea un kardex paralelo. Lee exclusivamente:

- conteo físico actual de materiales: `ee_v23_material_stock`;
- recepciones observadas: `ee_v24_material_purchases`;
- órdenes de compra: `ee_v25_purchase_orders`;
- pedidos operativos activos: `ee_v14_orders`;
- estándar efectivo e histórico: capas V1.2, V1.3 y V1.4.

## Dos valoraciones que no deben confundirse

### Valor estándar

`conteo físico actual × estándar efectivo vigente`

Sirve para exposición y planeación. No afirma cuánto costó adquirir las unidades existentes.

### Referencia observada

`conteo físico actual × costo unitario de la última recepción observada`

Es una referencia gerencial. **No** se presenta como FIFO, LIFO, promedio ponderado ni valorización contable por lotes porque el sistema todavía no identifica qué recepción compone cada unidad de inventario disponible.

Si no existe conteo físico, el inventario permanece `DESCONOCIDO`; nunca se convierte silenciosamente en cero.

## Variación de precio de compra

Una recepción sólo puede mostrar variación contra estándar cuando V1.4 preservó el estándar vigente en el momento económico de esa recepción:

`(costo observado - estándar histórico) / estándar histórico`

Una recepción legado sin estándar histórico comparable queda explícitamente como no comparable. V1.5 no usa el estándar vigente de hoy para reconstruir retrospectivamente el pasado.

Umbral inicial de alerta: **10% por encima del estándar histórico**. El umbral es una regla de lectura, no una modificación automática del estándar.

## Compras comprometidas y exposición de caja

- borrador / aprobada: propuesta todavía no emitida;
- emitida / parcial: compromiso abierto;
- recibida: recepción observada, ya no compromiso pendiente;
- exposición adicional: faltante después de conteo físico y compra emitida pendiente, valorizado al estándar efectivo cuando éste existe;
- exposición de caja V1.5: compromiso emitido valorizable + exposición adicional valorizable.

Una orden emitida sin costo acordado se conserva como compromiso no valorizable y genera señal de calidad de dato.

## Cobertura operativa

V1.5 explota la BOM de pedidos `approved` y `preparing`, y compara requerimiento contra:

`conteo físico conocido + cantidad emitida pendiente de recibir`

Estados:

- `covered`: requerimiento cubierto;
- `short`: faltante confirmado;
- `unknown`: el material es requerido pero no existe conteo físico;
- `not_required`: material sin requerimiento activo.

## Propiedades de integridad

1. V1.5 es de solo lectura sobre hechos económicos y operativos.
2. No modifica pedidos, conteos, recepciones, órdenes de compra, baseline ni ledger de materialización.
3. No inventa costo histórico.
4. Mantiene separado hecho observado, estándar vigente y referencia gerencial.
5. Finanzas puede interpretar el inventario, pero no operar compras ni modificar conteos desde esta capa.

## Criterio de cierre

V1.5 sólo se considera certificada cuando pasan sobre el SHA fusionado en `main`:

- barrera estructural V1.5;
- auditoría canónica acumulativa;
- validación y publicación de Pages;
- health-check público V1.5;
- regresión Playwright desktop y móvil.
