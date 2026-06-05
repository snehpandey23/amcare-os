# Deployment Risk Hardening Fix Report

**Sprint:** Deployment Risk Hardening Fix (post–ADHD tool hardening)  
**Date:** 2026-06-05  
**Source audits:**
- [STATE-AVAILABILITY-AUDIT.md](./STATE-AVAILABILITY-AUDIT.md)
- [ADHD-COMPLIANCE-AUDIT.md](./ADHD-COMPLIANCE-AUDIT.md)
- [ENTITY-CONSISTENCY-AUDIT.md](./ENTITY-CONSISTENCY-AUDIT.md)
- [LEGAL-CONSISTENCY-AUDIT.md](./LEGAL-CONSISTENCY-AUDIT.md)
- [DEPLOYMENT-RISK-HARDENING-REPORT.md](./DEPLOYMENT-RISK-HARDENING-REPORT.md)
- [ADHD-COPY-HARDENING-REPORT.md](./ADHD-COPY-HARDENING-REPORT.md)
- [ADHD-TOOL-POSITIONING-AUDIT.md](./ADHD-TOOL-POSITIONING-AUDIT.md)

**Validation run:** `npm run build` **PASS** · `validate-legal-links.mjs` **PASS** · `validate-deployment-hardening.mjs` **PASS**

---

## Executive summary

All **engineering-addressable Tier 1 blockers** from the source audits are resolved. Counsel body text was not rewritten—only approved **October 31, 2025** date substitution and template-level entity injection.

| Question | Answer |
|----------|--------|
| **Safe to commit?** | **Yes** |
| **Safe to deploy?** | **Conditional NO-GO** — controlled-substance policy unpublished; GHL clickwrap not in repo |

---

## Tier 1 findings — fixed

### 1. Legal effective date (LG-001–004)

| Surface | Before | After | Status |
|---------|--------|-------|--------|
| `data/legal-documents.mjs` | `2026-06-02` | `2025-10-31` | **Fixed** |
| `legal-document-versions/*.md` | June 2, 2026 | October 31, 2025 | **Fixed** |
| `/legal/terms-of-use` | June 2, 2026 | October 31, 2025 | **Fixed** |
| `/legal/privacy-policy` | June 2, 2026 | October 31, 2025 | **Fixed** |
| `/legal/notice-of-privacy-practices` | June 2, 2026 | October 31, 2025 | **Fixed** |
| `/legal` hub table | June 2, 2026 | October 31, 2025 | **Fixed** |
| `scripts/import-counsel-legal-docx.mjs` | June 2, 2026 | October 31, 2025 | **Fixed** |

### 2. Canonical entity block (EN-001 / LG-007)

Added verbatim to legal hub + all three published legal pages (template aside, outside counsel body):

> Siya Health Inc. provides administrative and non-clinical support services. Medical services are provided by Siya Healthcare, PLLC through licensed clinicians.

| Surface | Status |
|---------|--------|
| `/legal` hub “Entity structure” | **Fixed** |
| `/legal/terms-of-use` aside | **Fixed** |
| `/legal/privacy-policy` aside | **Fixed** |
| `/legal/notice-of-privacy-practices` aside | **Fixed** |
| `validate-legal-links.mjs` gate | **Added** |

### 3. Derek Timbs / Ohio service leakage (SA-001–005)

| Surface | Before | After | Status |
|---------|--------|-------|--------|
| `data/providers-additional.mjs` prose | Texas and Ohio service | Texas Siya service only | **Fixed** |
| `providers/derek-timbs.html` meta/OG | Texas and Ohio | Texas only | **Fixed** |
| `providers/index.html` teaser | Texas and Ohio adults | Texas adults only | **Fixed** |
| JSON-LD `areaServed` | Texas + Ohio | Texas only (`providerServiceStates`) | **Fixed** |
| `llms.txt` Derek line | TX, OH | TX only | **Fixed** |
| `llms-full.txt` summary | Texas and Ohio | Texas only | **Fixed** |
| `provider-index.json` | — | `serviceStates: ["Texas"]` | **Fixed** |
| `data/entity-graph.json` | — | `serviceStates: ["Texas"]` | **Fixed** |
| Ohio license-only chip + disclaimer | — | Retained | **Compliant** |

### 4. Psychiatry / telepsychiatry remnants (AD-001–004)

| Pattern | Status |
|---------|--------|
| `Psychiatry / ADHD` in `llms.txt` | **Removed** → ADHD evaluation (PA) |
| `Psychiatric depth` on `about.html` | **Removed** → structured evaluation depth |
| `ADHD telepsychiatry` in CA blogs | **Removed** → telehealth ADHD |
| `thoughtful telepsychiatry` | **Removed** → primary care–led telehealth ADHD |
| Educational “psychiatric history/comorbidity” | **Retained** (clinical context) |

### 5. Formal diagnosis / stimulant caveats (AD-009–010 + ADHD tool sprint)

