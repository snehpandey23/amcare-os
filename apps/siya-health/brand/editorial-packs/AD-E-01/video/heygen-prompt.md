# AD-E-01 — HeyGen prompt (Siya Health branded, avatar-free, evaluation-focused)

Paste into HeyGen's **Text-to-Video / AI Studio**, project type **Scene-based, Avatar = None**.

## Global settings

```text
Project type: Scene-based video (no avatar / no digital human)
Aspect ratio: 9:16 (1080x1920)
Voice: Calm, validating, non-shaming — health-educator register, not influencer. US English, ~150 wpm.
Caption style: Burned-in cream card, navy Georgia-style serif text, thin magenta accent rule ≤3 words
Persistent brand tag: "SIYA HEALTH" wordmark, top-left, every scene, opaque cream chip
Brand colors: Navy #001878 (text) · Magenta #D81088 (accent only) · Cream #F4EFE7 (chip/caption bg)
Music: Minimal low string/piano underscore — no trending audio
Tone: Validating, non-shaming, hopeful. Video objective = drive people to take the free screening (evaluation), not just inform.
Visual restriction: No rage/tears-close-up stock, no purple glow, no double exposure or collage
```

## Scene-by-scene prompt

**Scene 0 — Brand bumper (0:00–0:02)**
Background: Solid cream `#F4EFE7` full-bleed.
On-screen text: "SIYA HEALTH" wordmark centered, navy, with small line: "Health Education Series."
No VO (soft ambient sting only).

**Scene 1 (0:02–0:05)**
Background: Adult mid-pause at a kitchen or desk, calm face, soft morning light, subject weighted to the right third of frame. Quiet intensity, not dramatic.
On-screen text: "Nothing halfway."
VO: "Nothing halfway."

**Scene 2 (0:05–0:09)**
Background: Same warm interior, slightly wider, contemplative pause.
On-screen text: 'Feelings don\'t arrive at a "normal" volume'
VO: "With ADHD, feelings don't always arrive at a normal volume."

**Scene 3 (0:09–0:14)**
Background: Doorway or hallway pause — adult standing still, soft confusion, optional phone face-down on a table nearby.
On-screen text: "Overloaded. Then frozen. Everyone else has moved on."
VO: "One moment you're completely overloaded. The next, you're frozen — while everyone else has already moved on."

**Scene 4 (0:14–0:17)**
Background: Soft reset moment — closed laptop, resting hands on a table, calm daylight. No rage imagery.
On-screen text: "Not a lack of willpower"
VO: "That's not a lack of willpower."

**Scene 5 (0:17–0:22)**
Background: Same calm reset scene or a quiet outdoor walk, soft daylight.
On-screen text: "Feelings that are hard to steer — not a choice"
VO: "It's emotional dysregulation — feelings that are hard to steer, not feelings you're choosing to have."

**Scene 6 (0:22–0:26)**
Background: Warm home scene with a subtle calendar or sticky-note prop — represents "more than focus/fidgeting."
On-screen text: "The overlooked side of ADHD"
VO: "It's one of the most overlooked sides of ADHD — not just focus, not just fidgeting."

**Scene 7 (0:26–0:31) — Clinical credibility beat**
Background: Calm telehealth/consult moment — laptop video call, clinician silhouette, notes visible, soft daylight (reuse `editorial-adhd-consult.jpg` style).
On-screen text: "Research links this to real daily struggle"
Small citation sub-caption: "Source: clinical research on adult ADHD & emotional dysregulation"
VO: "Research on adult ADHD links this kind of emotional intensity to real difficulty at work and in relationships."

**Scene 8 (0:31–0:36)**
Background: Notebook or phone notes app in soft light, hands writing a short list — trigger / duration / sleep.
On-screen text: "Track it: trigger · duration · sleep"
VO: "One thing that helps: track it for two weeks — what triggered it, how long it lasted, how much sleep you got."

**Scene 9 (0:36–0:41) — The open question (tension peak)**
Background: Solid cream or soft dim room, text-forward, bold navy serif question visual weight.
On-screen text: "A rough patch… or something deeper?"
VO: "So is this just a rough patch — or something your brain has been carrying for a long time?"

**Scene 10 (0:41–0:45) — Siya Health answers**
Background: Cream full-bleed brand card, calmer register shift signals "the answer" has arrived.
On-screen text: "Siya Health: you don't have to guess alone"
VO: "Siya Health's answer: you don't have to guess alone."

**Scene 11 (0:45–0:48)**
Background: Same cream brand-card energy, or a hopeful daylight scene (adult exhaling, relieved).
On-screen text: "Free screening — minutes, not months"
VO: "A free screening can help you find out — in minutes, not months."

**Scene 12 — Closing brand card (0:48–0:53)**
Background: Solid cream `#F4EFE7`.
On-screen text (stacked, centered):
```
SIYA HEALTH
Take the free screening today

Educational. Not medical advice or a diagnosis.
In crisis? Contact local emergency services.

siya.health/adhd-screening
```
VO: "Take the free screening today. Understanding it is the first step to feeling steadier."

---

## Full VO (single-field fallback)

```text
Nothing halfway.
With ADHD, feelings don't always arrive at a normal volume.

One moment you're completely overloaded. The next, you're frozen — while everyone else has already moved on.

That's not a lack of willpower.
It's emotional dysregulation — feelings that are hard to steer, not feelings you're choosing to have.

It's one of the most overlooked sides of ADHD — not just focus, not just fidgeting.
Research on adult ADHD links this kind of emotional intensity to real difficulty at work and in relationships.

One thing that helps: track it for two weeks — what triggered it, how long it lasted, how much sleep you got.

So is this just a rough patch — or something your brain has been carrying for a long time?

Siya Health's answer: you don't have to guess alone.
A free screening can help you find out — in minutes, not months.

Take the free screening today. Understanding it is the first step to feeling steadier.
```

**Guardrails:** No avatar. No stimulant/medication claims. No bipolar misdiagnosis statistics. No RSD-as-DSM-diagnosis framing. No ADHD-vs-PTSD comparison. No self-diagnosis language ("this means you have ADHD"). No invented statistics. Keep the disclaimer + crisis line visible on the closing card.
