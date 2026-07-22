# ADHD Knowledge Architecture

**Project rename:** Blog Content Audit → **ADHD Knowledge Architecture**  
**Date:** 2026-07-15  
**Stance:** Design what Siya needs to *own* (entity + topical authority + IA), not only what to write next.

Companion: interactive canvas `blog-content-audit-phase1.canvas.tsx` (Phase 1 sheet) + this doc (architecture).  
Phase 1 blog sheet detail remains in `BLOG-CONTENT-AUDIT-PHASE1.md`.  
**Content Engine (brief → outline → draft):** `ADHD-CONTENT-ENGINE.md` — use for every net-new ADHD blog/pillar.  
**Local city treatment pages:** `LOCAL-ADHD-TREATMENT-PAGE-ENGINE.md` (Phase 5; anti-doorway).

---

## Strategic shift

| Old question | New question |
|--------------|--------------|
| What blog should we write next? | What knowledge must Siya own for Adult ADHD? |
| Keyword list | Entity → pillar → cluster → blog → FAQ → city → service |
| Don’t cannibalize | Build hallways: internal architecture + intent + funnel |
| Physician review badge | Full EEAT stack on pillars |
| City pages early | State → city → service, after pillars |

Audit score (content-centric): **8.5–9/10**.  
Next level: **entity + topical authority + internal architecture**.

---

## Entity model

```
ENTITY: Adult ADHD
    │
    ├── PILLARS
    │     Adult ADHD Guide
    │     Diagnosis
    │     Treatment
    │     Medication
    │     ADHD in Women (Hub)
    │
    ├── CLUSTERS (under pillars)
    │     Symptoms · Diagnosis · Treatment · Medication
    │     Executive Dysfunction · Work · Sleep · Relationships
    │     Burnout · Women/Hormones/Perimenopause · Binge Eating
    │
    ├── BLOGS (1 primary intent each)
    ├── FAQs (/answers/* — short, link UP)
    ├── LOCAL
    │     State hubs → City pages → Service CTAs
    └── SERVICE
          /adhd-care · screening · Meet & Greet · evaluation booking
```

Every URL should answer: **which entity, which cluster, which intent, which funnel goal?**

---

## Topical authority scorecard (current → invest)

Scores = coverage quality (0–10), not keyword volume.

| Cluster | Score | Notes | Invest |
|---------|------:|-------|--------|
| Medication | 8 | Strong national spokes; promote options → pillar | Upgrade pillar + EEAT |
| Symptoms / undiagnosed | 6 | Good keepers; CA thin; C1 overlap | Consolidate + expand keepers |
| Diagnosis (legit / online / process) | 5 | Fragmented; answers stronger than blogs | **Pillar + merge C2/C3** |
| Screening vs evaluation | 5 | Answer + thin CA testing blogs | One spoke uplinks to Diagnosis |
| Treatment (national) | 2 | Thin CA treatment only | **Create Treatment pillar** |
| Telehealth / prescribing online | 7 | Strong prescribing blog | Keep; merge CA blade |
| Cost / commercial process | 4 | Cost pages exist; thin TX blog; thin “what happens” depth | **Commercial cluster** |
| Women / late diagnosis | 3 → **hub live** | `/blog/adhd-in-women` (2026-07-17) | Maintain; perimenopause spoke next |
| Hormones / periods / perimenopause | 0–1 | Missing | Women’s Hub spokes |
| Binge eating / ADHD–weight | 1 → **spoke live** | `/blog/adhd-and-binge-eating` (2026-07-16); still need Women’s Hub parent | Maintain / link UP to Women hub when built |
| Executive dysfunction | 3 → **pillar live** | `/blog/executive-dysfunction-adhd` (2026-07-17); FAQ demoted | Maintain; future spokes |
| Work / meetings / masking | 1 | Sparse | Later cluster fills |
| Sleep / burnout overlap | 4 | Answers + fatigue blogs | Cross-link, not duplicate |
| Local TX | 6 | Diagnosis geos exist | State hub → city twins |
| Local CA | 3 | Overbuilt thin blogs vs weak hierarchy | Consolidate before LA |
| Local FL / PA / LA / Miami | 2–4 | Partial geos; missing treatment cities | After pillars |

Visual (invest darkest gaps first):

