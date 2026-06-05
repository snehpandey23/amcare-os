# Lawyer Draft — Siya Health Operational Consistency Audit

**Audit date:** 2026-06-02  
**Scope:** Redline consistency audit only — **no legal rewriting**  
**Sources audited:**

| File | Source docx | Capture status |
|------|-------------|----------------|
| `docs/legal-drafts/WEBSITE-TERMS-OF-USE-LAWYER-DRAFT.md` | Website Terms of Use - Siya Health.docx | **Partial** — through §4 (truncated) |
| `docs/legal-drafts/WEBSITE-PRIVACY-POLICY-LAWYER-DRAFT.md` | Website Privacy Policy - Siya Health (1).docx | **Partial** — through start of “What Data We Collect” |
| `docs/legal-drafts/WEBSITE-NOTICE-OF-PRIVACY-PRACTICES-LAWYER-DRAFT.md` | Notice of Privacy Practices Siya Health.docx | **Partial** — TPO through incomplete Healthcare Operations bullet |

**Authoritative operational model (audit baseline):**

- Clinical services available **only** in California, Texas, Florida, Pennsylvania (organizational footprint).
- **Organizational service footprint** controls availability — not individual provider license tables.
- **Clinical positioning:** Primary care–led adult ADHD evaluation and treatment; Internal Medicine; Family Medicine; Obesity Medicine; ADHD-CCSP–trained clinicians. **Not** a psychiatry, psychology, or behavioral health clinic practice.
- **Live site stack:** GHL booking (`link.yourmarketingai.com`), LeadConnector chat, GTM `GTM-PLBD4TTQ`, GA `G-9WTQWHCTFT`, Google Ads `AW-17553537456`, LegitScript footer seal.

**Verdict:** All three drafts are **incomplete captures**. No draft is publishable. Findings below separate **text conflicts** (language that contradicts the operating model), **operational omissions** (required model elements absent), **architecture gaps** (placeholders / undisclosed stack), and **missing companions** (cross-references to undrafted documents).

---

## Executive summary

| Category | Critical | High | Medium | Low |
|----------|:--------:|:----:|:------:|:---:|
| Operating model (4-state footprint, org vs provider license) | 1 | 6 | 3 | 0 |
| Provider positioning (not psychiatry/psychology) | 0 | 1 | 2 | 1 |
| ADHD care positioning | 0 | 4 | 1 | 0 |
| Website architecture / tech stack | 4 | 8 | 5 | 2 |
| Missing companion documents | 5 | 6 | 2 | 0 |
| **Total unique findings** | **10** | **25** | **13** | **3** |

**Cross-cutting critical themes:**

1. **No draft text limits clinical services to CA, TX, FL, PA** or separates organizational footprint from provider licensure.
2. **Terms §4 (13+)** conflicts with adult-only clinical service positioning (ADHD eval, obesity medicine, TRT).
3. **All architecture placeholders and subprocessors** unresolved in received text; live site already collects data via undisclosed channels in drafts.
4. **Entity naming drift:** drafts use Siya Health + Siya Healthcare, PLLC; live footer uses **Siya Health Inc.**
5. **Partial drafts** reference sections and companion policies that do not exist or are incomplete.

---

## Audit legend

| Label | Meaning |
|-------|---------|
| **CONFLICT** | Draft language contradicts Siya Health operating model |
| **OMISSION** | Required operational element absent from received text |
| **PLACEHOLDER** | Unresolved counsel field blocks publication / linking |
| **MISSING COMPANION** | Document or section referenced but not drafted |
| **WATCH** | Not a conflict in received text; flag for review when remainder arrives |

---

# Document 1: WEBSITE-TERMS-OF-USE-LAWYER-DRAFT.md

## 1.1 Redline — received text with audit annotations

