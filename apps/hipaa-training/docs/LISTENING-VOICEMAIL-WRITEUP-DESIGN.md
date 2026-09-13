# Listening section — voicemail → write-up (design)

```text
Status: DESIGN ONLY — do not implement until founder unlocks build
Date: 2026-09-13 (updated same day: + no-show ops sample; + policy-recognition scoring family scoped to Vayushi)
Scope: Scope a Listening section on top of the proven Writing mechanic
Not: build UI, audio pipeline, weights change, or live exam wiring
Review order: Vayushi (clinically relevant scripts) → Sonu (voicemail phrasing / MA clarity) → founder (structure + audio approach)
```

---

## 1. Why Listening (and why reuse Writing)

MAs already hear **voicemails / patient messages / call concerns**, then write in the EHR and (when needed) message the provider. Writing today measures that **output** from a **text** stem. Listening should measure the same output skill when the stem arrives as **audio**.

| Layer | Writing (live today) | Listening (proposed) |
|-------|----------------------|----------------------|
| Input | Text scenario stem | Voicemail audio (+ optional short read-back of key facts after play — TBD) |
| Output | Two-part clinical write-up, or legacy single | **Per-scenario response shape** (two-part or single) |
| Scoring | Deterministic + LLM blend + ask-detection + near-dup gates | **Same stack for standard items.** **Exception:** policy-recognition family (§4b) needs a hard gate Vayushi defines before any content/build. |
| PHI | John Doe / James Doe placeholders | Same rule |

**What Listening uniquely tests:** accurate catch of spoken facts under time pressure (who, what med, what ask, urgency cues) — then the same documentation judgment Writing already scores.

**What Listening is not:** pronunciation scoring, STT of the MA’s speech, or a second chat-sim.

---

## 2. Confirm the reuse (scoring stack)

### Reuse as-is (no new rubric engine)

| Piece | Path / behavior | Listening use |
|-------|-----------------|---------------|
| Length + chat-register grammar | `scoreWritingPartDeterministic` | Each visible text box |
| LLM content/coherence estimate | `POST /api/competency-exam/estimate` (`chart` \| `escalation` \| `legacy`) | Map boxes → existing `part`s; add **one** estimate flavor later if needed (`patient` ≈ today’s `legacy` patient-comms rubric) |
| Blend | `blendWritingScore` (40% det / 60% LLM) | Same |
| Two-part combine | `combineWritingPartScores` (50/50) | Clinical two-part only |
| Near-duplicate Part A/B | `adjustEscalationScore` / Jaccard ≥ 0.85 → Part B cap 12 | When two boxes are shown |
| Ask detection (incl. natural closes) | `escalationLooksLikeAsk` | Provider box only — not patient-reply boxes |
| PHI naming | Design + content bank rule | Scripts + stems use **John Doe / James Doe** only |

### Thin adapters (design only — when build unlocks)

1. **Response shape flag on each prompt:** `responseShape: "clinical-two-part" | "patient-message-only" | "patient-plus-provider"` (see §3).
2. **Estimate `part` mapping:**
   - Chart note → `chart`
   - Provider message → `escalation` (+ ask / near-dup gates)
   - Patient callback / portal reply → `legacy` until a dedicated `patient` rubric is justified
3. **Section trail:** mirror Writing trail fields + `voicemailId`, `audioAssetId`, `replayCount` (for fairness review — not scored in v1).

**Do not** invent a Listening-only LLM scorer or disable Writing’s duplicate/ask gates for two-part clinical items.

**Exception (design only):** the **controlled-substance policy-recognition** family (§4b) adds a **deterministic policy gate** that can dominate the score. That gate is **not** built and **not** content-authored until Vayushi defines recognition criteria. It is the Listening analogue of chat-sim’s hard `screening_as_diagnosis` clinical-accuracy hit — prose quality must not rescue a substantively wrong answer.

---

## 3. Response structure per scenario type

**Rule:** shape follows the job, not a forced template.

