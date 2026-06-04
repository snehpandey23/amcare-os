# Visual Audit Report

Generated: 2026-06-04T00:59:23.610Z

## Summary

| Issue type | Count |
|------------|------:|
| Images used on 5+ pages | 5 |
| Hero-like images on 3+ pages | 0 |
| Missing/empty alt text | 9 |
| Placeholder URLs | 0 |
| Very small raster assets (<8KB) | 1 |

## 1. Duplicate / overused images (5+ pages)

### `../assets/images/siya-health-logo.png`
- **Used on:** 238 pages
- **Sample pages:** `answers/adderall-vs-vyvanse-adults.html`, `answers/adderall-vs-vyvanse-adults.html`, `answers/adhd-and-weight-loss-connection.html`, `answers/adhd-and-weight-loss-connection.html`, `answers/adhd-in-men.html`…
- **Recommendation:** Expected sitewide — no change

### `assets/images/siya-health-logo.png`
- **Used on:** 50 pages
- **Sample pages:** `about.html`, `about.html`, `adhd-care.html`, `adhd-care.html`, `adhd-diagnosis-austin.html`…
- **Recommendation:** Expected sitewide — no change

### `assets/images/hipaa-compliant.png`
- **Used on:** 24 pages
- **Sample pages:** `about.html`, `adhd-care.html`, `adhd-diagnosis-austin.html`, `adhd-diagnosis-florida.html`, `adhd-diagnosis-houston.html`…
- **Recommendation:** Assign topic-specific imagery or crop variants

### `https://static.legitscript.com/seals/46197681.png`
- **Used on:** 24 pages
- **Sample pages:** `about.html`, `adhd-care.html`, `adhd-diagnosis-austin.html`, `adhd-diagnosis-florida.html`, `adhd-diagnosis-houston.html`…
- **Recommendation:** Assign topic-specific imagery or crop variants

### `assets/images/creyos-logo.png`
- **Used on:** 24 pages
- **Sample pages:** `about.html`, `adhd-care.html`, `adhd-diagnosis-austin.html`, `adhd-diagnosis-florida.html`, `adhd-diagnosis-houston.html`…
- **Recommendation:** Expected sitewide — no change


## 2. Same hero on multiple pages (3+)

_None above threshold._

## 3. Placeholder images

_None detected._

## 4. Missing alt text (9)

- `about.html` → assets/images/dr-sneh-pandey.png
- `about.html` → assets/images/dr-natasha-desai.png
- `about.html` → assets/images/dr-swati-pandey.png
- `adhd-care.html` → assets/images/icons/icon12.svg
- `adhd-care.html` → assets/images/icons/icon1.svg
- `adhd-care.html` → assets/images/icons/icon5.svg
- `index.html` → assets/images/icons/icon12.svg
- `index.html` → assets/images/icons/icon1.svg
- `index.html` → assets/images/icons/icon5.svg


## 5. Low-resolution assets (<8KB, non-SVG)

- `assets/images/creyos-logo.png` (6178 bytes)

## 6. Provider photos (repeated)

| Asset | Pages |
|-------|------:|
| assets/images/dr-sneh-pandey.png | 2 |
| assets/images/dr-natasha-desai.png | 1 |
| assets/images/dr-swati-pandey.png | 1 |
| assets/images/dr-sneh-pandey-founder.png | 1 |
| ../assets/images/dr-natasha-desai.png | 1 |
| ../assets/images/dr-sneh-pandey.png | 1 |
| ../assets/images/dr-swati-pandey.png | 1 |

## 7. Branding consistency notes

- Primary palette driven by `styles.css` (--primary teal, Poppins/Inter).
- Blog cards and answer pages share `.clinical-review` aside — consistent.
- **Action:** Replace repeated `hero-telehealth` variants on metabolic cornerstone pages with dedicated art (food noise, insulin resistance, fatigue).

## 8. Pages with no hero image (content-only)

0 answer pages are text-first (acceptable for Health Guides).

---

_Re-run: `node scripts/production-readiness-audit.mjs`_
