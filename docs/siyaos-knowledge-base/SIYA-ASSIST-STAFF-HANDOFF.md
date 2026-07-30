# Siya Assist (Staff Help Desk) — Comprehensive Handoff

```text
Document type: Internal handoff
Audience: Staff, authors, engineers, leadership
Date: 2026-07-28
Status: Living summary — code/docs in repo are source of truth if this drifts
Canonical staff URL: https://siya-staff-assist.vercel.app
```

---

## 1. One sentence

**Siya Assist** is the internal AI help desk: one chat that routes staff questions to the right department, answers from approved company memory, and escalates when needed.

It is **not** the patient website bot, **not** an ERP, **not** a clinician, and **not** open-internet ChatGPT with company secrets.

---

## 2. Naming freeze (read before everything else)

Two bots. Two audiences. Do not mix them.

| Label | Product name | Audience | Code today | Live URL | Knowledge |
|-------|--------------|----------|------------|----------|-----------|
| **Internal bot** | **Siya Assist** (also: Siya Helpdesk Internal) | Staff (Siya Health US + Amcare India) | `apps/hipaa-training` | https://siya-staff-assist.vercel.app | `docs/siyaos-knowledge-base/` |
| **External bot** | **Siya Guide** | Patients / public | `apps/siya-assistant` *(legacy folder name)* | https://siya-guide.vercel.app | Public site KB only |

**Critical trap:** The folder `apps/siya-assistant` is **Guide (patients)**, not Assist (staff).

| Say | Mean |
|-----|------|
| Assist / Internal bot / Staff help desk | This product |
| Guide / External bot | Patient chatbot |
| SiyaOS (UI brand in portal) | Staff portal brand — still the Assist product |
| Company Siya OS | How departments run (ops architecture docs) |
| Product SiyaOS | Clinical OS product thesis (seed/YC) — **different** from Assist |

Frozen naming doc: `docs/BOT-NAMING-FREEZE.md`

---

## 3. Why we built it

### Problem
Staff answers lived in Slack, Drive, WhatsApp, hallway questions, and founder memory. That does not scale, is not auditable, and creates inconsistent ops.

### Goal
Make it easier to ask **Siya Assist** than to hunt five channels — for approved SOPs, who-owns-what, and escalation with context.

### Product bar (v1)
If employees start here and get measurably faster answers from **approved** knowledge, the product is working. Dashboards, ERP modules, and multi-app suites are out of scope unless explicitly approved.

### Design principles
1. **One doorway** — chat first; portal surrounds it; not 74 nested menus.
2. **Approved memory only** — live KB topics, not the open web as policy.
3. **Route → follow-ups → retrieve → answer or escalate** — deterministic v1, no agent loops.
4. **Unknowns improve the KB** — knowledge gaps become the documentation roadmap.
5. **Safety first** — no PHI in chat; no clinical/legal/refund decisions by the bot.
6. **~8 departments max** for routing — Accounts, HR, Marketing, Clinical Operations, Compliance, Technology, Leadership, General.

Product definition: `docs/siyaos-knowledge-base/PRODUCT.md`  
Agent rule: `.cursor/rules/siya-assist-product-alignment.mdc`

---

## 4. Where we are now (Jul 2026)

| Dimension | State |
|-----------|--------|
| Release level | **Internal Preview · v0.1-alpha** (not general staff production) |
| Deploy | Live at **siya-staff-assist.vercel.app** |
| Core loop | Working: route → retrieve live topics → compose → optional LLM → escalate / gap notify |
| Portal shell | Growing around Ask: Home, Training (HIPAA LMS), Level Up, Grow, shift rituals, admin invites |
| Company memory | ~22 `status: live` topics/decisions; many modules still stub/seeded |
| Safety | PHI / clinical / emergency guards; staff red-team + CI workflow |
| LLM | Optional phrasing over retrieved chunks; can force retrieval-only |
| Metrics | Mostly client `localStorage`; Postgres later |
| Gate | Automated deploy gate may stay “red” until KB content score improves |

---

## 5. What we have built

### 5.1 Application (staff)

**Edit only here:** `apps/hipaa-training/`  
**Thin Vercel project folder:** `apps/siya-staff-assist/` (config/README — no main app code)  
**Package:** `@amcare/hipaa-training`

| Surface | Route | Purpose |
|---------|-------|---------|
| Home hub | `/` | “My day” employee hub |
| **Ask (help desk)** | `/help` | Main Assist chat |
| Training | `/training` … | HIPAA LMS |
| Level Up / Grow | `/level-up`, `/grow` | Practice / growth |
| Shift | `/start-shift` … | Shift ritual |
| Admin team | `/admin/team` | Invites / roles |
| Trust | `/trust` | Leadership / gate status |
| Login / onboarding | `/login`, `/onboarding` | Access |

