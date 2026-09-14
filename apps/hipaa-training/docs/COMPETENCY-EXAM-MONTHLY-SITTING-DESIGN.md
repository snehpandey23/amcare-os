# Competency exam — monthly sitting model (design)

```text
Status: DESIGN signed (§12) · **P0–P2 implemented** (schema · hub UI · lazy closure · history/trends) — P3+ not started
Date: 2026-09-13
Replaces (conceptually): single continuous “full sitting” as the primary exam UX
Builds on: section-isolated review (?section=), per-section timers, seen-set draws,
  server table siya_competency_exam_attempts, improvement-plan.ts
Not in this pass: UI rewrite, schema migration, Ops dashboard panels
```

---

## 1. Problem statement

**Today**

| Aspect | Current behavior |
|--------|------------------|
| Primary UX | “Full sitting” — Typing → MCQ → Listening → typed chat → spoken chat in one flow (`afterReview` gates the next section) |
| Attempt | One `ExamReportModel` ≈ one “exam attempt”; composite computed once at the end from sections present in that report |
| Storage | Browser `localStorage` (seen + attempts) + optional POST `/api/competency-exam/attempts` (row per attempt, `attempt_type` `full` \| `isolated`) |
| Seen-set | `loadSeen(userId)` — **global per user, unbounded lifetime** (`siya-competency-exam-seen-v1`) |
| Retakes | Isolated `?section=` runs do not feed a monthly composite; full sitting has no formal “redo section within same period” |
| Trend | Hard to answer “did this MA improve month over month?” — attempts are not grouped by calendar period |

**Goal**

Monthly **sittings** (e.g. “September 2026 sitting”): five sections completable **in any order**, across **many visits**, with **multiple attempts per section** within the open window. Composite for that month uses **average score per section** (not best, not last-only). **Every** section attempt is persisted for Ops. **Active time** in the timed portion is aggregated for monitoring, not gating. At month close, produce a **final sitting summary** with **explicit incomplete sections** (never silent zero). Next month = new sitting; history kept for trends.

---

## 2. Design principles (locked for this change)

1. **Sitting is the unit of record for monthly competency**, not “one browser session.”
2. **Section attempt is the unit of audit** — append-only; averages are derived, never a substitute for raw rows.
3. **Per-section timers stay hard limits** (120s typing, 20m MCQ, 10m listening/chat, etc.); **no** whole-sitting time budget.
4. **Seen-set excludes content within the same sitting** across retries; **new sitting resets** seen for draw variety (§8).
5. **Human review / non-employment** copy unchanged — sitting summary is still not a certification or HR decision.
6. **Server is source of truth** when authenticated; localStorage is offline cache / bootstrap only (align with existing API direction).

---

## 3. Domain model

### 3.1 Entities

```
CompetencySitting          (calendar window — shared by all staff)
    └── UserSitting        (one row per user × sitting — aggregates + closure)
            └── SectionAttempt[]   (many per section — immutable after submit)
            └── SeenEntry[]        (scoped to user × sitting — draw anti-repeat)
```

#### `CompetencySitting` (catalog / calendar)

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Stable slug, e.g. `2026-09` |
| `label` | string | Display: “September 2026 sitting” |
| `opensAt` | ISO instant | First instant of month (see §3.4 timezone) |
| `closesAt` | ISO instant | Last instant of month (exclusive end or inclusive end — pick one in impl) |
| `status` | `scheduled` \| `open` \| `closed` | Derived from now vs window, or admin override |

Not user-specific. Small table (one row per month in production).

#### `UserSitting`

| Field | Type | Notes |
|-------|------|--------|
| `id` | uuid | PK |
| `userId` | uuid | FK `hipaa_training_users` |
| `sittingId` | string | FK catalog |
| `status` | `open` \| `closed` | User copy closed when sitting window ends (batch or lazy on read) |
| `firstActivityAt` | timestamptz | First section attempt submit |
| `closedAt` | timestamptz | When final summary computed |
| `sectionAggregates` | jsonb | Map `ExamSectionId` → `{ attemptCount, averageScore, totalActiveSec, lastAttemptAt, safetyAnyRedFlag }` |
| `compositeSummary` | jsonb | Set at close — see §6 |
| `safetySummary` | jsonb | Union of safety flags across attempts in sitting |

