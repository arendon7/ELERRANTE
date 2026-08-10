# Datos maestros V1.3 — puente prospectivo Operación / Finanzas

## Propósito

V1.3 hace consumible el estándar efectivo de costos fuera de Studio. La materialización V1.2 deja de ser únicamente un registro de gobierno y pasa a alimentar los cálculos **prospectivos** de Operación y Finanzas, sin recalcular ni reescribir hechos que ya ocurrieron.

## Precedencia de costos

Para cada material, la precedencia es:

`baseline canónico → estándar materializado → simulación financiera`

1. **Baseline canónico**: `assets/materials-data-v23.js`. Es la referencia técnica de arranque y permanece inmutable en runtime.
2. **Estándar materializado**: última revisión válida de `ee_v12_cost_materialization_events`. Sustituye al baseline sólo para cálculos prospectivos.
3. **Simulación financiera**: override local `ee_v322_material_cost_overrides`. Sólo afecta el escenario de Finanzas y nunca cambia Datos maestros.

Una compra observada no forma parte de esta precedencia automática: sigue siendo evidencia histórica y sólo puede llegar al estándar a través de propuesta, aprobación y materialización.

## Puente V1.3

`assets/master-cost-prospective-v13.js` es una capa de solo lectura. No crea, modifica ni elimina eventos.

Expone:

- `standardMaterial`: material con costo estándar efectivo y origen.
- `resolveMaterial`: estándar efectivo más override opcional de simulación.
- `productCost`: BOM prospectiva recursiva usando el estándar efectivo.
- `originLabel`: etiqueta legible del origen del costo.
- `signature`: huella de las revisiones materializadas para refrescar consumidores.
- `snapshot` / `integrityUnchanged`: guard de no-mutación.

## Operación

El módulo Materiales V2.3.1 conserva su contrato de cantidades, stock y faltantes, pero su valoración prospectiva cambia:

- `plan().estimatedCost` usa la BOM con estándar efectivo;
- el costo visible por producto usa el estándar efectivo;
- las materias primas muestran la revisión materializada cuando existe;
- el explorador de receta muestra costo estándar prospectivo;
- un evento `ee:v13:standard-changed` refresca la lectura sin escribir pedidos, compras o inventario.

La cantidad requerida de cada material no cambia por V1.3; únicamente cambia su valoración cuando el estándar de costo cambia.

## Finanzas

Economía unitaria V3.2.2 mantiene las simulaciones locales, pero cambia su base de comparación:

- sin override, BOM usa el estándar efectivo de Datos maestros;
- con override, la simulación se aplica por encima del estándar efectivo;
- guardar un valor igual al estándar vigente elimina el override;
- restablecer simulación vuelve al estándar materializado vigente, no al baseline anterior;
- la interfaz identifica si una línea proviene de baseline, estándar materializado o simulación;
- la firma V1.3 fuerza recálculo cuando cambia el estándar.

`Aplicar BOM como costo estimado` continúa escribiendo sólo el modelo financiero de trabajo y su plan, nunca hechos reales ni el estándar maestro.

## Integridad histórica

V1.3 no puede escribir:

- `ee_v14_orders`;
- `ee_v23_material_stock` salvo las acciones de conteo ya existentes en el módulo Materiales;
- `ee_v24_material_purchases`;
- `ee_v11_cost_proposal_events`;
- `ee_v12_cost_materialization_events`;
- la fuente `EL_ERRANTE_MATERIALS_V23`;
- pedidos, ventas, compras o movimientos ya registrados.

El puente V1.3 en sí es estrictamente de solo lectura.

## Limitación deliberada

V1.3 no crea todavía un snapshot formal de costo dentro de cada nuevo hecho económico. La aplicación ya evita recalcular hechos existentes, pero la persistencia explícita y uniforme del costo que regía en el momento de cada hecho corresponde a **V1.4**.

## Invariante transversal

`hecho observado ≠ baseline ≠ estándar materializado ≠ simulación ≠ costo histórico`
