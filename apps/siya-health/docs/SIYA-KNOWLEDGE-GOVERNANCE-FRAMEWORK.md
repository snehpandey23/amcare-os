# Siya Knowledge Governance Framework

```text
Version:           1.0
Status:            Production (FROZEN)
Date:              2026-07-26
Git tag:           governance-v1.0
Breaking changes:  Architecture Review required
Minor changes:     Version bump (v1.1+)
Generator changes: Must pass `npm run governance`
Owners:            Clinical (Pandey/Desai) · Editorial (Content OS) · Engineering (Generators)
Scope:             Website · Health Guides · Labs · FAQs · Siya Guide · Provider tools ·
                   Staff assistants · Mobile · Email · Care pathways · Future APIs
```

> We are no longer governing blog posts. We are governing a single body of
> knowledge that many surfaces consume. This document is the constitution of
> that knowledge. **It is frozen at v1.0.** The framework must become boring —
> innovation happens in content and product, not in governance rules every week.
>
> **One knowledge graph. Many products.** Never let each surface invent its own copy.

**Platform layers** (Presentation → Public Knowledge API → Entity Registry → Content
Assembly → Knowledge Graph → Content Blocks), consumption contract, and the
engineering principle *fix generators before fixing pages* live in
[`SIYA-KNOWLEDGE-PLATFORM.md`](./SIYA-KNOWLEDGE-PLATFORM.md). Governance freezes
quality rules; the platform doc freezes how products plug in.

---

## 1. The unit of governance is the BLOCK, not the page

We audit **reusable content blocks**, not pages. The question is
"which blocks are unsafe or out of place?" — not "which pages contain unsafe
things?" That scales; page-by-page auditing does not.

Every content-bearing block is registered in **`data/content-blocks.mjs`** with:

```
Owner        → { clinical, editorial, engineering }
Allowed      → allowedTopics / allowedPaths  (Clinical Context gate)
Entity       → canonical knowledge-graph entity it belongs to
Version      → vX.Y + approved date
Clinical     → approved | pending | n/a
Status       → production | deprecated | chrome
Pages affect → usage count (from validator; the versioning anchor)
```

Example:

```
GLP-1 Emergency Advice
  Clinical:    Dr. Swati       Editorial: Metabolic Cluster    Engineering: Generator
  Version:     v2.0 (approved Jul 2026)     Pages affected: N
  Allowed:     weight-loss only             Status: production
```

Enforced by **`scripts/validate-block-registry.mjs`** — unregistered markers,
deprecated blocks still rendering, and blocks rendered outside their allowed
context all fail CI.

---

## 2. The architecture (frozen layer order)

```
        ┌─────────────────────┐
        │   KNOWLEDGE GRAPH    │  entities + relationships (source of truth)
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │  CONTENT ASSEMBLY    │  render the graph, not templates
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │     VALIDATION       │  block registry + assembly caps + fingerprint
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │       AUDIT          │  safety · context · editorial · AI · a11y
        └─────────────────────┘
```

**The generator never invents relationships.** Relationships
(`Fatigue → Primary Care → Labs → Iron / Thyroid / Sleep → Brain Fog`) come from
the graph (`data/entity-graph.json` + `docs/SIYA-ENTITY-REGISTRY.md`). Pages
become *"render the graph"* instead of *"render templates."*

---

## 3. The eight components (v1.0 — stable infrastructure)

| # | Component | Artifact | Enforced by |
|---|-----------|----------|-------------|
| 1 | **Knowledge Graph** | `data/entity-graph.json`, `docs/SIYA-ENTITY-REGISTRY.md` | entity ownership; block→entity mapping |
| 2 | **Content Assembly System** | `scripts/content-assembly.mjs`, `docs/CONTENT-ASSEMBLY-SYSTEM.md` | `enforce-assembly-caps.mjs`, `validate-content-assembly.mjs` |
| 3 | **Clinical Safety Audit** | `audit/00-CLINICAL-SAFETY-AUDIT.md` | named clinician approval per block |
| 4 | **Clinical Context Audit** | `audit/00-CLINICAL-CONTEXT-AUDIT.md` | `validate-block-registry.mjs` (allowed-context gate) |
| 5 | **Editorial Governance Audit** | `audit/00-EDITORIAL-GOVERNANCE-REPORT.md` + `00-EDITORIAL-FINGERPRINT.md` | `editorialFingerprintDimensions()` |
| 6 | **AI Readiness Audit** | `audit/00-AI-READINESS-AUDIT.md` | canonical-entity check |
| 7 | **Accessibility Audit** | `audit/03-design-consistency.md` (a11y section) | manual + a11y checks |
| 8 | **Monthly Scorecard** | `audit/editorial-governance-scorecard.csv`, `docs/MONTHLY-SEO-KNOWLEDGE-AUDIT-TEMPLATE.md` | monthly run |

Report hygiene (no duplicate headings/sections/appendices) is enforced by
**`scripts/validate-doc-hygiene.mjs`** — a governance report must be as clean as
the site it evaluates.

---

## 4. Ownership & versioning (why this matters in 6 months)

Every shared block carries three owners and a version. When a block changes:

1. Bump `version` + `approved` in `data/content-blocks.mjs`.
2. Re-run `validate-block-registry.mjs` → records `pagesAffected`.
3. If `kind: clinical`, a named clinician re-approves (`clinicalReview`).

Without this, nobody knows who is allowed to change a block, or how many pages a
change touches.

---

## 5. What "frozen" means

- **Do not invent new audit types.** The eight components above are complete.
- Improvements come from **the graph and the generators**, not new governance layers.
- Adding a governance layer requires an explicit version bump (v1.1, v2.0) and a
  written reason — otherwise the governance system itself accumulates the
  bureaucratic complexity it exists to prevent.
- **Resist over-governance.** Another validator / score / checklist is justified only
  by a real production incident. If authors spend more time satisfying governance
  than helping readers, the framework has become the product.

## 6. Production KPI — Knowledge Integrity Score

Leadership gets **one number**, not a stack of audit reports. Weights sum to 100:

| Metric | Weight | Source |
|--------|------:|--------|
| Governance pass (`npm run governance`) | 20 | assembly + blocks + doc hygiene |
| Clinical safety | 20 | Clinical Safety Audit |
| Clinical context | 15 | Clinical Context Audit / block registry |
| Editorial fingerprint | 15 | `editorialFingerprintDimensions().overall` |
| AI readiness | 10 | AI Readiness Audit |
| Accessibility | 10 | Accessibility Audit |
| Technical SEO | 10 | SEO checks / Search Console |

**Thresholds**

| Score | Action |
|------:|--------|
| ≥95 | Healthy — publish freely |
| 90–94 | Monitor — fix before next cluster ship |
| &lt;90 | **Freeze publishing** until recovery |

This is a **dashboard aggregation of existing components**, not a ninth audit type.

## 7. Deferred to v1.1 — Knowledge Lifecycle

Not in v1.0. Do not implement until a real staleness incident or Q4 planning.

```
Draft → Clinical Review → Editorial Review → Published
  → Monitored → Needs Review → Archived → Redirected
```

v1.0 governs *quality*. Lifecycle will govern *time* (medical info ages; services change).

## 8. Run it

```bash
npm run governance          # full gate: assembly + blocks + doc hygiene
npm run assembly:check      # content assembly apply + validate
node scripts/validate-block-registry.mjs
node scripts/validate-doc-hygiene.mjs
```
