# Deployment Risk Hardening Report

**Sprint:** Deployment Risk Hardening — State, ADHD, Entity, Legal  
**Audit date:** 2026-06-05  
**Scope:** `apps/siya-health` (audit only — **no production code modified**)  
**Build snapshot:** `npm run build` **PASS**; `validate-legal-links.mjs` **PASS**; sitemap **161** URLs; duplicate titles **0**; broken links **0**; JSON-LD parse errors **0**

## Child audits

| Document | Verdict |
|----------|---------|
| [STATE-AVAILABILITY-AUDIT.md](./STATE-AVAILABILITY-AUDIT.md) | **FAIL** |
| [ADHD-COMPLIANCE-AUDIT.md](./ADHD-COMPLIANCE-AUDIT.md) | **FAIL** |
| [ENTITY-CONSISTENCY-AUDIT.md](./ENTITY-CONSISTENCY-AUDIT.md) | **FAIL** |
| [LEGAL-CONSISTENCY-AUDIT.md](./LEGAL-CONSISTENCY-AUDIT.md) | **FAIL** |

---

## Executive recommendation

# NO-GO for production deployment

Engineering build gates pass, but **compliance and counsel-alignment blockers remain** that create regulatory, HIPAA, and false-availability exposure if deployed as-is.

**Safe to commit audit docs:** Yes (documentation only).  
**Safe to deploy:** **No** — resolve ranked risks below first.

---

## Finding totals

| Domain | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| State availability | 6 | 4 | 5 | 3 |
| ADHD / controlled substance | 4 | 8 | 7 | 4 |
| Entity consistency | 3 | 6 | 5 | 2 |
| Legal consistency | 4 | 5 | 4 | 3 |
| **Unique prioritized risks** | **~17** | — | — | — |

---

## Ranked remaining risks (deployment order)

### Tier 1 — Block deploy (Critical)

| Rank | ID | Risk | Primary files | Why it blocks |
|------|-----|------|---------------|---------------|
| 1 | LG-001–004 | **Legal effective date is June 2, 2026, not October 31, 2025** | `legal-document-versions/*.md`, `legal/*/index.html`, `data/legal-documents.mjs` | Counsel-approved date mismatch on all three binding documents |
| 2 | EN-001 / LG-007 | **Canonical entity block missing** | All `/legal/*`, sitewide footers | Required Inc./PLLC administrative vs clinical split not published |
| 3 | SA-001–005 | **Derek Timbs Ohio service implication** | `data/providers-additional.mjs`, `providers/derek-timbs.html`, JSON-LD | False state availability despite OH license-only chip |
| 4 | AD-011 | **No controlled-substance policy** | `data/legal-documents.mjs` (planned only) | Stimulant telehealth marketing without published CS policy |
| 5 | AD-012 | **GHL intake without Terms/NPP clickwrap** | Sitewide booking widgets | No documented assent despite `requiresAcceptance: true` on Terms + NPP |

### Tier 2 — Fix before paid acquisition (High)

| Rank | ID | Risk | Primary files |
|------|-----|------|---------------|
| 6 | AD-001 | **Psychiatry positioning in `llms.txt`** | `llms.txt` line 30 |
| 7 | AD-002–004 | **Telepsychiatry / psychiatric depth copy** | `about.html`, CA ADHD blogs |
| 8 | SA-006–009 | **Ohio in AI indexes & entity graph** | `llms-full.txt`, `entity-graph.json`, hub teaser |
| 9 | EN-002–005 | **Entity graph / Terms wording drift** | `entity-graph.json`, Terms body |
| 10 | LG-012 / AD-013 | **GTM/GA/Ads without cookie policy** | Sitewide heads |

### Tier 3 — Harden before scale (Medium)

| Rank | ID | Risk | Primary files |
|------|-----|------|---------------|
| 11 | AD-009–010 | **“Formal diagnosis” funnel copy without stimulant non-guarantee** | Geo ADHD pages, `adhd-care.html` FAQ |
| 12 | SA-011 | **Wendy NY licenses — data vs display gap** | `internal-provider-records.mjs` (CA only today) |
| 13 | SA-012 | **Schema omits California on some ADHD pages** | `online-adhd-test.html`, geo schemas |
| 14 | EN-004–006 | **Footer / schema org naming** | Footers, `index.html` schema |

---

## What passes today

| Control | Status |
|---------|--------|
| Organizational 4-state footprint in footers & `index.html` org schema | **PASS** |
| `/legal/*` three-document stack published & cross-linked | **PASS** |
| NPP ≠ Privacy URL separation | **PASS** |
| Legacy `/terms`, `/privacy-policy` redirects + noindex stubs | **PASS** |
| ASRS screening “not a diagnosis” disclaimers | **PASS** |
| `adhd-care.html` primary care–led positioning | **PASS** |
| Provider license disclaimer under state chips | **PASS** (undermined by Derek prose) |
| Hub state filters (CA/TX/PA/FL only) | **PASS** |
| Legal pages free of marketing CTAs/trust bars | **PASS** |
| Build + legal link validator CI | **PASS** |

---

## Build & QA metrics (2026-06-05)

| Metric | Value |
|--------|------:|
| `npm run build` | PASS |
| `validate-legal-links.mjs` | PASS |
| Sitemap URLs | 161 |
| HTML pages | 163 |
| Duplicate title groups | 0 |
| Broken internal links | 0 |
| JSON-LD parse errors | 0 |
| Published legal documents | 3 |
| Legal effective date correct (Oct 31, 2025) | **0 / 3** |
| Canonical entity block on legal pages | **0 / 4** |

---

## Minimum viable deploy checklist

Counsel + engineering should complete **all Tier 1** items before production:

- [ ] Set effective date to **October 31, 2025** in source markdown, registry, and regenerated `/legal/*` pages
- [ ] Add canonical entity block to legal template and legal hub
- [ ] Remove Ohio **service** language from Derek Timbs (source data, HTML, schema, llms indexes)
- [ ] Publish controlled-substance policy (counsel) OR remove/limit stimulant-forward funnels until published
- [ ] Implement GHL clickwrap to Terms + NPP
- [ ] Remove “Psychiatry / telepsychiatry” self-positioning from `llms.txt`, about, and key ADHD blogs

---

## Post-fix verification commands

```bash
cd apps/siya-health
npm run build
node scripts/validate-legal-links.mjs
# Manual: grep -r "June 2, 2026" legal/
# Manual: grep -r "Texas and Ohio" providers/ data/ llms*.txt
# Manual: grep -r "Psychiatry / ADHD" llms.txt about.html blog/
```

---

## Audit methodology

- Full-repo grep for state names, psychiatry/psychology, guarantee/stimulant language, entity strings, effective dates
- Manual review of provider profiles, hub, `adhd-screening.html`, `adhd-care.html`, `online-adhd-test.html`, legal pages, `llms.txt`, `entity-graph.json`, `data/site-standards.mjs`, `data/legal-documents.mjs`
- Cross-reference with Phase 1/2 legal hardening reports and counsel business rules supplied in sprint brief
- **No files modified** during this sprint

---

## Sign-off guidance

| Role | Recommendation |
|------|----------------|
| **Engineering** | Fix Derek regeneration pipeline; add validator rules for effective date + entity block + OH service prose |
| **Counsel** | Confirm Oct 31, 2025 effective date; approve canonical entity injection; publish CS + cookie policies |
| **Ops/Marketing** | Hold paid ADHD campaigns until Tier 1–2 cleared |
| **Deploy authority** | **NO-GO** until Tier 1 complete and re-audit PASS |