#### Executive Workspace (founder lane on My day)

| Spec | Path |
|------|------|
| v1 (shipped baseline) | `apps/hipaa-training/docs/EXECUTIVE-WORKSPACE-v1.md` |
| **v2 architecture (build toward)** | `apps/hipaa-training/docs/EXECUTIVE-WORKSPACE-v2-FOUNDER-DECISION-COACH.md` |
| Cursor agent rule | `.cursor/rules/siya-executive-founder-coach.mdc` |

**v2:** Founder Decision Coach — one Focus decision · Can Wait · Delegate · Emerging Risks · attention budget. Optimizes Orientation → Decision → Delegation. **Not** a dashboard/ERP. Agents must read v2 before implementing executive/My day admin features.

### 5.2 Brain (runtime)

Path: `apps/hipaa-training/src/lib/siya-os/`

```text
Staff message
  → phi-guard (PHI / clinical / emergency)
  → vague clarify (optional)
  → flows.routeIntent (8 departments + task follow-ups)
  → retrieval (compiled WORKSPACE_KB from live markdown)
  → filter staff-facing chunks (hide meta unless asked)
  → composeAnswerFromChunks (deterministic)
  → optional synthesizeWorkforceAnswer (LLM if enabled)
  → sources + escalationPreview + knowledgeGap
```

| Module | File | Role |
|--------|------|------|
| Orchestrator | `engine.ts` | End-to-end pipeline |
| Departments | `departments.ts` | Frozen 8 departments |
| Flows | `flows.ts` | Task flows + follow-ups + retrieval boosts |
| Retrieval | `retrieval.ts` | Search over compiled KB |
| Compose | `compose-answer.ts` | Deterministic answers + escalation preview |
| LLM | `llm-answer.ts` / `model.ts` | Grounded phrasing; env toggles |
| System prompt | `system-prompt.ts` | Workforce persona |
| PHI guard | `phi-guard.ts` | Pre-LLM refusals |
| Staff voice | `staff-voice.ts` | No path/git/WorkDrive lectures to staff |
| Config / URL | `config.ts`, `public-url.ts` | Opening copy; canonical URL |
| Escalation | `escalation.ts`, `escalation-email.ts` | Owners + optional Resend |
| Gaps / metrics | `knowledge-gap.ts`, `metrics.ts` | Gap notify + local metrics |
| Brand | `brand.ts` (sibling) | SiyaOS naming, Internal Preview, PHI footnote |

**API:** `apps/hipaa-training/src/app/api/chat/route.ts`  
Also: knowledge-gap, assist-feedback, admin invite-email, level-up event.

**KB compile:** `scripts/build-workspace-kb.mjs` → `src/content/workspace-kb.generated.ts` (runs on `prebuild`).

### 5.3 Company memory (what the bot knows)

**Path:** `docs/siyaos-knowledge-base/`

| Layer | What | Who uses it |
|-------|------|-------------|
| Live topics + decisions | Markdown with `status: live` | Assist retrieval after `kb:build` |
| Siya OS Architecture | Company blueprint; Marketing = first mature dept module | Authors / leadership |
| Marketing OS v1.0 | Frozen marketing department manual | Marketing routing background |
| WorkDrive drafts | Editorial / ops drafts until promoted to git `live` | Authors only — not live retrieval |

Lifecycle: `draft` → `review` → `live` (compiled). Ideas / `bot_retrieve: false` excluded.

Important topics:
- `09-ai-strategy/topics/internal-assistant-guardrails.md`
- `09-ai-strategy/topics/siya-helpdesk-assistant-persona.md`
- `09-ai-strategy/topics/company-memory-workdrive-index.md`
- Ops / compliance / marketing staff help / content QA / escalation pathways / pricing canonical

Parent blueprint: `docs/siyaos-knowledge-base/SIYA-OS-ARCHITECTURE.md`  
Architecture diagram: `docs/siyaos-knowledge-base/ARCHITECTURE.md`

### 5.4 Departments (routing only)

1. Accounts  
2. HR  
3. Marketing  
4. Clinical Operations  
5. Compliance  
6. Technology  
7. Leadership  
8. General  

Example flows: reimbursement, marketing-daily, marketing-carousel, clinical-refill, compliance-privacy, tech-access, hr-general, leadership-decision, …

