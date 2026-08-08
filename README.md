# El Errante V3.1

**Masa · Fuego · Territorio**

Webapp pública e interna de El Errante. La patch V3.1.1 mantiene el canon visual/materializado V2.8 y la capa pública/editorial V2.9, y hace explícitos tres puntos de trabajo dentro de la arquitectura interna V3.1: **Panel de control**, **Operación** y **Finanzas**.

## Estado canónico

- Release integral: `3.1.1`.
- Release anterior estable: `3.1.0`.
- Línea pública/editorial: V2.9.
- Canon de identidad, imágenes y materialización: V2.8.
- Arquitectura interna: V3.1.
- Acceso de usuarios local: V3.1, preparado para migrar a Auth + RLS.
- Panel de control: shell V3.1.1 sobre motor Control V3.0.
- Módulo Operativo: V3.1, reutilizando motores validados V2.1–V2.5 y Control V3.0.
- Workbench Financiero: V3.1.
- MFO privado de referencia: perfil v3.3, snapshot schema V3.0.
- Catálogo público: 11 productos y 14 variantes.
- Persistencia del candidato interno: navegador (`localStorage` / `sessionStorage`).
- Supabase: preparado pero inactivo mientras no se apruebe la fase de persistencia multiusuario.

La numeración V2.8 permanece en marca, activos y materialización porque sigue siendo el canon técnico validado. V3.1 no duplica ni renombra una capa estable sin necesidad.

La release V3.1.0 introdujo acceso, Operación consolidada y Financial Workbench; V3.1.1 endurece la navegación y el acceso al Panel de control sin alterar las reglas de datos ni los motores financieros.

## Flujo interno V3.1.1

La web pública incorpora un enlace discreto **Acceso usuarios** en el footer.

```text
Web pública
   ↓
Acceso usuarios
   ↓
Usuario + contraseña
   ↓
Centro interno
   ├── Panel de control
   ├── Operación
   └── Finanzas
```

El Centro interno es el punto normal de entrada después del login. Los tres destinos son visibles como tarjetas independientes y también quedan disponibles en la navegación lateral de las superficies internas.

### Acceso local

`acceso.html` permite configurar el primer usuario del navegador. La contraseña no se guarda como texto: se conserva únicamente un derivado PBKDF2/SHA-256 con sal aleatoria y la sesión expira después de ocho horas.

Esta capa protege la experiencia local, pero GitHub Pages continúa siendo un host estático. La autorización real multiusuario se realizará posteriormente con Supabase Auth, roles y RLS. Nunca deben incorporarse credenciales privadas al JavaScript o al repositorio.

## Panel de control

`control.html` es la vista ejecutiva operativa. Resume pedidos comprometidos, estado de alistamiento, BOM, conteos, faltantes y compras abiertas antes de entrar al flujo completo de ejecución.

V3.1.1 lo incorpora formalmente a la misma sesión interna: exige el guard V3.1, identifica al usuario activo y permite pasar directamente a **Operación** o **Finanzas** sin volver a la web pública.

El Panel de control no calcula margen, resultado ni caja. Su responsabilidad es priorizar la operación.

## Operación

`operacion.html` es la superficie operativa única. Organiza el flujo de trabajo en:

1. Resumen y prioridades.
2. Pedidos y continuidad.
3. Producción y alistamiento.
4. Materiales / BOM.
5. Inventario, lotes, rendimiento y merma.
6. Compras y recepción.
7. Despacho a partir de los motores existentes.

El módulo compone `control-v30.js`, Agenda V2.1, Producción V2.2, Materiales V2.3, Medición V2.4 y Abastecimiento V2.5. No carga el workbench financiero.

Principios operativos:

- una necesidad teórica no es una orden de compra;
- inventario desconocido no equivale a cero;
- un escenario financiero no crea producción;
- un plan no crea una compra real;
- los hechos operativos pueden ser leídos por Finanzas, pero Finanzas no los reescribe.

## Finanzas

`finanzas.html` monta un único **Financial Workbench V3.1**. Ya no presenta el MFO y Finanzas V2.7 como dos paneles superpuestos.

### Dos formas de empezar

El módulo financiero nunca publica cifras privadas por defecto:

