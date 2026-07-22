# Siya Design System v2 — Visual Strategy

**Status:** Approved · awaiting concept pick (`HOMEPAGE-CONCEPTS-A-B-C.md`)  
**Date:** 2026-07-17  
**Frame:** Part of **Siya Visual Language v2** (`VISUAL-LANGUAGE-V2.md`) — homepage is the first expression, not a one-off redesign.  
**Not yet:** CSS / component restyles

This document is the **visual identity**, not a stylesheet.

### One rule

> Every visual change must make Siya feel **more human**. If not → skip it.

### Success metric

A first-time visitor understands Siya in **under 5 seconds**: physician-led · personal · next step.

---

## 1. Brand personality

| Trait | Meaning in practice |
| --- | --- |
| Warm | Soft neutrals, human faces, conversational headlines |
| Physician-led | Real clinicians, credentials visible without badge clutter |
| Optimistic | Forward motion without hype or miracle claims |
| Calm | Quiet chrome; one accent; no dashboard energy |
| Premium | Whitespace as luxury; fewer elements fighting for attention |

**Not:** Hospital portal · Purple SaaS telehealth · Influencer wellness · Hims convenience brand

---

## 2. Emotional goal (acceptance test)

Visitor should feel:

> “I feel understood by a real physician.”

Not:

> “These people have a nice design system.”  
> “This looks like a hospital.”  
> “This looks like Hims.”

**Positioning target**

- More human than Hims  
- More premium than a typical telehealth startup  
- Less clinical than most healthcare sites  
- More trustworthy than wellness influencers  

You sell **trust**, not convenience.

---

## 3. Photography

| Do | Don’t |
| --- | --- |
| Editorial lifestyle; natural light | Generic stock “stethoscope + tablet” |
| Authentic adults; genuine expressions | Over-posed smiling-doctor-with-laptop |
| One dominant image per viewport | Collages, floating cards of faces |
| Real Siya physicians when possible | Clipart / illustration-as-hero |
| Soft depth of field | Hard clinical fluorescents |

**Marketing surface ratio:** ~70% people / ~30% UI (chrome, cards, icons).

---

## 4. Typography

| Rule | Target |
| --- | --- |
| Headlines | Larger, fewer words, more line-height |
| Body | Shorter paragraphs on landings; SEO pillars stay deep |
| Fonts | Keep Poppins + Inter for now; hierarchy via size/weight, not new stacks yet |
| Above-the-fold copy | ~40% less visible text on homepage / ADHD Care |

---

## 5. Color usage

**Existing brand (preserve):**

- Primary: `#1e3a8a` (navy)  
- Accent: `#0ea5a4` (teal)  

**v2 application rules:**

| Surface | Treatment |
| --- | --- |
| Page canvas | White |
| Soft sections | Warm cream / beige (subtle) — not purple washes |
| Gradients | Accent only (CTA bands sparingly) — not full-bleed heroes |
| Primary CTA | One solid primary (or teal if testing) — not purple everywhere |
| Secondary CTA | Ghost / outline |
| Icons | Low saturation; 50% fewer |

Colors should **disappear**. People should stand out.

---

## 6. Component density

| Reduce | Prefer |
| --- | --- |
| Cards without interaction | Plain text sections |
| Borders & multi-layer shadows | Flat, breathing layouts |
| Icon rows every section | Occasional icon or none |
| Competing CTAs | One primary + one secondary |

---

## 7. Motion

Subtle fade / slight slide / soft hover only.  
No parallax theater, no glow pulses, no scroll hijacking.

---

## 8. Trust presentation

Show, don’t badge-spam:

1. Real physician portrait + name + credentials  
2. Transparent process (what happens next)  
3. Honest EEAT (pending review stays honest)  
4. Patient stories only when authentic  
5. States served, no overclaim  

---

## 9. Homepage story arc (reference implementation)

Not: Hero → Cards → Features → FAQ → CTA  

Instead:

1. **Hero** — Human + one headline + one CTA  
2. **Understanding** — Recognition of the problem  
3. **Solution** — How Siya works (calm, few steps)  
4. **Trust** — Physicians / process  
5. **Next step** — Single clear CTA  

---

## 10. Acceptance criteria (scorecard)

Score current → target before calling homepage “done”:

| Attribute | Current (baseline) | Target |
| --- | ---: | ---: |
| Warmth | _see benchmark_ | 9 |
| Trust | _see benchmark_ | 9 |
| Clarity | _see benchmark_ | 9 |
| Premium feel | _see benchmark_ | 9 |
| Emotional connection | _see benchmark_ | 9 |
| Simplicity | _see benchmark_ | 9 |

Implementation may not ship until **all six ≥ 8** on desktop and mobile homepage (editorial judgment + screenshots).

---

## 11. Frozen during visual work

Routing · SEO · schema · internal links · analytics · CTA destinations · IA · educational pillar copy.

---

## 12. Implementation tiers (homepage first)

**Tier 1:** Declutter ATF · bright editorial hero · larger photo · 1 primary + 1 secondary CTA · type/spacing  
**Tier 2:** Fewer cards · quieter trust · softer backgrounds · more whitespace  
**Tier 3:** Hovers · motion · icons · shadows — polish only after hierarchy  

CTA nuance: mid-page and final CTAs are fine; twin identical primaries in one section are not.

## 13. Next steps

1. ✅ Strategy · inspiration · benchmark · Visual Language v2  
2. ✅ Concept **B+A+** + `VISUAL-LANGUAGE-V2-GUARDRAILS.md`  
3. ⏸ Say **go** → Tier 1 homepage only  
4. ⏸ ADHD Care inherits language  
5. ⏸ Resume Peri → National Treatment → FL → PA → CA cleanup  
