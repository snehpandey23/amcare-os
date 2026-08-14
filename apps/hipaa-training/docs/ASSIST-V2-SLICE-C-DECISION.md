# Decision — Assist v2 Slice C scope (gap detection)

**Date:** 2026-08-14  
**Status:** Locked for planning · flag/notify pipeline is the Slice C surface  

## Decision

**Slice C** for Assist v2 is scoped to the **flag / Notify owner pipeline only** (staff click → `/api/knowledge-gap` → `/api/assist/gaps` → founder instant email **or** lead weekly digest). It is **not** a shared retrieval layer and **not** automatic gap detection on every weak Ask/Assist turn.

## Explicit non-goals (deferred)

| Item | Why deferred |
| --- | --- |
| Porting Founder Coach heuristic gap-detection into Assist retrieval | Coach gaps (`coachKnowledgeGapsForAsk`) are **plan-draft heuristics** (fundraising/comp wording, citation-only flags). That is **not** Assist KB retrieval logic and was **not** ported into `/api/chat` or layered retrieval. |
| Automatic retrieval-miss → gap row without a click | Deliberately **not built now**. Needs real usage data from Assist v2 **A+B** (threads + recall) plus the existing Notify owner path before we invent auto-gap noise. Revisit after observed miss rates, not before. |
| Founder-only restricted KB corpus (finance/HR/fundraising ACL) | Separate product ask; do **not** treat as Slice C in this lock. |

## What “done” means for this lock

- Documented scope (this note).  
- **E2E smoke** of Notify owner: real gap row + real notification signal (founder Resend **or** lead-digest queue), observed — not “code path exists.”

## Related

- Pipeline: `apps/hipaa-training/docs/ESCALATION-EMAIL.md`  
- Threads (A+B): `apps/hipaa-training/docs/ASSIST-V2-THREADS.md`  
- Coach plan gaps (separate): `FounderCoachPanel` / `coachKnowledgeGapsForAsk` — stay Coach-local  
