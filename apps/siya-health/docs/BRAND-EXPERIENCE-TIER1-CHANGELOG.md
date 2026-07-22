# Brand Experience V2 — Homepage Tier 1 Changelog

**Date:** 2026-07-17  
**Scope:** Homepage P0 (+ durable Zocdoc demotion in shared footer / booking chrome)  
**Base:** Current production (post-revert). No reuse of the previous VL2 experiment.

---

## Critical UX

- Replaced dark frosted hero with a light “listen” hero: large real physician photo (Dr. Swati Pandey), relationship headline, one sentence, **one primary CTA** (Book Free Meet & Greet), **one secondary link** (Explore Care Options).
- Removed above-the-fold clutter: symptom pills, Explore ADHD row, trust-stat strip, competing button styles.
- Restored Meet & Greet as homepage primary (local file had drifted to Secure Medical Chat).
- Mobile sticky Meet & Greet now appears **after** scrolling past the hero (does not compete in the first viewport).
- Homepage positioning: new **Care Areas** section introduces virtual primary care (weight, mental health, preventive, sleep, hormones, chronic care) **before** symptom cards; ADHD is listed last among care areas and moved later in the symptom grid.
- Pathways reordered: telehealth / weight / fatigue / hormones first; ADHD last.

## Visual Improvements

- Homepage nav: larger logo, more item spacing, solid header (readable on cream hero).
- Soft cream hero canvas; no dark overlay, no glass card, no gradients/blobs.
- Subtle fade-in only (respects `prefers-reduced-motion`).
- Footer “Zocdoc” label demoted to **Additional booking option** (shared `site-chrome` + CTA slot label).
- Book-appointment Zocdoc block demoted to secondary option (no “advertise scheduling software” framing).

## Content Improvements

- Hero H1: “Healthcare starts with being heard.” (recognition + hope + credibility).
- Why-patients and How-we-get-started converted to **scan-friendly bullets** (ADHD accessibility).
- Symptom card copy shortened; medication-guides clutter removed from the focus card.
- Provider card state line for Medical Director normalized to **CA · TX · PA · FL**.

## QA Fixes

- Corrected JPEG mime path for Swati portrait (`dr-swati-pandey.jpg`).
- Cleaned duplicate / inconsistent footer contact CTAs on homepage source.
- Cache-bust stylesheet query `?v=bx-tier1-p0`.

## Frozen (verified by design)

- Routes / URLs  
- SEO title, meta, canonical, schema JSON-LD (unchanged)  
- Analytics attribute patterns (`data-siya-*`, GTM)  
- Conversion destinations for Meet & Greet / Explore Care  

## Known Follow-ups (not in this pass)

- **2026-07-17:** Classic frosted `hero-merged` restored (lifestyle photo + overlay card). Physician split hero removed as too empty. Care-areas / ADHD positioning below the fold kept.
- **2026-07-17:** Fixed `injectNavCta` so it cannot replace the hero secondary “Explore Care Options” button (attribute-order + scope bug during `seo-build`).
- **2026-07-17:** Start Here cards: small editorial recognition thumbnails (emotion over illustration). Why-patients diagram replaced with human photo. Other sections left without added imagery (care areas, pathways, how-it-works, FAQ, final CTA) to avoid visual noise. Care team + founder photos retained.
- **2026-07-17:** ADHD Care Tier 1 humanize pass — physician hero, recognition cards, story pull-quotes, process bullets + consult photo, medication resource cards, VS comparison, MD centerpiece, compact care team. SEO/meta/FAQ answers/pricing numbers unchanged.

- P1: About, Telehealth, Care Team, ADHD Care, Weight Loss listen-language  
- P2: Provider card truncation/alignment across pages; more bullet conversions  
- Candid / non-stock photography library (additional clinicians)  
- Optional nav IA simplification (Care · ADHD · About · Resources · Book)  
- Full marketing-site audit for remaining “Book Online via Zocdoc” string in older HTML (footer rebuild on next deploy via `site-chrome`)  

## Files touched

- `apps/siya-health/index.html`  
- `apps/siya-health/styles.css`  
- `apps/siya-health/scripts/header-scroll.js`  
- `apps/siya-health/scripts/site-chrome.mjs`  
- `apps/siya-health/design-system/cta-system.mjs`  
- `apps/siya-health/assets/images/dr-swati-pandey.jpg` (new correct-extension copy)  
