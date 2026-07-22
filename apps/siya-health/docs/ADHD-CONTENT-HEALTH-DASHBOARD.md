# ADHD Content Health Dashboard (Framework)

**Date:** 2026-07-16  
**Note:** Traffic / impressions / CTR / position require Google Search Console export. Columns below are the required schema for the living sheet; GSC fields are blank until connected.

---

## Required fields per article

| Field | Source |
|-------|--------|
| URL | Site |
| Cluster | Architecture taxonomy |
| Publish Date | `datePublished` schema / git |
| Last Updated | `dateModified` / file mtime |
| Next Review Date | Publish + 90 days (pillars 60) |
| Medical Review Date | EEAT block |
| Reviewer | Dr. Sneh Pandey MD (default) |
| Traffic (28d) | GSC / Analytics — *pending* |
| Impressions (28d) | GSC — *pending* |
| CTR | GSC — *pending* |
| Avg Position | GSC — *pending* |
| Inbound contextual links | Linking audit |
| Schema OK | BlogPosting + FAQ + Breadcrumb |
| Refresh flag | Auto rules below |

---

## Automated review schedule

| Cadence | Pages |
|---------|-------|
| Every 60 days | Pillars: `/adhd-care`, `/blog/adhd`, TX/FL/PA hubs, Medication options, How to know |
| Every 90 days | All ADHD blogs + answers |
| Every 180 days | Local city pages (unless ranking drop) |
| Immediate | Any page with medical guideline change / FDA label change |

### Auto refresh flags (without GSC)

- `dateModified` > 120 days AND inbound < 5  
- EEAT still `clinical-review--pending` on commercial pages  
- Cluster coverage score ≤ 3 (from Topical Authority Dashboard)  
- Orphan or thin-inbound from linking audit  

### When GSC is connected

Flag refresh if:
- Impressions > 500 AND CTR < 2%  
- Avg position 8–20 (striking distance)  
- Position worsened > 5 places MoM  

---

## Seed rows (editorial — metrics pending)

| URL | Cluster | Publish | Last Updated | Next Review | Med Review | Inbound | Flag |
|-----|---------|---------|--------------|-------------|------------|--------:|------|
| `/blog/adhd-in-women` | Women | 2026-07-17 | 2026-07-17 | 2026-09-15 | Pending | 12+ | Pillar live · Peri gap |
| `/blog/executive-dysfunction-adhd` | Exec | 2026-07-17 | 2026-07-17 | 2026-09-15 | Pending | 13+ | Pillar live · spokes later |
| `/answers/adhd-in-women` | Women | — | 2026-07-17 | 2026-10-15 | Pending | FAQ | Defers to Women hub |
| `/answers/executive-dysfunction-adhd` | Exec | — | 2026-07-17 | 2026-10-15 | Pending | FAQ | Defers to ED pillar |
| `/blog/adhd-treatment-texas` | Local TX | 2026-07-16 | 2026-07-16 | 2026-09-14 | Pending | ~7+ | Warm links |
| `/blog/adhd-and-binge-eating` | Food/Weight | 2026-07-16 | 2026-07-16 | 2026-10-14 | Pending | ~9+ | OK |
| `/adhd-evaluation-cost` | Cost | — | — | 2026-10-14 | — | linked | OK |

---

## Next automation step

Export GSC Performance (page) CSV → `data/gsc-adhd-pages.csv` → script merges into this table. Not built this pass.
