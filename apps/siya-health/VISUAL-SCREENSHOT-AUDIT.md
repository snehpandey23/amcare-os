# Visual Screenshot Audit — Siya Health

**Date:** 2026-06-04  
**Method:** Headless Chromium (Playwright) rendering against local static server (`http://127.0.0.1:8877`). **Not** HTML/CSS-only inference.  
**Capture script:** `scripts/capture-visual-audit.mjs`  
**Assets:** `docs/visual-audit-screenshots/{viewport}/{page-id}-{hero|full}.png`

> **Post-polish (2026-06-04):** Screenshots in `docs/visual-audit-screenshots/` were **regenerated** after visual polish (see `VISUAL-POLISH-IMPLEMENTATION-REPORT.md`). Findings below describe the **pre-polish** state; re-review hero/card sections against new PNGs before closing QA.

---

## Viewports captured

| ID | Width × height | Device class |
|----|----------------|--------------|
| `1440` | 1440 × 900 | Desktop |
| `1280` | 1280 × 800 | Desktop (laptop) |
| `iphone15pro` | 393 × 852 @3x | iPhone 15 Pro |
| `android390` | 390 × 844 @2.75x | Small Android |

### Pages captured (8)

| Page ID | URL path |
|---------|----------|
| `homepage` | `/` |
| `health-guides` | `/answers/` |
| `blog-hub` | `/blog/` |
| `adhd-care` | `/adhd-care.html` |
| `weight-loss` | `/weight-loss-metabolic-health.html` |
| `mens-health` | `/mens-health-longevity.html` |
| `telehealth` | `/telehealth.html` |
| `provider-sneh` | `/providers/dr-sneh-pandey.html` |

**Per page:** viewport hero (`*-hero.png`) + full scroll (`*-full.png`) = **64 screenshots** total.

### Screenshot index (hero — desktop 1440)

| Page | Screenshot |
|------|------------|
| Homepage | `docs/visual-audit-screenshots/1440/homepage-hero.png` |
| Health Guides | `docs/visual-audit-screenshots/1440/health-guides-hero.png` *(first screen = text header)* |
| Blog hub | `docs/visual-audit-screenshots/1440/blog-hub-hero.png` |
| ADHD Care | `docs/visual-audit-screenshots/1440/adhd-care-hero.png` |
| Weight Loss | `docs/visual-audit-screenshots/1440/weight-loss-hero.png` |
| Men's Health | `docs/visual-audit-screenshots/1440/mens-health-hero.png` |
| Telehealth | `docs/visual-audit-screenshots/1440/telehealth-hero.png` |
| Dr. Sneh Pandey | `docs/visual-audit-screenshots/1440/provider-sneh-hero.png` |

**Mobile examples:** `iphone15pro/homepage-hero.png`, `iphone15pro/blog-hub-hero.png`, `android390/adhd-care-hero.png`

---

## 1. Hero consistency

### Observed hero systems (4 distinct patterns)

| System | Pages in audit set | Visual traits |
|--------|-------------------|---------------|
| **A — `hero-merged` glass card** | Homepage, ADHD, Weight Loss, Telehealth, Blog | Full-bleed photo + blue gradient; **left** dark rounded panel; trust row inside panel |
| **B — `hero-fullwidth` glass card** | Men's Health | Same card treatment but **different** CSS block (`hero-fullwidth-inner`); feels slightly taller/ wider text block |
| **C — `provider-lp-hero` split** | Dr. Sneh Pandey | **No** full-bleed photo; white page; headline left, **rounded headshot** right; credential pills |
| **D — Text-only hub header** | Health Guides | No imagery; H1 + lead only; large top whitespace |

### Comparison matrix (1440px screenshots)

| Dimension | Homepage | ADHD | Weight | Men's | Telehealth | Blog | Health Guides | Provider |
|-----------|----------|------|--------|-------|------------|------|---------------|----------|
| **Approx. fold height** | ~85vh | ~85vh | ~85vh | ~80vh | ~75vh | ~70vh | ~35vh | ~55vh |
| **Headline width** | Medium (2 lines) | **Wide** (3–4 lines; price in H1) | Medium | Medium | Medium | Medium | Full column | **Narrow column** (long emotional H1) |
| **Primary CTA** | Teal + secondary grey | Teal “Book ADHD Evaluation” | Teal “Schedule Meet & Greet” | **Two** teal/grey Meet & Greet | Teal “Schedule…” | Teal + grey (duplicate labels) | None in hero | Navy + outline |
| **Header CTA** | Meet & Greet | **Start Free Screening** | Meet & Greet | Meet & Greet | Meet & Greet | Meet & Greet | Meet & Greet | Meet & Greet |
| **Trust badges** | 4-item grid in card | Testimonial in card (ADHD) | 4-item grid | 4-item grid | 4-item grid | 4-item grid | None | Credential pills |
| **Background image** | `hero-telehealth-main.png` | `adhd-focus.png` | `weightloss-hero.png` | `healthy-lifestyle.png` | `telehealth-visit.png` | `blog-hero-doctor-consultation.png` | None | Headshot only |

