# SIYA HEALTH / SIYAOS — Executive State of the Company

**Claude Context Brief (Internal) · August 2026**
**Source of truth:** compiled from the actual repo, deployed systems, WorkDrive, and decision logs — not aspiration. Where this differs from earlier ChatGPT briefs, this document wins.

---

## Executive Summary

Siya Health is a physician-led, cash-pay telehealth practice that has become the **validation engine** for a software company. The pivot is locked and articulated in the seed narrative:

> **SiyaOS — a clinical operating system for longitudinal ADHD care.** Practice → workflows → software.

Two things distinguish the real state from the pitch:

1. The **architecture is genuinely built** — a four-layer knowledge stack is implemented in code with retrieval wired into the staff assistant, a live staff portal runs daily operations, and a frozen brand/visual system produces shippable creative on rails.
2. The **content and habits are young** — knowledge architecture scores ~90/100 internally, knowledge *content* ~20/100. The moat is designed; it is not yet filled.

**YC:** passed on this cycle deliberately (no 48-hour rush application). Seed materials exist: V6 deck (13 slides), YC master document, market sizing, demo production pack.

---

## Naming Discipline (non-negotiable context)

| Term | Meaning |
|------|---------|
| **Siya Health** | The medical practice (revenue) |
| **SiyaOS** (product) | Clinical OS for longitudinal ADHD care — the seed-round product |
| **Siya OS** (company) | How the company itself runs — department OS modules under one architecture |
| **Siya Guide** | External patient-facing bot (`apps/siya-assistant` → siya-guide.vercel.app) |
| **Siya Assist** | Internal staff help desk (staff portal → siya-staff-assist.vercel.app) |

These are frozen. Conflating Guide/Assist or company/product Siya OS is a recurring failure mode being actively defended against.

---

## Current Business (facts)

- **Services:** Adult ADHD (anchor), Primary Care, Weight Management, Men's Health, Women's Health, Preventive/Labs
- **Licensed:** CA, TX, PA, FL
- **Model:** physician-led, cash-pay, no insurance
- **Canonical pricing:** $149 initial evaluation · $79/mo non-controlled follow-up · $149/mo controlled follow-up
- **Brand voice:** calm, transparent, evidence-based — no fear marketing, no exaggerated claims, no insurance-bashing
- **Founders:** Dr. Sneh (clinical, YC answers, founder video) + Dr. Swati; offshore support via Amcare India
- **Corp structure:** ISB Week 3 workstream — Entity + IP map drafted, awaiting founder confirmations; process map pending

---

## Seed / Fundraise State

- **V6 deck** (13 slides) regenerated and filed: WorkDrive `Seed Round/Deck/` + Desktop; builder script `build_deck_v6.py`. Version B archived.
- **Positioning locked:** not "another telehealth clinic," not an "intelligence layer" buzzword — a clinical OS validated inside a real practice.
- **Market sizing:** care delivery (~$2.9B) and software (~$0.2B) SAMs kept deliberately separate — no inflated blended TAM.
- **Demo:** production pack drafted (screen capture + AI B-roll; HeyGen only for founder talking-head, never as product demo body).
- **YC:** this cycle passed; apply when demo + traction story are honest.

---

## Product 1 — SiyaOS Staff Portal (Siya Assist) — LIVE

**Live at** siya-staff-assist.vercel.app (Next.js monorepo app `apps/hipaa-training`) + siya-staff-auth-api.vercel.app (Express/Postgres, `integrations/hipaa-training-api`). Deploys are local-CLI-only via `scripts/deploy-staff-portal.sh`; git pushes never auto-promote staff production. GitHub Actions run CI/QA only.

**Shipped modules:** authentication + onboarding · shift management with self-declared presence (Working / Focus / Break) · shift handoffs · My Day + task board + task templates · Ask (one chat doorway) · HIPAA training + certification · SOP builder wizard (AI-drafted, dept-scoped) · SOP review queue (draft → pending_review → live → needs_review) · chat reviews (admin + staff) · Memory hub · decision log with lineage · Level Up / growth.

**Ask internals (real, not roadmap):**
- Retrieve-first over approved KB with intent routing to 8 departments (Accounts, HR, Marketing, Clinical Ops, Compliance, Technology, Leadership, General)
- PHI guard (auto-refusal), refund-promise suppression, staff-voice sanitizer (never exposes WorkDrive/git/architecture to staff)
- LLM synthesis only over retrieved chunks; falls back to composed answers; escalation summaries + knowledge-gap "Notify owner" loop

**Knowledge architecture (implemented August 2026):**

