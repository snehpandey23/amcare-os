#!/usr/bin/env bash
# EOD fuse: sync git Knowledge Editorial mirrors → live Mac TrueSync WorkDrive.
# Run ONLY on Mac with TrueSync mounted (Amcare).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WD="${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial"

if [[ ! -d "${HOME}/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd" ]]; then
  echo "ERROR: TrueSync not mounted. Sign into Zoho WorkDrive TrueSync (Amcare), then re-run."
  exit 1
fi

mkdir -p "$WD/04-Content-Tracker" "$WD/05-Carousels" "$WD/06-Statics" "$WD/00-Brand-System" "$WD/03-START-HERE"

echo "== Fuse report $(date -u +%Y-%m-%dT%H:%MZ) =="

# Brand system docs
if [[ -d "$ROOT" ]]; then
  rsync -a --exclude 'editorial-packs' --exclude '04-Content-Tracker' --exclude '05-Carousels' --exclude '06-Statics' --exclude 'scripts' \
    "$ROOT/" "$WD/00-Brand-System/" 2>/dev/null || true
fi
for f in TEAM-WORKDRIVE.md INSTAGRAM-STATIC.md EOD-LOCAL-FUSE-MASTER-PROMPT.md; do
  [[ -f "$ROOT/$f" ]] && cp -f "$ROOT/$f" "$WD/00-Brand-System/$f" && echo "brand: $f"
done
if [[ -d "$ROOT/knowledge-pillars" ]]; then
  mkdir -p "$WD/00-Brand-System/knowledge-pillars"
  rsync -a "$ROOT/knowledge-pillars/" "$WD/00-Brand-System/knowledge-pillars/"
  echo "brand: knowledge-pillars/"
fi

# Tracker CSV
if [[ -f "$ROOT/04-Content-Tracker/Siya-Content-Tracker.csv" ]]; then
  cp -f "$ROOT/04-Content-Tracker/Siya-Content-Tracker.csv" "$WD/04-Content-Tracker/"
  echo "tracker: Siya-Content-Tracker.csv → merge into .xlsx if needed"
fi

# Statics (06)
synced=0
if [[ -d "$ROOT/06-Statics" ]]; then
  for d in "$ROOT/06-Statics"/*/; do
    [[ -d "$d" ]] || continue
    id="$(basename "$d")"
    [[ "$id" == _* ]] && continue
    mkdir -p "$WD/06-Statics/$id"
    rsync -a --exclude 'COPY-TO-TRUESYNC.sh' --exclude 'LOCAL-MAC-AGENT.md' --exclude '.DS_Store' "$d" "$WD/06-Statics/$id/"
    echo "static: $id"
    synced=$((synced + 1))
  done
fi

# Carousel packs with ready-to-post or images/ready
if [[ -d "$ROOT/editorial-packs" ]]; then
  for d in "$ROOT/editorial-packs"/*/; do
    [[ -d "$d" ]] || continue
    id="$(basename "$d")"
    case "$id" in
      _*|BATCH*|PAUSE*) continue ;;
    esac
    # Prefer ready-to-post; else images/ready; always include captions + md
    dest="$WD/05-Carousels/$id"
    mkdir -p "$dest/captions" "$dest/ready-to-post"
    if [[ -d "$d/ready-to-post" ]]; then
      rsync -a "$d/ready-to-post/" "$dest/ready-to-post/"
    fi
    if [[ -d "$d/images" ]]; then
      mkdir -p "$dest/images"
      rsync -a "$d/images/" "$dest/images/"
    fi
    if [[ -d "$d/captions" ]]; then
      rsync -a "$d/captions/" "$dest/captions/"
      mkdir -p "$dest/ready-to-post/captions"
      rsync -a "$d/captions/" "$dest/ready-to-post/captions/"
    fi
    for f in README.md carousel.md static.md medical-flags.md metadata.json instagram.md; do
      [[ -f "$d/$f" ]] && cp -f "$d/$f" "$dest/$f"
    done
    # Statics that only live as packs: if format static and no carousel, also mirror 06
    if [[ -f "$d/static.md" ]] || [[ -f "$d/metadata.json" ]]; then
      if rg -q '"format"[[:space:]]*:[[:space:]]*"static"' "$d/metadata.json" 2>/dev/null; then
        mkdir -p "$WD/06-Statics/$id"
        if [[ -d "$d/ready-to-post" ]]; then
          rsync -a --exclude 'captions' "$d/ready-to-post/" "$WD/06-Statics/$id/" 2>/dev/null || true
        fi
        if [[ -d "$d/images/ready" ]]; then
          rsync -a "$d/images/ready/" "$WD/06-Statics/$id/"
        fi
        [[ -d "$d/captions" ]] && mkdir -p "$WD/06-Statics/$id/captions" && rsync -a "$d/captions/" "$WD/06-Statics/$id/captions/"
        for f in README.md static.md medical-flags.md metadata.json; do
          [[ -f "$d/$f" ]] && cp -f "$d/$f" "$WD/06-Statics/$id/$f"
        done
        echo "static-from-pack: $id"
      fi
    fi
    echo "carousel-pack: $id"
    synced=$((synced + 1))
  done
fi

echo "== Done. Packs touched ≈ $synced =="
echo "Open: $WD"
open "$WD" 2>/dev/null || true
