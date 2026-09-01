import type { OperationalSopTaskDef } from "./lead-operational-pack.js";

/**
 * 2026-08-24 ops-knowledge audit batch → Knowledge SOP drafts only.
 * Installed by ensureOperationalSopPack as status=draft + open create_sop tasks.
 * Never live until a lead/admin submits and approves.
 */
export const AUDIT_KNOWLEDGE_SOP_PACK: OperationalSopTaskDef[] = [
  {
    id: "task-pack-audit-cpm-daily-slas",
    department: "Clinical Operations",
    taskType: "create_sop",
    title: "CPM daily SLAs — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Clinical Program daily SLAs (pre-chart, fax, note lock, ops day)",
    draftSopBody: `# Purpose
Give frontline clinical ops a single citeable checklist for same-day SLAs so Ask can answer “how fast must I…?” without inventing timing.

# Scope
- Clinical Program Manager / MA daily ops on EST patient day with IST coverage handoffs
- Does **not** replace Chat Review QC access rules (separate SOP)
- Does **not** invent leave, refund, or prescribing policy

# Steps / SLAs
1. **Pre-charting** — Charts ready **15 minutes** before each scheduled appointment.
2. **Fax handling** — Incoming faxes categorized, routed, and filed within **2 hours** of receipt; urgent faxes notified to the provider immediately.
3. **Note lock** — Visit documentation completed and locked within **4 hours** of appointment conclusion.
4. **Patient chat (routine)** — Non-clinical inquiries answered within **24 hours**; clinical questions escalate to the provider immediately (portal chat SLA — not the admin Chat Review QC tool).
5. **Payments / forms** — Payments verified and intake forms processed before the visit when possible; flag blockers same day.
6. **Ops day shape** — Plan work against **EST patient hours** with **IST** coverage rhythm (morning EST / evening IST overlap). Use the portal IST ops date for tasks, handoffs, and chat-review rows.

# Exceptions
- Safety / clinical urgency overrides the clock — escalate immediately.
- System outages: document the blocker and notify supervisor; do not silently skip charting or note lock.

# Escalation
Clinical Program lead / supervisor same day if an SLA will be missed for a booked patient. Leadership if access or capacity blocks care for >48 hours.

# Sources (for reviewer)
- \`docs/workflows/daily-tasks-workflow.md\`
- Related live topics: \`daily-payment-check\`, \`chat-review-sla\` (partial only)

# Review gate
**Draft only.** Lead must verify times against current SOW before submit → pending_review → live.`,
  },
  {
    id: "task-pack-audit-workplace-concern",
    department: "HR",
    taskType: "create_sop",
    title: "Workplace / people concern path — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Workplace and interpersonal concerns (staff → supervisor / People)",
    draftSopBody: `# Purpose
Give staff a clear path when a teammate, manager, or workplace situation feels rude, unfair, or unsafe — without putting patient PHI in Ask.

# Scope
- Staff ↔ staff / manager interpersonal concerns
- **Not** hostile **patient** callers (use live SOP: Handling Verbally Abusive Patient Interactions)
- Ask does **not** investigate, mediate, or decide outcomes

# Steps
1. **Immediate safety** — Contact your supervisor or on-call lead now.
2. **Otherwise** — Escalate to your **supervisor** and **People / HR**. Do not put patient identifiers in Ask or Slack.
3. Share **what happened**, **when**, and **who was involved** (staff names only).
4. Use **Copy escalation summary** for a de-identified handoff if helpful.
5. Use **Notify owner** only if you believe the published guide is missing or wrong — not as a substitute for HR.

# Exceptions
- Harassment, discrimination, or retaliation claims: escalate to People / HR the same day; do not rely on Ask alone.
- If the concern involves your direct manager, escalate to the next-level lead or People / HR.

# Escalation
People / HR lead. Leadership if People is unavailable and safety is involved.

# Review gate
**Draft only** (promoted from Assist interim script). HR lead must confirm channels and owners before live.`,
  },
  {
    id: "task-pack-audit-chat-review-handoff",
    department: "Clinical Operations",
    taskType: "create_sop",
    title: "Chat Review vs shift handoff — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Chat Review QC vs shift handoff (who may use which tool)",
    draftSopBody: `# Purpose
Stop confusion between **Chat Review** (QC) and **shift handoff** (team coordination / volume self-report).

# Scope
Staff portal tools only — not patient-facing Spruce policy depth.

# Who uses what
## Chat Review (QC)
- Paths: \`/chat-review\`, \`/admin/chat-reviews\`
- Access: **Admin** and **Clinical Operations lead** only (\`siya_department_leads\` for \`clinical_operations\`)
- Purpose: one row per patient chat reviewed (identifier, notes, errors, open/closed)
- **Not** for general staff self-report

## Shift handoff
- Visible on \`/team\` for **any signed-in staff**
- After **End shift**, optional handoff modal: pending follow-ups, scheduled items, chat/call counts
- Skip allowed

# Steps (staff)
1. End-of-shift volume and pending follow-ups → **shift handoff**, not Chat Review.
2. Do not ask Assist for Chat Review access if you are not admin / Clinical Ops lead — escalate to your lead.
3. Both features use the **IST ops date** (same as tasks / team pulse).

# Escalation
Clinical Operations lead for QC access questions. Technology if a button/path is broken.

# Sources
- \`apps/hipaa-training/docs/CHAT-REVIEW-AND-HANDOFFS.md\`

# Review gate
**Draft only.** Confirm access gates still match production before live.`,
  },
  {
    id: "task-pack-audit-practice-hours-contact",
    department: "General",
    taskType: "create_sop",
    title: "Practice hours + booking contact — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Practice hours and patient booking contact (staff talk-track)",
    draftSopBody: `# Purpose
Align staff answers on practice hours and how patients reach booking/support — and fix conflict with any “defined business hours” vision copy.

# Canonical facts (as of facts snapshot)
- **No fixed public practice hours** (\`hasFixedPracticeHours: false\`). Do **not** invent Mon–Fri 9–5 style hours unless Leadership publishes new facts.
- Patient contact: **care@siya.health** · **(215) 445-1244**
- Booking / Meet & Greet: use current site redirect / booking links (do not invent URLs in chat)

# Staff steps
1. If asked “what are your hours?” — say we do **not** publish fixed walk-in hours; care is scheduled telehealth by appointment.
2. Point patients to care@ / phone for scheduling help; use approved booking links from the site.
3. Internal EST/IST ops rhythms are for **staff coverage**, not patient-facing clinic hours.

# Exceptions
- Klarity or partner-channel hours may differ — say which channel you mean; do not mix.
- Do not contradict live pricing or Meet & Greet product decisions.

# Escalation
Leadership / Knowledge Steward if marketing or vision copy still claims fixed hours.

# Review gate
**Draft only.** Founder queue (General). Align or retire conflicting vision KB language before live.`,
  },
  {
    id: "task-pack-audit-notify-owner-routing",
    department: "Technology",
    taskType: "create_sop",
    title: "Notify owner / gap routing — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Notify owner — knowledge gap routing (staff guide)",
    draftSopBody: `# Purpose
Tell staff what **Notify owner** does so they use it for missing/wrong guides — not for broken UI or password resets.

# When to use
- Ask has **no approved staff guide** (or the guide is clearly wrong) for a real work question
- You want the department lead (or founder) to see a knowledge-gap signal

# When **not** to use
- Broken button / login / password → Technology or admin reset
- Clinical or refund **decisions** → escalate to the owner; Ask does not decide
- Hostile patient / workplace paths that already have a guide — follow that guide

# What happens
1. PHI guard runs first — do not put patient identifiers in the question text if avoidable.
2. Gap is stored **without** question text in the gap table.
3. **Routing**
   - Department has a non-admin lead (and is not Leadership/General) → lead **weekly digest**
   - Otherwise → instant founder/admin inbox path (\`bot@siya.health\` by default)
4. Counts are **Notify owner clicks** (plus related signals), not every unanswered turn.

# Escalation
Technology if Notify owner fails. Leadership if routing looks wrong for your department.

# Sources
- \`apps/hipaa-training/docs/ESCALATION-EMAIL.md\`

# Review gate
**Draft only.** Tech lead confirms copy matches live routing before submit.`,
  },
  {
    id: "task-pack-audit-expense-reimbursement",
    department: "Accounts",
    taskType: "create_sop",
    title: "Expense reimbursement (interim) — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Expense reimbursement (interim staff path)",
    draftSopBody: `# Purpose
Promote Layer-1 interim expense policy into a reviewable Knowledge SOP so Ask cites a dept-owned guide.

# Policy (interim)
Expense reimbursement is handled by **Accounts** — not by Ask. Ask must not promise payment or invent limits.

# Steps
1. Confirm the expense is business-related and pre-approved when required.
2. Keep itemized receipts.
3. Submit through the Accounts reimbursement path with date, amount, purpose, and receipt (**no patient identifiers**).
4. Await Accounts confirmation — a chat answer is **not** approval.

# Escalation
Accounts lead. Founder (Knowledge Steward) until Accounts publishes a fuller policy.

# Sources
- Layer-1 seed \`expense-reimbursement\` (\`law-store\`)

# Review gate
**Draft only.** Accounts lead must confirm the real submission channel before live.`,
  },
  {
    id: "task-pack-audit-leave-pto",
    department: "HR",
    taskType: "create_sop",
    title: "Leave / PTO (interim) — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Leave and PTO (interim — handbook pending)",
    draftSopBody: `# Purpose
Promote Layer-1 interim leave/PTO guidance for Ask — **without** inventing a full handbook.

# Policy (interim)
Leave and PTO require **human approval**. Ask cannot approve time off, invent balances, or invent blackout rules.

# Steps
1. Request leave/PTO through the current HR / scheduling channel (ask your manager or HR contact if unsure).
2. Include dates, type of leave, and coverage notes for your role.
3. Wait for **explicit approval** before treating time off as confirmed.

# Exceptions
- Do **not** publish detailed accrual tables until founder + HR sign off a handbook v1.
- US holiday calendar facts (e.g. Thanksgiving date) are calendar helpers — not leave entitlement.

# Escalation
HR lead / Founder (Knowledge Steward) until handbook v1.

# Sources
- Layer-1 seed \`leave-pto\` (\`law-store\`)
- \`docs/siyaos-knowledge-base/10-hr/README.md\` (handbook blocked note)

# Review gate
**Draft only. Founder + HR required before live.** Prefer reject/revise over publishing invented PTO rules.`,
  },
  {
    id: "task-pack-audit-staff-patient-talktracks",
    department: "Clinical Operations",
    taskType: "create_sop",
    title: "Staff patient talk-tracks (site canon) — draft SOP (audit 2026-08-24)",
    draftSopTitle: "Staff talk-tracks — ADHD positioning, first-visit Rx, accommodations, entity, post-labs",
    draftSopBody: `# Purpose
Give staff short, counsel-aligned talk-tracks drawn from public site canon — for Ask and frontline chat — without dumping full marketing pages.

# Scope
Staff answers only. Do not invent clinical decisions. Escalate clinical questions to the provider.

# Talk-tracks
## 1. Are you psychiatrists?
Siya Health is **not** a psychiatry or psychology practice. ADHD care is delivered through internal medicine, family medicine, NPs, and PAs using a structured **primary care–led** evaluation.

## 2. Controlled meds at initial evaluation
**Controlled medications are not prescribed during the initial evaluation visit** at Siya Health. If medication is later appropriate, follow-up plans match the treatment path and state law. Diagnosis / evaluation does **not** guarantee medication or stimulants.

## 3. Workplace accommodations / letters
A licensed clinician may document ADHD-related findings and functional limitations when clinically supported. Whether an employer grants accommodations depends on employment law and employer policy — **not** the clinic alone. Legal strategy → patient HR / attorney / school disability office.

## 4. Entity one-liner
Siya Health Inc. provides administrative and non-clinical support. Medical services are provided by **Siya Healthcare, PLLC** through licensed clinicians.

## 5. License ≠ service state
A clinician may hold a license in a state where we are **not** currently offering service. Service footprint is the published available-service states list — do not imply care everywhere a license exists.

## 6. Post-labs return (Spruce / email)
Calm tone: don’t panic over a single number; reference ranges don’t diagnose. Invite Meet & Greet or a visit for interpretation in context. Link how-to-read-results. **Do not** deep-link Rupa as interpretation, promise diagnosis from labs alone, or push a “buy blood” CTA.

# Escalation
Clinical Program lead for clinical nuance. Compliance / Leadership for claims or entity wording disputes.

# Sources
- \`apps/siya-health/data/site-standards.mjs\` (\`ADHD_POSITIONING\`, \`CANONICAL_ENTITY_STATEMENT\`)
- \`answers/what-happens-after-adhd-evaluation.html\`
- \`answers/adhd-workplace-accommodations.html\`
- \`docs/POST-LABS-PATIENT-RETURN-COPY.md\`

# Review gate
**Draft only.** Clinical + Compliance skim before live; update if public canon changes.`,
  },
];
