# Transactional email (Resend) — staff portal

One provider, one Vercel project, two features:

| Feature | Route / UI | Sends to |
|--------|------------|----------|
| **Team invite** | `/admin/team` + `POST /api/admin/invite-email` | New hire’s work email |
| **Notify owner** | Ask chat + `POST /api/knowledge-gap` | `bot@siya.health` (default) |

Both use **`RESEND_API_KEY`** on **`siya-staff-assist`** only (never on the auth API, never `NEXT_PUBLIC_*`).

---

## Phase A — Resend (15–30 min)

1. **Account:** [resend.com](https://resend.com) → sign in (use a team org, not a personal throwaway).
2. **API key:** Dashboard → **API Keys** → Create → name `siya-staff-assist-production` → copy `re_...` once.
   - Store in a password manager; never commit, never paste in Slack.
3. **Domain (required for real `@siya.health` From):**
   - **Domains** → Add **`siya.health`**
   - Add the DNS records Resend shows (usually SPF + DKIM; often in the same DNS as Google/Zoho).
   - Wait until status **Verified** (can take minutes to 48h).
4. **Until verified:** Resend only allows sending **from** `onboarding@resend.dev` and **to** the email on your Resend account (sandbox). Use that for a smoke test only; do not invite real staff with `@resend.dev` in production.

---

## Phase B — Vercel env (5 min)

Project: **[siya-staff-assist](https://vercel.com)** (not `siya-staff-auth-api`).

| Variable | Environments | Example / notes |
|----------|--------------|-----------------|
| `RESEND_API_KEY` | **Production** (and Preview if you test invites on preview URLs) | `re_xxxxxxxx` |
| `SIYA_INVITE_FROM` | Production | `Siya Staff Portal <notifications@siya.health>` |
| `SIYA_ESCALATION_FROM` | Production | `Siya Assist <notifications@siya.health>` (can match invite) |
| `SIYA_ESCALATION_TO` | Production | Already set → `bot@siya.health` |
| `NEXT_PUBLIC_SIYA_STAFF_LOGIN_URL` | Production | `https://siya-staff-assist.vercel.app/login` (optional; defaults to prod URL) |

**UI path:** Project → **Settings** → **Environment Variables** → Add each → check **Production** → Save.

**CLI (alternative):**

```bash
cd /Users/sp/amcare-os
printf '%s' 're_YOUR_KEY' | npx vercel env add RESEND_API_KEY production --project siya-staff-assist --yes
printf '%s' 'Siya Staff Portal <notifications@siya.health>' | npx vercel env add SIYA_INVITE_FROM production --project siya-staff-assist --yes
printf '%s' 'Siya Assist <notifications@siya.health>' | npx vercel env add SIYA_ESCALATION_FROM production --project siya-staff-assist --yes
```

Then **redeploy Production** (env does not apply to live traffic until redeploy):

```bash
npx vercel deploy --prod --yes --project siya-staff-assist --local-config vercel.siya-staff-assist.json
```

---

## Phase C — Verify (2 min each)

### 1. Invite email

1. Hard refresh → **Team** → invite a **test address you control** (or yourself on a alias).
2. Leave **“Try to email login details”** checked.
3. After submit, UI should say **Invite email sent** (not “RESEND_API_KEY is not set”).
4. Check inbox + spam. Resend Dashboard → **Logs** shows delivery or bounce reason.

### 2. Escalation email (same key)

1. **Ask** → question with no KB hit → **Notify owner**.
2. Response should indicate email sent; check **bot@siya.health**.

If Logs show **domain not verified**, finish Phase A DNS before inviting real teammates.

---

## Phase D — Production habits

- **Separate keys:** Optional second key `siya-staff-assist-preview` scoped to Preview only; rotate if leaked.
- **No passwords in email long-term:** v1 sends temp password in email (convenient). v2 should use **invite link + one-time token** (password set on first visit). Plan that before wide rollout.
- **Resend ≠ Zoho inbox:** Resend only **sends**. Replies to `notifications@siya.health` still go to whatever receives that mailbox in Zoho/Google.
- **Already invited without email:** Account exists. Re-invite same email with new temp password, or **Copy invite text** / send email after Resend works.

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| “RESEND_API_KEY is not set” | Key on wrong project or only Preview; redeploy Production |
| 403 / domain | Verify `siya.health` in Resend; fix From to use that domain |
| Email to teammate, nothing inbox | Resend Logs; spam; typo email; sandbox “to” restriction before verify |
| Invite works, escalation doesn’t | Same key — check `SIYA_ESCALATION_FROM` and Logs |

See also: [ESCALATION-EMAIL.md](./ESCALATION-EMAIL.md)
