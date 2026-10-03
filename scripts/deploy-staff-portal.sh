#!/usr/bin/env bash
# Production deploy — staff portal ONLY (auth API + staff app).
# Git/cloud auto-deploy is disabled via ignoreCommand on both Vercel projects.
# Always use this script — never rely on git push to promote staff production.
#
# Safety: Vercel CLI deploys the *working tree*, not only HEAD. Uncommitted or
# untracked files from other agent sessions can ship accidentally. This script
# refuses a dirty tree unless --allow-dirty is passed deliberately.
#
# Multi-agent convention (process, not enforced here):
#   work on agent/<task-name> branches — not directly on main — and merge only
#   after that piece is reviewed. Isolation + this dirty check make overlap safer
#   than relying on agents to coordinate with each other.

set -euo pipefail
SCRIPT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Prefer the caller's git toplevel (supports clean worktrees) over the script path,
# so `cd other-worktree && bash /path/to/deploy-staff-portal.sh` checks *that* tree.
if GIT_TOP="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  ROOT="$GIT_TOP"
else
  ROOT="$SCRIPT_ROOT"
fi
cd "$ROOT"

ALLOW_DIRTY=0
CHECK_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --allow-dirty) ALLOW_DIRTY=1 ;;
    --check-only) CHECK_ONLY=1 ;;
    -h|--help)
      cat <<'EOF'
Usage: bash scripts/deploy-staff-portal.sh [--allow-dirty] [--check-only]

  Deploys siya-staff-auth-api then siya-staff-assist to production.

  Refuses to run if git status shows uncommitted or untracked files.
  Pass --allow-dirty only when you intentionally want to ship the dirty tree
  (prints the dirty listing first; still requires you to pass the flag).

  --check-only  Print identity + dirty gate, then exit (no Vercel deploy).
                Useful to verify the safety check without promoting.

  Always prints branch + commit SHA before any vercel deploy step.
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg (try --help)" >&2
      exit 2
      ;;
  esac
done

# Explicit scope — default team id in CLI config can 401 without this.
SCOPE="${VERCEL_SCOPE:-snehpandey23s-projects}"

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
SHORT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
SUBJECT="$(git log -1 --pretty=%s 2>/dev/null || echo 'no commit message')"

echo "==> Deploy identity"
echo "    branch:  $BRANCH"
echo "    commit:  ${SHA} (${SHORT_SHA})"
echo "    subject: $SUBJECT"
echo "    scope:   $SCOPE"
echo ""

DIRTY="$(git status --porcelain 2>/dev/null || true)"
if [[ -n "$DIRTY" ]]; then
  echo "==> DIRTY WORKING TREE — uncommitted / untracked files:" >&2
  echo "$DIRTY" >&2
  echo "" >&2
  if [[ "$ALLOW_DIRTY" -ne 1 ]]; then
    echo "REFUSING deploy. Vercel CLI uploads the working tree; dirty files can ship by accident." >&2
    echo "Commit/stash/clean first, or re-run with --allow-dirty if you intentionally want this tree." >&2
    exit 1
  fi
  echo "==> --allow-dirty set — proceeding with the dirty tree above (intentional override)."
  echo ""
else
  echo "==> Working tree clean (git status --porcelain empty)."
  echo ""
fi

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  echo "==> --check-only: gate passed; skipping Vercel deploy."
  exit 0
fi

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
echo "Deployed from branch=$BRANCH commit=$SHORT_SHA"
