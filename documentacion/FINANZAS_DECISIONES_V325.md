# Finanzas V3.2.5 · Cockpit de decisiones

V3.2.5 convierte la pestaña **Decisiones** del modelo financiero en una agenda de evaluación, no en un motor de ejecución.

## Separación de capas

- El MFO aporta nombre, mes configurado, mes recomendado, condición, impacto y acción sugerida.
- La copia de trabajo permite cambiar el mes configurado y el estado humano.
- El seguimiento local guarda próxima revisión y nota en `ee_v325_decision_followups`.
- Plan, escenarios, pedidos, movimientos, compras, CAPEX, contratación, inventario y producción no se modifican automáticamente.

## Evidencia

Cada decisión puede contextualizarse con mes calendario, ventas y margen planificados, caja del plan, política de caja mínima, rango de caja de escenarios y hechos reales disponibles. Una fila de caja ausente se presenta como **dato faltante**, nunca como cero.

La diferencia entre mes configurado y recomendado se deriva del estado vigente de la copia de trabajo; el valor importado `differenceMonths` solo funciona como respaldo cuando no pueden derivarse ambos meses.

## Compatibilidad

Los controles mantienen el atributo `data-decision` de V3.1.1 y añaden el contrato V3.2.5. La release integral y el runtime no cambian por esta iteración financiera aditiva.
