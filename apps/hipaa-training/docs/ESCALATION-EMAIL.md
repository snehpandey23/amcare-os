# Escalation email (Notify owner)

When staff click **Notify owner** on a knowledge gap:

1. **PHI guard** (`assessStaffMessageSafety`) runs first. If it trips, verbatim question text is **not** written to Vercel logs, Resend, or browser `localStorage` — department + task only.
2. Gap row is stored in `siya_assist_gaps` (**never** stores question text).
3. **Routing**
   - Department has a non-admin assigned lead (and is not Leadership/General) → queued for that lead’s **weekly digest** (Resend, Monday cron).
   - No lead / lead is admin / Leadership / General → **instant** email to `bot@siya.health` (or `SIYA_ESCALATION_TO`).
4. Leads can **Mark handled** on Team / My day; digests only include `status = open`.

Honest copy: counts are **Notify owner clicks**, not every unanswered Ask turn.

## One-time setup (you)

### 1. Inbox

Ensure **`bot@siya.health`** exists (Google / Zoho) and someone monitors it.

### 2. Resend

1. [resend.com](https://resend.com) → API Keys → create key.
2. **Domains** → add **`siya.health`** → add DNS records Resend shows.
3. After verified, use a From like `Siya Assist <notifications@siya.health>`.

Until the domain is verified, Resend only allows **`onboarding@resend.dev`** as From (testing).

### 3. Vercel — project **`siya-staff-assist`**

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | `re_...` |
| `SIYA_ESCALATION_TO` | `bot@siya.health` (optional — this is the default) |
| `SIYA_ESCALATION_FROM` | `Siya Assist <notifications@siya.health>` (after domain verify) |
| `CRON_SECRET` | same secret as auth API cron (weekly lead digests) |

Also ensure **`siya-staff-auth-api`** has the same `CRON_SECRET` (digest payload endpoints).

Redeploy **both** staff portal and auth API after changes.

## Verify

```bash
npx tsx apps/hipaa-training/scripts/verify-knowledge-gap-phi.ts
```

Manual: Ask something with no policy → **Notify owner**.  
PHI probe: include an MRN — confirm response `phiRedacted: true` and email/logs have no verbatim question.

Weekly digests: `POST /api/cron/lead-gap-digests` with `Authorization: Bearer $CRON_SECRET` (Mondays 12:00 UTC via Vercel cron).
