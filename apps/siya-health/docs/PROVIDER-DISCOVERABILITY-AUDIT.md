# Provider Discoverability Audit

**Generated:** 2026-06-02  
**Scope:** `apps/siya-health/` workspace (local HTML + `data/providers.mjs`)  
**Providers in `providers.mjs`:** 3 — Dr. Sneh Pandey, Dr. Natasha Desai, Dr. Swati Pandey

Method: static scan of HTML `href="/providers"` (hub index), `#meet-physicians` sections, named provider mentions, BFS link graph from `/` (max depth 2). Excludes `docs/`, `scripts/`, and `public/` mirror.

---

## Executive summary

| Check | Result |
|-------|--------|
| `/providers` hub linked from HTML pages | **8 pages** (4 service + 3 profiles + hub self) |
| Service pages with `meet-physicians` cards | **4 / 4** configured in `SERVICE_PROVIDER_SLUGS` |
| Service landing pages missing cards | **13** ADHD/geo pages + **primary-urgent-care** |
| Providers in `providers.mjs` missing from `/providers` index | **0** |
| Provider profile unreachable in ≤2 clicks from `/` | **0** |
| Named provider mentions without profile link | **4 pages** (mostly Dr. Pandey testimonials + 1 answer page) |

**Top gaps:** Homepage and About have no link to `/providers` hub; global nav has no “Our physicians”; Natasha and Swati require 2 hops from home; ADHD geo landing pages lack physician cards.

---

## 1. Every URL that links to `/providers` (hub index)

Pages with at least one `href="/providers"` (exact hub path, not profile subpaths):

| URL | Link context | Occurrences |
|-----|--------------|-------------|
| `/adhd-care` | “View all physicians” in `#meet-physicians` | 1 |
| `/telehealth` | “View all physicians” in `#meet-physicians` | 1 |
| `/weight-loss-metabolic-health` | “View all physicians” in `#meet-physicians` | 1 |
| `/mens-health-longevity` | “View all physicians” in `#meet-physicians` | 1 |
| `/providers` | Breadcrumb + mobile nav “Our physicians” | 2 |
| `/providers/dr-sneh-pandey` | Breadcrumb + footer “Our physicians” | 3 |
| `/providers/dr-natasha-desai` | Breadcrumb + footer “Our physicians” | 3 |
| `/providers/dr-swati-pandey` | Breadcrumb + footer “Our physicians” | 3 |

**Total unique HTML URLs linking to hub:** **8**

### Pages that do **not** link to `/providers` hub (notable)

| URL | Provider linkage instead |
|-----|-------------------------|
| `/` | Links only `/providers/dr-sneh-pandey` (founder block); no hub link |
| `/about` | “View profile” buttons to individual profiles; no hub link |
| `/membership-pricing` | No provider profile links |
| All `/blog/*`, `/answers/*` (except below) | No hub link |
| Global header nav (all pages) | No “Our physicians” item |

### Machine-readable references to hub

| Asset | Reference |
|-------|-----------|
| `sitemap.xml` | `https://siya.health/providers` |
| `llms-full.txt` | `URL: https://siya.health/providers` |
| `llms.txt` | Lists individual profiles only — **no hub URL** |
| `provider-index.json` | Individual profile URLs only — **no hub URL** |

### Inbound link equity (`data/internal-link-audit.json`)

| Path | Inbound internal links |
|------|------------------------:|
| `/providers` | 8 |
| `/providers/dr-sneh-pandey` | 9 |
| `/providers/dr-natasha-desai` | 6 |
| `/providers/dr-swati-pandey` | 6 |

---

## 2. Every service page with provider cards

“Provider cards” = `#meet-physicians` section with `about-team-grid` cards (photo, name link, tagline, state chips). Injected via `scripts/site-chrome.mjs` → `MEET_PHYSICIANS_BY_PAGE` driven by `SERVICE_PROVIDER_SLUGS` in `data/providers.mjs`.

