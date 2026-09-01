# Deploy Prescription Generator (Vercel)

**Project:** `amcare-os-prescription-generator`  
**Production URL:** https://amcare-os-prescription-generator.vercel.app  
**Also:** https://amcare-os-prescription-generator-snehpandey23s-projects.vercel.app

Deploy from the app directory (project Root Directory is empty so the path is not doubled):

```bash
# 1) Auth API first (clinic-profile routes + table)
cd integrations/hipaa-training-api && npx vercel deploy --prod --yes

# 2) Prescription app
cd apps/prescription-generator
npx vercel deploy --prod --yes --scope snehpandey23s-projects
```

Do **not** set Vercel Root Directory to `apps/prescription-generator` if you deploy from that folder via CLI — it doubles the path. For git-connected monorepo builds, either leave Root Directory empty and use this app’s `vercel.json`, or deploy from repo root with Root Directory set (not both).

## Auth / CORS

The app rewrites `/api/staff-auth/*` → the staff auth API (same pattern as staff portal), so browser calls are same-origin and usually do not need CORS.

If you call the auth API directly from the browser, add the Rx origin to auth API `CORS_ORIGIN`:

```text
https://amcare-os-prescription-generator-snehpandey23s-projects.vercel.app
```

## Notes

- Amplify notes (`DEPLOY-AMPLIFY.md`, `amplify.yml`) are legacy — **Vercel is the production host**.
- Clinic profiles live in Postgres via `siya-staff-auth-api` (`prescription_clinic_profiles`).
