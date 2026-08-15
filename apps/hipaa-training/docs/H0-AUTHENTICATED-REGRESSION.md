# H0 — Authenticated Assist regression (hard gate)

**Status:** Required before any site-wide chat IA / chrome work (Phase A+).

## Hard rule

Anonymous `/api/chat` is **not** acceptable evidence for Assist, Ask, or Founder Talk behavior.  
Every H0 milestone and every pretploy Assist claim must use an **authenticated** Bearer session (`ASSIST_TOKEN`).

This is not an open product question — it is process law after repeated false “fixed” reports from anonymous curls.

## Run

```bash
# Token: staff portal → DevTools → localStorage `hipaa-training-jwt`
ASSIST_TOKEN='…' npm run smoke:h0 -w @amcare/hipaa-training
# or:
ASSIST_TOKEN='…' npx tsx apps/hipaa-training/scripts/h0-authenticated-regression.ts
```

Exit code `0` only if all cases PASS. JSON dump: `apps/hipaa-training/.cursor-verify/h0-results.json`.

## Cases covered

1. Off-topic multi-turn (music / CAC) — no 1–5 triage, no “You wrote” concat, no topic bleed  
2. Brand token `#fffdf6` (typo `desgin`)  
3. Presence → Team pulse (not Founder Talk LLM)  
4. Practice → `/learn/practice#typing`  
5. Tier-3 role/authority (unconfirmed clinical lead)  
6. Slice B preference recall + false policy reject  
7. Portal-signals must not overwrite `ruleFinal` declines  

## Related local smokes (not a substitute for H0)

`smoke-priya-pref.ts`, `smoke-role-authority-tier3.ts`, `smoke-presence-intent.ts`, `smoke-portal-llm-guard.ts`, `smoke-auth-talk-replay.ts`
