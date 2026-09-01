# 07-Video-Prompts

One **video prompt document per Insight ID** — paired with the carousel/static idea.

**Parents:** [`EDITORIAL-OS.md`](../EDITORIAL-OS.md) · [`BRAND-STYLE-LOCK.md`](../BRAND-STYLE-LOCK.md)  
**This README** is the **video track lock** (formats 2026-08-12 · dual-track **2026-08-13** · Platform + one text layer **2026-08-14**).

## Rule
If we have N carousels / post ideas, we maintain N video prompt docs with matching IDs.

```text
05-Carousels/[Insight-ID]/carousel.md
05-Carousels/[Insight-ID]/video-prompt.md   ← Track A by default
07-Video-Prompts/[Insight-ID]-video-prompt.md ← source of truth for reel briefs
```

**Track B** founder-avatar drafts use a distinct filename suffix when both tracks exist for the same insight:

```text
[Insight-ID]-video-prompt.md              ← Track A (company)
[Insight-ID]-video-prompt-TRACK-B.md      ← Track B (founder avatar draft)
```

## Naming
`[Insight-ID]-video-prompt.md` (Track A)  
`[Insight-ID]-video-prompt-TRACK-B.md` (Track B only)

## When to create
Create the video prompt **in the same session** as the carousel plan — even if the reel is produced later.

---

# Dual-track lock (2026-08-13)

Every video brief must declare a track. Do not mix them.

| Track | Voice | Who appears | Default? | Production now |
|-------|--------|-------------|----------|----------------|
| **A — Company** | Anonymous company educational voice | Real human **or** narration-free text/B-roll | **Yes** — default pipeline | Yes (Format 2 first) |
| **B — Founder** | Explicitly the founder (disclosed) | Founder **AI avatar** + B-roll mix | **No** — only when brief asks for founder avatar | **Draft prompt/script only** — no HeyGen/render until approved |

**Agent rule:** If the brief does not explicitly say **founder avatar / Track B**, use **Track A**. Never put a synthetic avatar in a Track A brief.

---

# TRACK A — Company voice (default)

**Template:** [`_TEMPLATE-video-prompt.md`](./_TEMPLATE-video-prompt.md)  

## Allowed formats (locked 2026-08-12)

| # | Format | What it is |
|---|--------|------------|
| **1** | **Real human on camera** | Clinician, advocate, or relatable presenter speaking to camera. |
| **2** | **Narration-free reaction / meme-cut** | Text overlays + quick cuts / reaction stills. **No VO required.** |

### Default for new Track A packs (locked 2026-08-13)

**Default = Format 2.** Format 1 = optional upgrade when talent is booked / piece is proven.

**Agent rule:** Mark Format 2 as **default for this pack**; Format 1 as **optional alt / upgrade**.

### Platform (Format 2 — additive · 2026-08-14)

Declare on every Format 2 brief. **Default = Instagram / general.** TikTok-first is opt-in only — do not rewrite existing approved packs.

| Platform | Pacing |
|----------|--------|
| **Instagram / general** ← default | 2.5–4s · steady cuts |
| **TikTok-first** | Open 1.5–2.5s · snap + zoom-punch on hook text · fast setup → calm close · trending sound day-of (no ID locked) |

**TikTok-first (when checked):**
- Snap-cut / meme timing on hook — not a plain fade/cut alone  
- Contrast: punchy open → calm informational close  
- Sound: check TikTok → Sounds at edit; don’t lock a sound in the brief  
- Guardrails unchanged (no avatar · spokenness · claim flags · soft CTA)

**Example:** `editorial-packs/ADHD-2026-08-14-nothing-halfway/` → TikTok-first.

### One text layer (locked · 2026-08-14)

**One on-screen text system per video — never designed cards + auto-captions together.**

| Format | Rule |
|--------|------|
| **2 — Narration-free** | Designed beat cards only. **Disable auto-captions entirely** (export / editor / TikTok / IG). No VO → no subtitle track. |
| **1 — Real human** | Choose **one**: designed lower-thirds (navy on cream · spokenness) **or** standard auto-captions — **not both**. |

**Where duplication usually comes from (not the pack compositor):**
- HeyGen AI Studio **Captions** toggle (opt-in; burns a second style over cards)  
- CapCut / editor **Auto captions** left on  
- TikTok or Instagram **auto-generated captions** at upload  

In-repo Format 2 briefs do **not** generate a subtitle track. Fail closed: turn those toggles **off** before export and again at upload. Confirm on the next render.

### Removed on Track A (dead — do not brief)

- **AI avatar / synthetic presenter** as the primary format for company/anonymous content — dead on Track A. Use Track B only when explicitly requested and disclosed.

Legacy “HeyGen avatar setup” company briefs are **superseded** for Track A.

### Pronunciation lock (both tracks)

**Correct:** “Siya” = **“C-ya”** / **“see ya”** (SEE-yah).  
**Wrong:** “SAI-ya,” “SIGH-ya,” “SAH-ya,” etc.

| Surface | Write this |
|---------|------------|
| On-screen / captions / end card | `Siya Health` or `siya.health` |
| Spoken / VO / TTS / talent / avatar cue | `See-ya Health` *(phonetic)* |

Prefer closing on **`siya.health`** when possible.

### What a Track A video prompt is

- **Format 1:** hook · spoken script · delivery notes · **one text layer** (supers **or** auto-captions) · practical change · guardrails  
- **Format 2:** hook · Platform · **beat sheet (text + Visual/B-roll every row)** · **no auto-captions** · practical change · guardrails  

**Not:** Ken Burns / “animate the carousel slides.”  
**Not:** Near-verbatim transcription of a researched Reel (angle ≠ words).  
**Not:** Designed on-screen cards **plus** a duplicate auto-caption track.

### Prefer insight / emotional hook over textbook lists
Avoid “5 types of ADHD” / clinical bullet-list energy. Same spine as Editorial OS.

---

# TRACK B — Founder voice (draft-only)

**Template:** [`_TEMPLATE-video-prompt-TRACK-B-founder.md`](./_TEMPLATE-video-prompt-TRACK-B-founder.md)  
**Guardrails:** [`GUARDRAILS-TRACK-B-FOUNDER.md`](./GUARDRAILS-TRACK-B-FOUNDER.md)  

Use **only** when the brief explicitly requests the **founder’s AI avatar**, disclosed as the founder.

**Status lock:** Generate **prompt/script drafts only**. Do **not** run HeyGen / avatar render / ship until separate production approval.

### Track B non-negotiables

1. **Clarity first** — topic in the **first 2 spoken lines**.  
2. **Pacing** — natural pauses · short beats with B-roll cuts.  
3. **Avatar visuals** — short avatar segments + B-roll cutaways.  
4. **Not an ad** — soft CTA.  
5. **Pronunciation** — `See-ya Health` phonetic.  
6. **Disclosure** — clearly the founder speaking.  
7. **One text layer** — designed supers **or** HeyGen Captions, never both.

Full detail: `GUARDRAILS-TRACK-B-FOUNDER.md`.

---

## Hook patterns (include when relevant)

### Public disclosure (allowed)
When a **real, publicly known** figure has **openly** discussed their own diagnosis, that can be a legitimate hook.  
**Hard rule:** Reference only what is actually publicly known. Never fabricate quotes.

---

## Templates

| Track | File |
|-------|------|
| A — Company | `_TEMPLATE-video-prompt.md` |
| B — Founder avatar | `_TEMPLATE-video-prompt-TRACK-B-founder.md` |
| B — Guardrails | `GUARDRAILS-TRACK-B-FOUNDER.md` |

## Index
See `INDEX.md`
