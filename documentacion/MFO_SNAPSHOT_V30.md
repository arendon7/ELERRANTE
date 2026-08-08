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

Las estructuras son abiertas en V3.0 para no congelar prematuramente el MFO. Cada registro debe conservar como mínimo `status`, `confidence` y `source`. La siguiente iteración definirá multiplicadores y dependencias cuando el exportador del workbook canónico esté disponible.

## Hechos reales usados por la comparación

- Ventas: pedidos locales en estados aprobados/operativos.
- COGS real: **solo** `unit_cost_snapshot`, `unitCostSnapshot` o `unitCost` guardado en la línea del pedido. Si falta, el panel marca el COGS como incompleto.
- Compras de inventario y CAPEX: movimientos financieros locales V2.7.
- Caja real conciliada: todavía no implementada; no se inventa a partir del plan.

## Próximo paso

Crear un exportador controlado desde el workbook canónico hacia este esquema. Ese exportador debe mapear hojas y columnas explícitamente; no debe adivinar columnas por posición ni publicar el archivo financiero en el repositorio.
