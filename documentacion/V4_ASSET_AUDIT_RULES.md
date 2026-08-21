# EL ERRANTE · V4 Asset Audit Rules

This document defines the promotion process for visual assets entering the V4 public website.

## Status classes

### PUBLICABLE

Use directly when the asset:

- matches the V4 visual direction;
- has no malformed logo/text/packaging;
- does not invent product truth;
- is technically suitable for its slot;
- has a clear primary narrative role;
- is not a duplicate of another canonical asset.

### CANDIDATE

Keep for review when the image is strong but still requires one or more of:

- crop;
- tonal correction;
- label replacement with the real master;
- background cleanup;
- truth check;
- better slot assignment;
- higher-resolution source.

### REFERENCE

Use only as art direction when:

- composition/light/mood are useful;
- product or packaging is not exact;
- generated typography or logo is wrong;
- the scene is concept visualization rather than documentary photography.

### REJECTED

Do not publish when it contains:

- wrong or distorted master logo;
- `EST. 2024` or any year other than `EST. 2019` in V4 identity;
- legacy E mark presented as canonical;
- fake/incorrect label, volume or ingredients;
- malformed hands, tools, food or packaging;
- implausible pizza structure;
- excessive gold/yellow cast;
- generic rustic-Italian styling that contradicts V4;
- low resolution for its intended slot;
- duplicate framing with no new narrative value.

## Canonical role taxonomy

Every promoted asset receives one primary role:

- `brand-hero`
- `brand-emblem-context`
- `product-hero`
- `product-detail`
- `matter`
- `process-dough`
- `process-fire`
- `ritual`
- `en-casa`
- `movement-event`
- `movement-service`
- `pantry-product`
- `author`
- `editorial-research`
- `social-og`

Secondary roles may be recorded, but the UI should avoid using the same asset as the dominant image for multiple major sections.

## Required metadata

For each promoted image record:

- canonical filename;
- source/provenance;
- status;
- primary role;
- related product if any;
- width/height;
- aspect ratio;
- file size;
- SHA-256;
- truth note;
- V4 visual note;
- approved/rejected reason.

## Web derivatives

Keep source master outside destructive conversion. Web delivery should generate/select appropriately sized WebP/AVIF derivatives where supported and keep explicit width/height in markup to reduce layout shift.

## Product truth

An editorial/generated image communicates atmosphere and intent. It does not establish formula, grammage, supplier, nutritional properties, cooking parameters, pack size or batch state. Operational masters and current labels remain authoritative.

## Promotion gate

An asset may enter the canonical V4 manifest only after passing:

1. identity check;
2. product-truth check;
3. technical-quality check;
4. duplicate/perceptual-role check;
5. desktop crop check;
6. mobile crop check;
7. accessibility/alt-text intent check.
