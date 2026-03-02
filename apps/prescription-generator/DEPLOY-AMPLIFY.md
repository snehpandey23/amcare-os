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
- This setup hosts the Next.js app without additional API services.
