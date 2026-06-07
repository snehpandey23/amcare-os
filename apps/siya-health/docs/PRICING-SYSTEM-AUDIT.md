# Siya Health — Pricing System Audit

**Audit date:** 2026-06-07  
**Scope:** 168 HTML pages under `apps/siya-health`  
**Canonical target model (care-delivery, all services):**

| Plan | Price | Billing |
|------|-------|---------|
| Initial Evaluation | **$199** | One-time |
| Non-Controlled Follow-Up Plan | **$79** | Per month |
| Controlled Medication Follow-Up Plan | **$149** | Per month |

**Artifacts:** `scripts/audit-pricing-system.mjs` → `data/pricing-system-audit.json`

---

## Executive summary

Siya Health’s **intended** pricing is a simple three-step care-delivery model ($199 → $79 or $149/month). Only **`/adhd-care`** approximates that model today—and even there, controlled follow-up is listed as **$150/month**, not $149.

The sitewide pricing hub **`/membership-pricing`** contradicts the target model entirely: it presents **Bronze / Silver / Gold** subscriptions ($79 / $149 / **$249** per month) with visit quotas, messaging SLAs, and concierge language, plus a **“Join the Waitlist”** CTA. **167 of 168 pages** link to this page in the footer as “Membership & pricing,” so most patient journeys end in the wrong framework.

**Patient clarity test (<30 seconds): FAIL.** A patient landing on `/membership-pricing` cannot answer “What am I paying for?” in one glance—they see three membership tiers, not one evaluation + two follow-up paths. A patient on `/weight-loss-metabolic-health` or `/telehealth` sees no dollar amounts at all, only a footer link to the conflicting membership page.

| Metric | Value |
|--------|-------|
| Total inconsistencies (issue instances) | **42** |
| Unique inconsistency types | **14** |
| Pages flagged for updates | **25** |
| Pages with any pricing mention | **48** |
| Pages with dollar amounts in body | **38** |
| Footer links to `/membership-pricing` | **167** |

**Recommended unified page:** Rename `/membership-pricing` → **`/pricing`** (“Care Pricing” in nav/footer). Replace Bronze/Silver/Gold with the single three-row care-delivery table. Retire “membership” as primary pricing vocabulary unless a true subscription product launches.

**Service applicability:** The $199/$79/$149 model *can* support all five service lines clinically, but the **website only fully explains it for ADHD**. Weight loss, telehealth, men’s health, and primary care lack local pricing tables and inherit the broken membership hub.

---

## Current state inventory (every pricing mention by page)

Legend: **$** = dollar amount in `<main>`; flags = membership / subscription / concierge / cash-pay / Bronze-Silver-Gold / pricing table / links to membership-pricing.

### Core pricing pages

| Route | Amounts | Key copy | Flags | Issues |
|-------|---------|----------|-------|--------|
| `/membership-pricing` | $79, $149, $249/mo | “Simple, Transparent **Membership-Based** Care”; Bronze (2 visits/mo), Silver (4 visits/mo), Gold (unlimited + **concierge**); FAQ: “Do I need a **membership** for ADHD?”; CTA: **Join the Waitlist**; cash-pay FAQ | membership, cash-pay, B/S/G, table | **6 critical/high** — wrong model |
| `/adhd-evaluation-cost` | $199 | “ADHD Evaluation Cost: **$199**”; ongoing care = “**monthly plan**” (no $79/$149); ADHD-specific title/H1 | links membership | **2 medium** — missing follow-up tiers |

### Service pages

