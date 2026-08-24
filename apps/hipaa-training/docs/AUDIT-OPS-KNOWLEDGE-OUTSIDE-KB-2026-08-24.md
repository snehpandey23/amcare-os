# Audit — Operational knowledge outside staff KB (inventory only)

**Date:** 2026-08-24  
**Discipline:** Inventory only — do **not** auto-publish KB topics. Promote via normal Knowledge SOP / lead-admin review.  
**Out of scope (already audited tonight):** pricing / fees / Meet & Greet / no-show; Marketing Compliance / disciplinary; CPOM / compliance checklist.

**Sources:** [amcare-os docs sweep](6acc3c44-e3b5-45b8-9902-1ed862cc16da) · [siya-health sweep](b6011889-c803-411e-ab58-547799ec2451)

---

## Worth promoting first (P0)

### Staff portal / amcare-os — clinical & frontline

| Item | Where it lives | Why it matters for Ask |
|------|----------------|------------------------|
| CPM daily SLAs (pre-chart 15m, fax 2h, note lock 4h, EST↔IST day shape) | `docs/workflows/daily-tasks-workflow.md` (+ CPM SOW) | Staff ask “how fast must I…?” — only partial in `daily-payment-check` / `chat-review-sla` |
| Chat Review vs shift handoff (who may QC) | `apps/hipaa-training/docs/CHAT-REVIEW-AND-HANDOFFS.md` | Portal QC rules ≠ patient chat SLA topic |
| Post-visit follow-up cadence (Day 3/10, etc.) | WorkDrive clinical schedule (cited by refill topic) | Thin in live refill topic |
| Complicated-patient coverage map | WorkDrive clinical gap map | Escalation stubs Ask is not ready for |

### Staff portal — Assist process

| Item | Where | Why |
|------|-------|-----|
| Staff Day-1 chrome (shift / Ask feedback map) | `STAFF-DAY-1.md`, pilot guide | Operational process, not just persona |
| Notify owner / gap email routing | `ESCALATION-EMAIL.md` | Who digests what |
| IST ops day for presence / handoffs / chat review | `shift-dashboard.ts` | One-line facts staff need |

### Patient site (`apps/siya-health`) — staff talk-tracks missing

| Item | Where | Why |
|------|-------|-----|
| Not psychiatry / PCP-led ADHD positioning | `data/site-standards.mjs` `ADHD_POSITIONING` | “Are you psychiatrists?” |
| No controlled Rx at initial eval | `answers/what-happens-after-adhd-evaluation.html` | High-traffic post-visit |
| Workplace accommodations boundaries | `answers/adhd-workplace-accommodations.html` | Letters / employer outcome |
| License ≠ service (e.g. OH license / TX service) | Provider pages + `providers.mjs` | Reinforce vs facts chips |
| Entity Inc vs PLLC one-liner | `CANONICAL_ENTITY_STATEMENT` | Short legal-safe answer |
| Post-labs patient return scripts | `docs/POST-LABS-PATIENT-RETURN-COPY.md` | **Internal SOP only in public-site tree** |
| Claims register (same-week, volume, owners) | `docs/website-claims-register.md` | Ops/claims SoT — not patient dump |

---

## Do not promote — already live (code should defer)

| Item | Verdict | Evidence |
|------|---------|----------|
| Hostile / abusive patient | **Divergent duplicate**, not a new KB candidate | Live reviewed `siya_sops` `sop-1786241888864-djh6i5` (*SOP: Handling Verbally Abusive Patient Interactions*, Accounts, approved 2026-08-09). Opens as an MA procedure SOP (“Give Medical Assistants a clear, consistent procedure…”). Hardcoded `abusivePatientAnswer()` is a separate short 5-step chat script that still says to Notify owner for a fuller SOP. Engine short-circuits `clinical-ops-abusive-patient` **before retrieval** and sets `knowledgeGap: true`, so Ask never cites the live row. **Fix:** remove/bypass the hardcoded path so Ask uses the reviewed SOP; do not copy the fallback into git KB. |

