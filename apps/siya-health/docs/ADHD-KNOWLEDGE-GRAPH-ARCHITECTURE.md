# Siya Health — ADHD Knowledge Graph Architecture

**Role:** Chief SEO Architect output  
**Date:** 2026-07-17  
**Mode:** Architecture only — no articles, no rewrites  
**Sources:** Live HTML inventory · `ADHD-INTERNAL-LINKING-AUDIT.md` · cluster roadmap · TX hub deploy

---

## 1. Topic graph (visual hierarchy)

```
ENTITY: Adult ADHD
│
├── PILLARS (canonical owners)
│   ├── Adult ADHD Guide ─────────── /blog/how-to-know-if-you-have-adhd-adult  (+ hub /blog/adhd)
│   ├── Diagnosis ────────────────── WEAK — fragmented (no single national pillar)
│   ├── Treatment ────────────────── WEAK — /adhd-care is service; no national Treatment pillar
│   ├── Medication ───────────────── /blog/adhd-medication-options-for-adults
│   └── Women ────────────────────── MISSING hub — only /answers/adhd-in-women
│
├── SUPPORTING CLUSTERS
│   ├── Symptoms / Undiagnosed ───── overlooked · not-lazy · signs · high-functioning
│   ├── Executive Dysfunction ────── /answers/executive-dysfunction-adhd (FAQ only)
│   ├── Time Blindness ───────────── /answers/time-blindness-adhd
│   ├── Burnout / Anxiety / RSD ──── vs-anxiety · vs-burnout · rejection-sensitivity
│   ├── Food Noise / Binge ───────── binge blog · food-noise · weight-connection
│   ├── Sleep overlap ────────────── poor-sleep-feels-like-adhd (+ fatigue blogs)
│   └── Screening ────────────────── /adhd-screening · ASRS · Creyos · online-test
│
├── COMMERCIAL / SERVICE
│   ├── /adhd-care ───────────────── primary conversion
│   ├── /redirect/meet-greet ─────── trust CTA
│   ├── Cost / process ───────────── evaluation-cost · $199 · FSA · how-long
│   └── Online legit ─────────────── is-online-adhd-diagnosis-legit
│
└── LOCAL (State → City)
    ├── TX Treatment Hub ─────────── /blog/adhd-treatment-texas
    │     └── Dallas · Houston · Austin · San Antonio · Fort Worth
    ├── TX Diagnosis Hub ─────────── /adhd-diagnosis-texas
    │     └── Austin · Houston  (Dallas twin MISSING)
    ├── FL ───────────────────────── diagnosis state + Miami/Orlando treatment (NO FL treatment hub)
    ├── PA ───────────────────────── diagnosis state/Philly + Philly treatment (NO PA treatment hub)
    └── CA ───────────────────────── overbuilt thin blogs (C3 cleanup before LA/SD)
```

### Node types

| Type | Role | Examples |
|------|------|----------|
| **Pillar** | Owns entity; absorbs inbound | Medication options, How-to-know, `/adhd-care`, TX treatment hub |
| **Supporting blog** | One primary intent | Not-lazy, Vyvanse vs Adderall, Binge eating |
| **FAQ** | Short; links UP | `/answers/*` |
| **Commercial / service** | Conversion | `/adhd-care`, screening, cost, Meet & Greet |
| **Local** | Geo commercial investigation | City treatment / diagnosis |

---

## 2. Weak nodes (ranked)

Weak = underlinked · low authority · isolated · duplicate intent · bad parent-child.

