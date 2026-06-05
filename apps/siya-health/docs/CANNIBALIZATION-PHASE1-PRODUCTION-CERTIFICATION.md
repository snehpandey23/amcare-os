# Cannibalization Phase 1 — Production Certification

**Deployed commit:** `edd3a85`  
**Production:** https://www.siya.health  
**Certified at:** 2026-06-05T05:51:00Z  
**Overall status:** **PASS**

---

## Pre-deploy validation (local build)

| Check | Result |
|-------|--------|
| Sitemap URLs | **154** |
| Broken internal links | **0** |
| Duplicate title tags | **0** |
| Duplicate H1s | **0** |
| JSON-LD errors | **0** |
| Guide canonical pointer blocks | **31/31** |
| Duplicate pairs narrowed | **17** |
| Supporting pairs strengthened | **14** |

---

## Deploy

| Item | Value |
|------|-------|
| Branch | `main` |
| Commit | `edd3a85` |
| Message | `feat(siya-health): cannibalization phase 1 — differentiate guides from blogs` |
| Scope | `apps/siya-health/` only (111 files) |
| Push | `a211668..edd3a85 main -> main` |

---

## Post-deploy: `npm run parity:cert`

| Criterion | Result |
|-----------|--------|
| Overall | **PASS** |
| Tier-1 guides HTTP 200 | PASS |
| 1 review block per blog/guide (sample) | PASS |
| ≤1 cta-band per blog (sample) | PASS |
| Health Guides in navigation | PASS |
| California in state lists | PASS |

Report: `docs/PRODUCTION-PARITY-CERTIFICATION.md` (2026-06-05T05:49:29Z)

---

## Production visual audit (6 URL sample)

| URL | Narrowed title/H1 | Guide → blog link | Blog → guide link | Review blocks | Status |
|-----|-------------------|-------------------|-------------------|---------------|--------|
| `/answers/semaglutide-weight-loss-how-it-works` | ✓ `How quickly does semaglutide start working…` | ✓ canonical pointer + full-guide CTA | — | 1 | **PASS** |
| `/blog/semaglutide-for-weight-loss-how-it-works` | ✓ distinct long-form title | — | ✓ links to guide | 1 | **PASS** |
| `/answers/is-online-adhd-diagnosis-legitimate` | ✓ `What should you look for in a legitimate…` | ✓ canonical pointer + full-guide CTA | — | 1 | **PASS** |
| `/blog/is-online-adhd-diagnosis-legit` | ✓ distinct long-form title | — | ✓ links to guide | 1 | **PASS** |
| `/answers/what-is-food-noise` | ✓ `What is food noise?` (definition PAA) | ✓ canonical pointer + full-guide CTA | — | 1 | **PASS** |
| `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | ✓ cornerstone title | — | ✓ links to guide | 1 | **PASS** |

### Verified behaviors

- Guide titles/H1s narrowed where duplicate (semaglutide, ADHD legitimacy)
- Supporting pair (food noise) retains definition guide + cornerstone blog
- Guides prominently link to full clinical blog (top pointer + bottom CTA)
- Blogs link back to corresponding Health Guides
- No broken images on sample pages
- No duplicate review blocks (1 per page)
- Old duplicate semaglutide title (`How does semaglutide work for weight loss?`) **not** present on production guide

---

## Production sitemap

Live `https://www.siya.health/sitemap.xml`: **154** URLs

---

## Summary metrics (return payload)

| Metric | Value |
|--------|------:|
| Commit hash | `edd3a85` |
| Sitemap count | 154 |
| Broken links | 0 |
| Duplicate title count | 0 |
| Duplicate H1 count | 0 |
| Production certification | **PASS** |

---

## Related artifacts

- `docs/CANNIBALIZATION-PHASE1-AUDIT.md`
- `docs/CANNIBALIZATION-PHASE1-FINAL.md`
- `docs/DUPLICATE-PAIR-CHANGES.md`
- `docs/SUPPORTING-PAIR-LINKING.md`
- `docs/CORNERSTONE-PROTECTION-REPORT.md`
- `docs/PRODUCTION-PARITY-CERTIFICATION.md`
