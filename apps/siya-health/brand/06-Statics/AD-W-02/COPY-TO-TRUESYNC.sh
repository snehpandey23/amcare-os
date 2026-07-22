#!/usr/bin/env bash
# Copy AD-W-02 into live Zoho TrueSync Knowledge Editorial.
# MUST run on the Mac where TrueSync is signed into Amcare.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
WD_ROOT="${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial"
DEST="${WD_ROOT}/06-Statics/AD-W-02"
TRACKER_DIR="${WD_ROOT}/04-Content-Tracker"
REPO_TRACKER="$(cd "$SRC/../../04-Content-Tracker" 2>/dev/null && pwd)/Siya-Content-Tracker.csv"

if [[ ! -d "${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd" ]]; then
  echo "ERROR: TrueSync folder not found."
  echo "Expected: ~/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd"
  echo "Open Zoho WorkDrive TrueSync, sign into Amcare, then re-run."
  exit 1
fi

if [[ ! -d "$WD_ROOT" ]]; then
  echo "ERROR: Knowledge Editorial folder missing at:"
  echo "  $WD_ROOT"
  exit 1
fi

mkdir -p "$DEST" "$TRACKER_DIR"
# Do not --delete captions/xlsx accidentally; sync pack contents
rsync -a \
  --exclude 'COPY-TO-TRUESYNC.sh' \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST/"

if [[ -f "$REPO_TRACKER" ]]; then
  cp -f "$REPO_TRACKER" "$TRACKER_DIR/Siya-Content-Tracker.csv"
  echo "Synced tracker CSV → $TRACKER_DIR/Siya-Content-Tracker.csv"
  echo "If the team uses .xlsx, merge row AD-W-02 into Siya-Content-Tracker.xlsx as well."
fi

echo "OK: AD-W-02 → $DEST"
open "$DEST" 2>/dev/null || true