---

## P1 — Promote when owners ready

| Area | Items |
|------|--------|
| Hours / contact | Facts `hours.hasFixedPracticeHours: false` + care@ / phone — **conflicts** with vision topic “defined business hours” → fix vision when writing hours topic |
| Licensed vs serviceable states | Facts-lookup already has states; short spoken FAQ wrapper optional |
| Leave/PTO + expense reimbursement | Layer-1 seeds / `law-store` — not live KB topics |
| Workplace concern (hostile coworker) | `workplaceConcernAnswer` |
| Marketing ops SOP pack drafts / India MA shift draft | `docs/workflows/marketing-ops-sop-pack.md`, WorkDrive ops drafts — after lead freeze |
| Remote ePHI workstation standards | WorkDrive compliance |
| Public FAQ depth | Meet & Greet expectations, screener vs eval, online Rx education — **maybe** (partially covered) |
| Capacity claims | “Often within 48 hours” / same-week — **maybe** (staff will echo ads) |
| Provider credentialing intake | `PROVIDER-INTAKE-FORM.md`, `internal-provider-records.mjs` — Clinical only, not patient Ask |

---

## Skip / later (dev, drafts, duplicate)

- Deploy / Vercel / invite admin mechanics  
- Brand editorial packs / SEO California checklists / phone-first UX  
- Compounded GLP-1 answer until Clinical writes formulary policy  
- Legal compliance review catalog (use live legal + site-standards)  
- Thanksgiving date math (calendar helper, not leave policy)  
- Integrations READMEs unless 24h unpaid cancel is confirmed real ops  
- Executive / Founder Coach docs for general staff KB  
- `siya-assistant` / `siya-health-rewrite` — no parallel SOP docs  

---

## Broken references

| Check | Result |
|-------|--------|
| Git `sources:` on live KB topics | Resolve |
| WorkDrive SiyaOS paths cited by topics | Present on TrueSync |
| Soft inconsistency | Vision “defined business hours” vs facts **no fixed practice hours** |

---

## Sister apps

| App | Finding |
|-----|---------|
| `apps/siya-assistant` | Patient Guide README only — no ops SOP markdown |
| `apps/siya-health-rewrite` | Shell assets — no docs |

---

## Suggested Knowledge SOP batch (human review, not auto-publish)

Installed as **`draft`** `siya_sops` + open `create_sop` tasks via `AUDIT_KNOWLEDGE_SOP_PACK` (auth API). Leads submit → `pending_review` → approve. **No auto-publish to live.**

| # | Draft title | Dept | Pack task id |
|---|-------------|------|----------------|
| 1 | Clinical Program daily SLAs (pre-chart, fax, note lock, ops day) | Clinical Operations | `task-pack-audit-cpm-daily-slas` |
| 2 | Workplace and interpersonal concerns (staff → supervisor / People) | HR | `task-pack-audit-workplace-concern` |
| 3 | Chat Review QC vs shift handoff | Clinical Operations | `task-pack-audit-chat-review-handoff` |
| 4 | Practice hours and patient booking contact | General (founder queue) | `task-pack-audit-practice-hours-contact` |
| 5 | Notify owner — knowledge gap routing | Technology | `task-pack-audit-notify-owner-routing` |
| 6 | Expense reimbursement (interim) | Accounts | `task-pack-audit-expense-reimbursement` |
| 7 | Leave and PTO (interim — handbook pending) | HR | `task-pack-audit-leave-pto` |
| 8 | Staff talk-tracks (ADHD / first-visit Rx / accommodations / entity / post-labs) | Clinical Operations | `task-pack-audit-staff-patient-talktracks` |

**Out of this batch:** Hostile / abusive patient — already live `sop-1786241888864-djh6i5`; code should defer (do not promote `abusivePatientAnswer`).

Markdown mirrors: `apps/hipaa-training/docs/knowledge-sop-drafts/2026-08-24-ops-audit/`

---

*Inventory + draft pack only. No topics set live in this pass.*
