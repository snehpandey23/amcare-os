# Legal Phase 2 — Three-Document Publish Report

Generated: 2026-06-05  
Scope: Publish counsel-approved **Terms of Use**, **Privacy Policy**, and **Notice of Privacy Practices** only.

## Executive summary

Three lawyer-drafted DOCX files were imported verbatim from Zoho WorkDrive, converted to markdown, and published at the canonical `/legal/*` URLs. Four previously stubbed legal pages (cookie, telehealth consent, controlled substance, prescription) were **removed from the site** and retained in registry as **planned** only.

**Build passes.** Legal link validation passes. No marketing CTAs, trust bars, or chat widgets on published legal pages.

**Do not deploy until counsel/ops review** — engineering publish is complete; human sign-off on effective date and placeholder substitutions is still required.

---

## Source documents imported

| Counsel DOCX | Markdown | URL | Blocks | Chars |
|--------------|----------|-----|-------:|------:|
| Website Terms of Use - Siya Health.docx | `legal-document-versions/terms-of-use.md` | `/legal/terms-of-use` | 81 | 28,497 |
| Website Privacy Policy - Siya Health (1).docx | `legal-document-versions/privacy-policy.md` | `/legal/privacy-policy` | 106 | 18,427 |
| Notice of Privacy Practices Siya Health.docx | `legal-document-versions/notice-of-privacy-practices.md` | `/legal/notice-of-privacy-practices` | 55 | 9,832 |

Import script: `scripts/import-counsel-legal-docx.mjs` (Python DOCX XML extraction; no substance rewriting).

---

## Placeholder substitutions only

| Placeholder | Resolved value |
|-------------|----------------|
| `[DATE]` | June 2, 2026 |
| `[website]` / `(website)` | `https://siya.health` |
| `(insert link)` (Terms intro) | `/legal/privacy-policy`, `/legal/notice-of-privacy-practices` |
| `[info@]` | `care@siya.health` |

**Preserved verbatim:** counsel wording including “contracted provides” (counsel typo), “Terms of Service” label in Terms intro, 13+ age gate, arbitration notice, full section structure.

**Not substituted:** internal section anchors (e.g. “Your State Privacy Rights”) — left as counsel wrote.

---

## Cross-linking

| Document | Related policy links |
|----------|---------------------|
| Terms of Use | Privacy Policy, Notice of Privacy Practices (intro + §2 + related nav) |
| Privacy Policy | Notice of Privacy Practices (PHI separation sentence + related nav) |
| Notice of Privacy Practices | Privacy Policy, Terms of Use (related nav) |
| Legal hub (`/legal`) | All three published policies |

**NPP separation:** Privacy Policy explicitly routes PHI to `/legal/notice-of-privacy-practices`; NPP is a distinct URL and document. `LEGAL_LINKS.noticeOfPrivacy ≠ LEGAL_LINKS.privacy` (validator enforced).

---

## Legacy URL handling

| Legacy URL | Handling |
|------------|----------|
| `/terms` | `vercel.json` 301 → `/legal/terms-of-use`; `terms.html` noindex redirect stub (Phase 1B) |
| `/privacy-policy` | `vercel.json` 301 → `/legal/privacy-policy`; `privacy-policy.html` noindex redirect stub (Phase 1B) |

---

## Pages not published (planned/future)

Removed from filesystem; registry status `planned`:

- `/legal/cookie-policy`
- `/legal/telehealth-consent`
- `/legal/controlled-substance-policy`
- `/legal/prescription-policy`

No refund policy page created.

---

## Legal page UX (marketing removed)

Published `/legal/*` pages use:

- `body.legal-page` neutral template
- Minimal header (Home / Legal / About — **no booking CTA**)
- No hero, trust bar, or LeadConnector chat
- `applySiteChrome()` short-circuit for `legal/*` (footer + link normalization only)
- Organizational service availability aside (injected; not in counsel markdown)

---

## Build & QA results

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** (exit 0) |
| `validate-legal-links.mjs` | **PASS** |
| Sitemap URLs | **161** (down from 165 after removing 4 planned stubs) |
| HTML pages | **163** |
| Duplicate title tag groups | **0** |
| Duplicate H1 groups | **0** |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |

---

## Registry status

| Slug | `status` | `version` | `effectiveDate` |
|------|----------|-----------|-----------------|
| `terms-of-use` | `published` | `1.0.0-counsel` | `2026-06-02` |
| `privacy-policy` | `published` | `1.0.0-counsel` | `2026-06-02` |
| `notice-of-privacy-practices` | `published` | `1.0.0-counsel` | `2026-06-02` |
| `telehealth-consent` | `planned` | — | — |
| `cookie-policy` | `planned` | — | — |
| `controlled-substance-policy` | `planned` | — | — |
| `prescription-policy` | `planned` | — | — |

---

## Files added/modified

| Path | Role |
|------|------|
| `legal-document-versions/terms-of-use.md` | Counsel Terms body |
| `legal-document-versions/privacy-policy.md` | Counsel Privacy body |
| `legal-document-versions/notice-of-privacy-practices.md` | Counsel NPP body |
| `scripts/import-counsel-legal-docx.mjs` | DOCX → markdown importer |
| `data/legal-documents.mjs` | `PUBLISHED_LEGAL_DOCUMENTS` + `PLANNED_LEGAL_DOCUMENTS` |
| `scripts/generate-legal-pages.mjs` | Publish 3 docs; remove planned stubs |
| `scripts/validate-legal-links.mjs` | Validate published docs only |
| `scripts/site-chrome.mjs` | Skip marketing chrome on `legal/*` |
| `styles.css` | Legal document typography |
| `legal/terms-of-use/index.html` | Generated published page |
| `legal/privacy-policy/index.html` | Generated published page |
| `legal/notice-of-privacy-practices/index.html` | Generated published page |
| `legal/index.html` | Hub (3 docs only) |

---

## Verdict

| Question | Answer |
|----------|--------|
| **Safe to commit?** | **Yes** — three-document stack implemented; build and legal validation pass. |
| **Safe to deploy?** | **No — pending review** — confirm effective date (`June 2, 2026`), contact email (`care@siya.health`), and full counsel text before production. GHL clickwrap and cookie policy remain out of scope. |

---

## Pre-deploy review checklist (ops/counsel)

- [ ] Confirm effective date with counsel (currently June 2, 2026)
- [ ] Confirm `care@siya.health` for children/privacy contact
- [ ] Spot-check rendered HTML against signed DOCX PDFs
- [ ] GHL intake clickwrap (Phase 3 — not implemented)
- [ ] Cookie banner + Cookie Policy (future — not published)
