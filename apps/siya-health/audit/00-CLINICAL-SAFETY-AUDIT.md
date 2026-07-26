# Clinical Safety Audit

```text
Framework: Siya Knowledge Governance Framework v1.0
Status: Locked 2026-07-26
Owner: Clinical (Dr. Swati Pandey / Dr. Sneh Pandey / Dr. Natasha Desai)
Unit of governance: Reusable Content Block (data/content-blocks.mjs)
Companion: 00-CLINICAL-CONTEXT-AUDIT.md, 00-EDITORIAL-GOVERNANCE-REPORT.md
```

## Purpose

Catch **medically wrong or dangerous** output before it renders. This is a
clinician review, not an editorial one. A block can be perfectly on-topic and
still fail here.

## Hard questions (every clinical block)

| # | Question | Fail if |
|---|----------|---------|
| 1 | Is the **emergency advice** correct and complete? | Wrong / missing red-flag guidance |
| 2 | Is the **medication** information correct (dose, class, interactions)? | Any error |
| 3 | Could this contribute to a **wrong diagnosis** or false reassurance? | Yes |
| 4 | Is the **hormone / controlled-substance** guidance safe and compliant? | No |
| 5 | Are contraindications and monitoring requirements stated where needed? | Missing |

Any fail → **block from production** until a named clinician re-approves.

## Governed blocks (from registry)

| Block id | Clinical owner | Safety concern |
|----------|----------------|----------------|
| `glp1-emergency-node` | Dr. Swati Pandey | Emergency abdominal-pain guidance must be accurate + only on GLP-1 pages |
| `adhd-visit-prep` | Dr. Natasha Desai | Controlled-substance / diagnostic framing |
| `trt-monitoring-disclaimer` | Dr. Sneh Pandey | Fertility + monitoring warnings |
| `coordination-of-care` | Dr. Swati Pandey | No cross-condition medical instruction |
| `SIYA:PRIMARY-CARE-FAQ` | Dr. Swati Pandey | Scope-of-care + urgent vs emergency triage |

## Enforcement

- `scripts/validate-block-registry.mjs` — a deprecated or mis-gated clinical block fails CI.
- `scripts/answer-engagement-system.mjs` — `isGlp1Page()` gate on emergency node.
- `scripts/content-assembly.mjs` — `visitPrepParagraph` topic gate.

## Pass criteria

- 0 cross-topic emergency instructions rendered.
- Every clinical block carries `clinicalReview: approved` + a named clinical owner + a version.
- No clinical block with `clinicalReview: pending` is in production.
