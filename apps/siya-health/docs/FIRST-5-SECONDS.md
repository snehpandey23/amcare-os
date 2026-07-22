# First 5 Seconds — Emotional Spec

**Status:** Binding for Visual Language v2  
**Date:** 2026-07-17  
**Insight:** Almost every real first-impression critique is **emotional**, not visual. Fix hierarchy and relationship — not border radius.

Visitor question (every commercial surface):

> **“Can these people help me?”**

Not:

> “What does Siya do?”

---

## Cursor north star (paste before implementation)

> The homepage should feel like the first five minutes of meeting a physician who genuinely listens.
>
> Before changing any component, ask whether it increases or decreases that feeling.
>
> If a visual element competes with the physician, the story, or the primary action, simplify or remove it rather than adding new design.

---

## Tier 1 homepage status (2026-07-17)

Implemented on `/` only (local; not yet required to be production-deployed):

- Bright cream editorial hero (no dark frost)
- Relationship H1 + one sentence
- One primary CTA + “Meet our physicians”
- Physician portrait as brand signal
- Removed ATF pills, twin buttons, Explore ADHD, trust counters
- Mobile sticky reveals after hero scroll

**Known follow-ups (not Tier 1):** candid photography (current portrait is arms-crossed office); simplified nav IA; Tier 2 section rhythm.

## Emotional flow (homepage)

Correct order:

```
I feel seen.
  ↓
I understand what Siya is.
  ↓
I trust the physicians.
  ↓
I understand how care works.
  ↓
I know my next step.
```

Wrong order (current pattern):

```
Here's a problem → here's a service → another button → explore ADHD
```

---

## Per-page: What should the visitor feel?

| Page | Feel (first 5 seconds) |
| --- | --- |
| **Homepage** | Safe · Heard · Curious |
| **ADHD Care** | Recognized · Hopeful · Ready to take the screening |
| **Meet & Greet** | Low pressure · Personal · Simple |
| **Weight Loss** | Encouraged · Not judged · Optimistic |
| **About / Care Team** | These are the people I want caring for me |
| **Educational pillars** | Understood · Oriented · Invited to care (not sold) |

If the design doesn’t create those emotions, polish doesn’t matter.

---

## Homepage hero (Tier 1)

| Feel | How |
| --- | --- |
| Safe | Bright, warm, quiet chrome — no dark frosted “consultant” card |
| Heard | Relationship copy (recognition + hope + credibility), not vague “something feels off” alone |
| Curious | One clear next step — Meet & Greet — not “Explore ADHD” in the hero |

**Hero max:** Large human · Headline · One sentence · One primary button · One secondary link.

Forbidden ATF: twin Meet & Greets · pills · trust counters · Explore ADHD as hero CTA · badge walls.

---

## Logo & nav (Tier 1 if low-risk)

- Logo: slightly larger, more breathing room, crisp ® — intentional premium brand, not squeezed  
- Nav: breathe — `Logo · Care · ADHD · About · Resources · Book` spacing, not packed string  
- Redirect/chrome pages: same brand mark everywhere (consistency = trust)

---

## Copy direction (relationship, not problem-only)

Vague “something feels off” can belong to therapy, hormones, coaching, etc. Prefer grounded relationship lines, e.g.:

- You’ve tried harder. Maybe it’s time to look deeper.  
- You know something isn’t right. Let’s figure it out together.  
- Healthcare starts with being heard.

Final hero line may be chosen during Tier 1; must land **Recognition + Hope + Credibility**.

---

## Related

`VISUAL-LANGUAGE-V2-GUARDRAILS.md` · `VISUAL-LANGUAGE-V2.md` · `BRAND-BENCHMARK-BASELINE.md`
