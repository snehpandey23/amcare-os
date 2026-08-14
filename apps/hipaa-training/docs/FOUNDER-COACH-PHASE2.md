# Founder Decision Coach — Phase 2 MVP

**Status:** Lockable weekly plan + grounded AI draft · built on Phase 1 domain / check-in data.

## What shipped

| Piece | Behavior |
| --- | --- |
| **This week's plan** | Founder free-text `prioritiesRaw` |
| **Draft breakdown** | BFF `POST /api/founder-coach/draft-weekly` → Focus / Can Wait / Delegate / Observe using founder text + `leadCheckInSignals` (same `weekly_lead_checkins` as domain tabs) + nearest portal deadlines |
| **Refine** | Same BFF with `currentDraft` + `refineInstruction` — single-shot regenerate from current draft + adjustment (repeatable; not a chat thread) |
| **Collapsed queues** | Domain Items + Signals this week (+ SOP work queue on My day): top 6 by urgency, `Show all (N)` expands |
| **Edit** | Founder edits categories before lock |
| **Lock this week** | `POST /api/founder-coach/weekly/lock` — timestamp + snapshot; edits blocked until unlock |
| **Unlock to modify** | `POST /api/founder-coach/weekly/unlock` |
| **Signals this week** | Shows `leadCheckInSignals` flattened from Phase 1 domain items (`source` starts with `weekly_lead_checkins`) — **not** a second store |

## Out of scope (this MVP)

Conversational refinement · nested 24h/72h/long-term hierarchy · auto-reminders/scheduling

## Routes

- Auth API: `PUT /api/founder-coach/weekly` (rejects when locked), `POST …/weekly/lock`, `POST …/weekly/unlock`, `GET …/brief` (`phase: 2`, `isWeekLocked`, `leadCheckInSignals`)
- Staff BFF: `POST /api/founder-coach/draft-weekly`
