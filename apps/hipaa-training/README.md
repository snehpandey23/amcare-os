# Siya Assistant (SiyaOS company memory)

Chat-first **Siya Assistant** at `/` — answers from **[SiyaOS Knowledge Base v1](../../docs/siyaos-knowledge-base/)** (ops, marketing, clinical coordination, compliance, tech). Optional **HIPAA certification** at `/training`.

**Knowledge:** add `docs/siyaos-knowledge-base/**/topics/*.md` → `npm run kb:build -w @amcare/hipaa-training` (runs automatically on `build`).

**Favicon / app icons:** `npm run assets:icons -w @amcare/hipaa-training`

**Production (Siya Assistant):**

- https://siya-workforce-assistant.vercel.app  
- https://hipaa-training-eight.vercel.app (legacy Vercel project name — same app)

Hard refresh (**Cmd+Shift+R** / **Ctrl+Shift+R**) if you still see the old gray UI.

## Run

```bash
npm run dev:hipaa-training
```

Open http://localhost:3000
