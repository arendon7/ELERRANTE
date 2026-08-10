# El Errante — Mapa de datos y fuentes vigente

## 1. Regla principal

El Errante **no tiene una única fuente de datos universal**. La aplicación separa:

1. fuente canónica/publicable;
2. datos maestros y contenido;
3. hechos operativos locales;
4. decisiones/propuestas de gobierno;
5. modelo financiero privado/local;
6. datos sintéticos de demo;
7. schemas/backend preparados pero todavía inactivos.

La fuente correcta depende del tipo de dato. Un módulo no debe completar silenciosamente un dato faltante usando otra capa que tenga un significado distinto.

## 2. Fuente ejecutable pública

### Autoría y materialización

La línea técnica V2.8 conserva fuentes históricas/compatibles como `assets/data.js`, `assets/app.js` y `assets/preprod.js`, pero **la superficie publicable no las ejecuta directamente**.

Antes de Mac, Playwright o Pages se materializan:

- `assets/generated/data-v28.js`;
- `assets/generated/app-v28.js`;
- `assets/generated/preprod-v28.js`;
- `assets/generated/manifest-v28.json`.

Generadores:

- `scripts/materializar_fuentes_locales_v28.py`;
- `scripts/preparar_sitio_materializado_v28.py`.

El artefacto resultante excluye loaders/chunks/Base64 heredados y usa `materialized-no-base64-runtime`.

### Canon de marca

`assets/brand-canon-v28.js` es la referencia activa para identidad, aliases, rutas de imágenes y cache de marca.

### Contenido editorial

La experiencia pública compone el canon técnico V2.8 con capas editoriales posteriores, especialmente V2.9. Que un archivo conserve un nombre V2.8/V2.9 no significa que toda la release integral tenga ese número.

## 3. Datos maestros y catálogo

Responsabilidad: definir **qué es** cada entidad y gobernar la calidad de esa definición, no registrar qué ocurrió en una jornada.

Incluye, según la capa:

- producto;
- SKU/variante;
- nombre y contenido público;
- precio público;
- recetas/BOM;
- materiales e insumos;
- unidades;
- proveedores;
- fuentes y estados de evidencia;
- responsable de revisión;
- sensibilidad operativa;
- propuestas de revisión del estándar;
- atributos editoriales y comerciales.

Superficie auxiliar: `studio.html`.

### Pack maestro Materiales V2.3.0

`assets/materials-data-v23.js` conserva el estándar/provisional utilizado por BOM y costeo operativo. Sus campos de costo, estado y confianza no son hechos de compra y no deben mutarse por el simple registro de una recepción.

### Overlay de gobierno Datos maestros V1.0.0

Clave local:

`ee_v10_master_governance`

Este overlay guarda exclusivamente metadata de gobierno para materiales y proveedores:

- responsable;
- fuente específica;
- fecha de revisión;
- calidad (`PENDIENTE`, `PARCIAL`, `REVISADO`, `VALIDADO`);
- sensibilidad (`SIN_CLASIFICAR`, `BAJA`, `MEDIA`, `ALTA`, `CRITICA`);
- nota y timestamp de actualización.

Datos maestros V1.0.0 **lee** `ee_v24_material_purchases` para mostrar la última compra como evidencia observada, pero no la escribe. Tampoco modifica BOM, recetas, costo maestro/provisional ni productos.

### Propuestas de costo Datos maestros V1.1.0

Clave local:

`ee_v11_cost_proposal_events`

Es un ledger append-only de decisiones sobre posibles revisiones de costo. Cada propuesta nace de una compra observada del mismo material y conserva snapshots de:

- costo estándar/provisional vigente al momento de creación;
- costo propuesto;
- compra que sirve de evidencia (id, proveedor, fecha y costo unitario);
- material/unidad;
- actor, justificación y timestamp.

Flujo:

`CREATED → SUBMITTED → APPROVED / REJECTED`

Estado derivado de una aprobación:

`APPROVED_FOR_MATERIALIZATION`

Ese estado **no convierte la propuesta en costo vigente**. Sólo documenta que fue aprobada para una materialización futura. V1.1.0 no expone función de aplicación, no escribe `ee_v24_material_purchases`, no modifica `assets/materials-data-v23.js`, no reescribe productos/BOM y no altera el costo estándar cargado en memoria.

Aprobar o rechazar exige una razón explícita y agrega un evento nuevo; no se reescribe el evento original. Sólo puede existir una propuesta abierta por material para evitar decisiones paralelas contradictorias.

