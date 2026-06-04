# State Standardization Report

Generated: 2026-06-04T01:04:04.948Z

## Canonical standard

- **Bullet:** California • Texas • Florida • Pennsylvania
- **Prose:** California, Texas, Florida, and Pennsylvania
- **Footer:** Board-certified providers providing telehealth care across California, Texas, Florida, and Pennsylvania.

## Implementation

- `data/site-standards.mjs` — single source of truth
- `scripts/site-chrome.mjs` — `normalizeSitewideCopy()` + footer brand replacement on every `seo-build` pass
- `scripts/generate-answer-pages.mjs` — answer footer template

## Post-build scan (144 pages)

| Check | Result |
|-------|--------|
| Pages with canonical 4-state footer line | 142 |
| Legacy 3-state / wrong-order footer | **0** |

_None — all footers standardized._

## Homepage note

`index.html` provider schema uses `areaServed` array; body copy should match **California, Texas, Florida, and Pennsylvania**.
