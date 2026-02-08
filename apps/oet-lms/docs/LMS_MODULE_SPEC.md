# LMS Module Spec: Snippet-Based Activities & Evaluation

This document describes how the four modules (Comprehension, Chatting, Understanding, Communicating) use conversation snippets and clinical notes to generate activities, measure performance, and send results to supervisors.

---

## Data foundation

We have a **case library** of conversations with:

- **Transcript** — turn-by-turn dialogue (clinician, patient, narrator)
- **Clinical notes** — model notes for that conversation
- **Per-speaker voices** — TTS or pre-recorded audio per role

Cases are used across modules:

- **Comprehension:** listen to snippets → scribe and/or answer questions
- **Chatting:** scenario variations derived from snippets → chat with simulated patient → measured response
- **Understanding:** notes (or parts of notes) → MCQ + subjective questions
- **Communicating:** respond to snippets by speaking → recording evaluated (and/or talk to an NLP patient simulator)

---

## 1. Comprehension: Snippets + questions + supervisor email

### Flow

1. **Snippet generation**  
   From each case we can generate **snippets** (short segments of the conversation, e.g. 30–90 seconds or 3–8 turns). Each snippet uses:
   - **Proper voices per role** — clinician (e.g. male), patient (e.g. female), narrator (distinct) — either TTS or pre-recorded.

2. **Activity types**
   - **Listen → scribe** (current): play full conversation or snippet, learner types notes, compare to model notes.
   - **Listen → answer questions (new):**
     - **MCQ** — e.g. “What did the patient say about the pain?” (A/B/C/D)
     - **Subjective** — short free-text, e.g. “Summarize the plan in one sentence.”

3. **After submission**
   - Score/feedback shown to learner (completeness, accuracy, question correctness).
   - **Results sent to supervisor’s email** — summary of activity, snippet/ case id, score, answers (or key results), timestamp.

### Implementation outline

- **Snippet entity:** `snippetId`, `caseId`, `startTurnIndex`, `endTurnIndex`, optional `audioUrl` (or “use TTS from transcript”).
- **Questions:** `questionId`, `snippetId` or `caseId`, `type: 'mcq' | 'subjective'`, `prompt`, `options?` (for MCQ), `modelAnswer` or `keyPoints` (for marking).
- **Submission:** `activityId`, `snippetId`, `learnerId`, `answers`, `notes?`, `score`, `timestamp` → **email to supervisor** (config: `supervisorEmail` per learner or per org).

---

## 2. Chatting: Scenario variations + metrics

### Flow

1. **Scenario variations from snippets**  
   From the same case/snippet we derive **multiple scenario variants**, e.g.:
   - Same patient, different opener: “I’m still in pain” vs “When can I drive?”
   - Slightly different context (e.g. “post-op day 1” vs “post-op day 3”).
   - Different tone: more anxious, more factual, family member asking.

2. **Chatting activity**
   - Learner sees **scenario + clinical context** (from case notes or snippet summary).
   - “Patient” sends messages (scripted bot or LLM using case/snippet as context).
   - Learner replies; system records **promptness, appropriateness, personalization, empathy, understanding**.

3. **Metrics to measure**
   - **Promptness** — time to first reply, reply length vs expectation.
   - **Appropriateness** — on-topic, professional, no harmful advice.
   - **Personalization** — use of patient name/context, not generic.
   - **Empathy** — acknowledgment of feeling, supportive tone.
   - **Understanding** — correct clinical facts, matches case/notes.

4. **Delivery**
   - Per-message or end-of-chat scoring; optional **results to supervisor email** (same pattern as Comprehension).

### Implementation outline

- **Scenario variant:** `scenarioId`, `caseId`, `variantLabel`, `openerMessage`, `contextOverride?`, `scriptedReplies[]` or “use LLM with case as context”.
- **Chatting submission:** `activityId`, `scenarioId`, `learnerId`, `messages[]`, `metrics: { promptness, appropriateness, personalization, empathy, understanding }` → optional supervisor email.

---

## 3. Understanding: Notes + MCQ & subjective

### Flow

1. **Content**
   - Use **sample notes** (or sections of notes) from the case library — e.g. HPI, Plan, Impression — same style as the cardiology, ortho, post-MI/CKD, urology notes we already have.

2. **Activity**
   - Show a passage (one note or a part: e.g. “PLAN” only).
   - **MCQ** — “What is the next step?” / “Which medication was started?” etc.
   - **Subjective** — “What would you tell the patient about follow-up?” / “List two risks that were discussed.”

3. **Scoring & delivery**
   - Mark MCQ automatically; subjective can be rubrics or key-point matching (manual or LLM).
   - **Results to supervisor email** — same pattern: activity, passage id, score, answers, timestamp.

### Implementation outline

- **Passage:** `passageId`, `caseId`, `section` (e.g. `'plan' | 'hpi' | 'full'`), `text` (or derived from `case.clinicalNotes`).
- **Questions:** same shape as Comprehension: `passageId`, `type: 'mcq' | 'subjective'`, `prompt`, `options?`, `modelAnswer`/`keyPoints`.
- **Submission:** `activityId`, `passageId`, `learnerId`, `answers`, `score` → supervisor email.

---

## 4. Communicating: Audio response & optional NLP patient simulator

Two paths (can coexist):

### Path A: Respond to a snippet → send recording for evaluation