| Service page | Providers shown | Source key |
|--------------|-----------------|------------|
| `/adhd-care` | Dr. Sneh Pandey, Dr. Natasha Desai, Dr. Swati Pandey | `adhd-care` |
| `/telehealth` | All 3 | `telehealth` |
| `/weight-loss-metabolic-health` | Dr. Sneh Pandey only | `weight-loss-metabolic-health` |
| `/mens-health-longevity` | Dr. Sneh Pandey only | `mens-health-longevity` |

### Related team surfaces (not `#meet-physicians`)

| URL | Format |
|-----|--------|
| `/about` | `#care-team` — 3 `about-team-card` entries with “View profile” buttons (names in `<h3>` are not hyperlinked) |
| `/` | Founder block links to `/providers/dr-sneh-pandey` only |

---

## 3. Every service page missing provider cards

### A. Configured service keys — **none missing**

All four entries in `SERVICE_PROVIDER_SLUGS` have `#meet-physicians` on their HTML pages.

### B. `service-index.json` service landing pages — **13 missing**

These are indexed as `service-*` types but have **no** `#meet-physicians` block:

| URL | Type | Title |
|-----|------|-------|
| `/adhd-diagnosis-austin` | service-adhd | ADHD Diagnosis Austin TX |
| `/adhd-diagnosis-florida` | service-adhd | Online ADHD Diagnosis Florida |
| `/adhd-diagnosis-houston` | service-adhd | ADHD Diagnosis Houston TX |
| `/adhd-diagnosis-pennsylvania` | service-adhd | Online ADHD Diagnosis Pennsylvania |
| `/adhd-diagnosis-philadelphia` | service-adhd | ADHD Diagnosis Philadelphia PA |
| `/adhd-diagnosis-texas` | service-adhd | Online ADHD Diagnosis Texas |
| `/adhd-evaluation-cost` | service-adhd | ADHD Evaluation Cost Online |
| `/adhd-screening` | service-adhd | Start screening |
| `/adhd-treatment-online` | service-adhd | ADHD Treatment Online |
| `/adult-adhd-diagnosis` | service-adhd | Adult ADHD Diagnosis Online |
| `/creyos-adhd-testing` | service-adhd | Creyos ADHD Testing Online |
| `/online-adhd-test` | service-adhd | Online ADHD Test & Screening |
| `/primary-urgent-care` | service-telehealth | Concierge Primary Care |

### C. Other care URLs without cards (not in `service-index.json`)

| URL | Notes |
|-----|-------|
| `/about` | Team cards present; different component |
| `/prescriptions` | No physician module |
| `/labs` | No physician module |
| `/membership-pricing` | Testimonials mention Dr. Pandey; no cards |
| `/book-appointment` | No physician module |

---

## 4. Every provider referenced in content without a profile link

“Without a profile link” = page contains a **named** provider reference (`Dr. Sneh Pandey`, `Dr. Natasha Desai`, `Dr. Swati Pandey`, or `Dr. Pandey`) and the page has **no** `href` to that provider’s `/providers/<slug>` URL.

| URL | Provider referenced | Text context | Profile link on page? |
|-----|-------------------|--------------|----------------------|
| `/answers/telehealth-adhd-california` | Dr. Sneh Pandey | Body + FAQ JSON-LD: “Medical Director Dr. Sneh Pandey is licensed in CA…” | **No** |
| `/membership-pricing` | Dr. Pandey (Sneh) | 2 testimonial quotes | **No** |
| `/` | Dr. Pandey (Sneh) | 2 homepage testimonials | **No** (founder block elsewhere **does** link) |

### Same-page mention: name not hyperlinked, but profile CTA exists

These pages link to profiles via buttons/elsewhere; provider **name in copy** is plain text:

| URL | Unlinked name text | Profile link present elsewhere |
|-----|-------------------|-------------------------------|
| `/about` | `Dr. Sneh Pandey, MD`, `Dr. Natasha Desai`, `Dr. Swati Pandey` in `<h3>`; “Dr. Pandey” in body | Yes — “View profile” / “View full profile” |
| `/` | `— Dr. Sneh Pandey, MD` in blockquote cite | Yes — linked paragraph in “Why Siya” |

