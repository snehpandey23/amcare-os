# Siya Knowledge Platform v1

```text
Status:            FROZEN
Tag:               platform-v1
Date:              2026-07-27
Scope:             Entire public knowledge platform — not a single doc
```

This freezes the **platform**, not just Governance or the Blueprint.

Architectural changes after this tag require a demonstrated problem
(user drop-off, failed routing, governance incident, or Search Console /
Guide evidence). Preference for “slightly better foundations” is not a reason.

---

## What Platform v1 includes

| Layer | Artifact |
| --- | --- |
| Knowledge Graph | `data/entity-graph.json` + canonical HTML relationships |
| Entity Registry | `apps/siya-assistant/data/knowledge-entities.json` |
| Content Assembly | `CONTENT-ASSEMBLY-SYSTEM.md` + validators |
| Canonical Entity Blueprint | `CANONICAL-ENTITY-PAGE-BLUEPRINT.md` (v1.2) |
| Public Knowledge API | `resolveAnswer` + intent / care_pathway / CTAs |
| Guide v1 | Siya Guide on `siya-guide.vercel.app` |
| Canonical Taxonomy | `CANONICAL-ENTITY-TAXONOMY-v1.md` |
| Root Service | `/primary-care` (`entity_family: root_service`) |
| Validation Gates | `npm run governance` + assembly / blocks / hygiene |

Website and Guide are **interfaces** on this stack — not the product itself.

---

## Phase map (renamed)

### Phase A — Foundation ✅

Governance · Content Assembly · Blueprint · Public Knowledge API · Guide · Root taxonomy

### Phase B — Core Graph ✅

Root Service · Preventive Care · ADHD · Fatigue · Brain Fog · Labs

### Phase C — Coverage (not expansion)

Before building another entity, ask:

> Does this make the graph **denser**, or merely **larger**?

Let Search Console, Guide logs, and journey drop-off decide the next node —
not a pre-written “next page” list.

### Phase D — Consolidation

Blog consolidation · Search Console cleanup · Internal linking optimization

---

## Knowledge Coverage Score

Measured by entity completeness, relationship completeness, graph density,
service coverage, and symptom↔lab coverage. Rubric is **frozen** in
`KNOWLEDGE-COVERAGE-SCORE.md` — do not redefine monthly or comparability dies.

Observability: `npm run graph:observe` → `docs/KNOWLEDGE-GRAPH-OBSERVABILITY.json`

**Hard rule:** Root Service reachability must be **100%**. The observe script
exits non-zero if any Canonical Entity is unreachable from `/primary-care`.

Dashboard: Cursor canvas `knowledge-graph-dashboard.canvas.tsx`.

---

## Phase C — new Canonical Entity admission

A new Canonical Entity requires **at least two** of:

- [ ] Demonstrated search demand
- [ ] Repeated Guide resolution gap
- [ ] Clinical graph coverage gap
- [ ] Strategic business priority

“This would be interesting” is not enough.

Prefer Graph Densification (relationships only) before Coverage expansion
(new entities).

After densification, **do not rush Phase C**. Run production for a few weeks,
collect Search Console / Guide resolution / CTA / navigation evidence, then
apply the admission checklist.

---

## Entity Utilization (track next)

Bridges architecture and business. For each Canonical Entity, score Search,
Guide usage, and Conversion (High / Medium / Low) and assign a status
(Healthy · Growing · Needs discovery · Underserved).

Ask: *Which high-demand entity is underserved?* — not *Which page should we
build next?*

Instrumentation sources: Search Console, Guide entity-resolution logs, CTA
performance by entity, navigation paths between entities. Formal sheet TBD;
do not invent scores without data.

---

## Change control

1. Do not add entity classes outside Taxonomy v1.
2. Do not change Public Knowledge API field meanings without a version bump.
3. Do not replace Content Assembly with a parallel system.
4. New Canonical Entity Pages must clone the Blueprint, register in the API, and pass governance.
5. Prefer graph density (inbound, related labs/symptoms/services) over page count.

---

## Related frozen docs

- `SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md`
- `CANONICAL-ENTITY-TAXONOMY-v1.md`
- `CANONICAL-ENTITY-PAGE-BLUEPRINT.md`
- `SIYA-KNOWLEDGE-PLATFORM.md`
- `docs/BOT-NAMING-FREEZE.md` (Guide vs Assist)
