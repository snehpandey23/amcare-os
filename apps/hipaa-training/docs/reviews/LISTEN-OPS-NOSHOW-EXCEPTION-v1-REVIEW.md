# Content review — Listening sample `listen-ops-noshow-exception-v1`

```text
Status: DRAFT — pending human review (not live exam content)
Date: 2026-09-13
Section: Listening (voicemail → write-up) — design parent:
  apps/hipaa-training/docs/LISTENING-VOICEMAIL-WRITEUP-DESIGN.md § Sample 7
Bank id: listen-ops-noshow-exception-v1
Family: operational · no-show / late-cancel exception
Response shape: patient-message-only (single box)
Scoring: standard Writing/Listening stack (no policy-recognition hard gate)
PHI: John Doe placeholder only
Not: build UI, audio, or merge into a live bank
```

---

## Review routing (do not collapse)

| Reviewer | Owns | Can alone approve fee/exception language? |
|----------|------|-------------------------------------------|
| **Sonu** (primary) | Voicemail realism; MA-facing clarity; length; empathy tone; whether the write-up task feels like the real job | **No** |
| **Billing lead** (required on fee/policy block) | Whether the practice actually charges a no-show fee in this channel; dollar amount if any may be quoted; whether one-time exceptions exist; who decides; approved patient language for waive / escalate | **Yes — must sign fee/exception portion** |

**Rule:** Sonu may pass or rewrite **phrasing**. She must **not** sign off the **fee / exception / waiver policy** alone. If Billing disagrees with dollars or exception path, Billing’s language wins; Sonu re-checks that the voicemail + task still sound natural.

**Clinical (Vayushi):** not required for this item (operational only). ER mention is patient-reported reason for missing the visit — not a clinical advice scenario.

---

## Machine metadata (for later bank entry)

```text
id: listen-ops-noshow-exception-v1
title: No-show fee — one-time exception request
family: no-show-exception
responseShape: patient-message-only
scoringMode: standard
controlledSubstance: false
reviewStatus: draft_pending_sonu_and_billing
reviewers:
  - Sonu (phrasing / realism)
  - Billing lead (fee + exception policy)
audioAssetId: (none yet)
```

---

## 1. Scenario for the exam taker (after audio)

**What the MA is asked to do**

You received this voicemail. Write the **message you would send the patient** (secure portal / approved channel).  
Do **not** invent a refund or waiver. If you are unsure whether an exception is possible, say you will escalate to Billing / the appropriate lead and set a realistic follow-up expectation.

**Facts given (immutable for the attempt — optional on-screen card later):**

- Patient placeholder: **John Doe**
- Missed appointment “yesterday”
- Reason given: family medical emergency (mother in ER); could not get to a phone
- States this is the first time they have missed
- Asks for a **one-time exception / waive** the no-show charge
- Requests a callback

---

## 2. Voicemail script (AI draft — Sonu polish)

> Hi, this is John Doe. I’m calling about the no-show fee from yesterday. I know I missed the appointment — I’m really sorry. My mom ended up in the ER and I was with her all afternoon, I couldn’t even get to a phone. This is the first time I’ve ever missed. Is there any way you can make a one-time exception and waive that charge? I’d really appreciate it. Please call me back. Thank you.

### Sonu checklist — phrasing / realism

- [ ] Sounds like a real patient voicemail (not corporate script)
- [ ] Length OK for Listening audio (~20–40 seconds spoken)
- [ ] “No-show fee” wording matches how patients actually talk on our lines (or rewrite)
- [ ] Emotion / apology / first-time ask feel believable
- [ ] Placeholder name only (John Doe) — no real-sounding identity
- [ ] Pass / revise notes: _______________________________

**Sonu sign-off (phrasing only):** _____________ date: ________

---

## 3. Fee / exception policy block — **Billing review required**

> **Do not treat the bracketed items below as approved policy.** They are placeholders for Billing to confirm or replace. Live KB today (`billing-late-cancel`, Klarity cancel/no-show topics) says: explain policy; do **not** proactively offer refunds; escalate exceptions to Billing / Klarity as applicable. Dollar amounts and whether “first time” matters are **Billing’s call**.

| # | Policy question | Draft assumption (for scoring intent only) | Billing decision |
|---|-----------------|--------------------------------------------|------------------|
| B1 | Is a **no-show fee** charged for this visit type / channel? | Patient believes there is a fee | Confirm / rewrite stem if we never call it a “fee” |
| B2 | May MA quote a **dollar amount** in the patient reply? | **Default: no** — avoid inventing $X until Billing locks a figure (or “per your invoice”) | Lock: quote $___ / never quote / “see invoice” |
| B3 | Can MA **waive** or promise a one-time exception? | **No** — MA escalates only | Confirm |
| B4 | Who decides exceptions? | Billing lead (and/or provider / Klarity per booking channel) | Name the correct owner in approved copy |
| B5 | Does “first time I’ve ever missed” change the answer? | Unknown — do not teach that it automatically waives | Confirm |
| B6 | Approved patient language for empathy + escalate | See §4 model reply (draft) | Edit / approve |

**Billing sign-off (fee + exception language):** _____________ date: ________

---

## 4. Intended good response (model — not shown to takers)

**Shape:** single **message to patient**.

**Must include (scoring intent — standard stack + reviewer judgment):**

1. Empathy / acknowledgment of the missed visit and the hard day  
2. Clear statement that the MA **cannot personally waive** the charge  
3. Offer to **escalate** the exception request to Billing / the correct lead  
4. Non-urgent follow-up expectation (e.g. 1–2 working days) — Sonu/Billing may tune  
5. Invitation to reply with any invoice / appointment date details needed (no PHI beyond what’s already in chart)

**Must not include:**

- Unilateral waive / “I’ve taken care of it” / invented refund  
- Exact fee dollars unless Billing locked them in §3  
- Clinical advice about the mother’s ER visit  
- Judgment labels about the patient

### Model patient message (AI draft — Billing edits fee lines; Sonu edits tone)

> Hi John Doe — thank you for calling and for explaining what happened. I’m sorry you and your mom went through that, and I’m glad you reached out.  
> I can’t waive a no-show charge myself. I’ve flagged your request for a one-time exception to our Billing team so they can review it against policy.  
> Someone from Billing (or I, once they advise) should follow up within about 1–2 working days. If you have the appointment date or invoice reference handy, you can reply here so they have it.  
> Please let us know if you need anything else in the meantime.

*(Bracket for Billing: replace “no-show charge” / timing / owner title with approved wording.)*

---

## 5. Variant (same item family — optional later bank row)

Same shape and policy rules; different reason:

> … I missed because my flight was canceled and I couldn’t get back in time …

Do **not** mint a second id until Sonu + Billing clear **v1**.

---

## 6. Open questions (leave for reviewers)

1. Sonu: Keep “no-show fee” in the voicemail, or “charge” / “bill” only?  
2. Billing: Klarity-booked vs direct Siya booking — does the stem need a channel cue?  
3. Founder (later): audio TTS vs human for this calmer ops voicemail.

---

## 7. Stop line

- **Not** approved for Listening build or scored sittings until **Sonu** (phrasing) **and Billing** (fee/exception) both sign.  
- Sonu alone ≠ full approval.  
- Parent design remains: `LISTENING-VOICEMAIL-WRITEUP-DESIGN.md`. Controlled-substance policy-recognition (§4b) is a **separate** family and is **not** this item.
