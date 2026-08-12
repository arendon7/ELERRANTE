---
name: web-design-guidelines
description: Use as the final El Errante public UI review gate for accessibility, focus, forms, animation, typography, images, performance, navigation state, theming, touch behavior and locale-sensitive output.
---

# Web Design Guidelines · El Errante project install

Project-scoped adaptation of Vercel's Web Interface Guidelines review categories.

Run this after the page has a coherent design; do not use it as a substitute for art direction.

## Accessibility

- semantic landmarks/headings;
- meaningful control names;
- alt text according to image function;
- keyboard-complete custom interactions;
- no color-only meaning.

## Focus

- visible `:focus-visible`;
- no focus suppression without replacement;
- logical order.

## Forms

- associated labels;
- correct input types/autocomplete where applicable;
- clear validation and error text;
- submit state and feedback.

## Animation

- `prefers-reduced-motion` fallback;
- no essential information only in motion;
- prefer compositor-friendly transforms/opacity;
- avoid interaction delay.

## Typography

- readable line length and line height;
- correct punctuation/ellipsis;
- tabular numbers where numeric alignment matters;
- no tiny copy as a visual crutch.

## Images

- width/height or aspect-ratio to prevent layout shift;
- responsive sources where beneficial;
- lazy loading below the fold;
- hero priority handled intentionally;
- correct alt behavior.

## Performance

- avoid layout thrash;
- avoid unnecessary JS for simple visual effects;
- keep image payload proportional to viewport;
- do not preload non-critical assets indiscriminately.

## Navigation/state

- URLs remain deep-linkable;
- links are real links;
- active/current navigation is understandable;
- back/forward behavior remains predictable.

## Touch

- adequate hit areas;
- hover is never the only way to access information;
- horizontal interactions do not trap page scrolling.

## Locale

- Spanish copy and Colombian commercial formatting remain consistent;
- use locale-aware formatting for dynamic prices/dates when code controls them.

## Report

Rank failures as blocker / high / medium / polish. Fix blockers before visual micro-polish.

## Upstream

Inspired by `vercel-labs/agent-skills` → `web-design-guidelines`. Project adaptation last reviewed 2026-08-12.
