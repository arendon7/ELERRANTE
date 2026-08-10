# El Errante — Índice de documentación activa

Este índice define qué documentos deben usarse para entender el estado vigente del proyecto y cuáles se conservan únicamente como registro histórico.

## Regla de lectura

Un archivo antiguo puede seguir existiendo por trazabilidad sin describir el producto actual. **La existencia de un documento en `documentacion/` no lo convierte en fuente vigente.**

Cuando haya contradicción:

1. primero prevalece el código y las barreras certificadas de `main`;
2. después `README.md` y los documentos clasificados como **canónicos vigentes** aquí;
3. los documentos históricos sirven para explicar decisiones pasadas, no para reconstruir el estado actual.

## Canónicos vigentes

| Documento | Propósito |
|---|---|
| `../README.md` | Vista general de release, módulos, seguridad, datos y validación. |
| `MAPA_VERSIONES_ACTIVAS.md` | Matriz oficial de versiones, overlays y reglas de numeración. |
| `ARQUITECTURA_INTERNA_V31.md` | Contrato de acceso, tres contextos principales y herramientas auxiliares. |
| `MAPA_DATOS_Y_FUENTES.md` | Fuentes efectivas, almacenes locales, datos privados y estado de backend. |
| `ROADMAP_ACTIVO_V33.md` | Roadmap activo actualizado hasta Cierre Diario V3.6 y gate del piloto local. |
| `CIERRE_DIARIO_V36.md` | Contrato funcional del cierre diario, continuidad, append-only y correcciones V3.6. |
| `ACCESOS_DEMO.md` | Entrada y modos demo sin credenciales fijas publicadas. |
| `CANON_MARCA_CONTENIDO_V28.md` | Canon activo de marca, aliases e imágenes. |
| `MFO_SNAPSHOT_V30.md` | Contrato del snapshot financiero privado cuando se utilice. |

## Referencias modulares vigentes

Estos documentos describen capas concretas y pueden conservar numeración inferior porque el motor sigue activo:

- `FINANZAS_DECISIONES_V325.md` — decisiones financieras V3.2.5.
- documentación financiera V3.2.x de capas aún cargadas por `finanzas.html`.
- documentación de Operación V2.x de motores aún compuestos por `operacion.html`.
- documentos de evidencia V3.3, horizonte V3.4 y cierre gerencial/capacidad V3.5 cuando describan esos contratos.
- documentos de oferta/actas V0.9 cuando sigan siendo utilizados por sus superficies y validadores específicos.

Que una referencia modular siga vigente **no significa** que su número sea la versión integral del producto.

## Históricos explícitos

Deben leerse como registro de evolución:

- `ROADMAP_OPERACION_COMERCIAL_V14.md` — roadmap inicial de comercio/backend; reemplazado por `ROADMAP_ACTIVO_V33.md`.
- `DECISION_LOCAL_PRIMERO.md` — decisión V0.4 que explica el origen del enfoque local-first.
- `AUDITORIA_REGRESION_V040_V061.md` — auditoría de iteraciones tempranas.
- `AUDITORIA_PRODUCTOS_V0_6.md` — auditoría histórica de producto.
- actas y cuestionarios de versiones anteriores cuya finalidad sea documentar una validación ya cerrada.

Los archivos dentro de `archive/` son históricos por definición.

## Superficies heredadas que no definen el mapa interno vigente

- `admin.html` se conserva por compatibilidad con motores administrativos previos.
- `activacion.html` conserva diagnóstico técnico de etapas anteriores.
- `presentacion.html` es una presentación pública/demostrativa.

El hecho de que estas páginas aparezcan en verificaciones de compatibilidad **no las convierte en contextos principales**. El perímetro interno se define en `ARQUITECTURA_INTERNA_V31.md`; las capacidades posteriores V3.3–V3.6 son overlays compatibles sobre ese perímetro.

## Documentos que requieren especial cuidado

### Roadmaps antiguos

Un roadmap viejo puede contener tareas posteriormente implementadas, descartadas o reformuladas. No usarlo como backlog actual salvo que `ROADMAP_ACTIVO_V33.md` lo incorpore expresamente.

### Backend / Supabase

Schemas, RPC y código preparado de etapas anteriores **no implican backend activo**. La referencia vigente es:

- Supabase preparado;
- Auth/RLS/persistencia compartida no declarados activos;
- superficies internas efectivas operan localmente hasta una activación certificada.

### Datos financieros y operativos

Nunca asumir que cifras presentes en documentos históricos o demos son valores reales actuales. MFO privado, snapshots reales, clientes, costos sensibles y comprobantes permanecen fuera del repositorio.

### Cierres V3.6

El ledger `ee_v36_daily_close_events` existe en el navegador del usuario. Los documentos del repo describen su contrato, pero **no contienen cierres reales**.

### Credenciales demo históricas

No reutilizar usuarios o contraseñas ficticias de documentación anterior. La shell actual configura el primer usuario local en cada navegador y no depende de credenciales fijas versionadas.

## Cuándo actualizar este índice

Actualizarlo cuando:

- se cree un nuevo documento canónico;
- un documento vigente sea reemplazado;
- se active backend real;
- cambie la release integral o arquitectura transversal;
- una capa modular deje de cargarse;
- se archive una familia documental que pueda inducir a error.