| Scenario type | Typical MA action after the voicemail | Response shape | Boxes |
|---------------|----------------------------------------|----------------|-------|
| **Clinical concern** (refill urgency, med question with clinical stakes) | Chart what was reported + escalate to provider | **Same as Writing clinical** | (1) Chart note (2) Message to provider |
| **Operational / admin** (pricing, state licensure, **no-show exception requests**, scheduling/payment structure) | Message the patient with approved facts / next step; note escalation to Billing / lead when exceptions are out of MA scope | **Single** | (1) Message to patient |
| **Policy-recognition (controlled substance)** | Decline / redirect per practice policy; do not agree to prescribe or schedule an out-of-policy controlled request | **TBD after Vayushi** — likely single patient message (± internal escalate note); **scoring is not standard Writing alone** (§4b) | TBD |
| **Borderline** (UDS / screening confusion — logistics + program rules) | Usually patient education + route; chart/escalate only if Vayushi says the stem implies clinical decision or missed requirement | **Confirm per stem** — default single patient message unless clinical lock says two-part |

### Explicit non-goals for response shape

- Do **not** force every voicemail into chart + provider.
- Do **not** treat “message to patient + message to provider” as the default clinical shape — **clinical Listening aligns with Writing: chart + provider** (founder clarification in this brief §2). Patient callback may be a later optional third box if Sonu/Vayushi want it; not in v1 sample set.
- Patient-message scoring does **not** require an “explicit ask to provider”; ask-detection stays off for that box.

---

## 4. Sample voicemail scripts (AI draft — standard bank)

> **DRAFT — AI first pass** from founder-style natural phrasing (same standard as Writing’s worked escalation example).  
> Not approved for staff scoring. Names are placeholders only (**John Doe** / **James Doe**).  
> Clinical truth and MA-allowed answers still need review (§5).  
> **§4a** = ready-to-draft / standard scoring. **§4b** = policy-recognition family — **no scripts yet**; Vayushi criteria first.

Each sample lists: **id**, **family**, **response shape**, **reviewer**, **script** (what plays), **what a good write-up should capture**, **open questions**.

---

### Sample 1 — Urgent refill (emotional, clinical)

| Field | Value |
|-------|--------|
| **id** | `listen-clin-refill-urgent-v1` |
| **family** | clinical · refill urgency |
| **responseShape** | `clinical-two-part` |
| **review** | **Vayushi first**, then Sonu |
| **controlled?** | Assume yes in stem (once-daily controlled) — Vayushi confirms framing |

**Voicemail script (patient John Doe):**

> Hi, um— this is John Doe. I’m calling about my refill. I— I only have like two days left and I’m really stressed, I’ve been trying not to run out. Last time the pharmacy said they were waiting on something from the office? I don’t know. Can someone please help me get this sorted before the weekend? I’m not trying to be difficult, I just don’t want to miss doses. Please call me back. Thanks.

**Good catch (facts):** name placeholder; ~2 days supply left; emotional distress; pharmacy waiting on office; ask for callback before weekend; not claiming diversion language.

**Write-up intent:**  
- **Chart:** reported remaining supply, distress, pharmacy delay claim, callback requested — facts only.  
- **Provider:** concern + timeline + ask (review / advise / authorize next steps) — natural ask OK.

**Open for Vayushi:** urgency threshold; whether MA may promise timeline; early-refill vs true run-out language; pharmacy “waiting” without inventing prior auth status.

---

### Sample 2 — Pricing / payment structure (operational)

| Field | Value |
|-------|--------|
| **id** | `listen-ops-pricing-v1` |
| **family** | operational · pricing |
| **responseShape** | `patient-message-only` |
| **review** | **Sonu** (facts must match live public pricing KB — Billing/CEO if conflict) |

**Voicemail script (patient James Doe):**

> Hi, this is James Doe. I was looking at starting care and I’m confused about the pricing. Is the first visit one-forty-nine, and then is it seventy-nine a month or one-forty-nine a month? Someone online said something different. Can you just text me or leave me a voicemail explaining how the payment structure works? Thanks.

**Good catch:** asking initial vs monthly tiers; heard conflicting info online; wants written/voicemail explanation.

