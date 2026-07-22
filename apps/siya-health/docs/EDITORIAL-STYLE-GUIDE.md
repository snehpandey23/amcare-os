# Siya Health — Editorial Style Guide

**Status:** Permanent rulebook for all public website copy.  
**Reference standard:** Homepage (`index.html`) and ADHD Care (`adhd-care.html`).  
**Companion:** `SERVICE-PAGE-BLUEPRINT.md` (structure), `data/homepage-trust-metrics.mjs` (only allowed statistics).

Every new page, rewrite, blog article, and health guide must follow this guide. If a sentence would not survive being read aloud by a physician to a patient, rewrite it.

---

## 1. Brand voice

Siya Health sounds like **a thoughtful physician explaining things to a patient they respect** — not a hospital brochure, a startup landing page, or a legal contract.

The voice is:

- Warm but not chummy
- Direct but not blunt
- Clinically responsible — precise about what care can and cannot do
- Nonjudgmental — recognition before diagnosis, reassurance before selling
- Evidence-aware without academic hedging on every line
- Free of hype

**Test:** Would Dr. Sneh Pandey say this sentence to a patient in a visit? If not, rewrite it.

---

## 2. Reading level and sentence shape

- Target **8th–10th grade** reading level for patient-facing copy.
- Clinical precision beats simplicity when they conflict — never oversimplify a medical fact into an inaccurate promise.
- Sentences: mostly under ~20 words. One main idea per sentence.
- Paragraphs: 1–3 sentences on service pages; up to 4 in articles.
- Define a clinical term in plain words the first time it appears ("executive function — the mental skills that help you plan, start, and finish tasks").
- Prefer active voice. "A physician reviews your labs" — not "labs are reviewed."

---

## 3. Terminology — non-negotiable distinctions

These words are **not interchangeable**. Misusing them creates clinical and legal risk.

| Term | Means | Never implies |
|------|-------|---------------|
| **Screening** | A free self-assessment (e.g., ASRS) that suggests whether evaluation makes sense | A diagnosis, a guarantee of diagnosis, or medication |
| **Evaluation** | A structured clinical assessment with a licensed clinician | Guaranteed diagnosis or a specific treatment |
| **Diagnosis** | A clinical conclusion made by a clinician after evaluation | Something a quiz or website can deliver |
| **Treatment** | The care plan (may or may not include medication) | Medication specifically |
| **Prescribing** | A clinician's independent medical decision | An entitlement, outcome, or product |
| **Follow-up** | Ongoing care after evaluation | Automatic or included unless stated |

**Hard rules:**

- Never write anything implying a screening result guarantees a diagnosis or a prescription.
- Testosterone therapy, stimulants, GLP-1s: always "when clinically appropriate" / "never guaranteed."
- "Physician-led" is accurate and preferred — use it for the practice as a whole. Individual visits may be with a physician, NP, or PA; don't promise "you will see a doctor" where a licensed clinician is the accurate phrase.

---

## 4. Claims and statistics

- The **only** allowed statistics are in `data/homepage-trust-metrics.mjs` (2,200+ patients treated, 1,000+ ADHD evaluations & screenings, 4.8★ Google, 44 Google reviews, 600+ verified reviews) and the phone/email in `SITE_CONTACT`.
- Never invent, round up, extrapolate, or "refresh" a number without an owner-supplied source.
- Availability claims ("same-week appointments") must reflect current operations — verify before reuse.
- Banned words in claims: **best, guaranteed, risk-free, instant, cure, permanent, painless, 100%**.
- State availability is exactly: **California, Texas, Pennsylvania, Florida** — update in one place if it changes.

---

## 5. Pricing rules

- Pricing amounts come from `data/site-standards.mjs` → `PRICING` only. Display helpers live in `data/pricing-display.mjs`.
- Prefer `{{pricing.initialEvaluation}}` or `<!-- SIYA:PRICE:INITIAL_EVAL -->` in authored HTML — chrome expands them at build time.
- **One pricing presentation per page.** No duplicate pricing strips.
- Always say what a price includes and (where relevant) what it does not.
- No expired offers, no campaign-specific pricing on evergreen pages, no vague "starting at" unless a range is genuinely necessary.
- The Meet & Greet is free — say so plainly, once, near its CTA.
- **Do not put dollar amounts in page titles or H1s** when the topic is not uniquely “cost.” The pricing page owns fees; titles should stay evergreen (`What is included in an ADHD evaluation?`, not `…$149…`). Body copy and meta description may mention the current fee.

---

## 6. CTA conventions

**Allowed primary conversion CTAs (exact labels):**

- `Take Free ADHD Screening` → `/adhd-screening`
- `Book Free Meet & Greet` → `/redirect/meet-greet`
- `Start Secure Medical Chat` → `/redirect/chat`
- `Call Siya Health` → tel link
- `Book Online via Zocdoc` → Zocdoc (providers only)

