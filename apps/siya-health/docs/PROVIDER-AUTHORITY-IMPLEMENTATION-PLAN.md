# Provider Authority Implementation Plan

Generated: 2026-06-05  
Companion: `PROVIDER-CONTENT-OWNERSHIP-MAP.md` (151 URLs)  
**Planning only — no production code changes in this pass.**

---

## Goals

| Goal | Target |
|------|--------|
| Inbound internal links per profile | **≥ 20** |
| Content ownership | Every audited URL has primary + optional secondary owner |
| Service page presence | State-licensed clinicians on relevant `#meet-physicians` blocks |
| Guide/answer linkage | Each provider linked from owned topic cluster |

---

## Authority score model

```
authorityScore =
  inboundInternalLinks
  + (servicePageSlots × 3)
  + (featuredOnHomepage ? 8 : 0)
  + hubCardPresence (8)
  + (primaryContentOwned × 0.35)
  + (answerSeedAssignments × 0.25)
```

Inbound counts exclude `/providers/*` cross-links and `public/` mirror.

---

## Current vs projected authority

| Provider | Inbound now | After plan | Min links to ≥20 | Score now | Score after | ≥20 inbound? |
|----------|------------:|-----------:|-----------------:|----------:|------------:|:------------:|
| Wendy Delgado, PA-C | 3 | **22** | 17 | 22 | 41 | ✅ |
| Dr. Vanessa Urbina | 4 | **13** | 16 | 31 | 40 | ❌ (+7 more) |
| Derek Timbs, FNP-BC | 4 | **40** | 16 | 23 | 59 | ✅ |
| Megan Wunderlich, FNP-C | 8 | **33** | 12 | 23 | 48 | ✅ |
| Dr. Swati Pandey | 9 | **28** | 11 | 40 | 59 | ✅ |
| Dr. Natasha Desai | 13 | **95** | 7 | 49 | 131 | ✅ |
| Dr. Sneh Pandey | 18 | **94** | 2 | 87 | 163 | ✅ |

**Total link insertions in ownership map:** 266  
**Additional links needed for Vanessa:** ~7 (see gap closure below)

---

## Internal links required (summary)

| Provider | Current inbound | Target | Net new (full map) | Answer seeds today |
|----------|----------------:|-------:|-------------------:|-------------------:|
| Dr. Sneh Pandey | 18 | ≥20 | +76 | 46 |
| Dr. Natasha Desai | 13 | ≥20 | +82 | 13 |
| Dr. Swati Pandey | 9 | ≥20 | +19 | 6 |
| Dr. Vanessa Urbina | 4 | ≥20 | +9 (+7 gap) | 0 |
| Megan Wunderlich, FNP-C | 8 | ≥20 | +25 | 0 |
| Derek Timbs, FNP-BC | 4 | ≥20 | +36 | 0 |
| Wendy Delgado, PA-C | 3 | ≥20 | +19 | 0 |

---

## Vanessa Urbina gap closure (+7 links)

Add primary Vanessa links on:

1. `/about` — DPC / Florida callout (secondary currently missing)
2. `/telehealth` — FL primary care bullet
3. `/blog/online-adhd-diagnosis-texas` — cross-link “also licensed in FL” card
4. `/answers/signs-of-adult-adhd` — primary care entry point
5. `/answers/late-adhd-diagnosis-adults` — women's / primary care angle
6. `/adhd-care` — FL state chip → Vanessa profile
7. `/book-appointment` — FL routing note

---

## Recommended files to update

### 1. Data layer (create / extend)

| File | Action |
|------|--------|
| **`data/content-ownership.mjs`** | **Create** — export `getOwnership(url)` → `{ primarySlug, secondarySlug, reason }` from ownership map |
| `data/answer-seeds.mjs` | Rebalance `reviewerSlug`: Wendy +8, Vanessa +6, Derek +12, Megan +10 (reduce Sneh concentration) |
| `data/providers.mjs` | Document `AUTHORITY_TOPICS` per slug; ensure `SERVICE_PROVIDER_SLUGS` matches positioning |
| `data/content-review-registry.mjs` | Align `REVIEWER_OWNERSHIP` with primary owners per cluster |

### 2. Generator / sitewide chrome

