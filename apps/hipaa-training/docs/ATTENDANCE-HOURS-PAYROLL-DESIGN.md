# Attendance → hours → payroll readiness (design)

**Status:** Hours derivation + **payroll-eligible** totals (founder-signed 2026-09-06). Still no wage/CTC math.  
**Date:** 2026-09-06 (updated)  
**Scope:** Reuse existing Working / Break / Focus / Start–End shift data. No live wage math.

**Implementation notes (2026-09-06):**
- Day boundaries: **IST date of shift start** (overnight stays on start day — never split).
- Focus = paid like Working for payroll (raw Focus still shown separately).
- Break = paid, reported separately (no cap this pass).
- Zero-click / no activity = 0 payroll-eligible.
- No grace window on the calculator.
- `payroll.eligibleMinutes` excludes `stale_affected`, `ambiguous`, `provisional`, `under_review` until dispute resolve.
- Late-start nudge: roster start + 1h with no check-in → one-time email to staff + lead + HR + admins.

**Audience:** Founder + HR — Section 0 signed values below.

---

## 0. Decision checklist (must be filled before build)

| # | Decision | Options (illustrative only) | Signed value | Signer / date |
|---|----------|------------------------------|--------------|---------------|
| D1 | Is **Focus** counted as paid work time? | Count as Working · Count separate but paid · Unpaid · Cap minutes | **Count as Working** (don’t-disturb signal only) | Founder 2026-09-06 |
| D2 | Is **Break** paid or unpaid? | Fully paid · Unpaid · Paid up to N min/day · Paid only if declared | **Fully paid**; track separately; caps later | Founder 2026-09-06 |
| D3 | **Zero-click day** (rostered on, no Start shift / no presence events) | Count 0 · Flag missed · Impute roster length · Manual only | **Count 0** (+ roster nudge path) | Founder 2026-09-06 |
| D4 | **Day boundary** for “whose day is this hour?” | IST calendar date of event · IST date of shift_start · Roster date · UTC | **IST date of shift_start** (overnight on start day) | Founder 2026-09-06 |
| D5 | **Grace window** for late start / early end vs roster | Minutes late still “on time”; minutes early end still “full day”; none | **None** on calculator (remind if late vs roster) | Founder 2026-09-06 |
| D6 | Open shift (Start, never End) at payroll cutoff | Exclude · Cap at roster end · Cap at midnight · Require manager close | Exclude from eligible while provisional/stale | Founder 2026-09-06 |
| D7 | Missing presence clicks inside an open shift (stayed on Working all day) | Entire interval = Working · Require periodic re-click · Cap | Entire interval = Working (residual) | Founder 2026-09-06 |
| D8 | Login auto-`ensureActiveShift` vs ritual Start | Both count · Only staff_ui Start counts · Tag source in reports | Both count (existing) | — |
| D9 | Dispute SLA / who resolves | HR only · Lead + HR · Founder fallback | Existing dispute flow (admin resolve) | — |
| D10 | What feeds **final payroll numbers** | Only `resolved` days · Resolved + undisputed after N days · Never auto | Clean / resolved only — **not** stale_affected · ambiguous · under_review | Founder 2026-09-06 |

Until D1–D10 are filled, any hours number is a **proposal shape**, not policy.

---

## 1. Audit — what is captured today

### 1.1 Status model (not four “Off” clicks)

There is **no** discrete “Off” presence click. Staff self-declare one of three statuses while a shift is **active**:

| UI label | Stored value | Meaning today |
|----------|--------------|---------------|
| Working | `working` | Default while on shift |
| Break | `break` | Self-declared break |
| Focus | `focus` | Self-declared focus block |
| Off shift | _(no presence)_ | `active === null` after End shift (or never started) |

Source of truth for labels: `PresenceStatus` in `integrations/hipaa-training-api/src/shift-store.ts`. UI: `ShiftPresenceBar.tsx` — copy states **self-declared, not idle-detected**.

### 1.2 Dual store

| Store | Location | Role |
|-------|----------|------|
| **Live + recent shifts** | `hipaa_training_progress.shift_json` (JSONB) | Mutable current shift + last ~60 completed shifts |
| **Append-only ledger** | `siya_shift_attendance_events` | Durable event log for ops / export |

#### A. `shift_json` shape (per user)

**Active shift** (`active`):

