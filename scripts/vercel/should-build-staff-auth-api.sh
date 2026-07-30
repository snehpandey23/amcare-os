#!/usr/bin/env bash
# Vercel Ignored Build Step — siya-staff-auth-api
# Exit 0 = SKIP deploy · Exit 1 = BUILD
#
# Auth API production is CLI-only (scripts/deploy-staff-portal.sh).

set -euo pipefail

if [[ "${VERCEL_GIT_COMMIT_SHA:-}" != "" ]]; then
  echo "SKIP: siya-staff-auth-api git/cloud deploy disabled — run: bash scripts/deploy-staff-portal.sh"
  exit 0
fi

echo "BUILD: CLI deploy (no Vercel git context)."
exit 1
