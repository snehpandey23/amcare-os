# Siya Visual Language

```text
Visual Language v1.0
Under Brand OS v1.1
Ratified: July 2026
Status: Active
```

**Parent:** [`01-BRAND-OS.md`](./01-BRAND-OS.md)  
**Runtime tokens (hexes, type scale, radii):** `styles.css` `:root` + `design-system/tokens.css`  
**Photography library:** [`photography/README.md`](./photography/README.md)  
**Page structure:** `docs/SERVICE-PAGE-BLUEPRINT.md`  
**Historical sources (superseded as daily SoT by this file):** `docs/VISUAL-LANGUAGE-V2.md`, `VISUAL-LANGUAGE-V2-GUARDRAILS.md`, `FIRST-5-SECONDS.md`

This document answers **why Siya looks the way it does** — not a dump of CSS variables. If Brand OS and Visual Language conflict, Brand OS wins; then update this file.

---

## The one rule

Every visual change must answer:

> **Does this make Siya feel more human?**

If no → don’t do it.

---

## What “feels like Siya” means

A surface feels like Siya when a first-time visitor, in under five seconds, gets:

1. **Care-led** — real clinicians, not a platform product  
2. **Personal** — someone might actually listen  
3. **Clear next step** — one obvious action

Success feeling:

> “This feels like a place where someone will actually listen to me.”

Not:

> “These people have a nice design system.”  
> “This looks like a hospital.”  
> “This looks like Hims / a wellness app / purple SaaS telehealth.”

Design from the patient who has been **silently struggling for years** — not from generic website best practices.

The room should feel like:

> You finally booked with the clinician everyone told you about.  
> Nobody rushes you.  
> They say: **“Tell me what’s been going on.”**

---

## Locked concept: B+A+

| Weight | Source | Role |
| ---: | --- | --- |
| **50%** | **B** Warm clinical practice | Structure — care relationship over platform |
| **40%** | **A** Editorial craft | Execution — large photo, quiet chrome, type, whitespace |
| **10%** | **C** Soft warmth | Atmosphere — cream / butter wash only; never spa or app layout |

Study (feeling only): One Medical — clinician presence + care explanation. **Do not clone layouts.**  
**Not** Hims convenience branding. **Not** hospital JPEG-era portrait grids.

---

## Why the whitespace exists

Empty space is a feature.

Luxury brands use it. Hospitals rarely do. Siya uses whitespace because Brand OS demands **calm confidence** and **trust through clarity**. Crowded viewports manufacture anxiety and compete with recognition.

Visual rhythm (prefer):

```text
Big image
Whitespace
Story
Whitespace
Quiet CTA
Whitespace
How it works
Whitespace
Clinician
Whitespace
Reviews
Whitespace
FAQ
```

Not: Section · Section · Section · Section with equal visual weight and no breath.

---

## Why clinicians are prominent

Brand OS: **Care before company.**

Visual hierarchy (non-negotiable):

1. The clinicians (people you want caring for you)  
2. The relationship / listening  
3. The care path  
4. The platform / tech (almost invisible)

Hims sells convenience. Siya sells **relationships**. Faces, listening moments, and quiet credentials beat badge walls and counter strips.

Trust belongs in **scroll stories** (meet the team · why Siya exists · how care works), not in above-the-fold star counters fighting the hero.

---

## Why pages are editorial, not promotional

Brand OS: **Editorial before advertising** · **Recognition before education** · **Explain before persuade**.

Visually that means:

- Large human photography as the emotional plane  
- Headlines that name lived experience before service catalogs  
- Short supporting sentences  
- One primary action, one quieter secondary  
- Sections that teach before they hard-sell  

It does **not** mean: urgency banners, twin primary CTAs, ATF pill clusters, “BUY NOW” energy, or badge spam.

---

## Why illustrations are minimal

Illustrations and icon grids compete with recognition photography and often age into trend debt (blobs, oversized doodles, “friendly” medical cartoons).

**Prefer:** Real photography from the Brand photography library.  
**Use icons sparingly** — functional wayfinding only, never decoration.  
**Avoid:** Emoji as UI, neumorphism, animated backgrounds, decorative abstract medical art.

