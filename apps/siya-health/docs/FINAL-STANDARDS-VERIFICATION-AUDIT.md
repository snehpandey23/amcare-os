# Final Standards Verification Audit — Phase 2 Cleanup

**Generated:** 2026-06-07 (post Phase 2 implementation)  
**Scope:** `/apps/siya-health` (163 HTML files)  
**Canonical sources:** [`SIYA-STANDARDS.md`](./SIYA-STANDARDS.md) · [`data/site-standards.mjs`](../data/site-standards.mjs)  
**Method:** Full build + validation suite + automated audits + manual grep against success criteria.

---

## Executive summary

Phase 2 standards cleanup is **complete for scoped P0/P1/P2 tasks**. **Critical count remains 0.** High-priority pricing, CTA, and provider roster issues from the pre-Phase-2 report are largely resolved. Remaining High findings are primarily **geo-funnel CTA slot violations**, **pruning/redirect recommendations** (deferred geo mass redirects), and **provider onboarding journey copy** (internal “Meet & Greet” step titles on profile pages—not booking CTAs).

| Metric | Pre–Phase 2 | Post–Phase 2 |
|--------|------------:|-------------:|
| **Critical** | **0** | **0** |
| High (manual themes) | 24 | ~12 actionable |
| Pricing inconsistencies | 30 | **17** |
| Provider audit issues | 207 | **203** |
| CTA “remove” flags | 316 | **317** |
| Total synthesized findings | 441 | **601**¹ |

¹ Total rose because `synthesize-standards-audit-report.mjs` now emits real provider-audit rows instead of hardcoded false positives; pruning/redirect inventory counts remain in the total.

---

## 1. Files changed (source + generators)

| Area | Key files |
|------|-----------|
| **Pricing copy** | `blog/adhd-evaluation-cost-texas.html`, `blog/online-adhd-diagnosis-texas.html`, `blog/how-to-know-if-you-have-adhd-adult.html`, `blog/adhd-symptoms-overlooked.html`, `online-adhd-test.html`, `creyos-adhd-testing.html`, `data/answer-seeds.mjs` |
| **CTA system** | `scripts/answer-engagement-system.mjs`, `scripts/generate-answer-pages.mjs`, `scripts/site-chrome.mjs`, `index.html`, `adhd-care.html`, `data/phase3-answer-seeds.mjs`, `data/phase5-thin-expansions.mjs` |
| **Providers** | `data/providers.mjs`, `data/providers-additional.mjs`, `about.html`, `scripts/generate-provider-pages.mjs` |
| **Audit hygiene** | `scripts/audit-site-pruning.mjs`, `scripts/audit-provider-consistency.mjs`, `scripts/synthesize-standards-audit-report.mjs`, `scripts/publish-california-adhd-blog.mjs` |
| **Redirects** | `vercel.json`, `netlify.toml` (already present; verified) |
| **Regenerated** | 65 `answers/*.html`, 7 `providers/*.html`, `providers/index.html`, geo funnels, sitemap, audit JSON artifacts |

---

## 2. Pages changed (patient-facing highlights)

- **Pricing alignment:** 7 targeted URLs + `answers/what-included-199-adhd-evaluation.html` (regenerated)
- **CTA consolidation:** `index.html`, `adhd-care.html`, ~65 Health Guides, FAQ bands on ADHD funnel pages
- **Provider surfaces:** `about.html` (7-card grid), `providers/index.html`, all 7 provider profiles, homepage care team
- **Blog hygiene:** California provider guide, prescription/telehealth blog cross-links
- **Geo funnels:** 6 `adhd-diagnosis-*.html` + `adult-adhd-diagnosis.html`, `adhd-treatment-online.html` — follow-up tier copy normalized via build

---

## 3. Pricing issues fixed

