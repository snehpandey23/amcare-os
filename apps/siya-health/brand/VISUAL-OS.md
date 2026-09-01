# Siya Visual OS v2.0

```text
Status: FROZEN — 2026-07-31 · v2.1 · A-03 lean copy lock 2026-08-06
Part of: Creative OS (Editorial OS + Visual OS)
Applies to: All social graphics — carousels, statics, LinkedIn banners, Pinterest
North star: Optimistic healthcare. Apple + Kinfolk + Liven — not medical-journal illustration.
Supersedes: Visual OS v2.0 (systems retained; light/type/shadow locks added)
Freeze: Do not invent layouts. Classify → choose locked template → replace fields only.
```

**Design statement:** trusted clinician who also understands real life — warmth first, teaching second, brand closes quietly.

Companion: [`INSTAGRAM-STATIC.md`](./INSTAGRAM-STATIC.md) · [`VISUAL-OS-TEMPLATES.md`](./VISUAL-OS-TEMPLATES.md) · WorkDrive `00-Brand-System/EDITORIAL-OS.md`

---

## Philosophy shift (v2.0)

Stop thinking in **styles** or marketing labels (`awareness` / `education` / `promotion`).

Start with **jobs**. Cursor **chooses** a locked template — it does **not** invent a layout.

```text
Research
  ↓
Editorial Insight
  ↓
Classify content (one job)
  ↓
Select Visual System
  ↓
Select locked template ID
  ↓
Replace fields only
  (headline · supporting copy · photo/diagram · CTA if template allows)
  ↓
Quality gate
  Editorial ≥85 · Visual / aesthetic ≥40 · Blur Test
```

### Decision tree (required before pixels)

```text
What should the audience do after seeing this?

Feel understood?     → Recognition System  (templates B-*)
Understand one idea? → Knowledge System    (templates A-*)
Trust a physician?   → Authority System    (templates D-*)
Take the next step?  → Conversion System   (templates C-*)
```

**Never start with design.** Never use “awareness / education / promotion” as the primary classifier.

### Volume targets (organic feed · guide)

| System | Share of organic | Notes |
|--------|------------------|-------|
| Recognition | ~40–50% | Default empathy / realization |
| Knowledge | ~25–35% | One clinical idea |
| Authority | ~15–20% | Physician trust — portrait + quote |
| Conversion | ≤15% organic; higher in paid / mid-funnel | Reduce friction — not persuade |

---

## Four production systems

### 1. Recognition System (Emotion) — legacy Format B

| | |
|--|--|
| **Goal** | Make someone feel understood. Not teach. Not sell. Not explain on-frame. |
| **Audience** | “I've been feeling this way.” |
| **KPI** | Shares · saves · comments · watch time |
| **Image** | Real human · morning light · natural · warm · insight-specific prop |
| **On-frame** | Logo · huge headline · one emotional photo · optional tiny sub · website footer |
| **Never on-frame** | Bullets · icons · references · CTA buttons · statistics · checklists |

Teaching + soft path live in the **caption**. Pair with a Knowledge post if they need to learn next.

**Templates:** `B-01` lean · `B-02` lean + twist · `B-03` carousel continue (arrow only)  
**Compositor:** `scripts/compose_format_b_fullbleed.py` (TEXT-FIRST soft cream scrim · light fade · navy/magenta type · **no text shadows**)

---

### 2. Knowledge System — legacy Format A

| | |
|--|--|
| **Goal** | Explain **one** clinical idea. |
| **Audience** | “I want to understand.” |
| **KPI** | Saves · shares · website clicks |
| **Image** | **Default (Knowledge carousels):** left cream **blend panel** + photo right (`A-03`) — text never over face/body; headline **~10–12% H**. **Opt-in cream-only:** diagram / text ladder (`A-01` / `A-02`) when no lived scene. |
| **On-frame (A-03 lean lock)** | **Headline + one sub-headline only** · logo · website · optional CTA on close. Sub-headline **is the whole message** — not a teaser. Teach detail in **caption**. |
| **Never on-frame** | Text on face/body · hard Canva cardboard L · dark vignettes · text drop shadows · social diagnosis · dual CTAs · carousel type smaller than statics · **body paragraphs / bullet ladders / takeaway cards** (unless `--dense` explicit opt-in) |

