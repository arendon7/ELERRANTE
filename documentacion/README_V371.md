# V3.7.1 · Ensayo operativo previo

- Contrato principal: `documentacion/PILOTO_OPERATIVO_V37.md`
- Ensayo integral: `documentacion/ENSAYO_OPERATIVO_V371.md`
- Regresión base: `tests/e2e/pilot-operations-v37.spec.js`
- Regresión integrada: `tests/e2e/pilot-rehearsal-v371.spec.js`

V3.7.1 mantiene Supabase inactivo y añade la barrera de jornada completa previa al piloto real. El propio ensayo detectó y corrigió una incompatibilidad del reconciliador V3.7.0 con `receivedDate` / `received_date` emitidos por Abastecimiento V2.5; por eso V3.7.1 sí incluye un patch mínimo del runtime del piloto.
