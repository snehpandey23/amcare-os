# Conversion Architecture Report

**Generated:** 2026-06-04  
**Scope:** Five cornerstone articles — optimization recommendations only (no new pages).

## Executive summary

| Article | Conversion maturity | Primary gap |
|---------|-------------------|-------------|
| Food Noise & GLP-1 | **Best** | Secondary CTA points to service page, not Meet & Greet repeat |
| Insulin Resistance | Moderate | No mid-article `cta-block`; secondary → answer page |
| Why Am I Always Tired? | Moderate | No mid-article CTA; strong copy, weak structure |
| Free vs Total Testosterone | Moderate | Men's health secondary; no mid-article CTA |
| Sleep Apnea | **Weakest** | No engagement blocks; duplicate clinical-review; end-only CTA |

**Sitewide:** Header = single **Book a Meet & Greet** (correct). No cornerstone uses **Explore Care Options** in hero. No `mobile-sticky-cta` on cornerstone pages (homepage only).

---

## Conversion framework (recommended)

| Layer | Placement | Primary CTA | Secondary CTA |
|-------|-----------|-------------|---------------|
| **L0** | Global header / mobile nav | Book a Meet & Greet | — |
| **L1** | After Key Takeaway (~5% scroll) | — | Soft text link to most relevant **service page** |
| **L2** | After decision tree / “when to seek care” (~45% scroll) | Book a Meet & Greet | Explore [service] |
| **L3** | After “How Siya approaches…” / care pathway (~70% scroll) | `cta-block` pair | Service-specific |
| **L4** | Pre-FAQ (~85% scroll) | Optional inline: “Questions? Book a Meet & Greet” | — |
| **L5** | `cta-band` (exit scroll) | Book a Meet & Greet | Contextual explore |
| **L6** | Continue reading | — | Answer + sibling blog + service (already present) |

**Exit-intent:** Deferred chat (`deferred-chat-widget.js`) on 4/5 cornerstones; sleep apnea still loads LeadConnector immediately. Recommend: service **card** component (not popup) at L2—not interstitial modals (hurts trust).

---

## Per-article audit

### Food Noise and GLP-1

**URL:** `/blog/food-noise-and-glp-1-what-it-means-and-what-helps`

| Signal | Current state |
|--------|---------------|
| Meet & Greet mentions | 4 (header + body + footer band) |
| Explore / secondary CTAs | 1 |
| Mid-article `cta-block` | Yes |
| End `cta-band` | Yes |
| Service links in body | Metabolic: ✓, ADHD: ✓, Men's: —, Telehealth: ✓ |
| Engagement blocks | 8/8 (takeaway, evidence, myth, reddit, pearl, infographic, flowchart, decision) |
| Clinical review blocks | 2 ⚠ dedupe to 1 |

**CTA hierarchy today:** Header Meet & Greet > long education > mid cta-block > cta-band.

**Recommendations:**
- Keep mid `cta-block` (only cornerstone with it).
- Change secondary from “More weight loss articles” → **Explore medical weight loss** (`/weight-loss-metabolic-health`).
- Add L2 `cta-block` duplicate after decision tree for readers who skip services section.
- Add service card after takeaway.

### Insulin Resistance and Weight Loss

**URL:** `/blog/insulin-resistance-and-weight-loss-clinician-overview`

| Signal | Current state |
|--------|---------------|
| Meet & Greet mentions | 3 (header + body + footer band) |
| Explore / secondary CTAs | 0 |
| Mid-article `cta-block` | **No** |
| End `cta-band` | Yes |
| Service links in body | Metabolic: ✓, ADHD: ✓, Men's: —, Telehealth: ✓ |
| Engagement blocks | 8/8 (takeaway, evidence, myth, reddit, pearl, infographic, flowchart, decision) |
| Clinical review blocks | 2 ⚠ dedupe to 1 |

**CTA hierarchy today:** Header Meet & Greet > long education > no mid conversion > cta-band.

**Recommendations:**
- **Add `cta-block`** after decision tree (match food-noise pattern).
- Change cta-band secondary from answer-only → **Explore metabolic health** + keep answer link in body.
- Add L1 link: “Start with our weight loss program →” after takeaway.

### Why Am I Always Tired?

**URL:** `/blog/why-am-i-always-tired-causes-when-to-see-doctor`

