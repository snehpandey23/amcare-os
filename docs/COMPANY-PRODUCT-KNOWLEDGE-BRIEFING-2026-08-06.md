# Company & Product Knowledge Briefing

**Purpose:** One-time onboarding synthesis of what exists in the `amcare-os` workspace as of **2026-08-06**.  
**Not** a continuously updated master document. Treat **Ask**, the **Knowledge SOP workspace**, and the **compiled company KB** as the live sources of truth going forward.

---

## Step 1 — Scope confirmation

### Is this one workspace or many repos?

**One monorepo.** Single Git repository:

| Fact | Value |
|------|--------|
| Repo | `amcare-os` (`https://github.com/snehpandey23/amcare-os.git`) |
| Package workspaces | `apps/*`, `integrations/*`, `packages/*` |
| Nested `.git` dirs | None (only root `.git`) |

Multiple Vercel *projects* deploy from this same repo (staff portal, auth API, patient site, Guide, prescription generator). That is multi-project hosting, **not** separate repositories.

**This briefing covers only what is in this monorepo.** It does **not** include:

- Zoho WorkDrive / TrueSync team folders (except where docs *point* at them)
- Klarity / Spruce / Zoho live product data
- Claude / Cursor chat history, meeting notes, or founder decisions that were never written into git or the portal SOP tables
- Secrets / production DB contents (SOP rows in Postgres could not be enumerated from this environment — DATABASE_URL is sensitive/masked)

---

### Distinct apps / products in the repo

#### Actively used Siya / AmCare surfaces (treat as “the company products”)

