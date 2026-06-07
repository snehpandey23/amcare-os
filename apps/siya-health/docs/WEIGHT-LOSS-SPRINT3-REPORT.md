# Weight Loss Page — Founder Audit Sprint 3 Report

**Scope:** Middle-page architecture between `#why-weight-complicated` and FAQ/Providers/Footer  
**Date:** June 2026

---

## 1. Journey architecture

| Order | Section | ID | Purpose |
|-------|---------|-----|---------|
| — | *(unchanged)* | `#weight-recognition` | Patient recognition |
| — | *(unchanged)* | `#why-weight-complicated` | Complexity education (Sprint 2) |
| **NEW** | How care works | `#how-care-works` | 4-step visual roadmap: Evaluation → Plan → Optimize → Maintain |
| **REWRITTEN** | Program overview | `#program-overview` | Three pillars; medication as one tool |
| **CONSOLIDATED** | Our approach in practice | `#care-approach` | Replaces `#features` + `#trust` (6+4 duplicate cards) |
| — | *(unchanged)* | `#faq` | FAQ accordion |
| — | *(unchanged)* | `#meet-physicians` | Provider section |
| — | *(unchanged)* | Footer | SEO footer |

### Removed / verified absent

| Section | Status |
|---------|--------|
| What medical weight-loss care looks like (`#glp1-journey`) | Removed in Sprint 2 |
| Food noise vs physical hunger standalone section | **Not present** — concept remains only in complexity card + cornerstone links (appropriate) |
| Protocols & Key Features (`#features`) | **Removed** — merged into `#care-approach` |
| Why Siya Health trust block (`#trust`) | **Removed** — hero trust chips + FAQ cover overlap |
| Structured monitoring grid | **Removed** — covered in Step 3 roadmap |

### Can a patient explain what happens after signing up?

**Yes.** The `#how-care-works` strip gives a scannable 4-phase path in under 15 seconds:

1. **Evaluation** — clinician reviews history, patterns, and orders labs/screening when appropriate  
2. **Plan** — personalized mix of lifestyle, behavioral, and medication options (not identical for everyone)  
3. **Optimize** — regular follow-up with adjustments for progress, side effects, and lifestyle  
4. **Maintain** — shift to long-term habits and sustainable weight management  

The disclaimer reinforces that medication is one tool, not the whole program.

---

## 2. How care works — step copy

| Step | Headline | Key points |
|------|----------|------------|
| 1 | Comprehensive Evaluation | Weight history, regain, eating, sleep, stress, mental health, meds, conditions; labs/ADHD/behavioral review when appropriate |
| 2 | Personalized Treatment Plan | Nutrition, movement, sleep, stress, behavioral support, medication when appropriate; **not everyone gets the same plan** |
| 3 | Ongoing Support & Optimization | Follow-ups; adjustments for progress, side effects, cravings, food noise, energy; visits + education |
| 4 | Maintenance & Long-Term Success | Keeping weight off; sustainable habits; medication taper when appropriate; muscle, energy, regain prevention |

**Visual design:** Horizontal roadmap strip (numbered nodes + connector line) above 4 detail cards. Desktop: 4-column cards; tablet: 2×2; mobile: 2×2 strip + stacked cards. Pattern aligned with ADHD `flow-cards--adhd-process` (step labels, left-aligned card copy).

---

## 3. Program overview rewrite

| Before (pillar) | After (pillar) |
|-----------------|----------------|
| Medical Weight Loss (GLP-1-forward, featured) | **Medication-Assisted Care** — when clinically appropriate, not a menu |
| Metabolic + Behavioral Care | **Behavioral & Mental Health Support** (featured differentiator) |
| Wellness & Coaching | **Lifestyle & Wellness Optimization** |

**Audience cards updated:** “Medication-Informed” → “Open to Clinical Options” with medication-not-default framing.

---

## 4. Consolidated differentiators (`#care-approach`)

Three cards—no repetition of hero bullets, complexity factors, or FAQ medication lists:

| Card | Unique value |
|------|--------------|
| Documentation you can use | Visit notes and care plan between appointments |
| Safety-first prescribing | Screening + follow-up; not automatic prescribing |
| Education between visits | Guides and newsletters; not prescription-only |

---

## 5. Compliance review

| Risk | Mitigation |
|------|------------|
| Outcome promises | No weight-loss guarantees; maintenance framed as focus shift, not assured results |
| Medication guarantees | “When clinically appropriate” / “when needed” throughout; Step 2 emphasizes individualized plans |
| Diagnostic language | Evaluation described as clinical review, not self-diagnosis |
| Food noise section removal | Standalone conversion section absent; term used descriptively in Step 3 optimization context only |
| Educational framing | Complexity disclaimer retained above; roadmap disclaimer on medication-as-one-tool |

---

## 6. Mobile review

| Element | Mobile behavior |
|---------|-----------------|
| Roadmap strip | 2×2 grid; connector line hidden; compact numbered nodes |
| Step cards | Single column below 768px |
| Program pillars | Existing `service-cols` stack |
| Care approach | Single column → 3-column at 768px |
| FAQ / providers | Unchanged |

Screenshots: `docs/weight-loss-sprint3-screenshots/how-care-works-mobile-390.png`, `program-overview-mobile-390.png`

---

## 7. Files modified

| File | Changes |
|------|---------|
| `weight-loss-metabolic-health.html` | Added `#how-care-works`; rewrote `#program-overview`; replaced `#features` + `#trust` with `#care-approach` |
| `styles.css` | `.how-care-works-section`, `.care-roadmap-*`, `.care-approach-*` |
| `scripts/capture-weight-loss-sprint3-screenshots.mjs` | Screenshot utility |
| `docs/WEIGHT-LOSS-SPRINT3-REPORT.md` | This report |

**Also included in commit (Sprints 1–2):** Sprint 1/2 reports, screenshot scripts, and prior screenshot assets.

**Not modified:** Hero, `#weight-recognition`, `#why-weight-complicated`, FAQ, providers, footer, meta/SEO tags.

**Note:** No dedicated pricing section exists on this page (unchanged).

---

## 8. Screenshots

`docs/weight-loss-sprint3-screenshots/`

| File | Description |
|------|-------------|
| `before-program-overview-1440.png` | Pre-Sprint 3 program overview (git HEAD) |
| `before-features-1440.png` | Pre-Sprint 3 protocols/features block |
| `how-care-works-desktop-1440.png` | New roadmap section (desktop) |
| `how-care-works-mobile-390.png` | New roadmap section (mobile) |
| `program-overview-desktop-1440.png` | Rewritten pillars (desktop) |
| `program-overview-mobile-390.png` | Rewritten pillars (mobile) |
| `care-approach-desktop-1440.png` | Consolidated differentiators |
| `after-middle-page-1440.png` | Full-page context from `#how-care-works` |

Re-capture: `npx serve -l 8877 .` → `node scripts/capture-weight-loss-sprint3-screenshots.mjs`

---

## 9. Validation

```
npm run build — PASS
```

`scripts/site-chrome.mjs` — injects learn-more and meet-physicians blocks only; does not revert middle-page content.
