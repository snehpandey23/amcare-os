# Cloud agent — image-only brief (copy-paste)

```text
Status: Use this when launching a Cursor Cloud Agent for Siya social graphics
Branch: must include BRAND-STYLE-LOCK.md + AGENT-BOOTSTRAP.md + MEDICAL-COMPLIANCE-MARKETING.md on remote
```

Paste the block below as the **entire** cloud agent task (fill the `{{…}}` fields).  
Do **not** add site, SEO, deploy, or staff-portal asks in the same run.

---

## Paste this

```text
ROLE: Siya Health brand image agent (cloud).

SCOPE — FAIL CLOSED
- Write ONLY under apps/siya-health/brand/ (editorial-packs / statics / captions / video-prompt / compliance).
- Do NOT edit website HTML/CSS/JS, vercel configs, staff portal, or run any deploy.
- Do NOT git push unless I explicitly ask later.

BOOT — READ IN ORDER (mandatory)
1. apps/siya-health/brand/AGENT-BOOTSTRAP.md
2. apps/siya-health/brand/BRAND-STYLE-LOCK.md
3. apps/siya-health/brand/MEDICAL-COMPLIANCE-MARKETING.md
4. apps/siya-health/brand/VISUAL-OS.md
5. apps/siya-health/brand/VISUAL-OS-TEMPLATES.md
6. .cursor/rules/siya-a03-lean-lock.mdc
7. .cursor/rules/siya-medical-compliance-marketing.mdc
8. .cursor/rules/siya-visual-approval-gate.mdc

If BRAND-STYLE-LOCK.md, AGENT-BOOTSTRAP.md, or MEDICAL-COMPLIANCE-MARKETING.md is missing: STOP and say the clone is stale. Do not use plum #8D3A78, hard-L layouts, SIYA-SOCIAL-POST-STYLE, or v1 “no testimonial disclosure” wording.

TOKENS
Cream #F4EFE7 · Navy #001878 · Magenta #D81088 (≤3 words) · Georgia headline · Arial body · 4:5 1080×1350
Soft cream dissolve left → photo right. No hard seam. No text shadows. No freehand GenerateImage as final frame.

A-03 CONTENT SELECTION
Supplied copy is a pool. On-frame = strongest headline + ONE recognition line only.
Explanation / takeaway → caption unless I say --dense.
When in doubt, REMOVE on-frame copy.

COMPLIANCE (SOP v2 — fail closed)
- Tag every clinical/stat claim LOW|MEDIUM|HIGH.
- Draft compliance/CHECKLIST.md from brand/compliance/_TEMPLATE-CHECKLIST.md at Phase 1.
- Flag / HIGH / §7.3 (comparative meds, testimonial, before/after, unsure) → STOP for Medical Director / Legal. Do not compose.
- No Rx before/after imagery. Testimonials need material-connection disclosure.
- Use compositor educational footer only — no custom “i | Learn more” footers.
- Phase 3 requires final compliance/CHECKLIST.md in the pack. ship_lane: cloud.

JOB
Insight ID: {{INSIGHT_ID}}
Template: A-03 (unless I say otherwise)
Headline: {{HEADLINE}}
Accent word(s) ≤3: {{ACCENT}}
Recognition (one line): {{RECOGNITION}}
Caption teaching (not on-frame): {{CAPTION_TEACHING}}
Claim tags (list): {{CLAIMS_AND_TAGS}}
Photo brief: {{PHOTO_BRIEF}} — right-weighted subject, warm morning light

WORKFLOW
1. Confirm Style Lock + MEDICAL-COMPLIANCE files exist; quote the four hex tokens back to me.
2. Phase 1: show copy plan + claim tags + draft compliance/CHECKLIST.md. STOP for approval (and Med Director if Flag/HIGH).
3. After I approve Phase 1 (and any clinical clearances): generate source photo ONLY (no type baked in).
4. Run compose_format_a_knowledge.py → ready-to-post PNG for ONE slide only.
5. Show the PNG and STOP for my approval before the next slide / Phase 3.
6. Phase 3 (captions · tracker · video-prompt · final checklist · SHIP.md ship_lane: cloud) ONLY after I say “approved”.
7. Do NOT TrueSync-write live 05-Carousels. Cloud lane → git; Action → _API-DRY-RUN. Say: Pack ready in git: <folder path>.

REJECT
Plum · brown ink · hard L · dense takeaway card · Canva stacking · uncleared HIGH claims · Rx before/after · deploying · live TrueSync overwrite
```

---

## How to launch (checklist)

1. **Push** current `main` so cloud clone has Style Lock + **MEDICAL-COMPLIANCE-MARKETING.md**.
2. Open **Cloud Agent** on that branch — not an old Jul branch.
3. Paste the brief above with fields filled (include claim tags).
4. Phase 1 (copy + checklist) → approve → Phase 2 one slide → approve (repeat as needed).
5. Only then say “approved” for Phase 3 (git · `ship_lane: cloud`).

## If you still get plum / hard-L / dense cards / skipped compliance

| Cause | Fix |
|-------|-----|
| Cloud on old branch | Switch base to current `main` |
| Lock/SOP files never pushed | Commit + push brand locks + `.cursor/rules/siya-medical-compliance-marketing.mdc` |
| Agent mixed site task | Restart with this brief only |
| Used `GenerateImage` as final | Reject; demand `compose_*.py` PNG |
| Skipped checklist | Reject; demand `compliance/CHECKLIST.md` before compose |

## Proof of current look

`apps/siya-health/brand/statics/SPEC-PROOF-2026-08-10-v21/`

## Full pack from blog (cloud)

Use [`CLOUD-AGENT-PACK-FROM-BLOG.md`](./CLOUD-AGENT-PACK-FROM-BLOG.md) + `CLOUD-PACK-TRACKER.csv`.  
Phase 3 stays in git (`ship_lane: cloud`); Action → `_API-DRY-RUN`.

## WorkDrive

Cloud: **Action → `_API-DRY-RUN` only.** Mac/local: TrueSync to existing `05` etc. See `zoho-workdrive-team.mdc`.
