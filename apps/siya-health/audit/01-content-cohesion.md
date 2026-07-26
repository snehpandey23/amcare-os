# Website Cohesion Audit v1.0 — Content Cohesion

Date: 2026-07-26  
Scope: 187–192 public/static HTML artifacts, with redirects and preview utilities separated from indexable content.  
Method: paragraph fingerprinting, content-block inventory, CTA destination counts, geography matching, heading-flow sampling, and manual review of representative templates.

## Verdict

The site has consistent templates but inconsistent editorial judgment. The largest problem is not visual chrome; it is clinical appenders inside `<main>` that do not always match the page topic.

## P0

### COH-001 — ADHD preparation copy on non-ADHD guides

- Affected: 12 non-ADHD Answers pages.
- Evidence: “childhood vs adult onset” preparation guidance appears on GLP-1, insulin-resistance, testosterone, prescriptions, and general telehealth guides.
- Representative pages:
  - `/answers/glp-1-side-effects`
  - `/answers/what-is-food-noise`
  - `/answers/semaglutide-weight-loss-how-it-works`
  - `/answers/insulin-resistance-without-diabetes`
  - `/answers/when-is-testosterone-therapy-appropriate`
  - `/answers/how-online-prescriptions-work`
- Disposition: replace the global preparation appender with topic-gated variants. Delete ADHD-onset language outside ADHD/neurodevelopmental content.

### COH-002 — GLP-1 emergency tree on unrelated pages

- Affected: 4 Answers pages.
- Pages:
  - `/answers/afternoon-energy-crash-after-lunch`
  - `/answers/brain-fog-after-eating`
  - `/answers/which-preventive-blood-tests-adults`
  - `/answers/why-normal-labs-dont-mean-healthy`
- Evidence: “Severe abdominal pain, vomiting, or dehydration on GLP-1?” appears inside fatigue, brain-fog, preventive-lab, and normal-lab content.
- Disposition: restrict the full GLP-1 decision tree to GLP-1/weight-medication pages.

### COH-003 — Garbled indexed clinical article

- Affected: 1 page, `/blog/adult-adhd-treatment-california-2026`.
- Evidence includes phrases such as “shame misgendering dopamine scarcity neurochemically untreated” and “not melodramatically cure-all magically still.”
- Disposition: remove from the index immediately, then rewrite or redirect.

### COH-004 — ADHD hub care pathway exceeds assembly limit

- Affected: `/blog/adhd`.
- Evidence: 19 links in one care-pathway block.
- Disposition: maximum three contextual links plus one primary button; move state/city browsing into a separate secondary destination.

## P1

### COH-005 — Competing conversion journeys

- Approximately 51 blog pages contain three or more conversion destinations.
- Several service pages repeat Meet & Greet four to six times in main content.
- Primary journey should be one action, followed by one secondary action and related reading.

### COH-006 — City-page template cloning

- Approximately 13 of 15 city treatment pages share FAQ answers and CTA paragraphs.
- Houston has the weakest unique-content ratio in the sampled group.
- Shared structure is acceptable; shared editorial paragraphs are not.

### COH-007 — Educational geography bleed

- Approximately 16–19 non-geo educational pages contain unnecessary multi-state or metro references.
- State availability may appear once as a sentence. Educational pages should not contain state directories.

### COH-008 — Uniform Answers assembly

- All 59 answer articles use nearly the same section grammar.
- Keep predictable “short answer” and evidence conventions, but make myths, decision support, preparation, and care coordination optional and topic-compiled.

## P2

- Normalize “Siya Health” versus “Siya Healthcare.”
- Resolve the stale `what-included-199-adhd-evaluation` slug.
- Keep adjacent ADHD/perimenopause links only when framed as a differential, not as a generic funnel.

## What passed

- No consecutive horizontal-rule bleed detected.
- No state-directory block remains on educational pages.
- Footer, cookie controls, analytics, and provider attribution were treated as intentional site chrome, not content bleed.

## Acceptance threshold

- P0 findings: zero.
- No educational page contains cross-topic clinical instructions.
- Every care block has no more than three contextual links and one button.
- Every page has one identifiable primary journey.