Created lazily on first section submit for that user + sitting (or on first hub visit — founder preference: **lazy on first submit** avoids empty rows).

#### `SectionAttempt` (replaces conflated “full attempt” for scored work)

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Client-generated or uuid; unique globally |
| `userId` | uuid | |
| `sittingId` | string | **Required** for sitting-scored attempts |
| `section` | `ExamSectionId` | One of five live sections |
| `attemptIndex` | int | 1-based per (user, sitting, section) — for display |
| `startedAt` | timestamptz | Section orient/start |
| `submittedAt` | timestamptz | Submit |
| `activeSec` | numeric | **Timed-portion active seconds** (§7) |
| `sectionScore` | numeric | 0–100 |
| `weight` | numeric | Snapshot of `EXAM_WEIGHTS[section]` at submit |
| `itemIds` | jsonb | Draw ids |
| `repeatedIds` | jsonb | Seen-set repeats labeled |
| `safetyRedFlagged` | boolean | |
| `safetyJson` | jsonb | |
| `trailJson` | jsonb | Section-specific: typing metrics, mcq items, writing/listening, chat trail |
| `contentFingerprint` | text | Optional |

**Legacy rows** in `siya_competency_exam_attempts` remain valid with `sitting_id` NULL and `attempt_type` `full` \| `isolated` — read-only for history.

### 3.2 Section ids (unchanged)

From `weights.ts` — five sections, weights sum 100:

| `ExamSectionId` | Label | Weight |
|-----------------|-------|--------|
| `typing` | Typing | 12 |
| `mcq` | Combined MCQ | 30 |
| `listening` | Listening | 20 |
| `chat-sim-typed` | Chat simulator (typed) | 18 |
| `chat-sim-spoken` | Chat simulator (spoken) | 20 |

Typed and spoken chat use **separate** section ids and **separate** seen pools (`chat-sim-typed`, `chat-sim-spoken`) — today both use pool key `"chat-sim"`; migration must split to avoid cross-lane repeat suppression.

### 3.3 “Complete” vs “attempted”

| Term | Meaning |
|------|---------|
| **Attempted** | ≥1 submitted `SectionAttempt` for that section in this sitting |
| **Complete (for MA UX)** | Same as attempted — each submit counts; MA may redo freely while sitting is open |
| **Included in composite** | Section contributes **average** of all attempt scores if attempted; if never attempted → **incomplete** (§6), not 0 |

No blocking: MA can open any section card while sitting is `open`, regardless of other sections.

### 3.4 Sitting window (cadence)

**Founder default:** calendar month in **UTC** for v1 (simple, matches roster `YYYY-MM-DD` patterns elsewhere).

- `id = YYYY-MM`
- `opensAt = YYYY-MM-01T00:00:00.000Z`
- `closesAt = YYYY-(MM+1)-01T00:00:00.000Z` (exclusive)

Optional v1.1: `America/New_York` month boundaries for US ops — document in config, not hard-coded in client.

**Current sitting:** `resolveOpenSitting(now)` → catalog row where `opensAt ≤ now < closesAt`.

---

## 4. Composite score math

### 4.1 Per-section average (within sitting)

For section `s` with attempt scores `[x₁, x₂, …, xₙ]`:

```text
sectionAverage(s) = round( sum(xᵢ) / n , 1 )   // 0–100
```

Empty set → section **not attempted** (no average).

### 4.2 Sitting composite (at close or live preview)

Let `W(s)` = section weight (12, 30, …).

**Attempted sections only** for point math:

```text
pointsEarned = round( Σ_s  W(s) × sectionAverage(s) / 100 , 1 )
pointsPossible = 100   // always full benchmark for transparency
```

**Incomplete sections:** listed explicitly; their weight is **not** added into `pointsEarned` (so a 3-section month might show `42 / 100` with note “Listening, typed chat, spoken chat not attempted — not scored as zero”).

Alternative display (recommended on UI):