| Signal | Current state |
|--------|---------------|
| Meet & Greet mentions | 3 (header + body + footer band) |
| Explore / secondary CTAs | 1 |
| Mid-article `cta-block` | **No** |
| End `cta-band` | Yes |
| Service links in body | Metabolic: ✓, ADHD: ✓, Men's: ✓, Telehealth: ✓ |
| Engagement blocks | 8/8 (takeaway, evidence, myth, reddit, pearl, infographic, flowchart, decision) |
| Clinical review blocks | 2 ⚠ dedupe to 1 |

**CTA hierarchy today:** Header Meet & Greet > long education > no mid conversion > cta-band.

**Recommendations:**
- **Add `cta-block`** after “When to seek medical evaluation” (high intent).
- Split secondary: **Book Meet & Greet** + “Explore telehealth” (keep) + add “ADHD evaluation” link when section mentions ADHD.
- Add service card: telehealth hub after flowchart.

### Free Testosterone vs Total Testosterone

**URL:** `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know`

| Signal | Current state |
|--------|---------------|
| Meet & Greet mentions | 3 (header + body + footer band) |
| Explore / secondary CTAs | 1 |
| Mid-article `cta-block` | **No** |
| End `cta-band` | Yes |
| Service links in body | Metabolic: ✓, ADHD: ✓, Men's: ✓, Telehealth: ✓ |
| Engagement blocks | 8/8 (takeaway, evidence, myth, reddit, pearl, infographic, flowchart, decision) |
| Clinical review blocks | 2 ⚠ dedupe to 1 |

**CTA hierarchy today:** Header Meet & Greet > long education > no mid conversion > cta-band.

**Recommendations:**
- **Add `cta-block`** after “When evaluation is appropriate.”
- cta-band secondary → Men's health (good); add Meet & Greet subtext: “Not a TRT mill—evaluation first.”
- Cross-link sleep apnea before TRT discussion with prominent inline CTA.

### Sleep Apnea, Fatigue, and Metabolic Risk

**URL:** `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign`

| Signal | Current state |
|--------|---------------|
| Meet & Greet mentions | 4 (header + body + footer band) |
| Explore / secondary CTAs | 1 |
| Mid-article `cta-block` | **No** |
| End `cta-band` | Yes |
| Service links in body | Metabolic: ✓, ADHD: ✓, Men's: ✓, Telehealth: ✓ |
| Engagement blocks | 0/8 (none) |
| Clinical review blocks | 5 ⚠ dedupe to 1 |

**CTA hierarchy today:** Header Meet & Greet > long education > no mid conversion > cta-band.

**Recommendations:**
- **Apply engagement bundle** (0/8 today)—parity with other cornerstones.
- **Dedupe clinical-review** (5 duplicate blocks → 1).
- **Add `cta-block`** after practical next steps.
- cta-band: add **Explore telehealth** + link fatigue cornerstone.
- Add deferred chat loader (currently immediate LeadConnector).


---

## Service-page card placement (new component — not built yet)

| Article | Card title | Link | Place after |
|---------|------------|------|-------------|
| Food Noise | Medical weight loss with GLP-1 oversight | `/weight-loss-metabolic-health` | Evidence snapshot |
| Insulin | Metabolic health program | `/weight-loss-metabolic-health` | Post-meal fatigue / flowchart section |
| Fatigue | Telehealth fatigue workup | `/telehealth` or split ADHD/sleep | After fatigue workup flowchart |
| Free T | Men's health & longevity | `/mens-health-longevity` | SHBG / lab interpretation section |
| Sleep Apnea | Sleep + metabolic coordination | `/telehealth` + link `/weight-loss-metabolic-health` | After “symptoms beyond snoring” |

---

## Scroll-depth conversion map (typical ~2,500–4,500 word articles)

```
0%   Header Meet & Greet
5%   Key Takeaway → [ADD] subtle “Explore care” text link
25%  Myth / evidence (trust peak) → [ADD] optional soft Meet & Greet mention in pearl
45%  Decision tree → [ADD] cta-block (all 5 articles)
70%  Siya care pathway → cta-block (standardize all 5)
85%  FAQ start
95%  cta-band (keep)
```

**Exit-intent:** Use delayed chat + bottom `cta-band`; avoid pop-ups on medical content.

