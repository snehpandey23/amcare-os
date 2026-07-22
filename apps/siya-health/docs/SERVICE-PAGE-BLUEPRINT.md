# Siya Health — Service Page Blueprint

**Status:** Canonical template for every future service page  
**Reference standard:** Homepage (`index.html`) + ADHD Care (`adhd-care.html`)  
**Purpose:** Keep the site consistent as it grows. Fill in this blueprint—do not invent a new page design.

This document does not change the live site. It is the contract for Weight Loss, Men’s Health, Telehealth, Women’s Health, Hormone Health, Sleep, Preventive Care, Primary Care, and any new service line.

---

## Non-negotiables

- Do **not** redesign or invent a new design language.
- Do **not** change routing, SEO architecture, URLs, schema patterns, analytics, GTM, or conversion-tracking conventions without an explicit product decision.
- Preserve clinical accuracy: no invented outcomes, no guaranteed medication, no “labels first” framing.
- Preserve the established visual language: editorial photography, recognition-first copy, equal-height CTAs, short sections, consistent cards.
- One pricing presentation per page. No duplicate pricing strips/reminders.

**Canonical trust figures** (sitewide): see `data/homepage-trust-metrics.mjs` — do not invent new stats.

---

## Required section order

| # | Section | Required? | Notes |
|---|---------|-----------|--------|
| 1 | Hero | Yes | Recognition-first; warm editorial photo |
| 2 | Trust | Yes | Immediately after hero; photo + metrics |
| 3 | Recognition (“Does this sound like you?”) | Yes | 6 editorial cards |
| 4 | How it works (3 steps) | Yes | Homepage/ADHD `flow-cards` style |
| 5 | Service overview | Yes | What we do / who it’s for / how care works |
| 6 | Suggested reading | Yes | 6 article cards |
| 7 | Pricing | Yes | One shared component style |
| 8 | Physician perspective | Preferred | Concise; skip only if no authentic voice yet |
| 9 | FAQ | Preferred | Accordion; CTA at end |
| 10 | Meet care team | Yes | Via `SIYA:MEET-PHYSICIANS` chrome |
| 11 | Final CTA | Yes | Meet & Greet + Secure Chat (or page-appropriate pair) |

Optional mid-page modules (comparison, medication guides, clinical pathway detail) may appear **after** How it works and **before** Suggested reading—only when they add conversion or clinical clarity. Prefer fewer modules over density.

---

## 1. Hero

**Job:** Recognition first; service second. Warmth without a wall of text.

### Content
- **H1:** Patient experience (struggle / question), not “Online X Evaluation” as the emotional lead. Keep the clinical topic visible for SEO in the supporting paragraph and metadata.
- **Lead:** 1–2 sentences. Physician-led. What we help with. What we are not.
- **State line:** `California · Texas · Pennsylvania · Florida` (factual availability only—no expired promo offers).
- **CTAs (equal height / balanced width):**
  - **Primary:** Book Free Meet & Greet → `/redirect/meet-greet`
  - **Secondary:** Start Secure Medical Chat → `/redirect/chat`  
    *Exception:* ADHD Care may keep Screening + Meet & Greet as the established pair.

### Visual
- Full-bleed `hero-merged` with editorial photography (natural light, authentic adults, everyday environments).
- No inset hero cards, no floating badges on the image, no chip strip in the first viewport.
- Frosted/dark content panel only if the existing `hero-merged` pattern requires it—do not invent a new hero layout.

### Avoid
- Long bullet lists in the hero
- Trust chips competing with the headline
- Secondary CTAs like “View Pricing” or “Explore Care Options” in the hero (pricing lives in its own section)

---

## 2. Trust

**Job:** Social proof immediately after the hero—same visual language every time.

### Structure
- Section classes: `trust-metrics trust-metrics-adhd-rewrite trust-metrics-adhd-human` (+ `trust-metrics-human` / `data-no-countup` as needed).
- Grid: editorial photo | headline + metrics + quote + 2–3 short bullets.
- **Do not animate count-up** on photo+stats layouts (causes image flicker). Final numbers render immediately.