```
Medication     █████████░
Telehealth/Rx  ███████░░░
Symptoms       ██████░░░░
TX local       ██████░░░░
Diagnosis      █████░░░░░
Screen vs eval █████░░░░░
Cost/process   ████░░░░░░
Women hub      ███░░░░░░░
Exec dysfn     ███░░░░░░░
CA local       ███░░░░░░░ (cleanup, then expand)
Treatment      ██░░░░░░░░
Perimenopause  ░░░░░░░░░░
Binge eating   ░░░░░░░░░░
Work/masking   ░░░░░░░░░░
```

---

## Internal linking SOP (non-negotiable)

Every **ADHD blog and pillar** must include:

| Required | Target | Rule |
|----------|--------|------|
| 1 | Pillar | Parent cluster pillar (or Adult ADHD Guide if none yet) |
| 2 | Related blogs | Same cluster or adjacent cluster |
| 1 | FAQ | Relevant `/answers/*` (link UP to pillar in the FAQ too) |
| 1 | Service | `/adhd-care` and/or `/adhd-screening` / Meet & Greet by funnel |
| 1 | City/state | When local page exists; else omit until live — then backfill |

**Exceptions:** none for net-new ADHD content. Retrofit keepers in Phase 1 cleanup.

### CTA by funnel goal (not one CTA for all)

| Funnel goal | Primary CTA | Avoid |
|-------------|-------------|--------|
| Awareness | Take Free ADHD Screening · educational mid-links | Hard-sell evaluation |
| Trust / investigation | Book Free Meet & Greet · How evaluation works | Zocdoc as primary |
| Evaluation / commercial | Start ADHD Evaluation · `/adhd-care` | Vague “Contact us” |
| Booking | Meet & Greet or evaluation by readiness | Spruce as cold primary |
| Retention / referral | Care team, related guides, Circle | New patient booking spam |

Executive dysfunction / women’s hormones posts ≠ same CTA as ADHD evaluation cost.

---

## Search intent map

| Intent | Example query | Content type | Funnel goal |
|--------|---------------|--------------|-------------|
| Informational | What is adult ADHD? Signs? | Guide, symptoms blogs, FAQs | Awareness |
| Commercial investigation | Online ADHD diagnosis legit? How evaluation works? | Diagnosis pillar, process blogs | Trust |
| Commercial / cost | Evaluation cost, insurance, FSA/HSA | Cost + commercial cluster | Trust → Evaluation |
| Transactional | Book ADHD evaluation, screening | Service + landing CTAs | Booking |
| Navigational | Siya ADHD, Siya Health ADHD | Brand + `/adhd-care` | Booking |
| Local | ADHD treatment Austin / LA | State → city → service | Booking |

Each intent gets **one primary owner URL**; other pages support with links, not clone intents.

---

## EEAT roadmap (pillars first, then keepers)

### Every pillar MUST ship with

| Element | Requirement |
|---------|-------------|
| Physician reviewed | Named reviewer + credentials |
| Author bio | Who wrote / role |
| Medical reviewer bio | Short clinical bio + link to provider page when applicable |
| Last updated | Visible date |
| References / sources | Inline or end list (real clinical sources) |
| FAQ | On-page + schema |
| Related articles | Cluster siblings |
| Medical disclaimer | Non-diagnostic, state availability |
| Citations | Prefer primary literature / guidelines over blog links |

### Framework rollout

1. **Phase 1:** Template + fields in generators/chrome (reviewed-by block, last updated, disclaimer).  
2. **Phase 2–3:** Apply to all new pillars + Women’s Hub.  
3. **Backfill:** Keepers in C1/C5/C6 within 2 sprints.

“Clinician-informed pending” alone is not enough for healthcare topical authority.

---

## Women’s ADHD Hub (highest-value missing cluster)

```
ADHD in Women (Hub / Pillar)
    ├── Late diagnosis / masking
    ├── Hormones & cycles
    ├── Periods / PMDD overlap (where clinically appropriate)
    ├── Perimenopause
    ├── Pregnancy / postpartum (later; compliance-heavy)
    ├── Medication considerations in women
    ├── Binge eating / emotional eating
    ├── Sleep
    └── → Diagnosis / Treatment / Medication pillars
         → /adhd-care + Meet & Greet (trust funnel)
```

