# Weight Loss Page — Founder Audit Sprint 2 Report

**Scope:** Section after hero recognition (`#why-weight-complicated`) — replaced former `#glp1-journey`  
**Date:** June 2026

---

## 1. Before / after

| Element | Before | After |
|---------|--------|-------|
| H2 | What medical weight-loss care looks like | **Why weight management can be more complicated than calories** |
| Lead | Structured pathway… medication not guaranteed | **For many adults, more than one factor is in play** |
| Content | GLP-1 journey timeline + food-noise diagram | **6 educational factor cards** (plain English) |
| Framing | Medication-first care pathway | Patient recognition + complexity (Siya differentiation) |
| Close | Diagram captions | **Transition paragraph** + clinician evaluation disclaimer |

---

## 2. Headline options considered

| Option | Use |
|--------|-----|
| Why weight management can be more complicated than calories | **Implemented (H2)** |
| Why weight feels harder than it should | Alternate A/B candidate |
| There is often more than one reason | Subhead variant |
| Weight gain is rarely just about willpower | Empathy variant |

---

## 3. Card copy (implemented)

| Card | Plain-language focus |
|------|------------------------|
| **Sleep & recovery** | Fatigue → hunger, less movement; not a willpower failure |
| **Stress & emotional eating** | Coping-driven eating vs physical hunger |
| **Food noise & cravings** | Persistent food thoughts without physical hunger |
| **ADHD & impulsive eating** | Planning, impulse, routine—not just “focus at work” |
| **Insulin resistance & metabolism** | Body pattern varies; understanding > self-blame |
| **Hormones, medications & medical conditions** | Thyroid, hormones, meds—medical vs controllable factors |

**Transition:** “Our goal is to understand which factors may be affecting you… not a one-size-fits-all plan.” + educational-only disclaimer.

---

## 4. Visual layout

| Choice | Rationale |
|--------|-----------|
| **2×3 grid** (`evaluation-model-grid`) | Matches ADHD evaluation model—equal cards, scannable, educational |
| Icons per card | Visual anchors without clinical imagery |
| White section (not tinted) | Alternates with tinted recognition section above |
| Centered transition paragraph | Clear handoff to Program Overview below |
| Hover on cards | Consistent with site evaluation-model pattern |

**Mobile:** Single column → 2 columns at 640px → maintains readability; transition paragraph full-width centered.

---

## 5. Compliance review

| Risk | Mitigation |
|------|------------|
| Diagnosis claims | Cards describe common experiences, not “you have X” |
| Treatment promises | No outcomes, no medication access language |
| Medical advice | Closing line: “only a licensed clinician can evaluate your individual health” |
| ADHD overlap | Describes behavioral patterns, not diagnostic criteria |
| Food noise | Lay description; no GLP-1 linkage in this section |

---

## 6. Files modified

| File | Changes |
|------|---------|
| `weight-loss-metabolic-health.html` | Replaced GLP-1 journey section |
| `styles.css` | `.weight-complexity-section`, transition paragraph |
| `scripts/capture-weight-loss-sprint2-screenshots.mjs` | Screenshots |

**Not modified:** Hero, recognition block, program overview, pricing, FAQ, providers, footer.

---

## 7. Screenshots

`docs/weight-loss-sprint2-screenshots/`

- `complexity-desktop-1440.png`
- `complexity-mobile-390.png`

Re-capture: `npx serve -l 8877 .` → `node scripts/capture-weight-loss-sprint2-screenshots.mjs`

---

## 8. Validation

```
npm run build — PASS
```

---

## 9. Sprint 3 note

Program Overview still contains GLP-1-forward copy (“Medication-Informed” card)—natural next sprint to align lower page with this framing. GLP-1 journey diagram removed from page but remains in `/assets/diagrams/` for guides or future care-path section.
