---
id: legal-escalation-summaries
module: 11-operations
title: Legal policy talk-tracks — what to say / when to escalate (DRAFT)
status: draft
owner: Founder · Privacy Officer · counsel (pending sign-off)
confidence: draft
reviewDate: 2026-09-01
supersedes: none
kind: topic
bot_retrieve: false
keywords:
  - terms of use
  - privacy policy
  - NPP
  - notice of privacy practices
  - CSA
  - controlled substance agreement
  - cookie policy
  - legal
escalate: Founder / Privacy Officer / counsel
priority: 1
revision:
  - date: 2026-08-06
    author: Siya Assist seed
    note: DRAFT staff talk-tracks only — HELD FOR FOUNDER/LEGAL SIGN-OFF. Not live in Ask. Do not import full legal text.
sources:
  - https://www.siya.health/legal
  - https://www.siya.health/legal/terms-of-use
  - https://www.siya.health/legal/privacy-policy
  - https://www.siya.health/legal/notice-of-privacy-practices
  - https://www.siya.health/legal/controlled-substance-treatment-agreement
  - https://www.siya.health/legal/cookie-policy
  - docs/siyaos-knowledge-base/11-operations/patient-site-faqs/README.md
---

## ⚠️ HOLD — not published to Ask

**Status:** `draft` · **`bot_retrieve: false`**  
**Do not set `status: live` until founder or legal signs off.**

These are **short staff talk-tracks**, not legal advice and not substitutes for the counsel-reviewed documents on `siya.health/legal/*`. Full policy text must **not** be bulk-imported into Ask retrieval.

**Sign-off checklist (before go-live):**

- [ ] Founder reviewed wording  
- [ ] Privacy Officer / counsel reviewed Privacy + NPP lines  
- [ ] Clinical Program reviewed CSA escalate path  
- [ ] Flip to `status: live` + `bot_retrieve: true` + bump `reviewDate`  
- [ ] `npm run kb:build -w @amcare/hipaa-training`

---

## Overview

If a patient asks about Terms, Privacy, NPP, CSA, or Cookie policy: give the **one-line purpose**, point to the **public URL**, and **escalate** anything beyond that.

## Why

Staff should not interpret legal documents in chat. A thin, signed-off talk-track reduces improvisation risk.

## SOP — Universal

1. Do **not** quote long policy passages from memory.  
2. Send the matching `siya.health/legal/...` link.  
3. Use only the “What to say” line below (once signed off).  
4. Escalate per table for disputes, deletion demands, breach concerns, or “I don’t agree but want care anyway” blockers.  
5. No PHI in Ask.

## FAQ — Draft talk-tracks (pending sign-off)

### Terms of Use
- **URL:** https://www.siya.health/legal/terms-of-use  
- **What to say:** “Our Terms of Use describe how the website and services may be used. I can send the link; I can’t change or waive terms in chat.”  
- **Escalate when:** Patient demands exception to terms, threatens legal action, or refuses terms needed to proceed → **Founder / counsel**.

### Privacy Policy
- **URL:** https://www.siya.health/legal/privacy-policy  
- **What to say:** “Our Privacy Policy explains how we handle personal information collected via the site and services. Here’s the link — for anything beyond that summary, I’ll escalate to our privacy owner.”  
- **Escalate when:** Access/deletion requests, vendor-sharing questions, marketing-opt-out disputes, suspected misuse → **Privacy Officer** (then counsel as needed).

### Notice of Privacy Practices (NPP / HIPAA)
- **URL:** https://www.siya.health/legal/notice-of-privacy-practices  
- **What to say:** “The Notice of Privacy Practices explains how protected health information may be used and disclosed for treatment, payment, and operations, and your related rights. I can send the NPP link; I can’t give legal interpretations.”  
- **Escalate when:** Patient rights requests (access, amendment, restrictions, accounting), complaints about PHI handling → **Privacy Officer**.

### Controlled Substance Treatment Agreement (CSA)
- **URL:** https://www.siya.health/legal/controlled-substance-treatment-agreement  
- **What to say:** “If controlled medications are part of a plan, patients review and agree to the Controlled Substance Treatment Agreement — it covers safe use, monitoring, and refill expectations. I can send the link; clinical decisions stay with the provider.”  
- **Escalate when:** Patient refuses CSA but wants stimulants; disputes monitoring/refill rules; “can you skip the agreement?” → **Clinical Program / prescribing provider** (not Billing).  
- **Note:** Full CSA/refill **playbook** is a separate workstream — this draft is talk-track only.

### Cookie Policy
- **URL:** https://www.siya.health/legal/cookie-policy  
- **What to say:** “Our Cookie Policy explains cookies and similar tech on the website and how to manage preferences via the consent tools on the site.”  
- **Escalate when:** Detailed tracking/vendor questions, “delete all my cookies/data” beyond consent UI → **Privacy Officer / Technology**.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Staff pastes full policy into Spruce | Stop — send URL only |
| Ask somehow surfaces this draft | Confirm `bot_retrieve: false` / not live; rebuild KB |
| Patient asks “is my data sold?” | Do not improvise — Privacy Policy link + escalate Privacy Officer |

## AI Context

**DRAFT — not for Ask retrieval until sign-off.** Point to legal URLs; do not interpret statutes; escalate Privacy Officer / Founder / Clinical / counsel per topic. Never import full legal documents into the bot index.

## Related documents

- https://www.siya.health/legal  
- `telehealth-privacy-background` (ops privacy habits — not a substitute for NPP)

## Owner

Founder · Privacy Officer · counsel (pending)
