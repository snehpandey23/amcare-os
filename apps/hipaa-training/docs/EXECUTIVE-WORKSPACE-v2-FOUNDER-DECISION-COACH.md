# Executive Workspace v2 — Founder Decision Coach

```text
Status: Architecture only — do not implement until approved
Parent: EXECUTIVE-WORKSPACE-v1.md (frozen)
Date: 2026-07-29
Product: Siya OS / staff portal (Internal) — not Siya Guide, not ERP
```

## North star

When the founder opens Siya OS each morning, they immediately understand:

1. What deserves attention **today**
2. What **only they** can decide
3. What should be **delegated**
4. What is becoming a **risk**
5. What can **safely wait**

Optimize for:

**Orientation → Prioritization → Decision → Delegation**

Not:

Information → Dashboard → Analytics

The AI compensates for first-time founder gaps (what matters, what can wait, when to react vs lead) **without** pretending certainty.

---

## Relationship to v1 (no rewrite, evolve)

| v1 (keep) | v2 (add / reframe) |
|-----------|---------------------|
| Four signal cards as **inputs** | Compress into attention budget; do not show all as peers |
| What / Why / Recommended action | Add: Why now? / If ignored? / Only-you vs Delegate |
| Confidence · Updated · Evidence | Same trust footer on every recommendation |
| Ask Inform → Recommend → Approve (tasks) | Same loop; Founder Focus feeds Ask with context |
| Exclusions (revenue, ads, clinical, AI usage) | Still excluded until briefing earns trust |

**Anti-goals (unchanged + stronger):** not another dashboard, not ERP, not dozens of cards, not micromanagement, not raw analytics.

---

## Founder mental model (product constraint)

Assume the founder does **not** yet reliably know:

- what matters vs noise  
- when to delegate  
- when they are reacting instead of leading  

So the UI must:

- Never overwhelm  
- Never show every metric  
- Always reduce complexity  
- Prefer **questions an experienced CEO would ask** over more charts  

Canonical coach questions (surface over time, not as a quiz wall):

- What decision am I avoiding?  
- What only I can do today?  
- What should I stop working on?  
- Where is the team blocked because of me?  
- What have we learned this week?  

---

## Component hierarchy (My day · executive lane only)

```text
ExecutiveWorkspace (existing gate: executive user)
└── FounderCoachStrip          ← NEW primary surface (replaces equal-weight 4-card grid as hero)
    ├── FounderFocus           ← exactly 1 card
    ├── AttentionBudget        ← Critical(≤1) · Important(≤2) · Watch(≤3)  [compressed from v1 cards]
    ├── CanWait                ← 2–3 items
    ├── Delegate               ← recommendations only
    └── EmergingRisks          ← max 2
└── Ask entry (existing)       ← prefilled from FounderFocus / Delegate when user taps
└── Execution hinterland       ← /admin/tasks, SOP review, team (links only)
```

**v1 four cards** become **signal sources**, not the hero. They may collapse into AttentionBudget chips or “evidence drawers,” not four equal dashboards.

### 1. Founder Focus (one card only)

| Field | Required |
|-------|----------|
| Today's Most Important Decision | Yes — single sentence |
| Why it matters | Yes |
| What happens if ignored | Yes |
| Suggested next action | Yes |
| Confidence | high / medium / low |
| Evidence | count + short labels |
| Updated | freshness |
| Class | `founder_only` \| `delegate_ok` \| `wait` |

**Selection rule:** Chosen by ranking engine from **all** company signals available that morning — never random, never LLM freestyle without evidence IDs.

### 2. Can Wait (2–3)

Purpose: reduce anxiety. Explicit permission to ignore.

Example shape: `"Knowledge Health is stable — revisit Friday."`

### 3. Delegate (recommendations only)

Identify work the founder should **not** personally own. Never auto-assign.

Tap → Ask Recommend → Approve → create task (v1 execute scope).

### 4. Emerging Risks (max 2)

Not current fires — **patterns**.

Fields: Risk · Evidence · Confidence · Suggested mitigation.

---

## Attention budget (hard)

| Tier | Max | Meaning |
|------|-----|---------|
| Critical | 1 | Blocks company or trust today |
| Important | 2 | Needs judgment this week |
| Watch | 3 | Pattern forming; no action required today |

