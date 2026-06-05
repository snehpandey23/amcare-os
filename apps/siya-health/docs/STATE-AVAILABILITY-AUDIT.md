# State Availability Compliance Audit

**Scope:** `apps/siya-health` production HTML, data, schema, llms indexes, provider surfaces  
**Audit date:** 2026-06-05  
**Authoritative footprint:** California, Texas, Pennsylvania, Florida (`data/site-standards.mjs` → `AVAILABLE_SERVICE_STATES`)  
**Rule:** Provider license states ≠ Siya Healthcare, PLLC service availability.

## Summary

| Severity | Count |
|----------|------:|
| Critical | 6 |
| High | 4 |
| Medium | 5 |
| Low | 3 |

**Verdict:** **FAIL** — Derek Timbs content and structured data imply Ohio patient treatment availability through Siya despite OH ∉ organizational footprint. License-only chip styling exists but is overridden by prose, metadata, and `areaServed`.

---

## Findings

### SA-001 — Ohio implied as Siya service state (hero deck)

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `providers/derek-timbs.html` |
| **Line** | 70 |
| **Current text** | `Texas and Ohio adults pursuing clinician-led weight loss or men's metabolic telehealth` |
| **Recommended correction** | `Texas adults pursuing clinician-led weight loss or men's metabolic telehealth` + separate license-only note: `Ohio license displayed for transparency; Siya Healthcare, PLLC services are offered in CA, TX, PA, FL.` |
| **Deployment risk** | **Critical** — False geographic availability / FTC-style misrepresentation |

### SA-002 — Ohio implied in provider body copy

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `providers/derek-timbs.html` |
| **Line** | 113 |
| **Current text** | `At Siya, I see adults in **Texas and Ohio** who want clinician-led GLP-1...` |
| **Recommended correction** | Remove Ohio from “I see adults in” phrasing; limit to Texas for Siya service; reference Ohio only as professional license if needed. |
| **Deployment risk** | **Critical** |

### SA-003 — Ohio in meta description / OG / Twitter

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `providers/derek-timbs.html` |
| **Lines** | 8, 12, 15 |
| **Current text** | `...telehealth in Texas and Ohio.` |
| **Recommended correction** | `...telehealth in Texas.` (service state only) |
| **Deployment risk** | **High** — Indexed snippets propagate false availability |

### SA-004 — JSON-LD `areaServed` includes Ohio

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `providers/derek-timbs.html` |
| **Line** | 26 (`application/ld+json`) |
| **Current text** | `"areaServed":[{"@type":"State","name":"Texas"},{"@type":"State","name":"Ohio"}]` |
| **Recommended correction** | `areaServed` for Siya service pages should list **Texas only** (or org footprint intersection). Ohio should not appear in `areaServed`; use separate `hasCredential` / license metadata if modeled. |
| **Deployment risk** | **Critical** — Search/AI systems ingest schema as service geography |

### SA-005 — Source-of-truth provider data repeats Ohio service implication

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `data/providers-additional.mjs` |
| **Lines** | 241–261, 290 |
| **Current text** | Multiple strings: `Texas and Ohio`, `Texas vs Ohio law`, SEO description with Ohio |
| **Recommended correction** | Regenerate provider copy: Texas = service; Ohio = license-only in chips/disclaimer only. |
| **Deployment risk** | **Critical** — Regenerates bad HTML on every build |

### SA-006 — Provider hub card teaser implies Ohio services

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `providers/index.html` |
| **Line** | 180 |
| **Current text** | `Texas and Ohio adults pursuing clinician-led weight loss...` |
| **Recommended correction** | Texas-only teaser; OH visible only in dashed license chip with disclaimer. |
| **Deployment risk** | **High** |

### SA-007 — `llms.txt` lists Derek as `(TX, OH)` service states

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `llms.txt` |
| **Line** | 32 |
| **Current text** | `Derek Timbs, FNP-BC — Weight loss & men's health (TX, OH)` |
| **Recommended correction** | `(... TX service; OH license only)` or `(TX)` only |
| **Deployment risk** | **High** — AI citation layer misstates footprint |

### SA-008 — `llms-full.txt` summary includes Ohio

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `llms-full.txt` |
| **Lines** | ~839, ~917 |
| **Current text** | `...in Texas and Ohio.` / `Licensed: Texas, Ohio` |
| **Recommended correction** | Distinguish license vs service in AI index generator (`scripts/generate-ai-indexes.mjs`). |
| **Deployment risk** | **High** |

