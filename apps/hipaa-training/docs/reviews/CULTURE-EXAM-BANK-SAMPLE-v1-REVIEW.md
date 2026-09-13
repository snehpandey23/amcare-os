# Content review — Culture / language exam bank sample v1

```text
Status: DRAFT — pending Sonu review (not live exam content)
Date: 2026-09-13
Section: Culture / language (MCQ) — competency exam
Draft bank: apps/hipaa-training/src/content/competency-exam/culture-bank-exam.draft.ts
Live bank: CULTURE_EXAM_APPROVED remains [] until items are approved
Scoring (when live): same MCQ pattern as HIPAA — deterministic correct/incorrect;
  drawUnseen + seen-set (culture-draw.ts) — do not import daily trivia
Not: enable section, merge to live bank, or bulk-generate beyond this sample
```

---

## Review routing (do not collapse)

| Reviewer | Owns | Required? |
|----------|------|-----------|
| **Sonu** (sole content reviewer) | Realism; MA usefulness; clarity; non-repetition vs daily Practice trivia; Pass / Revise / Drop | **Yes** |
| **Vayushi** | Clinical accuracy | **No** — no clinical content |
| **Sneha** | Compliance / HIPAA | **No** — not this pack |

**Rule:** Sonu may rewrite stems/options for clarity. Drop any item that feels obscure trivia or overlaps the daily drill bank (capitals, postal abbreviations, bare “when is Thanksgiving,” Lone Star, Phoenix DST, etc.).

**Founder:** confirms section weight and composite revisit (below) after Sonu’s pass — not required to grade each stem.

---

## Scope (confirmed)

Practical, everyday US context an MA benefits from on calls and at the desk:

| Topic | Count in sample | Workplace angle |
|-------|----------------:|-----------------|
| Currency / pricing | 5 | Spoken dollar amounts, cents, cash language |
| Units | 5 | °F, gallons, pounds, miles — patient speech fluency |
| Holidays | 5 | Scheduling / hours / travel weeks (not calendar trivia for its own sake) |
| Idioms | 5 | Common phrases on phone / chat |
| Cultural refs | 4 | 911, ZIP, PCP, “football” = NFL |

**Out of scope for this bank:** obscure pop culture, sports deep cuts, political trivia, state capitals / abbreviations (daily bank).

---

## Scoring & section design

1. **Reuse HIPAA MCQ pattern** — keyed `correctIndex`, score = correct/total for the draw; no partial credit; seen-set avoids repeats across retakes (`culture-draw.ts` + `drawUnseen`).
2. **Draw size (proposal when live):** ~10–12 items per sitting from approved pool (mirror HIPAA’s “subset of bank” idea; exact N for founder later).
3. **Section weight — recommend keep provisional `culture: 10`** (already in `EXAM_WEIGHTS`, parity with Typing).

### Composite weights — founder confirmation needed

Current coded weights (culture held; listening not in `EXAM_WEIGHTS` yet):

| Section | Weight today | Live? |
|---------|-------------:|-------|
| Typing | 10 | Yes |
| HIPAA | 15 | Yes |
| Writing | 15 | Yes |
| Chat-sim | 20 | Yes |
| Culture / language | **10 (proposed confirm)** | Held |
| Listening | TBD | Draft / not in composite |
| Reading accuracy | Deferred | No |

Live composite today = **60** (four sections). Adding Culture at 10 → **70** before Listening. Once **Culture and Listening are both live**, revisit the full table so the composite still sums cleanly to 100 and Chat-sim / Writing / HIPAA don’t silently dominate or shrink.

**Recommendation for this sample gate:** approve **Culture = 10** as the holding weight; schedule a short founder pass on the 8-component mix when Listening weight is chosen — do not freeze the old 4-section proportions forever.

---

## Machine metadata