- **Composite from completed sections:** `pointsEarned / sum(W attempted)` — secondary metric
- **Full benchmark:** `pointsEarned / 100` with incomplete list — primary for month-over-month trend toward 100

Founder pick at implementation: **primary label** = full benchmark + explicit incompletes (matches user request).

### 4.3 Safety

- **Per attempt:** unchanged chat-sim safety flag.
- **Sitting summary:** `safetyAnyRedFlag = OR(attempt.safetyRedFlagged)`; list attempt ids + reasons for Ops.
- Safety does **not** auto-nullify composite unless founder adds a rule later — flag is parallel, same as today.

### 4.4 Improvement plans

`improvement-plan.ts` runs on **latest section attempt** or **lowest attempt in sitting** — recommend **latest attempt** for “what to do next”; optional Ops view of all attempts. No change to rubrics; only which trail is passed in.

---

## 5. Seen-set behavior (confirmation + fix)

### 5.1 Current state (bug relative to new product intent)

`seen-set.ts` is correct **algorithmically** (unused-first, honest repeats). **Scope is wrong:** `SeenEntry[]` is stored per `userId` only, forever. That means:

- Retrying MCQ in September excludes items seen in August or in an isolated review — **stricter than “within this sitting.”**
- Isolated founder review uses `reviewSeenRef` (ephemeral) vs `seenRef` (persisted) — inconsistent.

### 5.2 Target behavior

| Scope key | Used for |
|-----------|----------|
| `(userId, sittingId)` | All **sitting-scored** section draws |
| `(userId, sittingId, pool)` | `drawUnseen` filter — pools: `typing`, `hipaa`, `clinical-knowledge`, `culture`, `listening`, `chat-sim-typed`, `chat-sim-spoken` |

Rules:

1. Each **new section attempt** in the same sitting reads seen accumulated from **prior attempts in that sitting** (any section sharing the same pool — MCQ pools merge per draw helper in `draws.ts`).
2. **Repeats** within the sitting still labeled `repeatedIds` when unused pool cannot fill the draw count.
3. **New sitting** → empty seen for that `(userId, sittingId)` — fresh variety each month.
4. **Isolated review** (founder sign-off, `attempt_type = isolated`, no `sittingId`) → separate seen namespace `(userId, "isolated-review")` or ephemeral-only (no pollute sitting seen).

### 5.3 Cross-month bank exhaustion

Optional later: global cap so the same HIPAA item cannot appear every month — **out of scope v1**. Monthly reset may reuse items across months; acceptable for ~200-item bank with 40-item MCQ draws.

---

## 6. Sitting closure and historical sittings

### 6.1 While open

- Hub shows progress: per section **attempt count**, **running average**, **last submitted date**, **total active time**.
- “Composite preview” using same formula as §4.2 with label **provisional — sitting still open**.

### 6.2 On close

Trigger: cron/job at `closesAt` **or** lazy finalize on first read after `closesAt`.

For each `UserSitting` with `status = open`:

1. Set `status = closed`, `closedAt = now`.
2. Compute `sectionAggregates` and `compositeSummary` from all `SectionAttempt` rows.
3. Store immutable `compositeSummary` (do not recompute if weights change later — snapshot weights on each attempt already).

**Incomplete sections** in summary JSON:

```json
{
  "sections": {
    "typing": { "status": "attempted", "averageScore": 78, "attemptCount": 2, "totalActiveSec": 215 },
    "listening": { "status": "not_attempted" }
  },
  "pointsEarned": 52.4,
  "pointsPossible": 100,
  "incompleteSectionIds": ["listening", "chat-sim-typed", "chat-sim-spoken"],
  "incompleteNote": "These sections were not submitted during this sitting. They are not scored as zero."
}
```

### 6.3 History / trends

- Staff: list past sittings (newest first) — sparkline or table of `pointsEarned` vs month.
- Ops/admin: same via API filter `userId` + join attempts.
- **Do not** delete old attempts when a new sitting opens.

---

## 7. Active time tracking (informational)

### 7.1 Definition

**Active seconds** = time counted only while the section’s **timed phase** is active and the client is responsible for the countdown — not calendar time between visits.