| Field | Type | Per click / action |
|-------|------|--------------------|
| `startedAt` | ISO string | Set on Start / ensure-active |
| `workShift` | `morning` \| `evening` \| `night` | Chosen at start |
| `presence` | `working` \| `break` \| `focus` | Current status |
| `presenceSince` | ISO string | Timestamp of **last** presence change |
| `presenceLog[]` | `{ status, at }[]` | Append on each presence change; **capped at last 40** |

**Completed shift** (`recent[]` entry):

| Field | Notes |
|-------|--------|
| `id`, `startedAt`, `endedAt`, `workShift` | Bounds the shift interval |
| `breakCount`, `focusSessionCount` | **Session counts** from presenceLog (how many times status entered), **not minutes** |
| mood / reflection / learned / accomplishments | End-shift ritual only |

#### B. `siya_shift_attendance_events` columns

| Column | Notes |
|--------|--------|
| `id` | Text PK |
| `user_id` | Staff user |
| `event_type` | See below |
| `source` | e.g. `staff_ui`, `login` |
| `metadata` | JSONB (e.g. `{ from, to }` on presence; counts on `shift_end`) |
| `created_at` | TIMESTAMPTZ |

**Event types:** `shift_start` · `shift_end` · `break_start` · `break_end` · `focus_start` · `focus_end` · `tool_link_opened`

Presence transitions emit start/end pairs (to break → `break_start`; back to working → `break_end`; same for focus). There is **no `working_start` / `working_end` event** — Working is the residual state between break/focus pairs and inside `[shift_start, shift_end]`.

**Not stored today:** relational `shift_id` FK on events; duration minutes; wage; dispute state; payroll period lock.

### 1.3 How Start / End bound a day’s activity

| Action | API | Effect |
|--------|-----|--------|
| Start shift | `POST /api/shift/start` | Creates `active`, logs `shift_start` |
| Ensure active | `POST /api/shift/ensure-active` (+ login) | Same if no active; **no-op if already active**; `source` may be `login` |
| End shift | `POST /api/shift/end` | Moves `active` → `recent[]` with `endedAt`, clears `active`, logs `shift_end` |

**Observed edge behavior (code today):**

- No End → `active` can remain indefinitely (including overnight).
- Second Start while active → ignored (single concurrent shift).
- End with no active → no-op.
- “Today” helpers for some live views use **UTC calendar day**; Ops day windows / roster often use **IST** — already an inconsistency to resolve under **D4**.

### 1.4 Related (adjacent, not attendance minutes)

| Asset | Use for this design |
|-------|---------------------|
| `shift_roster` | Planned schedule vs declared start (already in planned-vs-actual) |
| `shift_handoffs` | Ops notes linked to `shift_end_event_id` — not hours |
| `level_up_json.dayLedger` | Practice drills — **do not** mix into attendance hours |

### 1.5 What is calculable **without** new tracking

| Calculable offline from existing data | Not available without policy +/or product change |
|---------------------------------------|--------------------------------------------------|
| Shift wall-clock length if ended: `endedAt − startedAt` | Authoritative paid minutes until D1–D7 signed |
| Break/Focus **intervals** by pairing ledger `*_start`↔`*_end` (or successive `presenceLog.at`) | Break/Focus **minutes productized** (not stored; must be derived) |
| Session **counts** (`breakCount` / `focusSessionCount`) | Reliable history beyond presenceLog cap (40) / recent cap (60) without relying on events table |
| Who is Working/Break/Focus/Off **now** | Idle-detected Off / Away |
| Login vs UI start (`source`) | Wage / CTC / overtime multipliers (explicitly out of scope) |
| Scheduled vs actual start (existing planned-vs-actual + grace already used for **schedule outcomes**, not payroll) | Payroll-final hours while disputes open |

**Important data-quality limits for any hours engine:**

1. Durations must be **derived** from timestamps; product never persisted break/focus minutes.
2. Prefer **`siya_shift_attendance_events`** over `presenceLog` for history (log is truncated).
3. No `shift_id` on events → day/shift grouping is a **policy choice** (D4) + timestamp heuristics.
4. Self-declared only — system cannot prove staff worked vs left UI on Working.

---

## 2. Hours-calculation model (proposal shape only)

> Every formula line below is gated. Replace `_pending_` with the signed row from Section 0 before coding.

### 2.1 Inputs (existing)

For person `U` and evaluation window `W` (day or month under **D4**):

1. Ordered events from `siya_shift_attendance_events` for `U` overlapping `W`.
2. Optional: `shift_json.recent` / `active` as cross-check (not sole history).
3. Optional: `shift_roster` rows for planned comparison / **D3** / **D5** (not automatic pay unless signed).

