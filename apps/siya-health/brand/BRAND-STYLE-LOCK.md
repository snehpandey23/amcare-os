# Siya Brand Style Lock — social graphics (CANONICAL)

```text
Status: CANONICAL for agents — 2026-08-10
Applies to: Every carousel, static, LinkedIn banner, Pinterest graphic under brand/
Parents: VISUAL-OS.md v2.1 · VISUAL-OS-TEMPLATES.md · scripts/compose_*.py
Freeze: Do not invent layouts, colors, or type. Classify → template → replace fields only.
```

**This file is the one-page style lock.** Longer philosophy lives in `01-BRAND-OS.md` / `VISUAL-OS.md`.  
**If anything conflicts with this lock, this file wins for pixels — then update the other doc.**

Agents (desktop **and** mobile) must **Read this file** before generating or compositing any brand image. Do not rely on chat memory.

---

## Exact tokens (locked)

| Token | Value | Use |
|-------|--------|-----|
| Canvas cream | `#F4EFE7` | RGB `(244, 239, 231)` |
| Deep Siya Navy | `#001878` | RGB `(0, 24, 120)` — headlines + primary type |
| Dark Navy | `#0A246B` | RGB `(10, 36, 107)` — supporting / sub |
| Siya Magenta | `#D81088` | RGB `(216, 16, 136)` — accent ≤**3 words** · rules · CTA outline |
| Display font | **Georgia** (Bold for hero) | Headlines only — **no Inter / Roboto / system sans headlines** |
| Body font | **Arial** Bold (compositor) | Sub-headlines, bullets, footer |
| Aspect (default) | **4:5 · 1080×1350** | Instagram / Meta carousel + static |
| Aspect (secondary) | 1:1 · 1080×1080 | Export only when asked |
| Logo | `LOGO-PRIMARY` registered lockup · **top-left** · opaque | Height ~**92px** Knowledge A-03 · ~**106px** stacked · **no** ambient watermark |

### Never use (legacy / reject)

- Plum / terracotta type (`#8D3A78` era) as primary accent  
- Brown / espresso / pure black / gray body type  
- Text drop shadows · glyph glow · Canva depth  
- Dark vignettes · gloomy HDR drama  

---

## Layout locks (current — not legacy)

| System | Template IDs | Surface | Compositor |
|--------|--------------|---------|------------|
| **Recognition** | `B-*` | Full-bleed photo + **soft cream scrim** (TEXT-FIRST) · light fade · type crisp on soft cream | `compose_format_b_fullbleed.py` |
| **Knowledge** | `A-03` (default carousel) | Soft **cream dissolve left** → photo right · **OR** stacked cream-over-art | `compose_format_a_knowledge.py` · `compose_stacked_knowledge.py` |
| Conversion | `C-01` | 3 benefits · **one CTA** | Manual until Format C ships |
| Authority | `D-01` | Portrait + quote | Manual |

### Hard rules

1. **Photo:** single photo · **full opacity** · warm 8–10 AM window light · Kinfolk/optimistic — no watercolor collage, no double-exposure ghosts, no soft ambient second face.  
2. **No hard-seam L-layout** for new work — opaque cardboard L / hard Canva cut is **REJECTED**. Soft dissolve / soft scrim only. (Legacy Jul packs that used hard L are historical, not the lock.)  
3. **One CTA max** on Conversion / Knowledge close — never two CTAs; Recognition frames: **no CTA button**.  
4. **A-03 lean (default):** headline + **one** sub-headline only. Teaching → captions. `--dense` only if brief explicitly asks.  
5. **Blur-test type:** Knowledge headline ~**10–12%** canvas height (same as statics) — do not shrink carousel type.  
6. **Faces:** never under cream fade; subject **right-weighted** for A-03 side-blend.  
7. **Classify first:** Recognition / Knowledge / Authority / Conversion — never “awareness / education / promotion” as the layout driver.

---

## Production path (required)

```text
1. Read this file (BRAND-STYLE-LOCK.md)
2. Classify job → pick template ID from VISUAL-OS-TEMPLATES.md
3. Draft copy deck (approval gate Phase 1)
4. Supply source photo/art (agent GenerateImage OK for PHOTO ONLY — not final branded frame)
5. Run compose_*.py → write ready-to-post PNG
6. Self-audit vs tokens above · slide approval · then captions / video prompt / WorkDrive
```

**Critical:** Cursor `GenerateImage` / Midjourney / Firefly output is **source photography only**.  
The **on-brand final** is the compositor PNG (navy/magenta Georgia on cream).  
Stopping at a raw generated photo or freehand overlay = off-brand.

---

## Quick self-audit (every frame)

- [ ] Cream `#F4EFE7` · Navy `#001878` · Magenta `#D81088` only for type accents  
- [ ] Georgia headline · no plum · no brown type · no text shadow  
- [ ] Soft scrim / soft dissolve — **not** hard L seam  
- [ ] Single full-opacity photo · face clear  
- [ ] Lean A-03 unless `--dense` requested · ≤1 CTA on close  
- [ ] Output is `compose_*.py` PNG (or equivalent token-faithful composite), not raw gen alone  

---

## Related (read when needed — not substitutes for this lock)

| Doc | Role |
|-----|------|
| `VISUAL-OS.md` | Full Visual OS + light/shadow philosophy |
| `VISUAL-OS-TEMPLATES.md` | Field budgets per template ID |
| `INSTAGRAM-STATIC.md` | Frame checklist |
| `prompts/README.md` | Factory prompt patterns (must prepend this lock) |
| `.cursor/rules/siya-brand-style-lock.mdc` | Forces this file on every Cursor agent session |
| `.cursor/rules/siya-a03-lean-lock.mdc` | Knowledge copy lean lock |
| `.cursor/rules/siya-visual-approval-gate.mdc` | Slide-by-slide approval |
