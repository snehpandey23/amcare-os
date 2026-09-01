# OBESITY-2026-07-29-glp1-fiber-tips — background & sequence tests

**Queue topic:** Fiber on GLP-1 — practical tips (nausea / constipation support)  
**Spoke:** https://siya.health/blog/glp1-side-effects-and-how-to-manage-them  
**Status:** Visual test only — **do not ship** until background default is chosen

## Copy lock (same on all background variants)

| Field | Locked text |
|-------|-------------|
| H1 (≤6) | Fiber on GLP-1 |
| Plum (≤3) | Fiber |
| Sub (≤12) | Small steps for nausea and constipation |
| Checklist (L + scrim heroes) | 1. Hydrate first · 2. Add fiber slowly · 3. Pair with protein |
| Carousel slide 1 (macro blur) | H1 + sub + **CTA-ARROW-V1** *or* **CTA-NUM-BADGE-V1 ①** |

**Photo:** `photography/metabolic-health/editorial-emotional-eating.jpg` (warm table/food tone → blurred macro read)

## Background approaches — judge side-by-side

| File | Token |
|------|--------|
| `…-SCRIM-PANEL-L1.png` | Hard-seam L-layout |
| `…-SCRIM-CREAM-V1.png` | Full-bleed cream gradient scrim |
| `…-BG-MACRO-BLUR-CTA-ARROW.png` | **New test** — no overlay |
| `…-THREE-WAY-BG-COMPARISON.png` | All three labeled |

## Sequence CTA test (macro blur only)

| File | Token |
|------|--------|
| `…-BG-MACRO-BLUR-CTA-ARROW.png` | Bottom-right arrow (current) |
| `…-BG-MACRO-BLUR-NUM-BADGE-01.png` | Top-left ① |
| `…-SEQUENCE-CTA-COMPARISON.png` | Side-by-side |

## Compositors

```bash
python3 apps/siya-health/brand/scripts/compose_format_b_l.py
python3 apps/siya-health/brand/scripts/compose_format_b_fullbleed.py
python3 apps/siya-health/brand/scripts/compose_format_b_macro_blur.py   # BG-MACRO-BLUR
python3 apps/siya-health/brand/scripts/stitch_bg_comparison.py
```

## Rejected (do not combine into clinical posts)

- Dark heavy full-photo scrim (somber / ad-like)
- Torn-paper collage edges (personality/satire lane only)

## Decision log (fill after review)

- [ ] Default background: L / scrim / macro blur  
- [ ] Carousel index: arrow / num badge / neither  
