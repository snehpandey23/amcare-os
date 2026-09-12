# Siya Health Build-Out — Gap Audit

**Date:** 2026-09-11  
**Source tracker (readable):** `Common Folder/SiyaOS/_incoming/Siya_Health_Master_Tracker.xlsx`  
**Also found at:** `Shared with Me/Siya Health Operational and Compliance Tracker and Checklists/Siya_Health_Master_Tracker.xlsx`  
**Items audited:** 179 (spreadsheet row count; earlier ~149 estimate was low)  

## Summary

| Gap class | Count | % |
|-----------|------:|--:|
| Have it | 5 | 3% |
| Partial | 79 | 44% |
| Missing | 95 | 53% |

### By workstream

| Workstream | Have it | Partial | Missing | Total |
|------------|--------:|--------:|--------:|------:|
| Clinical SOPs | 0 | 8 | 10 | 18 |
| Operational SOPs | 1 | 10 | 5 | 16 |
| HR SOPs & Policies | 0 | 8 | 8 | 16 |
| Telehealth SOPs | 0 | 4 | 8 | 12 |
| Data Room Build-Out | 1 | 10 | 17 | 28 |
| Marketing Re-Brand | 1 | 9 | 3 | 13 |
| Employer Materials | 0 | 2 | 6 | 8 |
| Onboarding - Employees | 1 | 6 | 6 | 13 |
| Onboarding - Clinicians | 1 | 8 | 8 | 17 |
| Go-To-Market | 0 | 9 | 6 | 15 |
| Financial Audit | 0 | 1 | 15 | 16 |
| State Compliance Roadmap | 0 | 4 | 3 | 7 |

## Method

Each tracker row was classified against:

1. **Git live KB** (`docs/siyaos-knowledge-base/`, `status: live`)
2. **Org-Knowledge-Approved** WorkDrive mirror
3. **Brand / medical compliance** (`apps/siya-health/brand/` — Style Lock + MEDICAL-COMPLIANCE-MARKETING)
4. **WorkDrive SiyaOS drafts** (cited as Partial only — not approved)
5. **Portal decision seeds** (CPOM → counsel, not AI)
6. **Staff portal products** (HIPAA training, attendance) where they satisfy a checklist step

**Live `siya_sops` DB** could not be queried this pass — production `DATABASE_URL` is a Vercel secret and local env only has `[SENSITIVE]` placeholders. Citations therefore exclude portal live SOP titles. Re-run gap class for ops items once DB URL is available.

**Have it** = substantial approved/live artifact that fulfills the tracker ask.  
**Partial** = related draft, staff-only topic, outline, or product without the full SOP/deliverable.  
**Missing** = nothing material found.

---

## Clinical SOPs

### 1. Informed Consent for Telehealth Visits

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-001`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/klarity-patient-consents.md`
  - `Org-Knowledge-Approved/Clinical-Operations/01-git-kb-live/klarity-patient-consents.md`
  - `SiyaOS/clinical/intake/`
- **Why:** Klarity patient consents (live) + intake forms; not a clinician telehealth informed-consent SOP covering state statutes.

### 2. Patient Identity & Location Verification

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-002`  
- **Citations:** _none_
- **Why:** No dedicated identity/location-at-visit SOP in live KB or approved mirror.

### 3. Standard of Care / Visit Documentation

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-003`  
- **Citations:** _none_
- **Why:** No visit documentation / standard-of-care SOP found.

### 4. Controlled Substance Prescribing via Telehealth

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-004`  
- **Citations:**
  - `SiyaOS/clinical/controlled-substance-agreement-modifications-draft.md`
  - `docs/siyaos-knowledge-base/04-clinical-operations/topics/refill-pharmacy-staff-guidance.md`
- **Why:** CSA modifications draft + refill staff guidance; not Ryan Haight / DEA telehealth prescribing SOP.

### 5. Non-Controlled Prescribing SOP

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `01-Clinical-SOPs-005`  
- **Citations:** _none_

### 6. PDMP (Prescription Drug Monitoring Program) Query Policy

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-006`  
- **Citations:** _none_

### 7. Clinical Escalation & Emergency Protocol

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-007`  
- **Citations:**
  - `docs/siyaos-knowledge-base/04-clinical-operations/topics/patient-emergency-red-flag-staff.md`
  - `Org-Knowledge-Approved/Clinical-Operations/01-git-kb-live/patient-emergency-red-flag-staff.md`
  - `docs/siyaos-knowledge-base/11-operations/topics/escalation-pathways.md`
  - `SiyaOS/clinical/crisis-suicidal-thoughts-ma-workflow-draft.md`
- **Why:** Staff MA emergency/red-flag + escalation pathways live; clinician emergency protocol SOP not written as tracker item.

### 8. Referral & Care Coordination SOP

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `01-Clinical-SOPs-008`  
- **Citations:** _none_

### 9. Diagnostic Criteria & Assessment Tools SOP

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `01-Clinical-SOPs-009`  
- **Citations:**
  - `SiyaOS/clinical/creyos-clinical-overview.md`
  - `SiyaOS/clinical/intake/`
- **Why:** Creyos/intake materials on WorkDrive; not an approved diagnostic-criteria SOP.

### 10. Lab Ordering & Results Management

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `01-Clinical-SOPs-010`  
- **Citations:** _none_

### 11. Scope of Practice by License Type

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-011`  
- **Citations:** _none_

