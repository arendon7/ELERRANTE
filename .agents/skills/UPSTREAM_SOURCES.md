# Upstream sources

Reviewed 2026-09-02.

- OpenAI Plugins: `openai/plugins`, `frontend-app-builder`.
- Impeccable: `pbakaus/impeccable`.
- Emil Kowalski Skills: `emilkowalski/skills`.
- Taste Skill: `Leonxlnx/taste-skill`.
- Vercel Agent Skills: `vercel-labs/agent-skills`, `web-design-guidelines`.
- Vercel Skills: `vercel-labs/skills`, `find-skills` (upstream `skills/find-skills/SKILL.md`, reviewed at SHA `a41bdd074bb587afd861332cf2f473f3154de4d7`).
- Sanity Agent Toolkit: `sanity-io/agent-toolkit`, `seo-aeo-best-practices` (upstream SKILL SHA `ade2bb51e5f99c0794cd017fb905467a49a1717f`).
- Addy Osmani Web Quality Skills: `addyosmani/web-quality-skills`, `web-quality-audit` v2.0 (upstream SKILL SHA `581ec7c5e8e05e6ac93d99d872906595581efc42`, MIT).

Project files are adaptations, not necessarily byte-for-byte vendored upstream copies.

## Reviewed but intentionally not installed · 2026-09-02

- `anthropics/skills@webapp-testing`: useful general testing workflow, but duplicates a mature repository-native JavaScript Playwright suite and introduces a Python-oriented workflow mismatch.
- `cloudflare/skills@web-perf`: strong performance skill, but its preferred/required Chrome DevTools MCP capability is not available in the current project execution path; do not install dormant tooling merely for completeness.
- `openai/skills@playwright`: not selected because the project already uses `@playwright/test` and current skills.sh security signals were weaker than available alternatives.
- `currents-dev/playwright-best-practices-skill`: credible candidate for a future dedicated test-maintenance cycle, but not installed now because testing is not the current capability gap.
