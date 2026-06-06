# Homepage Founder Audit — Strategic Implementation Plan

**Status:** Strategy only — no implementation authorized  
**Date:** June 6, 2026  
**Scope:** `index.html` homepage + directly linked flows (`/adhd-screening`, footer, sitewide patterns)  
**Context:** Builds on recent CTA cleanup (`fix(siya-health): simplify CTA hierarchy…`) — recommendations must not regress screening routing or provider profile-first patterns.

---

## Executive Summary

The founder correctly identifies a **positioning gap**: the homepage has improved structurally but still reads as a **healthcare marketing funnel** more than a **physician-led medical practice**. The highest-leverage fixes are:

1. **Remove decision friction** (hero CTA duplication, premature “Find the Right Starting Point,” ADHD screening chooser step)
2. **Humanize trust** (provider photography, founder balance, reduce diagram-only trust signals)
3. **Rebalance compliance copy** (keep legally required disclosures; move MSO/corporate language out of emotional trust zones)
4. **Broaden beyond ADHD** in care-pathway and “how it works” framing without abandoning ADHD as a revenue driver

---

## 1. Extracted Observations (Complete Inventory)

### Overall Impression
| # | Observation |
|---|-------------|
| O1 | Homepage significantly improved vs. prior versions |
| O2 | Still occasionally feels like healthcare marketing funnel vs. trusted physician-led practice |
| O3 | Desired direction: less sales-oriented, more physician-led, more human, more trustworthy, simpler |
| O4 | Less ADHD-centric sitewide presentation |
| O5 | Less legally defensive tone |
| O6 | More focus on helping patients understand symptoms |

### Hero Section
| # | Observation |
|---|-------------|
| H1 | Menu/nav font feels too small |
| H2 | Navigation has space — could be slightly larger |
| H3 | CTA duplication persists |
| H4 | “Talk to a Clinician” appears in multiple places immediately (nav + hero + downstream) |
| H5 | “Find the Right Starting Point” feels premature without real symptom-routing product |
| H6 | Question: Should hero have only one primary CTA? |
| H7 | Question: Is “Talk to a Clinician” sufficient as primary CTA? |
| H8 | Question: Hide “Find the Right Starting Point” until functionality exists? |

### Symptom Section
| # | Observation |
|---|-------------|
| S1 | Concept is good; symptom cards are strong |
| S2 | Supporting copy alignment feels off |
| S3 | Introductory text should feel more centered and cohesive |
| S4 | Copy should feel more personal |
| S5 | Alternative intros suggested: “Which of these feels most like you?” / “Does any of this sound familiar?” / “Is this your story?” |

### ADHD Screening Flow
| # | Observation |
|---|-------------|
| A1 | “Free ADHD Screening” should land directly on ADHD screening (ASRS), not generic multi-service router |
| A2 | User has already decided; additional routing = unnecessary friction |

### Trust Section (“You’re not failing…”)
| # | Observation |
|---|-------------|
| T1 | Headline direction is good |
| T2 | Surrounding legal language feels excessive |
| T3 | Examples: screening≠diagnosis, evaluation≠medication guarantee, state eligibility, MSO explanations |
| T4 | Legal disclosures necessary but patients should feel cared for first, regulated second |
| T5 | Benchmark against Hims, Teladoc, physician-led telehealth for disclosure density |

### Humanization
| # | Observation |
|---|-------------|
| U1 | Site needs more humans |
| U2 | Diagrams useful but insufficient |
| U3 | Needs: physician video, physician photography, patient-provider interaction visuals, larger provider images |
| U4 | Healthcare trust = people, not diagrams |

### How Care Works
| # | Observation |
|---|-------------|
| C1 | “How Getting Clarity Works” feels overly branded/artificial |
| C2 | Prefer: “How Care Works” / “How We Get Started” / “What To Expect” |
| C3 | Proposed 4-step pathway: Talk → Structured Evaluation → Personalized Plan → Ongoing Support |
| C4 | Care pathway on homepage should not feel ADHD-specific |
| C5 | Current step 1 mentions “free ADHD screening” — ADHD-skewed |

