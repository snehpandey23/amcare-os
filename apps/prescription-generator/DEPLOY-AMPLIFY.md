# Deploy to AWS Amplify (Prescription Generator)

## One-time setup
1. Open AWS Amplify Console and click **New app → Host web app**.
2. Connect this repository.
3. When prompted for a build spec, choose **Custom build image** and set the build spec file to:
   `amplify.prescription-generator.yml`

## Build settings
- **Node version**: use Node 18+ (default is fine).
- **App root**: keep repo root (build spec uses npm workspace).

## Deploy
1. Save and deploy.
2. Amplify will generate a hosted URL for the app.

## Notes
- Build output is `apps/prescription-generator/.next`.
- Auth and clinic profiles use the **staff auth API** (`siya-staff-auth-api`). Set Amplify env:
  - `NEXT_PUBLIC_HIPAA_TRAINING_API_URL=https://siya-staff-auth-api.vercel.app`
- Next.js rewrites `/api/staff-auth/*` → that API (same pattern as the staff portal).
- Redeploy the auth API after this feature ships so `GET/PUT /api/clinic-profile` exists:
  `bash scripts/deploy-staff-portal.sh` (or API-only from `integrations/hipaa-training-api`).
- If you call the API cross-origin without the rewrite, add the Amplify host to `CORS_ORIGIN` on the auth API.
