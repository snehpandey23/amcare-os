# Employee portal + billing training — how Siya Assistant uses them

Your **Employee Portal** page and the **billing/compliance meeting** serve different jobs. The assistant should **not** copy-paste that whole page into the AI. It should **route**, **teach**, and **link**.

---

## Three layers (keep separate)

| Layer | Source | Assistant behavior |
|--------|--------|-------------------|
| **1. Hub** | Learn · Practice · Ask in-app; external tools collapsed under shortcuts | Home → workspace pillars; `/grow` dashboard |
| **2. Approved policy** | `docs/siyaos-knowledge-base` live topics (e.g. `billing-late-cancel`, escalation) | **Answer** in Ask/chat from KB only. Billing lead owns updates. |
| **3. Practice** | Meeting scenarios → `billing-scenarios.json` + Level Up MCQs | **Train** staff; not legal policy until billing signs off KB text. |

**Zoho patient sheets** (update / pre-appointment): link only + label **“PHI — never paste rows into Siya Assistant.”**

---

## What we built in the app

- **Home → Employee workspace** — curated links from `src/data/employee-portal-links.json` (update when portal changes).
- **Level Up → Billing & refunds (practice)** — 10 scenarios from your meeting transcript.
- **KB** — expanded FAQ on `billing-late-cancel` (run `npm run kb:build -w @amcare/hipaa-training` before deploy).

---

## Meeting transcript → assistant (themes captured)

1. **No false promises** — refunds, discounts, “100% refund,” fee waivers without billing.
2. **Provider agreement ≠ staff authority** — still route billing.
3. **Refunds without billing awareness** — workflow incident.
4. **Wrong charge type/amount** — revenue integrity / compliance.
5. **Late cancel / same-day** — policy language, not chat promises.
6. **Provider emergency** — reschedule; refund if policy says so.
7. **No-show** — policy first; no proactive refund.
8. **Failed payment / slot** — free slot per ops rules.
9. **FSA/HSA** — eligible sometimes; billing confirms; cards only in Clarity/Carepatron.

**Next:** Billing lead reviews scenario answers + KB FAQ → set `reviewDate` → add more MCQs from the “wheel” game slides if you export them as text.

---

## Zoho unified app (later)

- **SSO:** Sign in with Zoho → same employee identity.
- **WorkDrive:** Links to onboarding/training folders; **do not** auto-ingest whole Drive into the bot.
- **Cliq/Mail:** Deep links + future “post de-identified escalation summary” — not read full mail/chat as memory.

---

## Maintaining the portal list

When the portal doc changes:

1. Edit `employee-portal-links.json` (or ask engineering).
2. Do **not** put live roster or sheet **contents** in the bot.
3. Promote **policy** changes to git KB with owner + `status: live`.

---

## Ask/chat examples (after KB rebuild)

- “Where is daily Meet?” → workspace link + Meet URL.
- “Can I promise a refund for same-day cancel?” → late-cancel topic + escalate billing.
- “What is FSA?” → practice card + billing escalation (full policy in billing SOP when live).
