# EL ERRANTE — Índice central para continuar en Codex

**Actualizado:** 12 de octubre de 2026 · Colombia  
**Repo:** `arendon7/ELERRANTE` · **base verificada:** `main @ a6edba45848a04437fb07b73e5d18cfdcdfc071b`  
**Este índice está propuesto en PR #190 (rama `docs/codex-handoff-20261007`). No es todavía el `main` de producción.**

## Lectura en orden para Codex

| Orden | Archivo | Contenido | Cuándo usar |
|---|---|---|---|
| 0 | [`AGENTS.md`](../../AGENTS.md) | Reglas obligatorias del agente y guardas de identidad | Siempre. |
| 1 | [`CONTINUIDAD_CODEX_2026-10-07.md`](CONTINUIDAD_CODEX_2026-10-07.md) | Contexto amplio: historia, objetivos, arquitectura, estado y decisiones | Al arrancar un chat/sesión de Codex. |
| 2 | [`INVENTARIO_FUENTES_Y_AUTORIDAD_2026-10-12.md`](INVENTARIO_FUENTES_Y_AUTORIDAD_2026-10-12.md) | Ruta a originales, privacidad, jerarquía y contradicciones | Antes de asumir que datos de un documento antiguo son finales. |
| 3 | [`MATRIZ_VISUAL_65_SPECS_2026-10-12.md`](MATRIZ_VISUAL_65_SPECS_2026-10-12.md) | **65 roles/prompt specs** V1 relacionados con candidatos de imágenes V4 | Antes de modificar assets, marca o gráfica web. |
| 4 | [`PLAN_VERIFICABLE_BETA_CODEX_2026-10-12.md`](PLAN_VERIFICABLE_BETA_CODEX_2026-10-12.md) | Gates, pruebas y ruta a pedido cero/beta 30 días | Para planear cambios de código y decidir GO/NO-GO. |
| 5 | [`COMO_RETOMAR.md`](COMO_RETOMAR.md) | Protocolo histórico Graphify y memoria | Complementar si una conversación se corta. |

## Autoridades transversales preexistentes

- [`knowledge/00_CANON/ESTADO_ACTUAL.md`](../00_CANON/ESTADO_ACTUAL.md): snapshot fechado en agosto; verificar frente a HEAD actual.
- [`documentacion/REGISTRO_CAPACIDADES_V41.md`](../../documentacion/REGISTRO_CAPACIDADES_V41.md): contratos y propietarios de cada capacidad.
- [`documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md`](../../documentacion/AUDITORIA_PILOTO_30_DIAS_V421.md): diagnóstico inicial del 13-sep; hay cambios posteriores.
- [`documentacion/V4_BRAND_DIRECTION.md`](../../documentacion/V4_BRAND_DIRECTION.md) y [`.agents/skills/el-errante-brand/SKILL.md`](../../.agents/skills/el-errante-brand/SKILL.md): canon V4, **EST. 2019**, pizzaiolo caminante, negro/marfil/oro.
- [`assets/images/brand-v4/manifest-v4.json`](../../assets/images/brand-v4/manifest-v4.json): activos aprobados, cuarentena y funciones de imagen.
- [`README.md`](../../README.md) y [`CHANGELOG.md`](../../CHANGELOG.md): historia y motores vigentes, no sustituyen observaciones de backend.
- [`tests/e2e/`](../../tests/e2e/), [`.github/workflows/`](../../.github/workflows/), [`backend/supabase/`](../../backend/supabase/): pruebas, publicación y schemas; se debe distinguir fuente SQL de migración aplicada.

## Estado vivo que debe volver a comprobarse

- **GitHub `main`**: el último SHA confirmado en esta auditoría es `a6edba45...` (13-sep en Colombia). PR #186–#189 permanecían abiertas y en stack al 12-oct.
- **Graphify**: `knowledge/graphify-live/graphify-out/GRAPH_REPORT.md` reporta `Built from commit: a6edba45` y coincide con esa base de `main`; si `main` cambia, volver a comprobar.
- **Supabase**: `el-errante-production` seguía **INACTIVE** al 12-oct. **No activar venta** ni prometer operación conectada hasta diagnosticar/revalidar.
- **Documentación de esta PR**: tests y CI pueden correr sobre su rama; **no** es una certificación productiva.

## Punto de arranque listo para Codex

```text
Lee AGENTS.md y knowledge/99_HANDOFF/INDICE_CODEX_2026-10-12.md.
Usa el dossier, inventario de fuentes, matriz visual y plan de beta
como contexto FECHADO. Contrasta contra main actual, PRs y Supabase.
No reconstruyas el proyecto, no regeneres todos los assets y no
modifiques producción sin aprobación y pruebas. Prioriza el camino
seguro a un pedido cero y 30 días de operación. Trabaja por PRs
pequeñas y reporta lo realmente verificado con SHAs concretos.
```

## Criterio de completitud documental

La información **es suficiente para recuperar continuidad de desarrollo**. Quedan fuera de GitHub, de manera deliberada, recetas/costos/MFO/comprobantes/datos privados y textos íntegros del workbook de prompts; existe un inventario que señala dónde están y qué autoridad tienen. Completar una fuente sensible requiere lectura autorizada y validación, nunca un copiado indiscriminado al repositorio público.

**Autoridad última:** estado real de código, pruebas, migraciones y sistemas productivos más decisiones comerciales humanas. Los documentos de handoff facilitan continuidad, **no certifican GO**.