### 2.2 Segment reconstruction (mechanical — not a pay rule)

Build contiguous **presence segments** inside each `[shift_start, shift_end]` (or open shift capped per **D6**):

1. Anchor interval: shift start → shift end (or open-shift cap).
2. Overlay break/focus intervals from paired `break_*` / `focus_*` events.
3. Residual time inside the shift anchor = **Working** (unless **D7** says otherwise when no clicks).

Pseudo:

```text
for each closed_or_capped shift S:
  segments = [(S.start, S.end, working)]
  subtract/replace with break/focus intervals from paired events
  clip all segments to day boundary rule D4
```

**Assumption flagged:** Pairing rule for unmatched `break_start` without `break_end` → **needs founder/HR** (treat as open until shift_end vs discard vs dispute).

### 2.3 Category minutes (pay classification — all signed)

| Category | Minute definition | Pay treatment |
|----------|-------------------|---------------|
| Working | Sum of Working segments in window | **per D1/D7** (usually paid base) |
| Focus | Sum of Focus segments | **per D1** |
| Break | Sum of Break segments | **per D2** |
| Off / not on shift | Time outside any shift anchor | Typically **0** for attendance hours; **D3** if rostered |

```text
paid_minutes(day) =
  f_working(Working_min)     # D1/D7
  + f_focus(Focus_min)       # D1
  + f_break(Break_min)       # D2
  + f_zero_click(roster)     # D3
  # then apply D5 only if founder says grace adjusts *paid* time (today grace is schedule UX only)
```

Mark in UI and exports:

- `raw_*_minutes` — derived from clicks (transparent).
- `policy_*_minutes` — after D1–D7 transforms.
- `payroll_eligible_minutes` — only days in status allowed by **D10**.

### 2.4 Day / month rollup

- **Daily row:** one row per person × attendance-day (**D4**).
- **Monthly row:** sum of daily `payroll_eligible_minutes` (and category breakdowns) for the payroll month definition (**also sign:** calendar month IST vs custom pay cycle — add as **D11** if needed).

### 2.5 Explicit non-defaults (do not silently ship)

| Topic | Invented default **forbidden** | Must use |
|-------|--------------------------------|----------|
| Focus = work | Do not assume yes | **D1** |
| Break unpaid | Do not assume unpaid lunch | **D2** |
| No show = 0 | Do not assume | **D3** |
| IST vs UTC day | Do not assume IST just because Ops uses it | **D4** |
| 15-min schedule grace ⇒ paid full day | Do **not** reuse planned-vs-actual grace for pay without **D5** | **D5** |
| Open shift = exclude | Do not assume | **D6** |
| Auto-finalize undisputed after 7 days | Do not assume | **D10** |

---

## 3. Daily / monthly aggregate reporting (HR / Ops)

### 3.1 Pattern to reuse

Mirror **Ops dashboard** composition:

| Existing | Reuse for hours |
|----------|-----------------|
| `OpsDashboardPanel.tsx` + `GET /api/ops/dashboard` | New section **“C · Attendance hours”** (lettering TBD) |
| `GET /api/admin/shift/attendance-log` (+ CSV) | Keep raw event export; hours report is **derived aggregates** |
| `PlannedVsActualPanel` / roster | Optional side-by-side: scheduled vs declared vs **computed hours** (hours still gated by policy) |

### 3.2 HR report views (design)

**A. Daily grid (default)**

| Column | Source |
|--------|--------|
| Person | User / display name |
| Attendance day | **D4** |
| Shift start / end | Events or recent |
| Working min | Derived |
| Break min | Derived |
| Focus min | Derived |
| Policy paid min | After D1–D7 |
| Dispute status | Section 5 |
| Payroll eligible? | **D10** |

**B. Monthly summary**

| Column | Source |
|--------|--------|
| Person | |
| Month | Pay cycle (**D11** if signed) |
| Days with activity | Count |
| Sum raw / policy / eligible minutes | |
| Open disputes count | Blocker for close |

**C. Filters:** department/team, date range, “eligible only”, “has dispute”.

**D. Export:** CSV of the **same model** the UI renders (no second calculator).

### 3.3 Permissions

| Role | See |
|------|-----|
| HR / admin (Ops) | Team + export |
| Lead | TBD — **sign:** leads see team hours or not (**D12**) |
| Staff | Self only (Section 4) |

---

## 4. Full transparency — staff view (shared component)

