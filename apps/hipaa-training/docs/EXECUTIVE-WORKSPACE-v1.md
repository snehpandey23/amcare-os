# Executive Workspace v1 (frozen)

**Product name:** Executive Workspace (founder/executive lane on My day + Ask)  
**Not:** Admin Ops Co-pilot, separate bots, or new top-level ERP modules.

## North star

> Where do I need to pay attention today?

Briefing for orientation. **Ask** for judgment and approved actions. Same Ask for all roles — **permissions + context** change what intelligence loads.

---

## My day (executive)

Four cards only:

| Card | Shows |
|------|--------|
| **Team Coverage** | Working · Focus · Break (from team pulse) |
| **Overdue Work** | Total overdue · critical count → board link |
| **Knowledge Health** | Unanswered questions · 👎 · pending promotions |
| **Needs Attention** | Grouped judgment items (Knowledge · Operations · People) |

**Excluded until briefing earns trust:** marketing streak, revenue, ads, web analytics, clinical metrics, AI usage stats.

Every card answers:

1. What happened?  
2. Why does it matter?  
3. **Suggested next action** (required)

Every card footer:

- **Confidence** (high / medium / low)  
- **Updated** (freshness)  
- **Based on** (evidence count)

---

## Needs Attention (not “Decisions Queue”)

Judgment items, grouped:

- **Knowledge** — SOP review, promotions, policy review  
- **Operations** — overdue > 7 days, critical overdue  
- **People** — training not started / onboarding signals  

---

## Ask modes (starters, not new nav)

- Daily — company ops brief  
- Team — how is [dept] doing?  
- Knowledge — what are people struggling with?  
- Needs Attention — what needs my attention?  

---

## Inform → Recommend → Execute

| Mode | Behavior |
|------|----------|
| **Inform** | Explain only |
| **Recommend** | Proposed plan + **Approve** |
| **Execute** | Only after Approve |

### Approve scope v1

**Tasks only** — title, assignee, due date, priority.  
**No** email, Slack, Teams, or org-wide notifications from Approve.

Later: Draft internal email → Review → Send (never skip draft).

---

## API

| Endpoint | Access |
|----------|--------|
| `GET /api/executive/briefing` | `SIYA_EXECUTIVE_USER_EMAILS` (comma) or all `admin` if unset |
| `POST /api/assist/gaps` | Auth — feeds Knowledge Health |
| `POST /api/assist/feedback` | Auth — feeds 👎 count |

Env: `SIYA_EXECUTIVE_USER_EMAILS=sneh@…` for founder-only briefing.

---

## Chat response metadata (executive)

```json
{
  "confidence": "high",
  "freshnessSeconds": 120,
  "recommended_action": "...",
  "evidence_count": 3,
  "pendingTask": { "...": "Approve creates task only" }
}
```

---

## Code map

| Area | Path |
|------|------|
| Briefing builder | `integrations/hipaa-training-api/src/executive-briefing.ts` |
| Telemetry | `integrations/hipaa-training-api/src/assist-telemetry.ts` |
| My day UI | `apps/hipaa-training/src/components/executive/ExecutiveBriefingPanel.tsx` |
| Ask intelligence | `apps/hipaa-training/src/lib/siya-os/admin-ops-*.ts` (rename later) |

---

## Roadmap after v1 habit

**Next build target (architecture approved for planning):**  
`EXECUTIVE-WORKSPACE-v2-FOUNDER-DECISION-COACH.md` — Founder Decision Coach (Focus · Can Wait · Delegate · Emerging Risks).  
Cursor rule: `.cursor/rules/siya-executive-founder-coach.mdc`.

Do **not** implement v2 until open decisions in that doc are answered; then Phase 1 only (Focus + Can Wait).

Earlier ideas (still valid as later phases):

- Friday “This week at Siya” draft (approve before share)  
- Monthly “What Siya learned”  
- Proactive morning prompts (max 3, with confidence)  
- Draft email after task confidence established  

Legacy doc: `ADMIN-OPS-COPILOT.md` → superseded by this file.
