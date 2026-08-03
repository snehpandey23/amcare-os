# SiyaOS Staff Portal — Consolidation Audit (Phase 0)

**Status:** August 2026 · **Audit only — no code changes**  
**Next step:** Founder sign-off on nav/naming table → then Phase 1 (routing/labels)  
**Scope anchor:** One coherent app; no new features, no redesign, no animation work  
**Related:** `STAFF-PORTAL-CRAFT-AUDIT-AUG2026.md` (CRAFT scores, July/August)

---

## 1. Complete route & nav inventory

### Top-level header nav (`AssistantShell.tsx`)

| Nav label | Route(s) | Auth / gate | What it actually does |
|-----------|----------|-------------|------------------------|
| **My day** | `/` | All staff | Daily hub: tasks (SOP checklist + ad-hoc), focus list, learning nudges, Team pulse (compact), Founder Decision Coach, legacy executive briefing (admin `<details>`), Ask entry, shift-aware focus/break states |
| **Workspace** | `/grow`, `/grow/sops`, `/grow/sop-builder` | All staff (builder: dept lead/admin) | **Meta-hub**, not a single product: stats for HIPAA LMS + Practice XP + cert status; links to SOP workspace, drill library, `/training`, `/level-up`. Page H1: *"Learn & stay engaged"* (≠ nav label) |
| **Ask** | `/help` | All staff | Siya Assist internal chat (retrieve-first KB, escalation, focus-mode copy). Route is `/help`, not `/ask` |
| **Practice** | `/level-up` | All staff | Daily microlearning drills (English, typing, timezone, billing scenarios, MCQ). Page H1: *"✨ Level Up"* (≠ nav label) |
| **Memory** | `/memory` | All staff **if** `NEXT_PUBLIC_SIYA_PORTAL_MEMORY_ENABLED=1`; else redirect `/` | Four-layer stack UI: The Siya Way, Policies, Knowledge (incl. decision log), Memory captures + search |
| **Team** | `/team` | Signed-in staff | Who’s working / break / focus; shift handoff feed; full Team pulse + today’s assignments |
| **Learn** | `/training`, `/module/*`, `/final`, `/results`, `/certificate` | All staff | HIPAA LMS: sidebar module list, lessons, quizzes, final exam, certificate. **Nested inside** `AssistantShell` + `TrainingLayout` (double chrome) |
| **Admin** | `/admin/team`, `/admin/tasks`, `/admin/task-templates`, `/admin/sop-review`, `/admin/chat-reviews` | `role === admin` | Team CRUD, kanban task board, task templates (+ SOP builder entry), SOP review queue, cross-team chat reviews |

**Header utilities (not nav):** Shift presence bar · Account (`/account`) · Sign out

### Routes with no top-level nav

| Route | Gate | What it does |
|-------|------|--------------|
| `/chat-review` | Staff | Daily chat QA log (replace spreadsheet); link from My day tasks |
| `/admin/chat-reviews` | Admin / dept lead API | Cross-team chat review table |
| `/start-shift` | Staff | Shift start gate (redirects to `/` when already on shift) |
| `/onboarding` | Staff | Profile wizard; **no** `AssistantShell` header |
| `/login` | Public | Sign-in |
| `/account` | Staff | Profile / portal settings |
| `/trust` | Admin only | Red-team / trust status (no nav link) |
| `/resources`, `/resources/[slug]` | Assistant shell | HIPAA reference library for LMS — **legacy styling** (zinc/teal, dark-mode classes); not linked from nav |

---

## 2. Overlap & naming confusion

### Workspace vs Practice vs Learn vs Level Up vs Grow

