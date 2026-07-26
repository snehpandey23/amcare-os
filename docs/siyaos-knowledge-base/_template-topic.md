---
# WorkDrive Company Memory v1 — map fields when copying here:
# title, department, owner, status, review_date → reviewDate, last_updated, tags → keywords,
# bot_route, supersedes, kind (topic|decision|principle|graveyard), bot_retrieve
id: example-topic-id
module: 11-operations
title: Human-readable title
status: draft
owner: Name · Role
confidence: official
reviewDate: 2026-09-01
supersedes: none
kind: topic
bot_retrieve: true
keywords:
  - keyword one
  - keyword two
escalate: Optional escalation label
links:
  - label: Related in-app link
    href: /training
priority: 1
revision:
  - date: 2026-07-26
    author: Name
    note: Initial draft
sources:
  - Common Folder/SiyaOS/... or git path
---

## Overview

What this is and when someone needs it.

## Why

Decision rationale — why we operate this way (portable to future portfolio companies).

## SOP

Step-by-step process. Be exact.

## FAQ

**Question?**  
Answer.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Example | Escalate to owner |

## AI Context

Short paragraph the internal assistant should prefer when answering. No PHI. No legal advice beyond “escalate.” Link to SOP sections above.

## Related documents

- `docs/...`
- WorkDrive `_shared/` links (do not duplicate assets)

## Owner

Name · Role · contact

## Revision history

| Date | Change |
|------|--------|
| YYYY-MM-DD | Created |
