# Provider Pages Implementation Plan

Generated: 2026-06-05  
**Prerequisite:** This audit pass (no implementation yet)

---

## Phase 1 — Audit and normalize existing provider copy

**Duration:** 1 sprint  
**Risk:** Low

| Task | Output |
|------|--------|
| Fix sitewide footer “California, California” via `site-chrome.mjs` | Consistent state list |
| Fix About team `alt=""` on provider thumbnails | Accessibility pass |
| Align credential wording across 3 profiles with `entity-graph.json` | Updated copy doc |
| Resolve homepage Dr. Pandey → link to Sneh profile | E-E-A-T |
| Document verified education/work for Sneh (Kiwi + internal source) | Credentials source file |
| Remove or source “5,000+ patients” claim | Legal/compliance sign-off |
| Normalize provider page footers through seo-build | Legal link parity |

**Exit criteria:** `PROVIDER-CONSISTENCY-AUDIT.md` High issues = 0

---

## Phase 2 — Reusable provider page template

**Duration:** 1–2 sprints

| Task | Output |
|------|--------|
| Refactor hero: **H1 = name**, emotional copy → `.provider-lp-hero-deck` | UI strategy compliance |
| Add `.provider-credential-card`, `.provider-state-chips`, `.provider-profile-meta` | CSS components |
| Mobile credential accordion | No credential walls |
| Single exit `cta-band` | Blog consistency parity |
| Optional: emotional deck toggle per provider | `heroDeck` field |

**Exit criteria:** One template HTML prototype rendered from mock data

---

## Phase 3 — Provider data model

**Duration:** 1 sprint

| Task | Output |
|------|--------|
| Create `data/providers.mjs` with 3 existing providers | Source of truth |
| Migrate `entity-graph.json` provider nodes from mjs | No dual maintenance |
| `scripts/generate-provider-pages.mjs` | Replaces hand HTML |
| Wire `clinical-entity.mjs` to mjs | Reviewer + schema |

**Exit criteria:** `npm run build` regenerates 3 identical-in-content profiles from data

---

## Phase 4 — Provider index page

**Duration:** 0.5 sprint

| Task | Output |
|------|--------|
| Create `/providers/index.html` via generator | Directory page |
| Add sitemap entry | Discovery |
| Link from About + optional nav | Internal linking |
| Breadcrumb: Home › Our providers › [Name] | Schema update |

**Exit criteria:** All profiles reachable in ≤2 clicks from homepage

---

## Phase 5 — Connect providers to reviewed content

**Duration:** ongoing (clinical ops)

| Task | Output |
|------|--------|
| Physician sign-off workflow for priority blogs/guides | Populated `content-review-registry.mjs` |
| `clinicalReviewBlock` shows linked provider | Live reviewedBy |
| Profile `reviewedContent` section auto-built | Bidirectional trust |
| Service page provider cards | State + focus filtered |

**Exit criteria:** ≥10 high-authority URLs show “Physician reviewed” with profile link

---

## Phase 6 — Schema and QA

**Duration:** 0.5 sprint

| Task | Output |
|------|--------|
| Extend `buildPhysicianGraph()` with credentials, services, dateModified | Richer JSON-LD |
| Provider OG images from headshots | Social proof |
| `npm run` provider QA script (lint credentials, states, links) | CI gate |
| Rich Results validation on 3 profiles + index | GSC-ready |

**Exit criteria:** `PROVIDER-PAGE-QA-CHECKLIST.md` all items pass on production

---

## Dependency graph

```
Phase 1 (normalize copy)
    ↓
Phase 3 (data model) ──→ Phase 2 (template via generator)
    ↓
Phase 4 (index)
    ↓
Phase 5 (review linkage) ← clinical sign-off (parallel)
    ↓
Phase 6 (schema + QA)
```

---

## What NOT to do in early phases

- Do not add provider #4 until Phases 1–3 complete
- Do not emit `reviewedBy` schema without registry entry
- Do not auto-assign reviewers in UI while registry empty
- Do not create per-state provider URLs prematurely
