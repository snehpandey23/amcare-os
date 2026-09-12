# HIPAA question bank expansion — design (73 → ~200)

**Status:** DESIGN + SAMPLE DRAFT ONLY — do not merge drafts into the live bank until human review clears.  
**Reviewers:** Sonu (content/training judgment) and/or Sneha (compliance accuracy). Founder signs approach before bulk generation.  
**Live bank today:** 73 items (Gamma welcome-kit digitization) across 10 modules. Competency exam draws **20** via `drawHipaaExam` (separate from certification final).

---

## Why expand

One sitting = 20 items. At 73, a person can exhaust most of the bank in ~3–4 sittings. Target **~200** so 2–3 retakes stay mostly fresh without forcing early repeats, while seen-set still tracks honest repeats when the unused pool runs low.

---

## Approach — genuine variants (not synonym swaps)

### Principle

Each new item must test the **same underlying concept** as a parent (or a documented concept card), via a **different decision situation**, with **equivalent difficulty** — not rephrasing the stem and reshuffling the same four strings.

### Allowed variant moves (pick ≥1)

| Move | Example |
|------|---------|
| **Role / channel** | Same rule, but MA on chat vs front-desk phone vs fax |
| **Setting** | Clinic waiting room vs telehealth visit vs after-hours portal |
| **Boundary case** | When disclosure *is* permitted vs when authorization is required |
| **Actor identity** | CE vs BA vs incidental vendor (janitor / courier) |
| **Temporal** | Before visit vs during vs after discharge |
| **Failure mode** | What went wrong / what should happen next (breach path) |

### Disallowed (reject in review)

- Synonym-only stem (“less likely” → “not as likely”) with identical options  
- Same options in different letter order only  
- Trick questions that hinge on obscure wording rather than the concept  
- Inventing state-law specifics not in the training outline  
- Softening or hardening the keyed answer vs the Gamma/HHS concept the parent teaches

### Authoring template (required fields)

```text
id: draft-v1-###
parentConceptId: t-## or concept:slug
moduleId: (one of the 10 live modules)
variantMove: role|channel|setting|boundary|actor|temporal|failure
difficulty: 1|2|3  (match parent band unless reviewer bumps)
prompt / options / correctKey / explanation / distractorHints
reviewStatus: draft | needs-fix | approved | rejected
reviewerNotes:
```

### Target mix (~200)

| Module | Today | Target (~) | New (~) |
|--------|------:|-----------:|--------:|
| intro | 7 | 18 | +11 |
| ce-ba | 10 | 28 | +18 |
| phi | 5 | 16 | +11 |
| privacy | 7 | 22 | +15 |
| rights | 11 | 28 | +17 |
| security | 6 | 18 | +12 |
| safeguards | 7 | 20 | +13 |
| breach | 7 | 22 | +15 |
| enforcement | 10 | 20 | +10 |
| admin-simp | 3 | 8 | +5 |
| **Total** | **73** | **~200** | **~127** |

Prefer filling **thin modules** (phi, admin-simp, security) first so draws don’t over-sample rights/enforcement.

---

## Process gate (same discipline as Writing/chat drafts)

1. **Design signed** (this doc) — founder OK on approach  
2. **Sample batch** (~25 items in `hipaa-bank-expansion.draft.ts`) — human review  
3. **Only after sample approved** — generate remaining items in the same style/difficulty band  
4. **Merge to live bank** only with reviewer name + date; never auto-ship AI drafts  
5. Certification final exam and competency draw both read `ALL_QUESTIONS` — expanding the bank benefits both; keep competency draw separate-record / seen-set behavior unchanged

**Suggested primary reviewer:** Sneha (compliance) for answer-key accuracy; Sonu for MA-facing clarity / scenario realism. Either can reject an item.

---

## Seen-set / draw scaling (confirmed)

| Check | Result |
|-------|--------|
| Typing-style `drawUnseen` on synthetic **200**-item pool, 8×20 sittings | 160 unique IDs, **0** forced repeats until unused &lt; 20 |
| Live `drawHipaaExam` on **73** bank: sitting 2 after recording sitting 1’s 20 | **0** overlap |
| Seed entropy | Competency draws use `freshDrawSeed()` (crypto); Mulberry32 shuffle in `seen-set` |

**Caveat:** `drawHipaaExam` still uses `buildFinalExam` plan-first then fills from unseen (module-balanced certification helper). Exclusion of seen IDs is correct at 73 and will remain correct at 200. Optional later hardening: unused-first Fisher–Yates (same as typing) *after* module quotas — not required to expand safely.

---

## Sample batch location

`apps/hipaa-training/src/content/competency-exam/hipaa-bank-expansion.draft.ts`  
— **not imported** into `ALL_QUESTIONS` until review clears.

---

## Recovery note for `review-hipaa-1789084988996`

Isolated HIPAA review originally **did not persist** item IDs or answers (ephemeral React state only; attempt id timestamp ≠ draw seed). That specific attempt **cannot be reconstructed** from the server or repo. Going forward, isolated HIPAA submits write an item-level audit trail to `localStorage` (`siya-competency-exam-review-attempts-v1`) and show correct/incorrect on the done screen.
