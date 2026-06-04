# Design System Audit — Siya Health

**Source of truth:** `apps/siya-health/styles.css` (~4,000 lines) + HTML class usage across 144 pages  
**Date:** 2026-06-02  

---

## Executive summary

The site has a **documented token layer** in `:root` but **significant drift**: multiple breakpoints, border radii, shadows, hero/H1 overrides, duplicate grid utilities, and **5 legacy pages** loading **Merriweather** instead of the primary **Poppins + Inter** stack.

| Token area | Declared system | Observed variants | Health |
|------------|-----------------|-------------------|--------|
| Typography (H1) | 1 base scale | **7 contextual H1 rules** | Medium drift |
| Typography (H2) | 1 base scale | **5+ contextual rules** | Medium drift |
| Buttons | `.button` + `.secondary` | **6+ patterns** | Medium drift |
| Spacing | `--gap`, `--section-padding` | **10+ gap values** | Medium drift |
| Cards | `.card` family | **25+ card class names** | High fragmentation |
| Colors | CSS variables | **1 primary palette + legacy teal hover** | Low–Medium |
| Radius | `--radius: 10px` | **8+ radius values** | Medium drift |
| Shadows | `--shadow` | **6+ shadow recipes** | Medium drift |
| Breakpoints | Implied 768 “standard” | **7 max-width + 10 min-width** values | High fragmentation |

---

## 1. Typography

### H1 styles (count: **7 distinct rule contexts**)

| # | Selector / context | Size / behavior | Used on |
|---|-------------------|-----------------|---------|
| 1 | `h1` (global) | `clamp(32px, 5vw, 44px)` | Default pages |
| 2 | `.hero-merged h1`, `.hero-fullwidth h1` | `clamp(1.85rem, 4.5vw, 2.5rem)` | Homepage, service heroes |
| 3 | `.hero h1`, `.page-hero h1` | (inherits / hero block) | Older hero pattern |
| 4 | `.blog-header h1` | `clamp(1.75rem, 4vw, 2.25rem)` | Blog hub hero |
| 5 | `.asrs-intro h1` | `clamp(1.75rem, 4vw, 2rem)` | ADHD screening |
| 6 | `.provider-lp-hero-copy h1` | (provider-specific block ~3721) | Provider LP |
| 7 | Inline / legacy pages | Merriweather pages may **fall back** differently | `primary-urgent-care`, `labs`, etc. |

**Flag:** Redundant hero H1 rules (2 vs 3) — consolidate under `.hero-merged h1` only.

### H2 styles (count: **5+ distinct treatments**)

| Context | Treatment |
|---------|-----------|
| Global `h2` | `clamp(28px, 4vw, 36px)`, mb 16px |
| `.section-header h2` | Centered on some sections via parent |
| `.blog-card h2` | `1.15rem` — **card title, not section title** |
| `.health-guides-card-header h2` | `1.25rem` |
| `.cta-band h3` | White on blue (H3 used as band headline) |
| `.trust-metrics-rewrite-headline` | Marketing line, not semantic H2 |

**Flag:** Card-internal H2s compete visually with section H2s — consider `h3` or `.card-title` in markup for guides/blog cards.

### Body & fonts

| Role | Token | Legacy |
|------|-------|--------|
| Heading | `--font-heading`: Poppins, Inter | **Merriweather** on 5 HTML files |
| Body | `--font-body`: Inter | Same legacy files |
| Weights loaded | Inter 400–700, Poppins 300/600/700 | Merriweather 600/700 on legacy pages |

**Files with Merriweather (inconsistent palette):**

- `primary-urgent-care.html`
- `labs.html`
- `prescriptions.html`
- `book-appointment.html`
- `mens-health-longevity.html`

### Recommended primary typography scale

```css
/* Suggested tokens — align to existing clamp spirit */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;

--h1: clamp(2rem, 5vw, 2.75rem);      /* 32–44px */
--h2: clamp(1.75rem, 4vw, 2.25rem);   /* 28–36px */
--h3: 1.25rem;
--h4: 1.125rem;

--lead: clamp(1rem, 2vw, 1.125rem);
--line-height-body: 1.7;
--line-height-heading: 1.2;
```

Use **one hero class** (`.hero-merged h1`) — remove duplicate `.hero h1` sizing unless legacy pages are migrated.

---

## 2. Spacing

### Declared system

