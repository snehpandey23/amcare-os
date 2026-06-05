# Notice of Privacy Practices — Lawyer Draft (Source Capture)

**Source file:** `Notice of Privacy Practices Siya Health.docx`  
**Captured:** 2026-06-02 (user paste into Cursor chat)  
**Status:** **Partial** — paste ends mid "Healthcare Operation" bullet  
**Purpose:** Store counsel draft for future publication. **Not published to production.**

---

## Capture notes

- Paste included Word/editor artifacts (`writer.editor.GO_TO_TOP` / `GO_TO_BOTTOM`) — stripped below.
- Unresolved placeholder: `[DATE]`.
- Covered entity named: **Siya Healthcare, PLLC** (clinical entity; aligns with Terms draft admin/clinical split).
- Standard HIPAA NPP opening block present.

---

## Draft text (as provided)

**Notice of Privacy Practices**

THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.

**Effective:** [DATE]

Siya Healthcare, PLLC ("Siya Healthcare" or "Practice") is required by law to maintain the privacy of your protected health information ("PHI") and to provide you with this Notice of Privacy Practices ("Notice") of its legal duties and privacy practices with respect to your PHI. Siya Healthcare is required to abide by the terms of the privacy notice currently in effect. Siya Healthcare reserves the right to change the terms of this Notice for all records and will inform you by posting the revised notice on our website or by providing it to you in the same manner this Notice was provided to you.

### Uses and Disclosures

Siya Healthcare is permitted to use and disclose your PHI for treatment, payment, and health care operations of the Practice:

- **Treatment:** Siya Healthcare may use and disclose your PHI to provide and coordinate the treatment, medications, and services you receive, including telehealth services. For example, we may disclose your PHI to physicians, pharmacists, or other persons involved in your care. We may disclose your PHI with other third parties, such as hospitals, other pharmacies, and other healthcare facilities and agencies to facilitate the provision of health care services, medication, and equipment you may need. This helps coordinate your care to ensure all your providers involved in your case have the information they need to meet your needs.

- **Payment:** Siya Healthcare may use your PHI to bill and process payment for your healthcare services. We may also disclose your PHI to other healthcare providers or HIPAA-covered entities who may need it for their payment activities.

- **Healthcare Operation:** Siya Healthcare may disclose your health information to another entity with which you have or had a relationship if that entity requests your information for certain of its healthcare operations or we may disclose your PHI to review treatment and services to evaluate the performance of our staff and for other management and administrative purposes. We may also disclose your PHI to other HIPAA-covered entities that have provided services to you so that they can improve the quality and effectiveness

---

## End of captured paste

*Remainder of Healthcare Operations bullet and standard NPP sections not yet provided.*

---

## Standard HIPAA NPP sections — expected but not yet in paste

Use this checklist when receiving the rest of the docx:

- [ ] Uses/disclosures **without** authorization (TPO complete)
- [ ] Uses/disclosures **requiring** authorization
- [ ] **Patient rights** (access, amendment, accounting of disclosures, restrictions, confidential communications, paper copy of Notice)
- [ ] **Complaints** (Practice contact + U.S. DHHS / OCR)
- [ ] **Duty to notify** (breach notification reference if applicable)
- [ ] **Business associates** / subprocessors (e.g., GHL intake, telehealth platform)
- [ ] **Psychotherapy notes** (if applicable)
- [ ] **Marketing** and **sale of PHI** prohibitions
- [ ] **Fundraising** (if applicable)
- [ ] **Contact person** (Privacy Officer name, phone, email, address)
- [ ] **Effective date** and **revision date**
- [ ] **Acknowledgment of receipt** form (optional separate artifact)

---

## Placeholder inventory

| Placeholder | Intended value (suggested) |
|-------------|---------------------------|
| `[DATE]` | NPP effective date (should match Terms effective date or earlier) |

---

## Reconciliation with site architecture

| Item | Current site | Lawyer draft | Gap |
|------|--------------|--------------|-----|
| NPP URL | Mislinked to `/privacy-policy` on 18+ pages | Standalone document | **Publish at** `/legal/notice-of-privacy-practices` |
| Covered entity | Footer: "Siya Health Inc." | **Siya Healthcare, PLLC** | Align public copy + Terms + footer |
| Privacy Policy vs NPP | Conflated in `site-standards.mjs` | Separate documents | Fix `LEGAL_LINKS.noticeOfPrivacy` |
| Live privacy page | Claims "does not collect PHI" | NPP assumes PHI | **Replace** `/privacy-policy` website privacy content |
| Terms cross-ref | Lawyer Terms draft references NPP `(insert link)` | This document | Wire link when both published |

**Related audits:**

- `docs/LEGAL-COMPLIANCE-GAP-ANALYSIS.md` — C1, C5, C9 (NPP critical gaps)
- `docs/TERMS-OF-USE-GAP-AUDIT.md` — R-03, R-04, C-02, C-05
- `docs/legal-drafts/WEBSITE-TERMS-OF-USE-LAWYER-DRAFT.md` — Privacy/NPP incorporation by reference

---

## Entity naming consistency (Terms + NPP)

| Entity | Role per drafts |
|--------|-----------------|
| Siya Health (unspecified corp form in Terms) | Administrative, payment, support services |
| Siya Healthcare, PLLC | Clinical practice; PHI covered entity; NPP issuer |
| Site footer today | "© 2026 Siya Health Inc." |

**Action for counsel/ops:** Confirm whether **Siya Health Inc.** is the admin entity named in Terms and how it relates to **Siya Healthcare, PLLC** on all public legal pages.
