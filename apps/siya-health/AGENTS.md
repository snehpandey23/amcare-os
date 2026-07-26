# Siya Health — cloud agent notes

Website lives in this directory (`apps/siya-health`). Production is **Vercel on `main`** → https://www.siya.health

## Before any website work

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

Create a fresh `cursor/<task>-XXXX` branch from that tip. Do not continue weeks-old branches.

## Before merge / deploy claims

```bash
cd apps/siya-health && npm run sync:live
```

Must pass. See `docs/LIVE-SYNC-AND-DEPLOY.md`.

## Deploy policy

- Prefer: merge PR → `main` → Vercel Git auto-deploy
- Do **not** run `npm run deploy` / `vercel --prod` unless the user explicitly asks
- Never merge long-lived branches with “prefer this branch over main”

## If live looks newer than git

Update git to match live critical markers (Circle URL, pathway images, chat absence), commit, then deploy once via `main`.
