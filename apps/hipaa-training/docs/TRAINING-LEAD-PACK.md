# Siya Staff Portal — Lead pack (scenario cards)

**Audience:** Department leads (`siya_department_leads` assignment — not a separate login role)  
**URL:** https://siya-staff-assist.vercel.app  
**Status:** Accurate to live product as of 2026-08-24 · expands `TRAINING-ROLE-PACKS-OUTLINE.md` Tier **C** + **B2–B4**  
**Prerequisite:** Staff Day-1 (`STAFF-DAY-1.md`) for shift, Ask PHI rules, Team pulse, thumbs / Notify owner  
**Not this pack:** Portal Admin / Founder Talk (see Admin pack) · in-app tour · second FAQ

---

## Cover — who is a “lead”?

| | Staff login | Lead (this pack) | Admin |
|---|-------------|------------------|-------|
| How you get it | Invite role **Staff** (`trainee`) | Admin assigns you under **Admin → Team → Department leads** | Invite role **Admin** |
| Shift bar | Yes | Yes (same as staff) | No |
| Extra My day cards | — | **SOP work queue**, **Open knowledge gaps**, sometimes **Weekly lead check-in** | Founder Coach instead |

You still use **Start shift / Working / Break / Focus / End shift** like any staff account. Lead powers are **extra queues and review paths**, not a different home app.

Chrome how-to (“where is Focus?”) → **Ask on My day**. Do not invent a second FAQ.

---

## C1 — SOP work queue on My day

| | |
|--|--|
| **When** | You are assigned as SOP lead for one or more departments |
| **Where** | My day → **Today** column · card title **SOP work queue** |
| **Goal** | See what you own for department procedures; open the right workspace |

**Do this**

1. Confirm the ownership line: *You’re the SOP lead for …*
2. Use **Department SOPs →** (`/memory/knowledge/sops`) for policy docs.
3. Use **AI checklist builder →** (`/memory/knowledge/sop-builder`) for daily My day checklists.
4. Open queue lines (open SOP tasks assigned to you, drafts / needs review, pending items).

**Honesty**

- Card is **hidden** if you have no lead departments.
- Queue text may say SOPs are “waiting on admin approval” even when **you** can approve that department on `/admin/sop-review` (see **C4**). Prefer the review queue link from Department SOPs when you need to Approve / send back.
- Policy docs ≠ checklist assignments — checklists still show under **Your tasks today**.

**Never** treat this card as the staff bug tracker or Chat Review.

---

## C2 — Open knowledge gaps

| | |
|--|--|
| **When** | Staff tapped **Notify owner** on Ask and the gap routes to your department |
| **Where** | My day Today · **Open knowledge gaps** (also on `/team`) |
| **Goal** | Close the loop on missing approved guides |

**Do this**

1. Read **department + task label** only (no full Ask question text by design).
2. Write or update the approved guide / SOP, then teach staff to re-ask — or escalate to founder if it is org-wide.
3. Tap **Mark handled** when the gap is addressed. UI confirms **Marked handled.**

**Honesty**

- Gaps are **Notify-owner clicks**, not every unanswered Ask.
- Weekly email digests use the same rows (category + task only).
- Card hides when there are no open gaps and no error.

**Never** use gaps for password reset, broken buttons, or patient-chat QC.

---

## C3 — Weekly lead check-in

| | |
|--|--|
| **When** | You lead **Marketing**, **Clinical Operations**, or **Compliance** (admins can file all three) |
| **Where** | My day Today · **Weekly lead check-in** · **File this week** (hidden while you are in **Focus**). Feed also on `/team` |
| **Goal** | Structured dept pulse for the founder — not a ticket system |

**Fields (live labels)**

- What changed this week  
- Key numbers / status  
- Anything blocking (optional)  
- Anything the founder should know (optional)  

Submit → **Weekly check-in saved — visible on Team.**

**Never**

- Staff-wide bug tracker (UI / access / product issues → lead or admin DM).  
- PHI or patient identifiers.  
- Substitute for **Notify owner** (missing policy) or **SOP ⚑** (bad checklist step).

---

## C4 — Approve / send back department SOPs

| | |
|--|--|
| **When** | A policy SOP for **your** department is `pending_review` |
| **Where** | `/admin/sop-review` — open from Department SOPs header **SOP review queue →** (admins and leads) |
| **Goal** | Publish live Ask policy or return with a comment |

**Do this**