**Allowed educational CTAs:**

- `Explore Our Blog`, `Read the Guide`, `View Suggested Reading`, specific article titles as anchors

**Rules:**

- Service-page hero + final CTA pair: Meet & Greet (primary) + Secure Chat (secondary). ADHD pages may use Screening + Meet & Greet.
- Do not use: `Learn More`, `Get Started`, `Explore Options`, `Continue`, `Find Out More`, `Explore Care Options` — unless the destination is unmistakable from immediate context (rare).
- Keep tracking attributes (`data-siya-track`, `data-cta-slot`, etc.) intact whenever a label changes.
- Don't stack two CTAs for the same action within one viewport. Repeating a CTA deeper down the page is fine.

---

## 7. Disclaimer rules (three layers, kept separate)

Every page separates three layers — never blend them into one paragraph:

1. **Patient-facing explanation** — plain, reassuring, in the body copy.
2. **Clinical precision** — in the relevant section (evaluation details, medication sections, FAQ).
3. **Legal protection** — concise, placed where the decision happens (near booking, in footer, or on the policy page), written in readable type. Never tiny gray text.

**Placement rules:**

- Emergency/crisis language (911/988) appears where clinically relevant (mental-health pages, footer) — not repeated at random.
- Controlled-substance and no-guarantee-of-prescription statements appear once per relevant page, near the medication content or FAQ — not in the hero.
- Educational disclaimers ("this article is not medical advice") live at the end of articles, once.
- Full legal terms live on `/legal/*` pages only. Body copy links to them; it does not reproduce them.
- Never remove a disclaimer because it "sounds formal." Rewrite for clarity; flag uncertain cases for attorney review.

---

## 8. Headings and formatting

- One H1 per page, matching search intent, recognition-first on service pages.
- H2s are meaningful, not clever: "How to Get Started", "Does This Sound Like You?", "What the Evaluation Includes".
- Sentence case for headings ("How care works", not "How Care Works") — except established proper section names already live.
- Bullets for scannable lists of 3+; prose for reasoning.
- No all-caps except small UI labels.
- Long-form article text stays in the reading column — never full-width.
- Bold sparingly, for genuinely load-bearing phrases.

---

## 9. Language to use / language to avoid

| Avoid (robotic/corporate) | Use instead |
|---------------------------|-------------|
| clinically appropriate treatment modalities | treatment options that fit your needs |
| comprehensive care solutions | care from a licensed physician |
| patient-centered healthcare delivery | care built around you |
| evaluation and management services | an evaluation to understand what's causing your symptoms |
| individualized therapeutic pathways | a plan created with you |
| utilize / leverage | use |
| in order to | to |
| it is important to note that | (delete — just say the thing) |
| we offer a wide range of | we help with |
| cutting-edge / state-of-the-art | (delete or name the specific thing) |
| journey (as filler) | care, plan, next steps |
| holistic (unless literally whole-person scope) | whole-person, or name the specifics |

**Recognition-first openers** (established pattern — keep): name the patient's experience before the service. "Struggling to focus—even when you care?" before "Adult ADHD Evaluation."

**Signature phrases already in the brand voice (reuse, don't dilute):**
- "Recognition and reassurance—not judgment."
- "Something feels off—and you're tired of guessing."

---

## 10. Article standards (blog + health guides)

- Answer the search question in the first ~100 words.
- Pattern: title → concise answer → why it matters → explanation → practical implications → when to seek care → key takeaways → suggested reading → service CTA.
- Author and (when performed) medical-reviewer attribution must be real — never fabricate a reviewer or a review date.
- Cite sources for clinical claims where practical; prefer primary/major sources (NIH, FDA, journals).
- Medication content always includes: how it works, common side effects honestly stated, who it may not fit, and that prescribing is a clinician decision.
- One service CTA per article, at the end. No mid-article sales interruptions.

---

## 11. Photography captions and alt text

- Alt text describes what's in the image for a screen-reader user ("Woman at her kitchen table in morning light, looking tired") — not keywords.
- Decorative images: `alt=""`.
- Editorial style per `brand/photography/README.md`: authentic adults, natural light, everyday settings, no competitor branding, no AI-looking people, no clipboard posing.
- Images earn their place: recognition, trust, explanation, or reading relief. No quota, no filler.

---

## 12. Review workflow for new copy

1. Draft against this guide.
2. Check terminology table (§3) and claims rules (§4).
3. Any new statistic, medical claim, or legal phrasing → flag for human review before publish.
4. New pages follow `SERVICE-PAGE-BLUEPRINT.md`; do not invent structures.
5. Update chrome templates (`scripts/site-chrome.mjs`) when a change must survive rebuilds.