```
[AUDIT: Emergency header — see Finding TOU-E-01]
We do not provide emergency care services. If you are experiencing a mental health 
crisis or a medical emergency, please call 911.

Terms of Use
Effective Date: [DATE]                                    [PLACEHOLDER TOU-P-01]

[AUDIT: Naming drift — "Terms of Service" in body vs file title "Terms of Use" — TOU-L-01]
Please read these Terms of Service (the "Terms"), our Privacy Policy (insert link) 
("Privacy Policy") and our Notice of Privacy Practices (insert link) 
("Notice of Privacy Practices") carefully because they govern your use of the 
website located at [website] (the "Site"). 
[AUDIT: Entity + typo — TOU-E-02, TOU-L-02]
Siya Health, provides administrative, payment, and other support services to 
Siya Healthcare, PLLC (collectively, "Siya Health"); and Siya Healthcare, PLLC, 
provides Medical and Telehealth Services through its employed and/or contracted 
provides and clinicians (collectively, the "Professionals"). 
[AUDIT: No 4-state footprint; unbounded "Services" — TOU-O-01, TOU-O-02]
To make these Terms easier to read, the Site and our services, including the 
Medical and Telehealth Services are collectively called the "Services."

[AUDIT: Arbitration names "SIYA HEALTH" — entity alignment — TOU-E-03]
IMPORTANT NOTICE REGARDING ARBITRATION FOR U.S. CUSTOMERS: ... DISPUTE BETWEEN 
YOU AND SIYA HEALTH ... SECTION 17 "DISPUTE RESOLUTION" BELOW ...
[AUDIT: §17 not in capture — MISSING COMPANION TOU-M-01]

§1 Agreement to Terms — browsewrap assent only [OMISSION TOU-O-03]

§2 Privacy Policy — incorporates Privacy + NPP [MISSING COMPANION TOU-M-02, TOU-M-03]

§3 Changes — OK structurally; no version numbering [LOW TOU-L-03]

§4 Who May Use — at least 13 years of age [CONFLICT TOU-C-01]
... Parents and legal guardians are [TRUNCATED — TOU-M-04]
```

---

## 1.2 Findings — operating model

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| TOU-O-01 | **High** | Intro ¶ (`Medical and Telehealth Services`) | OMISSION | No statement that clinical services are offered **only** in CA, TX, FL, PA. | Draft implies nationwide telehealth availability; contradicts `LICENSED_STATES` in `data/site-standards.mjs` and organizational footprint rule. | Counsel to add organizational service footprint section; patient location attestation. **Do not** derive states from provider profiles. |
| TOU-O-02 | **High** | Intro ¶ (`Professionals`) | OMISSION | No rule that **individual provider licenses do not expand** organizational service geography. | Risk that provider marketing (multi-state credentials) is read as service availability beyond four states. | Add explicit separation: provider credentials displayed for transparency; **availability** governed by org footprint only. |
| TOU-C-01 | **Critical** | §4 Who May Use (`at least 13 years of age`) | CONFLICT | Minimum age **13+** with parental consent for minors. | Siya Health clinical positioning is **adult** ADHD evaluation, obesity medicine, TRT, primary telehealth — not a pediatric or general-minor practice. Creates assent and COPPA/clinical scope mismatch with Privacy Policy children section. | Reconcile with counsel: website browsing vs clinical eligibility; likely **18+** (or state majority) for clinical Services. |
| TOU-O-03 | **Medium** | §1 Agreement to Terms | OMISSION | Browsewrap only (“By using our Services, you agree”). | Live booking uses GHL external intake with no documented clickwrap to Terms/Telehealth Consent. | Ops + counsel: intake checkbox flow referencing final Terms URL. |

---

## 1.3 Findings — provider positioning

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| TOU-E-01 | **Medium** | Emergency header (`mental health crisis`) | CONFLICT (tone) | Directs users with “mental health crisis” to 911 without defining practice scope. | Siya Health is **not** a psychiatry, psychology, or behavioral health clinic. Language may be read as implying crisis-care competency. Site footer omits **988** (only 911). | Counsel to frame as **general emergency redirect** for a primary care telehealth practice; add 988 where appropriate. **Not** a psychiatry specialty claim, but scope clarification needed. |
| TOU-O-04 | **High** | Entire received draft | OMISSION | No statement that Siya Health is **not a psychiatry or psychology practice**. | Gap analysis and clinical positioning require explicit negation in Terms. | Add primary care–led scope statement in unreceived sections (watch for contradictory language when §5+ arrive). |
| TOU-W-01 | **Low** | Intro (`Professionals`) | WATCH | Generic “employed and/or contracted … clinicians” — no specialty labels in received text. | **No conflict** in received text. Remaining sections may introduce psychiatry/psychology language — re-audit on full docx. | Re-run this audit when Sections 5–17 received. |

