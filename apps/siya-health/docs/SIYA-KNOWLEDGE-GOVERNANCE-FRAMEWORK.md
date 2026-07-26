# Siya Knowledge Governance Framework

```text
Version: 1.0  (FROZEN)
Frozen:  2026-07-26
Owners:  Clinical (Pandey/Desai) · Editorial (Content OS) · Engineering (Generators)
Scope:   Website · Health Guides · Labs · FAQs · Siya Guide (AI) · Internal linking ·
         Structured data · Future patient education · Future voice · Future APIs
```

> We are no longer governing blog posts. We are governing a single body of
> knowledge that many surfaces consume. This document is the constitution of
> that knowledge. **It is frozen at v1.0.** From here, improvement comes from
> refining the knowledge graph and the generators — not from adding new layers
> of governance.

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

## 6. Run it

```bash
npm run governance          # full gate: assembly + blocks + doc hygiene
npm run assembly:check      # content assembly apply + validate
node scripts/validate-block-registry.mjs
node scripts/validate-doc-hygiene.mjs
```