Answers already seed `adhd-in-women` and `late-adhd-diagnosis-adults` — promote into hub + blogs; do not leave as orphan FAQs.

---

## Commercial content cluster (conversion support)

Own explicitly (several exist thin or as answers only):

| Asset | Role |
|-------|------|
| How ADHD evaluations work | Process / trust |
| What happens during diagnosis | Expectation setting |
| How long it takes | Friction reduction |
| Cost / FSA-HSA / insurance framing | Commercial investigation |
| Medication process after diagnosis | Bridge treatment → Rx |
| What to expect (first visits) | Trust |

Link upward from these to Diagnosis/Treatment pillars and downward to `/adhd-care`.

---

## Local cluster strategy (hierarchy, not doorway list)

```
Texas
  ├── Austin
  ├── Houston
  ├── Dallas (later)
  └── San Antonio (later)

California
  ├── Los Angeles
  ├── San Diego (later)
  ├── San Francisco / San Jose (later)
  └── (after C3 cleanup)

Florida
  └── Miami (+ state hub)

Pennsylvania
  └── Philadelphia
```

Pattern per city: why adults there search · symptoms · evaluation includes · virtual care in-state · access (evening/weekend) · FAQs · related resources → state hub ↔ pillars ↔ service.

**Do not** spray city listicles before Treatment + state hubs exist.

---

## Repurposing map (create once, distribute many)

Every **pillar** auto-generates:

| Output | Count (target) |
|--------|----------------|
| Blogs (cluster spokes) | 5 |
| FAQs (`/answers`) | 15 |
| Short video / Reels scripts | 10 |
| Carousels | 5 |
| Newsletter section | 1 |
| Lead magnet angle | 1 |

SOP owners: content + growth. Pillar briefs must include the repurposing checklist before publish.

---

## Execution plan (revised)

### Phase 1 — Today / this sprint (cleanup + framework)

- Consolidate **California cluster (C3)** → 1 diagnosis + 1 treatment keeper; redirect weak pages  
- Internal linking pass on ADHD keepers (SOP minimums)  
- Stand up **EEAT template** (physician review, last updated, refs, disclaimer, bios)  
- Do **not** ship a batch of city pages  

### Phase 2 — Core pillars

1. Adult ADHD Guide  
2. ADHD Diagnosis  
3. ADHD Treatment  

### Phase 3 — Women’s ADHD Hub

- Late diagnosis, hormones/cycles, perimenopause, medication nuance, binge eating, sleep  
- Wire to Diagnosis / Treatment / Medication  

### Phase 4 — Commercial

- Online ADHD Evaluation (educational → `/adhd-care`)  
- Evaluation cost / what happens / how long / medication process  

### Phase 5 — Local

- State hubs → city treatment pages (LA, Miami first; Austin/Philly treatment twins of existing diagnosis geos)  

---

## Funnel goal column (add to all future audits)

| Funnel goal | Typical URL types |
|-------------|-------------------|
| Awareness | Symptoms, “is it ADHD?”, women late dx |
| Trust | Legit online diagnosis, process, EEAT-heavy pillars |
| Evaluation | Cost, what’s included, screening vs eval |
| Booking | Service landings, Meet & Greet, city pages |
| Retention | Follow-up, medication living-with guides |
| Referral | Care team, Circle, shareable explainers |

---

## Relationship to prior Phase 1 audit

| Keep from Phase 1 audit | Elevate here |
|-------------------------|--------------|
| CA cannibalization decision | Nested under entity IA |
| Missing pillars callout | Explicit Phase 2 |
| Don’t rush cities | Phase 5 + state hierarchy |
| Blog action sheet | Still valid; rename project mindset |
| Gap matrix | Folded into authority scorecard + Women’s Hub + commercial |

---

## Success criteria

1. Every ADHD URL maps to entity → pillar → cluster → intent → funnel goal.  
2. Zero unresolved C3 duplicate intents after redirects.  
3. Three core pillars + Women’s Hub live with full EEAT stack.  
4. Linking SOP enforced on all net-new ADHD posts.  
5. City pages only ship as children of Treatment + state hub.  
6. Pillars ship with repurposing checklist completed.

---

*Next executable step when approved: Phase 1 — CA consolidate + EEAT template + linking SOP retrofit on keepers — then Phase 2 Adult ADHD Guide.*
