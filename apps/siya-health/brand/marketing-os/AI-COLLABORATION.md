# AI Collaboration Guide — Marketing Team ↔ Cursor

```text
Your job: research + judgment + feedback
AI's job: draft, adapt, polish, scale — under Brand OS rules
```

## The contract

1. **You never publish AI output without human review**
2. **You always pass Brand OS constraints** (Editorial Test, medical flags, anti-patterns)
3. **You give specific feedback**, not vague direction
4. **AI does not decide strategy** — you point to Knowledge Product, Insight ID, and spoke URL

---

## When to use AI

| Task | Use AI? | You still do |
|------|---------|--------------|
| Research synthesis from paper | ✅ | Vet sources, clinical accuracy |
| Editorial pack first draft | ✅ | Hook approval, practical change |
| Caption polish per platform | ✅ | Final read, CTA check |
| Carousel slide copy | ✅ | Design QA |
| Founder LinkedIn draft | ✅ only when requested | Dr. Sneh voice check — **no CTA** |
| SEO article draft | ✅ | `ADHD-CONTENT-ENGINE.md` pipeline |
| Medical claims | ⚠️ AI proposes | **Human approver required** |
| Strategy / what to post today | ❌ | You decide from OPERATING.md + backlog |
| Paid ad copy (high-risk) | ⚠️ | Compliance audit + clinical stamp |

---

## How to brief AI (copy-paste template)

```text
## Task
[Draft editorial pack / Polish captions / Adapt for LinkedIn / etc.]

## Insight ID
[e.g. AD-S-01]

## Knowledge Product
[e.g. Brain Health & ADHD]

## Creative family
[e.g. R — Recognition]

## Hook
[e.g. "You're not lazy — overlooked adult ADHD signs"]

## Practical change (required for company/social)
[e.g. "Take validated ADHD screener; book evaluation if lifelong pattern"]

## Spoke URL
https://siya.health/blog/...

## Channels needed
- Instagram carousel (8 slides)
- LinkedIn Company
- Facebook
- X
- Pinterest
- Founder LinkedIn: NO (or YES — Draft A, zero CTA)

## Medical flags
- Do not claim: [...]
- Prefer clinical stamp: yes/no
- Organic only / paid-ready: [...]

## Reference files
- Similar pack: editorial-packs/WH-R-02/
- Voice: docs/EDITORIAL-STYLE-GUIDE.md
- Gate: brand/knowledge-pillars/EDITORIAL-TEST.md

## My feedback on previous draft (if polish pass)
1. Slide 2: too generic — need specific "late diagnosis in women" angle
2. Caption: bury practical change higher — line 2
3. Remove "guaranteed diagnosis" phrasing
4. LinkedIn: shorten to 3 paragraphs
```

---

## Feedback loop (polish pass)

**Bad feedback:** "Make it better" / "More engaging" / "Sounds too AI"

**Good feedback:**
- "Opening line should name the feeling: 'Sunday scaries but it's Tuesday'"
- "Slide 5 stat needs source or cut — we only use homepage-trust-metrics"
- "Practical change must include '14-day log' — see WH-R-02"
- "Founder version: end with question about when coping strategies stopped working"
- "Instagram caption: max 150 words before 'more'; put link context in line 1"

**After polish:**
1. Re-run Editorial Test mentally (7 questions)
2. Update pack in `editorial-packs/[ID]/`
3. Update Content Tracker status
4. Sync to WorkDrive

---

## Prompt patterns by creative family

See `brand/prompts/README.md` for family-specific patterns (R, E, M, RS, PP, PR, PF, A).

**Always append:**
```text
Pass Siya Editorial Test. Company/social must include ≥1 evidence-based practical change.
No DIY dosing. No guaranteed outcomes. States: CA, TX, PA, FL only.
Entity: Siya Health Inc. (admin) · Siya Healthcare, PLLC (clinical).
```

---

## Founder LinkedIn (protected channel)

**AI may draft only when explicitly requested.**

Rules from `FOUNDER-LINKEDIN-VOICE.md`:
- Memory > thesis
- Clinical reflection, not marketing
- End on realization or open question
- **Never:** Book Now, Meet & Greet, blog links, screening links, any CTA

Brief AI:
```text
Founder LinkedIn Draft A for [Insight ID].
Voice: Dr. Sneh — physician remembering a patient pattern.
Zero CTA. Zero links. End on open question.
Length: 150–250 words.
```

---

## SEO content (separate pipeline)

Use `docs/ADHD-CONTENT-ENGINE.md` 8-step process:

1. Brief → 2. Outline → 3. Link map → 4. Draft → 5. Medical review → 6. Build → 7. Publish → 8. Measure

AI helps at steps 1–4. Human owns link map, claims, and publish gate.

---

## What to log after AI session

| Field | Where |
|-------|-------|
| Insight ID | Content Tracker |
| Draft vs polish | Notes |
| Medical flags unresolved | Research Backlog + Approver |
| Time saved / iterations | Daily Log (optional) |

---

## Anti-patterns in AI collaboration

- Publishing first draft without reading every slide
- Letting AI invent statistics
- Skipping medical-flags.md for GLP-1, TRT, stimulant, HRT topics
- Using AI for founder LinkedIn without Dr. Sneh review
- Generating 20 packs at once during pause-at-10 (finish feedback loop first)
