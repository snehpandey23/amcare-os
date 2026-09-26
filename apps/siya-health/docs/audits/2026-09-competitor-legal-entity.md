# Competitor legal / entity-structure comparison

_Evidence-based research for Siya Health legal presentation. Informs folding PC/CPOM/MSO disclosure into Terms (not a standalone Corporate Structure nav item)._

**Date:** 2026-09-24  
**Companies:** Teladoc Health, Cerebral, Talkiatry, Klarity (Hello Klarity / helloklarity.com)

---

## Summary pattern (all four)

| Company | Standalone “Corporate Structure” / Legal-entity page in primary nav? | Where entity / CPOM-style disclosure lives | Prominence |
|---|---|---|---|
| **Teladoc** | No | Member / Terms of Service (PDF + site legal hub). PA/PC structure also in SEC filings, not consumer nav. | Footer “Legal, Privacy & Compliance” — not top nav |
| **Cerebral** | No | **Terms & Conditions** (opening: Inc. platform vs Medical Groups P.A./P.C.); reinforced in Telehealth Informed Consent + Privacy | Footer Terms / Privacy — not top nav |
| **Talkiatry** | No dedicated Corporate Structure page | **Terms of Use** (“Talkiatry is not a medical provider… administrative support to the Medical Group”) | Footer “Legal” accordion → Terms / Privacy / NPP — not top nav |
| **Klarity** | No | Marketplace / “not a medical clinic” language in **Billing/Cancellation** + support articles; Patient Terms & Conditions in footer policy list | Footer Terms & Privacy (+ dense policy list) — not top nav |

**Implication for Siya:** Competitors put Inc vs clinical entity / “not the medical provider” language **inside Terms (or related agreements)**, linked from the **footer**, not as a standalone “Legal / Corporate Structure” product section in primary navigation. Siya’s former hub H2 “Entity structure” was more prominent as a dedicated legal-landing topic than peers; folding into Terms aligns with market practice.

---

## 1. Teladoc Health

