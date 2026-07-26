# Architecture — two knowledge layers

```text
┌─────────────────────────────────────────────────────────────┐
│  SIYAOS KNOWLEDGE BASE (this tree)                           │
│  Company memory · SOPs · philosophy · internal AI retrieval  │
│  docs/siyaos-knowledge-base/                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ kb:build
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Siya Assistant (apps/hipaa-training)                        │
│  Chat + Training + deterministic retrieval                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PATIENT KNOWLEDGE GRAPH (frozen governance v1.0)            │
│  Blocks · entities · Health Guides · public site             │
│  apps/siya-health/ + SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Siya Guide (apps/siya-assistant) — public visitor chat      │
└─────────────────────────────────────────────────────────────┘
```

**Do not merge** patient blocks into internal topics without a clinical/editorial owner review.

**Do write** internal topics in an **organization-agnostic** voice when possible (“how we run telehealth ops”) so CAPR.AI portfolio companies can reuse modules.

## Topic lifecycle

`draft` → `review` → `live` (compiled) → deprecated (remove or mark draft)

## Module owners

See `manifest.json`. Owners approve `live` status and revision history entries.
