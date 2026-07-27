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

**If CLI deploy fails:** use the Vercel dashboard → project **`hipaa-training`** (not `hipaa-training-eight`) → **Redeploy** latest **Production** from Git **`main`** (Git-connected builds include the full monorepo).

### URLs

| URL | Status |
|-----|--------|
| **https://hipaa-training-eight.vercel.app** | **Working** internal Siya Assistant (use this until alias is fixed) |
| **https://siya-assistant.vercel.app** | Often **broken** — domain is on project `hipaa-training-eight` whose last CLI deploy failed; move domain to `hipaa-training` in Vercel → Settings → Domains |
| https://www.siya.health | Public website only — **not** the helpdesk |

**Fix `siya-assistant.vercel.app` (one-time in Vercel UI):**

1. Project **hipaa-training-eight** → Settings → Domains → remove `siya-assistant.vercel.app`
2. Project **hipaa-training** → Settings → Domains → add `siya-assistant.vercel.app` → assign to **Production**
3. Redeploy **hipaa-training** from Git **main**

Monorepo CLI deploy from repo root (when needed):

```bash
cd /path/to/amcare-os
npx vercel deploy --prod --project hipaa-training --local-config vercel-assistant.json
```

**LLM:** Enabled automatically when `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` is set on this project. Set `SIYA_WORKFORCE_USE_LLM=0` to force retrieval-only. Do **not** add these keys to the **siya.health** project.

Hard refresh (**Cmd+Shift+R** / **Ctrl+Shift+R**) if you still see the old gray UI.

## Run

```bash
npm run dev:hipaa-training
```

Open http://localhost:3000
