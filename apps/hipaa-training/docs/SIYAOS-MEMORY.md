# SiyaOS — Organizational Memory (capture layer)

> **Architecture first:** read [SIYAOS-KNOWLEDGE-ARCHITECTURE.md](./SIYAOS-KNOWLEDGE-ARCHITECTURE.md) before adding capture sources.

**User-facing:** Memory pillar. **System:** Knowledge pipeline (Capture → … → Act).

**Phase 2.5 rule:** Four layers (Way → **Policies & requirements** / Laws → Knowledge → Memory). Laws seeded with policy text; Ask retrieve order wired in `retrieveLayeredKnowledge`.

> When someone leaves, Notion goes stale. SiyaOS memory grows every shift, every resolved Ask, every promoted SOP.

---

## Product phases

| Phase | Focus |
|-------|--------|
| **1 (today)** | Daily workspace — shift, My day, Ask, Learn |
| **2** | **Organizational memory** — capture, importance, search, week in review |
| **3** | AI coach personalized by years of context (opt-in) |
| **4** | Same intelligence engine for staff, clinicians, patients, partners |

---

## Memory importance

Every capture asks: **Is this worth remembering?** Most interactions: **no**.

| Level | Label | Examples | Retention |
|-------|--------|----------|-----------|
| **L1** | Temporary | Shift notes, meeting scraps, casual Ask | ~90 days (archive) |
| **L2** | Operational | SOP updates, bug fixes, marketing learnings | Permanent |
| **L3** | Strategic | Founder decisions, vision, pricing, hiring principles | Canonical — never auto-archive |

---

## Sources (target graph)

| Source | v1 | Next |
|--------|-----|------|
| End-of-shift accomplishments | ✅ Auto-ingest on end shift | Dept filters, “July marketing” rollups |
| Ask (👍 helpful) | ✅ Optional save prompt | Auto-summary on promote |
| Knowledge gaps | — | When gap closed → L2 memory |
| Reflections | Private only (not in org memory v1) | Opt-in promotion |
| Learning completed | — | Level-up milestones |
| Decisions / meetings / reports | Manual POST | Integrations (Calendar, Drive) |
| SOP promoted to Live | — | Workflow hook |

---

## Employee-facing pillar

Nav: **Memory** (`/memory`)

Copy tone: *You taught the company* — not “another ticket closed.”

Features today:

- Search (keyword over title/body/department)
- Recent org-visible entries
- **This week we learned…** — auto-compiled from L1–L3 org memories (last 7 days)

Admin: same week-in-review at team scope (via org-visible entries only). **No** exported presence-style minute logs for people.

---

## API (auth API)

- `GET /api/memory/recent`
- `GET /api/memory/search?q=`
- `GET /api/memory/week-in-review`
- `POST /api/memory` — manual or client capture

Storage: `siya_memory_entries` (Postgres).

---

## What we never do

- Surveillance-derived “memory”
- PHI in memory bodies (same rules as Ask)
- Mandatory capture on every chat message

---

## North-star queries (roadmap)

These justify Phase 2+ investment:

- *When did we first discuss Work Memory?*
- *Show everything Marketing accomplished in July.*
- *Why do we use Resend instead of SendGrid?*
- *Who knows Google Ads best?* (evidence from memories + contributions, not HR title)

Retrieval will combine: memory index, git/decisions, KB live SOPs, and shift rollups — one search surface in SiyaOS.

See also: [SIYAOS-VISION.md](./SIYAOS-VISION.md), [SIYAOS-PRINCIPLES.md](./SIYAOS-PRINCIPLES.md)