### Metrics
Pull from the shared trust source. Typical display:
- 2,200+ patients treated
- 4.8★ Google · 600+ verified reviews
- Service-specific line when real (e.g. 1,000+ ADHD evaluations)—never invent.

### Copy
- Headline may include a figure once; later “Why patients trust us…” sections should **not** repeat the big number in the H2 if cards already show it.

---

## 3. Recognition — “Does This Sound Like You?”

**Job:** Lived experience before clinical explanation.

### Structure
- H2: `Does This Sound Like You?`
- Lead: `Recognition and reassurance—not judgment.`
- Grid: 6 × `symptoms-card symptoms-card--editorial` with photo thumbnails.
- Hover: slight lift + scale + shadow (match ADHD Care). Keep transitions calm.

### Content rules
- Plain-language patient experiences (food noise, low energy, long waits)—not quiz language or executive-function jargon as the lead.
- One short supporting line per card.
- Optional short bullet band under the grid (not a dense paragraph).

### Photography
Same editorial set / grading as other service pages. Avoid stock “doctor with clipboard” and AI-looking clinicians.

---

## 4. How it works (3 steps)

**Job:** Clear next steps. Match Homepage / ADHD rhythm.

### Structure
- H2: `How to Get Started` (or service-equivalent, e.g. “ADHD Clarity in 3 Easy Steps”)
- Lead: one short sentence.
- `flow-cards` — **three** cards only.
- **No** supporting photograph beside the steps.
- **No** long uneven bullet columns under each step—one short description per step.

### Default step skeleton
1. Conversation / screening / tell us what’s going on  
2. Physician evaluation (virtual; tools when appropriate)  
3. Personalized plan + follow-up when appropriate  

Medication is never guaranteed. Screening is not diagnosis (when screening is step 1).

---

## 5. Service overview

**Job:** What we do, who it’s for, how physician-led care works—concise.

### Structure
- One section (or one tight pair: overview + “who it’s for”).
- Prefer short cards or a numbered journey list over essays.
- Clinical caveats stay, but trim methodology that doesn’t help the patient decide.

### Avoid
- Standalone psychology/psychiatry disclaimers as the lead unless legally required for that page.
- Redundant “model” sections that restate the three steps.

---

## 6. Suggested reading

**Job:** Educational depth without a random link dump.

### Structure
- Marker block for chrome: `SIYA:LEARN-MORE-{SERVICE}` (update the template in `scripts/site-chrome.mjs` when changing content).
- H2: `Suggested Reading` (or `Continue Learning`).
- 6 × `adhd-reading-card` / shared reading-card style with editorial thumbnails.
- Links only to relevant blogs/guides for **this** service.
- Footer microcopy may point to hub + pricing once.

### Avoid
- Duplicate “Related:” link-pass paragraphs before FAQ.
- Location promo dumps and expired campaign LPs.
- Plain `<ul class="learn-more-links">` as the primary presentation.

---

## 7. Pricing

**Job:** One clear pricing surface.

### Structure
- Prefer the shared pricing component used on service pages (strip or featured plan layout—match the current production pattern for that service line).
- Link to `/pricing` for full detail when needed.
- **Do not** also put “View Pricing” in hero + final CTA + mid-page bands.

### Copy
- Transparent, FSA/HSA when accurate, cancel/ongoing rules as already approved—no new invented fees.

---

## 8. Physician perspective

**Job:** Human trust. Short and warm.

### Structure
- Photo + quote + 2–3 short paragraphs (not a long letter).
- Themes: reduce self-blame; treat the condition like other medicine; structured + compassionate; care continues after the visit.
- Link to provider profile.

### When to defer
If there is no authentic clinician voice ready, ship without this section rather than filler. Add it in a follow-up.

---

## 9. FAQ

**Job:** Objections and logistics without a second landing page.

