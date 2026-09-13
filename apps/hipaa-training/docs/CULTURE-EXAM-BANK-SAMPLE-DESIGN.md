# Culture / language exam bank — sample design (v1)

**Status:** SAMPLE DRAFT ONLY — not live.  
**Primary reviewer:** Sonu (realism / MA usefulness). **Not** Vayushi or Sneha.  
**Review pack:** `docs/reviews/CULTURE-EXAM-BANK-SAMPLE-v1-REVIEW.md`  
**Draft items:** `src/content/competency-exam/culture-bank-exam.draft.ts` (24 MCQs)

---

## Why a separate exam bank

Daily Practice trivia is a different product surface. The competency exam needs workplace-framed MCQs with a seen-set draw (`culture-draw.ts`). `CULTURE_EXAM_APPROVED` stays empty until Sonu marks items approved — do not import the daily pool.

---

## Topic mix (this sample)

Currency/pricing · units (°F, gal, lb, mi) · holidays for scheduling · idioms · everyday cultural refs (911, ZIP, PCP, US “football”).

---

## Scoring (when enabled)

Same as HIPAA MCQ: deterministic correct/incorrect; `drawUnseen` + seen-set; no synonym-swap clones of daily trivia.

---

## Weight (founder)

Provisional **`culture: 10`** already in `EXAM_WEIGHTS` (parity with Typing). Confirm at sample gate. **Revisit full composite** when Culture and Listening are both live — today’s live weights were set for a four-section exam.
