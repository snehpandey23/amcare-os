# Provider Phase 1 — Trust Cleanup Report

Generated: 2026-06-05  
Scope: `apps/siya-health/` — trust and consistency fixes only (no new provider pages, no `data/providers.mjs`, no `/providers` index).

## Summary

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| Sitemap URLs | **154** (includes 3 provider profiles) |
| `California, California` in built HTML | **0** |
| Provider pages: one H1 each | **PASS** |
| Legal links → siya.health paths | **PASS** (`/privacy-policy`, `/terms`) |
| `adhd.siya.health` in built HTML | **0** |

---

## Files changed (source)

### Build / normalization
| File | Change |
|------|--------|
| `data/site-standards.mjs` | Legacy footer patterns for duplicate CA; `LEGAL_LINKS` constants |
| `scripts/site-chrome.mjs` | Footer-brand fix (nested trust logos); `fixDuplicateCalifornia()`; safe 3-state expansion (no double-CA); `normalizeLegalLinks()`; `injectMeetPhysiciansSection()` |
| `styles.css` | `.provider-lp-hero-deck` for emotional subheadline below provider name H1 |

### Content pages
| File | Change |
|------|--------|
| `about.html` | Provider team image `alt` text (3 physicians) |
| `index.html` | Dr. Sneh Pandey profile link; FAQ/schema state copy; `TODO:VERIFY-SOURCE` for 5,000+ claim |
| `providers/dr-sneh-pandey.html` | H1 → name; deck copy; claim/testimonial TODO comments |
| `providers/dr-natasha-desai.html` | H1 → name; deck copy; testimonial TODO comments |
| `providers/dr-swati-pandey.html` | H1 → name; deck copy; testimonial TODO comments |
| `adhd-care.html` | `SIYA:MEET-PHYSICIANS` marker (injected at build) |
| `telehealth.html` | `SIYA:MEET-PHYSICIANS` marker |
| `weight-loss-metabolic-health.html` | `SIYA:MEET-PHYSICIANS` marker |
| `mens-health-longevity.html` | `SIYA:MEET-PHYSICIANS` marker |

**Note:** `seo-build.mjs` rewrites all 154 HTML files at build time (footer, legal links, state copy). Only source edits above are listed; built output reflects sitewide normalization.

---

## 1. Footer state typo fix

**Problem:** `injectFooterChrome` regex required `</div>` immediately after footer `<p>`, so pages with trust logos inside `.footer-brand` were skipped. A second bug in `normalizeSitewideCopy` replaced `Texas, Pennsylvania, and Florida.` inside already-complete four-state lists, producing `California, California, …`.

**Fix:**
- Replace only the `<p>` inside `.footer-brand` (preserve trust logos / social).
- Use negative lookbehind so 3-state → 4-state expansion does not run when California is already present.
- Run `fixDuplicateCalifornia()` at end of normalization.

**Canonical footer line (all pages after build):**
> Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.

**Canonical state order elsewhere:** California • Texas • Pennsylvania • Florida (bullet) / California, Texas, Pennsylvania, and Florida (prose).

**Confirmation:** Grep across `*.html` → **0** matches for `California, California`.

---

## 2. About page provider image alt text

| Image | Alt text |
|-------|----------|
| `dr-sneh-pandey.png` | Dr. Sneh Pandey, MD |
| `dr-natasha-desai.png` | Dr. Natasha Desai, MD |
| `dr-swati-pandey.png` | Dr. Swati Pandey, MD |

Applied on hero card and “Meet your care team” grid.

---

## 3. Provider page H1 cleanup

| Page | H1 (new) | Former emotional line → `.provider-lp-hero-deck` |
|------|----------|--------------------------------------------------|
| `/providers/dr-sneh-pandey` | Dr. Sneh Pandey, MD | “If you’re exhausted from performing ‘fine’…” |
| `/providers/dr-natasha-desai` | Dr. Natasha Desai, MD | “When ADHD rides along with anxiety…” |
| `/providers/dr-swati-pandey` | Dr. Swati Pandey, MD | “When ADHD, anxiety, and depression stack…” |

