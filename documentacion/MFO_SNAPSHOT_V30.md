# MFO Snapshot V3.0

## Propósito

La web interna de El Errante separa hechos operativos de escenarios financieros. El MFO puede contener información confidencial y el repositorio es público, por lo que V3.0 **no almacena cifras reales del modelo en GitHub**.

`finanzas.html` acepta un snapshot JSON cargado por la persona usuaria. El archivo se guarda únicamente en `localStorage` bajo `ee_v30_mfo_snapshot`. El importador no hace solicitudes de red y no escribe pedidos, inventario, producción ni compras.

## Regla de separación

- **Plan / escenario:** proviene del snapshot MFO.
- **Real:** proviene de hechos locales ya registrados por los módulos operativos y financieros.
- Un plan nunca sobrescribe un hecho real.
- Una cifra sin fuente, estado o confianza se muestra como deuda de calidad, no se eleva silenciosamente a dato confirmado.
- La caja real no se infiere del plan. Requiere conciliación o una futura capa de hechos de caja.

## Esquema mínimo

```json
{
  "schemaVersion": "3.0",
  "meta": {
    "modelName": "",
    "modelDate": "",
    "exportedAt": "",
    "status": "PENDIENTE",
    "confidence": "",
    "source": ""
  },
  "planSales": [],
  "productCosts": [],
  "cashFlow": [],
  "scenarios": [],
  "assumptions": []
}
```

Los estados válidos son `CONFIRMADO`, `ESTIMADO`, `INFERIDO`, `CONTRADICTORIO` y `PENDIENTE`.

## 01 · Plan de ventas

Una fila por SKU y mes.

```json
{
  "month": "2026-09",
  "sku": "SKU-001",
  "quantity": 0,
  "unitPrice": null,
  "sales": null,
  "unitCost": null,
  "cogs": null,
  "status": "ESTIMADO",
  "confidence": "Media",
  "source": "01_Plan_Ventas"
}
```

`sales` y `cogs` pueden venir precalculados. Si no vienen, la web intenta calcularlos con cantidad × precio/costo, usando `productCosts` como respaldo de plan. Esto **no** se usa para reconstruir COGS real.

## 02 · Productos y costos

```json
{
  "sku": "SKU-001",
  "price": null,
  "directCost": null,
  "validFrom": "2026-09-01",
  "status": "ESTIMADO",
  "confidence": "Media",
  "source": "02_Productos_Costos"
}
```

Las siguientes versiones deben añadir `validTo`, `costSnapshotId`, impuestos y evidencia documental cuando exista.

## 03 · Flujo 24M

```json
{
  "month": "2026-09",
  "openingCash": null,
  "salesCash": null,
  "purchases": null,
  "operatingExpenses": null,
  "capex": null,
  "endingCash": null,
  "status": "ESTIMADO",
  "confidence": "Media",
  "source": "03_Flujo_24M"
}
```

Compras, COGS y caja son magnitudes separadas.

## 04 · Escenarios y supuestos

El snapshot conserva escenarios y supuestos como registros independientes. Cada fila debe mantener `status`, `confidence` y `source`. El exportador exige además un nombre y valor explícitos para evitar crear escenarios vacíos o inferidos por posición.

## Hechos reales usados por la comparación

- Ventas: pedidos locales en estados aprobados/operativos.
- COGS real: **solo** `unit_cost_snapshot`, `unitCostSnapshot` o `unitCost` guardado en la línea del pedido. Si falta, el panel marca el COGS como incompleto.
- Compras de inventario y CAPEX: movimientos financieros locales V2.7.
- Caja real conciliada: todavía no implementada; no se inventa a partir del plan.

## Exportador privado del workbook canónico

V3.0 incorpora `scripts/exportar_mfo_v30.py`. El script solo reconoce estas hojas canónicas:

- `01_Plan_Ventas`
- `02_Productos_Costos`
- `03_Flujo_24M`
- `04_Escenarios_PE`
- `05_Supuestos`
- `06_Pendientes`

No se adivinan filas ni columnas. El mapeo debe declarar el número exacto de la fila de encabezados y el texto exacto de cada encabezado requerido. El ejemplo versionado está en `documentacion/MFO_MAPEO_V30.example.json`; está deliberadamente incompleto y no puede exportar hasta ser rellenado contra el XLSX real.

### 1. Preparar el entorno local

```bash
python3 -m pip install openpyxl
```

### 2. Inspeccionar únicamente encabezados

```bash
python3 scripts/exportar_mfo_v30.py /ruta/MFO_EL_ERRANTE_24_MESES_v2_CLARO.xlsx --inspect
```

La inspección escribe `private-data/mfo_headers_v30.json`. Solo extrae etiquetas de las primeras filas de las seis hojas canónicas; no publica el workbook.

### 3. Crear el mapeo privado

Copia la plantilla fuera de control de versiones:

```bash
mkdir -p private-data
cp documentacion/MFO_MAPEO_V30.example.json private-data/mfo_mapeo_v30.json
```

Completa `headerRow` y cada nombre de columna usando exclusivamente la inspección del workbook real. `private-data/` está excluido por `.gitignore`.

### 4. Exportar el snapshot

```bash
python3 scripts/exportar_mfo_v30.py /ruta/MFO_EL_ERRANTE_24_MESES_v2_CLARO.xlsx \
  --mapping private-data/mfo_mapeo_v30.json \
  --output private-data/mfo_snapshot_v30.json
```

El exportador falla de forma cerrada si falta una hoja, un encabezado configurado, un valor mínimo obligatorio o si una fórmula del XLSX no tiene valor calculado almacenado. En este último caso se debe abrir y guardar el workbook en Excel o LibreOffice antes de repetir la exportación.

### 5. Cargar en Finanzas

Abre `finanzas.html` y usa **Cargar snapshot JSON** para seleccionar `private-data/mfo_snapshot_v30.json`. El navegador guarda el snapshot localmente; el archivo no se sube al repositorio ni se envía por red.

## Estado del mapeo real

La transferencia financiera identifica `MFO_EL_ERRANTE_24_MESES_v2_CLARO.xlsx` como modelo canónico provisional, pero el XLSX no está incorporado al repositorio público. Por seguridad, V3.0 no inventa los encabezados exactos ni congela un mapeo supuesto. Cuando el workbook esté disponible localmente se ejecutará primero `--inspect`, se completará el mapeo privado y se validarán los totales de control antes de usar el snapshot como plan de referencia.
