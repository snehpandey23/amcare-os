# ADHD Care Model Positioning

Generated: 2026-06-05  
Purpose: Accurate copy describing Siya’s ADHD evaluation model for pre-deploy hardening.  
**Status:** Proposed — not yet implemented in production HTML.

---

## Positioning statement (site-wide)

> **Siya Health delivers primary care–led adult ADHD evaluation and treatment** through licensed medical providers—internal medicine, family medicine, and advanced practice clinicians trained in structured ADHD assessment. Evaluations follow **DSM-based diagnostic standards**, combine **validated screening and history tools**, and document clinical rationale for treatment when appropriate. Siya is **not a psychiatry or psychology practice** unless a specific provider’s board certification supports that specialty.

---

## Assessment model (what we do)

### 1. Diagnostic framework

- **DSM-based diagnostic evaluation** — clinician applies DSM-5-TR ADHD criteria using judgment, not questionnaires alone.
- **Structured clinical history** — developmental onset, longitudinal symptom patterns, impairment across work, relationships, and daily function.
- **Differential diagnosis** — screen for anxiety, depression, sleep disorders, thyroid disease, substance use, and other mimics when clinically indicated.

### 2. Validated tools (as clinically appropriate)

| Tool | Role in model |
|------|----------------|
| **ASRS** (Adult ADHD Self-Report Scale) | Initial screening and severity signal; not a standalone diagnosis |
| **DIVA** (Diagnostic Interview for ADHD in Adults) | Structured diagnostic interview to map DSM criteria with patient |
| **Wender Utah Rating Scale** | Childhood symptom retrospective for adult presentations |
| **SWAN** (Strengths and Weaknesses of ADHD Symptoms and Normal Behavior) | Severity and subtype characterization |
| **Creyos** (or comparable objective cognitive assessment) | Optional objective cognitive testing when clinically useful—not required for every patient |

**Current site gap:** `adhd-care.html` mentions **ASRS** and **Creyos** only. **DIVA, Wender Utah, and SWAN are not yet named** in flagship copy.

### 3. Functional impairment & digital context

- **Digital media / functional impairment screening** — how symptoms affect focus, task completion, time management, and digital distraction in real-world settings.
- **Severity tracking** — baseline and follow-up symptom tracking to inform medication titration and non-pharmacologic support.

### 4. Documentation & treatment rationale

- **Documentation to support treatment rationale** — visit note captures history, tool results, impairment domains, informed consent, and plan (including medication management **when clinically appropriate** within prescriber scope).
- **Follow-up cadence** — structured follow-up for response, side effects, and dose adjustment.

### 5. Care delivery model

- **PCP / internal medicine / family medicine model** — ADHD care integrated with primary care scope, not positioned as a standalone psychiatry clinic.
- **State-licensed telehealth** — patients seen only where the assigned provider holds an active license.
- **Not psychiatry unless credential-accurate** — only providers with verified psychiatry board certification may use psychiatry-specific titles in marketing or schema.

---

## Proposed copy blocks

### A. `adhd-care.html` hero subline (replace generic “board-certified” only)

> Same-week **DSM-based adult ADHD evaluation** with licensed medical providers. Structured history, validated tools (ASRS, DIVA, Wender Utah, SWAN), and optional Creyos cognitive testing—plus documented treatment planning when appropriate.

### B. Evaluation steps section

**Step 2 — Clinical evaluation (60–90 min)**

> Your clinician conducts a structured interview aligned with DSM-5-TR criteria, reviews developmental and functional history, and may use validated instruments including ASRS, DIVA, Wender Utah, and SWAN. When indicated, **Creyos** or similar objective cognitive assessment supports the diagnostic picture. We screen for anxiety, depression, sleep, and other conditions that can mimic or worsen ADHD symptoms.

### C. “What makes this different from a quiz”

> Online ADHD quizzes cannot diagnose ADHD. Siya evaluations are **clinician-led**, use **multiple validated tools**, assess **real-world impairment** (including digital and work functioning), and produce **documentation** that supports ongoing care—including medication management when clinically appropriate within your provider’s license and training.

### D. Provider hub / service card disclaimer (footer of ADHD section)

> ADHD services at Siya Health are delivered through **primary care–based licensed medical providers**, not a standalone psychiatry or psychology practice.

### E. Meta description (SEO)

> Adult ADHD evaluation online — DSM-based assessment with licensed medical providers. ASRS, DIVA, Wender Utah, SWAN, optional Creyos. CA, TX, PA, FL. Primary care–led ADHD treatment.

---

## Schema / E-E-A-T alignment

| Element | Recommendation |
|---------|----------------|
| `MedicalWebPage.about` | `MedicalCondition: ADHD` (keep) |
| `Physician.medicalSpecialty` | `Adult ADHD`, `Internal Medicine` or `Family Medicine` — **not** `Psychiatry` unless verified |
| `knowsAbout` | DSM-5-TR evaluation, ASRS, structured ADHD assessment |
| Reviewed content | Only after `signOffSource` on registry entries |

---

## Implementation checklist

| File | Change |
|------|--------|
| `adhd-care.html` (source or generator) | Add DSM, DIVA, Wender Utah, SWAN, impairment, documentation language |
| `adhd-screening.html` | Clarify screening ≠ diagnosis; path to full evaluation |
| `answers/what-included-199-adhd-evaluation` | Enumerate tools in answer body |
| `answers/screening-vs-adhd-evaluation` | ASRS vs full DSM evaluation |
| `data/providers.mjs` | Provider bios: “ADHD-trained clinician” not “psychiatric depth” |
| `blog/how-adhd-medication-is-prescribed-online` | Primary care prescriber scope disclaimer |

---

## What not to claim

- “Psychiatry practice” or “see a psychiatrist” (unless provider-specific and verified)
- “Psychological testing” as a psychology service (use “structured clinical assessment” / “cognitive testing”)
- That any single questionnaire (ASRS alone) constitutes diagnosis
- That Creyos is required for every patient

---

## Gate tie-in

| Item | Status until copy deployed |
|------|---------------------------|
| ADHD model accurately described on flagship page | **BLOCKER** (partial — ASRS/Creyos only today) |
| Primary care positioning explicit | **BLOCKER** |
| Tool inventory complete (DIVA, Wender, SWAN) | **BLOCKER** |
