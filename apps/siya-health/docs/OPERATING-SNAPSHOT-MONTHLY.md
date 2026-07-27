# Operating snapshot (monthly)

```text
Purpose:   Comparable month-over-month story for platform + acquisition
Owner:     Platform / Growth
Cadence:   First business day of each month (or last Friday)
Baseline:  July 2026 — densification + CA standards + Batch 1–2 + instrumentation
Meeting:   One-hour platform review (not an engineering stand-up)
```

Fill blanks from Search Console, GA4, and `npm run graph:observe`.
Do **not** change Coverage Score rubric to make the table look better.

Exploration specs: **`GA4-ENTITY-EXPLORATIONS.md`** (Funnel · Transitions · Assisted).

---

## Section 1 — Graph Health

```bash
cd apps/siya-health && npm run graph:observe
```

| Metric | July 2026 | August | September | October |
| --- | ---: | ---: | ---: | ---: |
| Root reachability | **13/13** | | | |
| Graph density | **0.603** | | | |
| Connectivity | **100** | | | |
| Coverage score | **100** | | | |
| Avg inbound (canonical) | **~5.8** | | | |
| Assembly PRIMARY failures | **0** | | | |
| Assembly OVERLINK failures | **0** | | | |

Paste the one-liner:

```text
Reachability _/_ · density _ · coverage _ · connectivity _
```

---

## Section 2 — SEO

| Metric | July 2026 | August | September | October |
| --- | ---: | ---: | ---: | ---: |
| Organic clicks (Search Console, 28d) | — | | | |
| Organic impressions (28d) | — | | | |
| Indexed supporting articles (Batch 1 = 8, Batch 2 = 3) | — | | | |
| Top query gains (names) | — | | | |

### Indexing checklist (supporting clusters)

| URL | Indexed? | Canonical OK? | Notes |
| --- | --- | --- | --- |
| `/blog/brain-fog-vs-adhd` | | | |
| `/blog/brain-fog-and-sleep` | | | |
| `/blog/brain-fog-and-anxiety` | | | |
| `/blog/brain-fog-after-covid` | | | |
| `/blog/brain-fog-at-work` | | | |
| `/blog/fatigue-despite-normal-labs` | | | |
| `/blog/iron-deficiency-and-fatigue` | | | |
| `/blog/thyroid-and-fatigue` | | | |
| `/blog/morning-fatigue` | | | |
| `/blog/fatigue-after-illness` | | | |
| `/blog/chronic-fatigue-vs-everyday-tiredness` | | | |

Do **not** obsess over average position in the first few weeks.

---

## Section 3 — Entity Utilization

| Metric | July 2026 | August | September | October |
| --- | ---: | ---: | ---: | ---: |
| Entity views (`entity_view`) | — | | | |
| Entity related clicks | — | | | |
| Entity conversions (`entity_conversion`) | — | | | |
| Assisted conversions (path length ≥ 2) | — | | | |

| Rank | Top by views | Top by transitions | Top by assisted conversions | Highest exit rate |
| ---: | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

Pull transitions from Exploration Report 2; assists from Report 3 (`GA4-ENTITY-EXPLORATIONS.md`).

---

## Section 4 — Marketing

| Metric | July 2026 | August | September | October |
| --- | ---: | ---: | ---: | ---: |
| Paid traffic by top entity | — | | | |
| Organic traffic by top entity | — | | | |
| Guide conversations by entity | — | | | |
| Cost per booking (paid) | — | | | |

---

## Section 5 — Decision (choose exactly one)

| Option | When |
| --- | --- |
| **Densify existing graph** | Transitions weak on designed edges; orphans / shallow links |
| **Publish another supporting batch** | Indexing healthy; demand clusters around existing entities |
| **Admit a new Canonical Entity** | Phase C: ≥2 of search demand · Guide gap · clinical graph gap · strategic priority |

No fourth option. Default when evidence is thin: **Densify** or **wait** by choosing densify with “no structural change — monitor.”

| Month | Choice | Evidence | Action |
| --- | --- | --- | --- |
| July 2026 | Densify / monitor | Batch 2 live; GTM pending | Finish GTM; freeze schema 30d |
| August | | | |
| September | | | |
| October | | | |

**Batch 3:** do **not** brief until August review has Search Console + GA4 + Guide signals. Candidate themes stay parked (executive dysfunction, sleep, etc.) until data picks them.

---

## Related

- `GA4-ENTITY-EXPLORATIONS.md`
- `GTM-GA4-ENTITY-UTILIZATION.md`
- `ENTITY-UTILIZATION.md`
- `KNOWLEDGE-GRAPH-OBSERVABILITY.json`
- `SUPPORTING-CLUSTER-BATCH-1.md`
