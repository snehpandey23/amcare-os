# SEO opportunity audit — July 2026 GSC (technical pass)

**Scope:** Structure / technical SEO only. No new medical or clinical claims authored in this pass.  
**Date:** 2026-08-05  
**Source data:** July 2026 Search Console for siya.health (founder-provided).

---

## Part 1 — Page-by-page audit

### 1. `/blog/focalin-vs-adderall-comparison`

| Field | State |
|---|---|
| File | **Missing** — page was consolidated |
| Live behavior | `vercel.json` **301** → `/blog/vyvanse-vs-adderall-differences` |
| Title / meta / H1 | N/A |
| Schema | N/A |
| Word count | N/A |
| Inbound HTML links | **0** |
| Outbound | N/A |

**Implication for GSC:** ~695 impressions / pos ~19 for Focalin queries were attributed to a URL that no longer exists as a page. Consolidating Focalin → Vyvanse collapses two distinct search intents. **Recommendation executed in Part 2:** restore a dedicated Focalin URL as a **structural scaffold** with clinical placeholders (not auto-written comparison claims).

---

### 2. `/blog/vyvanse-vs-adderall-differences`

| Field | State (pre-fix) |
|---|---|
| Title | `Vyvanse vs Adderall: Which Lasts Longer for Adult ADHD? \| Siya Health` |
| Meta | Duration/onset/crash focused — decent, slightly narrow vs “differences” queries |
| H1 | `Vyvanse vs Adderall: Which Lasts Longer for Adults?` |
| H2s | Solid comparison outline **plus 5 empty H2 shells** (heading only) |
| Schema | `BlogPosting`, `FAQPage`, `BreadcrumbList`, `WebPage`, `Organization` |
| Word count | ~826 (inflated by empty headings) |
| FAQ on page | Yes (5 Q&As + FAQPage JSON-LD) |
| Inbound | **6** HTML files |
| Issues | Empty H2s hurt quality signals; breadcrumb name outdated; `og:type=website`; thin vs competitor comparison posts |

**Clinical gaps (flag only — do not invent):** comparison table (onset/duration/IR-XR mapping), special populations, switching protocols detail, patient question checklist with clinician-approved wording.

---

### 3. `/adhd-care`

| Field | State |
|---|---|
| Title | `Adult ADHD Diagnosis Online — Same-Week Evaluation \| Siya Health` |
| H1 | `Struggling to focus—even when you care?` (emotional; mismatches SERP title) |
| Schema | `WebPage`, `Organization`, `BreadcrumbList` only — **no FAQPage** despite on-page FAQ |
| Word count | ~1,527 |
| Inbound | Very high (nav/footer + body) |
| City intent | Single hub absorbing Miami/Orlando/etc. after geo-clone retirement; GSC city queries sit ~pos 30–40 |

---

### 4–5. Provider profiles

| Page | Title / H1 | Schema | Words | Inbound | Notes |
|---|---|---|---|---|---|
| `/providers/dr-natasha-desai` | Aligned name/H1 | `Physician` + `ProfilePage` ✅ | ~737 | 15 | OG image = logo; duplicate philosophy/approach copy |
| `/providers/dr-vanessa-urbina` | Aligned name/H1 | `Physician` + `ProfilePage` ✅ | ~675 | 18 | OG image = logo; body links CA ADHD blog despite FL license |

**Clinical/content gaps (flag):** expand unique bios, education lines (“not published”), more reviewed-content links, name-search supporting modules — human/clinical pass.

---

### City architecture note

Prior geo **blog** clones (`/blog/adhd-treatment-miami-fl`, etc.) were retired → `/adhd-care` or state hubs. That was correct for thin doorways, but left **no indexable city-intent URLs**. Part 3 scaffolds **new** `/adhd-care/{city}` service pages (not resurrecting thin blog clones) for Miami, Orlando, San Diego as a test set.

---

## Part 2–3 status (completed 2026-08-05)

| Item | Done |
|---|---|
| Restore `/blog/focalin-vs-adderall-comparison` scaffold; remove 301 | Yes |
| Vyvanse title/meta/H1/empty-H2/inbound/og:article | Yes |
| FAQPage on `/adhd-care` from existing FAQ copy | Yes |
| Provider OG → photo; Vanessa FL-appropriate links; content-gap flags | Yes |
| Inbound to Natasha/Vanessa from comparison + Adderall posts | Yes |
| City scaffolds `/adhd-care/{miami,orlando,san-diego}` + content checklist | Yes — see `ADHD-CITY-LANDING-CONTENT-NEEDED.md` |

**Confirmation:** Agent did **not** author dosing, comparative efficacy claims, city-specific provider availability, or other clinical assertions. Placeholders are explicitly marked `NEEDS CLINICAL REVIEW` / `NEEDS CONTENT`.
