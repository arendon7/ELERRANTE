# Structured data reference

Adapted from `sanity-io/agent-toolkit` (reviewed 2026-09-02).

Prefer JSON-LD. Useful schema types for El Errante may include `WebSite`, `Organization`, `Product`, `Article`, `BreadcrumbList` and `FAQPage`, but only when the page has the corresponding truthful content.

## Rules

- Never invent ratings, review counts, stock, prices, contact data, addresses, credentials or social profiles.
- Keep structured data consistent with visible and canonical content.
- Use absolute production URLs.
- Product offers must come from the same governed commercial source used by the page.
- Article/Bitácora authorship and dates must come from known editorial data.
- FAQ schema must reproduce actual questions/answers present on the page.
- Combine related schemas with `@graph` where that makes relationships clearer.

Validate significant releases with Schema.org Validator and, where the schema is eligible, Google Rich Results Test.