| Route | Amounts | Key copy | Flags | Issues |
|-------|---------|----------|-------|--------|
| `/adhd-care` | **$199**, **$79**, **$150** | Full pricing table: Initial ADHD Evaluation $199; Non-Stimulant $79/mo; Stimulant Management **$150/mo**; “No subscription required” | subscription, table | **2 high** — $150 vs $149 |
| `/adhd-screening` | — | No prices; footer → membership-pricing | links membership | **1 high** |
| `/weight-loss-metabolic-health` | — | “Transparent pricing” trust line only; no $199/$79/$149 | links membership | **1 high** |
| `/telehealth` | — | “Transparent pricing” heading; no amounts | links membership | **1 high** |
| `/mens-health-longevity` | $199 (hero badge) | Hero: “**$199 Transparent Pricing**”; no follow-up breakdown | links membership | **1 medium** |
| `/primary-urgent-care` | $199 (hero) | Title: “**Concierge** Primary Care”; hero $199 badge | links membership | **1 medium** (+ concierge title) |
| `/prescriptions` | $199 (hero) | Hero badge only | links membership | **1 medium** |
| `/labs` | $199 (hero) | Hero badge only | links membership | **1 medium** |
| `/book-appointment` | $199 (hero) | Hero badge only | links membership | **1 medium** |

### ADHD funnel / geo / legacy duplicates (all ~$199 + vague “monthly plan”)

| Route | Amounts | Notes |
|-------|---------|-------|
| `/adult-adhd-diagnosis` | $199 | Duplicate pricing surface |
| `/adhd-treatment-online` | $199 | Duplicate pricing surface |
| `/online-adhd-test` | $199 | Duplicate pricing surface |
| `/creyos-adhd-testing` | $199 | Duplicate pricing surface |
| `/adhd-diagnosis-austin` | $199 | Geo SEO duplicate |
| `/adhd-diagnosis-houston` | $199 | Geo SEO duplicate |
| `/adhd-diagnosis-florida` | $199 | Geo SEO duplicate |
| `/adhd-diagnosis-pennsylvania` | $199 | Geo SEO duplicate |
| `/adhd-diagnosis-philadelphia` | $199 | Geo SEO duplicate |
| `/adhd-diagnosis-texas` | $199 | Geo SEO duplicate |

### Hub pages

| Route | Amounts | Key copy |
|-------|---------|----------|
| `/` (index) | — | Hero: “See **pricing & membership**”; pathway: “**Pricing & Membership**”; section id=`membership`: “See pricing & membership →”; FAQ links `/adhd-evaluation-cost` + `/membership-pricing` |
| `/about` | — | “transparent pricing”; link: “View **Membership & Pricing**” |

### Provider pages (`/providers/*`)

| Route | Pricing mention |
|-------|-----------------|
| `/providers/dr-sneh-pandey` | In-body: “**View pricing →**” → `/membership-pricing` |
| All 8 provider pages + index | Footer: “Membership & pricing” (no dollar amounts) |

### Health guides (`/answers/*`) — pricing mentions only

| Route | Amounts | Key copy |
|-------|---------|----------|
| `/answers/what-included-199-adhd-evaluation` | $199 | ADHD-specific; follow-up = “separate **membership pricing**” |
| `/answers/how-much-does-adhd-testing-cost` | $199 | Market comparison $500–$2,000+ vs Siya $199 |
| `/answers/telehealth-adhd-texas` | $199 | “Transparent $199 evaluation pricing” |
| `/answers/fsa-hsa-adhd-evaluation` | — | “Not all **membership** or coaching fees qualify” |
| `/answers/meet-and-greet-telehealth-expectations` | — | “evaluation-only vs **membership follow-up**”; links membership-pricing |
| `/answers/starting-adhd-medication-adults` | — | Link: “Membership & follow-up pricing” |
| `/answers/index` | — | Lists “$199 ADHD evaluation” guide |
| ~60 other guides | — | Footer only: “Membership & pricing” |

### Blog (`/blog/*`) — pricing mentions only

| Route | Amounts | Key copy |
|-------|---------|----------|
| `/blog/adhd-evaluation-cost-texas` | $199, $149/mo | Full ADHD cost article; ongoing = **$149/month** only (no $79) |
| `/blog/online-adhd-diagnosis-texas` | $199, $149/mo | Same pattern |
| `/blog/how-to-know-if-you-have-adhd-adult` | $199, $149/mo | Same pattern |
| `/blog/adhd-symptoms-overlooked` | $199, $149/mo | Same pattern |
| `/blog/is-online-adhd-diagnosis-legit` | $199 | Evaluation only |
| `/blog/adhd-evaluation-cost-california` | — | Educational; **no Siya dollar amounts** (thin content) |
| `/blog/index` | $199 (hero badge) | Hero trust bar |
| `/blog/after-adhd-diagnosis-next-steps-adults` | — | Inline link: “pricing & membership” |
| ~50 other posts | — | Footer only |

