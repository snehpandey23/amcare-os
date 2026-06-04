# Site consistency — final report

Generated: 2026-06-04 (final QA pass)

## QA gate — all checks passed

| Check | Result |
|-------|--------|
| `npm run consistency:apply` | Pass (0 additional dedupe needed post-build) |
| `npm run build` | Pass |
| Sitemap URLs | **147** |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |

### Review-status consistency

| Surface | Expected | Actual |
|---------|----------|--------|
| Blog articles (excl. category hubs) | 1 block each | **58/58** OK |
| Health Guide answer pages | 1 block each | **57/57** OK |
| `/answers` hub | 0 | **0** |
| Blog index/category hubs | 0 | **5/5** OK |

### Copy consistency (HTML scan)

| Pattern | Count |
|---------|------:|
| Schedule Meet & Greet | 0 |
| Explore care options | 0 |
| Clinical Review Status | 0 |
| Review needed | 0 |
| User-facing Answers hub nav | 0 |

Approved labels: **Health Guides**, **Book a Meet & Greet**, **Explore Care Options**, **Pending physician review**.

### Health Guides hub

| Category | Featured cards | Placeholders | View all |
|----------|---------------:|-------------:|----------|
| Metabolic Health | 3 | 0 | Yes |
| Energy & Fatigue | 3 | 0 | No (all guides featured) |
| Hormone Health | 3 | 0 | Yes |
| ADHD & Focus | 3 | 0 | Yes |
| Telehealth & Care | 3 | 0 | Yes |

Total featured cards on hub: **15** (3 × 5 categories).

### Screenshot QA

Regenerated via `npm run consistency:screenshots` → `docs/visual-audit-screenshots/consistency/`.

| Viewport | answers-hub | Cornerstones (5) |
|----------|------------|------------------|
| 1440px | 0 review blocks | 1 each |
| iPhone 15 Pro | 0 review blocks | 1 each |

Mid-article CTAs on cornerstones: 1 each. Hub layout balanced on mobile (3-column grid → single column).

## Commit

- **Branch:** `seo-repositioning-metabolic-foundation`
- **Message:** `fix: clean review status duplication and redesign health guides hub`

## Remaining backlog (not blocking)

- ~55 legacy ADHD/medication blogs without `related-health-guides` section (see `BLOG-CONSISTENCY-REPORT.md`).
- Optional: dedupe duplicate `cta-band` on some ADHD templates in a follow-up.
