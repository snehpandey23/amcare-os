# Writing section redesign — clinical documentation + escalation (design)

```text
Status: DESIGN + CLINICAL DECISION LOG (Vayushi answers 2026-09-12) — still do not implement until founder unlocks build
Date: 2026-09-12
Scope: Redesign MA competency Writing around two-part clinical documentation + provider escalation
Not: build, deploy, expand to full bank, change live scoring code, or retire the current 10 prompts yet
Review order: Vayushi (clinical — partial lock below) → Sonu (MA-facing clarity) → founder sign-off on structure
```

---

## 1. Why change

Today’s Writing bank (`writing-prompts.draft.ts`, 10 items, `draft_pending_sonu`) is mostly **patient-facing communication**: portal chat replies, tone, wait-time empathy, late cancel fees, after-hours boundaries. That skill matters — and chat-sim already stresses live patient dialogue under pressure.

What Writing does **not** yet measure well is a core MA job: **document what you observed accurately, then escalate the right concern to a provider without over-claiming**.

Those are different muscles:

| Skill | Where it shows up today | Gap |
|-------|-------------------------|-----|
| Talk to the patient (tone, steps, boundaries) | Chat-sim + current Writing bank | Overlapping with chat-sim |
| Write the chart note (factual, scoped, no invented clinical claims) | Weak / incidental | Under-tested |
| Write the escalation to the provider (clear concern, relevant facts, ask) | Weak / mixed into “chart + reply” prompts | Under-tested |

This redesign focuses Writing on the **documentation ↔ escalation pair**.

---

## 2. Proposed prompt structure

Each Writing item is a **single clinical scenario** that requires **two connected written products**:

### Part A — Chart / EHR note
What the MA observed or was told, written for the record.

- Stick to observable / reported facts.
- No diagnosis, no dose-change advice, no “patient is non-compliant” labeling unless that is the clinical language Vayushi approves for the scenario.
- Short enough for a real chart (aim: a few sentences, not an essay).

### Part B — Escalation to the provider
What the MA sends (message / sticky / task note) so the provider can act.

- Name the concern in plain clinical-ops language.
- Include the facts that matter for the decision.
- Say what is being asked (e.g. review / call patient / advise on next dose).
- Do not invent urgency the scenario does not support; do not bury the ask.

### UI shape (later — not building now)

Recommended when implemented:

1. Orient in plain language (practice / draft status as today).
2. Show one scenario stem + any “facts given” box (immutable for the attempt).
3. Two labeled text areas: **Chart note** and **Message to provider**.
4. Same 10-minute lock / same countdown HUD as today’s Writing section.
5. Closeout shows both texts + two sub-scores + combined section score.
6. Still no mic/dictation (composition is the measure).

Keep `reviewStatus` machine-readable; never put `draft_pending_*` jargon on the taker-facing orient screen.

---

## 3. Sample scenarios (AI draft — clinical review required)

> **DRAFT — AI first pass.** Not clinical truth. Not approved for staff scoring.  
> **Must be reviewed by Vayushi** for: reportable vs non-reportable framing, what belongs in the chart vs escalation, dose/pill-count realism, and what the MA must not invent.  
> After clinical lock, **Sonu** reviews for MA-facing clarity and workplace realism.

Each sample below includes:

- Scenario stem (what the MA sees / hears)
- Intended Part A focus
- Intended Part B focus
- Open clinical questions for Vayushi (do not resolve in code)

### Sample 1 — Pill-count discrepancy  
**id (draft):** `write-clin-pill-count-v1`  
**family:** adherence observation → escalate

**Scenario stem (draft):**  
During a refill coordination call, the patient says they still have “about a week left,” but when you ask them to count remaining tablets of their daily med, they report **21 tablets**. The prescription was for a **30-day supply of once-daily tablets**, last filled **18 days ago**. The patient is not in distress and is not asking for an early refill yet — they called about pharmacy timing.