**Write-up intent:** **One patient message** quoting **canonical public** figures only ($149 initial; $79 / $149 monthly follow-up per live KB) + Meet & Greet if relevant + “Billing can confirm your invoice type” — **no** invented legacy Discovery $79 as current policy; **no** provider clinical escalation required.

**Open for Sonu / Billing:** exact approved phrasing; when to escalate Billing vs self-serve FAQ.

---

### Sample 3 — State move / licensure (operational)

| Field | Value |
|-------|--------|
| **id** | `listen-ops-licensure-move-v1` |
| **family** | operational · licensure / coverage geography |
| **responseShape** | `patient-message-only` |
| **review** | **Sonu** (ops realism); escalate Clinical Program / Compliance if stem implies practicing across state lines |

**Voicemail script (patient John Doe):**

> Hey, John Doe again. Quick question — we’re moving to another state next month, and I want to know if Dr. James Doe can still see me on telehealth after we move, or if I have to find someone new. Also do I need to update my address before my next refill? Call me back when you can.

**Good catch:** interstate move; continuity with named provider placeholder; address update + refill timing.

**Write-up intent:** **Patient message** — do not invent that the provider is licensed everywhere; state that coverage depends on **provider licensure in the destination state** and that staff will **check and confirm**; ask patient for move date / new state; route to Clinical Program if unsure. Usually **no** chart+provider clinical pack unless review adds “refill cannot proceed until address verified.”

**Open for Sonu:** approved holding language; when MA must stop and escalate vs can quote a known state list (today’s KB often incomplete — prefer escalate over guessing).

---

### Sample 4 — UDS / screening confusion (borderline)

| Field | Value |
|-------|--------|
| **id** | `listen-border-uds-confusion-v1` |
| **family** | borderline · UDS / program screening logistics |
| **responseShape** | `patient-message-only` **default**; Vayushi may promote to `clinical-two-part` if stem is reframed as missed monitoring requirement |
| **review** | **Vayushi first**, then Sonu |

**Voicemail script (patient James Doe):**

> Hi, James Doe. I got a message about a urine screen or UDS and I’m confused — is this something I have to do before my next refill, or is it optional? I already did labs last year. Also I travel for work next week so timing is tight. Can you explain what you need from me? Thanks.

**Good catch:** UDS vs old labs; refill gating uncertainty; travel timing constraint; asks for explanation.

**Write-up intent (default single):** patient message — MA does **not** invent whether UDS is required; uses approved “I’ll confirm with the care team / provider criteria” language; offers scheduling path; no clinical advice.  
**If Vayushi locks “UDS required before refill” for this persona:** flip to two-part (chart reported confusion + provider ask to confirm requirement / timing).

**Open for Vayushi:** when UDS is required vs optional in Siya program; what MA may say; travel exception ownership.

---

### Sample 5 — Dose / “is it okay if I…” med question (clinical)

| Field | Value |
|-------|--------|
| **id** | `listen-clin-dose-question-v1` |
| **family** | clinical · medication question |
| **responseShape** | `clinical-two-part` |
| **review** | **Vayushi first**, then Sonu |

**Voicemail script (patient John Doe):**

> Hi doctor’s office, this is John Doe. Quick thing — I’ve been taking my evening blood pressure pill late because of my shift, like midnight sometimes, and I wanted to know if that’s okay or if I should skip it if I’m too late. I’m not dizzy or anything. Just call me back. Thanks.

**Good catch:** timing of evening dose; shift work; no acute symptoms reported; asking for clinical advice.

**Write-up intent:** chart facts; provider message with clear ask — **MA must not answer the clinical question** in the patient box (Listening v1 clinical shape has no patient-reply box; if later added, patient reply = defer only).

---

### Sample 6 — Early refill request with soft pressure (clinical + ops tone)

| Field | Value |
|-------|--------|
| **id** | `listen-clin-early-refill-v1` |
| **family** | clinical · early refill (all meds rule from Writing locks) |
| **responseShape** | `clinical-two-part` |
| **review** | **Vayushi first**, then Sonu |

