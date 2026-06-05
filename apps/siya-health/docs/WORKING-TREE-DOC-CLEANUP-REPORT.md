# Working Tree Doc Cleanup Report

**Generated:** 2026-06-02  
**Scope:** `apps/siya-health/docs/` uncommitted files only  
**Context:** After commits `df7f1d4` (provider intake) and `ebe1afb` (future provider enrichment audit)

---

## Executive summary

| Action | Count | Files |
|--------|------:|-------|
| **Keep and commit** | 3 | Provider audits + Phase 2–3 implementation report |
| **Regenerate later** | 2 | Build-time auto-generated intake artifacts |
| **Discard as stale** | 7 | Cannibalization/SEO reports (timestamp churn only) |
| **Keep local only** | 0 | — |

No cannibalization reports warrant a new commit. The only non-timestamp delta (`Sitemap URLs 154 → 155`) reflects a **local uncommitted** `/providers` build, not a post-production SEO change.

---

## Classification matrix

### Untracked files

| File | Classification | Current? | Duplicates committed docs? | Useful for ops? |
|------|----------------|----------|---------------------------|---------------|
| `PROVIDER-MISSING-INFO-AUDIT.md` | **Keep and commit** | Yes — generated 2026-06-05 from `data/providers.mjs` | No — unique per-field gap tables | **Provider ops** — cited in `PROVIDER-PUBLISHING-MINIMUMS.md` |
| `PROVIDER-BIO-COMPLETENESS-AUDIT.md` | **Keep and commit** | Yes — same generation run | No — completeness matrix + provider #4 minimums | **Provider ops** — cited in `PROVIDER-PUBLISHING-MINIMUMS.md` |
| `PROVIDER-PHASE2-3-GENERATOR-REPORT.md` | **Keep and commit** | Yes — documents local generator QA (155 URLs, PASS) | No — only Phase 1 reports committed (`PHASE1-TRUST-CLEANUP`, `PHASE1-PRODUCTION-CERTIFICATION`) | **Provider ops** — implementation record for uncommitted generator work |
| `PROVIDER-BIO-REQUEST-SHEET.csv` | **Regenerate later** | Yes — matches current 3-provider gaps | **Yes** — superseded by `PROVIDER-INTAKE-ADMIN-TRACKER.csv` (richer columns, committed) | Low — auto-export; admin tracker is canonical |
| `PROVIDER-INTAKE-FORM.md` | **Regenerate later** | Yes — auto-generated template | **Yes** — superseded by `PROVIDER-INTAKE-FORM-CLEAN.md` (committed, human-facing) | Low — build artifact; send `*-CLEAN.md` or per-provider gap forms |

### Modified files (cannibalization / SEO)

| File | Classification | Material change? | Reason |
|------|----------------|------------------|--------|
| `CANNIBALIZATION-PHASE1-AUDIT.md` | **Discard as stale** | No | `Generated:` timestamp only |
| `CANNIBALIZATION-PHASE1-FINAL.md` | **Discard as stale** | No* | Timestamp + sitemap `154→155` from local provider build, not production cannibalization deploy |
| `CORNERSTONE-PROTECTION-REPORT.md` | **Discard as stale** | No | Timestamp only |
| `DUPLICATE-PAIR-CHANGES.md` | **Discard as stale** | No | Timestamp only |
| `LINK-EQUITY-REPORT.md` | **Discard as stale** | No | Timestamp only |
| `SUPPORTING-PAIR-LINKING.md` | **Discard as stale** | No | Timestamp only |
| `TITLE-META-DUPLICATE-AUDIT.md` | **Discard as stale** | No | Timestamp only |

\*Production cannibalization certification (`CANNIBALIZATION-PHASE1-PRODUCTION-CERTIFICATION.md`, commit `edd3a85`) records **154** sitemap URLs. The `155` count belongs to Phase 2–3 provider index work still uncommitted in code/HTML.

---

## Recommended files to commit (3)

| File | Reason |
|------|--------|
| `PROVIDER-MISSING-INFO-AUDIT.md` | Closes reference loop in `PROVIDER-PUBLISHING-MINIMUMS.md`; actionable gap list for live 3 providers |
| `PROVIDER-BIO-COMPLETENESS-AUDIT.md` | Completeness matrix + minimum bar for provider #4; complements missing-info audit |
| `PROVIDER-PHASE2-3-GENERATOR-REPORT.md` | Single source for generator architecture, QA PASS, and readiness gates (distinct from Phase 1 docs) |