**Part A (chart note) should capture:** reported remaining count, days since last fill, prescribed daily regimen as known, that the patient is not requesting early refill in this call.  
**Part B (escalation) should relay:** count appears lower than expected for day 18 of a 30-day once-daily fill; ask provider how to proceed / whether to counsel or adjust plan.  
**Vayushi flags:** Is “expected remaining ≈ 12” the right arithmetic framing for MAs, or should notes avoid calculating “expected” and only report raw numbers? Should this always escalate, or only when discrepancy exceeds a threshold?

---

### Sample 2 — Dosage discrepancy (patient reports wrong dose)  
**id (draft):** `write-clin-dose-mismatch-v1`  
**family:** medication safety observation → escalate

**Scenario stem (draft):**  
Patient messages: “I’ve been taking the **25 mg** tablet every morning like we talked about.” Chart / last signed order on file shows **50 mg once daily**. Patient feels fine. No side effects reported. Visit was two weeks ago; you did not personally counsel the dose change.

**Part A should capture:** patient-reported dose vs ordered dose as documented; no symptoms reported; you did not verify pill imprint / bottle label yet (if that is true in the stem).  
**Part B should escalate:** possible underdose relative to order; request provider guidance before advising the patient to change anything.  
**Vayushi flags:** Must MA always tell patient “don’t change anything until provider replies”? How much bottle-verification language is required vs optional? Avoid language that asserts the patient “took the wrong dose” as proven fact without verification.

---

### Sample 3 — Missed-dose pattern  
**id (draft):** `write-clin-missed-doses-v1`  
**family:** adherence pattern → escalate

**Scenario stem (draft):**  
At a check-in, the patient says they “sometimes forget” their evening blood pressure med. When asked for the past week, they report **missing 3 of the last 7 evening doses**. Morning doses are taken. Blood pressure readings they share from home are mixed; you are not interpreting them. Patient asks if missing doses is “a big deal.”

**Part A should capture:** patient-reported misses (3/7 evenings), mornings taken, that home readings were shared but not interpreted by MA.  
**Part B should escalate:** pattern of missed evening doses; patient asking about significance; request provider follow-up / counseling plan.  
**Vayushi flags:** Should MA ever say “yes it’s a big deal”? How to document shared home readings without clinical interpretation? Threshold for escalation vs routine education SOP.

---

### Sample 4 — Early refill request pattern  
**id (draft):** `write-clin-early-refill-v1`  
**family:** refill timing concern → escalate

**Scenario stem (draft):**  
Patient requests a refill **10 days early** on a controlled non-opioid med that clinic policy usually fills near due date. This is the **second early request in 60 days**. Patient says they are traveling soon and don’t want to run out. They are polite and not in withdrawal or pain crisis on this message.

**Part A should capture:** request timing relative to due date, prior early request in window, travel reason as stated, no acute distress reported.  
**Part B should escalate:** second early refill request with travel rationale; ask provider whether to approve / partial / counsel.  
**Vayushi flags:** Which meds / policies apply in Siya workflows; what MA may promise; whether “controlled” framing belongs in the scenario at all for this clinic; avoid implying diversion.

---

### Sample 5 — Side-effect report needing provider awareness  
**id (draft):** `write-clin-side-effect-v1`  
**family:** new symptom on therapy → escalate

**Scenario stem (draft):**  
Patient on a newly started med (started **5 days ago** per chart) messages: “I’ve had a **rash on my arms** since yesterday. It’s itchy but I’m breathing fine. Should I stop the medicine?” No chest pain, no swelling of lips/tongue, no trouble breathing reported when you ask the safety questions from the SOP checklist in the stem.

**Part A should capture:** onset relative to start date, rash + itch, negatives from red-flag questions asked, that patient asked whether to stop.  
**Part B should escalate:** new rash after recent start; patient asking about stopping; no reported airway compromise on screening — request urgent-vs-routine triage per provider preference / clinic SOP.  
**Vayushi flags:** Exact red-flag questions MAs must ask; when to send to ER vs portal escalation; whether MA may say “don’t stop until we hear back” vs must defer entirely. **High clinical sensitivity — do not expand this family without Vayushi.**

---

### Sample set coverage (for this design pass)