**Psychiatry / psychology / behavioral health clinic:** **No explicit references** in received Terms text. ✅

---

## 1.4 Findings — ADHD care positioning

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| TOU-O-05 | **High** | Entire received draft | OMISSION | No **screening ≠ diagnosis** language (ASRS). | Live site runs `/adhd-screening`; Terms silent on screening boundaries. | Add ADHD addendum in unreceived sections per `LEGAL-ARCHITECTURE-IMPLEMENTATION-PLAN.md`. |
| TOU-O-06 | **High** | Entire received draft | OMISSION | No **non-guarantee** of diagnosis, medication, or stimulant prescribing. | DEA/state board / marketing SOP alignment; site markets ADHD medication management. | Add evaluation-before-prescribing and no-guaranteed-Rx language. |
| TOU-O-07 | **High** | Entire received draft | OMISSION | No **primary care–led ADHD** framing. | Terms must align with repositioning away from psychiatry-led model. | Add clinical model descriptor. |
| TOU-O-08 | **Medium** | Entire received draft | OMISSION | No reference to **Controlled Substance Policy** or **Telehealth Consent**. | Required companions for ADHD stimulant line. | Incorporate by reference when companions drafted. |

**Screening = diagnosis / guaranteed stimulants:** **No conflicting claims** in received text. All gaps are **omissions**.

---

## 1.5 Findings — website architecture

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| TOU-P-01 | **Critical** | Header (`[DATE]`) | PLACEHOLDER | Effective date unresolved. | Cannot publish or synchronize with Privacy/NPP effective dates. | Counsel to set single coordinated effective date. |
| TOU-P-02 | **Critical** | Intro (`(insert link)` ×2) | PLACEHOLDER | Privacy Policy and NPP links unresolved. | Live site mislinks NPP → `/privacy-policy`; Terms will perpetuate broken architecture if placeholders filled incorrectly. | Set `/legal/privacy-policy` and `/legal/notice-of-privacy-practices`; fix `LEGAL_LINKS` first. |
| TOU-P-03 | **Critical** | Intro (`[website]`) | PLACEHOLDER | Site URL unresolved. | Canonical must be `https://siya.health`. | Resolve before publish. |
| TOU-A-01 | **High** | Entire received draft | OMISSION | No disclosure of **GHL booking** (`link.yourmarketingai.com`) or **LeadConnector** chat. | Terms §2 Medical Services on live site said “external secure systems” — draft does not yet name operational intake. | Add third-party services section in unreceived portions. |
| TOU-A-02 | **High** | Entire received draft | OMISSION | No **GTM / GA / Google Ads** or **Cookie Policy** incorporation. | All 159 HTML pages load trackers today. | Cross-reference Cookie Policy; disclose analytics in Terms or Privacy. |
| TOU-A-03 | **Medium** | Entire received draft | OMISSION | No **LegitScript** certification mention. | Footer displays seal on 24 pages; Terms silent. | Optional disclosure in advertising/third-party section. |
| TOU-E-02 | **Medium** | Intro ¶ | CONFLICT | Entity string: “Siya Health, provides administrative…” (comma splice); “contracted **provides**” typo. | Professionalism; “provides” may create parsing ambiguity. | Counsel typo fix: **providers**. |
| TOU-E-03 | **Medium** | Arbitration notice | CONFLICT | Binding arbitration with **“SIYA HEALTH”** while clinical services delivered by **Siya Healthcare, PLLC**. | Party naming for disputes may not match clinical relationship. | Counsel to confirm correct arbitration party(ies) and relationship to Inc. |
| TOU-L-01 | **Low** | Intro | CONFLICT | Document titled **Terms of Use** in filename; body says **Terms of Service**. | Sitewide naming drift (`Terms & Conditions` on some footers). | Standardize canonical label before publish. |
| TOU-L-02 | **Low** | Intro | CONFLICT | Collective definition merges admin entity + PLLC as **“Siya Health”** without mentioning **Siya Health Inc.** (live footer). | Entity confusion across legal, billing, and marketing. | Ops to confirm corporate chart; align all public legal docs. |

