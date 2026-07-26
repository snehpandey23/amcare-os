# Canonical Entity Page Blueprint

```text
Version:           1.1
Status:            Production (FROZEN reference)
Date:              2026-07-26
Reference pages:   /adult-adhd-california   (condition entity)
                   /fatigue                 (symptom entity)
Governance:        Siya Knowledge Governance Framework v1.0
Freeze note:       Transitions diagnostic (~7.8) is not a redesign trigger.
Naming:            Formerly "Cornerstone Reference Blueprint". Renamed because
                   these pages are canonical ENTITIES, not SEO cornerstones —
                   the same unit the knowledge graph, Public Knowledge API, and
                   Siya Guide resolve against.
```

`/adult-adhd-california` was the **first page built because of the governance framework**, not
merely under it. `/fatigue` is the first page built by *cloning* this blueprint, which is what
proved it was a blueprint rather than one good page.

Every future flagship page — Brain Fog, Primary Care, Preventive Care, Perimenopause — is a
**Canonical Entity Page**. Copy this architecture; do not reinvent it.

---

## Entity types

Two shapes so far. The architecture is identical; the destination is not.

| | Condition entity | Symptom entity |
| --- | --- | --- |
| Example | `/adult-adhd-california` | `/fatigue` |
| Reader arrives | naming a condition | describing an experience |
| Journey | recognition → evaluation → treatment | recognition → meaning → differential → evaluation |
| Primary CTA | condition action (`Free ADHD Screening`) | `Book a primary care visit` |
| Schema `about` | `MedicalCondition` | `MedicalSymptom` + `possibleCause[]` |
| Relationship to siblings | owns its condition; links to symptoms | hub; conditions are *related*, never the destination |

**The rule that matters:** a symptom entity must not funnel into whichever condition the business
would most like to sell. Fatigue resolves to primary care. ADHD is one differential row on
`/fatigue`, and that is the whole point of symptom-first reasoning.

---

## Ownership table

| Page | Ownership |
| --- | --- |
| `/adult-adhd-california` | California ADHD educational and commercial canonical entity |
| `/adhd-care` | General ADHD service and care-process page |
| `/adhd-screening` | Screening action |
| `/fatigue` | Fatigue symptom canonical entity (primary care destination) |
| `/primary-urgent-care` | Primary care service and care-process page |
| Narrow guides | Specific informational intent |

Do **not** create a competing canonical entity for a topic that already has one.

---

## 1. Generator structure

| Item | Path / rule |
| --- | --- |
| Generator | `scripts/generate-california-adhd-cornerstone.mjs` |
| Output | `adult-adhd-california.html` (root) |
| Build slot | **Before** `seo-build.mjs` (chrome, sitemap, OG polish apply after) |
| npm script | `npm run cornerstone:ca-adhd` |
| Chrome | Emit minimal head + skeleton header/footer; `applySiteChrome` fills GTM, nav CTA, footer, cookies, FAQ script, concierge |
| Content model | Single HTML document; sections earn their place; no optional mail-merge modules |

**Section order (locked for this entity):**

1. Hero (recognition + one primary CTA)
2. On this page (in-page anchors only)
3. Recognition / what ADHD looks like in adults
4. When evaluation may help + how diagnosis works
5. Treatment options (medication + non-medication)
6. Women & ADHD + executive dysfunction
7. Myths + California availability
8. Pricing
9. Free screening (secondary CTA only)
10. FAQ accordion
11. Related Health Guides (≤6 links)

**Explicitly excluded:** city directories, metro dumps, competing state CTAs, multi-primary CTA bands.

### Symptom-entity variant (`/fatigue`)

| Item | Path / rule |
| --- | --- |
| Generator | `scripts/generate-fatigue-entity-page.mjs` |
| Output | `fatigue.html` (root) |
| npm script | `npm run entity:fatigue` |

Section order:

1. Hero (recognition + one primary CTA: book primary care)
2. On this page
3. What the symptom actually means
4. **Differential Recognition** — "what it could be"
5. When medical evaluation helps (including red flags that should not wait)
6. How Siya approaches it (history before tests)
7. Labs a clinician **may** consider — framed as orientation, never as a panel to order
8. Related guides (≤6 links)
9. FAQ accordion
10. Next step (secondary button; primary already spent in hero)

