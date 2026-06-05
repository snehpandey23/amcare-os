# Provider Pages Audit Summary

Generated: 2026-06-05  
Scope: `apps/siya-health/`  
Inspiration reference: [Kiwi Health — Sneh Pandey profile](https://www.kiwihealth.com/provider/TX/Pearland/Sneh-Pandey)

---

## 1. What provider pages exist now?

**Three handcrafted profile landing pages:**

| URL | Provider | Template |
|-----|----------|----------|
| `/providers/dr-sneh-pandey` | Dr. Sneh Pandey, MD — Medical Director | `provider-lp-*` |
| `/providers/dr-natasha-desai` | Dr. Natasha Desai, MD — Family & Behavioral Medicine | Same |
| `/providers/dr-swati-pandey` | Dr. Swati Pandey, MD — Psychiatric Physician | Same |

**Supporting surfaces (not full profiles):**

- `/about` — Medical Director highlight + 3 team cards with profile links
- `/` — Founder story block for Sneh (`dr-sneh-pandey-founder.png`) + testimonials
- **No** `/providers` index, **no** nav link, **no** provider cards on service pages

**Data layer (not yet page-generating):** `entity-graph.json`, `provider-index.json`, `clinical-entity.mjs`

---

## 2. What inconsistencies exist?

| Category | Top issues |
|----------|------------|
| **Sitewide** | Footer typo “California, California” on ~154 pages |
| **Accessibility** | Empty `alt` on About team provider thumbnails |
| **Copy** | Emotional H1 instead of name+credentials; generic “board-certified providers” on services without profile links |
| **Images** | Two Sneh headshots; OG images use logo not photo |
| **Review system** | 65 guides + 50 blogs pending review; `reviewerSlug` in seeds but registry empty — no live physician links |
| **Claims** | “5,000+ patients” on Sneh profile; on-page “verified” testimonials without source |
| **Legacy** | Provider page footers still point to `adhd.siya.health` legal URLs |

Full list: `PROVIDER-CONSISTENCY-AUDIT.md` (20 tracked issues)

---

## 3. What is the recommended provider page layout?

**Split hero + full-width stacked sections, no sidebar.**

- **Desktop:** Name/credentials/CTA left, 1:1 headshot + compact credential card right; emotional deck optional below lead.
- **Mobile:** Image first, then name/chips/CTAs; education in accordion.
- Reuse existing `.provider-lp-*` classes; add `.provider-credential-card`, `.provider-state-chips`, `.provider-profile-meta`.

Wireframes: `PROVIDER-PAGE-UI-STRATEGY.md`

**Kiwi patterns to adopt:** structured philosophy, education/work timeline, specialties/conditions with clear hierarchy. **Avoid:** unverified rating percentages and marketplace-style condition dumps.

---

## 4. What data model should be used?

**`data/providers.mjs`** as single source of truth, with fields:

`slug`, `name`, `credentials`, `role`, `photo`, `altText`, `statesLicensed`, `licenses`, `boardCertifications`, `clinicalFocus`, `services`, `languages`, `education`, `residency`, `fellowship`, `professionalMemberships`, `carePhilosophy`, `shortBio`, `longBio`, `reviewedContent`, `authoredContent`, `bookingLink`, `profileLastUpdated`, `credentialStatus`, plus schema helpers.

Generate pages via `generate-provider-pages.mjs`; sync `entity-graph.json` at build.

Full spec: `PROVIDER-SCALING-STRATEGY.md`

---

## 5. What should be implemented first?

**Phase 1 — Normalize existing copy (no new URLs)**

1. Fix footer California duplicate sitewide  
2. Fix About alt text  
3. Align hero semantics (name as H1) in template design  
4. Link homepage Sneh mentions to profile  
5. Source or remove volume/testimonial claims  

**Then Phase 3 → 2:** data model + generator before adding provider #4.

Plan: `PROVIDER-PAGES-IMPLEMENTATION-PLAN.md`

---

## 6. What should wait?

| Wait | Reason |
|------|--------|
| Provider #4+ profiles | Need data model + template first |
| `reviewedBy` schema on articles | Clinical sign-off registry empty |
| Per-state provider URLs | State hub strategy still `plannedUrl` only |
| Aggregate ratings on profiles | No verified aggregation source on Siya |
| NP/PA profiles | Separate schema/policy needed |
| Sticky mobile CTA | Optional; test after template stable |

---

## 7. Is the site ready to add more providers?

**Partially ready — not yet scalable.**

| Ready | Not ready |
|-------|-----------|
| 3 working profile URLs in sitemap | No `/providers` index |
| Strong narrative copy per physician | Hand-edited HTML per provider |
| `entity-graph.json` structure | Drift risk vs live HTML |
| `provider-lp-*` CSS system | No generator |
| Physician JSON-LD on profiles | Incomplete credentials in schema |
| Reviewer routing logic in code | No published reviewed content |

**Verdict:** Safe to market existing 3 providers; **not** ready to onboard a 4th provider without Phase 1–3 work. Estimated **3–4 sprints** to scalable multi-provider system.

---

## Document index

| Doc | Purpose |
|-----|---------|
| `PROVIDER-INVENTORY.md` | Roster, pages, images, schema |
| `PROVIDER-CONSISTENCY-AUDIT.md` | Issues + severity |
| `PROVIDER-PAGE-E-E-A-T-REQUIREMENTS.md` | Trust content standard |
| `PROVIDER-PAGE-UI-STRATEGY.md` | Layout + components |
| `PROVIDER-SCHEMA-STRATEGY.md` | JSON-LD recommendations |
| `PROVIDER-SCALING-STRATEGY.md` | `providers.mjs` + architecture |
| `PROVIDER-PAGES-IMPLEMENTATION-PLAN.md` | 6-phase rollout |
| `PROVIDER-PAGE-QA-CHECKLIST.md` | Pre-publish QA |

---

*Audit only — no code, content, or new provider pages were created.*