---

## 1.6 Missing companions referenced in Terms draft

| ID | Sev | Referenced in | Missing artifact | Status |
|----|-----|---------------|------------------|--------|
| TOU-M-01 | **Critical** | Arbitration notice | **§17 Dispute Resolution** (full section) | Not in capture |
| TOU-M-02 | **Critical** | Intro + §2 | **Privacy Policy** (complete) | Partial counsel draft only |
| TOU-M-03 | **Critical** | Intro + §2 | **Notice of Privacy Practices** (complete) | Partial counsel draft only |
| TOU-M-04 | **High** | §4 (truncated) | **Remainder of §4** (parent/guardian obligations) | Truncated mid-sentence |
| TOU-M-05 | **High** | Implied by Services | **Telehealth Consent** | Not drafted |
| TOU-M-06 | **High** | Implied by clinical Services | **Cookie Policy** | Not drafted |
| TOU-M-07 | **High** | Implied by ADHD/med med Services | **Controlled Substance Policy** | Not drafted |
| TOU-M-08 | **High** | Implied by prescribing | **Prescription Policy** | Not drafted |
| TOU-M-09 | **Medium** | Implied by membership marketing | **Cancellation & Refund Policy** | Not drafted |
| TOU-M-10 | **Medium** | Implied by communications | **Communications Consent (SMS/Email)** | Not drafted |

---

# Document 2: WEBSITE-PRIVACY-POLICY-LAWYER-DRAFT.md

## 2.1 Redline — received text with audit annotations

```
[AUDIT: Emergency header — PP-E-01 (same class as TOU-E-01)]
We do not provide emergency care services. If you are experiencing a mental health 
crisis or a medical emergency, please call 911.

Privacy Policy
Effective Date: [DATE]                                    [PLACEHOLDER PP-P-01]

[AUDIT: Entity OK structure; (website) placeholder — PP-P-02, PP-E-02]
Siya Health, on its own behalf and its affiliate Siya Healthcare, PLLC 
("Siya Health," "we," "our," or "us") ... when you visit the website (website) ...

[AUDIT: "Services" undefined breadth — PP-O-01]
... collecting, using, maintaining, protecting, and disclosing that information 
(collectively, "Services").

[AUDIT: State privacy laws — no CA/TX/FL/PA specificity yet — PP-O-02]
... comply with applicable privacy and data protection laws, state privacy laws ...

§ Children — under 13 not intended [See PP-C-01 vs Terms §4]

If you believe ... child under 13 ... contact us at [info@].  [PLACEHOLDER PP-P-03]

Residents of certain states ... Your State Privacy Rights ...  [MISSING COMPANION PP-M-01]

§ What Data We Collect
[AUDIT: PHI → NPP split CORRECT architecture — PP-OK-01]
Personal Data ... does not include ... PHI ... covered by our Notice of Privacy Practices.

Personal Data also does not include ... anonymized data, which [TRUNCATED PP-M-02]
```

---

## 2.2 Findings — operating model

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| PP-O-01 | **High** | Intro ¶ (`Services`) | OMISSION | “Services” includes website + unspecified services with **no geographic limitation** on clinical data processing. | Privacy Policy should align with **4-state clinical footprint** for treatment-related Personal Data where applicable. | Add scope: clinical services and associated data practices limited to org footprint states. |
| PP-O-02 | **High** | Intro ¶ (`state privacy laws`) | OMISSION | Generic state privacy compliance; **Your State Privacy Rights** section not in capture. | Siya Health operates in **CA, TX, FL, PA** — each has distinct privacy rules (e.g., CCPA/CPRA). | Ensure remainder explicitly addresses **CA, TX, FL, PA** — not a generic 50-state boilerplate without ops alignment. |
| PP-C-01 | **Critical** | Children + cross-doc | CONFLICT | Website “not intended for children under 13” but **Terms §4 permits 13+** use of Services. | Internal draft inconsistency; also conflicts with **adult clinical** service model if “Services” includes clinical care. | Counsel to harmonize: web browsing vs clinical eligibility vs COPPA. |
| PP-OK-01 | — | What Data We Collect (PHI definition) | ✅ ALIGNED | Personal Data excludes PHI; points to NPP. | Correctly fixes live-site false “no PHI” architecture. | Preserve in final; ensure NPP published at distinct URL. |

