# GA4 privacy hardening — siya.health

**Measurement ID:** `G-9WTQWHCTFT`  
**Container:** `GTM-PLBD4TTQ`  
**Ads (generic pages only):** `AW-17553537456`

## Where config lives

| Layer | Role |
|-------|------|
| **GTM workspace** | Primary — GA4 Configuration tag + Google Ads tags fire from `GTM-PLBD4TTQ` |
| **Page code** | Consent Mode + privacy flags in `scripts/cookie-consent-bootstrap.js` (generic pages only; care-flow strips this file) |
| **GA4 Admin UI** | Account-level Google signals + ads personalization toggles (not code-deployable) |

There is **no** raw `gtag('config', 'G-9WTQWHCTFT')` on production chrome pages (generators that still emit legacy gtag are overwritten by `site-chrome` strip/re-inject).

## Done in code (this change)

On every page that loads `cookie-consent-bootstrap.js` (all generic/marketing pages):

```js
gtag('set', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
});
```

Re-applied after Consent Mode updates. Care-flow pages never load this script (or GTM/Meta).

## Manual — GTM (needs Google account with GTM publish rights)

1. Open [tagmanager.google.com](https://tagmanager.google.com) → container **GTM-PLBD4TTQ**
2. Tags → open the **GA4 Configuration** tag for `G-9WTQWHCTFT`
3. Fields to Set (or Configuration settings) → add:
   - `allow_google_signals` = `false`
   - `allow_ad_personalization_signals` = `false`
4. Preview → confirm `g/collect` shows `npa=1` (or no Signals joins) after Accept All
5. **Submit → Publish** the workspace

Who: anyone with **Publish** on the Siya Health GTM container (founder / marketing ops).

## Manual — GA4 Admin (needs Analytics Admin)

1. [analytics.google.com](https://analytics.google.com) → property for `G-9WTQWHCTFT`
2. **Admin** (gear) → **Data collection and modification** → **Data collection**
   - Turn **Google signals data collection** **OFF** (all regions)
3. **Admin** → **Data settings** → **Data collection** / **Data sharing** (UI labels vary)
   - Disable **ads personalization** for the property (all regions if offered)
4. Optional: **Admin** → **Data streams** → Web stream → confirm Enhanced measurement only; no PII in events

Who: anyone with **Editor** or **Administrator** on the GA4 property.

## Care-flow pages (do not change)

These never load GTM/Meta/GA4:

`/intake`, `/book-appointment`, `/adhd-screening`, `/adhd-screening-results`, `/online-adhd-test`, `/redirect/*`

## Monthly audit

Automated: `.github/workflows/siya-health-tracking-audit.yml` (cron `0 6 1 * *` = 1st of each month, 06:00 UTC).

Each run: full HTML crawl + content classification + Playwright network check on health pages + **CarePatron/Spruce destination network check** + published GTM fingerprint + diff vs prior month.

**Delivery:**
1. GitHub Actions **artifact** (`siya-health-tracking-audit-YYYY-MM`)
2. Commit into `apps/siya-health/docs/tracking-audits/` when the job succeeds on `main`
3. GitHub **Issue** if health pages regress, our GTM appears on vendor pages, or the job fails
4. **WorkDrive** markdown summary →  
   `Siya Knowledge Editorial/_API-DRY-RUN/04-Content-Tracker/tracking-audits/`  
   (same Zoho OAuth secrets as Phase-3 cloud content pipeline: `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` / `ZOHO_ACCOUNTS_URL` + `WORKDRIVE_DRYRUN_04_ID`)

Optional override: `WORKDRIVE_TRACKING_AUDIT_FOLDER_ID` for a fixed destination folder id.  
WorkDrive step is `continue-on-error` so a Zoho outage does not block the git/artifact delivery.
