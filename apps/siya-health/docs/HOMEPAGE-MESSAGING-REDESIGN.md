# Homepage Messaging Redesign — Symptom-Centric Wireframe & Implementation Spec

**Scope:** `index.html` copy and section messaging only.  
**Do not change:** URLs, nav, booking/GHL flows, legal text, provider data, service geography, compliance positioning.  
**Date:** June 2026

---

## Strategic shift

| From (current) | To (proposed) |
|----------------|---------------|
| "We offer these services" | "We help you understand why you don't feel like yourself" |
| Service cards first (ADHD clinic, weight loss clinic) | Symptom recognition first → care pathways second |
| Hero: "Modern Physician-Guided Virtual Care" | Hero: patient symptom mirror + physician-led clarity |

**ADHD remains primary acquisition channel** via symptom tiles, care pathways, and footer/secondary CTAs — not hero headline focus.

---

## Complete homepage wireframe (section order)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (unchanged nav + Book a Meet & Greet)                │
├─────────────────────────────────────────────────────────────┤
│ 1. HERO — Symptom recognition + physician-led promise       │
├─────────────────────────────────────────────────────────────┤
│ 2. SYMPTOM ENTRY GRID — "Does this sound like you?"         │
├─────────────────────────────────────────────────────────────┤
│ 3. WHY PATIENTS COME — Emotional + clinical bridge          │
├─────────────────────────────────────────────────────────────┤
│ 4. HOW WE HELP — 3-step clarity (not service list)          │
├─────────────────────────────────────────────────────────────┤
│ 5. CARE PATHWAYS — Symptom → evaluation routes              │
├─────────────────────────────────────────────────────────────┤
│ 6. PROVIDER TRUST — Physician-led, multi-state              │
├─────────────────────────────────────────────────────────────┤
│ 7. SOCIAL PROOF — Symptom-tagged testimonials             │
├─────────────────────────────────────────────────────────────┤
│ 8. MEMBERSHIP / FUTURE CARE — DPC + insurance-ready line    │
├─────────────────────────────────────────────────────────────┤
│ 9. FAQ — Symptom + process (not medication guarantees)      │
├─────────────────────────────────────────────────────────────┤
│ 10. FINAL CTA — Low-pressure entry                          │
├─────────────────────────────────────────────────────────────┤
│ FOOTER (unchanged legal/compliance injection)               │
└─────────────────────────────────────────────────────────────┘
```

**Remove or demote:** Current `#services` "Our Services" 6-card grid as primary above-fold content. Repurpose cards into Section 5 pathways or move below fold.

**Retain but reorder:** `#how-it-works` → becomes Section 4. `#care-team` → Section 6. `#reviews` → Section 7.

---

## Section 1 — Hero

### Purpose
Immediate self-recognition for adults who feel "off" but cannot name a single diagnosis.

### Conversion objective
Primary: scroll to symptom grid or Book Meet & Greet. Secondary: start free ADHD screening (existing URL, not hero headline).

### Copy recommendations

| Element | Current | Proposed |
|---------|---------|----------|
| **H1** | Modern Physician-Guided Virtual Care | **Something feels off—and you're tired of guessing why.** |
| **Subhead** | Modern physician-guided virtual care for energy, weight, hormones, focus, sleep… | **Board-certified clinicians help adults in California, Texas, Pennsylvania, and Florida understand fatigue, focus, weight, hormones, and burnout—with structured evaluation, not quick labels.** |
| **Primary CTA** | Book a Meet & Greet | **Talk to a clinician** (same GHL URL) |
| **Secondary CTA** | Explore Care Options | **Find what might fit you** (anchor `#symptoms`) |
| **Tertiary link** | View prices | Keep → `/membership-pricing` |

**Trust bar (revise claims):**

- Replace "10,000+ Patients Evaluated" → **"1,000+ adults evaluated"** (align sitewide) OR **"Board-certified clinicians"** if 10k unverified
- Keep: Same-week appointments · Transparent pricing · HIPAA-compliant

### UX recommendations
- Hero background: calmer, less "clinic lobby" — patient at laptop, tired but hopeful
- Add subtle symptom chips under subhead (non-clickable): *Focus · Energy · Weight · Sleep · Motivation*
- Mobile: H1 max 3 lines; CTAs stacked full-width

### Meta (homepage only)

- **Title:** `Siya Health | When Focus, Energy, or Weight Won't Budge`
- **Description:** `Physician-led telehealth for adults who feel tired, unfocused, or stuck—structured evaluation for fatigue, ADHD symptoms, weight, and hormones in CA, TX, PA, and FL.`

---

## Section 2 — Symptom entry grid

