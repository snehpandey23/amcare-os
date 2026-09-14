# MCQ format-variant sample batch (light review)

```text
Status: SAMPLE — pending Sneha/Sonu fast pass (not live exam content)
Date: 2026-09-14
Source bank: apps/hipaa-training/src/content/questionBank.ts (73 live approved items)
Generator: src/lib/competency-exam/mcq-format-variants.ts
Scope: Format variants only (same keyed concept) — NOT net-new HIPAA facts
Not: merge into live draw until sample is signed and full-bank run is approved
```

---

## Review routing (lighter than net-new bank expansion)

| Reviewer | Owns | Required? |
|----------|------|-----------|
| **Sneha** or **Sonu** | Fast pass: variants still test the **same accurate concept** clearly; drop confusing NOT / double-negative items | **Yes — one of them** |
| Full compliance re-litigation | Re-prove each fact from scratch | **No** — facts already approved |

**Pass rule:** Same teaching point as source. Clarity + non-ambiguous framing only.

---

## Batch summary

| Metric | Count |
|--------|------:|
| Source questions | 8 |
| Generated variants | 32 |
| Coherence PASS (no flags) | 6 |
| Soft FLAG (reviewable) | 11 |
| BLOCKED (rewrite before review queue) | 15 |

### Blocked variant IDs
- `t-8__true_false`: coherence_stem
- `t-19__direct`: coherence_stem
- `t-19__true_false`: coherence_stem
- `t-19__paraphrase_shuffle`: coherence_stem
- `t-23__true_false`: coherence_stem
- `t-41__true_false`: coherence_stem
- `t-51__direct`: coherence_stem, coherence_option, coherence_option
- `t-51__true_false`: coherence_stem
- `t-51__paraphrase_shuffle`: coherence_stem, coherence_option, coherence_option
- `t-60__direct`: coherence_stem, coherence_option
- `t-60__true_false`: coherence_stem
- `t-60__paraphrase_shuffle`: coherence_stem, coherence_option
- `t-66__direct`: coherence_stem
- `t-66__true_false`: coherence_stem, tf_source_limited
- `t-66__paraphrase_shuffle`: coherence_stem

### Soft-flagged variant IDs
- `t-8__direct`: coherence_stem, coherence_option
- `t-8__negative`: coherence_option
- `t-8__paraphrase_shuffle`: coherence_stem, coherence_option
- `t-23__direct`: coherence_option
- `t-23__negative`: coherence_option
- `t-23__paraphrase_shuffle`: coherence_option, coherence_option
- `t-51__negative`: coherence_option, coherence_option, all_of_above_negative
- `t-3__direct`: coherence_option
- `t-3__negative`: coherence_option, all_of_above_negative
- `t-3__paraphrase_shuffle`: coherence_option
- `t-60__negative`: coherence_option, all_of_above_negative

---

## Variant types (per source)

1. **direct** — approved wording as-is (baseline)
2. **negative** — NOT / reversed framing of the same concept
3. **true_false** — core fact as True/False
4. **paraphrase_shuffle** — light paraphrase + shuffled options (same correct meaning)

Automated gate reuses chat-sim `assessReplyCoherence` plus MCQ heuristics (double-negative, all-of-above NOT, duplicate options).

---

## Source `t-8` · ce-ba · mcq

**Approved prompt:** HIPAA Rules apply to:

- A. Anyone working at the facility including staff that does not have access to Protected Health Information
- **B. Covered Entities and Business Associates that have access to Protected Health Information** ★
- C. Covered Entities only
- D. Business Associates only

**Explanation (source):** Entities in scope with PHI access; not every person physically on site absent PHI role.

### Variant `direct` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** HIPAA Rules apply to:

