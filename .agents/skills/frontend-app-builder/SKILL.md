---
name: frontend-app-builder
description: Use for visually driven public frontend redesigns and high-craft page implementation. For El Errante, pair with el-errante-brand and use image-led concepting, faithful implementation and browser verification.
---

# Frontend App Builder · El Errante project install

Project-scoped adaptation of the current OpenAI frontend app-builder workflow.

## Required coordination

Before changing public UI, read `.agents/skills/el-errante-brand/SKILL.md`. Brand/product truth outranks generic design guidance.

## Workflow

1. **Establish the visual thesis.** Define mood, material and energy in one sentence.
2. **Define the content plan.** Give every section one job, one dominant visual and one takeaway/action.
3. **Define interaction thesis.** Select at most a few motion ideas that materially improve hierarchy or feel.
4. **Audit source assets.** Prefer approved, specific imagery over decorative filler.
5. **Build composition before components.** Treat the first viewport as an art-directed frame, not a component catalogue.
6. **Implement in the existing stack.** Preserve vanilla HTML/CSS/JS unless architecture migration is separately approved.
7. **Verify in browser.** Inspect desktop/mobile, typography, media crops, interaction, keyboard behavior and functional routes.
8. **Iterate until visual implementation matches the approved V4 direction.** Passing tests is necessary but not sufficient.

## El Errante defaults

- image-led hierarchy;
- sparse surface copy;
- cardless editorial composition where possible;
- one accent system;
- strong product imagery;
- restrained motion;
- responsive art direction;
- no placeholder logos or fake packaging.

## Do not

- add a framework only for styling;
- use generic 3D/glass/gradient decoration;
- create collages when distinct images should carry distinct narrative moments;
- make image generation part of the final asset unless the image passes V4 truth/audit rules;
- stop after desktop implementation.

## Upstream

Source workflow: `openai/plugins`, skill `frontend-app-builder`. Project adaptation last reviewed 2026-08-12.