**Templates:** `A-01` diagram + bullets · `A-02` cream text ladder · **`A-03` cream blend + photo (brand-default for Knowledge carousels)**  
**Compositor:** `scripts/compose_format_a_knowledge.py` (`--photo` → A-03 blend · omit photo → A-02 cream) · Deep Navy + Magenta · **no text shadows** · default **lean** · `--dense` only when body blocks are explicitly requested

**Copy lock (2026-08-06 — A-03 lean · all future Knowledge carousels):**  
On-frame = **headline + sub-headline** (via `--recognition`). Sub-headline carries the full idea in ≤ ~2–4 short lines. Do **not** put explanation / takeaway / multi-bullet body on the frame by default. Captions hold teaching depth. Pass `--dense` only when a stakeholder explicitly asks for body blocks.

**Spokenness (2026-08-13 — A-03 sub-headlines):** Sub-headlines must read as something a person would actually say out loud — complete, natural phrasing, even when short. Not a compressed fragment missing connecting words. **Test:** read it aloud. If it needs mental reconstruction to parse (e.g. “morning speech” standing in for “the pep talk you give yourself”), it fails — regardless of word count or line budget.

**Supersedes copy lock (2026-08-05):** Multi-sentence → magenta-dot bullets was the prior default; that pattern is now **`--dense` only**.

**Team lock (2026-07-31 review):** Prefer COVID-style split (cream text zone / soft blend / photo) over full-bleed type-on-person. Readable alone is not enough — must also look premium.

---

### 3. Conversion System — Format C (new)

| | |
|--|--|
| **Goal** | Reduce friction. Not persuade. Not educate. Help take the next step. |
| **Audience** | “I'm interested.” |
| **KPI** | Clicks · consult starts · form completes |
| **Image** | Service / journey / calm clinical interface — not fear, not urgency chrome |
| **On-frame** | Headline · service image · **3 benefits** · **one CTA** · trust marker · website |
| **Never** | Fear marketing · exaggerated claims · dual CTAs · HIMS-style promo slabs |

**Templates:** `C-01` service benefits + clinical CTA  
**Compositor:** TBD — until shipped, assemble manually against `C-01` fields only (no free remix).

---

### 4. Authority System — Format D (new)

| | |
|--|--|
| **Goal** | Build physician trust. |
| **Audience** | “Can I trust this clinician / clinic?” |
| **KPI** | Profile visits · saves · referral intent · brand search |
| **Image** | Editorial portrait · clean · minimal |
| **On-frame** | Portrait · quote · name · title · website |
| **Never** | Canva infographic · icon rows · myth-vs-fact grids · credential walls · dense research dumps |

Examples: clinical opinion · myth correction · research commentary · conference · case reflection (de-identified).

**Templates:** `D-01` portrait quote  
**Compositor:** TBD — until shipped, assemble manually against `D-01` only.  
**Note:** Founder LinkedIn (Dr. Sneh / Dr. Swati) only when **explicitly** requested. Company voice is default.

---

## Locked template rule

```text
INPUT → classify system → pick template ID → populate fields → done
```

Agents must **not**:
- Mix systems on one frame / one carousel
- Add fields the template does not list
- Invent a fifth layout “just for this post”

Field schemas: [`VISUAL-OS-TEMPLATES.md`](./VISUAL-OS-TEMPLATES.md)

---

## Content budgets (no exceptions)

### Recognition (B-*)

| Element | Max |
|---------|-----|
| Headline | **6 words** |
| Sub / twist | **12 words** (optional) |
| On-frame CTA / bullets | **0** |

### Knowledge (A-*)

| Element | Max |
|---------|-----|
| Headline | **6 words** |
| Bullets | **5** · ≤**15 words** each |
| Source line | 1 |

### Conversion (C-*)

| Element | Max |
|---------|-----|
| Headline | **6 words** |
| Benefits | **3** |
| CTA | **1** |

