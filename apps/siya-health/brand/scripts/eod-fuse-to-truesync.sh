#!/usr/bin/env bash
# EOD fuse — git editorial packs → Zoho WorkDrive TrueSync (Knowledge Editorial)
# Run on Mac only. Cloud agents cannot access TrueSync.
#
# Usage:
#   bash apps/siya-health/brand/scripts/eod-fuse-to-truesync.sh
#   bash .../eod-fuse-to-truesync.sh --ids AD-I-01,WH-R-02
#   FUSE_GIT_BRANCH=main bash .../eod-fuse-to-truesync.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAND_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$BRAND_ROOT/../../.." && pwd)"
WORKDRIVE="${SIYA_WORKDRIVE_ROOT:-$HOME/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial}"
GIT_BRANCH="${FUSE_GIT_BRANCH:-main}"
TRACKER_CSV="$BRAND_ROOT/04-Content-Tracker/Siya-Content-Tracker-Posts.csv"
LOG_DIR="$BRAND_ROOT/04-Content-Tracker/fuse-logs"
STAMP="$(date +%Y-%m-%d_%H%M)"
EXTRA_IDS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ids) EXTRA_IDS="${2:-}"; shift 2 ;;
    --no-pull) SKIP_PULL=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$LOG_DIR"
REPORT="$LOG_DIR/fuse-$STAMP.txt"
SYNCED=() SKIPPED=() CONFLICTS=()

log() { echo "$*" | tee -a "$REPORT"; }

if [[ ! -d "$WORKDRIVE" ]]; then
  log "ERROR: WorkDrive path missing (TrueSync offline?):"
  log "  $WORKDRIVE"
  exit 1
fi

cd "$REPO_ROOT"
if [[ "${SKIP_PULL:-0}" != 1 ]]; then
  log "Git fetch + checkout $GIT_BRANCH"
  git fetch origin "$GIT_BRANCH" 2>&1 | tee -a "$REPORT" || true
  git checkout "$GIT_BRANCH" 2>&1 | tee -a "$REPORT" || true
  git pull --ff-only origin "$GIT_BRANCH" 2>&1 | tee -a "$REPORT" || {
    log "WARN: git pull failed — fusing current checkout"
  }
fi

mkdir -p "$WORKDRIVE/04-Content-Tracker" "$WORKDRIVE/05-Carousels" "$WORKDRIVE/06-Statics"

# Tracker → WorkDrive (CSV is source in git; xlsx merge is manual)
if [[ -f "$TRACKER_CSV" ]]; then
  cp "$TRACKER_CSV" "$WORKDRIVE/04-Content-Tracker/Siya-Content-Tracker-Posts.csv"
  log "Tracker CSV synced → 04-Content-Tracker/"
else
  log "WARN: No tracker CSV at $TRACKER_CSV"
fi

# Ready / Scheduled Insight IDs from tracker (column 1 = Insight ID, column 5 = Status)
READY_IDS=""
if [[ -f "$TRACKER_CSV" ]]; then
  READY_IDS="$(awk -F',' 'NR>1 {
    gsub(/^"|"$/, "", $1); gsub(/^"|"$/, "", $5);
    id=$1; st=$5;
    if (st ~ /^(Ready|Scheduled)$/) print id
  }' "$TRACKER_CSV" | sort -u | tr '\n' ' ')"
fi

if [[ -n "$EXTRA_IDS" ]]; then
  READY_IDS="$READY_IDS ${EXTRA_IDS//,/ }"
fi

# Deduplicate IDs
mapfile -t ID_LIST < <(echo "$READY_IDS" | tr ' ' '\n' | grep -E '^[A-Z0-9-]+$' | sort -u)

if [[ ${#ID_LIST[@]} -eq 0 ]]; then
  log "No Ready/Scheduled Insight IDs — syncing tracker only."
fi

rsync_pack() {
  local src="$1" dest="$2" label="$3"
  if [[ ! -d "$src" ]]; then
    return 1
  fi
  mkdir -p "$(dirname "$dest")"
  if rsync -a --delete "$src/" "$dest/" 2>>"$REPORT"; then
    SYNCED+=("$label")
    log "  OK $label"
    return 0
  fi
  CONFLICTS+=("$label")
  log "  FAIL $label"
  return 1
}

for id in "${ID_LIST[@]}"; do
  [[ -z "$id" || "$id" == "BRAND" ]] && continue

  pack="$BRAND_ROOT/editorial-packs/$id"
  static="$BRAND_ROOT/06-Statics/$id"

  if [[ -d "$pack" ]]; then
    log "Fuse carousel pack: $id"
    rsync_pack "$pack" "$WORKDRIVE/05-Carousels/$id" "05-Carousels/$id" || SKIPPED+=("$id (pack rsync)")
  else
    SKIPPED+=("$id (no editorial-packs/$id)")
    log "  skip $id — no editorial-packs/$id"
  fi

  if [[ -d "$static" ]]; then
    log "Fuse static: $id"
    rsync_pack "$static" "$WORKDRIVE/06-Statics/$id" "06-Statics/$id" || true
  fi
done

# BRAND rows → 06-Statics/LinkedIn-Dr-Sneh etc. (folder path in CSV; optional manual)
if [[ -d "$BRAND_ROOT/06-Statics" ]]; then
  for sub in "$BRAND_ROOT/06-Statics"/*; do
    [[ -d "$sub" ]] || continue
    base="$(basename "$sub")"
    rsync_pack "$sub" "$WORKDRIVE/06-Statics/$base" "06-Statics/$base" || true
  done
fi

log ""
log "=== Fuse report $STAMP ==="
log "Branch: $(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo '?')"
log "WorkDrive: $WORKDRIVE"
log "Synced (${#SYNCED[@]}): ${SYNCED[*]:-none}"
log "Skipped (${#SKIPPED[@]}): ${SKIPPED[*]:-none}"
log "Conflicts (${#CONFLICTS[@]}): ${CONFLICTS[*]:-none}"
log "Report: $REPORT"
log "Note: merge CSV rows into Siya-Content-Tracker.xlsx manually if needed."
