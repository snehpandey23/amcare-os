# Turn on Claude (no API key copy-paste on Vercel)

The staff app uses **Vercel AI Gateway + Claude** when deployed on Vercel. Auth is **OIDC** (automatic) — you do **not** need to paste `AI_GATEWAY_API_KEY` unless local dev fails.

## Already done for you (project `siya-staff-assist`)

- `SIYA_WORKFORCE_MODEL` = `anthropic/claude-sonnet-4.6` (Production + Preview)
- Code enables LLM on Vercel (`VERCEL=1`) via Gateway OIDC

## One click you may still need (first time only)

1. Open [Vercel AI Gateway](https://vercel.com/~/ai-gateway) (same team as the project).
2. **Enable AI Gateway** / add billing if prompted.
3. Allow **Anthropic** as a provider.

Then **Redeploy** `siya-staff-assist` (or push to `main` if Git deploy is on).

## Verify

```bash
curl -sS https://siya-staff-assist.vercel.app/api/chat | jq .llmEnabled
```

Should be `true`. Send a chat message — answers should read more naturally but still cite internal sources.

## Turn off

Set env `SIYA_WORKFORCE_USE_LLM=0` on the project and redeploy.

## Optional: manual key (local laptop only)

```bash
vercel link --project siya-staff-assist
vercel env pull apps/hipaa-training/.env.local
npm run dev:hipaa-training
```

Or set `AI_GATEWAY_API_KEY` in Vercel if OIDC ever fails (rare on Production).