### Nav / footer
- **Homepage:** [https://www.teladochealth.com/](https://www.teladochealth.com/)
- Browser snapshot (2026-09-24): footer section labeled **“Legal, Privacy & Compliance”** (refs in session snapshot). No top-nav item for Corporate Structure.
- Marketing Terms URL attempted (`/terms-and-conditions/`) resolves to general marketing content, not a full member agreement — clinical/entity detail is in the **member Terms of Service PDF**.

### Entity-structure content
- **Lives in:** Member Terms of Service PDF — [https://content.teladochealth.com/docs/Terms_Service_Eng.pdf](https://content.teladochealth.com/docs/Terms_Service_Eng.pdf)  
  Evidence excerpt: services owned/operated by Teladoc Health, Inc. and affiliates; mental health consults under Livongo/MyStrength performed by professionals employed/contracted with **Teladoc Health Medical Group, PA**.
- **Corporate PA/PC architecture** (Teladoc Physicians, P.A. + state PCs) is documented in **SEC / services agreements**, e.g. [SEC exhibit](https://www.sec.gov/Archives/edgar/data/1477449/000141057815000165/filename4.htm) — **not** a consumer “Corporate Structure” page.

### Prominence
Footer legal cluster only. Absent from primary product navigation.

---

## 2. Cerebral

### Nav / footer
- **Terms:** [https://cerebral.com/terms-and-conditions](https://cerebral.com/terms-and-conditions)
- **Telehealth consent:** [https://cerebral.com/telehealth-informed-consent](https://cerebral.com/telehealth-informed-consent)
- Homepage ([https://cerebral.com/](https://cerebral.com/)) is JS-heavy; legal links are standard footer Terms / Privacy (no Corporate Structure nav item observed in research pass).

### Entity-structure content (Terms — opening)
Direct quote pattern from live Terms fetch (2026-09-24):

> The Platform is owned and operated by **Cerebral Inc.** … Services … are provided by **Cerebral Medical Group, P.A./P.C.** [state entities] … (each, a “Medical Group”)… **Cerebral does not own or have any ownership interest in the Medical Groups**… **Cerebral is not a health care provider**…

Reinforced in Telehealth Informed Consent: Cerebral Inc. provides non-clinical admin/tech; Medical Groups/Providers deliver care; Cerebral does not diagnose/treat.

### Prominence
Embedded in Terms (+ consent). Footer-linked. **Not** a standalone Corporate Structure page.

---

## 3. Talkiatry

### Nav / footer
- **Homepage:** [https://www.talkiatry.com/](https://www.talkiatry.com/)
- Browser snapshot (2026-09-24): footer includes collapsed **“Legal”** control with links:
  - Terms of Use  
  - Privacy Policy  
  - Notice of Privacy Practices  
  - Notice of Non-Discrimination  
  - Do Not Sell My Information  
- **No** “Corporate Structure” link. Legal is footer-only (not primary top nav).

### Entity-structure content
- **Terms of Use:** [https://www.talkiatry.com/terms-of-use](https://www.talkiatry.com/terms-of-use)  
  Evidence (fetched 2026-09-24):

> **Talkiatry is not a medical provider** and does not offer medical advice or treatment. It supplies **administrative support to the Medical Group**, which use the Talkiatry platform and brand. All clinical telehealth services are delivered by licensed clinicians through these practices; Talkiatry neither employs nor supervises the providers, nor owns any medical practice.

### Prominence
Terms-embedded; footer Legal accordion. Matches “fold into Terms” pattern.

---

## 4. Klarity (Hello Klarity / Klarity Health)

### Nav / footer
- **Homepage:** [https://www.helloklarity.com/](https://www.helloklarity.com/)
- Browser snapshot (2026-09-24): footer / policy strip includes:
  - Terms & Conditions  
  - Privacy Policy  
  - Patient Terms & Conditions  
  - Provider terms  
  - Telehealth consent  
  - Self-Pay agreement  
  - Billing, Cancellation, and Service Policies  
  - etc.  
- **No** standalone “Corporate Structure” or “Legal” mega-section in top nav. Dense **footer policy list**.

### Entity-structure content
Klarity frames as a **marketplace / tech platform**, not a clinic:

- [Billing, Cancellation, and Service Policies](https://www.helloklarity.com/billing-and-cancellation-policy) — § Independent Provider Relationship:

> **Klarity Health is a telehealth technology platform — not a medical clinic.** Each provider operates an independent medical practice…

- Support: [How booking works](https://support.helloklarity.com/support/solutions/articles/66000508830-how-does-booking-care-through-the-klarity-platform-work-) — “Klarity does not provide any medical services.”

Entity split lives in **Terms-adjacent policies**, not a Corporate Structure marketing page.

### Prominence
Footer-only policy links. Primary CTA/nav is clinical marketplace UX.

---

## Siya alignment (actioned in #2)

| Before | After (this pass) |
|---|---|
| `/legal` hub featured **Entity structure** + **Organizational service availability** as H2s | Hub is a **policy index**; points to Terms `#entity-structure` |
| Footer column **Legal** with **Legal & Compliance** hub link | Footer column **Policies**: **Terms of Use** + **Privacy Policy** (+ NPP, Cookie); hub link removed |
| Entity also in Terms opening prose + legal-meta aside | Named Terms sections `#entity-structure` + `#organizational-service-availability` (presentation fold; counsel-cleared copy retained) |

---

## Sources checklist

| Evidence | URL / artifact |
|---|---|
| Teladoc footer label | Browser snapshot of teladochealth.com (session 2026-09-24) |
| Teladoc member Terms PDF | content.teladochealth.com/docs/Terms_Service_Eng.pdf |
| Cerebral Terms | cerebral.com/terms-and-conditions |
| Cerebral consent | cerebral.com/telehealth-informed-consent |
| Talkiatry footer Legal accordion | Browser snapshot of talkiatry.com |
| Talkiatry Terms | talkiatry.com/terms-of-use |
| Klarity footer policies | Browser snapshot of helloklarity.com |
| Klarity “not a medical clinic” | helloklarity.com/billing-and-cancellation-policy |