| Name in product | Where it appears | Points to | Problem |
|-----------------|------------------|-----------|---------|
| **Workspace** | Top nav | `/grow` | Sounds like “where I work”; actually a **learning + SOP hub** |
| **Learn & stay engaged** | `/grow` H1 | Same | Conflicts with nav **Learn** → `/training` |
| **Practice** | Top nav | `/level-up` | Reasonable label, but page says **Level Up** |
| **Level Up** | Page title, links | `/level-up` | Same surface as nav **Practice** |
| **Learn** | Top nav | `/training` | HIPAA cert only — doesn’t include Practice |
| **Grow** | Route prefix `/grow/*`, brand “Work · Learn · **Grow**” | SOPs + builder | **Never appears in nav**; staff see “Workspace” instead |
| **Today’s learning** | My day section | Links to `/level-up` | Third doorway into drills |
| **Practice library** | `/grow` section | Anchor links to `/level-up#…` | Duplicates **Practice** nav |

**Conceptual map today (staff mental model):**

```text
My day ──tasks──► work
Ask ───────────► help desk
Learn ─────────► HIPAA LMS (/training)
Practice ──────► drills (/level-up)
Workspace ─────► ??? hub that repeats Learn + Practice + SOPs
Memory ──────────► company knowledge (often hidden)
Team ────────────► presence
/grow/sops ──────► SOP drafts (not in nav; reached via Workspace)
/chat-review ────► QC (not in nav; reached via My day)
```

**Duplication severity:** **High** among Workspace, Learn, and Practice — three nav items for two learning jobs (compliance LMS vs daily drills) plus a third hub that re-links both.

**SOP / knowledge split:** Department SOP workspace (`/grow/sops`) and SOP builder (`/grow/sop-builder`) live under **Grow/Workspace**, while decision log and promoted knowledge live under **Memory → Knowledge**. Same architecture, two doorways.

---

## 3. Visual / styling systems (count)

**Single token source:** `src/app/globals.css` (`:root` CSS variables + `@theme inline` for Tailwind v4). **No** separate `tailwind.config.js`; spacing/radius mostly ad hoc in components.

| # | System | Primary signals | Used by |
|---|--------|-----------------|---------|
| **A** | **Siya core tokens** | `--siya-primary` navy, `--siya-accent` teal, cream page, stone text, `rounded-2xl` cards, Poppins headings | My day, Ask (normal), Team, Grow, Level Up, most companion pages |
| **B** | **LMS kit (`training-ui.tsx`)** | Same tokens, formalized: `TrainingBtnPrimary` (accent), `TrainingBtnNavy`, `TrainingCard`, `TrainingInput`, focus rings, `rounded-xl` buttons | `/training`, modules, quiz, login, SOP builder, chat review (partial), admin panels (~20 files import) |
| **C** | **Executive / Founder violet** | `violet-200/700`, `bg-gradient-to-b from-violet-50`, `bg-violet-700` CTAs | `FounderCoachPanel`, `ExecutiveBriefingPanel`, legacy admin briefing on My day |
| **D** | **SOP-lead violet notices** | `border-violet-200`, `bg-violet-50`, `bg-violet-900` buttons | `MySopOwnershipNotice`, `SopLeadMyDayCard` on My day / Grow |
| **E** | **Focus / presence violet** | `border-violet-300`, `text-violet-900`, presence pill ring | HomeHub focus mode, Ask focus header, `ShiftPresenceBar` focus state |
| **F** | **Semantic status (shared)** | Amber (warn/open/break), emerald (closed/success), sky (observe-only), red (quiz wrong) | Chat reviews, Founder Coach observe/drift, shift break, quizzes — **acceptable** if tokens later replace raw Tailwind |
| **G** | **Resources legacy** | `zinc-*`, `teal-600`, `dark:` variants | `/resources/*` only — **orphan palette**, predates Siya tokens |

**Distinct “themes” for consolidation purposes: 5** (A + B are same colors but different component discipline; C + D + E are overlapping violet forks; G is legacy).

**Spacing / radius drift (same theme, inconsistent craft):**

