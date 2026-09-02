# V4 Next Gate

Updated: 2026-09-02

The structural V4 public redesign has already been merged into `main` at baseline `a281a8ab52ac4968996ad5a6d0fbf6d0b7d57a04`. Home, commerce, product, editorial, utility, event, access and offline surfaces are no longer in a foundation/expansion phase.

## Current gate: post-publication hardening

### 1. Close known high-confidence regressions/features first

- PR #146 — harden V4 Home reveal visibility so animation can never become a content gate. Merge/release this first.
- PR #145 — connect governed public contact channels with admin configuration. Rebase/verify after #146, then merge/release.

Both must retain the full CI set and production health verification.

### 2. Reconcile project governance

- keep V4 status/checklists aligned with the state actually merged to `main`;
- maintain a clear distinction between integral app/runtime versions and public V4 experience;
- protect `main` with required checks at repository level;
- avoid direct-to-main production changes.

### 3. Establish technical SEO/AEO baseline

- `robots.txt` and sitemap boundary;
- canonical URLs;
- noindex policy for internal/transactional surfaces;
- truthful JSON-LD;
- public metadata coverage;
- parametrized product/article/recipe URL strategy.

### 4. Build a repeatable quality baseline

Review the coherent customer journeys on desktop + mobile:

Home → Store/Product → En Casa / En Movimiento → Checkout / Help.

Reject or prioritize concrete regressions: hidden content, legacy identity reintroduced, broken hierarchy, duplicate imagery, mobile overflow, inaccessible navigation, misleading commercial state, console errors, unnecessary legacy downloads or measurable performance degradation.

## Preserved visual exceptions

Until a valid approved V4 master exists:

- Aire y Tiempo may retain its approved legacy product photograph;
- Crea la Tuya may retain its approved legacy product photograph;
- quarantined generated assets `14`, `16`, `19` and `20` must not be promoted merely to increase V4 coverage.

## Working principle

Do not add new imagery or new public architecture merely to keep iterating. From this gate onward, a production change requires a specific observed defect, validated business need, security/compliance requirement or measurable UX/performance/SEO opportunity.

For the integrated roadmap and development loop, see `AUDITORIA_INTEGRAL_Y_PROCESO_DESARROLLO_2026-09-02.md`.