---

## 2.3 Findings — provider positioning

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| PP-E-01 | **Medium** | Emergency header | CONFLICT (tone) | Same “mental health crisis” phrasing as Terms. | See TOU-E-01. | Align emergency language across legal stack; clarify primary care scope. |
| PP-W-01 | **Low** | Entire received draft | WATCH | No psychiatry/psychology/behavioral health practice claims. | ✅ No conflict in received text. | Re-audit full docx for specialty labels. |

---

## 2.4 Findings — ADHD care positioning

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| PP-O-03 | **High** | Entire received draft | OMISSION | No mention of **ADHD screening data** (ASRS on `/adhd-screening`) as distinct from clinical PHI. | Screening flows may collect responses before NPP-covered encounter; needs data classification clarity in remainder. | Define in “What Data We Collect”: screening responses, pre-clinical forms, vs PHI after intake. |
| PP-O-04 | **High** | Entire received draft | OMISSION | No **non-guarantee** or clinical positioning language. | Privacy Policy typically doesn't carry ADHD claims — but marketing funnels combine screening + booking. | Ensure subprocessors section covers GHL ADHD intake forms. |

**No ADHD overclaims or guaranteed medication language** in received Privacy text.

---

## 2.5 Findings — website architecture

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| PP-P-01 | **Critical** | Header | PLACEHOLDER | `[DATE]` unresolved. | Synchronized legal effective dates required. | Set with Terms/NPP. |
| PP-P-02 | **Critical** | Intro | PLACEHOLDER | `(website)` unresolved (appears unbracketed in source). | Must resolve to `https://siya.health`. | Counsel fill. |
| PP-P-03 | **High** | Children § | PLACEHOLDER | `[info@]` contact unresolved. | Live site uses `care@siya.health`; children privacy contact must be operational. | Ops to provide official privacy inbox. |
| PP-A-01 | **Critical** | Remainder (not in capture) | OMISSION | No **subprocessor** disclosure for GTM, GA, Google Ads, GHL, LeadConnector in received text. | Live site already fires all trackers and routes forms externally. | **Must appear** in unreceived sections — operational requirement, not optional. |
| PP-A-02 | **High** | Remainder (not in capture) | OMISSION | No **Cookie Policy** cross-reference. | 159 pages use cookies/pixels without policy. | Draft Cookie Policy + link from Privacy. |
| PP-A-03 | **High** | Remainder (not in capture) | OMISSION | No **booking flow** description (GHL widget URL, data passed at booking). | Primary PHI/Personal Data collection point. | Add collection sources section naming GHL intake. |
| PP-A-04 | **Medium** | Remainder (not in capture) | OMISSION | No **LegitScript** or third-party certification data sharing description. | Footer links to LegitScript checker. | Disclose if any data shared with LegitScript (likely none beyond public URL). |
| PP-E-02 | **Medium** | Intro | CONFLICT | Affiliated entity named **Siya Healthcare, PLLC**; live footer **© Siya Health Inc.** | Same entity drift as Terms/NPP. | Corporate chart confirmation. |
| PP-A-05 | **Medium** | Cross-doc | OMISSION | No link to **Terms of Use** in received text. | Legal stack requires mutual incorporation. | Add in remainder. |

---

## 2.6 Missing companions referenced in Privacy draft

| ID | Sev | Referenced in | Missing artifact | Status |
|----|-----|---------------|------------------|--------|
| PP-M-01 | **High** | Children § / state residents ¶ | **Your State Privacy Rights** (full section) | Referenced, not in capture |
| PP-M-02 | **High** | What Data We Collect | **Remainder of anonymized data + full collection categories** | Truncated |
| PP-M-03 | **Critical** | PHI exclusion ¶ | **Notice of Privacy Practices** (complete, linkable) | Partial draft only |
| PP-M-04 | **High** | Implied by stack | **Cookie Policy** | Not drafted |
| PP-M-05 | **High** | Implied by GHL/SMS | **Communications Consent** | Not drafted |
| PP-M-06 | **Medium** | Implied | **Terms of Use** (complete) | Partial draft only |

