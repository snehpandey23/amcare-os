# Siya Knowledge Platform

```text
Status:            Production foundation
Date:              2026-07-26
Governance:        Siya Knowledge Governance Framework v1.0
Scope:             Architecture — not a feature list
```

The website work crossed a threshold. Pages are no longer the product; they are one
**presentation surface** on top of a shared knowledge platform.

Every future project — chatbot, search, mobile app, email assistant, care pathway —
should **plug into these layers** instead of bypassing them.

---

## Platform layers

```text
Presentation
  Website
  External bot (Siya Guide) — patients / public
  Internal bot (Siya Assist) — staff help desk
  Future App
        ↓
Public Knowledge API
  resolveAnswer(query) → entity + intent + care_pathway + CTAs
        ↓
Entity Registry
  knowledge-entities.json · link-registry.ts · entity-graph.json
        ↓
Content Assembly
  optional blocks · one primary CTA · section link caps · fingerprint
        ↓
Knowledge Graph
  parents · children · related · labs · retired URLs
        ↓
Content Blocks
  owned · versioned · clinically scoped (SIYA:* registry)
```

Naming freeze: `docs/BOT-NAMING-FREEZE.md` — **External bot** = Guide; **Internal bot** = Assist. Do not use “assistant” alone.

| Layer | Owns | Must not |
| --- | --- | --- |
| Presentation | Layout, copy tone for a channel | Invent URLs, CTAs, or care routing |
| Public Knowledge API | Deterministic query → entity answer | Call an LLM to choose the link |
| Entity Registry | Canonical IDs, aliases, intents | Duplicate definitions per product |
| Content Assembly | How a page is composed from blocks | Append generic SEO modules blindly |
| Knowledge Graph | Relationships between entities | Dump city directories into prose |
| Content Blocks | Ownership, version, allowed context | Render outside allowed topics/paths |

---

## Engineering principle (do not forget)

> **Fix generators before fixing pages. Fix architecture before adding governance.**

When a page is wrong, the temptation is to patch the HTML or add another validator.
That produces decorative bureaucracy: green gates that nobody trusts, and debt that
regrows on the next build.

Preferred order:

1. Find the generator or shared block that emitted the problem.
2. Fix it so regeneration cannot recreate the bug.
3. Only then tighten a gate — and only if a real production incident justifies it.

We did not add a validator every time we found template bleed. We fixed the assembly
system. Keep that habit.

---

## Public Knowledge API contract (v3)

Surfaces consume **intent**, not only links:

```json
{
  "entity": "fatigue",
  "intent": "symptom",
  "care_pathway": "primary_care",
  "canonical_page": "/fatigue",
  "primary_cta": { "id": "book_appointment", "label": "Book a primary care visit" },
  "related_entities": ["brain_fog", "sleep_problems", "perimenopause"]
}
```

| Field | Purpose |
| --- | --- |
| `intent` | Why the reader arrived (`symptom` \| `condition` \| `service` \| `lab` \| `screening`) |
| `care_pathway` | Shared destination (`primary_care`, `adhd_care`, `labs`, …) |
| `canonical_page` | Single owned URL for the entity |
| `primary_cta` | The one action this entity should promote |

A symptom intent must not resolve to a specialty screening CTA unless the entity
registry explicitly declares that pathway. Fatigue → primary care. California ADHD →
ADHD screening. No surface invents the opposite.

Implementation: `apps/siya-assistant/lib/entities.ts` · registry:
`apps/siya-assistant/data/knowledge-entities.json`.

---

## Roadmap (platform-first)

See **`PLATFORM-v1.md`** — the platform is **frozen**. Phase map:

| Phase | Name | Status |
| --- | --- | --- |
| A | Foundation | Done |
| B | Core Graph | Done |
| C | Coverage (density over size) | Operating — evidence decides next entity |
| D | Consolidation (blog / GSC / linking) | Later |

Internal KPIs: Knowledge Integrity (governance) · Knowledge Coverage (`npm run graph:observe`).

Prefer coherence over page count. Every new entity must strengthen the graph.


## Related docs

| Doc | Role |
| --- | --- |
| `SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md` | Constitution / quality gates |
| `CANONICAL-ENTITY-TAXONOMY-v1.md` | **FROZEN** entity classes (Root Service · Service · Condition · Symptom · Laboratory) |
| `CANONICAL-ENTITY-PAGE-BLUEPRINT.md` | How to build the next entity page |
| `CONTENT-ASSEMBLY-SYSTEM.md` | Block composition rules |
| This file | Platform layers + consumption contract |
