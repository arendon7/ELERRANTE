# Arquitectura interna V3.1 — El Errante

## 1. Alcance

La arquitectura interna V3.1 sigue siendo el contrato estructural vigente de El Errante: acceso, selección de contexto y separación de responsabilidades entre **Panel de control**, **Operación** y **Finanzas**, con **Datos maestros** y **Actas** como herramientas auxiliares de gobierno dentro del mismo perímetro local.

La release integral publicada continúa siendo V3.1.1. Sobre ella, los módulos han avanzado de forma compatible:

- shell y sesión: V3.1.1;
- Panel de control: shell V3.1.1 sobre motor V3.0;
- Operación efectiva: V3.3.0;
- Finanzas efectiva: V3.2.9;
- runtime/materialización: V2.8.0.

La matriz completa está en `MAPA_VERSIONES_ACTIVAS.md`.

## 2. Flujo de acceso

```text
Web pública
   ↓
Acceso usuarios
   ↓
Sesión local V3.1.1
   ↓
Centro interno
   ├── Panel de control
   ├── Operación V3.3.0
   ├── Finanzas V3.2.9
   ├── Datos maestros · auxiliar
   └── Actas · auxiliar
```

### Sesión local V3.1.1

Mientras Supabase permanezca inactivo, el navegador configura y conserva el acceso local mediante:

- usuario local;
- contraseña de mínimo 8 caracteres;
- sal aleatoria;
- PBKDF2 / SHA-256 / 150.000 iteraciones;
- sesión en `sessionStorage` con vencimiento de ocho horas.

La shell V3.1.1 revalida la expiración en pestañas abiertas, en foco, `pageshow` y cambios de visibilidad. El retorno a una sección interna se limita a destinos permitidos mediante `?next=`.

Destinos permitidos:

- Centro interno;
- Panel de control;
- Operación y hashes internos expresamente permitidos, incluido `#evidencia`;
- Finanzas;
- Datos maestros;
- Actas.

Un destino externo o no reconocido no se conserva.

Las cuentas/sesiones locales creadas durante V3.1.0 permanecen compatibles: la metadata V3.1.1 no invalida el formato de cuenta ni el contrato de sesión.

### Límite de seguridad

GitHub Pages es un host estático. La sesión local es una barrera de experiencia, no autorización servidor. La fase multiusuario deberá usar Supabase Auth, roles, RLS y auditoría real.

## 3. Separación de contextos

### 3.1 Panel de control

Pregunta principal: **¿qué requiere atención ahora?**

Responsabilidades:

- pedidos comprometidos;
- alistamiento;
- BOM;
- inventario conocido/desconocido;
- faltantes confirmados;
- compras abiertas;
- señales y prioridades.

El Panel usa la shell V3.1.1 y conserva `control-v30.js` como motor V3.0. No calcula margen, resultado ni caja.

### 3.2 Operación V3.3.0

Pregunta principal: **¿qué debemos ejecutar y qué evidencia existe?**

`operacion.html` compone:

- `control-v30.js` — resumen de prioridades;
- `daily-ops-v21.js` — pedidos y continuidad;
- `production-v22.js` — producción y alistamiento;
- `materials-v23.js` — BOM y requerimientos;
- `measurement-v24.js` — lotes, conteos, rendimiento y merma;
- `procurement-v25.js` — abastecimiento controlado;
- `operational-evidence-v330.js` — evidencia y cierre.

#### Evidencia y cierre V3.3.0

La nueva capa no sustituye los motores anteriores. Los lee y añade una bitácora local independiente:

`ee_v330_operational_evidence`

Controles de cierre:

1. producción / lote;
2. rendimiento y merma;
3. conteo físico;
4. recepción y soporte;
5. tiempo / novedad.

Invariantes:

- necesidad teórica ≠ orden de compra;
- inventario desconocido ≠ cero;
- periodo futuro ≠ incumplimiento;
- no se admite evidencia con fecha futura;
- una corrección crea un nuevo evento y referencia el anterior mediante `supersedes`;
- registrar evidencia no modifica pedidos, inventario, recetas, compras ni Finanzas;
- una fila histórica no se elimina como efecto secundario de anexar otra evidencia.

### 3.3 Finanzas V3.2.9

Pregunta principal: **¿qué debemos medir, modelar y decidir?**

El núcleo sigue siendo `finance-workbench-v31.js`, pero la profundidad efectiva del módulo se construye por capas acumulativas:

- `finance-depth-v32.js` — V3.2.0;
- `finance-ledger-v321.js` — V3.2.1;
- `finance-unit-economics-v322.js` — V3.2.2;
- `finance-cash-trends-v323.js` — V3.2.3;
- `finance-scenarios-v324.js` — V3.2.4;
- `finance-decisions-v325.js` — V3.2.5;
- `finance-procurement-v326.js` — V3.2.6;
- `finance-executive-v327.js` — V3.2.7;
- `finance-readiness-v328.js` — V3.2.8;
- `finance-demo-v329.js` — V3.2.9.

Estas capas amplían el workbench sin cambiar el contrato fundamental de separación entre plan y hechos.