```text
packId: culture-exam-bank-sample-v1
itemCount: 24
reviewStatus: draft_pending_sonu
reviewer: Sonu
importTarget: CULTURE_EXAM_APPROVED (only after Pass)
doNotImportFrom: level-up / culture-trivia daily pool
```

---

## Item-by-item review

For each item: mark **Pass** / **Revise** / **Drop**, edit wording in notes if needed. Keyed answer is the bold option (letter).

### Topic: Currency / pricing

#### cult-draft-v1-001

**Prompt:** A patient says the co-pay is “one ninety-nine.” In everyday US speech, they most likely mean:

- A. $199.00  
- **B. $1.99** ← keyed  
- C. $19.90  
- D. 1.99 rupees  

**Rationale:** Spoken “one ninety-nine” for a price usually means $1.99, not $199.  
**Why useful:** Patients and staff quote small dollar amounts this way on calls.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-002

**Prompt:** A patient asks if they can pay “in cash for fifty dollars even.” What do they mean?

- **A. They will pay exactly $50.00 in cash** ← keyed  
- B. They will pay $50 per installment forever  
- C. They only accept checks  
- D. They mean $50 in a foreign currency  

**Rationale:** “Fifty dollars even” = a round $50.00 with no cents.  
**Why useful:** Cash / balance conversations at checkout and on billing callbacks.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-003

**Prompt:** On a US price tag that shows $24.99, the “.99” is:

- **A. Ninety-nine cents (almost $25)** ← keyed  
- B. Ninety-nine dollars extra  
- C. A tax code  
- D. Always the tip amount  

**Rationale:** Cents are the two digits after the decimal; .99 is 99¢.  
**Why useful:** Reading invoices, portal balances, and pharmacy cash prices.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-004

**Prompt:** A front-desk coworker says “we’re waiting on a check to clear.” In US clinic billing talk, a “check” usually means:

- **A. A paper bank check / cheque payment** ← keyed  
- B. A medical exam checklist only  
- C. A background check for the patient  
- D. An insurance denial code  

**Rationale:** In payment context, “check” is a bank check (US spelling).  
**Why useful:** Avoid confusing payment “check” with clinical checklists.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-005

**Prompt:** A patient says “I only have a twenty.” In everyday US cash talk, they most likely mean:

- **A. A $20 bill** ← keyed  
- B. Twenty cents  
- C. A 20% discount coupon  
- D. Twenty appointments left  

**Rationale:** “A twenty” = a twenty-dollar bill.  
**Why useful:** Cash payments and change-making language at the desk.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

### Topic: Units

#### cult-draft-v1-006

**Prompt:** A patient says “it’s about 98.6 degrees.” In a US health context they almost always mean:

- **A. Fahrenheit (normal oral temp ballpark)** ← keyed  
- B. Celsius  
- C. Kelvin  
- D. Humidity percent  

**Rationale:** US patients report body temperature in °F; ~98.6°F is the classic normal reference.  
**Why useful:** Triage / nurse messages — don’t treat as Celsius.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-007

**Prompt:** A patient texts that the outdoor temperature is “in the mid-70s.” They mean approximately:

- **A. About 75°F (mild / warm for many US regions)** ← keyed  
- B. 75°C (dangerously hot)  
- C. 75% battery on their phone  
- D. 75 minutes of wait time  

**Rationale:** Weather “70s” in US speech = Fahrenheit decades.  
**Why useful:** Small talk and weather / travel context on calls.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-008

**Prompt:** A patient says they bought “a gallon of milk.” A US gallon is closest to:

- **A. About 3.8 liters (larger than a typical 1 L bottle)** ← keyed  
- B. Exactly 1 liter  
- C. A teaspoon  
- D. A shipping container  

**Rationale:** US liquid gallon ≈ 3.785 L — everyday grocery unit.  
**Why useful:** Everyday fluency, not a clinical conversion task.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-009

**Prompt:** A patient says they lost “about five pounds.” In the US this usually means:

