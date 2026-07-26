# Clinical Context Audit

```text
Framework: Siya Knowledge Governance Framework v1.0
Status: Locked 2026-07-26
Owner: Clinical + Editorial
Unit of governance: Reusable Content Block (data/content-blocks.mjs)
Companion: 00-CLINICAL-SAFETY-AUDIT.md, 00-EDITORIAL-GOVERNANCE-REPORT.md
```

## Purpose

A block can be medically correct (passes Clinical Safety) yet still be **in the
wrong place**. This audit asks whether a block *belongs* on the page — a
relevance and reading-experience review, not a correctness one.

## Hard questions (every block, on every page it renders)

| # | Question | Fail if |
|---|----------|---------|
| 1 | Does this **belong** on this page topic? | No |
| 2 | Would a physician **intentionally** include it here? | No |
| 3 | Is it **helpful** to this specific reader? | No |
| 4 | Does it **interrupt the flow** or distract from the page's intent? | Yes |
| 5 | Could it **confuse** someone reading about a different condition? | Yes |

Any fail → **omit**. Prefer omission over a generic paste.

## What this audit caught (why the split matters)

Both were *correct* content in the wrong context — pure Clinical Context failures:

- GLP-1 emergency node rendering on fatigue / labs pages.
- ADHD childhood-onset prep rendering on metabolic / TRT guides.

## Enforcement (automated context gate)

`scripts/validate-block-registry.mjs` fails if a block renders outside its
`allowedTopics` / `allowedPaths` declared in `data/content-blocks.mjs`. Each CTA
block's `allowedPaths` **mirrors the generator's own classifier** so the gate and
the generator can never disagree.

## Monthly context spot-check

Sample 10 pages (2 per cluster: ADHD, metabolic, men's, women's/midlife, labs):

1. Read only `<main>` end-matter (last 30%).
2. List every rendered block.
3. Mark R (relevant) / I (irrelevant) / C (confusing).
4. Any I or C → file a generator/registry ticket, never a one-off HTML edit.

## Pass criteria

- 0 blocks rendered outside declared `allowedTopics` / `allowedPaths`.
- 0 geo directories on non-geo educational pages.
- Every rendered block has an explicit gate in code.
