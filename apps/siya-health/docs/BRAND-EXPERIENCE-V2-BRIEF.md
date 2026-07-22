# Siya Brand Experience Phase — Design System v2 Brief

**Status:** **B+A+ locked** · Guardrails written · Await “go” for Tier 1 CSS  
**Date:** 2026-07-17  
**Principle:** **Siya Visual Language v2** — homepage is the first expression. Architecture frozen.

**Binding:** `VISUAL-LANGUAGE-V2-GUARDRAILS.md`  
**Pre-code pack:** `VISUAL-LANGUAGE-V2.md` · `DESIGN-SYSTEM-V2.md` · `DESIGN-INSPIRATION-BOARD.md` · `BRAND-BENCHMARK-BASELINE.md` · `HOMEPAGE-CONCEPTS-A-B-C.md` · `benchmark-screenshots/`

---

## What this is

**Visual Language v2**, not a freestyle Homepage v2 or Hims clone.

**One rule:** Does this make Siya feel more human? If no → don’t.

**Success:** Understand Siya in **under 5 seconds** — physician-led · personal · next step.

Emotional goal: “I feel understood by a real physician.”  
Bottleneck to fix: **information density**, not palette.

Inspiration for *feeling* (not layouts): Apple × Headspace × Hims × Calm — restraint, warmth, humans over chrome.

---

## Absolute freezes (do not touch)

- Routing / URLs  
- SEO metadata, canonicals, schema, sitemaps  
- Heading hierarchy and body copy on educational pillars (unless a landing’s short hero copy is explicitly in scope)  
- Internal links and entity ownership  
- Analytics, GTM, `data-siya-*` tracking, CTA destinations  
- Conversion logic (Meet & Greet, screening, evaluation paths)  
- Accessibility and responsive breakpoints (improve, don’t break)  
- Component **APIs** / class contracts where possible — restyle, don’t rename the system wholesale  

---

## Visual goals only

| Lever | Direction |
| --- | --- |
| Whitespace | +25–40% vertical rhythm |
| Photography | Larger, editorial, soft natural light; ~70% people / 30% UI on marketing surfaces |
| Cards / borders / icons | Reduce density ~50% icons; prefer plain text sections where cards aren’t interactive |
| Backgrounds | Predominantly white; subtle warm neutrals — colors disappear, people stand out |
| Typography | Larger headlines; clearer hierarchy; fewer words above the fold on landings |
| Accent | One primary CTA color; ghost/secondary elsewhere; Siya brand hues with more restraint |
| Motion | Tiny fades/slides/hovers only |
| Story flow (landings) | Hero → Understanding → Solution → Trust → Next step |

Landing targets: **~40% less visible copy above the fold**, **~50% larger photography**, **fewer competing CTAs**.  
Long-form SEO pillars stay comprehensive; chrome gets quieter.

---

## Execution order (safe)

### Week 1
1. **Design System v2 tokens** (spacing, type, surfaces, buttons, cards, photo rules) in docs + CSS variables — no mass page edits  
2. Refresh **homepage only** → before/after screenshots → approve  
3. Refresh **ADHD Care** (`/adhd-care`) — highest commercial ROI  

### Week 2
4. Refresh shared components (Hero, CTA band, trust, FAQ chrome, nav/footer)  
5. Propagate via components  
6. Mobile-first + CWV if needed  

**Never** “make the whole site look like Hims.” One page → approve language → components → rollout.

---

## Cursor / agent prompt (copy-paste when ready)

```
Do not redesign the information architecture, routing, SEO, or component structure.

Perform a visual language refresh only.

Goals:
- Increase warmth, calmness, and approachability.
- Preserve all URLs, HTML structure, headings, schema, internal links, tracking, and CTA logic.
- Keep the existing design system and component APIs intact.

Visual changes only:
- Increase whitespace by 25–40%.
- Prefer larger editorial-style photography with soft, natural lighting where assets exist.
- Reduce decorative cards, borders, and icon density where possible.
- Simplify backgrounds to predominantly white with subtle warm neutral sections.
- Increase heading size and improve typography hierarchy.
- Use a restrained accent palette while preserving Siya brand colors.
- Make marketing surfaces feel more editorial and human-centered rather than dashboard-like.
- Preserve responsiveness and accessibility.

Do not change business logic, JavaScript behavior, analytics, SEO metadata, page hierarchy, routing, or conversion tracking.

Work one page at a time. Provide before/after screenshots before proceeding to the next page.
Start with: homepage only.
```

---

## Out of scope until approved

- New photography shoots (composition rules + existing assets first)  
- Renaming CSS architecture or rewriting the design system from scratch  
- Mass class renames across 160+ pages  
- Rewriting ADHD educational pillars under the guise of “design”  
