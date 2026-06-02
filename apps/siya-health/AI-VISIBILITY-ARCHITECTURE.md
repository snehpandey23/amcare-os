# Siya Health — AI-First Visibility Architecture

**Objective:** Become the most-cited entity for adult ADHD and telehealth care in LLM retrieval (ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews, agents).

**Baseline (May 2026):** 83 indexed HTML pages · 3 provider profiles · 4 blog hubs · ~51 clinical articles · 0 dedicated Q&A citation pages · No `Physician` schema · No `llms.txt` (now added).

---

## Current-state audit (83 pages)

| Layer | Count | AI readiness |
|-------|------:|--------------|
| Service / conversion pages | 14 | Medium — strong copy, weak entity linkage |
| ADHD geo landing pages | 11 | Medium — FAQPage on some, stale MedicalOrganization |
| Provider profiles | 3 | Low — WebPage only, no Physician schema, no article library UI |
| Blog hubs | 4 | Medium — CollectionPage on ADHD hub only |
| Blog articles | ~51 | Medium — BlogPosting + some FAQPage; author = Organization |
| Legal / utility | 5 | Low priority for citation |

**Critical gaps blocking AI citation:**
1. No named physician as `author` / `reviewedBy` on articles
2. No `/answers/*` single-question retrieval format
3. No `/knowledge/*` or `/states/*` authority hubs
4. No first-party aggregated research pages
5. Entity graph exists in code but not in page-level JSON-LD `@graph`
6. 100% of ADHD article CTAs point only to Dr. Sneh Pandey (entity dilution for Swati/Natasha)

---

## PHASE 1 — Entity graph

**Canonical source:** `data/entity-graph.json` (machine-readable, deployed at `/data/entity-graph.json`).

### Organization: Siya Health

| Attribute | Value |
|-----------|--------|
| `@type` | `MedicalOrganization` |
| `@id` | `https://siya.health/#organization` |
| Specialties | Internal Medicine, Psychiatry, Family Medicine, Obesity Medicine, Behavioral Medicine |
| States | CA, TX, PA, FL |
| Primary cite URLs | `/`, `/about`, `/adhd-care` |

### Provider entities

#### Dr. Sneh Pandey, MD — Medical Director
- **Licensed:** CA, TX, PA, FL
- **Specialties:** Internal Medicine, Obesity Medicine, Adult ADHD (ADHD-CCSP)
- **Conditions:** Adult ADHD, executive dysfunction, metabolic health, medical weight loss, ADHD+weight overlap
- **Reviewer for:** ADHD (all), weight loss, GLP-1, telehealth, evaluation cost, California cluster
- **Bidirectional links to build:** ↔ `/knowledge/adhd/*`, `/blog/adhd/*`, `/states/*`, `/answers/*adhd*`

#### Dr. Swati Pandey, MD — Psychiatry
- **Licensed:** PA
- **Specialties:** Psychiatry, Mental Health, Adult ADHD (ADHD-CCSP)
- **Conditions:** ADHD + depression/anxiety, complex medication histories
- **Reviewer for:** stimulant comparisons, long-term safety, non-stimulants, side effects
- **Bidirectional links:** ↔ medication articles, `/knowledge/adhd/medication/*`

#### Dr. Natasha Desai, MD — Family & Behavioral Medicine
- **Licensed:** TX, FL
- **Specialties:** Family Medicine, Behavioral Medicine, Adult ADHD (ADHD-CCSP)
- **Conditions:** ADHD + anxiety, emotional dysregulation, behavioral overlap
- **Reviewer for:** symptoms, overlooked signs, sleep overlap, anxiety comorbidity
- **Bidirectional links:** ↔ symptom articles, `/knowledge/adhd/symptoms/*`, TX/FL state content