**Never exceed.** If more candidates exist, overflow goes to Can Wait or is suppressed with `suppressedCount` in meta (for debugging, not UI).

---

## Decision model (every recommendation)

Must answer:

1. Why am I seeing this?  
2. Why now?  
3. What happens if I ignore it?  
4. What should I do?  

Plus trust footer: Updated · Confidence · Evidence · Suggested next action.  
If confidence is low → say so.

---

## Architecture

### Layers

```text
┌─────────────────────────────────────────────┐
│  UI: FounderCoachStrip (staff portal)       │
├─────────────────────────────────────────────┤
│  API: GET /api/executive/founder-coach      │
│       POST /api/executive/founder-coach/ack │  (optional: dismiss / snooze / accept)
├─────────────────────────────────────────────┤
│  Coach Engine (API package)                 │
│   signal collectors → candidates → ranker   │
│   → packager (Focus / Wait / Delegate / Risk)│
├─────────────────────────────────────────────┤
│  Signal sources (existing + thin adapters)  │
│   team pulse · tasks · assist gaps/feedback │
│   SOP pending · training not started        │
│   memory decisions · (later) trust-status   │
└─────────────────────────────────────────────┘
```

Keep intelligence in **`integrations/hipaa-training-api`** (same as `executive-briefing.ts`). Portal stays thin client.

### Ranking engine (deterministic first)

1. **Collect** `CoachCandidate[]` from adapters (each with `kind`, `severity`, `evidence[]`, `freshness`).  
2. **Score** with explicit weights (config, not vibes):

| Factor | Intent |
|--------|--------|
| Urgency | overdue age, critical priority |
| Blast radius | people blocked, dept impact |
| Founder-only | policy / trust / escalation that cannot be delegated |
| Trend | worsening vs stable (Emerging Risk) |
| Staleness penalty | low-confidence or stale signals rank down |

3. **Classify** into Focus / Important / Watch / Wait / Delegate / Risk.  
4. **Pack** under attention budget.  
5. **Optional LLM rewrite** of copy only (titles, “if ignored”) — **never** invent signals; must cite `evidenceIds`. Same pattern as `admin-ops-llm.ts`.

### Candidate kinds (v2.0)

| Kind | Source today | Typical class |
|------|--------------|---------------|
| `coverage_gap` | team pulse | Important / Watch |
| `overdue_critical` | task board | Critical / Focus |
| `knowledge_gap_spike` | assist gaps 7d | Focus / Risk |
| `sop_review_backlog` | pending_review | Delegate / Important |
| `training_stall` | modules not started | Delegate / Wait |
| `decision_unpromoted` | memory decisions | Founder-only |
| `trust_regression` | trust-status.json (phase 2) | Critical / Risk |

### State model

```ts
type CoachConfidence = "high" | "medium" | "low";

type CoachEvidence = {
  id: string;
  label: string;
  href?: string;
};

type CoachRecommendation = {
  id: string;
  title: string;
  whyItMatters: string;
  whyNow: string;
  ifIgnored: string;
  suggestedAction: string;
  confidence: CoachConfidence;
  updatedAt: string;
  evidence: CoachEvidence[];
  class: "founder_only" | "delegate_ok" | "wait" | "risk";
  askPrompt?: string; // prefills Ask
};

type FounderCoachPayload = {
  generatedAt: string;
  greetingName: string | null;
  focus: CoachRecommendation;           // exactly one
  attention: {
    critical: CoachRecommendation[];   // ≤1
    important: CoachRecommendation[];  // ≤2
    watch: CoachRecommendation[];      // ≤3
  };
  canWait: CoachRecommendation[];       // 2–3
  delegate: CoachRecommendation[];      // 0–3
  emergingRisks: CoachRecommendation[]; // ≤2
  meta: {
    signalsConsidered: number;
    suppressedCount: number;
    engineVersion: "v2.0";
  };
};
```

Optional client ack (phase 2):

```ts
type CoachAck = {
  recommendationId: string;
  action: "snooze_1d" | "accepted" | "dismissed";
};
```

