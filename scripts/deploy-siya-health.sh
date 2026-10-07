#!/usr/bin/env bash
# Production deploy — patient site (siya-health) only.
# Git auto-deploy does not promote this project. CLI uploads the working tree,
# not git HEAD. If apps/siya-health is dirty, this refuses to deploy.
#
# Policy: commit the patient-site files before this script runs, then push.
# A dirty-tree deploy is not allowed. That gap once shipped a shorter
# /adhd-care and /telehealth than git had, and git only caught up later.
#
# Deploy from the monorepo root. The Vercel project's rootDirectory is
# apps/siya-health; running vercel inside that folder doubles the path.
#
# PROD GUARD (2026-10-06): --prod requires
#   1) branch == SIYA_HEALTH_RELEASE_BRANCH (default: main)
#   2) PROMOTE_APPROVED=<full-or-short commit hash> matching HEAD
# Every attempt (allowed or refused) appends one line to
# apps/siya-health/internal/demo-qa/deploy-log.md

set -euo pipefail
if GIT_TOP="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  ROOT="$GIT_TOP"
else
  echo "Not a git checkout. Refusing to deploy." >&2
  exit 1
fi
cd "$ROOT"

CHECK_ONLY=0
WANT_PROD=0
for arg in "$@"; do
  case "$arg" in
    --allow-dirty)
      echo "Refusing --allow-dirty. Commit apps/siya-health, push, then deploy." >&2
      exit 1
      ;;
    --check-only) CHECK_ONLY=1 ;;
    --prod) WANT_PROD=1 ;;
    -h|--help)
      cat <<'EOF'
Usage: bash scripts/deploy-siya-health.sh [--check-only] [--prod]

  Deploys the patient site (www.siya.health) from the monorepo root.

  Refuses if apps/siya-health has uncommitted or untracked files.
  Other apps (staff portal, Siya Guide) do not block this deploy.
  Commit those patient-site files and push before deploying.
  --allow-dirty is not accepted.

  --prod is required for a production deploy. It also requires:
    - current branch == SIYA_HEALTH_RELEASE_BRANCH (default: main)
    - PROMOTE_APPROVED=<commit hash> matching HEAD (full or unique short)

  --check-only  Print branch, commit, and the dirty/prod gates, then exit.
                Does not deploy.

  Every attempt is logged to apps/siya-health/internal/demo-qa/deploy-log.md
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg (try --help)" >&2
      exit 2
      ;;
  esac
done

export VERCEL_ORG_ID="${VERCEL_ORG_ID:-team_7dvS6pa19W0oVxblge8o52QL}"
export VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-prj_d44fdj7C0X9ivPrLVqIHOiNvJ8Qd}"

RELEASE_BRANCH="${SIYA_HEALTH_RELEASE_BRANCH:-main}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"
SUBJECT="$(git log -1 --pretty=%s)"
WHO="${USER:-unknown}"
IST="$(TZ=Asia/Kolkata date '+%Y-%m-%d %H:%M IST')"
LOG="$ROOT/apps/siya-health/internal/demo-qa/deploy-log.md"

log_attempt() {
  local target="$1" result="$2" note="${3:-}"
  mkdir -p "$(dirname "$LOG")"
  if [[ ! -f "$LOG" ]]; then
    cat >"$LOG" <<'HDR'
# siya-health deploy log

| Time (IST) | Branch | Hash | Target | Who | Result | Note |
|---|---|---|---|---|---|---|
HDR
  fi
  # Escape pipes in note/subject lightly
  note="${note//|/¦}"
  printf '| %s | `%s` | `%s` | %s | %s | %s | %s |\n' \
    "$IST" "$BRANCH" "$SHORT" "$target" "$WHO" "$result" "$note" >>"$LOG"
}

echo "==> Patient site deploy"
echo "    branch: $BRANCH (release branch: $RELEASE_BRANCH)"
echo "    commit: $SHA"
echo "    $SUBJECT"
echo ""

