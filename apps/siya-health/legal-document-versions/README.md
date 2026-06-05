# Legal document drop-in sources

Counsel-approved markdown files live here. The build generator (`scripts/generate-legal-pages.mjs`) reads paths from `data/legal-documents.mjs` → `PUBLISHED_LEGAL_DOCUMENTS`.

## Phase 2 — published stack (counsel DOCX import)

| Slug | Source DOCX | Markdown | Status |
|------|-------------|----------|--------|
| `terms-of-use` | Website Terms of Use - Siya Health.docx | `terms-of-use.md` | **published** |
| `privacy-policy` | Website Privacy Policy - Siya Health (1).docx | `privacy-policy.md` | **published** |
| `notice-of-privacy-practices` | Notice of Privacy Practices Siya Health.docx | `notice-of-privacy-practices.md` | **published** |

Re-import from DOCX (verbatim + placeholder substitution only):

```bash
node scripts/import-counsel-legal-docx.mjs
node scripts/generate-legal-pages.mjs
```

Optional env: `COUNSEL_DOCX_TERMS`, `COUNSEL_DOCX_PRIVACY`, `COUNSEL_DOCX_NPP`.

## Planned (not generated until counsel approves)

`telehealth-consent`, `controlled-substance-policy`, `prescription-policy` — registry only in `PLANNED_LEGAL_DOCUMENTS`.

**Published (operations):** `controlled-substance-treatment-agreement.md`, `cookie-policy.md`

## State availability rule

**Do not hardcode state lists inside markdown body.** Generator injects `AVAILABLE_SERVICE_STATES` and `PROVIDER_LICENSE_DISCLAIMER` on every `/legal/*` page.
