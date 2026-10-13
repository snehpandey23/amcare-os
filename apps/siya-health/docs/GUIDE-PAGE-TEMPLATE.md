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

1. **Scene-first opener (mandatory)** — Every guide opens with a concrete, relatable scene — specific and sensory, something a reader recognizes from their own life — *before* naming who the page is for.
   - **Do not** lead with a conditional clause (“If you are a busy professional who…” / “If you work nights…”).
   - **Do not** use decision-tree or clinical jargon in the opener (“branch,” “pattern,” “cohort”).
   - **Do not** drop a cold bulleted list immediately after the opener as a diagnostic menu.
   - If possible causes/topics need to appear early, fold them into a flowing sentence (e.g. “tired can mean a lot of things — poor sleep, low iron, thyroid, mood, hormones, focus — sometimes more than one at once”).
   - Then invite recognition (“if that’s familiar, you’re far from alone”) and say what this page will do.
   - Reference voice (exhausted, agreed): *You’ve had eight hours in bed, your day wasn’t even that brutal, and you’re still running on fumes by 2pm. If that’s familiar, you’re far from alone — persistent tiredness is one of the most common reasons adults see a doctor. The tricky part is that “tired” can mean a lot of different things — poor sleep, low iron, thyroid, mood, hormones, focus — sometimes more than one at once. This page walks you through how to tell them apart, starting with what the research actually says is most common.*
2. **Educational disclaimer** — Keep the standard disclaimer; it is not the opener and never comes first.
3. **Covers / does not cover** — Explicit bullets early (after opener + disclaimer).
4. **Lists, not comma soup** — Convert cause lists, criteria, and “what to bring” into real `<ul>` / `<ol>` items *below* the opener — not as the first thing after it.
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

### 1. Scene-first opening

Same opener standard as Shared requirements §1. Symptom hubs especially must not open as a routing table or persona conditional.

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

Concrete guidance for tracking energy / sleep / activity / mood so the reader can bring a pattern to a visit — not vague “listen to your body.” Long checklists belong on a **standalone tracking page** (e.g. `/guides/fatigue-tracking`) with a short pointer from the hub — do not keep a full multi-week checklist inside the hub body.

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
