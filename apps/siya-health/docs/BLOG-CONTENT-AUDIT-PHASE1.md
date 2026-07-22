# Phase 1 Blog Content Audit

> **Elevated project:** This sheet remains the URL-level inventory. Strategic framing moved to **[ADHD Knowledge Architecture](./ADHD-KNOWLEDGE-ARCHITECTURE.md)** (entity · pillars · clusters · linking SOP · EEAT · Women’s Hub · phased execution).

**Date:** 2026-07-15  
**Scope:** 44 article blogs + 29 ADHD Health Guides + ADHD service/geo pages  
**Rule:** Audit and gap-fill before publishing Tier 1–2 city / gap topics  

Interactive view: open the Phase 1 audit canvas beside chat (workspace `canvases/blog-content-audit-phase1.canvas.tsx`).

---

## Executive verdict

| Layer | Status |
|-------|--------|
| Service / conversion (`/adhd-care`, screening, geo diagnosis) | Strong |
| Educational pillars (Adult Guide, Diagnosis, Treatment) | Mostly missing |
| Medication depth | Good spokes; promote options URL to pillar |
| California ADHD blogs | Over-published, thin, cannibalizing |
| Answers (Health Guides) ADHD set | Strong FAQs — under-leveraged as blog depth |
| Physician-reviewed + citations on ADHD blogs | Effectively none |
| Non-ADHD blogs (weight / telehealth / hormones) | Mostly Keep (quality ~7–10) |

**Do not publish city treatment pages first.** Build / upgrade pillars, consolidate the CA cluster, then publish gap topics and city pages that inherit authority.

---

## Inventory counts

| Surface | Count |
|---------|------:|
| Article blogs | 44 |
| ADHD article blogs | 23 |
| Blog hubs (`/blog`, `/blog/adhd`, etc.) | 4 |
| ADHD Health Guides (`/answers/*`) | 29 |
| ADHD geo/service root pages | Austin, Houston, Philly, TX, FL, PA + care/diagnosis/screening |

Word counts below include main + chrome (FAQ/nav inflate totals). Thinnest ADHD bodies still cluster in the CA set (~445–700 words).

---

## Action taxonomy (ADHD blogs)

| Action | Count | Meaning |
|--------|------:|---------|
| Keep | 7 | Strong spokes or best-of-cluster |
| Update | 8 | Expand, differentiate, or promote to pillar |
| Merge | 6 | Fold into a keeper; 301 later |
| Rewrite | 2 | Save URL; replace thin/AI-slop copy |
| Delete/Redirect | 1 | `/blog/adhd-telehealth-california` → CA diagnosis or telehealth answer |

---

## Cannibalization clusters

| ID | Intent family | Fighting URLs (summary) | Resolution |
|----|---------------|-------------------------|------------|
| **C1** | Adult ADHD signs / undiagnosed | `how-to-know`, `adhd-symptoms-overlooked`, `youre-not-lazy`, `adult-adhd-symptoms-california` + answers `signs-of-adult-adhd`, `late-adhd-diagnosis-adults` | Keep **youre-not-lazy**; update companions; rewrite CA symptoms |
| **C2** | Is online diagnosis legit? | `is-online-adhd-diagnosis-legit` + answers `is-online-adhd-diagnosis-legitimate`, `can-adhd-be-diagnosed-online` | One blog owns intent; answers = FAQ spokes |
| **C3** | CA diagnosis / testing / telehealth / provider | ~7 thin CA blogs | **Highest priority** — 1 CA diagnosis + 1 CA treatment; redirect rest |
| **C4** | TX diagnosis / cost | TX diagnosis + cost blogs vs `/adhd-diagnosis-texas`, `/adhd-evaluation-cost` | Blogs support geos; don’t duplicate cost |
| **C5** | Medication options | National options + CA options + Adderall / Vyvanse / non-stim | National options = Medication pillar; CA merges |
| **C6** | Meds online / prescribing | `how-adhd-medication-is-prescribed-online` + CA meds online + answer | Keep prescribing blog; merge CA into it |
| **C7** | Safety / side effects / daily dosing | side-effects, long-term, daily-or-as-needed | Keep depth pages; thicken daily dosing |

---

## ADHD blog sheet (audit columns)

