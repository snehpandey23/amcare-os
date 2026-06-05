# Legal Consistency Audit

**Scope:** Published three-document stack, registry, footers, redirects, effective dates, cross-links  
**Audit date:** 2026-06-05  
**Required effective date:** **October 31, 2025** (counsel-approved)  
**Required entity block:** See `ENTITY-CONSISTENCY-AUDIT.md` EN-001.

## Summary

| Severity | Count |
|----------|------:|
| Critical | 4 |
| High | 5 |
| Medium | 4 |
| Low | 3 |

**Verdict:** **FAIL** — All three published legal documents show **June 2, 2026** effective date, not October 31, 2025. Canonical entity block absent. Tracking without cookie policy.

---

## Findings

### LG-001 — Wrong effective date on Terms of Use

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `legal/terms-of-use/index.html` |
| **Line** | 48 |
| **Current text** | `Effective: June 2, 2026` |
| **Recommended correction** | `Effective Date: October 31, 2025` (counsel-approved) |
| **Deployment risk** | **Critical** — Legal enforceability / counsel mismatch |

### LG-002 — Wrong effective date on Privacy Policy

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `legal/privacy-policy/index.html` |
| **Line** | 48 |
| **Current text** | `Effective: June 2, 2026` |
| **Recommended correction** | `Effective Date: October 31, 2025` |
| **Deployment risk** | **Critical** |

### LG-003 — Wrong effective date on Notice of Privacy Practices

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `legal/notice-of-privacy-practices/index.html` |
| **Line** | 48 |
| **Current text** | `Effective: June 2, 2026` |
| **Recommended correction** | `Effective: October 31, 2025` |
| **Deployment risk** | **Critical** — HIPAA notice date drift |

### LG-004 — Source markdown uses June 2, 2026

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `legal-document-versions/terms-of-use.md`, `privacy-policy.md`, `notice-of-privacy-practices.md` |
| **Line** | 5 |
| **Current text** | `June 2, 2026` / `Effective: June 2, 2026` |
| **Recommended correction** | Re-import DOCX with placeholder `[DATE]` → `October 31, 2025`; update `data/legal-documents.mjs` `effectiveDate: '2025-10-31'`. |
| **Deployment risk** | **Critical** — Regenerates wrong date on build |

### LG-005 — Registry `effectiveDate` is 2026-06-02

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `data/legal-documents.mjs` |
| **Lines** | 21, 33, 45 |
| **Current text** | `effectiveDate: '2026-06-02'` |
| **Recommended correction** | `effectiveDate: '2025-10-31'` |
| **Deployment risk** | **High** |

### LG-006 — Legal hub table shows June 2, 2026

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `legal/index.html` |
| **Lines** | 61–69 |
| **Current text** | Three rows: `June 2, 2026` |
| **Recommended correction** | `October 31, 2025` after registry + source fix |
| **Deployment risk** | **High** |

### LG-007 — Canonical entity block missing (see EN-001)

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | All `/legal/*` pages |
| **Current text** | Block not present |
| **Recommended correction** | Add counsel-approved Inc./PLLC sentence to legal template |
| **Deployment risk** | **Critical** |

### LG-008 — NPP separate from Privacy Policy (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `legal/privacy-policy/index.html` |
| **Line** | ~65 |
| **Current text** | PHI routed to `/legal/notice-of-privacy-practices` |
| **Recommended correction** | None — architecture correct |
| **Deployment risk** | N/A |

### LG-009 — Cross-links between three documents (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | All three legal pages |
| **Section** | `legal-related` nav + inline links |
| **Current text** | Links to `/legal/privacy-policy`, `/legal/terms-of-use`, `/legal/notice-of-privacy-practices` |
| **Recommended correction** | None |
| **Deployment risk** | N/A |

### LG-010 — Legacy redirects configured (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `vercel.json` |
| **Lines** | 8–16 |
| **Current text** | `/terms` → `/legal/terms-of-use`; `/privacy-policy` → `/legal/privacy-policy` |
| **Recommended correction** | None |
| **Deployment risk** | N/A |

### LG-011 — Legacy HTML pages noindex (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `terms.html`, `privacy-policy.html` |
| **Line** | 21 |
| **Current text** | `noindex, nofollow` + redirect titles |
| **Recommended correction** | None |
| **Deployment risk** | N/A |

### LG-012 — GTM/GA on site; cookie policy not published

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | Sitewide HTML heads |
| **Current text** | `GTM-PLBD4TTQ`, `G-9WTQWHCTFT`, `AW-17553537456` active |
| **Recommended correction** | Publish cookie policy + consent mechanism before deploy; Privacy Policy subprocessors section should list tags (verify counsel text). |
| **Deployment risk** | **High** |

### LG-013 — Planned policies correctly excluded from site

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `data/legal-documents.mjs` |
| **Current text** | Cookie, telehealth consent, controlled substance, prescription = `planned` only |
| **Recommended correction** | None for three-doc stack scope |
| **Deployment risk** | N/A |

### LG-014 — `validate-legal-links.mjs` passes (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | Build output |
| **Current text** | OK — 3 published docs, no false NPP, no legacy hrefs |
| **Recommended correction** | Extend validator to check effective date + entity block when added |
| **Deployment risk** | N/A |

### LG-015 — Terms counsel typo preserved: “contracted provides”

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `legal-document-versions/terms-of-use.md` |
| **Line** | 7 |
| **Current text** | `contracted provides` |
| **Recommended correction** | **Counsel fix only** — do not engineering-rewrite |
| **Deployment risk** | **Low** — Professionalism |

### LG-016 — No marketing CTAs on legal pages (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `legal/*.html` |
| **Current text** | No GHL booking, trust bars, or chat widgets |
| **Recommended correction** | None |
| **Deployment risk** | N/A |

---

## Legal stack checklist

| Document | URL | Published | Effective date correct | Entity block | Cross-linked |
|----------|-----|:---------:|:----------------------:|:------------:|:------------:|
| Terms of Use | `/legal/terms-of-use` | Yes | **No** | **No** | Yes |
| Privacy Policy | `/legal/privacy-policy` | Yes | **No** | **No** | Yes |
| NPP | `/legal/notice-of-privacy-practices` | Yes | **No** | **No** | Yes |
| Cookie Policy | — | No | — | — | — |
| Telehealth Consent | — | No | — | — | — |
| Controlled Substance | — | No | — | — | — |

---

## Build validation (legal)

| Check | Result |
|-------|--------|
| `validate-legal-links.mjs` | **PASS** |
| `npm run build` | **PASS** (last run 2026-06-05) |
| Effective date = Oct 31, 2025 | **FAIL** |
| Entity canonical block | **FAIL** |
