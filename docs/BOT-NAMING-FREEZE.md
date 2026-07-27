# Bot naming freeze

```text
Status:   FROZEN
Date:     2026-07-26
Rule:     Use these labels in specs, commits, deploys, and chat. Do not invent new product names without an Architecture Review.
```

Two bots. Two audiences. Do not mix them.

| Frozen label | Product name | Audience | Code / deploy (today) | Knowledge |
| --- | --- | --- | --- | --- |
| **External bot** | Siya Guide | Patients / public website visitors | `apps/siya-assistant` · [siya-guide.vercel.app](https://siya-guide.vercel.app) | Public Knowledge API + public site only |
| **Internal bot** | Siya Assist | Staff / company help desk | Internal Siya OS / helpdesk surfaces · not Guide | `docs/siyaos-knowledge-base/` + approved internal SOPs |

## What each may do

**External bot (Guide)**

- Resolve intent → approved public entity
- Answer from public knowledge only
- Link registry CTAs only
- Deterministic safety / PHI / clinical refusals
- No diagnosis, dosing, internal docs, or PHI collection

**Internal bot (Assist)**

- Route staff intent → department → follow-ups → approved internal KB
- Escalate with collected context
- Never become an ERP / dashboard suite by default
- Never serve as the patient-facing website chatbot

## Words that are frozen (do not reuse loosely)

| Say | Mean |
| --- | --- |
| External bot / Guide | Patient-facing public navigator |
| Internal bot / Assist | Staff help desk |
| Public Knowledge API | Shared entity + CTA contract (Guide consumes; Assist must not invent a parallel public graph) |
| Health Guides | Website `/answers` articles — not the chatbot |

## Words that cause confusion (avoid as product names)

| Avoid as product name | Why |
| --- | --- |
| “Siya Assistant” alone | Ambiguous — people hear Guide *or* Assist |
| Folder `apps/siya-assistant` | Historical path for the **external** bot (Guide). Do not rename in this freeze; treat path as legacy. |
| `siya-assistant.vercel.app` | Currently a different project alias — not the Guide production URL. Guide live URL is `siya-guide.vercel.app`. |

## Alignment check (2026-07-26)

The Public Knowledge API + entity-first chat work was correctly scoped to the **external bot (Guide)**, not the internal help desk. That split stands.
