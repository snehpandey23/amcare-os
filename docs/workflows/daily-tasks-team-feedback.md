# Daily Tasks — team UX feedback (lightweight)

Use this **after** P0 is live and at least one person has completed a real task (not before). Goal: learn whether people **externalize work into SiyaOS** instead of keeping truth in chat, notebooks, and private spreadsheets.

**Do not** block deploy on this. **Do** run a short feedback pass each week for the first month.

**Do not** treat satisfaction scores as adoption. People can rate software highly and still avoid using it.

---

## Anchor question (strongest signal)

Ask every participant:

> **“What did you do outside SiyaOS because SiyaOS was not enough?”**

That surfaces the hidden workflow. Log answers verbatim (no PHI) in the feedback sheet.

---

## Behavior signals (observe, don’t only ask)

| Signal | Meaning |
|--------|---------|
| Tasks completed on time | Actual adoption |
| Tasks abandoned (todo/overdue, no checklist activity) | Workflow friction |
| Repeated reassignment | Ownership confusion |
| Staff asking in Slack for “what’s my task?” | Missing context or discoverability |
| Admin exporting / parallel spreadsheet | Trust or visibility failure |

Pull from task board + ledger where possible; supplement with interviews.

---

## Cadence

| When | Who | Format |
|------|-----|--------|
| Day 3 after go-live | 2 staff + 1 admin | 15 min call or async voice note |
| End of week 1 | Same + one “skeptic” | 5 questions below (written) |
| Weekly × 4 | Rotating pair | 10 min; one screen share optional |

Capture answers in a single shared sheet (no PHI): **Insight ID `OPS-TASKS-FEEDBACK`** in Content Tracker or a simple spreadsheet tab.

**Triage owner:** assign one name (e.g. ops lead or product owner) responsible for weekly review and routing blockers to engineering.

---

## Questions — staff (My Day)

Answer 1–5 (1 = strongly disagree, 5 = strongly agree) plus one sentence each.

1. **Clarity:** “I knew what I was supposed to do today without asking someone.”
2. **Clutter:** “My Day felt crowded or hard to scan.” (reverse — low score = good)
3. **Speed:** “Checking off a step felt fast and reliable.”
4. **Trust:** “I believe completed work is visible to leads without me re-reporting.”
5. **Missing context:** “I often didn’t know *why* a task existed or where the SOP lives.” (high = P1 traceability priority)

**Open:**

- What one thing would you remove from this screen?
- **What did you do outside SiyaOS because SiyaOS was not enough?**
- Phone vs desktop: which did you use? Anything broken on mobile?

---

## Questions — admin (board + templates)

1. **Board:** Can you see who is stuck without DMing everyone?
2. **Assign flow:** Is “Assign task” obvious? Anything scary or confusing?
3. **Templates:** Is “one person per template” clear? Recurrence understandable?
4. **Clutter:** Too many filters/columns/cards on first load?
5. **Would you use this daily** for your own work, or only to manage others?

**Open:**

- What did you do in Zoho/Sheets that you still had to do after using the board?
- Preview “next 5 occurrences” — helpful or noise?

---

## Questions — everyone (qualitative)

Pick any that spark discussion:

- “Show me your phone on My Day” (screen share) — **best single UX test**
- “What did you think would happen when you tapped the checkbox?”
- “What almost made you ignore the whole module?”
- “If we turned this off Monday, what would you miss?”

---

## How to run without building software (v1)

1. **Sheet columns:** date · role · screen · Q1–Q5 · anchor question · behavior notes · severity (**blocker** / **improvement** / nice-to-have) · triage owner initials
2. **Slack/WhatsApp:** post the 5 staff questions once; thread replies only
3. **Optional:** reuse staff app pattern `POST /api/assist-feedback` for thumbs on Siya chat — **do not** paste PHI; for tasks, prefer the sheet until we add a dedicated “Tasks feedback” prompt (P2)

---

## Feedback does not directly become features

```text
Feedback
   ↓
Categorize (blocker / friction / context / trust)
   ↓
Root cause
   ↓
Decision (fix bug · P1 traceability · process · defer)
   ↓
Roadmap
```

**Example:** Staff says *“I need a notes field.”*

| Interpretation | Likely fix |
|----------------|------------|
| Need context | P1 SOP links from task |
| Need escalation | P1 blocked state + reason |
| Need collaboration | Comments (already on task) |
| Need audit trail | Ledger + template history |

The first requested feature is often the **symptom**, not the cause. Weekly triage owner maps requests to root cause before any build.

---

## Triage rules (product)

| Signal | Action |
|--------|--------|
| ≥2 people say “clutter” on My Day | Reduce sections, tighten copy, defer board features |
| “Don’t know why task exists” | Prioritize P1 SOP links (not more checklist fields) |
| Checkbox feels slow / wrong | Engineering: SWR/API bug — not a redesign |
| Admin ignores board | Fix assign + overdue visibility before Kanban polish |
| “We still use Excel for X” | Document X; consider template for X only if repeated |

**Out of scope for feedback-driven v1.1:** dashboards, scores, streaks, AI summaries.

---

## Escalation to engineering

Open a git issue or chat thread with:

- Screenshot (no patient names)
- Role + screen
- Expected vs actual
- Blocker? (yes/no)

Link to ledger/`verify:audit-chain` only if the bug is “completion didn’t save.”

---

## Related

- Operating model: `daily-tasks-workflow.md`
- Staff app notes: `apps/hipaa-training/docs/DAILY-TASKS-SOP.md`
