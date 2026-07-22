# Siya Creative System

```text
Creative System v1.1
Under Brand OS v1.2.1
Ratified: July 2026
Status: Active — Production Manual
```

**Parents:** [`01-BRAND-OS.md`](./01-BRAND-OS.md) · [`02-VISUAL-LANGUAGE.md`](./02-VISUAL-LANGUAGE.md) · [`ANTI-PATTERNS.md`](./ANTI-PATTERNS.md)  
**Voice / claims:** `docs/EDITORIAL-STYLE-GUIDE.md`  
**Photography:** [`photography/README.md`](./photography/README.md)  
**CTAs / pricing / states:** `docs/SIYA-STANDARDS.md` + `data/site-standards.mjs`

This is **not** a style guide. It is a **production manual** — a creative compiler.

```text
Knowledge / research
  ↓
Creative System (compiler)
  ↓
Assets
```

- Brand OS tells humans and AI **how to think**.  
- Creative System tells them **how to build**.  

Every outbound asset (Instagram, LinkedIn, X, Facebook, newsletter, blog graphic, deck, ad, video cover) is an **expression** of Brand OS — not a separate brand.

**Registry:** Approved/seed instances live in [`creative-registry/`](./creative-registry/). Empty layout classes are filled there — not in this manual.

**Mantra:** Do not stare into a blank canvas. Start from **intent** → **family** → **layout ID** → **registry clone when possible**, then fill.

**Rule:** Do not invent layouts. Select a **family** + **layout ID**, then fill. Real creativity lives in choosing the insight, explaining medicine, and telling stories — not in reinventing corner radii.

---

# Part 0 — Creative Intent

Everything starts here — **before** Message.

**Intent answers:** *Why are we making this at all?*

Pick **one** primary intent. Trying to achieve six goals in one post is how creatives become mush.

| Intent | Success looks like |
|--------|-------------------|
| **Recognition** | “That’s me.” |
| **Education** | “I didn’t know that.” |
| **Trust** | “These people seem thoughtful.” |
| **Action** | “I’ll book.” |
| **Relationship** | “I’ll follow / keep reading.” |
| **Authority** | “These clinicians know their field.” |
| **Retention** | “I’ll come back for the next piece.” |

**Intent ≠ Family.** Intent is the *job*. Family is the *form*.

Examples:

| Intent | Typical families |
|--------|------------------|
| Recognition | R |
| Education | E, M, RS, PR |
| Trust | PF, PP |
| Action | A (sometimes R → A carousel end) |
| Authority | RS, PP |
| Relationship / Retention | PP, E, newsletter variants |

If Intent isn’t named in the brief, stop. Do not design yet.

---

# Part I — Creative Hierarchy

Every asset climbs this ladder. Skip a rung and the creative fails.

```text
Intent
  ↓
Message
  ↓
Recognition
  ↓
Trust
  ↓
Structure
  ↓
Visual
  ↓
Decoration
```

| Rung | Question |
|------|----------|
| **Intent** | Why does this exist? (one job from Part 0) |
| **Message** | What is the single idea? |
| **Recognition** | What experience will someone see themselves in? |
| **Trust** | Why believe us (clinician, process, evidence, restraint)? |
| **Structure** | Which family + layout ID? |
| **Visual** | Photography / diagram / type — in that order of preference |
| **Decoration** | Only if nothing above needs it |

**Hard rule:** If Intent, Message, or Recognition isn’t clear, nothing below matters. Do not open Canva / Midjourney / Figma at Decoration.

---

# Part II — Creative Families

Every creative belongs to exactly one family.

| Code | Family | Goal |
|------|--------|------|
| **R** | Recognition | Stop the scroll because they recognize themselves |
| **E** | Explanation | Teach one concept clearly |
| **M** | Myth vs Fact | Correct a harmful or common misunderstanding |
| **RS** | Research Breakdown | Translate one study / finding responsibly |
| **PP** | Physician Perspective | Clinical memory → pattern → lesson → invitation |
| **PR** | Process | Show how care works (screening → follow-up) |
| **PF** | Proof | Trust via process, credentials, canonical metrics |
| **A** | Action | One offer · one CTA · nothing else |

