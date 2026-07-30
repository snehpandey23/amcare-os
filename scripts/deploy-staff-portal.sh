#!/usr/bin/env bash
# Production deploy — staff portal ONLY (auth API + staff app).
# Git/cloud auto-deploy is disabled via ignoreCommand on both Vercel projects.
# Always use this script — never rely on git push to promote staff production.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Auth API (siya-staff-auth-api)"
cd integrations/hipaa-training-api
npx vercel deploy --prod --yes
cd "$ROOT"

echo "==> Staff app (siya-staff-assist)"
npx vercel deploy --prod --yes --project siya-staff-assist --local-config vercel.siya-staff-assist.json

echo "==> Smoke"
curl -sfS https://siya-staff-auth-api.vercel.app/api/health | head -c 200
echo ""
echo "Done. Staff: https://siya-staff-assist.vercel.app"