### Authority (D-*)

| Element | Max |
|---------|-----|
| Quote | **20 words** |
| Name + title | required |

Caption carries URL, nuance, practical change, soft path.

---

## Frozen design tokens (v2.1)

| Layer | Locked choice |
|-------|----------------|
| Aspect | **4:5** · 1080×1350 default (1:1 secondary export only) |
| Type | `FONT-DISPLAY` Georgia · `FONT-BODY` Arial · **no sans headline** |
| Type color | **Deep Siya Navy** `#001878` headline · **Siya Magenta** `#D81088` accent ≤3 words · **Dark Navy** `#0A246B` supporting |
| Never type | Pure black · brown / espresso · gray / muted |
| Canvas | Cream `#F4EFE7` |
| Logo | `LOGO-PRIMARY` top-left · 84px · registered mark · no ambient watermark |
| Footer | Quiet navy · educational line (optional `--no-footer` for logo-only frames) |
| Recognition surface | Full-bleed + **light** cream scrim · ~18% cream fade (brightens) · **no text shadows** |
| Recognition reject | Hard L-cut · opaque cream card · drop shadows · dark vignettes · HDR drama |
| Contrast | Navy vs backdrop under headline ≥ **4.5:1** |
| Aesthetic audit | `scripts/aesthetic_audit_format_b.py` · gate ≥**40/50** |
| Magenta accent | ≤**3 words** in headline |

**Still open (do not invent mid-generate):** Conversion/Authority compositor code · icon-vs-pill Knowledge chrome · logo size bump · `BG-MACRO-BLUR` as default.

---

## Shadows (hard · v2.1)

### Text
**Never use drop shadows** on headlines, subheads, or body.

Instead:
- Increase font weight / size (Georgia bold hero)
- Improve contrast (navy on cream-softened photo)
- Create separation with whitespace and soft scrim — not effects

Premium editorial (Apple / Headspace / Kinfolk) almost never uses heavy text shadows. Canva-2018 shadows = automatic reject.

### Cards / pills (when a template allows them)
Very subtle only: ~5–10% opacity · large blur · almost invisible — Apple-card energy. Never hard black drop shadows.

### Photography
Natural sunlight only. Soft window light. Gentle sun-cast shadows are fine.  
**Never:** artificial dramatic lighting · moody grey/brown vignettes · HDR crunch · exaggerated rendered object shadows.

---

## Light & Contrast (hard · v2.1)

Every Recognition image should pass:

| Check | Pass looks like |
|-------|-----------------|
| Time of day | Photographed **8–10 AM** |
| Light | Soft natural window light |
| Mood | Bright enough to feel **optimistic** |
| Palette | Warm cream and beige dominate |
| Shadows | No heavy / dramatic contrast |
| Type effects | **No text shadows** |
| Type method | Crisp through spacing + navy/magenta color — not glow, outline stacks, or drop shadows |

If the frame feels gloomy, “rendered,” or ad-dramatic → reject and re-light / re-crop / recompose.

---

## Recognition surface detail (TEXT-FIRST-V1)

**Message beats image — without burying the emotion.** Photo stays visible end-to-end. Hope and clarity — not drama.

| Rule | Requirement |
|------|-------------|
| Surface | Soft full-bleed **light cream** gradient — **not** opaque card · **not** dark vignette |
| Headline | Block **35–45%** canvas height · Georgia · Deep Navy · Magenta accent · **crisp, no shadow** |
| Conflict | Slightly deepen cream scrim / re-crop — **never** opaque panel · **never** text shadow |
| Lean only | No checklist · no clinical CTA on Recognition frames |

Compositor: `scripts/compose_format_b_fullbleed.py`

L-layout (`SCRIM-PANEL-L1`) = **opt-in only** when founders explicitly request a hard cream column.

---

## Image direction by system

| System | Direction |
|--------|-----------|
| Recognition | Real human · morning light · natural · warm · insight-specific prop · no head-in-hands |
| Knowledge | **A-03 default:** left cream blend panel + photo right (subject stays visible, text separate). **A-01/A-02:** cream-only when no lived scene |
| Conversion | Product / service / journey / calm interface |
| Authority | Editorial portrait · clean · minimal |

