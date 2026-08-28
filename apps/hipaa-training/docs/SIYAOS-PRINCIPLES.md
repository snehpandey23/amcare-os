# SiyaOS Principles v1

**Non-negotiable.** Every feature is judged against these.

SiyaOS is not an employee portal. It is an **AI-powered learning organization** — software that makes the company smarter every day.

---

## Mission

> **When someone leaves Siya, they should be a person who uses AI responsibly to continue growing in both their personal and professional life.**

We do not create dependency on AI. We build judgment: **when to trust AI, when to verify, and how to amplify your own thinking.**

---

## 1. Never ask twice

**North Star:** If an employee has to ask a teammate something that could have been answered by company knowledge, documentation, common sense, or prior experience, **SiyaOS has failed.**

Every unanswered or poorly answered question becomes work for the org:

| Signal | Action |
|--------|--------|
| Missing SOP | KB + owner |
| Missing training | Learn module or drill |
| Missing AI capability | Prompt, routing, context |
| Missing documentation | Work Engine + contributor |

Product surfaces: Ask 👎 reasons, knowledge gaps, escalation to `bot@siya.health`, Team Pulse themes (later).

---

## 2. Employees own growth. SiyaOS owns accountability.

Not: manager assigns tasks. Not: AI commands.

**Employee** chooses goals (onboarding, updates anytime). **SiyaOS** nudges with context — no guilt.

> You wanted to improve documentation. You haven’t practiced in four days. Here’s a two-minute exercise.

Accountability = reminders tied to **their** stated goals, not surveillance.

---

## 3. Celebrate everything

LMS notice failures. SiyaOS notices **progress**.

Examples (non-exhaustive):

- First week on SiyaOS  
- Seven-day streak  
- First SOP contribution  
- Helped improve documentation  
- HIPAA completed  
- First Ask question  
- English / practice milestone  
- Consistent learner  

Small wins → habits. Ship celebrations in-product (toasts, timeline entries), not email spam.

---

## 4. AI Coach is opt-in

Onboarding (or settings):

> Would you like a personal AI coach?

| Choice | Behavior |
|--------|----------|
| **Yes** | Assistant may use profile, reflections, usage patterns for nudges and memory-aware help |
| **No** | Stateless Ask — no long-term coaching memory |

Privacy and control are default-respectful.

---

## 5. Remember struggles, not failures

Never label: *“You are bad at documentation.”*

Instead: *“Documentation seems challenging lately. Want a short practice?”*

Patterns yes; pejorative labels no. Admin sees **outcomes and themes**, not character scores.

---

## 6. Think in shifts, not calendar days

My Day resets when **work starts**, not at midnight UTC.

| Shift | My Day |
|-------|--------|
| Morning | Focus + learning for that block |
| Evening | Different focus / learning |
| Night | Different focus / learning |

Siya is not 9–5. Profile: **shift preference** + timezone; `todayKey()` becomes shift-aware (future).

---

## 7. Context-aware AI

Same words, different answers by **role / department / journey**.

Example: *“What do I do after a patient books?”*

| Context | Answer shape |
|---------|----------------|
| Marketing | CRM / comms |
| Clinical assistant | Intake workflow |
| Provider | Documentation prep |
| Operations | Completion metrics |

Requires: portal profile department, workforce role, approved KB routing — not one generic blob.

---

## 8. Growth Timeline (living history)

Not a résumé. A **timeline** on the employee profile:

```text
Joined Siya
├── Completed onboarding
├── Learned HIPAA
├── First documentation milestone
├── First SOP contribution
├── Practice milestone (e.g. English)
├── Role change / mentored someone
├── Built first AI workflow
Today
```

Evidence of growth over years — not attendance rows.

Data model: `growthEvents[]` on profile (append-only, celebratory + factual).

---

## Founder check (infrastructure test)

> If SiyaOS disappeared tomorrow, what would the company lose **immediately**?

**Wrong answers:** chat, SOP search, learning, attendance.

**Right answers (examples):**

- *“We would stop learning as an organization.”*  
- *“New hires would take twice as long to become excellent.”*

Infrastructure is harder to replace than features.

---

## Implementation map (repo)

| Principle | Today | Next |
|-----------|--------|------|
| Never ask twice | Ask, 👎, gap log | Auto backlog + owner routing |
| Growth + accountability | My Day, onboarding goals | Nudges from goals + last practice |
| Celebrate | Streak, XP | Milestones + timeline events |
| Coach (mandatory) | Always on — no opt-out in onboarding | Practice reports / nudges use goals + day ledger |
| Struggles not failures | Copy in nudges (draft) | Coach tone in prompts |
| Shifts | Start/End shift, Working · Focus · Break | Morning brief, Work Memory search |
| Presence | Self-declared only; Focus changes UX + Ask | Team trends (30d), no manager log export |
| Context AI | Department in profile | Route Ask by dept + role |
| Timeline | `growthEvents` type | UI on `/grow` or profile |

See also: [SIYAOS-VISION.md](./SIYAOS-VISION.md)

---

## Daily workspace (mental model)

SiyaOS is **where work starts** — not “clock in software.” Start shift opens **My day**; attendance is a side effect.

**Presence (self-declared only):** 🟢 Working · 🎯 Focus · ☕ Break · ⚫ Off shift.  
**Never build:** idle detection, webcam, screenshots, keyboard/mouse monitoring, or “AI productivity scores.”

**Focus** is sacred: fewer nudges, quieter chrome, concise Ask.  
**Break** uses human copy (“Enjoy your break” / “Welcome back”), not surveillance timers.

**Team sees (coordination):** same live presence states on **My day** and **`/team`** — who is Working / Focus / Break / Off shift, plus **today’s open task titles** per person. No attendance CSV or tool-click logs for staff.

**Admin sees:** the above plus ops metrics, trends, and audit CSV export on **`/admin/team`** — **not** minute-by-minute presence logs.

**Work Memory (roadmap):** “What did you accomplish today?” at end shift → searchable org memory (“What did Marketing ship in July?”). **Started:** `/memory`, API `siya_memory_entries`, end-shift + Ask capture — see [SIYAOS-MEMORY.md](./SIYAOS-MEMORY.md).
