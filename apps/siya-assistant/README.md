# Siya Guide

Constrained **website navigation and public-information** assistant for Siya Health.

Not a doctor. Not a medical chatbot. Not a patient portal.

## What it does

1. Helps visitors find the right public page
2. Explains publicly published Siya services
3. Provides approved contact, screening, and booking links
4. Gives brief educational summaries from approved website content
5. Refuses everything else

## Safety model (v1)

- **Public knowledge only** (`data/public-kb.json` built from `siya-health` public indexes)
- **Fixed link registry** (`lib/link-registry.ts`) — model returns IDs, app resolves URLs
- **Anonymous + stateless** — no chat history persistence, no PHI collection
- **Deterministic guardrails** before any model call: emergency, PHI, injection, internal, clinical
- **Retrieval-first** over approved chunks; refuse when confidence is low
- **Analytics events only** (no free-text transcripts)

## Run locally

```bash
cd apps/siya-assistant
cp .env.example .env.local
npm install
npm run dev
```

Open [http://127.0.0.1:3456](http://127.0.0.1:3456).

Without API keys, Guide runs in deterministic retrieval mode. Optional:

- `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` — phrasing only, still grounded on retrieved public chunks
- `SIYA_GUIDE_DETERMINISTIC=1` — force no-LLM mode

## Red-team tests

```bash
npm run test:redteam
```

Suite: `tests/red-team.json` (150+ prompts across privacy, internal, social engineering, hallucination, clinical, emergency, navigation).

## Important files

| Path | Role |
|------|------|
| `lib/guide-engine.ts` | Orchestrates guards → intents → retrieval → optional LLM |
| `lib/guardrails.ts` | Input/output controls |
| `lib/link-registry.ts` | Approved destinations + quick actions |
| `lib/system-prompt.ts` | Siya Guide instructions |
| `data/public-kb.json` | Approved public knowledge collection |
| `app/api/chat/route.ts` | Stateless JSON API |
| `components/SiyaGuide.tsx` | Widget UI |

## Out of scope for v1

- Booking/canceling appointments inside chat
- Patient records, CarePatron/Spruce data access
- Diagnosis, prescribing, lab interpretation
- File uploads
- Transcript retention / model training on chats
