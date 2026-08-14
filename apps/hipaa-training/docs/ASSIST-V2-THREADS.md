# Siya Assist v2 (A→B) — shared chat shell + server threads

**Status:** Shipped to production (local CLI deploy) · founder KB lane (Slice C) **not** in this cut.

## What shipped

| Piece | Behavior |
| --- | --- |
| **Server threads** | `siya_assist_threads` / `siya_assist_messages` on auth API |
| **API** | `GET/POST /api/assist/threads`, load/rename/archive, history, turns |
| **Shell** | `AssistChatShell` — New chat, search, archive, main thread |
| **Mounts** | Staff My day + admin Founder Coach **Assist** tab |
| **Recall** | `POST /api/chat` with `threadId` loads **server** history (not client-only) then persists the turn |
| **Out of scope** | Coach Draft/Refine/Lock · founder-only KB ACL (Slice C) |

## Recall smoke

```bash
# After sign-in, copy JWT from browser storage (staff portal token)
ASSIST_TOKEN='…' npx tsx apps/hipaa-training/scripts/assist-v2-recall-smoke.ts
```

Expect `PASS — Assist recalled prior turn from server thread history.`
