# Operating snapshot (monthly)

```text
Purpose:   Comparable month-over-month story for platform + acquisition
Owner:     Platform / Growth
Cadence:   First business day of each month (or last Friday)
Baseline:  July 2026 — densification + CA standards + Batch 1 + instrumentation
```

Fill blanks from Search Console, GA4, and `npm run graph:observe`.
Do **not** change Coverage Score rubric to make the table look better.

---

## KPI table

| Metric | July 2026 | August | September | October |
| --- | ---: | ---: | ---: | ---: |
| Organic clicks (Search Console, 28d) | — | | | |
| Indexed supporting articles (Batch 1 = 8 target) | — | | | |
| Entity views (`entity_view`) | — | | | |
| Entity related clicks | — | | | |
| Entity conversions (`entity_conversion`) | — | | | |
| Assisted conversions (path length ≥ 2) | — | | | |
| Graph density | **0.603** | | | |
| Root reachability | **13/13** | | | |
| Coverage score | **100** | | | |
| Avg inbound (canonical) | **~5.8** | | | |

---

## Entity Utilization leaders (fill after GTM live)

| Rank | Top entity by views | Top assisted path | Notes |
| ---: | --- | --- | --- |
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Search Console indexing (Batch 1)

| URL | Indexed? | Canonical OK? | Notes |
| --- | --- | --- | --- |
| `/blog/brain-fog-vs-adhd` | | | |
| `/blog/brain-fog-and-sleep` | | | |
| `/blog/brain-fog-and-anxiety` | | | |
| `/blog/brain-fog-after-covid` | | | |
| `/blog/fatigue-despite-normal-labs` | | | |
| `/blog/iron-deficiency-and-fatigue` | | | |
| `/blog/thyroid-and-fatigue` | | | |
| `/blog/chronic-fatigue-vs-everyday-tiredness` | | | |

---

## Platform health (from observe)

```bash
cd apps/siya-health && npm run graph:observe
```

Paste the one-liner:

```text
Reachability _/_ · density _ · coverage _ · connectivity _
```

---

## Decision log (this month)

| Decision | Evidence | Action |
| --- | --- | --- |
| Batch 2 go / no-go | Indexing + utilization | |
| New Canonical Entity? | Phase C checklist (≥2 of 4) | Default: no |
| Ads landing focus | Entity conversion by traffic_source=paid | |

---

## Related

- `GTM-GA4-ENTITY-UTILIZATION.md`
- `ENTITY-UTILIZATION.md`
- `KNOWLEDGE-GRAPH-OBSERVABILITY.json`
- `SUPPORTING-CLUSTER-BATCH-1.md`
