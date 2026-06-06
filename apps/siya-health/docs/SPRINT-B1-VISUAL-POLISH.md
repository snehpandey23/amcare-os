# Sprint B1 — Visual Polish Only

**Status:** Implemented (SAFE items only)  
**Date:** June 6, 2026  
**Measurement guard:** Does not modify Sprint A conversion surfaces (hero, CTAs, screening, analytics, trust/FAQ copy)

---

## Guardrails (unchanged)

| Surface | Status |
|---------|--------|
| Hero copy / CTAs | **No change** |
| CTA hierarchy / booking URLs | **No change** |
| ADHD funnel / screening flow | **No change** |
| Trust section copy | **No change** |
| FAQ copy | **No change** |
| `data-siya-track` / analytics JS | **No change** |

---

## Item classification & impact

| # | Change | Class | Files | Visual impact | SEO | Conversion risk |
|---|--------|-------|-------|---------------|-----|-----------------|
| 1 | Footer visual redesign | **SAFE** | `styles.css`, `site-chrome.mjs` | Higher polish, clearer columns | Low+ | **Low** — bottom-of-page |
| 2 | Footer guide hub links | **SAFE** | `site-chrome.mjs` | Better discoverability | **Positive** — internal links to `/answers/*` | **Low** — additive only |
| 3 | Provider card redesign | **SAFE** | `styles.css`, `site-chrome.mjs` | Cards feel more premium, clickable | None | **Low** — profile-only links |
| 4 | View Profile button emphasis | **SAFE** | `site-chrome.mjs`, `styles.css` | Clearer affordance | None | **Low** — pre-conversion trust |
| 5 | Provider photo emphasis (128px) | **SAFE** | `site-chrome.mjs`, `styles.css` | Human trust ↑ | None | **Low** |
| 6 | Founder section rebalance | **SAFE** | `styles.css` | Founder parity with copy | None | **None** |
| 7 | Testimonial alignment | **SAFE** | `index.html`, `styles.css` | Eyebrow + H2 cohesive | None | **None** — copy unchanged |
| 8 | Nav typography | **SAFE** | `styles.css` | Legibility ↑ | None | **Low** — nav CTA unchanged |
| 9 | Homepage spacing | **SAFE** | `styles.css` | Rhythm / professionalism | None | **None** |
| 10 | Visual consistency refinements | **SAFE** | `styles.css` | Unified section headers | None | **None** |

### Wait until Sprint B2

| Change | Why wait |
|--------|----------|
| Provider section H2 / lead copy rewrite | Messaging / trust tone — Sprint B scope |
| Trust section compliance reshape | Copy + compliance — Sprint B |
| Pathway secondary link IA | Navigation architecture — Sprint C |
| Membership band copy / CTA prominence | Mid-funnel conversion narrative |
| Hero / final CTA visual weight changes | Confounds Sprint A measurement |
| Remove/reorder footer “Talk to a Clinician” | CTA hierarchy |
| Siya Circle™ copy change | Copy change, not visual-only |

---

## Implementation summary

- **CSS block** `/* Sprint B1 visual polish */` in `styles.css`
- **Footer hubs** injected sitewide via `injectFooterGuideHubs()` in `site-chrome.mjs`
- **Provider cards** regenerated via `buildHomepageCareTeam()` (128px photos, profile button)
- **Testimonials** eyebrow moved inside `.section-header` on `index.html` only

---

## Sprint A measurement compatibility

| Risk | Mitigation |
|------|------------|
| Bounce rate shift from layout | Changes below fold + CSS-only above fold (nav size) |
| CTA click attribution | No `data-siya-track` DOM changes |
| Screening funnel | No screening URL/copy changes |
| Hero CTR | Hero HTML untouched |

**Recommendation:** Monitor bounce rate; if ±10% anomaly in first 48h, pause further visual deploys until Day 14.
