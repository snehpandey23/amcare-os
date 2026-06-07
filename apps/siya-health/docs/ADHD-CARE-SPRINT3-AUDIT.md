# ADHD Care Page — Founder Audit Sprint 3

**Scope:** Second half of page (`#pricing` through final CTA)  
**Date:** June 2026  
**Verdict:** The page currently reads closer to **(2) a telehealth pricing and medication page** than **(1) a physician-led ADHD care program** — especially from pricing downward.

---

## Executive summary

Sprint 1–2 successfully reframed the evaluation journey for patients. Sprint 3 sections undo some of that progress: pricing leads with three tiers (two are medication subscriptions), comparison copy is competitor-adjacent, trust stats are stale, FAQ CTA is weak, Learn More leaks non-ADHD topics, providers are incomplete, and the final screening link drops the deep-link param.

The hero + first half say *“thorough physician-led evaluation.”* The second half says *“pick your medication plan.”*

---

## P0 — Must-fix

| # | Issue | Trust | Conversion | Compliance | Effort |
|---|-------|-------|------------|------------|--------|
| 1 | **Pricing CTA says “Book a Meet & Greet”** while hero/final CTA say “Book ADHD Evaluation” — wrong intent, wrong funnel step | High ↓ | High ↓ | Low | **S** — one line |
| 2 | **Stale trust stats:** `#why-choose` still says “1,000+ Adults” / “1,000+ Adults Evaluated” while hero trust band shows 1,500+ / 750+ evals / 450+ reviews | High ↓ | Medium ↓ | Medium (consistency) | **S** — sync copy to hero metrics |
| 3 | **Evaluation vs ongoing care not differentiated in pricing hierarchy:** “Most Popular” badge on $79/mo non-stimulant plan signals medication subscription is the default product, not the $199 evaluation | Medium ↓ | High ↓ | Low | **M** — re-badge evaluation, add “Start here” framing, separate eval from membership visually |
| 4 | **Final CTA screening link is `/adhd-screening` (no param)** — sends patients to multi-service chooser after ADHD-focused page | Low | Medium ↓ | Low | **S** — use `?adhd=1` or `?start=asrs` |
| 5 | **FAQ “Still have questions?” CTA** links to `#book-telehealth` (generic clinician) — not screening or ADHD booking | Medium ↓ | High ↓ | Low | **S** — dual CTA: Book ADHD Evaluation + Free ADHD Screening |

---

## P1 — High-impact improvements

| # | Issue | Trust | Conversion | Compliance | Effort |
|---|-------|-------|------------|------------|--------|
| 6 | **Comparison section tone:** “See the difference. Get answers faster.” + emoji cards feel marketing-heavy vs physician-led; “Limited ADHD expertise / Generalists, not specialists” on traditional side is broad and potentially unfair | Medium ↓ | Medium | Medium (defensibility) | **M** — soften claims, cite patient experience not competitor insults |
| 7 | **Pricing card tool dump:** Initial Evaluation bullet lists ASRS, DIVA, Wender Utah, SWAN, Creyos — contradicts Sprint 2 patient language | Medium | Medium ↓ | Low | **S** — generic “validated tools as clinically appropriate” (keep detail in FAQ if needed) |
| 8 | **Trust section messaging mix:** Leads with volume + ADHD-CCSP + pill counts/drug screening in same grid — reads compliance-first not care-first | Medium ↓ | Medium ↓ | OK | **M** — reorder cards: physician-led → evaluations completed → reviews → HIPAA; move controlled-substance protocols lower or to FAQ |
| 9 | **Emphasize physician-led over credential acronym:** “ADHD-CCSP Specialists” helps SEO-savvy users; first-time patients respond better to “Board-certified physicians who specialize in adult ADHD” + optional CCSP subline | Medium ↑ | Medium ↑ | Low | **S** |
| 10 | **Learn More funnel leaks:** Fatigue guide + sleep apnea/metabolic article are off-topic for ADHD conversion page | Low | Medium ↓ | Low | **S** — remove or move to footer/guides; keep ADHD-only cluster |
| 11 | **Provider section incomplete:** Missing Vanessa Urbina, Wendy Delgado, Derek Timbs; only 4 of 7+ ADHD-capable clinicians | High ↓ | Medium ↓ | Low | **M** — expand grid or state-filtered subset |
| 12 | **No Medical Director message:** Founder note from Dr. Sneh Pandey on stigma, missed diagnosis, evaluation-before-medication would bridge trust gap between process section and pricing | High ↑ | High ↑ | Low | **M** — 120–180 word block + photo, above providers or between trust and FAQ |
| 13 | **FAQ answer density:** $199 FAQ repeats full tool acronym list; medication FAQ is strong — add 1–2 patient questions (“Do I need a referral?”, “What if I was diagnosed as a child?”) | Medium ↑ | Medium ↑ | Low | **M** |
| 14 | **No testimonials in second half:** Only hero inline quote; social proof drops off before pricing — consider 2–3 ADHD-specific quotes before or after trust section | High ↑ | High ↑ | Low (if verified) | **M** |