| URL | Primary Keyword | Intent | Funnel | Q (1–10) | Needs Update? | Internal Links | CTA | Action |
|-----|-----------------|--------|--------|----------|---------------|----------------|-----|--------|
| `/blog/youre-not-lazy-signs-undiagnosed-adult-adhd` | undiagnosed adult ADHD signs | Mixed | TOFU→MOFU | 7 | Light EEAT | care, screening, pricing, meet-greet | Meet & Greet + Screening | Keep |
| `/blog/how-to-know-if-you-have-adhd-adult` | how to know if you have ADHD adult | Informational | TOFU | 4 | Expand; de-overlap C1 | care, screening, pricing | Screening / Eval | Update |
| `/blog/adhd-symptoms-overlooked` | adult ADHD signs overlooked | Informational | TOFU | 4 | Differentiate from youre-not-lazy | care, screening | Screening / Eval | Update |
| `/blog/adult-adhd-symptoms-california` | adult ADHD symptoms California | Local / mixed | Local | 3 | Rewrite AI-slop or merge | care, screening, answers | Screening / Eval | Rewrite |
| `/blog/is-online-adhd-diagnosis-legit` | is online ADHD diagnosis legit | Commercial | MOFU | 5 | Own C2 vs answers | care, screening, pricing | Screening / Eval | Update |
| `/blog/online-adhd-diagnosis-california` | online ADHD diagnosis California | Commercial / local | Local BOFU | 4 | Merge into CA diagnosis keeper | care, screening, meet-greet | Meet & Greet + Screening | Merge |
| `/blog/adhd-evaluation-california-online-vs-in-person` | ADHD evaluation CA online vs in person | Commercial / local | MOFU local | 2 | Merge into CA diagnosis | care, screening | Screening / Eval | Merge |
| `/blog/adhd-testing-online-california-screening-vs-evaluation` | ADHD testing online California | Commercial / local | MOFU | 2 | Merge → answer + CA page | care, screening | Screening / Eval | Merge |
| `/blog/adhd-telehealth-california` | ADHD telehealth California | Informational / local | MOFU | 1 | Thin — redirect | care, screening | Screening / Eval | Delete/Redirect |
| `/blog/how-to-choose-adhd-provider-california` | choose ADHD provider California | Commercial | MOFU | 2 | Merge into C2/C3 | care, screening | Screening / Eval | Merge |
| `/blog/adult-adhd-treatment-california-2026` | adult ADHD treatment California | Commercial / local | MOFU | 3 | Rewrite under Treatment pillar | care, screening | Screening / Eval | Rewrite |
| `/blog/online-adhd-diagnosis-texas` | online ADHD diagnosis Texas | Commercial / local | Local BOFU | 5 | Align to geo landing | care, screening, pricing | Screening / Eval | Update |
| `/blog/adhd-evaluation-cost-texas` | ADHD evaluation cost Texas | Commercial / local | MOFU→BOFU | 4 | Align to cost + TX geo | care, screening, pricing | Screening / Eval | Update |
| `/blog/adhd-medication-options-for-adults` | ADHD medication options adults | Informational | MOFU | 8 | Promote to Medication pillar + citations | care, screening, pricing, answers | Screening / Eval | Update |
| `/blog/adhd-medication-options-california` | ADHD medication options California | Informational / local | MOFU | 3 | Merge into national pillar | care, screening | Screening / Eval | Merge |
| `/blog/non-stimulant-adhd-medications-explained` | non-stimulant ADHD medications | Informational | MOFU | 7 | Spoke under Medication | care, screening, pricing | Screening / Eval | Keep |
| `/blog/adderall-for-adhd-how-it-works` | Adderall for ADHD | Informational | MOFU | 8 | Keep as drug spoke | care, screening, pricing | Screening / Eval | Keep |
| `/blog/vyvanse-vs-adderall-differences` | Vyvanse vs Adderall | Informational | MOFU | 8 | Keep as comparison spoke | care, screening, pricing | Screening / Eval | Keep |
| `/blog/adhd-medication-side-effects-what-to-expect` | ADHD medication side effects | Informational | MOFU | 8 | Keep; add refs | care, screening, pricing | Screening / Eval | Keep |
| `/blog/is-adhd-medication-safe-long-term` | ADHD medication safe long term | Informational | MOFU | 8 | Keep; add refs | care, screening, pricing | Screening / Eval | Keep |
| `/blog/adhd-medication-daily-or-as-needed-adults` | ADHD med every day vs PRN | Informational | MOFU | 4 | Thicken or lean on answer | care, screening | Screening / Eval | Update |
| `/blog/how-adhd-medication-is-prescribed-online` | how ADHD med prescribed online | Mixed | MOFU→BOFU | 8 | Best of C6 | care, screening, pricing | Screening / Eval | Keep |
| `/blog/adhd-medication-online-california` | ADHD medication online California | Commercial / local | MOFU | 2 | Merge into prescribing blog | care, screening | Screening / Eval | Merge |

### Non-ADHD blogs (21) — condensed

