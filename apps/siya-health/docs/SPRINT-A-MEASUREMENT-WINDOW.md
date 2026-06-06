# Sprint A — 14-Day Measurement Window

**Deploy date:** June 6, 2026  
**Measurement window:** June 6, 2026 → June 20, 2026  
**Baseline period:** May 23, 2026 → June 5, 2026 (14 days pre-deploy)  
**Commits:** `4a9f298` (Sprint A), `58dc2a9` (nav analytics fix)  
**Do not start Sprint B until:** June 20, 2026 minimum + baseline comparison reviewed

---

## Production verification (June 6, 2026)

| # | Check | Result |
|---|-------|--------|
| 1 | Hero has one primary CTA | **PASS** — 1 `.hero-ctas .button`; no “Find the Right Starting Point” |
| 2 | Final CTA has one primary CTA | **PASS** — 1 `.cta-band-buttons .button` |
| 3 | `/adhd-screening?start=asrs` → ASRS intro | **PASS** — active step `0`, H1 “Free ADHD Screening”, `asrs_intro_view` with `entry_source=deep_link` |
| 4 | `/adhd-screening` → chooser | **PASS** — active step `-1`, H1 “What are you looking for help with?” |
| 5 | All 7 dataLayer events fire | **PASS** — see event table below |
| 6 | GTM preview | **PASS (dataLayer)** — events push correctly; configure Custom Event triggers in GTM-PLBD4TTQ workspace |
| 7 | Mobile homepage renders | **PASS** — single hero CTA + pricing link at 393×852 |

---

## Events instrumented

| Event | Source | Verified |
|-------|--------|----------|
| `hero_cta_primary_click` | Homepage hero button | Yes |
| `nav_cta_primary_click` | Header `.nav-cta` / `.nav-mobile` CarePatron button | Yes |
| `final_cta_primary_click` | Final CTA band | Yes |
| `screening_cta_click` | Homepage screening links (`?start=asrs`) | Yes |
| `homepage_booking_click` | Testimonial inline booking link | Yes |
| `reviews_link_click` | HelloKlarity link | Yes |
| `asrs_intro_view` | `/adhd-screening` ASRS intro step | Yes |

---

## Metrics to compare (baseline vs Sprint A window)

Pull from **GA4** (property `G-9WTQWHCTFT`) after GTM tags are wired to these Custom Events.

### 1. Hero CTA clicks

| Metric | Baseline (May 23–Jun 5) | Sprint A (Jun 6–Jun 20) | Target |
|--------|-------------------------|-------------------------|--------|
| `hero_cta_primary_click` events | _TBD — pull from GA4_ | _TBD_ | +8–15% vs baseline rate |
| Hero CTR (events / homepage sessions) | _TBD_ | _TBD_ | Increase |

**GA4 path:** Explore → Free form → Event name = `hero_cta_primary_click` · Dimension = `date` · Filter `page_path` = `/`

---

### 2. Screening CTA clicks

| Metric | Baseline | Sprint A | Target |
|--------|----------|----------|--------|
| `screening_cta_click` events | _TBD_ | _TBD_ | Stable or ↑ |
| Clicks by `cta_location` | _TBD_ | _TBD_ | Track `symptoms-transition`, `pathway-adhd`, `faq` |

**Note:** Baseline used `/adhd-screening` without `?start=asrs`; post-deploy links include deep-link param.

---

### 3. ASRS intro views

| Metric | Baseline | Sprint A | Target |
|--------|----------|----------|--------|
| `asrs_intro_view` (all) | _TBD_ | _TBD_ | ↑ |
| `asrs_intro_view` where `entry_source=deep_link` | N/A (new) | _TBD_ | New metric |
| Deep-link rate: `asrs_intro_view (deep_link)` / `screening_cta_click` | N/A | _TBD_ | ≥ 85% |

**Funnel:** `screening_cta_click` → page_view `/adhd-screening` → `asrs_intro_view` (`deep_link`)

---

### 4. Booking clicks (homepage)

| Metric | Baseline | Sprint A | Target |
|--------|----------|----------|--------|
| `hero_cta_primary_click` + `nav_cta_primary_click` + `final_cta_primary_click` + `homepage_booking_click` | _TBD_ | _TBD_ | +5–10% total booking click rate |
| CarePatron outbound clicks (GA4 outbound link click) | _TBD_ | _TBD_ | No drop >15% |

---

### 5. Reviews clicks (Klarity)

| Metric | Baseline | Sprint A | Target |
|--------|----------|----------|--------|
| `reviews_link_click` events | _TBD_ | _TBD_ | Baseline only (decision Sprint D+) |
| `reviews_link_click` / homepage sessions | _TBD_ | _TBD_ | Monitor leakage ratio |

**Decision rule (Day 30):** If `reviews_link_click` rate > 5% of homepage sessions AND booking clicks flat/down → evaluate removing Klarity link.

---

### 6. Homepage bounce rate

| Metric | Baseline | Sprint A | Target |
|--------|----------|----------|--------|
| Bounce rate (`/`) | _TBD_ | _TBD_ | −3–7% |

**GA4 path:** Reports → Engagement → Pages and screens → filter Page path = `/`

---

## GTM configuration required (one-time)

Create **Custom Event** triggers in `GTM-PLBD4TTQ` for each event name above, then GA4 Event tags. Until configured, events exist in `dataLayer` but won't appear in GA4 reports.

**Preview validation:** GTM Preview mode on `https://www.siya.health/` → click hero, screening, reviews, nav → confirm tags fire.

---

## Rollback triggers (during measurement window)

| Signal | Action |
|--------|--------|
| Booking clicks ↓ >15% vs baseline | Revert P0-2/P0-3 (restore secondary CTA) |
| `screening_cta_click` ↑ but `asrs_intro_view (deep_link)` flat | Debug `?start=asrs` / `asrs-screener.js` |
| Bounce rate ↑ >10% | Review hero change; consider rollback |

---

## Sprint B gate checklist (June 20+)

- [ ] 14 days of post-deploy data collected
- [ ] All 7 events reporting in GA4 (GTM wired)
- [ ] Deep-link rate ≥ 85% OR root cause documented
- [ ] No booking click regression >15%
- [ ] Founder sign-off on Sprint A results

**Do not implement Sprint B until this checklist is complete.**