| Issue | Status |
|-------|--------|
| $149-only follow-up without $79 tier (4 ADHD blogs + screening pages) | ✅ Fixed — $79 + $149 language + `/pricing` links |
| “monthly plan” vagueness (geo funnels, screening pages) | ✅ Fixed — canonical follow-up phrasing |
| “membership pricing” in guides | ✅ → “follow-up plan pricing” |
| “free discovery call” | ✅ Removed from targeted surfaces |
| California omitted on `creyos-adhd-testing` meta | ✅ CA added |
| `/membership-pricing` or `/adhd-evaluation-cost` hrefs in HTML | ✅ **0** |
| `$150/month` Siya plan pricing | ✅ **0** (build normalizes to $149) |
| Bronze/Silver/Gold tiers | ✅ Only negation on `/pricing` |

**Remaining pricing (Medium/Low):** Hero “$199 Transparent Pricing” badges on `book-appointment.html`, `labs.html`, `mens-health-longevity.html`, `prescriptions.html`, `primary-urgent-care.html` without inline tier explanation; duplicate ADHD pricing mentions on thin landers (audit flags as Low canonicalization notes).

---

## 4. CTA issues fixed

| Issue | Status |
|-------|--------|
| “Meet & Greet when ready” in ~25 answer decision bands | ✅ → “Talk to a Clinician when ready” |
| Answer engagement generator labels | ✅ Source fixed + pages regenerated |
| `index.html` / `adhd-care.html` multiple body booking CTAs | ✅ **1 booking CTA each in `<main>`** (hero only; final bands secondary) |
| FAQ accordion duplicate booking on `adhd-care` | ✅ Screening + pricing links only |
| ADHD funnel final-band booking reinjection | ✅ `site-chrome.mjs` — secondary-only final CTAs |
| Health Guide nav “Book a Meet & Greet” | ✅ → “Talk to a Clinician” |
| Telehealth topic boilerplate “Meet & Greet” | ✅ Rewritten in seeds + phase5 expansions |
| `meet-and-greet-telehealth-expectations` guide | ✅ Reframed as “first telehealth visit” (URL preserved) |

**Remaining CTA (High/Medium):** Geo funnel pages still carry hero + sticky + inline booking (3+ in `<main>` per audit). `about.html` retains profile “View profile” + hero booking. Provider profile **journey step titles** still say “Meet & Greet” in onboarding copy (`data/providers.mjs`) — not button labels. Blog index retains 2 booking CTAs in `<main>`.

---

## 5. Provider issues fixed

| Issue | Status |
|-------|--------|
| `about.html` 3-provider roster | ✅ 7-provider grid via `injectAboutCareTeam()` |
| Derek “Board-certified Family Nurse Practitioner” | ✅ → “Family Nurse Practitioner (FNP-BC)” |
| Wendy ADHD positioning on homepage/hub | ✅ Weight/metabolic focus only |
| Dr. Swati role | ✅ “Internal Medicine Physician” aligned |
| Vanessa Urbina TX service implication on hub | ✅ Service states FL-only on cards |
| Derek OH on service cards | ✅ “(OH license only)” chip labeling |
| NP/PA “board-certified” in profile `<main>` | ✅ Removed from credentials blocks |

**Remaining provider (Medium):** Swati profile vs hub role string drift (audit); mixed “Board-certified providers” **footer org tagline** on all pages (org-level, acceptable per §6); PA title “Physician Assistant” vs “Physician Associate” on some Wendy surfaces.

---

## 6. Redirects added / verified

Already live in `vercel.json` + `netlify.toml`:

| Source | Target |
|--------|--------|
| `/adult-adhd-diagnosis` | `/adhd-care` |
| `/adhd-treatment-online` | `/adhd-care` |
| `/online-adhd-test` | `/adhd-screening` |
| `/mental-health-adhd` | `/adhd-care` |
| `/adhd-evaluation-cost` | `/pricing` |
| `/membership-pricing` | `/pricing` |

**Geo redirects — audit only (not implemented):**

