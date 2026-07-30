# Siya Assistant — tests & gate (simple guide)

You do **not** need to memorize commands. After you **push to GitHub**, safety tests can run automatically (see below). This page is for when someone asks you to “run the gate” locally or you want to check status in the browser.

---

## What matters (plain English)

| Check | What it means |
|--------|----------------|
| **Red team** | We try to trick the bot with fake PHI, dosing questions, etc. **Must be 0 critical failures.** |
| **PHI probes** | Automated “don’t paste patient info” tests. |
| **Deployment gate** | Combines red team + KB size + other rules. **Can stay red** until the knowledge base is bigger (~80/100 content score). That’s OK for Internal Preview. |
| **Trust page** | One screen for leadership: [https://siya-staff-assist.vercel.app/trust](https://siya-staff-assist.vercel.app/trust) (after deploy). |

**Do not tell the whole company to use the assistant** until [DEPLOYMENT-GATE.md](./DEPLOYMENT-GATE.md) is fully checked and access is restricted (Level 1 pilot).

---

## Option A — Let GitHub do it (recommended)

1. Commit and **push** your branch to GitHub (`main` or a PR).
2. Open the repo on GitHub → **Actions** tab.
3. Open the latest **“Siya Staff — safety & build”** workflow run.
4. Green = red team passed and the app **builds**.  
   If **“Deployment gate (report)”** is yellow/red but red team is green, that usually means **content score** is still low — not that PHI tests failed.

You don’t run anything on your laptop for this.

---

## Option B — Run on your Mac (one copy-paste block)

Open **Terminal**, paste this, press Enter:

```bash
cd /Users/sp/amcare-os && npm ci && npm run red-team:staff -w @amcare/hipaa-training && npm run gate:deploy -w @amcare/hipaa-training; echo "Done (gate may exit 1 if KB content < 80 — see above)"
```

- **Red team failed** → do not deploy; ping whoever maintains `phi-guard` / tests.  
- **Red team passed, gate failed on “Knowledge content”** → safe to keep **Internal Preview**; keep filling live KB topics.  
- **Both passed** → still complete the **human checklist** in DEPLOYMENT-GATE.md before widening access.

---

## Option C — Deploy to Vercel (staff app only)

From the repo root (after tests you care about are green):

```bash
cd /Users/sp/amcare-os && npx vercel deploy --prod --yes --project siya-staff-assist --local-config vercel.siya-staff-assist.json
```

Deploying updates the website; it does **not** replace the checklist or red team.

---

## When something fails — what to send engineering

1. Screenshot of Terminal or GitHub Actions log.  
2. Say whether **“Staff red-team: X/X passed”** appears.  
3. Do **not** paste real patient information in Slack or email.

---

## Files (for your team, not daily use)

| File | Purpose |
|------|---------|
| `tests/red-team-staff.json` | Hand-written attack questions |
| `tests/red-team-staff-extra.ts` | More auto-generated cases |
| `data/red-team-last-run.json` | Last run result (updated by red team script) |
| `docs/DEPLOYMENT-GATE.md` | Human checklist — no exceptions |

---

## Custom GPT (ChatGPT) — separate track

Turn off **browsing** and public links in the GPT editor. Run the same **mental** tests manually until staff `/api/chat` red team is green. Upload **only** the compiled live knowledge package — not WorkDrive drafts.

Questions → Engineering or the person who owns `apps/hipaa-training`.