Each provider page has **exactly one** `<h1>` (verified post-build).

---

## 4. Provider / sitewide footer & legal links

- All `https://adhd.siya.health/privacy-policy` → `/privacy-policy`
- All `https://adhd.siya.health/terms-of-service` → `/terms`
- `notice-of-privacy-practices` → `/privacy-policy` (no dedicated NPP page on siya.health)
- Internal legal links no longer use `target="_blank"`

Provider pages receive the same footer normalization as the rest of the site via `applySiteChrome()`.

---

## 5. Homepage provider linking

- **Linked:** “Dr. Sneh Pandey, MD” in “Why Siya Health Exists” → `/providers/dr-sneh-pandey`
- **Left as-is:** Testimonial quotes still say “Dr. Pandey” inside attributed patient quotes (not editorial copy)
- **TODO added:** `5,000+ in medical weight loss` on homepage

---

## 6. Service page “Meet our physicians” modules

Injected at build via `injectMeetPhysiciansSection()`:

| Page | Physicians shown | State labels |
|------|------------------|--------------|
| `/adhd-care` | Sneh, Natasha, Swati | CA/TX/PA/FL · TX/FL · PA |
| `/telehealth` | Sneh, Natasha, Swati | CA/TX/PA/FL · TX/FL · PA |
| `/weight-loss-metabolic-health` | Sneh only | CA, TX, PA, FL |
| `/mens-health-longevity` | Sneh only | CA, TX, PA, FL |

Reuses existing `.about-team-grid` / `.about-team-card` styles — no new design system.

---

## 7. Claims requiring source verification

Content **not deleted**; flagged with `<!-- TODO:VERIFY-SOURCE -->` where edited, or listed below for follow-up.

| Claim | Location | TODO in source? |
|-------|----------|-----------------|
| `5,000+ patients` (weight-loss programs) | `providers/dr-sneh-pandey.html` | Yes |
| `5,000+ in medical weight loss` | `index.html` | Yes |
| `5,000+ Weight Loss Patients` (hero badge) | `weight-loss-metabolic-health.html` | No — needs source |
| `5,000+ patients treated` (body copy) | `weight-loss-metabolic-health.html` | No — needs source |
| `5,000+ Weight Loss Patients` (pricing card) | `membership-pricing.html` | No — needs source |
| `(verified)` testimonial cites | All 3 provider pages (2 each) | Yes |
| `Verified experiences from real patients` | `membership-pricing.html` | No — needs audit |

**Action required:** Obtain internal documentation (patient counts, testimonial consent records) before treating these as substantiated marketing claims.

---

## 8. Build result

```
npm run build → exit 0
Processed 154 HTML files for SEO tags.
Sitemap: 154 URLs
SEO Deployment QA: 0 broken links, 0 JSON-LD errors
Cannibalization Phase 1: PASS
```

---

## 9. Broken links

From `SEO-DEPLOYMENT-QA-REPORT.md`: **0** broken internal links (sample audit).

---

## 10. Schema errors

From `SEO-DEPLOYMENT-QA-REPORT.md`: **0** JSON-LD parse errors across 154 pages.

Provider `Physician` + `MedicalOrganization` graph unchanged (no `reviewedBy` added per scope).

---

## 11. Sitemap — provider pages

| URL | In sitemap |
|-----|:----------:|
| `https://siya.health/providers/dr-sneh-pandey` | ✓ |
| `https://siya.health/providers/dr-natasha-desai` | ✓ |
| `https://siya.health/providers/dr-swati-pandey` | ✓ |

---

## Out of scope (confirmed not done)

- No new provider pages or provider #4
- No `data/providers.mjs`
- No `reviewedBy` schema or “physician reviewed” badges
- No `/providers` index page

---

## QA checklist (pre-commit)

- [x] 0 broken links
- [x] 0 JSON-LD errors
- [x] Provider pages in sitemap
- [x] Exactly one H1 per provider page
- [x] Footer free of `California, California`
- [x] About images have non-empty alt
- [x] Privacy/terms point to siya.health (`/privacy-policy`, `/terms`)

**Status: QA PASS — ready for review; not committed per instructions.**
