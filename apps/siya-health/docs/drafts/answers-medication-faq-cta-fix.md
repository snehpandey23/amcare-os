# DRAFT — Answers medication FAQ CTA fix (not applied yet)

**Status:** Applied 2026-08-10 (scoped to three pages). Durable path: `ADHD_MED_FAQ_DUAL_CTA_SLUGS` in `scripts/content-assembly.mjs` + Care column in `generate-answer-pages.mjs`.  
**Goal:** Match blog conversion path on medication-related `/answers/*` pages that currently only deep-link `/adhd-care`.

## Pages in scope

| Slug | Current Care / final CTA | Gap |
| --- | --- | --- |
| `/answers/adderall-vs-vyvanse-adults` | Care → `/adhd-care`; final CTA “Explore ADHD Care” only | No screening, no Meet & Greet |
| `/answers/can-you-get-adhd-medication-online` | Same | Same |
| `/answers/how-online-prescriptions-work` | Same | Same |

(Optional follow-on, same pattern: `starting-adhd-medication-adults`, `adhd-medication-side-effects`, `adhd-medication-every-day`, `is-adhd-medication-safe-long-term`.)

## Proposed UI (parity with blog final CTA)

Keep `/adhd-care` in the Related resources → Care column.  
Replace the single primary final CTA with **one primary + one secondary** (blog pattern):

```html
<div class="cta-block blog-cta answer-final-cta" data-assembly="primary-cta">
  <a class="button ds-button ds-button--primary"
     href="/adhd-screening?adhd=1"
     data-siya-track="adhd_screening_click"
     data-siya-location="answer-context-closing"
     data-page-type="adhd"
     data-intent="adhd"
     data-conversion-goal="screening"
     data-cta-slot="lead-magnet"
     data-component="button">Take Free ADHD Screening</a>
  <a class="button ds-button ds-button--secondary secondary"
     href="/redirect/meet-greet"
     data-siya-track="meet_greet_click"
     data-siya-location="answer-context-closing"
     data-page-type="adhd"
     data-intent="adhd"
     data-conversion-goal="meetGreet"
     data-cta-slot="meetGreet"
     data-component="button">Book Free Meet &amp; Greet</a>
</div>
<p class="cta-microcopy">Or explore <a href="/adhd-care">ADHD evaluation &amp; care</a>.</p>
```

Also expand the Care column links:

```html
<div class="answer-internal-links-col">
  <h3 class="answer-internal-links-col-title">Care</h3>
  <p><a class="answer-internal-links-primary" href="/adhd-care">ADHD evaluation &amp; telehealth care</a></p>
  <p><a href="/adhd-screening">Free ADHD screening</a></p>
  <p><a href="/redirect/meet-greet">Book free Meet &amp; Greet</a></p>
</div>
```

## Durable implementation note (when approved)

Answers are regenerated from:

- `scripts/generate-answer-pages.mjs` (Related resources Care column)
- `scripts/content-assembly.mjs` → `buildContextClosing()` / `primaryJourneyForTopic()` (final CTA)

Patching HTML alone will be overwritten on the next `generate-answer-pages` run. Prefer:

1. For **ADHD medication / prescribing** slugs (or all `topic === 'adhd'` answers): final CTA = screening primary + Meet & Greet secondary; keep `/adhd-care` as supporting link.  
2. Watch `ASSEMBLY.maxPrimaryCtas` — keep **one** primary button; Meet & Greet stays `ds-button--secondary`.

## Copy / compliance check

- Screening microcopy already used on blog: screening is not a diagnosis.  
- Meet & Greet remains process call, not a prescribing visit.  
- No medication promises in CTA labels.

## Review checklist

- [ ] Approve CTA pattern (screening primary + Meet & Greet secondary)  
- [ ] Scope: three pages only vs all ADHD answers  
- [ ] After approval: patch generator + regenerate; smoke-check the three URLs  
- [ ] Do not deploy until content drafts #1–#2 are also approved (or deploy CTA-only if preferred)
