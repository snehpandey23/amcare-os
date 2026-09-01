# Design notes — ADHD-2026-07-31-conditions-alongside

**System:** Knowledge · Visual OS **v2.1** · Template **A-03** photo + cream education
**Format:** 7-slide carousel · 4:5 (1080×1350)

## Brand deviation from the source brief (deliberate)

The source brief requested "soft lavender gradient, purple accents, warm physician
illustrations." That palette is **not** Siya Health's system. Per frozen Visual OS v2.1:

| Brief asked | Shipped instead | Why |
|---|---|---|
| Lavender gradient | Cream blend panel over warm morning photo | A-03 is the frozen Knowledge look; lavender is off-palette |
| Purple accents | Navy headline + magenta accent word | Brand tokens |
| Physician illustrations | Warm lifestyle photography, subject right-weighted | Visual OS: photography, no medical costume |
| Puzzle-piece concept art | Human moment per condition | Illustrated metaphors read as stock; brand is lived-experience photography |

Everything else in the brief (minimal text, large type, whitespace, one idea per slide)
is already enforced by the A-03 compositor (blur-test type scale, CTA ship gate,
face-safe cream blend).

## Per-slide notes

All slides: cream text column left (~40%), soft dissolve into photo right, face-safe crop
(macOS Vision), footer chip `siya.health · Educational only`, logo top-left.

1. **Hook** — 4-line stacked headline, "ADHD" in magenta, support line under magenta rule,
   circular continue cue. Photo: man at kitchen table, morning coffee, thoughtful.
2. **Depression (1 of 5)** — pill counter, headline "Depression", recognition in navy bold,
   explanation in support navy, takeaway card. Photo: woman by window, soft warm light —
   subdued but calm, hopeful not gloomy (no head-in-hands cliché).
3. **Anxiety disorders (2 of 5)** — two-line headline. Photo: man holding mug, slight
   tension, gaze down.
4. **Bipolar disorder (3 of 5)** — two-line headline. Most clinically sensitive slide:
   descriptive contrast only (episodes vs steady traits), no treatment names, takeaway
   routes to proper diagnosis. Photo: woman on sofa with journal, neutral-calm.
5. **PTSD (4 of 5)** — single-word headline, largest type of the set. Photo: man near
   window, quiet reflective calm.
6. **Binge eating disorder (5 of 5)** — two-line headline. Photo: woman in kitchen,
   calm normal moment — never mid-eating, never shame-coded.
7. **Close** — "ADHD is rarely / the whole story." with accent on "the whole story.",
   body paragraphs, CTA button `Book a Free Meet & Greet` (ship-gated), photo: hopeful
   morning light.

## Photo prompts (used for generation)

Shared locks: photorealistic, warm 8–10 AM light, Kinfolk aesthetic, subject in FAR RIGHT
third only, full face + both shoulders visible, left 55–60% empty wall/negative space,
no logos, no on-image text, no scrubs/white coats, hopeful not gloomy.

1. Man early 30s at kitchen table with coffee, thoughtful gaze left.
2. Woman 30s seated by window, soft light on face, quiet calm.
3. Man 30s standing with mug, slight tension in shoulders, gaze down-left.
4. Woman 30s on sofa, closed journal on lap, composed neutral expression.
5. Man 40s near bright window, reflective, steady.
6. Woman 30s in warm kitchen, standing calmly at counter with tea.
7. Woman 30s in cream knit, near window, soft hopeful smile.
