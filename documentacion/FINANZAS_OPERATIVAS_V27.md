# Finanzas Operativas V2.7

## Objetivo

Incorporar un control financiero compacto dentro de la administración de El Errante, sin convertir la web en un sistema contable ni presentar estimaciones como datos confirmados.

## Alcance funcional

- Resumen mensual de ventas aprobadas, costo de ventas, margen de contribución, gastos operativos, resultado operativo y caja estimada.
- Tabla de precio, costo, margen e inventario por producto.
- Clasificación de calidad del costo: CONFIRMADO, ESTIMADO, INFERIDO, CONTRADICTORIO o PENDIENTE.
- Registro local de gastos operativos adicionales, compras de inventario, CAPEX, aportes de socios, pagos o retiros y otros ingresos.
- Separación entre compras, costo de ventas y movimientos de caja.
- Punto de equilibrio de referencia y alertas por caja mínima, costos faltantes o datos sin confirmar.
- Exportación de movimientos a CSV.

## Principios de control

1. Una compra de inventario reduce caja, pero no se reconoce automáticamente como costo de ventas.
2. El costo de ventas se asocia a los productos incluidos en pedidos aprobados.
3. CAPEX, aportes y retiros no alteran el resultado operativo.
4. Las unidades de punto de equilibrio son una referencia basada en el margen promedio simple del catálogo.
5. El módulo no recalcula recetas, BOM ni costos estándar.
6. Supabase permanece inactivo hasta verificar configuración, migraciones y roles reales.
7. Los datos del modo local permanecen en el navegador y no constituyen contabilidad oficial.

## Integración

La rama `feat/finanzas-operativas-v27` está apilada sobre `feat/abastecimiento-v25`. Primero debe integrarse V2.5 en `main`; posteriormente este cambio debe retargetearse a `main`, ejecutar la regresión completa y fusionarse mediante squash.