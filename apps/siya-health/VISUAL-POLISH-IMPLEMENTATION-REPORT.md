# Visual Polish Implementation Report

**Date:** 2026-06-04  
**Scope:** Highest-impact fixes from `VISUAL-SCREENSHOT-AUDIT.md` — user-facing visual consistency only (no content strategy rewrites, no new blogs).  
**Verification:** `npm run build` succeeded; screenshots re-captured via `node scripts/capture-visual-audit.mjs` (64 PNGs overwritten in `docs/visual-audit-screenshots/`).

---

## Files changed

| File | Change summary |
|------|----------------|
| `styles.css` | Mobile hero height (auto + padding); ADHD dual CTA row; featured grid 3-col; card footer flex; Health Guides 2×2 + full-row; chat widget mobile offset |
| `mens-health-longevity.html` | Hero image + CTA pair; mobile nav label; deferred chat |
| `blog/index.html` | Hero CTAs; featured capped at 6; ADHD hub trimmed to 6 + view-all; weight hub 3 cards; deferred chat |
| `adhd-care.html` | Hero primary/secondary CTA hierarchy; deferred chat |
| `weight-loss-metabolic-health.html` | Body image → `care-team.png`; deferred chat |
| `index.html` | Deferred chat loader |
| `telehealth.html` | Deferred chat loader |
| `scripts/generate-answer-pages.mjs` | Hub grid full-row telehealth; energy preview up to 3 guides |
| `scripts/deferred-chat-widget.js` | **New** — scroll/timeout delayed LeadConnector load |
| `answers/index.html` | Regenerated (hub layout classes) |

---

## Issues fixed (by priority)

### 1. Men's Health hero image
- **Before:** `healthy-lifestyle.png` (off-message walking stock).
- **After:** `doctor-video-consult.png` (physician telehealth, on-brand).
- **Screenshot:** `docs/visual-audit-screenshots/1440/mens-health-hero.png`

### 2. Duplicate Meet & Greet CTAs
- **Men's Health:** Primary “Book a Meet & Greet”; secondary “Explore Care Options” → `#services`.
- **Blog hub:** Primary “Book a Meet & Greet”; secondary “Browse Health Guides” → `/answers`.
- **Screenshot:** `mens-health-hero.png`, `blog-hub-hero.png`

### 3. ADHD header vs hero CTA hierarchy
- **Header (funnel):** Unchanged — “Start Free Screening” on `/adhd-care` (appropriate for ADHD funnel).
- **Hero:** Primary “Book ADHD Evaluation”; secondary button “Start Free Screening” (replaces ambiguous text link).
- **Screenshot:** `adhd-care-hero.png`, `iphone15pro/adhd-care-hero.png`

### 4. Weight-loss hero image repetition
- **Hero:** Still `weightloss-hero.png`.
- **Body:** `healthy-lifestyle.png` → `care-team.png`.
- **Screenshot:** `weight-loss-full.png` (scroll to body section)

### 5. Health Guides hub layout
- **CSS:** 2×2 grid from 700px; fifth card (`Telehealth & Care`) spans full width via `health-guides-card--full-row`.
- **Energy category:** Generator shows up to 3 guide links when available (reduces empty card feel).
- **Screenshot:** `health-guides-full.png`

### 6. Blog hub layout
- **Featured:** 8 → **6** posts; grid **3 columns** at ≥900px (clean 2×3, no 4+2 orphan).
- **ADHD section:** 19 → **6** cards + “View all ADHD articles →”.
- **Weight section:** 4 → **3** cards (removes 3+1 orphan) + view-all link.
- **Screenshot:** `blog-hub-full.png`

### 7. Equal-height card footers
- `.blog-card-link { margin-top: auto; }` (blog cards already `flex-direction: column`).
- `.health-guides-card-cta { margin-top: auto; }` (service cards already had pinned buttons).
- **Screenshot:** Compare card rows in `blog-hub-full.png`, `health-guides-full.png`

### 8. Mobile hero height
- **Before:** `min-height: 50vh` on ≤899px.
- **After:** `min-height: auto`; `padding: 88px 0 40px`; tighter trust bar / testimonial on mobile.
- **Screenshot:** `iphone15pro/*-hero.png`, `android390/*-hero.png`

### 9. Chat widget overlap mitigation
- **Deferred load:** `scripts/deferred-chat-widget.js` on homepage, blog hub, ADHD, weight, men's, telehealth (after 100px scroll or 10s).
- **CSS offset:** Chat widgets shifted up when `.mobile-sticky-cta` present (88px bottom).
- **Note:** Other HTML pages still use immediate LeadConnector embed until migrated.

