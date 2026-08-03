# Founder Decision Coach — Phase 1 (August WIP)

**Status:** In progress · rule-based comparison tool · **not** an autonomous AI copilot.

## What shipped

| Piece | Who sees it | Who edits |
| --- | --- | --- |
| **Weekly brief** | All authenticated staff (My day) | Founder / executive |
| **Monthly plan** | All staff (read-only tab) | Founder / executive only |
| **Weekly actuals** | Founder edit form | Manual TX ads, India pipeline, US intro counts |
| **Drift flags** | All staff | None — surface only, cite triggering inputs |
| **Observe-only log** | All staff | Anyone can log a change under an observe flag |

## Architecture

- **Auth API:** `integrations/hipaa-training-api/src/founder-coach-service.ts`
- **Routes:** `GET /api/founder-coach/brief`, `PUT monthly|weekly|actuals`, `POST observe-events`
- **Staff UI:** `FounderCoachPanel` on My day (`/`)

## Phase 1 scope (explicitly NOT built)

- Slack / email / Drive ingestion
- LLM “knows everything” reasoning
- Autonomous org-wide actions
- Full v2 Founder Decision Coach ranker (see `EXECUTIVE-WORKSPACE-v2-FOUNDER-DECISION-COACH.md`)

## Drift rules (v1)

1. Observe-only TX/ADHD ads + campaign edits or observe log entries → flag
2. Empty Founder Focus → flag
3. Can Wait &gt; 3 → flag
4. Monthly review trigger (TX CPA week-over-week rise) → flag
5. Open chat reviews ≥ 5 (IST today) → flag

Every flag includes **Confidence / Updated / Based on** evidence lines and `triggeredBy` field.

## Manual metrics (automate later)

- TX/ADHD ads CPA & conversions
- Campaign edit count
- India grants identified / applications submitted
- US intro contacted / replied / meetings

Portal signals pulled from existing tables: `siya_tasks`, `chat_reviews`, `shift_handoffs`.
