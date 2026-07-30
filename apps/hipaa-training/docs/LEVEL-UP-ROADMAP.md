# Level Up — roadmap & database

**Level Up** is the employee companion layer (US English, culture, healthcare comms). It is **separate content** from the policy helpdesk KB.

## v1 (now)

- Catalog: `src/data/level-up-catalog.json` (phrases, trivia, terms, scenarios, writing drills)
- Progress: browser `localStorage` (`siya-level-up-v1`) — streak + XP
- Routes: `/` home hub · `/help` company chat · `/level-up` daily lessons

## v2 — team database (recommended)

| Table | Purpose |
|-------|---------|
| `level_up_cards` | id, category, prompt, choices JSON, answer, explain, active |
| `level_up_completions` | user_id, card_id, correct, completed_at |
| `level_up_streaks` | user_id, streak, last_active_date, total_xp |

Sync when HIPAA training API auth ships (`integrations/hipaa-training-api`).

## v3 — interactive modules (your spec)

- **US map** — states, capitals, abbreviations (tap quiz)
- **Timezone trainer** — PT ↔ IST drills
- **Accent / listening** — audio clips + MCQ (Blob storage, no PHI)
- **Patient call sim** — roleplay with rubric (professionalism, empathy, grammar)
- **Marketing academy** — track for Sonakshi’s team (SEO, ads, brand voice)
- **Leader micro-lessons** — 5‑min ownership, feedback, prioritization

## Content rules

- No real patient data in cards or simulations
- Help desk LLM must **not** invent Level Up content — cards are curated only
- Promote new phrases via JSON PR → `kb:build` not required (separate catalog)

## More daily card ideas

- **Holiday week playbook** — what to tell patients about closures
- **Insurance alphabet soup** — HMO, PPO, deductible, coinsurance (one per day)
- **Slang vs professional** — “ASAP” vs “at your earliest convenience”
- **Difficult conversation openers** — late cancel, payment declined, wait time
- **Charting verbs** — documented, notified, escalated, closed loop
