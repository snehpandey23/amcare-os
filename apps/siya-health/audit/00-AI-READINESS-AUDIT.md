# AI Readiness Audit

```text
Framework: Siya Knowledge Governance Framework v1.0
Status: Locked 2026-07-26
Owner: Editorial + Engineering
Consumer: Siya Guide (chatbot), structured data, future voice/API
Unit of governance: Reusable Content Block + Canonical Entity
```

## Purpose

Everything downstream — Siya Guide, FAQ schema, internal linking, future voice
assistants and APIs — consumes the same knowledge. This audit checks that a
block/page is **machine-answerable and non-contradictory**.

## Two questions per block/page

```
Can AI answer correctly from this?   YES / NO
Canonical entity?                    YES / NO
```

- **Can AI answer correctly?** — Is the claim self-contained, unambiguous, and
  scoped (state, eligibility, price via source of truth)? If a model would have
  to guess or stitch fragments, it fails.
- **Canonical entity?** — Does this concept have exactly one source of truth? If
  two pages define "Executive Dysfunction" differently, both fail.

## Canonical entity example (no competing definitions)

```
Executive Dysfunction
  Canonical source : Health Guide (/answers/executive-dysfunction)
  FAQ              : references canonical, does not redefine
  Service          : /adhd-care links to canonical
  Labs             : /labs/fatigue-brain-fog references canonical
  Tool             : screener references canonical
```

Every other surface **references** the canonical entity — it never restates the
definition in different words.

## Enforcement

- `data/entity-graph.json` + `docs/SIYA-ENTITY-REGISTRY.md` — one owner per entity.
- `data/content-blocks.mjs` — each block declares its `entity`.
- `scripts/validate-block-registry.mjs` — surfaces blocks with no entity.
- FAQ/definition blocks must link to the canonical entity, not re-author it.

## Pass criteria

- Every core educational page maps to exactly one canonical entity.
- 0 competing definitions across Guide / FAQ / Service / Labs / Tool.
- Every FAQ answer is self-contained and state-scoped.
- Siya Guide can answer top intents by quoting a single canonical source.
