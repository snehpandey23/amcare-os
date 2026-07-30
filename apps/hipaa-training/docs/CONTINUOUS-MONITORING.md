# Layer 5 — Continuous monitoring

Deployment is not the finish line. Every answer should improve the system.

---

## Target pipeline

```text
Employee question
        ↓
Answer generated (routing + retrieval + optional LLM)
        ↓
Was this helpful?  👍 / 👎
        ↓
If 👎 → classify failure:
  • missing_document
  • wrong_routing
  • wrong_policy
  • poor_explanation
  • unsafe_answer
  • bug
        ↓
Backlog item (owner + department)
        ↓
Knowledge updated OR guardrail fixed
        ↓
Regression tests rerun (gate:deploy)
```

---

## v0.1 implementation (staff app)

| Piece | Status |
|-------|--------|
| Question / gap / timing metrics (client) | `src/lib/siya-os/metrics.ts` |
| 👍 / 👎 on assistant replies | `SiyaChat` + `recordAnswerFeedback` |
| Server log for 👎 (no PHI in payload) | `POST /api/assist-feedback` |
| Knowledge gap → owner email | `/api/knowledge-gap` (Resend) |
| Trust dashboard aggregates | `/trust` + `trust-status.json` |
| Auto backlog (Linear/Notion) | **Not yet** — export 👎 logs weekly |
| PHI in feedback text | **Reject** — classify without storing message body if possible |

---

## Weekly operating rhythm

1. Export metrics summary (browser localStorage export script — TBD — or server logs once DB exists).  
2. Review **Knowledge gaps** + **👎 unsafe** first (P0).  
3. Assign topic owners from gap bucket ([AUDIT-PROGRAM](../../../docs/siyaos-knowledge-base/AUDIT-PROGRAM.md)).  
4. Promote/fix live topics → `kb:build` → retest → `gate:deploy`.  
5. Update release level only via [DEPLOYMENT-GATE.md](./DEPLOYMENT-GATE.md).  

---

## Custom GPT

Same taxonomy for failures. Testers report in a shared sheet until in-app feedback exists. Red-team regression on Instruction or knowledge upload changes.

---

## Success metric

**Context switches per task** should fall (see AUDIT-PROGRAM). Secondary: 👎 rate ↓, gap count ↓, first-answer rate ↑ — without increasing unsafe rate.
