#!/usr/bin/env bash
# Vercel Ignored Build Step — siya-health (patient site)
# Exit 0 = SKIP · Exit 1 = BUILD

set -euo pipefail

PATHS=(apps/siya-health)

if [[ "${VERCEL_GIT_COMMIT_SHA:-}" == "" ]]; then
  echo "No Vercel git context — allow build."
  exit 1
fi

if [[ "${VERCEL_GIT_COMMIT_REF:-}" != "main" && "${VERCEL_GIT_COMMIT_REF:-}" != "master" ]]; then
  exit 1
fi

if ! git rev-parse HEAD^ >/dev/null 2>&1; then
  exit 1
fi

if git diff --quiet HEAD^ HEAD -- "${PATHS[@]}"; then
  echo "SKIP: no siya-health changes in ${VERCEL_GIT_COMMIT_SHA:0:7}."
  exit 0
fi

echo "BUILD: siya-health changed."
exit 1
