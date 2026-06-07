# Patient-Facing Hygiene Audit — Siya Health

**Generated:** 2026-06-07  
**Scope:** `/Users/sp/amcare-os/apps/siya-health` — all `*.html` (232 files)  
**Mode:** Read-only audit — no HTML was modified.

---

## Executive summary

| Metric | Count |
|--------|------:|
| HTML files scanned | **232** (164 production root + 68 `public/` mirror copies) |
| Pages with ≥1 flagged issue | **198** |
| Total issue instances (automated + manual) | **275+** |
| Duplicate long paragraphs (≥5 pages each) | **109** distinct hashes |
| View-source-only findings | **1** |

### Severity totals (automated scan)

| Severity | Instances | Primary themes |
|----------|----------:|----------------|
| **CRITICAL** | 1 | Internal documentation path visible in page body |
| **HIGH** | 62 | “Coming soon” service pages, deprecated membership/discovery-call copy in `public/`, generator boilerplate on GLP-1 blogs, internal SEO jargon on geo pages, unverified provider stat |
| **MEDIUM** | 206 | CTA repetition, ADHD-CCSP / geo licensing inconsistencies, editorial meta-disclosures, evidence-row placeholders, duplicate H1 |
| **LOW** | 6 | Generic icon alt patterns on homepage/service pages; view-source HTML comment |

### Headline findings

1. **`visual-components.html` exposes an internal component library** including a live link to `docs/VISUAL-CONTENT-ARCHITECTURE-AUDIT.md` — the only CRITICAL patient-visible leak in production root pages.
2. **`labs.html` and `prescriptions.html`** are indexed service pages whose hero and body say **“Coming soon”** while still offering “Talk to a Clinician” booking CTAs.
3. **The `public/` directory (68 HTML files)** contains stale mirrors with deprecated **membership pricing**, **“discovery call”**, **“Meet & Greet”**, and **“Board-certified, ADHD-CCSP trained providers”** copy not present on updated root pages.
4. **20 GLP-1 / weight-loss blog posts** (10 root + 10 `public/` mirrors) share an identical **compounded-vs-branded regulatory paragraph** appended by the content generator — reads as boilerplate, not article-specific care.
5. **125 pages** repeat **“Talk to a Clinician”** four or more times (header + mobile nav + in-content CTAs + footer).
6. **No encoding defects** (`&rsquo;`, `&amp;amp;`, literal `&nbsp;` in decoded visible text) were found after HTML entity decoding across all 232 files.

---

## Methodology

1. **Automated Node.js scan** of every `*.html` under `/Users/sp/amcare-os/apps/siya-health`:
   - Extracted patient-visible text from `<body>` after stripping `<script>`, `<style>`, and HTML comments.
   - Decoded HTML entities before encoding checks; flagged double-escaped source separately.
   - Detected placeholders, dev/doc leakage, provider credential patterns, patient-jargon, duplicate H1s, CTA counts, and paragraph hashing (>100 chars, flagged when identical on ≥5 pages).
   - HTML comments with TODO/FIXME tracked separately as view-source-only.
2. **Manual spot-check** of high-risk pages listed in the audit brief.
3. **Severity assignment** per brief: CRITICAL = internal paths / implementation jargon patients see; HIGH = deprecated copy, wrong credentials, generator boilerplate, intentional “coming soon” on key services; MEDIUM = CTA duplication, credential inconsistency, repeated paragraphs; LOW = view-source comments, benign entity usage.

**Production vs mirror:** Root paths (e.g. `/labs`) are the intended patient surface. The `public/` subtree duplicates many pages with older copy and relative asset paths — flagged where content diverges from root.

---

## Manual spot-check — high-risk pages

