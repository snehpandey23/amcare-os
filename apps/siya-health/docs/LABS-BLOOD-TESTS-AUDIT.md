# Labs & Blood Tests — Audit & Repositioning Report

**Date:** 2026-07-20  
**Route preserved:** `/labs` (`labs.html`)  
**Public URL:** https://www.siya.health/labs

---

## 1. Audit findings (pre-edit)

| Item | Finding |
|------|---------|
| Existing page | `apps/siya-health/labs.html` |
| Route | `/labs` — keep (no redirect needed) |
| Inbound links | ~167 HTML files via footer “Diagnostic labs”; only 2 editorial body links |
| Header nav | Labs **absent** |
| Storefront | **None** (no Rupa/Quest URL) |
| Page quality | Thin (~171 words), `coming-soon-*` CSS, emoji cards, OG said “when services launch” |
| Design gap | Lagged vs rewritten service pages (`hero-merged`, process, FAQ) |
| Imaging claims | None (clean) |
| Conversion | Meet & Greet only; no browse-labs pathway |

---

## 2. Strategy applied

Repositioned `/labs` as **Labs & Blood Tests** — physician-guided testing with transparent direct-pay options via Rupa storefront — not a discount lab marketplace.

Journey framing: Symptoms → Knowledge → Consultation → Labs → Diagnosis → Treatment → Follow-up.

---

## 3. Changes made

| File | Why |
|------|-----|
| `labs.html` | Full hub rebuild: hero, categories, how-it-works, guidance, direct-pay, results, related links, FAQ, dual CTAs, schema |
| `data/providers-core.mjs` | Added `RUPA_LAB_STOREFRONT_URL` |
| `scripts/site-chrome.mjs` | Footer label → “Labs & blood tests”; `injectLabsNav()` (header + mobile “Labs”) |
| `scripts/siya-tracking.js` | `lab_storefront_click` for Rupa outbound |
| `scripts/apply-labs-hub-linking.mjs` | Contextual body links from services/guides/blogs |
| Service/content pages (via script) | Telehealth, men’s, women’s, primary care, weight, ADHD, midlife, fatigue, A1c, testosterone, iron blog |

---

## 4. Internal links added

| Source page | Anchor text | Destination | Clinical rationale |
|-------------|-------------|-------------|-------------------|
| `telehealth.html` | physician-guided lab options | `/labs` | Service card sold labs without a destination |
| `telehealth.html` | labs & blood tests | `/labs` | FAQ wording refresh |
| `mens-health-longevity.html` | Labs | `/labs` | Process step already mentioned labs |
| `womens-health.html` | labs | `/labs` | History/labs language |
| `primary-urgent-care.html` | lab testing options / Lab reviews | `/labs` | Thyroid & preventive cards |
| `package.json` | Build runs `apply-labs-hub-linking.mjs` before `seo-build` so regenerated answer pages keep links | — | Pipeline durability |
| `weight-loss-metabolic-health.html` | weight loss & metabolic lab options | `/labs` | Baseline metabolic testing |
| `adhd-care.html` | Labs & Blood Tests | `/labs` | Differential only; ADHD not diagnosed by blood test |
| `womens-midlife-health.html` | women’s health–related lab options | `/labs` | Midlife symptom → appropriate testing |
| `answers/why-normal-labs-dont-mean-healthy.html` | physician-guided labs & blood tests | `/labs` | Natural hub for “normal labs” guide |
| `answers/normal-a1c-insulin-resistance.html` | View A1c and metabolic lab options | `/labs` | Metabolic marker education |
| `blog/why-am-i-always-tired-…` | fatigue-related lab options | `/labs` | Fatigue differential |
| `blog/perimenopause-brain-fog.html` | explore lab testing options | `/labs` | Careful midlife wording |
| `answers/what-does-low-testosterone-feel-like.html` | men’s health lab options | `/labs` | Hormone context, not self-diagnosis |
| `blog/iron-deficiency-brain-fog-adhd.html` | labs & blood tests | `/labs` | Existing link label refresh |

---

## 5. Navigation changes

| Surface | Change |
|---------|--------|
| Desktop header | Added **Labs** before Blog |
| Mobile menu | Added **Labs** before Blog |
| Footer Care & Services | Label **Labs & blood tests** (was Diagnostic labs) |
| Storefront | Not in nav — only via `/labs` CTAs |

---

## 6. Analytics

`lab_storefront_click` **implemented** in `scripts/siya-tracking.js` when:

- `href` contains `labs.rupahealth.com`, or
- `data-siya-track="lab_storefront_click"`

Params include existing base params + `destination_url` (origin path only). No test names or PHI.

---

## 7. Medical review flags

Quote for physician review:

1. “Blood tests do not diagnose ADHD.” / selected labs for other contributors to similar symptoms.
2. “A single hormone panel generally does not diagnose perimenopause.”
3. “Testosterone results require clinical context.”
4. Thyroid/brain fog: do not assume thyroid disease is the cause.
5. Normal/abnormal result caveats (reference range ≠ diagnosis).
6. Ferritin/inflammation and B12 wording on hub FAQ.

---

## 8. Deployment checklist

- [x] Route `/labs` preserved (no redirect)
- [x] Page rebuilt + storefront CTAs
- [x] Nav + footer updated via chrome
- [x] Contextual links applied
- [x] `lab_storefront_click` wired
- [ ] Production deploy (`npx vercel --prod`)
- [ ] Manual: mobile CTA, keyboard FAQ, storefront opens in new tab
- [ ] Canonical still `https://siya.health/labs`
- [ ] Sitemap still lists `/labs`

---

## 9. Recommended follow-up pages — **BUILT 2026-07-20**

Generated via `scripts/generate-labs-pages.mjs` + `data/labs-pages.mjs`:

| URL | Page |
|-----|------|
| `/labs/fatigue-brain-fog` | Fatigue & Brain Fog Labs |
| `/labs/iron-ferritin` | Iron & Ferritin Testing |
| `/labs/thyroid` | Thyroid Testing |
| `/labs/a1c-blood-sugar` | A1c & Blood Sugar Testing |
| `/labs/womens-midlife` | Women's Midlife Lab Evaluation |
| `/labs/mens-health` | Men's Health Lab Evaluation |
| `/labs/vitamin-b12` | Vitamin B12 Testing |
| `/labs/preventive` | Preventive Primary Care Labs |
| `/labs/adhd-support` | Labs When Focus/Fatigue Overlap (ADHD disclaimer-first) |

Hub `/labs` includes “Explore labs by topic” + Learn more on category cards.

---

## 10. Storefront

https://labs.rupahealth.com/store/storefront_42daXx7  

Described as direct-pay laboratory storefront; fulfillment network details left to storefront copy (no invented Quest/draw claims in body).