### Navigation & footer (sitewide)

| Location | Current label | Target |
|----------|---------------|--------|
| Primary nav (all pages) | **No pricing link** | Add “Care Pricing” |
| Footer Company column (167 pages) | “**Membership & pricing**” → `/membership-pricing` | “**Care pricing**” → `/pricing` |
| Homepage hero / pathways | “pricing & **membership**” | “See care pricing” |

### Legal / terms

| Route | Note |
|-------|------|
| `/legal/controlled-substance-treatment-agreement` | “Controlled substances not prescribed during **initial evaluation**” (aligned) |
| `/legal/terms-of-use` | Liability cap $100 (unrelated) |

---

## Inconsistency matrix

| # | Type | Severity | Count | Canonical expectation | What site shows instead | Primary locations |
|---|------|----------|-------|----------------------|-------------------------|-------------------|
| 1 | **legacy-membership-tiers** | Critical | 1 | 3 care-delivery plans | Bronze / Silver / Gold subscriptions | `/membership-pricing` |
| 2 | **79-as-bronze-tier** | Critical | 1 | $79 = Non-Controlled Follow-Up | $79 = Bronze (2 visits/mo) | `/membership-pricing` |
| 3 | **149-as-silver-tier** | Critical | 1 | $149 = Controlled Follow-Up | $149 = Silver (4 visits/mo) | `/membership-pricing` |
| 4 | **orphan-price-249** | High | 1 | Not in model | $249 Gold tier | `/membership-pricing` |
| 5 | **membership-waitlist-vs-live-pricing** | High | 1 | Bookable pricing | “Join the Waitlist” | `/membership-pricing` |
| 6 | **membership-without-evaluation-anchor** | High | 1 | $199 Initial Evaluation first | No $199 on membership page | `/membership-pricing` |
| 7 | **stimulant-price-150** | High | 1 | $149 controlled follow-up | $150/month stimulant | `/adhd-care` |
| 8 | **service-links-membership-no-local-pricing** | High | 3 | Service page shows 3-plan snippet | No amounts; footer → wrong hub | `/adhd-screening`, `/telehealth`, `/weight-loss-metabolic-health` |
| 9 | **vague-monthly-plan** | Medium | 11 | Name $79 or $149 plan | “monthly plan if clinically appropriate” | ADHD funnel pages, `/adhd-evaluation-cost`, etc. |
| 10 | **adhd-only-follow-up-149** | Medium | 4 | Universal plan names + both tiers | “$149/month” ADHD ongoing only | 4 Texas ADHD blog posts |
| 11 | **hero-199-without-breakdown** | Medium | 5 | Explain Initial Evaluation | Hero badge “$199 Transparent Pricing” only | labs, prescriptions, book-appointment, mens-health, primary-urgent-care |
| 12 | **evaluation-cost-page-missing-follow-up-tiers** | Medium | 1 | Full 3-row table | $199 only | `/adhd-evaluation-cost` |
| 13 | **duplicate-adhd-pricing-surface** | Low | 10 | Canonical: `/adhd-care` + `/pricing` | 10 near-duplicate ADHD pricing pages | Geo + funnel pages |
| 14 | **membership-vocabulary-sitewide** | High* | 167 | “Care pricing” / “follow-up plans” | “Membership & pricing” footer | All pages (*manual finding, not auto-counted) |

**Membership vs subscription confusion:** `/membership-pricing` uses subscription framing (“Cancel Anytime”, per-month tiers, visit counts). `/adhd-care` correctly says “No subscription required” for the evaluation—direct contradiction.

**Concierge confusion:** `/primary-urgent-care` is titled “Concierge Primary Care”; `/membership-pricing` Gold tier advertises “Concierge care coordination.” Patients may assume primary care *is* the $249 Gold membership.

