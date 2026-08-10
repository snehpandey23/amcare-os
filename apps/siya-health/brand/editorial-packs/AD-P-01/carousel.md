# Instagram Carousel — AD-P-01 (v2 theme)

**Insight:** Physical signs that may appear with ADHD — and why they're not enough to diagnose  
**Audience:** Adults 25–50  
**Theme:** Visual OS v2.1 / `BRAND-STYLE-LOCK.md` — Knowledge **A-03** lean  
**Format:** 4:5 · 1080×1350  
**Tokens:** Cream `#F4EFE7` · Navy `#001878` · Magenta `#D81088` · Georgia + Arial  
**Logo:** LOGO-PRIMARY top-left · **no** ambient watermark  
**Practical change:** If these patterns are lifelong and impairing, take a validated screener / talk to a clinician — don't diagnose from fidgeting alone.  
**CTA (close only):** Talk to a Clinician  
**Voice:** Company only (no founder LinkedIn)  
**Clinical review:** Required before publish  
**Compositor:** `brand/scripts/compose_format_a_knowledge.py`  
**Ready:** `ready-to-post/` · `images/ready/`  
**Reject:** plum · hard-L · HTML/Chrome freehand finals · `GenerateImage` as branded frame

---

## Slide 1 — Cover (Template A)
**Category pill:** Adult ADHD  
**Headline:** Physical **signs** that may appear with ADHD *(magenta on “signs”)*  
**Support:** — and why they're not enough to diagnose.  
**Feeling badge:** Common isn’t conclusive  
**Visual:** Lifestyle portrait (right)  
**Footer bar:** Care. Compassion. Connection. · (215) 445-1244 · www.siya.health · educational note

---

## Slide 2 — What people notice (A-03 lean · composed)
**Headline:** The **body** shows first.  
**Recognition:** Leg bounce. Restless sleep. Lived patterns — not a diagnosis.  
**Photo:** `images/bases/ad-p01-base-fidget.png` (right-weighted)  
**Compose:**
```bash
python3 apps/siya-health/brand/scripts/compose_format_a_knowledge.py \
  --photo apps/siya-health/brand/editorial-packs/AD-P-01/images/bases/ad-p01-base-fidget.png \
  --logo apps/siya-health/assets/images/siya-health-logo-registered.png \
  --out apps/siya-health/brand/editorial-packs/AD-P-01/ready-to-post/slide-02-ready.png \
  --headline "The body
shows first." \
  --accent "body" \
  --recognition "Leg bounce. Restless sleep.
Lived patterns — not a diagnosis."
```
**Caption teaching (not on-frame):** nail biting · pacing · can’t sit through a movie · overlap with anxiety/sleep/habit

---

## Slide 3 — Adult hyperactivity
**Eyebrow:** Adult presentation  
**Headline:** Adult “hyperactivity” is often quiet.  
**Support:** Inner restlessness. Fidgeting that helps focus. Muscle strain from “sitting still.”

---

## Slide 4 — Myth break
**Eyebrow:** Myth break  
**Headline:** Fidgeting ≠ a diagnosis.  
**Support:** Same movements show up with anxiety, boredom, caffeine, sleep problems, and habit.

---

## Slide 5 — Inattentive / masking
**Eyebrow:** Inattentive & masking  
**Headline:** You can have ADHD without looking hyper.  
**Support:** Inattentive ADHD may show little overt movement. Sitting calmly in an appointment does not rule it out.

---

## Slide 6 — Practical change
**Eyebrow:** Practical step  
**Headline:** Common isn't conclusive.  
**Support:** If the pattern is lifelong and getting in the way — take a validated screener, then talk to a clinician. Don't diagnose from a fidget list.

---

## Slide 7 — Close
**Eyebrow:** Next step  
**Headline:** Start with pattern + impairment.  
**Support:** A fidget list isn't a diagnosis. Look at lifelong pattern and how it shows up across work, home, and relationships — with a clinician.  
**CTA:** Talk to a Clinician  
**Contact:** siya.health/adhd-screening · (215) 445-1244 · www.siya.health

---

## Claim ladder
Safe: body expressions as possible hyperactivity/restlessness; adult subtlety; masking; overlap with anxiety/sleep/habit; screener + clinician; educational only.  
Avoid: physical sign = ADHD; RLS/hypermobility are ADHD; self-diagnosis CTAs; founder LinkedIn; guaranteed outcomes.