| Section | Start | Stop | Cap |
|---------|-------|------|-----|
| Typing | First keystroke (clock started) | Submit or timer 0 | `COMPETENCY_EXAM_TIMERS.typing` |
| MCQ | Section phase enter (timer start) | Submit or timer 0 | 20×60 |
| Listening | Phase enter | Submit or timer 0 | 10×60 |
| Chat (typed/spoken) | Phase enter | Submit or timer 0 / force end | 10×60 |

**Exclude:** orient screen, ack checkbox, report screen, tab background (optional v1: count only `document.visibilityState === 'visible'` during phase — reduces inflated time if left open).

Store on each `SectionAttempt.activeSec` (integer, ≥0).

### 7.2 Aggregates

`UserSitting.sectionAggregates[s].totalActiveSec = sum(activeSec)` — Ops only; no pass/fail threshold in v1.

---

## 8. API and persistence

### 8.1 Schema (proposed migration)

**New**

```sql
CREATE TABLE siya_competency_sittings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE siya_competency_user_sittings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  sitting_id TEXT NOT NULL REFERENCES siya_competency_sittings(id),
  status VARCHAR(16) NOT NULL CHECK (status IN ('open', 'closed')),
  first_activity_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  section_aggregates JSONB NOT NULL DEFAULT '{}'::jsonb,
  composite_summary JSONB,
  safety_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, sitting_id)
);

CREATE TABLE siya_competency_section_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
  sitting_id TEXT NOT NULL REFERENCES siya_competency_sittings(id),
  section VARCHAR(24) NOT NULL,
  attempt_index INT NOT NULL,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active_sec NUMERIC NOT NULL DEFAULT 0,
  section_score NUMERIC,
  weight NUMERIC NOT NULL,
  item_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  repeated_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  safety_red_flagged BOOLEAN NOT NOT NULL DEFAULT FALSE,
  safety_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  trail_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_competency_section_attempts_user_sitting
  ON siya_competency_section_attempts (user_id, sitting_id, section, submitted_at DESC);

CREATE TABLE siya_competency_seen (
  user_id UUID NOT NULL,
  sitting_id TEXT NOT NULL,
  pool TEXT NOT NULL,
  item_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  repeated BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, sitting_id, pool, item_id, attempt_id)
);
```

**Alter** `siya_competency_exam_attempts`: add nullable `sitting_id`, deprecate new `full` rows (keep for legacy).

Seen in Postgres replaces unbounded localStorage for authenticated users; local mirror optional for offline queue.

### 8.2 Endpoints (sketch)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/competency-exam/sittings/current` | Open sitting + user progress |
| GET | `/api/competency-exam/sittings/mine` | History summaries |
| GET | `/api/competency-exam/sittings/:id/seen` | Load seen for draws |
| POST | `/api/competency-exam/sittings/:id/sections/:section/attempts` | Submit section attempt (append) |
| GET | `/api/admin/competency-exam/sittings/:id/users` | Ops roster for month |

Extend admin list to filter by `sittingId`.

---

## 9. Client / UX (implementation phase — not built in design pass)

### 9.1 Replace primary route

`/learn/competency-exam` → **Sitting hub** (not linear wizard).

```
┌─────────────────────────────────────────────┐
│ September 2026 sitting · open until Sep 30  │
│ Provisional composite: 52 / 100 (3/5)     │
├─────────────────────────────────────────────┤
│ [Typing]  2 attempts · avg 74 · 3m active   │
│ [MCQ]     1 attempt  · avg 68               │
│ [Listening] Not attempted yet               │
│ …                                           │
└─────────────────────────────────────────────┘
```

Each card → section runner (reuse timers/scoring from `CompetencyExam.tsx` **section phases**, delete `afterReview` chain for production).

Query params:

- `?section=typing` → run attempt in **current sitting** (not isolated legacy).
- `?sitting=2026-09` → view closed summary (history).

### 9.2 Isolated review

Keep founder sign-off path as **`attempt_type = isolated`** without `sittingId`, or explicit `?mode=review` — must not write to sitting composite or sitting seen-set.

### 9.3 Deprecate