### Structure
- Accordion (`faq-accordion-*`).
- 4–6 questions max for most service pages.
- End CTA: Meet & Greet (+ Call Us on high-intent pages when useful).
- “Review pricing” must link to `/pricing`.

---

## 10. Meet care team

**Job:** Licensed clinicians for this service.

### Structure
- Use `SIYA:MEET-PHYSICIANS` and configure via `scripts/site-chrome.mjs` / provider data—do not hand-maintain permanently outside chrome.
- Compact cards; “View full care team →”.

---

## 11. Final CTA

**Job:** Same conversion structure every time.

### Default pair
- **Primary:** Book Free Meet & Greet → `/redirect/meet-greet`
- **Secondary:** Start Secure Medical Chat → `/redirect/chat`

### Exceptions
- ADHD Care: Screening + Meet & Greet (established funnel).
- Do not use “Explore follow-up pricing” or vague explore links as the secondary.

### Visual
- `cta-band` with equal visual weight buttons; identical spacing/hierarchy across service pages.

---

## Photography checklist

Use one editorial family across service pages:

| Do | Don’t |
|----|--------|
| Natural lighting | Harsh clinic stock |
| Authentic adults in everyday settings | Isolated clipboard doctors |
| Warm, calm expressions | AI-looking clinicians |
| Consistent color grading | Mixed filters per page |
| Service-fit scenes (desk, home, walk) | Unrelated ADHD assets on unrelated pages when better options exist |

Asset library: `assets/images/editorial-*.jpg` (+ approved service heroes). Prefer reuse over new one-off styles.

---

## Technical checklist (new page)

1. Create `{slug}.html` with body class `page-{service} page-service`.
2. Wire header/footer via site chrome; register nav only if product asks.
3. Add `SIYA:LEARN-MORE-*` template in `site-chrome.mjs` (Suggested Reading cards).
4. Register meet-physicians config for the service key.
5. Include `trust-metrics.js`; use `data-no-countup` / human trust classes for photo+stats blocks.
6. Use existing tracking attrs (`data-siya-track`, `data-cta-slot`, etc.)—do not invent new analytics systems.
7. Ensure build scripts (`apply-conversion-cleanup`, hub inbound injectors) do **not** re-inject retired patterns (duplicate pricing, CA promo hubs, “Related:” spam). Update those scripts when retiring a pattern.
8. QA desktop: hero CTAs equal, trust contrast, recognition hover, 3-step alignment, one pricing block, final CTA pair.
9. QA mobile separately after desktop approval.
10. Deploy from `apps/siya-health` with `npx vercel --prod --yes`.

---

## Copy principles (all sections)

- Recognition before labels.
- Physician-led, primary-care model language as already established.
- Short paragraphs; bullets over essays.
- Reinforce without redundant sections: *physician-led · evidence-based · clear next step*.
- Service-specific wording is encouraged; **layout and rhythm are not**.

---

## Reference implementations

| Page | Role |
|------|------|
| `index.html` | Homepage rhythm: recognition, 3-step, care paths, final CTA |
| `adhd-care.html` | Full commercial service blueprint (trust photo, editorial recognition, 3-step, pricing, MD message, Suggested Reading, final CTA) |
| Future: Weight Loss / Men’s / Telehealth | Must converge on this blueprint (see `SERVICE-PAGES-CONSISTENCY-AUDIT.md` when present) |

---

## Future services (fill-in list)

When adding a page, copy this checklist and fill content only:

- [ ] Hero H1 + lead + photo + CTA pair  
- [ ] Trust photo + shared metrics + quote  
- [ ] Six recognition cards (patient language)  
- [ ] Three how-it-works steps (one line each)  
- [ ] Service overview (concise)  
- [ ] Six Suggested Reading cards + chrome template  
- [ ] One pricing block  
- [ ] Physician perspective (or deferred)  
- [ ] FAQ (or deferred with reason)  
- [ ] Meet care team via chrome  
- [ ] Final CTA pair  

**If a section is missing, the page is not done**—unless explicitly deferred in the audit doc with a reason.
