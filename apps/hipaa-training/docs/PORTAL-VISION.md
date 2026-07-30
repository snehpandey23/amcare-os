# Employee portal product direction

**Not Workstatus.** This app is the **employee hub**: LMS + daily practice + approved answers. External clinical tools (Spruce, Zoho sheets) are shortcuts only — collapsed on Home.

## Three pillars (in-app)

| Pillar | Route | What it is |
|--------|--------|------------|
| **Learn** | `/training` | HIPAA LMS, modules, certificate |
| **Practice** | `/level-up` | Engagement drills (English, US culture, typing, billing, map, timezone) |
| **Ask** | `/help` | Internal help desk — SOPs, escalate gaps |
| **Grow** | `/grow` | Dashboard: module progress, XP, streak, drill links |

## Admin / “ERP-lite” today

| Need | Where |
|------|--------|
| Invite team, roles | `/admin/team` |
| Attendance (pilot) | Last sign-in + Level Up activity in Team roster |
| Leave / expenses / forms | **Coming soon** as modules inside this app — not third-party time trackers |

## What we are not building in one step

Full SAP-style ERP. Add modules incrementally: leave requests → reimbursements → schedules, each with KB + workflow + optional approval — still one portal, one login.

## Links data

`src/data/employee-portal-links.json` — **clinical & ops shortcuts only**. No Workstatus. HR copy points to portal activity + email for concerns.
