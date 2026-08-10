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
| `MAPA_VERSIONES_ACTIVAS.md` | Matriz oficial de versiones y reglas de numeración. |
| `ARQUITECTURA_INTERNA_V31.md` | Contrato vigente de acceso, Control, Operación y Finanzas. |
| `MAPA_DATOS_Y_FUENTES.md` | Fuentes efectivas, almacenes locales, datos privados y estado de backend. |
| `ROADMAP_ACTIVO_V33.md` | Prioridades posteriores a Operación V3.3.0. |
| `ACCESOS_DEMO.md` | Cómo entrar y usar los modos demo actuales sin credenciales fijas publicadas. |
| `CANON_MARCA_CONTENIDO_V28.md` | Canon activo de marca, aliases e imágenes. |
| `MFO_SNAPSHOT_V30.md` | Contrato del snapshot financiero privado cuando se utilice. |

## Referencias modulares vigentes

Estos documentos describen partes concretas del sistema y pueden conservar numeración inferior porque documentan el contrato de esa capa:

- `FINANZAS_DECISIONES_V325.md` — decisiones financieras V3.2.5.
- documentación financiera V3.2.x que describa una capa aún cargada por `finanzas.html`.
- documentación de Operación V2.x que describa motores aún compuestos por `operacion.html`.
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

## Documentos que requieren especial cuidado

### Roadmaps antiguos

Un roadmap viejo puede contener tareas posteriormente implementadas, descartadas o reformuladas. No usarlo como backlog actual salvo que `ROADMAP_ACTIVO_V33.md` lo incorpore expresamente.

### Backend / Supabase

Existen schemas, RPC y código preparado de etapas anteriores. Eso **no implica backend activo**. La referencia vigente es:

- Supabase preparado;
- Auth/RLS/persistencia compartida no declarados activos;
- superficies internas efectivas operan localmente hasta una activación certificada.

### Datos financieros

Nunca asumir que cifras presentes en documentos históricos o demos son valores reales actuales. El MFO privado, snapshots reales y costos sensibles permanecen fuera del repositorio.

### Credenciales demo históricas

No reutilizar usuarios o contraseñas ficticias escritos en versiones anteriores de documentación. La shell actual configura el primer usuario local en cada navegador y no depende de credenciales fijas versionadas.

## Cuándo actualizar este índice

Actualizarlo cuando:

- se cree un nuevo documento que pretenda ser fuente canónica;
- un documento vigente sea reemplazado;
- se active un backend real;
- cambie la release integral o la arquitectura transversal;
- una capa modular deje de cargarse en el producto;
- se archive una familia documental que todavía pueda inducir a error.
