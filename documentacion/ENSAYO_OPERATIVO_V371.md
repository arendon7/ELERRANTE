# Ensayo operativo integral V3.7.1

## Propósito

Probar la jornada completa de El Errante antes de introducir datos reales, distinguiendo fallos de integración de hallazgos genuinos del piloto.

## Alcance

Entrada controlada:

- pedido aprobado con fecha y costo histórico;
- baseline financiero privado mínimo.

Recorrido exigido por UI:

`piloto → inventario → producción → medición → abastecimiento → evidencia → cierre → caja → reconciliación → cierre del piloto`

## Criterio de éxito

La ejecución es válida únicamente si:

- el pedido recorre `approved → preparing → dispatched` mediante la UI;
- existe al menos una medición de producción;
- la orden de compra termina recibida;
- existe compra/recepción respaldada y la reconciliación la cuenta dentro del periodo;
- la evidencia operativa deja cero bloqueos de cierre;
- el cierre diario termina `CLOSED` y no `CLOSED_EXCEPTION`;
- existe conteo observado de caja;
- la reconciliación V3.7.1 termina con `blockers=0`, `reviews=0` y `EVIDENCE_COMPLETE`;
- el ledger V3.7 conserva `START → CHECKPOINT → END`.

## Hallazgos del ensayo

La primera corrida detectó que el contrato de prueba intentaba despachar un pedido todavía `approved`. Se corrigió para recorrer la transición real `Iniciar preparación` antes del alistamiento y despacho.

La segunda corrida llegó hasta reconciliación y reveló un defecto real del runtime V3.7.0: Abastecimiento V2.5 guarda la fecha efectiva de recepción en `receivedDate`, mientras el reconciliador no reconocía ese campo. El gate podía quedar `EVIDENCE_COMPLETE` aunque el contador de compras del periodo fuera cero.

El patch **V3.7.1** corrige esa incompatibilidad reconociendo `receivedDate` / `received_date` y agrega una regresión específica para impedir que reaparezca.

## Frontera deliberada

El ensayo no activa checkout público ni Supabase. La creación pública del pedido continúa fuera de alcance mientras no exista backend seguro. El pedido inicial del ensayo es por tanto una precondición controlada y no una simulación de un canal público inexistente.

## Resultado esperado

Si este contrato pasa, el siguiente paso no es añadir otra capa técnica. Es ejecutar el piloto real desde `piloto-operativo.html` con datos privados en un único navegador/dispositivo y usar la reconciliación para decidir qué persistencia compartida necesita realmente el negocio.
