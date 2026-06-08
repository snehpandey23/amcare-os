# Phase 8 — ADHD CTR + Authority Sprint Report

**Date:** 2026-06-06  
**Scope:** Improve existing ADHD assets only (no new URLs, guides, geo pages, or service pages)  
**Baseline:** 139 indexable URLs · 0 broken links · 0 sitemap/canonical conflicts · 18 backlinks · 9 referring domains

---

## Executive summary

Phase 8 targets the authority and CTR bottleneck after technical SEO completion. Five high-impression ADHD medication/symptom blogs received SERP-focused title/meta/H1/FAQ updates. `/adhd-care` gained a medication decision cluster. `/blog/adhd` was reorganized into editorial sections. The homepage gained above-the-fold educational routing for ADHD visitors.

---

## Task 1 — ADHD CTR optimization

### Title changes

| Page | Old title | New title |
|------|-----------|-----------|
| `/blog/adhd-symptoms-overlooked` | Adult ADHD Symptoms That Are Often Overlooked \| Siya Health | 7 Adult ADHD Signs Doctors Miss (Not Just "Can't Focus") \| Siya Health |
| `/blog/non-stimulant-adhd-medications-explained` | Non-Stimulant ADHD Medications Explained (2026) — Options for Adults \| Siya Health | Non-Stimulant ADHD Meds: When Are They Used Instead of Stimulants? \| Siya Health |
| `/blog/vyvanse-vs-adderall-differences` | Vyvanse vs Adderall for ADHD in 2026: Differences Adults Should Know \| Siya Health | Vyvanse vs Adderall: Which Lasts Longer for Adult ADHD? \| Siya Health |
| `/blog/adhd-medication-options-for-adults` | ADHD Medication Options for Adults in 2026: Stimulants & Non-Stimulants \| Siya Health | ADHD Medication Options for Adults: Stimulant vs Non-Stimulant Guide \| Siya Health |
| `/blog/adhd-medication-daily-or-as-needed-adults` | Do You Need ADHD Medication Every Day? Daily vs As-Needed (Adults) \| Siya Health | Do You Need ADHD Medication Every Day? (Daily vs PRN for Adults) \| Siya Health |

### Per-page updates

Each blog received:
- Rewritten meta description (PAA-aligned, outcome-focused)
- Updated H1 and blog-lead paragraph for SERP click motivation
- New FAQ items targeting People Also Ask queries
- FAQPage JSON-LD extended for new questions
- BlogPosting schema headline/description sync

**Config:** `data/phase8-adhd-ctr.mjs`  
**Apply script:** `scripts/apply-phase8-adhd-ctr.mjs` (wired into build pipeline)

---

## Task 2 — ADHD authority internal linking

### Medication decision cluster on `/adhd-care`

New section `#medication-guides` inserted after pricing with decision-framed ordered list:

1. `/blog/adhd-medication-options-for-adults` — start with the landscape
2. `/blog/vyvanse-vs-adderall-differences` — compare stimulant classes
3. `/blog/adderall-for-adhd-how-it-works` — understand Adderall mechanism
4. `/blog/non-stimulant-adhd-medications-explained` — when stimulants aren't the fit
5. `/blog/adhd-medication-daily-or-as-needed-adults` — daily vs as-needed dosing

Footer link to `/blog/adhd#medication` for hub discovery.

**Internal links added:** 6 (5 medication guides + 1 hub anchor)

---

## Task 3 — ADHD hub improvement

### `/blog/adhd` editorial sections

Restructured flat grid into five anchored sections:

| Section | Anchor | Strongest assets surfaced |
|---------|--------|---------------------------|
| Diagnosis | `#diagnosis` | how-to-know, is-online-legit, TX/CA diagnosis, screening vs eval |
| Symptoms | `#symptoms` | adhd-symptoms-overlooked, not-lazy, adult symptoms CA |
| Medication | `#medication` | options, vyvanse-vs-adderall, adderall-how-it-works, non-stimulant, daily-vs-prn, side effects, long-term safety |
| Telehealth | `#telehealth` | prescribed-online, CA telehealth, choose provider, treatment options |
| Cost & Access | `#cost-access` | TX eval cost, CA medication online, CA options, /adhd-care |

