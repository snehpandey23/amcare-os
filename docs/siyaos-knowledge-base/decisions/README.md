# Decision log — authoritative store

**Primary edit path:** Memory hub → Knowledge → **Record decision**  
(`siya_decisions` in Postgres via `POST /api/knowledge/decisions`)

**Not primary:** Markdown files in this folder. They are:

1. **Boot-synced** into Postgres on API start (`syncMarkdownDecisionsSeed`, same idea as `syncLawsSeed`) for the three historical entries (`homepage-cta-meet-and-greet`, `marketing-os-v1-frozen`, `agent-org-chart-deferred`).
2. A **git export / backup** of those frozen decisions — do not add new decisions here as the live create path.

**Ask retrieval:** Layer 2 loads decisions from `GET /api/knowledge/decisions/retrieval` and merges them like dynamic SOPs. Static `workspace-kb` decision copies are skipped when the DB log is available.

**Bulk import:** `docs/siyaos-knowledge-base/decisions/siya-decisions-seed.json` +  
`integrations/hipaa-training-api/scripts/seed-siya-decisions.mjs` (idempotent; uses the same POST path + lineage rules).

Related but distinct decisions are linked with `relates_to` (e.g. Meet & Greet Discovery Call retirement ↔ homepage CTA; marketing bigger-systems pause ↔ Marketing OS v1 freeze) — not collapsed into one row.