1. **Importar baseline MFO:** carga el snapshot privado del MFO v3.3 en el navegador.
2. **Crear modelo desde cero:** genera localmente un horizonte editable de 24 meses usando únicamente productos y precios ya públicos; costos, volúmenes y supuestos sensibles nacen en cero o `PENDIENTE` para que el usuario los complete.

El segundo camino permite trabajar inmediatamente con tablas, gráficas, escenarios y editores aunque el archivo privado no esté disponible en ese dispositivo. `assets/finance-starter-v31.js` no hace llamadas de red ni contiene cifras financieras privadas.

### Baseline privado o local

El baseline permanece bajo:

`ee_v30_mfo_snapshot`

Puede provenir del MFO privado o del starter local. Es la referencia inmutable del modelo y no se modifica al trabajar.

### Working Model

V3.1 crea una copia editable independiente:

`ee_v31_finance_working_model`

Permite trabajar directamente sobre:

- plan de ventas de 24 meses;
- unidades por SKU y mes;
- precio de venta;
- costo directo;
- margen;
- gastos y compras planificadas;
- caja;
- CAPEX;
- escenarios;
- decisiones;
- supuestos y calidad del dato.

Los cambios quedan registrados en un historial local y pueden exportarse como JSON de trabajo. Restaurar el baseline no elimina hechos reales.

### Dashboard

El dashboard incluye KPIs y visualizaciones SVG autocontenidas para:

- ventas planificadas;
- ventas reales registradas;
- margen directo;
- resultado simplificado;
- COGS;
- compras;
- CAPEX;
- caja;
- Plan vs. Real;
- ventas por producto.

### Real vs. Plan

- **Plan**: working model derivado del baseline financiero.
- **Real**: pedidos y movimientos registrados.
- **COGS real**: sólo costo histórico almacenado en la línea del pedido (`unit_cost_snapshot` / equivalente).
- Si falta costo histórico, el dato permanece incompleto; no se rellena con el costo actual.
- Compras ≠ COGS ≠ inventario ≠ caja.

## MFO v3.3

El exportador privado `scripts/exportar_mfo_v30.py` reconoce las nueve hojas del workbook validado:

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

Extrae y reconcilia plan de 24 meses, productos/costos, flujo de caja, supuestos, escenarios, decisiones y pendientes. El XLSX y los snapshots con cifras privadas deben permanecer fuera del repositorio, bajo `private-data/` o almacenamiento privado equivalente.

## Fuente y superficie ejecutable

La superficie que usan Mac, Playwright y GitHub Pages se construye mediante:

```text
scripts/materializar_fuentes_locales_v28.py
scripts/preparar_sitio_materializado_v28.py
```

Estos nombres se mantienen porque corresponden al canon técnico V2.8. La superficie publicable excluye Base64, chunks, loaders heredados e históricos archivados.

## Validación vigente

```text
verificar_demo.py
scripts/verificar_canon_marca_v28.py
scripts/verificar_activos_hq_v28.py
scripts/verificar_modulos_v28.py
scripts/verificar_v30_separacion.py
scripts/verificar_v31_interno.py
scripts/verificar_release_v31.py
scripts/preparar_sitio_materializado_v28.py
tests/e2e/
```

La integración a `main` requiere auditoría canónica, validación/materialización, Playwright desktop+móvil y health-check de GitHub Pages sobre el mismo SHA.

## Seguridad y datos

- Nunca versionar XLSX financieros, snapshots reales, contraseñas, `service_role`, tokens, cadenas de conexión o datos personales reales.
- El login local no se presenta como seguridad servidor.
- El MFO es plan/escenario y nunca sobrescribe hechos operativos.
- El starter financiero no inventa costos privados: éstos nacen en cero y `PENDIENTE`.
- La autenticación multiusuario, roles, persistencia compartida y auditoría servidor quedan para una fase posterior con Auth + RLS.

## Documentación principal

- `documentacion/ARQUITECTURA_INTERNA_V31.md`
- `documentacion/MFO_SNAPSHOT_V30.md`
- `documentacion/CANON_MARCA_CONTENIDO_V28.md`
- `documentacion/FINANZAS_OPERATIVAS_V27.md`
- `documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md`
- `documentacion/MAPA_DATOS_Y_FUENTES.md`
