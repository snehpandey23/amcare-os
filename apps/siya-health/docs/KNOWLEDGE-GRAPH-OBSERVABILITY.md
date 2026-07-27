# Knowledge Graph Observability

Generated: 2026-07-27T02:54:33.448Z  
Platform: **v1** (frozen) · Sprint: **graph-densification-1**

## Inventory (two numbers — do not conflate)

| Scope | Count |
| --- | ---: |
| **Canonical entities** (Taxonomy v1) | **13** |
| **Registry entities** (PK API) | **19** |

Canonical breakdown: Root 1 · Service 1 · Condition 1 · Symptom 2 · Laboratory 8

Canonical = Taxonomy v1 pages. Registry = all Public Knowledge API entities (includes care-process / implementation surfaces). Do not expect these totals to match.

## Reachability (from Root Service)

| Metric | Value |
| --- | --- |
| Reachable from `/primary-care` | **13 / 13** (100%) |
| Pass (100% required) | **PASS** |
| Unreachable | none |

## Navigation depth

Avg clicks from root: **1.31** · Max: **2**  
Smell threshold: ≥ 4 clicks

| Entity | Clicks from Root |
| --- | ---: |
| `/primary-care` | 0 |
| `/adult-adhd-california` | 1 |
| `/brain-fog` | 1 |
| `/fatigue` | 1 |
| `/labs/cbc` | 1 |
| `/labs/thyroid` | 1 |
| `/labs/vitamin-b12` | 1 |
| `/preventive-care` | 1 |
| `/labs/a1c-blood-sugar` | 2 |
| `/labs/cmp` | 2 |
| `/labs/iron-ferritin` | 2 |
| `/labs/lipid-panel` | 2 |
| `/labs/vitamin-d` | 2 |

## Relationship health

| Metric | Value |
| --- | --- |
| Avg inbound | 5.77 |
| Avg outbound | 5.77 |
| Graph density | 0.603 |
| Connectivity score | 100 |
| Orphans | none |
| Dead-ends | none |

## Knowledge Coverage Score (rubric frozen)

**100 / 100** — see `KNOWLEDGE-COVERAGE-SCORE.md` (do not redefine monthly).

## Governance health

Assembly PASS: true · Fingerprint avg/min: 9.99 / 9