### Required schema per provider page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Physician",
      "@id": "https://siya.health/providers/dr-sneh-pandey#physician",
      "name": "Sneh Pandey",
      "honorificPrefix": "Dr.",
      "honorificSuffix": "MD",
      "jobTitle": "Medical Director",
      "medicalSpecialty": ["Internal Medicine", "Obesity Medicine"],
      "knowsAbout": ["Adult ADHD", "Medical weight loss", "GLP-1 therapy"],
      "worksFor": { "@id": "https://siya.health/#organization" },
      "url": "https://siya.health/providers/dr-sneh-pandey",
      "image": "https://siya.health/assets/images/dr-sneh-pandey.png"
    },
    {
      "@type": "MedicalOrganization",
      "@id": "https://siya.health/#organization",
      "employee": { "@id": "https://siya.health/providers/dr-sneh-pandey#physician" }
    }
  ]
}
```

**Implementation:** Extend `seo-build.mjs` or new `inject-entity-schema.mjs` reading `entity-graph.json`.

---

## PHASE 2 — Knowledge hubs

Transform flat blog into **topic ownership layers**:

```
/knowledge/adhd/                    ← Master ADHD hub (replaces/redirects from /blog/adhd)
  /symptoms/
  /diagnosis/
  /testing/
  /medication/
  /women/
  /men/
  /professionals/
  /students/
  /anxiety-overlap/
  /depression-overlap/
  /sleep-overlap/
  /productivity/
  /relationships/
/knowledge/weight-loss/
/knowledge/glp-1/
/knowledge/telehealth/
/knowledge/mens-health/
/states/california|texas|pennsylvania|florida/
/answers/{question-slug}/
/research/{report-slug}/
```

### Hub linking rules (every page)
1. **Up:** Link to parent hub + master `/knowledge/adhd`
2. **Sideways:** 3–5 semantically related articles (same subtopic)
3. **Down:** Link to subtopic index from hub
4. **Entity:** Link to reviewing physician + `/providers/{slug}#articles`
5. **Never orphan:** CI check — every HTML file must appear in `article-index.json` parent hub

### ADHD hub subtopic map (existing → target)

| Subtopic | Existing assets | Gap |
|----------|-----------------|-----|
| Symptoms | 4 articles | Women, men, professionals, students |
| Diagnosis | 8 articles + 11 landings | Unified `/knowledge/adhd/diagnosis` |
| Testing | creyos, online-adhd-test | ASRS explainer page |
| Medication | 12 articles | Per-drug `/answers/*` pages |
| State (CA) | 10 CA blogs | `/states/california` hub |
| State (TX) | 6 TX assets | `/states/texas` hub |
| Overlap anxiety | partial | Dedicated hub section |

---

## PHASE 3 — Provider-led content

### Editorial standard (every article)

```html
<aside class="clinical-review" itemscope itemtype="https://schema.org/MedicalWebPage">
  <p>Written by Siya Health Clinical Education</p>
  <p>Medically reviewed by
    <a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a>
    · Last reviewed: 2026-05-19
  </p>
</aside>
```

### Schema

```json
"author": { "@type": "Organization", "name": "Siya Health" },
"reviewedBy": {
  "@type": "Physician",
  "@id": "https://siya.health/providers/dr-sneh-pandey#physician",
  "name": "Sneh Pandey"
}
```

### Provider article libraries
Add to each `/providers/dr-*` page:
- **Articles reviewed** (auto-generated from `entity-graph.json` + frontmatter)
- **Conditions treated** (linked to `/knowledge/*`)
- **States licensed** (linked to `/states/*`)

### Reviewer assignment matrix

| Topic cluster | Primary reviewer |
|---------------|------------------|
| ADHD evaluation, cost, telehealth, CA | Dr. Sneh Pandey |
| Stimulants, comparisons, long-term safety | Dr. Swati Pandey |
| Symptoms, anxiety overlap, sleep, behavioral | Dr. Natasha Desai |
| GLP-1, weight loss, metabolic | Dr. Sneh Pandey |
| TRT, men's health | Dr. Sneh Pandey (assign when credentialed) |

---

## PHASE 4 — AI citation pages (`/answers/*`)

**Target:** 500+ pages. **Format template:** `scripts/templates/answer-page.html`

| Section | Purpose for LLMs |
|---------|------------------|
| H1 = exact question | Query match |
| `#short-answer` (40–60 words) | Direct extraction / featured snippet |
| `#detailed-answer` (300–800 words) | Context for synthesis |
| `#evidence` | Citations to ADA, CDC, peer-reviewed (no PHI) |
| `#related-questions` | Internal link mesh |
| `FAQPage` + `MedicalWebPage` schema | Structured retrieval |
| `reviewedBy` Physician | E-E-A-T for healthcare |

