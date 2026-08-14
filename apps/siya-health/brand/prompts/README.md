# Siya Creative Prompt Library

**Status:** Factory — one prompt pattern per Family (+ optional Layout)  
**Parents:** [`04-CREATIVE-SYSTEM.md`](../04-CREATIVE-SYSTEM.md) · [`creative-registry/`](../creative-registry/)

Fill the schema first. Then run the matching prompt. Do not invent a new mega-prompt.

---

## Universal preamble (always prepend)

```text
You are producing a Siya Health creative.

Load and obey FIRST (do not rewrite; pixels fail-closed on these):
0. brand/BRAND-STYLE-LOCK.md  ← CANONICAL tokens (navy #001878 · magenta #D81088 · cream #F4EFE7 · Georgia)
   NEVER plum #8D3A78 · NEVER brown ink · NEVER hard-seam L · NEVER freehand GenerateImage as final frame
1. brand/VISUAL-OS.md + brand/VISUAL-OS-TEMPLATES.md
2. brand/01-BRAND-OS.md
3. brand/02-VISUAL-LANGUAGE.md (site philosophy — social pixels still follow BRAND-STYLE-LOCK)
4. brand/ANTI-PATTERNS.md
5. brand/04-CREATIVE-SYSTEM.md
6. docs/EDITORIAL-STYLE-GUIDE.md
7. docs/SIYA-STANDARDS.md / data/site-standards.mjs for CTAs and pricing
8. brand/photography/ for image choice

Rules:
- One Intent only.
- Select Family + Layout ID; do not invent layouts.
- Prefer cloning/adapting an entry from brand/creative-registry/ when one exists.
- Never invent statistics; use homepage-trust-metrics.mjs only.
- Screening ≠ diagnosis ≠ guaranteed prescribing.
- Calm confidence; no fake urgency; no fear marketing.
- **Knowledge carousel A-03 lean lock (2026-08-06):** on-frame = headline + one sub-headline only.
  Sub-headline IS the whole message (not a teaser). Teaching depth → caption. No body/bullets/
  takeaway cards unless the brief explicitly requests `--dense`.
- **Blog-as-anchor (EDITORIAL-OS):** research against an existing published blog; social links back;
  flag unanswered audience questions separately; ~1–2 packs per blog then next anchor.
- **CTA by funnel stage (EDITORIAL-OS):** awareness / first touch → soft (read blog, newsletter);
  save screening / Meet & Greet for later-funnel. Do not default every close to hard conversion.
- Final social PNG = brand/scripts/compose_*.py (GenerateImage = source photo only).
- Output Creative Schema YAML + channel copy + visual direction.
```

---

## K — Knowledge carousel (A-03)

**File pattern:** Knowledge packs · `VISUAL-OS-TEMPLATES.md` → `A-03`

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Knowledge (one clinical idea)
Template: A-03 (lean default)
Topic: {{topic}}
Insight ID: {{insight_id}}
Claim lock / clinical constraints: {{constraints}}

For EACH slide produce ONLY:
1. headline (≤6 words · magenta accent ≤3 words)
2. sub-headline / recognition (whole message · ≤2–4 short lines · high contrast · **spokenness:** must read as something a person would say out loud — not a compressed fragment; fail if aloud needs mental reconstruction)
3. caption teaching beats (bullets ok HERE — not on-frame)
Do NOT draft on-frame explanation, takeaway card, or body bullets unless brief says dense.

Hook / middle slides / close: same lean rule. Close may add one CTA only —
matched to funnel stage (TOF → blog/newsletter; later → screening/Meet & Greet).
Anchor blog URL for caption link: {{anchor_blog_url}}
```

---

## R — Recognition

**File pattern:** Use with `R-01` … `R-04`

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Recognition
Journey stage: {{journey_stage}}
Emotion: {{emotion}}
Persona: {{persona}}
Topic: {{topic}}
Layout: {{layout}}   # e.g. R-02
Registry seed to adapt (if any): {{registry_path}}

Recognition moment: {{recognition_moment}}
Message (one line): {{message}}
CTA label (exact): {{cta_label}}
Platforms: {{platforms}}

Produce:
1. schema.yaml fields filled
2. On-image line(s) per layout
3. Caption
4. Alt text
5. Photography category from brand/photography
6. Variants: 2 headline alternatives (same intent)
```

