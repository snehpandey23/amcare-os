# Spoken Chat-Sim — turn-based speaking practice (design)

```text
Status: IMPLEMENTED (2026-09-13) — turn-based Speak mode on PatientChatSimulator
Date: 2026-09-13
Surface: Practice · Chat Simulator (spoken replies)
Reuse: patient-drill personas + evaluateSimulatorSession · Talk Mode WAV + /api/talk/cloud-stt · editable transcript review
Not: live two-way spoken dialogue · pronunciation / fluency scoring · new chat-sim rubric
Code: PatientChatSimulator.tsx · evaluate.ts (disfluency normalize) · progress.ts transcript audit fields · smoke-spoken-chat-sim.ts
```

---

## Executive verdict

| Question | Answer |
|----------|--------|
| Is a **spoken** chat-sim feasible now? | **Yes** — as **turn-based speak → transcript → score**, reusing proven parts. |
| Is **live two-way** spoken dialogue feasible now? | **No.** Out of scope. Fundamentally harder; this design does not attempt it. |
| What does it score? | **What was said** (via transcript) through the **existing** chat-sim rubric. |
| What does it *not* score? | Fluency, natural conversational flow, real-time responsiveness, pronunciation. |
| Effort (assembly of existing pieces)? | **Small–Medium** (lean Small if UI is a thin mode flag on chat-sim; Medium if polished UX + Ops ledger fields + exam wiring). |

**Realistic product name:** turn-based **speaking practice on chat-sim** — not a “live speaking test.”

---

## 1. Technical shape (confirmed)

### 1.1 Reuse chat-sim as-is

| Layer | Source of truth | Spoken mode change |
|-------|-----------------|-------------------|
| Personas / scenarios | `src/data/patient-drill/personas.ts` + patient-chat route | **None** — same persona, same turn bounds, same escalation |
| Grammar | `evaluateSimulatorSession` → `grammarScore` | Score the **submitted transcript** as if typed |
| Politeness | `politenessScore` | Same |
| Relevance / engagement | `relevanceScore` / `relevanceTurns` | Same |
| Safety tiers | `safety.ts` red-flag / soft-stop / walk-away | Same — transcript text only |
| Session ledger / Ops | Existing chat-sim progress + transcript save | Store `inputModality: "spoken"` + optional raw STT + edited transcript |

**Rule:** No parallel spoken rubric. If scoring changes, change chat-sim once; typed and spoken both inherit.

### 1.2 Capture path (proven pieces)

Turn capture reuses Talk Mode’s cloud path — not a new STT product:

| Piece | Already exists | Role in spoken chat-sim |
|-------|----------------|-------------------------|
| Mic WAV capture | `talk-wav-capture.ts` / Talk Mode cloud listen | Record one MA reply |
| Cloud STT | `POST /api/talk/cloud-stt` (Sarvam primary; Deepgram only for documented Sarvam mishears) | Transcript |
| Review-before-send | Talk Mode `cloudDraft` → show transcript → explicit Send | **Mandatory** before scoring (see §3) |
| Browser Web Speech | Talk default mic | Optional fallback; **not** primary for Hinglish clinic speech (bake-off / Hinglish design) |

Typed chat-sim send path stays: once the MA confirms the transcript (edit allowed), the string is appended as a normal `who: "you"` message and scored by `evaluateSimulatorSession` at session end — **identical** to keyboard entry.

Optional (not required for v1): play persona lines via existing browser TTS so the turn is heard as well as read. That is playback UX only; it does not create a live dialogue loop.

### 1.3 Turn-based loop (in scope)

```text
1. Persona turn shown (and optionally spoken aloud via TTS)
2. MA taps Hold-to-speak / Record → Stop
3. STT returns transcript → shown in editable review card
4. MA Edit (optional) → Submit reply  OR  Re-record  OR  Discard
5. System treats submitted text as typed chat-sim reply → persona next turn
6. Repeat until session end → existing feedback panel (Grammar · Politeness · Relevance · Safety)
```

**One MA utterance per turn.** No barge-in. No overlapping speech. No mid-sentence interruption of the persona. No continuous open mic.

### 1.4 Explicitly out of scope — live two-way conversation

Live two-way spoken dialogue would require, at minimum:

- Full-duplex audio + reliable end-of-turn / barge-in detection  
- Sub-second STT + persona LLM/TTS latency that still feels conversational  
- Scoring (or coaching) under interrupt and partial utterances  
- Different safety model when the MA speaks over a clinical red-flag turn  

That is a **voice-agent product**, not an assembly of chat-sim + Talk STT. **Infeasible for this practice surface with current stack and honesty bar.** Do not market turn-based spoken chat-sim as “live speaking test” or “conversation practice with a patient on the phone.”

