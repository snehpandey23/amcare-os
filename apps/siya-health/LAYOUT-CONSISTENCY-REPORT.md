# Layout Consistency Report — Siya Health

**Scope:** `apps/siya-health/` (144 HTML pages, single `styles.css`)  
**Method:** Static HTML grid inventory + CSS breakpoint mapping (no live screenshots captured in this pass)  
**Date:** 2026-06-02  

**Screenshot references:** Not attached. For visual confirmation, capture at **390×844** (iPhone 13), **393×852** (iPhone 15 Pro), **412×915** (Pixel), and **360×800** (small Android) on: `/`, `/blog`, `/answers`, `/adhd-care`, `/providers/dr-sneh-pandey`.

---

## Executive summary

| Area | Status | Primary issue |
|------|--------|----------------|
| Homepage sections | Good with exceptions | Duplicate H2 in reviews; 6 testimonials OK at 3-col |
| Service / icon cards | Good | 6 cards → clean 3×2 at desktop |
| Health Guides hub | Needs work | 5 category cards → 3+2 imbalance; Energy category visually thin |
| Blog hub | Needs work | Featured row uses 7 cards in 4-col grid; category sections have orphan rows |
| Provider cards | Good | 3-up team grid on About is balanced |
| CTA blocks | Mostly consistent | Mixed button stacks (2 vs 3 CTAs) across heroes |

---

## Findings by page / section

### Homepage (`index.html`)

| Section | Grid class | Card count | Desktop columns | Issue | Recommended layout | Severity |
|---------|------------|------------|-----------------|-------|-------------------|----------|
| How Care Works | `.flow-cards` | 3 | 3 | Balanced | Keep 3×1 | Low |
| Our Services | `.icon-cards-3col` | 6 | 3 (≥900px) | Balanced 2×3 | Keep | Low |
| Verified Patient Experiences | `.testimonial-cards-grid` | 6 | 3 (≥1024px) | Balanced 2×3; variable quote lengths → **unequal card heights** | Add `align-items: stretch` + `flex: 1` on `.testimonial-text` (already stretch on grid); cap quote lines or min-height footer | Medium |
| Reviews header | `.section-header` | — | — | **Duplicate titles:** `.reviews-label` + `<h2>Verified Patient Experiences</h2>` | Single H2 only | Low |
| Hero CTAs | `.hero-ctas` | 3 actions | stacked ≤640px | Primary + secondary + text link; link not full-width like buttons → **misaligned tap targets** | Stack all three full-width on mobile or group link under buttons | Medium |
| FAQ | `.faq-accordion` | — | — | Accordion OK | — | Low |

### Health Guides hub (`answers/index.html`)

| Section | Grid class | Card count | Issue | Recommended layout | Severity |
|---------|------------|------------|-------|-------------------|----------|
| Category hub | `.health-guides-hub-grid` | **5** | `auto-fill, minmax(280px)` → **3+2** at ~1100px; **2+2+1** at mid widths | **Option A:** 2×2 + full-width “Telehealth & Care” row. **Option B:** 6th placeholder “Coming soon” card for Energy. **Option C:** single-column category list on hub, cards only on sub-hubs | **High** |
| Energy & Fatigue card | same | **1 guide** | Card is **short vs neighbors** (empty list feel, uneven height) | Merge with Metabolic until ≥3 guides, or show “More guides coming” stub links | **High** |
| In-card lists | `.health-guides-card-list` | 4–5 visible + expand | List lengths differ → **CTA border-top misaligned** across row | `display: flex; flex-direction: column; flex: 1` on card (partially present); ensure `.health-guides-card-cta { margin-top: auto }` | Medium |

### Blog hub (`blog/index.html`)

| Section | Grid class | Card count | Breakpoint behavior | Issue | Recommended layout | Severity |
|---------|------------|------------|---------------------|-------|-------------------|----------|
| Featured & Trending | `.blog-grid.blog-featured-grid` | **7** | 1 → 2 (640px) → 3 (900px) → **4 (1100px)** | At ≥1100px: **4+3** rows; at 900px: **3+3+1** | Trim to **6 or 8** cards, or use **2×2** featured + “More trending” link; drop 4-col until count % 4 === 0 | **High** |
| ADHD category block | `.blog-grid` | **22** | 3-col at 900px | Last row **1 orphan** (22 mod 3) | Paginate / “Show more”; or 2-col masonry for long index | Medium |
| Telehealth category | `.blog-grid` | **7** | 3-col | **3+3+1** | Add 2 posts or show 6 + link | Medium |
| Weight-loss block | (verify count) | ~11–14 | 3-col | Possible 2 orphans | Round to 12 or 15 | Low–Medium |
| Browse by category | `.blog-hub-categories` | 4 links | flex | OK | — | Low |
| Inline layout | `style="..."` on section headers | — | — | **Inconsistent spacing** vs `.section-header` elsewhere | Move to CSS utilities | Low |

### About (`about.html`)

| Section | Grid class | Count | Issue | Recommended | Severity |
|---------|------------|-------|-------|-------------|----------|
| Care team | `.about-team-grid` | 3 | Perfect 1×3 | Keep | Low |
| How care works | `.about-how-steps` | 4 | 2×2 → 4×1 at 960px | Balanced | Low |
| Medical director | `.about-md-highlight` | — | Split layout OK | — | Low |

### Membership pricing (`membership-pricing.html`)

