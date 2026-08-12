# Piloto V3.7.4.1 — readiness de primer arranque

## Objetivo

V3.7.4.1 elimina una fricción de usabilidad detectada antes de la primera jornada real: la superficie V3.7 mostraba acciones visualmente disponibles aunque el estado del piloto no permitiera ejecutarlas.

No cambia hechos, stores, backup, reconciliación ni decisión de backend.

## Regla de interfaz

La disponibilidad de controles se deriva exclusivamente de `EL_ERRANTE_PILOT_V37.pilotState()`.

- `NOT_STARTED`: preflight e inicio habilitados; checkpoint y cierre deshabilitados.
- `ACTIVE`: preflight e inicio bloqueados; checkpoint y cierre habilitados.
- `ENDED`: puede iniciarse un nuevo periodo; checkpoint y cierre quedan deshabilitados hasta el siguiente `START`.

El guard vuelve a aplicar estas reglas cuando el motor V3.7 reconstruye el DOM después de iniciar, hacer checkpoint o cerrar.

## Alcance técnico

- `assets/pilot-readiness-v3741.js`: guard de estado y accesibilidad (`disabled` + `aria-disabled`).
- `assets/pilot-readiness-v3741.css`: señal visual de controles bloqueados y notas de estado.
- `tests/e2e/pilot-readiness-v3741.spec.js`: cobertura desktop/móvil y transición de estados.

## Invariantes

- No modifica `ee_v37_pilot_events`; sólo lo lee mediante la API pública V3.7.
- No crea ni reescribe pedidos, producción, compras, inventario, cierres o caja.
- No cambia `el-errante-pilot-backup`.
- No activa Supabase, Auth, RLS ni storage remoto.
- No reemplaza V3.7.4; es un guard de readiness sobre la superficie vigente.

## Criterio de aceptación

1. Sin piloto, no se puede ejecutar checkpoint/cierre desde la UI.
2. Tras `START`, el preflight queda bloqueado aunque el motor reconstruya la interfaz.
3. Durante `ACTIVE`, checkpoint y cierre quedan habilitados.
4. Tras `END`, continuidad vuelve a bloquearse y el inicio de un futuro periodo queda disponible.
5. Sin overflow horizontal móvil.
6. Regresión Playwright completa en verde.