# Cierre diario y continuidad V3.6

## Objetivo

V3.6 convierte los hechos ya registrados en Operación en una rutina diaria utilizable: **resolver → justificar → cerrar → continuar**. No crea un segundo sistema de pedidos, inventario, compras, evidencia ni Finanzas.

## Fuentes reutilizadas

- Evidencia operativa V3.3.0: `window.EL_ERRANTE_OPERATION_V330`.
- Horizonte operativo V3.4: `window.EL_ERRANTE_BUSINESS_PULSE_V34`.
- Capacidad observada V3.5: `window.EL_ERRANTE_MANAGEMENT_V35`.
- Pedidos, mediciones, compras y conteos permanecen en sus stores originales.

V3.6 agrega únicamente el ledger local append-only:

`ee_v36_daily_close_events`

## Estados de jornada

- **Sin actividad:** no existen hechos operativos aplicables para la fecha.
- **Pendiente:** existe al menos un control que bloquea el cierre limpio.
- **Lista para cerrar:** la evidencia mínima aplicable está completa.
- **Cerrada:** existe un cierre vigente cuyo fingerprint coincide con la evidencia actual.
- **Cerrada con excepciones:** se cerró con bloqueos explícitos y una justificación registrada.
- **Cierre requiere revisión:** los hechos cambiaron después del cierre vigente.
- **Periodo futuro:** no admite cierre.

## Qué puede bloquear un cierre limpio

V3.6 no inventa reglas nuevas de evidencia. Consume las señales V3.3 y añade sólo una comprobación de capacidad explícita:

- producción/lote sin evidencia aplicable;
- rendimiento/merma sin medición cuando corresponde;
- conteo físico requerido sin evidencia;
- recepción/soporte incompleto cuando corresponde;
- tiempo/novedad faltante cuando corresponde;
- carga del día por encima de una capacidad V3.5 registrada.

## Continuidad que no reescribe el cierre

Hay señales importantes que pueden seguir vivas al día siguiente sin impedir un cierre limpio si la evidencia del día está completa:

- faltantes del horizonte;
- materiales requeridos sin conteo conocido;
- productos/SKU sin BOM resoluble;
- compras emitidas vencidas;
- pedidos activos sin fecha.

El arrastre es inteligente: un pendiente del cierre anterior sólo reaparece si su identificador sigue presente en la evidencia actual. Un problema resuelto no se copia.

## Append-only y correcciones

Cada cierre guarda:

- fecha;
- estado;
- usuario local de sesión;
- timestamp;
- nota/justificación;
- fingerprint de señales;
- snapshot resumido de hechos;
- snapshot de pendientes y continuidad;
- `supersedes` cuando reemplaza un cierre anterior.

Una corrección crea un evento nuevo. Nunca sobrescribe ni elimina el cierre previo.

## Exportación

La superficie V3.6 permite:

- imprimir un resumen diario;
- exportar un JSON local del cierre y lectura semanal.

Estas exportaciones son soportes operativos; no equivalen a cierre contable, fiscal, auditoría o firma electrónica.

## Separación con Finanzas

V3.6 no registra caja, margen, resultado, COGS ni escenarios. El cierre operativo sólo eleva la calidad y trazabilidad de los hechos que Finanzas puede interpretar después.

## Integración de superficies

### Control

Muestra una lectura compacta:

- estado del cierre;
- pendientes visibles;
- continuidad;
- último cierre registrado;
- enlace directo a Operación.

Control no expone el formulario de cierre.

### Operación

Muestra la superficie completa:

- cola accionable con deep links al hecho origen;
- arrastre del cierre anterior;
- cierre limpio o con excepciones justificadas;
- historial append-only mediante el ledger;
- impresión/exportación;
- lectura semanal mínima de disciplina y recurrencia.

## Contratos de seguridad

1. Cerrar no modifica pedidos, stock, BOM, compras, mediciones ni Finanzas.
2. Un cierre con controles bloqueantes exige una justificación suficiente.
3. Fecha futura no admite cierre.
4. Desconocido no equivale a cero.
5. Una compra teórica no se convierte en compra emitida por efecto del cierre.
6. Un cierre viejo no permanece “verde” si cambió la evidencia: pasa a revisión.
7. La sesión local continúa siendo experiencia local, no autorización servidor.

## Certificación

La integración requiere:

- `tests/e2e/daily-close-v36.spec.js`;
- Playwright desktop y móvil;
- auditoría canónica;
- validación/materialización;
- health-check público `.github/workflows/public-health-v36.yml`;
- presencia de JS/CSS V3.6 en el service worker.
