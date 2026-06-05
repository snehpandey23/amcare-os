# Reviewed Content Rollback Report

Generated: 2026-06-05

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Wave 1 URLs in `CLINICAL_REVIEW_APPROVED` | 16 | **0** |
| Pages with JSON-LD `reviewedBy` | 16+ | **0** |
| Provider profile `reviewedContent` sections | present | **removed** |
| Default clinical review state | mixed | **Pending physician review** |

## Sign-off gate (new contract)

`reviewedBy` and profile `reviewedContent` emit only when **all** are true:

- `reviewerSlug`
- `reviewDate`
- `signOffSource` (document path/URL)
- `reviewerConsent === true`

Implemented via `isReviewSignOffComplete()` in `data/content-review-registry.mjs`.

## Files changed

- `data/content-review-registry.mjs` — emptied allowlist; added gate helpers
- `data/provider-reviewed-content.mjs` — skips incomplete entries
- `scripts/clinical-entity.mjs` — unchanged logic; inherits gated `getBlogReviewMeta` / `getAnswerReviewMeta`
- Regenerated answers/blogs via build — pending review asides restored

## Verification

```text
grep '"reviewedBy"' *.html → 0 matches site-wide
grep 'Physician-reviewed content' providers/*.html → 0 matches
```

## Gate status

**PASS** — No reviewed attribution without documented sign-off.

## Re-enable Wave 1

Add entries back to `CLINICAL_REVIEW_APPROVED` with `signOffSource` + `reviewerConsent: true` per URL, then rebuild.