### 12. Chart/EHR Documentation Standards

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `01-Clinical-SOPs-012`  
- **Citations:**
  - `docs/siyaos-knowledge-base/04-clinical-operations/topics/chat-review-sla.md`
- **Why:** Chat review SLA exists; not full chart/EHR documentation standards.

### 13. Informed Refusal & Non-Compliance Documentation

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `01-Clinical-SOPs-013`  
- **Citations:** _none_

### 14. Clinical Peer Review / Quality Assurance Program

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `01-Clinical-SOPs-014`  
- **Citations:**
  - `SiyaOS/HR/vc-patient-feedback-survey-healthie.md`
  - `SiyaOS/HR/README-vc-quality.md`
- **Why:** VC quality/feedback drafts only; no peer-review program SOP.

### 15. Adverse Event & Sentinel Event Reporting SOP

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `01-Clinical-SOPs-015`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-breach.md`
- **Why:** HIPAA breach topic covers privacy incidents; clinical adverse/sentinel-event SOP not found.

### 16. Medication Reconciliation SOP

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `01-Clinical-SOPs-016`  
- **Citations:**
  - `docs/siyaos-knowledge-base/04-clinical-operations/topics/refill-pharmacy-staff-guidance.md`
- **Why:** Refill/pharmacy staff guidance only.

### 17. Termination of Care / Patient Discharge SOP

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `01-Clinical-SOPs-017`  
- **Citations:** _none_

### 18. Telehealth Visit Technical-Failure Contingency

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `01-Clinical-SOPs-018`  
- **Citations:** _none_

## Operational SOPs

### 1. Vendor & Third-Party Risk Management SOP

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-001`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-breach.md`
  - `SiyaOS/compliance/exhibit-b-hipaa-subcontractor-standalone.md`
- **Why:** BAA/subcontractor exhibit draft + breach topic; no annual vendor risk-management SOP.

### 2. EHR / Telehealth Platform Validation & Change Control

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-002`  
- **Citations:**
  - `docs/siyaos-knowledge-base/08-technology/topics/ma-platforms-zoho-spruce.md`
  - `SiyaOS/operations/product-manual-ma-platforms-draft.md`
- **Why:** Platform inventory topics exist; validation/change-control SOP missing.

### 3. Incident Response & Breach Notification SOP

- **Gap:** Have it  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-003`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-breach.md`
  - `Org-Knowledge-Approved/Compliance/01-git-kb-live/hipaa-breach.md`
- **Why:** Live HIPAA breach / notification topic in git KB + approved mirror.

### 4. Business Continuity & Disaster Recovery Plan

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `02-Operational-SOPs-004`  
- **Citations:** _none_

### 5. Scheduling & No-Show/Cancellation Policy

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `02-Operational-SOPs-005`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/billing-late-cancel.md`
- **Why:** Late cancel/no-show billing covered; full scheduling SOP incomplete.

### 6. Patient Complaint & Grievance SOP

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `02-Operational-SOPs-006`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/patient-manager-request-provisional.md`
- **Why:** Provisional patient→manager path only.

### 7. Billing, Coding & Claims SOP

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-007`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/discovery-call-staff-billing.md`
  - `docs/siyaos-knowledge-base/11-operations/topics/daily-payment-check.md`
  - `docs/siyaos-knowledge-base/12-finance/topics/patient-pricing-public-canonical.md`
- **Why:** Cash-pay billing/pricing topics live; formal coding/claims SOP for insurance not present.

### 8. Refund & Membership Cancellation Policy

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `02-Operational-SOPs-008`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/klarity-billing-cancellation.md`
  - `docs/siyaos-knowledge-base/11-operations/topics/billing-late-cancel.md`
- **Why:** Klarity cancellation + late-cancel topics; unified refund/membership policy incomplete.

### 9. Records Retention & Destruction Schedule

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-009`  
- **Citations:** _none_

### 10. Access Control & Role-Based Permissions SOP

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-010`  
- **Citations:**
  - `SiyaOS/compliance/hipaa-remote-workstation-standards.md`
  - `SiyaOS/compliance/hipaa-workstation-technical-standards-draft.md`
- **Why:** Workstation standards drafts; not full RBAC SOP.

### 11. Device & Endpoint Security Policy

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `02-Operational-SOPs-011`  
- **Citations:**
  - `SiyaOS/compliance/hipaa-remote-workstation-standards.md`
- **Why:** Remote workstation standards on WorkDrive; not approved live SOP.

### 12. Vendor Business Associate Agreement (BAA) Tracker

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-012`  
- **Citations:**
  - `SiyaOS/compliance/exhibit-b-hipaa-subcontractor-standalone.md`
- **Why:** Exhibit B template exists; no live BAA tracker artifact.

### 13. Quality Metrics & KPI Reporting Cadence

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `02-Operational-SOPs-013`  
- **Citations:** _none_

### 14. Corporate Practice of Medicine (CPOM) Structure Review

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-014`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM/MSO decisions)`
  - `apps/hipaa-training/docs/FOUNDER-COACH-PHASE1.md`
- **Why:** Decisions seeded: CPOM → healthcare regulatory counsel (not AI). Structure-review work product itself not in approved KB.

