# Provider Schema Strategy

Generated: 2026-06-05  
Baseline: `data/entity-graph.json`, `scripts/clinical-entity.mjs`, inline JSON-LD on 3 provider pages

---

## Current state audit

| Page | Schema types present | Gaps |
|------|---------------------|------|
| `/providers/dr-sneh-pandey` | `BreadcrumbList`, `Physician`, `MedicalOrganization`, `WebPage` | No `Person`, `alumniOf`, `hasCredential`, `sameAs`, `availableService` |
| `/providers/dr-natasha-desai` | Same pattern | Same gaps |
| `/providers/dr-swati-pandey` | Same pattern | Same gaps |
| All other pages | Org-level or content types only | No `reviewedBy` Physician on articles (pending review) |
| `entity-graph.json` | `KnowledgeGraph` with 3 providers + org | Not emitted as sitewide JSON-LD today |

**OG image:** logo URL on all provider pages — should be provider `image` URL for rich sharing.

---

## Recommended graph per provider page

Use `@graph` with stable `@id` anchors (already established):

```
https://siya.health/providers/{slug}#physician
https://siya.health/#organization
https://siya.health/providers/{slug}#webpage
```

### 1. Physician (primary)

```json
{
  "@type": "Physician",
  "@id": "https://siya.health/providers/dr-sneh-pandey#physician",
  "name": "Sneh Pandey",
  "honorificPrefix": "Dr.",
  "honorificSuffix": "MD",
  "jobTitle": "Medical Director",
  "url": "https://siya.health/providers/dr-sneh-pandey",
  "image": "https://siya.health/assets/images/dr-sneh-pandey.png",
  "medicalSpecialty": ["Internal Medicine", "Obesity Medicine"],
  "knowsAbout": ["Adult ADHD", "Medical weight loss", "Insulin resistance"],
  "areaServed": [{ "@type": "State", "name": "California" }],
  "worksFor": { "@id": "https://siya.health/#organization" },
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Board Certification",
      "name": "American Board of Internal Medicine"
    }
  ],
  "alumniOf": [
    { "@type": "CollegeOrUniversity", "name": "[Medical school — when verified]" }
  ],
  "sameAs": [],
  "availableService": [
    { "@type": "MedicalProcedure", "name": "Adult ADHD evaluation", "url": "https://siya.health/adhd-care" }
  ]
}
```

**Rules**

- `medicalSpecialty`: max 3–4 Schema.org-aligned terms; do not list every marketing focus area.
- `knowsAbout`: patient-facing topics the provider actually discusses (align with `clinicalFocus` in data model).
- `hasCredential`: only board certs and named programs with evidence.
- `sameAs`: NPI profile, Doximity, LinkedIn, state medical board — **only if maintained**.
- Do **not** add `AggregateRating` unless tied to a verified third-party source with `reviewRating` attribution.

### 2. Person (optional linked entity)

For non-medical rich results, mirror Physician as `Person` with `@id` `...#person` and `mainEntityOfPage` link — **or** use dual typing `"@type": ["Physician", "Person"]` if validator accepts.

Prefer single `Physician` type unless Google Search Console shows Person enrichment opportunity.

### 3. MedicalOrganization link

Already correct:

```json
{
  "@type": "MedicalOrganization",
  "@id": "https://siya.health/#organization",
  "name": "Siya Health",
  "employee": { "@id": "https://siya.health/providers/dr-sneh-pandey#physician" }
}
```

Emit org graph once per provider page (duplicate acceptable) or reference-only if sitewide org schema added to homepage.

### 4. WebPage / ProfilePage

```json
{
  "@type": ["WebPage", "ProfilePage"],
  "@id": "https://siya.health/providers/dr-sneh-pandey#webpage",
  "name": "Dr. Sneh Pandey, MD | Adult ADHD & Metabolic Care",
  "description": "[meta description]",
  "url": "https://siya.health/providers/dr-sneh-pandey",
  "dateModified": "2026-06-05",
  "about": { "@id": "...#physician" },
  "isPartOf": { "@id": "https://siya.health/#organization" }
}
```

### 5. Article / MedicalWebPage `reviewedBy` (content pages)

When `content-review-registry.mjs` entry exists:

```json
"reviewedBy": {
  "@type": "Physician",
  "@id": "https://siya.health/providers/dr-sneh-pandey#physician",
  "name": "Sneh Pandey",
  "url": "https://siya.health/providers/dr-sneh-pandey"
}
```

**Do not** emit `reviewedBy` on pending content.

### 6. BreadcrumbList

Keep: `Home › Our providers › Dr. [Name]` (update middle crumb when `/providers` index exists).

---

## Per-provider schema profile (conservative)

| Provider | medicalSpecialty | knowsAbout (max 6) | areaServed | availableService |
|----------|------------------|-------------------|------------|------------------|
| Sneh | Internal Medicine, Obesity Medicine | Adult ADHD, Medical weight loss, GLP-1 therapy, Metabolic health, Telehealth ADHD | CA, TX, PA, FL | `/adhd-care`, `/weight-loss-metabolic-health`, `/telehealth` |
| Natasha | Family Medicine, Behavioral Medicine | Adult ADHD, Anxiety, Emotional dysregulation, Behavioral health | TX, FL | `/adhd-care`, `/telehealth` |
| Swati | Psychiatry | Adult ADHD, Depression, Anxiety, ADHD medication monitoring | PA | `/adhd-care` |

**Do not claim:** ABPN board in schema unless verified and displayed on page.

---

## Implementation approach

1. Extend `buildPhysicianGraph()` in `clinical-entity.mjs` with optional `alumniOf`, `hasCredential`, `availableService`, `dateModified`.
2. Drive all fields from future `data/providers.mjs` (single source).
3. Generate provider pages via script (like `generate-answer-pages.mjs`) — eliminates hand-edited JSON-LD drift.
4. Validate with Google Rich Results Test after template migration.

---

## Anti-patterns (do not implement)

- Listing all 50 blog topics in `knowsAbout`
- `medicalSpecialty: "ADHD"` as sole specialty for non-psychiatrists without context
- Fake `AggregateRating` on provider pages
- `worksFor` pointing to non-Siya organizations
- Physician schema on homepage for all three doctors (use org `employee` array only)