**Cash-pay confusion:** Cash-pay is stated on membership FAQ only. Service pages say “No insurance required” or “transparent pricing” without tying to the $199/$79/$149 structure.

---

## Pages requiring updates (with exact issues)

### P0 — Must fix before any pricing marketing

| Page | Exact issues |
|------|----------------|
| **`/membership-pricing`** | Replace Bronze/Silver/Gold ($79/$149/$249) with care-delivery table; add $199 Initial Evaluation; remove waitlist CTA or gate page until live; drop “membership-based” H1; align FAQ to follow-up plans not tiers; rename route to `/pricing` |
| **`/adhd-care`** | Change **$150 → $149**; rename “Ongoing Care — Stimulant Management” → **Controlled Medication Follow-Up Plan**; rename non-stimulant → **Non-Controlled Follow-Up Plan**; rename “Initial ADHD Evaluation” → **Initial Evaluation** (service-agnostic) with ADHD as example |
| **`/`** | Replace “pricing & membership” with “care pricing”; link to `/pricing`; add 3-line price summary in hero or pathway card ($199 / $79 / $149) |
| **`/about`** | “View Membership & Pricing” → “View care pricing” |

### P1 — Service lines & ADHD canonicalization

| Page | Exact issues |
|------|----------------|
| **`/weight-loss-metabolic-health`** | Add pricing snippet (Initial Evaluation $199; GLP-1 follow-up = Non-Controlled $79 or Controlled $149 as clinically indicated); link to `/pricing` |
| **`/telehealth`** | Same pricing snippet + table link |
| **`/mens-health-longevity`** | Replace hero-only $199 with evaluation + follow-up context (TRT/controlled → $149 tier) |
| **`/primary-urgent-care`** | Remove or clarify “Concierge” in title; map primary care to Initial Evaluation + Non-Controlled follow-up |
| **`/prescriptions`**, **`/labs`**, **`/book-appointment`** | Hero $199 → “Initial Evaluation from $199” + link to full pricing |
| **`/adhd-screening`** | Add one-line: “Full evaluation $199 — see care pricing” |
| **`/adhd-evaluation-cost`** | Add $79/$149 follow-up rows OR slim to SEO intro + redirect CTA to `/pricing` |
| **10 ADHD funnel/geo pages** | Replace “monthly plan” with “$79 or $149 follow-up plans”; remove duplicate pricing sections; keep geo H1, link to `/adhd-care#pricing` |
| **4 blog posts** (TX ADHD) | Add $79 non-controlled tier; use universal plan names; link `/pricing` not membership |
| **`/answers/what-included-199-adhd-evaluation`** | Replace “membership pricing” with “follow-up plan pricing ($79 or $149/month)” |
| **`/providers/dr-sneh-pandey`** | “View pricing” → `/pricing` |
| **Footer (167 pages)** | “Membership & pricing” → “Care pricing” |

### P2 — Polish & SEO hygiene

| Page | Exact issues |
|------|----------------|
| **`/blog/adhd-evaluation-cost-california`** | Add explicit Siya $199/$79/$149 or consolidate with TX post |
| **`/creyos-adhd-testing`**, **`/online-adhd-test`**, **`/adult-adhd-diagnosis`**, **`/adhd-treatment-online`** | Deduplicate pricing blocks; canonical links |
| Remaining health guides with “membership” in body | Swap to “follow-up plan” language |

---

## Pages requiring deletion

**None recommended for hard deletion.** Pricing confusion is fixable in place or via redirect.

**Optional deprioritization (not delete):**

- `/blog/adhd-evaluation-cost-california` — thin, no Siya prices; merge into canonical cost content or noindex until rewritten.

---

## Pages requiring redirect (source → target)

| Source | Target | Rationale |
|--------|--------|-----------|
| `/membership-pricing` | **`/pricing`** | URL rename when care-delivery page ships (301) |
| `/adhd-evaluation-cost` | **`/pricing#initial-evaluation`** | Overlaps `/adhd-care` + unified pricing; keep SEO via 301 (or retain as ADHD-specific landing with canonical to `/pricing`) |
| `/adult-adhd-diagnosis` | `/adhd-care` | Funnel duplicate (existing pattern) |
| `/adhd-treatment-online` | `/adhd-care` | Funnel duplicate |
| `/online-adhd-test` | `/adhd-screening` | Screening canonical |
| Geo pages (`/adhd-diagnosis-*`) | **Keep URLs** | SEO; strip embedded pricing tables → link `/pricing` |