### Purpose
Let visitors self-select by feeling, not service name.

### Conversion objective
Click symptom tile → relevant Health Guide or care pathway (internal links only; no new URLs).

### Copy recommendations

**Section label:** `Start here`  
**H2:** **Which of these feels most true right now?**  
**Lead:** *You don't need a diagnosis to start a conversation. Pick what resonates—we'll show you sensible next steps.*

| Tile | Headline | One-line | Link (existing) |
|------|----------|----------|-----------------|
| 1 | **I can't focus—even when I care** | Procrastination, overwhelm, missed details | `/answers/signs-of-adult-adhd` or `/adhd-screening` |
| 2 | **I'm exhausted no matter how much I sleep** | Fatigue that rest doesn't fix | `/answers/why-am-i-tired-even-after-sleeping` |
| 3 | **I'm burned out, not lazy** | High effort, low return; emotional flooding | `/answers/adhd-vs-burnout` |
| 4 | **My weight won't move—and my appetite won't quiet** | Food noise, insulin resistance, GLP-1 questions | `/answers/what-is-food-noise` |
| 5 | **My energy and motivation disappeared** | Low drive, brain fog, afternoon crashes | `/answers/afternoon-energy-crash-after-lunch` |
| 6 | **Hormones might be part of the story** | Low T symptoms, libido, metabolic overlap | `/answers/what-does-low-testosterone-feel-like` |

**Compliance note on tile 1:** Label "possible ADHD symptoms" not "ADHD diagnosis." CTA on tile: **Free screening** → `/adhd-screening` (secondary link on tile).

### UX recommendations
- 2×3 grid desktop; swipeable horizontal scroll mobile
- Each tile: icon + headline + 1 sentence + text link "Learn more" + optional small "Book a conversation" (GHL)
- Use `aria-label` per tile for accessibility
- No guarantee language on tiles

---

## Section 3 — Why patients come to Siya

### Purpose
Emotional validation + medical credibility bridge (replaces generic "Why Siya exists" if present).

### Conversion objective
Build trust before service mention; reduce bounce from skeptics.

### Copy recommendations

**H2:** **You're not failing. Your symptoms deserve a real workup.**

**Body (3 short paragraphs):**

1. *Many adults arrive after years of being told to "try harder." Fatigue, focus problems, weight changes, and hormone shifts often overlap—and primary care waiting rooms rarely have time to connect the dots.*

2. *Siya Health is **physician-led telehealth**: licensed clinicians take structured histories, use validated tools when appropriate, and explain what they see before recommending treatment. **Screening is not diagnosis. Evaluation does not guarantee medication.***

3. *We serve adults in **California, Texas, Pennsylvania, and Florida** through Siya Healthcare, PLLC clinicians. Siya Health Inc. handles scheduling and administrative support—you get clinical care from licensed providers.*

### UX recommendations
- Tinted background section (`section-tinted`)
- Optional pull-quote: *"I finally stopped feeling lazy."* — verified patient tag
- No stock "wellness journey" imagery

---

## Section 4 — How we help (reframe existing "How Care Works")

### Purpose
Process clarity without sounding like a SaaS onboarding funnel.

### Conversion objective
Demystify first visit; reduce fear of being sold medication.

### Copy recommendations

**H2:** **How getting clarity works**

| Step | Title | Copy |
|------|-------|------|
| 1 | **Tell us what's going on** | Meet & Greet or free ADHD screening—low pressure, no commitment to treatment. |
| 2 | **Structured clinical evaluation** | History, validated assessments **as clinically appropriate**, records review when available. |
| 3 | **A plan you can understand** | Next steps explained in plain language—medication only when clinically appropriate, never guaranteed. |

**Microcopy below steps:** *Controlled substances are not prescribed during the initial evaluation visit.*

### UX recommendations
- Keep existing 3-card flow UI; swap copy only
- Add link: `/legal/controlled-substance-treatment-agreement` as small text link "Controlled substance policies"

---

## Section 5 — Care pathways (replaces "Our Services" framing)

### Purpose
Map symptoms to care routes without "clinic" branding.

### Conversion objective
Route to cornerstone pages; ADHD path prominent but equal visual weight to metabolic/fatigue.

### Copy recommendations

**H2:** **Care pathways—where patients often start**

**Lead:** *These are common starting points, not labels. Your clinician determines what's appropriate after evaluation.*

