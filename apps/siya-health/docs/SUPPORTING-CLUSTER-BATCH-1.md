# Supporting Cluster Batch 1

```text
Date:       2026-07-27
Entities:   /brain-fog · /fatigue
Rule:       Supporting → Canonical Entity → Related → Primary Care
CTA:        Primary care / Meet & Greet (not ADHD screening by default)
```

## Published (8)

### Brain Fog

| Slug | Related entity |
| --- | --- |
| `/blog/brain-fog-vs-adhd` | Adult ADHD California |
| `/blog/brain-fog-and-sleep` | Fatigue |
| `/blog/brain-fog-and-anxiety` | Fatigue |
| `/blog/brain-fog-after-covid` | Fatigue |

### Fatigue

| Slug | Related entity |
| --- | --- |
| `/blog/fatigue-despite-normal-labs` | Preventive care |
| `/blog/iron-deficiency-and-fatigue` | Ferritin |
| `/blog/thyroid-and-fatigue` | Thyroid |
| `/blog/chronic-fatigue-vs-everyday-tiredness` | Primary care |

## Deferred to Batch 2

- Brain fog and menopause (existing: `/blog/perimenopause-brain-fog`)
- Brain fog at work
- Morning fatigue
- Fatigue after illness

## Verify after deploy

1. Indexing in Search Console (submit URLs or wait for crawl)
2. Internal links from `/brain-fog` and `/fatigue` related sections
3. Schema + canonicals unique
4. Entity Utilization events on hubs (`?debug_tracking=1`)

```bash
npm run cluster:batch1
node scripts/generate-brain-fog-entity-page.mjs
node scripts/generate-fatigue-entity-page.mjs
node scripts/apply-entity-utilization.mjs
```