---

## P2 — Future opportunities

| # | Opportunity | Impact | Effort |
|---|-------------|--------|--------|
| 15 | Insurance transparency FAQ (“Why cash pay?”) with honest tradeoffs | Trust ↑, reduces bounce from price shock | M |
| 16 | State-specific provider filtering on page (CA/TX/PA/FL chips) | Conversion ↑ for out-of-state anxiety | L |
| 17 | “What happens after booking” micro-timeline under pricing CTA | Reduces booking anxiety | S |
| 18 | Link HelloKlarity / third-party reviews near trust stats (homepage pattern) | Trust ↑ | S |
| 19 | Structured FAQ schema for rich results | SEO | S |
| 20 | A/B: evaluation-only pricing band vs three-column for returning patients | Data | L |

---

## Section-by-section audit

### Simple, Transparent ADHD Care (`#pricing`)

**Strengths:** $199 one-time evaluation is clear; FSA/HSA note helps; stimulant tier documents monitoring expectations (compliance-positive).

**Issues:**
- Three-column grid with “Most Popular” on ongoing care positions the page as subscription telehealth.
- Initial evaluation buried as left column without visual “start here” emphasis.
- CTA mismatch: “Meet & Greet” ≠ “ADHD Evaluation.”
- First bullet after Sprint 2 still names five assessment tools — cognitive overload returns.

**Recommendation:** Single hero pricing card for $199 evaluation + secondary row for optional ongoing plans labeled “After your evaluation.” Primary button: Book ADHD Evaluation.

---

### Why Not Insurance / Traditional Clinic? (`#why-not-traditional`)

**Strengths:** Addresses real patient pain (waitlists, short visits); Siya column mirrors hero promises.

**Issues:**
- “Generalists, not specialists” — unverifiable, adversarial; physicians/regulators may flag as comparative advertising.
- Emoji icons reduce clinical gravitas.
- “Same-week” and “3–6 month waitlists” — ensure supportable; add “often” if needed.
- Doesn’t explain *why* cash-pay can still be worth it for ADHD specifically.

**Recommendation:** Reframe as “What many patients experience elsewhere” vs named attack; add one line on transparent pricing as patient choice, not insurance bashing.

---

### Why Adults Trust Siya Health (`#why-choose`)

**Strengths:** HIPAA, transparent pricing, comorbidity screening show clinical seriousness.

**Issues:**
- **Stats wrong:** 1,000+ vs 1,500+ / 750+ / 450+ elsewhere on same page.
- Missing review count and evaluation count in this section entirely.
- “Medication Safety / pill counts” prominent — reads stimulant clinic to anxious first-timers.
- “Validated Tools & Comorbidity Screening” repeats jargon Sprint 2 removed.

**Recommendation:** Sync stats; lead with physician-led adult ADHD experience; add 4.7★ / 450+ reviews; demote controlled-substance protocols.

**ADHD-CCSP vs physician-led:** Use **physician-led primary** in headline/subhead; CCSP as supporting credential on provider cards or one trust bullet, not the lead message.

---

### FAQ (`#faq`)

**Strengths:** Diagnosis ≠ guaranteed medication; safety protocols; evaluation scope questions present.

**Issues:**
- Weak terminal CTA: “Talk to a clinician when you're ready →” → `#book-telehealth` is vague.
- No button-style primary action.
- Tool acronyms in $199 answer.
- Missing common first-visit questions (referral, records, prior diagnosis, telehealth legitimacy).

