# El Errante V3.0

**Masa · Fuego · Territorio**

Webapp pública e interna de El Errante. V3.0 conserva el canon visual/materializado V2.8 y la capa editorial V2.9, y reorganiza el sistema interno en superficies separadas para **Operación** y **Finanzas**.

## Estado canónico

- Release integral: `3.0.0`.
- Línea pública/editorial: V2.9.
- Canon de identidad, imágenes y materialización: V2.8.
- Panel operativo: V3.0.
- Puente MFO / Plan vs. Real: V3.0.1.
- Catálogo: 11 productos y 14 variantes.
- Abastecimiento controlado: módulo V2.5.
- Finanzas operativas locales: módulo V2.7.
- Persistencia demostrativa: `localStorage`.
- Supabase: preparado pero inactivo mientras URL y clave pública estén vacías.

La numeración V2.8 permanece en los artefactos de marca y materialización porque éstos siguen siendo el canon técnico validado; V3.0 no los duplica ni los renombra innecesariamente.

## Arquitectura interna V3.0

### Centro interno

`centro-interno.html` es la puerta de entrada y separa dos preguntas:

- **Panel de control / Operación:** qué hay que producir, preparar, comprar, medir y despachar.
- **Finanzas:** qué está ocurriendo económicamente, cómo se compara el plan con los hechos y qué decisiones sugiere el MFO.

### Operación

`operacion.html` compone los motores validados de Agenda V2.1, Producción V2.2, Materiales/BOM V2.3, Medición V2.4 y Abastecimiento V2.5. `control.html` resume prioridades, compromisos, faltantes y alertas sin montar el motor financiero.

### Finanzas

`finanzas.html` conserva Finanzas Operativas V2.7 para hechos locales y añade el puente MFO V3.0. El plan nunca sobrescribe pedidos, inventario, producción ni compras reales.

El snapshot MFO privado se guarda sólo en el navegador bajo `ee_v30_mfo_snapshot`. El repositorio público no contiene el XLSX ni las cifras financieras del modelo.

## MFO v3.3

El exportador privado `scripts/exportar_mfo_v30.py` reconoce el perfil real del workbook financiero:

```text
00_INICIO
05_PRODUCTOS_SUPUESTOS
01_PLAN_VENTAS
02_PRODUCCION_COMPRAS
03_RESULTADOS_CAJA
04_DASHBOARD
06_AUDITORIA
07_REAL_VS_PLAN
08_DECISIONES_ESCENARIOS
```

Extrae y reconcilia plan de 24 meses, productos/costos, flujo de caja, supuestos, escenarios, decisiones y pendientes. Un snapshot sólo es aceptado como plan de referencia cuando la extracción reconcilia con los controles del workbook.

Los archivos privados deben permanecer bajo `private-data/`, excluido mediante `.gitignore`.

## Fuente y superficie ejecutable

El árbol fuente conserva código, documentación, pruebas e históricos aislados. Mac, Playwright y GitHub Pages ejecutan una superficie materializada construida por:

```text
scripts/materializar_fuentes_locales_v28.py
scripts/preparar_sitio_materializado_v28.py
```

Estos nombres se mantienen porque representan el canon técnico de materialización aprobado en V2.8. El constructor genera JavaScript legible y excluye Base64, chunks, loaders heredados y archivos archivados de la superficie publicable.

## Fuentes materializadas

```text
assets/generated/data-v28.js
assets/generated/app-v28.js
assets/generated/preprod-v28.js
assets/generated/manifest-v28.json
```

El manifiesto registra tamaño y SHA-256. Estos archivos no se editan manualmente.

## Validación vigente

```text
verificar_demo.py
scripts/verificar_canon_marca_v28.py
scripts/verificar_activos_hq_v28.py
scripts/verificar_modulos_v28.py
scripts/verificar_v30_separacion.py
scripts/preparar_sitio_materializado_v28.py
tests/e2e/
```

La integración a `main` requiere auditoría canónica, validación/materialización, Playwright desktop+móvil y publicación/health-check de Pages sobre el mismo SHA.

## Seguridad y datos

- Nunca versionar `private-data/`, snapshots MFO reales, XLSX financieros, claves privadas, `service_role`, cadenas de conexión, tokens, contraseñas o datos personales reales.
- Inventario desconocido no equivale a cero confirmado.
- Compras, costo de ventas, inventario y caja son magnitudes distintas.
- El MFO es plan/escenario; los hechos operativos conservan prioridad.
- Supabase continúa inactivo hasta validar conexión, migraciones, roles y RLS.

## Documentación principal

- `documentacion/MFO_SNAPSHOT_V30.md`
- `documentacion/CANON_MARCA_CONTENIDO_V28.md`
- `documentacion/FINANZAS_OPERATIVAS_V27.md`
- `documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md`
- `documentacion/MAPA_DATOS_Y_FUENTES.md`