| Product (plain terms) | Code | Live URL (approx.) | Notes |
|----------------------|------|--------------------|--------|
| **Staff portal / Siya Assist** | `apps/hipaa-training` (deploy entry `apps/siya-staff-assist`) | [siya-staff-assist.vercel.app](https://siya-staff-assist.vercel.app) | My day, Ask, Learn (HIPAA), Memory, SOPs, Team, Admin |
| **Staff auth API** | `integrations/hipaa-training-api` | [siya-staff-auth-api.vercel.app](https://siya-staff-auth-api.vercel.app) | Login, tasks, SOP DB, builder sessions |
| **Patient website** | `apps/siya-health` | [www.siya.health](https://www.siya.health) / Vercel `siya-health` | Public SEO/content site (~223 HTML pages; answers + blog heavy) |
| **External bot — Siya Guide** | `apps/siya-assistant` | [siya-guide.vercel.app](https://siya-guide.vercel.app) | Patient-facing chat; **not** staff Assist |
| **Prescription generator** | `apps/prescription-generator` | Separate Vercel project (see app deploy docs) | Clinic letterhead / Rx PDF tooling |

#### Present in monorepo but largely legacy / scaffold / not current Siya ops focus

| Folder | Likely status |
|--------|----------------|
| `apps/staff-dashboard`, `patient-management`, `operations-hub`, `analytics-engine` | Early AmCare OS scaffolds (small codebases; root README still describes them as primary — **stale framing**) |
| `apps/oet-lms`, `apps/ai-scrum-master` | Separate product experiments |
| `apps/capr-emr`, `apps/capr-patient-portal` | EMR-related scaffolds |
| `apps/siya-health-rewrite` | Incomplete / empty of app source in tree |
| Many `integrations/*` (Zoho, Klarity, Stripe, Twilio, etc.) | Integration packages — maturity varies; not all wired to daily Siya staff UX |

**Naming freeze (important):**  
- **Siya Guide** = external / patient bot (`apps/siya-assistant`).  
- **Siya Assist** = internal staff help desk (staff portal Ask).  
Do not say “Siya Assistant” alone — see `docs/BOT-NAMING-FREEZE.md`.

---

## Step 2 — Inventory of documentation already in-repo

### A. Root architecture / setup (older AmCare framing)

- `README.md`, `ARCHITECTURE.md`, `INTEGRATION_ARCHITECTURE.md`, `DEPLOYMENT.md`, `SETUP.md`, `QUICK_START.md`, `CURSOR_PROMPTS.md`, `README_INTEGRATIONS.md`
- `vercel.README.md` — **current** multi-project deploy map (prefer this over root README for “what we ship”)

### B. Company memory KB — `docs/siyaos-knowledge-base/`

Authoring + compile source for **staff Ask** retrieval (`npm run kb:build` → `apps/hipaa-training/src/content/workspace-kb.generated.ts`).

| Area | Status in practice |
|------|-------------------|
| **28 topic markdown files** under numbered modules | All sampled topics marked `status: live` |
| **31 compiled Ask topics** (incl. decisions) | Live in staff build |
| `manifest.json` module list | **20 modules planned**; many still `stub` / `seeded` with incomplete topic coverage |
| Marketing OS | Most mature dept manual: `05-marketing-os/MARKETING-OS-v1.0.md` (frozen) + `v1.1.md` |
| Decisions | 3 files: homepage CTA, Marketing OS freeze, agent org chart deferred |
| Audits | Persona scripts + `audits/score-log.md` (one baseline row 2026-07-26) |
| Placeholders | `SEED-DECK-V8-PLACEHOLDER.md`, executive state notes |

**Manifest statuses (20 modules):**

| Status | Modules |
|--------|---------|
| **live** | 11 Operations · 13 Legal/Compliance |
| **seeded** | 04 Clinical Ops · 05 Marketing · 08 Technology · 09 AI Strategy · 18 Brand |
| **stub** (little/no folder content) | 01 Executive Vision\* · 02 Company Structure · 03 Culture · 06 Growth · 07 Product Vision · 10 HR\* · 12 Finance\* · 14–17 journeys/research · 19 History · 20 Roadmap |

\*Folders exist with some topic files even when manifest still says stub/seeded — prefer topic `status: live` + Ask compile over the module badge alone.

### C. Staff portal docs — `apps/hipaa-training/docs/`

Operational product docs (deploy gates, portal vision, Executive Workspace v1/v2, QA, invite setup, SiyaOS principles, chat review, etc.). Useful for engineers/admins; not the same as patient-facing content.

### D. Patient site docs — `apps/siya-health/docs/`

Large set of SEO, content architecture, provider, compliance, and sprint reports. Editorial / brand OS under `apps/siya-health/brand/` (VISUAL-OS, editorial packs, statics, WorkDrive sync habits).

### E. Workflows / compliance misc — `docs/workflows/`, `docs/compliance/`, `docs/api-specs/`

Thin relative to marketing/site docs; includes daily-tasks notes and marketing ops SOP pack pointers.

### F. Knowledge SOP library (`siya_sops` in Postgres)

**Live system:** Staff portal → Memory → [Department SOPs](https://siya-staff-assist.vercel.app/memory/knowledge/sops) (+ Admin SOP review).  
**Checklist builder:** [SOP Builder](https://siya-staff-assist.vercel.app/memory/knowledge/sop-builder).

This briefing **cannot** export live/pending SOP titles from the database from this environment (credentials masked). Statuses in code include: `draft`, `needs_review`, `pending_review`, `live` (plus builder session statuses such as `in_progress`, `draft_ready`, `submitted`, `published`).

**Action for onboarding owner:** Log into the staff portal as admin and paste a one-page inventory (titles × department × status) into WorkDrive or a dated appendix if needed — do not treat this markdown as that inventory.

---

## Step 3 — Company & Product Knowledge Briefing

### 1. Product / company overview (plain terms)

**Siya Health** is a physician-led, cash-pay telehealth practice (Adult ADHD and related care lines; licensed states include CA, TX, PA, FL per internal marketing/CMO rules). Patients discover care via the **public website** and often via **Klarity** as a booking/EHR channel; staff run visits and messaging with tools such as Klarity, Spruce, Zoho.

**What employees use day-to-day**

1. **Staff portal (SiyaOS / Siya Assist)** — Sign in → My day (tasks, presence) → **Ask** (internal help desk chat) → Learn (HIPAA training) → Memory / Knowledge SOPs → Team / Admin as role allows.  
2. **Ask** answers from approved **company KB topics** + **published department SOPs**, with escalation when knowledge is missing.  
3. **SOP Builder** — Interview → operational checklist drafts for My day-style work.  
4. **Department SOPs** — Longer policy-style prose SOPs for Ask retrieval after admin publish.

**What patients / public see**

1. **siya.health** — Marketing and education site (care pages, answers, blog).  
2. **Siya Guide** — Website chatbot that only uses **public** knowledge (not internal SOPs).

**Adjacent internal tool**

- **Prescription generator** — Separate small app for Rx / letterhead workflows.

**Company operating idea (docs)**

- **Siya OS** = how the *company* is organized (department modules: Marketing OS first mature).  
- **SiyaOS** (product sense) = clinical / care product roadmap language — do not conflate with the staff portal nickname.

### 2. Tech architecture summary (high level)

```text
Git monorepo: amcare-os
├── Staff Next.js app (hipaa-training) ──► Vercel siya-staff-assist
├── Staff Express/API (hipaa-training-api) + Postgres ──► Vercel siya-staff-auth-api
├── Patient static/HTML site (siya-health) ──► Vercel siya-health / www.siya.health
├── Patient Guide (siya-assistant) ──► Vercel siya-guide
└── Shared packages + many optional integrations
```

- Staff Ask retrieval: markdown KB → `kb:build` → generated TS index + DB SOPs at runtime.  
- Staff LLM: Vercel AI Gateway (workforce model env).  
- Staff production deploys: **local CLI script** (`scripts/deploy-staff-portal.sh`); git auto-deploy intentionally skipped for staff projects.  
- Patient Guide KB is **separate** from internal company memory (governance / public graph).

### 3. What SOPs / knowledge already exist (pointers, not copies)

| Source of truth | Where to open it | What you’ll find |
|-----------------|------------------|------------------|
| **Ask (staff)** | [siya-staff-assist.vercel.app/help](https://siya-staff-assist.vercel.app/help) | Answers from compiled KB + live SOPs |
| **Knowledge SOP workspace** | [/memory/knowledge/sops](https://siya-staff-assist.vercel.app/memory/knowledge/sops) | Draft / submitted / live department policy SOPs |
| **Checklist SOP Builder** | [/memory/knowledge/sop-builder](https://siya-staff-assist.vercel.app/memory/knowledge/sop-builder) | Interview → checklist drafts |
| **Admin SOP review** | [/admin/sop-review](https://siya-staff-assist.vercel.app/admin/sop-review) | Publish / send-back |
| **Company KB source** | `docs/siyaos-knowledge-base/**/topics/*.md` | Authorable topics (28+) |
| **Compiled Ask index** | `apps/hipaa-training/src/content/workspace-kb.generated.ts` | 31 live entries as of this audit |
| **Marketing OS manual** | `docs/siyaos-knowledge-base/05-marketing-os/MARKETING-OS-v1.0.md` | Frozen dept operating manual |
| **Bot naming** | `docs/BOT-NAMING-FREEZE.md` | Guide vs Assist |
| **Patient content** | `apps/siya-health/` (+ brand packs) | Public site + editorial system |
| **Team editorial deliverables** | Zoho WorkDrive `Siya Knowledge Editorial/` | Carousels/statics (not in Ask unless promoted) |

**Compiled Ask topics (ids) as of this audit — 31:**  
`refill-pharmacy-staff-guidance`, `discovery-call-staff-billing`, `ma-platforms-zoho-spruce`, `ma-onboarding-field-lessons`, `escalation-pathways`, `klarity-billing-cancellation`, `klarity-previsit-checklist`, `patient-pricing-public-canonical`, `hipaa-breach`, `marketing-staff-daily-help`, `company-memory-workdrive-index`, `internal-assistant-guardrails`, `klarity-channel-overview`, `medical-compliance-marketing`, `siya-helpdesk-assistant-persona`, `billing-late-cancel`, `daily-payment-check`, `klarity-patient-consents`, `legacy-pricing-funnel-unresolved`, `third-party-caller`, `homepage-cta-meet-and-greet`, `chat-review-sla`, `telehealth-privacy-background`, `brand-entities-voice`, `marketing-os-v1-frozen`, `adhd-wellness-platform-vision`, `content-qa-checklist`, `hipaa-training-cert`, `agent-org-chart-deferred`, `amcare-os-overview`, `legacy-website-social-archive`.

### 4. Known gaps

| Gap | Evidence |
|-----|----------|
| Most Siya OS modules still **stub** in `manifest.json` | Company structure, culture, growth, patient/employer/provider journeys, research library, etc. |
| HR / Finance thin | 1 topic each despite stub lists for hiring, MSO, unit economics |
| Clinical refill “full playbook” incomplete | Topic itself says staff guidance **until** full playbook |
| **Legacy pricing / funnel conflicts** unresolved | Dedicated live topic `legacy-pricing-funnel-unresolved` — escalate, don’t invent |
| Root `README.md` describes old AmCare multi-app vision | Misleads newcomers vs current Siya staff/patient stack |
| Postgres SOP inventory not exportable here | Need admin portal dump for onboarding binder |
| WorkDrive / meeting / chat decisions outside git | Not searchable in Ask unless promoted to KB or SOP |
| Audit score log nearly empty | One V1 new-hire row (2026-07-26); content score was low then |
| Seed deck / investor narrative | Placeholders and superseded decks — confirm with founders before repeating numbers |
| Scaffold apps still in repo | Easy to confuse with live products |

### 5. How to find things going forward

1. **Day-to-day staff question** → [Ask](https://siya-staff-assist.vercel.app/help). If wrong/missing → escalate / notify owner / add a KB topic or SOP.  
2. **Write or update a procedure** → Knowledge SOP workspace or SOP Builder; admin publishes.  
3. **Author company memory** → edit `docs/siyaos-knowledge-base/…` with `status: live`, run `kb:build`, deploy staff portal.  
4. **Patient-facing claims / SEO** → `apps/siya-health/` + public governance — **never** copy internal SOP wording into Guide without public approval.  
5. **This briefing** → starting map only. Prefer live systems over re-reading this file months later.

---

## Found vs missing / stale (handoff checklist)

### Found (usable now)

- [x] Single monorepo with clear active Siya surfaces  
- [x] Bot naming freeze (Guide vs Assist)  
- [x] 28+ live KB topic files; 31 compiled Ask entries  
- [x] Marketing OS v1.0 frozen + Klarity/ops/clinical seed topics  
- [x] Staff portal + auth API + patient site + Guide deploy map  
- [x] Large patient-site doc/brand corpus  

### Missing or stale (worth filling before handing to a new hire)

- [ ] **Export live `siya_sops` inventory** (titles, dept, status) from Admin / SQL into a dated one-pager  
- [ ] Refresh or archive root `README.md` AmCare scaffold narrative  
- [ ] Populate stub modules that Ask already gets questions about (PTO/leave, reimbursement detail, full refill playbook, company structure)  
- [ ] Decide what WorkDrive + founder chat decisions must be **promoted** into git KB or portal SOPs  
- [ ] Re-run company-memory audits and update `audits/score-log.md`  
- [ ] Label scaffold apps (`staff-dashboard`, etc.) as legacy in a short `docs/REPO-MAP.md` if newcomers keep getting lost  

### Explicitly not pulled in (per brief)

Meeting notes, Claude/Cursor transcripts, and undocumented founder decisions **outside** this repo. If they should be searchable, export them into `docs/siyaos-knowledge-base/` or the Knowledge SOP system — do not assume Ask already knows them.

---

*Generated 2026-08-06 from repository inspection only. No auto-sync or regeneration pipeline was created.*
