# California ADHD Standards

```text
Status:            Active operating checklist
Hub:               /adult-adhd-california
Tag companion:     platform-v1.1-densification
```

California is the **first-priority geographic market**. Do not reopen metro
city treatment clones. Statewide hubs + supporting blogs strengthen the
flagship entity.

## Live inventory (11)

| Role | Path |
| --- | --- |
| Cornerstone | `/adult-adhd-california` |
| Screening LP | `/adult-adhd-screening-california` |
| Answers | `/answers/telehealth-adhd-california` |
| Statewide blogs (8) | diagnosis · telehealth · how-to-choose · med options · med online · eval online vs in-person · testing vs evaluation · symptoms |

Retired city/geo stubs stay retired (301 → cornerstone).

## Page standards (every live CA page)

1. **Reach the cornerstone** — body or capped next-step links to `/adult-adhd-california`.
2. **Reach care** — `/adhd-care` and/or California screening when conversion-appropriate.
3. **Root service** — mention `/primary-care` when broader health framing applies (prefer over only `/primary-urgent-care` in clinical prose).
4. **Unique title/meta** — no intent twins without Search Console evidence to consolidate.
5. **CTA honesty** — label matches destination (no “Meet & Greet” → `/adhd-care`).
6. **Assembly caps** — statewide next-step ≤3 contextual links + CTA.

## Owners

| Artifact | Script |
| --- | --- |
| Cornerstone | `scripts/generate-california-adhd-cornerstone.mjs` |
| Statewide next-step + screening nav | `scripts/apply-california-city-linking.mjs` |
| CA blog publish | `scripts/publish-california-adhd-blog.mjs` |

## Parallel operating model (60–90 days)

Three workstreams stay independent; California remains the SEO/ads beachhead.

| Workstream | Goal | Cadence |
| --- | --- | --- |
| Knowledge Platform | Graph quality; evidence-backed entities only | Slow |
| SEO & Content | Authority around **existing** entities (clusters, not new hubs) | Continuous |
| Performance Marketing | CAC, CVR, QS, cost per booking | Daily/weekly |

**Content rule (unchanged):** every new piece strengthens an existing entity
**or** passes Phase C admission (≥2 of: search demand · Guide gap · clinical
graph gap · strategic priority).

State expansion (TX / FL / PA) waits until California cluster utilization is
healthy — same architecture, no urgency.

## Verification

```bash
node scripts/generate-california-adhd-cornerstone.mjs
node scripts/apply-california-city-linking.mjs
npm run governance
# Spot-check: screening + answers + how-to-choose → cornerstone
```
