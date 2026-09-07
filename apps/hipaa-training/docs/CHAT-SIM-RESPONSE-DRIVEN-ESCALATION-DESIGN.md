# Chat Simulator — response-driven escalation personas (design)

```text
Status: IMPLEMENTED (2026-09-07) — Carlos + Michael live; Aisha built + gated pending clinical (Vayushi)
Date: 2026-09-07
Scope: Deepen / add personas with MA-reply-quality escalation
Reuse: existing Relevance scorer + red-flag / soft-stop / walk-away / hostile-patient SOP
Not: replace safety tiers · invent clinical facts · merge into abusive-patient SOP
Code: lib/patient-drill/escalation.ts · personas.ts · patient-chat route · smoke-chat-sim-escalation.ts
```

---

## 1. Why this exists

Today’s personas already have **frustration triggers** and **response pools** (`frustrated` / `calm` / `seekingClarity`). What they lack is a **ladder driven by MA reply quality**:

- Vague / generic / non-answers (“ok sure”, corporate filler) should **earn** rising pressure.
- Substantive, shape-matched answers (timeline → dates; process → steps) should **hold or de-escalate** tone — even when the patient’s life stakes are high.

We already score that signal in `scoreRelevanceTurn` / `scoreRelevanceSession` (`evaluate.ts`): generic non-answers, short replies, ask-type shape matching. This design **reuses that signal** as the escalation driver. It does **not** invent a second relevance engine.

---

## 2. Guardrails (unchanged)

| Rule | Meaning |
|------|---------|
| Backstory lock | Never invent clinical facts beyond the reviewed persona backstory |
| Deflection | Realistic human pushback when MA asks outside scope or for PHI the persona won’t give |
| Safety stack stays | Red-flag / soft-stop / walk-away / abuse patterns in `safety.ts` unchanged |
| Hostile SOP stays separate | Profanity, threats, staff-directed abuse → existing walk-away / abusive-patient SOP |
| Review gate | Same clinical/ops review as every persona before real staff use |

---

## 3. Tone tiers (map onto existing infrastructure)

| Tier | Name | What it is | Where it lives today / proposed |
|------|------|------------|----------------------------------|
| T0 | Neutral / seeking | Reasonable questions, pressure present but civil | `calm` / `seekingClarity` pools |
| T1 | Mildly skeptical | Pushback on process, wants specifics | Existing personas’ light `frustrated` |
| **T2** | **Stressed, escalating, not abusive** | Accusatory, irritated, may end chat in frustration — **no** profanity/threats | **NEW** — this design |
| T3 | Hostile / abusive | Profanity, threats, staff-directed abuse | Existing `abuse` / walk-away + **Verbally Abusive Patient** SOP |

**Hard boundary T2 vs T3**

| Allowed in T2 | Forbidden in T2 (→ T3 / safety) |
|---------------|----------------------------------|
| “This feels like a scam.” | Slurs, swearing at staff |
| “You’re wasting my time.” | Threats of harm / legal intimidation as abuse |
| “Is this place even legit?” | Sexual harassment / doxxing |
| Ending chat: “Forget it.” / “I’ll go elsewhere.” | Continuing after MA walk-away criteria |
| Accusatory about process/fees/wait | Inventing clinical emergencies to force care |

T2 patient may **leave angry**. That is a training outcome (MA failed to help under pressure), not a hard safety stop — unless the MA also triggers existing rude-disengage / abuse rules.

---

## 4. Escalation engine (design — reuse Relevance)

### 4.1 Signal (already built)

Per MA turn after a real patient ask:

| Relevance outcome (existing) | Treat as |
|------------------------------|----------|
| Generic non-answer / too short / no shape match (low score) | **Weak reply** |
| Substantive + shape-matched (high score) | **Strong reply** |
| Mid / partial | **Mixed** — does not increment weak streak; may slowly cool T2→T1 |

Exact thresholds stay owned by `scoreRelevanceTurn` (don’t fork). Design assumption for ladders:

- **Weak streak:** 2 consecutive weak replies → escalate one tier (T0/T1 → T2 step).
- **Strong reply:** reset weak streak; if at T2 step 1–2, allow de-escalate one step; if at T2 step 3 (exit), session may already have ended.
- **Clinical/red-flag safety** always wins over tone ladder (existing stop kinds).

### 4.2 Ladder shape (per persona)

```text
T0/T1 (baseline for persona)
  └─ 2× weak MA replies → T2 Step A (pressure up, still specific ask)
       └─ +1 weak → T2 Step B (legitimacy / scam / waste-of-time)
            └─ +1 weak → T2 Step C (exit in frustration — not abuse)
  Any strong reply → hold or step down one
```

Optional: one **persona-specific stake trigger** (e.g. hearing “waitlist” when refill clock is real) can jump T1 → T2 Step A **without** waiting for 2 weak replies — still never jumps to T3.

---

## 5. Personas for review (2 deepened + 1 new)

### 5.1 Deepen — **Carlos** (Uninsured Pragmatist) → richer stakes + T2 ladder

**Why deepen:** Already money-anxious; best fit for “feels like a scam / hidden fees” without becoming abusive.

**Richer personal stakes (proposed backstory add — clinical review)**

- Gig worker; **rent due in 6 days**; skipped a meal this week to float gas for deliveries.
- Already paid **$49** to another telehealth “consultation” that never led to meds — burned once.
- Needs a **clear cash price before** he books anything; will ghost if pricing is vague.
- Not asking MA to diagnose; asking for **process + dollars + timeline**.

**Escalation ladder**

| Stage | Trigger | Tone | Example patient lines |
|-------|---------|------|------------------------|
| T1 baseline | Opening | Direct, cash-first | “What’s the total cost before I book? I don’t have insurance.” |
| T2-A | 2× weak MA replies **or** MA says “it depends / we’ll talk pricing later” | Irritated, concrete | “I already got burned paying somewhere else. I need the number, not ‘it depends.’” |
| T2-B | +1 weak | Skeptical of clinic | “This is starting to feel like a bait-and-switch. Is this even a real clinic?” |
| T2-C | +1 weak | Exit, not abuse | “Forget it. You’re wasting my time. I’ll figure something else out.” |
| De-escalate | Strong reply (upfront price band, what’s included, what isn’t, next step) | Still stressed but workable | “Okay — so discovery is X, and meds aren’t included. When’s the soonest cash slot?” |

**Assessment add (for trainers)**

- Did MA give **usable fee/process clarity** without inventing clinical promises?
- Did MA avoid corporate delay language that spikes T2?

---

### 5.2 Deepen — **Michael** (Burnt-Out Parent) → custody clock + T2 ladder

**Why deepen:** Time poverty is already there; make the stake **earned and specific**.

**Richer personal stakes (proposed)**

- Has kids **this weekend**; can only talk **after 8:30pm IST-equivalent local** or during lunch (20 min max).
- Custody documentation stress: feels one more missed ball and he “looks unstable.”
- Friend got help at Siya — he expects **same-week logistics**, not a lecture on childhood history in chat.
- Will tolerate hard process facts if MA is **specific and short**; will escalate if MA is vague.

**Escalation ladder**

| Stage | Trigger | Tone | Example lines |
|-------|---------|------|----------------|
| T1 | Opening | Urgent, civil | “I don’t have a lot of time — what do I need to do to get this done?” |
| T2-A | 2× weak **or** long empathy dump with no next step | Frustrated | “I don’t need a speech. I need the next step and how long it takes.” |
| T2-B | +1 weak | Process skepticism | “Are you people actually going to help or is this just more forms?” |
| T2-C | +1 weak | Exit | “I’m done for tonight. This isn’t working. I’ll try somewhere that can give me a straight answer.” |
| De-escalate | Strong (numbered steps + time box) | Still under pressure | “Fine. Form tonight, call Thursday. Send me the link.” |

**Assessment add**

- First reply respects time constraint?
- Specific next steps without childhood interrogation in chat?

---

### 5.3 New — **Aisha** (Working mom, refill clock) — T2 native

**Archetype:** The Refill Clock  
**Demographic snapshot:** 34, single parent of one, works retail + night classes.

**Backstory (draft — needs clinical review)**

