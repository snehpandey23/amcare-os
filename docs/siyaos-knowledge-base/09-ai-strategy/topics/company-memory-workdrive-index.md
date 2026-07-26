---
id: company-memory-workdrive-index
module: 09-ai-strategy
title: Company Memory — WorkDrive SiyaOS vs git KB
status: live
owner: Engineering · CEO
confidence: official
reviewDate: 2026-09-01
kind: topic
keywords:
  - workdrive
  - company memory
  - siyaos
  - knowledge base
  - draft
  - ingest
  - legacy
priority: 9
escalate: CEO or document owner
sources:
  - Common Folder/SiyaOS/
  - docs/siyaos-knowledge-base/INGEST-LEGACY-2026-07.md
---

## Overview

**Authoritative for staff AI (this assistant):** `docs/siyaos-knowledge-base/` topics with `status: live` only.

**Extended company memory (drafts):** Zoho WorkDrive `Common Folder/SiyaOS/` — HR SOWs, MA playbooks, marketing strategy, clinical templates. Most legacy ingests are **`draft`** and **`bot_retrieve: false`** until founders mark **`live`** and copy approved sections into git.

## SOP

1. Staff question → retrieve from **live git KB** first.  
2. If answer missing or marked unresolved → **escalate** to owner in frontmatter; do not invent from memory.  
3. Founders edit WorkDrive → resolve conflicts in `SiyaOS/00-START-HERE/FOUNDER-RESOLVE-from-legacy-docs.md` → promote slices to git `topics/*.md` → run `npm run kb:build -w @amcare/hipaa-training`.

## FAQ

**Does the bot know the full 6-month ads plan or neuro-spiritual GTM?**  
Not until promoted. Summaries may exist in WorkDrive `marketing/strategy/` as **draft** — route marketing strategy questions to **CMO (Sonakshi Soni)**.

**Patient-facing Siya Guide?**  
Separate app (`apps/siya-assistant`) uses **public** site content only, not WorkDrive.

## AI Context

When asked about ingested legacy docs, MA workflows, Spruce scripts, or CMO strategy: state that only **live** git KB is in retrieval; WorkDrive holds drafts; never quote conflicting prices or 24/7 claims; use the public pricing topic for patient-facing fees; escalate operational contradictions to leadership.

## Revision history

| Date | Change |
|------|--------|
| 2026-07-26 | Live index for WorkDrive vs git |
