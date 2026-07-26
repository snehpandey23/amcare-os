# EOD Local Fuse — Knowledge Editorial → WorkDrive

**Locked:** 2026-07-22  
**Model:** Cloud agents write to git → Mac fuses to TrueSync every **4 hours** (Ready rows only).

## Run manually

```bash
cd ~/amcare-os
git checkout main && git pull
bash apps/siya-health/brand/scripts/eod-fuse-to-truesync.sh
```

Optional Insight IDs (even if not Ready in CSV):

```bash
bash apps/siya-health/brand/scripts/eod-fuse-to-truesync.sh --ids AD-W-02
```

## Scheduled (launchd)

Install once:

```bash
bash apps/siya-health/brand/scripts/install-fuse-launchd.sh
```

Logs: `brand/04-Content-Tracker/fuse-logs/`

## Cloud agents (daytime)

- Packs: `brand/editorial-packs/[Insight-ID]/`
- Statics mirror: `brand/06-Statics/[Insight-ID]/`
- Tracker: `brand/04-Content-Tracker/Siya-Content-Tracker-Posts.csv`
- Status **Ready** or **Scheduled** before expecting WorkDrive sync
- **Do not** run `vercel --prod` without explicit owner OK
- Marketing CTAs: Talk to a Clinician / Book ADHD Evaluation / Health Guides — not Meet & Greet
- Website work: always `git pull --ff-only origin main` first; run `npm run sync:live` in `apps/siya-health` before merge. See `docs/LIVE-SYNC-AND-DEPLOY.md`.

## Website deploy (separate)

Production = **`main`** → Vercel. Fuse does **not** deploy the website.

**Owner Mac:** never merge stale local website branches “preferring ours” over `origin/main`. Rebase onto latest `main` and resolve file-by-file. Messy rollbacks happen when old branches overwrite cloud-agent commits and Vercel auto-deploys.
