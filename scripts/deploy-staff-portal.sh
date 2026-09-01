#!/usr/bin/env bash
# Production deploy — staff portal ONLY (auth API + staff app).
# Git/cloud auto-deploy is disabled via ignoreCommand on both Vercel projects.
# Always use this script — never rely on git push to promote staff production.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Explicit scope — default team id in CLI config can 401 without this.
SCOPE="${VERCEL_SCOPE:-snehpandey23s-projects}"

echo "==> Auth API (siya-staff-auth-api) scope=$SCOPE"
cd integrations/hipaa-training-api
npx vercel deploy --prod --yes --scope "$SCOPE"
cd "$ROOT"

echo "==> Staff app (siya-staff-assist) scope=$SCOPE"
# Crons only register reliably from root vercel.json (not --local-config alternate
# filenames — those upload build settings but leave project.crons.definitions empty).
# Keep vercel.siya-staff-assist.json as the source of truth, sync into vercel.json.
cp "$ROOT/vercel.siya-staff-assist.json" "$ROOT/vercel.json"
npx vercel deploy --prod --yes --project siya-staff-assist --scope "$SCOPE"

echo "==> Smoke"
curl -sfS https://siya-staff-auth-api.vercel.app/api/health | head -c 200
echo ""
echo "Done. Staff: https://siya-staff-assist.vercel.app"