### Gobierno de oferta V0.9

El expediente V0.9 continúa separado para producto/SKU, contenido, fuentes editoriales y gates de lanzamiento. Convive en Studio sin compartir persistencia con `ee_v10_master_governance` ni `ee_v11_cost_proposal_events`.

Reglas:

- un dato maestro puede estar completo para demo y seguir `PENDIENTE` de validación gastronómica, sanitaria, financiera o jurídica;
- modificar gobierno no debe reescribir hechos históricos ya capturados;
- una compra observada no se convierte automáticamente en costo estándar;
- una propuesta aprobada no equivale a estándar vigente;
- estándar provisional, hecho observado, metadata de gobierno y decisión/propuesta son capas diferentes.

## 4. Hechos operativos locales

Mientras no exista persistencia multiusuario activa, los hechos operativos viven en el navegador.

| Clave | Significado | Autoridad |
|---|---|---|
| `ee_v14_orders` | Pedidos / compromisos | Operación |
| `ee_v22_fulfillment` | Alistamiento y despacho | Operación |
| `ee_v23_material_stock` | Existencias conocidas | Operación |
| `ee_v24_production_measurements` | Lotes, rendimiento y merma | Medición |
| `ee_v24_material_purchases` | Compras/recepciones observadas | Operación |
| `ee_v25_purchase_orders` | Órdenes de abastecimiento | Abastecimiento |
| `ee_v330_operational_evidence` | Soportes, tiempos, novedades y correcciones append-only | Evidencia V3.3.0 |

### Reglas semánticas

- inventario desconocido ≠ cero;
- requerimiento BOM ≠ compra;
- orden de compra ≠ recepción;
- compra ≠ COGS;
- compra observada ≠ costo estándar vigente;
- propuesta aprobada ≠ costo estándar vigente;
- una corrección de evidencia no borra el evento anterior;
- una fecha futura no admite evidencia como si fuera un hecho ocurrido;
- Finanzas puede leer estos hechos, pero no debe reescribirlos;
- Datos maestros puede leer compras como evidencia, pero no debe reescribirlas.

## 5. Decisiones/propuestas de gobierno

Estas claves no son hechos operativos ni estándares materiales; documentan decisiones sobre esos datos.

| Clave | Significado | Efecto sobre hechos/estándar |
|---|---|---|
| `ee_v10_master_governance` | Metadata de gobierno de materiales/proveedores | Ninguno; overlay separado. |
| `ee_v11_cost_proposal_events` | Ledger de propuestas y decisiones de revisión de costo | Ninguno; aprobación no aplica costo. |

Una futura materialización de una propuesta aprobada deberá ser otro proceso explícito, versionado y certificado. No debe implementarse como efecto lateral de la aprobación.

## 6. Finanzas local y privada

### Baseline

`ee_v30_mfo_snapshot`

Referencia inmutable del modelo cargado o generado localmente.

### Working Model

`ee_v31_finance_working_model`

Copia editable del plan. Puede contener:

- plan de ventas;
- precio/costo plan;
- gastos;
- caja;
- CAPEX;
- escenarios;
- decisiones;
- supuestos;
- calidad/readiness.

### Historial y hechos financieros auxiliares

| Clave | Significado |
|---|---|
| `ee_v31_finance_history` | Historial local de cambios del modelo |
| `ee_v27_finance_movements` | Movimientos financieros observados/locales |
| `ee_v323_cash_counts` | Conteos de caja observados |

### MFO privado

El workbook MFO real y snapshots con cifras sensibles no pertenecen al repositorio público.

El exportador privado reconoce el perfil workbook v3.3 y produce un snapshot bajo contrato V3.0. Debe operarse desde almacenamiento privado (`private-data/` o equivalente no versionado).

## 7. Plan vs. Real

### Plan

Fuente:

- baseline MFO;
- working model;
- starter financiero local;
- escenarios y decisiones.

### Real / observado

Fuente:

- pedidos;
- movimientos;
- compras/recepciones;
- conteos de caja;
- inventario conocido;
- evidencia operativa.

### COGS real

Sólo puede usar costo histórico capturado en la línea del pedido (`unit_cost_snapshot` o equivalente). Si falta, el dato queda incompleto. No se sustituye por el costo maestro actual ni por una propuesta de costo aprobada pero no materializada.

## 8. Datos sintéticos de demo

Los datos demo deben identificarse como sintéticos y nunca mezclarse silenciosamente con hechos reales.