- Page width: `max-w-lg` | `max-w-2xl` | `max-w-3xl` | `max-w-4xl` per module
- Section gap: `space-y-6` | `space-y-8` | `space-y-10`
- Button radius: `rounded-lg` | `rounded-xl` | `rounded-2xl`
- Primary CTA: teal accent | navy primary | `violet-700` | gray subtle — **four meanings**

---

## 4. Shared component library — what exists vs per-section

| Layer | Exists? | Location | Adoption |
|-------|---------|----------|----------|
| Design tokens | **Yes** | `globals.css` | Wide for colors; radius/spacing not tokenized |
| Buttons / links | **Partial** | `training-ui.tsx` | LMS, admin, some ops — **not** My day, Founder Coach, Memory, Level Up |
| Cards | **Partial** | `TrainingCard` + copy-paste `rounded-2xl border…` | Every companion module reimplements |
| Inputs | **Partial** | `TrainingInput` | Chat review mixes `TrainingInput` + raw inputs in one form |
| Page header | **No** | — | Each page own H1 + back link pattern |
| Tabs | **No** | — | Memory, Founder Coach, admin each roll own tab pills |
| Badges | **No** | — | Inline Tailwind per feature (tasks, memory L1–L3, chat status) |
| Loading | **Partial** | `SiyaLoadingScreen` (full page) + `"Loading…"` text everywhere else | — |
| Nav | **Yes** | `AssistantShell` + `PortalNavLink` | Single shell; labels inconsistent |

**Verdict:** One shell, **one partial primitive file** (`training-ui.tsx`), **no** shared page-level components. Clinical/Ask, Learning, Founder, Memory, and Practice each implement cards/buttons locally with similar but not identical classes.

---

## 5. Proposed consolidation map (Phase 1 — **for sign-off**)

Working proposal aligned to your brief; adjustments from audit in **Notes** column.

| Current nav / route | What it does today | Overlap issue | **Proposed top-level** | **Proposed route** | Phase 1 changes | **Untouched (functionality)** |
|---------------------|-------------------|---------------|------------------------|--------------------|-----------------|-------------------------------|
| **My day** `/` | Tasks, focus, coach, Ask entry | Chat review buried | **My day** | `/` | Stronger entry link/copy for Chat review; no feature adds | Tasks, focus, Founder Coach content, shift states |
| **Workspace** `/grow` | Learning/SOP hub | Duplicates Learn + Practice | **Remove from top nav** | `/grow` → **301 redirect** to `/learn` | Retitle hub; fold GrowHub tiles into Learn landing | Stats tiles, copy, links (re-parent only) |
| **Practice** `/level-up` | Daily drills | vs nav **Learn**, vs Workspace drills list | **Learn** (sub-nav or sections) | `/learn/practice` (+ redirect from `/level-up`) | Single nav item **Learn**; page title unified to **Practice** or **Daily practice** | `LevelUpHub` and all drills |
| **Learn** `/training` | HIPAA LMS | vs Workspace HIPAA tile | **Learn** | `/learn` hub + `/learn/training` or keep `/training` | Learn landing = cert progress + link to practice; optional redirect `/training` → `/learn/training` | Modules, quiz, cert, sidebar LMS |
| `/grow/sops` | SOP workspace | vs Memory Knowledge | **Memory** (or **Knowledge**) | `/memory/knowledge/sops` or `/knowledge/sops` | Move nav entry under Memory; redirect old URL | `SopWorkspace` |
| `/grow/sop-builder` | AI SOP wizard | Same | **Memory** sub-route (or Admin for queue only) | `/memory/knowledge/sop-builder` (+ redirect) | Link from Knowledge tab + admin templates | Wizard, review queue unchanged |
| **Ask** `/help` | Siya Assist | — | **Ask** | `/help` (optional alias `/ask` → `/help`) | Label only unless alias desired | Chat, retrieval, escalation |
| **Memory** `/memory` | 4-layer knowledge | SOPs elsewhere | **Memory** or **Knowledge** | `/memory` (enable when ready) | Add SOP workspace + builder links inside Knowledge tab | Tabs, decision log, policies |
| **Team** `/team` | Presence, handoffs | Chat admin separate | **Team** | `/team` | Optional: lead link to chat review admin | Pulse, handoffs |
| `/chat-review` | Staff chat QA | Not in nav | **My day** entry (no top nav) | `/chat-review` | Back link → My day; listed on My day | Form, list, status toggles |
| `/admin/chat-reviews` | Cross-team QA | — | **Admin** or **Team** (lead) | keep or `/team/reviews` | Founder call: admin-only vs lead on Team | Admin table |
| **Admin** `/admin/*` | Ops consoles | — | **Admin** | `/admin/*` | No scope change | Tasks, team, templates, SOP review |
| `/start-shift`, `/onboarding`, `/account`, `/login` | Gates / utilities | — | **Unchanged** | same | — | Flows |
| `/trust` | Admin trust | — | **Hidden admin** | `/trust` | — | — |
| `/resources/*` | LMS references | Legacy UI | **Under Learn** | `/learn/resources` (+ redirect) | Phase 2: restyle to Siya tokens | Content |