---

## 2. Honest scoring boundary

Same honesty already used for Listening / reading-style practice: **coverage of content, not pronunciation.**

| Scored (via transcript) | Not scored (cannot claim honestly) |
|-------------------------|-------------------------------------|
| Grammar / clarity (chat register) | Pronunciation, accent, intonation |
| Politeness markers | “Sounds natural / fluent” |
| Relevance to persona ask | Real-time responsiveness / turn-taking skill |
| Safety tier hits in the words used | Conversational flow, repair strategies mid-speech |
| (Optional later) clinical-accuracy heuristics already on text | Speed-to-first-word as a graded skill |

**Display copy (required on feedback):**

> Spoken mode scores **what you said** after you confirm the transcript — the same Grammar, Politeness, Relevance, and Safety checks as typed chat-sim. It does **not** score pronunciation, fluency, or how quickly you replied.

WPM / typing pace from chat-sim does **not** apply to spoken turns (or show “n/a — spoken”). Do not invent a speech-WPM metric.

---

## 3. Known risk — STT unfairness (must mitigate)

### 3.1 Risk

Documented STT failure modes (Hinglish Talk design + 2026-09 bake-off) include:

- Hinglish / code-mix mishears  
- Clinic terms and short UI words garbled (e.g. Sarvam **Mick**←mic, **logos**←OS)  
- Medical / operational vocabulary not in general LM  

If we score the **raw** STT string, a correct spoken answer can fail Grammar/Relevance/Safety because the machine heard the wrong words. That is an **unfair penalty**, not an MA skill gap.

### 3.2 Mitigation (locked for v1)

**Review-before-submit — same pattern as Sarvam Talk prototype (`cloudDraft`):**

1. After STT, show transcript in an editable field.  
2. Labels: “This is what we heard — fix any mistakes before Submit.”  
3. Actions: **Submit** · **Edit** · **Re-record** · **Discard**.  
4. Only the **confirmed** text enters the chat-sim thread and rubric.  
5. Persist both when useful for Ops: `sttRaw` + `submittedText` + `sttProvider` (audit / bake-off follow-up — not for punishing the MA).

**Do not** auto-submit STT into scoring. **Do not** hide the transcript.

Optional later: light “STT confidence low — please review” banner; still never skip human confirm.

---

## 4. Effort estimate

| Band | When it fits | What’s left |
|------|----------------|-------------|
| **Small** | Practice-only mode toggle on existing `PatientChatSimulator`; reuse Talk WAV + cloud-STT + draft UI patterns; no competency-exam wiring | ~UI glue + modality flag on ledger + copy; smoke: speak→edit→score path |
| **Small–Medium** (expected) | Above + persona TTS playback + Ops transcript shows modality + a few Hinglish clinic phrases in QA | Copy/QA pass; no new scorer |
| **Medium** | Also wire into competency exam / weighted “speaking” section | Policy + weights + founder review — **product** work beyond assembly |
| **Large** | Live two-way, pronunciation models, continuous dialogue scoring | **Rejected** for this design |

**Why not Large:** scoring engine, personas, safety, STT route, and review-before-send already exist. This is **composition**, not new capability — unless scope creeps into live dialogue or pronunciation AI.

---

## 5. Proposed UX sketch (non-binding)

| Element | Behavior |
|---------|----------|
| Mode | Chat-sim entry: **Type replies** (default) · **Speak replies** |
| During spoken turn | Mic control + timer; persona bubble locked until Submit |
| Review card | Transcript, Edit, Re-record, Submit |
| End screen | Existing feedback; spoken honesty line; WPM hidden/n/a |
| Fallback | “Prefer typing?” one-tap switch mid-session without losing thread |

---

## 6. Acceptance checks (when built)

1. Same persona session scored identically if the **same final text** was typed vs spoken+confirmed.  
2. Raw STT that differs from edited submit must **not** be what `evaluateSimulatorSession` sees.  
3. Feedback copy states content-not-fluency boundary.  
4. No marketing or UI string claims “live conversation” or “pronunciation score.”  
5. Smoke: cloud STT draft → edit one token → submit → relevance/grammar run on edited text.

---

## 7. Decision ask

Approve **turn-based spoken chat-sim** as the realistic “speaking practice” v1, with:

- reuse of Grammar · Politeness · Relevance · Safety  
- Talk Mode STT + **mandatory transcript review**  
- live two-way dialogue **explicitly deferred / out of scope**  

Build estimate: **Small–Medium** assembly. No content bank rewrite required for v1.
