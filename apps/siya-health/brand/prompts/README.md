# Siya Creative Prompt Library

**Status:** Factory — one prompt pattern per Family (+ optional Layout)  
**Parents:** [`04-CREATIVE-SYSTEM.md`](../04-CREATIVE-SYSTEM.md) · [`creative-registry/`](../creative-registry/)

Fill the schema first. Then run the matching prompt. Do not invent a new mega-prompt.

---

## Universal preamble (always prepend)

```text
You are producing a Siya Health creative.

Load and obey (do not rewrite):
1. brand/01-BRAND-OS.md
2. brand/02-VISUAL-LANGUAGE.md
3. brand/ANTI-PATTERNS.md
4. brand/04-CREATIVE-SYSTEM.md
5. docs/EDITORIAL-STYLE-GUIDE.md
6. docs/SIYA-STANDARDS.md / data/site-standards.mjs for CTAs and pricing
7. brand/photography/ for image choice

Rules:
- One Intent only.
- Select Family + Layout ID; do not invent layouts.
- Prefer cloning/adapting an entry from brand/creative-registry/ when one exists.
- Never invent statistics; use homepage-trust-metrics.mjs only.
- Screening ≠ diagnosis ≠ guaranteed prescribing.
- Calm confidence; no fake urgency; no fear marketing.
- Output Creative Schema YAML + channel copy + visual direction.
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

## Multi-channel expand

After any family prompt succeeds:

```text
Using the approved schema + copy above, adapt WITHOUT changing Intent/Message/Family/Layout:
- LinkedIn post
- Instagram 4:5 (and carousel if layout is *-03 / E-02 / M-02 / RS-02 / PR-01)
- Newsletter blurb (120–180 words)
- Blog hero direction (E-03 or R-02)
Keep Creative Schema platforms[] updated.
```
