# Homepage Concepts A / B / C

**Status:** Decision locked — **B+A+** (see end). Guardrails: `VISUAL-LANGUAGE-V2-GUARDRAILS.md`  
**Purpose:** Concepts for direction pick (historical). Do not reopen unless language fails ship criteria.  
**Constraint:** Same Visual Language v2 rules, CTAs destinations, SEO freezes.  
**Format:** Annotated wireframes (text) — not production code.

**Human test:** In 5 seconds — recognition · hope · credibility · next step.

---

## Shared constraints (all three)

| Keep | Change only via concept |
| --- | --- |
| Headline intent (recognition / “something feels off”) | Hero layout & density |
| Meet & Greet as primary conversion | Photography presentation |
| Screening / evaluation as secondary paths | Type scale, spacing, chrome |
| Care team, reviews, FAQ further down | What appears above the fold |
| Routing, schema, analytics | — |

**Above the fold max:** 1 dominant human · 1 promise · 1 primary CTA · 1 secondary CTA · no pills · no twin identical primaries · no frosted dark card · no trust-stat strip in hero.

---

# Concept A — Editorial / Apple-inspired

**Feel:** Calm confidence. The photo *is* the product. UI nearly disappears.

### Above-the-fold wireframe (desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                    Nav…              [Primary CTA]  │  ← quiet chrome
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Something feels off—                    ┌───────────────┐ │
│   and you're tired of                     │               │ │
│   guessing why.                           │   LARGE       │ │
│                                           │   HUMAN       │ │
│   Physician-led care for                  │   PHOTO       │ │
│   focus, energy, and weight—              │   (edge-to-   │ │
│   with time to listen.                    │    edge feel, │ │
│                                           │    no card)   │ │
│   [ Book Free Meet & Greet ]  Learn more →│               │ │
│                                           └───────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Annotations

| Element | Treatment |
| --- | --- |
| Background | Soft warm white / barely-there cream — **no** blue wash |
| Photo | Right ~55–65% of viewport; full bleed to right edge; natural light; no overlay card |
| Type | Very large H1 (2–3 lines max); one short supporting sentence |
| CTAs | One solid primary · one text/ghost secondary |
| Removed from hero | Pills, twin buttons, trust stats, ADHD link row, frosted panel |
| Motion | Soft fade-in of text only |

### Mobile

```
┌──────────────────┐
│ Logo        ☰    │
│                  │
│  [PHOTO ~45vh]   │  ← human first, bright, no dark mask
│                  │
│  Headline        │
│  One sentence.   │
│                  │
│  [ Meet & Greet ]│
│  Learn more →    │
└──────────────────┘
```

Sticky bar: optional **after** scroll past hero — not competing in first paint if possible.

### Why this feels human

Face + whitespace + one action. Physician-led comes from quiet confidence and later “Meet the team,” not badge spam.

### Risk

Can feel too “tech brand” if photography isn’t warm enough. Mitigate with warmer image and softer type color (charcoal, not pure black).

### Tier 1 fit

Excellent — density removal is radical and clear.

---

# Concept B — Warm physician practice

**Feel:** Walking into a boutique doctor’s office. Welcoming, clinical-light, personal.