**Explicitly excluded:** weight-loss, TRT, GLP-1, and hormone funnels. Those are related entities
reached through the differential when clinically appropriate, not sections of a symptom hub.

---

## Reusable pattern: Differential Recognition

Introduced by `/fatigue`; reusable across brain fog, low motivation, and poor concentration.

| Item | Rule |
| --- | --- |
| Module | `data/differential-diagnosis.mjs` → `renderDifferentialSection(key)` |
| Registry | `DIFFERENTIALS[key]` — one entry per symptom entity |
| Block id | `SIYA:DIFFERENTIAL-RECOGNITION` (registered in `data/content-blocks.mjs`) |
| Owner | Clinical: Dr. Swati Pandey · Editorial: Content OS |
| Shape | Table: cause · why it can present this way · one "learn more" link |
| Row cap | **≤8** — keeps the section inside `ASSEMBLY.maxLinksPerSection` |

Clinical constraints, non-negotiable:

- No percentages, no likelihood language, no "most common".
- Neutral ordering — grouped, never ranked.
- No instruction to test or treat, and no self-assessment framing.
- Must state that more than one cause can be true at once.

It teaches one idea: this symptom has many possible causes, and sorting them out is a clinical
process. That is recognition, not diagnosis.

---

## 2. Schema composition

Emit in `<head>` as three JSON-LD scripts:

| Type | Role |
| --- | --- |
| `MedicalWebPage` | Canonical page identity; `about`; `reviewedBy`; `provider`; `lastReviewed` |
| `BreadcrumbList` | Home → parent service → entity |
| `FAQPage` | Same Q/A set as the visible accordion |

`about` follows the entity type: `MedicalCondition` for a condition, `MedicalSymptom` with
`possibleCause[]` for a symptom. `reviewedBy` follows the clinical owner — Family Medicine for
`/fatigue`, ADHD-specialist for `/adult-adhd-california`.

Do not invent additional schema types unless a future hub has a distinct clinical need.

---

## 3. Entity registration

| Layer | Where | What |
| --- | --- | --- |
| Machine graph (condition) | `data/entity-graph.json` → `stateHubs[California]` | `cornerstoneUrl`, `entity`, `aliases`, `relatedEntities`, `currentUrls` |
| Machine graph (symptom) | `data/entity-graph.json` → `symptoms[]` | `canonicalUrl`, `parents`, `children`, `relatedConditions`, `labs`, `service`, `primaryCta`, `retiredUrls` |
| Human registry | `docs/ADHD-ENTITY-REGISTRY.md` | Canonical row; no competing CA hub |
| Public Knowledge API | `apps/siya-assistant/data/knowledge-entities.json` | `adult_adhd_california` entity + aliases |
| Resolver | `apps/siya-assistant/lib/entities.ts` | `resolveEntity` / `resolveAnswer` — deterministic, pre-LLM |
| Link registry | `apps/siya-assistant/lib/link-registry.ts` | `adult_adhd_california` link id |

**Contract for chatbot / apps:**

```json
{
  "entity": "adult_adhd_california",
  "canonical_page": "/adult-adhd-california",
  "primary_cta": { "id": "adhd_screening", "label": "Free ADHD Screening" },
  "secondary_ctas": ["Explore ADHD Care", "Pricing"],
  "related_entities": ["executive_dysfunction", "women_and_adhd", "adhd_screening", "adhd_care"]
}
```

Symptom entities additionally declare `parents`, `children`, `labs`, `related_guides`, and
`related_services`, so "I'm exhausted all the time" resolves to:

```json
{
  "entity": "fatigue",
  "canonical_page": "/fatigue",
  "primary_cta": { "id": "book_appointment", "label": "Book a primary care visit" },
  "related_services": ["Primary & Urgent Care", "Lab Testing"],
  "related_guides": ["Tired even after sleeping", "Brain fog", "Sleep apnea signs", "Perimenopause"]
}
```

No LLM reasoning required to choose the link — and, critically, no ADHD screening CTA on a
fatigue query.

---

## 4. CTA policy

| Rule | Implementation |
| --- | --- |
| Exactly **one** `ds-button--primary` in `<main>` | Hero. CA ADHD: Free ADHD Screening. Fatigue: Book a primary care visit |
| Secondary actions | `ds-button--secondary` or text links only |
| Nav CTA | Follows page intent — screening for ADHD pages, Meet & Greet for symptom hubs (default intent, no override needed) |
| Conversion intent | `adult-adhd-california.html` → ADHD funnel; `fatigue.html` → default/primary-care funnel |
| Closing / mid-page | Must not introduce a second primary |

