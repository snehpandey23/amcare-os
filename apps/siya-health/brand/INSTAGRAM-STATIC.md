# Instagram static — production checklist

```text
Status: FROZEN with Visual OS v2.1 — 2026-07-31
Applies to: All Instagram carousels + static posts
Full standard: VISUAL-OS.md · VISUAL-OS-TEMPLATES.md
```

**`VISUAL-OS.md` is the source of truth.** This is the frame checklist only.  
**Freeze:** Classify → template ID → replace fields. Do not invent layouts.

---

## Quick lock (every frame)

| Item | Rule |
|------|------|
| Classify first | Recognition · Knowledge · Authority · Conversion — **not** awareness/education/promotion |
| Template | Pick locked ID (`B-01`…`D-01`) from `VISUAL-OS-TEMPLATES.md` |
| One system | Never mix systems in one frame / carousel |
| Recognition (`B-*`) | Full-bleed light cream scrim · ~22% cream fade · lean only — **no** bullets/CTA · **no text shadows** |
| Knowledge (`A-*`) | Cream · diagram/text · bullets + source — **no** lifestyle people |
| Authority (`D-01`) | Portrait · quote · name · title — no infographic |
| Conversion (`C-01`) | 3 benefits · one CTA · trust marker — no fear marketing |
| Headline | ≤6 words · Georgia · Deep Navy · Magenta accent ≤3 words |
| Aspect | **4:5 · 1080×1350** default (1:1 secondary OK) |
| Type color | Navy `#001878` · Magenta `#D81088` · Dark Navy `#0A246B` — never brown/black/gray |
| Canvas | Cream `#F4EFE7` |
| Logo | `LOGO-PRIMARY` top-left |
| Footer | Quiet educational line + siya.health (or `--no-footer` logo-only) |
| Light | 8–10 AM soft window light · optimistic · no dark vignette |
| Gate | Blur Test · aesthetic ≥40/50 (Recognition) · Editorial ≥85 |

---

## Kill patterns (never)

- **Text drop shadows** / glyph glow / Canva depth effects  
- Dark vignettes / gloomy overlays  
- Brown / pure black / gray type (use navy + magenta)  
- Inventing a layout not in `VISUAL-OS-TEMPLATES.md`  
- Checklist or clinical CTA on **Recognition** photo  
- Hard L-cut / opaque cream card / half-canvas Canva panel  
- Soft ambient ghosting / second translucent photo  
- Checklist **and** CTA on the same static  
- Press-screenshot-as-hook · head-in-hands · symptom encyclopedias  
- Awareness / Education / Promotion as the primary classifier  

---

## Production workflow

1. Decision tree: feel / understand / trust / act  
2. Pick system + **template ID**  
3. Lock fields only (budgets in VISUAL-OS)  
4. Compose with system compositor (or manual C/D)  
5. Blur Test · aesthetic audit · Editorial ≥85  
6. Caption teaches / soft path · WorkDrive + tracker  

Recognition compose:
```bash
python3 apps/siya-health/brand/scripts/compose_format_b_fullbleed.py \
  --photo … --logo … --out … \
  --headline "…" --accent "…" --subhead "…"
# no --checklist / --cta · no text shadows (compositor default)

python3 apps/siya-health/brand/scripts/aesthetic_audit_format_b.py --image …
```