### Above-the-fold wireframe (desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                    Nav…              [Meet & Greet] │
├─────────────────────────────────────────────────────────────┤
│  Soft warm cream canvas                                     │
│                                                             │
│   ┌─────────────┐                                           │
│   │  PHYSICIAN  │   Something feels off—                    │
│   │  PORTRAIT   │   and you're tired of guessing why.       │
│   │  (real Siya │                                           │
│   │   clinician)│   Board-certified clinicians who take     │
│   │             │   time to understand what's going on.     │
│   └─────────────┘                                           │
│                                                             │
│                 [ Book Free Meet & Greet ]  Free screening →│
│                                                             │
│                 Dr. Name · Specialty · States               │  ← one quiet line, not a strip of stats
└─────────────────────────────────────────────────────────────┘
```

### Annotations

| Element | Treatment |
| --- | --- |
| Background | Warm cream / soft beige — paper-like, not purple |
| Photo | Real clinician preferred (or warm patient + clinician later); left or right editorial crop; soft shadow only if needed for separation — **no** frosted glass |
| Promise | Same recognition headline; supporting line emphasizes listening / physician-led |
| CTAs | Primary Meet & Greet · secondary Free screening (link style) |
| Trust in hero | At most **one** quiet credential line under CTAs — not 3-stat strip |
| Removed | Pills, duplicate primaries, dark overlays, checklist in hero |

### Mobile

```
┌──────────────────┐
│ Logo        ☰    │
│                  │
│  Headline        │
│  One sentence.   │
│                  │
│  [PORTRAIT]      │
│                  │
│  [ Meet & Greet ]│
│  Free screening →│
│  Quiet credential│
└──────────────────┘
```

### Why this feels human

The brand signal is a **real physician**, not a lifestyle stock-as-UI. Closest to “I feel understood by a real physician.”

### Risk

If the portrait feels stock or overly posed, trust drops. Prefer authentic Siya team photography.

### Tier 1 fit

Excellent — and strongest alignment with emotional goal. **Likely best default for Siya.**

---

# Concept C — Consumer wellness

**Feel:** Approachable, soft, lifestyle-forward — closer to Headspace/Calm energy.

### Above-the-fold wireframe (desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                         Nav…                        │
├─────────────────────── soft gradient band ──────────────────┤
│                                                             │
│              Something feels off—                           │
│              and you're tired of guessing why.              │
│                                                             │
│              You're not failing. Your symptoms              │
│              deserve a real conversation.                   │
│                                                             │
│              [ Book Free Meet & Greet ]                     │
│              Take free screening →                          │
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │     WARM LIFESTYLE PHOTO (wide)     │             │
│         │     soft corners OR full-bleed band │             │
│         └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Annotations

| Element | Treatment |
| --- | --- |
| Background | Soft warm wash (peach/cream), very light — accent, not rainbow |
| Layout | Centered type stack; photo as a band below or behind with high brightness |
| CTAs | One centered primary; secondary as text link under |
| Density | Ultra-low; almost spa-like calm |
| Removed | All hero chrome except logo/nav/CTAs |

### Why this feels human

Emotional safety and softness; less “clinic,” more “someone gets me.”

### Risk

Can drift toward **wellness influencer** or soft-startup if physician cue is delayed. Must still signal medical leadership by section 2 (Why Siya / care team) immediately after hero — not buried.

### Tier 1 fit

Good for density, weaker on “physician-led in 5 seconds” unless section 2 is pulled up.

---

## Side-by-side decision matrix

| Criterion | A Editorial | B Physician practice | C Wellness |
| --- | :---: | :---: | :---: |
| 5-sec “physician-led” | Medium | **High** | Low–Medium |
| 5-sec “personal” | High | **High** | High |
| 5-sec “next step” | **High** | **High** | **High** |
| Premium / calm | **Highest** | High | Medium–High |
| Risk of looking like Hims | Low | Lowest | Medium |
| Risk of looking clinical | Low | Low (if warm) | Lowest |
| Risk of looking “wellness app” | Low | Lowest | **Highest** |
| Best photo dependency | Lifestyle editorial | **Real clinician** | Lifestyle soft |
| Alignment with “more human than Hims” | Strong | **Strongest** | Strong but softer brand |

---

## Recommendation (for discussion — you pick)

**Concept B** as the Visual Language default:

- Hits the emotional goal hardest (“real physician”).  
- Still meets density / bright / one-primary-CTA rules.  
- Differentiates from Hims (convenience) and from hospital sites (cold).  

Use **A’s** photography scale and whitespace discipline inside B’s structure (large human, quiet chrome).  
Borrow **C’s** softness for backgrounds (warm cream) — not C’s centered wellness-app stacking as the hero pattern.

Hybrid label if useful: **B + A craft** = “Warm physician practice, editorial execution.”

---

## What happens next

~~Pick A / B / C / B+A~~ → **Locked: B+A+**

---

# DECISION: B+A+

**B structure + A editorial execution + C warmth (10%) + One Medical’s human trust model.**

| Weight | Role |
| ---: | --- |
| **50% B** | Physician as brand; relationship over platform; “Tell me what’s been going on.” |
| **40% A** | Large human, quiet chrome, type scale, whitespace rhythm |
| **10% C** | Soft warm atmosphere only — never centered wellness-app hero |

### Patient lens (overrides website lens)

Design for someone who has been **silently struggling for years**.  
Not for someone evaluating a telehealth SaaS.

### Hero (stricter than A/B/C drafts)

```
Large human.
Headline.          ← Recognition + Hope + Credibility (not recognition alone)
One sentence.
One button.
One secondary link.
Done.
```

No badges, pills, stats, reviews, or frosted glass in the first viewport.  
Earn trust on scroll: Meet physicians → Why Siya → How care works.

### Nav direction

`Logo · Care · ADHD · About · Resources · Book` — browse less; decide faster.

### Photography

Candid: listening, talking, laughing, walking — not arms-crossed white-coat stare.

### Desired visitor quote

> “This feels like a place where someone will actually listen to me.”

**Next:** Implement Tier 1 homepage under `VISUAL-LANGUAGE-V2-GUARDRAILS.md` when you say go.
