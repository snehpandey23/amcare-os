#!/usr/bin/env bash
# Local TEST suite for Phase-3 WorkDrive sync (FS transport → _API-DRY-RUN only).
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$REPO_ROOT"

DRY="${WORKDRIVE_DRYRUN_FS_ROOT:-$HOME/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/_API-DRY-RUN}"
export WORKDRIVE_DRYRUN_FS_ROOT="$DRY"
SCRIPT="apps/siya-health/brand/scripts/workdrive_phase3_sync.py"
CFG="apps/siya-health/brand/scripts/workdrive_sync_config.test.json"
GOOD_ID="TEST-2026-08-24-phase3-dryrun"
BAD_ID="TEST-2026-08-24-phase3-broken"
PACK="apps/siya-health/brand/editorial-packs/$GOOD_ID"
BAD_PACK="apps/siya-health/brand/editorial-packs/$BAD_ID"
TRACKER="apps/siya-health/brand/04-Content-Tracker/CLOUD-PACK-TRACKER.csv"
REPORT="$REPO_ROOT/tmp/workdrive-phase3-test-report.txt"
mkdir -p tmp "$DRY/04-Content-Tracker" "$DRY/05-Carousels" "$DRY/06-Statics" "$DRY/07-Video-Prompts"

# Reset dry-run destinations for these test IDs
rm -rf "$DRY/05-Carousels/$GOOD_ID" "$DRY/05-Carousels/$BAD_ID"
rm -f "$DRY/07-Video-Prompts/${GOOD_ID}-video-prompt.md" "$DRY/07-Video-Prompts/${BAD_ID}-video-prompt.md"

# Backup tracker
cp "$TRACKER" "$TRACKER.bak-phase3test"

cleanup() {
  rm -rf "$PACK" "$BAD_PACK"
  mv "$TRACKER.bak-phase3test" "$TRACKER"
}
trap cleanup EXIT

