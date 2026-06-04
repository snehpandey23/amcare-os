# Phase 3 — Discovery Engine Content Production Report

**Project:** Siya Health Health Guides (`apps/siya-health`)  
**Scope:** Tier-1 guides only — **no blog articles**  
**Date:** 2026-06-04  
**Pattern reference:** `poor-sleep-feels-like-adhd`, `brain-fog-after-eating`

---

## Executive summary

Five Tier-1 Health Guides were added to the discovery engine around **metabolic**, **fatigue/sleep**, **GLP-1**, and **hormone** clusters. Each includes a research brief, FAQ schema JSON, internal link plan, social hooks, video hooks, and a generated `/answers/{slug}.html` page with short answer, structured sections (including **A common example** and **Decision support**), related guides, evidence, and **Book a Meet & Greet** CTAs.

| Metric | Value |
|--------|------:|
| New Health Guides | 5 |
| Total Health Guide pages (generated) | 65 |
| Sitemap URLs | 154 |
| Broken internal links (build audit) | 0 |

---

## Tier-1 guides shipped

| # | Title | Slug | URL |
|---|--------|------|-----|
| 1 | Why Normal Labs Don't Mean You're Healthy | `why-normal-labs-dont-mean-healthy` | https://siya.health/answers/why-normal-labs-dont-mean-healthy |
| 2 | Food Noise Returned on GLP-1 | `food-noise-returned-on-glp-1` | https://siya.health/answers/food-noise-returned-on-glp-1 |
| 3 | Weight Gain After Stopping Ozempic | `weight-gain-after-stopping-ozempic` | https://siya.health/answers/weight-gain-after-stopping-ozempic |
| 4 | Afternoon Energy Crash After Lunch | `afternoon-energy-crash-after-lunch` | https://siya.health/answers/afternoon-energy-crash-after-lunch |
| 5 | High SHBG and Low Free Testosterone | `high-shbg-low-free-testosterone` | https://siya.health/answers/high-shbg-low-free-testosterone |

---

## Keyword audit (pre-write)

### 1. Why Normal Labs Don't Mean You're Healthy

| Type | Keywords |
|------|----------|
| **Primary** | normal labs but feel terrible |
| **Secondary** | why are my labs normal but i feel sick; normal blood work unhealthy; normal a1c still unhealthy; metabolic health normal labs |
| **FAQ / PAA** | Can you be unhealthy with normal blood tests?; What diseases do not show up in blood tests?; Can you have insulin resistance with normal A1C? |
| **Internal targets** | `normal-a1c-insulin-resistance`, `what-is-insulin-resistance`, `brain-fog-after-eating`, insulin cornerstone blog |
| **Cornerstone dedupe** | Extends “normal A1C” guide; does not replace insulin resistance clinician blog |

### 2. Food Noise Returned on GLP-1

| Type | Keywords |
|------|----------|
| **Primary** | food noise came back on glp-1 |
| **Secondary** | food noise returned ozempic; wegovy stopped working cravings; semaglutide food noise again; glp-1 not working anymore |
| **FAQ / PAA** | Why did food noise come back on GLP-1?; Does semaglutide stop working?; Can stress bring back food noise? |
| **Internal targets** | `what-is-food-noise`, `glp-1-side-effects`, food-noise cornerstone blog |
| **Cornerstone dedupe** | **Return** intent only; cornerstone retains baseline mechanism |

### 3. Weight Gain After Stopping Ozempic

| Type | Keywords |
|------|----------|
| **Primary** | weight gain after stopping ozempic |
| **Secondary** | ozempic rebound weight gain; regain after wegovy; semaglutide withdrawal weight; maintain weight after glp-1 |
| **FAQ / PAA** | Why am I gaining weight after stopping Ozempic?; How fast do you regain after semaglutide?; Ozempic rebound |
| **Internal targets** | `semaglutide-weight-loss-how-it-works`, `food-noise-returned-on-glp-1`, food-noise cornerstone |
| **Cornerstone dedupe** | Stop/regain vs “how semaglutide works” |

### 4. Afternoon Energy Crash After Lunch

| Type | Keywords |
|------|----------|
| **Primary** | afternoon energy crash after lunch |
| **Secondary** | why am i so tired after lunch; afternoon fatigue after eating; post lunch slump; 2pm energy crash |
| **FAQ / PAA** | Why do I crash every afternoon after lunch?; Is afternoon fatigue diabetes?; Post lunch coma |
| **Internal targets** | `brain-fog-after-eating`, `why-am-i-tired-even-after-sleeping`, fatigue cornerstone blog |
| **Cornerstone dedupe** | **Afternoon timing** vs brain-fog breadth |

### 5. High SHBG and Low Free Testosterone

| Type | Keywords |
|------|----------|
| **Primary** | high shbg low free testosterone |
| **Secondary** | high shbg symptoms men; normal total testosterone low free t; high sex hormone binding globulin |
| **FAQ / PAA** | What does high SHBG mean?; Low free testosterone normal total?; Do I need TRT if free T is low? |
| **Internal targets** | `what-is-free-testosterone`, free-vs-total cornerstone blog, `/mens-health-longevity` |
| **Cornerstone dedupe** | High-SHBG-specific vs free-vs-total overview blog |

