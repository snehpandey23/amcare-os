# Cloud → Local WorkDrive workflow

```text
Locked: 2026-07-22
```

## Model

```text
Cloud agents (marketing, all day)
  → write Insight packs + tracker rows into git brand/
  → commit/PR

Local Mac agent (end of day)
  → paste EOD-LOCAL-FUSE-MASTER-PROMPT.md
  → bash brand/scripts/eod-fuse-to-truesync.sh
  → live Common Folder / Siya Knowledge Editorial + tracker
```

## Why

TrueSync lives on the Mac. Cloud VMs cannot mount it. Parallel cloud work is fine; **one EOD fuse** keeps WorkDrive as team source of truth.

## Sources

| Role | Path |
|------|------|
| Master prompt | `brand/EOD-LOCAL-FUSE-MASTER-PROMPT.md` |
| Fuse script | `brand/scripts/eod-fuse-to-truesync.sh` |
| Git staging | `brand/editorial-packs/`, `brand/06-Statics/`, `brand/04-Content-Tracker/` |
| Live WorkDrive | `…/Common Folder/Siya Knowledge Editorial/` |

Desktop/git are staging. After EOD fuse, **Common Folder** is what marketing uses.
