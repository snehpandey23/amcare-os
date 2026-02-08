# Siya Health – MA Training

Chatting skills and typing practice for **Medical Assistants (MAs)** in telemedicine. Siya Health evaluation framework (8 competencies, Red/Yellow/Green/Gold status).

## Siya Health context

- **Mission:** Standardizing ADHD treatment through telemedicine with physician-led, MA-supported concierge model (TX, PA, FL).
- **Team:** MAs from India and international talent; this LMS bridges Indian healthcare education and US telemedicine excellence.
- **Framework:** 8 core competencies (1–5 scale), status system (Red &lt;2.5, Yellow 2.5–3.4, Green 3.5–4.4, Gold 4.5+), remediation playbooks, content pillars (Medical English, US Healthcare, Medications, Siya Guidelines, Concierge Excellence).

## Run locally

From the repo root (`amcare-os`):

**Full stack (live AI chat + auth + frontend):**

1. Add `PERPLEXITY_API_KEY=pplx-...` to `integrations/oet-lms-chat/.env` or repo root `.env`.
2. Run:

```bash
npm run dev:oet-lms
```

Starts chat backend (3007), submissions API (3006), frontend (3005). Open the URL Vite prints (e.g. **http://127.0.0.1:3005**). With the key set you get **live AI** patient replies; without it the app uses **demo mode** so you can still send and get feedback.

**Frontend only** (no AI chat or saved reports):

```bash
npm run dev --workspace=apps/oet-lms
```

**Not on AWS by default.** To run on the internet with your own credentials and reports, deploy the APIs and DB (e.g. AWS App Runner + RDS, or Railway); see repo **DEPLOYMENT.md** → “OET LMS” and “Running on AWS”.

## Features

- **Home** – Siya context, quick access to Chatting and Typing test
- **Dashboard** – Individual MA view: status (Red/Yellow/Green/Gold), 8-competency breakdown, next action
- **Modules** – Chatting (patient chat simulators), Typing test (WPM and accuracy)
- **Knowledge** – Content pillars: Medical English, US Healthcare, Medications, Siya Guidelines, Concierge Excellence
- **Practice** – Chatting scenarios (case-based) and typing passages; we measure accuracy, empathy, personalization, knowledge, typing speed (Chatting) and WPM/accuracy (Typing test)
- **Remediation** – Playbooks per competency when score &lt; 3.5
- **My Progress** – Overall and per-module progress (placeholder)

## Data and structure

- **`src/data/modules.ts`** – Modules: Chatting, Typing test; workflows, activities, metrics
- **`src/data/siya.ts`** – Siya status config, 8 competencies, remediation playbooks, content pillars
- **`src/data/caseLibrary.ts`** – Shared cases (clinical notes + chatScenarioPrompt) for Chatting
- **`src/data/typingTestPassages.ts`** – Passages for typing test (short, medium, long)

## Next steps (when wiring backend / AI)

- Chatting: scripted or LLM patient replies; measure promptness, appropriateness, personalization, empathy, understanding
- Connect Dashboard to real MA profiles and assessment history
- Feed practice results into competency scores and trigger remediation
- Implement rubrics (Empathy/Warmth, etc.) in evaluation pipeline
