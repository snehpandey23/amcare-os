# Staff portal — UX & internal-surface audit

**Scope:** What **Staff** (and **Admin**) see in production at https://siya-staff-assist.vercel.app  
**Audit date:** 2026-07-29  
**Automated checks:** `npm run qa:portal -w @amcare/hipaa-training-api` (health, proxy, auth-gated pulse when secrets set)  
**This doc:** Human-facing inventory + gaps — not a legal/compliance sign-off.

---

## Executive summary

| Area | Staff should see | Status |
|------|------------------|--------|
| v0.1-alpha / Internal Preview banner | **No** | **Removed** from header (was amber bar) |
| Memory / Constitution / Knowledge pillars | **No** (pilot) | **Hidden** — nav off, `/memory` redirects; Ask save-to-memory off |
| Trust / red-team / deployment gate UI | **No** (staff) | **Admin-only** route `/trust` (no nav link) |
| WorkDrive / git / Company Memory in Ask | **Sanitized** | Engine uses `staff-voice` on answers + source titles |
| Pilot / “internal preview” copy on My day | **No** | **Removed** when onboarding paused |
| Tasks + Team presence | **Yes** | My day + `/team` |
| SOP workspace | **Leads only** | Purple cards + Grow → SOPs |
| Admin tools | **Admins only** | Nav **Admin** + API `requireAdmin` + DB role refresh |

**Honest limit:** We have **not** run a full external pen test or UAT with every role in prod after every deploy. CI QA is smoke-level until `STAFF_PORTAL_QA_*` secrets are set.

---

## Removed or hidden (staff)

| Item | How |
|------|-----|
| Internal Preview · v0.1-alpha · Trust (admin) bar | Removed from `AssistantShell` |
| **Memory** nav + page | `isPortalMemoryEnabled()` default **false**; set `NEXT_PUBLIC_SIYA_PORTAL_MEMORY_ENABLED=1` to restore |
| Save to company memory (Ask) | Gated on same flag |
| End-shift “company memory” importance | Gated; accomplishments optional without memory wording when off |
| “Pilot mode” paragraph on My day | Hidden when `NEXT_PUBLIC_SIYA_PORTAL_PAUSE_ONBOARDING=1` |
| Login wall of Admin/Staff/SOP/self-registration text | Replaced with welcome + email/password |
| “Need access? Contact administrator” | Removed from login footer |

---

## Still visible (intentional)

| Surface | What staff see | Why keep |
|---------|----------------|----------|
| **Brand name SiyaOS** | Login welcome, header product name | Product name, not “alpha” label |
| **My day** | Tasks, team card, shift, focus, Ask entry | Core pilot |
| **Team** | Who’s working + today’s assignment titles | Meeting requirement |
| **Workspace (Grow)** | LMS stats, drills, **Department SOPs** (plain language) | Learning + lead SOP drafts |
| **Ask** | Help desk chat, “Based on: …” guide titles | Operations help |
| **Learn / Practice** | HIPAA LMS, Level Up | Training mandate |
| **HIPAA / PHI footer lines** | Ask safety line | Compliance |
| **Admin** nav | Only if account role = admin | Invites, task board, SOP review |
| **Lead-only purple cards** | “Responsible for … SOPs” | Only users assigned as dept leads |

---

## Admin-only (must not leak to staff)

| Route / feature | Gate |
|-----------------|------|
| `/admin/*` | UI: `isPortalAdmin`; API: `requireAdmin` + DB role on each request |
| `/trust` | `ClientShell` redirects non-admins to `/` |
| Trust dashboard content | Still shows **Internal Preview · 0.1-alpha** — **acceptable** (admin engineering view only) |
| Task board, templates, team invite, CSV attendance | Admin routes |

---

## Internal knowledge (backend — not in nav)

Still exists in repo/API; staff should not browse it as “product”:

- Git KB topics (`workspace-kb.generated.ts`) — **retrieval only** inside Ask, titles sanitized
- `/api/knowledge/*`, memory API — used when Memory enabled or admin tools; not linked for staff
- `docs/siyaos-knowledge-base/` — engineering source; not linked in UI

**Risk:** Ask can still **cite** a poorly titled live topic (e.g. long internal subtitle). Mitigation: `staffTopicLabel()` strips WorkDrive/SiyaOS suffixes; prefer renaming live topics in git for production.

---

## Release labels (v0.1-alpha) — where they still exist

| Location | Visible to staff? |
|----------|-------------------|
| `brand.ts` `RELEASE.version` | **No** (banner removed; used by trust JSON + docs) |
| `trust-status.json` | **Admin only** on `/trust` |
| `docs/*`, CI gate scripts | **No** (not in app UI) |
| Browser tab title | **No** — now “SiyaOS · Team portal” |

---

## QA automation status

| Check | Command / workflow |
|-------|-------------------|
| Prod smoke | `.github/workflows/siya-staff-portal-qa.yml` (needs GitHub secrets) |
| Staff red team (build) | `.github/workflows/siya-staff-safety.yml` |
| Manual 5-min smoke | `docs/QA-STAFF-PORTAL.md` |
| Pilot comms for team | `docs/PILOT-TEAM-GUIDE.md` |

---

## Recommended before “everyone on” comms

1. Set GitHub secrets `STAFF_PORTAL_QA_EMAIL` / `STAFF_PORTAL_QA_PASSWORD`; confirm green QA workflow.
2. One admin walkthrough: invite → lead assignment → task appears on **My day** + **Team**.
3. Rename any live KB topics whose titles still say “Company Memory” or “WorkDrive” (staff may see them under **Based on:** in Ask).
4. Keep **Memory off** until you have an owner and training for org capture.
5. Optional: rename nav **Workspace** → **Learn & SOPs** if “Workspace” confuses (product call — not code-required).

---

## Env flags (pilot tuning)

| Variable | Effect |
|----------|--------|
| `NEXT_PUBLIC_SIYA_PORTAL_PAUSE_ONBOARDING=1` | Skip forced onboarding; hide onboarding nag on My day |
| `NEXT_PUBLIC_SIYA_PORTAL_MEMORY_ENABLED` | unset = Memory hidden; `1` = restore Memory pillar |
| `NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN=1` | Portal login required |

---

## Change log (this audit pass)

- Removed internal preview banner  
- Memory gated off by default  
- Login + My day + Grow copy cleanup  
- Auth: DB role check; shift bar + Start shift  
- Team pulse for all staff  
- This audit document  

**Deploy:** Staff app must be redeployed for UI copy changes to match this report.
