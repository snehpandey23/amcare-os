# SiyaOS Staff Portal — CRAFT UX Audit (August 2026)

**Status:** Work-in-progress audit deliverable · **August 2026**  
**Scope:** Written findings only — no redesign, no code changes, no new features  
**Next step:** Founder review → then scope redesign (if any) module-by-module  
**Production:** https://siya-staff-assist.vercel.app  
**Principles anchor:** `docs/siyaos-knowledge-base/SIYA-EXECUTIVE-STATE-2026-08.md` — one doorway, hard attention budgets, no ERP/dashboard sprawl. AI augments judgment; it does not replace it.

**Method:** Code and component review (layout tokens, shared primitives, nav shell, representative screens per module). Not a runtime Lighthouse pass or pixel-perfect visual QA. Complements the July 2026 feature/inventory audit in `STAFF-PORTAL-UX-AUDIT.md`.

**Scoring:** Each module scored **1–5** on five CRAFT dimensions only. **5** = at or above named benchmark craft; **3** = acceptable MVP with visible gap; **1** = materially below benchmark. **Overall CRAFT** = rounded average of the five. Scores reflect **craft**, not feature completeness.

| Dimension | What we measured |
|-----------|------------------|
| **V** Visual hierarchy / typography clarity | Heading scale, scan path, label vs body contrast, one obvious primary action per view |
| **L** Load speed / perceived performance | Loading patterns, optimistic updates, layout shift risk, empty/error states |
| **M** Mobile responsiveness | Header/nav, touch targets, grid collapse, horizontal overflow |
| **S** Spacing / whitespace discipline | Section rhythm, card padding, line length, scroll length without reward |
| **C** Consistency of interaction patterns | Buttons, inputs, nav labels, focus rings, card radius — **cross-module** (our unfair advantage as one system) |

**Explicitly not scored:** dashboard count, feature depth, information density, admin surface area, or “more widgets = better.” When a benchmark “wins” mainly by showing more UI, that is noted as **do not copy**.

---

## 1. My Day