### 3.4 Datos maestros

Pregunta principal: **¿qué sabemos de cada entidad y qué fuente lo respalda?**

`studio.html` es una superficie auxiliar, protegida por la misma shell local V3.1.1. Gobierna:

- producto y SKU;
- contenido y atributos maestros;
- fuentes;
- estado de evidencia;
- gobierno de oferta.

No registra pedidos, producción ni hechos financieros.

### 3.5 Actas

Pregunta principal: **¿qué se validó, con qué evidencia y bajo qué condiciones?**

`actas.html` comparte la shell V3.1.1 y conserva el motor de actas/oferta V0.9 como capa modular histórica aún utilizada.

Una acta local:

- documenta participantes, evidencia, condiciones y decisiones;
- no constituye firma electrónica por sí sola;
- no equivale a aprobación sanitaria, jurídica o comercial externa;
- no reemplaza hechos de Operación ni Finanzas.

## 4. Baseline + Working Model

### 4.1 Baseline

Clave local:

`ee_v30_mfo_snapshot`

Es la referencia inmutable del modelo, importada desde un MFO privado o generada por el starter local.

### 4.2 Working Model

Clave local:

`ee_v31_finance_working_model`

El **Working Model** es una copia editable independiente que puede contener:

- plan de ventas;
- productos y costos;
- flujo de caja;
- escenarios;
- decisiones;
- supuestos;
- pendientes de calidad.

Editar el Working Model no modifica el baseline ni hechos operativos.

### 4.3 Historial financiero

Clave local:

`ee_v31_finance_history`

Registra cambios locales. No es todavía un ledger de auditoría multiusuario.

## 5. Plan vs. hechos

### Plan

Proviene del baseline y del Working Model. Incluye cantidades, precios, costos directos, egresos, caja, escenarios y decisiones.

### Hechos

Provienen de pedidos, movimientos, compras, conteos y evidencia operativa bajo sus propios contratos.

Reglas:

- una proyección no crea pedidos;
- una decisión no crea producción;
- una compra planificada no crea una orden real;
- Finanzas puede leer hechos, pero no reescribirlos;
- COGS real sólo usa costo histórico capturado en la línea del pedido;
- compras ≠ COGS ≠ inventario ≠ caja.

## 6. Demo operativa y demo financiera

### Demo operativa V3.1.1

- local;
- reversible;
- aislada de configuración remota;
- respalda y restaura pedidos, fulfillment, stock, mediciones, compras, órdenes y evidencia V3.3.0.

### Demo financiera V3.2.9

- local;
- reversible;
- usa únicamente cifras sintéticas;
- no publica costos reales;
- no puede apilarse sobre la demo operativa;
- restaura el estado anterior al salir.

## 7. Runtime y materialización V2.8

La superficie ejecutable continúa generándose con:

```text
scripts/materializar_fuentes_locales_v28.py
scripts/preparar_sitio_materializado_v28.py
```

V2.8 sigue siendo el contrato técnico de materialización, cache y fuente canónica. Las mejoras modulares no justifican renombrar ese runtime mientras no cambie el contrato de construcción.

## 8. Marcador de despliegue

`deploy-version.txt` debe publicar las capas por separado:

```text
release_version=3.1.1
version=2.8.0
internal_architecture=v3.1-acceso-operacion-finanzas
session_shell=v3.1.1
control_engine=v3.0
operation_module=v3.3.0
finance_workbench_core=v3.1.0
finance_module=v3.2.9
finance_demo=v3.2.9
mfo_baseline=v3.0-schema-mfo-v3.3
```

Este marcador evita tratar la versión modular más alta como versión global del producto.

## 9. Service worker y frescura

Las páginas internas y los assets críticos de sesión, Finanzas y evidencia operativa usan política fresca/network-first cuando corresponde. El service worker debe conservar explícitamente:

- páginas de Centro, Control, Operación, Finanzas, Datos maestros y Actas;
- shell V3.1.1;
- demo interna V3.1.1;
- configuración comercial efectiva;
- capas financieras V3.1–V3.2.9;
- evidencia operativa V3.3.0.

La frescura no debe eliminar el aislamiento de demo introducido en la shell/configuración local.

## 10. Validación

Barreras principales:

- `scripts/verificar_v31_interno.py`;
- `scripts/verificar_release_v31.py`;
- validadores V2.8 de canon y materialización;
- Playwright desktop y móvil;
- health-check público sobre el SHA desplegado.

Las barreras deben comprobar tanto la matriz modular como el perímetro completo de la shell local: Centro, Control, Operación, Finanzas, Datos maestros y Actas.

## 11. Próxima fase estructural

La próxima versión integral no debe abrirse sólo por continuar aumentando números. El salto de release tendrá sentido cuando cambie un contrato transversal, por ejemplo:

- Auth real;
- roles Operador / Financiero / Administrador;
- RLS;
- persistencia compartida;
- auditoría servidor;
- inventario por movimientos autorizados;
- costos versionados;
- sincronización entre dispositivos.

Hasta entonces, las iteraciones compatibles de Operación y Finanzas pueden avanzar modularmente sobre la release integral V3.1.1.