| Page | Path | Verdict |
|------|------|---------|
| Visual component library | `/Users/sp/amcare-os/apps/siya-health/visual-components.html` | **CRITICAL** — internal dev page; references internal docs and code patterns |
| Secure intake | `/Users/sp/amcare-os/apps/siya-health/intake/index.html` | **Acceptable** — `noindex`; patient-appropriate legal gate; no PHI on page |
| Labs | `/Users/sp/amcare-os/apps/siya-health/labs.html` | **HIGH** — indexed “Coming soon” with booking CTAs |
| Prescriptions | `/Users/sp/amcare-os/apps/siya-health/prescriptions.html` | **HIGH** — same pattern as labs |
| Membership pricing | `/Users/sp/amcare-os/apps/siya-health/public/membership-pricing.html` only | **HIGH** — stale mirror; root uses `/pricing` instead |
| Dr. Sneh Pandey | `/Users/sp/amcare-os/apps/siya-health/providers/dr-sneh-pandey.html` | **HIGH/MEDIUM** — visible “5,000+ patients” claim; view-source TODO on verification |
| Geo page (root) | `/Users/sp/amcare-os/apps/siya-health/adhd-diagnosis-texas.html` | **MEDIUM** — “canonical starting point” banner; otherwise updated licensing copy |
| Geo page (public mirror) | `/Users/sp/amcare-os/apps/siya-health/public/adhd-diagnosis-texas.html` | **HIGH** — stale “Board-certified, ADHD-CCSP trained providers” + old booking widget |
| GLP-1 blog | `/Users/sp/amcare-os/apps/siya-health/blog/glp1-side-effects-and-how-to-manage-them.html` | **HIGH** — generator regulatory boilerplate block |

---

## CRITICAL

### C-1 — Internal documentation path visible on component library page

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/visual-components |
| **File** | `/Users/sp/amcare-os/apps/siya-health/visual-components.html` |
| **Exact visible text** | `See docs/VISUAL-CONTENT-ARCHITECTURE-AUDIT.md for placement map across all page types.` |
| **Why patients see it** | Rendered as a footer paragraph on a publicly reachable page (robots `noindex`, but URL is not auth-gated). |
| **Recommended replacement** | Remove page from production deploy entirely, or replace with patient-safe content. If kept for internal QA, gate behind auth and remove all `docs/` references. |

### C-2 — Full internal developer component library exposed in body

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/visual-components |
| **File** | `/Users/sp/amcare-os/apps/siya-health/visual-components.html` |
| **Exact visible text (representative)** | `Siya Health Visual Component Library` · `Reusable diagrams for Health Guides, service pages, and blog articles. Use .siya-diagram wrapper classes from styles.css.` · `Use on: /answers/what-is-food-noise` · HTML snippet in `<pre>` showing implementation markup |
| **Why patients see it** | Entire `<main>` is an internal style guide, not clinical or marketing content. |
| **Recommended replacement** | Do not publish to patient domain. Move to internal docs or a staging-only host. |

---

## HIGH

### H-1 — “Coming soon” on indexed Labs service page

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/labs |
| **File** | `/Users/sp/amcare-os/apps/siya-health/labs.html` |
| **Exact visible text** | Hero: `Convenient lab testing to support ADHD treatment, weight loss programs, and preventive care. Coming soon.` · Section H2: `Lab Services — Coming Soon` |
| **Why patients see it** | Page is `index, follow` with full site chrome and “Talk to a Clinician” CTAs — patients land here from nav/footer expecting bookable labs. |
| **Recommended replacement** | Either launch lab ordering copy + workflow, or `noindex` and remove from primary nav until live. Replace “Coming soon” with a waitlist or “labs ordered through your clinician after evaluation” if partially available. |

### H-2 — “Coming soon” on indexed Prescriptions service page

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/prescriptions |
| **File** | `/Users/sp/amcare-os/apps/siya-health/prescriptions.html` |
| **Exact visible text** | Hero: `Provider-reviewed prescriptions for urgent care, men's health, skin conditions, refills. Coming soon.` · Section H2: `Prescription Services — Coming Soon` |
| **Why patients see it** | Same as H-1 — indexed service URL with booking CTAs contradicts “coming soon.” |
| **Recommended replacement** | Publish async/refill prescription workflow copy, or de-index and delink until launch. |

### H-3 — “Coming soon” on public mirror copies

| Field | Value |
|-------|-------|
| **URLs** | https://siya.health/public/labs · https://siya.health/public/prescriptions |
| **Files** | `/Users/sp/amcare-os/apps/siya-health/public/labs.html` · `/Users/sp/amcare-os/apps/siya-health/public/prescriptions.html` |
| **Exact visible text** | Same “Coming soon” strings as H-1/H-2 |
| **Why patients see it** | Stale deploy mirror may still be reachable depending on hosting config. |
| **Recommended replacement** | Remove `public/` HTML from deploy artifact or sync with root; prefer single source of truth. |