### 15. Facilities-Free Operations Attestation

- **Gap:** Missing  
- **Priority:** Low  
- **ID:** `02-Operational-SOPs-015`  
- **Citations:** _none_

### 16. Insurance & Liability Coverage Review

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `02-Operational-SOPs-016`  
- **Citations:** _none_

## HR SOPs & Policies

### 1. Employee Handbook (Remote-First)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-001`  
- **Citations:**
  - `SiyaOS/HR/employee-handbook-outline-telemedicine.md`
  - `SiyaOS/HR/README-policy-stack.md`
- **Why:** Outline + policy-stack roadmap only — not a finished handbook.

### 2. Background Check & Screening Policy

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-002`  
- **Citations:** _none_

### 3. Licensure & Credential Verification Policy (Clinical)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-003`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Credentialing checklist on WorkDrive; not live/approved policy.

### 4. I-9 / Employment Eligibility Verification SOP

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-004`  
- **Citations:** _none_

### 5. Multi-State Payroll & Tax Registration SOP

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-005`  
- **Citations:** _none_

### 6. Remote Work & Home-Office Policy

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `03-HR-SOPs-Policies-006`  
- **Citations:**
  - `SiyaOS/compliance/hipaa-remote-workstation-standards.md`
- **Why:** HIPAA remote workstation draft; broader remote-work HR policy missing.

### 7. Anti-Harassment & Non-Discrimination Policy

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-007`  
- **Citations:**
  - `SiyaOS/HR/posh-policy-outline-india-remote.md`
- **Why:** India POSH outline only; US multi-state anti-harassment policy missing.

### 8. Leave of Absence Policy (FMLA/State Leave)

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `03-HR-SOPs-Policies-008`  
- **Citations:**
  - `docs/siyaos-knowledge-base/10-hr/topics/leave-pto-request-provisional.md`
- **Why:** Provisional leave/PTO steps only — not approved FMLA/state leave policy.

### 9. Performance Management & PIP Process

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `03-HR-SOPs-Policies-009`  
- **Citations:** _none_

### 10. Disciplinary Action & Termination SOP

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `03-HR-SOPs-Policies-010`  
- **Citations:** _none_

### 11. Independent Contractor vs. Employee Classification Policy

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-011`  
- **Citations:**
  - `SiyaOS/HR/templates/contractor-service-agreement-CORE-summary.md`
  - `SiyaOS/HR/sow/`
- **Why:** Contractor templates + SOWs; classification policy not formalized.

### 12. Confidentiality, IP Assignment & Non-Solicit Agreement

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `03-HR-SOPs-Policies-012`  
- **Citations:**
  - `SiyaOS/HR/templates/contractor-service-agreement-CORE-summary.md`
- **Why:** Contractor agreement summary; not a standalone confidentiality/IP policy pack.

### 13. Code of Conduct & Conflict of Interest Policy

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `03-HR-SOPs-Policies-013`  
- **Citations:** _none_

### 14. Workplace Safety / Ergonomics Policy (Remote)

- **Gap:** Missing  
- **Priority:** Low  
- **ID:** `03-HR-SOPs-Policies-014`  
- **Citations:** _none_

### 15. Compensation & Benefits Administration SOP

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `03-HR-SOPs-Policies-015`  
- **Citations:** _none_

### 16. New Hire Data Privacy & Acceptable Use Policy

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `03-HR-SOPs-Policies-016`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-training-cert.md`
  - `SiyaOS/compliance/hipaa-remote-workstation-standards.md`
- **Why:** Related HIPAA/security materials; dedicated AUP not written.

## Telehealth SOPs

### 1. State Medical Licensure Matrix Maintenance

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `04-Telehealth-SOPs-001`  
- **Citations:** _none_
- **Why:** No live licensure matrix artifact found in KB/approved.

### 2. Interstate Medical Licensure Compact (IMLC) Utilization SOP

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `04-Telehealth-SOPs-002`  
- **Citations:** _none_

### 3. Telehealth Modality Standards (Audio-Video vs. Audio-Only)

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `04-Telehealth-SOPs-003`  
- **Citations:** _none_

### 4. Patient Originating-Site / Physical-Location Documentation

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `04-Telehealth-SOPs-004`  
- **Citations:** _none_

### 5. Technology Platform HIPAA Security Requirements

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `04-Telehealth-SOPs-005`  
- **Citations:**
  - `docs/siyaos-knowledge-base/08-technology/topics/ma-platforms-zoho-spruce.md`
  - `SiyaOS/compliance/hipaa-workstation-technical-standards-draft.md`
- **Why:** Platform + workstation drafts; formal telehealth platform HIPAA requirements SOP incomplete.

### 6. Cross-State Prescribing Rules Matrix

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `04-Telehealth-SOPs-006`  
- **Citations:** _none_

### 7. Telehealth Informed Consent Language by State

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `04-Telehealth-SOPs-007`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/klarity-patient-consents.md`
- **Why:** Klarity consents exist; state-by-state telehealth consent language pack missing.

### 8. Out-of-State Emergency Coverage Protocol

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `04-Telehealth-SOPs-008`  
- **Citations:**
  - `docs/siyaos-knowledge-base/04-clinical-operations/topics/patient-emergency-red-flag-staff.md`
