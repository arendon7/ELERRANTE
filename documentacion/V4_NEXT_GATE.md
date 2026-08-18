# V4 Next Gate

The structural V4 redesign is no longer in foundation/expansion mode. Home, commerce, product, editorial, utility, event, access and offline surfaces are already integrated on the V4 working branch.

## Current gate: final visual review and publication decision

1. Complete the final desktop + mobile review of the candidate as a coherent customer journey: Home → Store/Product → En Casa / En Movimiento → Checkout / Help.
2. Reject only concrete regressions: legacy identity reintroduced, broken hierarchy, duplicate imagery, mobile overflow, inaccessible navigation, misleading commercial state or avoidable legacy-image downloads where an approved V4 replacement exists.
3. Preserve explicit visual exceptions until a valid V4 master exists:
   - Aire y Tiempo may retain its approved legacy product photograph;
   - Crea la Tuya may retain its approved legacy product photograph;
   - quarantined generated assets `14`, `16`, `19` and `20` must not be promoted.
4. Keep `main` untouched while PR #144 remains draft.
5. Require the full CI set to be green after any further refinement: canonical audit, publication validation, historical costs V1.4, valued inventory V1.5, Graphify and Playwright desktop/mobile.
6. When the visual review is satisfactory and CI is green, the next action is an explicit publication/merge decision — not another structural redesign wave.

## Working principle

Do not add new imagery or new public architecture merely to keep iterating. From this gate onward, changes require a specific observed defect or a measurable UX/performance improvement.