- **A. Body weight (~5 lb, not 5 kilograms)** ← keyed  
- B. Five British pounds sterling  
- C. Five medications  
- D. Five miles walked  

**Rationale:** US body weight is discussed in pounds (lb) in everyday speech.  
**Why useful:** Intake / lifestyle updates.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-010

**Prompt:** A patient says the clinic is “about two miles from my house.” Miles are:

- **A. US customary distance (longer than a kilometer)** ← keyed  
- B. The same as meters  
- C. Only used for flight altitude  
- D. A type of insurance plan  

**Rationale:** US driving / local distance is usually in miles.  
**Why useful:** Directions, late/traffic, logistics.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

### Topic: Holidays / scheduling

#### cult-draft-v1-011

**Prompt:** Thanksgiving week in the US is often hard for scheduling because:

- **A. Many people travel or take time off around the fourth Thursday in November** ← keyed  
- B. It always falls on July 4  
- C. Banks are open extra hours that week only  
- D. It is not a recognized US holiday  

**Rationale:** Thanksgiving = fourth Thursday in November; travel week affects availability.  
**Why useful:** Offer alternate slots; expect reschedules that week.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-012

**Prompt:** A patient says “we’re closed for the Fourth.” They most likely mean:

- **A. July 4 (Independence Day) — many offices closed or short-staffed** ← keyed  
- B. The fourth of every month  
- C. April 15 tax day only  
- D. The fourth Monday in January  

**Rationale:** “The Fourth” in US speech usually = July 4.  
**Why useful:** Confirm holiday hours before promising same-day callbacks.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-013

**Prompt:** Between Christmas and New Year’s in the US, what should an MA generally expect?

- **A. Slower responses from offices, pharmacies, and some patients (holiday week)** ← keyed  
- B. No change ever — everything runs exactly as a normal week  
- C. All medical offices are legally required to stay open 24/7  
- D. Patients never travel then  

**Rationale:** Late December often means reduced staffing and travel.  
**Why useful:** Set realistic follow-up expectations.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-014

**Prompt:** A patient asks to avoid “Black Friday” for a morning appointment. Why might that matter?

- **A. It’s the busy shopping day after Thanksgiving — traffic and family plans can make mornings unreliable** ← keyed  
- B. It is a federal bank holiday when clinics must close  
- C. It only exists in Canada  
- D. It means Halloween  

**Rationale:** Black Friday = day after Thanksgiving; retail rush, not a federal clinic-closure day.  
**Why useful:** Offer later slots; know the reference without over-promising closures.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-015

**Prompt:** Memorial Day weekend (late May) is a common time when:

- **A. Patients travel or have cookouts — Monday may be a federal holiday with limited office hours** ← keyed  
- B. Every US clinic is closed all of May  
- C. It celebrates New Year only  
- D. It is the same day as Christmas  

**Rationale:** Memorial Day = last Monday in May; long weekend travel is common.  
**Why useful:** Ops impact — not “who does Memorial Day honor” trivia.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

### Topic: Idioms

#### cult-draft-v1-016

**Prompt:** A patient says “I’m a little under the weather.” They most likely mean:

- **A. They feel mildly sick / unwell** ← keyed  
- B. They are standing outside in rain only  
- C. They want a weather forecast  
- D. They are canceling because of a storm every time  

**Rationale:** “Under the weather” = feeling unwell.  
**Why useful:** Soft symptom language on calls (still follow triage rules).

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-017

**Prompt:** A coworker says “can you hang tight for two minutes?” They want you to:

- **A. Wait briefly** ← keyed  
- B. Hang up the phone immediately  
- C. Hold a physical rope  
- D. Close the clinic  

**Rationale:** “Hang tight” = please wait a short time.  
**Why useful:** Hold / transfer language.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-018

**Prompt:** A patient says “I’ll take a rain check on that visit.” They most likely mean:

- **A. They want to postpone / reschedule (not necessarily about weather)** ← keyed  
- B. They will only come if it rains  
- C. They want a paper check mailed  
- D. They are confirming they will arrive early  

**Rationale:** “Rain check” = defer to another time.  
**Why useful:** Hear cancel/reschedule intent even when weather isn’t mentioned.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-019

**Prompt:** A lead says “give me a ballpark on how many openings Friday.” They want:

- **A. A rough estimate, not an exact audited count** ← keyed  
- B. The address of a baseball stadium  
- C. Only exact to-the-minute capacity with zero estimate  
- D. A list of baseball scores  

**Rationale:** “Ballpark” = approximate figure.  
**Why useful:** Internal ops language when scanning the schedule.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-020

**Prompt:** A patient asks “does 3 p.m. work for you all?” In US scheduling speech, “work for you” means:

- **A. Is that time okay / available?** ← keyed  
- B. Will you be employed at 3 p.m.?  
- C. Can you do physical labor then?  
- D. Is the Wi-Fi working?  

**Rationale:** “Does X work for you?” = is that convenient/available?  
**Why useful:** Core booking phrase.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

### Topic: Cultural / everyday references

#### cult-draft-v1-021

**Prompt:** A patient says “I already called 911.” In the US, 911 is:

- **A. The emergency services number (police / fire / ambulance)** ← keyed  
- B. The clinic’s main appointment line  
- C. IRS tax help  
- D. A pharmacy refill code  

**Rationale:** 911 = emergency; do not treat as a routine clinic number.  
**Why useful:** Safety triage — don’t delay with booking chat if emergency is active.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-022

**Prompt:** When verifying identity, a US patient may be asked for their “ZIP code.” That means:

- **A. Postal code for their address** ← keyed  
- B. Their password for the patient portal  
- C. Their insurance group number always  
- D. Their shoe size  

**Rationale:** ZIP = US postal code.  
**Why useful:** Identity / address verification on calls and forms.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-023

**Prompt:** A patient says “football is on Sunday so I can’t do noon.” In everyday US speech, “football” usually means:

- **A. American football (NFL) — often Sunday games** ← keyed  
- B. Only soccer  
- C. A type of CT scan  
- D. A federal holiday every Sunday  

**Rationale:** In the US, “football” ≠ soccer; Sunday NFL is a common scheduling conflict.  
**Why useful:** Offer non-game times without arguing sports.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

#### cult-draft-v1-024

**Prompt:** A patient mentions “my PCP.” In US healthcare talk this most often means:

- **A. Primary care provider / physician** ← keyed  
- B. Personal credit plan  
- C. Pharmacy coupon program  
- D. Patient complaint portal  

**Rationale:** PCP = primary care provider — common on intake and referral calls.  
**Why useful:** Records / referral conversations.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

## Pack-level Sonu sign-off

| Check | OK? |
|-------|-----|
| Items feel useful for MA desk/phone work (not quiz-night trivia) | [ ] |
| Distinct from daily Practice culture trivia (no capital/abbr/DST clones) | [ ] |
| Stems/options clear enough for non-native speakers with coaching | [ ] |
| No clinical decision-making required (Vayushi not needed) | [ ] |
| Enough Pass items to continue toward ~25–40 approved before enabling section | [ ] |

**Sonu overall:** [ ] Sample approved (with noted revises)  [ ] Needs another draft pass  [ ] Hold  

**Sign-off:** _____________  date: ________

**Count:** Pass ___ / Revise ___ / Drop ___ (of 24)

---

## After Sonu clears (process — do not skip)

1. Apply revises in `culture-bank-exam.draft.ts` → move Pass items into `CULTURE_EXAM_APPROVED` with `status: "approved"`.
2. Only then consider enabling `cultureSectionEnabled` / live draw.
3. Founder: confirm Culture weight **10** and schedule composite revisit when Listening weight is set.
4. **No bulk generation** until this sample batch is signed.