### 5.5 Guardrails (non-negotiable)

1. Answer from **live** company memory (not open web as policy).  
2. **No PHI** in chat (names, DOB, MRN, SSN, chart detail) — refuse.  
3. **No clinical advice** / dosing / prescribing — refuse; route to clinician workflow.  
4. **Emergency** language → 911 / local emergency.  
5. **No refund / billing exception promises** without billing lead.  
6. Conflicts → state conflict + escalate; don’t silently pick a winner.  
7. Staff voice: no architecture lectures (paths, git, WorkDrive).  
8. Keep separate from public **Siya Guide**.  
9. Optional LLM only **phrases retrieved chunks** — does not invent policy.

### 5.6 Deploy & CI

| Item | Value |
|------|--------|
| Bookmark URL | https://siya-staff-assist.vercel.app |
| Vercel project | `siya-staff-assist` |
| Root config | `vercel.siya-staff-assist.json` |
| Build | From monorepo root: `npm run build -w @amcare/hipaa-training` |
| CI | `.github/workflows/siya-staff-safety.yml` (red team + build) |
| Legacy URLs | Old `hipaa-training-*.vercel.app` — do not bookmark for staff |

Example prod deploy:
```bash
npx vercel deploy --prod --yes --project siya-staff-assist --local-config vercel.siya-staff-assist.json
```

### 5.7 Environment variables (documented)

| Variable | Purpose |
|----------|---------|
| `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` | LLM |
| `SIYA_WORKFORCE_USE_LLM=0` | Force retrieval-only |
| `SIYA_WORKFORCE_MODEL` | Model override |
| `NEXT_PUBLIC_SIYA_ASSISTANT_URL` | Canonical staff URL override |
| `NEXT_PUBLIC_SIYA_OS_*_CONTACT` | Escalation contact strings |
| `RESEND_API_KEY`, `SIYA_ESCALATION_*`, `SIYA_INVITE_FROM` | Email notify / invites |
| `NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN` | Optional force login |

Docs: `apps/hipaa-training/docs/ADD-AI-KEY-VERCEL.md`, `ESCALATION-EMAIL.md`, `INVITE-AND-RESEND-SETUP.md`

### 5.8 Scripts (staff app)

| Command | Purpose |
|---------|---------|
| `npm run dev:hipaa-training` | Local staff app |
| `npm run kb:build -w @amcare/hipaa-training` | Compile company memory |
| `npm run red-team:staff` / `staff:red-team` | Staff safety suite |
| `npm run gate:deploy` / `staff:gate` | Deployment gate |
| `trust:compute` | Trust page status |

**Do not confuse** with Guide scripts under `apps/siya-assistant` (`test-guide-v1`, Guide red-team, etc.).

---

## 6. What we deliberately did *not* build

- Patient Guide features inside Assist  
- ERP / EMR / SAP-style modules as the primary UX  
- Bot that decides clinical care, legal outcomes, or refunds  
- Ingesting raw Drive dumps without owner / status / review metadata  
- Merging public website KB into internal company memory without owners  
- “AI-powered” marketing theater as the product story  

---

## 7. How staff should use it

1. Bookmark **https://siya-staff-assist.vercel.app**  
2. Use **Ask (`/help`)** for SOPs, owners, process questions  
3. **Never paste patient identifiers / PHI** into chat  
4. Use **Training** for HIPAA learning; use Ask for “how do we do X?”  
5. If no answer: use **Notify owner / escalate** — that improves the KB  
6. Treat answers as **Internal Preview** until leadership raises release level  
7. For clinical questions about a real patient: use clinical systems + licensed clinicians — not Assist  

---

## 8. How authors / engineers should develop it

### Authors (knowledge)
1. Add or edit markdown under `docs/siyaos-knowledge-base/**/topics/` (or `decisions/`).  
2. Set metadata: `status: live`, owner, review date, `bot_retrieve` as appropriate.  
3. Run `kb:build` (or full app build).  
4. Test the question in `/help`.  
5. Do not treat WorkDrive drafts as live until promoted to git with `live`.  

### Engineers (app)
1. Change code only in `apps/hipaa-training`.  
2. Keep pipeline deterministic for v1 core path.  
3. Run `red-team:staff` before widening access.  
4. Never put workforce API keys on Guide / public site projects.  
5. Respect product-alignment rule: push back on ERP scope creep.  