| Pathway | Headline | Copy | Primary link | Secondary |
|---------|----------|------|--------------|-----------|
| Focus & attention | **When focus won't hold** | Adult ADHD evaluation; screening → structured visit | `/adhd-care` | `/adhd-screening` |
| Weight & metabolism | **When weight and appetite fight you** | GLP-1, insulin resistance, medical weight loss | `/weight-loss-metabolic-health` | `/answers/what-is-insulin-resistance` |
| Energy & fatigue | **When you're tired past explanation** | Sleep, metabolic, and overlap evaluation | `/answers/why-am-i-tired-even-after-sleeping` | `/telehealth` |
| Men's health | **When hormones may be involved** | Testosterone evaluation within evidence-based guardrails | `/mens-health-longevity` | `/answers/trt-monitoring-requirements` |
| Ongoing primary care | **When you want a medical home** | Telehealth primary care; membership options | `/telehealth` | `/membership-pricing` |

**ADHD acquisition note:** First pathway in grid (top-left) but headline is symptom-based, not "ADHD Care."

### UX recommendations
- Horizontal cards with symptom icon left, pathway right
- Badge on ADHD pathway only: `Most requested` (factual if analytics support)
- Demote old 6-icon service grid or remove duplicate

---

## Section 6 — Provider trust

### Purpose
Physician-led credibility; human faces before booking.

### Conversion objective
`/providers` profile views; Meet & Greet with named clinician trust.

### Copy recommendations

**H2:** **Meet the clinicians behind your evaluation**  
**Lead:** **Seven board-certified and advanced-practice clinicians** across ADHD, metabolic health, primary care, and men's health—each profile shows licenses, scope, and state availability.

Keep existing care team grid; **revise taglines to symptom-oriented:**

| Provider | Current tagline direction | Proposed one-liner |
|----------|-------------------------|-------------------|
| Dr. Sneh Pandey | ADHD & metabolic | *Focus, weight, and metabolic overlap* |
| Dr. Natasha Desai | ADHD & behavioral | *ADHD with anxiety and emotional regulation* |
| Dr. Swati Pandey | ADHD & behavioral health | *Complex ADHD and medication histories* |
| Dr. Vanessa Urbina | Family medicine & ADHD | *Primary care and lifestyle-forward visits* |
| Megan Wunderlich | ADHD & mental health | *NP-led ADHD support (Pennsylvania)* |
| Derek Timbs | Weight & men's health | *Weight loss and men's metabolic care (Texas)* |
| Wendy Delgado | Weight loss | *GLP-1 education and support (California)* |

**Entity line (small):** *Medical services by Siya Healthcare, PLLC. Provider licenses displayed for transparency.*

### UX recommendations
- Link every card to profile (unchanged)
- Show `photoStatus` placeholders as-is until headshots approved
- CTA below grid: **View full care team** → `/providers`

---

## Section 7 — Social proof

### Purpose
Reduce anxiety; mirror symptom diversity.

### Conversion objective
Meet & Greet booking after emotional resonance.

### Copy recommendations

**H2:** **What patients say after they feel heard**  
**Lead:** *Verified feedback from telehealth visits—experiences vary; outcomes are not guaranteed.*

**Testimonial tagging (add symptom tags to existing cards):**

| Tag examples | Use on cards |
|--------------|--------------|
| Focus & clarity | Cards mentioning ADHD, listening, plan |
| Weight & energy | Metabolic/weight mentions |
| Compassionate care | Anxiety, comfort |

**Revise testimonial CTA:**

- *Start with a conversation—not a commitment.*  
- Button: **Book a Meet & Greet**

**Compliance:** Keep "Verified Patient"; remove "results" if implying guaranteed outcomes → use **"experiences"**

### UX recommendations
- Max 3 testimonials above fold on mobile; carousel for rest
- Keep HelloKlarity link if reviews verified there

---

## Section 8 — Membership & future care

### Purpose
Seed membership primary care + future insurance without overpromising.

### Conversion objective
`/membership-pricing` visits; waitlist/email capture if membership not live.

### Copy recommendations

**H2:** **More than a single visit**  
**Lead:** *Many patients start with one evaluation—then choose ongoing membership for follow-ups, medication monitoring, and primary-style telehealth.*

**Bullets:**
- Transparent cash pricing today
- Membership for ongoing ADHD and metabolic care
- **Insurance-based options in development**—join waitlist on pricing page

**CTA:** **See pricing & membership** → `/membership-pricing`

### UX recommendations
- Compact band; don't compete with hero CTA
- No "cancel anytime" unless enforced in ops

---

## Section 9 — FAQ

### Purpose
Handle objections; reinforce compliance.

### Conversion objective
Reduce support burden; push to Meet & Greet or screening.

### Recommended FAQ items