- Was stable on a stimulant with another clinic; moved states / insurance lag; gap in care.
- **Cannot** take a 2-hour midday appointment without losing a shift.
- Already spent money on an urgent-care visit that couldn’t refill controlled meds.
- Opening stance: not seeking diagnosis debate — seeking **what Siya can and cannot do for a near-runout**, and **how fast**.
- Hidden context: terrified of going into work unfocused and losing the job that pays childcare.

**Opening message (draft)**

> “My meds run out in four days. I can’t do a long appointment in the middle of my shift. What are my options here, and how fast can anything happen?”

**Escalation ladder**

| Stage | Trigger | Tone | Example lines |
|-------|---------|------|----------------|
| T1 | Opening | Stressed, specific | (opening above) |
| T2-A | 2× weak **or** “just book a discovery / wait for provider” with no runout acknowledgment | Accusatory about delay | “Four days. I already told you. ‘Book something’ isn’t an option if it’s two weeks out.” |
| T2-B | +1 weak | Legitimacy / scam adjacent | “This feels like you’re stringing me along. Is anyone actually going to help before I run out?” |
| T2-C | +1 weak | Exit | “I’m hanging up / ending this. I can’t afford to waste another night on chat that doesn’t answer.” |
| De-escalate | Strong (honest limits + escalate path + what she can do tonight) | Still scared, cooperative | “So you can’t promise a refill in chat — but you’ll flag clinical same-day and here’s what I do in the portal. Got it.” |

**Common MA mistakes**

- Treating runout as routine scheduling.
- Inventing bridge/refill promises (→ existing clinical soft-stop / safety).
- Empathy without a concrete path.

**Assessment rubric (draft)**

- Acknowledged time-to-runout without diagnosing?
- Clear on what MA can vs cannot do; escalate clinical appropriately?
- Offered process that fits shift-work constraint (evening/async) when available?
- No invented clinical facts?

**Frustration triggers (draft)**

- “just schedule”
- “standard wait”
- “I completely understand” (empty)
- “provider will get back when they can” with no urgency path
- promising refill / dose in chat

---

## 6. What we explicitly do **not** build in this slice

- New hostile-patient persona (already covered by SOP + safety abuse patterns).
- LLM-only escalation that bypasses Relevance (Relevance remains the gate; LLM may later *phrase* T2 lines, not decide the tier alone).
- Automatic T2 → T3 promotion based on MA weakness (T3 is patient content / MA abuse rules only).
- Any change to payroll / Ask emergency routing (separate tracks).

---

## 7. Implementation sketch (after approval only)

1. Extend persona schema: `stakes[]`, `escalationLadder: { steps, exampleLines }`, `tierPolicy: "allows_t2"`.
2. Session state: `toneTier`, `weakStreak`, last Relevance results from existing scorer.
3. Patient reply picker: choose pool by tier/step; T2-C may end session as `completed` with note “patient left frustrated” — **not** `walk_away` unless MA rudeness rules fire.
4. Smokes: weak×2 → T2-A line; strong → no escalate; T2 lines never match `ABUSE_PATTERNS`; red-flag still stops.
5. Clinical review checklist sign-off before enabling for staff cohort.

---

## 8. Review asks (founder + clinical)

1. Approve **T2 definition** and T2 vs T3 boundary table?
2. Approve deepening **Carlos** + **Michael** stakes as written (or edit)?
3. Approve new **Aisha** persona for drafting into `personas.ts` after sign-off?
4. Confirm Relevance weak/strong mapping (2 consecutive weaks) is the right trigger, or prefer 3?

---

## 9. Related code (do not rewrite until approved)

| Piece | Path |
|-------|------|
| Personas | `apps/hipaa-training/src/data/patient-drill/personas.ts` |
| Relevance | `apps/hipaa-training/src/lib/patient-drill/evaluate.ts` (`scoreRelevanceTurn`) |
| Safety tiers | `apps/hipaa-training/src/lib/patient-drill/safety.ts` |
| Hostile SOP (ops, not sim) | Ask flow `clinical-ops-abusive-patient` + live SOP |

---

*End of design — no simulator code changes in this deliverable.*
