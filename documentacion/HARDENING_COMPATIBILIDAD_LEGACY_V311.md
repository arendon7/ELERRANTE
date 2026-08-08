# Hardening de compatibilidad heredada V3.1.1

## Objetivo

Reducir la deuda de navegación interna sin destruir superficies V1.5–V2.8 que todavía tienen motores y pruebas funcionales vigentes.

El sistema actual mantiene tres contextos principales:

1. Panel de control.
2. Operación.
3. Finanzas.

`admin.html` y `activacion.html` no se eliminan ni se presentan como nuevos contextos. Quedan explícitamente como superficies auxiliares de compatibilidad y diagnóstico.

## Administración heredada

`admin.html` conserva sin cambios sus contenedores funcionales y scripts históricos para:

- simulación administrativa local;
- producción y operación heredadas;
- materiales y medición;
- abastecimiento;
- finanzas operativas V2.7;
- despacho y utilidades de compatibilidad.

Su navegación ahora prioriza el Centro interno y los tres contextos actuales. Se elimina el uso incorrecto de `equipo.html` como supuesto “Centro integral”.

## Activación y diagnóstico

`activacion.html` conserva los chequeos V2.5 de backend, migraciones, configuración y transición segura. Sigue siendo accesible directamente porque ese es su contrato histórico de regresión.

La superficie se identifica como herramienta técnica auxiliar y enlaza al Centro interno y a Administración heredada sin fingir que Supabase está activo.

## Presentación

La presentación integral mantiene su motor V0.6.1 y su navegación pública, pero diferencia dos conceptos que antes estaban mezclados:

- **Centro interno** → `centro-interno.html`.
- **Equipo** → `equipo.html`.

La diapositiva de estado refleja tres contextos principales, coherentes con V3.1.1.

## Invariantes

- No se eliminan los motores ni los contenedores históricos de `admin.html`.
- No se modifica la lógica de activación V2.5.
- No se declara Supabase activo.
- No se cambia el contrato de acceso directo de las superficies heredadas.
- `equipo.html` permanece siendo una página pública de equipo, no un centro administrativo.
- El Centro interno sigue teniendo exactamente tres contextos principales.