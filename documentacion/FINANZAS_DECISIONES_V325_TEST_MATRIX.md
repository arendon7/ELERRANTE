# Matriz de prueba · Finanzas V3.2.5

La regresión `tests/e2e/finance-v325.spec.js` protege:

1. Clasificación temporal: evaluar ahora, próxima, cerrada y sin fecha.
2. Diferencia viva entre mes configurado y recomendado, incluso si el snapshot trae `differenceMonths` desactualizado.
3. Invariancia de `planSales`, `cashFlow`, escenarios, pedidos y movimientos al editar una decisión.
4. Seguimiento local separado del objeto de decisión.
5. Estado vacío sin decisiones sintéticas.
6. Caja faltante expresada como dato no disponible, no como COP 0.
7. Línea temporal 24M con scroll interno y sin overflow del documento móvil.