| File | Action |
|------|--------|
| **`scripts/site-chrome.mjs`** | Add `injectProviderAttributionStrip(html, relPath)` — compact primary + secondary profile links from `content-ownership.mjs` |
| `scripts/seo-build.mjs` | Invoke attribution strip on all non-provider HTML after existing chrome |
| `scripts/generate-answer-pages.mjs` | Add “Related clinician” block from ownership map |
| `scripts/clinical-entity.mjs` | Optional `Physician` `url` mention in MedicalWebPage when owner assigned |

### 3. Service & landing pages (high priority)

| File | Providers to surface |
|------|---------------------|
| `adhd-care.html` | Sneh, Natasha, Megan, Swati |
| `adhd-screening.html` | Swati, Megan |
| `weight-loss-metabolic-health.html` | Sneh, Wendy, Derek |
| `primary-urgent-care.html` | Vanessa (primary owner) |
| `mens-health-longevity.html` | Derek, Sneh |
| `adhd-diagnosis-florida.html` | Vanessa |
| `adhd-diagnosis-pennsylvania.html` | Megan, Swati |
| `membership-pricing.html` | Wendy, Derek |
| `creyos-adhd-testing.html` | Swati, Megan |

### 4. Blog cluster injection (via chrome strip)

| Cluster | Primary | Secondary | ~URLs |
|---------|---------|-----------|------:|
| Metabolic / GLP-1 / food noise | Wendy (CA), Derek (TX), Sneh | cross-state | 22 |
| ADHD medication | Swati | Natasha | 12 |
| ADHD behavioral / symptoms | Natasha | Megan | 14 |
| Men's health / testosterone | Derek | Sneh | 8 |
| Fatigue / sleep | Sneh | Derek | 6 |

---

## Phased implementation

### Phase A — Data (no deploy)
1. Create `content-ownership.mjs` from map
2. Rebalance `answer-seeds.mjs`
3. Add `scripts/validate-provider-authority.mjs` — fail build if any provider < 20 projected inbound

### Phase B — Attribution strip
1. Implement strip in `site-chrome.mjs`
2. `npm run build` → verify inbound counts

### Phase C — Service / geo cards
1. Update meet-physicians injection for FL, PA, CA, TX, OH
2. Close Vanessa +7 gap

### Phase D — QA
1. Re-audit inbound links
2. Clinical sign-off before restoring `reviewedBy`

---

## Estimated E-E-A-T impact

| Dimension | Before | After | Notes |
|-----------|--------|-------|-------|
| Clinician–content alignment | Weak for 4/7 providers | Strong for 7/7 | Explicit primary owner per URL |
| State trust (FL/PA/CA) | Vanessa/Megan/Wendy under-visible | Geo pages link to licensed clinician | High trust lift for YMYL |
| Medication credibility | Swati under-linked | Medication cluster → Swati + Natasha | Avoids psychiatry positioning |
| Primary care signal | Vanessa 4 inbound | 20+ with DPC framing | Supports “not a pill mill” narrative |
| Medical Director anchor | Sneh dominant | Retained without crowding out APPs | Balanced roster |

**Overall:** Moderate → **Strong** multi-physician E-E-A-T for telehealth YMYL.

---

## Estimated SEO impact

| Signal | Expected effect |
|--------|-----------------|
| Profile URL internal PageRank | +10–90 internal links per profile → faster indexing, stronger brand SERPs for `[name] + siya` |
| Geo long-tail | FL/PA/CA pages cite state-licensed owners → relevance for “ADHD Florida”, “GLP-1 California” |
| Entity graph reinforcement | More `Physician` ↔ `MedicalWebPage` internal anchors |
| Crawl budget | Neutral (no new URLs; richer edges on existing 159) |

**Conservative estimate:** +3–8% organic sessions to provider + service/geo pages over 8–12 weeks. Largest lift: **metabolic/GLP-1** and **state ADHD** queries.

---

## Success criteria

- [ ] All 7 providers ≥ 20 inbound internal links
- [ ] `content-ownership.mjs` covers 151 URLs
- [ ] Answer seeds: zero providers with 0 assignments (except intentional)
- [ ] Build passes: 159 sitemap URLs, 0 broken links, 0 JSON-LD errors
- [ ] No psychiatry positioning introduced for Swati
