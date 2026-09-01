# Provider Expansion — Implementation Report

Generated: 2026-09-01T12:23:41.528Z

## Summary

| Metric | Value |
|--------|------:|
| Sitemap URLs | 183 |
| Contracted providers in data | 7 |
| Live profile pages | 7 |
| Hub URL | https://siya.health/providers |
| Pages linking to /providers hub | 194 |
| Broken internal links (sample) | 20 |
| JSON-LD issues on profiles | 0 |

## Profile URLs

| Provider | URL | In sitemap | Schema | Breadcrumb | CTAs | States |
|----------|-----|:----------:|:------:|:----------:|:----:|:------:|
| dr-sneh-pandey | https://siya.health/providers/dr-sneh-pandey | ✓ | ✓ | ✓ | ✗ | ✓ |
| dr-vanessa-urbina | https://siya.health/providers/dr-vanessa-urbina | ✓ | ✓ | ✓ | ✗ | ✓ |
| dr-natasha-desai | https://siya.health/providers/dr-natasha-desai | ✓ | ✓ | ✓ | ✗ | ✓ |
| dr-swati-pandey | https://siya.health/providers/dr-swati-pandey | ✓ | ✓ | ✓ | ✗ | ✓ |
| megan-wunderlich | https://siya.health/providers/megan-wunderlich | ✓ | ✓ | ✓ | ✗ | ✓ |
| derek-timbs | https://siya.health/providers/derek-timbs | ✓ | ✓ | ✓ | ✗ | ✓ |
| wendy-delgado | https://siya.health/providers/wendy-delgado | ✓ | ✓ | ✓ | ✗ | ✓ |

## Service coverage matrix

| Service | Path | Providers | Count |
|---------|------|-----------|------:|
| adhd-care | /adhd-care | Dr. Sneh Pandey, MD; Dr. Vanessa Urbina, MD; Dr. Natasha Desai, MD; Dr. Swati Pandey, MD; Megan Wunderlich, FNP-C; Wendy Delgado, PA-C | 6 |
| telehealth | /telehealth | Dr. Sneh Pandey, MD; Dr. Natasha Desai, MD; Dr. Swati Pandey, MD; Dr. Vanessa Urbina, MD; Megan Wunderlich, FNP-C; Derek Timbs, FNP-BC; Wendy Delgado, PA-C | 7 |
| weight-loss-metabolic-health | /weight-loss-metabolic-health | Dr. Sneh Pandey, MD; Dr. Vanessa Urbina, MD; Derek Timbs, FNP-BC; Wendy Delgado, PA-C | 4 |
| primary-urgent-care | /primary-urgent-care | Dr. Vanessa Urbina, MD; Dr. Natasha Desai, MD; Dr. Sneh Pandey, MD; Wendy Delgado, PA-C | 4 |
| mens-health-longevity | /mens-health-longevity | Dr. Sneh Pandey, MD; Derek Timbs, FNP-BC | 2 |
| womens-health | /womens-health | Dr. Swati Pandey, MD; Dr. Vanessa Urbina, MD; Dr. Natasha Desai, MD; Wendy Delgado, PA-C | 4 |

## Internal link counts (pages referencing profile)

| Target | Inbound pages |
|--------|-------------:|
| /providers hub | 194 |
| /providers/dr-sneh-pandey | 26 |
| /providers/dr-vanessa-urbina | 21 |
| /providers/dr-natasha-desai | 20 |
| /providers/dr-swati-pandey | 11 |
| /providers/megan-wunderlich | 9 |
| /providers/derek-timbs | 9 |
| /providers/wendy-delgado | 21 |

## Hub features

- Physicians + Advanced Practice Provider sections
- Client-side filters: State (CA, TX, PA, FL, OH), Service (ADHD, Weight Loss, Primary Care, Telehealth)
- Nav/footer label: **Our Care Team**

## Broken links (sample)

- `about.html` → `/assets/favicon-32x32.png`
- `about.html` → `/assets/favicon-16x16.png`
- `about.html` → `/assets/apple-touch-icon.png`
- `about.html` → `/assets/favicon.ico`
- `about.html` → `/assets/favicon.ico`
- `about.html` → `/styles.css`
- `about.html` → `/styles.css`
- `adhd-care/miami.html` → `/assets/favicon-32x32.png`
- `adhd-care/miami.html` → `/assets/favicon-16x16.png`
- `adhd-care/miami.html` → `/assets/apple-touch-icon.png`
- `adhd-care/miami.html` → `/assets/favicon.ico`
- `adhd-care/miami.html` → `/styles.css`
- `adhd-care/orlando.html` → `/assets/favicon-32x32.png`
- `adhd-care/orlando.html` → `/assets/favicon-16x16.png`
- `adhd-care/orlando.html` → `/assets/apple-touch-icon.png`
- `adhd-care/orlando.html` → `/assets/favicon.ico`
- `adhd-care/orlando.html` → `/styles.css`
- `adhd-care/san-diego.html` → `/assets/favicon-32x32.png`
- `adhd-care/san-diego.html` → `/assets/favicon-16x16.png`
- `adhd-care/san-diego.html` → `/assets/apple-touch-icon.png`

## Operational note

All seven providers are treated as contracted, credentialed, and actively seeing patients. No future-provider or intake workflows on the public site.

