# Finanzas V3.5.1 · mesa clara y edición directa

## Objetivo

Reducir fricción de uso sin eliminar la profundidad financiera existente. V3.5.1 añade una mesa mensual orientada a tareas sobre las mismas fuentes locales y contratos históricos.

## Superficie principal

- lectura mensual de ventas, margen, resultado y caja;
- selector único de mes;
- tabla editable de unidades plan, precio, costo directo y calidad del costo;
- tabla corta de salidas de caja planificadas;
- conteo de caja observado desde la misma mesa;
- alta de movimientos reales desde tabla;
- corrección de movimientos reales desde fila.

## Regla de edición

### Planeación

Las celdas de plan, precio, costo y caja modifican `ee_v31_finance_working_model`, recalculan mediante el motor V3.1 y dejan evento en `ee_v31_finance_history`.

### Hechos reales

Los movimientos usan `ee_v27_finance_movements`. Una corrección no reescribe ni elimina el original: llama `EL_ERRANTE_FINANCE_V321.applyCorrection()` para crear reversión y nuevo movimiento corregido.

Las ventas reales no son editables desde Finanzas. Proceden de pedidos y deben corregirse en Operación.

Los conteos de caja usan `EL_ERRANTE_FINANCE_V323.recordCashCount()` y preservan observaciones anteriores.

## Compatibilidad

- V1.4 costo histórico permanece intacto.
- V1.5 inventario valorizado permanece intacto.
- Workbench V3.1 y capas V3.2.x–V3.5 siguen disponibles.
- No activa Supabase ni comercio público.
- No modifica el piloto V3.7.2.

## Modos de uso

**Mesa clara:** entrada orientada a tareas y tablas editables.

**Modelo avanzado:** conserva las superficies históricas para cierre, escenarios, decisiones, auditoría, abastecimiento y análisis profundo.