### Care Pathways Section
| # | Observation |
|---|-------------|
| P1 | Cards useful; secondary links inconsistent |
| P2 | Weight pathway links to single insulin resistance article vs. hub |
| P3 | Fatigue pathway links to single guide + telehealth (no service hub) |
| P4 | Each pathway should consistently link to: service page + category guide hub |

### Telehealth / Medical Home Language
| # | Observation |
|---|-------------|
| M1 | “When you want a medical home” may confuse (implies home-based care) |
| M2 | Alternatives: Care From Home, Healthcare Without the Waiting Room, Ongoing Care From Anywhere, Accessible Care Wherever You Are |

### Provider Section
| # | Observation |
|---|-------------|
| R1 | Heading feels overly corporate |
| R2 | Introduce team more naturally |
| R3 | Provider photos should be more prominent |
| R4 | Provider cards should feel more clickable |
| R5 | “View Profile” should visually stand out more |
| R6 | Consistent provider descriptions; strengths + patient populations; less generic specialty labeling |

### Testimonial Section
| # | Observation |
|---|-------------|
| V1 | Alignment inconsistent — supporting copy should sit directly beneath headline |
| V2 | External HelloKlarity link may leak traffic |
| V3 | Need analysis: does Klarity link increase trust or reduce conversion? |

### Membership / Siya Circle
| # | Observation |
|---|-------------|
| B1 | “More Than A Single Visit” messaging feels weak / no emotional connection |
| B2 | Focus on long-term health, continuity, education, relationship-based care |
| B3 | Remove ™ — use “Siya Circle” not “Siya Circle™” sitewide |
| B4 | Siya Circle is newsletter/education today, not full ecosystem — messaging should reflect that |

### Founder Section
| # | Observation |
|---|-------------|
| F1 | Founder image visually smaller than surrounding content |
| F2 | Rebalance column proportions; potentially enlarge image |

### FAQ Section
| # | Observation |
|---|-------------|
| Q1 | Some answers contain excessive legal/organizational language |
| Q2 | Review clinician references, MSO references, corporate structure in patient-facing answers |
| Q3 | Goal: answer patient questions, not legal-document tone |

### Footer
| # | Observation |
|---|-------------|
| E1 | Footer feels weak |
| E2 | Keep: logo, contact, legal, core nav |
| E3 | Add: high-value internal links, major guide categories, important care pages, strategic SEO links |
| E4 | Benchmark: Homebase-style footer architecture |

---

## 2. Recurring Themes

| Theme | Manifestations | Strategic Implication |
|-------|----------------|----------------------|
| **Physician-led vs. funnel** | Hero CTAs, branded section titles, ADHD weighting, diagram-heavy trust | Shift voice from “conversion path” to “clinical relationship entry” |
| **Decision fatigue** | Duplicate CTAs, premature routing CTA, screening chooser, pathway inconsistency | One clear action per scroll depth; honor user intent |
| **Compliance overshadowing care** | Trust section, FAQ, testimonials disclaimer, flow notes, footer | Consolidate legal copy into designated zones; warm language first |
| **Human trust deficit** | Diagrams > photos; small provider images; no video | Invest in people-forward media (highest trust ROI in healthcare) |
| **ADHD centrality** | Screening links, pathway badge, step 1 copy, symptom card secondary CTA | Keep ADHD as pathway, not homepage identity |
| **Copy craft / alignment** | Symptom intro, testimonial subhead placement, membership headline | Typography and layout passes, not just rewrites |
| **Navigation architecture** | Weak footer, inconsistent pathway secondary links | Hub-and-spoke linking pattern sitewide |
| **Brand legal hygiene** | Siya Circle™, MSO explanations in body copy | De-trademark newsletter; relocate corporate structure to legal/footer |

---

## 3. Findings by Category

### UX Findings
- **Nav legibility:** Header nav likely below optimal tap/read size for 40+ healthcare audience.
- **Hero CTA stack:** Three actions (Talk to Clinician + Find Starting Point + Pricing) competes with nav CTA = 4 conversion prompts above fold.
- **Symptom grid:** Strong IA; intro copy alignment/centering is polish, not structural.
- **Screening friction:** `/adhd-screening` Step -1 chooser contradicts explicit “Free ADHD Screening” intent — **confirmed in codebase**.
- **Care flow:** 3 steps vs. founder’s 4; Step 1 ADHD mention breaks general-practice framing.
- **Pathway links:** No consistent “service + guide hub” pattern (fatigue lacks service landing).
- **Provider cards:** 96×96 avatars, text-link “View profile” — low affordance for click.
- **Founder block:** Column ratio undersells founder as trust anchor.
- **Footer:** Single-column services list; no guide category hubs or symptom entry points.

