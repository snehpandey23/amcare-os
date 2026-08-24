# AGENT BOOTSTRAP — Siya Health creative (full stack)

```text
Status: CANONICAL for desktop · mobile · cloud agents — 2026-08-10
If you only open INSTAGRAM-STATIC.md you will ship incomplete / off-brand work.
```

**You must load this stack before any carousel, static, LinkedIn, reel prompt, caption, or brand image.**  
Do not invent layouts. Do not freehand a final branded PNG with `GenerateImage`.

---

## 0) Read order (mandatory)

| # | File (git path) | WorkDrive mirror | Why |
|---|-----------------|------------------|-----|
| 1 | `brand/BRAND-STYLE-LOCK.md` | `00-Brand-System/BRAND-STYLE-LOCK.md` | **Pixels:** hex, fonts, reject plum/hard-L |
| 2 | `brand/VISUAL-OS.md` | `00-Brand-System/VISUAL-OS.md` | Jobs · systems · light/shadow · production workflow |
| 3 | `brand/VISUAL-OS-TEMPLATES.md` | `00-Brand-System/VISUAL-OS-TEMPLATES.md` | Template IDs + field budgets (A-03, B-*, C-01, D-01) |
| 4 | `brand/EDITORIAL-OS.md` | `00-Brand-System/EDITORIAL-OS.md` | Research → insight → hook → pack (thinking before copy) |
| 5 | `brand/INSTAGRAM-STATIC.md` | `00-Brand-System/INSTAGRAM-STATIC.md` | Frame checklist only — **not** the whole OS |
| 6 | `brand/prompts/README.md` | `00-Brand-System/prompts-README.md` | Factory prompt patterns (universal preamble) |
| 7 | `brand/01-BRAND-OS.md` | `00-Brand-System/01-BRAND-OS.md` | Brand constitution |
| 8 | `brand/ANTI-PATTERNS.md` | `00-Brand-System/ANTI-PATTERNS.md` | What never to ship |
| 9 | Cursor rules (alwaysApply) | n/a (repo `.cursor/rules/`) | Style lock · A-03 lean · approval gate · WorkDrive |

**Also when relevant**

| Need | File |
|------|------|
| Captions / company vs founder | `knowledge-pillars/FOUNDER-LINKEDIN-VOICE.md` · pack `captions/` |
| Audience × platform caption matrix (pilot) | `editorial-packs/AD-W-01/captions/AUDIENCE-PLATFORM-PILOT.md` |
| Video / reel | `video-prompts/README.md` + pack `video-prompt.md` (prompts only — not MP4) |
| Tracker | `04-Content-Tracker/Siya-Content-Tracker-Posts.csv` |
| Team ship | `TEAM-WORKDRIVE.md` · fuse to `Siya Knowledge Editorial/` |
| Site UX (not social pixels) | `02-VISUAL-LANGUAGE.md` · patient site CSS tokens |

---

## 1) What “full stack” means (not Instagram-only)

| Deliverable | Spec owners | Output |
|-------------|-------------|--------|
| **Carousel** | Visual OS + A-03/B-* templates + approval gate | `compose_*.py` → `ready-to-post/*.png` + captions + video-prompt |
| **Static** | Same tokens; Recognition B or Knowledge A / Conversion C | One PNG via compositor |
| **LinkedIn Company** | Same PNGs (4:5 reuse) + `linkedin-*.md` captions | Captions; no separate LI crop unless brief says so |
| **LinkedIn Founder** | `FOUNDER-LINKEDIN-VOICE.md` — no CTA | Text; banners = `linkedin/` specs only |
| **Captions** | Platform + optional audience matrix | `captions/*.md` |
| **Reel** | `video-prompts/` | Markdown for HeyGen/etc. — not rendered video in-repo |
| **Research → pack** | Editorial OS | Insight → angles → hooks → visual → copy |

`INSTAGRAM-STATIC.md` is a **checklist**. It is not Creative System, Editorial OS, caption matrix, founder voice, or compositor CLI.

---

## 2) Tokens (fail closed) — copy of lock

| Token | Value |
|-------|--------|
| Cream | `#F4EFE7` |
| Deep Navy | `#001878` |
| Dark Navy | `#0A246B` |
| Magenta accent | `#D81088` (≤3 words) |
| Display | Georgia |
| Body | Arial |
| Default canvas | 4:5 · 1080×1350 |

**Reject:** plum `#8D3A78` · brown ink `#211813` · hard-seam L · text shadows · ambient watermarks · `GenerateImage` as final branded frame.

---

## 3) Production path (required)

```text
Classify job (Recognition / Knowledge / Authority / Conversion)
  → pick template ID (VISUAL-OS-TEMPLATES)
  → copy plan (approval gate Phase 1)
  → source photo ONLY (GenerateImage/stock — no type baked in)
  → compose_*.py → ready-to-post PNG
  → captions (+ audience variants if using matrix)
  → video-prompt.md
  → tracker row + WorkDrive 05-Carousels or 06-Statics
```

### Compositors (git)

| Script | Use |
|--------|-----|
| `scripts/compose_format_b_fullbleed.py` | Recognition · soft scrim TEXT-FIRST |
| `scripts/compose_format_a_knowledge.py` | Knowledge A-03 cream blend |
| `scripts/compose_stacked_knowledge.py` | Knowledge stacked (long headlines) |
| `scripts/compose_reel_916.py` | 9:16 reel **frames** |

---

## 4) Cloud / mobile failure modes

| Failure | Fix |
|---------|-----|
| Only read `INSTAGRAM-STATIC` or old `SIYA-SOCIAL-POST-STYLE` | Read this bootstrap + `BRAND-STYLE-LOCK` |
| Files missing in cloud clone | They must be **committed + pushed** on the branch the cloud agent uses |
| Freehand final image | Reject; run compositor |
| Batch 6 slides without approval | Follow `siya-visual-approval-gate.mdc` |
| Plum / hard-L from Jul packs | Legacy — do not copy |
| Cloud agent edits site / deploys while doing images | Use `CLOUD-AGENT-IMAGE-BRIEF.md` + `siya-cloud-image-only.mdc` — brand/ only |

**Starter prompt for cloud image runs:** [`CLOUD-AGENT-IMAGE-BRIEF.md`](./CLOUD-AGENT-IMAGE-BRIEF.md)  
**On-spec proof:** `brand/statics/SPEC-PROOF-2026-08-10-v21/`

---

## 5) Ignore / superseded

- `SIYA-SOCIAL-POST-STYLE.md` — pointer only (plum era void)  
- `VISUAL-OS-FROZEN-v1.*` — historical snapshots  
- `03-START-HERE/SIYA-HEALTH-VISUAL-STYLE.md` if it contradicts BRAND-STYLE-LOCK  
- Any Marketing “Sample images” lock that still lists plum  

---

## Proof pack

On-spec compositor output: `brand/statics/SPEC-PROOF-2026-08-10-v21/`  
WorkDrive: `06-Statics/SPEC-PROOF-2026-08-10-v21/`
