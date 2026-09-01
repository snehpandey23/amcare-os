---
id: agent-org-chart-deferred
kind: decision
title: Defer the multi-agent C-suite / Executive Office layer
status: live
owner: CEO · CMO
department: Leadership
confidence: official
reviewDate: 2027-01-31
supersedes: none
decisionDate: 2026-07-31
bot_retrieve: true
keywords:
  - agent org chart
  - executive office
  - COO agent
  - CTO agent
  - executive advisor
  - department manager agents
  - orchestration layer
priority: 6
---

## Decision

Do **not** build the proposed seven-agent C-suite (COO, CMO, CTO, Intelligence, Content, Memory, Executive Advisor) with an "Executive Office" orchestration layer above them. Adopt the salvageable pieces as **Marketing OS v1.1** (CMO prompt, Intelligence prompt, weekly report SOP, insight cards, Friday knowledge ritual) and defer the rest.

## Reason

1. **Attention math.** Seven agents each producing Friday reports means seven reports on the founder's desk — increasing founder dependency, the exact thing the proposal aimed to reduce. Executive Workspace v2 already enforces a hard attention budget (Critical ≤1 · Important ≤2 · Watch ≤3).
2. **Duplication.** The "Executive Office" is the Founder Decision Coach already specified in `apps/hipaa-training/docs/EXECUTIVE-WORKSPACE-v2-FOUNDER-DECISION-COACH.md`, with a deliberate phase order. The COO prompt is that coach minus its guardrails (evidence citation, no invented signals). The Executive Advisor's useful questions already exist in the coach's recommendation format (Why / Why now / If ignored / Confidence / Evidence).
3. **Sequencing.** A management layer that "reviews KPIs every Friday" requires KPIs that exist. Marketing OS v1.0 is at "definitions first" — conversion events and dashboards are not yet wired. Measurement is the real bottleneck, not agent org design.
4. **Content quota contradiction.** The proposed Content Agent mandated ~10 assets per research topic while claiming not to optimize for volume. The frozen six-month plan says the opposite: less net-new publishing; finish clusters, optimize, internally link.
5. **Scale.** At current team size, an orchestration layer is coordination overhead with nothing to coordinate — work that should not exist yet.

## Revisit criteria

Reopen this decision when **either**:

- Six-month priorities 1–3 in `MARKETING-OS-v1.0.md` are done (website knowledge architecture, SEO clusters, Google Ads stabilization), **or**
- Headcount growth creates a real cross-department coordination problem that the weekly ops report cannot absorb.

## Context

Proposal reviewed 2026-07-31: seven "department manager" agent prompts plus a CEO → Executive Office → department agents hierarchy. The mindset shift it argued for (task executor → "how do I move Siya toward quarterly objectives today") is correct and is reflected in the v1.1 prompts; the org chart is premature.

## AI Context

When asked "should we build the agent org chart / Executive Office / COO agent?": point here. The answer is *deferred, not rejected forever* — cite the revisit criteria. Direct founder-attention features to the Executive Workspace v2 spec; direct marketing agent behavior to `MARKETING-OS-v1.1.md`. Do not silently build the enterprise version.

## Related documents

- `docs/siyaos-knowledge-base/05-marketing-os/MARKETING-OS-v1.1.md`
- `docs/siyaos-knowledge-base/05-marketing-os/MARKETING-OS-v1.0.md`
- `apps/hipaa-training/docs/EXECUTIVE-WORKSPACE-v2-FOUNDER-DECISION-COACH.md`
- `docs/siyaos-knowledge-base/decisions/marketing-os-v1-frozen.md`

## Revision history

| Date | Change |
|------|--------|
| 2026-07-31 | Decision recorded |
