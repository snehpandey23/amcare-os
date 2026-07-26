# Fatigue Pillar F1 — First article under Governance v1.0

```text
Status:            Brief (ready to generate)
Date:              2026-07-26
Governance:        Siya Knowledge Governance Framework v1.0
Blueprint:         docs/CORNERSTONE-REFERENCE-BLUEPRINT.md
Mark internally:   First article produced under Knowledge Governance Framework v1.0
```

## Mission

Build the **Fatigue knowledge hub** the same way `/adult-adhd-california` was built: as a canonical entity, not a sales LP, not a city page, not a blog clone.

Proposed canonical path (confirm before generate):

| Option | Path | Notes |
| --- | --- | --- |
| **A (preferred)** | `/fatigue` or `/why-am-i-always-tired` | New root cornerstone |
| B | Upgrade `/blog/why-am-i-always-tired-causes-when-to-see-doctor` | Existing blog — risk of competing with answers FAQ |

**Do not start until path is confirmed.** Prefer a root cornerstone like California ADHD.

## Ownership table (proposed)

| Page | Ownership |
| --- | --- |
| `/fatigue` (proposed) | Fatigue educational cornerstone |
| `/answers/why-am-i-tired-even-after-sleeping` | Narrow FAQ |
| `/labs/fatigue-brain-fog` | Labs topic |
| `/telehealth` / `/primary-urgent-care` | Care process / next step |
| `/adhd-care` | Only when ADHD is a differential branch — not default CTA |

## Information architecture (earn every section)

```
Why am I always tired?

│
├ Recognition (what persistent fatigue feels like)
├ What fatigue is — and is not
├ Common contributors (sleep, iron, thyroid, mood, ADHD overlap, metabolic)
├ When to seek care / red flags
├ What a thoughtful evaluation looks like
├ Labs that may help (and what they cannot tell you)
├ Sleep apnea & metabolic risk (bridge, not dump)
├ Brain fog overlap
├ Frequently asked questions
├ Related Health Guides
└ Next step (one primary CTA — Meet & Greet or Primary Care, not ADHD screening by default)
```

**Excluded:** city directories, GLP-1 emergency nodes, ADHD childhood-onset prep, multi-primary CTAs.

## Entity registration (before generate)

```text
Entity:          adult_fatigue
Canonical:       /fatigue   (or confirmed path)
Aliases:         why am I always tired, chronic fatigue adults, brain fog tired,
                 tired after sleeping, fatigue evaluation
Related:         labs/fatigue-brain-fog, sleep apnea guide, iron/ferritin,
                 thyroid labs, primary care, ADHD (differential only)
Primary CTA:     Book Free Meet & Greet  (or Explore Primary Care)
Secondary:       Fatigue & brain fog labs · Related guides
```

Wire: `entity-graph.json` · `knowledge-entities.json` · `link-registry.ts` · Public Knowledge API.

## Success metrics (copy from blueprint)

- One primary CTA in `<main>`
- ≤8 links per section
- Unique closings / no template bleed
- Schema: `MedicalWebPage` + `FAQPage` + `BreadcrumbList`
- `npm run governance` PASS before deploy
- No competing fatigue cornerstone

## Generator

`scripts/generate-fatigue-cornerstone.mjs` — clone structure from
`scripts/generate-california-adhd-cornerstone.mjs`; swap content + CTAs + entity ids.
Wire **before** `seo-build.mjs`.

## CTA policy

Fatigue is **not** an ADHD funnel page by default.

| Slot | Destination |
| --- | --- |
| Primary | Meet & Greet or Primary/Urgent Care |
| Secondary | `/labs/fatigue-brain-fog` text link |
| ADHD branch | Only inside a differential section, text link to `/adhd-care` or screening |

## First ship, then pause

After F1 ships green: freeze scores against the blueprint. Do not immediately start another hub.
