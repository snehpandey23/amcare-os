# Entity Consistency Audit

**Scope:** Corporate identity across legal, footers, schema, entity graph, provider pages, marketing  
**Audit date:** 2026-06-05  

**Counsel-approved canonical block (required sitewide on legal surfaces):**

> Siya Health Inc. provides administrative and non-clinical support services. Medical services are provided by Siya Healthcare, PLLC through licensed clinicians.

## Summary

| Severity | Count |
|----------|------:|
| Critical | 3 |
| High | 6 |
| Medium | 5 |
| Low | 2 |

**Verdict:** **FAIL** — Canonical entity block is absent from published legal pages and sitewide chrome; Terms use different administrative wording; clinical entity (PLLC) not modeled in org schema/graph.

---

## Findings

### EN-001 — Canonical entity block missing from legal pages

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `legal/terms-of-use/index.html`, `legal/privacy-policy/index.html`, `legal/notice-of-privacy-practices/index.html`, `legal/index.html` |
| **Section** | Document header / aside |
| **Current text** | No sentence containing `Siya Health Inc. provides administrative and non-clinical support services` |
| **Recommended correction** | Inject counsel-approved block in legal template (`scripts/generate-legal-pages.mjs`) above or within `legal-meta` aside on every `/legal/*` page. |
| **Deployment risk** | **Critical** — Regulatory / counsel sign-off gap |

### EN-002 — Terms use different administrative wording

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `legal/terms-of-use/index.html` / `legal-document-versions/terms-of-use.md` |
| **Line** | 7 (md) / ~54 (html) |
| **Current text** | `Siya Health, provides administrative, payment, and other support services to Siya Healthcare, PLLC (collectively, "Siya Health")` |
| **Recommended correction** | Counsel alignment: either amend Terms to match canonical block exactly or add canonical block as superseding site notice (counsel decision—not engineering rewrite). |
| **Deployment risk** | **High** — Inconsistent entity story |

### EN-003 — Terms do not name “Siya Health Inc.”

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `legal-document-versions/terms-of-use.md` |
| **Line** | 7 |
| **Current text** | `Siya Health, provides administrative...` (no “Inc.”) |
| **Recommended correction** | Counsel to confirm whether admin entity is **Siya Health Inc.** and update Terms accordingly. |
| **Deployment risk** | **High** |

### EN-004 — Footer copyright without entity relationship

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | Sitewide footers (e.g. `index.html` line ~509) |
| **Current text** | `© 2026 Siya Health Inc. All rights reserved.` (no PLLC clinical disclaimer) |
| **Recommended correction** | Add one-line entity footer: `Medical services provided by Siya Healthcare, PLLC.` or full canonical block in legal footer variant. |
| **Deployment risk** | **Medium** |

### EN-005 — `entity-graph.json` org name vs PLLC

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `data/entity-graph.json` |
| **Lines** | 5–10 |
| **Current text** | `"name": "Siya Health"`, `"alternateName": "Siya Health Inc."` — no `Siya Healthcare, PLLC` node |
| **Recommended correction** | Add `@type: MedicalOrganization` node for PLLC clinical entity; link admin Inc. as parent/support org per counsel structure. |
| **Deployment risk** | **High** — AI/knowledge graph misidentifies covered entity |

### EN-006 — Homepage schema: `MedicalOrganization` named “Siya Health” only

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `index.html` |
| **Line** | 49 |
| **Current text** | `"@type":"MedicalOrganization","name":"Siya Health"` |
| **Recommended correction** | Schema should reflect PLLC as clinical org or use `parentOrganization` / `subOrganization` pattern approved by counsel. |
| **Deployment risk** | **Medium** |

### EN-007 — NPP correctly names Siya Healthcare, PLLC (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `legal/notice-of-privacy-practices/index.html` |
| **Section** | Body |
| **Current text** | `Siya Healthcare, PLLC ("Siya Healthcare" or "Practice")` |
| **Recommended correction** | Keep; add canonical admin/clinical block for consistency. |
| **Deployment risk** | N/A |

### EN-008 — Privacy Policy names affiliate PLLC (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `legal/privacy-policy/index.html` |
| **Line** | ~56 |
| **Current text** | `Siya Health, on its own behalf and its affiliate Siya Healthcare, PLLC` |
| **Recommended correction** | Add explicit **Siya Health Inc.** if counsel confirms; add canonical block. |
| **Deployment risk** | N/A |

### EN-009 — Legal hub describes PLLC services only

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `legal/index.html` |
| **Line** | 52 |
| **Current text** | `Siya Healthcare, PLLC currently provides clinical telehealth services in...` |
| **Recommended correction** | Pair with admin entity sentence from canonical block. |
| **Deployment risk** | **Medium** |

### EN-010 — `llms.txt` “board-certified telehealth clinic”

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `llms.txt` |
| **Line** | 3 |
| **Current text** | `Board-certified telehealth clinic for adult ADHD...` |
| **Recommended correction** | `Primary care–led telehealth services provided by Siya Healthcare, PLLC; administrative services by Siya Health Inc.` |
| **Deployment risk** | **Medium** — “Clinic” may overstate facility-based practice |

### EN-011 — Provider schema `worksFor` → `#organization` (Siya Health)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | All `providers/*.html` JSON-LD |
| **Current text** | `"worksFor":{"@id":"https://siya.health/#organization"}` with org name Siya Health |
| **Recommended correction** | `worksFor` should reference PLLC clinical employer entity ID once defined in graph. |
| **Deployment risk** | **Medium** |

### EN-012 — `PROVIDER_LICENSE_DISCLAIMER` references PLLC (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `data/site-standards.mjs` |
| **Current text** | `Service availability is determined by Siya Healthcare, PLLC operational coverage.` |
| **Recommended correction** | None — good operational entity reference on provider surfaces. |
| **Deployment risk** | N/A |

### EN-013 — `generate-legal-pages.mjs` footer uses Inc. only

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `scripts/generate-legal-pages.mjs` |
| **Line** | 199 |
| **Current text** | `© 2026 Siya Health Inc. All rights reserved.` |
| **Recommended correction** | Add canonical entity line under copyright on legal pages. |
| **Deployment risk** | **Medium** |

---

## Entity matrix

| Surface | Admin entity (Inc.) | Clinical entity (PLLC) | Canonical block |
|---------|:-------------------:|:----------------------:|:---------------:|
| `/legal/terms-of-use` | Partial | Yes | **No** |
| `/legal/privacy-policy` | Partial | Yes | **No** |
| `/legal/notice-of-privacy-practices` | No | Yes | **No** |
| `/legal` hub | No | Yes | **No** |
| Sitewide footer | Copyright only | No | **No** |
| `entity-graph.json` | alternateName | **No node** | N/A |
| Provider pages | No | Disclaimer only | **No** |
| NPP (HIPAA) | N/A | **Yes** | **No** |