Jump nav added for section discovery. Duplicate vyvanse cards removed from old flat grid.

---

## Task 4 — Homepage routing

### `/` (index.html)

- **Hero:** Added `hero-edu-routing` line below CTAs — links to `/adhd-care`, `/adhd-screening`, `/blog/adhd#medication` without new booking CTAs
- **Symptoms card (Focus):** Added "Medication guides →" link
- **Pathway card (ADHD):** Replaced booking-first link with "ADHD evaluation & care" + added medication guides link

---

## Files changed

| File | Change |
|------|--------|
| `blog/adhd-symptoms-overlooked.html` | CTR + FAQ |
| `blog/non-stimulant-adhd-medications-explained.html` | CTR + FAQ |
| `blog/vyvanse-vs-adderall-differences.html` | CTR + FAQ |
| `blog/adhd-medication-options-for-adults.html` | CTR + FAQ |
| `blog/adhd-medication-daily-or-as-needed-adults.html` | CTR + FAQ |
| `adhd-care.html` | Medication decision cluster |
| `blog/adhd.html` | Editorial hub sections |
| `index.html` | Hero + card educational routing |
| `styles.css` | hero-edu-routing, medication cluster, hub section styles |
| `data/phase8-adhd-ctr.mjs` | CTR config (new) |
| `scripts/apply-phase8-adhd-ctr.mjs` | Apply script (new) |
| `package.json` | Build pipeline hook |
| `docs/PHASE-8-CTR-AUTHORITY-REPORT.md` | This report |

**Pages changed:** 8 HTML pages + 4 infrastructure files

---

## Expected CTR opportunities

| Page | GSC signal | CTR lever | Estimated uplift |
|------|------------|-----------|------------------|
| `adhd-symptoms-overlooked` | ~position 8, near-zero clicks | Numbered hook + "doctors miss" framing | +0.5–2% CTR (first clicks from page-1 visibility) |
| `vyvanse-vs-adderall-differences` | High impressions, 0 clicks | Direct comparison question in title | +0.3–1% CTR when position improves |
| `non-stimulant-adhd-medications-explained` | Medication cluster impressions | "When used instead" decision intent | +0.2–0.8% CTR |
| `adhd-medication-options-for-adults` | Broad head term impressions | "Where to start" + stimulant vs non-stimulant | +0.2–0.6% CTR |
| `adhd-medication-daily-or-as-needed-adults` | PRN/daily query overlap | Parenthetical "Daily vs PRN" in title | +0.2–0.5% CTR |

**Aggregate estimate:** 15–40 additional monthly clicks within 4–8 weeks if impressions hold, primarily from `adhd-symptoms-overlooked` at page 1.

---

## Expected ranking opportunities

| Mechanism | Target queries | Timeline |
|-----------|----------------|----------|
| FAQ/PAA alignment | "overlooked adhd symptoms", "procrastination adhd adult", "vyvanse vs adderall duration" | 2–6 weeks for FAQ rich-result eligibility |
| Internal link equity from `/adhd-care` + hub | Medication comparison cluster (vyvanse, adderall, non-stimulant) | 4–12 weeks for position gains (+1–3 positions) |
| Hub topical clustering | "adhd medication adults", "adhd diagnosis online" | Reinforces existing URLs; reduces cannibalization risk |
| Homepage routing | Branded + navigational ADHD paths | Improves engagement signals; indirect ranking support |

**Authority note:** With 9 referring domains, ranking gains depend on continued link acquisition. Phase 8 maximizes crawl path and relevance signals from existing equity.

---

## Validation

- Build pipeline includes `apply-phase8-adhd-ctr.mjs` (idempotent — skips duplicate FAQ inserts)
- Phase 7 gates (`phase7-validate`, link remediation) unchanged
- No new URLs, booking CTAs, or indexable page count change

---

## Next measurement (GSC)

Track weekly for 8 weeks:
1. CTR delta on 5 optimized URLs
2. Average position on medication comparison queries
3. Internal link clicks via GTM (if configured) on `#medication-guides` and hero edu routing
4. FAQ rich result impressions in Search Appearance report
