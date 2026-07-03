# Content architecture report

Generated: 2026-07-03T11:31:29.950Z

## Summary

- **Topic clusters defined:** 8 (ADHD, metabolic, energy, hormone)
- **Priority informational URLs:** 27
- **Priority blogs patched with cluster bridges:** 10
- **Consolidation recommendations:** 12 (recommend only — no pages removed)

## Answers hub structure

`/answers` now includes:

1. **Topic cluster explorer** — cornerstone guide + article + service links per cluster
2. **Category sections** — existing metabolic / energy / hormone / ADHD / telehealth groupings
3. **Per-guide cluster navigation** — each clustered answer page links siblings, cornerstone blog, and care pathways

## Topic clusters

| Cluster | Cornerstone guide | Cornerstone blog | Guides | Service |
|---------|-------------------|------------------|--------|---------|
| Symptoms & evaluation | /answers/signs-of-adult-adhd | /blog/how-to-know-if-you-have-adhd-adult | 11 | /adhd-care |
| Screening & diagnosis | /answers/screening-vs-adhd-evaluation | /blog/is-online-adhd-diagnosis-legit | 6 | /adhd-care |
| Medication | /answers/starting-adhd-medication-adults | /blog/adhd-medication-options-for-adults | 6 | /adhd-care |
| Telehealth & access | /answers/what-included-199-adhd-evaluation | /blog/online-adhd-diagnosis-california | 4 | /adhd-care |
| Food noise & GLP-1 | /answers/what-is-food-noise | /blog/food-noise-and-glp-1-what-it-means-and-what-helps | 4 | /weight-loss-metabolic-health |
| Insulin resistance & metabolic health | /answers/what-is-insulin-resistance | /blog/insulin-resistance-and-weight-loss-clinician-overview | 6 | /weight-loss-metabolic-health |
| Fatigue & sleep | /answers/why-am-i-tired-even-after-sleeping | /blog/why-am-i-always-tired-causes-when-to-see-doctor | 3 | /telehealth |
| Men's health & testosterone | /answers/what-is-free-testosterone | /blog/free-testosterone-vs-total-testosterone-what-patients-should-know | 6 | /mens-health-longevity |

## Consolidation recommendations (answer ↔ blog overlap)

These pairs target **essentially the same search intent**. Keep the canonical URL; strengthen internal links from the merge candidate. Do **not** create new pages.

| Keep (canonical) | Defer / merge candidate | Reason |
|----------------|-------------------------|--------|
| /answers/signs-of-adult-adhd | /answers/adhd-in-women | Thin gender variant; adult signs cornerstone covers women-specific patterns in body copy. |
| /answers/signs-of-adult-adhd | /answers/high-functioning-adhd | High-functioning narrative is a subset of adult signs; thin standalone guide. |
| /answers/signs-of-adult-adhd | /answers/time-blindness-adhd | Micro-topic (time blindness) fully covered in signs cornerstone + blog. |
| /answers/signs-of-adult-adhd | /answers/executive-dysfunction-adhd | Executive dysfunction is an ADHD symptom cluster, not a separate intent. |
| /blog/how-to-know-if-you-have-adhd-adult | /blog/adult-adhd-symptoms-california | California geo variant duplicates sitewide symptoms cornerstone. |
| /blog/online-adhd-diagnosis-california | /blog/adhd-evaluation-california-online-vs-in-person | Online vs in-person comparison absorbed by CA diagnosis cornerstone. |
| /blog/online-adhd-diagnosis-texas | /answers/telehealth-adhd-texas | TX telehealth FAQ duplicates TX diagnosis blog intent. |
| /blog/is-online-adhd-diagnosis-legit | /answers/is-online-adhd-diagnosis-legitimate | Duplicate intent — guide narrowed to FAQ checklist; blog owns depth (already differentiated). |
| /blog/vyvanse-vs-adderall-differences | /answers/adderall-vs-vyvanse-adults | Guide scoped to preference FAQ; blog owns full comparison. |
| /blog/glp1-side-effects-and-how-to-manage-them | /answers/glp-1-nausea-management | Nausea subset fully covered in GLP-1 side effects cornerstone. |
| /blog/food-noise-and-glp-1-what-it-means-and-what-helps | /answers/weight-gain-after-stopping-ozempic | Ozempic cessation / food-noise rebound owned by food-noise cornerstone. |
| /blog/how-to-know-if-you-have-adhd-adult | /answers/rejection-sensitivity-adhd | RSD micro-guide; symptom covered in signs cornerstone and ADHD blog cluster. |

## Priority pages strengthened

- /answers/signs-of-adult-adhd
- /answers/can-adhd-be-diagnosed-online
- /answers/is-online-adhd-diagnosis-legitimate
- /answers/screening-vs-adhd-evaluation
- /answers/how-long-adhd-evaluation
- /answers/starting-adhd-medication-adults
- /answers/what-is-food-noise
- /answers/what-is-insulin-resistance
- /answers/why-am-i-tired-even-after-sleeping
- /answers/what-is-free-testosterone
- /blog/how-to-know-if-you-have-adhd-adult
- /blog/is-online-adhd-diagnosis-legit
- /blog/adhd-medication-options-for-adults
- /blog/food-noise-and-glp-1-what-it-means-and-what-helps
- /blog/insulin-resistance-and-weight-loss-clinician-overview
- /blog/why-am-i-always-tired-causes-when-to-see-doctor
- /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign
- /blog/free-testosterone-vs-total-testosterone-what-patients-should-know
- /blog/online-adhd-diagnosis-california
- /blog/online-adhd-diagnosis-texas
- /adhd-care
- /adhd-screening
- /weight-loss-metabolic-health
- /telehealth
- /mens-health-longevity
- /answers
- /blog/adhd

## Blog cluster bridges applied

- /blog/adhd-medication-options-for-adults → cluster `adhd-medication`
- /blog/food-noise-and-glp-1-what-it-means-and-what-helps → cluster `food-noise-glp1`
- /blog/free-testosterone-vs-total-testosterone-what-patients-should-know → cluster `testosterone-mens-health`
- /blog/how-to-know-if-you-have-adhd-adult → cluster `adhd-symptoms-evaluation`
- /blog/insulin-resistance-and-weight-loss-clinician-overview → cluster `insulin-metabolic`
- /blog/is-online-adhd-diagnosis-legit → cluster `adhd-screening-diagnosis`
- /blog/online-adhd-diagnosis-california → cluster `adhd-telehealth-access`
- /blog/online-adhd-diagnosis-texas → cluster `adhd-telehealth-access`
- /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign → cluster `fatigue-sleep`
- /blog/why-am-i-always-tired-causes-when-to-see-doctor → cluster `fatigue-sleep`

## Next steps (editorial, not automated)

1. When consolidating, add a visible banner on merge candidates pointing to the canonical page (no content rewrites required).
2. Request indexing recrawl for `/answers` and cornerstone guides after deploy.
3. Monitor Search Console for reduced "Discovered – not indexed" on cluster hub paths first.