| Token | Value |
|-------|-------|
| `--section-padding` | 80px |
| `--section-padding-mobile` | 40px |
| `--gap` | 24px |
| `--container-max` | 1100px |
| Container horizontal | 24px |

### Observed spacing systems (count: **~4 parallel systems**)

| System | Examples | Issue |
|--------|----------|-------|
| CSS variables | `var(--gap)`, section padding | Preferred |
| Ad hoc rem/px | 12, 16, 20, 28, 32, 40, 48, 56, 60, 80px | Scattered in components |
| Grid gaps | 16px, 20px, 24px, 32px | Inconsistent between card types |
| Inline HTML `style=` | blog index, geo landings | Bypasses system |

**Gap value samples in CSS:** 8, 12, 16, 20, 24, 32, 48px (no single scale).

### Recommended spacing scale (4px base)

| Token | Size |
|-------|------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |

Map `--gap` → `--space-6`, section padding → `--space-20` / `--space-10` mobile.

---

## 3. Buttons

### Button variants (count: **6 functional variants**)

| Variant | Class / pattern | Appearance |
|---------|-----------------|------------|
| 1 | `.button` / `.button.primary` | Filled primary blue |
| 2 | `.button.secondary` | Outline primary |
| 3 | `.hero-cta-secondary` | Secondary on hero (homepage) |
| 4 | `.hero-cta-link` | Text link in hero stack |
| 5 | `.cta-band-buttons .button` | White on blue band (inverted context) |
| 6 | `button.primary` | Form/native (rare) |

**Usage:** `class="button"` appears **~776 times** across HTML.

**Flags:**

- `.button:not(.secondary)` treats **any** non-secondary as primary — fragile if new variants added.
- Global `@media (max-width: 640px) { .button { width: 100% } }` conflicts with **inline-flex** rows until `.hero-ctas` column stack — OK but **nav-mobile .button** also full width (good).
- **CTA copy inconsistency:** “Book a Meet & Greet” vs “Join the Waitlist” (`membership-pricing.html`) vs “Start Free Screening” — not a CSS issue but breaks button **system semantics**.

### Recommended button system

| Token class | Use |
|-------------|-----|
| `.btn` | Base |
| `.btn--primary` | One filled |
| `.btn--secondary` | Outline |
| `.btn--ghost` | Text-only (replace `.hero-cta-link`) |
| `.btn--inverse` | On `.cta-band` |
| `.btn--sm` / `.btn--lg` | Optional |

Size: keep `min-height: 48px` (accessibility). Radius: `var(--radius)`.

---

## 4. Cards

### Card style families (count: **25+ class names with “card”**)

| Family | Classes | Border radius | Shadow |
|--------|---------|---------------|--------|
| Generic | `.card`, `.card-grid` | `--radius` | `--shadow` on hover |
| Service | `.service-card`, `.service-col` | `--radius` | hover shadow |
| Blog | `.blog-card` | `--radius` | hover |
| Health Guides | `.health-guides-card` | `--radius` | default + hover |
| Testimonial | `.testimonial-card-premium` | **16px** | custom rgba |
| Pricing | `.pricing-card`, `.pricing-plan` | 10px / **16px** | mixed |
| Flow | `.flow-card` | `--radius` | border only |
| Icon | `.icon-card`, `.why-choose-card` | 10px / **20px** | mixed |
| Provider | `.provider-card`, `.about-team-card` | `--radius` | light |
| FAQ | `.faq-accordion-card` | varies | — |

**Flag:** `.why-choose-card` and `.testimonial-card-premium` use **16–20px radius** while system token is **10px** — cards feel like a different product generation.

**Flag:** `.pricing-grid-three` defined **twice** in `styles.css` (lines ~1249 and ~3436) — redundant/legacy merge needed.

### Recommended card system

| Tier | Class | Rules |
|------|-------|-------|
| Surface | `.card` | white bg, 1px `--border`, `--radius`, `--shadow` |
| Interactive | `.card--hover` | lift on hover |
| Hub | `.card--hub` | flex column + `margin-top: auto` on footer |
| Featured | `.card--featured` | optional accent border |

Eliminate duplicate aliases: `service-col` vs `service-card` → one name.

---

## 5. Colors

### Primary palette (`:root`)

