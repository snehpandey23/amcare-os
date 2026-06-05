# Provider Phase 2 + 3 — Generator Report

Generated: 2026-06-05  
Scope: `apps/siya-health/` — data-driven provider system (3 providers only).

## Summary

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** |
| Sitemap URLs | **155** (+1 `/providers` index) |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| `California, California` | **0** |
| `adhd.siya.health` | **0** |
| Provider H1s (1 each on profile pages) | **PASS** |
| `/providers` in sitemap | **PASS** |
| Provider images + alt text | **PASS** |
| State chips match `providers.mjs` | **PASS** |
| `reviewedBy` on articles | **Not added** (per scope) |

---

## Files created

| File | Purpose |
|------|---------|
| `data/providers.mjs` | Canonical provider data model (3 providers) |
| `scripts/generate-provider-pages.mjs` | Shared template → profile HTML + index |
| `scripts/generate-provider-audit-docs.mjs` | Missing-info, completeness, CSV, intake form |
| `providers/index.html` | `/providers` hub (generated) |
| `docs/PROVIDER-MISSING-INFO-AUDIT.md` | Field-level gaps per provider |
| `docs/PROVIDER-BIO-COMPLETENESS-AUDIT.md` | Completeness matrix + minimum #4 requirements |
| `docs/PROVIDER-BIO-REQUEST-SHEET.csv` | Admin intake tracking sheet |
| `docs/PROVIDER-INTAKE-FORM.md` | 10–15 min physician form |

## Files replaced (generated each build)

| File | Source |
|------|--------|
| `providers/dr-sneh-pandey.html` | `generate-provider-pages.mjs` |
| `providers/dr-natasha-desai.html` | `generate-provider-pages.mjs` |
| `providers/dr-swati-pandey.html` | `generate-provider-pages.mjs` |

## Files updated

| File | Change |
|------|--------|
| `package.json` | Build pipeline runs provider generator + audit docs |
| `vercel.json` | `buildCommand` includes provider generator |
| `scripts/clinical-entity.mjs` | `getProviderBySlug` reads `providers.mjs` |
| `scripts/seo-build.mjs` | Breadcrumb: Home › Our physicians › Dr. Name; index page handling |
| `scripts/site-chrome.mjs` | Meet-physicians modules from `providers.mjs` |
| `styles.css` | Provider index, state chips, credential card styles |

---

## Data model fields (`data/providers.mjs`)

Per provider:

- **Identity:** slug, name, displayName, givenName, familyName, honorificPrefix/Suffix, credentials, role, photo, altText
- **Licensing:** statesLicensed, stateAbbreviations, licenses (empty — pending intake)
- **Credentials:** boardCertifications, credentialStatus, credentialVerifiedBy/Date (null)
- **Clinical:** clinicalFocus, conditionsTreated, services, carePhilosophy, shortBio, longBio, patientFit, whatToExpect, trustCards
- **Trust:** profileLastUpdated, acceptingNewPatients (null), reviewedContent (empty), authoredContent (empty), sameAs (empty), npi (null)
- **SEO:** seo.title, seo.description, seo.focusLead
- **Schema:** schema.medicalSpecialty, schema.knowsAbout, schema.jobTitle
- **Claims:** claimsNeedingVerification (documented, not removed)

Helpers: `getProviderBySlug`, `getAllProviders`, `getProvidersForServicePage`, `stateChipLabel`, `toEntityGraphProvider`

---

## Provider pages generated

| URL | H1 | States (chips) |
|-----|-----|----------------|
| `/providers/dr-sneh-pandey` | Dr. Sneh Pandey, MD | CA, TX, PA, FL |
| `/providers/dr-natasha-desai` | Dr. Natasha Desai, MD | TX, FL |
| `/providers/dr-swati-pandey` | Dr. Swati Pandey, MD | PA |

Template sections: hero (H1 + deck + lead), credential card, why patients choose, clinical focus, credentials & training, care philosophy, who this provider helps, services, treatment approach, what to expect, states & telehealth, testimonials (with TODO), final CTA, cross-links, profile meta.

`reviewedContent` section: omitted (empty for all providers).

---

## Provider index status

- **URL:** `/providers` (`providers/index.html`)
- **Hero:** Our physicians + Meet & Greet CTA
- **Cards:** 3 providers with state chips, focus tags, profile CTAs
- **Sitemap:** included at priority 0.85
- **Schema:** CollectionPage + ItemList + BreadcrumbList

---

## Schema validation

- Generator emits per profile: **Physician**, **MedicalOrganization**, **ProfilePage**, **BreadcrumbList**
- `seo-build` skips duplicate Physician injection when ProfilePage already present
- Build QA: **0 JSON-LD parse errors** across 155 pages
- No `reviewedBy` added to articles

---

## Internal links

- About page provider profile links: unchanged paths ✓
- Service pages: Meet-physicians modules driven by `getProvidersForServicePage()` ✓
- Provider cross-links: other providers + `/providers` hub ✓
- Nav: “Our physicians” → `/providers` on generated pages ✓

---

## Remaining unknown credential fields (all 3 providers)

| Field | Status |
|-------|--------|
| licenses (per-state type, number, expiration) | Missing — `[]` |
| education (medical school) | null |
| residency | null |
| fellowship | null |
| professionalMemberships | `[]` |
| languages | `[]` |
| npi | null |
| sameAs (NPI, board, LinkedIn, etc.) | `[]` |
| credentialVerifiedBy / credentialVerifiedDate | null |
| acceptingNewPatients | null |
| reviewedContent / authoredContent | `[]` |

Board certification **labels** retained from existing site copy; marked **Needs verification** in `credentialStatus`.

---

## Claims requiring source verification

| Provider | Claim |
|----------|-------|
| Dr. Sneh Pandey | 5,000+ patients in weight-loss programs |
| All 3 | Testimonial “(verified)” attributions |

Documented in audits + `TODO:VERIFY-SOURCE` HTML comments. Not removed.

---

## Missing-info audit summary

See:

- `docs/PROVIDER-MISSING-INFO-AUDIT.md` — per-field gaps with priority and questions
- `docs/PROVIDER-BIO-COMPLETENESS-AUDIT.md` — completeness matrix
- `docs/PROVIDER-BIO-REQUEST-SHEET.csv` — trackable request sheet
- `docs/PROVIDER-INTAKE-FORM.md` — send to physicians

---

## Readiness to add provider #4

**Ready for generator plumbing:** Yes — add one object to `PROVIDERS` in `data/providers.mjs` and re-run build.

**Ready for publication:** No — minimum intake not met:

1. Complete license verification per state
2. Medical school / residency / board cert verification
3. Approved headshot + alt text + consent
4. No unsubstantiated volume or testimonial claims
5. `acceptingNewPatients` and `credentialVerifiedBy` populated
6. Optional: `reviewedContent` only after physician sign-off

---

## QA checklist (pre-commit)

- [x] 0 broken links
- [x] 0 JSON-LD errors
- [x] Provider pages + index in sitemap (155 URLs)
- [x] Exactly one H1 per provider profile page
- [x] Provider images load (paths `../assets/images/dr-*.png`)
- [x] Alt text on all provider images
- [x] State chips match licensed states in data
- [x] No invented schools, license numbers, or ratings
- [x] Missing fields documented in audits

**Status: QA PASS — ready for review; not committed per instructions.**
