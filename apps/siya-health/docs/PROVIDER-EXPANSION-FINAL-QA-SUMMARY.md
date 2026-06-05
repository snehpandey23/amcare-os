# Provider Expansion — Final QA Summary

Generated: 2026-06-05  
Build: `npm run build` **PASS**

## Build results

| Metric | Result |
|--------|--------|
| Sitemap URLs | **159** |
| Broken internal links (SEO QA sample) | **0** |
| JSON-LD parse errors | **0** |
| Provider profile pages | **7** |
| `/providers` hub | **Generated** (`providers/index.html`) |
| Cannibalization Phase 1 | **PASS** |

## Stabilization gates

| Check | Result |
|-------|--------|
| `reviewedBy` JSON-LD emitted | **0** (rolled back until sign-off) |
| Credential badges truthful | **PASS** — 6 `active_internal`, 1 `verified` (Wendy) |
| Psychiatry practice positioning removed | **PASS** (marketing/schema layer) |
| ADHD model copy on `adhd-care.html` | **PASS** (DSM, ASRS, DIVA, Wender Utah, SWAN, Creyos) |
| Wrong-person headshots in HTML | **PASS** — 4 pending use placeholder SVG |
| Hub + homepage care team | **7 providers** |

## Credential backfill

See `CREDENTIAL-BACKFILL-CHECKLIST.md` — lowest completion: **Swati 29%**, highest: **Wendy 86%**.

## Authority / link equity

See `PROVIDER-AUTHORITY-EXPANSION-PLAN.md` — only **Sneh** meets ≥20 inbound links (26); six providers need link expansion before deploy polish.

## Operational blockers (deploy)

1. Four approved headshots (`photoStatus: pending` × 4)
2. Internal NPI + license numbers for 6 clinicians
3. Clinical review Wave 1 sign-off (`signOffSource` + `reviewerConsent`)
4. Link equity — 6 providers below 20 inbound internal links
5. Compliance sign-off on credential backfill

## Safe to commit / deploy

| | |
|--|--|
| Commit | **YES** (stabilization + authority docs) |
| Deploy | **NO** |
