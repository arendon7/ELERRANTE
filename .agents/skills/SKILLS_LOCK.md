# EL ERRANTE · Design Skills Lock

Updated: 2026-08-12

The V4 branch uses project-scoped Agent Skills following the open Agent Skills format.

## Project canon

| Skill | Source | Role |
|---|---|---|
| `el-errante-brand` | local | Binding brand, art direction, UX, copy and asset rules. |

## External skills selected for V4

| Skill | Upstream | Role | License / note |
|---|---|---|---|
| `frontend-app-builder` | `openai/plugins` | Current OpenAI frontend redesign workflow; concept → implementation → browser verification. | Upstream plugin skill; verify upstream license when refreshing. |
| `impeccable` | `pbakaus/impeccable` | Design-quality system: typography, color, spatial, motion, interaction, responsive and UX writing. | Apache-2.0. |
| `emil-design-eng` | `emilkowalski/skills` | Design engineering craft, UI polish and motion restraint. | See upstream repository license. |
| `find-animation-opportunities` | `emilkowalski/skills` | Read-only motion opportunity pass; rejects unnecessary animation. | See upstream repository license. |
| `design-taste-frontend` | `Leonxlnx/taste-skill` | Anti-template / anti-slop frontend direction, audit-first redesign, layout variance. | MIT. |
| `redesign-existing-projects` | `Leonxlnx/taste-skill` | Existing-project UI audit and targeted redesign without breaking functionality. | MIT. |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Final accessibility, performance and UX review gate. | See upstream repository license. |

## Why this set

El Errante currently uses vanilla HTML/CSS/JS. React/Next-specific skills are intentionally excluded from the V4 visual cycle because they would add irrelevant implementation context and could encourage unnecessary framework migration.

## Precedence

`el-errante-brand` > current culinary/editorial truth > accessibility/functionality > external craft skills.

## Refresh policy

Before a major visual release, compare these project copies/recipes with upstream. Do not silently upgrade a design skill in the same commit as production UI changes. Skill upgrades and visual implementation must remain independently reviewable.
