# Siya Assistant (SiyaOS company memory)

Chat-first **Siya Assistant** at `/` — answers from **[SiyaOS Knowledge Base v1](../../docs/siyaos-knowledge-base/)** (ops, marketing, clinical coordination, compliance, tech). Optional **HIPAA certification** at `/training`.

**Knowledge:** add `docs/siyaos-knowledge-base/**/topics/*.md` → `npm run kb:build -w @amcare/hipaa-training` (runs automatically on `build`).

**Favicon / app icons:** `npm run assets:icons -w @amcare/hipaa-training`

**Production (internal helpdesk — not siya.health):**

- **https://siya-assistant.vercel.app** (primary alias — Siya Assistant)  
- https://siya-workforce-assistant.vercel.app  
- https://hipaa-training-eight.vercel.app (legacy)

Deploy **only** from this directory:

```bash
cd apps/hipaa-training && npx vercel deploy --prod
```

In Vercel → Project → Settings → Domains, set **siya-assistant.vercel.app** as the production alias if the CLI does not attach it automatically.

**LLM:** Enabled automatically when `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` is set on this project. Set `SIYA_WORKFORCE_USE_LLM=0` to force retrieval-only. Do **not** add these keys to the **siya.health** project.

Hard refresh (**Cmd+Shift+R** / **Ctrl+Shift+R**) if you still see the old gray UI.

## Run

```bash
npm run dev:hipaa-training
```

Open http://localhost:3000