### Pages that feel **larger** than others

- **ADHD Care** (`1440/adhd-care-hero.png`) — Longest H1 + bullet list + in-card testimonial → **tallest** hero card; densest above-the-fold.
- **Homepage / Weight / Telehealth** — Standard merged hero; visually “brand default.”

### Pages that feel **smaller** / disconnected

- **Health Guides** (`1440/health-guides-full.png`) — No hero imagery; reads as **documentation hub**, not marketing page.
- **Dr. Sneh Pandey** (`1440/provider-sneh-hero.png`) — Editorial layout; **different brand mode** (trust via portrait, not lifestyle stock).

### Visual inconsistency highlights

1. **Duplicate CTA labels on same hero (Men's, Blog):** “Book a Meet & Greet” + “Schedule Meet & Greet” side-by-side (`1440/mens-health-hero.png`, `1440/blog-hub-hero.png`).
2. **Header vs hero CTA mismatch (ADHD):** Nav = Screening; hero = Book Evaluation (`1440/adhd-care-hero.png`).
3. **Men's Health imagery mismatch:** Hero shows **woman** walking with water bottle while headline is men's hormone care (`1440/mens-health-hero.png`) — undermines trust.
4. **Weight Loss repeats hero photo in body** (`1440/weight-loss-full.png`) — Same walking woman appears again in “Why Siya Health” — feels template-assembled.

### Recommended: one standardized hero system

**Adopt a single `hero-merged` spec for all service/marketing pages:**

| Token | Spec |
|-------|------|
| Min-height | `clamp(520px, 72vh, 640px)` — stop 85vh on desktop |
| Layout | Background cover + `::before` gradient; **one** content card max-width 520px |
| H1 | Max 2 lines; price/offers → subhead or badge |
| CTAs | **One** primary + optional text link; same verbs site-wide |
| Trust row | Optional 4-up grid OR single testimonial — **not both** on same hero |
| Header CTA | Match hero primary action per page template |
| Imagery | Mandatory alt + topic-aligned photo (men's health → men or neutral clinical) |

**Exceptions (documented):**

- **Hub pages** (Health Guides, Blog index): lighter `page-hero` — smaller height, optional subtle tint, no stock photo required.
- **Provider LPs:** keep split layout but align type scale and button components with global system.

---

## 2. Card alignment

### Homepage (`1440/homepage-full.png`)

| Section | Grid | Issue | Severity |
|---------|------|-------|----------|
| How Care Works | 3-col | Equal heights; centered icons OK | Low |
| Our Services | 3×2 | **Equal** card heights; links bottom-aligned | Low |
| Testimonials | 3×2 | Variable quote length → **uneven tag rows**; cards equal height | Medium |
| FAQ | Accordion | OK | Low |

### Health Guides hub (`1440/health-guides-full.png`)

| Issue | Evidence | Severity |
|-------|----------|----------|
| **3 + 2 orphan row** | 5 category cards: row1 = 3, row2 = 2 empty right | **High** |
| **Extreme height skew** | ADHD card lists 4 links + “+21 more”; Energy card nearly empty | **High** |
| **CTA rail misalignment** | “Explore … care →” at different vertical positions | Medium |
| **No card icons** | Text-only lists feel utilitarian vs service pages | Medium |

**Screenshot:** `1440/health-guides-full.png`

### Blog hub (`1440/blog-hub-full.png`)

| Section | Cards | Issue | Severity |
|---------|-------|-------|----------|
| Featured | 8 cards, 4-col @1440 | **4+4 OK** but **8 featured** creates density; “Read More” **not bottom-aligned** | Medium |
| ADHD category | 3-col | **19 cards → 3+3+…+1 orphan** last row | **High** |
| Weight category | 3-col | **4 cards → 3+1 orphan** | **High** |
| Telehealth | 3-col | **8 → 3+3+2** (better) | Medium |

**Screenshot:** `1440/blog-hub-full.png` (scroll mid-page for orphan rows)

### Weight Loss (`1440/weight-loss-full.png`)

| Section | Issue | Severity |
|---------|-------|----------|
| Program Overview | **3 cards uneven height**; first card bordered, others not | Medium |
| Who This Program Is For | **5 cards → 3+2** orphan gap | Medium |
| Protocols | 3×2 — **aligned** | Low |

### Mobile card notes

- **Homepage** (`iphone15pro/homepage-hero.png`): Hero CTAs stack full-width — good; trust list stacks — long scroll before content.
- **ADHD** (`android390/adhd-care-hero.png`): Testimonial + chat widget **overlap** hero content — **High** mobile UX.

---

## 3. Image repetition

### Hero / lifestyle backgrounds (used 3+ times site-wide)

| Image | Uses (≥3) | Pages in marketing set |
|-------|-----------|-------------------------|
| `assets/images/adhd-focus.png` | **12** | ADHD Care + all geo ADHD landings |
| `assets/images/telehealth-visit.png` | **7** | Telehealth, membership, labs, legal, book-appointment |
| `assets/images/hero-telehealth-main.png` | 1 | Homepage only |
| `assets/images/weightloss-hero.png` | 1+ | Weight Loss hero **+ repeated in body** |
| `assets/images/healthy-lifestyle.png` | 1 | Men's Health (woman walking — **off-message**) |
| `assets/images/blog-hero-doctor-consultation.png` | 1 | Blog hub |

### Provider images

| Image | Uses | Recommendation |
|-------|------|----------------|
| `dr-sneh-pandey.png` | About team, provider LP, homepage story | Keep; standardize crop/size (88px team vs 280px LP) |
| `dr-natasha-desai.png` / `dr-swati-pandey.png` | About team only | OK |

### Trust / logo clutter (48+ pages)

| Image | Uses | Recommendation |
|-------|------|----------------|
| `hipaa-compliant.png` | 48 | Use **one** footer/trust strip component, not repeated blocks |
| `creyos-logo.png` | 48 | ADHD pages only — remove from non-ADHD footers |
| `siya-health-logo.png` | 330+ | Expected |

### Icons (flow steps)

| Image | Uses | Recommendation |
|-------|------|----------------|
| `icons/icon12.svg`, `icon5.svg` | Homepage + ADHD + Telehealth “How it works” | Acceptable (6×) — or swap to CSS icon set |

### Flag: same asset **on same page** twice

| Image | Page | Screenshots |
|-------|------|-------------|
| `weightloss-hero.png` | Weight Loss hero + “Why Siya Health” column | `1440/weight-loss-hero.png`, `1440/weight-loss-full.png` |

**Recommendation:** Retire duplicate in-body photo; use care-team or clinic still.

---

## 4. Visual rhythm

### Strong rhythm (premium, predictable)

- **Homepage** — White / tinted alternation; clear section headers; consistent `section-padding` (`1440/homepage-full.png`).
- **ADHD / Telehealth** — Hero → white content → tinted bands; familiar scroll cadence.

### Cramped

- **Blog hub** — Long scroll of text-only cards with no thumbnails; ADHD section feels **wall of links** (`1440/blog-hub-full.png`).
- **ADHD Care mobile hero** — Too much in one viewport (bullets + testimonial + chat) (`android390/adhd-care-hero.png`).

### Empty / sparse

- **Health Guides** — Large gap between H1 and first card; Energy category visually “hollow” (`1440/health-guides-full.png`, `iphone15pro/health-guides-hero.png`).
- **Men's Health hero** — Right 50% of hero is **empty grass/path** (subject left-weighted in photo) (`1440/mens-health-hero.png`).

### Inconsistent transitions

- **Provider page** jumps from white hero to tinted section with no full-bleed bridge (`1440/provider-sneh-full.png`).
- **Men's Health** uses `hero-fullwidth` vs `hero-merged` — subtle padding/width shift vs Weight Loss.

### Global distraction

- **LeadConnector chat** appears on all captures (bubble + blue FAB) — overlaps CTAs/testimonials; affects perceived polish on every screenshot.

---

## 5. Design maturity scores

Scores **1–10** (10 = best-in-class DTC telehealth). Based on rendered screenshots, not code.

| Page | Professionalism | Consistency | Premium feel | Trust | **Avg** |
|------|-----------------|-------------|--------------|-------|---------|
| **Homepage** | 8 | 8 | 8 | 8 | **8.0** |
| **ADHD Care** | 8 | 6 | 7 | 8 | **7.3** |
| **Weight Loss** | 7 | 6 | 6 | 7 | **6.5** |
| **Men's Health** | 6 | 5 | 5 | 5 | **5.3** |
| **Telehealth** | 8 | 7 | 7 | 8 | **7.5** |
| **Health Guides** | 7 | 5 | 5 | 8 | **6.3** |
| **Blog hub** | 7 | 5 | 5 | 7 | **6.0** |

### Notes driving scores

- **Men's Health** — Lowest: wrong gender in hero, duplicate CTAs, `hero-fullwidth` drift, Merriweather font load on page (legacy) reduces consistency with Poppins/Inter sitewide.
- **Blog / Health Guides** — Functional but not “premium magazine”; grid orphans and text-only cards.
- **Homepage** — Strongest holistic polish; 3×2 service grid balanced.
- **Provider** (not in table above but audited): High trust via portrait; **inconsistent** with service-page heroes — would score ~7.5 trust, 6 consistency.

---

## 6. Top 25 visual improvements

Ranked by **impact** (H/M/L) and **effort** (H/M/L). Screenshot references are relative to `docs/visual-audit-screenshots/`.

| # | Improvement | Impact | Effort | Screenshot evidence |
|---|-------------|--------|--------|-------------------|
| 1 | **Unify hero system** (one component, clamp height, drop 85vh) | H | M | All `*/ *-hero.png` |
| 2 | **Fix Men's Health hero image** (male/neutral clinical) | H | L | `1440/mens-health-hero.png` |
| 3 | **Remove duplicate Meet & Greet CTAs** on same hero | H | L | `1440/mens-health-hero.png`, `1440/blog-hub-hero.png` |
| 4 | **Health Guides: 3+2 → 2×2 + full-width 5th** or 6th stub card | H | M | `1440/health-guides-full.png` |
| 5 | **Blog hub: paginate ADHD grid** (kill 19-card orphan wall) | H | M | `1440/blog-hub-full.png` |
| 6 | **Blog featured: 6 or 8 cards only**; bottom-align “Read More” | H | M | `1440/blog-hub-full.png` |
| 7 | **Align header CTA with hero** (ADHD screening vs eval) | H | L | `1440/adhd-care-hero.png` |
| 8 | **Stop repeating weightloss hero** in body | M | L | `1440/weight-loss-full.png` |
| 9 | **Flex-grow card footers** on all `blog-card` / `health-guides-card` | H | M | Blog + Guides full |
| 10 | **Cap hero H1 to 2 lines**; move $199 to badge | M | L | `1440/adhd-care-hero.png` |
| 11 | **Provider hero: match button tokens** to global `.button` | M | L | `1440/provider-sneh-hero.png` |
| 12 | **Health Guides hub hero** — add tinted band + icon grid | M | M | `iphone15pro/health-guides-hero.png` |
| 13 | **Reduce chat widget overlap** on mobile (delay or bottom offset) | M | M | `android390/adhd-care-hero.png` |
| 14 | **Weight “Program Overview”** — equal card borders/heights | M | L | `1440/weight-loss-full.png` |
| 15 | **Who Program Is For: 6 cards or 2×2** | M | M | `1440/weight-loss-full.png` |
| 16 | **Migrate Men's Health off Merriweather** | M | L | Render check mens-health |
| 17 | **Replace `hero-fullwidth` with `hero-merged`** on Men's | M | M | Compare mens vs weight heroes |
| 18 | **Testimonial section: line-clamp quotes** for equal visual weight | M | L | `1440/homepage-full.png` |
| 19 | **Blog hero: single primary CTA** | M | L | `1440/blog-hub-hero.png` |
| 20 | **Add blog card thumbnails** (category color or photo) | M | H | `1440/blog-hub-full.png` |
| 21 | **Consolidate HIPAA/Creyos** to footer strip only | M | M | Site-wide |
| 22 | **ADHD geo pages: rotate hero crop** or sub-brand color | L | M | 12× `adhd-focus.png` |
| 23 | **1280px: verify nav doesn't wrap** (7 links + CTA) | M | L | `1280/*-hero.png` |
| 24 | **iPhone: reduce hero trust list** to 2 bullets + link | M | L | `iphone15pro/homepage-hero.png` |
| 25 | **Energy Guides card** — min-height or “coming soon” links | M | L | `1440/health-guides-full.png` |

### Quick wins (≤1 day)

#2, #3, #7, #8, #10, #11, #14, #19

### Strategic (multi-sprint)

#1, #4, #5, #6, #9, #20

---

## Appendix A — 1280 vs 1440

At **1280**, hero cards consume **proportionally more** of the viewport (less horizontal photo visible). No nav wrap observed on captured pages. Recommend spot-check `1280/adhd-care-hero.png` for H1 line breaks (4 lines → pushes CTAs down).

## Appendix B — Regenerating screenshots

```bash
cd apps/siya-health
python3 -m http.server 8877   # terminal 1
node scripts/capture-visual-audit.mjs   # terminal 2
```

Requires one-time: `npx playwright install chromium`

## Appendix C — Comparison to prior CSS-only audit

`LAYOUT-CONSISTENCY-REPORT.md` and `DESIGN-SYSTEM-AUDIT.md` predicted several issues (blog 7→4-col, guides 3+2, orphan rows). **This screenshot pass confirms them visually** and adds hero-level inconsistencies (Men's image, duplicate CTAs, provider split layout) not visible in markup alone.

---

**Auditor:** Automated capture + visual review of PNG renders  
**Next review:** After hero system refactor — re-run capture script and diff `1440/*-hero.png`
