# Editorial Fingerprint

```text
Framework: Siya Knowledge Governance Framework v1.0
Status: Locked 2026-07-26
Owner: Editorial
Scorer: scripts/content-assembly.mjs → editorialFingerprintDimensions()
```

## Purpose

Generators slowly drift. The Editorial Fingerprint is a fixed, scored signature
that detects drift before it spreads across dozens of pages.

## The six dimensions (each scored 0–10)

| Dimension | What it measures | Drift signal |
|-----------|------------------|--------------|
| **Voice** | Second-person, warm-clinical, low hype | Impersonal or marketing hype creeps in |
| **Transitions** | Connective tissue between ideas | Choppy, list-like, no reasoning |
| **Sentence rhythm** | Varied sentence length | Monotone / robotic cadence |
| **Paragraph cadence** | Varied, scannable paragraphs | Wall-of-text or identical blocks |
| **Heading style** | Sentence case, no shouting | Title Case or ALL CAPS drift |
| **CTA tone** | Exactly one primary, action-led | Competing or shouty CTAs |

## Scoring rule

`overall = min(all six dimensions)` — a single weak dimension can't be masked by
strong ones. Core content target: **overall ≥ 9/10**.

The legacy `bleed` score (cross-topic clinical/geo penalties) is reported
alongside and is governed by the Clinical Context Audit + Content Assembly gate.

## Where it runs

- `scripts/content-assembly.mjs` — `editorialFingerprintDimensions()` (per-dimension)
  and `editorialFingerprint()` (legacy bleed score).
- `scripts/validate-content-assembly.mjs` — success-metric gate.
- Monthly Scorecard — records overall + weakest dimension per cluster.

## Pass criteria

- Core educational pages: `overall ≥ 9`.
- No single dimension < 8 on a core page without an editorial ticket.
- Trend tracked monthly; a falling dimension = a generator fix, not a page edit.
