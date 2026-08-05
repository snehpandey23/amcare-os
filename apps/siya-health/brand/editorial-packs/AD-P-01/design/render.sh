#!/usr/bin/env bash
set -euo pipefail
DESIGN="$(cd "$(dirname "$0")" && pwd)"
PACK="$(cd "$DESIGN/.." && pwd)"
OUT_READY="$PACK/images/ready"
OUT_RTP="$PACK/ready-to-post"
UD="/tmp/chrome-ad-p-01-ud"
mkdir -p "$OUT_READY" "$OUT_RTP" "$UD"

for i in 01 02 03 04 05 06 07; do
  target="$OUT_READY/slide-$i-ready.png"
  rm -f "$target"
  timeout 40 google-chrome \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --user-data-dir="$UD-$i" \
    --virtual-time-budget=12000 \
    --run-all-compositor-stages-before-draw \
    --window-size=1080,1080 \
    --screenshot="$target" \
    "file://$DESIGN/slide-$i.html" \
    >/tmp/chrome-ad-p-$i.log 2>&1 || true
  if [[ -f "$target" ]]; then
    cp "$target" "$OUT_RTP/slide-$i-ready.png"
    echo "ok $i $(wc -c < "$target") bytes"
  else
    echo "FAIL $i"
    tail -30 /tmp/chrome-ad-p-$i.log || true
  fi
done
ls -la "$OUT_READY"
