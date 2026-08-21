# Skill installation notes

Project-scoped skill directory: `.agents/skills/`.

Preferred refresh commands from a local checkout:

```bash
npx skills@latest add https://github.com/openai/plugins --skill frontend-app-builder
npx impeccable skills install -y --providers=codex --scope=project
npx skills@latest add emilkowalski/skills --skill emil-design-eng
npx skills@latest add emilkowalski/skills --skill find-animation-opportunities
npx skills@latest add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend
npx skills@latest add https://github.com/Leonxlnx/taste-skill --skill redesign-existing-projects
npx skills@latest add vercel-labs/agent-skills --skill web-design-guidelines
```

After refreshing, preserve the local `el-errante-brand` skill and review upstream changes before committing them.

Do not install React/Next-specific skills unless the public stack is intentionally migrated in a separate architecture decision.
