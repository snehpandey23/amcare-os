#!/usr/bin/env bash
# Vercel Ignored Build Step — siya-staff-assist
# Exit 0 = SKIP deploy · Exit 1 = BUILD
#
# Staff portal production is CLI-only (scripts/deploy-staff-portal.sh).
# Git pushes must never promote staff prod — uncommitted local work caused regressions.

set -euo pipefail

if [[ "${VERCEL_GIT_COMMIT_SHA:-}" != "" ]]; then
  echo "SKIP: siya-staff-assist git/cloud deploy disabled — run: bash scripts/deploy-staff-portal.sh"
  exit 0
fi

echo "BUILD: CLI deploy (no Vercel git context)."
exit 1