Assembly gate: `ASSEMBLY.maxPrimaryCtas === 1`.

---

## 5. Internal-link pattern

**Outgoing (from cornerstone):** capped related guides + service pages (`/adhd-care`, `/adhd-screening`, `/pricing`, women/executive hubs). No city links.

**Incoming (to cornerstone):**

- Statewide CA blogs via `SIYA:CA-STATEWIDE-NEXT` (`apply-california-city-linking.mjs`)
- Retired CA city treatment clones → **308** direct to `/adult-adhd-california`
- CA-specific retired URLs (e.g. EG-P0-01, CA evaluation-cost alias) → cornerstone

**Redirect ownership:**

```text
old CA URL  →  /adult-adhd-california     (single hop)
/adhd-care  →  200 (never redirected)
```

Never: `old URL → /adhd-care → canonical entity`.

### Retiring a predecessor

When an entity supersedes an existing page that *had* value, retire the predecessor — do not
upgrade it in place, and do not merge a blog architecture into an entity architecture.

| Step | Where |
| --- | --- |
| Declare the retirement + reason | `data/retired-content.mjs` |
| Stub + redirect registration | `scripts/retire-pages.mjs` (runs **first** in the build) |
| Hand the cluster over | every build-time source that named the old page now names the entity |
| Remove injectors targeting it | generators must not write sections into a stub |
| Retarget chained redirects | anything pointing at the retired page repoints to the entity |

`/fatigue` superseded `/blog/why-am-i-always-tired-causes-when-to-see-doctor` (3,386 words, real
ranking history) this way: 308 to the entity, cluster cornerstone role transferred in
`content-topic-clusters`, `labs-pages`, `answer-seeds`, `site-chrome`, and `cannibalization-phase1`.

---

## 6. AI-index contract

| Artifact | Requirement |
| --- | --- |
| `sitemap.xml` | Include once; exclude `noindex` stubs |
| `llms.txt` / `llms-full.txt` | Title + URL + summary for the cornerstone |
| `guide-index.json` / page indexes | Present when indexable |
| `apps/siya-assistant/data/public-kb.json` | Chunk with `path: /adult-adhd-california` |
| Build order | `generate-ai-indexes.mjs` **before** `build-public-kb.mjs` |

---

## 7. Governance score (freeze baseline)

Run against the production commit:

```text
npm run governance
  assembly:validate → PASS
  blocks:validate   → PASS
  docs:hygiene      → PASS
```

| Metric | Baseline |
| --- | --- |
| Primary CTAs in `<main>` | 1 |
| Links per section | ≤8 |
| City-directory padding | 0 |
| Editorial fingerprint (gate) | ≥9 (this page: 10) |
| Formal 6-dim overall (diagnostic) | ~7.8–10 (transitions density is diagnostic, not a redesign trigger) |
| Schema | MedicalWebPage + FAQPage + BreadcrumbList |
| Competing CA cornerstone | None |

**Do not redesign the page to chase a single diagnostic heuristic.** Guardrails are not deities.

---

## How to clone this for the next entity

1. Decide the entity type (condition or symptom) — it sets the journey and the primary CTA.
2. Register the entity in `entity-graph.json` + `knowledge-entities.json` + `link-registry.ts`.
3. Copy the generator pattern (sections that answer real questions; one primary CTA).
4. Wire the generator before `seo-build.mjs`; add an `npm run entity:*` script.
5. Add the page to the fingerprint list in `validate-content-assembly.mjs`.
6. Register any new reusable block in `data/content-blocks.mjs` with owner + allowed context.
7. Point inbound cluster links at the new canonical; retire the predecessor via `retired-content.mjs`.
8. Ship the schema trio appropriate to the entity.
9. Pass `npm run governance` before deploy, then smoke-test production.
10. Freeze scores; do not immediately start another entity page.

Built under this blueprint so far:

| Entity | Page | Type | Notes |
| --- | --- | --- | --- |
| Adult ADHD California | `/adult-adhd-california` | condition | Reference implementation |
| Fatigue | `/fatigue` | symptom | First clone; introduced Differential Recognition; retired the tiredness blog |