- A. Anyone working at the facility including staff that does not have access to Protected Health Information
- **B. Covered Entities and Business Associates that have access to Protected Health Information** ★
- C. Covered Entities only
- D. Business Associates only

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_stem` — Stem: no clause skeleton; low function-word density (0.25)
- `coherence_option` — Option b: no clause skeleton

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** Which of the following is NOT accurate for: HIPAA Rules apply to?

- **A. Anyone working at the facility including staff that does not have access to Protected Health Information** ★
- B. Covered Entities and Business Associates that have access to Protected Health Information
- C. Business Associates only
- D. Covered Entities only

**Keyed concept note:** Same concept; answer is an original distractor (the inaccurate claim).

**Automated check:**

- `coherence_option` — Option b: no clause skeleton

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** True or False: HIPAA Rules apply to: Covered Entities and Business Associates that have access to Protected Health Information.

- **A. True** ★
- B. False

**Keyed concept note:** T/F states the approved correct option as a single true claim.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** HIPAA Rules apply to:

- A. Business Associates only
- **B. Covered Entities and Business Associates that have access to Protected Health Information** ★
- C. Covered Entities only
- D. Anyone working at the facility including staff that does not have access to Protected Health Information

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

- `coherence_stem` — Stem: no clause skeleton; low function-word density (0.25)
- `coherence_option` — Option b: no clause skeleton

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-19` · phi · mcq

**Approved prompt:** An example of Protected Health Information (PHI) is

- A. Information that cannot be used to identify an individual
- **B. Past or future payment information** ★
- C. Employment records
- D. Educational Records

**Explanation (source):** Payment information in a health context with identifiers fits PHI examples in your packet.

### Variant `direct` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** An example of Protected Health Information (PHI) is

- A. Information that cannot be used to identify an individual
- **B. Past or future payment information** ★
- C. Employment records
- D. Educational Records

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **PASS**

**Prompt:** Which of the following is NOT accurate for: An example of Protected Health Information (PHI) is?

- **A. Information that cannot be used to identify an individual** ★
- B. Educational Records
- C. Past or future payment information
- D. Employment records

**Keyed concept note:** Same concept; answer is an original distractor (the inaccurate claim).

**Automated check:**

_No automated flags._

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** True or False: An example of Protected Health Information (PHI) is: Past or future payment information.

- **A. True** ★
- B. False

**Keyed concept note:** T/F states the approved correct option as a single true claim.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** An example of Protected Health Information (PHI) is

- A. Information that cannot be used to identify an individual
- **B. Past or future payment information** ★
- C. Employment records
- D. Educational Records

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-23` · privacy · mcq

**Approved prompt:** The Privacy Rule:

- **A. Limits PHI use and disclosure and establishes patient rights with regards to their PHI** ★
- B. Prescribes what CEs and Business Associates (BAs) must do in the event of a breach
- C. Provides the Office for Civil Rights the authority to enforce HIPAA
- D. Protects only electronic Protected Health Information

**Explanation (source):** Core Privacy Rule statement in your outline.

### Variant `direct` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** The Privacy Rule:

- **A. Limits PHI use and disclosure and establishes patient rights with regards to their PHI** ★
- B. Prescribes what CEs and Business Associates (BAs) must do in the event of a breach
- C. Provides the Office for Civil Rights the authority to enforce HIPAA
- D. Protects only electronic Protected Health Information

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_option` — Option d: no clause skeleton; long content-word run (4); low function-word density (0.17)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** Which of the following is NOT accurate for: The Privacy Rule?

- A. Protects only electronic Protected Health Information
- B. Provides the Office for Civil Rights the authority to enforce HIPAA
- **C. Prescribes what CEs and Business Associates (BAs) must do in the event of a breach** ★
- D. Limits PHI use and disclosure and establishes patient rights with regards to their PHI

**Keyed concept note:** Same concept; answer is an original distractor (the inaccurate claim).

**Automated check:**

- `coherence_option` — Option a: no clause skeleton; long content-word run (4); low function-word density (0.17)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** True or False: The Privacy Rule: Limits PHI use and disclosure and establishes patient rights with regards to their PHI.