| Rank | Page | Weakness | Severity | Fix type |
|-----:|------|----------|----------|----------|
| 1 | Women’s cluster (no hub) | Isolated FAQs; no parent | Critical | Architecture (create hub later) |
| 2 | Executive Dysfunction FAQ-only | No blog owner; entity leak risk | Critical | Architecture |
| 3 | Perimenopause / hormones | **Missing node** | Critical | Architecture |
| 4 | National Diagnosis pillar | Duplicate intent across CA/TX/answers | High | Consolidate ownership |
| 5 | National Treatment pillar | `/adhd-care` ≠ educational Treatment pillar | High | Architecture |
| 6 | `/blog/adhd-treatment-texas` | Pillar underlinked (was ~7 in) | High | Edges (partially applied) |
| 7 | Miami / Orlando / Philly treatment | Thin inbound (~2) | High | Edges |
| 8 | CA thin blades (provider/treatment/symptoms) | Duplicate local intent | High | C3 consolidate |
| 9 | `/adhd-evaluation-cost` | Was orphan | Medium | Edges applied |
| 10 | `/answers/rejection-sensitivity-adhd` | Thin inbound | Medium | Edges |
| 11 | `/answers/adderall-vs-vyvanse-adults` | Thin inbound vs blog twin | Medium | Edges |
| 12 | `/adhd-screening-results` | Dead-end after screen | Medium | Journey edges |
| 13 | Dallas diagnosis twin | Missing local child | Medium | Architecture |
| 14 | FL/PA treatment hubs | Missing parents for cities | High | Architecture |
| 15 | `/blog/adhd` hub | Excess outbound (51) — OK as index, don’t grow | Low | Cap |

---

## 3. New internal links (contextual only)

Targets: **8–12** contextual on commercial; **5–8** on informational.  
Never footer/nav. Varied anchors.

### A. Commercial pages still needing edges

| From → To | Anchor ideas (rotate) |
|-----------|------------------------|
| `/adhd-diagnosis-florida` → Miami + Orlando treatment | “ADHD treatment in Miami” / “Orlando virtual ADHD care” |
| `/adhd-diagnosis-pennsylvania` + Philly diagnosis → Philly treatment | “Philadelphia ADHD treatment options” |
| `/adhd-care` → TX hub + FL/PA cities (sparse, 1 each) | “ADHD treatment across Texas” / “Miami ADHD care” |
| TX diagnosis geos → matching city **treatment** | “Austin ADHD treatment” (not only diagnosis) |
| `/adhd-screening-results` → `/adhd-care` + Meet & Greet + screening-vs-eval | “what a full evaluation includes” |
| Cost answers → `/adhd-evaluation-cost` + `/blog/adhd-evaluation-cost-texas` | “Texas evaluation cost breakdown” |

### B. Informational pages → parent + commercial

| From | Must include |
|------|----------------|
| Every symptoms blog | Parent: how-to-know or `/blog/adhd` · FAQ: signs · Service: `/adhd-care` · Soft: Meet & Greet |
| Every medication blog | Parent: medication-options · FAQ: starting meds · Service: `/adhd-care` · Related: prescribed-online |
| Every women/late-dx answer | Parent: (future Women hub) interim `/blog/adhd` · binge · exec dysfunction · `/adhd-care` |
| Exec dysfunction / time blindness | Parent: how-to-know · Sibling each other · `/adhd-care` |
| Binge / food noise | Parent: `/blog/adhd` · Women answer · medication-options · `/adhd-care` · TX hub if TX angle |

### C. Local Texas web (reinforce)

Every TX city treatment ↔ 2–3 siblings + TX hub + state diagnosis + `/adhd-care` (mostly done; keep anchors varied).

---

## 4. Semantic gaps (genuinely missing owners)

Mentions exist sitewide; **canonical pages do not**.

| Entity | Mentioned? | Canonical owner today | Gap |
|--------|:----------:|-----------------------|-----|
| Working memory | Sparse | None | Need FAQ or section under Exec Dysfunction owner |
| Masking | Mentions | None | Need Women / late-dx spoke |
| Time blindness | Yes | `/answers/time-blindness-adhd` | OK — protect as owner |
| Decision fatigue | Sparse | None | Fold into Exec Dysfunction blog when built |
| RSD | Thin FAQ | `/answers/rejection-sensitivity-adhd` | Needs inbound + optional blog |
| ADHD burnout | Mentions | `/answers/adhd-vs-burnout` | OK short-term |
| Sleep × ADHD | Partial | `/answers/poor-sleep-feels-like-adhd` | Need dedicated spoke later |
| Relationships | Mentions only | **Missing** | Later cluster |
| Parenting ADHD | Sparse | **Missing** | Later |
| Career / workplace ADHD | Mentions | **Missing** | Later |
| Women hub | FAQ only | **Missing** | Highest |
| Hormones / cycles | Sparse | **Missing** | Under Women |
| Perimenopause | Near-zero | **Missing** | Highest empty |
| Binge eating | Yes | `/blog/adhd-and-binge-eating` | OK — protect |
| Food noise | Yes | `/blog/food-noise…` + `/answers/what-is-food-noise` | OK |
| Productivity / motivation | Mentions | Absorbed by symptoms — no dedicated owner | Optional later |