**Benchmarks (daily employee home / work hub):** [Notion](https://notion.so) Home · [Basecamp](https://basecamp.com) Hey! screen · [Asana](https://asana.com) My Tasks (mobile-first daily list)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 4 | 4 | 3 | 2 | **3.2** |

**Findings**
- **Strengths:** Shared Siya tokens (Poppins headings, cream page, `rounded-2xl` cards) read as one product. Presence modes (Focus / Break) change layout intentionally — good hierarchy signal. Tasks panel uses SWR with optimistic updates; empty states exist.
- **Hierarchy:** Founder Decision Coach block sits **above** the My day greeting for all roles — violet gradient + tab UI competes with the page H1 for first attention. Legacy Executive Briefing (admin-only `<details>`) adds a second executive visual dialect on the same page.
- **Consistency (biggest gap):** Focus list uses emoji toggles (○/✅); tasks use native checkboxes. Primary actions mix teal accent, navy primary, and `violet-700` (Founder Coach saves). `"Add"` focus uses subtle gray, not the LMS button primitives in `training-ui.tsx`.
- **Spacing:** Long vertical stack (`space-y-6`) — appropriate for a hub, but Coach + tasks + focus + learning + Ask entry creates scroll fatigue without sticky section anchors.
- **Performance:** Text-only loading (`"Loading today's tasks…"`) — acceptable; task errors use `alert()` (jarring vs inline pattern used elsewhere).

**Benchmark note:** Asana/Notion home screens often show *more* modules and widgets. That density is **not** a craft goal for SiyaOS — our constraint (one doorway, attention budget) is correct. They still **beat us on consistency**: one button language and one nav label per destination everywhere on the page.

---

## 2. Shift / Presence

**Benchmarks (shift scheduling + presence):** [Deputy](https://www.deputy.com) · [When I Work](https://wheniwork.com) · [Workstatus](https://www.workstatus.io)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 4 | 2 | 4 | 3 | **3.2** |

**Findings**
- **Strengths:** Semantic color for Working / Focus / Break is clear and repeated in My day + header bar. Start Shift screen is focused (`max-w-md`), uses `trainingLinkPrimaryClass` — aligned with LMS craft.
- **Mobile:** `ShiftPresenceBar` lives in the global header with `text-[11px]` controls and `max-w-[16rem]` — on narrow viewports the bar competes with 7+ nav links that wrap. Deputy/When I Work treat shift status as a **full-width mobile-first** control, not a header chip.
- **Hierarchy:** Handoff feed on `/team` reuses task card vocabulary — good. Start shift route is visually plainer than My day cards (less framed), so shift *entry* feels like a different product moment.
- **Performance:** Handoffs load with plain text — fine for MVP; no skeleton.

**Benchmark note:** Deputy shows rosters, schedules, timesheets, and geo — large surface area. **Do not copy** that sprawl. The craft lesson is mobile **tap target size** and dedicated shift strip, not more dashboard tiles.

---

## 3. HIPAA Training / LMS

**Benchmarks (compliance LMS):** [Alison](https://alison.com) · [Udemy Business](https://business.udemy.com) · [LinkedIn Learning](https://learning.linkedin.com)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 4 | 3 | 2 | 4 | 3 | **3.2** |

**Findings**
- **Strengths:** **`training-ui.tsx` is the best craft foundation in the portal** — `TrainingCard`, `TrainingBtnPrimary` (accent), `TrainingBtnNavy`, shared progress bar, quiz option states. Typography and card spacing match brand.
- **Mobile:** Fixed `w-64` sidebar (`Sidebar.tsx`) with no collapse — on tablet/phone, users get **double navigation** (global `AssistantShell` header + LMS sidebar). LinkedIn Learning and Alison collapse module nav behind a single app chrome on small screens.
- **Performance:** `SiyaLoadingScreen` (branded full-page) until progress hydrates — good perceived wait on first entry; module transitions not audited at runtime.
- **Consistency:** Strong *within* LMS; **weaker vs rest of portal** because companion routes rarely import `TrainingBtnPrimary`. Cert flow nested inside AssistantShell keeps global nav visible — correct for one doorway, but visually busy vs Alison’s single-course focus mode.

**Benchmark note:** Udemy/LinkedIn win partly via catalog density, recommendations rail, and social proof — **not** craft targets for HIPAA cert. Copy their **progress bar clarity** and **one primary CTA per module step**, which we largely already have.

---

## 4. Ask (Siya Assist chat)

**Benchmarks (internal help / AI support):** [Guru](https://www.getguru.com) · [Intercom](https://www.intercom.com) Fin · [Zendesk](https://www.zendesk.com) Answer Bot

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 4 | 3 | 4 | 4 | 4 | **3.8** |

**Findings**
- **Strengths:** Chat bubble hierarchy is clear (user = navy fill, assistant = bordered white, `max-w-[92%]`). Routing badge, sources footer, escalation cards — scannable without becoming a dashboard. Accent Send button matches brand. Focus mode copy is disciplined (one doorway respected).
- **Performance:** Loading is a text line while streaming — functional; Intercom shows typing indicator and skeleton bubbles (perceived speed gap, not feature gap).
- **Consistency:** Best-aligned companion module with global tokens; quick-prompt pills use consistent `rounded-full` pattern.
- **Minor craft:** 👍/👎 feedback emoji buttons are informal vs clinical calm brand elsewhere.

**Benchmark note:** Zendesk/Intercom agent desktops show ticket queues, macros, side panels — **explicit anti-patterns** for Siya Assist v1. Guru wins on **answer card typography** and search-to-answer scan path; we are close on chat, slightly behind on loading polish.

---

## 5. SOP Builder

**Benchmarks (process documentation / SOP authoring):** [Trainual](https://trainual.com) · [Scribe](https://scribehow.com) · [Process Street](https://www.process.st)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 3 | 4 | 4 | 4 | **3.6** |

**Findings**
- **Strengths:** Reuses LMS inputs and primary link class; wizard phases (topic → interview → review) are easy to follow. Narrow `max-w-lg` keeps attention on one step — aligned with hard attention budget.
- **Consistency:** Strong where `TrainingInput` is used; interview textarea sometimes uses ad-hoc border classes instead of the shared input primitive.
- **Performance:** Access gate returns `null` until auth resolves — brief flash risk; save states use `"Saving…"` labels (good).
- **Hierarchy:** Review step may feel tight at `max-w-lg` for long drafts — spacing discipline is good but typography scale doesn’t differentiate “question” vs “generated draft” as clearly as Trainual’s step headers.

**Benchmark note:** Process Street/Trainual expose template libraries, assignees, and workflow dashboards — **do not copy**. Scribe wins on **visual step rhythm** in capture flow; we are comparable on craft, slightly behind on draft/review typography hierarchy.

---

## 6. Chat Reviews

**Benchmarks (contact-center QA / chat review):** [Playvox](https://www.playvox.com) · [MaestroQA](https://www.maestroqa.com) · [Calabrio](https://www.calabrio.com)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 4 | 4 | 3 | 2 | **3.2** |

**Findings**
- **Strengths:** Status pills (open = amber, closed = emerald) are scannable. Filter pills and list layout match portal card vocabulary. Linked from My day tasks — good wayfinding.
- **Consistency (gap):** Same form mixes `TrainingInput` and raw `rounded-lg border` fields — visible on one screen. Submit uses `trainingLinkPrimaryClass`; secondary fields don’t share focus-ring treatment with LMS.
- **Hierarchy:** Page title + form + list is flat; MaestroQA uses stronger table/list typography — but their **QA dashboards** are exactly the ERP-style density we reject.

**Benchmark note:** Playvox/MaestroQA “win” with scorecards, calibration modules, and analytics walls. **Not for us.** Craft takeaway: **unify form controls** on our single-purpose daily review form — low feature count, should look more polished than theirs on that one job.

---

## 7. Memory Hub

**Benchmarks (team knowledge / wiki):** [Guru](https://www.getguru.com) · [Notion](https://notion.so) (wiki) · [Confluence](https://www.atlassian.com/software/confluence)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 3 | 4 | 3 | 2 | **3.0** |

**Findings**
- **Strengths:** Four-layer stack copy (`KnowledgePipelineStrip`) is the clearest IA explanation in the portal. Tab pattern and importance badges (L1–L3) are intentional. Cards match global border/shadow tokens.
- **Consistency (gap):** Active tab + search button use **navy primary**; Ask/LMS use **teal accent** for primary actions. Same user, two primary-button meanings.
- **Hierarchy:** Header block is text-heavy before any content — Guru front-loads search + card grid; our craft asks users to read architecture before acting.
- **Spacing:** Tabs + pipeline strip + panel content — acceptable, but Confluence-like **density in copy** without Confluence’s sidebar wayfinding.
- **Production note (not feature score):** Memory nav is **off by default** (`isPortalMemoryEnabled()`). Craft investment is invisible to most staff until enabled — affects whether consistency work is urgent.

**Benchmark note:** Confluence/Notion win with page trees, backlinks, and hundreds of links — **sprawl we lock out**. Guru wins on **search-first layout** and **one primary action color**; that’s the craft gap worth closing if Memory ships to all staff.

---

## 8. Decision Log

**Benchmarks (decision records / lineage):** [Notion](https://notion.so) decision templates · [Coda](https://coda.io) · [Slack](https://slack.com) canvas + pinned decisions (lightweight record)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 4 | 4 | 3 | 2 | **3.2** |

**Location:** Memory → **Knowledge** tab (`KnowledgePanel` — decision cards, lineage expand, create form). Founder Decision Coach (weekly/monthly) lives on **My day** — related product intent, separate UI shell (violet); counted under My Day for craft, not here.

**Findings**
- **Strengths:** Decision cards use emerald “Layer 1 · Decision” badge, confidence %, lineage `<button>` — good semantic hierarchy *within* the card.
- **Discoverability (craft):** Burying decisions under Memory → Knowledge is a **navigation craft** problem: Coda/Notion surface “Decision” as a first-class doc type in sidebar or template gallery. We intentionally avoid sidebars — but then the log needs a clearer doorway (label, nav, or My day link).
- **Consistency:** Inherits Memory Hub navy/accent split; create form inline with SOP/knowledge cards — same mixed button patterns.

**Benchmark note:** Notion/Coda “win” with databases, views, and filters — **do not copy**. The craft benchmark is **readable decision cards + obvious create path**; we have the cards, not the path.

---

## 9. Level Up (Practice)

**Benchmarks (microlearning / daily practice):** [Duolingo](https://duolingo.com) · [LinkedIn Learning](https://learning.linkedin.com) paths · [Quizlet](https://quizlet.com)

| V | L | M | S | C | **Overall** |
|---|---|---|---|---|-------------|
| 3 | 3 | 3 | 2 | 3 | **2.8** |

**Findings**
- **Strengths:** Daily-lesson framing, streak/XP in header, department-aware copy hooks — coherent product story. Drill subcomponents (`McqCard`, typing, timezone) generally reuse bordered cards.
- **Hierarchy:** Section headings lean on emoji prefixes (🇺🇸, etc.) — readable but **different tone** from My day / Ask (calm clinical). Duolingo uses illustration system; we use emoji — feels less “one design system.”
- **Spacing:** `space-y-10` between sections on a long single page — each drill adds scroll; LinkedIn Learning uses **course shell with one activity in view** for perceived focus.
- **Consistency:** Global nav says **“Practice”**; page title says **“Level Up”**; Grow hub H1 says **“Learn & stay engaged”** — three labels for adjacent learning surfaces. LMS nav says **“Learn”**. Label drift hurts the “one system” advantage.
- **Performance:** Many interactive drills on one route — runtime weight not measured; perceived heaviness vs Quizlet’s one-card focus.

**Benchmark note:** Duolingo/LinkedIn win with gamification rails, leaderboards, and catalog depth — **not** our philosophy (outcomes not surveillance). Craft lesson: **one in-view exercise** and **one nav name** — spacing/label consistency, not more game UI.

---

## Cross-portal craft themes (August)

1. **`training-ui.tsx` exists but is not the law** — companion modules re-implement buttons/inputs (~15–20 variant patterns estimated in code).
2. **Executive surfaces use a parallel violet/amber palette** (Founder Coach, legacy briefing) — reads as bolted-on vs Siya navy/teal/cream.
3. **Nav label mismatches** — Practice / Level Up / Learn / Workspace / Grow undermines the “one system beats fragmented SaaS” story.
4. **Loading UX** — one good full-page loader (`SiyaLoadingScreen`); most modules use plain `"Loading…"` text.
5. **`PortalNavLink` full page assign** — may add perceived latency vs Next `<Link>` (performance craft, not measured here).

**What we should not chase (locked):** More dashboard cards, admin analytics walls, sidebar module sprawl, Intercom-style agent desktops, Confluence page trees, Deputy timesheet/geo modules.

---

## Ranked priority — biggest CRAFT gaps vs benchmarks

Priority = lowest overall CRAFT **and** highest leverage for “one system” consistency (dimension **C** weighted in judgment).

| Rank | Module | Overall | Primary gap | vs benchmark |
|------|--------|---------|-------------|--------------|
| **1** | **Level Up (Practice)** | **2.8** | Spacing + nav label consistency; emoji/visual tone vs calm portal | Duolingo/LinkedIn **activity focus** (one task in view), not their catalogs |
| **2** | **Memory Hub (+ Decision log doorway)** | **3.0 / 3.2** | Cross-module button color + search-first hierarchy | Guru **search + card scan + one accent CTA** |
| **3** | **My Day** | **3.2** | Cross-module consistency; Founder Coach visual fork competes with H1 | Basecamp/Notion **single visual language** on daily home |

**Deferred (still craft debt, lower urgency than top 3):** Shift/Presence mobile header (3.2), Chat Reviews form primitives (3.2), LMS sidebar collapse (3.2). **Relative strength:** Ask (3.8) and SOP Builder (3.6) — extend their patterns outward rather than redesign those modules first.

---

## August deliverable status

| Item | Status |
|------|--------|
| Module-by-module CRAFT audit | **Done** (this doc) |
| Named industry benchmarks per module | **Done** |
| Feature-sprawl “do not copy” flags | **Done** |
| Redesign / implementation | **Explicitly deferred** until founder review |
| Runtime performance audit (Lighthouse) | **Out of scope** — recommend if redesign is scoped |

**Founder decision needed before design work:** Confirm top-3 priority order; confirm whether Memory/Decision log nav stays pilot-hidden during craft pass; confirm whether Founder Coach keeps a distinct “executive” palette or merges into Siya tokens.

---

*Audit author: Cursor agent · Codebase snapshot August 2026 · Complements `STAFF-PORTAL-UX-AUDIT.md` (feature inventory, July 2026).*
