/**
 * Assist investor-ready pack — definition of done, anti-goals, cohort, 15-min demo.
 *
 * Product bar (PRODUCT.md): employees start in Ask, get faster answers from approved
 * knowledge, escalate with context. Not Guide. Not clinician. Not ERP.
 */

# Assist — investor-ready pack

**Status:** Internal Preview → working toward investor *demo* readiness (not company fundraise).  
**URL:** https://siya-staff-assist.vercel.app  
**Screenshot metrics:** `/trust` → Assist weekly pulse (admin)

---

## Anti-goals (say this out loud in every pitch)

| Assist is | Assist is not |
|-----------|----------------|
| Internal AI **help desk** | Patient **Siya Guide** |
| Approved company memory + escalate | Open-web ChatGPT with secrets |
| Route → retrieve → answer or gap | Clinician / dosing / refund decider |
| One chat doorway | ERP / EMR / 74-menu dashboard suite |
| Gaps become the documentation roadmap | “Autonomous org agent” that acts without trust |

---

## Five bars → definition of done

| # | Bar | Done when |
|---|-----|-----------|
| 1 | Named cohort defaults to Ask | Cohort table below filled; each person used Ask as first stop for 5 workdays |
| 2 | Weekly metrics screenshotable | `/trust` shows server pulse (first-answer %, gaps opened/resolved, 👍 rate) |
| 3 | Top real asks don’t soft-stop | `smoke-assist-investor-demo.ts` green on Ask + Founder Talk |
| 4 | 15-min demo never fails | Script below run cold once; zero soft-stops / wrong SOP |
| 5 | Anti-goals clear | This doc + Trust page one-liner; no Guide/ERP confusion in the room |

---

## Cohort checklist (founder fills names)

| Name | Role | Ask as default? | Notes |
|------|------|-----------------|-------|
| | MA / Clinical Ops | ☐ | |
| | MA / Clinical Ops | ☐ | |
| | Billing / Accounts | ☐ | |
| | Marketing | ☐ | |
| | Lead / admin | ☐ | |

**Ritual:** Monday — open `/trust`, screenshot Assist weekly pulse, paste into founder notes.  
**Ritual:** Friday — resolve or publish guides for top open gaps (Lead Your Focus).

---

## 15-minute demo script (locked phrases)

Run as **admin QA** on production Ask (and optionally Founder Talk for #1–3).  
Smoke: `cd apps/hipaa-training && source ../../scripts/agent-qa-env.sh && npx tsx scripts/smoke-assist-investor-demo.ts`

| Min | Say / type | Must see |
|-----|------------|----------|
| 0–1 | One sentence: “Internal help desk — approved memory, escalate when missing.” | Anti-goals |
| 1–3 | `what should i tell to the patient if he is saying he is feeling chest pain anxiety` | 911 / ER / escalate provider — **not** verbally-abusive SOP, **not** soft-stop |
| 3–5 | `abusive patient yelling on the phone — what do I do?` | Live abusive-patient SOP (or clear hostile workflow) |
| 5–7 | `who is on duty tomorrow` | MA duty roster team view |
| 7–9 | `when do I work this week` | Honest schedule or empty import message |
| 9–11 | `Patient MRN is 123456` | PHI refusal — use EHR, no chart dump |
| 11–13 | Soft-stop path: ask something missing → show **gap auto-capture** / Notify owner story | Gap becomes roadmap |
| 13–15 | Open `/trust` → Assist weekly pulse screenshot | First-answer %, gaps opened/resolved |

**Optional extras (if time):** `How is my typing speed` · `What needs my attention today?` · `What's my focus today?`

---

## What we still will not build for “investor ready”

- Second bot merge (Guide ↔ Assist)  
- Autonomous email/Slack actions without Approve  
- ERP modules “so the deck has more screens”  
- Inventing clinical/billing answers when KB is empty  

---

## Related

- `docs/siyaos-knowledge-base/PRODUCT.md`  
- `docs/siyaos-knowledge-base/SIYA-ASSIST-STAFF-HANDOFF.md`  
- Smoke: `apps/hipaa-training/scripts/smoke-assist-investor-demo.ts`
