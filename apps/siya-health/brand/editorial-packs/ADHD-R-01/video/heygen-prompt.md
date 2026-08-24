# ADHD-R-01 — HeyGen prompt (Siya Health branded, avatar-free)

**Goal of this pass:** make the reel unmistakably a **healthcare brand education piece**, not a generic lifestyle/influencer reel. Add a brand bumper, persistent identity tag, a clinical-context scene, and a full closing brand card — while staying avatar-free and inside `BRAND-STYLE-LOCK.md` tokens (cream `#F4EFE7` / navy `#001878` / magenta `#D81088` ≤3 words / Georgia headlines).

Paste into HeyGen's **Text-to-Video / AI Studio**, project type **Scene-based, Avatar = None**.

---

## Global settings

```text
Project type: Scene-based video (no avatar / no digital human)
Aspect ratio: 9:16 (1080x1920)
Voice: Calm, credible, warm — health-educator register (think: trusted clinician's patient-education voice, not social-media influencer). US English, ~150 wpm, minimal upspeak.
Caption style: Burned-in cream card (bottom-left), navy Georgia-style serif text, thin magenta accent rule ≤3 words
Persistent brand tag: "SIYA HEALTH" wordmark, top-left, every scene, opaque cream chip — never a transparent watermark
Brand colors: Navy #001878 (text) · Magenta #D81088 (accent only, ≤3 words) · Cream #F4EFE7 (caption/chip background)
Typography feel: Editorial/clinical-calm, not playful — Georgia-style serif headlines, Arial-style sans for small text
Music: Minimal, low string/piano underscore — no upbeat trending audio (reads as clinical education, not entertainment)
Tone: Professional health education — supportive and hopeful, never influencer-casual, never fear-based
```

---

## Scene-by-scene prompt

**Scene 0 — Brand bumper (0:00–0:02, NEW)**
Background: Solid cream `#F4EFE7` full-bleed.
On-screen text: "SIYA HEALTH" (wordmark, centered, navy) with small line beneath: "Health Education Series"
Magenta accent rule under wordmark.
No VO (or soft ambient sting only).

**Scene 1 (0:02–0:06)**
Background: Warm home living room, two adult partners sitting close on a couch, shot from behind/side, faces not the focus.
On-screen text: "Do ADHD relationships ever work?"
Persistent tag (top-left): "SIYA HEALTH"
VO: "Do relationships with an ADHD partner ever actually work?"

**Scene 2 (0:06–0:10)**
Background: Same warm living-room world, hopeful light.
On-screen text: "Yes — when you face the hard parts"
VO: "Yes — they can. But not by pretending the hard parts aren't real."

**Scene 3 (0:10–0:13)**
Background: Couple together, warm natural light.
On-screen text: "Love can feel intense & genuine"
VO: "ADHD can make love feel intense and genuine —"

**Scene 4 (0:13–0:16)**
Background: Late-night home desk, laptop open, tired adult resting head on hand.
On-screen text: "Follow-through can still be inconsistent"
VO: "— and still make follow-through inconsistent."

**Scene 5 (0:16–0:20)**
Background: Close-up of hands holding a smartphone on a kitchen table, soft notification glow.
On-screen text: "Missed texts. Forgotten chores. Zoning out."
VO: "A missed text. A forgotten chore. Zoning out mid-conversation."

**Scene 6 (0:20–0:23)**
Background: Kitchen sink, a few unwashed dishes, soft window light.
On-screen text: 'Partners hear: "You don't care"'
VO: "Partners often hear: you don't care."

**Scene 7 (0:23–0:26)**
Background: Two people at a dining table mid-conversation, one gently looking away.
On-screen text: 'ADHD partner hears: "You're failing"'
VO: "The ADHD partner often hears: you're failing."

**Scene 8 (0:26–0:29)**
Background: Quiet end-of-day moment, soft dim warm light, contemplative.
On-screen text: "Resentment ↔ shame"
VO: "That's how resentment and shame trade places."

**Scene 9 (0:29–0:34) — Clinical credibility beat (STRENGTHENED)**
Background: Calm telehealth/consult moment — laptop video call with a clinician silhouette, notes visible, soft daylight (no white-coat drama, no stethoscope close-up).
On-screen text: "Clinicians describe this cycle"
Small citation-style sub-caption (Arial, smaller, navy): "Source: adult ADHD & relationship clinical guidance"
VO: "Clinical guides on adult ADHD and relationships describe this cycle."

**Scene 10 (0:34–0:37)**
Background: Adult sitting by a sunny window, eyes gently closed, calm pause.
On-screen text: "Symptoms ≠ character"
VO: "Symptoms aren't character flaws."

**Scene 11 (0:37–0:43)**
Background: Close-up of two hands over a shared notebook with a simple handwritten checklist.
On-screen text: "Pause. Systems. Shared ownership."
VO: "Couples who last pause before reacting, build simple systems together, and both own their part."

**Scene 12 (0:43–0:46)**
Background: Two people walking outdoors from behind, holding hands loosely, hopeful mood.
On-screen text: "ADHD doesn't doom love"
VO: "ADHD doesn't doom love. Unmanaged patterns do."

**Scene 13 (0:46–0:53)**
Background: Two mugs on a small table between two chairs near a window, soft daylight.
On-screen text: "One honest conversation this week"
VO: "If this is your relationship, start with one honest conversation this week."

**Scene 14 — Closing brand card (0:53–0:58, NEW — full-bleed cream, no B-roll)**
Background: Solid cream `#F4EFE7`.
On-screen text (stacked, centered):
```
SIYA HEALTH
Clarity-first health education

Educational only — not a diagnosis
or a substitute for professional care.

siya.health
```
Magenta accent rule between wordmark and tagline.
VO (soft, closing register): "Follow Siya Health for clarity-first education — and talk with a clinician if you're stuck."

---

## Full VO (single-field fallback)

```text
Do relationships with an ADHD partner ever actually work?

Yes — they can. But not by pretending the hard parts aren't real.

ADHD can make love feel intense and genuine — and still make follow-through inconsistent.
A missed text. A forgotten chore. Zoning out mid-conversation.

Partners often hear: you don't care.
The ADHD partner often hears: you're failing.
That's how resentment and shame trade places.

Clinical guides on adult ADHD and relationships describe this cycle.
Symptoms aren't character flaws.

Couples who last pause before reacting, build simple systems together, and both own their part.

ADHD doesn't doom love. Unmanaged patterns do.
If this is your relationship, start with one honest conversation this week.
Follow Siya Health for clarity-first education — and talk with a clinician if you're stuck.
```

---

## What changed vs. the plain avatar-free version

| Addition | Why it reads "healthcare," not "ordinary" |
|---|---|
| Opening brand bumper (Scene 0) | Signals a produced health-ed series, not a random reel |
| Persistent "SIYA HEALTH" tag every scene | Consistent institutional identity, not one-off content |
| Clinical-context scene (telehealth/consult) at the cycle-explanation beat | Visually grounds the clinical-guidance line instead of just B-roll |
| Citation-style sub-caption on Scene 9 | Signals sourced/validated content, builds trust |
| Full closing brand card + disclaimer + site | Matches how health orgs (not influencers) end educational content |
| Voice direction: "health-educator register," minimal underscore music | Avoids trending-audio/influencer feel |

**Guardrails (unchanged):** No avatar in any scene. No diagnosis claims, no guaranteed outcomes, no "toxic partner" framing, no white-coat drama or fear imagery. Keep the disclaimer visible on the closing card.