| Question | Answer direction |
|----------|------------------|
| Do I need a diagnosis to book? | No—start with Meet & Greet or screening |
| Is this a psychiatry practice? | No—primary care–led evaluation by internists, family medicine, NPs, PAs |
| Will I get medication on the first visit? | Not guaranteed; CS not at initial eval |
| What states do you serve? | CA, TX, PA, FL only |
| How is ADHD evaluation different from online quizzes? | Screening ≠ diagnosis; clinician-led |
| Do you take insurance? | Cash-transparent today; insurance expansion noted |
| What does $199 ADHD evaluation include? | Link `/adhd-evaluation-cost` |

### UX recommendations
- Accordion pattern (existing site FAQ styles)
- Schema `FAQPage` JSON-LD for 4–6 questions max

---

## Section 10 — Final CTA

### Purpose
Last conversion point for scrollers.

### Copy recommendations

**H2:** **You don't have to figure this out alone**  
**Subhead:** *A licensed clinician can help you sort symptoms, rule out overlap, and plan next steps—when clinically appropriate.*

**Primary:** Book a Meet & Greet (GHL)  
**Secondary:** Start free ADHD screening → `/adhd-screening`  
**Microcopy:** *For emergencies, call 911.*

---

## CTA hierarchy (sitewide homepage)

| Priority | CTA | Placement |
|----------|-----|-----------|
| 1 | Book a Meet & Greet | Hero, testimonial block, final CTA, nav |
| 2 | Find what might fit you | Hero secondary → `#symptoms` |
| 3 | Free ADHD screening | Symptom tile 1, final CTA secondary |
| 4 | See pricing | Hero tertiary, membership band |

---

## Implementation roadmap

### Quick wins (1 day)

| Task | File | Effort |
|------|------|--------|
| Swap hero H1, subhead, trust bar | `index.html` | 1 hr |
| Update meta title/description | `index.html` | 30 min |
| Reframe "How Care Works" copy (Section 4) | `index.html` | 1 hr |
| Add CS microcopy under steps | `index.html` | 15 min |
| Revise testimonial section header + CTA | `index.html` | 30 min |
| Add "Why patients come" section after hero | `index.html` | 2 hr |
| Reorder sections per wireframe (move services below pathways) | `index.html` | 1 hr |

**Day 1 exit criteria:** Hero + Section 3–4 live; no new URLs; `npm run build` pass.

### Medium projects (1 week)

| Task | Effort |
|------|--------|
| Build symptom entry grid (Section 2) with 6 tiles + internal links | 1–2 days |
| Replace "Our Services" with Care Pathways cards (Section 5) | 1 day |
| Provider tagline copy updates on homepage grid only | 2 hr |
| FAQ accordion + FAQPage schema | 1 day |
| Membership/future care band (Section 8) | 4 hr |
| CSS: symptom grid, pathway cards, mobile scroll | 1–2 days |
| QA: compliance scan (no guarantee/stimulant/psychiatry language) | 4 hr |

**Week 1 exit criteria:** Full wireframe implemented on `index.html`; validators pass; mobile QA.

### High-impact strategic projects (30–90 days)

| Initiative | Timeline | Impact |
|------------|----------|--------|
| Symptom-based landing A/B tests (hero variants) | 30 days | Conversion rate |
| Personalized symptom quiz (routes to pathways, no PHI) | 45 days | Engagement + GHL quality |
| Insurance waitlist + CRM integration | 60 days | Future revenue |
| Membership onboarding copy sync with Vanessa DPC | 60 days | LTV |
| California symptom SEO cluster linking to homepage tiles | 90 days | Organic acquisition |
| Video testimonials tagged by symptom | 90 days | Trust |
| Homepage partial personalization by UTM (adhd vs weight) | 90 days | Paid media efficiency |

---

## Compliance checklist (pre-publish)

- [ ] No "guaranteed diagnosis/medication/stimulants"
- [ ] No psychiatry/psychology practice positioning
- [ ] Screening ≠ diagnosis on ADHD pathway
- [ ] Service states CA/TX/PA/FL only
- [ ] Entity statement unchanged in footer/legal
- [ ] GHL links still gated by `ghl-legal-acceptance.js`
- [ ] Patient count claims verified or softened
- [ ] Testimonials marked verified; no outcome guarantees

---

## Developer handoff notes

- **Single file primary edit:** `apps/siya-health/index.html`
- **Styles:** extend `styles.css` — classes `.symptom-grid`, `.pathway-card`, `.symptom-tile`
- **Do not edit:** `scripts/site-chrome.mjs` nav/footer injection unless adding homepage-only FAQ schema via `seo-build.mjs`
- **Build:** `npm run build` must remain last step after any generator runs
- **Reference positioning:** `data/site-standards.mjs` → `ADHD_POSITIONING`

---

*End of homepage messaging redesign spec.*