**Suggested commit message (when instructed):**

```
docs(siya-health): add provider generator audits and phase 2-3 report
```

---

## Recommended files to discard / not commit

### Restore modified SEO reports (7)

Revert timestamp churn; keep repo aligned with last committed cannibalization baseline.

```bash
git restore \
  apps/siya-health/docs/CANNIBALIZATION-PHASE1-AUDIT.md \
  apps/siya-health/docs/CANNIBALIZATION-PHASE1-FINAL.md \
  apps/siya-health/docs/CORNERSTONE-PROTECTION-REPORT.md \
  apps/siya-health/docs/DUPLICATE-PAIR-CHANGES.md \
  apps/siya-health/docs/LINK-EQUITY-REPORT.md \
  apps/siya-health/docs/SUPPORTING-PAIR-LINKING.md \
  apps/siya-health/docs/TITLE-META-DUPLICATE-AUDIT.md
```

### Remove or ignore auto-generated duplicates (2) — optional

These regenerate on `npm run build` via `scripts/generate-provider-audit-docs.mjs`. Do **not** commit.

```bash
rm apps/siya-health/docs/PROVIDER-BIO-REQUEST-SHEET.csv \
   apps/siya-health/docs/PROVIDER-INTAKE-FORM.md
```

Alternative (keep locally without committing): leave untracked; add to personal ignore or future `.gitignore` entry:

```
# Optional — if adopted later
apps/siya-health/docs/PROVIDER-BIO-REQUEST-SHEET.csv
apps/siya-health/docs/PROVIDER-INTAKE-FORM.md
```

---

## Exact `git add` command (commit batch)

**Not executed** — run when instructed:

```bash
git add \
  apps/siya-health/docs/PROVIDER-MISSING-INFO-AUDIT.md \
  apps/siya-health/docs/PROVIDER-BIO-COMPLETENESS-AUDIT.md \
  apps/siya-health/docs/PROVIDER-PHASE2-3-GENERATOR-REPORT.md
```

---

## Post-cleanup working tree (expected)

After restore + optional rm:

| Status | Remaining under `docs/` |
|--------|-------------------------|
| Staged (if commit run) | 3 provider audit/report files |
| Clean | All 7 cannibalization reports match `HEAD` |
| Untracked | `WORKING-TREE-DOC-CLEANUP-REPORT.md` (this file) |
| Regenerated on next build | `PROVIDER-BIO-REQUEST-SHEET.csv`, `PROVIDER-INTAKE-FORM.md`, plus fresh timestamps on SEO reports if full build runs |

---

## Canonical doc map (avoid future duplication)

| Purpose | Canonical (committed or recommended) | Do not commit |
|---------|--------------------------------------|---------------|
| Send to physicians | `PROVIDER-INTAKE-FORM-CLEAN.md`, `provider-intake/dr-*.md` | `PROVIDER-INTAKE-FORM.md` (auto) |
| Admin tracking | `PROVIDER-INTAKE-ADMIN-TRACKER.csv` | `PROVIDER-BIO-REQUEST-SHEET.csv` (auto) |
| Gap analysis | `PROVIDER-MISSING-INFO-AUDIT.md`, `PROVIDER-BIO-COMPLETENESS-AUDIT.md` | — |
| Future candidates | `FUTURE-PROVIDER-ENRICHMENT-AUDIT.md`, `FUTURE-PROVIDER-INTAKE-GAPS.csv` | — |
| Publishing gates | `PROVIDER-PUBLISHING-MINIMUMS.md` | — |
| SEO cannibalization | `CANNIBALIZATION-PHASE1-PRODUCTION-CERTIFICATION.md` | Timestamp-only report reruns |
| Generator implementation | `PROVIDER-PHASE2-3-GENERATOR-REPORT.md` (pending commit) | — |

---

## Notes

- `PROVIDER-PHASE2-3-GENERATOR-REPORT.md` § “Missing-info audit summary” still points to `PROVIDER-BIO-REQUEST-SHEET.csv` and `PROVIDER-INTAKE-FORM.md`. After this cleanup, treat **ADMIN-TRACKER** and **INTAKE-FORM-CLEAN** as canonical; optional doc edit in a follow-up (not required for this cleanup pass).
- Committing the three provider audit files does **not** modify website pages, `providers.mjs`, or mark anyone verified.
- Full `npm run build` will re-touch all auto-generated docs; prefer committing provider audits **before** the next build, or re-run `node scripts/generate-provider-audit-docs.mjs` after any `providers.mjs` change.
