# OET LMS Chat – Adaptive Patient Persona Simulator

WebSocket backend for the Siya Health MA Chat Simulator. Streams LLM-generated patient responses token-by-token.

## Requirements

- Node.js 18+
- **Perplexity:** `PERPLEXITY_API_KEY` (recommended), or **OpenAI:** `OPENAI_API_KEY`

## Setup

1. From repo root: `npm install`
2. In `integrations/oet-lms-chat/`, copy `.env.example` to `.env` and set your key:
   - **Perplexity only:** set `PERPLEXITY_API_KEY=pplx-...` (no OpenAI key needed)
   - Or use OpenAI: set `OPENAI_API_KEY=sk-...`

## Run

```bash
# Run chat backend only (port 3007)
npm run dev --workspace=integrations/oet-lms-chat

# Run chat backend + OET LMS frontend together
npm run dev:oet-lms-chat
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PERPLEXITY_API_KEY` | — | Perplexity API key (use this or OpenAI) |
| `OPENAI_API_KEY` | — | OpenAI API key (if not using Perplexity) |
| `OET_LMS_CHAT_PORT` | 3007 | HTTP + WebSocket server port |
| `OET_CHAT_MODEL` | sonar (Perplexity) / gpt-4o-mini (OpenAI) | Model name |

## WebSocket Protocol

**Client → Server:** `{ type: 'ma_message', content: string, sessionId: string, personaId: string, typingStartedAt?: number, typingCompletedAt?: number }`

**Server → Client:** `{ type: 'patient_token', token: string, elapsedMs?: number }` (streaming) then `{ type: 'patient_complete', fullResponse: string, totalTimeMs: number, responseLatencyMs?: number }`
