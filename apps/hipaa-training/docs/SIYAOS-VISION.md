# SiyaOS — product north star

**SiyaOS** is not an ERP, LMS, HRMS, or chatbot. It is the **operating system for how Siya works, learns, communicates, and improves**.

When someone opens their laptop, the intent is: **open SiyaOS first**. Zoho, WorkDrive, Spruce, Carepatron, Gmail, and ad-hoc ChatGPT become **services behind SiyaOS**, not parallel destinations.

Every feature should answer:

> Does this help an employee start their day, do better work, learn faster, and help the organization improve?

If yes → SiyaOS. If no → another system or it does not need to exist.

---

## Architecture (six pillars)

| Pillar | Purpose | Today in app | Later |
|--------|---------|--------------|--------|
| **Work** | SOPs, AI assistant, forms, policies | **Ask** (`/help`), KB, escalation | Forms, policy workflows |
| **Learn** | Role + compliance + skills | **Learn** (`/training`), **Practice** (`/level-up`) | Journeys, more tracks |
| **Grow** | Goals, path, certifications | **Grow** (`/grow`), onboarding profile | Reviews, career path |
| **Team** | People, leave, recognition | **Team** (`/admin/team`) invite + coaching view | Directory, leave, announcements |
| **Insights** | Org improvement (admin) | Team roster metrics, feedback thumbs | Gap backlog, dept health |
| **Memory** | Organizational knowledge | **Memory** (`/memory`): captures + **decisions** | Graph, contradictions, reconstruction |
| **Integrations** | External systems | Link hub (collapsed), Resend | Zoho, Calendar, Slack |

```
                    SiyaOS
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
  People           Knowledge          Learning
     │                 │                 │
 Operations      AI Assistant         Growth
     │                 │                 │
 Integrations    Analytics         Automation
```

---

## Employee experience: “My day”

Not a dashboard — **one calm page**:

- Greeting + optional shift (when schedule integration exists)
- **Today’s priorities** (tasks / SOPs — phased in)
- **Today’s learning** (phrase, term, doc challenge, streak)
- **Anything I can help with?** → Work (Ask)

Route: **Home** `/` = My day.

---

## Onboarding = joining a mission

Not bare name/role forms. Steps:

1. Welcome — personalize workspace  
2. Team (Clinical, Marketing, Accounts, HR, Operations, Leadership)  
3. Experience level (new, healthcare, US healthcare, remote)  
4. Improve most (pick 3)  
5. Biggest challenge (free text → development plan seed)

Stored in **portal profile** (synced to account). Gates first login until complete.

---

## Journeys (long-term)

```
New Hire → Orientation → English → US Healthcare → Documentation
  → Department Skills → Advanced → Leadership → Trainer → Manager
```

The assistant should know where someone is on this path (profile + progress).

---

## Admin: coaching, not surveillance

**Track outcomes, not activity.**

| Good | Avoid |
|------|--------|
| Learning completed, quiz scores, certifications | Mouse, idle time, keyboard |
| Knowledge gaps, SOP usage, voluntary practice | Screenshots, break policing |
| Goals, feedback 👍/👎, documentation quality | “Online” as surveillance |

Admin view framing: **Team health** — progress, learning, suggested interventions (e.g. “practice conversations twice this week”), not attendance scores for punishment.

---

## Feedback loop

Built into Ask: 👍/👎 → “Was this useful?” → reason codes → **backlog for KB owners** (wired partially today; expand reason taxonomy).

---

## Long-term asset

**AI-native OS for distributed healthcare teams** — runs Siya today; could run other telehealth / MSO / RCM orgs tomorrow.

Modules (helpdesk, training, attendance) are **parts of the OS**, not the product name.

---

## Implementation map (repo)

| Area | Path |
|------|------|
| Staff shell | `apps/hipaa-training` (deploy: siya-staff-assist) |
| Auth + profile sync | `integrations/hipaa-training-api` |
| Internal KB | `docs/siyaos-knowledge-base/` |
| This doc | `apps/hipaa-training/docs/SIYAOS-VISION.md` |

## Phase 1 habit (locked)

See **[SIYAOS-PRINCIPLES.md](./SIYAOS-PRINCIPLES.md)** for non-negotiable product principles.