---

## FINAL RECOMMENDED PRICING ARCHITECTURE

### Navigation labels

| Location | Label | Href |
|----------|-------|------|
| Primary nav | **Care Pricing** | `/pricing` |
| Footer Company | **Care pricing** | `/pricing` |
| Homepage hero secondary | **See care pricing** | `/pricing` |
| Service page CTA secondary | **View pricing** | `/pricing` |
| Provider pages | **View care pricing →** | `/pricing` |

**Retire:** “Membership & pricing”, “pricing & membership”, “Join the Waitlist” (unless membership product actually launches).

### Page names

| Current | Recommended |
|---------|-------------|
| `membership-pricing.html` | **`pricing.html`** (`/pricing`) |
| Title: “Membership & Pricing” | **“Care Pricing \| Siya Health”** |
| H1: “Membership-Based Care” | **“Simple, Transparent Care Pricing”** |

Keep `/adhd-care` as the **service landing** with an embedded pricing section—but **`/pricing` is the single source of truth** for all services.

### CTA wording

| Context | Wording |
|---------|---------|
| New patient (any service) | **Book initial evaluation — $199** |
| After evaluation / ongoing | **Start follow-up care — from $79/month** |
| Controlled meds (ADHD stimulants, GLP-1 where controlled, TRT) | **Controlled medication follow-up — $149/month** |
| Pricing hub final CTA | **Book your evaluation** (not “Join the Waitlist”) |
| Screening | **Take free screening** (unchanged) |

### Pricing table copy (single sitewide table)

Use this exact structure on `/pricing`, in footer expandable FAQ, and as a reusable component on service pages:

---

**Initial Evaluation — $199 (one-time)**  
60–90 minute video visit with a board-certified provider. Clinical history, condition-specific assessment tools as appropriate, comorbidity screening, and a documented care plan. Applies to ADHD, weight loss, primary care, telehealth, and men’s health intake. Medication never guaranteed. Controlled substances are not prescribed at the initial visit.

**Non-Controlled Follow-Up Plan — $79/month**  
Ongoing care when your plan does not require controlled-substance monitoring: medication management for non-controlled medications, regular follow-ups, and treatment adjustments. Cancel anytime.

**Controlled Medication Follow-Up Plan — $149/month**  
For patients on controlled medications (e.g., ADHD stimulants, GLP-1s, testosterone when clinically appropriate): enhanced monitoring, required drug screening and pill counts where applicable, and monthly follow-ups per state and clinical requirements. Cancel anytime.

*Cash-pay practice. FSA/HSA often accepted for clinical visits. Medication pharmacy costs are separate.*

---

### FAQ recommendations (sitewide standard set)

1. **What does the $199 initial evaluation include?** — 60–90 min visit, assessment tools as clinically appropriate, documented plan; not a guarantee of medication or controlled substances at visit one.

2. **What’s the difference between the $79 and $149 monthly plans?** — $79 is for non-controlled follow-up; $149 includes controlled-medication monitoring requirements (PDMP, drug screens, pill counts as applicable).

3. **Do I need a monthly plan?** — No. The evaluation is one-time. Monthly plans are optional for ongoing medication management and follow-up.

4. **Is this a membership or subscription?** — No tiered membership. You pay per visit ($199) or choose a month-to-month follow-up plan. Cancel anytime.

5. **Do you take insurance?** — Cash-pay for simplicity; many patients use FSA/HSA. We do not bill insurance for these visits today.

6. **Does the $199 include medication?** — No. The evaluation fee is for the clinical visit. Pharmacy costs are separate if medication is prescribed.

7. **Can I use the same pricing for ADHD, weight loss, and primary care?** — Yes. These are universal care-delivery plans; your clinician determines which path fits your condition and medication class.