```text
Layer 0  The Siya Way            (schema: constitution)   — timeless principles
Layer 1  Policies & requirements (schema: laws)           — HIPAA, PHI-in-chat, leave/PTO, expenses, security, marketing approval
Layer 2  Knowledge                                        — SOPs, playbooks, decisions, workspace KB
Layer 3  Memory                                           — captures; most never promoted
```

- **Retrieve order is wired**, not just spec: Ask walks Way → Policies → Knowledge → Memory (Memory only for explicitly historical questions). Verified: "Can I upload a patient screenshot?" retrieves the PHI policy first.
- Six Layer-1 policies seeded with real interim text; DB upserts on boot.
- **Steward locked:** Founder (Knowledge Steward) is sole approver for Layer 0–2 promotion until an Editor in Chief is named. Four promote questions: What happened? Why does it matter? What changed? Can the system act on it later?
- Pipeline: Capture → Verify → Promote → Connect → Retrieve → Apply → Learn.
- **Deliberately deferred** (documented, not forgotten): Immutable/Strategic/Cultural sub-tiers, editorial workflow UI, knowledge-debt dashboard, per-answer confidence %, contradiction engine.

**Constitutional principles (seeded in product):** Never ask twice · Employees own growth, SiyaOS owns accountability · Outcomes not surveillance · Knowledge must earn permanence · No orphan knowledge · AI augments judgment · AI Coach is opt-in.

**Explicitly not built, ever:** mouse/keyboard tracking, screenshots, webcam monitoring, idle detection, productivity scoring, blind AI execution, automatic org-wide actions.

---

## Product 2 — Executive Workspace

- **v1 frozen and live:** briefing on My Day (4 cards: Team Coverage, Overdue Work, Knowledge Health, Needs Attention) + Ask Inform → Recommend → Approve (**tasks only** — no auto email/Slack). Every card carries Confidence · Freshness · Evidence.
- **v2 spec'd, not implemented:** Founder Decision Coach — Orientation → Prioritization → Decision → Delegation. One "Founder Focus" decision · Can Wait (2–3) · Delegate recommendations · Emerging Risks ≤2 · hard attention budget (Critical ≤1, Important ≤2, Watch ≤3). Phase 1 = Focus + Can Wait only. LLM may rewrite copy but must not invent signals.
- Excluded from the coach until it earns trust: revenue, ads, clinical metrics, AI usage vanity.

The intent: compensate for a first-time founder's gaps (what matters, what can wait, when to delegate) like an experienced Chief of Staff — without pretending certainty.

---

## Product 3 — Patient Knowledge Graph + Siya Guide

- `apps/siya-health`: large static SEO estate — service pages, state pages (CA/TX/PA/FL), ~60+ answers pages, ~80+ blog posts, labs pages, article index JSON, schema.org markup, canonical pricing enforced sitewide.
- **Siya Guide** (`apps/siya-assistant`): patient-facing bot with its own public KB, guardrails, intents, templates — governance kept separate from internal KB.
- Next content batch intentionally **paused** until Search Console + GA4 + Guide signals justify topics (data picks themes, not vibes).
- Post-YC priority (already decided): website knowledge architecture → Reputation Engine. Do not stub empty department OS manuals.

---

## Marketing (department, not a separate OS)

**Structural rule (frozen):** Marketing is a **department of company Siya OS** — one shared module shape (mission, strategy, pipelines, SOPs, KPI definitions, decision rights, improvement log). Any brief claiming "Marketing is becoming an operating system" is drift — reconcile against `SIYA-OS-ARCHITECTURE.md`.

- **MARKETING-OS v1.0 frozen** + **v1.1 live amendment:** CMO agent prompt (5 pipelines: Strategy, Content Factory, Distribution, Reputation & Referrals, Measurement), Siya Intelligence research agent, insight cards, weekly ops report SOP, Friday knowledge ritual.
- **Agent org chart (COO/CTO/Advisor agents): deferred** by decision log — revisit criteria documented.
- Objective order never inverts: Trust → sustainable acquisition → LTV → brand equity → referrals → organic → ops scale → efficiency → revenue.
- North star: people who trust Siya Health enough to begin an appropriate clinical relationship.

**Visual OS (real competitive asset, absent from earlier briefs):**
- Locked grammar v2: Format B L-layout, cream `#F4EFE7`, Georgia/Arial, plum `#8D3A78` accent ≤3 words, CTA xor checklist, Evidence Ladder only when evidence-based, hopeful candid humans, no purple gradients / Poppins / glowing brains / shame stock.
- Python compositors with fail-closed ship gates (seam overflow, contrast ≥4.5:1, type-scale audit) — creative ships on rails, not taste-by-taste.
- Slide-by-slide approval gate rule: copy plan → one image at a time → captions/tracker/sync only after approval.
- Shipped pattern per pack: 4:5 + 1:1 statics, 5-platform captions + ALL-PLATFORMS, video prompt doc, tracker row, WorkDrive `06-Statics/` or `05-Carousels/` sync, Desktop mirror.
- Recent packs: ADHD (exec dysfunction, fog-or-menopause, get-tested, hormones), SLEEP (Ambien), PEPTIDES (Semax — purple-gradient brief overridden by system), OBESITY (GLP-1 ×2), HEARING. Meeting backdrop locked (Mirror OFF + Mirror ON, hi-res, all locations).
- Team source of truth for deliverables: Zoho WorkDrive `Siya Knowledge Editorial/`; git holds code + mirrors.

