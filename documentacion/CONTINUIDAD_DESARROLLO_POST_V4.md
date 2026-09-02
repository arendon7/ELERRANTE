# EL ERRANTE · Continuidad de desarrollo post-V4

Actualizado: 2026-09-02

Este documento funciona como memoria operativa breve para humanos, Codex y otros agentes que continúen el proyecto.

## Estado actual

El Errante ya tiene una experiencia pública V4 integrada y una aplicación interna evolucionada por módulos. La prioridad no es iniciar otro rediseño general.

## Secuencia inmediata obligatoria

1. Cerrar y certificar PR #146 — hardening de visibilidad/reveal Home V4.
2. Cerrar y certificar PR #145 — canales públicos gobernados desde configuración administrativa.
3. Rebasar/actualizar PR #147 sobre el nuevo `main`.
4. Certificar #147 y, si todos los gates permanecen verdes, promoverlo.

## Fases siguientes

1. Gobierno de repositorio y documentación.
2. SEO/AEO técnico: canonical, noindex, JSON-LD y URLs parametrizadas.
3. Quality baseline: performance, Core Web Vitals, accesibilidad, consola/red y revisión visual desktop/mobile.
4. Conversión y verdad comercial.
5. Simplificación de CSS/JS/assets sólo con evidencia before/after.
6. RFC de persistencia/autenticación: mantener local-first o activar Supabase Auth + RLS de forma completa.
7. Observabilidad, Search Console y analítica bajo consentimiento.

## Regla de trabajo

Cada iteración debe partir de una hipótesis concreta y seguir: canon → skill adecuado → branch → baseline → cambio mínimo → pruebas → PR → CI → merge → verificación real de Pages → documentación.

No instalar skills por acumulación. No migrar de framework por efecto colateral. No reabrir una ola visual sin una necesidad demostrada.

Documento maestro relacionado: `AUDITORIA_INTEGRAL_Y_PROCESO_DESARROLLO_2026-09-02.md`.
