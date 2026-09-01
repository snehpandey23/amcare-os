# Audit — adhd.siya.health (GoHighLevel) · 2026-08-02

**Live metrics source of truth:** `apps/siya-health/data/homepage-trust-metrics.mjs`

| Metric | Live (canonical) | GHL page shows | Status |
|--------|------------------|----------------|--------|
| ADHD evaluations & screenings | **1,000+** | 500+ | Stale |
| Google rating | **4.8★** | 4.7★ | Stale |
| Patients treated | **2,200+** | (not shown) | — |
| Verified reviews | **600+** | (not shown) | — |
| Initial evaluation price | **$149** | **$199** | Stale / wrong |
| Compliance disclaimers | Main-site pattern (not a diagnosis; medication not guaranteed; free call ≠ medical visit) | **Missing** | Fail |
| Screening CTA destination | `/adhd-screening` on `siya.health` (GA4/GTM) | **GHL form only** `api.leadconnectorhq.com/widget/form/JcppbNKyYlMVXwLq8nrS` | Fail |

## Hosting / traffic signals

- DNS: `adhd.siya.health` → `sites.ludicrous.cloud` (GoHighLevel), **HTTP 200**, not redirected.
- Google Ads / analytics on the page: `AW-17553537456`, `GTM-PLBD4TTQ`, `G-9WTQWHCTFT` — Ads conversion tag is still firing on this host.
- Main-site built HTML: **0** patient-facing links to `adhd.siya.health` (legal URLs rewritten at build by `site-chrome.mjs`). Residual mentions live only in generator scripts / docs.
- Backlinks: not fully crawlable from this repo. Treat any Search Console impressions for `adhd.siya.health` as active until a 301 is in place.

## Conversion path risk

Every primary CTA (“Start 2-Min Free ADHD Screening”) opens the **LeadConnector / GHL widget form**, not `siya.health/adhd-screening`. Those submissions **do not** flow through the main-site GA4/GTM path that was already fixed for the California LP.

## Testimonials

Live review cards (4 unique texts; DOM duplicates for carousel):

1. “Dr. **Panday**…” — typo (should be Pandey); ADHD-relevant.
2. “Dr. Pandey is awesome!…” — OK.
3. “very impressed… past 48 hours more effective…” — lowercase start + broken grammar; ADHD-relevant.
4. “Dr. Pandey is amazing…” — OK.

**No unrelated specialty copy** (weight loss / hair / TRT / etc.) was found mixed into the review blocks. What *does* look like a content mash-up is the evaluation “You get” list, where bullets visually collapse into one run-on line including **“Flat $199”** and a **“Clear diagnosis”** promise that conflicts with main-site compliance language.

## Recommendation (do this, not a GHL rewrite)

1. **301** `https://adhd.siya.health/*` → `https://www.siya.health/adhd-evaluation-california` (or state-appropriate URL) at DNS/Cloudflare / GHL domain settings. Editing copy inside GHL is wasted effort while Ads still land on a parallel funnel.
2. **Retarget** any Google Ads final URLs still on `adhd.siya.health` to:
   - CA campaign → `/adhd-evaluation-california`
   - TX campaign → `/adhd-evaluation-texas` (new)
3. After redirect + Ads URL change, confirm GHL form `JcppbNKyYlMVXwLq8nrS` is no longer the sole conversion path for paid traffic.

## Texas LP shipped in repo

- Page: `/adhd-evaluation-texas`
- Structure mirrors CA LP; live metrics **1,000+ / 4.8★ / 600+** and **$149**; same funnel + disclaimers.
- Wired: `site-chrome.mjs`, `landing-adhd-ads.js`, sitemap, geo retain list, commercial links.
