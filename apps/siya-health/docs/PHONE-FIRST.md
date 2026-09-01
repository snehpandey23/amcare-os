# Phone-first — Siya Health (public site)

**Rule:** Design and ship for phone first. Desktop expands the same composition. Do not “check mobile later.”

This is the product bar for `www.siya.health`. It is **not** “run Lighthouse on every indexed URL.”

---

## What phone-first means (pass bar)

On **~390×844** (iPhone-class):

1. **One first viewport** — brand/product signal, one primary action; not a dense dashboard.
2. **No horizontal scroll** — `documentElement.scrollWidth` ≤ viewport + 2px.
3. **Primary CTA reachable** — visible without hunting; not clipped by sticky header/cookie/sticky bar.
4. **Cookie Accept/Reject usable** — buttons in viewport when the bar is shown (same standard as Ads smoke).
5. **Tap targets** — interactive controls ≥ ~44px height where they are primary CTAs (inline text links may stay smaller; don’t fail the whole page for those alone).
6. **Hero / LCP media loads** — no broken hero images; LCP media is the intended phone visual.
7. **Nav opens and closes** — hamburger usable; no trap under sticky chrome.

**Lighthouse mobile** is a **supporting** signal (load / LCP), not the definition of phone-first.

| Gate | Tool | LCP / notes |
|------|------|-------------|
| **Ads LPs** (hard) | `npm run smoke:ads-landing-live` | LCP ≤ 12s; Playwright hero/cookie/gclid |
| **Core set** (audit) | `npm run phone:audit` | Layout probes + LH scores; soft perf floor ~55 until promoted |
| **Full sitemap** | Not automated | Sample / changed-pages only later |

---

## Core URL list (must stay phone-healthy)

Source of truth: `data/phone-first-core.mjs` (`CORE_PAGES`).

| Path | Role |
|------|------|
| `/` | Brand / entry |
| `/adhd-care` | ADHD hub |
| `/pricing` | Pricing / conversion |
| `/adhd-screening` | Screener funnel |
| `/adhd-evaluation-texas` | Ads LP (TX) — also Ads hard gate |
| `/adhd-evaluation-california` | Ads LP (CA) — also Ads hard gate |
| `/adult-adhd-california` | CA SEO hub |
| `/weight-loss-metabolic-health` | Service hub |
| `/telehealth` | Service hub |
| `/mens-health-longevity` | Service hub |
| `/labs` | Labs hub |
| `/intake` | Booking / intake |

**Out of core (for now):** blog posts, answers, provider bios, legal — follow the same design rules, but no every-deploy Lighthouse.

---

## How to run

```bash
cd apps/siya-health
npm run phone:audit          # core set @ www.siya.health
npm run smoke:ads-landing-live   # Ads hard gate (subset)
```

Reports land in `docs/phone-audit/YYYY-MM-DD/`.

---

## Adding a page to the core set

1. Add to `CORE_PAGES` with a clear `role`.
2. Re-run `phone:audit` once on production.
3. Only then consider promoting into a hard smoke gate (like Ads).

---

## Explicit non-goals

- Lighthouse on all ~145 indexed / ~181 sitemap URLs every deploy.
- Treating Perf 90+ as a merge blocker for educational pages.
- Redesigning desktop-first and “fixing mobile” in a later sprint.