### Providers with no orphaned named references found

| Provider | Status |
|----------|--------|
| Dr. Natasha Desai | No pages with name-only mention lacking any profile link |
| Dr. Swati Pandey | No pages with name-only mention lacking any profile link |

### Content with generic “providers” only (not in scope)

Homepage FAQ, footers, and many blog/answer pages say “board-certified providers” without naming individuals — not counted as missing profile links.

---

## 5. Every provider in `providers.mjs` not surfaced on `/providers`

| Slug | Name | On `/providers` index? | Index position |
|------|------|:----------------------:|:--------------:|
| `dr-sneh-pandey` | Dr. Sneh Pandey, MD | Yes | 1 |
| `dr-natasha-desai` | Dr. Natasha Desai, MD | Yes | 2 |
| `dr-swati-pandey` | Dr. Swati Pandey, MD | Yes | 3 |

**Result:** **0** providers missing from hub. `CollectionPage` JSON-LD `ItemList` matches all three `PROVIDERS` entries.

---

## 6. Every provider page not reachable within 2 clicks from homepage

BFS from `/` following internal `href` links (HTML graph, depth ≤ 2).

| Target | Shortest click depth | Example path |
|--------|---------------------:|--------------|
| `/providers/dr-sneh-pandey` | **1** | `/` → profile (founder “Why Siya” link) |
| `/providers/dr-natasha-desai` | **2** | `/` → `/adhd-care` → profile card |
| `/providers/dr-swati-pandey` | **2** | `/` → `/telehealth` → profile card |
| `/providers` (hub) | **2** | `/` → `/adhd-care` → “View all physicians” |

**Result:** **0** provider URLs unreachable within 2 clicks.

### Reachability caveats

| Issue | Detail |
|-------|--------|
| Hub not in global nav | `/providers` requires a service-page detour; not linked from `/` or `/about` |
| Natasha / Swati not on homepage | Only reachable in 2 clicks via service pages or About team buttons |
| Homepage footer | No “Our physicians” or `/providers` link in Services column |

---

## Coverage matrix (`SERVICE_PROVIDER_SLUGS` vs site)

| Provider | adhd-care | telehealth | weight-loss | mens-health | /providers index | Homepage |
|----------|:---------:|:----------:|:-----------:|:-----------:|:----------------:|:--------:|
| Dr. Sneh Pandey | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (1-click profile) |
| Dr. Natasha Desai | ✓ | ✓ | — | — | ✓ | — (2-click) |
| Dr. Swati Pandey | ✓ | ✓ | — | — | ✓ | — (2-click) |

---

## Recommended fixes (documentation only — not implemented)

1. Add **“Our physicians”** to global nav → `/providers` (1-click hub from every page).
2. Link **“Meet the team”** on `/about` → `/providers` hub (in addition to profile buttons).
3. Add profile link on `/answers/telehealth-adhd-california` where Dr. Sneh Pandey is named.
4. Consider `#meet-physicians` on high-traffic ADHD geo pages (`/adhd-diagnosis-texas`, `/adult-adhd-diagnosis`, etc.) with state-filtered providers per `SERVICE_PROVIDER_SLUGS` rules.
5. Add `/providers` to `llms.txt` and `provider-index.json` for machine-readable discoverability.
6. Optional: link testimonial “Dr. Pandey” on `/` and `/membership-pricing` to `/providers/dr-sneh-pandey`.

---

## Source files

| File | Role |
|------|------|
| `data/providers.mjs` | Canonical providers + `SERVICE_PROVIDER_SLUGS` |
| `scripts/site-chrome.mjs` | `MEET_PHYSICIANS_BY_PAGE` injection |
| `providers/index.html` | Generated hub |
| `service-index.json` | Service landing inventory |
| `data/internal-link-audit.json` | Inbound link counts |