- **Why:** Emergency staff script exists; per-location out-of-state coverage protocol missing.

### 9. Telehealth Parity & Reimbursement Policy Tracking

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `04-Telehealth-SOPs-009`  
- **Citations:** _none_

### 10. Corporate Practice of Medicine (CPOM) Compliance by State

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `04-Telehealth-SOPs-010`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM/MSO decisions)`
  - `State Compliance Roadmap tab (tracker)`
- **Why:** CPOM decisions seeded (counsel-not-AI + extraction-only attorney docs); per-state compliance pack not in approved KB.

### 11. Telehealth Platform Downtime / Failover SOP

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `04-Telehealth-SOPs-011`  
- **Citations:** _none_

### 12. Minor/Pediatric Telehealth Consent SOP

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `04-Telehealth-SOPs-012`  
- **Citations:** _none_

## Data Room Build-Out

### 1. One-pager

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-001`  
- **Citations:**
  - `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md`
- **Why:** No dedicated public one-pager; seed deck placeholder only.

### 2. Pitch deck (financials, ask, valuation, terms)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-002`  
- **Citations:**
  - `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md`
  - `apps/siya-health/brand/investor`
- **Why:** Placeholder/investor folder; not a completed data-room pitch deck.

### 3. Brand guidelines & visual identity

- **Gap:** Have it  
- **Priority:** Medium  
- **ID:** `05-Data-Room-Build-Out-003`  
- **Citations:**
  - `apps/siya-health/brand/BRAND-STYLE-LOCK.md`
  - `apps/siya-health/brand/AGENT-BOOTSTRAP.md`
- **Why:** Brand Style Lock is the visual identity source of truth.

### 4. Revenue & growth projections (min. covers raise period)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-004`  
- **Citations:** _none_

### 5. Key KPIs (revenue, active members, retention, CAC/LTV)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-005`  
- **Citations:** _none_

### 6. P&L / historical cash flow statements

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-006`  
- **Citations:** _none_

### 7. Cap table

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-007`  
- **Citations:** _none_

### 8. Trademarks (registered/pending) & IP strategy

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `05-Data-Room-Build-Out-008`  
- **Citations:** _none_

### 9. Market sizing & competitive analysis

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-009`  
- **Citations:**
  - `SiyaOS/marketing/strategy/competitor-concierge-access-matrix.md`
- **Why:** Competitor matrix draft on WorkDrive; not data-room-ready package.

### 10. Sales process & pipeline (pilot partners)

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-010`  
- **Citations:** _none_

### 11. Employee/contractor roster, titles, agreements

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-011`  
- **Citations:**
  - `SiyaOS/HR/sow/active-sow-assignments-registry.md`
- **Why:** SOW assignment registry exists; full roster/agreements pack not assembled for data room.

### 12. Clinician roster with licensure status

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-012`  
- **Citations:** _none_

### 13. System architecture diagram + platform BAAs

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-013`  
- **Citations:**
  - `docs/siyaos-knowledge-base/08-technology/topics/amcare-os-overview.md`
  - `docs/siyaos-knowledge-base/08-technology/topics/ma-platforms-zoho-spruce.md`
- **Why:** Platform overview topics; architecture diagram + BAA binder missing.

### 14. Board and shareholder actions/minutes

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `05-Data-Room-Build-Out-014`  
- **Citations:** _none_

### 15. Articles/Certificate of Incorporation, Bylaws, Cap Table, Shareholder Agreements

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-015`  
- **Citations:** _none_

### 16. PC/MSO management services agreement

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-016`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM/MSO attorney docs decision)`
- **Why:** Decision: attorney-drafted CPOM/MSO docs are extraction-only / restricted; agreement itself not in approved KB.

### 17. Risk factors and mitigation summary

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-017`  
- **Citations:** _none_

### 18. Pending/threatened litigation disclosures

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-018`  
- **Citations:** _none_

### 19. Most recent audited/unaudited financials

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-019`  
- **Citations:** _none_

### 20. State medical licenses — entity & clinicians

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-020`  
- **Citations:** _none_

### 21. DEA registrations

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-021`  
- **Citations:** _none_

### 22. Malpractice/professional liability insurance certificates

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-022`  
- **Citations:** _none_

### 23. HIPAA policies, Security Risk Assessment, breach log

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-023`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-breach.md`
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-training-cert.md`
  - `SiyaOS/compliance/`
- **Why:** Breach + training topics + compliance drafts; full SRA + policy binder + breach log for data room not assembled.

### 24. Signed Business Associate Agreements (BAAs)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `05-Data-Room-Build-Out-024`  
- **Citations:**
  - `SiyaOS/compliance/exhibit-b-hipaa-subcontractor-standalone.md`
- **Why:** Template/exhibit; signed BAA set not in approved mirror.

### 25. Collaborative practice / supervision agreements (NP/PA)

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-025`  
- **Citations:** _none_

