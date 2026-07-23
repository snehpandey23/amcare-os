#!/usr/bin/env bash
set -euo pipefail
PACK="HAIR-2026-07-23-minoxidil-shed"
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/05-Carousels/${PACK}"
mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
echo "Fused → $DEST"
