# Siya Health Visual Content Architecture Audit

**Date:** June 2026  
**Scope:** `apps/siya-health/` — homepage, service pages, Health Guides, blog, provider pages  
**Assets:** `assets/diagrams/*.svg` · **Styles:** `.siya-diagram` in `styles.css` · **Reference:** `visual-components.html` (noindex)

---

## Executive summary

Siya Health is text-heavy across 166+ HTML pages. Patients searching for *why they feel off* need visual scaffolding—symptom maps, process flowcharts, and comparison charts—to understand overlap (fatigue + ADHD + weight), trust physician-led evaluation, and choose a next step.

**Highest-impact visuals (deployed or ready):**

| Priority | Asset | Primary impact |
|----------|-------|----------------|
| P0 | Symptom Loop Diagram | Conversion + engagement (homepage) |
| P0 | ADHD Executive Function Map | Conversion (ADHD funnel) |
| P0 | Food Noise Diagram | SEO + engagement (weight cluster) |
| P1 | GLP-1 Patient Journey | Conversion (weight-loss hub) |
| P1 | Fatigue Root Cause Map | SEO (fatigue answers) |
| P1 | Insulin Resistance Visual | SEO (metabolic guides) |
| P2 | Testosterone Evaluation Flowchart | Conversion (men's health) |
| P2 | Weight Plateau Explainer | Engagement (retention content) |

---

## Reusable component library

### HTML pattern

```html
<figure class="siya-diagram siya-diagram--inline">
  <img src="assets/diagrams/{slug}.svg" width="640" height="400"
       alt="[Full descriptive alt text]" loading="lazy" />
  <figcaption>Clinical context + compliance caveat.</figcaption>
</figure>
```

### CSS modifiers

| Class | Use |
|-------|-----|
| `.siya-diagram` | Base bordered figure |
| `.siya-diagram--inline` | Max 640px centered (guides, blog) |
| `.siya-diagram--wide` | Full container width |
| `.siya-diagram--scroll` | Horizontal scroll on mobile (timelines) |

### Asset registry

| Component | File | Dimensions |
|-----------|------|------------|
| Symptom Loop | `symptom-loop.svg` | 640×400 |
| Food Noise | `food-noise.svg` | 640×360 |
| ADHD Executive Function | `adhd-executive-function.svg` | 640×420 |
| Testosterone Evaluation | `testosterone-evaluation.svg` | 640×400 |
| Fatigue Root Cause | `fatigue-root-cause.svg` | 640×380 |
| Insulin Resistance | `insulin-resistance.svg` | 640×340 |
| GLP-1 Journey | `glp1-journey.svg` | 720×200 |
| Weight Plateau | `weight-plateau.svg` | 640×360 |

---

## Page type audits

### 1. Homepage (`index.html`)

**Current state:** Symptom-centric messaging implemented; Symptom Loop embedded in §3.

| Visual | Placement | Purpose | Layout | Conversion goal | SEO benefit | Mobile |
|--------|-----------|---------|--------|-----------------|-------------|--------|
| **Symptom Loop** ✅ | `#why-patients` right column | Show symptom overlap | Radial loop, 6 nodes + center eval | Scroll → `#symptoms` or Meet & Greet | Image alt + figcaption keywords | Stacks below copy |
| **Mini decision tree** | Below `#symptoms` grid | "Not sure?" 3-click router | Vertical: Fatigue / Focus / Weight branches | Reduce bounce; path to guides | Internal link equity to `/answers/*` | Accordion taps |
| **3-step flowchart** ✅ | `#how-it-works` | Process clarity | Existing flow-cards (enhance with icons) | Meet & Greet | FAQ alignment | Already responsive |
| **Provider trust strip** | Below `#care-team` | Human faces = trust | Photo grid (existing) | Profile clicks → booking | E-E-A-T signals | 2-col grid |
| **Comparison chart** | `#membership` band | Cash vs membership vs future insurance | 3-column table (text + icons) | `/membership-pricing` | "transparent pricing" queries | Horizontal scroll table |

**Interactive (Phase 2):** Symptom tile hover states; optional non-PHI "What feels most true?" quiz routing to `#pathways`.

---

### 2. Service pages

#### `/adhd-care`

| Visual | Placement | Purpose | Layout | Conversion | SEO | Mobile |
|--------|-----------|---------|--------|------------|-----|--------|
| **ADHD Executive Function Map** | After hero, before `#symptoms` | Name domains patients recognize | Hub-spoke diagram | Screening → eval | "executive dysfunction adults" | Full-width scroll |
| **Decision tree** | After screening CTA | Screening → Eval → Plan branches | Vertical flowchart with "not guaranteed" nodes | `/adhd-screening` | Featured snippet potential | Tap-to-expand |
| **Timeline** | `#how-it-works` | 3-step eval timeline | Horizontal steps | Book eval | "how long ADHD evaluation" | `.siya-diagram--scroll` |
| **Comparison chart** | Near pricing | Screening vs evaluation vs treatment | 3-row table | `/adhd-evaluation-cost` | Cost queries | Stacked cards |

#### `/weight-loss-metabolic-health`

| Visual | Placement | Purpose | Layout | Conversion | SEO | Mobile |
|--------|-----------|---------|--------|------------|-----|--------|
| **Food Noise Diagram** | After hero lead | Define food noise clinically | Side-by-side comparison | Meet & Greet | "what is food noise" PAA | Inline figure |
| **GLP-1 Patient Journey** | Mid-page before CTA | Set expectations | Horizontal timeline | Reduce drop-off fear | GLP-1 process queries | Horizontal scroll |
| **Insulin Resistance Visual** | Metabolic section | Explain IR without jargon | Two-panel cell diagram | Link to answer guide | IR informational queries | Inline |
| **Weight Plateau Explainer** | FAQ area | Retention / realism | Line chart + callout box | Follow-up booking | Long-tail plateau searches | Inline |

#### `/mens-health-longevity`

| Visual | Placement | Purpose | Layout | Conversion | SEO | Mobile |
|--------|-----------|---------|--------|------------|-----|--------|
| **Testosterone Evaluation Flowchart** | After symptoms list | Evidence-based pathway | Top-down decision flow | Consult booking | "low testosterone evaluation" | Vertical flow |
| **Symptom map** | Hero adjunct | Low T symptom clusters | Body-region tag map (future SVG) | Self-recognition | Symptom long-tail | Simplified list fallback |
| **Comparison chart** | Labs section | Total T vs free T vs SHBG | 3-column explainer | Lab order compliance | Already have answer page | Table scroll |

#### `/telehealth` + `/primary-urgent-care`

| Visual | Placement | Purpose | Layout | Conversion | SEO | Mobile |
|--------|-----------|---------|--------|------------|-----|--------|
| **Care pathway flowchart** | Hero below fold | What telehealth visit covers | Icon flow: Book → Video → Plan | Meet & Greet | "how telehealth works" | Vertical steps |
| **Symptom Loop** (reuse) | Mid-page | Whole-person positioning | Same as homepage | Membership | Hub topical authority | Inline |
| **Timeline** | Membership cross-link | Visit frequency options | DPC-style cadence chart | `/membership-pricing` | Primary care telehealth | Scroll |

---

### 3. Health Guides (`/answers/*`)

**Pattern:** One hero diagram per guide + optional inline comparison.

| Guide slug | Recommended visual | Placement | Impact |
|------------|-------------------|-----------|--------|
| `what-is-food-noise` | Food Noise Diagram | After H1 | SEO P0 |
| `signs-of-adult-adhd` | ADHD Executive Function Map | §2 | Conversion P0 |
| `why-am-i-tired-even-after-sleeping` | Fatigue Root Cause Map | After intro | SEO P0 |
| `what-is-insulin-resistance` | Insulin Resistance Visual | Mid-article | SEO P1 |
| `what-does-low-testosterone-feel-like` | Testosterone Flowchart | Before CTA | Conversion P1 |
| `food-noise-returned-on-glp-1` | Food Noise + Plateau | Two figures | Engagement P1 |
| `adhd-vs-burnout` | Symptom Loop (subset) | Comparison section | Engagement P1 |
| `afternoon-energy-crash-after-lunch` | Fatigue map (metabolic node) | Mid-article | SEO P2 |

**UX standard for all guides:**
- Diagram within first 2 scroll depths
- `figcaption` with compliance line
- `loading="lazy"` except LCP candidate pages
- Link from diagram caption to Meet & Greet on high-intent guides only

---

### 4. Blog articles (`/blog/*`)

**Pattern:** One infographic per 1,200+ word clinical post; flowchart for process posts.

| Cluster | Top posts | Visual type | Placement |
|---------|-----------|-------------|-----------|
| ADHD | `how-to-know-if-you-have-adhd-adult`, `is-online-adhd-diagnosis-legit` | Executive Function Map + decision tree | After first H2 |
| Weight / GLP-1 | `food-noise-and-glp-1-*`, `semaglutide-for-weight-loss-*` | Food Noise + GLP-1 Journey | Hero media slot |
| Fatigue | `why-am-i-always-tired-*`, `sleep-apnea-fatigue-*` | Fatigue Root Cause Map | Mid-article |
| Men's health | `when-is-testosterone-therapy-appropriate` | Testosterone Flowchart | Before conclusion |
| Medication compare | `vyvanse-vs-adderall-*`, `tirzepatide-vs-semaglutide-*` | Comparison chart (new) | Dedicated H2 |

**SEO benefit:** Image search + Google Discover eligibility; reduced bounce via visual anchor; increased dwell time.

**Mobile:** Max diagram width 100%; use `--scroll` for timelines; min 44px tap targets on interactive legends (Phase 2).

---

### 5. Provider pages (`/providers/*`)

| Visual | Placement | Purpose | Layout | Conversion | SEO | Mobile |
|--------|-----------|---------|--------|------------|-----|--------|
| **Scope diagram** | Below credentials | What this provider evaluates | Icon list → symptom nodes | Book with named provider | Physician schema support | Compact list |
| **State availability map** | License section | TX service vs OH display only | Text chips (existing) + US map highlight (future) | Reduce wrong-state bookings | Geo trust | Chips wrap |
| **Patient journey mini-timeline** | Before CTA | First visit expectations | 3-step horizontal | GHL with provider attribution | — | Scroll |

**Do not:** Imply psychiatry scope; keep Derek Timbs TX-only service copy.

---

## Visual type playbook

### Infographics
- **Best for:** Food noise, insulin resistance, symptom overlap
- **Placement:** Health Guides §1–2, blog after intro
- **Compliance:** "Not a self-diagnosis tool" in figcaption

### Decision trees
- **Best for:** ADHD pathway, testosterone workup, "which guide fits me"
- **Placement:** Service pages pre-CTA, homepage Phase 2
- **Interactive:** CSS-only expand (no JS required) or `<details>` elements

### Flowcharts
- **Best for:** Evaluation process, GLP-1 journey, TRT pathway
- **Placement:** How-it-works sections
- **Conversion:** End node = Meet & Greet (not "get medication")

### Symptom maps
- **Best for:** Homepage, fatigue guides, men's health
- **Placement:** Hero adjunct or post-H1
- **SEO:** Alt text mirrors H2 keywords

### Comparison charts
- **Best for:** Hunger vs food noise, screening vs eval, GLP-1 brands
- **Placement:** Mid-article H2 "How X compares to Y"
- **Mobile:** `display: grid` → single column cards

### Timelines
- **Best for:** GLP-1 titration, ADHD eval steps, membership cadence
- **Placement:** Service pages, long blogs
- **Mobile:** `.siya-diagram--scroll`

### Medical illustrations
- **Best for:** Insulin/cell diagram, executive function brain regions (abstract, not anatomical claims)
- **Style:** Flat vector, brand colors `#1e3a8a` / `#0ea5a4`, no graphic gore
- **Accessibility:** Long descriptive `alt`

### Interactive elements (Phase 2–3)
- Symptom router quiz (no PHI stored)
- GLP-1 side-effect toggles
- ADHD screening result explainer (links to eval, not diagnosis)
- All require compliance review before launch

---

## Priority implementation matrix

### Tier 1 — Conversion (ship first)

1. Symptom Loop on homepage ✅
2. ADHD Executive Function on `/adhd-care` + `/answers/signs-of-adult-adhd`
3. Food Noise on `/answers/what-is-food-noise` + weight-loss hub
4. GLP-1 Journey on `/weight-loss-metabolic-health`
5. Testosterone Flowchart on `/mens-health-longevity`

### Tier 2 — Engagement

1. Fatigue Root Cause on tiredness guides + blog cluster
2. Insulin Resistance on metabolic answer pages
3. Weight Plateau on GLP-1 maintenance content
4. Symptom-tagged testimonial visuals (optional illustrated avatars)
5. Provider scope mini-diagrams

### Tier 3 — SEO

1. FAQPage + ImageObject schema on diagram pages
2. Pinterest-optimized vertical infographics for food noise / ADHD
3. Comparison charts for medication blog pairs
4. State availability map (accessibility-safe text fallback)
5. Video thumbnails with embedded diagram frames

---

## Implementation checklist (per page)

- [ ] `figure.siya-diagram` wrapper
- [ ] Descriptive `alt` (not "infographic")
- [ ] `figcaption` with compliance caveat where clinical
- [ ] `loading="lazy"` (except LCP)
- [ ] Internal link from caption to relevant guide or CTA
- [ ] `npm run build` pass
- [ ] Mobile QA at 375px width

---

## Files touched in this sprint

| File | Change |
|------|--------|
| `index.html` | Full symptom-centric homepage + Symptom Loop |
| `styles.css` | Symptom grid, pathways, diagrams, membership band |
| `assets/diagrams/*.svg` | 8 reusable diagrams |
| `visual-components.html` | Internal component gallery (noindex) |
| `docs/VISUAL-CONTENT-ARCHITECTURE-AUDIT.md` | This document |
| `docs/HOMEPAGE-MESSAGING-REDESIGN.md` | Prior strategy spec (reference) |

---

## Next sprint (embed diagrams on cornerstone pages)

```bash
# Suggested embed order
1. answers/what-is-food-noise.html      → food-noise.svg
2. answers/signs-of-adult-adhd.html     → adhd-executive-function.svg
3. answers/why-am-i-tired-even-after-sleeping.html → fatigue-root-cause.svg
4. adhd-care.html                       → adhd-executive-function.svg
5. weight-loss-metabolic-health.html    → glp1-journey.svg + food-noise.svg
6. mens-health-longevity.html           → testosterone-evaluation.svg
```

*End of visual content architecture audit.*