### Trust Findings
- **Positive:** “You’re not failing…” headline; verified testimonial cards; board-certified trust bar; LegitScript/HIPAA badges.
- **Negative:** Symptom-loop diagram in trust section reinforces “content site” vs. “my doctor’s practice.”
- **Negative:** MSO paragraph in emotional trust block undermines physician-led positioning.
- **Negative:** Repeated screening/disclaimer fragments train skepticism.
- **Opportunity:** Physician video (even 60–90s) would outperform any diagram for YMYL trust.

### Conversion Findings
- **High friction:** Screening chooser likely drops ASRS completion rate.
- **CTA dilution:** “Find the Right Starting Point” duplicates symptom grid 1 scroll away — adds choice without value.
- **Klarity link:** Sends users to competitor marketplace profile — measure before removing (may be social proof source).
- **Membership band:** Feature-list copy doesn’t answer “why stay with Siya?” — weak mid-funnel retention story.
- **Provider section:** Profile clicks are trust-building pre-conversion — underemphasized vs. booking (correct per recent CTA cleanup; now needs visual weight).

### Compliance Findings
- **Required:** State eligibility, screening≠diagnosis, controlled substance policy, outcomes-not-guaranteed, emergency guidance.
- **Overexposed:** MSO/PLLC structure in trust narrative and FAQ body copy.
- **Risk if removed carelessly:** Reducing disclosures in hero/trust without relocating to footer/intake could create regulatory exposure.
- **Benchmark note:** Hims/Teladoc keep legal copy in footers, modals, and post-CTA — not in empathy headlines.

### SEO Findings
- **Footer expansion:** High opportunity for internal linking to `/answers` hubs without new URLs.
- **“Medical home” phrase:** Low SEO value; confusion risk > ranking benefit.
- **Pathway hub links:** Replacing single-article links with category hubs improves crawl paths and reduces orphan guides.
- **H1/H2 branded phrases:** “How getting clarity works” has no search volume — plain language may help topical relevance.
- **Risk:** Aggressive footer link stuffing without IA discipline can dilute PageRank — use curated hubs, not exhaustive lists.

---

## 4. Founder Requests — Accept / Modify / Reject

### Accept (with confidence)

| Request | Rationale |
|---------|-----------|
| Single clear hero primary CTA | Reduces decision fatigue; aligns with completed CTA cleanup initiative |
| Hide or remove “Find the Right Starting Point” until real router exists | Feature pretense damages trust; `#symptoms` anchor is not routing |
| ADHD screening → direct ASRS (skip chooser) | User intent is explicit; confirmed friction in `adhd-screening.html` |
| Soften legal density in trust narrative | Keep disclosures, relocate to footer/intake/screening tool |
| Rename “How Getting Clarity Works” → plain language | Better physician-practice tone; no SEO loss |
| Generalize care steps (de-ADHD Step 1) | Supports “less ADHD-centric homepage” goal |
| Consistent pathway secondary links (service + guide hub) | Improves UX and SEO simultaneously |
| Replace “medical home” wording | Reduces patient confusion |
| Larger provider photos + stronger View Profile affordance | Healthcare trust best practice |
| Remove Siya Circle™ → Siya Circle | Simple brand hygiene; no legal need for ™ on newsletter |
| Rebalance founder image proportions | Founder-led positioning requires visual parity |
| Humanization (photo/video) | Highest trust ROI for telehealth |
| Footer enrichment with guide/care hubs | Low-risk SEO + navigation win |
| FAQ de-legaling | Patient-first tone in accordion answers |

### Modify (right direction, adjust execution)