| Token | Hex | Role |
|-------|-----|------|
| `--primary` | `#1e3a8a` | Brand blue |
| `--primary-hover` | `#1e40af` | Hover |
| `--accent` | `#0ea5a4` | Teal accent |
| `--text` | `#111827` | Body heading |
| `--text-secondary` | `#6b7280` | Body |
| `--text-muted` | `#9ca3af` | Muted |
| `--border` | `#e5e7eb` | Borders |
| `--bg-subtle` | `#f9fafb` | Tinted sections |

**Hard-coded duplicates:** `background-color: #1e3a8a` on heroes (should use `var(--primary)`).

### Legacy / inconsistent colors

| Location | Value | Issue |
|----------|-------|-------|
| `.health-guides-card:hover` | `rgba(0, 107, 125, 0.35)` | **Legacy teal** not in `:root` |
| Hero gradient | `rgba(30, 58, 138, …)` | OK, matches primary |
| CTA band | `var(--primary)` | OK |
| Various shadows | `rgba(0,0,0,0.04–0.08)` | Not tokenized |

**Color palette count:** **1 intentional palette** + **legacy teal accent** + **ad hoc neutrals** in shadows.

### Recommended

Add `--accent-hover`, `--focus-ring`, tokenize shadows as `--shadow-sm`, `--shadow-md`, `--shadow-lg`.

---

## 6. Borders, shadows, radius

### Border radius (count: **8+ values**)

| Value | Usage count (approx) |
|-------|----------------------|
| `var(--radius)` (10px) | 28 |
| `16px` | 17 |
| `20px` | 3 |
| `12px`, `8px`, `50%`, `999px` | pills, avatars |

**Recommendation:** `--radius-sm: 8px`, `--radius-md: 10px`, `--radius-lg: 16px` only.

### Box shadows (count: **6+ recipes**)

| Pattern | Usage |
|---------|-------|
| `var(--shadow)` | 14 |
| `0 4px 12px rgba(0,0,0,0.05–0.06)` | why-choose, testimonials |
| `0 4px 20px …` | testimonial premium |
| Custom blue tint | `rgba(30, 58, 138, 0.1)` |

**Recommendation:** 3 elevation tokens max.

---

## 7. Breakpoints (fragmentation)

### Max-width (7 values)

`599`, `639`, `640`, `767`, `768`, `899`, `1023` px

### Min-width (10+ values)

`600`, `640`, `768`, `900`, `960`, `1024`, `1100` px

**Flag:** **640 vs 639**, **767 vs 768**, **899 vs 900** — pairs differ by 1px; causes “almost aligned” layouts.

### Recommended breakpoint system

| Name | Width | Use |
|------|-------|-----|
| `sm` | 640px | 2-col cards |
| `md` | 768px | section padding, nav |
| `lg` | 1024px | 3-col grids |
| `xl` | 1280px | 4-col only when count fits |

Standardize on **640 / 768 / 1024 / 1280** only.

---

## Redundant / inconsistent / legacy styles

| Type | Item | Action |
|------|------|--------|
| Redundant | `.hero h1` + `.hero-merged h1` | Merge |
| Redundant | `.pricing-grid-three` duplicate block | Delete one |
| Redundant | `.service-col` vs `.service-card` | Deprecate one |
| Inconsistent | Merriweather pages | Switch to Poppins/Inter |
| Inconsistent | Card radii 10 vs 16 vs 20 | Map to tokens |
| Legacy | Teal hover on health-guides | Use `--accent` |
| Legacy | `.hero`, `.page-hero` gradient heroes | Migrate to `.hero-merged` |
| Inline styles | blog index, geo landings | Utility classes |

---

## Recommended unified systems (summary)

1. **Typography:** Single H1/H2 clamp scale; card titles demote to H3 or `.card__title`.
2. **Spacing:** 4px-based `--space-*`; one `--gap` alias.
3. **Buttons:** BEM-style `btn--*` variants; one inverse for CTA bands.
4. **Cards:** One `.card` base + modifiers; flex footer pattern for all hub cards.
5. **Breakpoints:** 4 breakpoints only; document in comment header of `styles.css`.
6. **Tokens:** Extend `:root` with radius, shadow, and spacing scales before adding new components.

---

## Implementation priority

| Priority | Task |
|----------|------|
| P0 | Unify breakpoints (640/768/1024) |
| P0 | Fix Merriweather legacy pages |
| P1 | Consolidate card radius + shadow tokens |
| P1 | Merge duplicate `.pricing-grid-three` |
| P2 | Rename blog/guides card headings to H3 |
| P2 | Replace inline styles on blog index + geo templates |
