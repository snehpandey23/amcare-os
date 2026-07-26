# Siya Health Design System (Pass 1)

Foundation for componentized UI — **standalone** until Pass 2 wires `components.css` into `styles.css`.

## Files

| File | Purpose |
|------|---------|
| `tokens.css` | CSS custom properties (colors, spacing, typography, radii, shadows) |
| `components.css` | BEM `ds-*` component classes |
| `components.mjs` | Build-time HTML render helpers |
| `cta-system.mjs` | CTA slots + page-type pairing rules |
| `page-compositions.mjs` | Page recipes (Homepage, ADHD, Blog, Provider, Landing) |
| `hipaa-badge.mjs` | HIPAA circle badge SVG specs + raster/display constants |
| `trust-system.mjs` | Trust profiles and badge references |

## Usage (generators / scripts)

```js
import { renderHero, renderCtaBlock, renderFaq } from '../design-system/components.mjs';
import { resolveCtasForPath } from '../design-system/cta-system.mjs';
import { getPageRecipe } from '../design-system/page-compositions.mjs';

const ctas = resolveCtasForPath('adhd-care.html');
const hero = renderHero({
  title: 'Adult ADHD evaluation online',
  lead: '…',
  pageType: 'adhd',
});
```

## CTA page rules

| Page type | Primary | Secondary |
|-----------|---------|-----------|
| homepage | Start Secure Medical Chat | Schedule Consultation |
| adhd | Take Free ADHD Screening | Start Secure Medical Chat |
| blog | Start Secure Medical Chat | Get Health Guides / Join Siya Circle |
| provider | Schedule Consultation | Start Secure Medical Chat |
| landing (ads) | Take Free ADHD Screening | *(conversion-specific: walkthrough / eval)* |

## HIPAA compliant badge

Source vector: `assets/images/hipaa-compliant.svg` (outer circle **r=136.4**, inner **r=125.4** in a 281×281 viewBox — **+10% radius** vs the 2026-06 baseline so “HIPAA” / “COMPLIANT” stay inside the ring).

Regenerate sitewide PNG copies:

```bash
npm run assets:hipaa-badge -w @amcare/siya-health
```

Syncs to `siya-health-rewrite` and `hipaa-training` public assets. Footer display size remains **72×72px** (`styles.css` → `.footer-trust-logo[src*="hipaa-compliant"]`).

## Component registry

| DS class | Render helper | Description |
|----------|---------------|-------------|
| `ds-hero` | `renderHero()` | Full-width hero with overlay content box |
| `ds-cta-block` | `renderCtaBlock()` | Primary conversion band |
| `ds-cta-primary` / `secondary` / `lead-magnet` / `newsletter` | `renderCta*` | Semantic CTA variants |
| `ds-section-header` | `renderSectionHeader()` | Section title + lead |
| `ds-feature-grid` / `ds-feature-card` | `renderFeatureGrid()` | Icon/feature cards |
| `ds-provider-card` | `renderProviderCard()` | Compact provider tile |
| `ds-faq` | `renderFaq()` + `renderFaqScript()` | Accordion FAQ (matches `faq-accordion-*`) |
| `ds-trust` / `ds-trust-scroll` | `renderTrustSection()` | Metrics, badges, horizontal scroll |
| `ds-stats` | `renderStatsSection()` | Persuasive stats copy block |
| `ds-testimonial` | `renderTestimonial()` | Review card |
| `ds-newsletter` | `renderNewsletterBlock()` | Siya Circle signup band |
| `ds-timeline` | `renderTimeline()` | Process / how-it-works steps |
| `ds-pricing-card` | `renderPricingCard()` / `renderPricingGrid()` | Pricing tier card |
| `ds-button` | `renderButton()` | Extends legacy `.button` |
| `ds-form` | `renderForm()` | Minimal form fields |
| `ds-footer-ref` | `renderFooterReference()` | Pointer to `site-chrome.mjs` — no duplicate footer |

Legacy class names are co-declared on render output (e.g. `ds-hero hero-merged`) for Pass 2 migration without visual regression.

## CSS wiring (Pass 2)

Do **not** import into `styles.css` yet. Pass 2 plan:

```css
/* end of styles.css */
@import url('/design-system/tokens.css');
@import url('/design-system/components.css');
```

Verify no duplicate specificity conflicts before enabling.

## Duplicate inventory (Pass 2 replacement targets)

