# Local ADHD Treatment Page Engine

**Role:** SEO Content Lead — Siya Health  
**Parent:** `ADHD-CONTENT-ENGINE.md` · Architecture: `ADHD-KNOWLEDGE-ARCHITECTURE.md`  
**Phase:** 5 (Local hierarchy) — ship **after** state hub exists or in the same sprint as its parent state page.  
**Intent:** Commercial investigation (high buying intent) — **not** a doorway page.

---

## Gate

Publish a city treatment page only if:

1. It becomes the **definitive** `ADHD Treatment [City]` owner URL for Siya, **and**
2. It strengthens the **state hub ↔ Treatment/Diagnosis ↔ `/adhd-care`** hallway (not an orphan geo post).

**Do not** spray city listicles before Treatment pillar + state hubs are planned.  
**Do not** clone Houston/CA thin blades — prior `/blog/adhd-treatment-houston-online` was consolidated/redirected for a reason.

---

## Hierarchy (required)

```
State hub (e.g. Texas ADHD care hub)
  └── City TREATMENT page  ← this engine
        ├── ↑ State hub
        ├── ↑ Diagnosis / Treatment pillars (or /adhd-care until pillars live)
        ├── ↔ City DIAGNOSIS twin (if exists — different primary intent)
        └── ↓ /adhd-care · Meet & Greet · screening
```

| State | Priority cities |
|-------|-----------------|
| Texas | Austin · Houston · Dallas · San Antonio |
| California | LA · SD · SF · SJ — **only after C3 cleanup** |
| Florida | Miami (+ state hub) |
| Pennsylvania | Philadelphia |

**Recommended first treatment twins:** Austin TX · Philadelphia PA · Miami FL · Los Angeles CA (post-cleanup).

---

## Anti-doorway rules

| Do | Don’t |
|----|--------|
| City-specific adult contexts (roles, commute, lifestyle) | Keyword stuffing / city every sentence |
| Genuine process + FAQs + EEAT | Swap city name into a template and publish |
| One primary intent: **treatment** | Duplicate diagnosis-cost page intent |
| Natural local color | Fake local stats or “#1 clinic in [City]” |
| Link UP to state + pillars | Orphan city URL with no hallway |

---

## Keywords

| Type | Pattern |
|------|---------|
| Primary | ADHD Treatment [City] |
| Secondary | Adult ADHD Treatment [City] · Online ADHD Treatment [City] · Virtual ADHD Doctor [City] · ADHD Evaluation [City] · ADHD Medication Management [City] |

**Owns:** physician-led virtual ADHD treatment for adults in [City].  
**Does not own:** generic “what is ADHD” (link to Adult Guide / symptoms).

---

## Audience & funnel

- **Audience:** Adults who already suspect ADHD; seeking evaluation or treatment.
- **Funnel:** Trust → Evaluation / Booking.
- **Primary CTA:** Book Free Meet & Greet (`/redirect/meet-greet`) **or** Start Your ADHD Evaluation (`/adhd-care`).
- **Never:** “Contact Us” · Zocdoc/Spruce as cold primary.

---

## Required structure

### H1
`ADHD Treatment in [City], [State]: Physician-Led Virtual Care for Adults`

### Sections (H2)

1. **Introduction** — relatable open (not “Welcome to our [City] page”).
2. **Why Adults in [City] Seek ADHD Treatment** — natural local contexts; **no invented stats**.
3. **Common Adult ADHD Symptoms** — educational, concise; link UP.
4. **What Happens During an ADHD Evaluation?** — Siya process (history, symptoms, screening tools, eating/sleep if relevant, meds history, plan).
5. **ADHD Treatment Options** — medication · behavioral strategies · lifestyle · monitoring.
6. **Why Virtual ADHD Care Works** — convenience, evening/weekend, privacy, no commute (tie lightly to city life).
7. **Frequently Asked Questions** — online diagnosis · duration · medication · referral · insurance/payment.
8. **Why Siya Health** — physician-led, evidence-based, evening availability, virtual, whole-person.
9. **CTA close** — reframed question → Meet & Greet or Evaluation (not “Help is available”).

### Quality extras (rank + convert)

