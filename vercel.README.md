# Root Vercel config — DO NOT use for production deploys

This monorepo hosts **multiple Vercel projects**. A bare `vercel deploy --prod` from the repo root targets `.vercel/project.json` (**siya-staff-assist**) and is easy to run by mistake.

| Product | Deploy from |
|---------|-------------|
| **Staff portal** (auth API + staff app) | `bash scripts/deploy-staff-portal.sh` — refuses dirty working tree unless `--allow-dirty` |
| **Auth API alone** | Prefer the script above (same gate). Avoid bare `vercel deploy` — skips dirty check. |
| **Patient site** | `bash scripts/deploy-siya-health.sh` — commit and push `apps/siya-health` first. A dirty tree is refused, and `--allow-dirty` is not accepted. Do not `cd apps/siya-health && vercel deploy` (rootDirectory doubles the path, and a bare deploy skips the git check). |
| **Patient Guide bot** | `cd apps/siya-assistant && npx vercel deploy --prod --yes` |

See `.cursor/rules/staff-portal-vercel-deploy.mdc`, `.cursor/rules/siya-health-commit-before-deploy.mdc`, and `apps/hipaa-training/docs/DEPLOYMENT-GATE.md`.

Root `vercel.json` is what **Git-connected** `siya-staff-assist` builds read (includes `ignoreCommand`). CLI deploys should still use `--local-config vercel.siya-staff-assist.json` or `scripts/deploy-staff-portal.sh`.