### Proposed top nav after Phase 1 (staff view)

```text
My day · Ask · Learn · Memory · Team     (+ Admin if admin)
```

**Memory** omitted in production until flag enabled — same as today, but label/route ready.

**Count:** 8 nav items → **5** (+ Admin).

---

## 6. Phase 2 preview (tokens — **not started**)

For sign-off context only; execution waits until Phase 1 lands.

| Action | Detail |
|--------|--------|
| **One token file** | Extend `globals.css` with spacing scale, radius scale, semantic status vars (amber/emerald/sky as `--siya-status-*`) |
| **One button/card/input set** | Promote `training-ui.tsx` → `src/components/ui/` (or rename) as mandatory primitives |
| **Remove violet executive theme** | `FounderCoachPanel`, `ExecutiveBriefingPanel`, SOP-lead notices → core tokens; **content unchanged** |
| **Focus mode** | Keep state distinction via border/label, not parallel purple system — use `--siya-primary` or accent |
| **Apply order** | My day → Ask → (report) → Learn → Memory → Team → Admin |
| **Out of scope** | Animation, brand/magazine layout, new widgets |

---

## 7. Decisions needed before Phase 1

1. **Top nav label:** **Memory** vs **Knowledge** (internal doc says “Memory”; your brief says “Memory / Knowledge”).
2. **Learn URL shape:** `/learn` hub + keep `/training` with redirect, vs rename routes to `/learn/training` and `/learn/practice`.
3. **SOP routes under Memory:** `/memory/knowledge/sops` vs flat `/knowledge/sops`.
4. **Memory flag:** Enable nav in prod as part of consolidation, or keep hidden until content ready.
5. **Founder Coach on My day:** Stay on My day (content) while violet chrome removed in Phase 2 — confirm.

---

**Phase 0 complete. No code changed. Awaiting founder sign-off on Section 5 table before Phase 1.**

---

## Phase 1 — Implemented (August 2026)

- Top nav: **My day · Ask · Learn · Memory* · Team** (+ Admin)
- `/learn` landing (`LearnHub`), `/learn/practice` (`LevelUpHub`, H1 **Practice**)
- Permanent redirects in `next.config.ts`: `/grow` → `/learn`, `/level-up` → `/learn/practice`, `/grow/sops` → `/memory/knowledge/sops`, `/grow/sop-builder` → `/memory/knowledge/sop-builder`, `/learn/training` → `/training`
- SOP routes accessible at `/memory/knowledge/*` even when Memory nav flag is off
- Internal links updated; old page files removed (redirects only)

\*Memory nav still gated by `NEXT_PUBLIC_SIYA_PORTAL_MEMORY_ENABLED`.

**Phase 2 (tokens) not started.**
