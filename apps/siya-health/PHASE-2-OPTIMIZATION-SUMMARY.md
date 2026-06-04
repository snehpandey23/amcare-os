# Phase 2 Optimization Summary

**Generated:** 2026-06-04

## 1. Are the current cornerstone articles strong enough?

**Yes for clinical depth; no for conversion architecture parity.**


| Dimension        | Assessment                                               |
| ---------------- | -------------------------------------------------------- |
| Clinical writing | Strong across all five                                   |
| Internal linking | Strong hub (food-noise, insulin, fatigue, sleep, free-T) |
| FAQ / schema     | Strong (especially sleep apnea: 10 FAQs)                 |
| Engagement UX    | 4/5 complete; sleep apnea lags                           |
| Conversion       | 1/5 has mid-article CTA; all rely on end band            |


They are sufficient to **earn trust and rankings** but not yet a **discovery engine that converts** until L2/L3 CTAs and service cards are standardized.

---

## 2. Which article should be upgraded next?

**Priority 1: Sleep Apnea, Fatigue, and Metabolic Risk**

Reasons: zero engagement blocks, duplicate clinical-review markup, no mid-article `cta-block`, immediate chat loader, highest **cluster bridging** value (fatigue + hormones + ADHD + metabolic).

**Priority 2: Insulin Resistance and Weight Loss**

Add mid-article `cta-block` + service card — highest **commercial** cornerstone after food-noise.

---

## 3. Which answer pages should exist before new blogs?

1. Brain fog after eating
2. Why normal labs don't mean you're healthy
3. Poor sleep feels like ADHD
4. Food noise returned on GLP-1
5. Weight gain after stopping Ozempic

See `ANSWER-PAGE-ROADMAP.md`.

---

## 4. Which asset is most likely to drive the first meaningful organic traffic?

**Why Am I Always Tired?** (`/blog/why-am-i-always-tired-causes-when-to-see-doctor`)

- Broad head term alignment  
- Large symptom TAM  
- Strong FAQ + engagement  
- Cross-links sleep, metabolic, ADHD (internal PageRank flow)

**Runner-up for velocity:** **Food Noise & GLP-1** — rising query, less competition than “ADHD Texas,” strong differentiation.

---

## 5. Which asset is most likely to drive the first patient conversion?

**Food Noise & GLP-1** (`/blog/food-noise-and-glp-1-what-it-means-and-what-helps`)

- Only cornerstone with mid-article `cta-block` → `/weight-loss-metabolic-health`  
- Highest GLP-1 / medical weight-loss intent  
- Meet & Greet + metabolic service alignment

**Runner-up:** **Insulin Resistance** after adding mid-article CTA (same funnel, slightly earlier-funnel reader).

---

## Deliverables index


| Report                  | File                                |
| ----------------------- | ----------------------------------- |
| Conversion architecture | `CONVERSION-ARCHITECTURE-REPORT.md` |
| Keyword coverage        | `CORNERSTONE-KEYWORD-COVERAGE.md`   |
| Snippet opportunities   | `SNIPPET-OPPORTUNITIES.md`          |
| Answer roadmap          | `ANSWER-PAGE-ROADMAP.md`            |
| Cluster scorecard       | `CLUSTER-STRENGTH-SCORECARD.md`     |
| Engagement validation   | `ENGAGEMENT-VALIDATION-REPORT.md`   |
| Next 20 priorities      | `NEXT-20-CONTENT-PRIORITIES.md`     |


---

## Recommended implementation order (existing assets only)

1. Standardize **cta-block** + **service card** component on all 5 cornerstones
2. Apply **engagement bundle** to sleep apnea + dedupe clinical review
3. Add **snippet tables** to existing sections
4. Ship **5 answer pages** (generator script—separate task)
5. Extend **service pages** with cornerstone deep-links

