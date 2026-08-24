# Training role packs — outline (Lead / Admin)

**Status:** Structure confirmed · full cards written  
**Grounded in:** Feature audit 2026-08-24 (corrected vs Claude Day-1 draft) + live `apps/hipaa-training`  
**Staff Day-1 one-pager:** `STAFF-DAY-1.md` (Tier A)  
**Lead pack:** `TRAINING-LEAD-PACK.md` (C1–C5 + B2–B4)  
**Admin pack:** `TRAINING-ADMIN-PACK.md` (E1–E6 + D1–D2; E7 caveat)  
**Do not build:** Second FAQ wiki that duplicates Ask meta. Prefer Ask + My day tour for chrome how-to.  
**In-app tour (staff):** First-run picker — **Show me the buttons** (spotlight) or **Ask Assist to walk me through**; restart from Account.

---

## Packaging (confirmed)

| Pack | Audience | Source tiers | Format when expanded |
|------|----------|--------------|----------------------|
| **Staff Day-1** | All staff | A (+ F feedback map) | One-pager — **done** |
| **Lead pack** | Dept leads (assignment, not login role) | B (as needed) + **C** + F | Scenario cards — **done** (`TRAINING-LEAD-PACK.md`) |
| **Admin pack** | Portal admins / founder | **D** + **E** + F | Scenario cards — **done** (`TRAINING-ADMIN-PACK.md`) |
| **Optional growth cards** | Staff who touch Memory/SOPs | **B** | Add after Day-1 sticks |

---

## Tier A — Staff (covered by Day-1 one-pager)

| ID | Scenario | Day-1 coverage |
|----|----------|----------------|
| A1 | First login → Start shift → Working | Yes |
| A2 | Break vs Focus vs Working | Yes |
| A3 | End shift + handoff | Yes |
| A4 | My day Ask (PHI, Notify owner, thumbs) | Yes |
| A5 | My day tasks / Flag | Yes (summary) |
| A6 | Learn HIPAA path | Yes |
| A7 | Learn Practice vs Ask | Yes |
| A8 | Personalize / Account | Yes |
| A9 | Team page (pulse + handoffs) | Yes |
| A10 | PHI everywhere | Yes |

*Expand A5–A8 as separate cards only if Day-1 feels too dense in use.*

---

## Tier B — Knowledge / SOPs (optional growth cards)

| ID | Scenario | Audience | Card must teach | Live surface |
|----|----------|----------|-----------------|--------------|
| B1 | Memory tabs | Staff with Memory | Policies / Knowledge / captures; Way = admin | `/memory` |
| B2 | Department SOPs lifecycle | Drafters | Draft → submit → pending → live; Ask ignores drafts as policy | `/memory/knowledge/sops` |
| B3 | AI checklist builder | Allowed builders | Interview → checklist draft → review; ≠ inventing clinical policy alone | `/memory/knowledge/sop-builder` |
| B4 | Flag bad checklist step | Assignees | ⚑ meaning and what happens next | My day Today |

**Lead pack:** include B2–B4 if leads draft SOPs. **Admin pack:** B2–B3 for review path.

---

## Tier C — Lead pack (department leads)

| ID | Scenario | Card must teach | Live surface |
|----|----------|-----------------|--------------|
| C1 | SOP lead card on My day | Own departments; open SOP workspace | My day Today (lead card) |
| C2 | Knowledge gaps queue | Resolve Notify-owner gaps for your depts | Lead gaps card / digest |
| C3 | Weekly lead check-in | Marketing / Clinical / Compliance form: what changed, numbers, blockers, founder should know — **not** staff bug tracker | **Weekly lead check-in** on My day Today (and feed on `/team`) |
| C4 | Approve / send back SOPs | Lead review path vs founder/admin queue | SOP workspace + admin review when applicable |
| C5 | Record a decision | When Memory offers decision capture | Memory → Knowledge (if enabled) |

**Lead pack outline structure (holds):**

