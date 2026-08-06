# Validación requerida para Finanzas Operativas V2.7

- Verificar sintaxis y carga de `assets/finance-v27.js` y `assets/finance-v27.css`.
- Ejecutar Playwright en escritorio y móvil.
- Confirmar cálculo de ventas, COGS, margen, gastos, resultado y caja.
- Confirmar que compras de inventario y CAPEX afectan caja, pero no el resultado operativo.
- Confirmar persistencia local de movimientos y estados de calidad del costo.
- Confirmar ausencia de desbordamiento horizontal en móvil.
- Confirmar que Supabase continúa inactivo y que no existen secretos de servidor.
- Retargetear el PR a `main` únicamente después de integrar V2.5.
