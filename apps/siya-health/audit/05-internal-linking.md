# Website Cohesion Audit v1.0 — Internal Linking

## Verdict

Mechanical link health is strong: no confirmed broken internal links and no true orphan pages were found. Editorial linking quality is weaker because sitewide chrome can mask pages with little contextual support, and some care blocks behave like link directories.

## P0

### LNK-001 — ADHD hub care pathway is a link farm

`/blog/adhd` contains 19 links in one care-pathways module. It does not provide one clear next step.

Disposition: retain three contextual destinations and one primary action. Move geography browsing to a separate hub.

## P1

### LNK-002 — Weak contextual inbound support

Pages with approximately one contextual inbound link include:

- `/answers/afternoon-energy-crash-after-lunch`
- `/answers/weight-gain-after-stopping-ozempic`
- `/blog/phentermine-for-weight-loss-safety-and-effectiveness`
- `/blog/pots-and-adhd`

Add two or three links from the appropriate parent pillar and sibling content only if the page remains canonical.

### LNK-003 — Entity edges are not encoded

The editorial registry describes relationships, but the machine graph does not consistently encode pillar → guide → FAQ → tool → labs → service. Internal linking is therefore maintained by page generators and manual blocks rather than by entity intent.

### LNK-004 — City pages cross-link within a cannibalized cluster

Cross-linking many overlapping geography pages reinforces duplicate intent rather than clarifying a canonical owner. Consolidate first; link second.

## P2

- `/prescriptions` has no strong contextual onward path.
- Legal and booking pages are natural endpoint pages and should not be penalized for limited editorial links.
- Category hubs need curated “start here” links rather than large undifferentiated card lists.

## Linking rule by page type

- Guide: parent pillar, up to three related guides, one relevant service/tool.
- Blog article: parent hub, one or two supporting guides, one next step.
- Service: relevant tool, relevant FAQ/guide, booking action.
- Labs: condition/pillar, interpretation guide, relevant care service.
- Provider: service expertise and selected reviewed content.
- Geo page: state owner, relevant service, booking action; no unrelated state directory.

## Acceptance threshold

- Every indexable content page has at least three meaningful contextual inbound links or a documented exception.
- Every page names one logical next step.
- No contextual module exceeds three links plus one action.
- Links reinforce canonical ownership rather than duplicate intent.
