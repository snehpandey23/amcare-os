/** Internal workforce knowledge for SiyaOS assistant (not patient-facing). */

export type KbCategory = "hipaa" | "billing" | "escalation" | "telehealth" | "training" | "general";

export interface WorkspaceKbEntry {
  id: string;
  category: KbCategory;
  title: string;
  keywords: string[];
  body: string;
  /** In-app paths to suggest */
  links?: { label: string; href: string }[];
  escalate?: string;
}

export const WORKSPACE_KB: WorkspaceKbEntry[] = [
  {
    id: "escalation-map",
    category: "escalation",
    title: "Escalation pathways (overview)",
    keywords: ["escalate", "escalation", "who to call", "contact", "supervisor", "help", "pathway"],
    body:
      "Use this order when you are unsure: (1) **Direct supervisor / team lead** for schedule and same-day workflow. (2) **Billing lead** for refunds, invoices, late cancel/no-show fees, Clarity/payment status. (3) **Privacy Officer / compliance** for PHI, breaches, unauthorized disclosure, identity verification on third-party callers. (4) **Clinical lead / provider** for medical advice, prescriptions, clinical decisions. (5) **IT** for telehealth platform, EHR access, or device failures. Never promise refunds, fee waivers, or insurance coverage without billing authorization.",
    links: [{ label: "HIPAA certification course", href: "/training" }],
  },
  {
    id: "hipaa-breach-first-steps",
    category: "hipaa",
    title: "Suspected HIPAA breach or privacy incident",
    keywords: ["breach", "phi", "leak", "unauthorized", "background", "overheard", "shared", "wrong person", "privacy incident"],
    body:
      "**Immediate steps:** Stop further disclosure. Secure the channel (end visit, close screen, move to private area). **Report the same day** to your Privacy Officer / compliance contact — do not decide alone whether it is a reportable breach. **Document** what happened, who was involved, what PHI may have been exposed, and actions taken. Workforce members must follow **security incident procedures** (administrative safeguards). The organization assesses low-probability-of-compromise exceptions and breach notification — that is not an MA decision.",
    links: [
      { label: "Breach module (training)", href: "/module/breach" },
      { label: "HHS breach notification (reference)", href: "/resources/hhs-breach-notification" },
    ],
    escalate: "Privacy Officer / compliance immediately",
  },
  {
    id: "hipaa-minimum-necessary",
    category: "hipaa",
    title: "Minimum necessary & incidental disclosure",
    keywords: ["minimum necessary", "incidental", "overhear", "share", "discuss", "room", "lobby"],
    body:
      "Share only the **minimum necessary** PHI for the task. **Treatment** and disclosures **to the individual** are common exceptions in training materials. **Incidental** overhearing may be permitted with **reasonable safeguards**; negligent discussion in public or on open video is not the same. Do not discuss balances, diagnoses, or identifiers where unauthorized people can hear or see.",
    links: [{ label: "Privacy Rule module", href: "/module/privacy" }],
  },
  {
    id: "third-party-caller",
    category: "hipaa",
    title: "Family or third party asking about charges or PHI",
    keywords: ["mom", "parent", "family", "spouse", "third party", "caller", "verify", "authorization"],
    body:
      "Before discussing **any** PHI or billing detail, **verify identity** and whether the patient authorized disclosure (adult patients usually require their consent unless policy allows a personal representative). Share **minimum necessary** information. If unsure, say you will confirm with the patient or supervisor and **escalate to Privacy Officer / compliance** — do not release account or clinical details to an unverified caller.",
    escalate: "Privacy Officer / supervisor if identity or authorization is unclear",
  },
  {
    id: "billing-late-cancel",
    category: "billing",
    title: "Late cancellation",
    keywords: ["late cancel", "cancellation", "cancel", "24 hour", "24-hour", "same day", "refund"],
    body:
      "Apply the **written billing policy** (cancellation window vs late-cancel fee). Same-day or inside-window cancels may still be **late cancellation** depending on your rules — do **not** promise a refund in chat. Document the cancel time, apply the correct status in scheduling/billing systems, and **escalate** exceptions (hardship, provider fault) to **billing lead / supervisor**. Never waive fees without authorization.",
    escalate: "Billing lead for refunds and fee exceptions",
  },
  {
    id: "billing-provider-cancel",
    category: "billing",
    title: "Provider cancels or no-show (patient fault vs provider fault)",
    keywords: ["provider cancel", "provider no show", "reschedule", "refund provider"],
    body:
      "**Provider cancellation** close to visit time: typically **not** charged as patient late-cancel; offer **reschedule** per policy. **Refund** if a visit fee was captured and the visit did not occur — **billing decides**, MA escalates with chart and payment screenshot. **Patient no-show**: apply no-show policy consistently; empathy without unauthorized waivers. “Two minutes late” does not override documented no-show rules unless supervisor approves.",
    escalate: "Billing lead + scheduling lead",
  },
  {
    id: "billing-payment-before-visit",
    category: "billing",
    title: "Payment not complete before appointment",
    keywords: ["payment failed", "invoice", "incomplete", "clarity", "night shift", "tomorrow appointment"],
    body:
      "If payment is **incomplete or failed**, do **not** assume the visit is cleared. **Flag billing and scheduling**, document in the chart/CRM, and follow your **pre-visit payment check** workflow. Attempt patient contact only through **approved channels**. Escalate before the visit start so the provider is not surprised.",
    escalate: "Billing lead before visit start",
  },
  {
    id: "billing-hardship-discount",
    category: "billing",
    title: "Discount or financial hardship",
    keywords: ["discount", "hardship", "waive", "upset", "angry", "fee waiver"],
    body:
      "Unauthorized fee waivers are a **compliance and revenue-integrity** issue. Use the **approved hardship script** if your org has one; otherwise collect facts and **escalate to billing lead / supervisor**. Document what the patient asked for and what you promised (ideally: only what policy allows).",
    escalate: "Billing lead / supervisor — never waive alone",
  },
  {
    id: "billing-hsa-fsa",
    category: "billing",
    title: "HSA / FSA and receipts",
    keywords: ["hsa", "fsa", "receipt", "reimbursement", "eligible"],
    body:
      "Many **clinical visit fees** may be HSA/FSA-eligible; **not all** membership or non-clinical fees qualify. Provide **receipts** through approved systems when policy allows. Tell patients to confirm eligibility with their plan administrator. Do not guarantee IRS/plan eligibility.",
  },
  {
    id: "billing-insurance-practical",
    category: "billing",
    title: "Insurance questions (practical)",
    keywords: ["insurance", "prior auth", "prior authorization", "medicare", "medicaid", "coverage", "superbill"],
    body:
      "Many services are **self-pay / direct-pay**; **do not guarantee** insurance coverage for visits or medications. **Prior authorization** means the payer must approve before coverage — escalate operational questions to **billing**. For “do you take my insurance?” use the **approved script** and official pricing page. **Superbill** requests go to billing per policy.",
    escalate: "Billing lead for coverage and prior auth",
  },
  {
    id: "telehealth-privacy",
    category: "telehealth",
    title: "Telehealth privacy (background, others on camera)",
    keywords: ["telehealth", "video", "zoom", "background", "camera", "private"],
    body:
      "Visits must occur in a **private** setting. Unauthorized people in the **background** during PHI discussion is a **privacy risk** — pause the visit, request a private space, and **report** if PHI may have been disclosed. Same rules as in-person: reasonable safeguards, minimum necessary, no PHI in public areas.",
    links: [{ label: "Security safeguards module", href: "/module/safeguards" }],
    escalate: "Privacy Officer if PHI may have been exposed",
  },
  {
    id: "training-cert",
    category: "training",
    title: "HIPAA certification course",
    keywords: ["course", "certification", "certificate", "training", "quiz", "final exam", "module"],
    body:
      "Optional **structured HIPAA certification** lives under **Training**: modules, quizzes, final assessment, and printable completion record for your organization. Use Siya for quick answers; use the course when you need formal workforce training or exam prep.",
    links: [
      { label: "Open training dashboard", href: "/training" },
      { label: "Reference library", href: "/resources" },
    ],
  },
  {
    id: "hipaa-sanctions",
    category: "hipaa",
    title: "Workforce sanctions",
    keywords: ["fire", "terminate", "sanction", "discipline", "violation"],
    body:
      "HIPAA requires **sanctions** for workforce violations — from retraining to termination depending on severity and policy. MAs do **not** decide discipline; **report** incidents to supervisor and Privacy Officer. Serious or repeat PHI mishandling, unauthorized waivers, or sharing PHI outside approved systems must be escalated.",
    escalate: "Supervisor + Privacy Officer / HR per policy",
  },
];