---

# Document 3: WEBSITE-NOTICE-OF-PRIVACY-PRACTICES-LAWYER-DRAFT.md

## 3.1 Redline — received text with audit annotations

```
Notice of Privacy Practices
[Standard HIPAA header block — NPP-OK-01 ✅]

Effective: [DATE]                                         [PLACEHOLDER NPP-P-01]

[AUDIT: Covered entity = Siya Healthcare, PLLC — NPP-OK-02 ✅; Inc. drift NPP-E-01]
Siya Healthcare, PLLC ("Siya Healthcare" or "Practice") ...

[AUDIT: Website posting mechanism — aligns with planned /legal URL — NPP-A-01 ✅]
... posting the revised notice on our website ...

Uses and Disclosures — TPO:

Treatment [includes telehealth, medications — NPP-O-01 watch scope]
... physicians, pharmacists ... hospitals, pharmacies, healthcare facilities ...

Payment [...]

Healthcare Operation [... truncated NPP-M-01 ...]
```

---

## 3.2 Findings — operating model

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| NPP-O-01 | **High** | Treatment bullet (`telehealth services`) | OMISSION | Telehealth treatment disclosure has **no CA, TX, FL, PA geographic limit** or patient-location requirement. | HIPAA NPP should align with org footprint — where PHI is created for telehealth encounters. | Add telehealth geographic scope or cross-ref Telehealth Consent. |
| NPP-O-02 | **High** | Entire received draft | OMISSION | No distinction between **organizational service availability** and **individual provider licensure**. | Patients may assume PHI use implies care in any state where a listed provider holds a license. | Ops note for counsel: availability ≠ provider credential display. |
| NPP-OK-01 | — | HIPAA header | ✅ ALIGNED | Standard required opening block present. | Meets NPP recognition format. | Preserve. |
| NPP-OK-02 | — | Covered entity | ✅ ALIGNED | **Siya Healthcare, PLLC** as HIPAA covered entity matches Terms admin/clinical split. | Correct PHI entity. | Reconcile with Siya Health Inc. in footer. |

---

## 3.3 Findings — provider positioning

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| NPP-O-03 | **Medium** | Treatment bullet | OMISSION | Examples include **hospitals** and broad care coordination — appropriate for primary care but **no scope ceiling** (not psychiatry/psychology practice). | Could be read as full-service behavioral health hospital coordination. | Counsel to ensure examples match **primary care telehealth** scope, not psychiatric hospitalization pathways. |
| NPP-W-01 | **High** | Remainder (expected) | WATCH | Checklist expects **Psychotherapy notes** section. | Siya Health is **not a psychology practice** — psychotherapy notes section may be **N/A** or misleading if present. | When remainder arrives: mark N/A or omit; do not imply psychotherapy services. |
| NPP-W-02 | — | Received text | ✅ | No psychiatry, psychiatric physician, psychology practice, or behavioral health clinic labels. | No conflict in received text. | Re-audit full docx. |

---

## 3.4 Findings — ADHD care positioning

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| NPP-O-04 | **Medium** | Treatment bullet (`medications`) | OMISSION | Medications mentioned generically — **no ADHD/stimulant-specific** boundaries. | Not a conflict — generic TPO language. Lack of CS policy cross-ref is architectural gap. | Controlled Substance Policy should complement NPP, not be embedded in NPP. |
| NPP-O-05 | **High** | Entire received draft | OMISSION | No **screening vs treatment record** distinction (ASRS before encounter). | Screening data may become PHI upon intake; NPP should clarify when PHI relationship begins. | Ops + counsel: define PHI start at intake/encounter. |

**No screening=diagnosis or guaranteed stimulant language** in received NPP text.

---

## 3.5 Findings — website architecture

