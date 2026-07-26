# Siya Assistant — product definition

> **Siya Assistant is an internal AI help desk** that helps employees get work done using **approved** company knowledge, asks the right follow-up questions, and escalates when needed.

Not an ERP. Not an EMR. Not a dashboard. **One intelligent doorway.**

If ten employees start here instead of Slack, Drive, WhatsApp, and hallway questions—and get measurably faster—that is the bar before scaling outward.

---

## Three layers (mental model)

| Layer | Who sees it | What it is |
|-------|-------------|------------|
| **1 — Knowledge** (invisible) | Authors only | 20+ modules, topics, decision log, metadata — rich graph for retrieval |
| **2 — Brain** (invisible) | System | Intent router → department/task → follow-ups → approved sources → escalate |
| **3 — Product** (visible) | Every employee | **What do you need help with today?** One text box. |

**20 modules = author organization, not product navigation.**

---

## V1 pipeline (deterministic — no agent loops)

```text
Employee message
  → Intent router
  → Follow-up questions
  → Retrieve approved resources
  → Generate response
  → Escalate if needed
```

No autonomous tool chaining in v1.

---

## Unknown questions improve the KB

When there is no approved answer:

1. Assistant shows **Unknown workflow**
2. Employee can **Notify owner** (logged: department, question, status `awaiting_policy`)
3. Leadership adds a live topic or decision log entry
4. **Missing knowledge** metrics become the documentation roadmap

---

## Four metrics (product, not AI benchmarks)

| Metric | Meaning |
|--------|---------|
| **First-answer rate** | % answered without escalation or gap |
| **Time to resolution** | Question → answer (client v1 in local metrics) |
| **Escalation rate** | Intentional escalations OK; unexplained spikes are bad |
| **Missing knowledge** | Top unanswered questions this week |

Client v1: `localStorage` via `src/lib/siya-os/metrics.ts` and `knowledge-gap.ts` — export before we wire Postgres.

---

## Document metadata (required over time)

Every topic / decision should carry:

```yaml
owner: Marketing Lead
status: approved   # draft | review | live (topics) 
reviewDate: 2026-09-01
supersedes: marketing-sop-v1
confidence: official  # official | draft | historical
```

Prevents the model from blending five versions of “how we run Google Ads.”

---

## Decision log

Institutional **why**, not just **how**. See `decisions/` and `_template-decision.md`.

Employees ask: *Why did we change the homepage CTA?* → retrieval returns decision + owner + date.

---

## v1 routing departments (8)

Accounts · HR · Marketing · Clinical Operations · Compliance · Technology · Leadership · General

---

## MVP status

See root [`README.md`](./README.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).