### 4.1 Pattern to reuse (byte-identical content)

| Precedent | How dual-viewer works |
|-----------|------------------------|
| `WeeklyPracticeReportView` + `buildWeeklyPracticeReport` + `contentFingerprint` | One model builder; staff Learn / Level-up and Ops mount same view; chrome/label only differs |
| `PlannedVsActualPanel` + `GET /api/shift-roster/planned?scope=me\|team` | Same row shape; scope changes whose rows |

### 4.2 Proposed shared surface

| Piece | Intent |
|-------|--------|
| `buildAttendanceDayRecord(userId, day, policyVersion)` | Single pure builder → `AttendanceDayRecord` |
| `AttendanceDayRecordView` | Renders that record only |
| Staff mount | My day / Shift / Memory path TBD — `scope=me` |
| HR mount | Ops section — `scope=team` or person drill-in |
| Fingerprint | Hash of numeric fields + segment list + dispute state so staff/HR can verify “same bytes” |

**Staff must see:** same raw category minutes, same policy minutes, same eligible flag, same dispute state and resolution notes (HR-internal private notes optional — **sign D13**: are resolution notes visible to staff?).

**Staff must not see:** other people’s rows; wage rates (out of scope).

---

## 5. Correction / dispute flow

### 5.1 Goal

Staff can challenge a **specific day’s computed record**. Unresolved disputes **never** enter `payroll_eligible` totals (**D10**).

### 5.2 States

```text
computed → flagged_under_review → resolved_stands | resolved_corrected
```

| Status | Payroll eligible? |
|--------|-------------------|
| `computed` (no dispute) | **per D10** (e.g. eligible only after period lock, or immediately — must sign) |
| `flagged_under_review` | **No** |
| `resolved_stands` | Yes (original policy minutes) |
| `resolved_corrected` | Yes (**corrected** policy minutes only) |

### 5.3 Flow

1. Staff opens own `AttendanceDayRecord` → **Flag this day** → short note (no PHI; staff-time only).
2. System sets `under_review`; notifies resolver queue (**D9**).
3. HR/admin opens same shared record + staff note + raw event timeline.
4. Decision:
   - **Stands** — optional explanation to staff; status `resolved_stands`.
   - **Correct** — enter adjusted category minutes and/or adjusted start/end; reason required; status `resolved_corrected`. Correction is an **overlay** on derived data, not silent rewrite of the append-only event ledger (ledger stays audit truth; overlay is payroll truth).
5. Monthly eligible sum includes only days allowed by **D10**.

### 5.4 Data to add at build time (not now)

Conceptual tables (names TBD at implementation):

- `attendance_day_disputes` — day key, user, status, staff note, resolver, resolution note, corrected minutes JSON, timestamps.
- Policy version id on each computed record so mid-year rule changes don’t silently rewrite history.

### 5.5 Out of band

- Does **not** replace End-shift handoff or Chat Review.
- Does **not** auto-edit `siya_shift_attendance_events`.

---

## 6. Implementation readiness (after sign-off only)

Suggested build order **once D1–D10 are filled**:

1. Read-only derived `AttendanceDayRecord` builder + fingerprint (no UI disputes yet).
2. Shared staff + Ops view (Section 4).
3. Dispute state machine (Section 5).
4. Monthly eligible export for HR (still no wage engine).

**Explicitly later / never in this track:** CTC, overtime multipliers, statutory deductions, bank export formats — unless a separate brief says so.

---

## 7. Appendix — key code pointers (audit)

| Area | Path |
|------|------|
| Presence types / shift_json | `integrations/hipaa-training-api/src/shift-store.ts` |
| Event ledger schema | `integrations/hipaa-training-api/src/database/shift-attendance-schema.sql` |
| Event types / transitions | `integrations/hipaa-training-api/src/shift-attendance.ts` |
| Presence write path | `integrations/hipaa-training-api/src/shift-progress.ts` |
| Staff UI | `apps/hipaa-training/src/components/shift/ShiftPresenceBar.tsx` |
| Ops / planned-vs-actual | `OpsDashboardPanel.tsx`, `PlannedVsActualPanel.tsx` |
| Weekly practice dual view | `WeeklyPracticeReportView.tsx`, `lib/level-up/weekly-report.ts` |

---

## Document control

| Field | Value |
|-------|--------|
| Build allowed? | **No** until Section 0 checklist signed |
| Wage calculation? | Out of scope |
| Authoring agent | Design from live schema audit 2026-09-05 |
