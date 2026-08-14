# Design notes — ADHD-2026-07-31-didnt-add-up

**System:** Knowledge · Visual OS **v2.1** · Template **A-03** photo + cream education
**Format:** 7-slide carousel · 4:5 (1080×1350)
**Compositor:** `brand/scripts/compose_format_a_knowledge.py` · logo `assets/images/siya-health-logo-registered.png`

## Concept

Recognition stories, not education. Slides 2–4 are quote-led (headline *is* the
composite quote, in quotation marks) — the reader should feel seen before being taught.
Explanation stays short; teaching depth lives in the caption layer.

## Per-slide notes

All slides: cream text column left (~40%), soft dissolve into photo right, face-safe crop
(macOS Vision), footer chip `siya.health · Educational only`, logo top-left.

1. **Hook** — 4-line forced headline at ~74px ("Not wrong. / Just not / the whole /
   picture."), "whole picture" in magenta, composite disclosure as support line under
   magenta rule (compliance lock — never remove). Continue cue. Full sentence carried by
   the support line + captions — long hooks do not fit the A-03 column.
2. **"I was told it was depression." (1 of 3)** — quote headline. Photo: man mid-30s on
   sofa, mug and closed journal — reflective but *not* despairing (therapy helped; he's
   puzzled, not hopeless).
3. **"My brain has always felt like a tree." (2 of 3)** — quote headline. Photo: woman
   late 20s at desk, gaze drifting up mid-thought, notebooks open; a small plant in frame
   as a quiet echo of the metaphor.
4. **"I was told it wasn't ADHD." (3 of 3)** — quote headline. Most sensitive slide:
   takeaway locks second-opinion-as-accuracy framing. Photo: man mid-60s, gray hair, at
   kitchen table with coffee and papers, composed and dignified — never confused-elderly
   coded.
5. **Look-alikes** — teaching slide, three overlap pairs in explanation. Photo: woman 40s
   by bookshelf, neutral calm.
6. **"The goal isn't to collect diagnoses."** — brand-thesis slide. Photo: man early 50s
   near bright window, steady, quietly hopeful.
7. **Close** — quote headline "Something still doesn't add up." with accent on "add up",
   body + CTA button `Book a Free Meet & Greet` (ship-gated). Photo: woman 30s in cream
   knit near window, soft hopeful smile (mirrors sibling pack close).

## Photo prompts (used for generation)

Shared locks: photorealistic, warm 8–10 AM light, Kinfolk aesthetic, subject in FAR RIGHT
third only, full face + both shoulders visible, left 55–60% empty wall/negative space,
no logos, no on-image text, no scrubs/white coats, hopeful not gloomy.

1. Woman late 30s standing at bright window with tea, thoughtful gaze left.
2. Man mid-30s seated on sofa, mug in hands, closed journal beside him, calm reflective.
3. Woman late 20s at wooden desk, open notebooks, gaze drifting up-left mid-thought,
   small green plant on desk.
4. Man mid-60s with gray hair at kitchen table, coffee and a few papers, composed,
   dignified, warm light.
5. Woman early 40s standing near bookshelf, neutral calm expression, soft light.
6. Man early 50s near bright window, steady quiet optimism.
7. Woman early 30s in cream knit sweater near window, soft hopeful smile.
