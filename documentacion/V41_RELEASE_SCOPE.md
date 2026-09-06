# V4.1 — Alcance de release: gobierno y contratos

## Base

`72dd7528f76c5fe21a8339f3f09348cdadc746e4`

## Objetivo

Añadir una señal rápida y determinista para los contratos V4 sin modificar la aplicación funcional, y dejar documentada la secuencia V4.1–V4.3.

## Cambios permitidos

- workflow CI específico de contratos V4;
- verificador estático de canales públicos y sus fronteras de seguridad;
- documentación de roadmap/gobierno.

## Cambios expresamente excluidos

- marca y activos visuales;
- catálogo, precios y stock;
- checkout y pedidos;
- Operación, inventario y abastecimiento;
- Finanzas, costos históricos y MFO;
- schemas/migraciones Supabase;
- activación de backend;
- credenciales o variables de producción.

## Gates

1. Contratos V4 · gate rápido.
2. Auditar fuente canónica.
3. Validar y publicar.
4. Regresión funcional / Playwright.
5. Graphify.
6. Inventario valorizado V1.5.
7. Costo histórico V1.4.

No mergear mientras exista un gate rojo o pendiente.
