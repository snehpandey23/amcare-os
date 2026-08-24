#!/usr/bin/env bash
# Compose full AD-P-01 carousel via A-03 lean (BRAND-STYLE-LOCK).
set -euo pipefail
PACK="$(cd "$(dirname "$0")" && pwd)"
BRAND="$(cd "$PACK/../.." && pwd)"          # .../apps/siya-health/brand
SIYA="$(cd "$BRAND/.." && pwd)"             # .../apps/siya-health
COMPOSE="$BRAND/scripts/compose_format_a_knowledge.py"
LOGO="$SIYA/assets/images/siya-health-logo-registered.png"
BASES="$PACK/images/bases"
OUT="$PACK/ready-to-post"
READY="$PACK/images/ready"
mkdir -p "$OUT" "$READY"

run() {
  local n="$1"; shift
  python3 "$COMPOSE" \
    --logo "$LOGO" \
    --out "$OUT/slide-${n}-ready.png" \
    "$@"
  cp "$OUT/slide-${n}-ready.png" "$READY/slide-${n}-ready.png"
  echo "OK slide-${n}"
}

# 01 Cover
run 01 \
  --photo "$BASES/ad-p01-base-portrait.png" \
  --headline "Physical signs
of ADHD." \
  --accent "signs" \
  --recognition "They may show up —
they're not enough to diagnose." \
  --cream-ratio 0.55

# 02 What people notice
run 02 \
  --photo "$BASES/ad-p01-base-fidget.png" \
  --headline "The body
shows first." \
  --accent "body" \
  --recognition "Leg bounce. Restless sleep.
Lived patterns — not a diagnosis." \
  --cream-ratio 0.55

# 03 Adult hyperactivity
run 03 \
  --photo "$BASES/ad-p01-base-portrait.png" \
  --headline "Adult hyperactivity
is quiet." \
  --accent "quiet" \
  --recognition "Inner restlessness. Focus fidgeting.
Stillness can still take strain." \
  --cream-ratio 0.55

# 04 Myth
run 04 \
  --photo "$BASES/ad-p01-base-fidget.png" \
  --headline "Fidgeting ≠
a diagnosis." \
  --accent "Fidgeting" \
  --recognition "Anxiety, boredom, caffeine, sleep —
same movements show up." \
  --cream-ratio 0.55

# 05 Inattentive
run 05 \
  --photo "$BASES/ad-p01-base-portrait.png" \
  --headline "ADHD without
looking hyper." \
  --accent "hyper" \
  --recognition "Inattentive ADHD can look calm.
Sitting still doesn't rule it out." \
  --cream-ratio 0.55

# 06 Practical
run 06 \
  --photo "$BASES/ad-p01-base-sleep.png" \
  --headline "Common isn't
conclusive." \
  --accent "isn't" \
  --recognition "Lifelong + impairing → validated screener,
then talk to a clinician." \
  --cream-ratio 0.55

# 07 Close + CTA
run 07 \
  --photo "$BASES/ad-p01-base-portrait.png" \
  --headline "Start with
pattern." \
  --accent "pattern" \
  --recognition "Across work, home, and relationships —
with a clinician, not a fidget list." \
  --cta "Talk to a Clinician" \
  --cream-ratio 0.55

ls -la "$OUT"/slide-*-ready.png
