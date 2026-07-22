# CTA band deduplication report

Generated: 2026-07-15T03:47:03.352Z

## Blogs scanned

44 blog articles (excluding 5 category/index hubs).

## Duplicate `<div class="cta-band">` before fix

_None — prior audits counted `cta-band-buttons` as a second match; actual duplicate divs were rare._

## Provider CTA blocks removed (redundant with final band)

0 articles had `blog-provider-cta` sections removed.



## Standardized final CTA

All articles now use one exit band:

- **Title:** Not sure where to start?
- **Body:** Talk to a Clinician can help you understand your options and choose the right care path.
- **Default primary:** Talk to a Clinician
- **Default secondary:** Explore Care Options (topic service page)
- **ADHD-specific primary:** Book ADHD Evaluation
- **ADHD-specific secondary:** Start Free Screening

## Final count per blog

| Result | Count |
|--------|------:|
| Exactly 1 `cta-band` div | 44 |
| Exceptions | 0 |



## Mid-article CTAs

In-article `cta-block` elements inside `<article>` now include `blog-cta--mid` (final band uses `cta-band` only).