Used to avoid nagging and to learn founder preferences — **not** to auto-execute.

---

## API changes

| Endpoint | Change |
|----------|--------|
| `GET /api/executive/briefing` | Keep for back-compat; mark **legacy** once coach ships |
| `GET /api/executive/founder-coach` | **New** — returns `FounderCoachPayload` |
| `POST /api/executive/founder-coach/ack` | **New (phase 2)** — snooze/dismiss/accept |
| Ask `/api/chat` | Accept optional `coachContext: { recommendationId }` for grounded replies |
| Trust | No new public metrics UI; adapter reads `trust-status.json` in phase 2 |

Access: same as v1 `isExecutiveUser` (`SIYA_EXECUTIVE_USER_EMAILS` or admin). **Align UI gate with API allowlist** (known v1 drift).

---

## UI / component hierarchy (portal)

```text
ExecutiveBriefingPanel.tsx          → deprecate as hero (keep as “Signals” collapsible optional)
FounderCoachPanel.tsx               → NEW
  FounderFocusCard.tsx
  AttentionBudgetRow.tsx            → Critical / Important / Watch chips
  CanWaitList.tsx
  DelegateList.tsx
  EmergingRiskList.tsx
  CoachTrustFooter.tsx              → Updated · Confidence · Evidence
```

Placement: **My day** executive lane, above personal Morning Brief / tasks.  
Employee Morning Brief remains **personal** — do not merge into Founder Coach.

Interactions:

- Focus **primary CTA** → deep link or open Ask with `askPrompt`  
- Delegate item → Ask Recommend assignee → Approve → task  
- Can Wait → no CTA (or “Remind Friday”)  
- Emerging Risk → mitigation as Recommend only  

---

## Rollout plan

### Phase 0 — Spec freeze (this doc)

- Approve architecture  
- No code  

### Phase 1 — Coach engine + Focus only (thin slice)

- Implement collectors + ranker + `GET /api/executive/founder-coach`  
- UI: **Founder Focus + Can Wait only** (prove cognitive load drop)  
- Keep v1 four cards behind “All signals” disclosure  
- Success: founder opens My day and can name today’s decision in &lt;10 seconds  

### Phase 2 — Full strip + Trust adapter

- Attention budget · Delegate · Emerging Risks  
- Ack/snooze  
- Wire `trust-status.json` as risk/critical candidate (not a Trust dashboard inside My day)  

### Phase 3 — Judgment maturity

- Weekly: “What did we learn?” from decisions + gaps  
- Founder-only queue vs delegate queue explicit  
- Light preference learning from acks (weights), still deterministic core  

### Explicit non-goals for 90 days

- Revenue / ads / marketing streak in coach  
- Auto-send email/Slack  
- Multi-dashboard “CEO suite”  
- Clinical metrics  

---

## Long-term evolution (founder → CEO)

| Stage | Coach behavior |
|-------|----------------|
| Reactive manager | More orientation; more Can Wait; teach prioritization |
| Team lead | Stronger Delegate; fewer Critical |
| Executive | Filter harder; Emerging Risks & decisions dominate |
| CEO | Almost all noise suppressed; Focus + strategic judgment only |

**Principle:** as the org matures, the workspace **filters more**, not shows more.

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| LLM invents priorities | Ranker owns selection; LLM only rewrites copy with evidence IDs |
| Coach becomes dashboard | Hard attention budget + card caps in API schema |
| Wrong “only you” | Default `delegate_ok` unless signal tagged founder-only |
| Anxiety from risks | Max 2; always pair with mitigation + confidence |
| v1/v2 UI confusion | One hero strip; legacy cards collapsed |

---

## Open decisions (founder must choose before build)

1. **Hero swap timing:** Replace v1 four-card hero in Phase 1, or run Focus *above* cards for one week?  
2. **Allowlist:** Lock Executive lane to `SIYA_EXECUTIVE_USER_EMAILS` only (recommended) vs all admins?  
3. **Trust in Phase 2:** Include deployment/trust regressions as Critical candidates?  

---

## Implementation note

**Do not implement until this architecture is approved** and the three open decisions above are answered.

When approved, implement Phase 1 only: engine + Focus + Can Wait + API + thin UI.