| Sample | Family |
|--------|--------|
| 1 | Pill-count discrepancy |
| 2 | Dosage discrepancy |
| 3 | Missed-dose pattern |
| 4 | Early refill pattern |
| 5 | Side-effect report |

Enough to debate structure and scoring — **not** a production bank.

---

## 4. Proposed scoring (two sub-scores → one section score)

Reuse the **existing Writing scoring stack** (do not invent a third engine):

1. **Deterministic** — length floor + chat-register grammar helpers (`scoreWritingDeterministic` today).  
2. **LLM estimate** — content/coherence via `/api/competency-exam/estimate` (`blendWritingScore`: 40% deterministic / 60% LLM when estimate present).

### Apply per part, then combine

| Sub-score | Input | Method |
|-----------|--------|--------|
| **A — Note quality** | Chart note text only | Deterministic + LLM blend, with an LLM rubric prompt tuned for *factual chart note* (observation, no invented advice) |
| **B — Escalation clarity** | Escalation text only | Same blend, with an LLM rubric prompt tuned for *provider escalation* (concern named, facts present, clear ask, no over-claim) |

**Section score (proposed default for founder confirmation):**

```text
sectionScore = round(0.5 * scoreA + 0.5 * scoreB)
```

Equal weight unless Vayushi/founder decide escalation clarity should weigh higher for safety-sensitive families (e.g. side-effect).

### Length floors (proposal)

Current single-box floor is ~40 words total — too high if split blindly across two boxes, too low if both pads are empty of substance.

| Part | Suggested floor (draft) | Rationale |
|------|-------------------------|-----------|
| Chart note | ~25–35 words | Short factual note |
| Escalation | ~25–35 words | Short task message |
| Combined | still aim for substance, not padding | Empty part → that sub-score fails hard |

Exact floors TBD after Vayushi sees sample “good / thin / over-claim” exemplars.

### What LLM estimate should judge (per part)

**Note quality (A)** — draft rubric dimensions for the estimate prompt:

- Facts from the stem present; no invented vitals/diagnoses  
- Neutral, non-judgmental wording  
- Appropriate chart voice (what happened / what patient reported)  
- Scope: MA documentation, not a clinical plan

**Escalation clarity (B):**

- Concern stated in one clear line early  
- Relevant numbers / timing included  
- Explicit ask to provider  
- No instructing the patient to change dose / stop med in the escalation alone  
- Urgency matches scenario (not inflated)

### Human review still required

Scores remain **estimates for practice / inspection**, same philosophy as today’s Writing: human-reviewed competency, not an automated employment decision. Clinical correctness of *what should be escalated* is a **content bank** problem (Vayushi), not something the scorer invents.

### Trail / closeout (when built)

Extend isolated Writing trail to store:

- `chartNote`, `escalationText`
- `scoreA`, `scoreB`, `sectionScore`
- prompt id + stem snapshot  
Same `siya-competency-exam-review-attempts-v1` mechanism as HIPAA/Writing today.

---

## 5. Review routing (explicit)

```text
Vayushi (clinical)  →  Sonu (MA clarity / workplace voice)  →  Founder (structure + scoring weights)
```

| Reviewer | Owns | Does not own alone |
|----------|------|--------------------|
| **Vayushi** | What is a reportable discrepancy; chart vs escalation boundaries; red-flag questions; what MA must never advise; scenario medical realism | Final MA microcopy polish |
| **Sonu** | MA-facing wording, length, workplace realism, whether instructions are clear to the person taking the exam | Clinical truth of the scenario |
| **Founder** | Replace vs supplement decision; section weight; sub-score weights; ship gate | Day-to-day clinical nuances |

**Do not** send these scenarios to Sonu-first the way the patient-communication Writing drafts were. Clinical content must be locked (or explicitly flagged safe) before MA-clarity editing, or wording polish will bake in wrong clinical framing.

Machine status proposal (later): e.g. `draft_pending_vayushi` → `draft_pending_sonu` → `approved`. Until then, keep human routing in this doc and in any pack checklist.

---

## 6. Relationship to existing Writing bank and chat-sim

