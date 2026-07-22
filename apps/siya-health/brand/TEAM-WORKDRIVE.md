# Zoho WorkDrive — Knowledge Editorial (live)

TrueSync: **Amcare Medical Consultancy India Pvt Ltd**

## Shared folder (team)

```text
Zoho WorkDrive → Common Folder → Siya Knowledge Editorial
```

| Folder | Purpose |
|--------|---------|
| `03-START-HERE` | How to use this space |
| `00-Brand-System` | Editorial Test, IG static rules, Creative Director |
| `04-Content-Tracker` | **`Siya-Content-Tracker.xlsx`** — log every post/asset |
| `05-Carousels/[Insight-ID]/` | **One pack folder** — images + captions together |
| `…/ready-to-post/` | PNGs + `captions/` (post from here) |
| `06-Statics` | Single images (LinkedIn banners, one-off IG, ads) |

Do **not** create a separate top-level “READY” mirror folder. Keep assets inside each Insight ID pack.

## Tracker columns (Posts sheet)

Insight ID · Title · Format · Channel · Status · Practical change · Knowledge Product · Spoke URL · Folder path · dates · Owner · Approver · live link · Notes

Statuses: Idea → Draft → In design → Ready → Scheduled → Published

## Rule

Company/social rows need a **practical change**. Founder LinkedIn may be N/A (no CTA).

## Standing ops (locked 2026-07-21 · updated 2026-07-22)

**Every future team deliverable** must land in this Common Folder and be logged in `04-Content-Tracker`. Common Folder is what the team uses.

### Cloud → local fuse (locked 2026-07-22)

```text
Cloud agents (all day)  →  git brand/ packs + tracker CSV
Local Mac agent (EOD)   →  EOD-LOCAL-FUSE-MASTER-PROMPT + eod-fuse-to-truesync.sh
                         →  live TrueSync Knowledge Editorial
```

Marketing may keep creating on **cloud agents** in parallel. Do **not** expect cloud agents to write TrueSync. End-of-day local fuse is the WorkDrive sync step.

See: `EOD-LOCAL-FUSE-MASTER-PROMPT.md` · `03-START-HERE/CLOUD-TO-LOCAL-WORKFLOW.md` · `scripts/eod-fuse-to-truesync.sh`
