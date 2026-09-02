---
name: find-skills
description: Helps discover and evaluate installable agent skills when a project needs a specialized capability. For El Errante, use this only after checking the project-scoped stack and avoid installing redundant or framework-mismatched skills.
---

# Find Skills · El Errante adaptation

Use this skill when the requested task may benefit from a specialized Agent Skill that is not already present in `.agents/skills/`.

## Workflow

1. Read `.agents/skills/SKILL_STACK_STATUS.md` and `.agents/skills/SKILLS_LOCK.md` first.
2. Identify the actual capability gap; do not search merely to add more skills.
3. Check `skills.sh` / the Skills CLI (`npx skills find <query>`) for candidates.
4. Verify each candidate before recommending or vendoring it:
   - relevance to the actual stack (El Errante is vanilla HTML/CSS/JS unless a migration is explicitly approved);
   - install count and adoption;
   - source reputation;
   - repository activity/stars where useful;
   - license and security audit signals;
   - tool prerequisites that are actually available;
   - overlap with existing project skills.
5. Prefer a small, complementary stack. Reject redundant, low-trust or unusable candidates.
6. Vendor/adapt selected skills project-locally under `.agents/skills/` and record source + review date in `UPSTREAM_SOURCES.md` and `SKILLS_LOCK.md`.
7. Keep skill changes independently reviewable from production UI changes.

## Useful CLI commands

```bash
npx skills find <query>
npx skills add <owner/repo@skill>
npx skills update
```

## El Errante precedence

`el-errante-brand` > culinary/editorial/product truth > accessibility/functionality > external skills.

Never let a newly discovered skill reintroduce legacy identity, invent product truth, force a framework migration, or weaken the existing release gates.

## Upstream

Adapted from `vercel-labs/skills` · `skills/find-skills/SKILL.md`, reviewed 2026-09-02.