1. Open the queue (lead copy: *Your department’s pending policy SOPs — approve to live or send back*).
2. **Approve → Live** when the prose is ready for Ask retrieval.
3. **Send back** / **Send back to draft** with a comment when it needs work.

**Honesty — lead vs admin**

| Item | Lead | Admin / founder |
|------|------|-----------------|
| Policy SOPs for your assigned depts | Yes | Yes (all) |
| Unassigned / Leadership / General | Founder admin queue | Yes |
| AI checklist builder **submitted** sessions | **Admin-only** | Yes |

**Never** approve clinical content you have not owned; escalate Clinical Ops / Compliance when unsure.

---

## C5 — Record a decision

| | |
|--|--|
| **When** | Something settled that Ask should retrieve as Layer 2 truth (not a full SOP rewrite) |
| **Where** | Memory → **Knowledge** · **Record decision** (shown when `myLeadSlugs.length > 0`) |
| **Goal** | Write an authoritative decision into Postgres so Ask can cite it |

**Do this**

1. Open Memory → Knowledge.
2. **Record decision** — ground in a constitution principle (required), then title, decision, why it matters.
3. Save. Prefer this over pasting “decisions” only into Slack.

**Honesty**

- Button appears for **assigned leads**, not for every staff account. Pure Admin without a lead assignment may not see it unless also assigned as a lead.
- Markdown under `docs/.../decisions/` is backup/boot-sync — the form is the create path.

**Never** put PHI in the decision log.

---

## B2 — Department SOPs lifecycle (leads who draft)

| | |
|--|--|
| **Where** | `/memory/knowledge/sops` · **Department SOPs** |
| **Teach** | Draft → submit → pending → **live**. Ask uses **live** policy, not drafts |

**Flow**

1. Draft / edit department policy SOP (any teammate can draft; you own quality for your depts).
2. Submit for review → `pending_review`.
3. Lead (your dept) or admin (fallback / founder queue) **Approve → Live** or send back (**C4**).

**Honesty:** Daily operational checklists are a **different** path — AI checklist builder (**B3**), not this prose workspace alone.

---

## B3 — AI checklist builder

| | |
|--|--|
| **Where** | `/memory/knowledge/sop-builder` |
| **Teach** | Interview → checklist draft → review/submit. Does **not** invent clinical policy alone |

**Do this**

1. Run the builder interview for a My day checklist SOP.
2. Review steps before submit.
3. Publishing submitted builder sessions stays on **admin** SOP review (**C4** honesty table).

**Never** treat a raw AI draft as approved clinical or compliance policy without human review.

---

## B4 — Flag a bad checklist step

| | |
|--|--|
| **When** | An assigned My day checklist step is unclear, outdated, or wrong |
| **Where** | My day → Your tasks today · **⚑** (title: *Flag step (unclear / outdated)*) → modal **Flag this step** → **Submit flag** |
| **Teach** | Content feedback on that step — not general Ask complaints |

**Never** use ⚑ for “Assist gave a weak answer” (use thumbs) or “missing company guide” (Notify owner).

---

## D1 note — Clinical Operations leads only

**Chat Review** (`/chat-review`) is **Admin + Clinical Operations lead** only — not every department lead.  
Patient-chat QC log; **not** Ask thumbs. Cross-team view: `/admin/chat-reviews`.  
Staff volume / continuity stays on **End shift → Shift handoff**. See `CHAT-REVIEW-AND-HANDOFFS.md`.

If you are not Clinical Ops lead, skip this card.

---

## Appendix — Feedback map (same as Day-1)

| Channel | Use for | Not for |
|---------|---------|---------|
| **Thumbs 👎** | Weak Assist answer | Bugs, PHI incidents, patient QC |
| **Notify owner** | Missing / wrong **approved guide** | Broken button, password |
| **Copy escalation** | Human Slack/email with context | Replacing Notify owner |
| **SOP step ⚑** | Checklist content wrong | General Ask complaints |
| **Weekly lead check-in** | Dept pulse (leads) | Staff-wide bug tracker |
| **Handoff** | Shift continuity | Long product feedback |
| **Lead / admin** | Access, broken UI, urgent ops | Dumping PHI |

---

## Related

- Staff Day-1: `STAFF-DAY-1.md`  
- Outline: `TRAINING-ROLE-PACKS-OUTLINE.md`  
- Admin pack: `TRAINING-ADMIN-PACK.md`  
- Chat Review: `CHAT-REVIEW-AND-HANDOFFS.md`
