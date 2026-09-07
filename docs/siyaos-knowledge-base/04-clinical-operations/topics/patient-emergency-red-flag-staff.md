---
id: patient-emergency-red-flag-staff
module: 04-clinical-operations
title: Patient emergency / red-flag symptoms — MA chat & phone script
status: live
owner: Clinical Program · Medical Director
confidence: operational
reviewDate: 2026-12-01
supersedes: none
kind: topic
bot_retrieve: true
keywords:
  - emergency
  - life-threatening
  - chest pain
  - anxiety
  - 911
  - urgent care
  - ER
  - red flag
  - protocol
  - what to tell the patient
  - can't breathe
  - stroke
  - heart attack
escalate: Provider / clinical lead (immediate) · 911 / local emergency when danger is immediate
priority: 16
revision:
  - date: 2026-09-06
    author: Gap triage gap-1788697384395
    note: Staff workflow only — not clinical advice; closes soft-stop on chest pain / life-threatening asks
sources:
  - docs/siyaos-knowledge-base/04-clinical-operations/topics/chat-review-sla.md
  - apps/hipaa-training/src/lib/patient-drill/redirects.ts (approved escalate-if-worse language)
links:
  - label: Memory · SOPs
    href: /memory/knowledge/sops
  - label: Chat review SLAs
    href: /memory
---

## Overview

When a patient reports **emergency or red-flag symptoms** (chest pain, can’t breathe, stroke/heart-attack language, suicidal ideation, or anything that sounds **life-threatening**), Medical Assistants give a **safety redirect** and **escalate to a licensed clinician** — they do **not** diagnose, triage severity as a clinician, or keep the patient waiting on portal chat.

## Why

Siya Assist and MA chat are **not** emergency care. Soft-stopping with “no staff guide” leaves staff without the approved workflow. This topic is the **internal** playbook for what to say and who to loop in.

## SOP

1. **Treat it as urgent** — do not continue a routine FAQ, billing, or scheduling thread.
2. **Tell the patient clearly (approved wording):**  
   - *“If this feels urgent and you can’t wait for a doctor’s reply, please go to urgent care or the ER, or call 911.”*  
   - If they are in **immediate danger**: *“Please call 911 (or your local emergency number) now.”*
3. **Do not** give medical advice, dosing, “is this a heart attack?”, anxiety coaching, or promises that a provider will reply in minutes.
4. **Escalate to the provider / clinical lead immediately** (same channel you use for clinical portal messages — see chat-review SLA). Flag **emergency / red-flag**.
5. **Document** in the approved clinical system (time, channel, what the patient said, what you told them, who you escalated to) — **no PHI in Ask**.
6. If the interaction is **live on phone** and they may be unstable: stay calm, repeat the 911 / ER redirect, loop a clinician/supervisor, and do not hang up abruptly while they are seeking help instructions.

### Chest pain + anxiety (common ask)

Patients often pair **chest pain** with **anxiety**. Staff still use the **same emergency redirect** — MAs do **not** decide “it’s only anxiety.” Calm empathy is fine; clinical reassurance is not.

**Example staff line:**  
*“I’m sorry you’re feeling this way. I can’t assess chest pain over chat. If it feels urgent or you’re worried you can’t wait, please call 911 or go to the ER / urgent care now. I’m also alerting the clinical team right away.”*

## FAQ

**Where is the protocol?**  
This guide + **Patient portal chat — response SLAs** (clinical → provider immediately). There is no separate “diagnose chest pain” SOP for MAs — by design.

**What if they’re already in the ER?**  
Thank them, stop clinical Q&A, escalate to provider for chart continuity, document.

**What if it’s only mild anxiety and they deny emergency?**  
Still avoid diagnosing. Offer routine scheduling / provider message path **and** keep escalate-if-worse / 911 language available if symptoms worsen.

## Troubleshooting

| Situation | Action |
|-----------|--------|
| Chest pain, SOB, stroke/HA language, life-threatening | 911/ER/urgent care script + provider immediate |
| Suicidality / self-harm | 911 / local emergency + provider immediate (same urgency) |
| Unsure if clinical | Escalate provider — do not guess |
| Staff asked Ask for a script | Use this topic; do not invent treatment advice |

## AI Context

Answer with **workflow + approved patient lines** only. Never invent clinical triage. Prefer this topic over hostile/abusive-patient SOP when the ask is emergency symptoms. Cite chat-review SLA for escalation timing.

## Related documents

- `docs/siyaos-knowledge-base/04-clinical-operations/topics/chat-review-sla.md`
- Verbally abusive patient SOP (different problem — hostility ≠ medical emergency)

## Owner

Clinical Program · Medical Director

## Revision history

| Date | Change |
|------|--------|
| 2026-09-06 | Added from Assist auto-gap gap-1788697384395 (life-threatening / chest pain + anxiety) |
