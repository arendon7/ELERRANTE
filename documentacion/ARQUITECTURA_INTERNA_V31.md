# Arquitectura interna V3.1 — El Errante

## 1. Objetivo

V3.1 convierte el conjunto de pantallas administrativas en un sistema interno con tres momentos explícitos:

1. **Acceso de usuario**.
2. **Selección de contexto**: Operación o Finanzas.
3. **Trabajo dentro de un módulo**, sin mezclar responsabilidades.

V3.1 se valida como candidato sobre la V3.0 publicada; al integrarse a `main` pasa a ser la release integral vigente. El canon visual/materializado V2.8 y la narrativa pública V2.9 no se reescriben.

## 2. Flujo de acceso

La web pública incorpora un enlace discreto `Acceso usuarios` que conduce a `acceso.html`.

### Modo local V3.1

Mientras Supabase siga inactivo, el primer navegador configura un usuario local:

- nombre de usuario;
- contraseña de mínimo 8 caracteres;
- sal aleatoria de 16 bytes;
- derivación PBKDF2 / SHA-256 / 150.000 iteraciones;
- sesión almacenada en `sessionStorage` con vencimiento a 8 horas.

La contraseña no se almacena. El navegador conserva únicamente sal y hash derivado.

### Límite de seguridad

GitHub Pages es un host estático. El guard V3.1 es una barrera de experiencia y de uso local, no una autorización servidor. No debe considerarse sustituto de Auth + RLS. La activación multiusuario real debe usar el esquema Supabase ya existente (`auth.users`, `admin_users`, `is_admin()`, RLS y auditoría).

Nunca deben versionarse contraseñas, `service_role`, tokens privados ni secretos.

## 3. Centro interno

`centro-interno.html` deja de ser un menú técnico y se convierte en un selector de dos contextos:

### Operación

Pregunta principal: **¿qué debemos ejecutar?**

- Resumen y prioridades.
- Pedidos.
- Producción.
- Materiales / BOM.
- Inventario y medición.
- Compras.
- Despacho.

### Finanzas

Pregunta principal: **¿qué debemos medir, modelar y decidir?**

- Dashboard.
- Plan de ventas 24M.
- Productos y costos.
- Gastos y caja.
- Real vs. Plan.
- Escenarios.
- Decisiones.
- Supuestos, auditoría e historial.

## 4. Módulo Operativo

`operacion.html` compone en una sola superficie los motores ya validados:

- `control-v30.js` — resumen de prioridades;
- `daily-ops-v21.js` — pedidos y continuidad;
- `production-v22.js` — agenda y alistamiento;
- `materials-v23.js` — BOM y requerimientos;
- `measurement-v24.js` — lotes, conteos, rendimiento y merma;
- `procurement-v25.js` — abastecimiento controlado.

### Invariantes

- Necesidad teórica ≠ orden de compra.
- Inventario desconocido ≠ cero.
- Un escenario financiero no crea producción.
- Un plan no crea compras reales.
- Los hechos operativos alimentan Finanzas; Finanzas no reescribe hechos operativos.

## 5. Módulo Financiero — Baseline + Working Model

V3.1 reemplaza la yuxtaposición visual `MFO V3.0 + Finanzas V2.7` por un solo workbench.

### 5.1 Dos formas de iniciar

El usuario puede empezar de dos maneras sin publicar cifras privadas:

**A. Importar MFO privado**

Carga el snapshot JSON exportado localmente desde el MFO v3.3.

**B. Crear modelo desde cero**

`assets/finance-starter-v31.js` genera localmente:

- horizonte de 24 meses desde el mes vigente en Colombia;
- SKU y precios que ya forman parte del catálogo público;
- plan de ventas con cantidades iniciales en cero;
- costos directos en cero y estado `PENDIENTE`;
- flujo de caja en cero;
- cuatro escenarios iniciales;
- supuestos mínimos marcados `PENDIENTE`;
- un hallazgo de calidad que exige completar el modelo.

El starter no contiene cifras financieras privadas, no hace llamadas de red y no convierte un cero inicial en un dato confirmado.

### 5.2 Baseline

Clave local:

`ee_v30_mfo_snapshot`

Representa la referencia inmutable del modelo, ya sea importada desde el MFO o creada localmente por el starter. No se modifica al editar.

### 5.3 Modelo de trabajo

Clave local:

`ee_v31_finance_working_model`

Se crea como copia del baseline y contiene:

- plan de ventas;
- productos y costos;
- flujo de caja;
- escenarios;
- supuestos;
- decisiones;
- pendientes.

Cada cambio actualiza únicamente esta copia.

