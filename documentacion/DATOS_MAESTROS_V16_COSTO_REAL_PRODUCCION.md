# Datos maestros V1.6 — costo real de producción y merma

## Objetivo

Conectar el lote medido con el consumo realmente observado, el rendimiento y la merma sin convertir una estimación en un hecho ni crear un kardex paralelo.

## Fuentes

V1.6 lee:

- mediciones de lote V2.4: `ee_v24_production_measurements`;
- BOM y materiales canónicos V2.3;
- estándar histórico reconstruido `as-of` por V1.4;
- ledger observacional V1.6: `ee_v16_batch_consumption_events`.

El ledger V1.6 sólo registra consumos observados por lote y sus correcciones. No descuenta inventario ni modifica recetas, pedidos, compras o estándares.

## Tres cifras distintas

### Costo estándar esperado

BOM esperada del lote × estándar que regía en la fecha del lote.

### Consumo observado valorizado a estándar

Cantidad realmente consumida × el mismo estándar histórico.

Sirve para medir eficiencia de uso y separar una desviación de cantidad de una desviación de precio. No es costo real de adquisición.

### Costo real observado

Cantidad realmente consumida × costo unitario explícitamente observado y sustentado para ese consumo.

Si una línea no trae costo observado, el costo real del lote queda **INCOMPLETO / DESCONOCIDO**. V1.6 no toma automáticamente la última compra como costo del lote porque todavía no existe trazabilidad de qué recepción física terminó en cada producción.

## Rendimiento y merma

V1.6 reutiliza la medición V2.4:

- cantidad planeada;
- cantidad utilizable;
- merma registrada;
- código y fecha de lote.

Umbrales iniciales de lectura:

- merma superior a 5 %: atención;
- rendimiento inferior a 95 % del plan: atención;
- consumo por material con desviación absoluta de 10 % o más frente a BOM: atención.

Los umbrales son señales gerenciales; no cambian BOM, estándar ni inventario automáticamente.

## Correcciones

Una corrección nunca reescribe el evento anterior. Crea `BATCH_CONSUMPTION_CORRECTED` con `supersedes` y conserva ambos registros. La lectura activa ignora únicamente el evento reemplazado.

## Integridad

1. El core `assets/production-cost-v16.js` es de solo lectura.
2. La escritura existe sólo en `assets/operation-production-cost-v16.js` y sólo sobre `ee_v16_batch_consumption_events`.
3. Finanzas carga el core y la vista, nunca el capturador operativo.
4. Un costo observado exige una referencia de soporte.
5. Consumo faltante no equivale a cero.
6. Una última compra no se atribuye automáticamente al lote.
7. El estándar del lote se reconstruye `as-of`; una revisión posterior no cambia la comparación histórica.
8. V1.6 no modifica `ee_v23_material_stock`, `ee_v24_material_purchases`, `ee_v25_purchase_orders`, `ee_v12_cost_materialization_events` ni `ee_v14_cost_snapshot_events`.
9. Los totales financieros muestran costo conocido y cobertura; no rellenan lotes incompletos.

## Superficies

### Operación

Nueva sección **Costo real y merma** después de Inventario y medición. Permite:

- elegir un lote ya medido;
- comparar BOM esperada y consumo observado;
- registrar cantidad consumida;
- registrar costo unitario observado de forma opcional con soporte obligatorio;
- explicar desviaciones;
- corregir mediante eventos append-only;
- revisar rendimiento, merma y cobertura.

### Finanzas

Vista de solo lectura con:

- cobertura de consumo;
- cobertura de costo real;
- estándar esperado conocido;
- consumo observado valorizado a estándar;
- costo real observado conocido;
- merma media y alertas de rendimiento;
- comparación lote por lote.

## Criterio de cierre

V1.6 sólo se considera certificada cuando pasan sobre el SHA fusionado en `main`:

- barrera estructural V1.6;
- auditoría canónica acumulativa;
- validación y publicación de Pages;
- health-check público V1.6;
- regresión Playwright desktop y móvil.

## Siguiente capa

V1.7 podrá usar V1.4 + V1.5 + V1.6 para explicar margen y drivers de desviación, priorizar alertas y proponer revisiones de costo/precio. Las propuestas deben volver al flujo de gobierno; nunca aplicarse automáticamente.