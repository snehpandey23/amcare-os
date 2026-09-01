# Marketing & ops SOP pack (lead tasks)

Source: leadership ops meeting. Installed automatically in the auth API via `ensureOperationalSopPack()` (see `integrations/hipaa-training-api/src/lead-operational-pack.ts`).

| Department | Knowledge task | Draft SOP topic |
|------------|----------------|-----------------|
| Marketing | Zocdoc & listing narrative alignment | Visit types vs site; no misleading Rx/ADHD claims before ads |
| Accounts | Chargeback & refund expectations | Escalation, documentation, loss reduction |
| Clinical Operations | Provider scheduling & capacity ownership | PA priority, bandwidth before scaling bookings |

## How it shows up for leads

1. **Grow → SOPs** — open Knowledge tasks + draft SOP bodies (when a department lead or admin exists).
2. **Task board / My Day** — `syncKnowledgeWorkToDailyBoard()` mirrors open Knowledge tasks and review queues into `siya_tasks` (IDs prefixed `kn-sop-`).

After assigning department leads in admin, open **Task board** or **Admin → department leads** once to backfill assignees and daily tasks.