8. **What does “concierge” mean at Siya?** — We do not offer a separate concierge membership. Primary and telehealth care use the same transparent evaluation and follow-up pricing above.

---

## Service applicability matrix ($199 / $79 / $149 per service line)

| Service line | Initial $199 | Non-Controlled $79 | Controlled $149 | Site support today | Gap |
|--------------|:------------:|:------------------:|:---------------:|-------------------|-----|
| **ADHD** | ✅ Evaluation | ✅ Non-stimulant / non-controlled | ✅ Stimulant ($150 on site) | **Partial** — only `/adhd-care` has full table | $150 typo; ADHD-specific naming; 10 duplicate pages |
| **Weight loss** | ✅ Metabolic intake visit | ✅ Non-controlled GLP-1 adjuncts, lifestyle meds | ✅ GLP-1 / controlled monitoring | **No** — `/weight-loss-metabolic-health` has zero dollar amounts | Patients cannot see price on service page |
| **Primary care** | ✅ New patient / complex intake | ✅ Chronic non-controlled management | ⚠️ If controlled meds prescribed | **No** — “Concierge” title + hero $199 only | Concierge conflated with Gold tier |
| **Telehealth** | ✅ First structured visit | ✅ Ongoing non-controlled | ✅ Controlled pathways | **No** — “Transparent pricing” text only | No table, wrong footer destination |
| **Men's health** | ✅ Hormone / longevity intake | ✅ Non-controlled supplements, etc. | ✅ TRT monitoring | **Partial** — hero $199 badge only | No follow-up tier explanation |

**Verdict:** The pricing **model** supports all five lines. The **website** does not—except partially for ADHD—and the membership hub actively undermines all lines.

---

## Implementation priority

### P0 — Blocking patient clarity

1. Rebuild `/membership-pricing` as `/pricing` with the unified 3-plan table and standard FAQs.
2. Fix `/adhd-care` $150 → $149 and universal plan names.
3. Update homepage + about CTAs; add nav link “Care Pricing”.
4. Sitewide footer: “Care pricing” → `/pricing`.

### P1 — Service parity & message consistency

5. Add pricing snippet component to weight loss, telehealth, men’s health, primary care, prescriptions, labs, book-appointment, adhd-screening.
6. Update 4 Texas ADHD blog posts + key health guides (`what-included-199`, `meet-and-greet`, `fsa-hsa`).
7. Clarify/remove “Concierge” on primary-urgent-care unless product exists.
8. 301 `/membership-pricing` → `/pricing`; decide canonical strategy for `/adhd-evaluation-cost`.

### P2 — SEO deduplication & cleanup

9. Strip duplicate pricing sections from 10 ADHD funnel/geo pages (keep geo copy, link out).
10. Provider page pricing links.
11. Rewrite or merge `/blog/adhd-evaluation-cost-california`.
12. Re-run `node scripts/audit-pricing-system.mjs` — target: **0 critical/high inconsistencies**.

---

## Appendix: Manual validation notes

### `membership-pricing.html`

- H1: “Simple, Transparent **Membership-Based** Care”
- Tiers: Bronze $79/mo, Silver $149/mo, Gold **$249/mo** with “**Concierge** care coordination”
- Comparison table: appointments/month, messaging SLAs, coaching — not clinical follow-up semantics
- FAQ: “Do I need a **membership** for ADHD?” — frames evaluation as optional entry to membership
- Final CTA: “**Join the Waitlist**” — implies pricing is not live

### `adhd-care.html`

- Closest to target model: $199 + $79 + $150 (should be $149)
- ADHD-specific plan titles (“Initial **ADHD** Evaluation”, “Non-Stimulant”, “Stimulant Management”)
- Good: “No subscription required to get answers” on evaluation card

### `adhd-evaluation-cost.html`

- Strong $199 transparency for ADHD SEO
- Weak: “Ongoing medication management is available on a **monthly plan**” with no amounts
- Banner points to `/adhd-care` as canonical pathway (good)
- Does not link to membership-pricing in body (good) but footer still does

---

*Generated by `scripts/audit-pricing-system.mjs`. Re-run after implementation to refresh counts.*
