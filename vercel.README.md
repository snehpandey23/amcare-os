# Root Vercel config — DO NOT use for production deploys

This monorepo hosts **multiple Vercel projects**. A bare `vercel deploy --prod` from the repo root targets `.vercel/project.json` (**siya-staff-assist**) and is easy to run by mistake.

| Product | Deploy from |
|---------|-------------|
| **Staff portal** | `bash scripts/deploy-staff-portal.sh` |
| **Auth API** | `cd integrations/hipaa-training-api && npx vercel deploy --prod --yes` |
| **Patient site** | `cd apps/siya-health && npx vercel deploy --prod --yes` |
| **Patient Guide bot** | `cd apps/siya-assistant && npx vercel deploy --prod --yes` |

See `.cursor/rules/staff-portal-vercel-deploy.mdc` and `apps/hipaa-training/docs/DEPLOYMENT-GATE.md`.

Root `vercel.json` is what **Git-connected** `siya-staff-assist` builds read (includes `ignoreCommand`). CLI deploys should still use `--local-config vercel.siya-staff-assist.json` or `scripts/deploy-staff-portal.sh`.
