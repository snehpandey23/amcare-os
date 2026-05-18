/**
 * Authoritative HIPAA references (HHS / eCFR).
 * Each slug has an internal summary page at `/resources/[slug]` that links out to the official URL.
 */
export interface ReferenceDocument {
  slug: string;
  title: string;
  /** Short label for “Read more here” lists inside lessons */
  shortLabel: string;
  summary: string;
  officialUrl: string;
  /** Shown on the resource page, e.g. “HHS Office for Civil Rights” */
  publisher: string;
}

export const REFERENCE_DOCUMENTS: ReferenceDocument[] = [
  {
    slug: "hhs-hipaa-overview",
    title: "HIPAA — Health Insurance Portability and Accountability Act (HHS overview)",
    shortLabel: "HHS HIPAA overview",
    summary:
      "Portal page for HIPAA at HHS: how Administrative Simplification (transactions, code sets, identifiers), Privacy Rule, Security Rule, Breach Notification, and enforcement fit together.",
    officialUrl: "https://www.hhs.gov/hipaa/index.html",
    publisher: "U.S. Department of Health & Human Services",
  },
  {
    slug: "hhs-hipaa-for-professionals",
    title: "HIPAA for Professionals",
    shortLabel: "HIPAA for professionals (hub)",
    summary:
      "Main hub for covered entities and business associates: summaries of the Privacy, Security, and Breach Notification Rules plus guidance collections.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
    publisher: "HHS — HIPAA",
  },
  {
    slug: "hhs-privacy-rule",
    title: "HIPAA Privacy Rule summary materials",
    shortLabel: "Privacy Rule (HHS hub)",
    summary:
      "Privacy Rule hub: permitted uses and disclosures, minimum necessary, notice of privacy practices, individual rights, and administrative requirements.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-privacy-laws-regulations",
    title: "HIPAA Privacy Rule — laws & regulations",
    shortLabel: "Privacy Rule laws & regulations",
    summary:
      "Links to the regulation text, omnibus and related materials; useful context for PHI, de-identification themes, and limited data sets.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-individual-access-guidance",
    title: "Individual rights — access guidance",
    shortLabel: "Individual access rights guidance",
    summary:
      "OCR guidance on the right of access to PHI (designated record set themes, timelines, and fees as reflected in official materials).",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-business-associate-guidance",
    title: "Business associates guidance",
    shortLabel: "Business associates (OCR)",
    summary:
      "Overview of business associate relationships and written assurance expectations tied to the Privacy Rule framework.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-privacy-faq-definitions",
    title: "HIPAA FAQs — definitions",
    shortLabel: "HIPAA definitions FAQs",
    summary:
      "FAQ topics defining covered entities, health plans, providers, protected health information, and related terms used throughout training.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/faq/definitions/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-security-rule",
    title: "HIPAA Security Rule overview",
    shortLabel: "Security Rule (HHS hub)",
    summary:
      "Security Rule hub for electronic PHI: administrative, physical, and technical safeguards; risk analysis; flexibility and scalability.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-security-guidance",
    title: "HIPAA Security Rule guidance materials",
    shortLabel: "Security Rule guidance",
    summary:
      "Collected OCR guidance on risk analysis, safeguard categories, and implementation specifications (required vs addressable themes).",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-breach-notification",
    title: "HIPAA Breach Notification Rule",
    shortLabel: "Breach Notification Rule",
    summary:
      "Official breach-notification hub: assessment themes, individual notice, notification to HHS and prominent media when thresholds apply.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-enforcement",
    title: "HIPAA compliance & enforcement",
    shortLabel: "Compliance & enforcement",
    summary:
      "Complaints, investigations, compliance reviews, audits, resolution agreements, and civil money penalties — structured per OCR public materials.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/index.html",
    publisher: "HHS — Office for Civil Rights",
  },
  {
    slug: "hhs-transactions-code-sets",
    title: "Administrative Simplification — transactions & code sets standards",
    shortLabel: "Transactions & code sets",
    summary:
      "Electronic transactions, adopted standards, code sets, and identifiers such as NPI as framed by CMS/HHS materials.",
    officialUrl: "https://www.hhs.gov/hipaa/for-professionals/transaction-code-sets-standards/index.html",
    publisher: "Centers for Medicare & Medicaid Services",
  },
  {
    slug: "ecfr-45-cfr-164",
    title: "45 CFR Part 164 — Security and Privacy",
    shortLabel: "45 CFR Part 164 (eCFR)",
    summary:
      "Electronic Code of Federal Regulations — Subparts covering Security and Privacy (implementation specifications cross-reference OCR summaries).",
    officialUrl: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164",
    publisher: "National Archives (eCFR)",
  },
];

const bySlug = new Map(REFERENCE_DOCUMENTS.map((d) => [d.slug, d]));

export function getReferenceDocument(slug: string): ReferenceDocument | undefined {
  return bySlug.get(slug);
}

export function listReferenceSlugs(): string[] {
  return REFERENCE_DOCUMENTS.map((d) => d.slug);
}
