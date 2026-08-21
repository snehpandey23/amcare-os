# Escalation email (Notify owner)

## Delivery modes (verification must not look like live)

| Mode | Trigger | Resend? | Recipient |
|------|---------|---------|-----------|
| **live** | Normal staff use (default) | Yes | `SIYA_ESCALATION_TO` (default `bot@siya.health`) |
| **dry_run** | `emailMode: "dry_run"` **or** synthetic probe text (`zzzxxy`, `UI-notify-owner`, `gap-email-*-probe`, …) | **No** | `emailPreview` only; `emailWouldSendTo` = production inbox |
| **test_recipient** | `emailMode: "test_recipient"` + `SIYA_ESCALATION_TEST_TO` (must differ from production) | Yes | Test inbox; subject `[TEST]` |

API responses always include **`emailDelivery`** (`live` \| `dry_run` \| `test_recipient` \| `skipped`) with `emailSent`. Never report “sent” without saying which mode/recipient. Synthetic probes **force dry_run** and **auto-resolve** so they never sit in open queues.

When staff click **Notify owner** on a knowledge gap:

1. **PHI guard** (`assessStaffMessageSafety`) runs first. If it trips, verbatim question text is **not** written to Vercel logs, Resend, or browser `localStorage` — department + task only.
2. Gap row is stored in `siya_assist_gaps` (**never** stores question text).
3. **Routing**
   - Department has a non-admin assigned lead (and is not Leadership/General) → queued for that lead’s **weekly digest** (Resend, Monday cron).
   - No lead / lead is admin / Leadership / General → **instant** email path (`founder_instant`) subject to delivery mode above.
4. Leads can **Mark handled** on Team / My day; digests only include `status = open`. Leadership/General never appear in the **lead** weekly digest.

Honest copy: counts are **Notify owner clicks** (plus auto-gap / thumbs-down signals), not every unanswered Ask turn.

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
| `SIYA_ESCALATION_EMAIL_MODE` | Optional default: `live` \| `dry_run` \| `test_recipient` |
| `SIYA_ESCALATION_TEST_TO` | Required for test_recipient; must not equal production inbox |
| `CRON_SECRET` | same secret as auth API cron (weekly lead digests) |

Also ensure **`siya-staff-auth-api`** has the same `CRON_SECRET` (digest payload endpoints).

Redeploy **both** staff portal and auth API after changes.

## Verify

```bash
npx tsx apps/hipaa-training/scripts/verify-knowledge-gap-phi.ts
```

Manual: Ask something with no policy → **Notify owner**.  
PHI probe: include an MRN — confirm response `phiRedacted: true` and email/logs have no verbatim question.

Weekly digests: `POST /api/cron/lead-gap-digests` with `Authorization: Bearer $CRON_SECRET` (Mondays 12:00 UTC via Vercel cron on **siya-staff-assist**). Dry-run (no email): `?dryRun=1`.
