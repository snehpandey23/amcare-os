# Cornerstone Reference Blueprint

```text
Version:           1.0
Status:            Production (FROZEN reference)
Date:              2026-07-26
Reference page:    /adult-adhd-california
Git commit:        (filled after freeze commit)
Governance:        Siya Knowledge Governance Framework v1.0
Freeze note:       Transitions diagnostic (~7.8) is not a redesign trigger.
```

This is the **first page built because of the governance framework**, not merely under it.
Every future knowledge hub should copy this architecture rather than reinvent it.

---

## Ownership table

| Page | Ownership |
| --- | --- |
| `/adult-adhd-california` | California ADHD educational and commercial cornerstone |
| `/adhd-care` | General ADHD service and care-process page |
| `/adhd-screening` | Screening action |
| Narrow guides | Specific informational intent |

Do **not** create a competing California ADHD cornerstone.

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

---

## 2. Schema composition

Emit in `<head>` as three JSON-LD scripts:

| Type | Role |
| --- | --- |
| `MedicalWebPage` | Canonical page identity; `about` MedicalCondition; `audience` California; `reviewedBy`; `provider` |
| `BreadcrumbList` | Home → ADHD Care → Adult ADHD in California |
| `FAQPage` | Same Q/A set as the visible accordion |

Do not invent additional schema types unless a future hub has a distinct clinical need.

---

## 3. Entity registration

| Layer | Where | What |
| --- | --- | --- |
| Machine graph | `data/entity-graph.json` → `stateHubs[California]` | `cornerstoneUrl`, `entity`, `aliases`, `relatedEntities`, `currentUrls` |
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

No LLM reasoning required to choose the link.

---

## 4. CTA policy

| Rule | Implementation |
| --- | --- |
| Exactly **one** `ds-button--primary` in `<main>` | Hero: Free ADHD Screening |
| Secondary actions | `ds-button--secondary` or text links only |
| Nav CTA | Screening (`ADHD_SCREENING_NAV_PAGES` includes this path) |
| Conversion intent | `adult-adhd-california.html` → ADHD funnel / screening |
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

Never: `old URL → /adhd-care → cornerstone`.

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

## How to clone this for the next hub

1. Register the entity in `entity-graph.json` + knowledge-entities + link-registry.
2. Copy the generator pattern (sections that answer real questions; one primary CTA).
3. Wire generator before `seo-build.mjs`.
4. Point inbound cluster links at the new canonical; redirect clones with unique-value rule.
5. Ship schema trio appropriate to the entity.
6. Pass `npm run governance` before deploy.
7. Freeze scores; do not immediately start another cornerstone.

First follow-on under this blueprint: **Fatigue pillar** (Governance v1.0 first article).