{
  echo "=== Phase-3 WorkDrive TEST report ==="
  echo "FS root: $DRY"
  echo ""

  # --- Build good fake pack ---
  mkdir -p "$PACK/ready-to-post" "$PACK/captions" "$PACK/source-photos"
  printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' | base64 -d > "$PACK/ready-to-post/01-hook.png"
  cat > "$PACK/SHIP.md" <<EOF
---
phase: 3
status: approved
insight_id: $GOOD_ID
kind: carousel
---
TEST pack — delete after dry-run.
EOF
  cat > "$PACK/captions/instagram.md" <<'EOF'
Test caption for Phase-3 dry-run. Educational only.
EOF
  cp "$PACK/captions/instagram.md" "$PACK/captions/ALL-PLATFORMS.md"
  echo "# video prompt test" > "$PACK/video-prompt.md"

  # Tracker row
  if ! grep -q "^$GOOD_ID," "$TRACKER"; then
    echo "$GOOD_ID,https://siya.health/answers/adhd-vs-burnout,TEST dry-run hook,Carousel,Approved / Ready to post,1,yes,yes,Test,2026-08-24,2026-08-24,TEST — do not count" >> "$TRACKER"
  fi

  echo "--- TEST 1: good pack sync ---"
  python3 "$SCRIPT" --config "$CFG" --assume-main --transport fs --insight-id "$GOOD_ID"
  DEST="$DRY/05-Carousels/$GOOD_ID"
  if [[ ! -f "$DEST/SHIP.md" || ! -f "$DEST/ready-to-post/01-hook.png" || ! -f "$DEST/captions/instagram.md" ]]; then
    echo "FAIL TEST 1: expected files missing under $DEST"
    ls -laR "$DEST" || true
    exit 1
  fi
  if [[ ! -f "$DRY/04-Content-Tracker/CLOUD-PACK-TRACKER.csv" ]]; then
    echo "FAIL TEST 1: tracker CSV not synced"
    exit 1
  fi
  if [[ ! -f "$DRY/07-Video-Prompts/${GOOD_ID}-video-prompt.md" ]]; then
    echo "FAIL TEST 1: video prompt not mirrored to 07"
    exit 1
  fi
  COUNT1=$(find "$DEST" -type f | wc -l | tr -d ' ')
  echo "PASS TEST 1: landed in _API-DRY-RUN/05-Carousels/$GOOD_ID ($COUNT1 files) + tracker + 07"

  echo ""
  echo "--- TEST 2: idempotent re-run (no duplicate trees) ---"
  python3 "$SCRIPT" --config "$CFG" --assume-main --transport fs --insight-id "$GOOD_ID"
  COUNT2=$(find "$DEST" -type f | wc -l | tr -d ' ')
  # Should be exactly one pack folder, same file count (replace, not duplicate-sibling)
  SIBLINGS=$(find "$DRY/05-Carousels" -maxdepth 1 -type d -name "${GOOD_ID}*" | wc -l | tr -d ' ')
  if [[ "$COUNT1" != "$COUNT2" ]]; then
    echo "FAIL TEST 2: file count changed $COUNT1 -> $COUNT2"
    exit 1
  fi
  if [[ "$SIBLINGS" != "1" ]]; then
    echo "FAIL TEST 2: expected 1 pack folder, found $SIBLINGS"
    find "$DRY/05-Carousels" -maxdepth 1 -type d -name "${GOOD_ID}*"
    exit 1
  fi
  echo "PASS TEST 2: re-run replaced in place (files=$COUNT2, siblings=$SIBLINGS)"

  echo ""
  echo "--- TEST 3: broken pack (no captions) uploads nothing ---"
  mkdir -p "$BAD_PACK/ready-to-post"
  printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' | base64 -d > "$BAD_PACK/ready-to-post/01-hook.png"
  cat > "$BAD_PACK/SHIP.md" <<EOF
---
phase: 3
status: approved
insight_id: $BAD_ID
kind: carousel
---
Broken — missing captions.
EOF
  if ! grep -q "^$BAD_ID," "$TRACKER"; then
    echo "$BAD_ID,https://siya.health/test,BROKEN,Carousel,Approved / Ready to post,1,no,no,Test,2026-08-24,2026-08-24,TEST broken" >> "$TRACKER"
  fi
  # Snapshot dry-run before
  BEFORE=$(find "$DRY" -type f | sort | cksum | awk '{print $1}')
  python3 "$SCRIPT" --config "$CFG" --assume-main --transport fs --insight-id "$BAD_ID" | tee /tmp/phase3-broken-out.txt
  if ! grep -q "SKIP: missing captions" /tmp/phase3-broken-out.txt; then
    echo "FAIL TEST 3: expected captions skip log"
    exit 1
  fi
  if [[ -d "$DRY/05-Carousels/$BAD_ID" ]]; then
    echo "FAIL TEST 3: broken pack was uploaded"
    exit 1
  fi
  AFTER=$(find "$DRY" -type f | sort | cksum | awk '{print $1}')
  # Tracker may still have been written only on successful sync — broken should not touch dest
  if [[ "$BEFORE" != "$AFTER" ]]; then
    echo "FAIL TEST 3: dry-run tree changed on broken pack"
    exit 1
  fi
  echo "PASS TEST 3: broken pack skipped; nothing uploaded"

  echo ""
  echo "--- TEST 4: non-main branch skips ---"
  python3 "$SCRIPT" --config "$CFG" --branch feature/x --transport fs --insight-id "$GOOD_ID" | tee /tmp/phase3-branch-out.txt
  if ! grep -q "SKIP: branch" /tmp/phase3-branch-out.txt; then
    echo "FAIL TEST 4: expected branch skip"
    exit 1
  fi
  echo "PASS TEST 4: non-main skipped"

  echo ""
  echo "ALL TESTS PASSED (FS → _API-DRY-RUN only; live 04/05/06/07 untouched)"
} | tee "$REPORT"

echo "Report: $REPORT"
