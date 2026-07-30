# SiyaOS — Knowledge architecture

**Nav label:** Memory (unchanged)  
**System:** Knowledge  
**Rule:** *Most things aren't worth promoting. Knowledge must earn permanence.*

**User-facing name for Layer 0:** **The Siya Way** (internal/schema: constitution).  
**User/API name for Layer 1:** **Policies & requirements** (internal architecture: **Laws**).

**Knowledge Steward (promote button):** **Founder (Knowledge Steward)** — sole approver for Layer 1 (Policies) and Layer 2 (canonical Knowledge / live SOPs) until a named Editor in Chief exists.

---

## Four-layer stack (concept lock)

```text
The Siya Way (Constitution)  →  Policies & requirements (Laws)  →  Knowledge  →  Memory
         Layer 0                         Layer 1                  Layer 2      Layer 3
```

| Layer | Internal | User-facing | What it is | Half-life |
|-------|----------|-------------|------------|-----------|
| **0** | Constitution | **The Siya Way** | Timeless principles — mission, never ask twice, outcomes not surveillance | Forever (tiering TBD) |
| **1** | **Laws** | **Policies & requirements** | Company policy — HIPAA, PHI rules, leave, reimbursement, security, marketing approval | Per law (review date) |
| **2** | Knowledge | Knowledge (execution) | SOPs, playbooks, checklists, templates; **decisions** are a type here | Varies |
| **3** | Memory | Memory (captures) | Shift notes, ideas, research — most never promoted | Short / archive |

**Laws** are not principles (Layer 0) and not how-to SOPs (Layer 2). They answer *what we are required to do or forbid* and **evolve on review cycles**.

**Decisions** (tool choices, CTAs, vendors) remain typed **Knowledge**, not a top-level nav concept.

---

## Retrieve order (Ask — wired)

Default retrieval walks **down** the stack, not up from Memory:

```text
1. The Siya Way
2. Policies & requirements (Laws)
3. Knowledge (SOPs, playbooks, decisions, workspace KB)
4. Memory — only when the question is explicitly historical
   (e.g. “when did we…”, “who decided…”, “what did we try in July…”)
```

Implementation: `retrieveLayeredKnowledge` in `src/lib/siya-os/retrieval.ts`  
Seeds (offline Ask): `src/content/siya-layer-seeds.ts`  
API upsert: `siya_laws` / `siya_constitution_entries` on boot via `syncLawsSeed`

Example: *Can I upload a patient screenshot?* → Way (if relevant) → **PHI law** → related SOP/KB → not random memory captures.

Sources shown to staff may be prefixed with the layer label (e.g. `Policies & requirements · PHI in internal chat…`).

---

## Promote questions (every promoted object)

1. **What happened?**  
2. **Why does it matter?**  
3. **What changed because of it?**  
4. **Can the system act on it later?** (`actionHook`)

---

## Pipeline (closed loop)

```text
Capture → Verify → Promote → Connect → Retrieve → Apply → Learn
                                              ↑              │
                                              └──── Capture ─┘
```

Retrieve must follow **layer order** above before Apply/Learn close the loop.

---

## Laws v1 (seeded policy text)

Table: `siya_laws` (`summary` + `body`)

| Seed | Role |
|------|------|
| HIPAA compliance | Workforce obligations + escalate Privacy Officer |
| PHI in internal chat / Ask | No screenshots / identifiers in Ask |
| Leave and PTO | Interim — human approval; Ask cannot approve |
| Expense reimbursement | Interim — Accounts path; Ask cannot approve |
| Security basics | Accounts, MFA, phishing / lost device |
| Marketing approval | Marketing lead before patient-facing publish |

**API:**

- `GET /api/policies/requirements` — `{ layer: 1, label: "Policies & requirements", policies: [...] }`
- `GET /api/policies/requirements/:id`

Internal docs and code may say **Laws**; responses use **Policies & requirements**.

---

## Layer 2 — department SOPs (v1 slice)

**Ownership:** Each of the eight help-desk departments has an assignable **department lead** (`siya_department_leads`). Leads create/edit SOPs scoped to their department only.

**Status:** `draft` → `pending_review` → `live` → `needs_review` (half-life on live SOPs).

- **Pending review:** Visible in the library and **retrievable by Ask**, titled `[Pending Review] …` — not withheld, not treated as fully approved.
- **Admin (founder v1):** Single global approver — review queue approves to Live or send back to draft with comment.

**UI:** `/grow/sops`, `/admin/sop-review`, `/memory` (Way · Policies · Knowledge · Memory tabs).

---

## Not implemented (do not build without steward sign-off)

| Item | Notes |
|------|--------|
| Immutable / Strategic / Cultural sub-tiers inside Way | Taxonomy only — defer |
| Editorial workflow UI | Promote queue, approver audit |
| Knowledge debt dashboard | Orphans, expired reviews, conflicts — use review dates first |
| Grounding / confidence % on Ask | Admin telemetry after lineage |
| Contradiction engine | After Laws + Knowledge linked |

---

## Existing pieces

| Piece | Layer |
|-------|--------|
| `siya_constitution_entries` | 0 |
| `siya_laws` | 1 |
| `siya_decisions`, Ask KB / SOPs | 2 (Knowledge) |
| `siya_memory_entries` | 3 |
| `siya_knowledge_links` | Connect across layers |

---

## Priority order (updated)

1. ~~Way + Laws seed~~  
2. ~~Wire Ask retrieve order~~  
3. Connect graph (Law ↔ SOP ↔ decision)  
4. Editorial governance UI (after volume hurts)  
5. Knowledge Health / grounding / contradictions  

---

## North star

> **SiyaOS doesn't remember everything. It remembers what the organization has deliberately chosen to stand for, believe, and repeatedly prove works.**

See also: [SIYAOS-MEMORY.md](./SIYAOS-MEMORY.md)