**FAQ CTA alternatives (recommended):**

```
Still deciding?
[Book ADHD Evaluation]  [Free ADHD Screening]
Most patients start with screening or book directly — no obligation.
```

Optional tertiary: `(215) 445-1244` for humans who need reassurance.

---

### Learn More About ADHD (`#learn-more-adhd`)

**Keep:** `/answers/signs-of-adult-adhd`, `/blog/adhd`, state guides (CA/TX), `/adhd-evaluation-cost`, `/creyos-adhd-testing` (optional — tool name OK in educational footer).

**Remove from this page (funnel leak):**
- `/blog/why-am-i-always-tired-causes-when-to-see-doctor`
- `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign`
- `/answers/why-am-i-tired-even-after-sleeping`

These belong on fatigue/metabolic hubs, not ADHD conversion path.

---

### Provider Section (`#meet-physicians`)

**Strengths:** Named MDs with ADHD taglines; profile links; states shown.

**Issues:**
- Only 4 providers; index lists Vanessa, Wendy, Derek, others.
- Dr. Sneh tagline includes “metabolic care” — dilutes ADHD focus on this page.
- No founder/medical director narrative.
- No ADHD-CCSP or evaluation philosophy per provider.

**Medical Director message — recommend YES:** Short block from Dr. Sneh covering stigma, late diagnosis, thorough evaluation before medication, long-term relationship — would materially improve trust before pricing and humanize the program. Place between `#why-choose` and `#faq` or above `#meet-physicians`.

---

### Final CTA

**Strengths:** ADHD-focused headline; Book ADHD Evaluation primary; no weight loss in band.

**Issues:**
- Screening link lacks deep-link param.
- Subcopy “No insurance hassle” repeats comparison section — OK but could add “physician-led evaluation.”

**Recommendation:** Only two actions — Book ADHD Evaluation + Free ADHD Screening (`?adhd=1`). No cross-service links in band (footer unchanged per scope).

---

## Top 10 reasons a patient would **book** from this page

1. Same-week access vs long waitlists (hero + comparison).
2. Clear $199 transparent evaluation price.
3. Licensed medical providers / board-certified team.
4. Thorough 60–90 minute evaluation promise.
5. Free screening lowers commitment barrier.
6. Operates in their state (CA, TX, PA, FL).
7. Adult ADHD specialization / ADHD-CCSP credentials.
8. No insurance required — simple cash path.
9. Whole-person treatment framing (Sprint 2) — not pill-first.
10. HIPAA + LegitScript trust signals (footer/hero context).

---

## Top 10 reasons a patient would **leave without booking**

1. Pricing section feels like medication subscription service — evaluation not obvious next step.
2. “Book a Meet & Greet” under pricing contradicts “Book ADHD Evaluation” — confusion on what they’re booking.
3. Stimulant tier ($150/mo, pill counts) triggers “pill mill” anxiety for first-timers.
4. Stale 1,000+ stats undermine credibility vs 1,500+ above fold.
5. Comparison section feels salesy / unfair — skepticism from healthcare-literate users.
6. FAQ ends without strong CTA — momentum dies.
7. Learn More links to fatigue/sleep content — “this isn’t really an ADHD clinic.”
8. Incomplete provider roster — “is anyone available in my state?”
9. No testimonials or review link in second half — social proof gap.
10. Screening link in final CTA hits multi-service chooser — friction and distraction.

---

## Compliance notes

- Keep medication-not-guaranteed language (FAQ + Sprint 2 step 3) — do not soften.
- Comparison claims should be supportable or qualified (“many patients report…”).
- Controlled-substance monitoring belongs on page but not as primary trust message.
- Tool names acceptable in pricing/FAQ for transparency; keep process sections patient-plain per Sprint 2.

---

## Recommended Sprint 3 implementation order

1. P0 stats sync + pricing CTA fix + final screening deep-link + FAQ dual CTA  
2. P1 pricing hierarchy reframe + Learn More cleanup + provider expansion + Dr. Sneh message  
3. P1 comparison soften + trust card reorder  
4. P2 testimonials band + insurance FAQ