| Request | Modification | Why |
|---------|--------------|-----|
| Hero: only ONE CTA total | **One primary + one low-emphasis tertiary** (e.g., pricing text link) | Zero secondary options can hurt self-serve researchers; nav already has booking |
| “Talk to a Clinician” as sole CTA label | Keep for primary; use **context-specific labels** deeper on page (e.g., “Book a visit” only in pathway cards) | Sufficient at hero; variation aids comprehension lower in funnel |
| Symptom intro: more personal alternatives | Adopt **“Does any of this sound familiar?”** as H2; keep supportive subhead | Current H2 is already personal; change is polish not rewrite |
| Remove all legal language from homepage | **Consolidate, don’t delete** — single compliance band before footer | Regulatory exposure if removed entirely |
| Testimonials: remove Klarity link | **A/B or event-track first**; if kept, open in new tab with UTM + return banner | May be only third-party review volume source |
| Membership: emotional continuity messaging | Frame as **“care relationship over time”** but keep transparent pricing mention | DTC healthcare converts on price transparency |
| 4-step care pathway | Add Step 4 “Ongoing Support” **only if** membership/follow-up is operationally true | Avoid empty promise step |
| Less ADHD-centric homepage | De-emphasize in **framing/copy**, not **remove ADHD pathway** | ADHD is primary demand driver — hide at peril of conversion |
| Provider heading “less corporate” | “**Physicians and clinicians who listen first**” vs. casual slang | Must stay YMYL-credible |
| Benchmark Hims/Teladoc compliance tone | Match **placement pattern**, not **substance** — Siya has MSO structure requiring disclosure | Different corporate models |

### Reject or Defer (founder risk)

| Request | Verdict | Risk |
|---------|---------|------|
| Eliminate all screening/disclaimer language | **Reject** | FTC/state telehealth marketing exposure |
| Remove state eligibility from homepage entirely | **Reject** | Must set geographic expectations pre-booking |
| Remove MSO disclosure completely | **Reject** | Required for MSO/PLLC model transparency |
| Hide ADHD screening CTAs to reduce ADHD-centrism | **Reject** | High-intent conversion path; move to pathway level instead |
| Replace all diagrams with photography only | **Defer** | Diagrams aid symptom-overlap comprehension — use **both** |
| Build full symptom-routing product before any homepage CTA change | **Defer** | Symptom grid + answer pages **are** lightweight routing today |
| Siya Circle as “full ecosystem” messaging | **Reject for now** | Founder correctly notes it’s newsletter-only — don’t overpromise |
| Footer: exhaustive SEO link list (100+ guides) | **Reject** | Homebase pattern uses **curated** hubs, not sitemap dump |
| Physician video in hero immediately | **Defer to P1** | Requires production; use photography first in P0 |

---

## 5. Current-State vs. Founder Intent (Gap Analysis)

| Element | Current (`index.html`) | Founder Intent | Gap Severity |
|---------|------------------------|----------------|--------------|
| Hero CTAs | 3 (book + starting point + pricing) + nav CTA | 1 primary | **High** |
| Symptom H2 | “Which of these feels most true right now?” | More familiar/personal | Low |
| Screening URL | `/adhd-screening` → chooser step | Direct ASRS | **High** |
| Trust block | Empathy H2 + 2 paragraphs legal/MSO | Care first | **Medium** |
| How it works | 3 steps, branded title, ADHD in step 1 | 4 plain steps, general | **Medium** |
| Pathway links | Mixed (article/service/telehealth) | Service + guide hub | **Medium** |
| Telehealth card | “medical home” | Non-confusing alternative | Low |
| Providers | 96px photos, corporate subhead | Larger, human intro | **Medium** |
| Testimonials | Klarity external link | Evaluate leakage | **Medium** (needs data) |
| Membership | “More than a single visit” | Emotional continuity | **Medium** |
| Siya Circle | “Siya Circle™” | “Siya Circle” | Low (sitewide) |
| Founder photo | 320px column | Larger/balanced | Low |
| Footer | 4 columns, minimal guides | Hub-style internal links | **Medium** |

---

## 6. Prioritized Sprint Backlog

### P0 — Immediate (next 1–2 weeks)

