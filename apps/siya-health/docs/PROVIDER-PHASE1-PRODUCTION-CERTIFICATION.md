# Provider Phase 1 — Production Certification

**Deployed commit:** `0030dc3`  
**Production:** https://www.siya.health  
**Certified at:** 2026-06-05T06:35:00Z  
**Overall status:** **PASS**

---

## Deploy

| Item | Value |
|------|-------|
| Branch | `main` |
| Commit | `0030dc3c1bc9e1e94735b0ceca3459ee1f41f553` |
| Message | `fix(siya-health): clean provider trust signals and service links` |
| Scope | `apps/siya-health/` only (309 files) |
| Push | `3f4a543..0030dc3 main -> main` |
| Deploy | Vercel Git integration (auto from `main`) |

---

## Pre-deploy validation (local `npm run build`)

| Check | Result |
|-------|--------|
| Sitemap URLs | **154** |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| `California, California` in built HTML | **0** |
| `adhd.siya.health` in built HTML | **0** |
| Provider pages: one H1 each | **PASS** |
| About provider images: non-empty alt | **PASS** |
| Provider pages in sitemap | **3/3** |
| Service pages: “Meet our physicians” | **4/4** |

---

## Post-deploy: `npm run parity:cert`

| Criterion | Result |
|-----------|--------|
| Overall | **PASS** (0 failures) |
| Tier-1 guides HTTP 200 | PASS |
| Review / CTA band checks (sample) | PASS |
| Health Guides in navigation | PASS |
| California in state lists | PASS |

Report: `docs/PRODUCTION-PARITY-CERTIFICATION.md` (re-run post-deploy)

---

## Production URL verification (9 URLs)

Probed live `https://www.siya.health` with `Cache-Control: no-cache`.

| URL | HTTP | No dup CA | No adhd.siya.health | Legal → siya.health | Provider checks |
|-----|:----:|:---------:|:-------------------:|:---------------------:|-----------------|
| `/` | 200 | ✓ | ✓ | ✓ | Dr. Sneh profile link present |
| `/about` | 200 | ✓ | ✓ | ✓ | All 3 provider alts non-empty |
| `/providers/dr-sneh-pandey` | 200 | ✓ | ✓ | ✓ | H1: `Dr. Sneh Pandey, MD` |
| `/providers/dr-natasha-desai` | 200 | ✓ | ✓ | ✓ | H1: `Dr. Natasha Desai, MD` |
| `/providers/dr-swati-pandey` | 200 | ✓ | ✓ | ✓ | H1: `Dr. Swati Pandey, MD` |
| `/adhd-care` | 200 | ✓ | ✓ | ✓ | “Meet our physicians” module ✓ |
| `/telehealth` | 200 | ✓ | ✓ | ✓ | “Meet our physicians” module ✓ |
| `/weight-loss-metabolic-health` | 200 | ✓ | ✓ | ✓ | “Meet our physicians” module ✓ (Sneh only) |
| `/mens-health-longevity` | 200 | ✓ | ✓ | ✓ | “Meet our physicians” module ✓ (Sneh only) |

**Production spot-check failures:** none

---

## Provider H1 verification (production)

| Page | H1 |
|------|-----|
| `/providers/dr-sneh-pandey` | Dr. Sneh Pandey, MD |
| `/providers/dr-natasha-desai` | Dr. Natasha Desai, MD |
| `/providers/dr-swati-pandey` | Dr. Swati Pandey, MD |

Each page: exactly **one** `<h1>`.

---

## Provider module verification (production)

| Service page | Module | Physicians |
|--------------|:------:|------------|
| `/adhd-care` | ✓ | Sneh, Natasha, Swati (state-filtered) |
| `/telehealth` | ✓ | Sneh, Natasha, Swati (state-filtered) |
| `/weight-loss-metabolic-health` | ✓ | Sneh |
| `/mens-health-longevity` | ✓ | Sneh |

---

## Production sitemap

Live `https://www.siya.health/sitemap.xml`: **154** URLs

Provider profiles indexed:
- `https://siya.health/providers/dr-sneh-pandey`
- `https://siya.health/providers/dr-natasha-desai`
- `https://siya.health/providers/dr-swati-pandey`

---

## Remaining claims requiring source verification

Not removed in Phase 1; flagged for follow-up:

| Claim | Location |
|-------|----------|
| `5,000+ patients` (weight-loss programs) | `/providers/dr-sneh-pandey` |
| `5,000+ in medical weight loss` | `/` (Why Siya section) |
| `5,000+ Weight Loss Patients` (hero badge) | `/weight-loss-metabolic-health` |
| `5,000+ patients treated` (body) | `/weight-loss-metabolic-health` |
| `5,000+ Weight Loss Patients` (pricing card) | `/membership-pricing` |
| `(verified)` testimonial cites (6 total) | All 3 provider pages |
| `Verified experiences from real patients` | `/membership-pricing` |

Source comments in HTML: `<!-- TODO:VERIFY-SOURCE -->` on provider pages and homepage where edited.

---

## Related docs

- Implementation report: `docs/PROVIDER-PHASE1-TRUST-CLEANUP-REPORT.md`
- Build QA: `SEO-DEPLOYMENT-QA-REPORT.md`
- Parity cert: `docs/PRODUCTION-PARITY-CERTIFICATION.md`

---

## Certification summary

| Metric | Value |
|--------|------:|
| Commit | `0030dc3` |
| Sitemap count (production) | 154 |
| Broken link count (local build) | 0 |
| Schema error count (local build) | 0 |
| Provider H1 verification | PASS (3/3) |
| Provider module verification | PASS (4/4 service pages) |
| Production certification | **PASS** |
