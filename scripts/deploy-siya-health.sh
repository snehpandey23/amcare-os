#!/usr/bin/env bash
# Patient site (siya-health) deploy — production or gated preview.
# Git auto-deploy does not promote this project. CLI uploads the working tree,
# not git HEAD. If apps/siya-health is dirty, this refuses to deploy.
#
# Policy: commit the patient-site files before this script runs, then push.
# A dirty-tree deploy is not allowed.
#
# DEPLOY HYGIENE (2026-10-07):
#   - Intermediate checks = local generate + contact sheets + QA gates.
#     Do NOT burn Vercel preview deploys for every polish iteration.
#   - Preview (`--preview`) only when the founder asks for a review link,
#     or immediately before a prod promote (PREVIEW_REASON=review-link|pre-prod).
#   - Production requires `--prod` + SIYA_HEALTH_RELEASE_BRANCH + PROMOTE_APPROVED.
# Every attempt appends to apps/siya-health/internal/demo-qa/deploy-log.md
# and refreshes the "Deploy count by day" section.

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
WANT_PREVIEW=0
for arg in "$@"; do
  case "$arg" in
    --allow-dirty)
      echo "Refusing --allow-dirty. Commit apps/siya-health, push, then deploy." >&2
      exit 1
      ;;
    --check-only) CHECK_ONLY=1 ;;
    --prod) WANT_PROD=1 ;;
    --preview) WANT_PREVIEW=1 ;;
    -h|--help)
      cat <<'EOF'
Usage: bash scripts/deploy-siya-health.sh [--check-only] [--prod] [--preview]

  Deploys the patient site (www.siya.health) from the monorepo root.

  HYGIENE: use local builds + contact sheets for intermediate checks.
  Preview deploys only when asked for a review link, or right before prod.

  --prod requires:
    - current branch == SIYA_HEALTH_RELEASE_BRANCH (default: main)
    - PROMOTE_APPROVED=<commit hash> matching HEAD

  --preview requires:
    - PREVIEW_REASON=review-link   (founder asked for a review URL)
    - or PREVIEW_REASON=pre-prod   (smoke right before --prod)

  --check-only  Print gates, refresh daily counts, no deploy.

  Log: apps/siya-health/internal/demo-qa/deploy-log.md
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
DAY_IST="$(TZ=Asia/Kolkata date '+%Y-%m-%d')"
LOG="$ROOT/apps/siya-health/internal/demo-qa/deploy-log.md"

refresh_daily_counts() {
  python3 "$ROOT/scripts/refresh-siya-health-deploy-counts.py" "$LOG"
}

log_attempt() {
  local target="$1" result="$2" note="${3:-}"
  mkdir -p "$(dirname "$LOG")"
  if [[ ! -f "$LOG" ]]; then
    refresh_daily_counts
  fi
  note="${note//|/¦}"
  printf '| %s | `%s` | `%s` | %s | %s | %s | %s |\n' \
    "$IST" "$BRANCH" "$SHORT" "$target" "$WHO" "$result" "$note" >>"$LOG"
  refresh_daily_counts
}

echo "==> Patient site deploy"
echo "    branch: $BRANCH (release branch: $RELEASE_BRANCH)"
echo "    commit: $SHA"
echo "    $SUBJECT"
echo "    hygiene: local checks preferred; preview only review-link|pre-prod"
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

if [[ "$WANT_PROD" -eq 1 && "$WANT_PREVIEW" -eq 1 ]]; then
  echo "REFUSING: pass either --prod or --preview, not both." >&2
  log_attempt "blocked" "REFUSED" "prod+preview"
  exit 1
fi

if [[ "$WANT_PROD" -eq 1 ]]; then
  if [[ "$BRANCH" != "$RELEASE_BRANCH" ]]; then
    echo "REFUSING --prod: branch '$BRANCH' is not the release branch '$RELEASE_BRANCH'." >&2
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

if [[ "$WANT_PREVIEW" -eq 1 ]]; then
  case "${PREVIEW_REASON:-}" in
    review-link|pre-prod) ;;
    *)
      echo "REFUSING --preview: set PREVIEW_REASON=review-link or PREVIEW_REASON=pre-prod." >&2
      echo "Intermediate checks must use local builds + contact sheets." >&2
      log_attempt "preview" "REFUSED" "missing PREVIEW_REASON"
      exit 1
      ;;
  esac
fi

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  if [[ "$WANT_PROD" -eq 1 ]]; then
    echo "Check only. Prod gates passed. No deploy."
    log_attempt "production" "CHECK_ONLY" "gates ok"
  elif [[ "$WANT_PREVIEW" -eq 1 ]]; then
    echo "Check only. Preview reason=${PREVIEW_REASON}. No deploy."
    log_attempt "preview" "CHECK_ONLY" "reason=${PREVIEW_REASON}"
  else
    echo "Check only. No deploy. (Pass --prod or --preview.)"
    log_attempt "check" "CHECK_ONLY" "no target"
  fi
  exit 0
fi

if [[ "$WANT_PROD" -ne 1 && "$WANT_PREVIEW" -ne 1 ]]; then
  echo "REFUSING: pass --prod (promote) or --preview (review-link|pre-prod only)." >&2
  echo "For intermediate checks: local generate + contact-sheet — not Vercel." >&2
  log_attempt "unspecified" "REFUSED" "missing --prod/--preview"
  exit 1
fi

run_prod_gates() {
  echo "==> no-scroll + visible-top gate"
  if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/no-scroll-gate.mjs); then
    echo "REFUSING: no-scroll-visible-top gate failed." >&2
    return 1
  fi
  echo "==> readable-text gate"
  if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/readable-text-gate.mjs); then
    echo "REFUSING: readable-text gate failed." >&2
    return 1
  fi
  echo "==> pause-freeze gate"
  if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/pause-freeze-gate.mjs); then
    echo "REFUSING: pause-freeze gate failed." >&2
    return 1
  fi
  echo "==> collision gate"
  if ! (cd "$ROOT/apps/siya-health" && node internal/demo-qa/collision-check.mjs journey f-time-a f-time-b f-response f-urgent f-time p-response cost privacy p-familiar f-ways outcomes e1-time e2-focus e3-outcomes e4-simple); then
    echo "REFUSING: collision gate failed." >&2
    return 1
  fi
  return 0
}

if [[ "$WANT_PROD" -eq 1 ]]; then
  if ! run_prod_gates; then
    log_attempt "production" "REFUSED" "gate failed"
    exit 1
  fi
  log_attempt "production" "STARTED" "$SUBJECT"
  if ! npx vercel deploy --prod --yes; then
    log_attempt "production" "REFUSED" "vercel deploy failed (check quota)"
    exit 1
  fi
  npx vercel cache purge --type cdn --yes || true
  log_attempt "production" "OK" "$SUBJECT · day=$DAY_IST"
  exit 0
fi

# Preview path
log_attempt "preview" "STARTED" "reason=${PREVIEW_REASON} · $SUBJECT"
if ! npx vercel deploy --yes; then
  log_attempt "preview" "REFUSED" "vercel deploy failed (check quota) · reason=${PREVIEW_REASON}"
  exit 1
fi
log_attempt "preview" "OK" "reason=${PREVIEW_REASON} · day=$DAY_IST"