| ID | Item | Rationale | Expected Impact | Complexity | SEO Risk | Compliance Risk |
|----|------|-----------|-----------------|------------|----------|-----------------|
| P0-1 | **ADHD screening deep-link:** Skip Step -1 chooser when arriving from “Free ADHD Screening” CTAs (query param `?start=asrs` or separate hash); keep chooser only for organic `/adhd-screening` direct visits if needed | Founder correctly identifies #1 friction point; confirmed in code | **High** — ASRS completion rate, ADHD funnel conversion | **Low** — JS step logic only | None | Low — keep disclaimer on tool |
| P0-2 | **Hero CTA simplification:** Remove “Find the Right Starting Point” from hero; single primary “Talk to a Clinician”; keep pricing as text link | Eliminates false product promise + duplicate path to symptom grid | **High** — clearer first action, less funnel feel | **Low** | None | None |
| P0-3 | **Final CTA band:** Remove duplicate “Find the Right Starting Point”; single button | Same as P0-2 at page bottom | **Medium** | **Low** | None | None |
| P0-4 | **Trust section compliance reshape:** Split copy — empathy + clinical promise in body; move MSO/state/disclaimer to compact compliance aside or footnote linked to `/legal` | Care-first, regulated-second | **High** — trust perception | **Low** — copy restructure | None | **Medium** — must retain disclosures somewhere visible |
| P0-5 | **Remove ™ from Siya Circle** sitewide (homepage + generators) | Brand hygiene per founder | Low direct; professionalism | **Low** | None | None |
| P0-6 | **Rename “How getting clarity works”** → “How care works” + de-ADHD Step 1 copy | Less branded, more practice-like | **Medium** — positioning | **Low** | Low positive (plain language) | Low — keep controlled substance note |
| P0-7 | **Replace “medical home”** pathway card title | Removes confusion | **Low–Medium** | **Low** | Neutral | None |
| P0-8 | **Nav font size bump** (+1–2px or weight adjustment) | Accessibility + older demographic | **Low–Medium** | **Low** | None | None |

### P1 — Next Sprint (2–4 weeks)

| ID | Item | Rationale | Expected Impact | Complexity | SEO Risk | Compliance Risk |
|----|------|-----------|-----------------|------------|----------|-----------------|
| P1-1 | **Pathway link consistency:** Each card → primary service URL + secondary “Browse [topic] guides” hub (`/answers` filtered or topic landing) | Founder consistency request; SEO hub linking | **Medium** — navigation + crawl | **Medium** — need hub anchors or query filters | **Positive** if hubs exist | None |
| P1-2 | **Provider section humanization:** Increase avatars to 128–160px; card hover state; button-style “View profile”; warmer H2/subhead | People = trust in telehealth | **High** — trust, profile CTR | **Medium** — CSS + generator | Positive (internal links) | None |
| P1-3 | **Founder section layout rebalance:** Widen image column ~40%, tighten copy column | Founder-led positioning | **Medium** | **Low** | None | None |
| P1-4 | **Membership band rewrite:** Headline on continuity/relationship; Siya Circle as education entry; honest “newsletter today” framing | Weak emotional connection today | **Medium** — mid-funnel engagement | **Low** | None | Low — don’t imply membership is insurance |
| P1-5 | **Add Step 4 “Ongoing support”** to care flow if ops supports follow-up/membership | Completes founder pathway | **Medium** | **Low** | None | Low — avoid guaranteeing ongoing access |
| P1-6 | **Trust section media:** Replace or supplement diagram with physician photo or patient-consult still | Humanization theme | **High** | **Medium** — asset dependent | None | None |
| P1-7 | **FAQ answer rewrite pass:** Remove MSO/corporate structure from answers; link to legal for entity questions | Legal-document tone in FAQ | **Medium** | **Medium** — many FAQs | None | **Medium** — keep one entity disclosure path |
| P1-8 | **Footer hub architecture:** Add 2–3 columns — Symptom guides, Care services, Popular guides (5–7 links each, curated) | Homebase-style SEO + nav | **Medium–High** | **Medium** | **Positive** if curated | None |
| P1-9 | **Testimonial layout fix:** Move lead copy directly under H2; tighten disclaimer | Alignment polish | **Low** | **Low** | None | Low — keep outcomes disclaimer |
| P1-10 | **Klarity link decision:** 30-day GTM event compare — `reviews-link` clicks vs. `Talk to clinician` CTR post-view | Data-driven leakage answer | **Medium** (decision quality) | **Low** — analytics only | None if link kept | None |
| P1-11 | **Symptom section copy polish:** Centered header block; H2 → “Does any of this sound familiar?” | Personal tone | **Low–Medium** | **Low** | None | None |

