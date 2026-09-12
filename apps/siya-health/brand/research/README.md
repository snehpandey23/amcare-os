# Research → Content Pipeline (Phase 3 stub)

**Status:** Template only — build after Creative Registry has traction  
**Parents:** [`../04-CREATIVE-SYSTEM.md`](../04-CREATIVE-SYSTEM.md) · [`../creative-registry/`](../creative-registry/)

Goal: one peer-reviewed paper (or strong clinical insight) → many schema-tagged assets without blank-canvas design.

## Suggested folder per paper

```text
research/{yyyy}/{slug}/
  paper.md                 # citation, link, plain-language summary
  extract.yaml             # insights, limitations, evidence_level
  creative-opportunities.yaml  # list of Intent × Family × Layout to produce
```

## extract.yaml (draft shape)

```yaml
citation: ""
url: ""
evidence_level: PeerReviewed
clinical_review_required: true
insights:
  - id: I1
    claim: ""
    patient_why: ""
limitations:
  - ""
out_of_scope:
  - ""
```

## creative-opportunities.yaml (draft shape)

```yaml
source: extract.yaml
items:
  - intent: Recognition
    family: R
    layout: R-02
    journey_stage: Recognizing
    emotion: Validated
    insight_id: I1
    registry_clone: null
  - intent: Education
    family: RS
    layout: RS-02
    journey_stage: Considering
    emotion: Curious
    insight_id: I1
    clinical_review: true
```

Then run [`../prompts/`](../prompts/) per item and file outputs under `creative-registry/`.

## Mining / audit passes (review only)

Claim-risk mining before scripts:

```text
research/audits/YYYY-MM-DD-{topic}-mining.md
research/REDDIT-{slug}.md   # optional companion hook bank
```

Example: `audits/2026-08-14-ADHD-adult-signs-symptoms-mining.md` (signs of adult ADHD — no live page edits).

**Do not expand this into a full Research OS until ~50 registry entries are `approved` or `published`.**