### H-4 — Deprecated membership-pricing page (public mirror only)

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/public/membership-pricing |
| **File** | `/Users/sp/amcare-os/apps/siya-health/public/membership-pricing.html` |
| **Exact visible text** | H1: `Simple, Transparent Membership-Based Care` · `Direct access to a board-certified provider. No insurance barriers.` · CTA: `Join the Waitlist` · `Book a discovery call—no obligation.` |
| **Why patients see it** | Entire page promotes deprecated membership model; canonical points to `/membership-pricing` but production root uses `/pricing` instead. |
| **Recommended replacement** | Delete mirror or 301 to https://siya.health/pricing. Replace “membership-based care” / “discovery call” with current care-delivery pricing language. |

**Note:** Root `/Users/sp/amcare-os/apps/siya-health/pricing.html` (https://siya.health/pricing) is **clean** — uses “Transparent pricing for physician-led care” and explicit `$199 / $79 / $149` plans.

### H-5 — “Discovery call” deprecated terminology (public mirrors only)

| Field | Value |
|-------|-------|
| **URLs** | https://siya.health/public/adhd-screening · https://siya.health/public/membership-pricing · https://siya.health/public/blog/adhd-evaluation-cost-texas · https://siya.health/public/blog/adhd-symptoms-overlooked · https://siya.health/public/blog/how-to-know-if-you-have-adhd-adult · https://siya.health/public/blog/is-online-adhd-diagnosis-legit · https://siya.health/public/blog/online-adhd-diagnosis-texas |
| **Exact visible text (representative)** | `Book Your Free 15-Minute Discovery Call` · `We offer a free discovery call, a $199 full evaluation…` · `A free discovery call — Ask questions, understand the process…` |
| **Why patients see it** | Stale `public/` copies retain pre-rebrand visit naming. Root production pages no longer use “discovery call.” |
| **Recommended replacement** | Sync mirrors to root or remove from deploy. Use “introductory telehealth visit” or link to https://siya.health/answers/meet-and-greet-telehealth-expectations (which itself needs renaming — see H-6). |

### H-6 — “Meet & Greet” brand term in live blog body copy

| Field | Value |
|-------|-------|
| **URLs** | https://siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps · https://siya.health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know · https://siya.health/blog/why-am-i-always-tired-causes-when-to-see-doctor |
| **Files** | `/Users/sp/amcare-os/apps/siya-health/blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` · `…/free-testosterone-vs-total-testosterone-what-patients-should-know.html` · `…/why-am-i-always-tired-causes-when-to-see-doctor.html` |
| **Exact visible text** | `Meet & Greet — clarify goals…` · `A Meet & Greet at Siya Health is a short telehealth conversation…` · `A Meet & Greet at Siya Health is an informational telehealth visit…` |
| **Why patients see it** | In-article care-pathway CTAs use retired internal product name. |
| **Recommended replacement** | Replace with “introductory visit” or “first telehealth visit” aligned with `/answers/meet-and-greet-telehealth-expectations` slug rename strategy. |

### H-7 — “Meet & Greet” on stale public provider mirrors

| Field | Value |
|-------|-------|
| **URLs** | https://siya.health/public/providers/dr-natasha-desai · https://siya.health/public/providers/dr-sneh-pandey · https://siya.health/public/providers/dr-swati-pandey |
| **Why patients see it** | Older provider page templates in `public/` |
| **Recommended replacement** | Remove mirrors or sync from root `/providers/*` pages. |

### H-8 — GLP-1 regulatory boilerplate repeated across 20 blog posts

| Field | Value |
|-------|-------|
| **Exact visible text** | `Branded and generic FDA-approved products follow manufacturing standards audited by regulators. Compounded formulations exist in a different regulatory context; quality varies by pharmacy, and not all compounded versions are appropriate substitutes for approved drugs. This article does not tell you which route to choose—it emphasizes asking your clinician and pharmacist where a product is made, whether it aligns with evidence and law, and what monitoring plan accompanies it.` |
| **Why patients see it** | Identical `<p>` injected near “Compounded products, branding, and pharmacy quality” heading on every GLP-1 cluster article — reads as auto-generated filler unrelated to article topic (e.g. side effects, phentermine, tirzepatide). |
| **Recommended replacement** | Keep one site-wide disclaimer module OR tailor 1–2 sentences per article. Remove duplicate block from posts where compounding is not the focus. |

**Root URLs (10):**

- https://siya.health/blog/combining-adhd-treatment-and-weight-loss-strategies
- https://siya.health/blog/compounded-vs-branded-glp1-medications
- https://siya.health/blog/glp1-side-effects-and-how-to-manage-them
- https://siya.health/blog/how-mental-health-affects-weight-loss-outcomes
- https://siya.health/blog/long-term-weight-loss-medications-what-to-expect
- https://siya.health/blog/medical-weight-loss-vs-dieting-what-actually-works
- https://siya.health/blog/oral-vs-injectable-weight-loss-medications
- https://siya.health/blog/phentermine-for-weight-loss-safety-and-effectiveness
- https://siya.health/blog/semaglutide-for-weight-loss-how-it-works
- https://siya.health/blog/tirzepatide-vs-semaglutide-which-is-better

**Public mirror URLs (10):** same slugs under `https://siya.health/public/blog/…`

### H-9 — Additional identical GLP-1 generator blocks (same 20 pages each)

Each block below appears verbatim on the same 20 URLs as H-8:

| ID | Exact visible text (truncated) | Recommended replacement |
|----|-------------------------------|-------------------------|
| H-9a | `Medical weight loss programs typically consider BMI, weight-related conditions (such as hypertension, dyslipidemia, prediabetes, or obstructive sleep apnea)…` | Article-specific eligibility paragraph or single shared component rendered once |
| H-9b | `Pregnancy, planning pregnancy, breastfeeding, active eating disorders in acute crisis…` | Move to site-wide safety callout; don’t repeat per article |
| H-9c | `GLP-1 receptor agonists used for weight management require structured follow-up: monitoring gastrointestinal tolerance…` | Tailor to article topic or collapse to footer disclaimer |
| H-9d | `If you have a history of pancreatitis, medullary thyroid carcinoma or MEN2…` | Keep once in GLP-1 hub page |
| H-9e | `Impulsivity, emotional eating, sleep deprivation, and untreated ADHD or depression can undermine nutrition plans…` | Remove from non-mental-health articles |
| H-9f | `Ask how often you will be seen, what labs or vitals are tracked…` | Replace with one “questions for your visit” module |

### H-10 — “Board-certified, ADHD-CCSP trained providers” on stale geo mirrors

| Field | Value |
|-------|-------|
| **Exact visible text** | `Board-certified, ADHD-CCSP trained providers review your history, use validated tools (ASRS, Creyos), and screen for common co-occurring conditions.` (Step 2 flow card) |
| **Why patients see it** | Implies all ADHD-CCSP-trained clinicians are board-certified physicians; NPs/PAs on care team. Root pages were updated to “Licensed, ADHD-CCSP–trained clinicians” but `public/` mirrors were not. |
| **Recommended replacement** | Sync to root copy: `Licensed, ADHD-CCSP–trained clinicians review your history, use validated assessment tools as clinically appropriate…` |

**URLs (11 public mirrors):**

- https://siya.health/public/adhd-diagnosis-austin
- https://siya.health/public/adhd-diagnosis-florida
- https://siya.health/public/adhd-diagnosis-houston
- https://siya.health/public/adhd-diagnosis-pennsylvania
- https://siya.health/public/adhd-diagnosis-philadelphia
- https://siya.health/public/adhd-diagnosis-texas
- https://siya.health/public/adhd-evaluation-cost
- https://siya.health/public/adhd-treatment-online
- https://siya.health/public/adult-adhd-diagnosis
- https://siya.health/public/creyos-adhd-testing
- https://siya.health/public/online-adhd-test

### H-11 — Unverified “5,000+ patients” stat on provider page

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/providers/dr-sneh-pandey |
| **File** | `/Users/sp/amcare-os/apps/siya-health/providers/dr-sneh-pandey.html` |
| **Exact visible text** | `I've supported 5,000+ patients in structured weight-loss programs.` |
| **Why patients see it** | Marketing claim in “Why patients choose Dr. Pandey” section; HTML comment `<!-- TODO:VERIFY-SOURCE — "5,000+ patients" requires documented source -->` confirms uncertainty (view-source only, but claim is visible). |
| **Recommended replacement** | Remove until sourced, or replace with verifiable metric (e.g. “Medical Director overseeing structured weight-loss pathways at Siya Health”). |

**Also on stale mirror:** https://siya.health/public/providers/dr-sneh-pandey · https://siya.health/public/weight-loss-metabolic-health

### H-12 — “Physician assistant” in care-team explainer (vs modern “Physician Associate”)

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/providers |
| **File** | `/Users/sp/amcare-os/apps/siya-health/providers/index.html` |
| **Exact visible text** | `…you may work with a physician, nurse practitioner, or physician assistant.` |
| **Why patients see it** | Site elsewhere uses **Physician Associate** for Wendy Delgado (homepage, provider profile). Inconsistent credential language. |
| **Recommended replacement** | `…physician, nurse practitioner, or physician associate (PA).` Match AAPA-preferred title used on `/providers/wendy-delgado`. |

### H-13 — Internal SEO jargon: “canonical starting point” on geo/funnel pages

| Field | Value |
|-------|-------|
| **Exact visible text** | `Main ADHD pathway: ADHD Care is our canonical starting point for evaluation, screening, and treatment planning.` |
| **Why patients see it** | ADHD funnel banner at top of geo landing pages — “canonical” is implementation/SEO vocabulary, not patient language. |
| **Recommended replacement** | `Start here: ADHD Care is our main page for evaluation, screening, and treatment planning.` |

**URLs (10 root production pages):**

- https://siya.health/adhd-diagnosis-austin
- https://siya.health/adhd-diagnosis-florida
- https://siya.health/adhd-diagnosis-houston
- https://siya.health/adhd-diagnosis-pennsylvania
- https://siya.health/adhd-diagnosis-philadelphia
- https://siya.health/adhd-diagnosis-texas
- https://siya.health/adhd-treatment-online
- https://siya.health/adult-adhd-diagnosis
- https://siya.health/creyos-adhd-testing
- https://siya.health/online-adhd-test

---

## MEDIUM

### M-1 — Duplicate H1 on ADHD screening funnel

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/adhd-screening |
| **File** | `/Users/sp/amcare-os/apps/siya-health/adhd-screening.html` |
| **Exact visible text** | H1 #1: `What are you looking for help with?` · H1 #2: `Free ADHD Screening` |
| **Why patients see it** | Multi-step funnel renders two `<h1>` tags as user progresses — both can exist in DOM. |
| **Recommended replacement** | Use one `<h1>` per document state; demote step titles to `<h2>`. |

### M-2 — Editorial meta-disclosure visible to patients on Health Guides

| Field | Value |
|-------|-------|
| **Exact visible text** | `This Health Guide is scoped for a single FAQ-style question. Our clinical article goes deeper on evidence, risks, monitoring, and what to discuss with your clinician.` |
| **Why patients see it** | Content-strategy note rendered in guide body — tells patients about internal content architecture. |
| **Recommended replacement** | Replace with patient-facing bridge: `Want more detail? Read our full article on [topic].` Remove “scoped for a single FAQ-style question.” |

**URLs (37 Health Guides):**

https://siya.health/answers/adderall-vs-vyvanse-adults · /answers/adhd-medication-every-day · /answers/adhd-medication-side-effects · /answers/afternoon-energy-crash-after-lunch · /answers/brain-fog-after-eating · /answers/can-sleep-apnea-cause-fatigue · /answers/compounded-vs-branded-glp-1 · /answers/food-noise-returned-on-glp-1 · /answers/glp-1-nausea-management · /answers/glp-1-side-effects · /answers/high-shbg-low-free-testosterone · /answers/insulin-resistance-without-diabetes · /answers/is-adhd-medication-safe-long-term · /answers/is-online-adhd-diagnosis-legitimate · /answers/medical-weight-loss-vs-dieting · /answers/minoxidil-hair-loss-does-it-work · /answers/non-stimulant-adhd-medications · /answers/normal-a1c-insulin-resistance · /answers/oral-vs-injectable-weight-loss-meds · /answers/oral-vs-topical-minoxidil · /answers/phentermine-weight-loss-safety · /answers/poor-sleep-feels-like-adhd · /answers/semaglutide-weight-loss-how-it-works · /answers/signs-of-sleep-apnea-in-adults · /answers/sildenafil-erectile-dysfunction-expectations · /answers/telehealth-adhd-california · /answers/tirzepatide-vs-semaglutide · /answers/trt-monitoring-requirements · /answers/weight-gain-after-stopping-ozempic · /answers/what-does-low-testosterone-feel-like · /answers/what-is-food-noise · /answers/what-is-free-testosterone · /answers/what-is-insulin-resistance · /answers/when-is-testosterone-therapy-appropriate · /answers/who-qualifies-glp-1-weight-loss · /answers/why-am-i-tired-even-after-sleeping · /answers/why-normal-labs-dont-mean-healthy

### M-3 — Evidence rows with identical label and body (placeholder generator output)

| Field | Value |
|-------|-------|
| **Pattern** | `<dt>Label</dt><dd>Label</dd>` — description repeats title with no added citation detail |
| **Exact visible text (examples)** | `ADHD-CCSP evaluation standards` / `ADHD-CCSP evaluation standards` · `Manufacturer titration schedules` / `Manufacturer titration schedules` · `Clinical evaluation standards` / `Clinical evaluation standards` |
| **Why patients see it** | “Evidence” accordion looks unfinished — undermines E-E-A-T |
| **Recommended replacement** | Add real citation text, PMID/guideline year, or remove row until sourced |

**Affected:** 51 answer pages under `/Users/sp/amcare-os/apps/siya-health/answers/` (all Health Guides with `blog-engage-evidence-row` blocks).

### M-4 — ADHD-CCSP spelling / hyphenation inconsistency

| Variant | Example location | Recommended standard |
|---------|------------------|------------------------|
| `ADHD-CCSP certified` | https://siya.health/adhd-care (trust badge) | `ADHD-CCSP–trained` or spell out once: `ADHD Clinical Services Provider Program (ADHD-CCSP)` |
| `ADHD-CCSP–trained clinicians` | Geo pages (root) | Preferred clinical copy |
| `ADHD-CCSP` bare | Provider cards, meta | OK when paired with spelled-out form on first use |
| `ADHD-CCSP trained` (no hyphen before “trained”) | `public/` geo mirrors only | Fix to en-dash form: `ADHD-CCSP–trained` |

### M-5 — “Talk to a Clinician” repeated 4+ times per page

| Field | Value |
|-------|-------|
| **Pattern** | Header CTA + mobile nav CTA + 1–3 in-content CTAs + footer = 4–9 instances |
| **Why patients see it** | Repetitive CTAs add noise without increasing conversion; worst on Health Guides designed for reading |
| **Recommended replacement** | Cap at 2 per page (header + one contextual end-of-article CTA). Use condition-specific labels (“Book ADHD evaluation”) on funnel pages. |

**125 URLs flagged** — full list from automated scan:

https://siya.health/ · /about (6) · /adhd-evaluation-cost (4) · /answers/* (65 guides, 4–9 each) · /blog/* (38 posts + hub, 4–5 each) · /book-appointment (4) · /labs (5) · /mens-health-longevity (6) · /prescriptions (5) · /primary-urgent-care (6) · /privacy-policy (4) · /providers (4) · /providers/derek-timbs (6) · /providers/dr-natasha-desai (5) · /providers/dr-sneh-pandey (6) · /providers/dr-swati-pandey (5) · /providers/dr-vanessa-urbina (6) · /providers/megan-wunderlich (5) · /providers/wendy-delgado (6) · /siya-circle (4) · /telehealth (6) · /terms (4) · /weight-loss-metabolic-health (7)

*(Number in parentheses = CTA count on that page.)*

**Highest counts:** `/answers/meet-and-greet-telehealth-expectations` (9) · `/answers/how-online-prescriptions-work` (7) · `/answers/is-telehealth-legitimate` (7) · `/weight-loss-metabolic-health` (7) · `/` homepage (6)

### M-6 — Site-wide footer / disclaimer paragraph duplication

| Exact visible text | Page count | Severity note |
|--------------------|------------|---------------|
| `Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.` | 162 root pages | Acceptable if intentional — but reads robotic when identical on every page |
| `Educational only: This page is for general education—not personal medical advice, diagnosis, or treatment. See a licensed clinician for your situation.` | 65 Health Guides | Appropriate legally; consider shorter variant |
| `For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations.` | 55 pages | Appropriate |

**Recommended replacement:** Keep legal disclaimers; vary footer trust line by page type or shorten to “Licensed telehealth in CA, TX, PA, and FL.”

### M-7 — Geo page hero secondary link uses internal label

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/adhd-diagnosis-texas (and sibling geo pages) |
| **Exact visible text** | `Main ADHD care page` (link text in hero lead) |
| **Why patients see it** | Internal nav label, not patient-facing words |
| **Recommended replacement** | `Learn about ADHD evaluation and care` or `Explore ADHD Care →` |

### M-8 — Meet-and-greet Health Guide URL slug vs patient-facing H1

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/answers/meet-and-greet-telehealth-expectations |
| **Visible H1** | `What should I expect from a first telehealth visit?` |
| **Issue** | Slug retains deprecated “meet-and-greet”; page body describes visit accurately but URL/bookmarks expose old term |
| **Recommended replacement** | Redirect slug to `/answers/first-telehealth-visit-expectations` when ready; update inbound links |

---

## LOW

### L-1 — View-source HTML comment on provider page

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/providers/dr-sneh-pandey |
| **File** | `/Users/sp/amcare-os/apps/siya-health/providers/dr-sneh-pandey.html` |
| **View-source text** | `<!-- TODO:VERIFY-SOURCE — "5,000+ patients" requires documented source -->` |
| **Patient visibility** | Not rendered — view-source / devtools only |
| **Recommended replacement** | Resolve H-11 claim; remove comment |

### L-2 — Generic icon `alt` patterns (≥3 per page)

| Field | Value |
|-------|-------|
| **URLs** | https://siya.health/ · https://siya.health/adhd-care · https://siya.health/public/ · https://siya.health/public/adhd-care · https://siya.health/public/about |
| **Pattern** | Decorative service icons with missing or generic alt (e.g. `icon1`) |
| **Why it matters** | Accessibility — screen readers get poor labels |
| **Recommended replacement** | `alt=""` for decorative icons with `aria-hidden="true"`, or descriptive alts (“Stethoscope icon — telehealth visits”) |

### L-3 — Near-empty card components on homepage

| Field | Value |
|-------|-------|
| **URLs** | https://siya.health/ · https://siya.health/adhd-care (+ `public/` mirrors) |
| **Why flagged** | Card regions with <15 chars visible text after strip — likely icon-only cards |
| **Recommended replacement** | Verify visually; add visible headings or `aria-label` on cards |

### L-4 — HTML entity encoding

| Field | Value |
|-------|-------|
| **Finding** | **No issues** — curly quotes and apostrophes use valid entities (`&amp;`, `&rsquo;`) that decode correctly in rendered text |
| **Action** | None |

### L-5 — GoHighLevel named in Cookie Policy

| Field | Value |
|-------|-------|
| **URL** | https://siya.health/legal/cookie-policy |
| **Exact visible text** | `LeadConnector / GoHighLevel (GHL) — booking widgets, chat widgets…` |
| **Assessment** | Appropriate vendor disclosure for cookie policy — **not a hygiene defect** |
| **Action** | None |

---

## Items verified clean (spot-check)

| Page | Notes |
|------|-------|
| `/Users/sp/amcare-os/apps/siya-health/intake/index.html` | Legal acceptance gate; `noindex`; no internal paths in body |
| `/Users/sp/amcare-os/apps/siya-health/pricing.html` | Current pricing model; no “membership pricing” language |
| Root geo pages (e.g. `adhd-diagnosis-texas.html`) | Updated “Licensed, ADHD-CCSP–trained clinicians” in Step 2 — **except** funnel banner (H-13) |
| Encoding across 232 files | No double-escaped entities or literal entity strings in decoded visible text |

---

## Recommended remediation priority

1. **Immediate:** Remove or gate `visual-components.html` (C-1, C-2).
2. **This sprint:** Resolve labs/prescriptions “coming soon” vs indexed + CTA conflict (H-1, H-2); remove or sync `public/` deploy mirrors (H-3–H-7, H-10).
3. **Content pass:** Strip GLP-1 generator boilerplate blocks (H-8, H-9); verify Dr. Pandey patient stat (H-11).
4. **Copy consistency:** Physician Associate terminology (H-12); ADHD-CCSP variants (M-4); replace “canonical starting point” (H-13).
5. **UX polish:** CTA deduplication (M-5); duplicate H1 on screening (M-1); evidence row citations (M-3).

---

## Appendix — file inventory

| Location | HTML count | Role |
|----------|------------:|------|
| `/Users/sp/amcare-os/apps/siya-health/` (root, excl. `public/`) | 164 | Production patient site |
| `/Users/sp/amcare-os/apps/siya-health/public/` | 68 | Stale mirrors — many diverge from root |
| **Total** | **232** | |

---

*Audit performed read-only. No HTML files were modified.*
