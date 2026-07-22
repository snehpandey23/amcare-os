# Brand Experience Baseline Benchmark

**Date:** 2026-07-17  
**Surfaces:** Homepage `/` · ADHD Care `/adhd-care`  
**Viewports:** Desktop ~1440×900 · Mobile ~390×844  
**Screenshots:** `docs/benchmark-screenshots/`

These scores are **acceptance criteria** for the homepage visual refresh. Do not ship until desktop + mobile homepage hit targets (all ≥ 8, ideally 9).

---

## Screenshot index

| File | Surface |
| --- | --- |
| `siya-benchmark-homepage-desktop.png` | Homepage hero (desktop) |
| `siya-benchmark-homepage-mobile.png` | Homepage hero (mobile) |
| `siya-benchmark-adhd-care-desktop.png` | ADHD Care hero (desktop) |
| `siya-benchmark-adhd-care-mobile.png` | ADHD Care hero (mobile) |

---

## Scorecard — Homepage

| Attribute | Current | Target | Gap notes |
| --- | :---: | :---: | --- |
| Warmth | **6** | **9** | Cool blue overlays dominate; lifestyle photo is warm but masked by clinical tint |
| Trust | **8** | **9** | Credentials, states, reviews present; density dilutes the human signal |
| Clarity | **8** | **9** | Message is clear; duplicate Meet & Greet CTAs + pill cluster add noise |
| Premium feel | **6** | **9** | Dark frosted card + teal twin buttons read as 2019 telehealth template |
| Emotional connection | **5** | **9** | Copy is strong; chrome sits between visitor and the person in the photo |
| Simplicity | **7** | **9** | Hero packs H1 + body + 5 pills + 2 identical CTAs + 3 links + 3 trust stats |

**Homepage average current:** ~6.7 → **target ≥ 9**

### Homepage mobile extras

- Same content density in a stacked card  
- Sticky bar repeats Meet & Greet again (3rd instance above the fold)  
- Chat bubble competes with sticky CTA  

---

## Scorecard — ADHD Care

| Attribute | Current | Target | Gap notes |
| --- | :---: | :---: | --- |
| Warmth | **5** | **9** | Heavy navy overlay; productivity/office mood over human warmth |
| Trust | **8** | **9** | Strong clinical claims + checklist; feels competent more than welcoming |
| Clarity | **8** | **9** | Path is clear (screening + Meet & Greet); hero still text-heavy |
| Premium feel | **6** | **9** | Same frosted-card pattern as homepage — competent, not elevated |
| Emotional connection | **5** | **9** | Focused man / office setting = “productivity problem,” not “understood” |
| Simplicity | **6** | **9** | H1 + sub + body + states + 3 bullets + 2 CTAs + disclaimer box |

**ADHD Care average current:** ~6.3 → **target ≥ 9** (after homepage language is locked)

---

## Observed patterns to fix (visual only)

1. **Duplicate primary CTAs** in the same viewport (homepage especially).  
2. **Frosted dark content cards** over full-bleed photos — template telehealth.  
3. **Cool blue overlays** fighting warmth targets.  
4. **Above-the-fold density** (pills, checklists, disclaimers all in hero).  
5. **Photography** OK quality but presentation (mask + card) blocks emotional connection.  
6. **Mobile sticky + chat + hero CTAs** = CTA pile-up.

---

## What “done” looks like (homepage)

### Scorecard gate

| Attribute | Minimum to ship |
| --- | :---: |
| Warmth | ≥ 8 |
| Trust | ≥ 8 |
| Clarity | ≥ 8 |
| Premium feel | ≥ 8 |
| Emotional connection | ≥ 8 |
| Simplicity | ≥ 8 |

Ideal: all **9**. Prefer shipping late over “nicer colors” that still score 6–7.

### Ship checklist (Visual Language v2)

- [ ] Above-the-fold: one primary message  
- [ ] Hero: one dominant human image  
- [ ] Max two CTAs in hero (one primary, one secondary)  
- [ ] No dark frosted overlays  
- [ ] Mobile hero: one screen, not crowded  
- [ ] Trust supports hero — does not compete  
- [ ] First section after hero = “Why Siya?” before feature lists  
- [ ] Lighthouse / CWV do not regress  
- [ ] SEO, schema, analytics, conversion tracking unchanged  
- [ ] 5-second test: physician-led · personal · next step  

### CTA nuance

Duplicate Meet & Greet down-page is fine. Two identical primaries **in the same section** is not.

---

## Gate before Cursor implementation

- [x] Design System v2 · inspiration · baseline · `VISUAL-LANGUAGE-V2.md`  
- [x] Direction approved (density-first, human rule, tiers)  
- [x] Concept **B+A+** locked (`HOMEPAGE-CONCEPTS-A-B-C.md`)  
- [x] Guardrails (`VISUAL-LANGUAGE-V2-GUARDRAILS.md`)  
- [ ] Say **go** → Tier 1 homepage only  

ADHD Care inherits language. SEO frozen until after homepage language ships.
