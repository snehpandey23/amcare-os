# Final Predeploy Compliance Report

Generated: 2026-09-01T12:23:41.183Z

## Executive summary

| Question | Answer |
|----------|--------|
| **Safe to commit?** | **No** |
| **Safe to deploy?** | **Conditional NO-GO** — GHL field persistence still requires ops verification |

---

## Build & QA metrics

| Metric | Value |
|--------|------:|
| HTML pages | 223 |
| Sitemap URLs | 183 |
| Broken internal links | 0 |
| JSON-LD errors | 0 |
| Duplicate title tags | 1 |
| Duplicate H1s | 2 |



---

## Legal documents published (5)

- /legal/terms-of-use
- /legal/privacy-policy
- /legal/notice-of-privacy-practices
- /legal/controlled-substance-treatment-agreement
- /legal/cookie-policy

---

## ADHD controlled-substance links

| Check | Status |
|-------|--------|
| CS agreement page exists | **PASS** |
| Required pages with footer link | 82 / 103 |
| Missing links | 21 |

---

## Cookie policy status

| Check | Status |
|-------|--------|
| `/legal/cookie-policy` published | **PASS** |
| Footer + hub links | **PASS** (after build) |
| Non-blocking banner + localStorage | **PASS** |

---

## GHL clickwrap status

| Check | Status |
|-------|--------|
| Sitewide `ghl-legal-acceptance.js` | **PASS** |
| Terms / Privacy / NPP linked | **PASS** |
| Timestamp + source capture | **PASS** (URL params) |
| GHL contact persistence | **Ops pending** |
| CS agreement in GHL modal | **Not implemented** — site link only |

---

## Compliance regressions checked

| Check | Status |
|-------|--------|
| No false service-state expansion in CS agreement | **PASS** |
| No stimulant guarantee language | **PASS** |
| No psychiatry/telepsychiatry positioning regression | **PASS** (validators) |
| Counsel Terms/Privacy/NPP unchanged | **PASS** |

---

## Sign-off

| Role | Recommendation |
|------|----------------|
| Engineering | Fix QA failures before commit |
| Ops | Verify GHL field mapping + CS agreement checkbox on ADHD CS intake |
| Deploy authority | NO-GO until blockers resolved |

**Deploy command not run** (per sprint constraint).