| Surface | Status |
|---------|--------|
| `adhd-care.html` FAQ + steps | **Hardened** (prior sprint) |
| 10 shadow geo/funnel pages Step 3 | **Stimulant non-guarantee** |
| Shadow pages Step 1 | **“Screening is not diagnosis”** |
| Shadow pages Step 2 | **Tools support evaluation; do not alone diagnose** |
| `adhd-evaluation-cost.html` intro + list | **Patched** this sprint |
| `adhd-screening.html` ASRS disclaimers | **Already compliant** |

---

## Tier 1 — NOT fixed (explicitly out of scope)

| ID | Risk | Reason |
|----|------|--------|
| AD-011 | No controlled-substance policy | Counsel text not published; constraint: do not invent |
| AD-012 | GHL Terms/NPP clickwrap | External widget; not in repo |
| LG-012 | Cookie policy + GTM | Cookie policy not published per constraint |

---

## Files changed (this sprint + prior hardening)

### Legal & entity
- `data/legal-documents.mjs`, `data/site-standards.mjs`
- `legal-document-versions/terms-of-use.md`, `privacy-policy.md`, `notice-of-privacy-practices.md`
- `scripts/generate-legal-pages.mjs`, `import-counsel-legal-docx.mjs`
- `scripts/validate-legal-links.mjs`
- `legal/index.html`, `legal/*/index.html` (generated)

### State availability
- `data/providers-additional.mjs`, `data/providers.mjs` (`providerServiceStates`)
- `scripts/generate-provider-pages.mjs`
- `providers/derek-timbs.html`, `providers/index.html` (generated)
- `data/entity-graph.json`, `provider-index.json`, `llms.txt`, `llms-full.txt` (generated)

### ADHD positioning
- `scripts/generate_seo_shadow_pages.py` (funnel caveats)
- `scripts/apply-adhd-positioning-hardening.mjs`
- `adhd-care.html`, `about.html`, geo/funnel HTML (generated)
- `data/answer-seeds.mjs`, California blog sources

### Validation
- `scripts/validate-deployment-hardening.mjs` (**new**)
- `package.json` (wired into build)

---

## Build & QA metrics (2026-06-05 validation run)

| Metric | Value |
|--------|------:|
| `npm run build` | **PASS** |
| `validate-legal-links.mjs` | **PASS** |
| `validate-deployment-hardening.mjs` | **PASS** |
| Sitemap URLs | **161** |
| HTML pages | **163** |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| Duplicate title tags | **0** |
| Duplicate H1s | **0** |
| Legal effective date correct | **3 / 3** |
| Canonical entity block on legal pages | **4 / 4** |
| Derek Ohio in `areaServed` | **0** |
| Psychiatry/telepsychiatry self-positioning (key surfaces) | **0** |

---

## Validator coverage

**`validate-legal-links.mjs`**
- Effective date October 31, 2025 on each published legal page
- Canonical entity statement on hub + each published legal page
- NPP ≠ Privacy URL separation
- Legacy `/terms`, `/privacy-policy` href prohibition
- Footer legal link completeness

**`validate-deployment-hardening.mjs`**
- Registry `effectiveDate === 2025-10-31`
- Source markdown free of June 2, 2026
- Derek: no service-implying Ohio prose; no Ohio in JSON-LD `areaServed`
- Hub teaser free of “Texas and Ohio”
- `entity-graph.json` Derek `serviceStates` excludes Ohio
- No psychiatry/telepsychiatry self-positioning on `llms.txt`, `about.html`, ADHD blogs
- `llms.txt` Derek line must not show `(TX, OH)` service framing

---

## Remaining risks (ranked)

| Rank | Risk | Severity | Owner |
|------|------|----------|-------|
| 1 | Controlled-substance policy unpublished | Critical | Counsel |
| 2 | GHL intake without Terms/NPP clickwrap | Critical | Ops / GHL |
| 3 | GTM/GA/Ads without cookie policy | High | Counsel + engineering |
| 4 | Wendy NY licenses — display gap if expanded | Medium | Provider data |
| 5 | Blog URL slugs using “adhd-testing” | Low | SEO optional |

---

## Verification commands

```bash
cd apps/siya-health
npm run build
node scripts/validate-legal-links.mjs
node scripts/validate-deployment-hardening.mjs
grep -r "June 2, 2026" legal/ legal-document-versions/   # expect no matches
grep "October 31, 2025" legal/index.html
grep "areaServed" providers/derek-timbs.html              # expect Texas only
grep -r "Texas and Ohio" providers/ llms.txt              # expect no service matches
```

---

## Sign-off

| Role | Recommendation |
|------|----------------|
| **Engineering** | Tier 1 code fixes complete — **safe to commit** |
| **Counsel** | Confirm Oct 31, 2025 + entity block; publish CS policy when approved |
| **Ops** | Implement GHL Terms/NPP clickwrap before production |
| **Deploy authority** | **Conditional NO-GO** until AD-011 + AD-012 resolved or risk-accepted |