---

## R — Recognition

**Goal:** Make someone stop because they recognize themselves.

**Topics that fit:** ADHD unfinished work, brain fog, afternoon crash, food noise, perimenopause overwhelm, burnout, time blindness, “trying harder.”

**Structure:**

```text
Large statement
One image (editorial / recognition category)
Minimal support (≤2 short lines)
CTA in caption / last slide — not competing in the image
```

**Never:** Lead with “We treat X.” Lead with the lived moment.

---

## E — Explanation

**Goal:** Teach one concept.

**Structure:**

```text
Question
Explanation
Diagram or quiet visual
Example
Takeaway
```

**Never:** Five concepts in one carousel. One idea per asset.

---

## M — Myth vs Fact

**Structure:**

```text
Myth
  ↓
Reality
  ↓
Clinical explanation (plain language)
  ↓
Action (optional CTA)
```

**Never:** Mock the reader. Correct the myth; protect dignity.

---

## RS — Research Breakdown

**Structure:**

```text
Headline (what was studied)
Study (who / what — no hype)
What it found
Why it matters (for a patient)
Limitations (required)
CTA (educate → invite, never “proven cure”)
```

**Never:** Overclaim. Brand OS: evidence where it exists; uncertainty where it doesn’t.

---

## PP — Physician Perspective

**Structure:**

```text
Clinical memory (“I keep seeing…”)
Pattern
Lesson
Invitation (Meet & Greet / Screening / Guide)
```

**Voice:** Thoughtful clinician to a patient they respect (Editorial Style Guide).  
**Never:** Fake quotes from AI clinicians.

---

## PR — Process

**Structure:**

```text
How screening works
  ↓
Evaluation
  ↓
Treatment (when appropriate)
  ↓
Follow-up
```

**Use exact clinical vocabulary** (screening ≠ diagnosis ≠ prescribing).  
**CTAs:** Prefer Meet & Greet or Screening labels from Standards — never “Get Started.”

---

## PF — Proof

**Structure:**

```text
Trust via process / clinicians / canonical metrics
Clinical restraint (what we don’t claim)
Optional social proof (reviews — not badge walls)
CTA
```

**Metrics:** Only `data/homepage-trust-metrics.mjs`. Never invent numbers.  
**Never:** Twenty badges above the fold (see Anti-Patterns).

---

## A — Action

**Structure:**

```text
One offer
One CTA
Nothing else
```

**Allowed CTA labels (exact):** see Editorial / Standards — e.g. `Take Free ADHD Screening`, `Book Free Meet & Greet`, `Start Secure Medical Chat`, Siya Circle join when newsletter-appropriate.

---

# Part III — Layout Library (Creative Registry)

Select an ID. Do not invent a parallel layout.

### Recognition

| ID | Layout |
|----|--------|
| **R-01** | Full-bleed editorial photo · large type overlay (short) · quiet logo corner · CTA in caption only |
| **R-02** | Split: photo left / statement right (or stacked mobile) · one support line · caption CTA |
| **R-03** | Carousel: Slide 1 recognition statement → Slides 2–3 “does this sound like you” beats → last slide one CTA |
| **R-04** | Quote-style recognition line · soft cream field · small human crop · no icons |

### Explanation

| ID | Layout |
|----|--------|
| **E-01** | Question as headline · 3–5 short body lines · one quiet diagram or photo |
| **E-02** | Carousel teach: Q → define → example → takeaway → CTA |
| **E-03** | Blog/newsletter header: editorial image · H1 · one-line lead |

### Myth vs Fact

| ID | Layout |
|----|--------|
| **M-01** | Two-panel: Myth / Reality · then one explanation panel |
| **M-02** | Carousel: Myth → Reality → Why → What to do → CTA |

### Research

