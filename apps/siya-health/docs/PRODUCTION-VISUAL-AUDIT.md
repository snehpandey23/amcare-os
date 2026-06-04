# Production visual audit — siya.health

**Site:** https://siya.health  
**Method:** Live Chromium (Playwright) on production URLs only — not repo HTML  
**Date:** 2026-06-04  
**Pages:** 47 (7 core + 20 blogs + 20 Health Guides)  
**Viewports:** Desktop 1440×900, Tablet 1024×768, iPhone 15 Pro 393×852  
**Screenshots:** `apps/siya-health/docs/visual-audit-screenshots/production-audit/{viewport}/{page-id}.png`

---

## Executive summary (patient trust lens)

A patient evaluating whether to trust Siya as a physician-led practice will notice **repeated “clinical review” strips** on high-traffic blogs (up to **14 per article**) before they notice font or spacing details. That pattern reads like unfinished editorial workflow, not rigorous medical oversight.

**Deploy blockers:** Two new Tier-1 Health Guides return **HTTP 404** in production (`poor-sleep-feels-like-adhd`, `brain-fog-after-eating`) while likely linked from internal content — a direct credibility break.

**Good news on production:** No Merriweather in rendered content (Inter/Poppins stack). No broken hero images on core pages. Homepage and service hubs show **single** `cta-band` and **zero** duplicate review blocks on core URLs at audit time.

| Severity | Issues (deduped) |
|----------|-----------------:|
| Critical | 2 |
| High | 36 |
| Medium | 13 |
| Low | 2 |

---

## Audit checklist (20 criteria)

| # | Criterion | Production result |
|---|-----------|-------------------|
| 1 | Duplicate review notices | **Fail** — 2× on cornerstone blogs + answers; **14×** on legacy ADHD/GLP-1 blogs |
| 2 | Duplicate CTA sections | **Pass** on core; cornerstone blogs have 1 `cta-band` + inline `cta-block` (acceptable) |
| 3 | Repeated images excessively | **Low** — shared telehealth/hero assets across service lines (see sitewide note) |
| 4 | Misaligned cards | **Pass** on sampled hubs (no grid offset detected in DOM) |
| 5 | Orphan cards (3+1) | **Pass** on `/answers` featured rows at audit time |
| 6 | Different hero heights | **Medium** — service heroes ~630–650px; blog/article heroes ~126–493px; hub uses tall content block |
| 7 | Different H1 spacing | **Low variance** — not blocking trust |
| 8 | Inconsistent button styling | **Medium** — “Schedule Meet & Greet” vs “Book a Meet & Greet” on same pages |
| 9 | Different footer versions | **Medium** — 3 footer text variants in sample |
| 10 | Different state lists | **Medium** — body copy “Texas, Florida, and Pennsylvania” on service pages; blog hub includes CA |
| 11 | TX/PA/FL without California | **Medium** on service page body; **Pass** on blog hub hero/footer |
| 12 | Legacy branding / copy | **Medium** — “Schedule Meet & Greet” still live on production |
| 13 | Empty image placeholders | **Pass** |
| 14 | Broken image links | **Pass** (0 broken on audited pages) |
| 15 | Missing alt text | **Low** — 3 images on home + ADHD care |
| 16 | Different typography systems | **Pass** — Merriweather not rendered (Times fallback in `<code>` only — false positive removed) |
| 17 | Merriweather vs Inter/Poppins | **Pass** |
| 18 | Mobile overlap issues | **Pass** on ADHD care sample (no fixed-layer stack) |
| 19 | Sticky CTA conflicts | **Pass** on sample |
| 20 | Chat widget overlap | **Not triggered** in headless run; verify with real device + chat loaded |

---

## Critical findings

| Severity | URL | Category | Selector | Detail | Screenshot | Recommended fix | Impact |
|----------|-----|----------|----------|--------|------------|-----------------|--------|
| Critical | https://siya.health/answers/poor-sleep-feels-like-adhd | Broken page | `document` | HTTP 404 — guide not deployed | `docs/visual-audit-screenshots/production-audit/1440/answers_poor-sleep-feels-like-adhd.png` | Deploy build containing seed + run `npm run build` | Patients hit dead end from internal links |
| Critical | https://siya.health/answers/brain-fog-after-eating | Broken page | `document` | HTTP 404 — guide not deployed | `docs/visual-audit-screenshots/production-audit/1440/answers_brain-fog-after-eating.png` | Same as above | Same |