- Myth box (e.g. “You need an in-person psychiatrist for a real diagnosis”) when accurate.
- Short “practical next step” day/week frame for starting care.
- Prevalence only with real citations — else omit.

---

## EEAT (required)

```
Reviewed by: Dr. Sneh Pandey, MD
Internal Medicine · ABOM Certified
Last updated: [date]
Medical disclaimer
References (APA / clinical guidelines / FDA as relevant — real sources only)
```

Honest review status if not yet physician-signed.

---

## Internal links (must)

| Required | Live fallback until pillar ships |
|----------|----------------------------------|
| Adult ADHD Guide | `/blog/adhd` or `/blog/how-to-know-if-you-have-adhd-adult` |
| ADHD Treatment | `/adhd-care` (+ `/adhd-treatment-online` redirects → care) |
| ADHD Diagnosis | `/blog/is-online-adhd-diagnosis-legit` or state diagnosis blog |
| ADHD in Women | `/answers/adhd-in-women` |
| Executive Dysfunction | `/answers/executive-dysfunction-adhd` |
| Service | `/adhd-care` |
| State hub | e.g. `/blog/online-adhd-diagnosis-texas` until dedicated TX hub exists |
| Related FAQ | Matching `/answers/*` |
| Screening / Meet & Greet | `/adhd-screening` · `/redirect/meet-greet` |

Also link diagnosis twin if present (different intent — do not cannibalize).

---

## SEO deliverables pack (always with brief)

- Meta title (≤60) · Meta description (≤155)
- Slug: `adhd-treatment-[city]-[state-abbr]` (e.g. `adhd-treatment-austin-tx`)
- Schema: `MedicalWebPage` or `BlogPosting` + `FAQPage` + `BreadcrumbList` + `Physician`/`Organization` where accurate
- Image suggestions + alt text (city-agnostic clinical/lifestyle — no fake storefront)
- People Also Ask list
- Featured snippet opportunities (definition of virtual ADHD treatment; evaluation steps numbered list)
- Internal anchor text (natural, varied — not exact-match spam)

---

## Pipeline

1. Knowledge Gap (city + state + twin diagnosis URL check)
2. Brief + city context notes (who lives/works there — qualitative only)
3. SEO pack + cannibalization check
4. Outline
5. Link map
6. Medical checklist
7. Draft HTML matching `blog/*.html` patterns
8. Publish: canonical, schema, CTAs, EEAT, sitemap

**Default:** Brief + Outline + SEO pack first. Wait for approval unless user says “draft now.”

---

## City context bank (qualitative — expand per brief; never invent stats)

| City | Natural adult contexts |
|------|------------------------|
| Austin | Tech / startups, UT students & alumni, remote hybrids, traffic/commute fatigue, creative economy |
| Houston | Energy/healthcare systems, long commutes, medical center workers, multilingual households |
| Dallas | Corporate corridors, parents juggling school/work, DFW travel |
| San Antonio | Military-adjacent families, growing tech, bilingual households |
| Los Angeles | Entertainment/creative schedules, long drives, gig + corporate mix |
| Miami | Bilingual professionals, hospitality/shift work, heat/outdoor lifestyle |
| Philadelphia | Academic/medical systems, Northeast corridor travel, dense urban schedules |

---

## Paste prompt (fill city/state)

See bottom of this file or copy from chat.

---

## Paste-ready prompt (Senior SEO Content Writer)

Fill `{{CITY}}` · `{{STATE}}` · `{{STATE_ABBR}}`, then paste into a new chat with **draft now** semantics (finished Markdown; no outline).

