# Weight Loss Page — Founder Audit Sprint 4 Report

**Scope:** Trust data, audience recognition, provider intro, guides title, section deduplication, final CTA  
**Page:** `/weight-loss-metabolic-health`  
**Date:** June 2026

---

## 1. Trust data audit (P0)

| Source | Location | Before | After |
|--------|----------|--------|-------|
| `weight-loss-metabolic-health.html` | Hero trust chips (`.hero-trust-bar--chips`) | `5,000+ Weight Loss Patients` (static) | **Unchanged** — already non-zero |
| `weight-loss-metabolic-health.html` | Trust band | **Absent** — no animated metrics; risk of zero flash if added without fallbacks | **Added** `.trust-metrics-weight-rewrite` with static HTML fallbacks |
| `trust-metrics.js` | Scroll animation | Sets final values on load; resets to `0` only during in-view animation | **Unchanged** — same ADHD Sprint 3 fix pattern |
| `scripts/site-chrome.mjs` | Weight-loss injects | Meet-physicians lead only; no trust metric injection | **Updated** provider intro only; does not revert trust band |

### Trust band values (aligned with `adhd-care.html` pattern)

| Metric | `data-target` | Static fallback | Notes |
|--------|---------------|-----------------|-------|
| Weight management patients | `5000` | `5,000+` | Matches hero chip + sitewide weight-loss claim |
| Average rating | `4.7` | `4.7★` | Same as ADHD page |
| Verified reviews | `450` | `450+` | Same as ADHD page |
| Metabolic evaluations | `2500` | `2,500+` | Service-specific volume line (headline uses patients; third line uses evaluations) |

**Validation:** `trust-metrics.js` pre-renders final values before scroll animation — metrics never persist as `0 patients`, `0 reviews`, or `0 evaluations`.

---

## 2. Copy changes

### Who This Program Is For (`#who-this-is-for`)

| Before | After |
|--------|-------|
| Lead: “Adults seeking clinician-led support—not another generic diet plan.” | “If any of this sounds like you—you're not alone, and you're not failing.” |
| Provider-Guided Adults | **The weight comes back** — lost weight before; keeping it off is the hard part |
| Stuck After Diet & Exercise | **Food takes up too much mental space** |
| Open to Clinical Options | **You're working harder than everyone around you** |
| Cravings & Emotional Eating | **Something else may be involved** — sleep, stress, hormones, ADHD, metabolism |
| Long-Term Focus | **You want something sustainable** — not another crash diet |

### Provider intro (`#meet-physicians`)

| Element | Before | After |
|---------|--------|-------|
| H2 | Meet our care team | **Meet the clinicians behind your care** |
| Lead | Provider-led medical weight loss and metabolic care. | **Our team includes physicians and advanced practice providers with experience in obesity medicine, ADHD, primary care, metabolic health, and long-term behavior change.** |
| Provider cards | — | **Unchanged** |

### Cornerstone guides (`#cornerstone-metabolic`)

| Element | Before | After |
|---------|--------|-------|
| H2 | Cornerstone guides: metabolic health | **Learn More About Weight, Cravings & Metabolic Health** |
| Lead | Physician-led deep dives… | **Popular guides patients read before their first visit** — food noise, insulin resistance, sleep/metabolic risk |
| Article links | 3 cornerstone + 4 related guides | **Unchanged** |

### Final CTA

| Before | After |
|--------|-------|
| Start Your Care—Without the Wait | **Still wondering why nothing seems to work?** |
| Same-week consultations. Provider-guided programs. No obligation. | **Let's talk through it.** + No pressure. No obligation. Just a conversation about what may be getting in the way. |
| CTA link text + booking URL | **Unchanged** |

---

## 3. Sections removed / kept

| Section | ID | Decision | Rationale |
|---------|-----|----------|-----------|
| Our approach in practice | `#care-approach` | **Removed** | Documentation / safety / education cards duplicated How Care Works Steps 2–3, Program Overview pillars, and FAQ medication safety |
| Hero | — | Kept | Locked |
| Recognition | `#weight-recognition` | Kept | Locked |
| Why weight is complicated | `#why-weight-complicated` | Kept | Locked |
| How care works | `#how-care-works` | Kept | Locked |
| Program overview pillars | `#program-overview` | Kept | Audience subsection rewritten |
| FAQ | `#faq` | Kept | Functionality unchanged |
| Trust band | *(new)* | **Added** | P0 trust data fix |
| Cornerstone + learn-more | — | Kept | Title only |
| Providers | `#meet-physicians` | Kept | Intro only |
| Footer | — | Kept | Locked |

---

## 4. Compliance review

| Risk | Mitigation |
|------|------------|
| Outcome promises | Audience + CTA use recognition language; no guaranteed weight loss |
| Volume claims | 5,000+ / 2,500+ documented in trust audit; same discipline as ADHD trust band |
| Medication guarantees | No new medication-forward copy |
| Diagnosis language | Audience cards describe experiences, not diagnoses |
| Corporate eligibility tone | Removed “Provider-Guided Adults,” “Open to Clinical Options,” “Long-Term Focus” labels |

---

## 5. Mobile review

| Element | Mobile behavior |
|---------|-----------------|
| Trust band | Single-column rewrite layout (reuses `.trust-metrics-adhd-rewrite`) |
| Who this is for | `why-choose-grid` stacks to 1 column |
| Cornerstone guides | Existing `blog-grid` stack |
| Final CTA | `cta-band` full-width centered |
| Removed `#care-approach` | Shorter scroll to FAQ — less repetition on small screens |

Screenshots: `docs/weight-loss-sprint4-screenshots/after/`

---

## 6. Answer success test

**Can a patient explain what happens after signing up?**

**Yes.** After Sprint 4, the page still flows: recognition → complexity → **how care works (4 steps)** → program pillars → **who this sounds like (patient voice)** → FAQ → guides → clinicians → CTA. Removing `#care-approach` reduces repetition without losing the care path.

**Does the page feel like “these people understand me”?**

**Improved.** “Who This Program Is For” now mirrors recognition-section language instead of eligibility criteria.

---

## 7. Files modified

| File | Changes |
|------|---------|
| `weight-loss-metabolic-health.html` | Trust band, audience rewrite, removed `#care-approach`, guides title, provider intro, final CTA, `trust-metrics.js` |
| `scripts/site-chrome.mjs` | Weight-loss meet-physicians heading + lead; optional `heading` param on `buildMeetPhysiciansBlock` |
| `scripts/capture-weight-loss-sprint4-screenshots.mjs` | Screenshot utility |
| `docs/WEIGHT-LOSS-SPRINT4-REPORT.md` | This report |

**Not modified:** Hero structure, `#weight-recognition`, `#why-weight-complicated`, `#how-care-works`, pricing (none on page), FAQ functionality, booking URLs, footer, provider card bodies/taglines.

---

## 8. Screenshots

```
docs/weight-loss-sprint4-screenshots/before/   — Sprint 3 reference (care-approach, program-overview)
docs/weight-loss-sprint4-screenshots/after/    — Post-Sprint 4 captures
```

Re-capture:

```bash
npx serve -l 8877 .
node scripts/capture-weight-loss-sprint4-screenshots.mjs
```

---

## 9. Validation

```
npm run build — PASS
```

`site-chrome.mjs` preserves Sprint 4 provider intro on build; does not inject or remove trust band or middle-page copy.
