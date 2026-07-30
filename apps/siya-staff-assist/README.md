# Siya Staff Assist — Vercel deploy entry

**Staff internal helpdesk** (same app as `apps/hipaa-training`). This folder exists only so Vercel gets a **clean project name** and URL — no GoDaddy.

**Target URL:** https://siya-staff-assist.vercel.app

## Why not `siya-assistant.vercel.app`?

That `.vercel.app` name is **already taken globally** on Vercel (another account). A fresh project cannot claim it.

## First-time setup (once)

From **repo root**:

```bash
cd /path/to/amcare-os
npx vercel link --project siya-staff-assist --yes
# If prompted to create the project, confirm name: siya-staff-assist

npx vercel deploy --prod --yes --local-config vercel.siya-staff-assist.json
```

Set on the **siya-staff-assist** project (Vercel → Settings → General):

- **Root Directory:** `.` (repository root — required for monorepo install + KB build)

## Ongoing deploys

Git connect **main** to project **siya-staff-assist** with Root Directory = repo root and use `apps/siya-staff-assist/vercel.json` settings, **or** run the deploy command above after merges.

## App code

Edit `apps/hipaa-training` only. Do not duplicate the Next app here.
