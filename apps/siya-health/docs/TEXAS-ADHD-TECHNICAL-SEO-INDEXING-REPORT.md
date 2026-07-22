# Texas ADHD Treatment Cluster — Technical SEO & Indexing Report

**Date:** 2026-07-16  
**Scope:** Texas hub + Dallas · Houston · Austin · San Antonio · Fort Worth  
**Mode:** Technical audit only — no content rewrites.

---

## Link update checklist (Step: cross-linking)

| Page | Hub link | Sibling city links | Contextual cluster block | Missing required targets |
|------|:--------:|:------------------:|:------------------------:|--------------------------|
| `/blog/adhd-treatment-texas` | self | all 5 cities in body | n/a (hub) | cities missing: none |
| `/blog/adhd-treatment-dallas-tx` | ✅ | 4 | ✅ `tx-cluster-links` | none |
| `/blog/adhd-treatment-houston-tx` | ✅ | 4 | ✅ `tx-cluster-links` | none |
| `/blog/adhd-treatment-austin-tx` | ✅ | 4 | ✅ `tx-cluster-links` | none |
| `/blog/adhd-treatment-san-antonio-tx` | ✅ | 4 | ✅ `tx-cluster-links` | none |
| `/blog/adhd-treatment-fort-worth-tx` | ✅ | 4 | ✅ `tx-cluster-links` | none |

### Confirmed contextual targets added to city pages
- Texas hub
- Sibling metros (Dallas / Houston / Austin / San Antonio / Fort Worth)
- ADHD medication options + how medication is prescribed online
- ADHD and binge eating
- ADHD in women
- Executive dysfunction
- How long ADHD evaluation takes
- Can ADHD be diagnosed online
- ADHD vs anxiety
- `/adhd-care`

---

## Indexing checklist (per page)

| Check | Texas Hub | Dallas | Houston | Austin | San Antonio | Fort Worth |
|-------|:---------:|:------:|:-------:|:------:|:-----------:|:----------:|
| Canonical present + self-ref | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| robots index,follow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meta title present | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meta description present | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Single H1 present | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Article/BlogPosting schema | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FAQPage schema | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BreadcrumbList schema | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Open Graph tags | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Twitter card tags | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Internal links in body (5–8+) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Meta / H1 snapshot

| Page | Title | Desc chars | H1 |
|------|-------|-----------:|----|
| Texas Hub | ADHD Treatment Texas | Physician-Led Virtual Care | Siya Health | 165 | ADHD Treatment in Texas: Physician-Led Virtual Care for Adults |
| Dallas | ADHD Treatment Dallas | Virtual Adult Care | Siya Health | 175 | ADHD Treatment in Dallas, Texas: Physician-Led Virtual Care for Adults |
| Houston | ADHD Treatment Houston TX | Virtual Adult Care | Siya Health | 190 | ADHD Treatment in Houston, Texas: Physician-Led Virtual Care for Adult |
| Austin | ADHD Treatment Austin TX | Virtual Adult Care | Siya Health | 174 | ADHD Treatment in Austin, Texas: Physician-Led Virtual Care for Adults |
| San Antonio | ADHD Treatment San Antonio TX | Virtual Adult Care | Siya Health | 193 | ADHD Treatment in San Antonio, Texas: Physician-Led Virtual Care for A |
| Fort Worth | ADHD Treatment Fort Worth | Virtual Adult Care | Siya Health | 167 | ADHD Treatment in Fort Worth, Texas: Physician-Led Virtual Care for Ad |

---

## Flags before requesting indexing

| Severity | Issue | Pages | Action |
|----------|-------|-------|--------|
| Medium | OG/Twitter image is logo-only (not city/hub creative) | All 6 | Optional: dedicated OG images before social push |
| Medium | No in-article content images (ALT N/A for body photos) | All 6 | Optional: add 1–2 illustrative images with ALT |
| Low | Austin city page still ~shorter than peers (content depth) | Austin | Optional expand later — not blocking index |
| Low | FAQ schema answers may include trailing markdown artifacts from MD→HTML | Some city pages | Clean in a hygiene pass if Rich Results flags |
| Info | Sitemap inclusion | All | Confirm after this deploy that `/blog/adhd-treatment-texas` + 5 cities appear in sitemap.xml |
| Info | Crawl depth | All | Hub + `/blog/adhd` + featured index keep depth ≤3 from home — OK |
| Info | Core Web Vitals | All | Static HTML + shared CSS; no page-specific JS heavy lifts — monitor CWV in GSC after index |
| Info | Mobile | All | Shared responsive blog template — verify one city + hub on mobile viewport |

## Pre-index actions (do these)

1. Deploy this hub + link updates to production
2. Confirm URLs return 200
3. Confirm sitemap lists all 6 URLs
4. Google Search Console → submit sitemap (if not auto)
5. URL Inspection → Request indexing for hub first, then cities
6. Rich Results Test on hub + one city (FAQ + Article)
7. Spot-check mobile layout

## Do NOT block indexing for

- Missing custom OG art (logo OG is acceptable to index)
- Austin word-count gap
- Formal physician sign-off still pending (EEAT honesty is correct)

