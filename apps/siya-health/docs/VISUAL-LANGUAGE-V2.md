# Siya Visual Language v2 — Locked Direction

**Status:** B+A+ locked · Tier 1 homepage **implemented locally** · await review / deploy  
**Date:** 2026-07-17  
**Binding:** `VISUAL-LANGUAGE-V2-GUARDRAILS.md` · `FIRST-5-SECONDS.md`

---

## The one rule

Every visual change must answer:

> **Does this make Siya feel more human?**

If no → don’t do it.

---

## Success metric (not “looks like Hims”)

> **A first-time visitor can understand Siya in under 5 seconds.**

Those 5 seconds must communicate:

1. This is physician-led.  
2. This feels personal.  
3. I know what to do next.

Everything else waits until after scroll.

---

## The real bottleneck: information density

Above the fold should show:

1. A warm, authentic human face  
2. A clear promise  
3. One obvious next step  

Not competing in the same viewport: badges · pills · multiple CTA variants · trust strips · sticky bars · chat · checklists.

---

## CTA rule (nuance)

Do **not** remove CTAs merely because they repeat down the page.

| OK | Not OK |
| --- | --- |
| Hero CTA | Two identical primary buttons **in the same section** |
| Mid-page CTA | Sticky + chat + twin hero buttons all fighting at once |
| Final CTA | Multiple primary-weight buttons side-by-side |

Hierarchy matters more than count.

---

## Implementation tiers (homepage first)

### Tier 1 — Highest impact (do first)

- Remove above-the-fold clutter  
- Replace dark/frosted hero with bright editorial treatment  
- Increase hero photography size  
- One primary CTA + one secondary CTA in hero  
- Improve type scale and spacing  

### Tier 2 — After Tier 1 lands

- Reduce card density  
- Simplify trust sections  
- Soften backgrounds  
- Increase whitespace  

### Tier 3 — Polish only (last)

- Hover states · subtle motion · icons · shadows/borders  

Do not polish before hierarchy is fixed.

---

## Homepage v2 ship checklist

- [ ] Above-the-fold shows one primary message  
- [ ] Hero contains one dominant human image  
- [ ] Maximum two visible CTAs in hero  
- [ ] No dark frosted overlays  
- [ ] Mobile hero fits one screen without feeling crowded  
- [ ] Trust elements support the hero rather than compete with it  
- [ ] First content section answers “Why Siya?” before listing features  
- [ ] Lighthouse / CWV do not regress  
- [ ] SEO, schema, analytics, conversion tracking unchanged  

Plus scorecard gate from `BRAND-BENCHMARK-BASELINE.md` (all attributes ≥ 8).

---

## Locked concept: B+A+

| Weight | Source |
| ---: | --- |
| 50% | **B** structure — physician as brand |
| 40% | **A** editorial craft — photo, type, whitespace |
| 10% | **C** warmth only — soft cream, not wellness-app layout |
| Study | **One Medical** — human trust model (not Hims) |

Hero max: large human · headline · one sentence · one button · one secondary link.  
Hero must land **Recognition + Hope + Credibility**. Trust via scroll stories, not ATF counters.

## Gate before CSS

1. ✅ Strategy + benchmark + direction  
2. ✅ Concept **B+A+** chosen  
3. ✅ Guardrails (`VISUAL-LANGUAGE-V2-GUARDRAILS.md`)  
4. ⏸ Say **go** → Tier 1 homepage only  

ADHD Care and later pages inherit this language — no parallel redesigns.
