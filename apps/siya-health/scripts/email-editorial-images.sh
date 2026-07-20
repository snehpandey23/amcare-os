#!/usr/bin/env bash
# Stage Editorial Pack images to Desktop and open a Mail draft with attachments.
# Usage:
#   ./scripts/email-editorial-images.sh WH-R-02
#   ./scripts/email-editorial-images.sh WH-R-02 you@example.com
set -euo pipefail

ID="${1:-}"
TO="${2:-care@siya.health}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACK="$ROOT/brand/editorial-packs/$ID/images"

if [[ -z "$ID" ]]; then
  echo "Usage: $0 <Insight-ID> [email]"
  echo "Example: $0 WH-R-02 design@siya.health"
  exit 1
fi

if [[ ! -d "$PACK" ]]; then
  echo "No images folder at: $PACK"
  exit 1
fi

STAGE="$HOME/Desktop/Siya-${ID}-carousel"
mkdir -p "$STAGE"
cp -f "$PACK"/* "$STAGE/" 2>/dev/null || true
open "$STAGE"
open "$PACK"

SUBJECT="Siya Editorial Pack ${ID} — carousel images"
BODY="Editorial Pack images for ${ID}.

Also on your Desktop: Siya-${ID}-carousel
Repo: ${PACK}

Overlay text from carousel.md in the pack, then publish.
"

AS_FILE="$(mktemp /tmp/siya-mail-XXXXXX.applescript)"
{
  echo "tell application \"Mail\""
  echo "  activate"
  echo "  set newMessage to make new outgoing message with properties {subject:\"${SUBJECT}\", content:\"${BODY}\", visible:true}"
  echo "  tell newMessage"
  echo "    make new to recipient with properties {address:\"${TO}\"}"
  for f in "$STAGE"/slide-*.png; do
    [[ -f "$f" ]] || continue
    echo "    make new attachment with properties {file name:POSIX file \"${f}\"} at after the last paragraph"
  done
  if [[ -f "$STAGE/README.md" ]]; then
    echo "    make new attachment with properties {file name:POSIX file \"${STAGE}/README.md\"} at after the last paragraph"
  fi
  echo "  end tell"
  echo "end tell"
} > "$AS_FILE"

osascript "$AS_FILE"
rm -f "$AS_FILE"

echo "Mail draft ready → To: $TO"
echo "Desktop: $STAGE"
echo "Repo:    $PACK"