---

## High — duplicate clinical review (`aside.clinical-review`)

| Severity | URL | Selector | Count | Screenshot | Fix | Impact |
|----------|-----|----------|------:|------------|-----|--------|
| High | https://siya.health/blog/adhd-symptoms-overlooked | `aside.clinical-review` | 14 | `.../1440/blog_adhd-symptoms-overlooked.png` | Run `npm run consistency:apply` + deploy | Reads as spammy disclaimers |
| High | https://siya.health/blog/online-adhd-diagnosis-texas | `aside.clinical-review` | 14 | `.../blog_online-adhd-diagnosis-texas.png` | Same | Same |
| High | https://siya.health/blog/online-adhd-diagnosis-california | `aside.clinical-review` | 14 | `.../blog_online-adhd-diagnosis-california.png` | Same | Same |
| High | https://siya.health/blog/glp1-side-effects-and-how-to-manage-them | `aside.clinical-review` | 14 | `.../blog_glp1-side-effects-and-how-to-manage-them.png` | Same | Same |
| High | https://siya.health/blog/semaglutide-for-weight-loss-how-it-works | `aside.clinical-review` | 14 | `.../blog_semaglutide-for-weight-loss-how-it-works.png` | Same | Same |
| High | https://siya.health/blog/how-to-know-if-you-have-adhd-adult | `aside.clinical-review` | 14 | `.../blog_how-to-know-if-you-have-adhd-adult.png` | Same | Same |
| High | https://siya.health/blog/is-online-adhd-diagnosis-legit | `aside.clinical-review` | 14 | `.../blog_is-online-adhd-diagnosis-legit.png` | Same | Same |
| High | https://siya.health/blog/medical-weight-loss-glp1-semaglutide-texas | `aside.clinical-review` | 14 | `.../blog_medical-weight-loss-glp1-semaglutide-texas.png` | Same | Same |
| High | https://siya.health/blog/compounded-vs-branded-glp1-medications | `aside.clinical-review` | 14 | `.../blog_compounded-vs-branded-glp1-medications.png` | Same | Same |
| High | https://siya.health/blog/tirzepatide-vs-semaglutide-which-is-better | `aside.clinical-review` | 14 | `.../blog_tirzepatide-vs-semaglutide-which-is-better.png` | Same | Same |
| High | https://siya.health/blog/adderall-for-adhd-how-it-works | `aside.clinical-review` | 14 | `.../blog_adderall-for-adhd-how-it-works.png` | Same | Same |
| High | https://siya.health/blog/vyvanse-vs-adderall-differences | `aside.clinical-review` | 14 | `.../blog_vyvanse-vs-adderall-differences.png` | Same | Same |
| High | https://siya.health/blog/medical-weight-loss-vs-dieting-what-actually-works | `aside.clinical-review` | 14 | `.../blog_medical-weight-loss-vs-dieting-what-actually-works.png` | Same | Same |
| High | https://siya.health/blog/phentermine-for-weight-loss-safety-and-effectiveness | `aside.clinical-review` | 14 | `.../blog_phentermine-for-weight-loss-safety-and-effectiveness.png` | Same | Same |
| High | https://siya.health/blog/adult-adhd-treatment-california-2026 | `aside.clinical-review` | 14 | `.../blog_adult-adhd-treatment-california-2026.png` | Same | Same |
| High | https://siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | `aside.clinical-review` | 2 | `.../blog_food-noise-and-glp-1-what-it-means-and-what-helps.png` | Strip-all-then-insert-one review | Cornerstone trust |
| High | https://siya.health/blog/insulin-resistance-and-weight-loss-clinician-overview | `aside.clinical-review` | 2 | `.../blog_insulin-resistance-and-weight-loss-clinician-overview.png` | Same | Same |
| High | https://siya.health/blog/why-am-i-always-tired-causes-when-to-see-doctor | `aside.clinical-review` | 2 | `.../blog_why-am-i-always-tired-causes-when-to-see-doctor.png` | Same | Same |
| High | https://siya.health/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign | `aside.clinical-review` | 2 | `.../blog_sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.png` | Same | Same |
| High | https://siya.health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know | `aside.clinical-review` | 2 | `.../blog_free-testosterone-vs-total-testosterone-what-patients-should-know.png` | Same | Same |
| High | https://siya.health/answers/signs-of-adult-adhd | `aside.clinical-review` | 2 | `.../answers_signs-of-adult-adhd.png` | `syncClinicalReviewAside()` on answers | Same |
| High | https://siya.health/answers/what-is-insulin-resistance | `aside.clinical-review` | 2 | `.../answers_what-is-insulin-resistance.png` | Same | Same |
| High | https://siya.health/answers/what-is-food-noise | `aside.clinical-review` | 2 | `.../answers_what-is-food-noise.png` | Same | Same |
| High | https://siya.health/answers/why-am-i-tired-even-after-sleeping | `aside.clinical-review` | 2 | `.../answers_why-am-i-tired-even-after-sleeping.png` | Same | Same |
| High | https://siya.health/answers/can-sleep-apnea-cause-fatigue | `aside.clinical-review` | 2 | `.../answers_can-sleep-apnea-cause-fatigue.png` | Same | Same |
| High | https://siya.health/answers/glp-1-side-effects | `aside.clinical-review` | 2 | `.../answers_glp-1-side-effects.png` | Same | Same |
| High | https://siya.health/answers/can-adhd-be-diagnosed-online | `aside.clinical-review` | 2 | `.../answers_can-adhd-be-diagnosed-online.png` | Same | Same |
| High | https://siya.health/answers/how-long-adhd-evaluation | `aside.clinical-review` | 2 | `.../answers_how-long-adhd-evaluation.png` | Same | Same |
| High | https://siya.health/answers/semaglutide-weight-loss-how-it-works | `aside.clinical-review` | 2 | `.../answers_semaglutide-weight-loss-how-it-works.png` | Same | Same |
| High | https://siya.health/answers/normal-a1c-insulin-resistance | `aside.clinical-review` | 2 | `.../answers_normal-a1c-insulin-resistance.png` | Same | Same |
| High | https://siya.health/answers/adhd-vs-burnout | `aside.clinical-review` | 2 | `.../answers_adhd-vs-burnout.png` | Same | Same |
| High | https://siya.health/answers/what-is-free-testosterone | `aside.clinical-review` | 2 | `.../answers_what-is-free-testosterone.png` | Same | Same |
| High | https://siya.health/answers/is-telehealth-legitimate | `aside.clinical-review` | 2 | `.../answers_is-telehealth-legitimate.png` | Same | Same |
| High | https://siya.health/answers/meet-and-greet-telehealth-expectations | `aside.clinical-review` | 2 | `.../answers_meet-and-greet-telehealth-expectations.png` | Same | Same |
| High | https://siya.health/answers/who-qualifies-glp-1-weight-loss | `aside.clinical-review` | 2 | `.../answers_who-qualifies-glp-1-weight-loss.png` | Same | Same |
| High | https://siya.health/answers/medical-weight-loss-vs-dieting | `aside.clinical-review` | 2 | `.../answers_medical-weight-loss-vs-dieting.png` | Same | Same |
| High | https://siya.health/answers/starting-adhd-medication-adults | `aside.clinical-review` | 2 | `.../answers_starting-adhd-medication-adults.png` | Same | Same |
| High | https://siya.health/answers/how-online-prescriptions-work | `aside.clinical-review` | 2 | `.../answers_how-online-prescriptions-work.png` | Same | Same |