When a diagram is clinically necessary (e.g., explaining a pathway), keep it flat, accurate, and quiet — beauty after clarity (Brand OS decision hierarchy).

---

## Visual hierarchy

### First viewport (hero budget)

Absolute max:

```text
Large human.
Headline.
One sentence.
One primary button.
One secondary link.
Done.
```

The hero must land three things at once:

1. **Recognition** — you’ve been struggling; we see it  
2. **Hope** — a real conversation is possible  
3. **Credibility** — care-led (via face + quiet line, not badges)

### Forbidden in the first viewport

- Trust badges / stars / counters  
- Pills / tags / chip clusters  
- Twin identical primary CTAs  
- Review snippets  
- HIPAA / license badge walls  
- Checklists  
- Dark frosted overlays / glass cards over the hero  
- Sticky bars competing with the hero CTA on first paint (prefer reveal after scroll)

### Above-the-fold CTA rule

Hierarchy matters more than count.

| OK | Not OK |
| --- | --- |
| Hero CTA | Two identical primary buttons in the same section |
| Mid-page CTA | Sticky + chat + twin hero buttons all fighting at once |
| Final CTA | Multiple primary-weight buttons side-by-side |

Do **not** remove CTAs merely because they repeat down the page.

---

## Atmosphere & color (roles, not a style guide dump)

Runtime values live in CSS (`styles.css` / `design-system/tokens.css`).  
**Pixel source of truth:** `BRAND-STYLE-LOCK.md` (same hexes as the logo). Roles live here.

| Role | Intent | Locked value |
|------|--------|----------------|
| Page | Warm cream canvas — matches social Style Lock | Cream (`#F4EFE7`) |
| Section tint | Quiet separation; lighter than page, not identical | Cream tint (`#F9F6F1`) |
| Primary | Trust, headings, brand chrome, primary CTAs | Deep Siya Navy (`#001878`) |
| Primary hover / supporting navy | Secondary navy for hover on navy elements only | Dark Navy (`#0A246B`) |
| Accent | Solid for chips/highlights; **filled primary CTAs use logo gradient** | Magenta `#D81088` · CTA gradient `#D81088 → #C32889 → #87218B → #642EAE` |
| Accent hover / accessible text | Accent fill hover (gradient darkens); text links; outline button border/text | Accessible magenta (`#A80C6A`) · CTA hover gradient (violet-weighted) |
| Tertiary / champagne gold | Pills · tags · thin dividers · soft section washes — **never** a button fill or second CTA | Champagne gold (`#C4A574`) — palette addition approved **2026-09-04**; CSS `--accent-tertiary` / `--gold-accent`. Same hex + rules as `BRAND-STYLE-LOCK.md`. |
| Text | Readable stone, not pure marketing black | Warm charcoal |
| Cards / surfaces | White content on cream page | `#ffffff` on `#F4EFE7` |
| Shadows | Neutral / warm — never blue-tinted corporate glow | Soft charcoal shadows |
| Hero treatments | Prefer bright editorial when possible; if overlay needed, charcoal — not corporate blue frost | See tokens |

**Never return to:** teal/Option C accents (`#0f766e`, `#0d9488`, `#0ea5a4`), Tailwind-like blue primary (`#1e3a8a`), purple SaaS washes, sky-blue section floods (`#f0f9ff`-era), glow effects, dark frosted “consultant” hero cards as the default brand look.

### Third-party surfaces (outside site CSS)

These UIs are embedded or opened off-site. Agents must **not** treat them as restylable through `styles.css` / design-system tokens:

| Surface | How it appears | Control |
|---------|----------------|---------|
| **Siya AI Concierge** | Fixed iframe → `siya-guide.vercel.app/embed` (`siya-concierge.js`) | Launcher chrome lives in the Guide app; patient site only sizes/positions the iframe |
| **CarePatron** | Booking after `/redirect/meet-greet` (and related redirects) | External booking product |
| **Zocdoc** | Outbound “Book Online via Zocdoc” links | External marketplace |
| **GHL intake embed** | `/intake` iframe + LeadConnector forms when used | Third-party form chrome |