### 5.4 Historial

Clave local:

`ee_v31_finance_history`

Registra hasta 120 eventos locales de edición con fecha, tipo de cambio y detalle.

No es todavía un ledger de auditoría multiusuario. Esa responsabilidad corresponde a la futura persistencia backend.

## 6. Recalculo financiero

### Plan de ventas

La cantidad por SKU/mes es editable. Cuando cambia:

1. se lee precio y costo directo del producto en el working model;
2. se recalculan ventas;
3. se recalcula COGS planificado;
4. se recalcula caja planificada.

La modificación no crea pedidos reales.

### Productos y costos

Precio y costo directo son editables en el working model. El margen y el plan se recalculan inmediatamente.

Un pedido cerrado conserva su costo snapshot histórico y no se revaloriza con el costo actual.

### Caja

V3.1 conserva por mes la relación de cobro observada en el baseline (`salesCash / sales plan`) y la aplica al nuevo plan de ventas. Los egresos editables incluyen:

- compras;
- gasto operativo;
- auxiliares;
- pago de Juan;
- reserva de impuestos;
- arriendo;
- CAPEX.

La caja se encadena mes a mes dentro del modelo de trabajo.

## 7. Hechos reales

### Ventas reales

Provienen de pedidos en estados aprobados/operativos.

### COGS real

Sólo se reconoce cuando la línea del pedido conserva `unit_cost_snapshot`, `unitCostSnapshot` o equivalente.

Si falta costo histórico, el COGS real queda incompleto. **No se reemplaza por el costo actual del catálogo.**

### Movimientos reales

Se registran separadamente bajo la capa de movimientos financieros locales:

- gasto operativo;
- compra de inventario;
- CAPEX;
- aporte de capital;
- retiro/pago del propietario;
- otro ingreso.

Compras ≠ COGS ≠ inventario ≠ caja.

## 8. Visualización

El dashboard V3.1 usa SVG nativo para evitar dependencias externas y mantener Pages autocontenido.

Incluye:

- ventas Plan vs. Real;
- ventas planificadas por producto;
- evolución de caja;
- KPIs de ventas, margen directo, resultado simplificado, caja, COGS, compras, CAPEX y ventas reales.

## 9. Escenarios

Los escenarios permiten modificar, como mínimo:

- factor de volumen;
- factor de costo directo.

Se recalculan ventas, margen directo y resultado simplificado. Son señales de planeación; no ejecutan decisiones operativas.

## 10. Decisiones y supuestos

Las decisiones permiten modificar el mes configurado y su estado de trabajo, manteniendo el mes recomendado como referencia del modelo.

Los supuestos pueden editarse en la copia de trabajo y conservar estado de calidad:

- CONFIRMADO;
- ESTIMADO;
- INFERIDO;
- CONTRADICTORIO;
- PENDIENTE.

## 11. Responsive y sistema visual

`assets/internal-v31.css` introduce un sistema consistente para:

- acceso;
- selector de módulos;
- shell interno;
- navegación sticky;
- KPIs;
- gráficas;
- tablas editables;
- paneles;
- formularios;
- estados y chips;
- móvil.

Los componentes reutilizan la paleta sobria de El Errante y evitan convertir el módulo financiero en una hoja de cálculo visualmente hostil.

## 12. Validación

Barreras específicas:

- `scripts/verificar_v31_interno.py` — arquitectura y comportamiento interno;
- `scripts/verificar_release_v31.py` — coherencia de release y publicación.

Validan acceso, criptografía local, separación de módulos, starter local, working model, ausencia de red en motores financieros, protección del baseline, COGS histórico, gráficas, edición, service worker y responsive.

Playwright cubre:

- redirección sin sesión;
- creación del primer acceso;
- selector de módulos;
- módulo operativo consolidado;
- creación segura de un modelo financiero desde cero;
- importación/uso de baseline MFO;
- dashboard con gráficas;
- edición del plan;
- no mutación del baseline;
- edición de precio/costo;
- edición de escenarios;
- móvil.

## 13. Próxima fase — persistencia V3.2

V3.1 no debe activar Supabase por accidente. La siguiente fase deberá migrar de almacenamiento local a contratos backend explícitos:

- Auth real;
- roles Operador / Financiero / Administrador;
- RLS;
- auditoría de cambios;
- hechos financieros reconciliados;
- inventario por movimientos autorizados;
- costos versionados;
- persistencia del working model por usuario/empresa;
- sincronización controlada entre dispositivos.

La UI V3.1 se diseña para que esta migración cambie el proveedor de datos y autenticación, no la experiencia fundamental del usuario.
