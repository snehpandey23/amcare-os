# KB audit program — the audit is the product manager

Company Memory improves in a **self-improving loop**, not “write 500 pages and hope.”

```text
Run audit (persona)
  → Triage gaps into five buckets
  → Author / promote live topics
  → Run audit again
  → Repeat until CI thresholds met
```

Do **not** measure LLM eloquence. Measure **organizational quality**.

Over time, also measure **product feel**: context switches per task (see below).

---

## Dual score (report every audit)

| Dimension | What it measures | Example (Jul 2026 baseline) |
|-----------|------------------|-----------------------------|
| **Knowledge architecture** | Folders, metadata, routing, principles vs decisions, `_shared/`, audit process | ~90/100 |
| **Knowledge content** | Live topics, canonical facts, SOPs, owners, review dates | ~20/100 |

A low **content** score with high **architecture** is healthy early. A high content score with low architecture is a future archaeology project.

---

## Five gap buckets (every finding tags one)

| Bucket | What it is | Examples | Primary folders |
|--------|------------|----------|-----------------|
| **1 — People** | Who, onboarding, ownership, escalation | HR, directory, reimbursement approvers | `HR/`, `operations/` |
| **2 — Operational SOPs** | If X → A → B → C | Refunds, refills, incidents, publish rollback | `clinical/`, `operations/`, `accounts/` |
| **3 — Canonical facts** | Exactly once — bot never infers | Pricing, states, EHR, stack, vendors, booking | `finance/`, `technology/`, `_shared/glossary/` |
| **4 — Decision history** | Point-in-time **what we chose** + graveyard | Removed Zocdoc, pricing change, channel strategy | `leadership/decisions/`, `leadership/graveyard/` |
| **5 — Mental models** | **How we think** — stable operating philosophy | Validate before ship; no feature parity chase; commodity infra; one canonical source; no guessing in healthcare; brand in every patient touch | `leadership/principles/` |

**Principles ≠ decisions.** Principles change almost never; decisions evolve and `supersedes`. The bot should retrieve them differently (see `kb:build` `kind: principle` vs `decision`).

---

## Five audits (run as content matures)

| # | Persona | Purpose | When | Prompt |
|---|---------|---------|------|--------|
| **V1** | New hire, zero context | Onboarding, People bucket | Now; repeat after each content push | [`01-new-hire-zero-context.md`](./audits/01-new-hire-zero-context.md) |
| **V2** | 6-month competent employee | Edge cases, SOP stress | **After content score ~40–50** | [`02-six-month-operations.md`](./audits/02-six-month-operations.md) |
| **V3** | CEO, only Siya Assist | Executive + canonical gaps | Periodic | [`03-ceo-run-the-company.md`](./audits/03-ceo-run-the-company.md) |
| **V4** | Red team | PHI, injection, unsafe answers | **Before wide launch** — must pass | [`04-red-team-security.md`](./audits/04-red-team-security.md) |
| **V5** | Top performer, one workday | Adoption, friction, delight | After V1 content healthy + V4 clean | [`05-success-simulation.md`](./audits/05-success-simulation.md) |

V5 asks: *Is it actually easier to ask Siya Assist?* Not just “no errors.”

---

## Per-question output format

Each audit question must produce:

- Question  
- Answer found  
- Confidence (High / Medium / Low)  
- Evidence (file names)  
- Problems found  
- Missing information  
- Suggested documents (**bucket 1–5**)  
- Escalation needed (Yes/No)

Final report: [`REPORT-TEMPLATE.md`](./audits/REPORT-TEMPLATE.md)

---

## CI / release thresholds (organizational quality)

**Block company-wide rollout** when any row fails.

| Metric | Goal |
|--------|------|
| Fully answered | >90% |
| Partially answered | <8% |
| Unanswered | <2% |
| **Unsafe answers (V4)** | **0** |
| Contradictions | 0 |
| Missing owners (live docs) | 0 |
| Stale docs (`review_date` past due) | <5% of live corpus |

---

## Product KPI (measure in V5 and post-launch)

**Context switches per task**

Example — today:

```text
Slack → Drive → WhatsApp → Zoho → Email → Manager  (6 switches)
```

Target:

```text
Siya Assist → Done  (1 switch)
```

Log per simulated task in V5: **SUCCESS** (assistant sufficient), **FRICTION** (assistant partial), **CONTEXT SWITCH** (left assistant for another tool). Track median switches per task over time — a metric teams **feel** daily.

---

## Recommended content priority (next ~2 weeks)

Focus on **knowledge**, not application code:

1. **People** — onboarding, escalation directory (names/channels), reimbursement  
2. **Operational SOPs** — highest-frequency workflows  
3. **Canonical facts** — pricing, systems, vendors, states (single source)  
4. **Decision history** — why, graveyard for dead initiatives  
5. **Mental models** — seed 5–7 principles in `leadership/principles/`  
6. Re-run **V1**; append [`score-log.md`](./audits/score-log.md)  
7. **V2** only after content score ~**40–50**  
8. **Wide launch** only after **V4 = 0 unsafe**; polish with **V5**

---

## Workflow with WorkDrive + git

1. Gaps → draft in `Common Folder/SiyaOS/` (bucket-mapped folder) with YAML.  
2. Owner → `status: live` → copy to `docs/siyaos-knowledge-base/`.  
3. `npm run kb:build -w @amcare/hipaa-training`  
4. Re-run the audit that found the gap.  
5. Log dual scores + CI metrics in `audits/score-log.md`.

---

## Closed loop (CAPR / organizational intelligence)

```text
Every answer     → uses approved docs
Every gap        → Notify owner → new doc
Every live doc   → better future answers
Every audit      → prioritized backlog
```

Most internal chatbots = document search. This targets a **knowledge operating system**: organizational intelligence that compounds.

---

## What success looks like (MVP phase)

The bot exposes tacit knowledge. When content catches up, success is:

> **“It’s easier to ask Siya Assist than to hunt Slack, Drive, and WhatsApp.”**

That’s when adoption is automatic — not “AI because it’s fashionable.”