- **A. True** ★
- B. False

**Keyed concept note:** T/F states the approved correct option as a single true claim.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (5)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** The Privacy Rule:

- A. Protects only electronic Protected Health Information
- B. Prescribes what CEs and Business Associates (BAs) must do in the event of a breach
- **C. Limits PHI use and disclosure and sets out patient rights about their PHI** ★
- D. gives the Office for Civil Rights the authority to enforce HIPAA

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

- `coherence_option` — Option a: no clause skeleton; long content-word run (4); low function-word density (0.17)
- `coherence_option` — Option c: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-41` · security · mcq

**Approved prompt:** The Security Rule:

- A. Defines the permitted uses and disclosures of PHI
- B. Provides OCR the authority to enforce HIPAA
- **C. Requires CEs to establish certain safeguards for the protection of ePHI** ★
- D. Requires CEs and BAs to provide notification of breaches of PHI and ePHI

**Explanation (source):** Security Rule is the ePHI safeguards rule; permitted uses are Privacy Rule; breach notification is separate.

### Variant `direct` · gate: **PASS**

**Prompt:** The Security Rule:

- A. Defines the permitted uses and disclosures of PHI
- B. Provides OCR the authority to enforce HIPAA
- **C. Requires CEs to establish certain safeguards for the protection of ePHI** ★
- D. Requires CEs and BAs to provide notification of breaches of PHI and ePHI

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

_No automated flags._

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **PASS**

**Prompt:** Which of the following is NOT accurate for: The Security Rule?

- **A. Defines the permitted uses and disclosures of PHI** ★
- B. Requires CEs and BAs to provide notification of breaches of PHI and ePHI
- C. Provides OCR the authority to enforce HIPAA
- D. Requires CEs to establish certain safeguards for the protection of ePHI

**Keyed concept note:** Same concept; answer is an original distractor (the inaccurate claim).

**Automated check:**

_No automated flags._

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** True or False: The Security Rule: Requires CEs to establish certain safeguards for the protection of ePHI.

- **A. True** ★
- B. False

**Keyed concept note:** T/F states the approved correct option as a single true claim.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **PASS**

**Prompt:** The Security Rule:

- A. gives OCR the authority to enforce HIPAA
- **B. calls for CEs to establish certain safeguards for the protection of ePHI** ★
- C. Defines the permitted uses and disclosures of PHI
- D. calls for CEs and BAs to provide notification of breaches of PHI and ePHI

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

_No automated flags._

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-51` · safeguards · mcq

**Approved prompt:** The Physical Safeguards require the following facility provisions:

- A. Protections such as locked doors, alarms, security cameras as necessary
- B. Maintain records of repairs and modifications to security related components of the facility
- C. Secure computer hardware that contain ePHI
- D. Dispose and re-use media containing ePHI in ways that prevent unauthorized access to ePHI
- **E. All of the above** ★

**Explanation (source):** Physical safeguard themes are combined in the official test answer.

### Variant `direct` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The Physical Safeguards require the following facility provisions:

- A. Protections such as locked doors, alarms, security cameras as necessary
- B. Maintain records of repairs and modifications to security related components of the facility
- C. Secure computer hardware that contain ePHI
- D. Dispose and re-use media containing ePHI in ways that prevent unauthorized access to ePHI
- **E. All of the above** ★

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4); low function-word density (0.25)
- `coherence_option` **(blocked)** — Option a: no clause skeleton; long content-word run (5)
- `coherence_option` **(blocked)** — Option d: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** Which of the following is NOT true about “The Physical Safeguards require the following facility provisions”?

- **A. None of the listed items are part of what the approved question treats as in-scope for this topic** ★
- B. Dispose and re-use media containing ePHI in ways that prevent unauthorized access to ePHI
- C. Protections such as locked doors, alarms, security cameras as necessary
- D. Secure computer hardware that contain ePHI
- E. Maintain records of repairs and modifications to security related components of the facility