**Do not create** duplicate pages for entities that already have a clear FAQ owner (time blindness, ADHD vs burnout) until traffic demands depth.

---

## 5. Entity ownership (ONE canonical URL)

| Entity | Canonical owner | Supporting only (link UP) |
|--------|-----------------|---------------------------|
| Adult ADHD (symptoms) | `/blog/how-to-know-if-you-have-adhd-adult` | overlooked, not-lazy, signs FAQ, hub `/blog/adhd` |
| Adult ADHD index | `/blog/adhd` | All ADHD blogs |
| Diagnosis (national) | **Designate:** `/blog/is-online-adhd-diagnosis-legit` until Diagnosis pillar ships | CA/TX diagnosis blogs, can-diagnose FAQ |
| Online diagnosis | `/blog/is-online-adhd-diagnosis-legit` | `/answers/can-adhd-be-diagnosed-online`, `/answers/is-online-adhd-diagnosis-legitimate` |
| Evaluation / what happens | `/answers/what-included-199-adhd-evaluation` + `/answers/how-long-adhd-evaluation` | City process sections |
| Treatment (national) | **Interim service:** `/adhd-care` · **Need educational pillar** | City treatment pages |
| Medication | `/blog/adhd-medication-options-for-adults` | All med blogs/FAQs |
| Medication monitoring / long-term | `/blog/is-adhd-medication-safe-long-term` | side-effects FAQ/blog |
| Online prescribing | `/blog/how-adhd-medication-is-prescribed-online` | can-you-get-meds-online FAQ |
| Women | **Missing hub** → interim `/answers/adhd-in-women` | late-dx FAQ |
| Executive dysfunction | `/answers/executive-dysfunction-adhd` → **promote to blog owner later** | time blindness |
| Time blindness | `/answers/time-blindness-adhd` | — |
| Food noise | `/blog/food-noise-and-glp-1…` | what-is-food-noise FAQ |
| Binge eating × ADHD | `/blog/adhd-and-binge-eating` | weight-connection FAQ |
| Burnout | `/answers/adhd-vs-burnout` | — |
| Anxiety differential | `/answers/adhd-vs-anxiety` | can-adhd-cause-anxiety |
| RSD | `/answers/rejection-sensitivity-adhd` | — |
| Sleep overlap | `/answers/poor-sleep-feels-like-adhd` | fatigue blogs |
| Screening | `/adhd-screening` | ASRS FAQ, screening-vs-eval |
| TX Treatment | `/blog/adhd-treatment-texas` | 5 city treatment pages |
| TX Diagnosis | `/adhd-diagnosis-texas` | Austin/Houston diagnosis |
| Cost | `/blog/adhd-evaluation-cost-texas` (TX) · `/adhd-evaluation-cost` (national) | FSA, how-much FAQs |
| Conversion | `/adhd-care` + `/redirect/meet-greet` | All pages |

---

## 6. Commercial journey

### Ideal path

```
Symptoms (overlooked / not-lazy / signs FAQ)
    ↓
Adult ADHD Guide (how-to-know)
    ↓
Cluster deep-dive (exec dysfunction · women · binge · sleep)
    ↓
Treatment education (TX hub or future national Treatment pillar)
    ↓
Evaluation education (screening-vs-eval · what-included · how-long · online legit)
    ↓
Trust: Meet & Greet
    ↓
Commercial: /adhd-care (Start Evaluation)
```

### Broken / leaky journeys

