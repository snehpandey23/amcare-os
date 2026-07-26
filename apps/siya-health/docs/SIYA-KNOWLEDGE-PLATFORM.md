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
  Chatbot (Siya Guide)
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

Do **not** immediately build Brain Fog or Perimenopause as the next engineering push.
Strengthen the platform, then let pages compound on it.

| Order | Workstream | Status |
| --- | --- | --- |
| 1 | Canonical Entity Page Blueprint | Done (`/adult-adhd-california`, `/fatigue`) |
| 2 | Public Knowledge API v1 (+ intent / care_pathway) | In progress → v3 contract |
| 3 | Siya Guide (consume the API; do not scrape HTML) | Next |
| 4 | Third Canonical Entity Page | After Guide consumes the graph |
| 5 | Labs hub depth | After entity consumption is live |
| 6 | Preventive Care hub | Bridge across labs + primary care |

The chatbot is now more valuable than another 4,000-word article because deterministic
knowledge exists for it to consume. Return on architecture compounds when other
systems use what we built — not when we keep producing pages in isolation.

---

## Related docs

| Doc | Role |
| --- | --- |
| `SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md` | Constitution / quality gates |
| `CANONICAL-ENTITY-PAGE-BLUEPRINT.md` | How to build the next entity page |
| `CONTENT-ASSEMBLY-SYSTEM.md` | Block composition rules |
| This file | Platform layers + consumption contract |