| Component | Existing CSS selectors | Existing locations | Pass 2 action |
|-----------|------------------------|-------------------|---------------|
| Hero | `.hero-merged`, `.hero-fullwidth`, `.hero-merged-content`, `.hero-ctas` | `styles.css` (~31 rules); **19 HTML** pages | Migrate markup to `renderHero()`; map classes → `ds-hero` |
| CTA block | `.cta-band`, `.cta-section`, `.cta-band-buttons`, `.cta-block` | `styles.css` (~15); **~70 HTML**; `site-chrome.mjs`; `blog-engagement-components.mjs` `finalCtaBandSection` | Replace inline `cta-band` with `renderCtaBlock()` + `resolveCtasForPath()` |
| Section header | `.section-header`, `.lead` | `styles.css`; **40 HTML**; all `SIYA:LEARN-MORE-*` in `site-chrome.mjs` | `renderSectionHeader()` in generators |
| FAQ | `.faq-accordion-section`, `.faq-accordion-*`, `.faq-item` | `styles.css` (~51); **17 HTML**; FAQ CTA blocks in `site-chrome.mjs` | `renderFaq()` + retire duplicated accordion markup |
| Feature grid | `.services-grid`, `.service-cols`, `.service-col`, `.health-guide-feature-card` | `styles.css`; `answers/index.html`; homepage services | `renderFeatureGrid()` |
| Provider card | `.provider-card`, `.providers-grid`, `.provider-photo-wrap` | `styles.css`; `generate-provider-pages.mjs`; `site-chrome.mjs` `renderCareTeamPhoto` | `renderProviderCard()` in provider generator |
| Trust / stats | `.trust-metrics*`, `.trust-badge*`, `.trust-metric-card` | `styles.css`; **3 HTML** (homepage, adhd-care, weight-loss) | `renderTrustSection()` / `renderStatsSection()` |
| Trust scroll | `.lp-trust-scroll` (landing scoped) | `styles.css` (`.siya-landing-page`); landing JS | `renderTrustScroll()` |
| Testimonial | `.testimonial-card*`, `.review-card`, `.hero-inline-testimonial` | `styles.css` (~43); **3 HTML** | `renderTestimonial()` |
| Pricing | `.pricing-card`, `.pricing-grid*`, `.pricing-price` | `styles.css`; `pricing.html`; `generate-pricing-page.mjs` | `renderPricingGrid()` |
| Timeline | `.process-steps-inline`, `.process-step-inline`, `.process-steps` | `styles.css`; homepage `#how-it-works` | `renderTimeline()` |
| Newsletter | `.siya-circle-promo`, `.siya-circle-home-band`, `.siya-circle-signup-cta` | `styles.css`; `siya-circle.html`; `data/siya-circle-config.mjs` | `renderNewsletterBlock()` |
| Buttons | `.button`, `.button.secondary`, `.button.primary` | `styles.css`; **130+ HTML** files | Add `ds-button` variants; normalize via seo-build |
| Forms | `.siya-circle-form`, `.form-field` | `styles.css`; `siya-circle.html` | `renderForm()` for any new on-site forms |
| Footer | `.site-footer`, `.footer-col` | `site-chrome.mjs` `renderLegalFooter`, `renderSeoFooterMarkup` | **Keep in site-chrome** — DS only references |

### Grep counts (HTML files, Jun 2026)

| Pattern | HTML file count |
|---------|-----------------|
| `hero-merged` | 19 |
| `cta-band` | 70 |
| `faq-accordion` | 17 |
| `section-header` | 40 |
| `testimonial` | 3 |
| `trust-metrics` | 3 |
| `pricing-card` | 2 |
| `siya-circle-promo` | 1 |

## site-chrome integration plan (Pass 2)

1. Import `resolveCtasForPath`, `renderCtaBlock` from design-system in `site-chrome.mjs`.
2. Replace hardcoded `ADHD_FAQ_CTA`, `TELE_FAQ_CTA`, blog `cta-band` regex replacements with `renderCtaBlock({ pageType })`.
3. Keep `renderLegalFooter()` / `renderSeoFooterMarkup()` in site-chrome — footer not duplicated in DS.
4. `seo-build.mjs` continues to call `applySiteChrome()`; chrome functions emit DS markup with legacy class bridges.
5. Provider generator imports `renderProviderCard` instead of inline card HTML.

## CRO integration plan (Pass 3)

1. Swap CTA slots per recipe via `resolvePageCtas(pageType, overrides)` without HTML hand-edits.
2. A/B hero variants: pass `ctas` override array to `renderHero()`.
3. Blog exit CTAs: unify `finalCtaBandSection` (blog-engagement) with `renderCtaBlock({ pageType: 'blog' })`.
4. Landing pages: use `LANDING_CONVERSION_CTAS` for walkthrough/eval without changing sitewide rules.
5. Track via existing `data-siya-track` — `ctaTrackingAttrs()` centralizes attributes.
