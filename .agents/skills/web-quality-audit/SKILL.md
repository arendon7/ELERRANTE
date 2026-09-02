---
name: web-quality-audit
description: Evidence-led web quality audit covering performance, accessibility, SEO, best practices and rendered interaction. Use for release reviews and targeted optimization of El Errante.
license: MIT
---

# Web Quality Audit · El Errante adaptation

Use this as a release/audit lens, not as authority over brand or product truth.

## Audit loop

1. Define representative journeys and states (desktop + mobile; public vs internal).
2. Collect the smallest available runtime baseline before making broad source assumptions.
3. Separate findings into:
   - measured/runtime evidence;
   - source-confirmed defects;
   - hypotheses requiring measurement.
4. Prioritize by user impact and confidence.
5. Fix the smallest causal surface.
6. Re-run equivalent checks and affected journeys.
7. Record what is verified and what remains unverified.

## Categories

### Performance
- LCP, INP and CLS when measurable;
- image sizing/compression/loading priority;
- render-blocking CSS/JS and avoidable legacy downloads;
- long tasks and unnecessary JavaScript;
- caching/static asset behavior where observable.

### Accessibility
- semantic landmarks and headings;
- keyboard access and focus visibility;
- labels/names/roles/states;
- contrast;
- reduced motion;
- touch target size;
- no animation acting as a content gate.

### SEO/AEO
- canonical URLs;
- metadata/Open Graph;
- crawlability and sitemap boundary;
- structured data truthfulness;
- indexability limited to public surfaces.

### Best practices
- HTTPS/no mixed content;
- clean console;
- no secrets or private data in public artifacts;
- no misleading controls or commercial states;
- dependency/tooling review proportionate to the static architecture.

## Severity

- **Critical:** security/privacy or complete functional failure.
- **High:** major accessibility barrier, hidden content, checkout/order failure or severe performance regression.
- **Medium:** SEO, performance or UX defect with meaningful impact.
- **Low:** polish/maintainability opportunity.

## El Errante release evidence

For a public V4 change, minimum evidence is:

- relevant canonical verifier(s);
- Playwright desktop + mobile regression;
- no horizontal overflow;
- keyboard/focus/reduced-motion review for touched UI;
- production/publication health on the promoted SHA;
- explicit confirmation that internal Operación/Finanzas/Inventario behavior was not changed as collateral damage.

## Upstream

Adapted from `addyosmani/web-quality-skills` · `skills/web-quality-audit/SKILL.md` v2.0, reviewed 2026-09-02.
