# Mobile-First UX Audit — Siya Health

**Simulated viewports (CSS + markup analysis):**

| Device | CSS px | Notes |
|--------|--------|-------|
| iPhone 13 | 390 × 844 | Safari, safe-area not modeled |
| iPhone 15 Pro | 393 × 852 | Dynamic Island not modeled |
| Pixel 7/8 | 412 × 915 | Slightly wider; more 2-col chance |
| Small Android | 360 × 800 | Worst-case wrapping |

**Method:** Review of `styles.css` `@media` rules + component markup. **No device screenshots** in this pass.

**Rank legend:** **High** = blocks conversion or readability; **Medium** = friction; **Low** = polish.

---

## 1. Hero sections

| Page / pattern | Issue | Viewports | Rank |
|----------------|-------|-----------|------|
| `.hero-merged` global | `min-height: 58vh` desktop; **`50vh` at ≤899px** — tall empty gradient above fold | All phones | **High** |
| Homepage hero | **3 CTAs** (2 buttons + price link); link not full-width → uneven stack | ≤640px stacks columns | **Medium** |
| ADHD / service heroes | Long **price + geo H1** wraps 3–5 lines; pushes CTAs below fold | 360px | **High** |
| Provider LP | H1 is **emotional long-form** (multi-line); photo stacks below copy on narrow | <768px | **Medium** |
| Membership pricing | Hero has **trust bar only, no primary CTA in hero** | All | **Medium** |
| Blog hub | `.hero-merged` + category nav below — OK | Low |

**Recommendations:**

- Cap mobile hero `min-height` to `auto` + `padding-top` (e.g. 96px below header).
- Single primary CTA above fold; secondary in next section.
- `font-size` floor on H1: `max(1.5rem, …)` for 360px.

---

## 2. Navigation

| Issue | Detail | Rank |
|-------|--------|------|
| **7 nav links + CTA** in `.nav-mobile` | Long scroll in drawer; **poor thumb reach** for Blog/Health Guides | **High** |
| Transparent header on heroes | White links; scroll state OK — verify contrast on light hero images | **Medium** |
| CTA label inconsistency | “Meet & Greet” vs “Start Free Screening” vs “Join the Waitlist” | **Medium** (cognitive) |
| No sticky header shrink | Full header height on scroll | Low |
| `.nav-mobile a { white-space: nowrap }` | Long labels OK; no wrap overflow | Low |

**Recommendations:**

- Group nav: Care · Guides · Company (accordion).
- Sticky bottom **one** CTA on conversion pages (`.mobile-sticky-cta` exists but not global).

---

## 3. Cards

| Component | Mobile behavior | Issue | Rank |
|-----------|-----------------|-------|------|
| `.blog-grid` | 1 col <640px | Long index = **excessive scrolling** | **High** on `/blog` |
| `.blog-featured-grid` | 1 col | 7 cards before categories — heavy | **High** |
| `.health-guides-hub-grid` | 1 col <640px | OK; card height variance when expanded | **Medium** |
| `.icon-cards-3col` | 1 col | 6 services = long section | **Medium** |
| `.testimonial-cards-grid` | 1 col | 6 full testimonials — scroll fatigue | **Medium** |
| `.why-choose-grid` | 1 col | OK | Low |
| `.about-team-grid` | 1 col | 3 stacked — OK | Low |

**Recommendations:**

- Blog hub: collapse to **4 featured** + “View all”.
- Health Guides: accordion categories on mobile instead of 5 tall cards.
- Testimonials: carousel or show 3 + link.

---

## 4. Buttons

| Issue | CSS source | Rank |
|-------|------------|------|
| `.hero-ctas .button { flex: 1 1 0; min-width: 180px }` | Between 641–899px two buttons may **squeeze** side-by-side | **Medium** |
| Full-width buttons ≤640px | Good for tap targets (48px min-height) | — |
| Duplicate screening URLs | Provider hero — two buttons, same destination | **Low** |
| CTA band | `.cta-band-buttons` flex wrap — OK | Low |

