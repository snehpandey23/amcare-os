# Guide page template (pillars)

Validated against `/guides/sleep` (physician-reviewed 2026-10-04), then extended for symptom-hub pages (2026-10-04).

## Page types

| Type | Job | Examples |
|---|---|---|
| **Diagnosis / condition pillar** | Explain one clinical question in depth | sleep · testosterone · perimenopause · weight (metabolic) · mental-health-and-adhd |
| **Symptom hub** | Recognition + self-assessment + triage across *multiple* possible causes for someone who does not yet know which path they are on | exhausted (and future hubs of the same shape) |

Do not treat a symptom hub as a routing table of “see the X page” links. If the dedicated cause pages already own the deep workup, the hub’s job is still to give the reader a complete triage article of its own.

---

## Shared requirements (all guide pages)

1. **Reader-intent opening** — Name the actual reader and the situation that brought them here. Not “general education” as the first sentence.
2. **Educational disclaimer** — Keep the standard disclaimer; it is not the opener.
3. **Covers / does not cover** — Explicit bullets early.
4. **Lists, not comma soup** — Convert cause lists, criteria, and “what to bring” into real `<ul>` / `<ol>` items.
5. **Citations** — Numbered references; clinical/stat claims must be supportable.
6. **No dosing / no personal diagnosis** — Evaluation framing, not a prescription promise.
7. **Stable section IDs** — Keep redirect anchors (`#ex-iron`, `#wt-glp1`, etc.) when rewriting.

---

## Diagnosis / condition pillar (sleep-validated)

Pattern already approved on sleep:

- Scene-setting opener for the named reader
- Clear distinction between lookalikes (e.g. strain vs disorder)
- Criteria / tools / what a visit involves as bullets
- Cause-specific depth that belongs on *this* page stays on this page
- Cross-links allowed when they point to a *different* clinical topic after this page has done its job

---

## Symptom-hub requirements (exhausted and peers)

Applies when the page’s job is recognition/triage across multiple causes.

### 1. Reader-intent opening

Name the reader (e.g. busy professionals who feel tired, unmotivated, or underperforming despite a full schedule and seemingly adequate rest). “If you notice this, you are not alone” tone — not clinical throat-clearing.

### 2. No mid-article punt language

**Forbidden as a substitute for explanation:**

- “this is discussed on the sleep page”
- “see the X page”
- “that discussion lives on …”

The article must be complete for *its own scope* (recognition, measurement, tracking, cause map, what to ask a clinician).

**Allowed:** a **Go deeper** list at the **end**, after the article has already done its job, linking to cause-specific pillars (sleep, iron/thyroid detail already summarized here, perimenopause, testosterone, ADHD, etc.).

### 3. Validated-instrument content

Name real instruments used in research/clinical measurement (e.g. Chalder Fatigue Scale, Fatigue Severity Scale, Multidimensional Fatigue Inventory). Explain what they measure in plain language. Do not present a public web page as a scored self-diagnosis tool.

### 4. Practical self-tracking

Concrete guidance for tracking energy / sleep / activity / mood so the reader can bring a pattern to a visit — not vague “listen to your body.”

### 5. Ranked causes grounded in evidence

Present causes as a **bulleted (or numbered) ranked list** tied to cited primary-care reviews/meta-analyses — not a comma-separated sentence of possibilities. State what the source measured (prevalence among primary-care tiredness presenters, association strength, etc.). Do not invent percentages.

> Note: This supersedes the older `SIYA:DIFFERENTIAL-RECOGNITION` rule of “never rank” for **symptom-hub guide pages**. That block remains for entity pages that intentionally stay unranked.

### 6. “What to discuss with your doctor”

Its own bulleted section — concrete items to raise, not a vague CTA.

### 7. Infographic candidates (flag only)

Mark `<!-- INFOGRAPHIC CANDIDATE: … -->` where a visual would help (e.g. possible-causes decision flow). Do not build the graphic in the same pass unless asked.

### 8. Go deeper (end only)

After the above, a short list of cause-specific pages for readers who already know which branch they need.

---

## Completeness checklist (run before ship)

- [ ] Opens on the named reader, not “general education”
- [ ] No mid-article punt language
- [ ] Validated instruments (symptom hubs) or equivalent measurement/criteria content (diagnosis pillars)
- [ ] Self-tracking or visit-prep substance (symptom hubs)
- [ ] Causes / criteria as real lists; ranked + cited when hub-type
- [ ] “What to discuss with your doctor” as its own section (symptom hubs)
- [ ] Go-deeper links only at the end
- [ ] Infographic candidates flagged, not fabricated
- [ ] Redirect anchors preserved
- [ ] References match superscripts