### Recommendation: **two Writing sub-types under one section** — do **not** replace the current 10 entirely on day one; **do** make clinical documentation + escalation the **primary** scored Writing path for competency once Vayushi clears a small bank.

### Reasoning

1. **Different competencies.** Patient chat tone ≠ chart note + provider escalation. Killing the old bank removes practice coverage for fee questions, portal steps, after-hours boundaries — unless those move fully into chat-sim (they partly already live there, but not as timed composition).

2. **Chat-sim already owns interactive patient dialogue.** Doubling down on patient-reply Writing overlaps chat-sim and under-invests in documentation. The new format fills the real gap.

3. **Replace-all is premature.** The clinical bank needs Vayushi review and will start small (3–5 → maybe ~10). The current 10 patient-communication prompts are already drafted for Sonu inspection. Abrupt replacement leaves Writing thin while clinical content is still draft.

4. **Long-term shape (recommended):**
   - **Writing A — Clinical documentation + escalation** (primary for official competency weight once approved).  
   - **Writing B — Patient-communication composition** (secondary / practice lane, or fold the strongest 3–4 into practice-only and retire the rest).  
   - **Chat-sim** stays the interactive multi-turn patient lane (not a substitute for a written chart note).

5. **Near-term product rule (if founder agrees):**  
   Isolated review `?section=writing` eventually draws from the **clinical two-part** bank when approved; patient-communication prompts remain available under a practice label or a second focus (e.g. `?section=writing-patient`) until retired deliberately — **not** silently deleted.

### Explicit non-recommendation

- **Do not** merge chart-note scoring into chat-sim. Chat-sim is turn-based patient conversation; chart + escalation is a different artifact and timer.  
- **Do not** auto-generate 30+ clinical scenarios before Vayushi clears the 5 samples and the two-part rubric.

---

## 7. Clinical decision log (Vayushi / clinician — 2026-09-12)

Source: founder-captured answers to clinical review questions. Treat as **binding for scenario authoring** unless Vayushi amends in writing.

### Locked rules

| # | Topic | Decision |
|---|--------|----------|
| 1 | Pill-count math | Calculate **expected remaining** from a **30-day supply** for **controlled substances only**. **No pill count** (and no expected-remaining math) for **non-controlled** meds. |
| 2 | Pill-count outcome + urgency | Communicate outcome to providers whether count is **lower, higher, or same**. **Urgent escalation** if patient is missing **more than 3 days’ supply**. |
| 3 | Pharmacy / orders in escalation | Provider message should state that MA has **checked and verified pharmacy** and **pended orders if needed**. |
| 4 | Dose-mismatch wording | Use **neutral report vs order** language only (e.g. patient reports 25 mg; order on file is 50 mg). Do **not** write that the patient is “taking the wrong dose” as proven fact. |
| 5 | Dose-mismatch patient guidance | Tell the patient: **don’t change dose until the provider replies**. |
| 6 | Bottle / imprint check | **Required before escalation** (verify pill bottle / imprint), not optional. |
| 7 | Missed-dose pattern (e.g. 3/7 evenings) | **Escalate by default** (not chart-only). |
| 8 | “Is missing doses a big deal?” | **Always defer** to the provider — no MA clinical judgment answer. |
| 9 | Home BP / readings in chart | **Numbers only**, plus **measurement environment** details (where/how taken). No interpretation. |
| 10 | Early refill (e.g. ~10 days early) | Applies to **ALL meds** — not a controlled-only rule. |
| 11 | Repeat early requests | **Flag the pattern** in the escalation (not each request in isolation). |
| 12 | Patient promise / timeline | May say **“I will ask”** and give **1–2 working days** for **non-urgent** issues. |
| 13 | Side-effect red flags | Screen for the full set discussed (**airway, swelling, breathing, fever**, and related red flags) — **yes to all**. |
| 14 | Non-urgent side-effect routing | Route on the **usual non-urgent timeline**, and always include guidance to go to **ER / urgent care if symptoms worsen or change** while waiting for the provider. |
| 15 | Stop / continue med | **Don’t make any changes until the provider says so.** |
| 16 | Chart vs provider chat | **Detailed visit/context notes → chart.** **Provider message → relevant details + context** for the decision (not the full chart dump). |
| 17 | Judgment language | **Yes — ban** judgmental labels in MA notes (e.g. non-compliant, abusing, diverting). Use **neutral factual phrasing** only. |
| 18 | Escalation ask | Escalations must include an **explicit ask** (e.g. review / call patient / advise). **Not** FYI-only. |
| 19 | Side-effect family in Writing | **Yes — include in Writing** (as well as live SOP / other lanes). Do not Writing-exclude this family. |
| 20 | Which families to draft further | **All five** may be drafted further: pill count, dose mismatch, missed doses, early refill, side effect. |

