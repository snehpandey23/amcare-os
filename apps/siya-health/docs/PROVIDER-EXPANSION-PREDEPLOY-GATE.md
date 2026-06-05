# Provider Expansion Pre-Deploy Gate

Generated: 2026-06-05 (post-stabilization)

## Verdict

| | |
|--|--|
| **Safe to commit?** | **YES** |
| **Safe to deploy?** | **NO** (operational readiness — see below) |
| **Build** | PASS — 159 URLs, 0 broken links, 0 JSON-LD errors |

---

## Gate matrix

| # | Requirement | Status | Classification |
|---|-------------|--------|----------------|
| 1 | No placeholder/wrong-person headshots published as real photos | Placeholder gated | **PASS** |
| 2 | NPI/schema consistency | APP NPI emitted; MDs omit when null | **PASS** (gated) |
| 3 | Internal license records complete before `verified` | 6/7 incomplete; badges truthful | **PASS** (gated) |
| 4 | reviewedContent / reviewedBy with sign-off | 0 URLs; pending default | **PASS** |
| 5 | No misleading psychiatry positioning | Cleaned in data/schema/hub | **PASS** |
| 6 | Provider scope matches credentials | Swati de-psychiatrized | **PASS** |
| 7 | 0 broken links | 0 | **PASS** |
| 8 | 0 JSON-LD errors | 0 | **PASS** |
| 9 | ADHD model copy on flagship | Implemented | **PASS** |
| 10 | 7 provider profiles + hub | 7 + index | **PASS** |
| 11 | Approved headshots for all 7 | 3/7 | **DEFER** — pre-production polish |
| 12 | Full internal credential file | 1/7 verified | **DEFER** — compliance export |
| 13 | Clinical review sign-off artifacts | 0 | **DEFER** — Wave 1 re-enable |

---

## Deploy blockers (operational, not commit blockers)

1. Replace 4 pending headshots with approved assets
2. Complete internal NPI + license numbers for remaining clinicians
3. Re-enable reviewed content with `signOffSource` per URL
4. Compliance sign-off on credentialing export

---

## Files changed (stabilization sprint)

**Data:** `internal-provider-records.mjs`, `providers.mjs`, `providers-core.mjs`, `content-review-registry.mjs`, `provider-reviewed-content.mjs`

**Scripts:** `generate-provider-pages.mjs`, `site-chrome.mjs`, `rebuild-entity-graph.mjs`

**Pages:** `adhd-care.html`, `index.html`, `styles.css`

**Regenerated:** `providers/*`, `entity-graph.json`, `provider-index.json`, `llms.txt`, sitemap, answers/blogs clinical review blocks