| ID | Layout |
|----|--------|
| **RS-01** | Single graphic: finding · one limitation line · source note · CTA in caption |
| **RS-02** | Carousel: Headline → Methods (plain) → Finding → Why it matters → Limitations → CTA |

### Physician Perspective

| ID | Layout |
|----|--------|
| **PP-01** | Clinician portrait (library / approved) · short clinical memory · invitation |
| **PP-02** | Text-led “pattern I see” · minimal chrome · Meet & Greet CTA in caption |

### Process

| ID | Layout |
|----|--------|
| **PR-01** | 3–4 step vertical or carousel: Screening → Evaluation → Plan → Follow-up |
| **PR-02** | Single diagram of the care path · one disclaimer line · CTA |

### Proof

| ID | Layout |
|----|--------|
| **PF-01** | One canonical metric + plain meaning · human photo · CTA in caption |
| **PF-02** | Care team / clinician focus · credentials without badge wall · CTA |

### Action

| ID | Layout |
|----|--------|
| **A-01** | Full-bleed calm field or photo · one line offer · one button treatment |
| **A-02** | Checklist of “what you get” (≤4) · one CTA · Meet & Greet free stated once if relevant |

**Registry growth:** New layouts earn an ID only after two successful uses and a changelog note. Prefer extending an existing ID with a topic, not inventing R-99 on impulse.

---

# Part IV — Design Rules (outbound)

Runtime website tokens live in CSS. Outbound creatives inherit **roles** from Visual Language.

| Rule | Direction |
|------|-----------|
| **One idea** | One message per asset (or per carousel as a whole) |
| **Text ratio** | Recognition: mostly image + short type. Explanation: more text OK if scannable |
| **Headline** | Large, calm, sentence case; not all-caps scream |
| **Support copy** | 1–3 short lines on-image; depth in caption |
| **Margins** | Generous — whitespace is trust |
| **Image dominance** | Recognition families: photo ≥ 60% of frame when possible |
| **Logo** | Small, consistent corner or end-slide — never competing with the statement |
| **CTA** | Caption / last slide / email button — not three CTAs on slide 1 |
| **Color** | Cream/warm page feel · navy for type hierarchy · quiet teal accent sparingly · no purple SaaS / sky-blue floods |
| **Type** | Prefer Poppins (display) + Inter (body) when the tool allows; never mix five fonts |
| **Cards** | Avoid card-in-card clutter on social; prefer editorial planes |
| **Motion** | Subtle or none; never animated anxiety |

If a rule conflicts with clinical accuracy or safety → Brand OS decision hierarchy wins.

---

# Part V — Illustration Language

| Medium | When to use | When not |
|--------|-------------|----------|
| **Editorial photography** | Default for Recognition, Proof, Physician Perspective, most heroes | Never replace with stock handshake |
| **Icons** | Wayfinding / 3-step process only | Decorative icon rows, emoji education |
| **Simple diagrams** | Explanation, Process, Research | Decorative blobs |
| **Charts** | Research only — labeled, honest axes | Vanity growth porn |
| **Medical drawings** | Rare; accuracy-reviewed | Random anatomy clipart |
| **Illustration / AI art people** | Almost never | Never as “our clinicians” |

**Never mix randomly.** Pick one primary medium per asset. Photography carries recognition; diagrams carry explanation.

---

# Part VI — Platform Adaptation

**Same Intent + Message + Recognition + Family + Layout ID.**  
Platforms change **crop, length, and CTA placement** — not the brand.

