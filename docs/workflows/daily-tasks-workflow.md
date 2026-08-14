# Daily Tasks & SOP Checklists — SiyaOS operational workflow

This document is the **operating model** for the staff portal Daily Tasks module. It is separate from Knowledge-layer department SOPs at `/grow/sops` (editorial / AI-assisted SOP workspace).

**Code:** `integrations/hipaa-training-api` (API + cron) · `apps/hipaa-training` (My Day, admin board, template manager)

---

## Purpose

Turn recurring operational work into **assignable, completable tasks** with an **immutable activity ledger**. v1 optimizes for one loop:

1. Admin defines an SOP **template** (checklist + recurrence + one assignee).
2. **Cron** (and first My Day load) **generates** today’s task instance.
3. Staff completes checklist on **My Day**.
4. Admin verifies on **Task board**.
5. **Activity logs** record who did what, from which **source**.

---

## Architecture

```text
SOP Template (siya_sop_templates)
        │
        │ cron / GET /api/tasks/me (lazy gen)
        ▼
Task instance (siya_tasks)  ──►  Task activity ledger (siya_task_activity_logs)
        │
        └── source_sop_template_id

Template changes  ──►  Template activity ledger (siya_sop_template_activity_logs)
```

| Layer | Table | Question it answers |
|-------|--------|-------------------|
| Task ledger | `siya_task_activity_logs` | What happened on this task today? |
| Template ledger | `siya_sop_template_activity_logs` | Why does this workflow exist / who changed it? |

**Event vocabulary (v1, frozen):** see `integrations/hipaa-training-api/src/task-activity-events.ts`

- Tasks: `created` · `status_changed` · `checklist_updated` · `assigned` · `deleted`
- Templates: `created` · `updated` · `activated` · `deactivated`
- **Source** on every row: `cron` · `admin_ui` · `staff_ui` · `api` · `system`

Comments live on `siya_tasks.notes` (not task ledger events in v1).

---

## Deploy & release order (P0)

Do **not** deploy staff before API + env + schema are verified.

```text
1. npm run build && npm run test:tasks     (API package)
2. DATABASE_URL=... npm run migrate:status
3. Deploy API (integrations/hipaa-training-api)
4. curl /api/health
5. Set CRON_SECRET on Vercel (auth API project)
6. Manual cron once → confirm created count + no duplicate ids
7. npm run smoke:tasks (SMOKE_EMAIL, SMOKE_PASSWORD, optional CRON_SECRET + DATABASE_URL)
8. Deploy staff app (vercel.siya-staff-assist.json from repo root)
9. Human acceptance (one real template, one completion, admin verifies, SQL ledger check)
10. Seed **staging only** until loop passes — not production
```

Deploy commands: `.cursor/rules/staff-portal-vercel-deploy.mdc`

---

## Cron behavior

- **Schedule:** `0 11 * * *` UTC (~6 AM US Eastern) → `POST /api/cron/generate-daily-tasks`
- **Auth:** `Authorization: Bearer $CRON_SECRET` (or `x-cron-secret`)
- **Logic:** For each **active** template, if recurrence matches **today’s date**, insert task id `sop-{templateId}-{YYYY-MM-DD}` with `ON CONFLICT DO NOTHING` (no duplicate daily instances).
- **Also:** `markOverdueTasks` runs on the same endpoint.
- **Lazy generation:** `GET /api/tasks/me` calls the same generator for the requested date (backstop if cron missed).

Manual run:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  "https://siya-staff-auth-api.vercel.app/api/cron/generate-daily-tasks"
```

Optional date override: `?date=2026-07-28`

Response includes **`created`** and **`skipped`** (existing instances for that date). Second cron run should show `created: 0` and `skipped ≥ 1` when templates already ran.

Idempotency check:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" ".../api/cron/generate-daily-tasks"
# repeat — expect created: 0, skipped unchanged task rows preserved
```

---

## Template creation rules

- **Admin only:** `/admin/task-templates`
- One **assigned person** per template (`assigned_to_user_id`)
- Recurrence: `daily` | `weekly` (configurable days) | `monthly` | `custom_cron` (API only in v1)
- Checklist steps: `{ id, label, order }` — copied into each generated task
- **Active** toggle: inactive templates do not generate tasks
- Template create/update/deactivate → **template activity ledger**

