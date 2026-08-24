# Cloud agent — full pack from ADHD blog (copy-paste)

```text
Status: Manual approval gate · git-only Phase 3 — 2026-08-24
Tracker SoT: brand/04-Content-Tracker/CLOUD-PACK-TRACKER.csv (git)
No WorkDrive sync from agents — team uploads manually from git
```

---

## Paste this

```text
ROLE: Siya Health brand pack agent (cloud).

SCOPE — FAIL CLOSED
- Write ONLY under apps/siya-health/brand/ (editorial-packs · captions · video-prompt · 04-Content-Tracker/CLOUD-PACK-TRACKER.csv).
- Do NOT edit website HTML/CSS/JS, vercel configs, staff portal, or run any deploy.
- Do NOT touch Zoho WorkDrive / TrueSync / WorkDrive API / fuse scripts.
- Do NOT git push unless I explicitly ask.
- Do NOT produce Founder LinkedIn posts.

BOOT — READ IN ORDER
1. apps/siya-health/brand/AGENT-BOOTSTRAP.md
2. apps/siya-health/brand/BRAND-STYLE-LOCK.md
3. apps/siya-health/brand/VISUAL-OS.md
4. apps/siya-health/brand/VISUAL-OS-TEMPLATES.md
5. .cursor/rules/siya-a03-lean-lock.mdc
6. .cursor/rules/siya-visual-approval-gate.mdc
7. .cursor/rules/siya-cloud-image-only.mdc
8. apps/siya-health/brand/CLOUD-AGENT-PACK-FROM-BLOG.md (this file)

If BRAND-STYLE-LOCK.md or AGENT-BOOTSTRAP.md is missing: STOP (stale clone).

TOKENS (quote back)
Cream #F4EFE7 · Navy #001878 · Dark Navy #0A246B · Magenta #D81088
Georgia headline · Arial body · 4:5 1080×1350 · soft cream dissolve · no hard L · no plum

TRACKER (git only)
File: apps/siya-health/brand/04-Content-Tracker/CLOUD-PACK-TRACKER.csv
Never write to WorkDrive.

PICK SPOKE (unless JOB already names one)
1. Scan apps/siya-health/blog/*adhd* and apps/siya-health/answers/*adhd* (and close cousins).
2. Skip spokes that already have an editorial-packs/ADHD-* or AD-* pack covering them.
3. Prefer educational answers over geo landing pages.
4. Announce: Insight ID · Spoke URL · why uncovered · 1-line angle.

JOB
Spoke: {{SPOKE_URL_OR_PICK}}
Insight ID: {{INSIGHT_ID_OR_DERIVE}}
Template: A-03 Knowledge carousel (lean)
Plan 5–6 slides in copy deck; RENDER ONE SLIDE AT A TIME until I approve.

WORKFLOW — APPROVAL GATE (mandatory)
Phase 1 — copy plan only → STOP for approval (no PNGs, no captions, no tracker).
Phase 2 — after I approve Phase 1: source photo + compose_format_a_knowledge.py for ONE slide.
  Flags: --logo --headline --accent --recognition --photo --out
  Do NOT pass --dense / --explanation / --takeaway / --body.
  Self-audit; STOP for approval before the next slide.
Phase 3 — ONLY after I say “approved” (or equivalent for the full set):
  Captions (IG / FB / LI Company / X / Pinterest + ALL-PLATFORMS) · video-prompt.md · CLOUD-PACK-TRACKER.csv row.
  Then say clearly: “Pack ready in git: apps/siya-health/brand/editorial-packs/[ID]/”
  No WorkDrive sync.

REJECT
Plum · hard L · dense on-frame teaching · WorkDrive sync · deploy · founder LinkedIn · freehand GenerateImage as final PNG
```

## Launch checklist

1. Base = current `main`.
2. Phase 1 → your OK → Phase 2 one slide → your OK (repeat) → only then Phase 3.
3. Team downloads the git folder and uploads to WorkDrive manually.
