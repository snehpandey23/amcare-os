# Local SEO System Architecture (ADHD)

**Date:** 2026-07-16  
**Mode:** Architecture only — **do not generate pages** from this doc yet.  
**Parent:** `ADHD-KNOWLEDGE-ARCHITECTURE.md` · `LOCAL-ADHD-TREATMENT-PAGE-ENGINE.md`

---

## Hierarchy (every state)

```
State Treatment Hub          e.g. /blog/adhd-treatment-texas
  └── City Treatment         e.g. /blog/adhd-treatment-dallas-tx
        ├── City Evaluation  e.g. /adhd-diagnosis-{city} OR /blog/adhd-evaluation-{city}-{st}
        ├── City Medication  e.g. /blog/adhd-medication-{city}-{st}   [Phase later]
        ├── City Cost        e.g. /blog/adhd-evaluation-cost-{city}   [Phase later]
        └── City FAQs        /answers/* with geo only when intent is local
```

Parallel diagnosis state hub (already exists for TX/FL/PA):

```
State Diagnosis Hub          e.g. /adhd-diagnosis-texas
  └── City Diagnosis         e.g. /adhd-diagnosis-austin
```

**Intent split (non-negotiable)**
| Layer | Owns |
|-------|------|
| State Treatment Hub | `ADHD Treatment {State}` |
| City Treatment | `ADHD Treatment {City}` |
| City / State Diagnosis | `ADHD Diagnosis {City/State}` |
| City Medication | `ADHD Medication {City}` — only after treatment page lives |
| City Cost | `ADHD Evaluation Cost {City}` — only after treatment + state cost context |

---

## State status

| State | Treatment hub | City treatment | City diagnosis | Next |
|-------|:-------------:|:--------------:|:--------------:|------|
| Texas | ✅ | ✅ 5 cities | Partial (Austin/Houston + state) | Dallas diagnosis twin; med/cost later |
| Florida | ❌ | ✅ Miami, Orlando | ✅ state | **Build FL treatment hub** |
| Pennsylvania | ❌ | ✅ Philadelphia | ✅ state + Philly | **Build PA treatment hub** |
| California | ❌ | Thin CA blogs only | Thin CA blogs | **C3 cleanup first** → LA/SD |

---

## Automatic internal linking rules

### Every City Treatment page MUST link

1. Parent **State Treatment Hub**  
2. Sibling cities in-state (2–4, varied anchors)  
3. Matching **City Diagnosis** if live  
4. National: `/adhd-care` · `/blog/adhd` · one medication blog · one symptoms blog  
5. 2–3 `/answers/*` (exec dysfunction, screening vs eval, online diagnosis)  
6. CTA: Meet & Greet + Evaluation  

### Every State Treatment Hub MUST link

1. All live city treatment children  
2. State diagnosis hub  
3. `/adhd-care` · cost/process blogs  
4. National Adult ADHD / Medication keepers  

### Every City Diagnosis page MUST link

1. State diagnosis hub  
2. Matching city treatment (if live)  
3. State treatment hub  
4. `/adhd-care` · screening  

### Forbidden

- City medication/cost pages without parent treatment URL  
- Linking every city from every national blog (doorway signal)  
- Identical anchor text sitewide for the same target  

### Anchor variety pool (examples)

- “ADHD treatment in {City}”  
- “virtual ADHD care for {City} adults”  
- “{City} ADHD evaluation options”  
- “physician-led ADHD treatment across {State}”  

---

## Generation queue (when approved to build pages)

1. FL treatment hub → strengthen Miami/Orlando inbound  
2. PA treatment hub → strengthen Philadelphia  
3. TX Dallas diagnosis twin  
4. CA C3 → LA treatment → SD treatment  
5. Only then: city medication / cost twins for TX metros  

---

## Implementation note

Linking rules are enforced editorially via Content Engine + Local Treatment Page Engine.  
A future `scripts/apply-local-adhd-linking.mjs` can validate required edges in CI (not built this pass).