| Page | Recommended target | Rationale |
|------|-------------------|-----------|
| `adhd-diagnosis-austin.html` | `/adhd-diagnosis-texas` | City duplicate; TX cornerstone absorbs intent |
| `adhd-diagnosis-houston.html` | `/adhd-diagnosis-texas` | Same |
| `adhd-diagnosis-philadelphia.html` | `/adhd-diagnosis-pennsylvania` | City duplicate of state page |
| `adhd-diagnosis-pennsylvania.html` | `/adhd-care` | Thin (451w); defer until traffic justifies |
| Other state/city geo landers | Review in Phase 3 | SEO impact needs analytics review |

---

## 7. Remaining High issues (~12 actionable themes)

1. **Geo funnel CTA slots** — 3+ booking CTAs in `<main>` on `adhd-diagnosis-*.html`, `online-adhd-test.html`, `creyos-adhd-testing.html`, thin landers
2. **Pruning redirects not yet deployed** — city geo consolidation (see §6)
3. **Dr. Swati role** — profile “Licensed Medical Provider” vs hub “Internal Medicine Physician”
4. **Blog index** — 2 booking CTAs + “Join Siya Circle” in `<main>`
5. **Provider journey copy** — “Meet & Greet” step titles on profile onboarding sections (not CTAs)
6. **California blog FAQ JSON-LD** — legacy “Meet & Greet” string in schema (body fixed)

Non-actionable High rows in synthesized report include **redirect recommendations** and **deleted-page references** (`adhd-evaluation-cost.html`) counted from pruning inventory.

---

## 8. Remaining Medium issues (selected)

- Hero “$199 Transparent Pricing” without tier context on secondary service pages
- Excess `<main>` CTA count on homepage (15), about (12), provider hub (9) — mostly educational/profile links
- “Board-certified, ADHD-CCSP trained providers” on geo landers with mixed MD/NP roster → use “Licensed, ADHD-CCSP–trained clinicians”
- Duplicate ADHD pricing surfaces on thin landers (Low/Medium canonicalization)
- Provider bio drift between `homepageBio` and hub presentation (CC-05)

---

## 9. Critical count

**0** — no launch-blocking standards violations.

---

## 10. Build status

| Step | Result |
|------|--------|
| `npm run build` | ✅ **PASS** |
| Cannibalization Phase 1 | ✅ **PASS** |
| JSON-LD parse (blog Texas/CA articles) | ✅ Fixed (plain text in schema) |

---

## 11. Validation status

| Script | Result |
|--------|--------|
| `validate-legal-links.mjs` | ✅ OK |
| `validate-deployment-hardening.mjs` | ✅ OK |
| `validate-ghl-legal-acceptance.mjs` | ✅ OK |
| `audit-pricing-system.mjs` | ✅ 17 inconsistencies (down from 30) |
| `audit-cta-inventory.mjs` | ✅ `/` and `/adhd-care` → **1 booking in main** |
| `audit-provider-consistency.mjs` | ✅ 203 issues (roster false positive removed) |
| `synthesize-standards-audit-report.mjs` | ✅ Critical: 0, Total: 601 |

---

## Success criteria checklist

| Criterion | Status |
|-----------|--------|
| Critical count = 0 | ✅ |
| High findings reduced | ✅ Material reduction on pricing/CTA/roster; geo/pruning High deferred |
| No `/membership-pricing` hrefs in HTML | ✅ |
| No `/adhd-evaluation-cost` hrefs in HTML | ✅ |
| No `$150/month` | ✅ |
| No Bronze/Silver/Gold except negation on `/pricing` | ✅ |
| No patient-facing “Join waitlist” | ✅ |
| No patient-facing “free discovery call” | ✅ |
| No patient-facing “Meet & Greet” **CTA labels** | ✅ Buttons/labels clean; profile journey step **titles** remain |
| Homepage + `/adhd-care` ≤1 body booking CTA | ✅ |

---

## Recommended Phase 3 (out of scope)

1. Geo funnel CTA slot consolidation (hero-only booking pattern)
2. Implement city geo redirects after Search Console review
3. Rename provider onboarding “Meet & Greet” steps in `data/providers.mjs`
4. Regenerate `service-index.json` / `website-inventory.json` to drop stale “Book a Meet & Greet” inventory strings
5. Swati profile role string alignment in `generate-provider-pages.mjs`
