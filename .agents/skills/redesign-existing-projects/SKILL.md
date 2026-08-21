---
name: redesign-existing-projects
description: Use for El Errante redesign work on existing pages. Scan and diagnose the current UI first, preserve working functionality and useful information architecture, then apply targeted high-craft visual upgrades instead of rewriting blindly.
---

# Redesign Existing Projects · El Errante project install

## Sequence

### 1. Scan

Identify:

- existing page structure;
- CSS layers and token ownership;
- global header/footer dependencies;
- JS behaviors;
- product/checkout dependencies;
- tests covering the page;
- asset references.

### 2. Diagnose

Separate findings into:

- legacy identity debt;
- composition/hierarchy debt;
- typography debt;
- image-role debt;
- copy-density debt;
- accessibility debt;
- responsive debt;
- functional risk.

### 3. Preserve

Do not discard content or code merely because it is old. Preserve anything that still serves:

- culinary truth;
- conversion;
- navigation;
- accessibility;
- operational stability;
- deep editorial pages.

### 4. Upgrade

Change structure when the old structure causes the visual problem. Do not create a patch layer that fights the old system indefinitely.

For Home V4, a deliberate markup rewrite is acceptable because the information hierarchy is changing, but shared infrastructure should remain stable unless needed.

### 5. Verify

- desktop;
- mobile;
- keyboard;
- product links;
- En Casa route;
- event route;
- no internal module regression;
- Playwright tests.

## Upstream

Inspired by `Leonxlnx/taste-skill` → `redesign-existing-projects`. Project adaptation last reviewed 2026-08-12.