### 26. Telehealth registration/certificate where states require it

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-026`  
- **Citations:** _none_

### 27. Standard customer/membership agreement template

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `05-Data-Room-Build-Out-027`  
- **Citations:**
  - `SiyaOS/accounts/bronze-plan-terms-and-conditions.md`
  - `docs/siyaos-knowledge-base/12-finance/topics/patient-pricing-public-canonical.md`
- **Why:** Bronze plan T&Cs on WorkDrive + public pricing; membership agreement template may need legal finalize.

### 28. Vendor, NDA, and partnership agreements

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `05-Data-Room-Build-Out-028`  
- **Citations:**
  - `SiyaOS/marketing/partnerships/`
- **Why:** Partnership frameworks draft; agreement binder not assembled.

## Marketing Re-Brand

### 1. Brand style guide finalization

- **Gap:** Have it  
- **Priority:** Critical  
- **ID:** `06-Marketing-Re-Brand-001`  
- **Citations:**
  - `apps/siya-health/brand/BRAND-STYLE-LOCK.md`
  - `apps/siya-health/brand/AGENT-BOOTSTRAP.md`
  - `Org-Knowledge-Approved/Marketing/01-git-kb-live/brand-entities-voice.md`
- **Why:** Style Lock is the locked brand system (cream/navy/magenta). Tracker notes cite superseded plum palette — treat Style Lock as canonical; update tracker notes.

### 2. Logo usage & lock-up guidelines

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `06-Marketing-Re-Brand-002`  
- **Citations:**
  - `apps/siya-health/brand/BRAND-STYLE-LOCK.md`
  - `SiyaOS/_shared/brand-assets/README.md`
- **Why:** Tokens/logo rules in Style Lock; dedicated lock-up one-pager not isolated.

### 3. Investor pitch deck (rebrand pass)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `06-Marketing-Re-Brand-003`  
- **Citations:**
  - `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md`
  - `apps/siya-health/brand/investor`
- **Why:** Seed deck placeholder + investor brand folder; not a finished rebranded pitch deck.

### 4. Website refresh — patient-facing

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `06-Marketing-Re-Brand-004`  
- **Citations:**
  - `apps/siya-health/`
  - `docs/siyaos-knowledge-base/decisions/homepage-cta-meet-and-greet.md`
- **Why:** Live patient site exists; continuous refresh vs closed rebrand deliverable.

### 5. Website refresh — provider/careers page

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `06-Marketing-Re-Brand-005`  
- **Citations:**
  - `apps/siya-health/ (provider careers / site)`
  - `integrations/hipaa-training-api/src/database/provider-careers-schema.sql`
- **Why:** Careers inquiry path exists; full provider/careers page refresh not closed.

### 6. Sales one-pager (general)

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `06-Marketing-Re-Brand-006`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/service-line-blurbs.md`
- **Why:** Service-line blurbs live; dedicated sales one-pager incomplete.

### 7. Pilot partner proposal template

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `06-Marketing-Re-Brand-007`  
- **Citations:** _none_

### 8. Email signature & internal templates

- **Gap:** Missing  
- **Priority:** Low  
- **ID:** `06-Marketing-Re-Brand-008`  
- **Citations:** _none_

### 9. Social media templates (LinkedIn, IG)

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `06-Marketing-Re-Brand-009`  
- **Citations:**
  - `apps/siya-health/brand/VISUAL-OS.md`
  - `apps/siya-health/brand/statics/`
  - `apps/siya-health/brand/editorial-packs/`
- **Why:** Visual OS + statics/editorial packs; not packaged as a single social template kit.

### 10. Patient intake / welcome packet re-skin

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `06-Marketing-Re-Brand-010`  
- **Citations:**
  - `SiyaOS/clinical/intake/`
  - `SiyaOS/marketing/onboarding/welcome-newsletter-spec.md`
- **Why:** Intake forms + welcome newsletter spec; branded welcome packet re-skin incomplete.

### 11. Provider bios & photography refresh

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `06-Marketing-Re-Brand-011`  
- **Citations:**
  - `apps/siya-health/brand/photography/`
- **Why:** Photography system exists; provider bio refresh not closed.

### 12. Press kit / media one-pager

- **Gap:** Missing  
- **Priority:** Low  
- **ID:** `06-Marketing-Re-Brand-012`  
- **Citations:** _none_

### 13. Brand asset library (Canva/Figma source files)

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `06-Marketing-Re-Brand-013`  
- **Citations:**
  - `apps/siya-health/brand/assets/`
  - `SiyaOS/_shared/brand-assets/`
- **Why:** Brand assets folders exist; Canva/Figma library packaging unclear.

## Employer Materials

### 1. Employer benefits booklet (full)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `07-Employer-Materials-001`  
- **Citations:** _none_

### 2. Employer one-page leave-behind

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `07-Employer-Materials-002`  
- **Citations:** _none_

### 3. Employee enrollment flyer (for distribution by employer)

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `07-Employer-Materials-003`  
- **Citations:** _none_

### 4. Employer ROI / outcomes one-pager

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `07-Employer-Materials-004`  
- **Citations:** _none_

### 5. HR/benefits-broker slide deck

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `07-Employer-Materials-005`  
- **Citations:** _none_

### 6. Employer FAQ document (privacy, eligibility, billing)

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `07-Employer-Materials-006`  
- **Citations:**
  - `apps/siya-health/employers.html`
  - `docs/siyaos-knowledge-base/11-operations/topics/patient-faq-insurance-cash-pay.md`
- **Why:** Employers page + patient FAQs; dedicated employer FAQ pack missing.

### 7. Pilot program overview one-pager

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `07-Employer-Materials-007`  
- **Citations:** _none_

