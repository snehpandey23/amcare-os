# Spoken chat-sim — STT accuracy study (no transcript edit)

**Purpose:** Decide whether the review-before-send step can be removed, using **real staff speech**, not synthetic TTS and not founder-only runs.

**Rule:** Whatever cloud STT returns is what gets scored. No edit · no re-record · no discard-to-retry. That is the only honest measure of whether the tool works without the human patch.

**Not evidence:** macOS `say` bake-off in `STT-BAKEOFF-HINGLISH.md` (already caveated). That corpus cannot answer this question.

---

## Protocol (founder / Ops)

1. Recruit **5 staff** who will use Speak mode in English (clinic-style replies). Not the founder alone.
2. Each person opens:

   `https://www.siyahealth.net/learn/chat-simulator?sttStudy=1`

   (or local equivalent). Banner must say **STT accuracy study**.
3. Enter a short staff label (initials OK). Choose any persona. Stay on **Speak**.
4. Complete **3–5 turns**:
   - Hear/read the patient line (TTS plays when Speak is on).
   - Tap **Record** → speak one reply → **Stop & send** (auto-submits raw STT).
   - Immediately fill: **what you actually said** + **Fair / Unfair** for scoring that STT against what you said.
5. End the session → download the JSON (auto prompt). Collect all five files.
6. Aggregate:

```bash
cd apps/hipaa-training && npx tsx scripts/aggregate-stt-study.ts path/to/*.json
```

**Decision bar (plain):** if **≥90%** of turns are marked **fair**, that is evidence the review step can be removed. If not, the investment is **STT accuracy** (provider / domain), not more UI workarounds — keep review until the number moves.

---

## Per-turn fields (in JSON)

| Field | Meaning |
|-------|---------|
| `intendedSaid` | Self-report right after the turn |
| `sttTranscript` | Unedited cloud STT that was scored |
| `fairForScoring` | `fair` \| `unfair` — would scoring this text be fair for what they said? |

---

## What this does *not* prove

- Pronunciation / fluency quality  
- Live two-way phone dialogue  
- That one founder mic session generalizes to the team  
