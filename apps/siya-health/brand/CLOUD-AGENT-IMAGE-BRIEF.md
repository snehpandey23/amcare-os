# Cloud agent — image-only brief (copy-paste)

```text
Status: Use this when launching a Cursor Cloud Agent for Siya social graphics
Branch: must include apps/siya-health/brand/BRAND-STYLE-LOCK.md + AGENT-BOOTSTRAP.md on remote
```

Paste the block below as the **entire** cloud agent task (fill the `{{…}}` fields).  
Do **not** add site, SEO, deploy, or staff-portal asks in the same run.

---

## Paste this

```text
ROLE: Siya Health brand image agent (cloud).

SCOPE — FAIL CLOSED
- Write ONLY under apps/siya-health/brand/ (editorial-packs / statics / captions / video-prompt).
- Do NOT edit website HTML/CSS/JS, vercel configs, staff portal, or run any deploy.
- Do NOT git push unless I explicitly ask later.

BOOT — READ IN ORDER (mandatory)
1. apps/siya-health/brand/AGENT-BOOTSTRAP.md
2. apps/siya-health/brand/BRAND-STYLE-LOCK.md
3. apps/siya-health/brand/VISUAL-OS.md
4. apps/siya-health/brand/VISUAL-OS-TEMPLATES.md
5. .cursor/rules/siya-a03-lean-lock.mdc
6. .cursor/rules/siya-visual-approval-gate.mdc

If BRAND-STYLE-LOCK.md or AGENT-BOOTSTRAP.md is missing: STOP and say the clone is stale. Do not use plum #8D3A78, hard-L layouts, or SIYA-SOCIAL-POST-STYLE.

TOKENS
Cream #F4EFE7 · Navy #001878 · Magenta #D81088 (≤3 words) · Georgia headline · Arial body · 4:5 1080×1350
Soft cream dissolve left → photo right. No hard seam. No text shadows. No freehand GenerateImage as final frame.

A-03 CONTENT SELECTION
Supplied copy is a pool. On-frame = strongest headline + ONE recognition line only.
Explanation / takeaway → caption unless I say --dense.
When in doubt, REMOVE on-frame copy.

JOB
Insight ID: {{INSIGHT_ID}}
Template: A-03 (unless I say otherwise)
Headline: {{HEADLINE}}
Accent word(s) ≤3: {{ACCENT}}
Recognition (one line): {{RECOGNITION}}
Caption teaching (not on-frame): {{CAPTION_TEACHING}}
Photo brief: {{PHOTO_BRIEF}} — right-weighted subject, warm morning light

WORKFLOW
1. Confirm Style Lock files exist; quote the four hex tokens back to me.
2. Phase 1: show copy plan only (headline + recognition + caption teaching).
3. Generate source photo ONLY (no type baked in).
4. Run compose_format_a_knowledge.py → ready-to-post PNG for SLIDE 1 only.
5. Show the PNG and stop for my approval.
6. Do not batch remaining slides, captions pack, tracker, or WorkDrive until I approve.

REJECT
Plum · brown ink · hard L · dense takeaway card · Canva template stacking · deploying anything
```

---

## How to launch (checklist)

1. **Push** current `main` (or a brand-only branch) so cloud clone has `BRAND-STYLE-LOCK.md`.
2. Open **Cloud Agent** on that branch — not an old Jul branch.
3. Paste the brief above with fields filled.
4. Review slide 1 in chat → “approved” / “too dense” / “wrong theme.”
5. Only then ask for remaining slides or WorkDrive sync.

## If you still get plum / hard-L / dense cards

| Cause | Fix |
|-------|-----|
| Cloud on old branch | Switch base to current `main` |
| Lock files never pushed | Commit + push `brand/BRAND-STYLE-LOCK.md` + `.cursor/rules/*` |
| Agent mixed site task | Restart with this brief only — no website language |
| Used `GenerateImage` as final | Reject; demand `compose_*.py` PNG |

## Proof of current look

`apps/siya-health/brand/statics/SPEC-PROOF-2026-08-10-v21/`

## Full pack from blog (cloud)

For “pick an uncovered ADHD spoke → carousel + captions + tracker”: use  
[`CLOUD-AGENT-PACK-FROM-BLOG.md`](./CLOUD-AGENT-PACK-FROM-BLOG.md)  
and git tracker `04-Content-Tracker/CLOUD-PACK-TRACKER.csv` — **not** Zoho WorkDrive (unavailable on cloud VMs).

## WorkDrive

**Do not mirror this file as an editable second copy.**  
Team pointer only (if needed): WorkDrive `00-Brand-System/CLOUD-AGENT-IMAGE-BRIEF.md` → “DO NOT EDIT · source = this git path.”  
Git remains source of truth for the paste block. Optional desktop mirror after Phase 3 approval.