### 8. Case study / testimonial template

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `07-Employer-Materials-008`  
- **Citations:**
  - `apps/siya-health/brand/MEDICAL-COMPLIANCE-MARKETING.md`
- **Why:** Compliance rules for testimonials exist; case-study template itself missing.

## Onboarding - Employees

### 1. Offer letter & background check completion

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `08-Onboarding-Employees-001`  
- **Citations:** _none_

### 2. I-9 / E-Verify completion

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `08-Onboarding-Employees-002`  
- **Citations:** _none_

### 3. State new-hire reporting filed

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `08-Onboarding-Employees-003`  
- **Citations:** _none_

### 4. Payroll & tax withholding setup (state of residence)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `08-Onboarding-Employees-004`  
- **Citations:** _none_

### 5. Equipment provisioning (laptop, MFA, VPN)

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `08-Onboarding-Employees-005`  
- **Citations:**
  - `SiyaOS/technology/systems-stack-india-ops-draft.md`
  - `SiyaOS/technology/vpn-nordlayer-procurement-draft.md`
- **Why:** Systems/VPN drafts; no complete provisioning checklist as approved SOP.

### 6. HIPAA & security awareness training (initial)

- **Gap:** Have it  
- **Priority:** Critical  
- **ID:** `08-Onboarding-Employees-006`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-training-cert.md`
  - `apps/hipaa-training/`
  - `Org-Knowledge-Approved/Compliance/01-git-kb-live/hipaa-training-cert.md`
- **Why:** Staff HIPAA training product + certification topic live.

### 7. Handbook acknowledgment signed

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `08-Onboarding-Employees-007`  
- **Citations:**
  - `SiyaOS/HR/employee-handbook-outline-telemedicine.md`
- **Why:** Handbook not finished; acknowledgment step cannot be complete.

### 8. Benefits enrollment

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `08-Onboarding-Employees-008`  
- **Citations:** _none_

### 9. Role-based systems access provisioned

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `08-Onboarding-Employees-009`  
- **Citations:**
  - `docs/siyaos-knowledge-base/08-technology/topics/ma-platforms-zoho-spruce.md`
- **Why:** Platform overview live; onboarding access checklist form missing.

### 10. Manager 30/60/90 check-ins scheduled

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `08-Onboarding-Employees-010`  
- **Citations:**
  - `SiyaOS/HR/training/ma-7-day-training-schedule.md`
  - `SiyaOS/HR/ceo-weekly-1on1-scan-focus-act.md`
- **Why:** MA training + 1:1 templates; formal 30/60/90 onboarding cadence missing.

### 11. Remote work / home-office policy acknowledgment

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `08-Onboarding-Employees-011`  
- **Citations:**
  - `SiyaOS/compliance/hipaa-remote-workstation-standards.md`
- **Why:** Related workstation standards; policy acknowledgment depends on finished remote-work policy.

### 12. Anti-harassment training (state-mandated where applicable)

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `08-Onboarding-Employees-012`  
- **Citations:**
  - `SiyaOS/HR/posh-policy-outline-india-remote.md`
- **Why:** India POSH outline only; US state-mandated training program missing.

### 13. 90-day performance check-in

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `08-Onboarding-Employees-013`  
- **Citations:** _none_

## Onboarding - Clinicians

### 1. State medical license verification (primary source)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-001`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Checklist draft on WorkDrive; not live approved SOP + matrix.

### 2. DEA registration verification (if prescribing controlled substances)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-002`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Checklist draft on WorkDrive.

### 3. NPI number confirmation

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-003`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Checklist draft on WorkDrive.

### 4. Malpractice / professional liability insurance certificate

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-004`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Checklist draft on WorkDrive.

### 5. Board certification verification

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `09-Onboarding-Clinicians-005`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Checklist draft on WorkDrive.

### 6. OIG/SAM exclusion list & sanctions check

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-006`  
- **Citations:**
  - `SiyaOS/HR/provider-credentialing-requirements-checklist.md`
- **Why:** Likely covered in credentialing checklist draft; confirm when promoting.

### 7. Credentialing committee approval / privileging

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-007`  
- **Citations:** _none_

### 8. Collaborative practice / supervision agreement executed (NP/PA)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-008`  
- **Citations:** _none_

### 9. Multi-state licensure gap review vs. active/target states

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-009`  
- **Citations:** _none_

### 10. EHR / e-prescribing platform training & credential setup

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-010`  
- **Citations:**
  - `docs/siyaos-knowledge-base/08-technology/topics/ma-platforms-zoho-spruce.md`
- **Why:** Platform docs for MA stack; clinician curriculum missing.

### 11. Clinical SOP acknowledgment (all titles in Clinical SOPs tab)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-011`  
- **Citations:** _none_
- **Why:** Depends on Clinical SOPs being written; cannot acknowledge what does not exist.

### 12. HIPAA & security awareness training

- **Gap:** Have it  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-012`  
- **Citations:**
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-training-cert.md`
  - `apps/hipaa-training/`
- **Why:** Staff HIPAA training product + certification topic live (clinicians can use same track).

### 13. PDMP registration in each prescribing state

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `09-Onboarding-Clinicians-013`  
- **Citations:** _none_