### Wave 1 (50 pages — highest citation probability)

Build from existing FAQ extractions + search console queries:

1. What are the signs of adult ADHD?
2. Can ADHD cause anxiety?
3. How much does ADHD testing cost?
4. Can ADHD be diagnosed online?
5. Is online ADHD diagnosis legitimate?
6. How long does an ADHD evaluation take?
7. What is included in a $199 ADHD evaluation?
8. Do you need insurance for ADHD telehealth?
9. What is ASRS screening?
10. What is Creyos cognitive testing?
… (see Phase 10 full list)

**URL pattern:** `/answers/signs-of-adult-adhd`, `/answers/adhd-and-anxiety`, etc.

**Generator:** `scripts/generate-answer-pages.mjs` reading `data/answer-seeds.json`.

---

## PHASE 5 — First-party data assets

**Constraint:** Aggregated, anonymized, no PHI. Requires internal data export pipeline.

| Report slug | Title | Citation hook |
|-------------|-------|---------------|
| `/research/adhd-evaluation-insights` | What 500+ ADHD evaluations taught us | Unique stats LLMs cannot find elsewhere |
| `/research/common-adhd-symptoms-adults` | Most common ADHD symptoms in our adult patients | Symptom ranking |
| `/research/stimulant-questions-faq` | Top questions before starting stimulants | Pre-treatment fears |
| `/research/glp1-patient-misconceptions` | What patients misunderstand about GLP-1 | Weight loss authority |
| `/research/adhd-diagnosis-fears` | What adults fear most before ADHD diagnosis | Emotional SEO + AI empathy queries |

Each report: methodology section, limitations, physician reviewer, link to `/adhd-care`.

---

## PHASE 6 — State authority hubs

| State | Planned hub | Current fragments | Priority |
|-------|-------------|-------------------|----------|
| California | `/states/california` | 10 blog posts | **P0** — Sneh licensed CA |
| Texas | `/states/texas` | 6 pages/posts | P0 |
| Pennsylvania | `/states/pennsylvania` | 2 landings | P1 |
| Florida | `/states/florida` | 1 landing | P1 |

### Each state hub contains
- Services available in state
- Licensed providers (filtered from entity graph)
- State-specific FAQs (`FAQPage`)
- Telehealth regulations (high-level, reviewed)
- Link mesh to all state articles
- `MedicalOrganization` with `areaServed: State`

---

## PHASE 7 — AI retrieval files ✅ (implemented)

| File | URL | Status |
|------|-----|--------|
| `llms.txt` | `/llms.txt` | ✅ Generated |
| `llms-full.txt` | `/llms-full.txt` | ✅ Generated |
| `provider-index.json` | `/provider-index.json` | ✅ Generated |
| `service-index.json` | `/service-index.json` | ✅ Generated |
| `condition-index.json` | `/condition-index.json` | ✅ Generated |
| `article-index.json` | `/article-index.json` | ✅ Generated |
| `data/entity-graph.json` | `/data/entity-graph.json` | ✅ Source of truth |

**Build:** `node scripts/generate-ai-indexes.mjs` (chained in Netlify after `seo-build.mjs`).

**Next:** Add `<link rel="alternate" type="text/plain" href="/llms.txt">` in site `<head>` via seo-build.

---

## PHASE 8 — Schema expansion

| Type | Current | Target |
|------|---------|--------|
| `MedicalOrganization` | Homepage + 9 landings | Every service page + state hubs |
| `Physician` | 0 | All 3 provider pages |
| `MedicalCondition` | 0 | `/knowledge/adhd`, `/conditions/adult-adhd` |
| `FAQPage` | ~15 pages | All `/answers/*` + hubs |
| `MedicalWebPage` | 0 | All clinical content |
| `BlogPosting` | ~51 | Add `reviewedBy`, `MedicalWebPage` mainEntity |
| `BreadcrumbList` | Most pages | 100% |
| `WebSite` + `SearchAction` | Homepage only | Homepage |