### P2 — Future (1–2 months+)

| ID | Item | Rationale | Expected Impact | Complexity | SEO Risk | Compliance Risk |
|----|------|-----------|-----------------|------------|----------|-----------------|
| P2-1 | **Physician intro video** (60–90s) in hero or trust section | Highest human trust lever | **High** | **High** — production | None | Low — script review |
| P2-2 | **Real symptom-routing product** (conditional next steps based on card selection) | Enables legitimate “Find your starting point” CTA | **High** | **High** — product + eng | Neutral | Medium — triage not diagnosis |
| P2-3 | **Provider card unification** via generator: consistent taglines, populations, strengths | Scales consistency | **Medium** | **Medium** | Positive | None |
| P2-4 | **Homepage ADHD de-emphasis pass:** Rotate “Most requested” badge; equal visual weight across pathways | Less ADHD-centric identity | **Medium** | **Low** | None | None — don’t hide ADHD |
| P2-5 | **Compliance placement audit** sitewide (Hims/Teladoc pattern): disclosures at CTA boundary, not empathy zones | Systemic trust/compliance balance | **High** | **High** — multi-template | None | **Positive** if done correctly |
| P2-6 | **On-site review aggregation** to replace/supplement Klarity | Eliminate traffic leakage | **Medium** | **High** — legal + API | None | Medium — testimonial rules |
| P2-7 | **Patient-provider photography library** for section backgrounds | Humanization at scale | **Medium** | **High** — photo shoots | None | HIPAA marketing review |

---

## 7. Open Questions (Resolve Before Implementation)

| Question | Recommendation | Owner |
|----------|----------------|-------|
| Should hero have only one primary CTA? | **Yes** — one primary button; pricing stays text link | Founder + CRO |
| Is “Talk to a Clinician” sufficient? | **Yes at hero**; allow contextual variants lower in page | Clinical marketing |
| Hide “Find the Right Starting Point”? | **Yes** until P2-2 routing exists; symptom grid is the implicit router | Product |
| Does Klarity link help or hurt? | **Instrument first** (P1-10); default hypothesis: hurts late-funnel, helps skeptical researchers | Growth |
| Can Step 4 “Ongoing support” be promised? | Confirm membership ops capacity before adding | Operations |
| Which guide hubs exist for pathway secondaries? | Audit `/answers` for fatigue, metabolic, men's health hub pages or create anchor sections | SEO + content |

---

## 8. Implementation Guardrails

From prior UX sprint — **do not regress:**

1. Screening links must target `/adhd-screening` (ASRS), never CarePatron
2. Provider cards link to profiles, not per-card booking
3. No new URLs or SEO structure changes unless explicitly approved for footer hubs (existing pages only)
4. Blog/Health Guides: single final CTA pattern
5. Any compliance relocation must remain **visible pre-booking** for state eligibility and screening limitations

**Suggested sprint order:** P0-1 → P0-2 → P0-4 → P0-6 → P1-2 → P1-8 → P1-7

---

## 9. Success Metrics

| Metric | Baseline | Target (30 days post-P0) |
|--------|----------|--------------------------|
| ASRS screening starts / homepage ADHD CTA clicks | TBD — GTM | +15–25% |
| Hero CTA click-through (primary only) | TBD | +10% |
| Bounce rate on homepage | TBD | −5–10% |
| Provider profile clicks from homepage | TBD | +20% |
| Booking completions (CarePatron) | TBD | +5–10% |
| Scroll depth to FAQ | TBD | Stable or improved |
| Klarity link CTR | TBD | Informs P1-10 decision |

---

## 10. Document History

| Version | Notes |
|---------|-------|
| v1.0 | Initial plan from founder cleaned audit; cross-checked against live `index.html` and `adhd-screening.html` |
| Supersedes | `HOMEPAGE-REDESIGN-SPRINT.md` (provisional, pre-audit) — retain for wireframe reference only |