LeadConnector chat + Messenger FAB scripts are currently **stripped** by site-chrome (not live). If re-enabled, chat widget chrome remains third-party.

---

## Typography (roles)

| Role | Live direction |
|------|----------------|
| Headings | Poppins — clear, confident, not display-novelty |
| Body | Inter — readable clinical explanation |
| Body line height | ~1.7 — breath for medical literacy |
| Hierarchy | Scale through size/weight; don’t invent a third display face for “premium” |

Reading-level and sentence shape: Editorial Style Guide. Visual type exists to support that voice — not to overpower it.

---

## Photography (summary — library is SoT)

Images are not decoration. They solve:

> Make patients feel seen before asking them to trust you.

If an image only says “healthcare,” it does not belong.  
If it makes someone think “that’s exactly me,” it does.

| Prefer | Avoid |
| --- | --- |
| Warm natural light; authentic adults; everyday environments | Arms-crossed white-coat stare; stock telehealth laptop cliché |
| Listening, talking, unfinished work, fatigue, real home consults | Collages, floating avatar stacks, AI-looking posed teams |
| One dominant human per major beat | Competitor stock, fake clinic logos, clipboard portraits |

Full rules + inventory: `brand/photography/`.

---

## Density & cards

Information density is the usual failure mode — not “wrong border radius.”

- **Tier thinking:** Fix hierarchy and declutter first. Soften cards and add polish last.  
- Cards are for **interaction or scannable recognition clusters** — not for wrapping every paragraph in a shadow box.  
- If removing a border, shadow, or radius doesn’t hurt understanding, remove it.  
- Equal-height CTA pairs and short sections beat dense feature grids.

Live page grammar for service lines: `docs/SERVICE-PAGE-BLUEPRINT.md`.

---

## What should never appear

Trend debt and Brand OS violations:

- Blobs, gradient floods, floating glass cards as identity  
- Neumorphism, animated backgrounds, oversized illustrations  
- Purple / glow / badge-spam telehealth clichés  
- Fear marketing visuals (countdown clocks, scare imagery manufactured for conversion)  
- Dark frosted hero overlays as the default “premium” look  
- Emoji icon systems and decorative icon rows in heroes  
- Anything that fails: more human? less cognitive load? care more prominent? simplify rather than decorate? still premium in five years? accessible? mobile-first?

---

## Per-surface emotional targets

| Surface | First-five-seconds feel |
| --- | --- |
| Homepage | Safe · Heard · Curious |
| ADHD Care | Recognized · Hopeful · Ready for screening (or Meet & Greet) |
| Meet & Greet | Low pressure · Personal · Simple |
| Weight Loss | Encouraged · Not judged · Optimistic |
| About / Care Team | These are the people I want caring for me |
| Educational pillars | Understood · Oriented · Invited to care (not sold) |

If the design doesn’t create those emotions, polish doesn’t matter.

---

## Decision checklist (required)

Every visual change must satisfy **all** of:

1. Does it feel **more human**?  
2. Does it **reduce cognitive load**?  
3. Does it make **care / clinicians more prominent**?  
4. Does it **simplify rather than decorate**?  
5. Would it still feel **premium in five years**?  
6. Does it **preserve accessibility**?  
7. Does it improve **mobile first**?  

Plus Brand OS filter: reduce confusion · increase trust · recognition before the ask.

When principles conflict, use Brand OS **decision hierarchy** (clinical accuracy → … → novelty).

---

## Implementations

| Artifact | Role |
| --- | --- |
| Homepage + ADHD Care | Primary visual demonstrations |
| Other service pages | Inherit this language via Service Page Blueprint — no parallel redesign language |
| Outbound creative | Same Visual Language; surface recipes in planned `04-CREATIVE-SYSTEM.md` |
| CSS / components | Runtime expression — planned `05-COMPONENT-SYSTEM.md` |

Redesigning a page changes an implementation. It does not invent a new visual language.

---

## Closing

Siya’s look is calm editorial care — human first, quiet chrome, recognition photography, one clear next step.

If it looks louder, colder, trendier, or more “optimized,” it probably isn’t Siya.
