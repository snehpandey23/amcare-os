# Web-sourced gap fill v1 — design lock

```text
Status: Architecture only — do not implement until scheduled
Product: Siya Assist (staff Ask) — one doorway + escalate/review; not a research module
Date: 2026-08-22
Decisions locked by founder: Tier-1-only web offer; Compliance/Leadership/General always no-web
```

## North star

When Ask soft-stops with a real knowledge gap on a **low-risk process** question, staff may **opt in** to an unreviewed web-sourced draft. That draft becomes a normal `pending_review` SOP for the dept lead — never live retrieval until approved.

Still: **one Ask chat**, not a separate research app.

---

## Flows (1–5)

| Step | Behavior |
|------|----------|
| 1 | Gap only → plain opt-in offer. Trigger only when `knowledgeGap=true` and no approved match. **Never** after PHI / clinical / emergency refuse. |
| 2 | Opt-in → web answer; every line labeled **unreviewed**; real citations (named sources). Label must survive copy/paste. |
| 3 | Auto-create `pending_review` SOP → existing dept lead / founder review queue. Tag `aiDrafted` + `AI-web-sourced`; source URLs in body. No “will you use it?” gate. |
| 4 | Clinical / Rx / patient-care / high-risk dept hard-block — never offer web (gates below). |
| 5 | Separate usage metrics: offered / accepted / searched / approved / rejected / edited — distinct from normal gap telemetry. |

---

## Naming (fail closed)

| Term | Meaning for this feature |
|------|---------------------------|
| **SOP risk Tier** | `inferSopRiskTier` in `sop-types.ts` / `sop-store.ts` — T1 process · T2 billing · T3 clinical/compliance |
| **Conversation-memory Tier 3** | Unconfirmed role claims in chat memory — **do not reuse** for this gate |

Always say **“SOP risk Tier …”** in UI/docs for this feature.

---

## Hard gates (locked)

### Gate A — safety (pre-offer)

`assessStaffMessageSafety` → if blocked (`phi` | `clinical` | `emergency`): **no web offer**.

### Gate B — SOP risk (locked 2026-08-22)

**Web offer only if `inferSopRiskTier(routedDepartment, question, "") === 1`.**

- **Blocked:** SOP risk **Tier 2 and Tier 3** (billing + clinical/compliance/patient-care).
- **Eligible by default:** Marketing, Technology, HR (Tier 1), when content keywords do not raise tier.

### Department defaults (reuse as written)

| Department | Default SOP risk | Web offer? |
|------------|------------------|------------|
| Marketing, Technology, HR | Tier 1 | Allowed if gap + Gate A clear + content does not raise tier |
| Accounts | Tier 2 | **Never** |
| Clinical Operations, Compliance, Leadership, General | Tier 3 | **Never** (including “general reference” e.g. BAA) |

Content may **only raise** tier (patient-facing ops keywords, clinical safety, HIPAA/PHI outside Accounts) — same as today’s `inferSopRiskTier`.

**Do not** add a second LLM “is this clinical?” classifier.

---

## Retrieval invariant (must-hold)

Web-sourced rows stay `pending_review` (or equivalent non-live status) until approved.

`listSopsForRetrieval` / `retrieveLayeredKnowledge` must continue to expose only `live` + `draft_live`. **Pending must never answer Ask.**

---

## Pending SOP body (reviewer job)

Store at minimum:

- Staff question (PHI already refused by Gate A — still redact if needed)
- Cited excerpts + source URLs
- `aiDrafted: true` and visible `AI-web-sourced` tag

Reviewer verifies **source truth**, not wording alone. Approve → `live` (or send back). Reject/edit per existing SOP review path.

---

## Metrics (separate category)

Do not fold into plain `no_match` / `notify_owner` counts.

Track: `offered` · `accepted` · `searched` · `approved` · `rejected` · `edited`.

---

## Explicitly deferred

- Search provider choice
- UI copy / opt-in chrome
- Metrics schema DDL
- SOP insert wiring

Implement only when this note is scheduled; do not start from chat alone.

---

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-22 | Gate B = **Tier 1 only** (block Tier 2 + Tier 3) |
| 2026-08-22 | Compliance / Leadership / General remain always Tier 3 → **always no-web** |
| 2026-08-22 | Reuse `inferSopRiskTier` + `assessStaffMessageSafety`; no parallel risk brain |
