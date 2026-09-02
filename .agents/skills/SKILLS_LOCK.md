# EL ERRANTE · Skills Lock

Updated: 2026-09-02

The project uses project-scoped Agent Skills following the open Agent Skills format.

## Project canon

| Skill | Source | Role |
|---|---|---|
| `el-errante-brand` | local | Binding brand, art direction, UX, copy and asset rules. |

## External skills selected

| Skill | Upstream | Role | Note |
|---|---|---|---|
| `frontend-app-builder` | `openai/plugins` | Existing-project frontend workflow: concept → implementation → browser verification. | Adapted project-locally. |
| `impeccable` | `pbakaus/impeccable` | Typography, color, spatial, motion, interaction, responsive and UX-writing craft. | Apache-2.0 upstream. |
| `emil-design-eng` | `emilkowalski/skills` | Design-engineering polish and restrained interaction craft. | Adapted project-locally. |
| `find-animation-opportunities` | `emilkowalski/skills` | Read-only motion opportunity pass; rejects unnecessary animation. | Adapted project-locally. |
| `design-taste-frontend` | `Leonxlnx/taste-skill` | Anti-template frontend direction and layout variance. | MIT upstream. |
| `redesign-existing-projects` | `Leonxlnx/taste-skill` | Audit-first targeted redesign without breaking functionality. | MIT upstream. |
| `high-end-visual-design` | project-vendored external skill | High-end visual composition review supporting V4 direction. | Supporting lens only. |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Accessibility, performance and UX review gate. | Supporting lens only. |
| `find-skills` | `vercel-labs/skills` | Governed discovery/evaluation of future skills. | Added 2026-09-02. |
| `web-quality-audit` | `addyosmani/web-quality-skills` | Evidence-led performance/accessibility/SEO/best-practices audit. | MIT upstream; added 2026-09-02. |
| `seo-aeo-best-practices` | `sanity-io/agent-toolkit` | Technical SEO, sitemap/robots, canonical, structured data, EEAT/AEO. | Added 2026-09-02. |

## Architecture fit

El Errante currently uses vanilla HTML/CSS/JS. React/Next-specific implementation skills remain excluded unless a framework migration is separately approved. A skill may contain framework examples while still being useful as a principles reference, but those examples must not drive migration.

## Precedence

`el-errante-brand` > current culinary/editorial/product/commercial truth > security/privacy > accessibility/functionality > external craft/growth skills.

## Selection policy

Before adding another external skill:

1. name the uncovered capability gap;
2. check the installed stack for overlap;
3. verify source reputation, adoption, license/security signals and required tooling;
4. reject candidates whose mandatory tools are unavailable;
5. reject framework-mismatched or duplicative skills unless they add a clear, bounded reference value;
6. record upstream source and review date.

## Refresh policy

Before a major release, compare project copies/adaptations with upstream. Do not silently upgrade a skill in the same change as production UI behavior. Skill upgrades and production implementation must remain independently reviewable.
