# Daily Tasks & SOP checklists (operational)

Separate from **Knowledge layer** department SOPs (`/grow/sops`). These are recurring **checklist tasks** on My day.

## Admin setup

1. **SOP templates** — `/admin/task-templates` (link from Task board)
2. Assign to **one person** (`assignedToUserId`); cron generates a task for that user on matching days
3. Checklist: one step per line; **daily**, **weekdays**, or **monthly (1st)** recurrence
4. **Preview next 5 occurrences** on each template row (calls `GET /api/admin/sop-templates/:id/preview`)

## Cron (Vercel)

See **`docs/workflows/daily-tasks-workflow.md`** for deploy order, P0 acceptance, troubleshooting, rollback, and event vocabulary.

Auth API project `siya-staff-auth-api`:

- Schedule: `0 11 * * *` UTC (~6 AM US Eastern) in `integrations/hipaa-training-api/vercel.json`
- Set env **`CRON_SECRET`** on the auth API project (Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations)
- Manual: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" "https://siya-staff-auth-api.vercel.app/api/cron/generate-daily-tasks"`

## Seed (dev)

From `integrations/hipaa-training-api`:

```bash
node scripts/seed-daily-tasks.mjs
```

Requires DB env vars (same as API).

## APIs

| Route | Who |
|-------|-----|
| `GET /api/tasks/me?date=today` | Signed-in user (SOP + adhoc for day) |
| `GET /api/tasks/board` | Admin (filters: assignee, status, type, overdue, priority, date range) |
| `GET /api/tasks/:id` | Task detail |
| `POST /api/tasks` | Adhoc (admin → anyone; staff → self) |
| `PATCH /api/tasks/:id` | Status, reassign, due date, priority |
| `PATCH /api/tasks/:id/checklist-item/:itemId` | Toggle checklist item (boolean) |
| `POST /api/tasks/:id/comments` | Comment |
| `/api/admin/sop-templates` | Admin CRUD |
| `GET /api/admin/sop-templates/:id/preview` | Next 5 run dates |

## Frontend

| View | Path |
|------|------|
| My Day | Home hub (`MyDayTasksPanel`) — SWR + optimistic checklist |
| Task board | `/admin/tasks` — Kanban (dnd-kit), assign modal |
| SOP templates | `/admin/task-templates` |

## v1 not built

- Proof-of-completion on checklist items
- Team / multi-assignee templates
- `custom_cron` recurrence UI
- Analytics / bulk actions
