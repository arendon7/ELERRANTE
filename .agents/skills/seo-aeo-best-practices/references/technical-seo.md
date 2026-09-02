# Technical SEO reference

Adapted from `sanity-io/agent-toolkit` (reviewed 2026-09-02).

## Required checks

- Unique `<title>` and page-specific meta description.
- Correct Open Graph URL/title/description/image.
- `<link rel="canonical">` on indexable public pages.
- Valid `robots.txt` that permits the public experience and does not promote internal/admin surfaces.
- XML sitemap containing only canonical public URLs.
- HTTPS production URLs.
- Logical heading hierarchy and descriptive links.
- Mobile-friendly layout and touch targets.
- Explicit image dimensions; responsive/lazy media where appropriate.
- Performance evidence separated from assumptions.

## Core Web Vitals targets

Use current web.dev/Chrome guidance when measuring. Working quality targets:

- LCP < 2.5 s
- INP < 200 ms
- CLS < 0.1

Do not claim a ranking improvement from a lab score alone.

## El Errante indexing boundary

Public discovery may include brand, product, method, editorial, recipes, help and event pages. Do not include transactional/account/admin/internal operation/finance surfaces in the public sitemap merely because they are technically reachable on a static host.
