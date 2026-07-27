# GA4 Explorations — Entity Utilization (frozen v1)

```text
Status:     Spec locked with event schema (do not rename for 30 days)
Property:   G-9WTQWHCTFT
Depends on: GTM publish + custom dimensions (see GTM-GA4-ENTITY-UTILIZATION.md)
Cadence:    Build once → review monthly in platform review
```

These three Explorations are the **standard reports**. Do not invent alternate event names or dimensions for the first month.

---

## Prerequisites

1. GTM container `GTM-PLBD4TTQ` published with Entity Utilization tags.
2. Custom dimensions live for: `entity`, `entity_family`, `care_pathway`, `traffic_source`, `related_entity`, `assist_path`, `assisted_entities`.
3. `entity_conversion` marked as a **Key Event** in GA4.
4. At least a few days of DebugView-verified traffic (can build empty shells earlier).

---

## Report 1 — Entity Funnel

**Question:** Are people using the graph the way we designed it?

### Setup (Exploration → Funnel exploration)

| Step | Event |
| ---: | --- |
| 1 | `entity_view` |
| 2 | `entity_related_click` |
| 3 | `entity_primary_cta_click` |
| 4 | `entity_conversion` |

**Breakdown dimensions (add as tabs or segments):**

* Entity (`entity`)
* Entity family (`entity_family`)
* Traffic source (`traffic_source`)

**Filters (optional tabs):**

* `traffic_source` = `organic`
* `traffic_source` = `paid`
* `entity_family` = `symptom`

**What “healthy” looks like**

* Related-click rate after view is non-trivial on symptom entities (Brain Fog, Fatigue).
* Primary CTA rate is higher on service / geo hubs than on lab markers.
* Paid and organic funnels differ — do not force them into one conclusion.

**What to ignore early**

* Absolute conversion counts in week 1–2.
* Step-to-step % until sample size is meaningful.

---

## Report 2 — Entity Transition Matrix

**Question:** Which designed relationships are actually traversed?

### Setup (Exploration → Free form)

| Role | Field |
| --- | --- |
| Rows | Entity (`entity`) — origin |
| Columns | Related entity (`related_entity`) — destination |
| Values | Event count |
| Filters | Event name = `entity_related_click` |

Sort by count descending. Export top 20 monthly into the operating snapshot.

**Example shape (illustrative):**

| From Entity | To Entity | Count |
| --- | --- | ---: |
| brain_fog | primary_care | — |
| brain_fog | adult_adhd_california | — |
| fatigue | lab_ferritin | — |
| fatigue | primary_care | — |
| preventive_care | lab_cbc | — |

**How to use**

* High volume + designed edge → healthy densification.
* High volume + *undesigned* edge → consider a relationship or supporting article.
* Designed edge + near-zero volume → linking or placement problem, not a new entity.

This is the **graph utilization** report. The architecture graph and the user graph will diverge; this report shows the difference.

---

## Report 3 — Assisted Conversion Report

**Question:** Which entities introduce trust before booking?

Last-touch alone is almost meaningless for educational healthcare journeys.

### Setup (Exploration → Free form)

| Role | Field |
| --- | --- |
| Rows | Assist path (`assist_path`) |
| Secondary rows | Assisted entities (`assisted_entities`) |
| Values | Event count |
| Filters | Event name = `entity_conversion` |

**Also build a second tab:**

| Role | Field |
| --- | --- |
| Rows | Entity (`entity`) — last-touch |
| Values | Event count of `entity_conversion` |
| Comparison | Same rows filtered where `assisted_entities` length > 0 (path had prior entities)

**Path length heuristic**

* `assist_path` with **one** segment → single-page conversion.
* `assist_path` with **two or more** segments → assisted journey (credit all prior entities).

Example path string:

```text
brain_fog,preventive_care,primary_care
```

**Interpretation**

* Entities that appear often in `assisted_entities` but rarely as last-touch are **introducers**.
* Last-touch-only pages without assists may be deep links or ads landers — fine, but do not conclude the rest of the graph is useless.

---

## Monthly review usage

In the monthly platform review, spend ~15 minutes on:

1. Funnel step rates by `entity_family` and `traffic_source`
2. Top 10 transitions (Report 2)
3. Top 5 assist paths (Report 3)

Then choose **one** decision (see `OPERATING-SNAPSHOT-MONTHLY.md`):

* Densify existing graph
* Publish another supporting batch
* Admit a new Canonical Entity (Phase C ≥2 of 4)

No fourth option.

---

## Freeze rule

Do **not** rename events or parameters for at least 30 days after GTM publish unless DebugView proves a bug.

Related:

* `GTM-GA4-ENTITY-UTILIZATION.md`
* `ENTITY-UTILIZATION.md`
* `data/entity-utilization-ga4-map.json`
* `OPERATING-SNAPSHOT-MONTHLY.md`