**Validation:** CI step with schema.org validator or `scripts/validate-schema.mjs`.

---

## PHASE 9 — Topical gaps (ranked)

Scoring: **Traffic (T)** · **Conversion (C)** · **AI citation (A)** · **Effort (E)** — higher = better ROI

### ADHD (primary moat)

| Opportunity | T | C | A | Priority |
|-------------|---|---|---|----------|
| `/answers/*` ADHD questions (200 pages) | High | High | **Very High** | P0 |
| `/knowledge/adhd` full hub + 13 subtopics | High | High | Very High | P0 |
| `/states/california` hub | High | High | High | P0 |
| ADHD in women / professionals / students | High | Med | High | P1 |
| Physician schema + reviewedBy rollout | Med | Med | **Very High** | P0 |

### Weight loss / GLP-1

| Opportunity | T | C | A | Priority |
|-------------|---|---|---|----------|
| `/knowledge/glp-1` hub | Very High | High | High | P0 |
| `/answers/glp-1-side-effects` (+ 30 variants) | Very High | Med | Very High | P0 |
| Compounded vs branded (expand) | High | Med | High | Done (enhance) |
| First-party GLP-1 misconceptions report | Med | High | **Very High** | P1 |

### TRT / Men's health

| Opportunity | T | C | A | Priority |
|-------------|---|---|---|----------|
| `/answers/what-does-low-testosterone-feel-like` | High | High | Very High | P0 |
| `/knowledge/mens-health` hub | Med | High | Med | P1 |
| TRT candidacy FAQ cluster (20 pages) | Med | High | High | P1 |

### Hair loss / Sexual health

| Opportunity | T | C | A | Priority |
|-------------|---|---|---|----------|
| Minoxidil answers cluster | Med | Med | High | P2 |
| Sildenafil / ED telehealth answers | Med | High | Med | P2 |

### Primary care

| Opportunity | T | C | A | Priority |
|-------------|---|---|---|----------|
| `/primary-urgent-care` + answers | Med | Med | Low | P3 |

---

## PHASE 10 — AI dominance report

### Top 20 pages to build first (ROI × AI visibility)

1. `/knowledge/adhd` — master hub
2. `/states/california` — state authority
3. `/answers/signs-of-adult-adhd`
4. `/answers/can-adhd-be-diagnosed-online`
5. `/answers/how-much-does-adhd-testing-cost`
6. `/answers/is-online-adhd-diagnosis-legitimate`
7. `/answers/can-adhd-cause-anxiety`
8. `/knowledge/adhd/medication` — sub-hub
9. `/states/texas`
10. `/research/adhd-evaluation-insights`
11. `/answers/glp-1-side-effects`
12. `/knowledge/glp-1`
13. `/answers/what-does-low-testosterone-feel-like`
14. `/knowledge/adhd/symptoms`
15. `/answers/adhd-medication-side-effects`
16. `/states/pennsylvania`
17. `/answers/adderall-vs-vyvanse-adults`
18. `/knowledge/adhd/women`
19. `/answers/adhd-and-depression`
20. `/providers/dr-sneh-pandey#articles` (library section)

### Top 100 FAQs → `/answers/*` (abbreviated; full list in backlog ticket)

**ADHD signs & diagnosis (25):** signs of adult ADHD, ADHD vs anxiety, ADHD vs burnout, late diagnosis, high-functioning ADHD, ADHD in women, ADHD in men, time blindness, rejection sensitivity, executive dysfunction, online diagnosis legit, evaluation length, evaluation cost, ASRS explained, Creyos explained, screening vs evaluation, telehealth ADHD CA/TX/PA/FL, ADHD after 30, ADHD and relationships, ADHD and productivity, ADHD and sleep, ADHD and depression, ADHD quiz accuracy, second opinion ADHD, ADHD documentation for work

