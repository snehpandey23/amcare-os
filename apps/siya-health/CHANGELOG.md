# Siya Health website — CHANGELOG

Every **real** fix that ships (or was believed to ship) for `apps/siya-health` gets a row here.

| Column | Meaning |
|--------|---------|
| **Status** | `committed+live` = on `main`, deployed, checked on production URL · `committed` = on `main`, deploy/live verify not done · `WIP needs redo` = was verified in a dirty tree / stash / preview only — **not** on `main` · `open` = known follow-up, not blocking |
| **Verify** | How confidence was earned — be honest |

---

## Open follow-ups

| Opened | Item | Notes | Status |
|--------|------|-------|--------|
| 2026-08-16 | Wendy Delgado license numbers for **TX, PA, FL** | Founder confirmed all four states are real. Stash/SoT only has CA license number `20963`. Source numbers from credentialing records and add to `internal-provider-records.mjs` — **not** a deploy blocker tonight | `open` |
| 2026-08-16 | `/adhd-screening-results` outcome UI | Untracked `adhd-screening-results.js` + live HTML still old multi-card layout; needs matching HTML+JS commit | `WIP needs redo` |

---

## 2026-08-16 (tonight)

### Provider licensing + ads architecture (this commit)

| Date | Commit | What | Why | Verify | Status |
|------|--------|------|-----|--------|--------|
| 2026-08-16 | `b1984aa` | Promote Natasha (TX/FL/PA + NPI + education) and Wendy (CA/TX/PA/FL + generalist ADHD/women’s/weight/primary/telehealth + adhd-care roster) from `stash@{0}` → SoT; ads LPs inject care team from canonical; `validate-deploy-clean-tree` gate | End stash-only / dirty-tree reversion cycle; ads cards must match SoT | Clean-tree gate + live Playwright/Lighthouse ads smoke after deploy | `committed` → upgrade to `committed+live` after smoke |

### Earlier commits on main (git log)

| Date | Commit | What | Why | Verify | Status |
|------|--------|------|-----|--------|--------|
| 2026-08-16 | `6645d3a` | Separate CA ads LP from SEO hub; commit TX ads evaluation + screening pages | Stop cornerstone generator overwriting Ads URLs | Code + prior live checks in session | `committed+live` (pages 200; hero later fixed) |
| 2026-08-16 | `a2f7798` | Restore ads LP hero CSS (`.hero-merged__media`) + missing images | LCP heroes broken without tracked CSS/assets | Live visual (desktop/mobile) | `committed+live` |
| 2026-08-16 | `4cce408` | Fail-closed `validate-ads-landing.mjs` gate | Catch untracked Ads HTML/assets before deploy | Code review + gate in `npm run build` | `committed` |
| 2026-08-16 | `8d54455` | Live Ads LP smoke + Lighthouse gate | Catch prod drift after deploy | Scripted live smoke | `committed` |
| 2026-08-16 | `bf7fd7d` | Compact mobile cookie bar; retire screening Ads LPs → eval LPs | UX + funnel simplify | Code review | `committed+live` (screening URLs 301) |
| 2026-08-16 | `04ebc34` | WebKit smoke + LCP fail threshold for Ads LPs | Stricter Ads QA | Script | `committed` |
| 2026-08-16 | `db6338b` | Keep cookie Accept/Reject visible on mobile | Cookie UX regression | Code review | `committed` |
| 2026-08-16 | `5d4be2f` | Restore ASRS auto-advance and Next nudge | Screener UX | Code review | `committed` |
| 2026-08-16 | `ce916b7` | Smoke cookie Accept/Reject visibility | QA harness | Code review | `committed` |

### Was WIP — disposition

| Item | Disposition |
|------|-------------|
| Natasha/Wendy licensing in stash only | **Promoted to main** in this commit (founder-approved). Was never a silent revert — never committed before. |
| Ads hardcoded care-team cards | **Fixed structurally** — `injectMeetPhysiciansSection` on ads path; CA generator no longer uses `CA_CARE_TEAM`. |
| Screening-results outcome UI | Still **WIP needs redo** (separate session). |

---

## How to add a row

1. Ship a real commit on `main`.
2. Add a table row with hash, what, why.
3. Mark verify method honestly (`live Playwright` / `live curl+DOM` / `code review only`).
4. Only use `committed+live` after a production URL check against that commit’s deploy.
