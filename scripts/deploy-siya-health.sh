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
#   - Production (`--prod`) uploads with `--skip-domain`. It does not assign
#     www.siya.health. Allowed branches: main, integration/*.
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

  --prod stages a production deployment with --skip-domain.
  It does not assign www.siya.health.
  Branch must be main or integration/*.
  Demo and video agents must not run a bare `vercel deploy --prod`.

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

# Repo-root .vercel/project.json points at siya-staff-assist. Always target siya-health.
export VERCEL_ORG_ID=team_7dvS6pa19W0oVxblge8o52QL
export VERCEL_PROJECT_ID=prj_d44fdj7C0X9ivPrLVqIHOiNvJ8Qd

PROJ_NAME="$(npx vercel api "/v9/projects/${VERCEL_PROJECT_ID}?teamId=${VERCEL_ORG_ID}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("name",""))')"
if [[ "$PROJ_NAME" != "siya-health" ]]; then
  echo "REFUSING: resolved Vercel project is '${PROJ_NAME:-unknown}', not siya-health." >&2
  echo "    org=$VERCEL_ORG_ID project=$VERCEL_PROJECT_ID" >&2
  exit 1
fi

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
echo "    branch: $BRANCH (allowed for --prod: main, integration/*)"
echo "    commit: $SHA"
echo "    $SUBJECT"
echo "    hygiene: local checks preferred; preview only review-link|pre-prod"
echo ""

DIRTY="$(git status --porcelain)"
if [[ -n "$DIRTY" ]]; then
  echo "==> Working tree is not clean (uncommitted or untracked files):" >&2
  echo "$DIRTY" >&2
  echo "" >&2
  echo "REFUSING deploy. CLI uploads the working tree, not git HEAD." >&2
  echo "Commit or remove those files before deploying." >&2
  log_attempt "blocked" "REFUSED" "dirty tree"
  exit 1
fi

if [[ "$WANT_PROD" -eq 1 && "$WANT_PREVIEW" -eq 1 ]]; then
  echo "REFUSING: pass either --prod or --preview, not both." >&2
  log_attempt "blocked" "REFUSED" "prod+preview"
  exit 1
fi

if [[ "$WANT_PROD" -eq 1 ]]; then
  case "$BRANCH" in
    main|integration/*) ;;
    *)
      echo "REFUSING --prod: branch '$BRANCH' is not main or integration/*." >&2
      echo "Demo and video agents must not run vercel deploy --prod." >&2
      log_attempt "production" "REFUSED" "branch not main or integration/*"
      exit 1
      ;;
  esac
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
  echo "REFUSING: pass --prod (stage with --skip-domain; does not assign www) or --preview." >&2
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
  # --skip-domain is required. This script must not assign www.siya.health.
  PROD_CMD=(npx vercel deploy --prod --skip-domain --yes)
  case " ${PROD_CMD[*]} " in
    *" --skip-domain "*) ;;
    *)
      echo "REFUSING: production upload is missing --skip-domain." >&2
      log_attempt "production" "REFUSED" "missing --skip-domain"
      exit 1
      ;;
  esac
  log_attempt "production" "STARTED" "$SUBJECT"
  DEPLOY_OUT="$("${PROD_CMD[@]}" 2>&1)" || {
    printf '%s\n' "$DEPLOY_OUT" >&2
    log_attempt "production" "REFUSED" "vercel deploy failed (check quota)"
    exit 1
  }
  printf '%s\n' "$DEPLOY_OUT"
  PARSED="$(printf '%s\n' "$DEPLOY_OUT" | python3 -c '
import json, sys
text = sys.stdin.read()
dec = json.JSONDecoder()
deploy_id = ""
deploy_url = ""
for i, ch in enumerate(text):
    if ch != "{":
        continue
    try:
        obj, _ = dec.raw_decode(text[i:])
    except json.JSONDecodeError:
        continue
    dep = obj.get("deployment") if isinstance(obj, dict) else None
    if isinstance(dep, dict) and str(dep.get("id", "")).startswith("dpl_"):
        deploy_id = dep.get("id") or ""
        deploy_url = dep.get("url") or ""
print(deploy_id)
print(deploy_url)
')"
  DEPLOY_ID="$(printf '%s\n' "$PARSED" | sed -n '1p')"
  DEPLOY_URL="$(printf '%s\n' "$PARSED" | sed -n '2p')"
  if [[ -z "$DEPLOY_ID" || -z "$DEPLOY_URL" ]]; then
    log_attempt "production" "REFUSED" "staged upload output had no deployment id sha=$SHA branch=$BRANCH operator=$WHO"
    echo "REFUSING to log success: deployment id or url was not in the CLI JSON." >&2
    exit 1
  fi
  # Do not record a www deployment id. This upload does not assign www.siya.health.
  log_attempt "production" "OK" "staged --skip-domain not-promoted www-unchanged sha=$SHA branch=$BRANCH operator=$WHO id=$DEPLOY_ID url=$DEPLOY_URL"
  exit 0
fi

# Preview path
log_attempt "preview" "STARTED" "reason=${PREVIEW_REASON} · $SUBJECT"
if ! npx vercel deploy --yes; then
  log_attempt "preview" "REFUSED" "vercel deploy failed (check quota) · reason=${PREVIEW_REASON}"
  exit 1
fi
log_attempt "preview" "OK" "reason=${PREVIEW_REASON} · day=$DAY_IST"
