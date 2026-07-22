# Healthcare Brand Perception Audit — Siya Health

**Evaluated property:** https://siya.health (`apps/siya-health/`)  
**Date:** 2026-06-02  
**Method:** Content, visual system, governance, and UX signals from static site review (post-repositioning branch).

---

## Lens summaries (1–5 scale)

| Criterion | Patient | Physician | Healthcare executive | Google Quality Rater |
|-----------|---------|-----------|----------------------|----------------------|
| Professionalism | 4 | 4 | 4 | 3–4 |
| Trust | 3–4 | 4 | 3–4 | 3 |
| Expertise | 4 | 4 | 4 | 4 |
| Authority | 3–4 | 4 | 3 | 3–4 |
| Visual quality | 4 | 3–4 | 4 | 3–4 |
| Consistency | 3 | 3 | 3 | 3 |
| Credibility | 3–4 | 4 | 3–4 | 3–4 |

**Overall:** Strong **clinical positioning** and **transparent review governance** uplift trust vs typical DTC telehealth; **consistency** and **SEO surface area** are the main drags on premium brand perception.

---

## 1. Patient lens

**Feels trustworthy when:**

- Board-certified language, state licenses, HIPAA mentions are prominent.
- Meet & Greet framing lowers commitment anxiety.
- Health Guides explain one question at a time with pending/reviewed labels (honest).
- Provider profiles (especially Dr. Pandey) feel human and competent.

**Feels weak or risky when:**

- **Many similar geo pages** (Texas, Houston, Austin, etc.) feel repetitive — “Is this the same clinic or SEO?”
- **Energy & Fatigue** hub with one guide feels unfinished.
- **110 pending review** banners — honest but can read as “not doctor-approved yet.”
- Legacy pages (`primary-urgent-care`, `labs`) look like a **different brand era** (Merriweather font).
- Homepage **duplicate “Verified Patient Experiences”** — sloppy detail.

**Emotional brand:** Empathetic, anti-shame ADHD copy lands well. Metabolic repositioning on homepage is clearer than old ADHD-only framing.

---

## 2. Physician lens

**Positive:**

- ADHD-CCSP, Creyos, ASRS named — speaks clinical language.
- No false “Medically reviewed by Dr. X” on pending content (governance fix).
- Structured evaluation ($149, 60–90 min) sets appropriate expectations.
- Separation of screening vs evaluation in guides.

**Concerns:**

- **Volume of patient-facing medication SEO** (Adderall, Vyvanse, etc.) — medically fine if accurate, but density can feel **commercial**.
- Compounded GLP-1 content — regulatory sensitivity; needs strong disclaimers (present on many pages — maintain).
- Some **blog/answer duplication** — physician may worry about contradictory maintenance.

**Authority:** Medical Director profile is strong; other providers slightly thinner.

---

## 3. Healthcare executive lens

**Strategic brand:**

- Clear multi-state telehealth (CA, TX, FL, PA).
- Membership pricing page supports **DTC + subscription** narrative.
- Metabolic + ADHD + men’s health = credible whole-person positioning.

**Gaps:**

- **Inconsistent conversion taxonomy** (Meet & Greet vs Waitlist vs Screening) — ops/brand misalignment signal.
- Large **programmatic SEO footprint** without equal design polish — “growth vs brand” imbalance.
- Legacy service lines (urgent care naming on `primary-urgent-care`) vs current “virtual care” story.

**Would invest?** Product story is coherent; brand execution needs **consolidation pass** before enterprise partnership or employer pitch.

---

## 4. Google Quality Rater lens (E-E-A-T sketch)

| Signal | Observation | Impact |
|--------|-------------|--------|
| **Experience** | Patient quotes, screening tools | Positive |
| **Expertise** | Credentials, clinical tools named | Positive |
| **Authoritativeness** | Medical Director, org schema | Positive |
| **Trustworthiness** | Privacy/terms, pending review honesty, no fake bylines | Positive |
| **Main content quality** | Long blog/answers — generally substantive | Positive |
| **Supplementary** | Huge nav/blog index | Neutral |
| **Page design** | Modern homepage; legacy outliers | Mixed |
| **Ads / monetization feel** | Heavy CTAs, geo pages | Mild negative |

**Pages that may trigger “low quality” heuristics:**

- Thin or duplicate geo landings
- Very long blog index with repetitive cards
- Legal pages missing CA in footer (known low-priority gap)

---

## Pages that feel…

### Unfinished

| Page | Why |
|------|-----|
| `/answers` (Energy & Fatigue card) | 1 guide |
| `/blog` featured section | Comment says 3–4, shows 7 |
| `/labs`, `/prescriptions` | Legacy, thin vs core offer |
| `/privacy-policy`, `/terms` | Footer state copy gaps |

### Overly SEO-driven

| Page | Why |
|------|-----|
| `/adhd-diagnosis-texas`, `/adhd-diagnosis-houston`, `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`, `/adhd-diagnosis-pennsylvania`, `/adhd-diagnosis-philadelphia` | Template landings, inline styles |
| `/adult-adhd-diagnosis`, `/online-adhd-test`, `/adhd-treatment-online`, `/adhd-evaluation-cost` | Keyword-heavy titles, repeated blocks |
| `/creyos-adhd-testing` | SEO wrapper |
| Many `/blog/*medication*` articles | Comparison keywords |

