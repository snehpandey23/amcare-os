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
2. Phase 1: show copy plan only (headline + recognition + caption teaching). STOP for approval.
3. After I approve Phase 1: generate source photo ONLY (no type baked in).
4. Run compose_format_a_knowledge.py → ready-to-post PNG for ONE slide only.
5. Show the PNG and STOP for my approval before the next slide / Phase 3.
6. Phase 3 (captions · tracker · video-prompt) ONLY after I say “approved” — git pack only.
7. Do NOT sync WorkDrive. When Phase 3 is done, say: Pack ready in git: <folder path>.

REJECT
Plum · brown ink · hard L · dense takeaway card · Canva template stacking · deploying anything · WorkDrive sync
```

---

## How to launch (checklist)

1. **Push** current `main` (or a brand-only branch) so cloud clone has `BRAND-STYLE-LOCK.md`.
2. Open **Cloud Agent** on that branch — not an old Jul branch.
3. Paste the brief above with fields filled.
4. Phase 1 → approve → Phase 2 one slide → approve (repeat as needed).
5. Only then say “approved” for Phase 3 (git only). Team uploads to WorkDrive manually.

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

Use [`CLOUD-AGENT-PACK-FROM-BLOG.md`](./CLOUD-AGENT-PACK-FROM-BLOG.md) + `CLOUD-PACK-TRACKER.csv`.  
Phase 3 stays in git; humans upload to WorkDrive manually. No agent auto-sync.

## WorkDrive

Agents: **do not sync.** Humans: download the git pack path announced at Phase 3 end.
