---
id: internal-assistant-guardrails
module: 09-ai-strategy
title: Internal assistant (Siya) — guardrails
status: live
owner: Engineering / Privacy
keywords:
  - siya assistant
  - chatbot
  - internal ai
  - phi
  - guardrails
  - knowledge base
  - retrieval
priority: 9
sources:
  - apps/hipaa-training/src/lib/siya-os/engine.ts
  - docs/siyaos-knowledge-base/README.md
---

## Overview

How **Siya Assistant** answers staff questions using **company memory**, not the open internet.

## Why

General-purpose ChatGPT does not know our escalation paths, entity structure, or compliance boundaries.

## SOP

1. Answers come from **SiyaOS Knowledge Base** topics with `status: live`.  
2. **No PHI** in chat (names, DOB, MRN, etc.) — refused automatically.  
3. **No clinical advice** — route to provider/clinical lead.  
4. **No refund promises** — billing lead.  
5. Optional **HIPAA certification** at `/training` for structured learning.  
6. Public **Siya Guide** (`apps/siya-assistant`) is separate — patient/public KB only; **retrieval-only by default** (no LLM unless `SIYA_GUIDE_DETERMINISTIC=0`).  
7. Persona + guardrails: [siya-helpdesk-assistant-persona.md](./siya-helpdesk-assistant-persona.md); LLM system prompt: `apps/hipaa-training/src/lib/siya-os/system-prompt.ts` when `SIYA_WORKFORCE_USE_LLM=1`.

## FAQ

**How do we add what the bot knows?**  
Add a topic under `docs/siyaos-knowledge-base/**/topics/*.md`, set `status: live`, run `npm run kb:build -w @amcare/hipaa-training`.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Bot has no match | Add keywords + AI Context section; rebuild KB |
| Wrong answer | Fix topic; revision history; never tune by hidden prompt alone |

## AI Context

You are a workforce helper for all functions (ops, marketing, HR, eng, clinical coordination) — not a clinician. Prefer SOP and AI Context sections. Always show escalation contacts when relevant.

## Related documents

- `docs/siyaos-knowledge-base/README.md`
- `apps/siya-health/docs/SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md` (patient-facing graph)

## Owner

Engineering + Privacy Officer

## Revision history

| Date | Change |
|------|--------|
| 2026-07-26 | SiyaOS KB v1 launch |
