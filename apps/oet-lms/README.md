# Siya Health – MA Chat Simulator (OET LMS)

Training app for **Medical Assistants**: practice difficult patient chats, get heuristic feedback (empathy phrases, basic grammar checks, typing WPM), and optionally save session reports.

This is **not** a full four-skill OET/IELTS exam product. There is no Comprehension / Understanding / Communicating module pack in this repo today — only the **chat simulator** and related UI (personas, progress from real sessions, resources, export stubs).

## What is actually built

| Piece | Path | Port |
|-------|------|------|
| Frontend (Vite + React) | `apps/oet-lms` | **3005** |
| Chat WebSocket (LLM patient) | `integrations/oet-lms-chat` | **3007** |
| Auth + session reports API | `integrations/oet-lms-submissions` | **3006** |

**Working features**

- Sign up / login (requires Postgres + `JWT_SECRET` on submissions)
- **Chat Simulator** with 6 patient personas
- **Live LLM** patient replies when chat backend has `PERPLEXITY_API_KEY` or `OPENAI_API_KEY`
- **DEMO mode** — canned, non-persona-aware replies when live WS is unavailable (UI labels this clearly)
- End session → empathy / grammar heuristics + WPM; optional save to API
- Progress / dashboard show **real session counts** only (no fabricated weekly charts)

**Not built / not claimed**

- Four-module LMS (listen/scribe, speaking, reading banks)
- Files like `caseLibrary.ts`, `modules.ts`, `typingTestPassages.ts` (removed from docs; they do not exist)
- Automatic clinical “accuracy” scoring (UI labels it as a **placeholder**)
- LanguageTool / advanced grammar (Phase 2)
- Staff-portal SSO (Phase 3)

## Run locally (full stack)

From repo root (`amcare-os`):

1. **Postgres** — create an empty DB (example local URL below).
2. **`integrations/oet-lms-submissions/.env`**
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@127.0.0.1:5432/oet_lms
   JWT_SECRET=dev-change-me
   OET_LMS_SUBMISSIONS_PORT=3006
   ```
3. **`integrations/oet-lms-chat/.env`**
   ```env
   PERPLEXITY_API_KEY=pplx-...
   # or OPENAI_API_KEY=sk-...
   OET_LMS_CHAT_PORT=3007
   ```
4. Install + start all three:
   ```bash
   npm install
   npm run dev:oet-lms
   ```
5. Open the URL Vite prints (default **http://127.0.0.1:3005**).

Create an account on the login page, open **Chat Simulator**, confirm the banner says **LIVE LLM** (or explicitly choose **DEMO**), chat, then **End session & see feedback**.

If live chat returns a **quota / billing** error from Perplexity or OpenAI, the UI should show an error — switch to **DEMO canned replies** to finish a practice session without LLM, or fix the API plan/key.

### Frontend only

```bash
npm run dev --workspace=apps/oet-lms
```

Without submissions + chat, you cannot log in or get live AI. Demo canned chat still needs a logged-in session unless you change auth (out of scope).

## Data layout (frontend)

- `src/data/personas.ts` — 6 personas (also mirrored in `integrations/oet-lms-chat/src/personas.ts`)
- `src/data/chatEvaluation.ts` — empathy / grammar heuristics + WPM
- `src/data/personaRubric.ts`, `calgaryCambridgeRubric.ts` — keyword / heuristic rubrics
- `src/data/dashboardData.ts` — real session history helpers (no mock analytics)

## Spec vs product

`docs/LMS_MODULE_SPEC.md` describes a larger future design. Treat it as **aspirational**, not as documentation of what ships today.

## Deploy notes

Historical Amplify / Railway notes may exist in `DEPLOY-AMPLIFY.md` / `ADMIN-AND-BACKEND.md`. Production deploy is separate from the staff portal Vercel projects.
