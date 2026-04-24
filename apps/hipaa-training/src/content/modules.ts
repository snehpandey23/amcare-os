import type { CourseModule } from "@/lib/types";

/** Gamma Compliance — HIPAA Training Outline for Healthcare Providers (welcome kit). */
export const COURSE_VERSION = "2025.A-gamma-outline";

export const MODULES: CourseModule[] = [
  {
    id: "intro",
    title: "Introduction to HIPAA",
    shortTitle: "Introduction",
    order: 1,
    outlineRef: "Outline §1",
    summary:
      "HIPAA’s Administrative Simplification provisions created national standards for electronic health care transactions while protecting the privacy and security of health information. The Privacy Rule, Security Rule, Breach Notification Rule, Enforcement Rule, and Omnibus updates work together. HITECH strengthened enforcement, extended many duties to business associates, and increased accountability for breaches.",
    keyConcepts: [
      "Trust affects whether patients support EHRs and HIE—and whether they withhold clinically important information.",
      "Privacy Rule: who may use/disclose PHI and when; individual rights; administrative requirements.",
      "Security Rule: administrative, physical, and technical safeguards for electronic PHI (ePHI).",
      "OCR (Office for Civil Rights) enforces the Privacy, Security, and Breach Notification Rules at the civil level.",
      "Omnibus Rule (2013) implemented statutory changes so BAs and subcontractors face direct regulatory obligations for Security and Breach Notification, among other updates.",
    ],
    scenarios: [
      "A patient who doubts your safeguards may limit what they share; training and sound practices support better care and compliance.",
      "HITECH allows civil money penalties in some cases even without knowledge of a violation—your test treats this as True.",
    ],
    quizFocus: [
      "Link between perceived protections and support for EHRs / likelihood of withholding information.",
      "HIPAA’s multi-part purpose (privacy, security, integrity, access—not a single narrow goal).",
      "Which rules exist and that OCR enforces HIPAA civilly (not CMS or DOJ as the primary civil answer).",
      "Omnibus Rule vs HITECH naming on the exam (Omnibus as the rule package extending BA Security/Breach duties).",
    ],
    lessonSections: [
      {
        title: "Why this training matters",
        paragraphs: [
          "Patients and workforce members need to understand that health information is regulated for good reasons: continuity of care, billing, public health, and trust all depend on responsible handling. When people believe protections are weak, they may avoid care, omit symptoms, or resist data sharing that could improve outcomes.",
          "Your official test ties **lower perceived protection** to **less support for EHRs and health information exchange**, and **more likelihood of withholding information** from a provider. Keep that causal pattern in mind—it appears directly on the exam.",
        ],
      },
      {
        title: "Core rules you will see on the quiz",
        paragraphs: [
          "The Privacy Rule limits uses and disclosures of PHI and creates rights for individuals (access, amendment, accounting in defined circumstances, notice, and more). The Security Rule applies to **electronic** PHI and requires risk-based safeguards. Breach notification requires assessment and, when required, timely notice to individuals and often HHS (and sometimes media) depending on scale and facts.",
          "The **Omnibus Rule** is the regulatory package that, among other things, made **business associates** directly accountable under the Security Rule and Breach Notification Rule in line with HITECH. Exam items often use “Omnibus Rule” as the label for that extension, distinct from naming only the statute.",
        ],
      },
      {
        title: "Enforcement at a glance",
        paragraphs: [
          "**OCR** within HHS is the agency identified on your test as responsible for **enforcement of HIPAA** in the civil context covered by your materials. Criminal enforcement may involve other components (e.g., DOJ) but is not the answer the test keys for “agency responsible for enforcement” in the standard item.",
        ],
      },
    ],
  },
  {
    id: "ce-ba",
    title: "Covered Entities & Business Associates",
    shortTitle: "CE / BA",
    order: 2,
    outlineRef: "Outline §2",
    summary:
      "A **covered entity (CE)** is a health plan, health care clearinghouse, or provider who transmits health information in electronic form in connection with a covered transaction—or who falls under the regulatory definitions your Manual uses. A **business associate (BA)** performs functions or activities involving PHI on behalf of a CE (or, in defined cases, on behalf of another BA). Written assurance (BAA) is generally required before disclosure of PHI to a BA. Some arrangements—affiliated CEs, organized health care arrangements (OHCAs), and hybrid entities—change how compliance is organized without removing underlying duties.",
    keyConcepts: [
      "CE categories: health plans, clearinghouses, and providers who meet the electronic transmission threshold (and related definitions in your Manual).",
      "BA: creates, receives, maintains, or transmits PHI for or on behalf of a CE (or another BA as subcontractor)—not merely being in the same building.",
      "Incidental exposure (e.g., janitorial staff seeing PHI only incidentally) often **does not** make a vendor a BA by itself—the test uses this distinction.",
      "BAA content: permitted uses, safeguards, breach handling themes, and other required elements your packet lists; the comprehensive “all of the above” pattern appears on the official test.",
      "Affiliated CE designation: legally separate CEs under common ownership/control may present themselves as a single CE for specified compliance purposes.",
      "OHCA: clinically or administratively integrated arrangement where participating CEs share PHI for joint health care operations in defined ways—different legal concept from “affiliated CE.”",
      "Hybrid entity: one organization with both HIPAA-covered health care components and non-covered functions; must identify health components.",
    ],
    scenarios: [
      "A utilization review consultant, attorney with PHI access for the health plan, or TPA processing claims is BA-like; janitorial with only incidental exposure is the classic “not a BA” distractor.",
      "If a CE performs more than one covered function (e.g., provider and plan), **each** function must comply with the provisions that apply—exam marks “each does not need to comply” as **False**.",
    ],
    quizFocus: [
      "Who is in scope: CEs and BAs with PHI access—not every person on site without PHI duties.",
      "BA definition: services **on behalf of a covered entity** (not merely for oneself).",
      "BAA: comprehensive answer (uses, safeguards, patient-request themes, breach response) as keyed.",
      "Affiliated CE vs OHCA: the exam contrasts **common control/ownership** (affiliated CE angle) with other arrangements—know the definitional hinge your test uses.",
      "BAAs are **not** always required—limited exceptions exist per your Manual (exam True/False pattern).",
    ],
    lessonSections: [
      {
        title: "Covered entities in plain language",
        paragraphs: [
          "Your test bundles **health plans**, **health care clearinghouses** (e.g., billing/repricing services that meet the definition), and **provider entities** that transmit health information electronically in connection with transactions the standards cover. “If you bill electronically, you are not subject to HIPAA” is **False** in your keyed items—electronic transactions are often how provider CE status is triggered.",
          "Anyone who is **not** a CE or BA under the definitions generally **does not** need to comply with HIPAA—though other laws (state privacy, FTC, employment law) may still apply.",
        ],
      },
      {
        title: "Business associates vs incidental access",
        paragraphs: [
          "A BA relationship exists when a person or entity **creates, receives, maintains, or transmits PHI** for a function or activity regulated under the Privacy Rule and performed **on behalf of** the CE (or another BA). Typical examples in your materials: utilization review for a hospital, legal services involving PHI for a health plan, or a TPA handling claims.",
          "By contrast, a **janitorial service** whose **only** exposure to PHI is **incidental** (e.g., passing through a clinic) is the stock **“not a BA”** example on your test. The exam is testing whether you can separate **incidental presence** from **performing regulated functions with PHI**.",
        ],
      },
      {
        title: "Affiliated covered entity vs OHCA vs hybrid (study the contrast)",
        paragraphs: [
          "**Affiliated covered entity (ACE):** Separate legal entities that are **under common ownership or control** may, if they meet regulatory requirements, designate themselves as a **single covered entity** for specified HIPAA purposes. Your exam item on the difference between an ACE and an OHCA keys **common control or ownership** as the conceptual hinge—not geography, size, or academic ties.",
          "**Organized health care arrangement (OHCA):** A relationship in which **multiple CEs** participate in **joint activities** (for example, a hospital and its medical staff foundation arranging care). OHCAs have specific rules for how PHI may be shared among participants for certain operations—your Manual defines the arrangement; do not confuse it with ACE.",
          "**Hybrid entity:** A **single legal organization** that performs both covered health care functions and non-covered functions (e.g., a university with a hospital and a non-health division). The entity designates its **health care components**; HIPAA applies to those components with defined organizational responsibilities.",
          "When you answer ACE/OHCA/hybrid items, ask: **one org or several?** **Common control designation vs clinical joint arrangement?** **Which Manual definition matches the stem?**",
        ],
      },
      {
        title: "Business associate agreements",
        paragraphs: [
          "Before disclosing PHI to a BA, CEs generally need **satisfactory assurances** in writing (BAA) covering permitted uses and disclosures, safeguards, and how the BA will handle breaches and requests, consistent with your packet’s teaching. Your official test often uses **“all of the above”** when listing elements together.",
          "Your materials also note **limited situations** where a BAA is **not** always required—the exam marks **True** for “not always required.” Confirm edge cases with your compliance officer and Manual.",
        ],
      },
    ],
  },
  {
    id: "phi",
    title: "PHI & ePHI",
    shortTitle: "PHI / ePHI",
    order: 3,
    outlineRef: "Outline §3",
    summary:
      "PHI is individually identifiable health information held or transmitted by a covered entity in any medium. Employment records held by the employer in its role as employer and many education records under FERPA are excluded categories in your overview. De-identification (safe harbor or expert determination) and limited data sets have strict rules for use and redisclosure.",
    keyConcepts: [
      "PHI can be oral, paper, or electronic; Security Rule adds requirements for ePHI.",
      "Payment information in a health context with identifiers can be PHI; de-identified data per the rule is not PHI.",
      "Limited data sets may be used only for research, public health, or health care operations with a data use agreement.",
      "Re-identification codes: restrictions on use/disclosure except for re-identification as taught in your packet.",
    ],
    scenarios: [
      "A researcher using a limited data set still needs permitted purpose and usually a DUA; “any purpose” patterns are false.",
    ],
    quizFocus: [
      "Identify PHI vs employment records vs non-identifiable information.",
      "De-identification false statements (e.g., implying CEs may freely re-identify for marketing when the rule forbids).",
      "Limited data set permitted purposes bundle.",
    ],
    lessonSections: [
      {
        title: "What counts as PHI",
        paragraphs: [
          "PHI is information that **identifies an individual** and relates to **past, present, or future** physical or mental health, provision of health care, or **payment** for care—held or transmitted by a CE (or created/received by a BA on behalf of a CE). The medium does not matter for PHI status; **ePHI** is PHI in electronic form and triggers Security Rule safeguards.",
          "Your test uses **payment information** tied to health context as a classic **PHI** example, while **employment records** in the employer role and many **education records** under FERPA are **not** PHI in the way the question frames them.",
        ],
      },
      {
        title: "De-identification and limited data sets",
        paragraphs: [
          "**Safe harbor** removes specified identifiers and has no actual knowledge that residual information could identify the individual; **expert determination** applies statistical or scientific methods. Once properly de-identified under the rule, information is **not PHI** for HIPAA purposes as described in your training.",
          "A **limited data set** may contain dates and certain geographic details but not direct identifiers enumerated in the rule; it may be used only for **research, public health, or health care operations** with a **data use agreement**—your exam uses the comprehensive permitted-purpose answer.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Rule",
    shortTitle: "Privacy Rule",
    order: 4,
    outlineRef: "Outline §4",
    summary:
      "The Privacy Rule balances individual rights with permitted uses and disclosures for treatment, payment, and health care operations (TPO), legally required disclosures, and public interest categories. Minimum necessary applies to uses, disclosures, and requests except where the rule specifies otherwise (e.g., treatment, disclosure to the individual). Administrative requirements include policies, training, sanctions, complaints handling, and documentation.",
    keyConcepts: [
      "Permitted uses/disclosures without authorization in defined categories; others need permission or authorization as applicable.",
      "Minimum necessary: default for uses, disclosures, and requests—know exam exceptions (treatment, individual access, etc.).",
      "Incidental disclosures may be permissible when reasonable safeguards exist—contrast with careless loud discussion.",
      "HHS may receive PHI for compliance review without individual authorization in the scenario your test describes.",
    ],
    scenarios: [
      "Overheard conversation in a clinical area with reasonable safeguards may be incidental; shouting PHI in a lobby is not the same analysis.",
    ],
    quizFocus: [
      "Privacy Rule’s role vs other rules.",
      "Minimum necessary and its exceptions.",
      "Administrative requirements comprehensive patterns.",
      "Preemption: federal vs stricter state law framing on your exam.",
    ],
    lessonSections: [
      {
        title: "Permitted paths and minimum necessary",
        paragraphs: [
          "Most day-to-day sharing for **treatment, payment, and health care operations** is built into the Privacy Rule framework without requiring a separate authorization each time, subject to policy and safeguards. **Minimum necessary** means uses, disclosures, and requests should be limited to the **minimum necessary** to accomplish the purpose—**except** where the rule says otherwise (your exam lists treatment, disclosure to the individual, and other carved-outs).",
          "**Incidental** disclosures that are a limited by-product of an otherwise permitted disclosure, with **reasonable safeguards**, may be permitted. The exam contrasts a controlled clinical environment with negligent public discussion.",
        ],
      },
      {
        title: "Operational compliance",
        paragraphs: [
          "CEs need **policies and procedures**, **workforce training**, **sanctions** for violations, a **complaint process**, and documentation appropriate to their size and complexity. Your test may present a comprehensive checklist answer for administrative requirements.",
          "**Federal law** generally preempts **contrary state law** unless an exception applies or state law is **more protective** of privacy—the exact wording on your True/False item should match your Manual.",
        ],
      },
    ],
  },
  {
    id: "rights",
    title: "Patient Rights",
    shortTitle: "Patient rights",
    order: 5,
    outlineRef: "Outline §5",
    summary:
      "Individuals have rights of access to the designated record set, amendment, accounting of disclosures (with exceptions), notice of privacy practices, and pathways to complain. Personal representatives generally stand in the individual’s shoes with exceptions (e.g., certain unemancipated minors, state law, and abuse contexts per your Manual). Restriction requests under 45 CFR §164.522 are limited: CEs must agree except where the rule requires otherwise (e.g., emergency treatment).",
    keyConcepts: [
      "Right of access: what must be provided, timelines, and reasonable cost-based fees as framed in your packet.",
      "Designated record set: what is in/out—exam uses false-statement patterns.",
      "NPP: content and distribution (e.g., first service delivery, posting).",
      "Restrictions: not an unlimited veto; exam tests the statutory/regulatory limits you were taught.",
    ],
    scenarios: [
      "A patient may request amendment; CEs follow defined processes and may provide denial with rights explanation.",
    ],
    quizFocus: [
      "Access vs authority to deny in the paired-blank item style.",
      "Accounting exceptions (e.g., TPO and others per your test key).",
      "Restriction right: when it applies—not “always honored in every circumstance.”",
      "Complaint rights to CE and OCR.",
    ],
    lessonSections: [
      {
        title: "Access, DRS, and fees",
        paragraphs: [
          "The **right of access** allows individuals to inspect and obtain a copy of PHI in the **designated record set**, with exceptions for psychotherapy notes in some contexts and other limits your Manual details. Your exam pairs **what the individual may receive** with **what the provider may require** (e.g., reasonable formats, timelines, and **reasonable cost-based fees** where permitted).",
          "False statements about the DRS often test whether you know **what belongs** in the record set versus business records held only for billing legal defense in some frames—use your keyed rationale.",
        ],
      },
      {
        title: "§164.522 restriction requests (packet framework)",
        paragraphs: [
          "Individuals may **request** restrictions on uses or disclosures of PHI for treatment, payment, or health care operations, and restrictions on disclosures to family involved in care. A CE **must agree** to a requested restriction when the situation matches the regulatory conditions your Manual teaches—**except** where the rule requires otherwise (for example, **emergency treatment** scenarios in your materials).",
          "Do not over-read restrictions as unlimited opt-out from all treatment communications; the exam tests the **conditional** nature of the right.",
        ],
      },
      {
        title: "Notice, amendment, accounting, complaints",
        paragraphs: [
          "The **NPP** must describe uses/disclosures, rights, duties, and how to complain, and be available as your policies require (first delivery of service, posting, etc., per your checklist). **Amendment** requests follow a defined process with denials possible for specified reasons. **Accounting** has **exceptions** your test lists comprehensively (e.g., disclosures for TPO to or from the individual). Individuals may **complain** to the CE or to **OCR**.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security Rule Overview",
    shortTitle: "Security Rule",
    order: 6,
    outlineRef: "Outline §6",
    roles: ["provider", "nurse", "admin"],
    summary:
      "The Security Rule protects confidentiality, integrity, and availability of ePHI through scalable safeguards. Risk analysis and risk management are foundational. The Rule is flexible: CEs and BAs choose measures that are reasonable and appropriate for their environment while meeting required and addressable implementation specifications.",
    keyConcepts: [
      "Security Rule applies to ePHI, not all media of PHI.",
      "Risk analysis evaluates threats and vulnerabilities; update when systems change.",
      "Federal preemption patterns parallel Privacy Rule themes on your exam.",
    ],
    scenarios: [
      "Cloud migration or major EHR upgrade should trigger risk reassessment.",
    ],
    quizFocus: [
      "Scope: electronic PHI.",
      "Risk assessment purpose and distractors that “do not apply.”",
      "Flexibility factors CEs may consider.",
    ],
    lessonSections: [
      {
        title: "CIA and risk",
        paragraphs: [
          "**Confidentiality, integrity, and availability** frame Security Rule goals. **Risk analysis** identifies risks to ePHI; organizations implement measures to reduce risks to reasonable levels and **document** decisions. When environments change (new systems, telehealth expansion, vendor swaps), revisit risk.",
        ],
      },
      {
        title: "Flexibility and state law",
        paragraphs: [
          "The Security Rule is **technology-neutral** and **scalable**—a small practice and a large health system will document different controls, but both must comply with applicable standards. Your exam’s preemption item mirrors Privacy Rule style: federal law controls unless an exception or more stringent state law applies as described.",
        ],
      },
    ],
  },
  {
    id: "safeguards",
    title: "Security Safeguards",
    shortTitle: "Safeguards",
    order: 7,
    outlineRef: "Outline §7",
    roles: ["provider", "nurse", "admin"],
    summary:
      "Administrative, physical, and technical safeguard categories contain required and addressable specifications. Addressable does not mean optional: assess, implement reasonable alternative if not implemented, document. Workforce security, contingency planning, facility access, device controls, audit controls, and integrity/authentication are recurring exam themes.",
    keyConcepts: [
      "Required vs addressable implementation specifications.",
      "Unique user ID for workforce accessing ePHI systems.",
      "Policy review cadence—your materials reference annual review as a recommendation.",
    ],
    scenarios: [
      "Shared passwords violate unique identification expectations.",
    ],
    quizFocus: [
      "Safeguard categories (administrative, physical, technical—watch for fake extra categories on T/F).",
      "Addressable meaning.",
      "Physical safeguard facility provisions comprehensive answer.",
    ],
    lessonSections: [
      {
        title: "Administrative safeguards",
        paragraphs: [
          "Administrative safeguards are the **policies and procedures** and workforce training that govern how ePHI is protected: security management process, assigned security responsibility, workforce security, information access management, security awareness, contingency planning, evaluation, and BA oversight where applicable. **Security incidents** must be addressed through defined procedures.",
        ],
      },
      {
        title: "Physical and technical safeguards",
        paragraphs: [
          "**Physical** safeguards control **facility access** and workstation/device security—your exam may ask which facility provisions belong in the category. **Technical** safeguards include **access control, audit controls, integrity, and transmission security** themes per your Manual.",
          "**Addressable** specifications must be analyzed: if you do not implement, document why an alternative is reasonable or why it is not needed; do not treat “addressable” as “ignore.” **Unique user IDs** are a standard exam point.",
        ],
      },
    ],
  },
  {
    id: "breach",
    title: "Breach Notification",
    shortTitle: "Breach",
    order: 8,
    outlineRef: "Outline §8",
    summary:
      "A breach is, generally, an impermissible use or disclosure of PHI that compromises security or privacy, unless an exception or low-probability demonstration applies. Notification to individuals, HHS, and in some cases prominent media depends on the number of affected individuals and facts. Documentation and policies are mandatory; burden of proof themes appear on your test.",
    keyConcepts: [
      "Not every impermissible disclosure is automatically notifiable—exceptions and risk assessment matter.",
      "Individual notice timing themes (without unreasonable delay; often keyed to 60-day outer bound in teaching examples).",
      "HHS notification thresholds and timing as your packet teaches.",
      "Burden on the CE/BA to demonstrate notifications or exceptions.",
    ],
    scenarios: [
      "Unencrypted lost laptop with ePHI commonly triggers breach workflow.",
    ],
    quizFocus: [
      "Breach definition comprehensive patterns.",
      "Who is notified only in certain cases (media vs individuals vs HHS).",
      "Breach notification administrative requirements checklist.",
    ],
    lessonSections: [
      {
        title: "When notification is required",
        paragraphs: [
          "Start from the regulatory definition: an **impermissible acquisition, access, use, or disclosure** of PHI that **compromises security or privacy**, unless an **exception** applies or the CE/BA demonstrates **low probability** of compromise through a required risk assessment where applicable.",
          "Your exam marks **False** for blanket statements like “notification is required **regardless** of circumstances”—context and exceptions matter.",
        ],
      },
      {
        title: "Who gets notice and when",
        paragraphs: [
          "**Individuals** generally receive notice without unreasonable delay (your materials cite **no later than 60 days** in common teaching scenarios). **HHS** notification depends on how many individuals are affected and other facts; **prominent media** may be required only at higher thresholds. Your test asks which party is notified **only in certain cases**—study the keyed distinction between individuals, HHS, and media.",
          "**Burden of proof** language on your exam reflects that regulated entities must **demonstrate** that notification was made or that an exception applied—shifting responsibility to document the analysis.",
        ],
      },
    ],
  },
  {
    id: "enforcement",
    title: "Enforcement & Penalties",
    shortTitle: "Enforcement",
    order: 9,
    outlineRef: "Outline §9",
    summary:
      "OCR investigates complaints, performs compliance reviews and audits, and may resolve matters through corrective action or civil money penalties depending on facts and tiers. Penalty dollar caps and tier structures change with federal updates—your Manual and compliance officer are the source of truth for current figures. Criminal penalties may apply for knowing wrongful disclosure under separate statutes.",
    keyConcepts: [
      "OCR triages complaints—not every complaint becomes a full investigation.",
      "Audit types: onsite vs desk.",
      "CMP factors: knowledge, harm, history, and other elements in your test’s comprehensive answers.",
    ],
    scenarios: [
      "Workforce misuse of social media with PHI can trigger complaints and internal sanctions.",
    ],
    quizFocus: [
      "OCR activities—identify the option that “does not apply” per key.",
      "Audit scope True/False (state-specific rules distractor).",
      "Penalty amounts: verify current Manual before relying on dollar figures.",
    ],
    lessonSections: [
      {
        title: "OCR processes",
        paragraphs: [
          "OCR **receives and reviews** complaints but follows **prioritization** policies—not every allegation becomes a formal investigation. During investigations, OCR may communicate with **complainants, CEs/BAs, and witnesses** as appropriate. **Compliance reviews** may be initiated through multiple pathways your exam lists with one “does not apply” distractor.",
        ],
      },
      {
        title: "Audits and penalties",
        paragraphs: [
          "Audit programs may include **onsite** or **desk (electronic)** reviews. Your exam marks **False** when claiming OCR audits incorporate **state-specific rules** as described in the item. **Civil money penalties** depend on **knowledge, neglect, harm, prior history**, and related factors in the comprehensive answer pattern.",
          "**Criminal** penalties for knowing wrongful disclosure with intent to sell, transfer, or use for commercial advantage, personal gain, or malicious harm carry **years of imprisonment** in the bracket your test uses—confirm current statute with your Manual.",
        ],
      },
    ],
  },
  {
    id: "admin-simp",
    title: "Administrative Simplification",
    shortTitle: "Admin. Simp.",
    order: 10,
    outlineRef: "Outline §10",
    roles: ["admin", "provider"],
    summary:
      "Administrative Simplification adopts standards for electronic transactions, code sets, and identifiers. Covered entities must use adopted standards when conducting covered electronic transactions. NPI identifies providers on applicable standard transactions.",
    keyConcepts: [
      "Standard transactions for claims, eligibility, remittance, etc., use adopted formats.",
      "Code sets must match transaction type.",
      "NPI on standard transactions for health care providers as framed in your test.",
    ],
    scenarios: [
      "Billing must use required code sets and identifiers for covered transactions.",
    ],
    quizFocus: [
      "CEs conducting standard transactions must use adopted standards.",
      "Code sets required for transaction types.",
      "NPI identification on standard transactions.",
    ],
    lessonSections: [
      {
        title: "Transactions, codes, identifiers",
        paragraphs: [
          "When a CE conducts a **standard transaction** electronically, it must use the **adopted standard** appropriate to the transaction (claims, payment, eligibility, etc.). **Code sets** (ICD, CPT, HCPCS where applicable) must be used as required for the transaction type—not a single code set for every transaction blindly, but the exam tests the **requirement** framing.",
          "Covered **health care providers** identify themselves on **standard transactions** using the **National Provider Identifier (NPI)** in the general rule your test states.",
        ],
      },
    ],
  },
];

export function getModulesForRole(role: import("@/lib/types").WorkforceRole) {
  return MODULES.filter((m) => !m.roles?.length || m.roles.includes(role));
}
