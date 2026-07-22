# Siya Brand OS

```text
Brand OS v1.0
Ratified: July 2026
Status: Active Constitution
```

**Audience:** Humans and AI creating anything patient-facing or brand-facing  
**Not this document:** Color hexes, font scales, component APIs — those live in Visual Language, Editorial, Photography, and CSS tokens.

**Freeze:** Brand OS is expected to change rarely. Improvements should clarify existing principles rather than introduce new ones. Significant philosophical changes require explicit review because they affect every downstream system.

**Versioning:** Treat changes like software releases. Do not casually edit principles. If a principle changes, bump the version and record *why* in `CHANGELOG.md`. Philosophies should evolve slowly. If they change every sprint, they are preferences, not principles.

---

## Preamble

Siya exists because too many people spend years feeling unheard before receiving clear medical guidance. Every design decision should reduce confusion, increase trust, and help patients recognize themselves before asking them to make a decision.

That worldview explains the whitespace, the calm photography, the recognition-first headlines, the measured CTAs, the editorial pages, the clinicians at the center, and the tone that never shouts. Good systems do not begin with colors. They begin here.

---

## What success looks like

We succeed when patients leave feeling more informed, more confident, and more understood than when they arrived — whether or not they become long-term patients.

The content itself has value. Conversion is a consequence of that value, not a substitute for it.

---

## What Siya is

Siya Health is a **physician-led telehealth practice for adults** — whole-person care with clear next steps. Physicians lead the practice; care is delivered by licensed clinicians (physicians, NPs, PAs, and future clinical roles as they join).

It is **not**:

- A psychiatry-only brand (ADHD is a primary door, not the whole house)
- A medication marketplace or “meds fast” DTC funnel
- A wellness app pretending to be clinical care
- A hospital brochure or Silicon Valley startup landing page

Administrative entity and clinical entity stay distinct (see `docs/SIYA-STANDARDS.md`). Patient-facing work should feel like meeting a clinician who listens — not like downloading a product.

---

## What someone should feel

In the first five seconds, the question is not “What does Siya do?”

It is:

> **Can these people help me?**

Emotional order (binding — reuse in every onboarding and creative brief):

```text
I feel seen.
  ↓
I understand what Siya is.
  ↓
I trust the care team.
  ↓
I know what to do next.
```

**Nobody should feel:** sold to, rushed, shamed, diagnosed by a quiz, promised a drug, or drowned in badges and urgency.

---

## Recognition (defined)

**Recognition** means helping people describe an experience they may never have had words for.

It is not “relatable marketing.” It is clinical empathy made visible — the moment someone thinks: *that’s exactly me.*

---

## Promises we make

- Physician-led care with licensed clinicians
- Clear language about what screening, evaluation, diagnosis, treatment, and prescribing each mean
- Transparent pricing when we state prices
- Whole-person care — ADHD, metabolic health, men’s health, primary-style telehealth, and related lines as equal brand weight
- Evidence where it exists; honesty where medicine is uncertain — without hype

## Promises we intentionally do not make

- A screening result that guarantees a diagnosis or a prescription
- Guaranteed medication (stimulants, GLP-1s, testosterone, etc.)
- Instant cures, miracle timelines, or “results like these”
- That every visit is with a physician (NPs and PAs practice here; “physician-led” describes the practice)
- That we are available in every U.S. state (canonical states only — see Standards)

**On evidence:** We follow evidence where it exists, acknowledge uncertainty where it doesn’t, and avoid pretending medicine is more certain than it is.

Clinical vocabulary rules live in `docs/EDITORIAL-STYLE-GUIDE.md`. Statistics live only in `data/homepage-trust-metrics.mjs`.

---

## Eleven principles

These are the constitution. Every carousel, page, email, ad, and deck must survive them.

### 1. Trust through clarity

If a layout, sentence, or graphic adds noise, cut it. Clarity is the brand’s trust signal.

### 2. Recognition before education

People need to feel seen before they can learn. Lead with lived experience — not a service catalog. (See [Recognition](#recognition-defined).)

### 3. Care before company

The relationship is with care and clinicians, not with a corporate identity. Physicians lead the practice; the brand never outranks the care relationship. When UI competes with the clinician, the story, or the patient’s clarity, the UI loses.

### 4. Editorial before advertising

Pages should read like thoughtful journalism and clinical explanation — not like a performance-marketing landing page stacked with urgency devices.

### 5. Human before optimization

Conversion matters. It never outranks dignity, accuracy, or the feeling of being heard. Optimize after the human test passes.

### 6. Diagnosis before solution

Strong surfaces start with “Does this sound familiar?” — not “We treat X.” Name the struggle before naming the offer.

### 7. Explain before persuade

Educate first. Ask for the appointment second. Unusual in healthcare marketing; intentional here.

### 8. Reduce complexity, never accuracy

Make medicine understandable without making it simplistic. When simplicity and clinical truth conflict, truth wins — then rewrite for plain language.

### 9. Calm confidence over urgency

No “BUY NOW.” The tone is: we will help you understand this, and here is a clear next step when you are ready.

**We do not manufacture anxiety to increase conversions. If urgency exists, it comes from medicine, not marketing.**

### 10. Real clinicians, real conversations

Never impersonate an AI wellness app. Never fake clipboard stock. Prefer real people, real environments, real restraint.

### 11. Long-term trust over short-term conversion

We would rather lose a conversion than gain one through confusion, exaggeration, or pressure. Trust compounds.

---

## Decision hierarchy

When principles conflict, decide in this order:

```text
Clinical accuracy
  ↓
Patient safety
  ↓
Trust
  ↓
Recognition
  ↓
Clarity
  ↓
Beauty
  ↓
Novelty
```

Examples:

- Should we simplify this sentence? Only if accuracy and safety survive.
- Should we use a prettier diagram? Only after clarity and recognition are intact.
- Should we shorten this disclaimer? Never below accuracy and safety.

Novelty loses to everything above it. Beauty serves clarity; it does not replace it.

---

## The filter (use before every creative decision)

> Does this reduce confusion, increase trust, and help patients recognize themselves before we ask them to decide?

If no → revise or discard.  
If unsure → choose **consistency over novelty**.

Secondary visual checks (from Visual Language v2): more human? less cognitive load? care team more prominent? simplify rather than decorate? still premium in five years? accessible? mobile-first?

---

## How Brand OS relates to the website

| Role | Artifact |
|------|----------|
| Constitution | This file |
| Demonstration | Homepage + ADHD Care |
| Page grammar | `docs/SERVICE-PAGE-BLUEPRINT.md` |
| Voice & claims | `docs/EDITORIAL-STYLE-GUIDE.md` |
| Ops locks (CTA, pricing, states) | `docs/SIYA-STANDARDS.md` + `data/site-standards.mjs` |
| Image purpose | `brand/photography/README.md` |
| Visual craft | `brand/02-VISUAL-LANGUAGE.md` |

Redesigning a page changes an implementation. It does not rewrite this constitution.

---

## Outbound creative (same OS)

Social posts, newsletters, ads, slides, and video are not a separate brand. They inherit these principles. Detailed systems for those surfaces live in planned `04-CREATIVE-SYSTEM.md` and existing photography / Standards / Editorial laws — not in conflicting one-off prompts.

**Do not use** `CURSOR-MASTER-PROMPT.md` for new work. It encodes an older, denser, card-and-emoji language that Brand OS rejects.

---

## Closing

Siya’s brand is not a palette.

It is a promise to treat confusion as the enemy and recognition as the door.

Build accordingly.