---

## 5. Health Guides (`/answers`)

| Issue | Rank |
|-------|------|
| Hub is **long** on mobile (5 stacked category cards with lists) | **High** |
| Energy card **feels empty** — wasted whitespace | **High** |
| “+ N more” expand OK; touch target on text links is OK, not 48px | **Medium** |
| Pending review banner on child pages — adds vertical height | **Low** |

---

## 6. Blogs (`/blog` + articles)

| Issue | Rank |
|-------|------|
| Index length (**40+ cards** visible) | **High** |
| Category jump links (`ADHD on this page ↓`) — small text, **easy to miss** | **Medium** |
| Article templates: mid-page **CTA blocks** stack well (column ≤640px) | Low |
| `clinical-review--pending` blocks — extra scroll | Low |

---

## 7. Answer pages (`/answers/*`)

| Issue | Rank |
|-------|------|
| Readable single column | Low (good) |
| Related links + CTA band at bottom — thumb reach **far** | **Medium** |
| Some titles very long — wrapping OK, no horizontal overflow expected | Low |

---

## 8. Provider pages

| Issue | Rank |
|-------|------|
| Hero photo below copy — large image scroll before credentials | **Medium** |
| Badge row `.provider-lp-badges` may wrap awkwardly on 360px | **Medium** |
| CTA pair at bottom of long page | **Medium** (reach) |

---

## Cross-cutting mobile issues

### Overflow & wrapping

| Risk | Location | Mitigation in CSS |
|------|----------|-------------------|
| Horizontal overflow | Tables in articles (if any) | `.container { overflow-x }` not global — audit rich content |
| Trust bar `.hero-trust-bar` | Multiple spans | Check `flex-wrap` on hero trust |
| Long URLs | Rare | `word-break` on prose |

### Cut-off text

- Hero `overflow: hidden` on `.hero-merged` — unlikely to clip text; may clip background.
- No `line-clamp` on blog card titles — titles expand height (OK).

### CTA stacking

- **Good:** `.hero-ctas`, `.cta-block` → column at 640px.
- **Gap:** Third hero link not in column flow consistently.

### Excessive scrolling

| Page | Rank |
|------|------|
| `/blog` | **High** |
| `/answers` hub | **High** |
| `/` homepage | **Medium** (many sections) |
| Geo landing duplicates | **Medium** |

### Large whitespace

- Hero 50vh mobile
- Energy Health Guides card
- Section padding 40px mobile — acceptable

### Poor thumb reach

- Nav items at bottom of mobile menu
- Primary conversion on long blog index is **below many cards**
- Sticky CTA not enabled site-wide

---

## Viewport-specific notes

| Viewport | Extra observation |
|----------|-------------------|
| **390px** | Standard; 1-col grids dominate |
| **393px** | Same as 390 for practical CSS |
| **412px** | May show **2-col blog grid** (640 breakpoint not yet) — still 1 col |
| **360px** | H1 clamps OK; nav drawer width 100% — test logo + hamburger spacing |

---

## Priority fix list (mobile)

| Rank | Fix |
|------|-----|
| **High** | Reduce blog hub vertical length (featured cap + pagination) |
| **High** | Hero min-height auto on mobile |
| **High** | Health Guides mobile accordion + fill Energy category |
| **High** | Shorten mobile nav (grouped links + sticky CTA on money pages) |
| **Medium** | Homepage testimonial count / carousel |
| **Medium** | Provider hero: photo size / order |
| **Medium** | Hero 3rd link styling in stack |
| **Low** | Global `overflow-x: hidden` on body as safety net (prefer fixing sources) |

---

## Verification checklist (manual QA)

On each viewport, capture screenshots for:

1. `/` — hero + services + nav drawer  
2. `/blog` — featured grid + first category  
3. `/answers` — hub cards  
4. `/adhd-care` — hero + first CTA  
5. `/providers/dr-sneh-pandey` — hero stack  

Store as `docs/qa/mobile-{viewport}-{page}.png` for regression.