Most weight-loss, telehealth, testosterone, sleep, and ED posts score **Keep (7–10)**. Standout assets: `food-noise-and-glp-1`, `insulin-resistance-and-weight-loss`, `why-am-i-always-tired`. Thin local: `medical-weight-loss-glp1-semaglutide-texas` → Update. Several GLP-1 spokes have weaker mid-body CTAs → upgrade to Meet & Greet / pricing/service links without competing with ADHD work today.

---

## Content gap matrix (Tier 1–2 vs reality)

| Proposed topic | Status | Exists today | Next |
|----------------|--------|--------------|------|
| Adult ADHD Guide pillar | Missing | `/blog/adhd` hub only | **Create first** |
| ADHD Diagnosis pillar | Fragmented | Thin diagnosis blogs + answers | Create; merge C2/C3 |
| ADHD Treatment pillar | Missing | Thin CA treatment blog | Create before city treatment |
| ADHD Medication pillar | Partial | `adhd-medication-options-for-adults` | Upgrade existing URL |
| ADHD in Women / late diagnosis | Partial | Answers only | Blog from answers |
| ADHD vs Anxiety | Partial | `/answers/adhd-vs-anxiety` | Blog or expand answer |
| ADHD Executive Dysfunction | Partial | `/answers/executive-dysfunction-adhd` | Blog spoke |
| ADHD and Binge Eating | Missing | Mentions in WL only | Create |
| ADHD and Perimenopause | Missing | — | Create |
| Online Adult ADHD Evaluation | Service exists | `/adhd-care`, `/adult-adhd-diagnosis` | Educational blog → service |
| ADHD Treatment Los Angeles | Missing | — | After Treatment pillar |
| ADHD Treatment Austin | Partial | `/adhd-diagnosis-austin` | Treatment twin after pillar |
| ADHD Treatment Philadelphia | Partial | `/adhd-diagnosis-philadelphia` | Treatment twin after pillar |
| ADHD Treatment Miami | Missing | `/adhd-diagnosis-florida` only | After Treatment pillar |

---

## Target pillar architecture

```
/adhd-care (commercial conversion)
        ↑
Adult ADHD Guide (new educational pillar)
        ├── Diagnosis pillar → CA/TX blades + screening vs eval
        ├── Treatment pillar → city treatment (LA, Austin, Philly, Miami)
        ├── Medication pillar (upgrade options-for-adults)
        │     └── Adderall / Vyvanse vs Adderall / non-stim / side effects / safety
        └── Population & differentials
              └── Women / late dx / vs anxiety / binge eating / perimenopause / executive dysfunction
/answers/* = short FAQ spokes linking UP to pillars
```

---

## Today’s recommended sequence

1. **Consolidate C3 (CA cluster)** — merge/rewrite into 1 diagnosis + 1 treatment keeper; redirect `/blog/adhd-telehealth-california`.
2. **Publish Adult ADHD Guide pillar.**
3. **Publish Diagnosis + Treatment pillars.**
4. **Upgrade Medication pillar** on existing options URL (citations + physician review).
5. **Gap topics:** Women late diagnosis, Perimenopause, Binge eating, ADHD vs Anxiety, Executive dysfunction.
6. **City treatment pages last:** LA + Miami first; Austin/Philly as treatment twins of existing diagnosis geos.

### Do not create right now

- More CA medication / telehealth variants  
- Another “signs of ADHD” blog  
- Another Adderall/stimulant comparison (C5 already dense)

---

## EEAT & CTA checklist (sitewide ADHD)

| Gap | Fix |
|-----|-----|
| No physician-reviewed badge | Add reviewed-by block on pillars + keepers |
| Almost no references | Add short References on clinical posts |
| FAQ present but thin bodies | FAQs don’t replace depth |
| Weak “Contact us” style endings | Contextual: screening → Meet & Greet → evaluation |
| Meet & Greet often nav-only | Mid-article + final CTA where intent is commercial |

---

## Prioritized backlog (Phase 2 order)

| Priority | Item | Type |
|----------|------|------|
| P0 | CA cluster consolidate + redirects | Cleanup |
| P0 | Adult ADHD Guide pillar | New |
| P0 | Diagnosis pillar | New |
| P0 | Treatment pillar | New |
| P1 | Medication pillar upgrade | Update |
| P1 | ADHD in Women / late diagnosis | New (from answers) |
| P1 | ADHD and Perimenopause | New |
| P1 | ADHD and Binge Eating | New |
| P2 | ADHD vs Anxiety blog | New or expand answer |
| P2 | Executive Dysfunction blog | New or expand answer |
| P2 | Online Adult ADHD Evaluation (educational) | New → `/adhd-care` |
| P3 | ADHD Treatment LA / Miami | New city |
| P3 | ADHD Treatment Austin / Philly | City treatment twins |

---

*Next step when approved: execute P0 cleanup + Adult ADHD Guide draft — not more overlapping CA medication posts.*