| Platform | Adapt |
|----------|--------|
| **Instagram feed** | 1:1 or 4:5; short on-image type; depth in caption; hashtags restrained |
| **Instagram carousel** | Prefer R-03, E-02, M-02, RS-02, PR-01; last slide = Action |
| **LinkedIn** | Slightly more clinical precision; still plain language; PP and RS excel |
| **X / Threads** | Shorter; often caption-led with one still; link carefully |
| **Facebook** | Same family; warmer; avoid fear thumbnails |
| **Pinterest** | Vertical; strong recognition statement; evergreen topics |
| **Newsletter** | E-03 / Explanation or Recognition opener → one CTA (Meet & Greet / Screening / article) |
| **Blog hero** | E-03 or R-02; editorial photo from library category |
| **Deck / webinar** | Explanation + Process; one idea per slide; no badge spam |
| **Ads** | Prefer A or R; no fake urgency; landing page must match message |
| **YouTube / video cover** | Recognition face or clear statement; readable at small size |
| **Siya Circle** | Newsletter rules in Standards; creative still follows families |

**Forbidden platform habit:** Rewriting the philosophy to “perform” on a channel. Channels get crops; Brand OS does not.

**Later (v2 — not now):** Per-platform pages (best families, length, caption style, crop, frequency, never-dos). This table is enough for v1.

---

# Part VII — AI / Production Workflow

This is marketing production — not “AI, make a post.”

```text
Research / insight
  ↓
Intent (one job)
  ↓
Journey stage + emotion
  ↓
Message (one idea)
  ↓
Choose Creative Family
  ↓
Choose Layout ID
  ↓
Copy (Editorial Style Guide)
  ↓
Visual (Photography library or approved diagram)
  ↓
Caption / alt text
  ↓
Platform crops
  ↓
QA (Part VIII)
  ↓
Publish
  ↓
Archive with Creative Schema (Part IX)
```

Each stage is replaceable (human or AI) **as long as inputs/outputs stay structured** (Part IX — Creative Schema).

**Prompt pattern (preferred):**

> Intent: Recognition. Journey: Recognizing. Emotion: Overwhelmed. Create a **Recognition (R-02)** creative about executive dysfunction for adults. Follow Brand OS, Visual Language, Editorial Style Guide, and Creative System. Generate: LinkedIn post, Instagram 4:5, newsletter blurb, blog hero direction, and caption. CTA: Take Free ADHD Screening. Do not invent statistics.

---

# Part VIII — Creative QA

Before publish, every item must pass:

| Check | Pass if |
|-------|---------|
| **Intent** | One clear job; not six goals crammed into one asset |
| **Recognition** | Someone silently struggling could feel seen (when intent requires it) |
| **Message** | One clear idea |
| **Journey / emotion** | Matches where the reader is (schema fields) |
| **Trust** | No hype, no fake urgency, no invented metrics |
| **Medical accuracy** | Screening / diagnosis / treatment / prescribing used correctly |
| **Brand OS** | Principles + decision hierarchy |
| **Visual Language** | Feels human; not any-telehealth-SaaS |
| **Anti-Patterns** | No match to known mistakes |
| **Editorial** | Voice, CTA labels, disclaimers if needed |
| **Accessibility** | Contrast, alt text, readable type size |
| **Mobile** | Crop still works small |

Fail any row → revise. Do not “ship and see.”

---

# Part IX — Creative Schema

This is the **canonical metadata** for every asset — not an afterthought for automation.

Automation exists **because** the schema exists. The schema does not exist because automation exists.

Use the same schema for blogs, newsletters, carousels, LinkedIn posts, YouTube scripts, emails, decks, and ads so content can be queried like software:

> Show every Recognition creative for women with ADHD at journey stage Recognizing that ends with Screening.