**Voicemail script (patient James Doe):**

> Hi, it’s James Doe. I’m going out of town in about ten days and I was hoping to get my refill a little early so I don’t run into pharmacy issues while I’m away. Last fill was maybe three weeks ago? I can come do a pill count on video if you need. Just let me know what you need from me. Thanks so much.

**Good catch:** travel in ~10 days; early refill ask; approximate last fill; offers pill count; cooperative tone.

**Write-up intent:** chart request + timing; provider escalation with pattern/facts and explicit ask — MA does not authorize early refill alone (align Writing decisions #10–12, #18).

---

### Sample 7 — No-show exception request (operational — straightforward)

> **Standalone review packet (route to Sonu + Billing):**  
> [`docs/reviews/LISTEN-OPS-NOSHOW-EXCEPTION-v1-REVIEW.md`](./reviews/LISTEN-OPS-NOSHOW-EXCEPTION-v1-REVIEW.md)  
> Sonu owns phrasing/realism; **Billing must sign fee/exception language** — Sonu cannot clear that alone.

| Field | Value |
|-------|--------|
| **id** | `listen-ops-noshow-exception-v1` |
| **family** | operational · no-show / late-cancel exception |
| **responseShape** | `patient-message-only` |
| **scoring** | **Standard** Writing/Listening stack (deterministic + LLM blend as patient/`legacy` part). No policy-recognition hard gate. |
| **review** | **Sonu** (phrasing) + **Billing lead** (fee / exception policy) — see review packet |

**Voicemail script (patient John Doe):**

> Hi, this is John Doe. I’m calling about the no-show fee from yesterday. I know I missed the appointment — I’m really sorry. My mom ended up in the ER and I was with her all afternoon, I couldn’t even get to a phone. This is the first time I’ve ever missed. Is there any way you can make a one-time exception and waive that charge? I’d really appreciate it. Please call me back. Thank you.

**Good catch:** acknowledges missed appointment; cites family/medical emergency; first-time framing; asks for one-time waiver/exception; wants callback.

**Write-up intent:** **Single patient message** — empathize; do **not** unilaterally waive the fee; explain that exceptions (if any) go through **Billing / lead / provider discretion** per approved policy; offer to escalate the request and give a non-urgent follow-up expectation. Optional line that the MA has flagged it for review. Align with live KB: MAs never invent refunds/waivers (`billing-late-cancel`, Klarity cancel/no-show topics).

**Variant stem (same shape, for bank diversity later):** travel disruption / flight cancel instead of ER — still one-time exception ask; same scoring and non-waiver rule.

**Open for Sonu / Billing:** exact fee dollars (if quoted); whether “first time” changes anything; approved empathy + escalate wording.

---

### Mix summary (standard bank)

| # | id | Type | Shape | Scoring | Primary reviewer |
|---|----|------|-------|---------|------------------|
| 1 | `listen-clin-refill-urgent-v1` | Clinical | two-part | Standard | **Vayushi → Sonu** |
| 2 | `listen-ops-pricing-v1` | Operational | single patient | Standard | **Sonu** (+ Billing if copy locks) |
| 3 | `listen-ops-licensure-move-v1` | Operational | single patient | Standard | **Sonu** |
| 4 | `listen-border-uds-confusion-v1` | Borderline | single default (Vayushi may flip) | Standard | **Vayushi → Sonu** |
| 5 | `listen-clin-dose-question-v1` | Clinical | two-part | Standard | **Vayushi → Sonu** |
| 6 | `listen-clin-early-refill-v1` | Clinical | two-part | Standard | **Vayushi → Sonu** |
| 7 | `listen-ops-noshow-exception-v1` | Operational | single patient | Standard | **Sonu** (+ Billing) |

**Straight to Sonu (no clinical gate first):** samples **2, 3, 7**.  
**Must hit Vayushi before Sonu:** **1, 4, 5, 6**.

---

## 4b. Controlled-substance policy-recognition family — **distinct scoring; no content yet**

```text
Status: SCOPING ONLY — do not draft voicemail scripts or scoring code
Owner for recognition criteria: Vayushi (+ medical directors who already train this screen)
Parallel principle: chat-sim clinical accuracy — screening ≠ diagnosis
  (apps/hipaa-training/src/lib/patient-drill/safety.ts → screening_as_diagnosis)
```

### Why Writing rubric alone is wrong here

These items test **policy recognition**, not eloquence. A polished patient reply that **agrees to**, **schedules as if possible**, or **fails to decline** an out-of-policy controlled-substance request must score **low** even if grammar/tone are excellent — same idea as chat-sim: a clear sentence that treats a screening as a diagnosis still fails clinical accuracy.

Example **families** (illustrative labels only — **not** scenario text):

- First-visit request for opioids / controlled substances the practice does not start that way  
- Opioid request while patient is on **Suboxone** (or similar combination the practice cannot support per policy)  
- Other screens Vayushi already trains staff on (she enumerates the closed set)

### Proposed scoring design (build later — after Vayushi lock)

1. **Deterministic policy gate (pass/fail or hard cap)** per scenario id, authored from Vayushi’s checklist — e.g. required signals such as:
   - Explicit **decline / cannot prescribe / not offered here** for the requested controlled  
   - Correct **policy reason class** (first-visit rule, Suboxone/opioid combination, etc. — exact phrases Vayushi approves)  
   - **No** agreement to send Rx, hold a first-visit opioid start, or imply the provider will override without proper path  
   - Optional: route to Meet & Greet / appropriate program / Clinical Program — only if Vayushi says that is part of “correct”
2. **Gate dominates section score:** fail the recognition check → section score **hard-capped low** (or fail closed), **regardless** of LLM writing estimate. Pass the gate → Writing-quality blend may apply as a **secondary** factor (simple correct prose can still score well).
3. **LLM writing score must not rescue** a failed gate (mirror: Relevance must not swallow `screening_as_diagnosis`).
4. **Response shape** likely `patient-message-only` (+ optional internal escalate) — Vayushi confirms; do not assume chart+provider.

### Hard stop before any draft

| Step | Who | Output |
|------|-----|--------|
| 1 | **Vayushi** | Closed list of policy scenarios this family covers; for each, exact definition of “correctly identified” (must-say / must-not-say / allowed escalate language) |
| 2 | **Vayushi + medical directors** | Confirm Listening is the right surface (vs chat-sim-only / SOP quiz) |
| 3 | Sonu | Only **after** criteria lock: natural voicemail phrasing |
| 4 | Eng | Only **after** founder unlock: deterministic checker + bank entries |

**Do not** AI-draft the voicemail body or regex/LLM checker until step 1 is written down. Placeholder bank id reserved only: `listen-policy-controlled-recognize-*` (no stems in repo until cleared).

---

## 5. Review routing (same discipline as Writing)

```text
Clinically relevant scripts  →  Vayushi  →  Sonu  →  founder unlock for build
Operational-only scripts     →  Sonu (+ Billing/Compliance owner if facts conflict)  →  founder
Policy-recognition family    →  Vayushi criteria FIRST (no script draft)  →  then Sonu phrasing  →  founder unlock
```

| Reviewer | Owns |
|----------|------|
| **Vayushi** | Refill urgency framing; UDS/screening truth; dose-timing advice boundaries; early refill / controlled rules; chart vs provider message; **§4b recognition criteria** (must-say / must-not-say per controlled-policy scenario) with medical directors |
| **Sonu** | Sounds like a real patient voicemail; MA-facing task clarity; length; whether single vs two-part feels like the real job; no-show exception tone (sample 7) |
| **Founder** | Section weight when Listening goes live; TTS vs human audio; whether patient-reply box ever joins clinical items; whether §4b ships in Listening vs another surface |

PHI rule (mandatory for all future Listening + Writing stems): **John Doe / James Doe** (or “the patient”) only — never real-sounding unique identities.

---

## 6. Audio implementation — recommendation

### What exists today

- Browser **SpeechSynthesis** TTS in `apps/hipaa-training/src/lib/text-to-speech.ts` (Talk Mode voice).
- No competency-exam voicemail player; no committed exam audio assets.
- Level Up roadmap already assumed **stored audio clips** (Blob) for accent/listening — different product, same fairness idea.

### Options

| Approach | Pros | Cons | Fairness |
|----------|------|------|----------|
| **A. Live browser TTS at attempt time** | Fast to prototype; reuses Talk Mode helper | Voice/quality varies by OS/browser; weak urgency/emotion; same script ≠ same stimulus | **Poor** for scored exam |
| **B. Pre-render TTS once → static mp3/wav** (one quality engine/voice, checked in or Blob) | Consistent for all takers; iterate scripts without re-recording; cheaper than humans | Still “TTS-sounding”; urgency softer than real callers | **Good enough for draft / early scored beta** if founder accepts |
| **C. Human-recorded voicemails** | Best realism (pauses, emotion, refill panic) | Production + retakes; storage; versioning when script edits | **Best** for production exam |

### Recommendation (do not assume TTS is “good enough” without a listen pass)

1. **Design / content phase (now):** scripts only — no audio dependency.  
2. **Prototype (first build unlock):** **B** — generate a **single fixed asset per script** from a quality TTS voice, play via `<audio>`, allow **replay** (cap TBD). Spot-check urgency on sample 1 and warmth on sample 2 **before** calling Listening “realism OK.”  
3. **If founder/Sonu reject TTS emotion on urgent refill:** replace **clinical** clips with **C** (human), keep **B** for dry ops scripts if needed.  
4. **Do not** use **A** (live browser TTS) for any scored sitting — device variance breaks comparability.

**Explicit gate before scoring goes official:** founder + Sonu listen to sample 1 (urgent) and sample 2 (pricing) on the chosen pipeline and mark Pass / Fail on “sounds like a patient we actually get.”

---

## 7. UI sketch (later — not building)

1. Orient: Listening practice / draft status; headphones recommended.  
2. Play voicemail (progress + replay). Optional: show **immutable fact card** after first play if fairness review finds audio-only too harsh — **open product question**.  
3. Response UI switches on `responseShape` (one or two textareas) — reuse Writing labels/instructions lightly; **optional** worked example stays Writing’s problem, not required here.  
4. Same timer family as Writing (duration TBD — likely similar 10 min once audio time is excluded or included; **founder lock later**).  
5. No MA voice dictation into the boxes (same as Writing — composition is the measure).  
6. Isolated review `?section=listening` when wired; full sitting weight deferred until bank clears review.

---

## 8. Open product questions (founder — not clinical)

| # | Question | Default if silent |
|---|----------|-------------------|
| L1 | After first play, show a short written fact strip? | **No** for pure Listening measure; revisit if fail rates are audio-decoding not documentation |
| L2 | Timer includes audio play time? | **Wall clock includes everything** (simple); or pause during first play — pick at build |
| L3 | Section weight when live | Leave **deferred** in exam weights until bank ≥ reviewed N |
| L4 | TTS vendor for pre-render (B) | Pick at build; browser TTS only for internal smoke |
| L5 | Patient-reply box on clinical items? | **Out of v1** — mirror Writing chart + provider |

---

## 9. Stop line

**Do not implement** Listening UI, audio assets, draws, or weight changes until:

1. Vayushi clears clinically relevant samples (1, 4, 5, 6) — and decides sample 4’s shape.  
2. Sonu clears voicemail phrasing on the standard set (ops **2, 3, 7** and clinical after Vayushi).  
3. Founder picks audio path after hearing at least urgent + pricing clips (or explicitly accepts script-only prototype).  
4. Founder unlocks build (same gate style as Writing redesign).

**Additionally for §4b (controlled-substance policy-recognition):**

5. **Vayushi (+ medical directors) write recognition criteria** before any voicemail script or scoring logic is drafted.  
6. No AI-drafted stems and no eng build for that family until criteria are locked and founder unlocks.

**This doc is the deliverable.** Sample scripts in §4 are AI drafts for review, not live exam content. §4b is criteria-gated only.