| Break | Where | Effect |
|-------|-------|--------|
| No Women hub | Late-dx & women FAQ → jump to `/adhd-care` | Skips education → lower trust |
| Exec dysfunction FAQ dead-end | Thin related links historically | Stalls before treatment |
| Screening results weak outbound | `/adhd-screening-results` | Drop-off after ASRS |
| CA thin pages | Multiple diagnosis/treatment intents | Cannibalization / confused crawl |
| FL/PA cities without state treatment hub | Orphaned geos | Authority not concentrated |
| National Treatment pillar missing | Symptoms → `/adhd-care` too fast | Feels salesy or thin |

---

## 7. Featured snippet opportunities (by owner)

| Owner URL | Format to add later (do not write now) |
|-----------|----------------------------------------|
| how-to-know / signs FAQ | Numbered symptom list · definition box |
| executive-dysfunction FAQ | Definition <50 words · vs laziness table |
| time-blindness FAQ | Definition · practical examples list |
| adhd-vs-anxiety | Comparison table |
| screening-vs-eval | Two-column comparison |
| medication-options | Decision table stimulant vs non-stimulant |
| vyvanse-vs-adderall | Duration/onset table |
| binge eating | Emotional vs ADHD table (exists) · prevalence blurb |
| food noise | Definition snippet (exists) |
| TX / city treatment | Numbered “what happens in evaluation” |
| how-long-evaluation | Short answer <50 words |
| what-included-199 | Bulleted inclusions |

---

## 8. Knowledge Graph scores (0–10)

| Cluster | Score | Rationale |
|---------|------:|-----------|
| Adult ADHD | 8 | Strong symptoms + hub; Guide pillar naming still soft |
| Medication | 8 | Dense spokes + clear owner |
| Local SEO (TX) | 8 | Hub + 5 cities; diagnosis twins incomplete |
| Diagnosis | 6 | Good pieces; no single national pillar |
| Treatment | 6 | Service strong; educational pillar weak; TX good |
| Screening / Commercial process | 6 | Screening strong; cost/results edges weak |
| Food Noise / Binge | 5 | Binge owner live; still thin FAQ layer |
| Burnout / Anxiety / RSD | 4 | FAQs exist; low inbound; no depth blogs |
| Sleep | 4 | Overlap pages; no dedicated ADHD-sleep owner depth |
| Local FL/PA | 4 | Cities without state treatment hubs |
| Local CA | 3 | Overbuilt thin; cleanup debt |
| Women | 3 | FAQ seeds only |
| Executive Dysfunction | 2 | FAQ-only owner |
| Perimenopause / Hormones | 0 | Missing |
| Relationships / Parenting / Career | 1 | Mentions only |

### Next three highest-ROI investments

1. **Women’s ADHD Hub** (canonical parent for late dx · hormones · binge · sleep)  
2. **Executive Dysfunction blog** (promote FAQ → pillar spoke; absorb working memory / decision fatigue)  
3. **FL + PA Treatment Hubs** (same pattern as TX — concentrates geo authority before more cities)

Honorable mention: **National Diagnosis + Treatment pillars** (hallway repair for commercial journey).

---

## 9. Prioritized roadmap (architecture actions only)

| Phase | Action | Outcome |
|-------|--------|---------|
| A | Finish contextual edges to TX hub + FL/PA cities + screening-results | Stronger crawl paths |
| B | Designate interim owners (table §5) in Content Engine rules | Stop entity duplication |
| C | Brief Women’s Hub + Exec Dysfunction (no draft until approved) | Fill score 0–3 gaps |
| D | FL/PA treatment hubs | Local graph parity with TX |
| E | CA C3 consolidate | Remove duplicate intents |
| F | National Diagnosis + Treatment pillars | Complete commercial journey |
| G | Only then: city med/cost twins · LA/SD | Scalable local system |

---

## Companion files

- [ADHD-INTERNAL-LINKING-AUDIT.md](./ADHD-INTERNAL-LINKING-AUDIT.md)  
- [ADHD-CLUSTER-ROADMAP.md](./ADHD-CLUSTER-ROADMAP.md)  
- [LOCAL-SEO-SYSTEM-ARCHITECTURE.md](./LOCAL-SEO-SYSTEM-ARCHITECTURE.md)  
- [Topical Authority canvas](/Users/sp/.cursor/projects/Users-sp-amcare-os/canvases/adhd-topical-authority.canvas.tsx)
