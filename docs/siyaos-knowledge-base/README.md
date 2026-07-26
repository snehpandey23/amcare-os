# SiyaOS Knowledge Base v1.0 — Company Memory

**Company memory** behind **[Siya Assistant](../../apps/hipaa-training/)** — internal AI help desk (one chat, routing, escalation).

- **Product definition:** [`PRODUCT.md`](./PRODUCT.md)
- **Architecture (patient vs internal):** [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Team authoring (WorkDrive):** `Common Folder/SiyaOS/` — Company Memory v1 layout (`_shared/`, `operations/`, `finance/`, `leadership/principles|decisions|ideas|graveyard/`)

| Layer | Location | Audience |
|-------|----------|----------|
| **Patient / public knowledge** | `apps/siya-health/` | Website, Siya Guide |
| **Company memory (this KB)** | `docs/siyaos-knowledge-base/` | Staff, leaders, internal AI |
| **WorkDrive drafts** | `Common Folder/SiyaOS/` | Authors before git `live` |
| **Live assistant retrieval** | `**/topics/*.md` + `decisions/` → `kb:build` | [Siya Assistant](https://siya-assistant.vercel.app) |

## Memory types (leadership)

| kind | Folder (WorkDrive) | Bot |
|------|-------------------|-----|
| principle | `leadership/principles/` | Stable guardrails |
| decision | `leadership/decisions/` | “Why did we…?” |
| graveyard | `leadership/graveyard/` | Why we stopped |
| idea | `leadership/ideas/` | **Never** compile (`bot_retrieve: false`) |
| topic | department folders | SOPs / policies |

## Topic template

[`_template-topic.md`](./_template-topic.md) — when promoting from WorkDrive, map `review_date` → `reviewDate`, `tags` → `keywords`, add `id` and `module`.

Only **`status: live`** topics compile. **`kind: idea`** and **`bot_retrieve: false`** are excluded from the bot index.

## Build the assistant index

```bash
npm run kb:build -w @amcare/hipaa-training
npm run build -w @amcare/hipaa-training
```

See [`manifest.json`](./manifest.json) for module owners.

## Audit-driven roadmap

Company Memory grows in **audit → fill gaps → re-audit** loops. Do not score the bot on fluency — score the organization.

- Program: [`AUDIT-PROGRAM.md`](./AUDIT-PROGRAM.md)  
- Personas: [`audits/`](./audits/) (V1–V5: new hire, ops, CEO, red team, success simulation)  
- Scores: [`audits/score-log.md`](./audits/score-log.md)
