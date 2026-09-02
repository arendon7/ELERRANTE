# El Errante · SEO/AEO Phase 1 V4

Updated: 2026-09-02

## Objective

Create a conservative technical-search baseline for the published V4 experience without inventing commercial, local-business or product facts and without exposing internal/transactional surfaces as acquisition destinations.

## Index policy

### Indexable public destinations

The following materialized pages receive absolute self-referencing canonicals and remain eligible for indexing:

- Home (`/`)
- Tienda
- En Casa
- En Movimiento
- Caso de evento
- Método
- Historia
- Juan David Ocampo
- Bitácora
- Recetas
- Herramientas
- Cobertura
- Ayuda
- Legal

These are the only destinations currently emitted by the public sitemap.

### Temporary noindex surfaces

The following surfaces receive `noindex,follow` in the materialized release:

- `checkout.html`
- `cuenta.html`
- `offline.html`
- `presentacion.html`
- `producto.html`
- `articulo.html`
- `receta.html`

The last three are query-driven templates. They are intentionally excluded until each product/article/recipe has a stable crawlable entity URL, an entity-specific title/description, a canonical policy and truthful structured data. This avoids indexing multiple generic templates under query parameters before the entity model is ready.

This is a temporary quality decision, not a decision to keep products or editorial detail out of search permanently.

## Structured data

Phase 1 adds only a truthful Home graph:

- `Organization`: El Errante, canonical URL and approved V4 logo.
- `WebSite`: canonical site URL, name, publisher relation and `es-CO` language.

Phase 1 deliberately does **not** declare:

- postal address;
- opening hours;
- telephone;
- aggregate rating or reviews;
- price range;
- offers/availability;
- Restaurant/LocalBusiness properties that are not governed by a confirmed current source.

## Phase 2: entity URLs

Before products/articles/recipes become indexable, choose and implement one stable URL strategy. Preferred direction for a static GitHub Pages deployment:

1. generate or materialize one crawlable static page per canonical entity slug;
2. keep current query-driven templates as application compatibility routes if needed;
3. point internal links and sitemap to the canonical static entity URLs;
4. add entity-specific metadata and structured data from governed sources;
5. redirect or canonicalize legacy query URLs only after parity is verified.

Examples of the desired conceptual shape:

- `/productos/harina-aire-y-tiempo.html`
- `/productos/la-errante.html`
- `/bitacora/<slug>.html`
- `/recetas/<slug>.html`

Exact paths are not frozen until the materialization implementation and compatibility impact are reviewed.

## Validation gates

The release must verify automatically that:

- every sitemap destination has the expected absolute canonical;
- sitemap contains no internal, transactional or generic entity-template URL;
- every temporary non-organic/template surface has `noindex,follow`;
- Home exposes the controlled JSON-LD graph;
- JSON-LD does not introduce unsupported address, hours, offer or price claims;
- the materialized site, not merely repository source, contains these tags.

## Principle

Search markup is a representation of current product truth. It must never become a second, less-governed source of facts.
