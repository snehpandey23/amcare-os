# Copy consistency report

Generated: 2026-06-04T11:43:24.876Z

## Approved wording system

| Use | Copy |
|-----|------|
| Primary CTA | Book a Meet & Greet |
| Secondary CTA | Explore Care Options |
| ADHD primary CTA | Book ADHD Evaluation |
| ADHD secondary CTA | Start Free Screening |
| Education hub | Health Guides |
| Review badge (pending) | Pending physician review |
| Review badge (reviewed) | Physician reviewed |

## Inconsistencies remaining after fix

_None detected in HTML scan_

## Fixes applied

- `normalizeSitewideCopy()` extended in `scripts/site-chrome.mjs`
- `syncClinicalReviewAside()` strips all review asides then inserts one governed block
- Blog engagement dedupe aligned with pending badge copy

## Note

Marketing wordplay using the word "answers" (e.g. blog titles) was not changed. Only hub/nav labels use **Health Guides**.