```text
You are the Senior SEO Content Writer for Siya Health.

You are building the highest-quality local ADHD content library in the United States.

This article must be substantially useful for readers living in the target city.
It should NEVER feel like a doorway page or a copy with city names swapped.

Assume this article will compete against large telehealth providers and local psychiatry clinics.
Your objective is to create the page Google most wants to rank.

Follow:
- apps/siya-health/docs/LOCAL-ADHD-TREATMENT-PAGE-ENGINE.md
- apps/siya-health/docs/ADHD-CONTENT-ENGINE.md
- apps/siya-health/docs/ADHD-KNOWLEDGE-ARCHITECTURE.md

---

## TARGET

City: {{CITY}}
State: {{STATE}}
State Abbreviation: {{STATE_ABBR}}

## PRIMARY KEYWORD
ADHD Treatment {{CITY}}

## SECONDARY KEYWORDS
Adult ADHD Treatment {{CITY}}
Online ADHD Treatment {{CITY}}
Virtual ADHD Doctor {{CITY}}
ADHD Evaluation {{CITY}}
ADHD Medication Management {{CITY}}
Adult ADHD Specialist {{CITY}}
ADHD Care {{CITY}}

## SEARCH INTENT
Commercial Investigation — reader already suspects ADHD and is looking for treatment.

## TARGET LENGTH
2,000–2,500 words

## FUNNEL
Trust → Evaluation
Primary CTA: Book Free Meet & Greet (/redirect/meet-greet)
Secondary CTA: Start ADHD Evaluation (/adhd-care)
Never: "Contact Us" · Zocdoc/Spruce as cold primary

## STRUCTURE
# ADHD Treatment in {{CITY}}, {{STATE}}: Physician-Led Virtual Care for Adults

## Introduction — relatable story; never definitions/stats first
## Why Adults in {{CITY}} Seek ADHD Treatment — realistic local contexts only; no invented stats
## Common Adult ADHD Symptoms — inattention, executive dysfunction, time blindness, hyperfocus, emotional regulation, impulsivity
## When Should Adults Seek Treatment?
## What Happens During an ADHD Evaluation? — Siya physician-led process
## ADHD Treatment Options — medication · behavioral · lifestyle · monitoring (benefits + limitations)
## Why Virtual ADHD Care Works — evenings, weekends, privacy, reduced travel, follow-up
## Frequently Asked Questions — min 6 (online dx, meds, referral, cost, duration, late diagnosis)
## Why Siya Health — natural, physician-led, evidence-based, flexible, whole-person
## Conclusion — Meet & Greet or Start Evaluation (never Contact Us)

## SEO PACK
Meta Title · Meta Description · Suggested URL (`adhd-treatment-[city]-[state-abbr]`) · FAQ Schema · Article Schema · People Also Ask · Featured Snippet opportunities · Image suggestions + alt text · Internal links using ONLY existing live Siya Health pages

## WRITING STYLE
Warm · Conversational · Evidence-based · Professional · Hopeful
Avoid AI clichés · keyword stuffing · filler · invented local facts

OUTPUT: COMPLETE publication-ready Markdown. No outline. No approval step. Begin writing immediately.
```

### City queue (Phase 5) — owner order

| Order | City | State | Abbr | Draft status | Notes |
|------:|------|-------|------|--------------|-------|
| — | **Texas hub** | Texas | TX | **Live** `/blog/adhd-treatment-texas` | Parent for all TX city treatment pages |
| 1 | Dallas | Texas | TX | **Live** `/blog/adhd-treatment-dallas-tx` | Draft + HTML; cross-linked |
| 2 | Houston | Texas | TX | **Live** `/blog/adhd-treatment-houston-tx` | Diagnosis twin: `/adhd-diagnosis-houston` |
| 3 | Austin | Texas | TX | **Live** `/blog/adhd-treatment-austin-tx` | Diagnosis twin: `/adhd-diagnosis-austin` |
| 4 | San Antonio | Texas | TX | **Live** `/blog/adhd-treatment-san-antonio-tx` | Link TX state hub |
| 5 | Fort Worth | Texas | TX | **Live** `/blog/adhd-treatment-fort-worth-tx` | DFW cluster with Dallas |
| 6 | Los Angeles | California | CA | Blocked until C3 cleanup | Do not ship before CA consolidate |
| 7 | Miami | Florida | FL | **Live** `/blog/adhd-treatment-miami-fl` | Link `/adhd-diagnosis-florida` |
| 8 | Philadelphia | Pennsylvania | PA | **Live** `/blog/adhd-treatment-philadelphia-pa` | Diagnosis twin: `/adhd-diagnosis-philadelphia` |
| 9 | Orlando | Florida | FL | **Live** `/blog/adhd-treatment-orlando-fl` | After Miami |
| 10 | San Diego | California | CA | Blocked until C3 cleanup | Do not ship before CA consolidate |

