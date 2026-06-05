# Provider Expansion — Implementation Report

Generated: 2026-06-05T12:38:43.674Z

## Summary

| Metric | Value |
|--------|------:|
| Sitemap URLs | 159 |
| Contracted providers in data | 7 |
| Live profile pages | 7 |
| Hub URL | https://siya.health/providers |
| Pages linking to /providers hub | 159 |
| Broken internal links (sample) | 2 |
| JSON-LD issues on profiles | 0 |

## Profile URLs

| Provider | URL | In sitemap | Schema | Breadcrumb | CTAs | States |
|----------|-----|:----------:|:------:|:----------:|:----:|:------:|
| dr-sneh-pandey | https://siya.health/providers/dr-sneh-pandey | ✓ | ✓ | ✓ | ✓ | ✓ |
| dr-vanessa-urbina | https://siya.health/providers/dr-vanessa-urbina | ✓ | ✓ | ✓ | ✓ | ✓ |
| dr-natasha-desai | https://siya.health/providers/dr-natasha-desai | ✓ | ✓ | ✓ | ✓ | ✓ |
| dr-swati-pandey | https://siya.health/providers/dr-swati-pandey | ✓ | ✓ | ✓ | ✓ | ✓ |
| megan-wunderlich | https://siya.health/providers/megan-wunderlich | ✓ | ✓ | ✓ | ✓ | ✓ |
| derek-timbs | https://siya.health/providers/derek-timbs | ✓ | ✓ | ✓ | ✓ | ✓ |
| wendy-delgado | https://siya.health/providers/wendy-delgado | ✓ | ✓ | ✓ | ✓ | ✓ |

## Service coverage matrix

| Service | Path | Providers | Count |
|---------|------|-----------|------:|
| adhd-care | /adhd-care | Dr. Sneh Pandey, MD; Dr. Natasha Desai, MD; Dr. Swati Pandey, MD; Megan Wunderlich, FNP-C | 4 |
| telehealth | /telehealth | Dr. Sneh Pandey, MD; Dr. Natasha Desai, MD; Dr. Swati Pandey, MD; Dr. Vanessa Urbina, MD; Megan Wunderlich, FNP-C; Derek Timbs, FNP-BC; Wendy Delgado, PA-C | 7 |
| weight-loss-metabolic-health | /weight-loss-metabolic-health | Dr. Sneh Pandey, MD; Dr. Vanessa Urbina, MD; Derek Timbs, FNP-BC; Wendy Delgado, PA-C | 4 |
| primary-urgent-care | /primary-urgent-care | Dr. Vanessa Urbina, MD; Dr. Natasha Desai, MD; Dr. Sneh Pandey, MD | 3 |
| mens-health-longevity | /mens-health-longevity | Dr. Sneh Pandey, MD; Derek Timbs, FNP-BC | 2 |

## Internal link counts (pages referencing profile)

| Target | Inbound pages |
|--------|-------------:|
| /providers hub | 159 |
| /providers/dr-sneh-pandey | 26 |
| /providers/dr-vanessa-urbina | 9 |
| /providers/dr-natasha-desai | 18 |
| /providers/dr-swati-pandey | 13 |
| /providers/megan-wunderlich | 12 |
| /providers/derek-timbs | 9 |
| /providers/wendy-delgado | 7 |

## Hub features

- Physicians + Advanced Practice Provider sections
- Client-side filters: State (CA, TX, PA, FL, OH), Service (ADHD, Weight Loss, Primary Care, Telehealth)
- Nav/footer label: **Our Care Team**

## Broken links (sample)

- `answers/index.html` → `/llms.txt`
- `answers/index.html` → `/article-index.json`

## Operational note

All seven providers are treated as contracted, credentialed, and actively seeing patients. No future-provider or intake workflows on the public site.