1. Cover: who is a “lead” (assignment) vs Staff/Admin login  
2. Cards C1 → C5 in order  
3. Appendix: Feedback map (from Day-1 / Tier F)  
4. Pointer: Ask for chrome how-to; Day-1 one-pager for shift/Ask basics  

---

## Tier D — Clinical Ops QC (+ Admin view)

| ID | Scenario | Card must teach | Live surface |
|----|----------|-----------------|--------------|
| D1 | Chat Review | Patient-chat QC log — **not** Ask thumbs; access rules | `/chat-review` |
| D2 | Admin chat-reviews team view | Cross-team QC | `/admin/chat-reviews` |

**Admin pack:** include D1–D2. **Lead pack:** D1 only if Clinical Ops leads use Chat Review.

---

## Tier E — Admin pack (portal admin / founder)

| ID | Scenario | Card must teach | Live surface |
|----|----------|-----------------|--------------|
| E1 | Invite + reset password | Temp password; Staff vs Admin role | Admin → Team → Edit |
| E2 | Department leads | Assign leads; effect on SOP / gap queues | Admin → Team (leads) |
| E3 | Task board + templates | Assign → staff My day; templates vs one-off | `/admin/tasks`, `/admin/task-templates` |
| E4 | SOP review queue | Approve / send back pending SOPs & checklist drafts | `/admin/sop-review` |
| E5 | Founder Coach (admin My day) | **Ask** (Founder Talk) vs **This week’s plan** (Focus / Can Wait / Delegate / Observe) — chat **never** writes the plan | Admin My day |
| E6 | Ops presence / attendance | Live roster; CSV if used | Admin team / attendance tools |
| E7* | Task **Approve** from Ask | *Caveat only in Admin pack:* Approve = **task only** (no email). **Suppressed on Founder Talk by design today** (`pendingTask` cleared when `surface=founder-coach`) — intentional isolation; ticket if re-enable vs `/admin/tasks` only | Ask / ops coach path |

**Admin pack outline structure (holds):**

1. Cover: Admin ≠ shift bar; Personalize via Founder Talk blurb / `/onboarding`  
2. Cards E1 → E6 (E7 only if product re-enables Approve on admin Ask)  
3. Cards D1–D2 (QC)  
4. Lead-relevant B2–B3 if admins also review SOPs  
5. Pointer: Staff Day-1 for what staff experience; Ask meta for chrome  

---

## Tier F — Feedback channels (shared appendix)

Same table as Staff Day-1 — print once per pack as appendix, do not invent new channels.

| Channel | Use for | Not for |
|---------|---------|---------|
| Thumbs | Answer quality | Bugs / PHI / patient QC |
| Notify owner | Missing policy guide | Broken UI / password |
| Copy escalation | Human handoff paste | Replacing Notify owner |
| SOP ⚑ | Checklist content | General Ask complaints |
| Weekly lead check-in | Dept pulse (leads) | Staff bug tracker |
| Handoff | Shift continuity | Product feedback dump |
| Lead / admin DM | Access / urgent ops | PHI |

---

## Explicit non-goals (from audit)

- No second FAQ wiki that duplicates Ask meta (“where is Focus?”).  
- No “CIA assistant training builder” — SOP builder already covers AI checklist drafting.  
- Do not teach Team pulse as a My day compact widget — **Team today** lives on `/team` (compact My day mount not live).

**Updated:** A light **My day tour** (spotlight + Ask path) is in product for staff first-run / Account replay — not a full training OS.

---

## Done / remaining

1. ~~Write Lead pack cards C1–C5 (+ B2–B4).~~ → `TRAINING-LEAD-PACK.md`  
2. ~~Write Admin pack cards E1–E6 + D1–D2 (+ E7 caveat).~~ → `TRAINING-ADMIN-PACK.md`  
3. WorkDrive `03-START-HERE/` copies (git remains source of truth for wording).  
4. Optional: thin Day-1 Slack pin further; optional PDF export.
