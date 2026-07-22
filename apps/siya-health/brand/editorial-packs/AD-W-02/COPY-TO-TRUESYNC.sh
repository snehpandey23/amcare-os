#!/usr/bin/env bash
# Run on the Mac that has TrueSync mounted.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/06-Statics/AD-W-02"
TRACKER_DIR="${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/04-Content-Tracker"
mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
echo "Copied AD-W-02 → $DEST"
echo "Still required: add/update row AD-W-02 in $TRACKER_DIR/Siya-Content-Tracker.xlsx"
open "$DEST" 2>/dev/null || true
