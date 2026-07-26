# Content Assembly System

```text
Status: Locked 2026-07-26 (v2 — generator-enforced)
Scope: Every page on siya.health (guides, blogs, services, hubs)
Owner: Content OS / Editorial
```

## Hard rule

> **Every page earns every section.**
> Nothing is appended because "all pages have it."

Before any block renders, it must answer **yes** to:

> Would a human editor choose to include this block, on this page, for this reader?

If no — the block is **not rendered**.

## Success metrics (must pass before new content waves)

| Metric | Target |
|--------|--------|
| Duplicate paragraph groups (excl. intentional boilerplate) | **&lt; 5** |
| Irrelevant geography on educational pages | **0** |
| Contextual links in any single section | **≤ 8** |
| Primary CTAs per page | **1** |
| Educational pages with unique context-aware closing | **100%** |
| Editorial fingerprint on core content | **≥ 9/10** |

Validate: `node scripts/validate-content-assembly.mjs`

## Implementation modules

| Module | Role |
|--------|------|
| `scripts/content-assembly.mjs` | Gating helpers, unique closings, fingerprint scorer |
| `data/answer-seeds.mjs` → `phase5CoordinationSection` | Topic + slug unique prep (no ADHD onset on metabolic pages) |
| `scripts/answer-engagement-system.mjs` → `defaultDecisionNodes` | GLP-1 emergency branch only on GLP-1 pages |
| `data/adhd-commercial-links.mjs` | Care-pathway blocks capped to ≤3 links + 1 button |
| `scripts/apply-california-city-linking.mjs` | Strips metro directories from educational guides |
| `scripts/generate-answer-pages.mjs` | Assembles unique closings; one primary CTA |
| `scripts/validate-content-assembly.mjs` | CI-style metric gate |

## Clinical Care / next-step block — render conditions

Append a clinical-care CTA **only if all are true**:

1. It directly advances this reader's journey.
2. It references **only services relevant to this page's topic**.
3. It introduces **no unrelated states** (no state directory on educational pages).
4. It does **not** repeat navigation already present (header/footer).
5. **Maximum 3 contextual links + one button.**

Otherwise omit entirely.

State availability, when useful, is **one sentence** — never a link directory.

## Intentional boilerplate (excluded from duplicate counting)

- Educational-only disclaimers
- Concise-FAQ framing on Answers
- Emergency / 911 lines
- Clinical-review status badges
- Footer state availability line
- Cookie / tracking chrome

Everything else must be unique enough that it does not appear on ≥4 pages.

## Companion audits

- `docs/CONTENT-QA-CHECKLIST.md` — pre-publish, per article
- `docs/CONTENT-COHESION-AUDIT.md` + `scripts/content-cohesion-audit.mjs` — monthly
- `docs/CONTENT-ASSEMBLY-VALIDATION.json` — last metric run