---

## Deliverables per guide

| Guide | Research brief | FAQ schema | Link plan | Social | Video | HTML page |
|-------|:------------:|:----------:|:---------:|:------:|:-----:|:-----------:|
| Normal labs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Food noise returned | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ozempic regain | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Afternoon crash | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| High SHBG | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Paths:** `docs/guides/{slug}-RESEARCH-BRIEF.md`, `-FAQ-SCHEMA.json`, `-INTERNAL-LINK-PLAN.md`, `-SOCIAL-HOOKS.md`, `-VIDEO-HOOKS.md`  
**Pages:** `answers/{slug}.html` (via `npm run build`)

---

## Structure compliance (Tier-1 pattern)

Each generated page includes:

- Educational disclaimer + single `aside.clinical-review`
- **Short answer** (featured snippet–friendly)
- Structured **sections** (800–1200 word target in seed prose)
- **A common example** (patient vignette, non-diagnostic)
- **Decision support** (actionable clinician-aligned steps)
- **PubMed, forums, and PAA themes** section
- **Evidence & references**
- **Related Health Guides** (6 lateral links)
- **Clinical guides & care** (`learnMore`)
- **Next steps** + **Book a Meet & Greet** + Explore care CTA
- FAQPage JSON-LD from seed `faqs`

---

## Hub placement (featured cards)

Updated in `scripts/generate-answer-pages.mjs` → `FEATURED_BY_CATEGORY`:

| Category | Featured slugs (3 each) |
|----------|-------------------------|
| **Metabolic** | `why-normal-labs-dont-mean-healthy`, `food-noise-returned-on-glp-1`, `what-is-insulin-resistance` |
| **Energy & Fatigue** | `afternoon-energy-crash-after-lunch`, `poor-sleep-feels-like-adhd`, `why-am-i-tired-even-after-sleeping` |
| **Hormone** | `high-shbg-low-free-testosterone`, `what-is-free-testosterone`, `what-does-low-testosterone-feel-like` |

Dual-hub listings: `why-normal-labs-dont-mean-healthy` (metabolic + energy), `afternoon-energy-crash-after-lunch` (metabolic + energy) via `hubCategories` in seeds.

---

## Research inputs documented

| Source | Where captured |
|--------|----------------|
| PubMed / guidelines | Seed `evidence[]` + research briefs |
| Reddit themes | Seed `research-themes` sections + briefs |
| Quora themes | Seed `research-themes` + FAQ mapping |
| Google PAA | FAQ seeds + keyword tables above |

---

## Code / data changes

| File | Change |
|------|--------|
| `data/phase3-answer-seeds.mjs` | **New** — 5 Tier-1 seeds |
| `data/answer-seeds.mjs` | Imports and merges `PHASE3_ANSWER_SEEDS` |
| `scripts/generate-answer-pages.mjs` | Featured hub slots + category routing |
| `scripts/write-phase3-guide-docs.mjs` | Collateral generator |
| `sitemap.xml` | +5 URLs (via build) |

---

## Build & QA

```bash
cd apps/siya-health
node scripts/write-phase3-guide-docs.mjs   # optional — refresh collateral
npm run build
```

**Post-build:** 154 pages, 0 broken links in internal audit, JSON-LD FAQ on each new guide.

---

## Cornerstone overlap matrix (avoid duplication)

| New guide | Cornerstone / long blog | Differentiation |
|-----------|----------------------|-----------------|
| Normal labs | Insulin resistance blog | Symptom-first “green labs” narrative |
| Food noise returned | Food noise + GLP-1 blog | Relapse after improvement |
| Ozempic regain | Food noise blog (partial) | Discontinuation/regain only |
| Afternoon crash | Fatigue blog; brain-fog guide | Clock-time work crash |
| High SHBG | Free vs total T blog | SHBG-high mechanistic focus |

---

## Recommended follow-ups (not in scope)

1. Deploy to production (`main` → Vercel) when ready  
2. Add inbound links from cornerstones to new slugs (internal-link-audit shows some guides still under-linked)  
3. Physician sign-off in `data/content-review-registry.mjs`  
4. `npm run parity:cert` after deploy  

---

## Word counts (generated body, approximate)

Run: `node scripts/write-phase3-guide-docs.mjs` (prints counts from seeds).

Target band: **800–1200** words per guide. Generated seed word counts (post-build):

| Slug | Words |
|------|------:|
| `why-normal-labs-dont-mean-healthy` | 819 |
| `food-noise-returned-on-glp-1` | 781 |
| `weight-gain-after-stopping-ozempic` | 724 |
| `afternoon-energy-crash-after-lunch` | 731 |
| `high-shbg-low-free-testosterone` | 703 |

Guides 2–5 can be expanded in `data/phase3-answer-seeds.mjs` if editorial requires strict 800+ floor on every page.

---

## Confirmation: no blog articles

No files were added under `blog/`. Discovery expansion is **Health Guides only** per Phase 3 spec.
