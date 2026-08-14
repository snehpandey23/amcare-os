# Founder Decision Coach — Phase 1 (August WIP)

**Status:** In progress · rule-based comparison tool · **not** an autonomous AI copilot.

## What shipped

| Piece | Who sees it | Who edits |
| --- | --- | --- |
| **Weekly brief** | Portal admins (My day) | Founder / executive |
| **Monthly plan** | Portal admins | Founder / executive only |
| **Domain tabs** | Portal admins | None — read-only from portal tables + lead check-ins |
| **Weekly actuals (drift)** | Founder edit form | Manual TX ads, India pipeline, US intro counts |
| **Weekly actuals (domains)** | Marketing / Clinical / Compliance tabs | Lead-submitted `weekly_lead_checkins` |
| **Drift flags** | Portal admins | None — surface only, cite triggering inputs |
| **Observe-only log** | Portal admins | Anyone can log a change under an observe flag |

## Domain data audit (Phase 1b — 2026-08-08)

| Domain | Real structured data | Honest “not yet tracked” |
| --- | --- | --- |
| **Accounts** | None (no ledger / AR / refunds tables) | Entire tab: financials + founder/CPA deadlines empty. **No** CPOM/tax/legal AI content. |
| **HR** | `hipaa_training_users` (active/admins/7d login), `siya_department_leads` | PTO, ATS, performance reviews |
| **Clinical** | `chat_reviews`, `shift_handoffs`, HIPAA `progress_json.modulesCompleted`, `weekly_lead_checkins` (Clinical Operations) | Clinical incident / adverse-event table; booking volume |
| **Marketing** | `weekly_lead_checkins` (Marketing); optional `founder_weekly_actuals` ads fields | Live Google Ads / reviews / bookings |
| **Compliance** | `weekly_lead_checkins` (Compliance), `siya_sops` pending + review dates, HIPAA not-started count | Founder/CPA legal/tax deadline calendar |

**Urgency sort (no AI):** `founder_should_know` non-empty first, then nearest `urgencyDate`, then label.

## Architecture

- **Auth API:** `integrations/hipaa-training-api/src/founder-coach-service.ts` (`collectDomainSnapshots`)
- **Routes:** `GET /api/founder-coach/brief`, `PUT monthly|weekly|actuals`, `POST observe-events`
- **Staff UI:** `FounderCoachPanel` on My day (`/`)

## Phase 1 scope (explicitly NOT built)

- Slack / email / Drive ingestion
- LLM “knows everything” reasoning / financial or legal summaries
- Weekly-plan builder lock ritual, conversational plan chat, persona role-play
- External pulls (Google Reviews, booking counts)
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

- TX/ADHD ads CPA & conversions (founder form — drift only)
- Campaign edit count
- India grants identified / applications submitted
- US intro contacted / replied / meetings

Portal signals pulled from existing tables: `siya_tasks`, `chat_reviews`, `shift_handoffs`, `weekly_lead_checkins`, `siya_sops`, `hipaa_training_*`, `siya_department_leads`.