| ID | Sev | Section | Type | Finding | Why it matters | Recommended correction |
|----|-----|---------|------|---------|----------------|------------------------|
| NPP-P-01 | **Critical** | Header | PLACEHOLDER | `[DATE]` unresolved. | HIPAA effective date required. | Coordinate with Terms/Privacy. |
| NPP-A-01 | — | Change notice ¶ (`posting ... on our website`) | ✅ ALIGNED | Website publication path matches planned `/legal/notice-of-privacy-practices`. | Supports decoupling from `/privacy-policy`. | Implement URL + fix 18 false sitewide links on publish. |
| NPP-A-02 | **Critical** | Remainder (expected) | OMISSION | **Business associates** section not in capture — must include **GHL intake, telehealth platform, billing**. | PHI flows through GHL booking today. | Name BAs in remainder per live stack. |
| NPP-A-03 | **High** | Remainder (expected) | OMISSION | **Privacy Officer contact** (name, phone, email, address) not in capture. | HIPAA requirement. | Ops to supply. |
| NPP-A-04 | **High** | Remainder (expected) | OMISSION | **Patient rights** and **OCR complaint** sections not in capture. | HIPAA requirement. | Await full docx. |
| NPP-E-01 | **Medium** | Covered entity block | CONFLICT | NPP issuer: **Siya Healthcare, PLLC** only; no **Siya Health Inc.** admin role. | Patients may not understand admin vs clinical entity for privacy requests. | Legal Hub should explain; NPP may reference admin contact for non-PHI. |
| NPP-A-05 | **Medium** | Cross-site | CONFLICT | Live site links label **Notice of Privacy Practices → `/privacy-policy`**. | Publishing this NPP without URL migration perpetuates HIPAA misrouting. | Engineering fix before publish (see `LEGAL_LINKS`). |

---

## 3.6 Missing companions referenced or required by NPP draft

| ID | Sev | Referenced in | Missing artifact | Status |
|----|-----|---------------|------------------|--------|
| NPP-M-01 | **High** | Healthcare Operations bullet | **Remainder of TPO + non-TPO uses** | Truncated |
| NPP-M-02 | **Critical** | HIPAA completeness | **Patient rights** section | Not in capture |
| NPP-M-03 | **Critical** | HIPAA completeness | **Complaints / OCR** section | Not in capture |
| NPP-M-04 | **Critical** | HIPAA completeness | **Business associates** (GHL, etc.) | Not in capture |
| NPP-M-05 | **High** | Cross-stack | **Privacy Policy** (link + non-PHI boundary) | Partial only |
| NPP-M-06 | **High** | Cross-stack | **Terms of Use** | Partial only |
| NPP-M-07 | **High** | Telehealth PHI | **Telehealth Consent** | Not drafted |

---

# Cross-document consistency matrix

| Topic | Terms (received) | Privacy (received) | NPP (received) | Operational expectation | Status |
|-------|------------------|--------------------|----------------|-------------------------|--------|
| 4-state org footprint | ❌ absent | ❌ absent | ❌ absent | CA, TX, FL, PA only | **FAIL** |
| Provider license ≠ service geography | ❌ absent | ❌ absent | ❌ absent | Separate controls | **FAIL** |
| Not psychiatry/psychology practice | ❌ absent | ❌ absent | ❌ absent | Explicit negation | **FAIL** (omission) |
| Adult clinical services | ❌ §4 allows 13+ | ❌ under-13 web only | n/a | Adult ADHD, obesity, TRT | **FAIL** |
| PHI vs Personal Data split | ✅ via §2 refs | ✅ explicit | ✅ NPP scope | Separate docs | **PASS** (architecture) |
| Emergency 911 | ✅ | ✅ | n/a | Not emergency provider | **PASS** |
| Emergency 988 | ❌ | ❌ | n/a | Best practice for crisis copy | **OMIT** |
| Entity: admin vs PLLC | ✅ split | ✅ affiliate | ✅ PLLC CE | Clear chart | **PARTIAL** (Inc. drift) |
| GHL / LeadConnector | ❌ | ❌ | ❌ (BAs) | Must disclose | **FAIL** |
| GTM / GA / Ads | ❌ | ❌ | n/a | Cookie Policy + Privacy | **FAIL** |
| LegitScript | ❌ | ❌ | n/a | Footer seal live | **OMIT** |
| ADHD screening ≠ diagnosis | ❌ | ❌ | ❌ | ASRS live | **FAIL** (omission) |
| No guaranteed stimulants | ❌ | ❌ | ❌ | Marketing risk | **FAIL** (omission) |
| Primary care–led ADHD | ❌ | ❌ | ❌ | Positioning | **FAIL** (omission) |
| Effective dates | `[DATE]` all | `[DATE]` | `[DATE]` | Set | **BLOCKED** |
| Privacy/NPP URLs | `(insert link)` | NPP ref only | website post | `/legal/*` | **BLOCKED** |

