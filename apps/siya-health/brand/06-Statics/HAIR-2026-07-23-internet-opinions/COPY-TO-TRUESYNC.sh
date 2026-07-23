#!/usr/bin/env bash
# Run on Mac after pull — fuses this pack into TrueSync Knowledge Editorial
set -euo pipefail
PACK="HAIR-2026-07-23-internet-opinions"
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/06-Statics/${PACK}"
mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
echo "Fused → $DEST"
