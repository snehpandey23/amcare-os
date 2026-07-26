# Live sync & safe deploys (Siya Health)

**Production host:** Vercel → `https://www.siya.health`  
**Source of truth for code:** `origin/main` → Vercel Git deploy (`apps/siya-health`)  
**If live HTML and git disagree on a critical marker:** treat **live** as truth, update git, then deploy once via `main`.

## Why deploys “reversed” the site

On 2026-07-22, a long-lived local branch (`phase-7-indexation-remediation`) was merged into `main` with an explicit preference for the older branch over newer cloud-agent commits (blog category + chatbot removal). Vercel auto-deployed that merge and production looked rolled back. Partial restore: `c7c3c6e`.

A second risk: `vercel --prod` from a dirty/local tree can publish content that is **not** on `origin/main` (example: Siya Circle form URL lived on CarePatron while git still had the old GHL widget).

## Rules for cloud agents

1. **Always start from latest `main`**
   ```bash
   git fetch origin
   git checkout main
   git pull --ff-only origin main
   git checkout -b cursor/<task>-XXXX
   ```
2. **Before merge:** rebase onto `origin/main` (never merge a stale long-lived branch “preferring ours”).
3. **Single production path:** merge to `main` → Vercel Git. Do **not** run `vercel --prod` unless the owner explicitly asks.
4. **Run the live guard before claiming deploy-ready:**
   ```bash
   cd apps/siya-health && npm run sync:live
   ```
5. **Never** force-push `main`. Never close/overwrite cloud PRs by preferring weeks-old local branches.

## Sync checklist (when live ≠ git)

```bash
cd apps/siya-health
npm run sync:live
# If Circle URL / pathway images / chat markers diverge:
# 1) Update data/siya-circle-config.mjs (or assets/HTML) to match live
# 2) Propagate (site-chrome / bulk replace)
# 3) Commit on a fresh branch from origin/main
# 4) Merge to main only after sync:live passes
```

Critical markers currently guarded:

- Siya Circle signup URL (canonical in `data/siya-circle-config.mjs`)
- LeadConnector chat absence
- Homepage Common Care Paths images (`pathway-womens-health.jpg`, `pathway-adhd-care.jpg`)

## Owner Mac workflow

- Pull `main` with `--ff-only` before any website merge.
- Fuse/editorial scripts (`brand/EOD-FUSE.md`) do **not** deploy the website.
- If you have local website edits: rebase onto `origin/main` and resolve file-by-file; do not “take entire branch.”
