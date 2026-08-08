# MFO Snapshot V3.0

## Propósito

La web interna de El Errante separa hechos operativos de escenarios financieros. El MFO contiene información sensible y el repositorio es público, por lo que V3.0 **no almacena el workbook ni sus cifras en GitHub**.

`finanzas.html` acepta un snapshot JSON cargado localmente. El archivo se conserva únicamente en `localStorage` bajo `ee_v30_mfo_snapshot`. El importador no hace solicitudes de red y no escribe pedidos, inventario, producción ni compras.

## Workbook canónico observado

El archivo validado para esta iteración es `MFO_EL_ERRANTE_v3_3_Decisiones_y_Escenarios.xlsx`, identificado por el perfil interno `MFO_V3_3_DECISIONES_ESCENARIOS`.

El perfil real contiene nueve hojas:

- `00_INICIO`
- `05_PRODUCTOS_SUPUESTOS`
- `01_PLAN_VENTAS`
- `02_PRODUCCION_COMPRAS`
- `03_RESULTADOS_CAJA`
- `04_DASHBOARD`
- `06_AUDITORIA`
- `07_REAL_VS_PLAN`
- `08_DECISIONES_ESCENARIOS`

Esto sustituye el supuesto provisional anterior de seis hojas. El exportador V3.0 ahora valida esta estructura real y sus anclas textuales antes de leer una cifra.

## Regla de separación

- **Plan / escenario:** proviene del snapshot MFO.
- **Real:** proviene de hechos registrados por los módulos operativos y financieros de la web.
- El plan nunca sobrescribe un hecho real.
- Compras, costo de ventas e inventario son magnitudes diferentes.
- La caja real no se infiere del plan.
- Decisiones recomendadas por el MFO son señales para decidir; no ejecutan compras, contratación, sede ni CAPEX.
- Hallazgos de auditoría permanecen como pendientes explícitos.

## Esquema

```json
{
  "schemaVersion": "3.0",
  "meta": {},
  "planSales": [],
  "productCosts": [],
  "cashFlow": [],
  "scenarios": [],
  "assumptions": [],
  "decisions": [],
  "pending": []
}
```

Los estados normalizados válidos son `CONFIRMADO`, `ESTIMADO`, `INFERIDO`, `CONTRADICTORIO` y `PENDIENTE`. El estado original del workbook se conserva además en `modelStatus` cuando aplica.

## Contenido extraído del MFO v3.3

### Plan de ventas

Se extraen los dos bloques de `01_PLAN_VENTAS`: año 1 y año 2. Cada SKU se convierte en una fila por mes con cantidad, precio, venta, costo unitario y COGS planificado.

### Productos y costos

El maestro se obtiene de `05_PRODUCTOS_SUPUESTOS`. Se preservan SKU, producto, categoría, precio final, costo directo, estado original y fuente.

### Flujo de caja

`03_RESULTADOS_CAJA` aporta 24 meses con caja inicial, ventas cobradas, compras pagadas, gastos operativos, auxiliares, Juan, reserva tributaria, arriendo, CAPEX y caja final.

### Escenarios

`08_DECISIONES_ESCENARIOS` aporta los escenarios Conservador, Base, Crecimiento y Personalizado, con multiplicadores y resultados del año 1.

### Decisiones

La misma hoja aporta las decisiones de formalización de Juan, activación de sede y CAPEX. El snapshot conserva mes configurado, mes recomendado, diferencia, condición y acción sugerida.

### Supuestos

`05_PRODUCTOS_SUPUESTOS` se normaliza en categorías: caja/impuestos/compras, personal/gastos, crecimiento, capacidad, parámetros de producción, costos sensibles y política de pago de Juan.

### Pendientes

`06_AUDITORIA` aporta los hallazgos y decisiones pendientes. Se conservan prioridad, estado original, impacto, decisión recomendada, responsable, fecha, fuente, riesgo y observación.

## Normalización de estados

Para no elevar supuestos del modelo a hechos reales:

- `APROBADO`, `OFICIAL ...`, `CONFIRMADO` → `CONFIRMADO`.
- `CALCULADO`, `INFERIDO`, `CONFIRMADO MODELO` → `INFERIDO`.
- `PROVISIONAL`, `CONFIRMADO PARCIAL` → `ESTIMADO`.
- `EDITABLE`, `DECISIÓN`, `PENDIENTE` → `PENDIENTE`.

El valor original permanece en `modelStatus`.

## Reconciliación

El exportador no se limita a leer celdas. Antes de generar el JSON reconcilia:

- unidades año 1;
- ventas año 1;
- costo directo año 1;
- unidades año 2;
- ventas año 2;
- costo directo año 2;
- caja final del mes 24.

Si cualquiera de estos controles no coincide con los totales visibles del workbook, la exportación falla. Un snapshot válido queda marcado con `meta.reconciliation = "PASS"`.

## Exportador privado

V3.0 utiliza `scripts/exportar_mfo_v30.py`. El script conoce el perfil confirmado del MFO v3.3; ya no requiere un archivo de mapeo manual.

### Preparar entorno local

```bash
python3 -m pip install openpyxl
```

### Validar únicamente estructura

```bash
python3 scripts/exportar_mfo_v30.py /ruta/MFO_EL_ERRANTE_v3_3_Decisiones_y_Escenarios.xlsx --inspect
```

La inspección solo escribe nombres de hojas y anclas en `private-data/mfo_profile_v33.json`; no exporta cifras.

### Generar snapshot privado

```bash
python3 scripts/exportar_mfo_v30.py /ruta/MFO_EL_ERRANTE_v3_3_Decisiones_y_Escenarios.xlsx \
  --output private-data/mfo_snapshot_v30.json
```

El exportador falla de forma cerrada cuando:

- falta una de las nueve hojas esperadas;
- cambia un título o encabezado crítico;
- falta alguno de los 14 SKU esperados;
- hay cantidades, precios o costos obligatorios vacíos;
- una fórmula no tiene valor calculado almacenado;
- los totales exportados no reconcilian contra el workbook.

`private-data/` está excluido por `.gitignore`.

## Uso en Finanzas

Abre `finanzas.html` y usa **Cargar snapshot JSON**. El panel muestra:

- Plan vs. real;
- decisiones configuradas vs. recomendadas;
- escenarios del año 1;
- estructura y trazabilidad del snapshot;
- pendientes de auditoría, plegados para no saturar la interfaz.

El panel no ejecuta decisiones ni modifica operación.

## Hechos reales usados por la comparación

- Ventas reales: pedidos locales en estados aprobados/operativos.
- COGS real: únicamente el costo snapshot guardado en cada línea del pedido (`unit_cost_snapshot`, `unitCostSnapshot` o equivalente).
- Compras y CAPEX reales: movimientos financieros locales V2.7.
- Caja real conciliada: pendiente de una futura capa específica de hechos de caja.
