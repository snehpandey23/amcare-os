#!/usr/bin/env bash
# Production deploy — patient site (siya-health) only.
# Git auto-deploy does not promote this project. CLI uploads the working tree,
# not git HEAD. If apps/siya-health is dirty, this refuses to deploy.
#
# Deploy from the monorepo root. The Vercel project's rootDirectory is
# apps/siya-health; running vercel inside that folder doubles the path.

set -euo pipefail
if GIT_TOP="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  ROOT="$GIT_TOP"
else
  echo "Not a git checkout. Refusing to deploy." >&2
  exit 1
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
Usage: bash scripts/deploy-siya-health.sh [--allow-dirty] [--check-only]

  Deploys the patient site (www.siya.health) from the monorepo root.

  Refuses if apps/siya-health has uncommitted or untracked files.
  Other apps (staff portal, Siya Guide) do not block this deploy.
  Pass --allow-dirty only to ship a dirty patient-site tree on purpose.

  --check-only  Print branch, commit, and the dirty gate, then exit.
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

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
SHA="$(git rev-parse HEAD)"
echo "==> Patient site deploy"
echo "    branch: $BRANCH"
echo "    commit: $SHA"
echo "    $(git log -1 --pretty=%s)"
echo ""

DIRTY="$(git status --porcelain -- apps/siya-health)"
if [[ -n "$DIRTY" ]]; then
  echo "==> apps/siya-health is not committed:" >&2
  echo "$DIRTY" >&2
  echo "" >&2
  if [[ "$ALLOW_DIRTY" -ne 1 ]]; then
    echo "REFUSING deploy. Disk and git disagree for the patient site." >&2
    echo "Commit apps/siya-health first, or pass --allow-dirty." >&2
    exit 1
  fi
  echo "Continuing because --allow-dirty was set." >&2
fi

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  echo "Check only. No deploy."
  exit 0
fi

npx vercel deploy --prod --yes
npx vercel cache purge --type cdn --yes
