# Main Agent Continuity Brief

**Purpose:** This agent is the ongoing main agent for Siya Health work. Prefer prior decisions over reinvention.  
**Reviewed:** 2026-07-22  
**Production:** https://siya.health · path `apps/siya-health`

When this doc conflicts with older reports, prefer **later** sources in this order:

1. `data/site-standards.mjs` (machine SOT — update first)
2. `docs/SIYA-STANDARDS.md` (human audit bible)
3. This continuity brief + `PROJECT-HANDOFF-JUNE-2026.md` (session memory; handoff may be stale on CTAs/booking)
4. Task-specific sprint reports
5. Older audits / `CURSOR-MASTER-PROMPT.md` (**obsolete** for CTAs)

---

## Sibling cloud agents (same repo)

| Agent | Branch / status | Carry forward |
|-------|-----------------|---------------|
| **Adhd women static post** (`bc-ab095c32…`) | `cursor/adhd-women-static-post-cf3d` · PR #1 draft · IDLE | Reuse `zoho-common/static-posts/adhd-in-women/` package; do not regenerate creatives/captions. Upload to WorkDrive Common still manual (TrueSync / OAuth). |
| Setup agents | env setup only | No product decisions |
| This agent | main continuity | Owns consistency going forward |

Zoho Common staging convention (from sibling agent):

```
apps/siya-health/zoho-common/
  README.md
  static-posts/<slug>/
    *.png + CAPTIONS.md + SOCIAL-HOOKS.md
```

Sync target on local TrueSync: WorkDrive **Common → static-posts/** (org folder under `ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd`).

---

## How to work (do not reinvent)

1. Edit **`data/*.mjs`** or hand-authored service HTML — not generated `answers/` / `providers/` / `legal/` as primary.
2. Run **`npm run build`** in `apps/siya-health` so `site-chrome.mjs` normalizes CTAs/footer.
3. Read the task-specific sprint report before changing that page.
4. Never fight chrome normalize rules by hardcoding banned CTA labels.

### Recommended reading order

1. `docs/SIYA-STANDARDS.md`
2. `data/site-standards.mjs`
3. `PROJECT-HANDOFF-JUNE-2026.md`
4. `docs/FINAL-STANDARDS-VERIFICATION-AUDIT.md`
5. `docs/FINAL-PREDEPLOY-COMPLIANCE-REPORT.md`
6. `docs/PROVIDER-EXPANSION-PREDEPLOY-GATE.md` + `PROVIDER-PUBLISHING-MINIMUMS.md`
7. `docs/PROVIDER-CONTENT-OWNERSHIP-MAP.md`
8. `docs/SITE-PRUNING-AUDIT.md` (proposed only — not executed)
9. Relevant `*-SPRINT*-REPORT.md`
10. `package.json` build + `scripts/site-chrome.mjs`

---

## Hard rules already decided

| Topic | Rule |
|-------|------|
| **Primary CTA** | **Talk to a Clinician** → CarePatron `BOOKING_LINK` in `data/providers-core.mjs` |
| **ADHD funnel CTA** | **Book ADHD Evaluation** (nav / ADHD primary) |
| **Banned labels** | Meet & Greet, Find the Right Starting Point, Join Waitlist, Book with {Name}, free discovery/consultation, etc. (`REMOVED_BOOKING_CTA_LABELS`) |
| **Pricing** | $199 / $79 / $149 · URL **`/pricing`** · `/membership-pricing` → 301 |
| **Siya Circle** | Footer Company + `/siya-circle` + `/answers` hub only — never hero/article body |
| **Psychiatry** | Not a psychiatry/psychology practice; ADHD is primary-care–led |
| **States** | Service = CA, TX, PA, FL only; provider licenses ≠ geography expansion |
| **Legal** | Canonical `/legal/*`; do not rewrite counsel Terms/Privacy/NPP body |
| **Hub copy** | `provider-hub-presentation.mjs` wins for `/providers` marketing teasers |
| **Credentials** | `internal-provider-records.mjs` wins on license/NPI conflicts |
| **Reviews** | No `reviewedBy` / “Physician reviewed” without `content-review-registry` + `signOffSource` |
| **Screening** | Screening is not diagnosis; ASRS deep-link `?start=asrs` |
| **Controlled substances** | Not prescribed at initial evaluation |
| **Education hub** | Name = **Health Guides** · URL `/answers` |

---

## Completed work to preserve

| Area | Outcome (do not redo from scratch) |
|------|-------------------------------------|
| Homepage | Symptom-first + Sprint A CTA/analytics shipped; founder B2 still strategy-only |
| ADHD Care | Sprints 1–3 evaluation-first; meds never guaranteed |
| Weight Loss | Sprints 1–4 metabolic/whole-person (not GLP-1 menu) |
| Telehealth | Sprint 1 situation-first narrative |
| Providers | 7 profiles + hub; psychiatry de-scoped |
| CTA cleanup | Three-slot hierarchy; mid-article CTAs stripped |
| Legal | 5 published `/legal/*`; GHL clickwrap engineering done |
| Cannibalization Phase 1 | Guide→blog overrides certified |
| Standards Phase 2 | Critical findings = 0 |

---

## Open gates (respect — do not pretend done)

- GHL field persistence / CS Agreement checkbox / chat legal checkboxes → deploy conditional NO-GO
- Credential + headshot backfill for providers
- Physician review Wave 1 (allowlist currently empty)
- Claim substantiation (`5,000+`, stars, verified testimonials)
- Site pruning audit **not executed** (166→76 proposed)
- Counsel sign-off on Cookie Policy + CS Agreement (ops-published)
- Unpublished: Telehealth Consent, Prescription Policy, standalone CS Policy
- Sprint B: wait for Sprint A measurement + founder sign-off
- Sibling PR #1: merge/upload ADHD-in-women statics to Zoho Common when ready

---

## Explicit do-not-do

- Reintroduce psychiatry practice positioning or guaranteed stimulants/diagnosis
- Expand service geography via provider licenses (esp. Derek OH)
- Edit counsel legal body text or effective date without counsel
- Put Siya Circle in heroes or as primary conversion CTA
- Restore Meet & Greet / Find the Right Starting Point as booking CTAs
- Emit false “Physician reviewed” badges
- Execute mass pruning without an explicit prune sprint
- Follow `CURSOR-MASTER-PROMPT.md` for CTAs (stale)
- Regenerate sibling ADHD-in-women creatives already on `cursor/adhd-women-static-post-cf3d`

---

## Prefer these contradictions resolutions

| Conflict | Prefer |
|----------|--------|
| Meet & Greet vs Talk to a Clinician | **Talk to a Clinician** (SIYA-STANDARDS) |
| Find the Right Starting Point on homepage | **Removed** (Sprint A + standards) |
| `/membership-pricing` vs `/pricing` | **`/pricing`** |
| GHL vs CarePatron for primary booking CTA | **CarePatron** for Talk to a Clinician; GHL for intake/clickwrap |
| Handoff booking narrative vs machine SOT | **Machine SOT** (`providers-core` + `site-standards`) |

---

## Stack reminder

Static HTML/CSS/vanilla JS · `npm run build` · Vercel `cleanUrls` · GTM `GTM-PLBD4TTQ` · CarePatron booking · GHL intake form `mnWpgh0IEgFvJymdZqHY`.