---

# Master finding index (by severity)

## Critical (10)

| ID | Document | Summary |
|----|----------|---------|
| TOU-C-01 | Terms §4 | 13+ age gate vs adult clinical services |
| PP-C-01 | Privacy + Terms | Children/13+ cross-draft inconsistency + clinical scope |
| TOU-P-01 / PP-P-01 / NPP-P-01 | All | `[DATE]` placeholders |
| TOU-P-02 | Terms intro | Privacy + NPP `(insert link)` unresolved |
| TOU-P-03 | Terms intro | `[website]` unresolved |
| PP-P-02 | Privacy intro | `(website)` unresolved |
| PP-A-01 | Privacy (missing §) | No GTM/GA/Ads/GHL/LeadConnector subprocessors in received text |
| TOU-M-01 | Terms | §17 Dispute Resolution not captured |
| TOU-M-02 / TOU-M-03 / PP-M-03 | Terms / Privacy | Companion Privacy + NPP incomplete |
| NPP-M-02 / NPP-M-03 / NPP-M-04 | NPP | Patient rights, OCR, business associates not captured |

## High (25)

Operating model: TOU-O-01, TOU-O-02, PP-O-01, PP-O-02, NPP-O-01, NPP-O-02  
Provider positioning: TOU-O-04, NPP-W-01 (psychotherapy notes watch)  
ADHD: TOU-O-05, TOU-O-06, TOU-O-07, PP-O-03, PP-O-04, NPP-O-05  
Architecture: TOU-A-01, TOU-A-02, PP-P-03, PP-A-02, PP-A-03, NPP-A-02, NPP-A-03, NPP-A-04, NPP-A-05  
Missing companions: TOU-M-04 through TOU-M-08, PP-M-01, PP-M-02, PP-M-04, PP-M-05, NPP-M-01, NPP-M-05–07  

*(Full IDs in document sections above.)*

## Medium (13) / Low (3)

See per-document tables: TOU-E-01, TOU-E-02, TOU-E-03, TOU-O-03, TOU-O-08, TOU-L-01–03, PP-E-01, PP-E-02, PP-A-04, PP-A-05, NPP-O-03, NPP-O-04, NPP-E-01, NPP-A-05, PP-W-01, TOU-W-01, NPP-W-02.

---

# Recommended counsel / ops actions (non-legal)

**Do not rewrite language in this audit.** Next steps:

1. **Request complete docx pastes** for Terms §5–§17+, full Privacy, full NPP — re-run this audit.
2. **Resolve placeholders** (`[DATE]`, links, website, `[info@]`) with ops-confirmed values.
3. **Harmonize age/eligibility** across Terms §4, Privacy Children, and adult clinical positioning.
4. **Add operational facts** to unreceived sections: 4-state footprint, org-vs-provider-license rule, primary care model, subprocessors list.
5. **Draft missing companions** before publish: Telehealth Consent, Cookie Policy, Controlled Substance Policy (minimum).
6. **Fix live architecture** (`LEGAL_LINKS`, false NPP links) in same release as counsel-approved finals.
7. **Confirm corporate entities:** Siya Health Inc. vs Siya Health admin vs Siya Healthcare, PLLC.

---

## Related artifacts

| Document | Path |
|----------|------|
| Lawyer drafts (source) | `docs/legal-drafts/*.md` |
| Terms gap audit | `docs/TERMS-OF-USE-GAP-AUDIT.md` |
| Legal architecture plan | `docs/LEGAL-ARCHITECTURE-IMPLEMENTATION-PLAN.md` |
| Sitewide gap analysis | `docs/LEGAL-COMPLIANCE-GAP-ANALYSIS.md` |
| Org footprint source | `data/site-standards.mjs` → `LICENSED_STATES` |

---

*Operational consistency audit only. Not legal advice. Not a substitute for counsel review of complete final documents.*
