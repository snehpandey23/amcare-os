# Siya Visual Language v2 — Guardrails

**Status:** Locked with concept **B+A+**  
**Date:** 2026-07-17  
**Rule:** If any answer below is **no**, reject the change.

These guardrails bind every homepage (and later page) decision before and during CSS.

---

## Decision checklist (required)

Every visual change must satisfy **all** of:

| # | Question |
| --- | --- |
| 1 | Does it feel **more human**? |
| 2 | Does it **reduce cognitive load**? |
| 3 | Does it make the **physician more prominent**? |
| 4 | Does it **simplify rather than decorate**? |
| 5 | Would it still feel **premium in five years**? |
| 6 | Does it **preserve accessibility**? |
| 7 | Does it improve **mobile first**? |

**Plus the standing human rule:** Does this make Siya feel more human? If no → don’t.

---

## Locked concept: B+A+

| Source | Weight | Role |
| --- | ---: | --- |
| **B** Warm physician practice | **50%** | Structure — physician as brand, relationship over platform |
| **A** Editorial / Apple craft | **40%** | Execution — large photo, quiet chrome, type, whitespace |
| **C** Consumer wellness | **10%** | Warmth only — soft cream atmosphere, never spa/app layout |
| **One Medical** | Study, don’t clone | How physicians, care explanation, and clinical warmth coexist |

**Not** 33/33/33. Not Hims. Not hospital JPEG-era portraits.

**Success feeling:**

> “This feels like a place where someone will actually listen to me.”

**5-second test:** physician-led · personal · I know what to do next.

---

## Emotional north star

Design from the patient who has been **silently struggling for years** — not from “website best practices.”

The room should feel like:

> You finally booked with the doctor everyone told you about.  
> Nobody rushes you.  
> The doctor says: **“Tell me what’s been going on.”**

Not: “Virtual Healthcare.”

---

## Brand hierarchy (non-negotiable)

1. **The physicians** (people you want caring for you)  
2. The relationship / listening  
3. The care path  
4. The platform / tech (almost invisible)

Hims sells convenience. Siya sells **relationships**. Lean into that.

---

## Hero (absolute max)

```
Large human.
Headline.
One sentence.
One button.
One secondary link.
Done.
```

**Forbidden in the first viewport**

- Trust badges / stars / counters  
- Pills / tags  
- Twin identical primary CTAs  
- Review snippets  
- HIPAA / license badge walls  
- Checklists  
- Dark frosted overlays / glass cards  
- Sticky bar competing with hero CTA on first paint (prefer after scroll)

**Hero must communicate three things at once**

1. **Recognition** — you’ve been struggling; we see it  
2. **Hope** — a real conversation is possible  
3. **Credibility** — physician-led (via face + quiet line, not badges)

Headline may evolve beyond “Something feels off…” if it better lands Recognition + Hope + Credibility in one line. Copy change in hero is allowed **only** if SEO title/H1 strategy for the homepage remains intact or is explicitly approved — prefer subhead/support for hope+credibility if H1 is frozen for SEO.

---

## Navigation (direction)

Browse less. Decide faster. Target simplification:

```
Logo · Care · ADHD · About · Resources · Book
```

Collapse secondary destinations into Care / Resources. Don’t treat footer taxonomy as a navigation strategy.  
*(Implement in Tier 1 only if low-risk; otherwise defer nav IA to a follow-up so hero density work isn’t blocked.)*

---

## Trust model (scroll, don’t demand)

Replace counter strips with story blocks:

1. **Meet the physicians**  
2. **Why Siya exists**  
3. **How care works**  

Then reviews / FAQ. Humans trust stories, not counters.

---

## Visual rhythm

Not: Section · Section · Section · Section  

Instead:

```
Big image
Whitespace
Story
Whitespace
Quiet CTA
Whitespace
How it works
Whitespace
Physician
Whitespace
Reviews
Whitespace
FAQ
```

Empty space is a feature. Luxury brands use it. Hospitals rarely do.

---

## Photography

| Prefer | Avoid |
| --- | --- |
| Laughing, talking, listening, walking, sitting casually | Arms crossed, white coat stare, stock “telehealth laptop” |
| Natural light, authentic Siya clinicians when possible | Corporate headshot grid energy |
| One dominant human per major beat | Collages, floating avatar stacks |

Highest ROI lever after decluttering: **candid physician/patient humanity**.

---

## Absolute avoid (trend debt)

- Blobs · gradients everywhere · floating glass cards  
- Neumorphism · animated backgrounds · oversized illustrations  
- Purple SaaS washes · glow effects · badge spam  

**Warm minimalism** ages better.

---

## Implementation tiers (unchanged priority)

**Tier 1:** Declutter ATF · bright editorial · larger human · 1+1 CTAs · type/spacing · rhythm start  
**Tier 2:** Cards down · story trust · soft cream · more whitespace · quieter nav if deferred  
**Tier 3:** Hovers · micro-motion · borders — polish last  

---

## Ship checklist (homepage expression of Visual Language v2)

- [ ] 5-second test passes (recognition + hope + credibility)  
- [ ] Physician is the brand signal, not the platform  
- [ ] Hero: large human · headline · one sentence · one button · one secondary link  
- [ ] No dark frosted overlays  
- [ ] No badges/pills/stats/reviews in first viewport  
- [ ] Max two CTAs in hero (different hierarchy)  
- [ ] First scroll sections = humans/stories before feature grids  
- [ ] Visible whitespace rhythm between beats  
- [ ] Mobile hero fits one screen without crowding  
- [ ] Accessibility preserved; CWV/Lighthouse do not regress  
- [ ] SEO, schema, analytics, conversion tracking unchanged  
- [ ] Scorecard ≥ 8 on all six attributes  

---

## Next step

**Approved to implement Tier 1 homepage only** under these guardrails — when you say go.

Study reference (feeling only): [One Medical](https://www.onemedical.com/) — physician presence, care explanation, warmth + clinical credibility. Not layouts.