```yaml
id: null                         # e.g. 2026-07-R-02-001 when logged
topic: ADHD                      # ADHD | metabolic | mens | sleep | women | primary | brand
intent: Recognition              # Recognition | Education | Trust | Action | Relationship | Authority | Retention
family: Recognition              # R | E | M | RS | PP | PR | PF | A
layout: R-02
journey_stage: Recognizing       # Unaware | Recognizing | Considering | Evaluating | Patient | Returning | Advocate
persona: Adult_ADHD              # free label; keep consistent within a campaign
emotion: Overwhelmed             # Confused | Ashamed | Overwhelmed | Curious | Hopeful | Validated | Relieved
tone: Calm                       # Calm | Direct | Empathic — never Hype
message: "Tasks started with intent rarely finish."
image: Editorial Photography
image_category: unfinished-work  # brand/photography category
headline_length: Short           # Short | Medium
caption_length: Long             # Short | Long
cta: Screening                   # Screening | MeetGreet | Chat | Circle | Article | None
cta_label: Take Free ADHD Screening
evidence_level: None             # None | Experiential | ClinicalPractice | PeerReviewed | CanonicalMetric
clinical_review: false           # true if medication, diagnosis claims, or RS family
platforms:
  - Instagram
  - LinkedIn
variants: 1
claims_ok: true
source_refs: []                  # required for RS when evidence_level is PeerReviewed
```

**Field notes**

| Field | Why it matters |
|-------|----------------|
| `intent` | Stops multi-goal mush |
| `journey_stage` | Often more important than topic — where is the reader? |
| `emotion` | Encodes Brand OS emotional progression in the brief |
| `evidence_level` | Gates hype; RS/PF must be honest |
| `clinical_review` | Routes high-risk claims to a human clinician |

AI fills the schema. Humans approve claims, photography, and clinical_review items.

---

# Part X — Examples & Registry Practice

**Do not stare into a blank canvas.** Start from intent → family → layout.

### Seed examples (from existing Siya expressions)

Classify live work into the registry as you reuse it:

| Pattern on site / content | Suggested seed |
|---------------------------|----------------|
| ADHD “Does this sound like you?” cards | **R-03** |
| Homepage / service recognition heroes | **R-01** / **R-02** |
| Health Guides explainers | **E-01** / **E-03** |
| Screening → evaluation explainers | **PR-01** |
| Trust metrics + care team | **PF-01** / **PF-02** |
| Meet & Greet / Screening end CTAs | **A-01** |
| Per-guide `*-SOCIAL-HOOKS.md` | Map each hook → R / E / M before designing |

### Growing the example bank

Target over time: 50 → 100 → 200 classified creatives.

Store approved outputs under a future `brand/creative-registry/` (optional) with folder names:

```text
R-01/
R-02/
E-01/
M-01/
...
```

Until that folder exists, log IDs in captions’ production notes or a simple sheet — but **always name family + layout in the brief**.

---

# Appendix A — Creative Registry (IDs)

```text
R-01  Recognition — full-bleed statement
R-02  Recognition — split photo / statement
R-03  Recognition — carousel beats → CTA
R-04  Recognition — quote / cream field

E-01  Explanation — single teach
E-02  Explanation — carousel teach
E-03  Explanation — article / newsletter header

M-01  Myth vs Fact — two-panel
M-02  Myth vs Fact — carousel

RS-01 Research — single graphic
RS-02 Research — carousel

PP-01 Physician Perspective — portrait + memory
PP-02 Physician Perspective — text-led pattern

PR-01 Process — steps carousel / vertical
PR-02 Process — single pathway diagram

PF-01 Proof — one canonical metric
PF-02 Proof — clinician / care team

A-01  Action — one offer, one CTA
A-02  Action — short “what you get” + CTA
```

---

# Appendix B — Quick brief template

```text
Intent:                 # Recognition | Education | Trust | Action | Relationship | Authority | Retention
Journey stage:          # Unaware | Recognizing | Considering | Evaluating | Patient | Returning | Advocate
Emotion:                # Confused | Ashamed | Overwhelmed | Curious | Hopeful | Validated | Relieved
Topic:
Audience moment (recognition):
Message (one idea):
Family + Layout ID:
CTA (exact label):
Platforms:
Must include:
Must never:
Evidence level:
Clinical review needed? Y/N
Photography category:
```

---

# Closing

Creative System is a compiler:

```text
Research → Intent → Journey/Emotion → Family → Layout → Copy → Visual → QA → Publish → Schema archive
```

Not:

```text
Open a blank file and hope
```

If the brief cannot name **intent**, **family**, and **layout ID**, it is not ready for design.
