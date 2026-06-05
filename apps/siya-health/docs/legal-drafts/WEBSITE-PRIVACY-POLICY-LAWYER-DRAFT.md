# Website Privacy Policy — Lawyer Draft (Source Capture)

**Source file:** `Website Privacy Policy - Siya Health (1).docx`  
**Captured:** 2026-06-02 (user paste into Cursor chat)  
**Status:** **Partial** — paste ends mid "What Data We Collect About You" / anonymized data sentence  
**Purpose:** Store counsel draft for future publication. **Not published to production.**

---

## Capture notes

- Paste included Word/editor artifacts (`writer.editor.GO_TO_TOP` / `GO_TO_BOTTOM`) — stripped below.
- Unresolved placeholders: `[DATE]`, `[website]`, `[info@]`.
- Correctly **separates PHI** (HIPAA NPP) from **Personal Data** (this Privacy Policy) — resolves live-site conflict where `/privacy-policy` denied all PHI collection.
- Entity framing: **Siya Health** (on own behalf + affiliate **Siya Healthcare, PLLC**).

---

## Draft text (as provided)

We do not provide emergency care services. If you are experiencing a mental health crisis or a medical emergency, please call 911.

**Privacy Policy**

**Effective Date:** [DATE]

Siya Health, on its own behalf and its affiliate Siya Healthcare, PLLC ("Siya Health," "we," "our," or "us") cares about your privacy. Thank you for taking the time to read our privacy policy ("Privacy Policy"). This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit the website (website), our services, and our practices for collecting, using, maintaining, protecting, and disclosing that information (collectively, "Services").

It is our policy to comply with applicable privacy and data protection laws, state privacy laws regarding the processing of Personal Data and on the free movement of such data. This commitment reflects the value we place on earning and keeping the trust of our customers, business partners, and others who share their Personal Data with us. If our privacy practices for certain services differ from those explained in this Privacy Policy, we will let you know at the time we ask for or collect your information.

Please read this Privacy Policy carefully to understand our policies and practices regarding your information and how we will treat it. We may make changes to the Privacy Policy from time to time. Your continued use of this Website after we make changes is deemed to be acceptance of those changes. We, therefore, encourage you to check the Privacy Policy periodically for updates.

By using or interacting with our website or Services, you accept the privacy practices described in this Privacy Policy. If you disagree with any part of this Privacy Policy, you must not use or access our Services.

### Children

Our website is not intended for children under 13 years of age. We will not knowingly solicit or collect Personal Data from children under 13, or the relevant minimum age under applicable local legal requirements, except as permitted under applicable law. If we learn that we have received information directly from a child under 13 without his or her parent's or legal guardian's consent, we will make commercially reasonable efforts to delete such information.

If you believe we might have any information from or about a child under 13, please contact us at [info@].

Residents of certain states may have additional rights regarding the collection of their personal information. Please see Your State Privacy Rights for more information.

### What Data We Collect About You

Personal Data means any information about an individual from which that person can be identified, directly or indirectly. It does not include Protected Health Information (as defined by the Health Insurance Portability and Accountability Act of 1996), which is covered by our Notice of Privacy Practices.

Personal Data also does not include data where the identity has been removed (anonymized data), which

---

## End of captured paste

*Remainder of data collection section and subsequent Privacy Policy sections not yet provided.*

---

## Placeholder inventory

| Placeholder | Intended value (suggested) |
|-------------|---------------------------|
| `[DATE]` | Privacy Policy effective date |
| `(website)` | `https://siya.health` — appears twice without brackets in one instance |
| `[info@]` | Children/privacy contact — likely `care@siya.health` or dedicated privacy inbox |
| `Your State Privacy Rights` | Internal section anchor — full CA/TX/PA/FL rights text not yet in paste |

---

## Standard website Privacy Policy sections — expected but not yet in paste

- [ ] What Data We Collect (complete)
- [ ] How We Collect Data (cookies, GTM, forms, chat widget)
- [ ] How We Use Personal Data
- [ ] Legal bases for processing (if applicable)
- [ ] How We Share / disclose Personal Data (subprocessors)
- [ ] Third-party links (booking, LegitScript, social)
- [ ] Cookies and tracking technologies → **Cookie Policy** cross-ref
- [ ] Data retention
- [ ] Security measures
- [ ] International transfers (if applicable)
- [ ] **Your State Privacy Rights** (CCPA/CPRA, TX, VA, etc.)
- [ ] Marketing communications / opt-out
- [ ] SMS/email (TCPA) — may live in separate Communications Consent
- [ ] Contact information
- [ ] Relationship to **Notice of Privacy Practices** (link)
- [ ] Relationship to **Terms of Use** (link)

---

## Reconciliation with live site + other lawyer drafts

| Topic | Live `/privacy-policy` | Lawyer draft | Notes |
|-------|------------------------|--------------|-------|
| PHI handling | "does not collect PHI" | PHI → NPP; Personal Data → this policy | **Lawyer draft is correct architecture** |
| Word count | ~2 cards, ~30 words policy | Substantive draft (partial) | Replace live page when complete |
| Entity | "Siya Health" generic | Siya Health + Siya Healthcare, PLLC affiliate | Align with Terms + NPP drafts |
| Children | Not addressed | Under 13 not intended | Align with Terms §4 (13+ gate) |
| Emergency | Footer 911 only | 911 in policy header | Consistent across legal docs |
| Analytics/GTM | Not disclosed | Not yet in paste | **Must add** — site runs GTM, GA, Google Ads |
| Booking (GHL) | Not disclosed | Not yet in paste | **Must add** subprocessors section |
| NPP link | Conflated same URL | Explicit PHI → NPP separation | Publish NPP at distinct URL |

**Related stored drafts:**

- `docs/legal-drafts/WEBSITE-TERMS-OF-USE-LAWYER-DRAFT.md`
- `docs/legal-drafts/WEBSITE-NOTICE-OF-PRIVACY-PRACTICES-LAWYER-DRAFT.md`

**Related audits:**

- `docs/LEGAL-COMPLIANCE-GAP-ANALYSIS.md`
- `docs/TERMS-OF-USE-GAP-AUDIT.md`

---

## Subprocessors / trackers to disclose when drafting remainder

*Operational list for counsel — site audit 2026-06-02; verify with ops before publish.*

| Service | Purpose | Evidence on site |
|---------|---------|------------------|
| Google Tag Manager `GTM-PLBD4TTQ` | Tag management | All HTML pages |
| Google Analytics `G-9WTQWHCTFT` | Analytics | All HTML pages |
| Google Ads `AW-17553537456` | Advertising | All HTML pages |
| LeadConnector / GHL chat | Chat widget | `widgets.leadconnectorhq.com` |
| GHL booking forms | Intake/scheduling | `link.yourmarketingai.com` |
| LegitScript | Certification verification | Footer seal link |

---

## Three-document legal stack (counsel drafts received)

```
Terms of Use ──────────► incorporates Privacy Policy + NPP by reference
Privacy Policy ────────► Personal Data (non-PHI); points PHI to NPP
Notice of Privacy Practices ► PHI / HIPAA (Siya Healthcare, PLLC)
```

**Recommended URLs when published:**

- `/legal/terms-of-use`
- `/legal/privacy-policy`
- `/legal/notice-of-privacy-practices`