### 10. This report + re-capture
- Completed in this document.
- All audit viewports re-captured (see below).

---

## Screenshots regenerated

**Script:** `node scripts/capture-visual-audit.mjs`  
**Base URL:** `http://127.0.0.1:8877`  
**Output:** `docs/visual-audit-screenshots/{1440|1280|iphone15pro|android390}/{page}-hero|full}.png`

| Viewport | Pages × 2 shots |
|----------|-----------------|
| 1440, 1280, iphone15pro, android390 | 8 pages each = **64 files** (overwritten post-polish) |

Key comparison paths (hero, desktop):

| Page | Post-polish hero PNG |
|------|----------------------|
| Men's Health | `docs/visual-audit-screenshots/1440/mens-health-hero.png` |
| Blog hub | `docs/visual-audit-screenshots/1440/blog-hub-hero.png` |
| ADHD Care | `docs/visual-audit-screenshots/1440/adhd-care-hero.png` |
| Weight Loss | `docs/visual-audit-screenshots/1440/weight-loss-hero.png` |
| Health Guides | `docs/visual-audit-screenshots/1440/health-guides-full.png` |

---

## Before / after notes (visual)

| Area | Before | After |
|------|--------|-------|
| Men's hero | Female lifestyle walk; twin Meet & Greet buttons | Male-aligned telehealth consult; single booking + explore services |
| Blog hero | Twin Meet & Greet | Booking + Health Guides browse |
| Blog featured | 8 cards / 4-col orphan row | 6 cards / 3-col balanced grid |
| Blog ADHD | Long orphan grids | 6 + view-all |
| Blog weight | 3+1 layout | 3 + view-all |
| ADHD hero | Evaluation + small text link screening | Evaluation + secondary screening **button** |
| Weight body | Same hero visual repeated | Care team photo |
| Health Guides | 3+2 auto-fill grid | 2×2 + full-width telehealth row |
| Mobile heroes | ~50vh min forced tall fold | Content-driven height; first CTA closer to fold |

---

## Remaining visual issues (not in this pass)

1. **Health Guides** still text-only hub header (no `hero-merged`) — intentional documentation tone; differs from service pages.
2. **Provider page** (`provider-lp-hero`) still a fourth hero system — out of audit priority scope.
3. **Homepage / Weight / Telehealth** hero CTAs still use “Schedule Meet & Greet” wording in places — sitewide CTA copy harmonization not requested.
4. **LeadConnector** immediate load on blog posts and secondary pages — only key audit routes use deferred loader.
5. **Men's Health** still loads Merriweather in `<head>` while other pages use Inter/Poppins — typography drift.
6. **Telehealth blog section** still 8 cards (3+3+2) — acceptable; could add view-more cap later.
7. **Chat widget CSS** selectors may not match all GHL DOM variants — verify on real device with widget loaded.

---

## Manual QA checklist

- [ ] **Men's Health** (`/mens-health-longevity`): Hero shows telehealth consult image; one Meet & Greet; secondary scrolls to services.
- [ ] **Blog hub** (`/blog`): Hero has Meet & Greet + Browse Health Guides; featured shows 6 cards in 2 rows (desktop); ADHD section shows 6 cards + view-all link.
- [ ] **ADHD Care** (`/adhd-care`): Header screening CTA; hero Evaluation + Screening buttons; no contradictory duplicate booking labels in hero.
- [ ] **Weight Loss** (`/weight-loss-metabolic-health`): Hero image differs from body `care-team.png`.
- [ ] **Health Guides** (`/answers`): Five categories in 2×2 + full-width telehealth card; Energy card lists multiple guides.
- [ ] **Mobile (≤899px):** Heroes not excessively tall; primary CTA visible without excessive scroll on ADHD, blog, men's.
- [ ] **Mobile sticky CTA + chat:** Scroll page with sticky bar; confirm chat bubble does not cover sticky CTA (after scroll loads chat).
- [ ] **Deferred chat:** On homepage, chat does not appear until scroll or ~10s.
- [ ] **Card grids:** Blog / Health Guides “Read more” / footer links align at bottom of cards in each row.
- [ ] **Build:** `npm run build` passes with no errors.
- [ ] **Screenshots:** Review `docs/visual-audit-screenshots/iphone15pro/*-hero.png` for regression.

---

## Build & audit commands run

```bash
cd apps/siya-health
npm run build
node scripts/capture-visual-audit.mjs
```

**Git:** Do not commit until stakeholder confirms screenshot improvements (per task instructions).

---

## Related documents

- Pre-polish findings: `VISUAL-SCREENSHOT-AUDIT.md`
- Capture tooling: `scripts/capture-visual-audit.mjs`
