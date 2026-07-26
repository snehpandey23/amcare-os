# Content Assembly System

```text
Status: Locked 2026-07-26
Scope: Every page on siya.health (guides, blogs, services, hubs)
Owner: Content OS / Editorial
```

## Hard rule

> **Every page earns every section.**
> Nothing is appended because "all pages have it."

Before any block renders, it must answer **yes** to:

> Would a human editor choose to include this block, on this page, for this reader?

If no — the block is **not rendered**.

## Page = optional blocks

```
Hero
 ↓ Main article / content
 ↓ Related Guides (optional)
 ↓ Clinical Care CTA (optional)
 ↓ Labs (optional)
 ↓ FAQs (optional)
 ↓ Sources
 ↓ Related Articles
```

Not every page gets every block. One separator between sections max; whitespace carries the rest.

## Clinical Care / next-step block — render conditions

Append a clinical-care CTA **only if all are true**:

1. It directly advances this reader's journey.
2. It references **only services relevant to this page's topic**.
3. It introduces **no unrelated states** (no state directory on educational pages).
4. It does **not** repeat navigation already present (header/footer).
5. **Maximum 3 contextual links + one button.**

Otherwise omit entirely.

State availability, when useful, is **one sentence** ("Available in California, Texas, Pennsylvania, and Florida.") — never a link directory.

## Contextual CTAs by topic

| If topic is… | Related resources |
|--------------|-------------------|
| Executive dysfunction | ADHD Screening · Executive Dysfunction Guide · ADHD Care |
| Perimenopause | Women's Midlife Care · Perimenopause Guide · Labs |
| Fatigue | Fatigue Assessment · Labs · Primary Care |
| ADHD (general) | Free ADHD Screening · How evaluation works · ADHD Care |

## Separators

- One `<hr>` (or none) between major sections.
- Never two consecutive separators.
- Prefer whitespace/section spacing over rules.

## Generator instruction (for every appender)

Replace "append block X to every page" with:

```
Render block X only if it passes the 5 render conditions above.
Else omit. Max 3 contextual links. No unrelated geography.
```

## Companion audits

- `docs/CONTENT-QA-CHECKLIST.md` — pre-publish, per article
- `docs/CONTENT-COHESION-AUDIT.md` + `scripts/content-cohesion-audit.mjs` — monthly, automated bleed detection
