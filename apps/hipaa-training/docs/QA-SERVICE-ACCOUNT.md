# Staff portal — QA / test service account

**Label:** QA/test only — do not use for real patient or business data.

This account exists so agents and CI can run **authenticated** production checks without the founder’s personal login.

## Account

| Field | Value |
|--------|--------|
| Email | `qa-test@siya.health` |
| Display name | `QA Test (automated — do not use for real patient or business data)` |
| Role | **admin** (covers staff My day / Practice + admin Team surfaces) |
| PHI | Staff portal is non-PHI by design; this account must never be used for real patient or business work |

## Where credentials live

| Store | Purpose |
|--------|---------|
| **Local (agents):** repo-root `.env.agent-qa` (gitignored, mode 600) | Desktop / Cursor agents — `source scripts/agent-qa-env.sh` |
| **CI:** GitHub Actions secrets `STAFF_PORTAL_QA_EMAIL` / `STAFF_PORTAL_QA_PASSWORD` | `.github/workflows/siya-staff-portal-qa.yml` |
| **Template:** `.env.agent-qa.example` | Empty password placeholder only |

Never paste the password into chat, commits, or WorkDrive.

### One-time: sync password into GitHub (human, after `gh auth login`)

```bash
source .env.agent-qa
gh secret set STAFF_PORTAL_QA_EMAIL --body "$ASSIST_EMAIL"
gh secret set STAFF_PORTAL_QA_PASSWORD --body "$ASSIST_PASSWORD"
```

## How agents / scripts authenticate

```bash
source scripts/agent-qa-env.sh
npx tsx apps/hipaa-training/scripts/verify-qa-account.ts
# Full E2E (practice weekly report + Ask + admin roster):
npx tsx apps/hipaa-training/scripts/verify-qa-e2e-practice-ask.ts
# or existing suite:
npm run qa:portal -w @amcare/hipaa-training-api
```

Scripts refuse emails that do not look like QA/test.

**Secret status (2026-08-26):** Local `.env.agent-qa` + macOS keychain are set and used by agents. GitHub Actions `STAFF_PORTAL_QA_*` still needs a one-time human `gh auth login` + `gh secret set` (see above) before CI can authenticate without local env.

## Bootstrap history (2026-08-26)

1. Temporarily set `HIPAA_TRAINING_ALLOW_REGISTER=true` + `HIPAA_TRAINING_ADMIN_EMAIL=qa-test@siya.health` on `siya-staff-auth-api`
2. Registered the account via `/api/auth/register`
3. Set `HIPAA_TRAINING_ALLOW_REGISTER=false` and redeployed (public register closed again)
4. Left `HIPAA_TRAINING_ADMIN_EMAIL=qa-test@siya.health` so any future matching register would still be admin — prefer inviting via Team admin instead of reopening register

## Related

- Broader QA checklist: [QA-STAFF-PORTAL.md](./QA-STAFF-PORTAL.md)
- Practice report / coach verify: `scripts/smoke-weekly-practice-report.ts` (unit) + browser after `agent-qa-env.sh` login