### Key docs for builders
- `apps/hipaa-training/README.md`  
- `apps/hipaa-training/docs/STAFF-URL.md`  
- `apps/hipaa-training/docs/PORTAL-VISION.md`  
- `apps/hipaa-training/docs/DEPLOYMENT-GATE.md`  
- `apps/hipaa-training/docs/RELEASE-LEVELS.md`  
- `apps/hipaa-training/docs/HOW-TO-RUN-TESTS-NOOB.md`  

---

## 9. Contrast: Siya Guide (patients) — do not edit for Assist work

| | Assist | Guide |
|--|--------|-------|
| Folder | `apps/hipaa-training` | `apps/siya-assistant` |
| Engine | `src/lib/siya-os/` | `lib/guide-engine.ts` |
| Guards | `phi-guard.ts` + persona | `lib/guardrails.ts` |
| Knowledge | Company memory markdown | `data/public-kb.json` + entities |
| CTAs | Internal escalation | `link-registry.ts` public CTAs only |

---

## 10. Gaps / WIP / known risks

| Gap | Note |
|-----|------|
| Internal Preview only | Not “all staff production” yet |
| Thin KB in many modules | HR / Growth / etc. still stub — gaps are expected |
| Content gate score | Deploy gate may fail until ~80 content score |
| Metrics storage | localStorage → need durable backend later |
| Dual Vercel naming | Docs still mention `hipaa-training` project history |
| Portal expansion | Hub / LMS / Level Up beyond pure chat — keep Ask as the help-desk core |
| Pricing conflicts | Some legacy pricing topics unresolved — escalate, don’t invent |
| Founding / product SiyaOS | Seed narrative and clinical product are adjacent strategy — not this app’s code |

---

## 11. Adjacent work (context for handoff — not Assist code)

Useful so newcomers don’t confuse threads:

| Workstream | What / where | Relation to Assist |
|------------|--------------|--------------------|
| Marketing OS v1.0 frozen | `docs/siyaos-knowledge-base/05-marketing-os/` + WorkDrive `00-Brand-System/Siya-OS/` | Feeds Marketing department answers; company OS module |
| Siya OS Architecture | `docs/siyaos-knowledge-base/SIYA-OS-ARCHITECTURE.md` | Assist is the **product doorway** into company memory |
| Seed / SiyaOS clinical product | WorkDrive `Seed Round/` (V6 deck, YC master doc) | Different product thesis; naming collision — keep separate |
| YC this cycle | **Passed** — not rushing 48h application | Free capacity for website KA / reputation / Assist KB |
| Entity + IP map (ISB Step 1) | `Seed Round/Notes/ISB-Healthcare-Management/STEP-1-ENTITY-IP-MAP.md` | Diligence; not Assist runtime |
| Patient site / Guide | `apps/siya-health`, `apps/siya-assistant` | Public layer only |

---

## 12. Success metrics (product, not model benchmarks)

From `PRODUCT.md` — track these, not “AI vibes”:

1. **Adoption** — employees start in Assist instead of Slack/Drive first  
2. **Time-to-answer** — faster than hunting channels  
3. **Escalation quality** — context-filled handoffs  
4. **Knowledge gaps closed** — unknown → live topic rate  

Audits program: `docs/siyaos-knowledge-base/AUDIT-PROGRAM.md`

---

## 13. Immediate next priorities (recommended)

1. **Grow live KB** where staff actually ask (close gaps from Notify owner).  
2. **Keep release Internal Preview** until red-team + content gate + named tester cohort pass.  
3. **Website knowledge architecture** (marketing) — separate workstream; improves patient trust, not Assist code.  
4. **Do not** invent five empty department OS manuals before real SOPs exist.  
5. **Do not** merge Guide and Assist.  

---

## 14. Quick reference card

```text
Product:     Siya Assist (Internal help desk)
URL:         https://siya-staff-assist.vercel.app
Code:        apps/hipaa-training
Brain:       apps/hipaa-training/src/lib/siya-os/
Memory:      docs/siyaos-knowledge-base/  (status: live → kb:build)
Ask UI:      /help
NOT:         apps/siya-assistant (that is Siya Guide / patients)
NOT:         ERP, clinician, refund decider, open-web GPT
Release:     Internal Preview v0.1-alpha
```

---

## 15. Contact / escalation pattern

- Bot shows escalation preview with department owner contacts (env-configured).  
- Optional Resend email for gaps / escalations when keys configured.  
- Clinical / PHI / emergency: refuse in-bot; use real clinical and emergency channels.  

Owner strings: `NEXT_PUBLIC_SIYA_OS_*_CONTACT` and escalation docs under `apps/hipaa-training/docs/`.

---

*End of handoff. Prefer repo docs if this summary and code diverge.*
