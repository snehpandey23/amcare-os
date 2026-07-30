# Siya Assistant — add AI key on Vercel (workforce app only)

Use the **`hipaa-training`** project (internal helpdesk). **Do not** add these keys to **`siya-health`** or **`siya-guide`**.

## Option A — Vercel dashboard (recommended)

1. Open [Vercel Dashboard](https://vercel.com) → project **`hipaa-training`** (or **`hipaa-training-eight`** if that is the one linked to Git).
2. **Settings → Environment Variables**
3. Add **one** of:

| Name | Value | Environments |
|------|--------|----------------|
| `AI_GATEWAY_API_KEY` | From [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) | Production, Preview |
| **or** `OPENAI_API_KEY` | From [OpenAI API keys](https://platform.openai.com/api-keys) (org key, not ChatGPT Plus) | Production, Preview |

4. Optional: `SIYA_WORKFORCE_MODEL` = `openai/gpt-4.1-mini` (Gateway) or `gpt-4.1-mini` (OpenAI direct).
5. To force **retrieval-only** (no LLM) even with keys: `SIYA_WORKFORCE_USE_LLM` = `0`
6. **Redeploy** Production (Deployments → ⋮ → Redeploy).

LLM is **on by default** when a key exists and `SIYA_WORKFORCE_USE_LLM` is not `0`.

## Option B — CLI (you paste the key locally)

```bash
cd apps/hipaa-training
npx vercel link --project hipaa-training
npx vercel env add OPENAI_API_KEY production
# paste key when prompted — never commit or share in Slack
npx vercel deploy --prod
```

## Verify

```bash
curl -sS https://hipaa-training-eight.vercel.app/api/chat | jq .llmEnabled
```

Should return `true` after key + redeploy.

## Security

- Use an **organization** OpenAI key with usage limits; not a personal ChatGPT login.
- Staff chat must stay **PHI-free**; keys do not change that rule.