### 14. Shadowing / clinical onboarding visits

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `09-Onboarding-Clinicians-014`  
- **Citations:** _none_

### 15. Peer review / QA program enrollment

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `09-Onboarding-Clinicians-015`  
- **Citations:** _none_

### 16. Payer/cash-pay billing training

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `09-Onboarding-Clinicians-016`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/discovery-call-staff-billing.md`
  - `docs/siyaos-knowledge-base/12-finance/topics/patient-pricing-public-canonical.md`
- **Why:** Staff billing/pricing topics; clinician billing training curriculum missing.

### 17. 90-day clinical quality check-in

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `09-Onboarding-Clinicians-017`  
- **Citations:** _none_

## Go-To-Market

### 1. Finalize ICP & messaging (DTC patient vs. employer/pilot buyer)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `10-Go-To-Market-001`  
- **Citations:**
  - `docs/siyaos-knowledge-base/05-marketing-os/MARKETING-OS-v1.1.md`
  - `SiyaOS/marketing/strategy/5w1h-marketing-framework-draft.md`
- **Why:** Marketing OS frozen/live; ICP finalize still a GTM action.

### 2. Competitive differentiation refresh

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `10-Go-To-Market-002`  
- **Citations:**
  - `SiyaOS/marketing/strategy/competitor-concierge-access-matrix.md`
- **Why:** Competitor matrix on WorkDrive; refresh not closed.

### 3. Paid social / search channel plan

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `10-Go-To-Market-003`  
- **Citations:**
  - `SiyaOS/marketing/strategy/six-month-patient-acquisition-plan-draft.md`
- **Why:** Acquisition plan draft only.

### 4. Content/SEO plan for ADHD, fatigue, metabolic health

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `10-Go-To-Market-004`  
- **Citations:**
  - `apps/siya-health/brand/EDITORIAL-OS.md`
  - `apps/siya-health/ (condition pages / indexes)`
- **Why:** Editorial OS + site content graph; formal SEO plan doc incomplete.

### 5. Referral / affiliate program design

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `10-Go-To-Market-005`  
- **Citations:**
  - `SiyaOS/marketing/partnerships/`
- **Why:** Partnership frameworks draft; program not launched.

### 6. Conversion funnel & landing page build

- **Gap:** Partial  
- **Priority:** High  
- **ID:** `10-Go-To-Market-006`  
- **Citations:**
  - `docs/siyaos-knowledge-base/11-operations/topics/legacy-pricing-funnel-unresolved.md`
  - `apps/siya-health/`
- **Why:** Site live; funnel unresolved topic acknowledges gap.

### 7. Target pilot partner list (employers, health systems)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `10-Go-To-Market-007`  
- **Citations:** _none_

### 8. Pilot program structure & success metrics defined

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `10-Go-To-Market-008`  
- **Citations:** _none_

### 9. Outreach sequence & pitch materials

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `10-Go-To-Market-009`  
- **Citations:** _none_

### 10. Pilot-to-contract conversion playbook

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `10-Go-To-Market-010`  
- **Citations:** _none_

### 11. Prioritize next 3-5 states by demand + regulatory ease

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `10-Go-To-Market-011`  
- **Citations:**
  - `State Compliance Roadmap tab (tracker)`
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM)`
- **Why:** Roadmap lists active + next states; prioritization analysis not documented.

### 12. Membership retention / win-back program

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `10-Go-To-Market-012`  
- **Citations:** _none_

### 13. NPS / patient satisfaction tracking cadence

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `10-Go-To-Market-013`  
- **Citations:**
  - `SiyaOS/HR/vc-patient-feedback-survey-healthie.md`
- **Why:** Feedback survey draft; NPS cadence not operationalized.

### 14. GTM KPI dashboard (CAC, LTV, conversion, pilot pipeline)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `10-Go-To-Market-014`  
- **Citations:** _none_

### 15. Launch communications plan for re-brand rollout

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `10-Go-To-Market-015`  
- **Citations:**
  - `apps/siya-health/brand/BRAND-STYLE-LOCK.md`
  - `docs/siyaos-knowledge-base/05-marketing-os/MARKETING-OS-v1.1.md`
- **Why:** Brand + Marketing OS exist; launch communications plan not written.

## Financial Audit

### 1. Full GL reconciliation (bank, credit card, merchant processor)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-001`  
- **Citations:** _none_
- **Why:** No finance audit artifacts in live KB/approved mirror.

### 2. Chart of accounts standardization

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `11-Financial-Audit-002`  
- **Citations:** _none_

### 3. AR/AP aging review & cleanup

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `11-Financial-Audit-003`  
- **Citations:** _none_

### 4. Revenue recognition policy for membership revenue

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-004`  
- **Citations:** _none_

### 5. Payroll & contractor payment reconciliation (1099 vs W-2)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-005`  
- **Citations:** _none_

### 6. Sales/use tax nexus review by state

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `11-Financial-Audit-006`  
- **Citations:** _none_

### 7. State business registration / foreign qualification review

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-007`  
- **Citations:** _none_

### 8. 1099 issuance readiness for contractors/clinicians

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `11-Financial-Audit-008`  
- **Citations:** _none_

### 9. Produce clean P&L, balance sheet, cash flow (trailing 24 mo)

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-009`  
- **Citations:** _none_