---

## E — Explanation

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Education
Layout: {{layout}}   # E-01 | E-02 | E-03
Topic: {{topic}}
One concept only: {{concept}}
Journey stage: {{journey_stage}}
CTA: {{cta_label}}

Produce: question → explanation → example → takeaway → CTA
No second concept. Define clinical terms once in plain language.
```

---

## M — Myth vs Fact

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Education
Layout: M-01 or M-02
Myth: {{myth}}
Reality: {{reality}}
Clinical explanation (plain): {{explanation}}
Dignity required — never mock the reader.
CTA: {{cta_label}}
```

---

## RS — Research

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Authority or Education
Layout: RS-01 or RS-02
evidence_level: PeerReviewed
clinical_review: true
Study: {{citation}}
Finding: {{finding}}
Why it matters for a patient: {{why}}
Limitations (required): {{limitations}}
Never overclaim. CTA educate → invite only.
```

---

## PP — Physician Perspective

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Relationship or Trust
Layout: PP-01 or PP-02
Voice: thoughtful clinician to a patient they respect
Clinical memory: {{memory}}
Pattern: {{pattern}}
Lesson: {{lesson}}
Invitation CTA: {{cta_label}}
Never invent fake clinician quotes or AI “doctors.”
```

---

## PR — Process

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Education
Layout: PR-01 or PR-02
Steps must use exact vocabulary: screening → evaluation → plan → follow-up
CTA: {{cta_label}}
```

---

## PF — Proof

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Trust
Layout: PF-01 or PF-02
Metrics: ONLY from data/homepage-trust-metrics.mjs — list which ones: {{metrics}}
No badge walls. One primary trust signal preferred.
CTA: {{cta_label}}
```

---

## A — Action

```text
{{UNIVERSAL_PREAMBLE}}

Intent: Action
Layout: A-01 or A-02
One offer. One CTA. Nothing else.
cta_label must be an allowed Standards label: {{cta_label}}
```

---

## V — Video / reel brief

Parents: [`video-prompts/README.md`](../video-prompts/README.md) · [`_TEMPLATE-video-prompt.md`](../video-prompts/_TEMPLATE-video-prompt.md)

```text
{{UNIVERSAL_PREAMBLE}}

Allowed format ONLY on **Track A (company, default):** (1) real human on camera OR (2) narration-free reaction/meme-cut.
**Track A default:** Format 2 first. Format 1 = optional upgrade.
**Banned on Track A:** AI avatar / synthetic presenter.
**Track B (founder AI avatar):** only if brief explicitly requests disclosed founder avatar — use `_TEMPLATE-video-prompt-TRACK-B-founder.md` + `GUARDRAILS-TRACK-B-FOUNDER.md`. Draft prompt/script only; no HeyGen/render until approved.
**Pronunciation (both tracks):** Spoken/TTS write phonetic **See-ya Health**; on-screen stays Siya. Prefer “siya.health” close.
Insight ID: {{insight_id}}
Track: {{A_or_B}}
Format choice (Track A): {{1_or_2}}
Hook: insight or emotional recognition — not “5 types of…”
If public disclosure: {{public_figure}} · only publicly known facts · never fabricate quotes
Script / on-screen beats: Siya paraphrased angle — NEVER near-verbatim from research source
Practical change: {{practical_change}}
Output: Track A → `_TEMPLATE-video-prompt.md` · Track B → `_TEMPLATE-video-prompt-TRACK-B-founder.md`
```

---

## Multi-channel expand

After any family prompt succeeds:

```text
Using the approved schema + copy above, adapt WITHOUT changing Intent/Message/Family/Layout:
- LinkedIn post
- Instagram 4:5 (and carousel if layout is *-03 / E-02 / M-02 / RS-02 / PR-01)
- Newsletter blurb (120–180 words)
- Blog hero direction (E-03 or R-02)
- Video prompt (V — allowed formats only; no AI avatar)
Keep Creative Schema platforms[] updated.
```
