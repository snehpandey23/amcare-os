# Website Cohesion Audit v1.0 — Information Architecture

## Verdict

Health Guides and Labs are predictable. Commercial services, women’s health, and geographic ADHD content are not. Users cannot reliably infer whether a location page lives at the root or under `/blog`.

## P0

### IA-001 — Three competing ADHD geography systems

- 16 city treatment articles under `/blog/adhd-treatment-*`.
- 6 root diagnosis landers under `/adhd-diagnosis-*`.
- 9 additional California/Texas diagnosis, medication, screening, and telehealth variants.
- Texas intent alone is split across roughly 10 URLs.

Recommended architecture:

1. One state-level canonical page per served state.
2. City intent folded into the state page unless a city page has defensible unique demand and local value.
3. Educational diagnosis articles remain in `/blog`; transactional geography pages do not.
4. The California cornerstone becomes `/adult-adhd-california`.

## P1

### IA-002 — Important services absent from primary navigation

Not clearly represented in primary navigation:

- Women’s Health
- Primary & Urgent Care
- Prescriptions
- Pricing
- ADHD Screening

The footer partially compensates, but the service taxonomy is not visible early enough.

### IA-003 — Women’s health hierarchy is unclear

- `/womens-health` has strong inbound visibility but limited depth.
- `/womens-midlife-health` is deeper but weakly linked.
- `/labs/womens-midlife` creates a third adjacent destination.

Disposition: make Women’s Health the hub, make Midlife Health a clearly subordinate program/pillar, and link Labs as a supporting resource.

### IA-004 — Thin category hubs

`/blog/adhd`, `/blog/weight-loss`, and `/blog/telehealth` function as tag/category stubs rather than editorial hubs. Enrich them as curated landing pages or replace them with filtered views from one Blog hub.

### IA-005 — Tools have no predictable home

Screening, Creyos, intake, and appointment flows are discoverable through CTAs but not through a clear “Health Tools” information scent.

## P2

- Remove noindex `/intake` from the sitemap.
- Remove `/docs/tint-options-preview` from the sitemap because `/docs/*` redirects.
- Retire redirect-shell HTML artifacts after confirming platform redirects.
- Give `/prescriptions` a clear parent and one related-services path.

## Proposed navigation model

- Care
  - Primary & Urgent Care
  - ADHD Care
  - Women’s Health
  - Weight & Metabolic Health
  - Men’s Health
- Labs
- Health Guides
- Tools
- Pricing
- Care Team
- About

Geographic availability should live within relevant service pages and state hubs, not as a global content category.

## Acceptance threshold

- Every public page has one clear parent.
- One predictable URL class owns each intent.
- No service depends on footer-only discovery.
- Users can identify where Guides, Tools, Labs, Services, and booking live from the primary navigation.
