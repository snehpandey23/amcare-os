# Siya Staff Portal — Admin pack (scenario cards)

**Audience:** Portal admins / founder (login role **Admin**)  
**URL:** https://siya-staff-assist.vercel.app  
**Status:** Accurate to live product as of 2026-08-24 · expands `TRAINING-ROLE-PACKS-OUTLINE.md` Tier **E** + **D** (+ B2–B3 review path)  
**Prerequisite:** Know what staff see — `STAFF-DAY-1.md`. Know lead queues — `TRAINING-LEAD-PACK.md`  
**Not this pack:** In-app tour · second FAQ · training Approve as the daily staff workflow

---

## Cover — Admin is not a staff shift account

| | Admin (this pack) |
|--|--|
| Shift bar (Start / Working / Break / Focus / End) | **No** |
| My day home | **Founder Coach** — Ask tab = **Founder Talk**; plan tab = **This week’s plan** |
| Personalize | Link on Founder Talk blurb → `/onboarding` (name, assistant label, training reminders) |
| Team nav item | Often no sidebar **Team** item; you can still open `/team` and you use **Admin → Team** for invites / leads / attendance |
| Staff Ask Approve path | See **E7 caveat** — not the primary admin teaching path today |

Chrome how-to → Founder Talk / staff Ask meta. Pointer for staff experience: Day-1 one-pager.

---

## E1 — Invite + reset password

| | |
|--|--|
| **Where** | **Admin → Team** (`/admin/team`) · **Invite team member** · Edit member for reset |
| **Goal** | Create accounts with a temporary password; fix lockouts |

**Do this**

1. **Invite team member** — email, name, temporary password (≥ 8 chars; generator available), role **Staff** (`trainee`) or **Admin**.
2. Copy the invite block / confirm email send when offered; hand the temp password securely.
3. To reset: open the member → **Edit** → set a new temporary password / role as needed.
4. Role change confirm shows **Staff** vs **Admin** labels.

**Never** put passwords in public Slack channels or Ask chat.

---

## E2 — Department leads

| | |
|--|--|
| **Where** | Admin → Team · section **Department leads** |
| **Goal** | Assign who owns SOP / gap / (some) check-in / Clinical chat-review gates |

**Do this**

1. For each department: **Assign lead** → **Save** (or clear to Unassigned).
2. Expect effects:
   - Lead **SOP work queue** + **Open knowledge gaps** on their My day  
   - Lead approve path for that dept’s pending **policy** SOPs  
   - Weekly check-in eligibility for Marketing / Clinical / Compliance when those leads are set  
   - **Chat Review** for **Clinical Operations** lead only (+ you as admin)

**Honesty:** UI blurb emphasizes lead SOP create/edit; live workspace still allows teammates to **draft** policy SOPs — leads/admins own **approval quality**.

---

## E3 — Task board + templates

| | |
|--|--|
| **Where** | `/admin/tasks` (board) · `/admin/task-templates` (reusable templates) |
| **Goal** | Assign work that appears on staff **My day → Your tasks today** |

**Do this**

1. Create / move tasks on the admin board; assign an owner.
2. Use templates for repeatable checklists; one-offs on the board when needed.
3. Confirm the assignee sees the item after refresh on My day.

**Never** rely on Founder Talk **Approve** as the only assign path today (**E7**). Prefer this board for deliberate assignment.

---

## E4 — SOP review queue

| | |
|--|--|
| **Where** | `/admin/sop-review` (also linked from Team admin / briefing surfaces) |
| **Goal** | Approve or send back pending policy SOPs **and** publish AI checklist builder submissions |

**Do this**

1. Read the founder queue copy: policy SOPs with **no assigned lead** (or Leadership/General), **plus** checklist drafts from the AI Builder. Departments with a non-admin lead approve themselves.
2. **Approve → Live** or **Send back** with comment for policy SOPs.
3. Review **submitted builder sessions** here (admin-only list — leads do not get this slice).

**Related:** B2/B3 in Lead pack — same lifecycle; you are the fallback publisher.

---

## E5 — Founder Coach (admin My day)