### 10. Independent review or audit engagement (if targeting institutional capital)

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `11-Financial-Audit-010`  
- **Citations:** _none_

### 11. Build 3-statement financial model with state-expansion scenarios

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-011`  
- **Citations:** _none_

### 12. Unit economics: CAC, LTV, contribution margin by state/channel

- **Gap:** Missing  
- **Priority:** Critical  
- **ID:** `11-Financial-Audit-012`  
- **Citations:** _none_

### 13. Cash runway & burn multiple tracking

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `11-Financial-Audit-013`  
- **Citations:** _none_

### 14. Pilot/employer revenue scenario modeling

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `11-Financial-Audit-014`  
- **Citations:** _none_

### 15. Monthly close checklist & calendar

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `11-Financial-Audit-015`  
- **Citations:** _none_

### 16. Expense approval / spend policy

- **Gap:** Partial  
- **Priority:** Medium  
- **ID:** `11-Financial-Audit-016`  
- **Citations:**
  - `integrations/hipaa-training-api/src/audit-knowledge-sop-pack.ts (expense reimbursement interim draft SOP)`
- **Why:** Interim expense reimbursement draft SOP in audit pack; spend policy not finalized.

## State Compliance Roadmap

### 1. California (active)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `12-State-Compliance-Roadmap-001`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM/MSO decisions)`
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/`
- **Why:** Active PC state; CPOM → counsel. No completed per-state checklist pack in approved KB.

### 2. Texas (active)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `12-State-Compliance-Roadmap-002`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM/MSO decisions)`
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/`
- **Why:** Active PC state; roadmap research columns not evidenced as completed docs.

### 3. Pennsylvania (active)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `12-State-Compliance-Roadmap-003`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM decisions)`
- **Why:** Listed active; no state compliance pack in approved KB.

### 4. Florida (active)

- **Gap:** Partial  
- **Priority:** Critical  
- **ID:** `12-State-Compliance-Roadmap-004`  
- **Citations:**
  - `integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM decisions)`
- **Why:** Listed active; FL telehealth registration verification pack not found.

### 5. [Next expansion state #1]

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `12-State-Compliance-Roadmap-005`  
- **Citations:** _none_
- **Why:** Placeholder row — state not named.

### 6. [Next expansion state #2]

- **Gap:** Missing  
- **Priority:** High  
- **ID:** `12-State-Compliance-Roadmap-006`  
- **Citations:** _none_
- **Why:** Placeholder row — state not named.

### 7. [Next expansion state #3]

- **Gap:** Missing  
- **Priority:** Medium  
- **ID:** `12-State-Compliance-Roadmap-007`  
- **Citations:** _none_
- **Why:** Placeholder row — state not named.

---

## Have-it inventory (complete list)

- **Operational SOPs** — Incident Response & Breach Notification SOP
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-breach.md`
  - `Org-Knowledge-Approved/Compliance/01-git-kb-live/hipaa-breach.md`
- **Data Room Build-Out** — Brand guidelines & visual identity
  - `apps/siya-health/brand/BRAND-STYLE-LOCK.md`
  - `apps/siya-health/brand/AGENT-BOOTSTRAP.md`
- **Marketing Re-Brand** — Brand style guide finalization
  - `apps/siya-health/brand/BRAND-STYLE-LOCK.md`
  - `apps/siya-health/brand/AGENT-BOOTSTRAP.md`
  - `Org-Knowledge-Approved/Marketing/01-git-kb-live/brand-entities-voice.md`
- **Onboarding - Employees** — HIPAA & security awareness training (initial)
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-training-cert.md`
  - `apps/hipaa-training/`
  - `Org-Knowledge-Approved/Compliance/01-git-kb-live/hipaa-training-cert.md`
- **Onboarding - Clinicians** — HIPAA & security awareness training
  - `docs/siyaos-knowledge-base/13-legal-compliance/topics/hipaa-training-cert.md`
  - `apps/hipaa-training/`

## Artifacts produced this pass

| Artifact | Path |
|----------|------|
| WorkDrive Build-Out (simplified) | `SiyaOS/Build-Out-Program/Siya_Health_Master_Tracker.xlsx` + 12 filtered `*-tracker.xlsx` (gap class column; **no** content stubs) |
| Tracker copy (incoming) | `SiyaOS/_incoming/Siya_Health_Master_Tracker.xlsx` |
| Gap audit (this file) | `docs/siyaos-knowledge-base/build-out-program/GAP-AUDIT.md` |
| Seeded JSON | `docs/siyaos-knowledge-base/build-out-program/tracker-items.seeded.json` |
| Offline SQLite | `docs/siyaos-knowledge-base/build-out-program/build-out-tracker.sqlite` |
| Postgres schema | `integrations/hipaa-training-api/src/database/build-out-tracker-schema.sql` |
| Postgres seed SQL | `docs/siyaos-knowledge-base/build-out-program/build-out-tracker-seed.sql` |

**Note (2026-09-11):** Per-item placeholder markdown stubs were removed. Gap class lives on each workstream’s filtered tracker sheet.

## Explicitly deferred

- SOP-printer → promote-to-approved pipeline
- Export live portal SOPs → `Org-Knowledge-Approved/*/02-portal-sops-live/`
- Apply schema/seed to production Neon (blocked on pullable `DATABASE_URL`)