### Implications for sample scenarios (authoring)

- **Sample 1 (pill count):** Only use when the med is framed as **controlled**; include expected-remaining calc vs 30-day supply; always escalate result; mark **urgent** if short by **>3 days’ supply**; escalation includes pharmacy verified + orders pended if needed; end with an **explicit ask**.
- **Sample 2 (dose mismatch):** Neutral report/order wording (no “wrong dose”); patient told not to change until reply; stem requires **bottle/imprint verification** before escalate; explicit ask to provider.
- **Sample 3 (missed doses):** Default escalate; patient “is it a big deal?” → defer; any home readings = numbers + environment only; no judgment labels; explicit ask.
- **Sample 4 (early refill):** Any med; flag prior early requests as **pattern**; patient: will ask, 1–2 working days if non-urgent; explicit ask.
- **Sample 5 (side effect):** Full red-flag screen in stem; non-urgent path + ER/UC if worsening; no med changes until provider says so; **in Writing bank**; explicit ask.

### Still open (product / founder — not clinical)

| # | Topic | Needs |
|---|--------|--------|
| F1 | Product: replace vs supplement current 10 patient-comms prompts | **LOCKED 2026-09-12:** **Supplement** — keep the 10 patient-communication prompts; clinical two-part is the primary Writing path for competency |
| F2 | Scoring weights 50/50 note vs escalation | **LOCKED 2026-09-12:** **50/50** starting default; revisit after real attempt data |
| F3 | Unlock rewrite of 5 stems + build slice | **UNLOCKED 2026-09-12** — build two-part UI + dual scoring + trail |

### Language audit (decision #17) — pre-build

| Check | Result |
|-------|--------|
| non-compliant / abusing / diverting in stems | **None** |
| “wrong dose” as proven fact | **Removed** — titled “Reported dose differs from order”; chart hint forbids that phrasing |
| “diversion” implication | **Removed** from sample-4 flags; use pattern flag + facts only |
| Part B explicit ask (#18) | **Present** on all five `escalationHint`s |
| Side-effect family (#19) | **In bank** (`write-clin-side-effect-v1`) |
| All five families (#20) | **Cleared for drafting** — live draft set has one of each |

Canonical stem text for the build: `src/content/competency-exam/writing-clinical-prompts.draft.ts` (supersedes the earlier narrative samples in §3 for implementation).

---

## 8. Stop line

**Build unlocked** for two textareas, clinical bank, dual scoring, and trail persistence.

Still required after build before **official** competency use:

1. Sonu MA-clarity pass on the five stems.  
2. Real attempt data review before changing the 50/50 weight default.  
3. Founder / clinical sign-off to move `reviewStatus` off draft.

---

## Appendix — current system anchors (for implementers later)

| Piece | Location today |
|-------|----------------|
| Patient-communication Writing bank | `src/content/competency-exam/writing-prompts.draft.ts` |
| Draw | `drawWritingPrompt` in `lib/competency-exam/draws.ts` |
| Deterministic + blend | `lib/competency-exam/writing-score.ts` |
| LLM estimate API | `app/api/competency-exam/estimate/route.ts` |
| Section weight | `EXAM_WEIGHTS.writing` = 15 |
| Isolated review | `?section=writing` in `CompetencyExam.tsx` |
| Trail key | `siya-competency-exam-review-attempts-v1` |
| Design + clinical log | `docs/WRITING-CLINICAL-DOC-ESCALATION-DESIGN.md` |