| | |
|--|--|
| **Where** | Admin My day (`/`) · **Founder Coach** tabs |
| **Goal** | Separate **talk** from **plan record** |

| Tab / surface | Live behavior |
|---------------|---------------|
| **Ask / Founder Talk** | Same Assist engine as staff Ask (`surface="founder-coach"`). Opening copy: answers from guides + live portal data; **never writes** Focus / Can Wait / Delegate / Observe |
| **This week’s plan** | Manual **Focus / Can Wait / Delegate / Observe** (and related plan editors). **Chat never writes the plan** |
| Domain tabs | Domain signal snapshots when present |

**Do this**

1. Use Founder Talk for policies, coverage, who owns what, difficult paths.  
2. Edit the plan yourself on **This week’s plan**.  
3. **Personalize** via the Talk blurb link when name / Assist label / reminders need change.

**Never** expect Talk to auto-fill Founder Focus from a chat message.

---

## E6 — Ops presence / attendance

| | |
|--|--|
| **Where** | Admin → Team · live roster / shift dashboard · **Audit export (CSV)** |
| **Goal** | See who is Working / Break / Focus / off shift; export raw events for finance/compliance |

**Do this**

1. Read presence for the ops day (same timezone labeling as the dashboard).  
2. Expand **Audit export (CSV)** → **Download {date} CSV** when needed.

**Honesty:** Presence is **self-declared** by staff — not a punch clock or productivity score (same Day-1 rule).

**Also:** `/team` Team today + handoffs for continuity reading (staff-visible pulse).

---

## E7 — Task Approve from Ask (*caveat only*)

| | |
|--|--|
| **What Approve means when shown** | Creates an **ad-hoc task only** — UI: *Approve creates a task only — no email.* No Slack/email blast from Approve |
| **On Founder Talk today** | **Suppressed** — engine strips `pendingTask` whenever `surface === "founder-coach"` (`engine.ts`). Admin My day Talk always uses that surface |

### Is suppression intentional? **Yes.**

- **Yes — intentional for current Founder Talk isolation.** Explicit code path, not a missing null-check.  
- Specs (`EXECUTIVE-WORKSPACE-v1.md` / v2) and UI copy elsewhere still describe Inform → Recommend → **Approve → task**. That is a **known product gap vs docs**, worth its **own ticket** (re-enable Approve on founder-coach **or** document Talk as read-only for assignment and point admins only at `/admin/tasks`).  
- **Not** a random accidental production bug — do not “hotfix train” Approve as primary admin workflow until product decides.

**Train instead:** assign on **E3** task board / templates.

---

## D1 — Chat Review (QC log)

| | |
|--|--|
| **Where** | `/chat-review` |
| **Access** | **Admin + Clinical Operations lead** only |
| **Goal** | Manual patient-chat QC rows (identifier, notes, errors, open/closed) — replaces spreadsheet |

**Never** confuse with Ask **thumbs**. Staff volume → **End shift handoff**, not this log.  
Detail: `CHAT-REVIEW-AND-HANDOFFS.md`.

---

## D2 — Admin chat-reviews team view

| | |
|--|--|
| **Where** | `/admin/chat-reviews` |
| **Access** | Same gate as D1 (admin sees all; Clinical Ops lead sees their dept staff) |
| **Goal** | Cross-team QC view |

Link back to `/chat-review` for the personal QA log entry path.

---

## B2 / B3 (admin review reminder)

| ID | Admin takeaway |
|----|----------------|
| **B2** | Draft → submit → pending → live; Ask ignores drafts as policy |
| **B3** | Builder submissions land on **your** E4 queue for publish |

Full drafter cards live in `TRAINING-LEAD-PACK.md`.

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
- Lead pack: `TRAINING-LEAD-PACK.md`  
- Outline: `TRAINING-ROLE-PACKS-OUTLINE.md`  
- Founder Coach architecture: `EXECUTIVE-WORKSPACE-v2-FOUNDER-DECISION-COACH.md`  
- Chat Review: `CHAT-REVIEW-AND-HANDOFFS.md`
