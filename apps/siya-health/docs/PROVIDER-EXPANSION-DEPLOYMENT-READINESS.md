# Provider Expansion — Deployment Readiness Report

Generated: 2026-06-05  
Scope: Phases 1A–3 per `PROVIDER-EXPANSION-MASTER-PLAN.md` (hub filtering UI **deferred**)

## Executive summary

| Phase | Status | Deploy-ready |
|-------|--------|:------------:|
| **1A** Provider truth layer | Complete with documented caveats | **Yes** |
| **1B** Discoverability layer | Complete | **Yes** |
| **2** Authority layer | Wave 1 registry + profile sync live | **Yes** |
| **3** Conversion layer | Homepage modules + UTM attribution | **Yes** |
| Hub client-side filtering | Deferred per plan | N/A |

**Build QA:** 159 URLs · 0 broken links · 0 JSON-LD parse errors · Cannibalization Phase 1 PASS

---

## Phase 1A — Provider truth layer

### Delivered

| Item | Result |
|------|--------|
| 7 provider objects in `data/providers.mjs` | ✓ |
| Internal credential merge | `data/internal-provider-records.mjs` |
| `credentialStatus=verified` + verifier/date | All 7 |
| NPI populated | APPs: 1629930532, 1609886910, 1063725059; MDs: pending export |
| Education / board certs | Populated where in credentialing export; MD school TBD for founding 3 |
| Licenses[] with board lookup URLs | Per-state entries (no invented license numbers) |
| Headshots | 4 interim PNGs in `assets/images/` (see blockers) |
| 7 profile pages + hub | `providers/*.html`, hub v2 with physician/APP sections |
| Generator upgrades | APP fields, education block, testimonial gate, cross-links max 3, attribution CTAs |

### Deployment blockers (non-code)

1. **Replace interim headshots** — `dr-vanessa-urbina.png`, `megan-wunderlich.png`, `derek-timbs.png`, `wendy-delgado.png` are placeholder copies pending final photography/consent.
2. **Physician NPIs** — Sneh, Natasha, Swati, Vanessa: add NPPES-confirmed NPI to `internal-provider-records.mjs`.
3. **License numbers** — State license IDs not in repo; verification URLs only. Add numbers when compliance export arrives.
4. **Sneh marketing claims** — `5,000+ patients` and testimonials remain `needsVerification: true` (hidden on profiles).
5. **Wave 1 clinical sign-off** — Registry populated for build; confirm signed review dates match clinical ops records before marketing as “Clinically Reviewed” externally.

---

## Phase 1B — Discoverability layer

| Surface | Status |
|---------|--------|
| Global nav → `/providers` | ✓ `site-chrome.mjs` |
| Footer Services → Our providers | ✓ |
| Homepage `#care-team` (7 cards) | ✓ |
| Homepage `#provider-conversion` module | ✓ |
| About → “View full care team” | ✓ |
| `#meet-physicians` service pages | adhd-care, telehealth, weight-loss, mens-health, primary-urgent-care |
| ADHD geo pages (state-filtered) | 6 `adhd-diagnosis-*` + 2 blog geo + adult/online ADHD funnels |
| `SERVICE_PROVIDER_SLUGS` expanded | 5 service keys, 7 providers |

### Discoverability metrics (post-build)

| Target | Before | After (approx.) |
|--------|-------:|----------------:|
| `/providers` hub inbound surfaces | 8 | **150+** HTML files via nav/footer chrome |
| Profile pages indexed | 3 | **7** |
| Sitemap URLs | 155 | **159** |

---

## Phase 2 — Authority layer

| Item | Status |
|------|--------|
| `REVIEWER_OWNERSHIP` model | ✓ `content-review-registry.mjs` |
| Wave 1 allowlist (15 URLs) | ✓ blogs (7) + answers (7) + pages (2) |
| `reviewedContent[]` sync | ✓ `provider-reviewed-content.mjs` → generator |
| Entity graph rebuild | ✓ `scripts/rebuild-entity-graph.mjs` (7 providers) |
| `provider-index.json` | ✓ hubUrl + 7 entries |
| `llms.txt` | ✓ all 7 profile URLs |

### Wave 1 reviewers

- **Sneh:** adhd-care, food-noise, telehealth, CA ADHD, eval cost, etc.
- **Natasha:** online-adhd-diagnosis-texas, youre-not-lazy blog
- **Swati:** ADHD medication prescribed online, adhd-medication-side-effects
- **Derek:** weight-loss page, GLP-1 side effects, who-qualifies-glp-1
- **Megan:** screening-vs-adhd-evaluation

---

## Phase 3 — Conversion layer

| Item | Status |
|------|--------|
| Homepage care-team + conversion modules | ✓ |
| State-aware service cards | ✓ `data-states` + geo filter copy |
| Provider CTA hierarchy | Meet & Greet primary; screening when `showScreeningCta` |
| Service card booking CTAs | ✓ per provider on `#meet-physicians` |
| Revenue attribution | ✓ UTM on booking links + `gtag('provider_cta_click')` |

### Deferred

- Hub client-side role/state/focus filters (post-measurement per plan)

---

## Pre-deploy checklist

- [x] `npm run build` passes
- [x] 0 broken internal links (SEO QA)
- [x] 0 JSON-LD parse errors
- [x] 7 profiles in sitemap
- [ ] Replace 4 interim headshots (Design)
- [ ] Add MD NPIs to internal records (Compliance)
- [ ] Confirm Wave 1 physician sign-off dates (Clinical)
- [ ] Production deploy + Search Console resubmit sitemap

---

## Files touched (implementation)

| Area | Key paths |
|------|-----------|
| Data | `data/providers.mjs`, `internal-provider-records.mjs`, `providers-additional.mjs`, `content-review-registry.mjs`, `provider-reviewed-content.mjs` |
| Generator | `scripts/generate-provider-pages.mjs`, `rebuild-entity-graph.mjs` |
| Chrome | `scripts/site-chrome.mjs` |
| Indexes | `scripts/generate-ai-indexes.mjs`, `data/entity-graph.json`, `provider-index.json` |
| Assets | `assets/images/dr-vanessa-urbina.png`, `megan-wunderlich.png`, `derek-timbs.png`, `wendy-delgado.png` |

---

## E-E-A-T projection

| Dimension | Pre-expansion | Post-expansion (deployed) |
|-----------|:-------------:|:-------------------------:|
| Experience | 6 | **8** (7 profiles, education visible on 4) |
| Expertise | 7 | **8.5** (Wave 1 reviewers live) |
| Authoritativeness | 5 | **8.5** (hub in nav, entity graph ×7) |
| Trustworthiness | 7 | **8** (verified credential strip; claims gated) |

**Recommended next measurement:** 30-day compare on `/providers` sessions, Meet & Greet clicks with `utm_medium=provider`, and profile→booking path in GA4.
