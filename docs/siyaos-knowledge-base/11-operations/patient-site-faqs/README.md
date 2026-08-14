# Patient-site FAQs + service blurbs (staff Ask pack)

**Audience:** Medical assistants, ops, Billing · **Owner:** Clinical Program / Billing  
**Pattern:** Same as Klarity pack — curated staff-facing summaries, **not** raw website dumps.

## Why this pack exists

Staff get asked the same high-traffic patient questions that live on `siya.health/answers` and service pages. Ask should retrieve **short explainers**, not 61 answer pages or full marketing copy.

## Topics (live — Ask retrieves)

| Topic | ID | Use when |
|-------|-----|----------|
| Insurance / cash-pay edge cases | `patient-faq-insurance-cash-pay` | “Do you take insurance?”, EOBs, Superbills, Klarity vs direct |
| FSA / HSA details | `patient-faq-fsa-hsa` | Receipts, what may qualify, pharmacy vs visit fees |
| Is telehealth legitimate | `patient-faq-telehealth-legitimate` | Trust / legitimacy / “is this real care?” |
| What’s included in ADHD evaluation | `patient-faq-adhd-evaluation-included` | What’s in the $149 eval; diagnosis ≠ medication |
| Service-line blurbs | `service-line-blurbs` | “Do we offer X?” follow-on explanation |

Facts-lookup **`do we offer X?`** returns yes/no + a one-paragraph blurb (from the facts snapshot). Use this topic when staff need slightly more context or related links.

## Explicitly skipped (content audit)

- Full blog corpus  
- All 61 `/answers` pages  
- SEO claim stats  
- CSA / refill playbook completion (separate effort)

## Legal escalation summaries — **HELD FOR SIGN-OFF**

| Topic | ID | Status |
|-------|-----|--------|
| Legal policy what-to-say / escalate | `legal-escalation-summaries` | **`draft` + `bot_retrieve: false`** — not in Ask index |

**Do not set `status: live` until founder or legal signs off.** Summaries are staff talk-tracks only — not substitutes for counsel-reviewed documents. Full legal text stays on `siya.health/legal/*` and must **not** be bulk-imported into Ask retrieval.

## Canonical public sources (verify before quoting)

| Asset | URL |
|-------|-----|
| Pricing / cash-pay | https://www.siya.health/pricing |
| FSA/HSA guide | https://www.siya.health/answers/fsa-hsa-adhd-evaluation |
| Telehealth legitimacy | https://www.siya.health/answers/is-telehealth-legitimate |
| Eval included | https://www.siya.health/answers/what-included-199-adhd-evaluation |
| ADHD service | https://www.siya.health/adhd-care |
| Weight / GLP-1 | https://www.siya.health/weight-loss-metabolic-health |
| Primary | https://www.siya.health/primary-urgent-care |
| Men’s health | https://www.siya.health/mens-health-longevity |
| Women’s health | https://www.siya.health/womens-health |
| Labs | https://www.siya.health/labs |
| Prescriptions | https://www.siya.health/prescriptions |
| Legal hub | https://www.siya.health/legal |

## Guardrails

1. **siya.health direct** vs **Klarity** — never mix insurance or cancel rules across channels.  
2. No PHI in Ask.  
3. Do not invent insurance “we’ll bill later” promises.  
4. Diagnosis / evaluation does **not** guarantee medication.  
5. Legal questions beyond the signed-off talk-track → escalate (Privacy Officer / founder / counsel as listed on the draft topic).

## Rebuild

```bash
npm run kb:build -w @amcare/hipaa-training
npm run facts:build -w @amcare/hipaa-training   # if service blurbs changed in snapshot
```
