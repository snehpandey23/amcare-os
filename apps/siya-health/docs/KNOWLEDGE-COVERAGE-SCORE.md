# Knowledge Coverage Score

```text
Status:            Internal KPI (FROZEN rubric)
Owner:             Platform / Clinical editorial
Companion:         Knowledge Integrity Score (Governance)
Freeze:            Platform v1 — do not change component weights or thresholds
                   without an Architecture Review. Moving the graph is fine;
                   redefining success is not.
```

Integrity asks: *is the graph safe and well-assembled?*  
Coverage asks: *is the graph complete enough to deserve the next build?*

Also track (separate from this score, same observe run):

| Metric | Rule |
| --- | --- |
| **Root reachability** | 100% of Canonical Entities reachable from `/primary-care` |
| **Navigation depth** | Flag entities at ≥4 clicks from root as architectural smell |

---

## Formula (v1)

Score **0–100**, five equal weight components (20 pts each):

| Component | 20 pts when… |
| --- | --- |
| **Entity completeness** | Root ≥1, Service ≥1, Condition ≥1, Symptom ≥2, Laboratory ≥8 |
| **Relationship completeness** | ≥90% of entities have ≥1 parent **or** ≥1 related_entity |
| **Graph density** | Among canonical entity pages, undirected density ≥ 0.25 |
| **Service coverage** | Root Service page links Preventive + ≥3 specialty/process lanes |
| **Symptom ↔ Lab coverage** | Every Symptom entity links ≥3 Laboratory marker pages |

Partial credit is linear within each component.

---

## How to use it

1. Run `npm run graph:observe` in `apps/siya-health`.
2. Read `coverageScore` in `docs/KNOWLEDGE-GRAPH-OBSERVABILITY.json`.
3. If score is high and stable, **do not** invent entities for score theater.
4. If a component is weak, prefer densifying relationships over new pages —
   unless Search Console / Guide evidence names a missing node.

Women's Midlife, Sleep, etc. enter the backlog only when coverage gaps **and**
demand align — not because they were “next on the list.”

---

## What it is not

- Not a public marketing metric
- Not a substitute for Integrity / governance PASS
- Not a license to add twenty thin pages to raise density artificially