---

## Task lifecycle

| Type | Origin | Id pattern |
|------|--------|------------|
| `sop` | Template + date | `sop-{templateId}-{date}` |
| `adhoc` | Admin/staff POST | `adhoc-{uuid}` |

**Statuses:** `todo` · `in_progress` · `done` · `overdue` (computed when due date/time passed and not done)

**Permissions:**

- Admin: board, templates, assign adhoc to others, reassign
- Staff: own tasks — status, checklist, comments

**Checklist:** `PATCH /api/tasks/:id/checklist-item/:itemId` — toggles item; may auto-set `done` when all checked.

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No tasks on My Day | Template active? Assignee = logged-in user? Recurrence matches today? Cron or `/api/tasks/me` run? |
| Duplicate tasks | Should not happen — id is deterministic; query `siya_tasks` for same id |
| Cron 401 | `CRON_SECRET` on Vercel matches header |
| 503 on task routes | `DATABASE_URL` on auth API |
| migrate:status fails | Hit any authenticated route once (runs `ensureTaskTables`) or apply `tasks-schema.sql` |
| Admin board empty | Date filters default ~14d window; widen `from`/`to` query params |
| Activity missing | Query `siya_task_activity_logs` for `task_id`; expect `source` = `staff_ui` / `cron` |

**Ledger spot-check:**

```sql
SELECT action, source, metadata, created_at
FROM siya_task_activity_logs
WHERE task_id = 'sop-...'
ORDER BY created_at;
```

---

## Rollback

1. **Staff app only:** Redeploy previous Vercel deployment for `siya-staff-assist` (UI rollback; data unchanged).
2. **API:** Redeploy previous `siya-staff-auth-api` build from `integrations/hipaa-training-api`.
3. **Disable generation:** Deactivate all templates (`active = false`) or remove cron in Vercel dashboard temporarily.
4. **Data:** Tables are additive; rollback does not drop `siya_*` tables. To stop using module, deactivate templates — do not delete user rows.

---

## P0 definition of done (exit criteria)

P0 is complete when **reliable execution + reliable recording + human adoption signal** = operational memory foundation.

### System reliability

- [ ] Task generation works (cron + lazy `/api/tasks/me`)
- [ ] Duplicate protection works (`created` / `skipped` on repeat cron)
- [ ] Completion writes ledger events (`checklist_updated`, `status_changed`, `source` set)
- [ ] Admin visibility works (board reflects assignee status without DMs)
- [ ] SOP / workflow documentation exists (`daily-tasks-workflow.md`, team feedback doc)

### Human reliability

- [ ] Staff completes a task **without assistance**
- [ ] Admin identifies status **without messaging people**
- [ ] Mobile My Day is usable (screen-share or self-reported)
- [ ] Feedback captured **after real usage** (not demo day)

### Learning loop

- [ ] Feedback location defined (sheet tab `OPS-TASKS-FEEDBACK`)
- [ ] **Owner assigned** for weekly triage (name + calendar reminder)
- [ ] Blocker vs improvement distinction enforced in sheet
- [ ] Weekly review cadence established (see `daily-tasks-team-feedback.md`)

**Automation (supporting, not substituting for human checks):** `npm run migrate:status` (twice, read-only) · `npm run smoke:tasks` · `npm run verify:audit-chain`

### After P0 exit — freeze one week

1. Deploy P0.
2. Run one real workflow.
3. Collect first feedback after usage.
4. **Freeze observations for one week** (no Phase 2 code from anecdotes).
5. Then decide Phase 2 from categorized root causes.

---

## Related docs

- Staff app summary: `apps/hipaa-training/docs/DAILY-TASKS-SOP.md`
- **Team UX feedback (questions + cadence):** `daily-tasks-team-feedback.md`
- Recurrence tests: `npm run test:tasks` in API package
- Seed (staging): `node scripts/seed-daily-tasks.mjs`

---

## Out of scope (v1)

Proof on checklist items · team assignment · COO dashboard · template full editor · analytics · AI recommendations — see product backlog after P0 is boringly reliable.
