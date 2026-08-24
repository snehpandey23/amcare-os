#!/usr/bin/env bash
set -euo pipefail
OUT="/workspace/apps/siya-health/brand/editorial-packs/PE-B-01/ready-to-post"
DESIGN="/workspace/apps/siya-health/brand/editorial-packs/PE-B-01/design"
UD="/tmp/chrome-pe-b-01-ud"
mkdir -p "$OUT" "$UD"
for i in 01 02 03 04 05; do
  target="$OUT/slide-$i-ready.png"
  if [[ -f "$target" && "$i" == "01" ]]; then
    echo "skip $i (exists)"
    continue
  fi
  rm -f "$target"
  timeout 25 google-chrome \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --user-data-dir="$UD-$i" \
    --virtual-time-budget=8000 \
    --run-all-compositor-stages-before-draw \
    --window-size=1080,1080 \
    --screenshot="$target" \
    "file://$DESIGN/slide-$i.html" \
    >/tmp/chrome-pe-$i.log 2>&1 || true
  if [[ -f "$target" ]]; then
    echo "ok $i $(wc -c < "$target") bytes"
  else
    echo "FAIL $i"
    tail -20 /tmp/chrome-pe-$i.log || true
  fi
done
ls -la "$OUT"