DIRTY="$(git status --porcelain -- apps/siya-health)"
if [[ -n "$DIRTY" ]]; then
  echo "==> apps/siya-health is not committed:" >&2
  echo "$DIRTY" >&2
  echo "" >&2
  echo "REFUSING deploy. Disk and git disagree for the patient site." >&2
  echo "Commit apps/siya-health and push before deploying." >&2
  log_attempt "blocked" "REFUSED" "dirty apps/siya-health"
  exit 1
fi

if [[ "$WANT_PROD" -eq 1 ]]; then
  if [[ "$BRANCH" != "$RELEASE_BRANCH" ]]; then
    echo "REFUSING --prod: branch '$BRANCH' is not the release branch '$RELEASE_BRANCH'." >&2
    echo "Set SIYA_HEALTH_RELEASE_BRANCH only if the founder renamed the release branch." >&2
    echo "Demo WIP branches must not promote the whole site." >&2
    log_attempt "production" "REFUSED" "branch!=$RELEASE_BRANCH"
    exit 1
  fi
  if [[ -z "${PROMOTE_APPROVED:-}" ]]; then
    echo "REFUSING --prod: set PROMOTE_APPROVED=<commit hash> to match HEAD ($SHORT)." >&2
    log_attempt "production" "REFUSED" "missing PROMOTE_APPROVED"
    exit 1
  fi
  APPROVED_FULL="$(git rev-parse --verify "${PROMOTE_APPROVED}^{commit}" 2>/dev/null || true)"
  if [[ -z "$APPROVED_FULL" ]]; then
    echo "REFUSING --prod: PROMOTE_APPROVED='$PROMOTE_APPROVED' is not a known commit." >&2
    log_attempt "production" "REFUSED" "bad PROMOTE_APPROVED"
    exit 1
  fi
  if [[ "$APPROVED_FULL" != "$SHA" ]]; then
    echo "REFUSING --prod: PROMOTE_APPROVED ($APPROVED_FULL) != HEAD ($SHA)." >&2
    log_attempt "production" "REFUSED" "PROMOTE_APPROVED mismatch"
    exit 1
  fi
fi

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  if [[ "$WANT_PROD" -eq 1 ]]; then
    echo "Check only. Prod gates passed. No deploy."
    log_attempt "production" "CHECK_ONLY" "gates ok"
  else
    echo "Check only. No deploy. (Pass --prod to validate promote gates.)"
    log_attempt "check" "CHECK_ONLY" "no --prod"
  fi
  exit 0
fi

if [[ "$WANT_PROD" -ne 1 ]]; then
  echo "REFUSING: production deploy requires explicit --prod plus PROMOTE_APPROVED." >&2
  echo "Preview deploys are not handled by this script." >&2
  log_attempt "unspecified" "REFUSED" "missing --prod"
  exit 1
fi

echo "==> no-scroll + visible-top gate (must pass before prod)"
if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/no-scroll-gate.mjs); then
  echo "REFUSING --prod: no-scroll-visible-top gate failed." >&2
  log_attempt "production" "REFUSED" "no-scroll-visible-top gate"
  exit 1
fi
echo "==> readable-text gate (must pass before prod)"
if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/readable-text-gate.mjs); then
  echo "REFUSING --prod: readable-text gate failed." >&2
  log_attempt "production" "REFUSED" "readable-text gate"
  exit 1
fi
echo "==> pause-freeze gate (must pass before prod)"
if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/pause-freeze-gate.mjs); then
  echo "REFUSING --prod: pause-freeze gate failed." >&2
  log_attempt "production" "REFUSED" "pause-freeze gate"
  exit 1
fi

log_attempt "production" "STARTED" "$SUBJECT"
npx vercel deploy --prod --yes
npx vercel cache purge --type cdn --yes
log_attempt "production" "OK" "$SUBJECT"
