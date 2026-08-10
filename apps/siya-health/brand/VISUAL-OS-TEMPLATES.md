# Visual OS v2.0 — Locked templates

```text
Status: FROZEN with Visual OS v2.0 — 2026-07-30
Rule: Choose a template ID. Populate listed fields only. Do not add fields.
```

Parent: [`VISUAL-OS.md`](./VISUAL-OS.md)

---

## Recognition System

### `B-01` — Lean recognition (default)

| Field | Required | Budget |
|-------|----------|--------|
| `headline` | yes | ≤6 words · Georgia · **Magenta** (`#D81088`) accent ≤3 words |
| `photo` | yes | One warm human scene · insight-specific prop |
| `subhead` | optional | ≤12 words |
| `logo` | yes | LOGO-PRIMARY |
| `footer` | yes | siya.health + educational line |

**Forbidden:** checklist · CTA button · icons · stats · sources  

**Compositor:**
```bash
python3 scripts/compose_format_b_fullbleed.py \
  --photo … --logo … --out … \
  --headline "…" --accent "…" \
  --subhead "…"   # optional
  # no --checklist, no --cta
```

### `B-02` — Lean + twist

Same as `B-01`, plus:

| Field | Required | Budget |
|-------|----------|--------|
| `twist` | yes | ≤12 words · parenthetical energy e.g. `(it's not running)` |

**Forbidden:** `subhead` and `twist` together · checklist · CTA  

```bash
… --twist "it's not running"   # no --subhead
```

### `B-03` — Recognition carousel continue

Same as `B-01` or `B-02`, plus:

| Field | Required |
|-------|----------|
| `cta_arrow` | yes — `CTA-ARROW-V1` only |

**Forbidden:** clinical CTA label · checklist  

---

## Knowledge System

### `A-01` — Diagram + bullets

| Field | Required | Budget |
|-------|----------|--------|
| `headline` | yes | ≤6 words |
| `diagram` | yes | One teaching visual on cream |
| `bullets` | yes | 3–5 · ≤15 words each |
| `source` | yes | One line |
| `logo` | yes | |
| `footer` | yes | website |

**Forbidden:** lifestyle people photos · emotional portraits · dual CTA  

### `A-02` — Text ladder (no diagram)

| Field | Required | Budget |
|-------|----------|--------|
| `headline` | yes | ≤6 words |
| `ladder` / bullets | yes | 3–5 · ≤15 words each |
| `source` | yes | |
| `logo` / `footer` | yes | |

**Use when:** pure mechanism / list with no lived scene.  
**Forbidden on A-02:** photo backgrounds (use `A-03` instead)

### `A-03` — Cream blend panel + photo (Knowledge carousel default)

**Lean lock (2026-08-06 — default for all future Knowledge carousels):**  
On-frame = **headline + one sub-headline only**. Sub-headline (`recognition`) **is the whole message**. Teaching depth lives in the **caption**. Body / explanation / takeaway / multi-bullet ladders require explicit `--dense`.

| Field | Required | Budget |
|-------|----------|--------|
| `photo` | yes | Warm morning lifestyle · subject cropped to **RIGHT** · no head-in-hands |
| `headline` | yes | ≤6 words · Georgia · **~10–12% canvas H** (blur-test = statics) · Magenta accent ≤3 words |
| `recognition` (sub-headline) | yes (hook / symptom / lean close) | **Whole message** · ≤ ~2–4 short lines · full Deep Navy · magenta rule above · **not** a teaser for off-frame body |
| `explanation` / `takeaway` / `body` | **off by default** | Only with compositor `--dense` (legacy) · bullets ≤15 words each |
| `cta` | close only | One — Meet & Greet / Talk to a Clinician |
| `logo` / `footer` | yes | |

**Surface (team lock · COVID-style):**  
Left **soft cream dissolve** → photo on the right.  
**ALL faces fully visible** in the clear photo zone — compositor detects faces (Vision) and zooms/pans so no face is bisected by the fade. Cream width adapts to protect faces.  
**Text never over face.** Soft blend ≠ hard Canva L-cut; still not full-bleed type-on-photo.

**Compositor:** `scripts/compose_format_a_knowledge.py --photo …` (lean default) · `--dense` opt-in only  
**Vs Recognition (`B-*`):** Both stay lean on-frame; A-03 may still carry one educational sub-line; B stays recognition-first. Teach in caption either way.  
**Forbidden:** text on face · small carousel type vs statics · busy photo under dense copy · opaque cardboard L with hard seam · default body/paragraph/takeaway cards

**Ship gates (fail-closed, added 2026-08-01 — compositor refuses to write the PNG):**
1. **Headline overflow** — if any headline line exceeds the text column even at the 56px
   floor, the script exits with `SHIP GATE: headline lines overflow…`. Fix the copy
   (shorter lines / re-break), never the gate. On-frame hooks are ≤ ~10 chars per line.
2. **Photo not right-weighted** — if the detected person zone starts left of 40% canvas
   width, the script exits with `SHIP GATE: person zone starts at …`. Regenerate the
   photo with the subject fully in the right third; do not mirror-and-hope.

---

## Conversion System

### `C-01` — Service benefits + one CTA

| Field | Required | Budget |
|-------|----------|--------|
| `headline` | yes | ≤6 words |
| `service_image` | yes | Product / journey / calm interface |
| `benefits` | yes | **exactly 3** |
| `cta` | yes | One — prefer `Talk to a Clinician` |
| `trust_marker` | yes | e.g. licensed states / physician-led |
| `logo` / `footer` | yes | |

**Forbidden:** fear copy · second CTA · education essay on-frame · Recognition photo-as-ad  

**Compositor:** manual until `compose_format_c_*.py` ships — still **fields only**.

---

## Authority System

### `D-01` — Portrait quote

| Field | Required | Budget |
|-------|----------|--------|
| `portrait` | yes | Editorial · clean · minimal |
| `quote` | yes | ≤20 words |
| `name` | yes | |
| `title` | yes | credentials / role |
| `logo` / `footer` | yes | website |

**Forbidden:** infographic chrome · icon rows · myth grids · dense citations on-frame  

**Compositor:** manual until `compose_format_d_*.py` ships.  
**Founder LinkedIn:** only when explicitly requested.

---

## Classification cheat sheet

| If the brief says… | Pick |
|--------------------|------|
| “Make them feel seen” / lived moment | `B-01` or `B-02` |
| “Explain the mechanism / trial / what is X” | `A-01` or `A-02` (cream) |
| “Education carousel with lived signs” | **`A-03`** (photo + cream education) |
| “Book / start / next step for warm traffic” | `C-01` |
| “Physician voice / trust / opinion” | `D-01` |
| Checklist on an emotional photo | **Wrong** — split into `B-01` + caption, or Knowledge `A-*` |
