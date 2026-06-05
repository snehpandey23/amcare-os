# Specialty & Scope Stabilization Report

Generated: 2026-06-05

## Summary

Removed misleading psychiatry practice positioning from provider data, org schema, hub meta, and Swati profile.

| Risk pattern | Before | After |
|--------------|--------|-------|
| `Psychiatric Physician` (Swati) | Yes | **No** |
| `Psychiatry` in org/provider schema | Yes | **No** |
| `psychiatric telehealth` (hub meta) | Yes | **No** |
| `psychiatric depth` (care-team taglines) | Yes | **behavioral health depth** |
| Provider-title `psychologist` | 0 | 0 |

Educational blog uses of “psychiatric medications/symptoms” remain — clinical context only (**DEFER BUT SAFE**).

## Key replacements

| Location | New positioning |
|----------|-----------------|
| Swati role / schema | Licensed Medical Provider — ADHD & Mental Health Care |
| Swati `medicalSpecialty` | Adult ADHD, Mental Health, Primary Care |
| Swati tagline | ADHD & behavioral health depth |
| Org `medicalSpecialty` (index + entity-graph) | Internal Medicine, Family Medicine, Obesity Medicine, Adult ADHD, Behavioral Medicine |
| Hub meta | primary care–led ADHD, metabolic, telehealth |

## Files changed

- `data/providers.mjs` — Swati profile rewrite; Natasha escalation wording
- `data/internal-provider-records.mjs` — removed unverified psychiatric board cert label
- `scripts/generate-provider-pages.mjs` — hub description
- `scripts/rebuild-entity-graph.mjs` — org specialties; Swati expertise topics
- `index.html` — org JSON-LD
- Regenerated provider pages, `provider-index.json`, `entity-graph.json`, `llms.txt`

## Verification

```text
grep 'Psychiatric Physician|psychiatric depth|psychiatric telehealth|"Psychiatry"' providers data entity-graph provider-index → 0
```

## Gate status

**PASS** — No misleading psychiatry/psychology practice positioning in provider/org marketing layer.