**Keyed concept note:** All-of-the-above source: NOT item keys the false meta-claim; listed elements stay accurate — no new clinical facts.

**Automated check:**

- `coherence_option` — Option b: no clause skeleton; long content-word run (4)
- `coherence_option` — Option c: no clause skeleton; long content-word run (5)
- `all_of_above_negative` — Negative framing of an all-of-the-above item — verify the false option is clearly false

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** True or False: The Physical Safeguards require the following facility provisions includes each of the following: Protections such as locked doors, alarms, security cameras as necessary; Maintain records of repairs and modifications to security related components of the facility; Secure computer hardware that contain ePHI; Dispose and re-use media containing ePHI in ways that prevent unauthorized access to ePHI.

- **A. True** ★
- B. False

**Keyed concept note:** T/F restates the all-of-the-above keyed bundle as one true statement.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (5)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The Physical Safeguards call for the following facility provisions:

- **A. All of the above** ★
- B. Dispose and re-use media containing ePHI in ways that prevent unauthorized access to ePHI
- C. Maintain records of repairs and modifications to security related components of the facility
- D. Secure computer hardware that contain ePHI
- E. Protections such as locked doors, alarms, security cameras as necessary

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (4)
- `coherence_option` **(blocked)** — Option b: no clause skeleton; long content-word run (4)
- `coherence_option` **(blocked)** — Option e: no clause skeleton; long content-word run (5)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-3` · intro · mcq

**Approved prompt:** HIPAA was put in place to:

- A. Protect the privacy, security and integrity of health information
- B. Demonstrate to the public that their health information is private, secure and of good integrity
- C. Protect against information breaches
- D. Make health information accessible to its owner and/or his/her authorized representative
- **E. All of the above** ★

**Explanation (source):** The official test marks the comprehensive answer — multiple statutory/regulatory aims, not one item alone.

### Variant `direct` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** HIPAA was put in place to:

- A. Protect the privacy, security and integrity of health information
- B. Demonstrate to the public that their health information is private, secure and of good integrity
- C. Protect against information breaches
- D. Make health information accessible to its owner and/or his/her authorized representative
- **E. All of the above** ★

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_option` — Option d: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** Which of the following is NOT true about “HIPAA was put in place to”?

- **A. None of the listed items are part of what the approved question treats as in-scope for this topic** ★
- B. Protect the privacy, security and integrity of health information
- C. Make health information accessible to its owner and/or his/her authorized representative
- D. Protect against information breaches
- E. Demonstrate to the public that their health information is private, secure and of good integrity

**Keyed concept note:** All-of-the-above source: NOT item keys the false meta-claim; listed elements stay accurate — no new clinical facts.

**Automated check:**

- `coherence_option` — Option c: no clause skeleton; long content-word run (4)
- `all_of_above_negative` — Negative framing of an all-of-the-above item — verify the false option is clearly false

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **PASS**

**Prompt:** True or False: HIPAA was put in place to includes each of the following: Protect the privacy, security and integrity of health information; Demonstrate to the public that their health information is private, secure and of good integrity; Protect against information breaches; Make health information accessible to its owner and/or his/her authorized representative.

- **A. True** ★
- B. False

**Keyed concept note:** T/F restates the all-of-the-above keyed bundle as one true statement.

**Automated check:**

_No automated flags._

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** HIPAA was put in place to:

- A. Make health information accessible to its owner and/or his/her authorized representative
- **B. All of the above** ★
- C. Demonstrate to the public that their health information is private, secure and of good integrity
- D. Protect against information breaches
- E. Protect the privacy, security and integrity of health information

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