- “Full sitting” linear orient that lists all five in sequence as the default entry.
- `StoredAttempt` as single composite report per browser session — superseded by `UserSitting` + `SectionAttempt[]`.

---

## 10. Migration and compatibility

| Data | Action |
|------|--------|
| `localStorage` seen v1 | Stop writing for authed users; one-time ignore or import into current sitting only if founder wants (default: **no import**) |
| `localStorage` attempts v1 | Keep read-only for old browser reports |
| Postgres `siya_competency_exam_attempts` | Keep; new writes go to `section_attempts` |
| `ExamReportView` | Evolve to **SittingSummaryView** + **SectionAttemptDetail** |
| `verify-competency-section-focus.ts` | Update when URLs/semantics change |
| `practice-stats-ask` | “Latest exam” → latest **closed sitting summary** or latest section attempt |

---

## 11. Implementation phases (after founder sign-off)

| Phase | Deliverable | Risk |
|-------|-------------|------|
| **P0** | Schema + service layer + seen scoped to sitting | Medium — migration on auth API |
| **P1** | Submit section attempt API + hub UI (open sitting only) | High — touches `CompetencyExam.tsx` |
| **P2** | Lazy finalize on read + history list + MoM trends (staff + admin) | Low |
| **P3** | Ops admin filters (sitting, active time columns) | Low |
| **P4** | Remove linear full sitting; localStorage demotion | Medium — staff comms |

**Do not** start P1 until P0 schema and §4–§8 reviewed on a short RFC reply from founder (timezone, composite display, visibility-based active time Y/N).

---

## 12. Open questions for founder (blocking implementation)

1. **Timezone** for month boundaries — UTC v1 OK?
2. **Composite display** — primary `pointsEarned / 100` with incompletes listed (recommended) vs normalized `/ weight attempted only`?
3. **Active time** — count wall clock during phase only, or also require tab visible?
4. **Chat seen pools** — confirm split `chat-sim-typed` / `chat-sim-spoken` (recommended yes).
5. **Minimum attempts** — any requirement to attempt all five before close, or purely informational incompletes?

---

## 13. Design soundness checklist

| Requirement | Design answer |
|-------------|----------------|
| Sitting entity with open/close | `CompetencySitting` + `UserSitting` |
| Five sections, any order, multi-visit | Hub + independent section runners |
| Redo section within sitting | Unlimited `SectionAttempt` rows |
| Composite = average per section | §4.1–4.2 |
| Persist every attempt | `SectionAttempt` append-only + trails in `trail_json` |
| Active time informational | §7, `active_sec` + aggregates |
| No whole-sitting time gate | Unchanged per-section timers only |
| Close month → final composite | §6.2 closure + `composite_summary` |
| Incomplete ≠ silent zero | §6.2 `incompleteSectionIds` + explicit note |
| Month-over-month history | Closed `UserSitting` list |
| Seen-set within sitting retries | §5 `(userId, sittingId)`; reset each month |
| Reuse existing scoring | No rubric changes — same `scoring.ts`, `writing-score`, chat evaluate |
| Ops transparency | All attempts queryable; aligns with existing admin attempts list pattern |

---

## 14. References (code today)

| Area | Path |
|------|------|
| Linear full sitting | `CompetencyExam.tsx` — `afterReview`, `phase` chain |
| Seen global | `storage.ts` + `seen-set.ts` |
| Weights / sections | `weights.ts`, `types.ts` |
| Report composite (single sitting snapshot) | `report.ts` — will become **section-average input**, not one-shot report |
| Server attempts | `integrations/hipaa-training-api/.../competency-exam-schema.sql`, `competency-exam-service.ts` |
| Improvement plans | `improvement-plan.ts` — consume latest section attempt per sitting |

---

**P0 verification:** `cd apps/hipaa-training && npx tsx scripts/smoke-competency-exam-sitting-p0.ts`  
Optional Postgres: `COMPETENCY_SITTING_P0_DB=1 DATABASE_URL=…` (same script).

**Next step:** **P1** — hub UI + section submit wired to `competency-exam-sitting-service.ts` (no change to linear `CompetencyExam.tsx` until P1 plan).
