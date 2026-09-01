#!/usr/bin/env bash
# Load QA/test credentials for authenticated staff-portal verifies.
# Prefers repo-root .env.agent-qa (gitignored). Falls back to env already set
# (CI: STAFF_PORTAL_QA_* / ASSIST_* secrets).
#
# Usage:
#   source scripts/agent-qa-env.sh
#   npx tsx apps/hipaa-training/scripts/verify-qa-account.ts
set -euo pipefail
# When sourced, $0 is the shell — use BASH_SOURCE so we resolve the repo root.
_AGENT_QA_SRC="${BASH_SOURCE[0]:-$0}"
ROOT="$(cd "$(dirname "$_AGENT_QA_SRC")/.." && pwd)"
unset _AGENT_QA_SRC
ENV_FILE="${AGENT_QA_ENV_FILE:-$ROOT/.env.agent-qa}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${ASSIST_EMAIL:=${STAFF_PORTAL_QA_EMAIL:-${QA_EMAIL:-}}}"
: "${ASSIST_PASSWORD:=${STAFF_PORTAL_QA_PASSWORD:-${QA_PASSWORD:-}}}"
export ASSIST_EMAIL ASSIST_PASSWORD
export STAFF_PORTAL_QA_EMAIL="${STAFF_PORTAL_QA_EMAIL:-$ASSIST_EMAIL}"
export STAFF_PORTAL_QA_PASSWORD="${STAFF_PORTAL_QA_PASSWORD:-$ASSIST_PASSWORD}"
export QA_EMAIL="${QA_EMAIL:-$ASSIST_EMAIL}"
export QA_PASSWORD="${QA_PASSWORD:-$ASSIST_PASSWORD}"
export HIPAA_TRAINING_API_URL="${HIPAA_TRAINING_API_URL:-https://siya-staff-auth-api.vercel.app}"
export STAFF_APP_URL="${STAFF_APP_URL:-https://siya-staff-assist.vercel.app}"
export QA_API_URL="${QA_API_URL:-$HIPAA_TRAINING_API_URL}"
export QA_STAFF_URL="${QA_STAFF_URL:-$STAFF_APP_URL}"

if [[ -z "${ASSIST_EMAIL:-}" || -z "${ASSIST_PASSWORD:-}" ]]; then
  echo "agent-qa-env: missing ASSIST_EMAIL/ASSIST_PASSWORD (and STAFF_PORTAL_QA_* / QA_*)." >&2
  echo "Create gitignored $ENV_FILE or set GitHub Actions secrets STAFF_PORTAL_QA_EMAIL / STAFF_PORTAL_QA_PASSWORD." >&2
  return 1 2>/dev/null || exit 1
fi

if [[ "${ASSIST_EMAIL}" != *"qa"* && "${ASSIST_EMAIL}" != *"test"* ]]; then
  echo "agent-qa-env: WARNING — email does not look like a QA/test account: ${ASSIST_EMAIL}" >&2
fi