- `coherence_option` — Option a: no clause skeleton; long content-word run (4)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-60` · breach · mcq

**Approved prompt:** The Breach Notification Administrative Requirements include:

- A. Having written breach notification policies and procedures
- B. Training workforce members about breach notification
- C. Developing and applying sanctions for those not complying with breach notification policies and procedures
- **D. All of the above** ★

**Explanation (source):** Administrative requirements bundle in your test.

### Variant `direct` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The Breach Notification Administrative Requirements include:

- A. Having written breach notification policies and procedures
- B. Training workforce members about breach notification
- C. Developing and applying sanctions for those not complying with breach notification policies and procedures
- **D. All of the above** ★

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (6); low function-word density (0.20)
- `coherence_option` **(blocked)** — Option a: no clause skeleton; long content-word run (5); low function-word density (0.14)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **FLAGGED (soft) — still reviewable**

**Prompt:** Which of the following is NOT true about “The Breach Notification Administrative Requirements include”?

- A. Developing and applying sanctions for those not complying with breach notification policies and procedures
- **B. None of the listed items are part of what the approved question treats as in-scope for this topic** ★
- C. Training workforce members about breach notification
- D. Having written breach notification policies and procedures

**Keyed concept note:** All-of-the-above source: NOT item keys the false meta-claim; listed elements stay accurate — no new clinical facts.

**Automated check:**

- `coherence_option` — Option d: no clause skeleton; long content-word run (5); low function-word density (0.14)
- `all_of_above_negative` — Negative framing of an all-of-the-above item — verify the false option is clearly false

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** True or False: The Breach Notification Administrative Requirements include includes each of the following: Having written breach notification policies and procedures; Training workforce members about breach notification; Developing and applying sanctions for those not complying with breach notification policies and procedures.

- **A. True** ★
- B. False

**Keyed concept note:** T/F restates the all-of-the-above keyed bundle as one true statement.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (6)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The Breach Notification Administrative Requirements include:

- A. Having written breach notification policies and procedures
- B. Developing and applying sanctions for those not complying with breach notification policies and procedures
- **C. All of the above** ★
- D. Training workforce members about breach notification

**Keyed concept note:** Same correct meaning; light paraphrase + shuffled option order.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (6); low function-word density (0.20)
- `coherence_option` **(blocked)** — Option a: no clause skeleton; long content-word run (5); low function-word density (0.14)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Source `t-66` · enforcement · tf

**Approved prompt:** The OCR audit program includes State specific rules.

- A. True
- **B. False** ★

**Explanation (source):** Federal HIPAA audit program focuses on federal HIPAA standards; state law may add obligations separately.

### Variant `direct` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The OCR audit program includes State specific rules.

- A. True
- **B. False** ★

**Keyed concept note:** Unchanged approved item (baseline).

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (7); low function-word density (0.13)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `negative` · gate: **PASS**

**Prompt:** True or False: It is not the case that the OCR audit program includes State specific rules.

- **A. True** ★
- B. False

**Keyed concept note:** Same fact; stem uses explicit negation of the approved statement.

**Automated check:**

_No automated flags._

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `true_false` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The OCR audit program includes State specific rules.

- A. True
- **B. False** ★

**Keyed concept note:** Source is already True/False — variant mirrors direct.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (7); low function-word density (0.13)
- `tf_source_limited` **(blocked)** — Source already T/F — true_false variant is a mirror of direct

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

### Variant `paraphrase_shuffle` · gate: **BLOCKED — do not use without rewrite**

**Prompt:** The OCR audit program covers State specific rules.

- A. True
- **B. False** ★

**Keyed concept note:** Paraphrased stem; True/False keys unchanged.

**Automated check:**

- `coherence_stem` **(blocked)** — Stem: no clause skeleton; long content-word run (7); low function-word density (0.13)

Reviewer: [ ] Pass  [ ] Revise  [ ] Drop

Notes: _______________________________________________

---

## Founder / reviewer decision (sample)

- [ ] Sample quality OK — proceed to full approved bank (73 live + cleared expansion items)
- [ ] Sample OK with edits — fix generator rules, re-run sample
- [ ] Pause — format variants not worth the noise vs bank expansion track

Signed: _______________  Date: _______________
