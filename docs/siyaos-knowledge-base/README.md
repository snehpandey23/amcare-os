# SiyaOS Knowledge Base v1.0

**Company memory** behind **[Siya Assist](../../apps/hipaa-training/)** — the internal **AI help desk** (one chat, routing, escalation). Not an ERP and not the employee handbook UI.

- **Product definition:** [`PRODUCT.md`](./PRODUCT.md)
- **Architecture (patient vs internal):** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

| Layer | Location | Audience |
|-------|----------|----------|
| **Patient / public knowledge** | `apps/siya-health/` (blocks, entity graph, SIYA-KNOWLEDGE-GOVERNANCE) | Website, Health Guides, Siya Guide |
| **Company memory (this KB)** | `docs/siyaos-knowledge-base/` | Staff, leaders, internal AI |
| **Live assistant retrieval** | Built from `**/topics/*.md` → `apps/hipaa-training` workspace KB | [Siya Assistant](https://siya-workforce-assistant.vercel.app) |

## Twenty modules

See [`manifest.json`](./manifest.json) for IDs, owners, and status. Each module folder has a `README.md` (charter) and `topics/` (retrieval-ready articles).

## Topic template

Every article uses the sections in [`_template-topic.md`](./_template-topic.md):

Overview · Why · SOP · FAQ · Troubleshooting · **AI Context** · Related documents · Owner · Revision history

Only **`status: live`** topics are compiled into the assistant. Use `draft` while writing; `review` before marking live.

## Build the assistant index

From repo root:

```bash
npm run kb:build -w @amcare/hipaa-training
npm run build -w @amcare/hipaa-training
```

## Product roadmap (v1 → v1.x)

1. **v1.0 (now)** — Module scaffold, manifest, seed SOPs from existing repo docs, deterministic retrieval.
2. **v1.1** — Owners + revision history in CI; stale-topic report.
3. **v1.2** — LLM layer with retrieval-only answers (no general ChatGPT).
4. **v2.0** — Search UI inside assistant; role-based profiles (MA, marketing, eng).

**Target scale:** 400–800 pages when mature — grow one module at a time like a product, not a single dump.
