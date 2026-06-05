# Provider Scaling Strategy

Generated: 2026-06-05

---

## Goal

Add providers without hand-authoring 200+ line HTML files. One data file → profile pages, index, service cards, schema, and review linkage.

---

## Recommended data model: `data/providers.mjs`

```javascript
export const PROVIDERS = [
  {
    slug: 'dr-sneh-pandey',
    name: 'Dr. Sneh Pandey, MD',
    givenName: 'Sneh',
    familyName: 'Pandey',
    credentials: ['MD', 'ABIM', 'ABOM', 'ADHD-CCSP'],
    role: 'Medical Director',
    photo: '/assets/images/dr-sneh-pandey.png',
    altText: 'Dr. Sneh Pandey, MD, Medical Director at Siya Health',
    statesLicensed: ['California', 'Texas', 'Pennsylvania', 'Florida'],
    licenses: [
      { state: 'California', status: 'active', note: 'Confirm at scheduling' },
      // ...
    ],
    boardCertifications: [
      { board: 'American Board of Internal Medicine', specialty: 'Internal Medicine' },
      { board: 'American Board of Obesity Medicine', specialty: 'Obesity Medicine' },
    ],
    clinicalFocus: ['adhd', 'metabolic', 'weight-loss', 'telehealth'],
    services: [
      { path: '/adhd-care', label: 'ADHD evaluation & care' },
      { path: '/weight-loss-metabolic-health', label: 'Medical weight loss' },
    ],
    languages: ['English'],
    education: [
      { degree: 'MD', institution: '[Verified school]', year: null },
    ],
    residency: [
      { specialty: 'Internal Medicine', institution: '[Verified]', year: null },
    ],
    fellowship: [],
    professionalMemberships: [],
    carePhilosophy: '...',
    shortBio: 'One sentence for cards',
    longBio: '...',
    heroDeck: 'Optional emotional headline (not H1)',
    patientFit: ['High-functioning adults with suspected ADHD', '...'],
    reviewedContent: [], // slugs — must match content-review-registry
    authoredContent: [],
    bookingLink: 'https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY',
    profileLastUpdated: '2026-06-05',
    credentialStatus: 'verified', // verified | pending | annual_recheck_due
    acceptingNewPatients: true,
    schema: {
      medicalSpecialty: ['Internal Medicine', 'Obesity Medicine'],
      knowsAbout: ['Adult ADHD', 'Medical weight loss'],
      sameAs: [],
    },
    featured: true,
    sortOrder: 1,
  },
  // dr-natasha-desai, dr-swati-pandey, future providers...
];
```

### Field usage map

| Field | Profile page | Index card | Service card | Schema | Review block |
|-------|-------------|------------|--------------|--------|--------------|
| slug | URL | link | filter key | @id | reviewerSlug match |
| photo / altText | hero | thumb | thumb | image | — |
| statesLicensed | chips | subtitle | filter badge | areaServed | — |
| clinicalFocus | focus section | tags | filter | knowsAbout | — |
| services | linked chips | — | CTA target | availableService | — |
| reviewedContent | related section | — | — | — | inverse link from articles |
| profileLastUpdated | footer meta | — | — | dateModified | — |

---

## Merge strategy with existing files

| Existing | Action |
|----------|--------|
| `data/entity-graph.json` | Generate `providers[]` from `providers.mjs` at build time OR import mjs into graph generator |
| `provider-index.json` | Auto-generate from mjs |
| `clinical-entity.mjs` `getProviderBySlug()` | Read from mjs instead of JSON |
| Handcrafted `providers/*.html` | Replace with `generate-provider-pages.mjs` |
| `answer-seeds.mjs` `reviewerSlug` | Validate against mjs slug list |

---

## URL architecture

| URL | Purpose |
|-----|---------|
| `/providers` | **New** — provider index (directory) |
| `/providers/{slug}` | Individual profile (existing pattern) |
| `/providers?state=texas` | Optional query filter on index (no new URL required) |

Do not create per-state provider URLs until state hub strategy matures (`/states/texas` planned in entity-graph).

---

## Provider index page (recommended)

**Sections**

1. Hero — “Our licensed telehealth physicians”
2. Filter chips — State, Focus (ADHD, Metabolic, Psychiatry)
3. Provider card grid — photo, name, role, states, 1-line `shortBio`, CTA
4. Trust strip — HIPAA, licensure disclaimer
5. CTA — Meet & Greet

**Component:** `.provider-index-grid`, `.provider-card` (new)

---

## Service page integration

| Service | Providers to surface |
|---------|---------------------|
| `/adhd-care` | All 3 (filter by visitor state if geo known) |
| `/weight-loss-metabolic-health` | Sneh (+ future obesity clinicians) |
| `/mens-health-longevity` | Sneh (+ future) |
| `/telehealth` | All 3 with state chips |
| `/primary-urgent-care` | TBD when primary clinicians added |

**Pattern:** 2–3 `.provider-card--compact` above fold or in “Who you'll see” section.

---

## Article / Health Guide linkage

```
content-review-registry.mjs  →  reviewerSlug
providers.mjs                →  slug
generate-*-pages.mjs       →  clinicalReviewBlock() links to /providers/{slug}
providers.mjs.reviewedContent →  inverse list on profile
```

**Rule:** Bidirectional only when clinically signed off.

---

## Adding provider #4+ checklist

1. Add row to `providers.mjs`
2. Add headshot to `assets/images/dr-{slug}.png`
3. Run `generate-provider-pages.mjs`
4. Add to `entity-graph` employee array (automated)
5. Update service page cards if `clinicalFocus` matches
6. Assign `reviewerSlug` topics in registry policy doc
7. Sitemap + `provider-index.json` regenerate via build
8. QA per `PROVIDER-PAGE-QA-CHECKLIST.md`

---

## Roles beyond physicians (future)

| Role | Profile? | Schema type |
|------|----------|-------------|
| MD / DO physicians | Yes | `Physician` |
| NP / PA | Yes | `Physician` or `Person` + `jobTitle` |
| RN care coordinators | Optional team page only | `Person` |
| Therapists (if added) | Separate template | `Person` / `MedicalBusiness` affiliate — **not Physician**

Do not use `Physician` schema for non-physician clinicians.