### Demo operativa V3.1.1

Marcador:

`ee_v311_operational_demo`

La demo respalda y sustituye temporalmente las claves operativas administradas, incluida `ee_v330_operational_evidence`, y las restaura al salir.

### Demo financiera V3.2.9

Marcador:

`ee_v329_finance_demo`

Gestiona temporalmente baseline/modelo/historial y hechos financieros/operativos necesarios para explicar el recorrido financiero. Utiliza costos y cifras sintéticas marcadas como DEMO/ESTIMADO y restaura el estado anterior.

Las demos operativa y financiera no se apilan.

## 9. Acceso y sesión local

| Clave | Almacenamiento | Función |
|---|---|---|
| `ee_v31_local_account` | `localStorage` | Cuenta local configurada en ese navegador; conserva hash PBKDF2 + sal, no contraseña. |
| `ee_v31_session` | `sessionStorage` | Sesión local con expiración. |

La shell V3.1.1 protege el flujo local de Centro, Control, Operación, Finanzas, Datos maestros y Actas, pero **no es autorización servidor**.

## 10. SessionStorage de contexto

Existen claves de UI/contexto —por ejemplo fecha operativa seleccionada o pestaña financiera— que ayudan a conservar navegación. No son la fuente autoritativa de un hecho de negocio.

Ejemplos:

- `ee_v22_selected_date`;
- `ee_v31_finance_tab`;
- selectores de mes de capas financieras.

## 11. Backend / Supabase

El repositorio contiene schemas, RPC, guards y configuración preparada de iteraciones anteriores. Su presencia **no significa que Supabase esté activo**.

Estado vigente:

- proveedor preparado: Supabase;
- Auth administrativo real: inactivo;
- RLS como contrato de producción: no activado/certificado;
- persistencia compartida de hechos internos: inactiva;
- Storage privado de comprobantes: no declarado activo;
- `service_role`: nunca debe estar en cliente ni repositorio.

La activación de backend deberá pasar por el gate definido en `ROADMAP_ACTIVO_V33.md`.

## 12. Matriz de responsables

| Área | Datos cuya calidad debe gobernar |
|---|---|
| Gastronomía | Fórmulas, métodos, ingredientes, gramajes y preparación |
| Producción | Rendimientos, capacidad, lotes, tiempos y merma |
| Calidad | Alérgenos, etiquetado, liberación, vida útil y trazabilidad |
| Abastecimiento | Materiales, proveedor, órdenes, recepción y soporte |
| Finanzas | Costos históricos, plan, caja, movimientos, impuestos y escenarios |
| Comercial | Catálogo, precios públicos, promociones, eventos y cobertura |
| Jurídico | Identidad del vendedor, políticas, consentimientos y tratamiento de datos |
| Tecnología | Contratos de datos, acceso, secretos, backups, sincronización y auditoría |

## 13. Estados de calidad recomendados

La aplicación ya utiliza distintos términos por módulo. Conceptualmente deben converger en esta semántica:

- **CONFIRMADO / MEDIDO**: existe evidencia suficiente para el uso declarado;
- **OBSERVADO**: dato capturado pero pendiente de consolidación/validación;
- **ESTIMADO / INFERIDO**: modelo o aproximación, no hecho;
- **PENDIENTE**: falta validar o completar;
- **DEMO**: sintético, exclusivamente demostrativo;
- **DESCONOCIDO**: ausencia explícita de dato; nunca convertir automáticamente en cero.

Los estados `REVISADO` y `VALIDADO` de Datos maestros V1.0.0 describen **calidad del proceso de gobierno**, no sustituyen el estado de evidencia del dato subyacente.

Los estados de V1.1.0 (`DRAFT`, `IN_REVIEW`, `APPROVED_FOR_MATERIALIZATION`, `REJECTED`) describen el estado de una **decisión propuesta**, no el estado de evidencia ni el valor maestro vigente.

## 14. Regla de persistencia futura

Cuando se active persistencia multiusuario, las claves locales no deben migrarse uno-a-uno sin diseño. Primero se debe definir:

- entidad y clave primaria;
- actor/rol autorizado;
- fecha efectiva vs. fecha de creación;
- política de corrección/versionado;
- RLS;
- idempotencia;
- trazabilidad/auditoría;
- privacidad y retención;
- estrategia de reconciliación con los datos locales existentes.

Hasta entonces, el navegador sigue siendo el entorno efectivo de las superficies internas y los datos privados deben mantenerse fuera de GitHub.