| Section | Grid class | Count | Issue | Recommended | Severity |
|---------|------------|-------|-------|-------------|----------|
| Who This Is For | `.why-choose-grid` | **4** | At **900px: 3-col → 3+1 orphan** | Force **2×2** until 1200px or add 2 filler value props | **High** |
| Choose Your Plan | `.pricing-grid-three` | 3 | Balanced | Keep | Low |

### ADHD care (`adhd-care.html`)

| Section | Notes | Severity |
|---------|-------|----------|
| Trust metrics | Uses `.trust-metrics-adhd-rewrite` (single column) — **intentional** departure from 6-card grid | Low |
| Service / pricing sections | Mix of `.pricing-grid`, `.card-grid` — audit per section when editing | Medium |

### Geo / SEO landing pages (`adhd-diagnosis-*.html`, `adult-adhd-diagnosis.html`, etc.)

| Issue | Recommended | Severity |
|-------|-------------|----------|
| **~10 inline `style=` attributes** per page | Migrate to shared landing section classes | Medium |
| Repeated template blocks → **uneven gutters** vs main marketing pages | One shared `.geo-landing` layout partial | Medium |

### Provider pages (`providers/*.html`)

| Section | Issue | Recommended | Severity |
|---------|-------|-------------|----------|
| Hero | `.provider-lp-hero-inner` 2-col | Photo + long H1; OK desktop | Low |
| CTAs | Two `.button` + duplicate screening URL | Clear primary/secondary labels | Low |
| Body | No card grid | — | Low |

### Answer pages (`answers/*.html`) & blog articles

| Pattern | Issue | Severity |
|---------|-------|----------|
| `.cta-block` / `.cta-band` | Generally centered; **blog-cta** repeated mid-article | Low |
| Related guides | List, not grid | Low |
| Long unbroken article width | OK with `.container` | Low |

### Legacy service pages (`primary-urgent-care.html`, `labs.html`, `prescriptions.html`)

| Issue | Severity |
|-------|----------|
| Older section structure; not aligned with homepage card system | **Medium** |

---

## Cross-cutting layout issues

### 1. Uneven card counts (priority)

| Pattern | Example | Visual result | Fix |
|---------|---------|---------------|-----|
| 7 in 4-col | Blog featured | 4+3 | 6 or 8 cards |
| 5 in auto-fill | Health Guides | 3+2 | 2×2 + banner or 6 categories |
| 4 in 3-col | Pricing “who” | 3+1 | 2×2 grid |
| 22 in 3-col | Blog ADHD list | …+1 | Pagination |

### 2. Different card heights

| Component | Cause |
|-----------|--------|
| `.blog-card` | `flex: 1` on `p` helps; titles 1–3 lines vary |
| `.health-guides-card` | List count + expand pattern |
| `.testimonial-card-premium` | Tag count + quote length |
| `.why-choose-card` | `border-radius: 20px` vs `var(--radius)` elsewhere — subtle visual inconsistency |

**Recommendation:** Standardize on flex column cards with `margin-top: auto` on bottom links/buttons (blog cards already close).

### 3. Misaligned buttons

| Location | Issue |
|----------|--------|
| `.service-card .button` / `.icon-card` | Text links (`.care-beyond-link`) vs `.button` on other cards |
| Homepage hero | `.hero-cta-link` not in button system |
| About team cards | All `secondary` — aligned OK |
| Blog cards | Text link “Read More →” — consistent |

### 4. Uneven spacing & gutters

| Source | Detail |
|--------|--------|
| Section padding | `--section-padding` 80px / mobile 40px — consistent |
| Grid gaps | Mostly `24px` (`--gap`) but **20px** on icon-cards, **16px** on comparison |
| Container | `padding: 0 24px` — consistent |
| Blog index | Inline `margin-bottom` overrides |

### 5. Visual imbalance & whitespace

| Area | Note |
|------|------|
| Blog index | Very long scroll; category anchors help but **empty perceived rhythm** between huge grids |
| Health Guides Energy card | Obvious **empty whitespace** in card body |
| Homepage hero | `min-height: 58vh` — large top whitespace on mobile (see Mobile audit) |

### 6. Sections that feel incomplete

- Health Guides → Energy & Fatigue (1 guide)
- Featured blog comment says “3–4 posts” but **7** rendered
- `primary-urgent-care`, `labs`, `prescriptions` — thin vs repositioned homepage

---

## Recommended layout system (sitewide)

| Use case | Layout | Breakpoints |
|----------|--------|-------------|
| Hub categories (5–6 items) | **2×2 + 1 full-width** or **3×2** with 6 items | 1 col mobile |
| Featured content | **2×2** max, never 4-col with odd count | cap 4 or 8 |
| Long indexes (blog, guides list) | **2-col** tablet, **3-col** desktop + pagination | avoid 20+ visible cards |
| Testimonials | **3-col** only with count % 3 === 0 | else 2-col |
| Pricing tiers | **3-col** or **2-col** | never 4 items on 3-col |

---

## Severity legend

- **High:** Visible imbalance on common viewports (1280px, 390px).
- **Medium:** Noticeable on careful review or specific pages.
- **Low:** Polish / consistency.

---

## Suggested fix order

1. Blog featured grid: 6 or 8 cards (High)
2. Health Guides: 5-card layout + Energy content (High)
3. Membership `why-choose-grid`: 2×2 at tablet (High)
4. Blog category orphan rows: pagination or trim (Medium)
5. Card flex footers + remove duplicate homepage H2 (Medium)
