# Siya Health — Website Polish Sprint (Phase 1) Changelog

Usability polish only. No new visual language. SEO, URLs, analytics, pricing, and medical claims preserved.

---

## Critical Fixes

- Restored truncated About care-team provider descriptions (full bios; removed CSS line-clamp that re-hid copy).
- Fixed About medical-director markup (extra closing `</div>` after CTA swap).
- Replaced Chat-primary CTAs with Meet & Greet on About (MD, who-we-help, final), Weight Loss (FAQ + final), and Telehealth final band (removed third Chat button).
- Normalized transparent logo (`siya-health-logo-pre-registered.png`) across header/footer on 164 HTML pages; OG/schema keep white logo asset.
- Provider hub filters hide empty category headings + empty grids when state/service filters leave a group with zero cards.

---

## Readability Improvements

- About: tighter hero lead; why-we-exist shortened with scan bullets; capitalization fix on final CTA copy.
- Homepage: shortened ADHD edu-routing (2 links); trust stats reframed away from ADHD-only wording (`750+ structured evaluations`).
- Weight Loss: hero decluttered—bullets, testimonial, and trust chips moved below the fold into a support section.
- ADHD Care: “What happens next” reduced to 3 steps; disclaimer compressed to one note; CTA count capped at 2.
- Mobile: modest section padding and lead-line spacing for scanability without layout redesign.

---

## Visual Improvements

- Larger, more prominent header logo sizing (sitewide CSS variables; homepage max-width bump retained).
- About provider cards: equal-height flex alignment with profile button pinned to bottom.
- Care Team index: warm team photo (`care-team.png`) beside existing hero copy (layout preserved).
- ADHD final CTA: screening button restored to primary style to match funnel intent.

---

## Image Improvements

- Telehealth hero: `telehealth-visit.png` → `doctor-video-consult.png`.
- Weight Loss hero: `weightloss-hero.png` → `weightloss-health.png`.
- Care Team: added authentic team photograph in hero.
- Homepage lifestyle frosted hero retained (physician-portrait homepage hero deferred—prior preference).

---

## Consistency Fixes

- State presentation on homepage hero trust + why-patients line aligned (`CA · TX · PA · FL` / full names where prose).
- Primary conversion destination standardized to Meet & Greet on non-ADHD pages; ADHD funnel keeps screening primary.
- Transparent logo usage consistent in chrome; footer template + `normalizeBrandLogos()` keep it applied on rebuild.
- Generator: About card taglines use word-safe truncation (no mid-word `slice`) for future injects.

---

## QA Fixes

- CSS cache-bust on key pages (`styles.css?v=…`).
- Weight Loss final CTA band uses proper primary/secondary buttons (not text-only Chat microcopy).
- Provider filter empty-heading behavior verified in `assets/provider-hub-filters.js`.
- **Build-pipeline hardening:** polish now survives `npm run build` / Vercel:
  - Telehealth final CTA no longer re-injects Secure Chat (`site-chrome.mjs`)
  - ADHD “What happens next” compact block lives in `conversion-cleanup-content.mjs`
  - ADHD final CTA screening button is primary in chrome inject
  - Care Team hero image lives in `generate-provider-pages.mjs`
  - About provider cards inject full bios (no ellipsis truncate) in `components.mjs`

---

## Deferred Improvements

- Homepage physician-portrait / cream “listen” hero reactivation (felt empty vs frosted lifestyle).
- Custom branded telehealth photography replacing remaining stock consultation UIs.
- Weight-loss visual system overhaul beyond hero image + declutter.
- About full narrative rewrite.
- Dual dark/light logo package beyond transparent swap.
- Blog redesign or layout changes (typography-only touch deferred as unnecessary).
- Inventing new sections or converting comparison/process blocks into net-new modules.
- Sitewide rewrite of provider-card state labels to a single format on every surface (homepage cards still use short abbreviations for density).
