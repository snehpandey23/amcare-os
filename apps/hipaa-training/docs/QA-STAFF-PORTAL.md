# Staff portal QA

**Dedicated login:** see **[QA-SERVICE-ACCOUNT.md](./QA-SERVICE-ACCOUNT.md)** (`qa-test@siya.health`, QA/test only — not for real patient or business data).

Agents: `source scripts/agent-qa-env.sh` then `npx tsx apps/hipaa-training/scripts/verify-qa-account.ts`.

## Automated CI (GitHub Actions)

Workflow: **`.github/workflows/siya-staff-portal-qa.yml`**

Runs on:

- Push to `main` (staff app + auth API paths)
- Every 6 hours (cron)
- Manual **Actions → Siya Staff — production QA → Run workflow**

### One-time setup — GitHub secrets

Use the **QA service account** (`qa-test@siya.health`) — not a personal founder login. Password lives in local `.env.agent-qa` (gitignored); sync to Actions:

```bash
source .env.agent-qa
gh secret set STAFF_PORTAL_QA_EMAIL --body "$ASSIST_EMAIL"
gh secret set STAFF_PORTAL_QA_PASSWORD --body "$ASSIST_PASSWORD"
# optional:
gh secret set STAFF_PORTAL_DATABASE_URL --body 'postgresql://…'
```

| Secret | Required | Purpose |
|--------|----------|---------|
| `STAFF_PORTAL_QA_EMAIL` | Yes | Login for authenticated checks |
| `STAFF_PORTAL_QA_PASSWORD` | Yes | Password for that account |
| `STAFF_PORTAL_DATABASE_URL` | No | Postgres URL for column/schema check (same DB as auth API) |

CI runs `npm run qa:portal -w @amcare/hipaa-training-api` with `QA_STRICT=1` (fails if secrets missing).

### Optional — Vercel env for local QA pulls

On project **`siya-staff-auth-api`**, you can add the same values under a **Preview** or custom environment for `vercel env pull` — CI uses **GitHub secrets**, not Vercel.

```bash
cd integrations/hipaa-training-api
npx vercel env pull .env.qa.tmp --environment=production -y
export QA_EMAIL=… QA_PASSWORD=…
npm run qa:portal
```

## Automated (local)

From repo root:

```bash
source scripts/agent-qa-env.sh
npm run qa:portal -w @amcare/hipaa-training-api
npx tsx apps/hipaa-training/scripts/verify-qa-account.ts
```

Also:

```bash
npm run migrate:status   # requires DATABASE_URL
```

## Manual smoke (5 min)

| Step | URL / action | Expected |
|------|----------------|----------|
| Health | `curl …/api/health` | `"ok":true`, `hipaa-training-api` |
| Login | Staff app `/login` as `qa-test@siya.health` | Lands on My day |
| Team | `/team` | Presence chips + roster, no red error |
| My day | `/` | Team today card + your tasks |
| Shift | Header presence | Working / Break / Focus updates |
| Admin invite | `/admin/team` → Invite | Modal, create account, copy block |
| Task board | `/admin/tasks` | Loads Kanban (admin) |
| SOP review | `/admin/sop-review` | Queue loads (admin) |
| Practice share | `/learn/practice` complete a drill | Share Yes/No prompt |
| Weekly report | Learn + Admin Team | Same report component / fingerprint |

## Known limits (documented, not bugs)

- **JWT** still valid until expiry after role change; every request now **re-reads role from DB** in `requireAuth`.
- **Team pulse** syncs knowledge→daily tasks at most **every 5 minutes** per API instance (not every 45s poll).
- **SOP admin review** daily task goes to **one** primary admin account (oldest admin), not every admin.
- **Team board** shows names, emails, and today’s open task titles to **all signed-in staff** (internal coordination).

## Regression that broke prod (fixed)

- Old DB missing `siya_sop_templates.assigned_to_user_id` → Team pulse 500. Fixed by migrating column **before** index creation in `ensureTaskTables`.