**ADHD medication (25):** Adderall how it works, IR vs XR, Vyvanse vs Adderall, Focalin vs Adderall, non-stimulants, side effects, long-term safety, daily vs as-needed, starting stimulants, stopping stimulants, medication online rules, Texas ADHD meds online, California ADHD meds online, drug screening ADHD, FSA HSA ADHD, generic vs brand, dose adjustment, appetite effects, cardiovascular monitoring, pregnancy ADHD meds, ADHD meds and alcohol, interaction checks, pharmacy issues, refill timing, telehealth follow-up cadence

**Weight / GLP-1 (20):** GLP-1 side effects, semaglutide how it works, tirzepatide vs semaglutide, compounded vs branded, oral vs injectable, phentermine safety, long-term weight meds, GLP-1 and mental health, GLP-1 Texas, medical vs dieting, plateaus, nausea management, cost GLP-1, insurance GLP-1, ADHD and weight overlap, metabolic health, peptides glutathione (education), weight loss monitoring, who qualifies, telehealth weight loss legit

**Men's / sexual / hair (15):** low T symptoms, TRT appropriate, TRT monitoring, ED telehealth, sildenafil expectations, testosterone and ADHD overlap, hair loss minoxidil oral vs topical, minoxidil does it work, men's health telehealth, libido and metabolic health, sleep and hormones, exercise TRT, fertility TRT, cardiovascular TRT, when to test testosterone

**Telehealth / primary (15):** how online prescriptions work, safe online prescriptions, telehealth legit, HIPAA telehealth, state licensing telehealth, meet and greet what to expect, membership pricing explained, FSA HSA telehealth, urgent care online limits, primary care telehealth scope, labs telehealth, prescriptions refill online, transfer records, second provider opinion, crisis vs telehealth

### Top 50 comparison articles (medication & modality)

Adderall vs Vyvanse, Adderall vs Ritalin, Focalin vs Adderall, IR vs XR (each drug), stimulant vs non-stimulant, Strattera vs stimulants, Qelbree overview, modafinil vs stimulants, semaglutide vs tirzepatide, Wegovy vs Ozempic (education), compounded vs branded GLP-1, oral vs injectable GLP-1, phentermine vs GLP-1, medical weight loss vs bariatric, telehealth vs in-person ADHD eval, ASRS vs full eval, Creyos vs neuropsych, online vs psychiatrist ADHD, Siya vs insurance ADHD (care model), CA vs TX telehealth rules, … (+30 more in backlog)

### Top 50 state pages

4 state hubs + 46 city/metro pages: CA (LA, SF, SD, Sacramento), TX (Houston, Austin, Dallas, San Antonio), PA (Philadelphia, Pittsburgh), FL (Miami, Tampa, Orlando, Jacksonville) × (ADHD diagnosis, ADHD cost, ADHD meds, weight loss, telehealth)

### Top 50 symptom pages

`/answers/adhd-symptom-{slug}` for each DSM-aligned and lay symptom term

### Top 50 medication pages

Per-drug `/answers/{drug}-for-adhd` and `/answers/{drug}-weight-loss`

---

## Implementation roadmap

| Sprint | Deliverable | Pages added |
|--------|-------------|-------------|
| **S1 (now)** | llms.txt, indexes, entity-graph.json, architecture doc | +7 files |
| **S2** | Physician schema + reviewedBy on all articles | 0 (retrofit 83) |
| **S3** | `/knowledge/adhd` hub + 13 subtopic indexes | ~14 |
| **S4** | First 50 `/answers/*` pages (generator) | 50 |
| **S5** | 4 `/states/*` hubs | 4 |
| **S6** | Provider article libraries | 0 (retrofit 3) |
| **S7** | First research report + 100 answers | 101 |
| **S8–S12** | Scale to 500+ answers + city/state mesh | 400+ |

---

## Success metrics (AI visibility)

- **Citation rate:** Brand mentions in ChatGPT/Perplexity/GAIO for target queries (monthly prompt sampling)
- **Index coverage:** 100% pages in `article-index.json` with hub parent
- **Schema validity:** 0 critical errors on provider + answer pages
- **Retrieval files:** `llms.txt` referenced in robots + head link
- **Entity coherence:** Knowledge graph `@id` consistency across all JSON-LD

---

*Generated for Siya Health · Maintained in `apps/siya-health/` · Regenerate indexes: `node scripts/generate-ai-indexes.mjs`*