### Visually weak

| Page | Why |
|------|-----|
| `primary-urgent-care.html` | Merriweather, older layout |
| `labs.html`, `prescriptions.html` | Same legacy stack |
| `book-appointment.html` | Off-pattern fonts |
| Long `/blog` index | Card fatigue, uneven grids |

### Inconsistent

| Area | Why |
|------|-----|
| 5 pages Merriweather vs Poppins/Inter | Typography |
| Header CTA varies by section | Screening vs Meet & Greet vs Waitlist |
| Card radius 10 vs 16 vs 20px | Design drift |
| Hero patterns `.hero` vs `.hero-merged` | CSS legacy |

### Low trust (relative to site average)

| Page | Why |
|------|-----|
| Any page with **only** pending review and thin content | Rare; most answers have substance |
| Geo pages if user landed from ad expecting local clinic | Telehealth clarification needed above fold |
| `membership-pricing` “Join the Waitlist” | Implies unavailable service |

---

## Top 20 pages most needing improvement

Ranked by combined impact on **trust, consistency, and conversion** (not SEO traffic alone).

| Rank | Page | Primary issues | Recommended focus |
|------|------|----------------|-------------------|
| 1 | `/blog` (`blog/index.html`) | 7 featured cards, 40+ scroll, orphan grids, inline styles | Layout + IA: 4 featured, paginate categories |
| 2 | `/answers` (`answers/index.html`) | 5-card imbalance, Energy thin category | Content + 2×2 hub layout |
| 3 | `/` (`index.html`) | Duplicate H2, long mobile scroll, 3 hero CTAs | Polish hero + testimonials |
| 4 | `/membership-pricing` | Waitlist CTA, 4-card 3-col orphan, hero no CTA | Align CTA system + grid |
| 5 | `/adhd-care` | Long SEO title, dense page | Simplify above-fold message |
| 6 | `/adhd-diagnosis-texas` | Template SEO, inline CSS | Merge into template v2 with design system |
| 7 | `/adhd-diagnosis-houston` | Same | Same |
| 8 | `/adult-adhd-diagnosis` | Same | Same |
| 9 | `/online-adhd-test` | Same | Same |
| 10 | `/adhd-treatment-online` | Same | Same |
| 11 | `/primary-urgent-care` | Legacy font/layout, off-brand | Redesign or redirect to `/telehealth` |
| 12 | `/labs` | Legacy | Integrate or noindex |
| 13 | `/prescriptions` | Legacy | Integrate or noindex |
| 14 | `/mens-health-longevity` | Merriweather, less polished than metabolic page | Unify with `weight-loss-metabolic-health` patterns |
| 15 | `/book-appointment` | Legacy booking UX | Single booking flow + Meet & Greet |
| 16 | `/providers/dr-sneh-pandey` | Long mobile hero; dual CTAs same URL | Tighten hero + distinct CTAs |
| 17 | `/about` | Strong content; minor CTA duplication | Align screening/meet&greet labels |
| 18 | `/weight-loss-metabolic-health` | Key revenue page — ensure parity with homepage quality | Visual pass + CTA consistency |
| 19 | `/telehealth` | Hub for primary care narrative | Cross-link repositioning story |
| 20 | `/answers/why-am-i-tired-even-after-sleeping` | Lone Energy guide — high scrutiny | Expand cluster or merge category |

**Honorable mention (batch):** Remaining geo pages (`adhd-diagnosis-austin`, `florida`, `pennsylvania`, `philadelphia`, `adhd-evaluation-cost`, `creyos-adhd-testing`) — treat as **one template fix** affecting rank 6–10 class.

---

## Brand strengths to protect

1. **Honest clinical review status** — competitive advantage vs fake “Medically reviewed.”
2. **Founder-led story** (Dr. Pandey) — authenticity.
3. **Meet & Greet** — low-pressure conversion aligned with healthcare norms.
4. **Unified `styles.css`** — fixable drift without replatforming.

---

## Recommended brand program (90 days)

| Phase | Actions |
|-------|---------|
| **30 days** | Fix top 5 pages (blog hub, answers hub, homepage, pricing, adhd-care); unify header CTA |
| **60 days** | Geo template v2 + retire Merriweather pages |
| **90 days** | Expand Energy guides; clinically review top 20 traffic URLs; photography pass on legacy pages |

---

## Scoring summary

| Dimension | Score (/10) | Note |
|-----------|-------------|------|
| Patient trust | 7.5 | Governance helps; SEO volume hurts |
| Clinical credibility | 8 | Strong credentials & tools |
| Visual brand | 7 | Premium homepage, legacy tail |
| Consistency | 6 | Typography + CTA + grids |
| Growth/brand balance | 6 | Blog/geo >> design attention |

**Net:** Ready for **continued content production** (per post-repositioning verification) **after** hub/layout consolidation on blog + Health Guides + pricing.
