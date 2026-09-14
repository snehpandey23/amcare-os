# Content review — HIPAA bank expansion · Sonu re-check (5 MA-clarity rewrites)

```text
Status: DRAFT — pending Sonu re-check (not live exam content)
Date: 2026-09-13
Bank: apps/hipaa-training/src/content/competency-exam/hipaa-bank-expansion.draft.ts
Scope: Only items 003, 004, 016, 017, 022 rewritten for MA clarity
Other ~20 sample items: leave approved as-is — do not re-litigate here
Not: merge into live ALL_QUESTIONS / competency draw until Sonu signs these five
```

---

## Review routing

| Reviewer | Owns | Required? |
|----------|------|-----------|
| **Sonu** | MA-facing clarity; whether a real MA can understand the ask without already knowing HIPAA category jargon | **Yes — re-check these five** |
| **Sneha** | Compliance key accuracy | Only if Sonu worries the rewrite softens the concept |

**Rule:** Same keyed concept as before. Clarity rewrite only — do not change what the training teaches.

---

## draft-v1-003 · CE/BA — cleaning staff (incidental exposure)

**Prompt:** A contracted cleaning staff member empties the trash and briefly sees papers with patient names on a desk. Cleaning is their only job — they do not schedule visits, bill, or work in the chart. What is the best takeaway?

- A. Seeing those papers, even briefly, means the cleaner now has the same legal responsibilities as a company hired to handle patient information for the clinic  
- **B. Briefly seeing patient information by accident while doing non-records work does not, by itself, create those extra legal responsibilities for them** ★  
- C. The cleaner is now treated like a second medical clinic that bills insurance on its own  
- D. The cleaner becomes a “hybrid” organization that must split its business into healthcare and non-healthcare parts  

**Keyed concept (unchanged):** Incidental exposure alone ≠ business associate.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

## draft-v1-004 · Clearest business-associate-style vendor

**Prompt:** Which of these is the clearest example of an outside company that handles patient health information on the clinic’s (or health plan’s) behalf — the kind of vendor relationship HIPAA treats as a business associate?

- **A. A billing company that processes patient claims and works with patient health information for the clinic or health plan** ★  
- B. A food delivery driver who drops lunch at the front desk and never sees charts or billing files  
- C. A patient waiting in the lobby for their own appointment  
- D. A visitor who walks past a closed chart-room door without going in or reading anything  

**Keyed concept (unchanged):** PHI-handling vendor on behalf of the plan/clinic is the BA pattern; incidental passers-by are not. (Replaced unexplained “TPA” with billing company.)

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

## draft-v1-016 · EHR login + auto-logoff (technology control)

**Prompt:** Your clinic’s EHR requires each staff member to sign in with their own username and password, and it logs you out automatically after you leave the screen idle. What kind of protection is that mainly describing?

- **A. A technology / system control (built into the computer or software — sometimes called a technical safeguard)** ★  
- B. A marketing brochure rule about how the clinic advertises  
- C. A patient permission form for sharing information with a family member  
- D. A public news notice the clinic sends after a large data breach  

**Keyed concept (unchanged):** Unique IDs + automatic logoff = technical / technology safeguard.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

## draft-v1-017 · Locked closet with spare computers (physical control)

**Prompt:** At closing time, staff lock the closet where spare clinic computers are stored overnight so strangers cannot walk off with them. What is the main point of that step?

- **A. Protecting the devices and the space with a real-world lock / room control (a physical safeguard)** ★  
- B. Choosing the right medical billing code for an insurance claim  
- C. Writing a stronger password so the EHR software is harder to guess  
- D. Getting a patient’s signed OK before using their photo in a clinic Facebook ad  

**Keyed concept (unchanged):** Locking facility/workstations = physical safeguard. Distractors are now workplace-plausible (coding, password, marketing OK) instead of unrelated jargon labels.

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

## draft-v1-022 · What OCR does vs does not do

**Prompt:** OCR is the federal office that watches HIPAA privacy and security (the “HIPAA watchdog”). It receives complaints, looks into many of them, and can run compliance checks. Which of these is generally NOT something OCR itself does?

- A. Look into HIPAA complaints people file  
- B. Review whether a clinic is following HIPAA rules (compliance checks / audits)  
- **C. Put someone in jail for a HIPAA crime — that kind of criminal case is usually handled by a different agency (the Department of Justice), not OCR** ★  
- D. Receive and review HIPAA complaints that come in  

**Keyed concept (unchanged):** OCR civil complaint/review role ≠ criminal prosecution (DOJ).

Sonu: [ ] Pass  [ ] Revise  [ ] Drop  
Notes: _______________________________________________

---

## Pack-level Sonu sign-off

| Check | OK? |
|-------|-----|
| An MA with no compliance background can understand each stem | [ ] |
| Options are plain workplace language (not bare BA/CE/TPA/OCR-tool labels) | [ ] |
| Correct answer still teaches the same training concept | [ ] |
| Ready to mark these five approved with the rest of the sample | [ ] |

**Sonu overall:** [ ] Pass all five  [ ] Needs another rewrite pass  

**Sign-off:** _____________  date: ________

**After Pass:** merge only these five (with the other approved sample items) into the live bank process — still not auto-shipped without the existing expansion gate in `HIPAA-BANK-EXPANSION-DESIGN.md`.
