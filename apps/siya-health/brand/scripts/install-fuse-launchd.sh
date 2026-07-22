#!/usr/bin/env bash
# Install 4-hour WorkDrive fuse launchd job (Mac must stay on + TrueSync logged in).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
PLIST_SRC="$SCRIPT_DIR/com.siya.eod-fuse.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.siya.eod-fuse.plist"
LOG_DIR="$REPO_ROOT/apps/siya-health/brand/04-Content-Tracker/fuse-logs"
FUSE_SCRIPT="$REPO_ROOT/apps/siya-health/brand/scripts/eod-fuse-to-truesync.sh"

mkdir -p "$LOG_DIR"
chmod +x "$FUSE_SCRIPT"

sed -e "s|__REPO_ROOT__|$REPO_ROOT|g" \
    -e "s|__FUSE_SCRIPT__|$FUSE_SCRIPT|g" \
    -e "s|__LOG_DIR__|$LOG_DIR|g" \
    "$PLIST_SRC" > "$PLIST_DEST"

launchctl bootout "gui/$(id -u)/com.siya.eod-fuse" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST"
launchctl enable "gui/$(id -u)/com.siya.eod-fuse"
launchctl kickstart -k "gui/$(id -u)/com.siya.eod-fuse"

echo "Installed: $PLIST_DEST"
echo "Runs every 4 hours + once at load. Logs: $LOG_DIR/launchd-*.log"
