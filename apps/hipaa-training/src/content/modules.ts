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
      "HIPAA’s Administrative Simplification rules protect health information privacy and security while supporting standards for electronic transactions. Key rules include Privacy, Security, Breach Notification, Enforcement, and Omnibus updates; HITECH strengthened enforcement and extended many duties to business associates.",
    keyConcepts: [
      "Why privacy and security affect trust, EHR adoption, and information exchange",
      "Privacy Rule (uses/disclosures and patient rights) vs Security Rule (ePHI safeguards)",
      "OCR within HHS enforces HIPAA Privacy, Security, and Breach Notification Rules",
    ],
    scenarios: [
      "Patients may withhold information if they do not believe protections exist — workforce training and good practices support appropriate care and trust.",
    ],
  },
  {
    id: "ce-ba",
    title: "Covered Entities & Business Associates",
    shortTitle: "CE / BA",
    order: 2,
    outlineRef: "Outline §2",
    summary:
      "Covered entities and business associates that meet HIPAA definitions must comply with applicable rules. BA relationships generally require written assurances; incidental exposure differs from performing BA functions.",
    keyConcepts: [
      "Provider, health plan, clearinghouse concepts at a high level",
      "Business associate: creates, receives, maintains, or transmits PHI on behalf of a CE (per your Manual)",
      "ACE/OHCA/hybrid entity awareness — see Manual for definitions your practice uses",
    ],
    scenarios: [
      "A janitorial vendor with only incidental exposure to PHI is typically not a BA solely for that reason (as in your training test example).",
    ],
  },
  {
    id: "phi",
    title: "PHI & ePHI",
    shortTitle: "PHI / ePHI",
    order: 3,
    outlineRef: "Outline §3",
    summary:
      "PHI is identifiable health information held or transmitted by a covered entity in any form. De-identification and limited data sets follow specific regulatory criteria (see Manual Ch.3).",
    keyConcepts: [
      "PHI vs employment records; FERPA intersection where applicable",
      "Safe harbor / expert determination de-identification; limited data set permitted purposes",
    ],
    scenarios: [
      "Payment information that identifies an individual tied to a health context is PHI; de-identified data meeting the rule is not PHI.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Rule",
    shortTitle: "Privacy Rule",
    order: 4,
    outlineRef: "Outline §4",
    summary:
      "The Privacy Rule limits uses and disclosures of PHI and sets administrative requirements. Minimum necessary applies except where the rule provides exceptions (e.g., treatment, disclosure to the individual) as covered in your Manual.",
    keyConcepts: [
      "Permitted uses/disclosures including TPO and public interest categories",
      "Minimum necessary standard and stated exceptions",
      "Documentation, workforce training, sanctions, complaint process, record retention",
    ],
    scenarios: [
      "A visitor overhearing a quiet clinical conversation despite reasonable safeguards may be an incidental disclosure permitted when requirements are met — unlike negligent loud discussion in public areas.",
    ],
  },
  {
    id: "rights",
    title: "Patient Rights",
    shortTitle: "Patient rights",
    order: 5,
    outlineRef: "Outline §5",
    summary:
      "Patients have rights of access, amendment, accounting (with exceptions), Notice of Privacy Practices, confidentiality requests, and complaint pathways. Personal representative rules apply (with RHI-related nuances in current Manual updates).",
    keyConcepts: [
      "Designated record set and access timelines/fees per your policies and Manual",
      "Restriction requests — Chapter 164.522-style framework as taught in your packet",
    ],
    scenarios: [
      "Written NPP on first delivery and posting recommendations align with your checklist and policies.",
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
      "The Security Rule requires safeguards for ePHI with flexibility based on risk. Risk analysis and risk management are foundational; confidentiality, integrity, and availability frame the goals (HHS Security 101 + Manual).",
    keyConcepts: [
      "Security Rule scope: electronic PHI",
      "Documented risk analysis; reassessment when environments change",
    ],
    scenarios: [
      "EHR upgrades or cloud migrations should trigger review of risks and controls.",
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
      "Administrative, physical, and technical safeguards include required and addressable implementation specifications. Unique workforce IDs, media disposal, audit controls, and contingency planning are typical operational focus areas.",
    keyConcepts: [
      "Required vs addressable — assess, decide, document",
      "Workforce termination procedures, access establishment/modification, encryption as addressable to evaluate",
    ],
    scenarios: [
      "Shared passwords for the EHR conflict with unique user identification expectations.",
    ],
  },
  {
    id: "breach",
    title: "Breach Notification",
    shortTitle: "Breach",
    order: 8,
    outlineRef: "Outline §8",
    summary:
      "Breaches are impermissible uses or disclosures that compromise security or privacy of PHI per the Burden Rule framework you train on. Individual notice, HHS notice, and media notice depend on facts and counts; documentation and policies are required.",
    keyConcepts: [
      "Low probability of compromise analysis where applicable",
      "Notification timing themes (e.g., without unreasonable delay, no later than 60 days for individual notice in many cases — follow current Manual)",
      "Burden on the CE/BA to demonstrate required notifications or applicable exceptions",
    ],
    scenarios: [
      "Lost unencrypted laptop with ePHI commonly triggers breach assessment and notification workflow.",
    ],
  },
  {
    id: "enforcement",
    title: "Enforcement & Penalties",
    shortTitle: "Enforcement",
    order: 9,
    outlineRef: "Outline §9",
    summary:
      "OCR investigates complaints and performs audits/reviews; civil money penalties depend on facts and tiers (dollar figures in enforcement change with federal updates — verify current Manual). Certain criminal provisions may involve DOJ.",
    keyConcepts: [
      "OCR civil enforcement vs criminal prosecution pathway (high level)",
      "Complaints are triaged; not every allegation becomes a formal investigation",
    ],
    scenarios: [
      "Workforce social media posts with patient details can generate complaints and organizational sanctions.",
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
      "Standard transactions, code sets, and identifiers (e.g., NPI) support electronic administrative healthcare. Covered entities use adopted standards when performing the transactions to which standards apply.",
    keyConcepts: [
      "Adopted transaction standards for billing/claims where applicable",
      "NPI use on applicable standard transactions",
    ],
    scenarios: [
      "Billing team must use required code sets and identifiers for covered electronic transactions.",
    ],
  },
];

export function getModulesForRole(role: import("@/lib/types").WorkforceRole) {
  return MODULES.filter((m) => !m.roles?.length || m.roles.includes(role));
}