**Scene-matching (Recognition):** Prop must match **this** insight. Same desk reused across unrelated topics = reject.

---

## CTA tokens (where allowed)

| Token | Where |
|-------|-------|
| `CTA-CLINICAL-V1` — Talk to a Clinician | **Conversion** (`C-01`) only on-frame; Recognition = caption only |
| `CTA-ARROW-V1` — circular arrow | Recognition carousel `B-03` / Knowledge carousel continue |
| Checklist / Evidence Ladder pills | **Knowledge** only — never Recognition |

Never checklist **and** CTA on the same frame. Never plain-text CTA + URL string.

**CTA button ship gate (hard, automated):** CTA text ink must sit fully inside the button
outline with ≥4 px inset on every edge. Compositors measure the rendered text bbox and
**refuse to write the file** (`SystemExit`) on violation — they shrink type (26 → 16 px min)
before failing. Never hand-place CTA buttons; always render through the compositor.

---

## Production workflow (agents)

1. **Classify** — Recognition / Knowledge / Authority / Conversion (decision tree)  
2. **Pick template ID** — from `VISUAL-OS-TEMPLATES.md`  
3. **Lock fields only** — no extra chrome  
4. **Copy plan first** — draft on-frame copy; no captions/trackers/sync yet  
5. **Slide-by-slide approval** — render slide 1 only, show for approval in chat, then
   next; batch remaining slides only after the user locks the style  
6. **Gates** — Blur Test · aesthetic ≥40 · Editorial ≥85 · CTA-inside-button · face-safe
   crop · never-ship check (automated gates do not replace user approval)  
7. **Ship after approval only** — WorkDrive pack + captions + video prompt + tracker  

---

## Map — v1.4 names → v2.0

| v1.4 | v2.0 |
|------|------|
| Format B Emotional Photo | **Recognition System** |
| Format A Educational Text | **Knowledge System** |
| Format B clinical checklist / CTA on photo | **Illegal on Recognition** — use Knowledge or Conversion |
| Lean brand / twist | Recognition `B-02` |
| (missing) | **Authority System** |
| Soft promo / service CTA stacks | **Conversion System** |
| Awareness / Education / Promotion labels | **Do not use** as classifiers |

---

## Never-ship gallery (carry forward)

| Pattern | Why |
|---------|-----|
| Text drop shadows / glyph glow / Canva depth | Unnatural · not editorial |
| Dark vignette / gloomy overlay | Kills optimistic morning light |
| Brown / espresso / pure black type | Use Deep Siya Navy + Magenta |
| Dual composition (story + CTA slab) | Two jobs |
| Checklist on Recognition photo | Wrong system |
| Hard L-cut / opaque Canva cream card | Recognition reject |
| Ghosted double-exposure / translucent second photo | One-photo rule |
| Press-screenshot-as-hook | Compliance |
| Head-in-hands primary | Shame cliché |
| 3×3 symptom encyclopedia | One job + Rule of Three |
| Sans headline | Georgia only |
| Purple hospital chrome / fear marketing | Brand kill |
| Invented fifth layout | Template lock |

Full craft QC + Blur Test + Visual Score ≥40/50 remain required.

---

## Visual Score (/50 · gate ≥40)

| Category | /10 |
|----------|-----|
| One job clear (correct system) | |
| Hierarchy | |
| Recognition-or-system fit (right never-list) | |
| Rule of Three | |
| 3-Second Blur Test | |

Plus Editorial Score ≥85 before publish.

---

## Related

- `VISUAL-OS-TEMPLATES.md` · `INSTAGRAM-STATIC.md` · `EDITORIAL-OS.md` · `EDITORIAL-TEST.md`  
- `scripts/compose_format_b_fullbleed.py` · `scripts/aesthetic_audit_format_b.py`  
- Zoho: `00-Brand-System/VISUAL-OS.md` · `VISUAL-OS-FROZEN-v2.0.md`