---

## Medium — legacy CTAs, states, heroes, footer

| Severity | URL | Category | Selector | Detail | Screenshot | Fix | Impact |
|----------|-----|----------|----------|--------|------------|-----|--------|
| Medium | https://siya.health/adhd-care | Legacy CTA | `a.button`, `.cta-block a` | **2×** “Schedule Meet & Greet” visible; **0×** “Book a Meet & Greet” | `.../1440/adhd-care.png` | Deploy `normalizeSitewideCopy()` | Conversion + brand |
| Medium | https://siya.health/weight-loss-metabolic-health | Legacy CTA | `a.button` | “Schedule Meet & Greet” in CTAs | `.../1440/weight-loss.png` | Same | Same |
| Medium | https://siya.health/telehealth | Legacy CTA | `a.button` | “Schedule Meet & Greet” in CTAs | `.../1440/telehealth.png` | Same | Same |
| Medium | https://siya.health/adhd-care | State list | `.section p`, hero copy | Body lists **“Texas, Florida, and Pennsylvania”** without California | `.../iphone15pro/adhd-care.png` | Standardize to 4-state string everywhere | Licensing trust for CA patients |
| Medium | https://siya.health/blog/adhd-symptoms-overlooked | Legacy CTA | `div.cta-band a` | “Schedule Meet & Greet” in article CTA band | `.../blog_adhd-symptoms-overlooked.png` | `blog:consistency:apply` + deploy | Same |
| Medium | (sitewide) | Hero heights | `.hero`, `section.section`, `.blog-hero` | Range **126px–2931px** (hub page includes full index height) | `.../1440/home.png` vs `.../1440/health-guides-hub.png` | Set `min-height` tokens per template (service / article / hub) | Visual rhythm |
| Medium | (sitewide) | Footer versions | `footer.footer` | **3** distinct footer copy variants in audit sample | — | Single `seo-build` footer partial | Consistency |

