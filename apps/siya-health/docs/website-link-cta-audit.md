# Website Link & CTA Audit

**Date:** 2026-07-15  
**Site:** Siya Health (`apps/siya-health`)  
**Deploy status:** Deployed to production 2026-07-15 — aliased to https://www.siya.health  
**Deployment:** `dpl_7sNAFNqvt9F9hbqRo51jLm21et8w` ([inspect](https://vercel.com/snehpandey23s-projects/siya-health/7sNAFNqvt9F9hbqRo51jLm21et8w))  

## Live verification (post-deploy)

Verified on production (`www.siya.health`) after deploy:

| Page | HTTP | Dead/`#`/placeholder | Notes |
|------|------|----------------------|-------|
| Homepage | 200 | 0 | Final CTA: chat → `/redirect/chat`, Explore Telehealth → `/telehealth`, screening intact; Zocdoc secondary in hero + footer; Book appointment → `/book-appointment` |
| Telehealth | 200 | 0 | Chat CTAs valid; Zocdoc footer secondary |
| Answers / Health Guides | 200 | 0 | “View all Metabolic…” expands (13 links); `health_guides_click` fired |
| Blog hub | 200 | 0 | No dead CTAs |
| 3 blog posts | 200 | 0 | Finals: ADHD screening+chat; weight/telehealth chat+pricing |
| Book appointment | 200 | 0 | Chat primary; Zocdoc secondary (3 placements) |
| Providers hub | 200 | 0 | Chat primary; Zocdoc secondary (2) |
| CA ADHD landing | 200 | 0 | Screening → intro call → $149 eval; **0 Zocdoc** |

**GTM/dataLayer (homepage `?debug_tracking=1`):** `secure_chat_click`, `telehealth_guide_click`, `service_learn_more_click`, `zocdoc_booking_click`, `book_appointment_click`, `free_screening_click`, `adhd_screening_click`, plus GTM click/linkClick.  
**CA LP:** `adhd_screening_click`, `adhd_walkthrough_click`, `adhd_intro_call_click`, `paid_eval_click`.  
**Answers:** `health_guides_click` on View all.

---

## 2026-07-15 addendum — Free Meet & Greet CTA architecture

| Item | Detail |
|------|--------|
| New constant | `MEET_GREET_BOOKING_URL` = `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=kkarJfxH` |
| New redirect | `/redirect/meet-greet` (primary). Legacy `/redirect/adhd-walkthrough` kept, same CarePatron destination |
| Primary CTA label | **Book Free Meet & Greet** (replaces ADHD Evaluation Walkthrough / Intro Call / Schedule Consultation / Free Consultation as global low-friction CTA) |
| Compliance copy | Not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call. |
| General pages | Primary Meet & Greet → Secondary Explore Care Options / View Pricing; Secure Chat demoted to support |
| ADHD pages | Primary Take Free ADHD Screening → Secondary Meet & Greet → High-intent Start ADHD Evaluation |
| Results page | Primary Meet & Greet → Secondary Start ADHD Evaluation → Support Secure Chat |
| Zocdoc | Secondary / direct booking only |
| Tracking | Added `meet_greet_click`; preserved `adhd_walkthrough_click`, `adhd_intro_call_click` on legacy walkthrough path |

### CTA replacements documented

| Old label | New label | Typical destination |
|-----------|-----------|---------------------|
| Start Secure Medical Chat (hero primary on cold pages) | Book Free Meet & Greet | `/redirect/meet-greet` |
| ADHD Evaluation Walkthrough / Book ADHD Walkthrough | Book Free Meet & Greet | `/redirect/meet-greet` |
| Book Free ADHD Intro Call | Book Free Meet & Greet | `/redirect/meet-greet` (CA ads LP may keep `/redirect/adhd-walkthrough`) |
| Book Free Consultation / Schedule Consultation | Book Free Meet & Greet | `/redirect/meet-greet` |

---

## 2026-07-15 addendum — ADHD screening results page

| Item | Detail |
|------|--------|
| New page | `/adhd-screening-results` (`adhd-screening-results.html`) |
| Screening behavior | Completion fires `adhd_screening_complete` (+ legacy `screening_complete` / `asrs_results_view`), then redirects (~250ms) to results page |
| Results page event | `adhd_screening_results_view` on load |
| CTAs | Intro call → `/redirect/adhd-walkthrough` (`adhd_intro_call_click`); Evaluation → `/redirect/adhd-evaluation` (`adhd_evaluation_click` + legacy `paid_eval_click`); Chat → `/redirect/chat` (`secure_chat_click`) |
| Pricing label | Uses **Start ADHD Evaluation** (no $149/$199 on results page — unresolved sitewide pricing conflict left as human review) |
| Same-page booking panel | Removed from post-complete ASRS step; handoff + noscript continue link only |
| Zocdoc | Not present on results page |
| Validator | Include in `npm run validate:links` / build after deploy-prep build |  


## Summary

| Metric | Count |
|--------|------:|
| HTML files scanned | 152 |
| Anchor `href`s scanned (post-fix validator) | 11,238 |
| Classic empty / `#` / `javascript:void` / `undefined` hrefs | 0 |
| Broken placeholder / dead CTA issues fixed this audit | 6 categories (see below) |
| Post-fix `validate-cta-links` failures | 0 |

Full-file scan also counted **11,209** live hrefs before generator regenerations; none matched empty/`#`/placeholder patterns. Remaining issues were **misrouted labels**, **non-clicking View All buttons** (JS never attached), **missing secondary blog CTAs**, **footer booking hub rewrite**, and **retired Related Guide slug** (covered by Vercel redirect; pool updated to a live guide).

## Broken / fixed CTAs and links

| Page / file | Button / link text | Old href / action | Problem | New href / action | Reason |
|-------------|--------------------|-------------------|---------|-------------------|--------|
| `index.html` (final CTA) | Explore Telehealth Care | `/adhd-care` | Label/destination mismatch | `/telehealth` | Telehealth copy must route to telehealth hub |
| `index.html` (final CTA) | _(missing)_ | _(none)_ | No primary clinical CTA in final band | `/redirect/chat` — Start Secure Medical Chat | Restore homepage conversion slot |
| `answers/index.html` | View all … guides (×5 categories) | `#guides-*-all` + head `<script>` | Script ran in `<head>` before DOM → listeners never attached; click looked dead | Same anchors + body event delegation | Health Guides “View all” must expand hidden panels |
| `design-system/components.mjs` → all blog finals | Blog secondary CTA (newsletter / pricing / chat) | _(not rendered)_ | `secondaryGoal` configured but only primary rendered | Secondary slot rendered (`Join Our Health Guide`, `View Pricing`, or chat by intent) | Blog conversion system promised a secondary |
| Shared SEO footer (`site-chrome.mjs`) | Book appointment | `/redirect/chat` (via rewrite of `/book-appointment`) | Generic book CTA forced to Spruce | `/book-appointment` | Booking hub, not default secure chat |
| `scripts/apply-blog-consistency.mjs` related guides pool | Related Health Guide: non-stimulant… | `/answers/non-stimulant-adhd-medications` | Retired guide (redirect-only; no file) | `/answers/is-adhd-medication-safe-long-term` in pool | Prefer live guide HTML; redirect retained in `vercel.json` |
| `data/site-standards.mjs` | CTA_SYSTEM.primary.url | Direct `spruce.care` URL | Dual source of truth vs redirect | `/redirect/chat` | Keep tracking redirect as canonical |

## Intentionally left unchanged

| Item | Why |
|------|-----|
| CA ADHD landing primary/secondary/eval funnel order | Hierarchy already correct; no broken links |
| Zocdoc secondary placements (homepage hero, book-appointment, providers, footer) | Working external booking; not primary ADHD funnel |
| Spruce / `/redirect/chat` as primary secure chat | Intentional clinical CTA |
| GHL Siya Circle / Join Our Health Guide form URL | Valid external form; footer + hub CTAs work |
| Labs / prescriptions “coming soon” **content** cards | Informational cards (not CTA anchors); page CTAs go to `/redirect/chat` |
| FAQ accordion / ASRS screening `<button>`s | Wired by JS; not dead anchors |
| Skip links `href="#main"` | Valid in-page accessibility targets |
| `normalizeConsultationCtaRouting` mapping vague “Schedule Consultation” → chat on non-ADHD pages | Existing product routing (not this audit’s placeholder fixes) |

## Needs human review

1. **Footer brand bar** still can show two “Start Secure Medical Chat” lines (primary + remapped “Schedule Consultation”) plus Zocdoc + Book appointment — consider changing secondary footer label to “Explore Telehealth Care” → `/telehealth` for clearer differentiation.
2. **`$149` vs `$199` evaluation labels** on `adult-adhd-screening-california.html` (copy/pricing consistency; destinations valid).
3. **Inventory `linksToRedirect: 23`** — soft internal links that hit Vercel permanent redirects (valid in prod; validator accepts redirect sources when destination file exists). Prefer eventual HTML rewrites to canonical destinations.
4. **California ADHD blogs** still fail blog-consistency “Related Articles” check (6 posts) — pre-existing, unrelated to dead CTAs.
5. **Site-chrome remapper** `Get Health Guides` → `Join Our Health Guide` (newsletter) can blur browse-guides (`/answers`) vs join-newsletter (GHL) semantics — labels OK if hrefs stay distinct.

## External links verified, not changed

| Destination | Use | Notes |
|-------------|-----|-------|
| `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | Siya Circle / Health Guide join | Intact; `target="_blank"` + `rel="noopener noreferrer"` |
| `https://www.zocdoc.com/booking-link/practice/siya-healthcare-182234` | Secondary booking | Intact + `zocdoc_booking_click` |
| `https://spruce.care/siyahealth` | Legacy raw chat | Prefer `/redirect/chat`; rewritten by chrome when present |
| CarePatron ADHD walkthrough / evaluation booking URLs | Via `/redirect/adhd-*` | Redirect pages retained |

## Tracking events

Preserved / added in `scripts/siya-tracking.js` (existing dataLayer pattern; no new framework):

| Event | Trigger |
|-------|---------|
| `secure_chat_click` | `/redirect/chat` or Spruce |
| `book_appointment_click` | `/book-appointment` |
| `telehealth_guide_click` | `/telehealth` |
| `health_guides_click` | `/answers` (+ View all toggle via `siyaTrack`) |
| `blog_internal_cta_click` | `data-siya-location` contains `blog-final-cta` |
| `service_learn_more_click` | explore-care track or “Learn more” internals |
| `adhd_screening_click` | `/adhd-screening` (alongside legacy `free_screening_click`) |
| `meet_greet_click` | `/redirect/meet-greet` |
| `adhd_intro_call_click` | `/redirect/adhd-walkthrough` (alongside `adhd_walkthrough_click` + `meet_greet_click`) |
| `adhd_walkthrough_click` | `/redirect/adhd-walkthrough` (legacy) |
| `adhd_evaluation_click` | `/redirect/adhd-evaluation` (alongside `paid_eval_click`) |
| `zocdoc_booking_click` | Zocdoc URL |

## Validator

- **Script:** `scripts/validate-cta-links.mjs`
- **npm:** `npm run validate:links` (also wired into `npm run build`)
- **Fails build on:** empty/`#`/`javascript:void`, placeholder patterns, `undefined` hrefs, internal paths with no HTML file (unless covered by `vercel.json` redirect to an existing target)
- **Latest result:** `data/cta-link-validation.json` — **0 issues** / 11,238 hrefs

## Build & QA

| Check | Result |
|-------|--------|
| `npm run build` | PASS (including `validate-cta-links`) |
| Priority-page internal resolution smoke (homepage, telehealth, blog hub, 3 posts, answers, booking, providers, CA ADHD LP) | 0 broken |
| CA ADHD funnel CTAs | Unchanged hierarchy |
| Mobile/desktop visual | Static markup verified; live browser smoke deferred until post-review deploy |

## Files changed (primary)

- `index.html`
- `scripts/generate-answer-pages.mjs`
- `scripts/apply-blog-consistency.mjs`
- `scripts/site-chrome.mjs`
- `scripts/siya-tracking.js`
- `scripts/validate-cta-links.mjs` (**new**)
- `design-system/components.mjs`
- `data/site-standards.mjs`
- `package.json`
- Regenerated: `answers/*.html`, `blog/*.html` (final CTAs / related guides), SEO chrome footers sitewide
- This report: `docs/website-link-cta-audit.md`
