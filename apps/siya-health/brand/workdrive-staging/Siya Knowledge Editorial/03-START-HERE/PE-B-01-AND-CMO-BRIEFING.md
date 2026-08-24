# PE-B-01 + CMO briefing — where to look

## This folder layout = Common Folder

```text
Siya Knowledge Editorial/
  00-Brand-System/CMO-EXECUTIVE-BRIEFING.md   ← CMO summary from other agent
  04-Content-Tracker/Siya-Content-Tracker-Posts.csv
  05-Carousels/PE-B-01/                       ← Alpana peptides carousel pack
    ready-to-post/                            ← post from here (PNGs + captions/)
```

## If you do not see this in Zoho WorkDrive yet

Cloud agents cannot write TrueSync directly. On your Mac (TrueSync logged in):

```bash
cd ~/amcare-os   # or your clone path
git fetch origin
git checkout cursor/peptides-brain-carousel-8bb3
bash apps/siya-health/brand/scripts/eod-fuse-to-truesync.sh --no-pull --ids PE-B-01
```

Or merge PR #9 to `main`, then run the fuse without `--no-pull`.

After fuse, open:

`Zoho WorkDrive → Common Folder → Siya Knowledge Editorial → 05-Carousels/PE-B-01`
