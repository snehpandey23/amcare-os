# Siya Assistant (SiyaOS company memory)

Chat-first **Siya Assistant** at `/` — answers from **[SiyaOS Knowledge Base v1](../../docs/siyaos-knowledge-base/)** (ops, marketing, clinical coordination, compliance, tech). Optional **HIPAA certification** at `/training`.

**Knowledge:** add `docs/siyaos-knowledge-base/**/topics/*.md` → `npm run kb:build -w @amcare/hipaa-training` (runs automatically on `build`).

**Favicon / app icons:** `npm run assets:icons -w @amcare/hipaa-training`

**Production (internal helpdesk — not siya.health):**

- **https://siya-staff-assist.vercel.app** — staff bookmark (Vercel project `siya-staff-assist`, no GoDaddy)  
- Deploy config: [../siya-staff-assist/README.md](../siya-staff-assist/README.md)

Deploy **only** from this directory:

```bash
cd apps/hipaa-training && npx vercel deploy --prod
```

**If CLI deploy fails:** use the Vercel dashboard → project **`hipaa-training`** (not `hipaa-training-eight`) → **Redeploy** latest **Production** from Git **`main`** (Git-connected builds include the full monorepo).

### URLs

| URL | Status |
|-----|--------|
| **https://siya-staff-assist.vercel.app** | **Production** — use this |
| https://hipaa-training-eight.vercel.app | Legacy — ignore |
| https://siya-assistant.vercel.app | **Not ours** — another Vercel account |

Monorepo CLI deploy from repo root (when needed):

```bash
cd /path/to/amcare-os
npx vercel deploy --prod --project hipaa-training --local-config vercel-assistant.json
```

**LLM:** Enabled automatically when `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` is set on this project. Set `SIYA_WORKFORCE_USE_LLM=0` to force retrieval-only. Step-by-step: [docs/ADD-AI-KEY-VERCEL.md](./docs/ADD-AI-KEY-VERCEL.md).

Hard refresh (**Cmd+Shift+R** / **Ctrl+Shift+R**) if you still see the old gray UI.

## Run

```bash
npm run dev:hipaa-training
```

Open http://localhost:3000
