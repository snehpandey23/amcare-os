# Escalation email (Notify owner → bot@siya.health)

When staff click **Notify owner** on a knowledge gap, the app:

1. Logs the question (Vercel function logs)
2. Sends email to **`bot@siya.health`** (or `SIYA_ESCALATION_TO`) via **Resend**

## One-time setup (you)

### 1. Inbox

Ensure **`bot@siya.health`** exists (Google / Zoho) and someone monitors it.

### 2. Resend

1. [resend.com](https://resend.com) → API Keys → create key.
2. **Domains** → add **`siya.health`** → add DNS records Resend shows (same place you manage email DNS if applicable).
3. After verified, use a From like `Siya Assist <assist@siya.health>` or `notifications@siya.health`.

Until the domain is verified, Resend only allows **`onboarding@resend.dev`** as From (testing).

### 3. Vercel — project **`siya-staff-assist`**

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | `re_...` |
| `SIYA_ESCALATION_TO` | `bot@siya.health` (optional — this is the default) |
| `SIYA_ESCALATION_FROM` | `Siya Assist <notifications@siya.health>` (after domain verify) |

Redeploy Production.

## Verify

Ask something with no policy, click **Notify owner**. Response should include `emailSent: true`. Check **`bot@siya.health`**.

## PHI

Staff must not paste patient identifiers in chat or escalation text. Email body includes a reminder.