### SA-009 — `entity-graph.json` lists Ohio for Derek

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `data/entity-graph.json` |
| **Section** | `providers[]` → `derek-timbs` → `statesLicensed` |
| **Current text** | `"Ohio"` in licensed states array without service-footprint flag |
| **Recommended correction** | Add `licenseOnlyStates: ["Ohio"]` or split `serviceStates` vs `licenseStates` in graph schema. |
| **Deployment risk** | **High** |

### SA-010 — `provider-index.json` includes Ohio

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `provider-index.json` |
| **Section** | Derek Timbs entry |
| **Current text** | `"Ohio"` in states list |
| **Recommended correction** | Machine-readable distinction: `serviceStates` vs `licenseStates`. |
| **Deployment risk** | **Medium** |

### SA-011 — Wendy Delgado: NY/other licenses not displayed (data gap)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `data/internal-provider-records.mjs` |
| **Lines** | 221–229 |
| **Current text** | Wendy `licenses` array contains **California only** |
| **Recommended correction** | Ops: verify counsel/HR license inventory. If NY/other states are confirmed, add as **license-only** chips (never service states). If not confirmed, document exclusion. |
| **Deployment risk** | **Medium** — Under-disclosure today; **Critical** if NY added without `--license-only` styling |

### SA-012 — Geo ADHD pages schema omits California

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `online-adhd-test.html`, `adhd-diagnosis-florida.html`, `adhd-evaluation-cost.html`, `adhd-diagnosis-pennsylvania.html` |
| **Line** | 49 (schema `description`) |
| **Current text** | `"Telehealth ADHD evaluation and treatment in TX, PA, and FL."` |
| **Recommended correction** | Include California in org service description: `CA, TX, PA, and FL`. |
| **Deployment risk** | **Medium** — Understates CA availability (not overstatement) |

### SA-013 — `adhd-screening.html` meta limits to “Texas-area care”

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `adhd-screening.html` |
| **Lines** | 24, 34, 38, 45 |
| **Current text** | `Guided next steps for Texas-area care.` |
| **Recommended correction** | `Guided next steps for care in California, Texas, Pennsylvania, and Florida.` |
| **Deployment risk** | **Low** |

### SA-014 — Ohio chip styling present (partial mitigation)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive control) |
| **File** | `providers/derek-timbs.html` |
| **Line** | 76 |
| **Current text** | `provider-state-chip--license-only` on Ohio chip + `PROVIDER_LICENSE_DISCLAIMER` |
| **Recommended correction** | Keep chip styling; **remove conflicting prose/meta/schema** (SA-001–006). |
| **Deployment risk** | N/A — mitigating control undermined by other copy |

### SA-015 — Hub state filters limited to CA/TX/PA/FL (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive control) |
| **File** | `providers/index.html` |
| **Lines** | 87–91 |
| **Current text** | Filter chips: CA, TX, PA, FL only (no OH) |
| **Recommended correction** | None — correct. |
| **Deployment risk** | N/A |

### SA-016 — Sitewide footer states line (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive control) |
| **File** | `data/site-standards.mjs` → injected footers |
| **Current text** | `California, Texas, Pennsylvania, and Florida` |
| **Recommended correction** | None — aligns with `AVAILABLE_SERVICE_STATES`. |
| **Deployment risk** | N/A |

### SA-017 — `index.html` MedicalOrganization `areaServed` (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive control) |
| **File** | `index.html` |
| **Line** | 49 |
| **Current text** | `"areaServed":["California","Texas","Pennsylvania","Florida"]` |
| **Recommended correction** | None for org-level schema. Ensure **provider-level** schema matches (SA-004). |
| **Deployment risk** | N/A |

---

## Surfaces verified

| Surface | Status |
|---------|--------|
| Provider profiles | **FAIL** (Derek) |
| Provider hub | **FAIL** (Derek teaser) |
| Booking funnels (GHL) | Not state-specific — OK |
| ADHD geo landing pages | **PARTIAL** (CA omitted in some schema) |
| Pricing pages | OK (no extra states) |
| FAQ / answers | OK (no OH service claims found) |
| Schema (`areaServed`) | **FAIL** (Derek) |
| Entity graph | **FAIL** (Derek OH) |
| llms files | **FAIL** (Derek OH) |
| Legal pages | OK (4-state aside) |
| Footers / nav | OK (4-state line) |

---

## Required pre-deploy actions (state)

1. Fix Derek Timbs copy at source (`data/providers-additional.mjs`) and regenerate.
2. Restrict `areaServed` in provider schema to organizational footprint.
3. Update AI indexes (`llms.txt`, `llms-full.txt`, `provider-index.json`, `entity-graph.json`).
4. If Wendy NY licenses are confirmed, add as license-only chips only.