---

## Low

| Severity | URL | Category | Selector | Detail | Screenshot | Fix | Impact |
|----------|-----|----------|----------|--------|------------|-----|--------|
| Low | https://siya.health/ | Missing alt | `img` | 3 decorative/content images without `alt` | `.../1440/home.png` | Add concise alts | A11y |
| Low | https://siya.health/adhd-care | Missing alt | `img` | 3 images without `alt` | `.../1440/adhd-care.png` | Same | A11y |

---

## Core pages — visual pass notes

| Page | Desktop screenshot | Tablet | Mobile | Notes |
|------|-------------------|--------|--------|-------|
| Homepage | `production-audit/1440/home.png` | `1024/home.png` | `iphone15pro/home.png` | Single review (0), 1 `cta-band`; trust strip present |
| ADHD Care | `.../adhd-care.png` | `...` | `...` | Legacy CTA + 3-state body copy |
| Weight Loss | `.../weight-loss.png` | `...` | `...` | Legacy CTA |
| Men's Health | `.../mens-health.png` | `...` | `...` | Cleanest service page in sample |
| Telehealth | `.../telehealth.png` | `...` | `...` | Legacy CTA |
| Health Guides Hub | `.../health-guides-hub.png` | `...` | `...` | Long hub hero; featured grids balanced |
| Blog Hub | `.../blog-hub.png` | `...` | `...` | **Includes California** in hero + footer |

---

## Pages audited

### Core (7)
- https://siya.health/
- https://siya.health/adhd-care
- https://siya.health/weight-loss-metabolic-health
- https://siya.health/mens-health-longevity
- https://siya.health/telehealth
- https://siya.health/answers
- https://siya.health/blog

### Top 20 blogs (cornerstone + state + medication intent proxy)
Listed in automated run output; full URLs in `scripts/production-visual-audit.mjs` (`TOP_BLOGS`).

### Top 20 Health Guides
Listed in `TOP_GUIDES` in same script.

---

## Re-run audit

```bash
cd apps/siya-health
npx playwright install chromium
node scripts/production-visual-audit.mjs
```

Post-deploy, re-check the two 404 guides and confirm `aside.clinical-review` count = **1** on `blog/adhd-symptoms-overlooked`.

---

## Methodology notes

- **Typography:** Initial run flagged browser default `Times New Roman` on unstyled nodes; manual verification on `h1–p` shows **no Merriweather** — excluded from final severity counts.
- **Traffic ranking:** Sitemap priority + cornerstone/medication clusters (no GA).
- **Chat widget:** LeadConnector may load after `networkidle`; validate on real iPhone with chat open.