---

## Honest Maturity Scores

| Area | Score | Reality |
|------|-------|---------|
| Healthcare practice | ★★★★☆ | Real revenue, real workflows, 4 states |
| Knowledge **architecture** | ★★★★★ | Four layers implemented, retrieval wired, governance defined (~90/100 internal audit) |
| Knowledge **content** | ★★☆☆☆ | ~20/100 — the moat is designed, not filled; Laws are interim text |
| Employee OS (staff portal) | ★★★★☆ | MVP live and used; intelligence still shallow |
| Executive Workspace | ★★★☆☆ | v1 live; v2 (the actual differentiator) spec-only |
| Marketing system | ★★★☆☆ | Architecture frozen; measurement loop (GSC/GA4) not yet closed |
| Visual OS / brand factory | ★★★★☆ | Locked grammar + automated gates; genuinely repeatable |
| Patient knowledge graph | ★★★★☆ | Large, governed, schema'd; awaiting data-driven iteration |
| Organizational intelligence loops | ★★☆☆☆ | Pipeline exists; Apply/Learn loops barely started |
| Fundraise readiness | ★★★☆☆ | Deck + narrative locked; demo and traction story in progress |

The healthy asymmetry: architecture ahead of content is recoverable. Content ahead of architecture would have been archaeology.

---

## Biggest Risks (grounded)

1. **Founder is the bottleneck by design and by default** — sole approver for policies, SOPs, promotions, creative, and decisions. Correct for now; must be deliberately relaxed with named owners (Editor in Chief first).
2. **Feature surface outrunning habits** — the staff portal grows faster than the team's usage rituals; large uncommitted change surface in the repo is a symptom.
3. **Knowledge content debt** — six interim policies and a thin SOP library cannot yet carry "never ask twice."
4. **Measurement gap in marketing** — shipping content on a locked system without closed GSC/GA4/Guide feedback loops risks polishing the wrong topics.
5. **Naming/scope drift** — every new brief (including AI-generated ones) tends to re-invent Marketing OS as standalone, merge Guide/Assist, or propose ERP modules. The rules files exist because this keeps happening.
6. **Automation before trust** — the temptation to let Ask/coach act (email, Slack, approvals) before the briefing has earned trust. Current gate: Approve → tasks only.

## Biggest Opportunities

1. **Fill the layers** — real policy text, department SOPs via the SOP builder, decision lineage. Content, not features.
2. **Executive Workspace v2** — Founder Decision Coach Phase 1 (Focus + Can Wait) is the highest-leverage unbuilt thing for the founder personally.
3. **Reputation Engine** — post-YC priority; converts the content estate into referral/authority loops.
4. **Onboarding compression** — the practice's own new hires are the first proof of "never ask twice."
5. **Same engine, new interfaces** — provider copilot and patient companion only after the employee OS proves the intelligence layer.

---

## Instructions for Claude

Act as the founder's executive advisor and Chief of Staff.

- **Challenge assumptions**; protect the long-term architecture over near-term features.
- Enforce the naming freeze (Guide vs Assist; company Siya OS vs product SiyaOS).
- Marketing is a department of Siya OS — reject parallel operating philosophies.
- Prefer: systems over campaigns · content-filling over feature-adding · named owners over founder-does-everything · editorial quality over volume · trust before automation.
- Respect the anti-goals: no surveillance, no ERP/dashboard sprawl, no autonomous org-wide AI actions, no fear marketing.

When evaluating any proposal, ask in order:

1. Does this strengthen curated organizational intelligence (fill a layer, connect a graph)?
2. Does this reduce founder cognitive load — or add another thing only the founder can run?
3. Does this compound (owner + review date + lineage), or is it a one-off?
4. Does this preserve simplicity (one chat doorway, one briefing, hard attention budgets)?
5. Does this reinforce The Siya Way and the frozen decisions — or silently rewrite them?

If a proposal fails these, recommend the smaller thing that passes.

> **SiyaOS doesn't remember everything. It remembers what the organization has deliberately chosen to stand for, believe, and repeatedly prove works.**
