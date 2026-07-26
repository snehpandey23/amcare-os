# Siya Health — Sitewide Audit Standards

> **All future audits must compare against this file.**

**Version:** 2026-06-07  
**Scope:** Patient-facing copy, CTAs, pricing, providers, state coverage, footer, and service-page messaging hierarchies across `apps/siya-health/`.

**Machine-readable companion:** [`data/site-standards.mjs`](../data/site-standards.mjs) — states, pricing, CTA system, provider canonical roles, ADHD positioning blocks, legal links, and normalize rules. This markdown is the **human audit bible**; update `site-standards.mjs` first when machine-enforceable values change, then mirror here.

**Related provider data:**

| File | Use |
|------|-----|
| `data/providers.mjs` + `data/providers-additional.mjs` | Profile pages, `SERVICE_PROVIDER_SLUGS`, homepage fields |
| `data/provider-hub-presentation.mjs` | Founder-approved hub card copy (overrides profile marketing when patient-facing) |
| `data/siya-circle-config.mjs` | Newsletter URLs, topics, compliance copy |
| `scripts/site-chrome.mjs` | Footer columns, nav, injected care-team blocks |

---

## Table of contents

1. [Brand positioning](#1-brand-positioning)
2. [Provider positioning](#2-provider-positioning)
3. [Pricing](#3-pricing)
4. [CTA hierarchy](#4-cta-hierarchy)
5. [State coverage](#5-state-coverage)
6. [Footer rules](#6-footer-rules)
7. [Siya Circle rules](#7-siya-circle-rules)
8. [Homepage messaging hierarchy](#8-homepage-messaging-hierarchy)
9. [Weight loss messaging hierarchy](#9-weight-loss-messaging-hierarchy)
10. [ADHD messaging hierarchy](#10-adhd-messaging-hierarchy)
11. [Telehealth messaging hierarchy](#11-telehealth-messaging-hierarchy)

---

## 1. Brand positioning

### Identity

Siya Health is a **physician-led telehealth practice** for adults—not a psychiatry practice, psychology practice, membership marketplace, or medication vending machine.

| Element | Canonical value |
|---------|-----------------|
| Entity (administrative) | **Siya Health Inc.** — administrative and non-clinical support |
| Entity (clinical) | **Siya Healthcare, PLLC** — medical services via licensed clinicians |
| Entity statement (legal surfaces) | *Siya Health Inc. provides administrative and non-clinical support services. Medical services are provided by Siya Healthcare, PLLC through licensed clinicians.* |
| Legal effective date (display) | **October 31, 2025** |
| Base URL | `https://siya.health` |
| Education hub name | **Health Guides** (URL `/answers` — never "Answers Hub", "Clinical Answers") |
| Provider hub nav label | **Our Care Team** (`/providers`) |
| Pricing nav label | **Pricing** (`/pricing`) |

### Brand pillars (patient-facing)

Use these phrases; do not substitute legacy marketplace language:

- Physician-led telehealth
- Whole-person care
- Evidence-based medicine
- Transparent pricing
- Long-term relationships
- Licensed clinicians
- Board-certified physicians *(physicians only — not NPs/PAs)*
- HIPAA-compliant

### Service lines (equal brand weight)

ADHD is a **primary acquisition channel** but **not** the sole brand identity. All lines are valid entry points:

| Service | Canonical path |
|---------|----------------|
| ADHD evaluation & care | `/adhd-care` |
| Medical weight loss & metabolic health | `/weight-loss-metabolic-health` |
| Telehealth / primary-style care | `/telehealth` |
| Men's health & longevity | `/mens-health-longevity` |
| Primary & urgent care | `/primary-urgent-care` |
| Free ADHD screening | `/adhd-screening` |
| Pricing | `/pricing` |

### Tone & framing

| Do | Don't |
|----|-------|
| Symptom recognition → structured evaluation → individualized plan | Service catalog / medication menu first |
| "Screening is not diagnosis" | Imply quizzes = diagnosis |
| "Evaluation does not guarantee medication" | Guarantee stimulants or first-visit Rx |
| "Primary care–led evaluation" for ADHD | "Psychiatry practice" or "ADHD clinic only" |
| Transparent cash pricing, FSA/HSA | Bronze/Silver/Gold membership tiers |
| Licensed, ADHD-CCSP–trained **clinicians** on mixed rosters | "Board-certified" when roster includes NP/PA |

### Legacy phrases — replace sitewide

| Legacy | Canonical replacement |
|--------|----------------------|
| membership-based care | physician-led telehealth |
| concierge membership | transparent pricing |
| Join the Waitlist / Join Waitlist | Talk to a Clinician |
| Membership & pricing | Pricing |
| `/membership-pricing` links | `/pricing` |

### Trust signals (sitewide)

- HIPAA Compliant badge
- LegitScript seal (`https://www.legitscript.com/websites/?checker_keywords=siya.health`)
- Creyos Cognitive Testing logo (ADHD evaluation context)
- Contact: **(215) 445-1244** · **care@siya.health**

---

## 2. Provider positioning

### Source hierarchy (conflicts)

1. `data/internal-provider-records.mjs` — license states, NPI, credential status
2. `data/providers.mjs` + `providers-additional.mjs` — profiles, service rosters
3. `data/provider-hub-presentation.mjs` — hub cards & founder-approved teasers
4. `data/site-standards.mjs` → `PROVIDER_CANONICAL` — audit role/credentials/focus
5. `scripts/site-chrome.mjs` — homepage cards, service-page `#meet-physicians`

**Rule:** Hub presentation wins for patient-facing marketing copy unless clinically inaccurate. `PROVIDER_CANONICAL` wins for audit role titles and focus lists.

### Canonical roster (7 contracted clinicians)

| Slug | Display name | Role (audit) | Credentials (audit) | License states (service) | License states (transparency only) |
|------|--------------|--------------|---------------------|--------------------------|-------------------------------------|
| `dr-sneh-pandey` | Dr. Sneh Pandey, MD | Medical Director · Internal Medicine Physician | Board-certified Internal Medicine · Diplomate, American Board of Obesity Medicine · ADHD-CCSP | CA, TX, PA, FL | — |
| `dr-natasha-desai` | Dr. Natasha Desai, MD | Family Medicine Physician | ADHD-CCSP | TX, FL | — |
| `dr-swati-pandey` | Dr. Swati Pandey, MD | Internal Medicine Physician | ADHD-CCSP | PA | — |
| `dr-vanessa-urbina` | Dr. Vanessa Urbina, MD | Family Medicine Physician | Family Medicine | FL | — |
| `megan-wunderlich` | Megan Wunderlich, FNP-C | Family Nurse Practitioner | FNP-C | PA | — |
| `derek-timbs` | Derek Timbs, FNP-BC | Family Nurse Practitioner | FNP-BC | TX | OH (license-only chip) |
| `wendy-delgado` | Wendy Delgado, PA-C | Physician Assistant | PA-C | CA | — |

**ADHD-CCSP formatting:** First mention per page → `ADHD-CCSP (ADHD Clinical Services Provider Program)`; subsequent → `ADHD-CCSP`.

**State chip formats:**

| Surface | Format | Example |
|---------|--------|---------|
| Profile pages, `/providers` hub | Full names | California · Texas |
| Homepage, compact service cards | Abbreviations | CA, TX, PA, FL |
| Inline prose | Full names with "and" before last | California, Texas, Pennsylvania, and Florida |

**Provider license disclaimer** (when showing license chips):

> Provider licenses are displayed for transparency. Service availability is determined by Siya Healthcare, PLLC operational coverage.

### Clinical focus by provider (`PROVIDER_CANONICAL.focus`)

| Provider | Focus areas |
|----------|-------------|
| Dr. Sneh Pandey | Internal Medicine, Obesity Medicine, ADHD, Metabolic Health, Weight Management, Primary Care |
| Dr. Natasha Desai | Family Medicine, ADHD, Mental Health |
| Dr. Swati Pandey | Internal Medicine, Women's Health, ADHD, Mental Health, Metabolic Health |
| Dr. Vanessa Urbina | Family Medicine, Primary Care, ADHD, Weight Management, Community Practice Experience |
| Megan Wunderlich | Mental Health, ADHD, Family Medicine |
| Derek Timbs | Weight Loss, Men's Health, Metabolic Care |
| Wendy Delgado | Weight Loss, Metabolic Care |

### Service page rosters (`SERVICE_PROVIDER_SLUGS`)

| Service key | Page | Assigned slugs |
|-------------|------|----------------|
| `adhd-care` | `/adhd-care` | dr-sneh-pandey, dr-vanessa-urbina, dr-natasha-desai, dr-swati-pandey, megan-wunderlich |
| `weight-loss-metabolic-health` | `/weight-loss-metabolic-health` | dr-sneh-pandey, dr-vanessa-urbina, derek-timbs, wendy-delgado |
| `telehealth` | `/telehealth` | dr-sneh-pandey, dr-natasha-desai, dr-swati-pandey, dr-vanessa-urbina, megan-wunderlich, derek-timbs |
| `primary-urgent-care` | `/primary-urgent-care` | dr-vanessa-urbina, dr-natasha-desai, dr-sneh-pandey |
| `mens-health-longevity` | `/mens-health-longevity` | dr-sneh-pandey, derek-timbs |

### ADHD care team taglines (`ADHD_CARE_PROVIDER_TAGLINES`)

| Slug | Service-page tagline |
|------|---------------------|
| dr-sneh-pandey | Medical Director · Adult ADHD evaluation & care |
| dr-vanessa-urbina | Adult ADHD & primary care |
| dr-natasha-desai | Adult ADHD & behavioral medicine |
| dr-swati-pandey | Adult ADHD & mental health |
| megan-wunderlich | Adult ADHD & mental health |

*Wendy Delgado is **not** on the ADHD service roster.*

### Hub card descriptions (`provider-hub-presentation.mjs`)

Use these teasers on `/providers` index cards:

- **Dr. Pandey:** Structured evaluations, personalized care plans; focus, weight, energy, long-term health connection.
- **Dr. Urbina:** Family medicine + local practice experience; primary care, ADHD, mental health, weight management.
- **Dr. Desai:** Family medicine + ADHD-CCSP; attention symptoms overlapping anxiety, stress, sleep, emotional overwhelm.
- **Dr. Swati Pandey:** Thoughtful primary care; women's health, mood, focus, PCOS-related concerns, long-term wellness.
- **Megan Wunderlich:** Telehealth primary care, mental health, ADHD-related needs within physician-led model.
- **Derek Timbs:** Weight management, men's health, metabolic care, lifestyle-focused wellness.
- **Wendy Delgado:** Telehealth medical weight loss and metabolic care within physician-led model.

---

## 3. Pricing

### Canonical care-delivery model (all service lines)

**Not ADHD-specific.** One evaluation + two follow-up paths. No Bronze/Silver/Gold tiers.

| Plan | Price | Billing | Description |
|------|-------|---------|-------------|
| **Initial Evaluation** | **$199** | One-time visit | Structured clinician visit: history, goals, and a clear plan. Applies to ADHD, weight, metabolic, primary care, and telehealth pathways. |
| **Non-Controlled Medication Follow-Up** | **$79** | /month | Ongoing follow-up for non-controlled medications, lifestyle plans, labs review, and care coordination when appropriate. |
| **Controlled Medication Follow-Up** | **$149** | /month | Ongoing follow-up when controlled medications are part of your plan—including monitoring, dose adjustments, and safety checks per state law. |

### Paths & labels

| Element | Value |
|---------|-------|
| Canonical pricing URL | `/pricing` |
| Legacy redirect | `/membership-pricing` → `/pricing` |
| Page title | `Pricing \| Siya Health` |
| Nav/footer label | **Pricing** |
| Hero H1 (`/pricing`) | Transparent pricing for physician-led care |

### ADHD page pricing labels (`/adhd-care` `#pricing`)

| Tier | Display | Notes |
|------|---------|-------|
| Initial ADHD Evaluation | **$199** | Badge: START HERE. "One-time evaluation. No subscription required." |
| Ongoing Care — Non-Stimulant | **$79**/month | Maps to Non-Controlled Follow-Up |
| Ongoing Care — Stimulant Management | **$149**/month | Maps to Controlled Medication Follow-Up (not $150) |

Footer note: *Transparent pricing. FSA/HSA eligible. Cancel anytime.*

### Pricing vocabulary

| Use | Avoid |
|-----|-------|
| Initial Evaluation ($199) | Book evaluation ($199) as standalone CTA label |
| Follow-up plan / ongoing care | Membership tier, subscription package |
| Care-delivery pricing | Membership-based care, concierge membership |
| Transparent pricing | Join the Waitlist on pricing surfaces |

### Service applicability statement

> These plans describe how care is delivered—not a single condition. Your clinician recommends the right pathway after evaluation.

Applies to: ADHD, weight loss & metabolic health, primary care & telehealth, men's health.

### Insurance FAQ (canonical)

> We offer transparent cash pricing today. Many patients use FSA or HSA funds. Insurance-based options may be added later.

---

## 4. CTA hierarchy

### Booking URL (all primary booking CTAs)

```
https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=sysv73e4
```

### Three-slot CTA system

| Slot | Label | URL | Placement rules |
|------|-------|-----|-----------------|
| **Primary** | **Talk to a Clinician** | Booking URL above | Max **one** per page in hero **or** final `cta-band`; nav/footer may repeat. Consolidates all booking variants. |
| **Secondary (contextual)** | See table below | Service path | Max **one** in hero or final band. Optional on service pages. |
| **Newsletter** | **Join Siya Circle** (button) / **Siya Circle** (footer link) | `https://form.carepatron.com/Forms/XRMFIPAWuXhTlncGx` | Footer Company column only; `/answers` hub promo; `/siya-circle` page. **Never** in hero or article bodies. |

### Contextual secondary CTAs (`CTA_SYSTEM.secondary`)

| Context | Label | URL |
|---------|-------|-----|
| Default / homepage pathways | Explore Telehealth Care | `/telehealth` |
| ADHD funnel (nav on ADHD pages) | Book ADHD Evaluation | Booking URL |
| ADHD hero/final band | Free ADHD Screening | `/adhd-screening` or `/adhd-screening?start=asrs` |
| Weight loss funnel | Start Weight Loss Evaluation | Booking URL |
| Telehealth funnel | Explore Telehealth Care | `/telehealth` |
| Pricing tertiary | See pricing | `/pricing` |

### Screening CTA standards

| Label | URL | Usage |
|-------|-----|-------|
| **Free ADHD Screening** | `/adhd-screening` | Canonical secondary on ADHD service page |
| Free screening → | `/adhd-screening?start=asrs` | Symptom tiles, transitions (acceptable variant) |

Required microcopy near screening: **Screening is not diagnosis.**

### Removed / forbidden CTA labels

Do not use anywhere (see `REMOVED_BOOKING_CTA_LABELS` in `site-standards.mjs`):

- Book a Meet & Greet
- Schedule a Quick Call
- Find the Right Starting Point
- Explore ADHD Care
- Start Here
- Join the Waitlist / Join Waitlist
- Book Appointment
- Book with {Provider Name}
- Book evaluation ($199)
- Book Your Free 15-Minute Discovery Call
- Book Free Consultation

### Per-page-type CTA rules

| Page type | Primary | Secondary | Newsletter | Max CTAs in `<main>` |
|-----------|---------|-----------|------------|----------------------|
| Homepage | Hero: Talk to a Clinician | See pricing → `/pricing`; pathway screening links | Footer only | ≤3 booking CTAs total |
| Service pages | Hero **or** final band (not both) | ADHD: Free ADHD Screening; Weight: Talk to a Clinician | Footer only | ≤3 in main |
| About | Hero: Talk to a Clinician | Explore Telehealth Care | Footer only | No duplicate Meet & Greet |
| Provider profiles | Hero: Talk to a Clinician (UTM OK) | None | Footer only | No "Book with {name}" in body |
| Blog / Health Guides | Final `cta-band` only | Optional contextual service link | Footer only | No mid-article booking buttons |
| Legal | None in main | None | Footer only | — |

### Nav CTA by funnel

| Page pattern | Nav button label |
|--------------|------------------|
| Default (most pages) | Talk to a Clinician |
| ADHD funnel (`adhd-care`, geo ADHD landings) | Book ADHD Evaluation |

---

## 5. State coverage

### Service availability (organizational footprint)

Siya Healthcare, PLLC offers telehealth **only** in:

| State | Abbrev | Display formats |
|-------|--------|-----------------|
| California | CA | Bullet: `California • Texas • Pennsylvania • Florida` |
| Texas | TX | Inline: `California, Texas, Pennsylvania, and Florida` |
| Pennsylvania | PA | |
| Florida | FL | |

**Footer states line (exact):**

> Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.

### Rules

- **Service availability** = `AVAILABLE_SERVICE_STATES` in `site-standards.mjs` (4 states only).
- **Provider license chips** = credential transparency; may include non-service states (e.g., Derek Timbs **OH** = license-only, not service).
- Never duplicate state names (e.g., "California, California, …").
- Geo/SEO pages must not imply coverage outside the four states.
- Hero state lines use bullet format: `California · Texas · Pennsylvania · Florida` or `California • Texas • Pennsylvania • Florida`.

### Provider ↔ state service matrix

| Provider | Can see patients (service) |
|----------|---------------------------|
| Dr. Sneh Pandey | CA, TX, PA, FL |
| Dr. Natasha Desai | TX, FL |
| Dr. Swati Pandey | PA |
| Dr. Vanessa Urbina | FL |
| Megan Wunderlich | PA |
| Derek Timbs | TX |
| Wendy Delgado | CA |

---

## 6. Footer rules

### Architecture

Footer variant: **SEO v2** (`data-siya-footer="seo-v2"`) — five columns + brand bar + notice.

### Column: Care & Services

| Label | URL |
|-------|-----|
| ADHD evaluation & care | `/adhd-care` |
| Free ADHD screening | `/adhd-screening` |
| Medical weight loss | `/weight-loss-metabolic-health` |
| Men's health & longevity | `/mens-health-longevity` |
| Telehealth services | `/telehealth` |
| Diagnostic labs | `/labs` |

### Column: Health Guides

| Label | URL |
|-------|-----|
| All Health Guides | `/answers` |
| Adult ADHD signs | `/answers/signs-of-adult-adhd` |
| Online ADHD diagnosis | `/answers/is-online-adhd-diagnosis-legitimate` |
| Fatigue & sleep | `/answers/why-am-i-tired-even-after-sleeping` |
| Insulin resistance | `/answers/what-is-insulin-resistance` |

### Column: Blog

| Label | URL |
|-------|-----|
| Health articles | `/blog` |
| ADHD articles | `/blog/adhd` |
| Weight loss articles | `/blog/weight-loss` |
| Telehealth articles | `/blog/telehealth` |
| Signs of adult ADHD | `/blog/how-to-know-if-you-have-adhd-adult` |

### Column: Company

| Label | URL |
|-------|-----|
| About Siya Health | `/about` |
| Our Care Team | `/providers` |
| Pricing | `/pricing` |
| How telehealth works | `/telehealth` |
| Siya Circle | `https://form.carepatron.com/Forms/XRMFIPAWuXhTlncGx` (external) |

### Column: Legal

| Label | URL |
|-------|-----|
| Legal & Compliance | `/legal` |
| Terms of Use | `/legal/terms-of-use` |
| Privacy Policy | `/legal/privacy-policy` |
| Notice of Privacy Practices | `/legal/notice-of-privacy-practices` |
| Cookie Policy | `/legal/cookie-policy` |
| Controlled Substance Agreement | `/legal/controlled-substance-treatment-agreement` *(ADHD/controlled-substance pages only)* |

### Brand bar (required elements)

| Element | Canonical value |
|---------|-----------------|
| States tagline | `FOOTER_STATES_LINE` (see §5) |
| Trust logos | HIPAA, LegitScript, Creyos |
| Phone | (215) 445-1244 |
| Email | care@siya.health |
| Booking link label | Talk to a Clinician |
| Secondary booking | Book appointment → `/book-appointment` |

### Footer notices

| Page type | Notice |
|-----------|--------|
| Default | For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations. |
| `/answers/*`, `/blog/*` | For emergencies, call 911. Educational content only—not medical advice for your specific situation. |

### Copyright

> © 2026 Siya Health Inc. All rights reserved.

---

## 7. Siya Circle rules

### Purpose

Free clinician-informed health education newsletter—**not** clinical care, diagnosis, or emergency support.

### URLs & tracking

| Element | Value |
|---------|-------|
| GHL form URL | `https://form.carepatron.com/Forms/XRMFIPAWuXhTlncGx` |
| Form ID | `HmvqrDVq3tq3qv6rkCjl` |
| List tag | Siya Circle |
| Analytics event | `siya-circle-join-click` |
| Dedicated page | `/siya-circle` |

### CTA labels

| Context | Label |
|---------|-------|
| Button / signup block | **Join Siya Circle** |
| Footer Company link | **Siya Circle** |

### Topic tags (GHL)

| ID | Label |
|----|-------|
| focus | Focus & ADHD |
| energy | Energy & fatigue |
| weight | Weight & metabolism |
| mood | Mood & stress |
| hormones | Men's health & hormones |
| primary_care | Primary care & sick visits |

### Compliance copy (required on signup surfaces)

> Siya Circle is for general education only. It does not provide diagnosis, treatment, medication advice, emergency care, or a provider-patient relationship. For personal medical concerns, schedule a visit with a licensed clinician. For emergencies, call 911.

Signup note: *You'll be taken to our secure signup form.*

### Placement rules

| Allowed | Forbidden |
|---------|-----------|
| Footer Company column | Hero CTAs |
| `/siya-circle` page | Blog article bodies |
| `/answers` hub promo aside | Duplicate promos in main content |
| | "Join Siya Circle" as primary page CTA on non-newsletter pages |

### Recommended starter guides (promo cross-links)

- `/answers/signs-of-adult-adhd`
- `/answers/why-am-i-tired-even-after-sleeping`
- `/answers/what-is-food-noise`
- `/answers/what-is-insulin-resistance`
- `/answers/what-does-low-testosterone-feel-like`

---

## 8. Homepage messaging hierarchy

**Page:** `/` (`index.html`)  
**Strategic frame:** Symptom recognition first → care pathways second. Not an ADHD-only homepage.

### Section order (top → bottom)

| # | Section ID | H2 / purpose |
|---|------------|--------------|
| 1 | Hero | Symptom mirror + physician-led promise |
| 2 | `#symptoms` | Which of these feels most familiar? |
| 3 | `#why-patients` | You're not failing. Your symptoms deserve a real workup. |
| 4 | `#how-it-works` | How We Get Started (3 steps) |
| 5 | `#pathways` | Where People Often Start |
| 6 | `#care-team` | Meet Our Care Team (7 cards) |
| 7 | `#reviews` | What Patients Say After They Feel Heard |
| 8 | `#membership` | Care that continues after your first visit → See pricing |
| 9 | `#why-siya-exists` | Why Siya Health Exists (founder story) |
| 10 | `#faq` | Frequently Asked Questions |
| 11 | Final CTA band | You don't have to figure this out alone |

### Hero (canonical copy)

| Element | Text |
|---------|------|
| H1 | Something feels off—and you're tired of guessing why. |
| Lead | Board-certified clinicians help adults in California, Texas, Pennsylvania, and Florida understand fatigue, focus, weight, hormones, and burnout—with structured evaluation, not quick labels. |
| Symptom chips | Focus · Energy · Weight · Sleep · Motivation |
| Primary CTA | Talk to a Clinician |
| Tertiary link | See pricing → `/pricing` |
| Trust bar | Board-certified clinicians · Same-Week Appointments · Transparent Pricing · HIPAA-Compliant |

### Symptom grid (`#symptoms`)

Six cards linking to: `/adhd-care`, `/answers#guides-energy`, `/answers#guides-adhd`, `/weight-loss-metabolic-health`, `/answers#guides-energy`, `/answers#guides-hormone`.

Transition line must include: **Free ADHD screening** → `/adhd-screening?start=asrs` with *screening is not diagnosis*.

### Pathway cards (`#pathways`)

| Pathway | Primary link | Secondary link |
|---------|--------------|----------------|
| ADHD evaluation & treatment | Talk to a Clinician → `/adhd-care` | Free ADHD Screening |
| Medical weight loss | Explore Metabolic Health → `/weight-loss-metabolic-health` | Insulin Resistance Guide |
| Fatigue & wellness | Explore Fatigue & Wellness → `/telehealth` | Fatigue Guide |
| Men's health & hormones | Explore Men's Health | Hormone Health Guide |
| Ongoing telehealth care | Explore Telehealth Care | Pricing → `/pricing` |

### Required compliance lines (`#why-patients`)

- **Screening is not diagnosis. Evaluation does not guarantee medication.**
- Siya Health is **physician-led telehealth**
- States: California, Texas, Pennsylvania, and Florida

### FAQ topics (homepage)

1. Do I need a diagnosis to book?
2. Is Siya Health a psychiatry practice? → **No** — primary care–led
3. Will I get medication on the first visit? → Not guaranteed; link Controlled Substance Agreement
4. How is ADHD evaluation different from online quizzes?
5. Do you take insurance? → Cash-transparent; FSA/HSA
6. What states do you serve? → CA, TX, PA, FL only

### Final CTA band

| Element | Text |
|---------|------|
| H3 | You don't have to figure this out alone |
| Body | A licensed clinician can help you sort symptoms, rule out overlap, and plan next steps—when clinically appropriate. |
| CTA | Talk to a Clinician |

---

## 9. Weight loss messaging hierarchy

**Page:** `/weight-loss-metabolic-health`  
**Strategic frame:** Metabolic health & whole-person evaluation first—not a GLP-1 sales page.

### Section order

| # | Section ID | H2 / purpose |
|---|------------|--------------|
| 1 | Hero | Patient recognition + physician-led framing |
| 2 | `#weight-recognition` | Does any of this sound familiar? |
| 3 | Trust metrics | Social proof band |
| 4 | `#why-weight-complicated` | Why weight management can be more complicated than calories |
| 5 | `#how-care-works` | How care works (4-step roadmap) |
| 6 | `#program-overview` | Program pillars + `#who-this-is-for` |
| 7 | `#faq` | FAQ accordion |
| 8 | `#cornerstone-metabolic` | Learn More About Weight, Cravings & Metabolic Health |
| 9 | `#learn-more-weight-loss` | Learn More About Medical Weight Loss |
| 10 | `#meet-physicians` | Meet the clinicians behind your care |
| 11 | Final CTA band | Still wondering why nothing seems to work? |

### Hero (canonical)

| Element | Text |
|---------|------|
| H1 | When your appetite, energy, and weight stop making sense |
| Primary lead | Physician-led metabolic health and weight management—not a medication menu. |
| Supporting | Board-certified clinicians help adults understand drivers of weight gain, cravings, and low energy; medication only when clinically appropriate. |
| States | California · Texas · Pennsylvania · Florida |
| Bullets | Whole-person evaluation; food noise / emotional eating / regain; HIPAA telehealth with follow-up |
| Primary CTA | Talk to a Clinician |
| Trust chips | 5,000+ Weight Loss Patients · Board-Certified Physicians · Transparent Pricing · HIPAA-Compliant |

### Complexity cards (`#why-weight-complicated`) — six factors

1. Sleep & recovery  
2. Stress & emotional eating  
3. Food noise & cravings  
4. ADHD & impulsive eating  
5. Insulin resistance & metabolism  
6. Hormones, medications & medical conditions  

Close with: individualized evaluation disclaimer; medication is one tool, not the whole program.

### How care works (`#how-care-works`) — four steps

1. **Comprehensive Evaluation**  
2. **Personalized Treatment Plan**  
3. **Ongoing Support & Optimization**  
4. **Maintenance & Long-Term Success**

### Program pillars (`#program-overview`)

Three pillars framing lifestyle + behavioral + medication (when appropriate)—not medication-first.

### Service-page providers

Roster per §2: Sneh, Vanessa, Derek, Wendy.

### Final CTA

| Element | Text |
|---------|------|
| H3 | Still wondering why nothing seems to work? |
| Sub | Let's talk through it. No pressure. No obligation. |

---

## 10. ADHD messaging hierarchy

**Page:** `/adhd-care`  
**Strategic frame:** Primary care–led adult ADHD evaluation—not psychiatry; medication never guaranteed.

### Section order

| # | Section ID | H2 / purpose |
|---|------------|--------------|
| 1 | Hero | Adult ADHD Evaluation Online |
| 2 | Trust metrics | Trusted by 1,500+ Adults for ADHD Care |
| 3 | `#executive-function-map` | Executive function diagram |
| 4 | `#symptoms` | Does This Sound Like You? (6 cards) |
| 5 | `#how-it-works` | ADHD Clarity in 3 Easy Steps |
| 6 | `#evaluation-model` | How Our ADHD Evaluation Model Works (2×2 cards) |
| 7 | `#pricing` | Simple, Transparent ADHD Care ($199 / $79 / $149) |
| 8 | `#why-not-traditional` | Why Not Just Use Insurance or a Traditional Clinic? |
| 9 | `#why-choose` | Why Choose Siya for ADHD Care |
| 10 | `#medical-director-message` | A Message From Dr. Sneh Pandey |
| 11 | `#faq` | ADHD FAQ accordion |
| 12 | `#learn-more-adhd` | Learn More About ADHD |
| 13 | `#meet-physicians` | Meet our care team |
| 14 | Final CTA band | Start Your Care—Without the Wait |

### Hero (canonical)

| Element | Text |
|---------|------|
| H1 | Adult ADHD Evaluation Online |
| Primary lead | Same-week ADHD evaluations with licensed medical providers. |
| Supporting | Primary care–led, DSM-based adult ADHD evaluation for focus, organization, productivity, executive functioning. |
| States | California • Texas • Pennsylvania • Florida |
| Note | No insurance required. |
| Primary CTA | Book ADHD Evaluation |
| Secondary CTA | Free ADHD Screening → `/adhd-screening?adhd=1` |

### Trust metrics (canonical numbers)

| Metric | Value |
|--------|-------|
| Headline | Trusted by **1,500+** Adults for ADHD Care |
| Rating | **4.7★** from **450+** verified reviews |
| Evaluations | **750+** ADHD evaluations completed |
| Meta | $199 transparent pricing · HIPAA-compliant telehealth |

### Three-step process (`#how-it-works`)

1. **Free ADHD Screening** — brief; no obligation  
2. **Comprehensive Evaluation** — structured clinical assessment, not a quick quiz  
3. **Personalized Plan** — medication may be discussed when appropriate; **never guaranteed**

### Evaluation model cards (`#evaluation-model`)

1. Structured Clinical Evaluation  
2. Assessment Tools When Appropriate  
3. Real-Life Impact  
4. Documentation & Follow-Up  

### ADHD clinical positioning (required phrases)

From `ADHD_POSITIONING` in `site-standards.mjs`:

| Topic | Canonical statement |
|-------|---------------------|
| Practice type | Siya Health is **not** a psychiatry or psychology practice. ADHD care is delivered through internal medicine, family medicine, NPs, and PAs using structured primary care–led evaluation. |
| Tools | Clinicians may use ASRS, DIVA, Wender Utah, SWAN, Creyos, etc. as clinically appropriate. No specific tool required for every patient. |
| Tools disclaimer | Assessment tools support clinical evaluation but do not independently establish a diagnosis. |
| Medication | Diagnosis does not guarantee medication. Evaluation does not guarantee medication. Medication does not guarantee stimulants. Stimulant prescribing is never guaranteed. |
| Screening | Screening is not diagnosis. |

### Meta description (ADHD pages)

> Primary care–led adult ADHD evaluation online — DSM-based assessment ($199). Licensed medical providers. Individualized validated tools as clinically appropriate. CA, TX, PA, FL.

### Final CTA band

| CTA | Label |
|-----|-------|
| Primary | Book ADHD Evaluation |
| Secondary | Free ADHD Screening |

### Service-page providers

Roster per §2 (5 clinicians; no Wendy on ADHD roster).

---

## 11. Telehealth messaging hierarchy

**Page:** `/telehealth`  
**Strategic frame:** "When you need a doctor but life doesn't stop"—not a service catalog.

### Section order

| # | Section ID | H2 / purpose |
|---|------------|--------------|
| 1 | Hero | Convenience + access framing |
| 2 | `#tele-recognition` | What brings most patients here? (6 cards) |
| 3 | `#why-choose` | Why Choose Siya Telehealth (7 differentiators) |
| 4 | `#services` | Common reasons patients book visits (8 categories) |
| 5 | `#faq` | FAQ accordion |
| 6 | `#cornerstone-telehealth` | Health guides for common telehealth questions |
| 7 | `#learn-more-telehealth` | Explore guides by concern |
| 8 | `#meet-physicians` | Meet our care team |
| 9 | `#book-telehealth` | Final CTA band |

### Hero (canonical)

| Element | Text |
|---------|------|
| H1 | Need a doctor without rearranging your entire day? |
| Lead | Primary care, urgent care, medication refills, forms, chronic disease follow-up, and ongoing health support—from home. |
| Bullets | No waiting rooms. · No long drives. · No insurance delays. |
| States | California · Texas · Pennsylvania · Florida |
| Primary CTA | Talk to a Clinician |
| Trust chips | Physician-Led Care · Same-Week Appointments · Evening & Weekend Hours · No Insurance Barriers |

### Recognition cards (`#tele-recognition`)

1. I just need a doctor today  
2. I need a medication refill  
3. I need forms completed  
4. I am too busy for traditional primary care  
5. I want ongoing health support  
6. I don't know where to start  

### Why Choose (`#why-choose`) — seven pillars

1. Physician-led care  
2. Transparent pricing  
3. Same-week appointments  
4. Evening and weekend availability  
5. No insurance barriers  
6. Ongoing support options  
7. Primary care + mental health + metabolic health under one roof  

### Forbidden on telehealth page

- **Find the Right Starting Point** (removed CTA)
- Catalog note: "Full telehealth catalog available—ask your provider…"
- Per-card booking CTAs in service grid

### FAQ CTA (within `#faq`)

| Element | Text |
|---------|------|
| H3 | Still not sure where to start? |
| CTA | Talk to a Clinician |

### Final CTA (`#book-telehealth`)

| Element | Text |
|---------|------|
| H3 | When you need a doctor, not a runaround |
| Body | Same-week visits with licensed clinicians. No waiting rooms, no insurance maze—just care that fits your schedule. |
| CTA | Talk to a Clinician (single button only) |

### Service-page providers

Roster per §2: Sneh, Natasha, Swati, Vanessa, Megan, Derek (6 clinicians).

---

## Audit checklist (quick reference)

When auditing any page, verify:

- [ ] States match §5 (no extra states, no duplicates)
- [ ] Pricing uses $199 / $79 / $149 model; links to `/pricing`
- [ ] CTAs match §4 three-slot system; no forbidden labels
- [ ] Footer matches §6 column labels and URLs
- [ ] Provider names, roles, and rosters match §2
- [ ] ADHD pages include §10 compliance phrases
- [ ] Health Guides naming (not "Answers")
- [ ] Siya Circle only in allowed zones (§7)
- [ ] Entity statement on legal surfaces
- [ ] Educational pages use educational footer notice

---

## Document maintenance

1. Change canonical values in `data/site-standards.mjs` (and related data files).
2. Update this document to match.
3. Run build/normalize scripts so HTML reflects changes.
4. Re-run audit scripts (`audit-brand-consistency.mjs`, `audit-cta-inventory.mjs`, `audit-provider-consistency.mjs`, `audit-pricing-system.mjs`).

*Last synthesized from production HTML, sprint reports, and audit deliverables — June 2026.*