1. **Activity**
   - Play a **snippet** (with proper voices): e.g. “Patient says: ‘I’m really worried about the surgery.’”
   - Learner **records an audio response** (e.g. 1–2 min) as if talking to the patient.
   - Recording uploaded/stored and linked to activity + snippet.

2. **Evaluation**
   - **Option 1 — Human:** Supervisor or assessor listens and scores (rubric: clarity, empathy, accuracy, structure).
   - **Option 2 — AI:** Speech-to-text first, then LLM or rules on transcript for clarity/empathy/accuracy/structure. (Feasible but needs clear rubric and guardrails.)

3. **Delivery**
   - Results (score + feedback) to learner; **summary or link to recording to supervisor email**.

### Path B: NLP patient simulator (agent as patient)

1. **Setup**
   - **Simulator** = bot that plays the “patient” in a scenario (derived from a case/snippet).
   - Learner talks **live** (mic) or types; system captures **speech** (real-time or per turn).
   - Bot uses case + snippet + scenario to stay in character and respond.

2. **Flow**
   - Learner chooses scenario (e.g. “Post-op knee – patient in pain”).
   - Simulator speaks (TTS or pre-recorded) as patient; learner responds by voice.
   - System **records** both sides; analyses learner’s **response** (transcription → content/tone/empathy/accuracy).

3. **Evaluation**
   - Same as Path A: human listen or AI on transcript (clarity, empathy, accuracy, appropriateness).
   - **Metrics:** response time, turn-taking, use of lay language, safety (no harmful advice).

4. **Tech options**
   - **Simpler:** Turn-based: bot plays one utterance (from script or LLM), learner records reply, bot plays next. No real-time duplex needed.
   - **Richer:** WebRTC or similar for low-latency voice; ASR on learner; LLM or scripted tree for bot replies.

### Implementation outline (Communicating)

- **Snippet → prompt:** e.g. “Patient says: ‘…’. Record your response (1–2 min).”
- **Submission:** `activityId`, `snippetId` or `scenarioId`, `learnerId`, `audioBlobUrl` or `transcript`, `score`, `feedback` → supervisor email.
- **Simulator mode:** `scenarioId`, `scriptOrLLM`, `maxTurns`, `learnerAudio[]` → analyse each turn → aggregate score → supervisor.

---

## 5. Supervisor email (cross-module)

- **Config:** `supervisorEmail` (per learner, or per org/cohort). Could live in learner profile, org settings, or env.
- **Payload:** activity name, module, snippet/passage/scenario id, learner id/name, score, key answers or summary, link to full submission/recording if stored, timestamp.
- **Sending:** backend job or serverless (e.g. SendGrid, SES, or SMTP). The frontend can POST a “submit” payload to an API that scores and then triggers the email.

---

## 6. What exists today vs what to build

| Piece | Status |
|-------|--------|
| Case library (transcript + clinical notes) | Done |
| Per-role voices (TTS) for full conversation | Done |
| Comprehension: listen + scribe, compare to notes | Done |
| Comprehension: snippet → MCQ/subjective | To build |
| Comprehension: results → supervisor email | To build (needs backend/email) |
| Chatting: case-based scenario + opener | Done (static) |
| Chatting: multiple scenario variations, scripted/LLM bot | To build |
| Chatting: promptness, appropriateness, empathy, etc. | To build (rubric + optional LLM) |
| Understanding: show note passage + MCQ/subjective | To build |
| Understanding: results → supervisor email | To build |
| Communicating: record response to snippet | Partial (UI exists, no submit/eval) |
| Communicating: AI evaluation of recording/transcript | To build |
| Communicating: NLP patient simulator (turn-based voice) | To design & build |
| Supervisor email integration | To build (backend + config) |

---

## 7. Suggested next steps

1. **Comprehension:** Define snippet boundaries per case (e.g. by turn index); add question sets (MCQ + subjective) per snippet; add “Submit → score → trigger supervisor email” (stub API + config).
2. **Understanding:** Add passages (full note or section) and question sets; reuse same submission + email flow as Comprehension.
3. **Chatting:** Add scenario variants (opener + context) per case; implement scripted or LLM reply logic; define rubric for promptness/appropriateness/empathy/understanding and wire to submission.
4. **Communicating:** Add “respond to this snippet” flow with record → upload → optional STT → LLM rubric; document API contract for human evaluation; later, add turn-based “NLP patient simulator” using existing cases/snippets.

All of this can use the **same conversation snippets and notes** already in the case library; the main new work is snippet boundaries, question/passage sets, scoring logic, and supervisor email wiring.

---

## 8. Code reference

- **Types and scaffolding:** `src/data/activitySpec.ts` defines:
  - `Snippet`, `Question`, `QuestionSet`, `Passage`, `ChatScenarioVariant`, `CommunicatePrompt`, `SimulatorScenario`
  - `SubmissionPayload`, `SupervisorEmailConfig`, `submitActivity()`
  - Stub data: `STUB_SNIPPETS`, `STUB_QUESTION_SET` (example MCQ + subjective for one snippet)
- **Cases and voices:** `src/data/caseLibrary.ts`, `sampleConversations.ts`; per-role TTS in `ActivityRunner.tsx` (`pickVoiceForRole`).
- **Where to plug in:** ActivityRunner (or dedicated SnippetQuiz, NoteQuiz, Simulator components) can call `submitActivity(payload, supervisorConfig)` on submit; backend then scores and sends email.
