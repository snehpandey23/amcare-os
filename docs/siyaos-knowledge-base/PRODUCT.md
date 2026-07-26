# Siya Assist — product definition (internal)

> **Siya Assist is an internal AI help desk** that understands employee requests, routes them to the correct business function, asks task-specific follow-up questions, retrieves **approved** company resources, helps complete the work, and escalates unresolved or high-risk issues **with full context**.

Not an ERP. Not an EMR. Not a dashboard. **One intelligent doorway.**

## Core workflow

```text
Employee question → intent → department + task → follow-up questions
  → search approved KB → answer / draft / checklist → escalate if needed
```

## v1 routing departments (8 only)

| Department | Examples |
|------------|----------|
| Accounts | Expenses, reimbursements, invoices, payroll questions |
| HR | Leave, onboarding, policies, performance |
| Marketing | Content, ads, SEO, brand, carousels, captions |
| Clinical Operations | Scheduling, refills, portal chat, workflows (no clinical decisions) |
| Compliance | Privacy, HIPAA, documentation, approved comms |
| Technology | Login, software, website, integrations |
| Leadership | Approvals, strategy references |
| General | Unclear requests, cross-cutting policies |

## Knowledge modules (20) vs routing (8)

The **20 folders** in this repo organize **content** for authors. The **8 departments** are what the **router shows employees**. Do not expose 20 modules in the UI.

## Answer priority

1. Approved policy → 2. Current SOP → 3. Template → 4. Formal decision log → 5. Training → 6. Discussion → 7. General guidance (label as low confidence).

## Resource metadata (target)

Department, topic, document type, owner, approval status, effective/review dates, roles allowed, escalation owner.

## MVP status (honest)

| Capability | Status |
|------------|--------|
| One chat UI | Live |
| Department + task router (keyword v1) | In progress |
| Follow-up question hints | In progress |
| KB retrieval + sources | Live |
| Escalation summary + button | In progress |
| Employee login + progress API | Optional env |
| Admin upload / flow editor | Not built — use git + `topics/*.md` |

## Gaps to fill with owners

- **Accounts / reimbursement** — no approved policy in KB yet; need owner + SOP topic before bot can complete that flow.
- **LLM intent** — v1 router is deterministic; LLM layer comes after KB coverage and guardrails.
