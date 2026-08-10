# Alcance verificable — Datos maestros V1.2

- Ledger append-only `ee_v12_cost_materialization_events`.
- Sólo propuestas V1.1 con último evento `APPROVED` pueden materializarse.
- Razón explícita obligatoria.
- Doble materialización bloqueada.
- Aprobaciones obsoletas bloqueadas si el estándar cambió desde la creación.
- Fuente canónica, compras, propuestas, productos y BOM permanecen inmutables.
- Resolver `currentStandard` / `effectiveStandardCost` / `effectiveMaterial` / `effectiveProductCost`.
- V1.1 toma el estándar efectivo vigente al crear propuestas posteriores.
- Studio muestra pendientes, estándar efectivo e historial.
- Service worker, Pages, health-check, auditoría canónica y Playwright incorporan V1.2.
- V1.2 no conecta todavía consumidores prospectivos de Operación/Finanzas; ese contrato corresponde a V1.3.