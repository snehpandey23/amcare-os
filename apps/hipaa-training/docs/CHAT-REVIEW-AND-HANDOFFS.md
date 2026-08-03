# Chat review & shift handoffs

Operational tools in the staff portal — separate from Knowledge SOPs and daily checklist templates.

## Chat review

Replaces the manual daily spreadsheet: one row per patient chat reviewed, with identifier, notes, errors, and **open/closed** status.

### Who sees what

| View | Path | Access |
|------|------|--------|
| QA log | `/chat-review` | **Admin + Clinical Operations lead** only |
| Team / cross-team view | `/admin/chat-reviews` | Same gate (admin sees all; clinical lead sees their dept staff) |

**Not** for general staff — chat review is a QC tool, not self-report. Staff volume goes on **shift handoff** at end of shift.

Department lead here means **`siya_department_leads` row for Clinical Operations** (`clinical_operations` slug), not every department lead.

### Data

Table `chat_reviews`: `user_id`, `review_date` (IST ops day), `patient_identifier`, `notes`, `error_notes`, `status` (`open`|`closed`), timestamps.

Manual entry only — no Spruce or patient messaging ingestion in v1.

### APIs

| Route | Who |
|-------|-----|
| `GET /api/chat-reviews/access` | Any signed-in — returns `{ canReview, isAdmin }` |
| `GET /api/chat-reviews?date=today&status=open` | Admin or Clinical Ops lead |
| `POST /api/chat-reviews` | Admin or Clinical Ops lead |
| `PATCH /api/chat-reviews/:id` | Admin or Clinical Ops lead |
| `GET /api/admin/chat-reviews?date=today` | Admin or Clinical Ops lead |

---

## Shift handoffs

Quick coordination when someone ends shift — pending follow-ups, scheduled items, general note for the next person.

### Who sees what

**Team-visible** — any signed-in staff can read today's handoffs on `/team` (handoff feed above team pulse).

**All staff** can self-report volume (chats, calls made/received) in the handoff modal after ending shift — separate from chat review QC.

### Flow

1. User taps **End shift** → `EndShiftModal` → `POST /api/shift/end`
2. API returns `shiftEndEventId` (links to `siya_shift_attendance_events`)
3. **Shift handoff modal** opens (optional — **Skip** allowed)
4. `POST /api/shift-handoffs` saves note + optional counts

### Data

Table `shift_handoffs`: `user_id`, `shift_end_event_id` (nullable FK), `handoff_date` (IST), `chats_handled_count`, `calls_made_count`, `calls_received_count`, `pending_followups` JSON array `[{ patientIdentifier, note }]`, `scheduled_items_today`, `general_notes`, `created_at`.

### APIs

| Route | Who |
|-------|-----|
| `GET /api/shift-handoffs?date=today` | Any signed-in staff |
| `POST /api/shift-handoffs` | Self — after shift end |

---

## IST ops date

Both features use the same IST ops day as tasks and team pulse (`istDateLabel` / `opsDayBounds` in `shift-dashboard.ts`). Query param `date=today` resolves to current IST calendar date.

---

## Frontend

| View | Path |
|------|------|
| Chat review (QC) | `/chat-review` — admin + Clinical Ops lead |
| Chat review (admin/lead) | `/admin/chat-reviews` |
| Handoff feed | `/team` (top of page) |
| Handoff prompt | After end shift (header bar) |

My day shows **Chat review** link only for users with `canReview`.

---

## v1 not built

- Spruce / patient chat auto-link
- Chat review export / analytics
- Handoff edit or @mention
- Proof that handoff was read
