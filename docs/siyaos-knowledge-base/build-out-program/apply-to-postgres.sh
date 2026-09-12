#!/usr/bin/env bash
# Apply Build-Out tracker schema + seed to Postgres when DATABASE_URL is available.
# Usage:
#   DATABASE_URL='postgresql://...' bash docs/siyaos-knowledge-base/build-out-program/apply-to-postgres.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SCHEMA="$ROOT/integrations/hipaa-training-api/src/database/build-out-tracker-schema.sql"
SEED="$(cd "$(dirname "$0")" && pwd)/build-out-tracker-seed.sql"
: "${DATABASE_URL:?Set DATABASE_URL to a real Postgres URL (Vercel secrets are not pullable as [SENSITIVE])}"
if [[ "$DATABASE_URL" == *"[SENSITIVE]"* ]] || [[ "$DATABASE_URL" == "["* ]]; then
  echo "DATABASE_URL looks like a placeholder; aborting." >&2
  exit 1
fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SEED"
echo "Applied siya_build_out_tracker_items schema + seed."
