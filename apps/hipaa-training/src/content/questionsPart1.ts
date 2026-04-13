import type { Question } from "@/lib/types";
import { mcq, tf } from "./questionHelpers";

/** Questions 1–40 from HIPAA Test for Healthcare Providers (Gamma Compliance). */
export const QUESTIONS_PART_1: Question[] = [
  mcq(1, "intro", ["public-trust", "ehr"], 1, `When individuals did not believe their healthcare providers had reasonable protections in place for their health information, they were ________ likely to support the use of electronic health records and health information exchange.`,
    { a: "More (likely)", b: "Less (likely)" }, "b",
    "Your training materials tie weaker perceived protections to lower support for EHRs and HIE.", "scenario", { a: "The source material supports the opposite pattern." }),

  mcq(1, "intro", ["public-trust", "withholding"], 2, `When individuals did not believe their healthcare providers had reasonable protections in place for their health information, they were ________ likely to withhold information from their healthcare provider.`,
    { a: "More (likely)", b: "Less (likely)" }, "a",
    "Same source: privacy concerns correlate with patients holding information back."),

  mcq(1, "intro", ["hipaa-purpose"], 3, `HIPAA was put in place to:`,
    {
      a: "Protect the privacy, security and integrity of health information",
      b: "Demonstrate to the public that their health information is private, secure and of good integrity",
      c: "Protect against information breaches",
      d: "Make health information accessible to its owner and/or his/her authorized representative",
      e: "All of the above",
    }, "e",
    "The official test marks the comprehensive answer — multiple statutory/regulatory aims, not one item alone.", "mcq", { a: "Incomplete per test key.", b: "Incomplete per test key.", c: "Incomplete per test key.", d: "Incomplete per test key." }),

  tf(1, "intro", ["rules-overview"], 4, `Under HIPAA, several rules were enacted to protect the privacy and security of health information and establish rights for individuals that are the subject of that information.`, true,
    "Matches your training outline (Privacy, Security, individual rights, related rules)."),

  mcq(2, "intro", ["omnibus", "ba"], 5, `The __________ notably required Business Associates to comply with the Security and Breach Notification Rules.`,
    { a: "Privacy Rule", b: "Enforcement Rule", c: "Omnibus Rule", d: "HITECH Act" }, "c",
    "Your materials frame the Omnibus Rule as implementing extensions that made Security and Breach Rule compliance direct for BAs.", "mcq", { a: "Different regulatory focus.", b: "Penalty/process framework, not this BA extension label.", d: "HITECH is statutory; the question uses the rule label from your test." }),

  tf(2, "intro", ["hitech", "penalties"], 6, `The HITECH Act permits the imposition of a money penalty even if a Covered Entity or Business Associate was not aware of a HIPAA violation.`, true,
    "Training test marks True — CMP tiers can apply without knowledge in some circumstances."),

  mcq(1, "intro", ["enforcement", "ocr"], 7, `The following agency is responsible for the enforcement of HIPAA.`,
    {
      a: "Department of Health and Human Services",
      b: "Department of Justice",
      c: "Office for Civil Rights",
      d: "Centers for Medicare and Medicaid Services",
    }, "c",
    "OCR enforces Privacy, Security, and Breach Notification Rules civilly; DOJ may handle criminal cases separately.", "mcq", { a: "Department level; OCR is the cited component.", b: "Not primary civil enforcement answer here.", d: "Different HHS operating division." }),

  mcq(1, "ce-ba", ["scope"], 8, `HIPAA Rules apply to:`,
    {
      a: "Anyone working at the facility including staff that does not have access to Protected Health Information",
      b: "Covered Entities and Business Associates that have access to Protected Health Information",
      c: "Covered Entities only",
      d: "Business Associates only",
    }, "b",
    "Entities in scope with PHI access; not every person physically on site absent PHI role.", "mcq", { a: "Overbroad.", c: "Incomplete.", d: "Incomplete." }),

  tf(1, "ce-ba", ["scope"], 9, `If an individual or organization does not meet the definition of either a CE or BA, they do not need to comply with HIPAA.`, true,
    "HIPAA regulates defined CEs and BAs; others generally fall outside HIPAA (may have other legal duties)."),

  mcq(1, "ce-ba", ["ce-types"], 10, `Covered Entities include:`,
    {
      a: "Health insurance companies and employer-sponsored health plans",
      b: "Healthcare clearinghouses that provide services like billing and repricing",
      c: "Small medical clinics, dentists, chiropractors and pharmacies",
      d: "All of the above",
    }, "d",
    "Typical CE categories bundled in your official test.", "mcq", { a: "True but incomplete.", b: "True but incomplete.", c: "True but incomplete." }),

  tf(2, "ce-ba", ["ce-scope"], 11, `If you bill electronically, you are not subject to HIPAA.`, false,
    "False — electronic transactions are commonly how provider CE status is triggered under the regulatory definition you train on."),

  mcq(2, "ce-ba", ["ba-definition"], 12, `A Business Associate is an external person or entity that performs services that may involve access to or use of Protected Health Information…`,
    {
      a: "On behalf of another Business Associate",
      b: "On behalf of health care providers only",
      c: "On behalf of a Covered Entity",
      d: "For its own business practices",
    }, "c",
    "Classic definition: performing covered functions for or on behalf of the CE.", "mcq", { a: "Subcontractor path exists but stem matches CE.", b: "Too narrow.", d: "Wrong capacity." }),

  mcq(2, "ce-ba", ["ba-examples"], 13, `Which of the following is not an example of a Business Associate`,
    {
      a: "Consultant that performs utilization reviews for a hospital",
      b: "An attorney whose legal services to a health plan involve access to protected health information",
      c: "Janitorial service whose only exposure to Protected Health Information is incidental",
      d: "Third-party administrator that assists a health plan with claims processing",
    }, "c",
    "Incidental-only exposure distinguishes this option from typical BA relationships in your test.", "mcq", { a: "PHI for defined service — BA-like.", b: "PHI for legal services — BA-like.", d: "TPA role — BA-like." }),

  mcq(2, "ce-ba", ["baa"], 14, `What is required as part of a Business Associate contract?`,
    {
      a: "Terms of how health information will be used",
      b: "Safeguards that must be instituted",
      c: "How to respond to patient requests for their health information",
      d: "Breach response",
      e: "All of the above",
    }, "e",
    "Your BAA teaching and official test use the comprehensive answer.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete.", d: "Incomplete." }),

  tf(3, "ce-ba", ["baa-exceptions"], 15, `Business Associate contracts are not always required.`, true,
    "True for limited patterns your Manual discusses; confirm specifics with your compliance officer."),

  mcq(3, "ce-ba", ["ace-ohca"], 16, `The difference between an Affiliated Covered Entity and an Organized Health Care Arrangement is:`,
    {
      a: "Size of the practice",
      b: "Common control or ownership of the Covered Entity",
      c: "Geographical location of the facilities",
      d: "Academic affiliation",
    }, "b",
    "Affiliated CE turns on organizational relationship concepts per your Manual.", "mcq", { a: "Not the definitional hinge.", c: "Not the definitional hinge.", d: "Not the definitional hinge." }),

  tf(2, "ce-ba", ["multi-function"], 17, `If a Covered Entity performs different functions, each function does not need to be in compliance with HIPAA provisions for those functions.`, false,
    "Each covered function must comply with applicable provisions."),

  tf(1, "phi", ["phi-forms"], 18, `Protected Health Information is protected by HIPAA and can be in any form including electronic, paper, or oral.`, true,
    "PHI is medium-neutral; Security Rule adds ePHI controls."),

  mcq(1, "phi", ["phi-examples"], 19, `An example of Protected Health Information (PHI) is`,
    {
      a: "Information that cannot be used to identify an individual",
      b: "Past or future payment information",
      c: "Employment records",
      d: "Educational Records",
    }, "b",
    "Payment information in a health context with identifiers fits PHI examples in your packet.", "mcq", { a: "Not identifiable — not PHI.", c: "Excluded category in your overview.", d: "FERPA universe, not PHI here." }),

  mcq(2, "phi", ["de-id"], 20, `Which of the following is false with regards to de-identified health information?`,
    {
      a: "It does not identify an individual",
      b: "There are no restrictions on using or disclosing de-identified health information",
      c: "It provides a basis to identify an individual",
      d: "The 18 identifiers of PHI must be removed",
    }, "c",
    "Properly de-identified data must not support identification — claiming it provides a basis to identify is false.", "mcq", { a: "True of valid de-id.", b: "Regulatory treatment once de-identified.", d: "Safe harbor path." }),

  tf(3, "phi", ["re-id"], 21, `A Covered Entity (CE) cannot use or disclose a re-identification code other than for re-identification.`, true,
    "Aligns with limitation themes in your Manual on re-identification codes."),

  mcq(2, "phi", ["limited-data-set"], 22, `A Limited Data Set may be used for the following purposes:`,
    {
      a: "Research",
      b: "Healthcare operations",
      c: "Public health purposes",
      d: "Marketing",
      e: "B and D",
      f: "A, B, and C",
    }, "f",
    "Marketing is excluded; research, certain operations, and public health purposes match the correct bundle.", "mcq", { d: "Excluded.", e: "Wrong combination." }),

  mcq(1, "privacy", ["privacy-rule-role"], 23, `The Privacy Rule:`,
    {
      a: "Limits PHI use and disclosure and establishes patient rights with regards to their PHI",
      b: "Prescribes what CEs and Business Associates (BAs) must do in the event of a breach",
      c: "Provides the Office for Civil Rights the authority to enforce HIPAA",
      d: "Protects only electronic Protected Health Information",
    }, "a",
    "Core Privacy Rule statement in your outline.", "mcq", { b: "Breach Notification Rule territory.", c: "Enforcement is broader than this stem.", d: "Describes ePHI-only — Security Rule." }),

  tf(2, "privacy", ["hhs-disclosure"], 24, `A CE is permitted to disclose PHI to the Department of Health and Human Services (HHS if required for a review) without the authority of an individual:`, true,
    "Disclosures to HHS for compliance oversight are recognized in your training."),

  mcq(2, "privacy", ["incidental"], 25, `An example of an incidental or accidental disclosure of PHI is ________, and is permitted under the Privacy Rule:`,
    {
      a: "Leaving a message with confidential health information on an answering machine",
      b: "A hospital visitor overhearing a conversation in a private room",
      c: "Disclosure to an individual without verifying that they are the subject of the information or the subject’s authorized personal representative",
      d: "Disclosure to another member of staff that does not have the authorization to view that information",
    }, "b",
    "Reasonable incidental overhearing vs negligent or wrongful disclosures.", "mcq", { a: "Often unacceptable.", c: "Fails verification duty.", d: "Minimum necessary failure." }),

  tf(1, "privacy", ["minimum-necessary"], 26, `Per the Minimum Necessary Principle, all uses, disclosures and requests for PHI should be the minimum amount needed to accomplish the intended purpose of the request.`, true,
    "Teaching point from your outline, subject to regulatory exceptions."),

  mcq(2, "privacy", ["minimum-necessary-exc"], 27, `The Minimum Necessary Rule does not apply in situations regarding:`,
    {
      a: "Treatment",
      b: "Disclosure to the subject of the PHI or with their authorization",
      c: "Marketing",
      d: "A, B and C",
      e: "B and C",
      f: "A and B",
    }, "f",
    "Your official test uses treatment and disclosures to/with the individual as the exempt combination (marketing is not in that pairing).", "mcq", { d: "Incorrect mix.", e: "Incorrect mix." }),

  mcq(2, "privacy", ["admin-reqs"], 28, `The Privacy Rule Administrative Requirements require:`,
    {
      a: "Workforce training",
      b: "Establishing a procedure for patients to make complaints",
      c: "Applying sanctions against workforce members that do not comply with HIPAA",
      d: "Maintaining HIPAA records for six years after the date of creation or effectivity date (whichever is later)",
      e: "All of the above",
    }, "e",
    "Administrative duties are cumulative in your packet.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete.", d: "Incomplete." }),

  tf(2, "privacy", ["preemption"], 29, `Federal privacy laws apply over State law unless HHS grants an exception or the State law provides greater privacy protections.`, true,
    "Preemption summary as in your Manual/training."),

  tf(2, "rights", ["permissions"], 30, `All uses and disclosures of PHI must be done with the permission of the individual except for the Permitted Uses and Disclosures.`, true,
    "Permitted pathway vs authorization framework."),

  mcq(2, "rights", ["access-right"], 31, `The Right to Access gives an individual the right to _________ and the healthcare provider the authority to ________.`,
    {
      a: "(Right to) inspect/obtain PHI in a request format / (authority to) establish a request for access process.",
      b: "(Right to) send the CE to send PHI to the person or entity of their choice / (authority to) deny a request for access.",
      c: "All of the above",
    }, "c",
    "Official test marks “All of the above” for combined access themes.", "mcq", { a: "Partial alone.", b: "Partial alone." }),

  mcq(3, "rights", ["drs"], 32, `Which of the following is false regarding a Designated Record Set?`,
    {
      a: "Healthcare providers are not required to create new information (for e.g. explanatory material) that does not exist in a Designated Record Set.",
      b: "A Designated Record Set comprises medical and billing records.",
      c: "The Right to Access applies to information that is in a Designated Record Set.",
      d: "Records used to make healthcare decisions like clinical case notes are not included in a Designated Record Set.",
    }, "d",
    "Clinical records used for decisions are typically within the DRS — excluding them is false.", "mcq", { a: "True.", b: "True framing.", c: "True." }),

  tf(2, "rights", ["access-timing"], 33, `Access to PHI must be granted to an individual within 30 days with one 30 day extension permitted.`, true,
    "Your test marks True for this access timing teaching point."),

  mcq(2, "rights", ["access-fees"], 34, `The Privacy Rule ______ a reasonable, cost based fee to fulfill a request for access.`,
    { a: "Permits", b: "Does not permit" }, "a",
    "Reasonable cost-based fees allowed with regulatory limits.", "mcq", { b: "Incorrect outright denial of fees." }),

  mcq(2, "rights", ["personal-rep"], 35, `An individual has the right to designate a personal representative such as:`,
    {
      a: "His/her parents",
      b: "A court appointed legal guardian",
      c: "Healthcare power of attorney",
      d: "All of the above",
    }, "d",
    "Multiple example categories in one answer in your test.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete." }),

  mcq(2, "rights", ["npp"], 36, `Which of the following is true regarding the Notice of Privacy Practices (NPP)?`,
    {
      a: "The NPP must be given to each patient on the first service delivery.",
      b: "It is recommended that the NPP is posted where it is visible to patients, for e.g. in the lobby",
      c: "CE’s are recommended to receive a written acknowledgement from individuals that they received the NPP.",
      d: "It is recommended to post the NPP on a healthcare provider website (if applicable).",
      e: "All of the above",
    }, "e",
    "Distribution and posting recommendations bundled.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete.", d: "Incomplete." }),

  tf(1, "rights", ["amend"], 37, `An individual has the right to request a CE to correct inaccurate or incomplete PHI.`, true,
    "Amendment right under the Privacy Rule."),

  mcq(3, "rights", ["accounting-exc"], 38, `CEs are not obligated to maintain an account of disclosures to or for:`,
    {
      a: "Treatment, payment or operations",
      b: "As required by law",
      c: "Marketing purposes",
      d: "The individual or their personal representative",
      e: "A, B and D",
      f: "All of the above",
    }, "e",
    "Accounting exceptions combine TPO, legal-required, and to-individual pathways in your keyed structure (not blanket “all”).", "mcq", { f: "Overbroad vs key." }),

  mcq(3, "rights", ["restrictions"], 39, `The right for restrictions applies:`,
    {
      a: "For treatment, payment or healthcare operations",
      b: "For public health purposes",
      c: "For disclosures to HHS",
      d: "For marketing purposes",
    }, "a",
    "Restriction requests are taught in the TPO context per your item (other stems are distractors).", "mcq", { b: "Distractor per test.", c: "Distractor per test.", d: "Distractor per test." }),

  mcq(1, "rights", ["complaints"], 40, `An individual ______ the right to make a complaint to the CE or OCR should they believe the Privacy Rule is not being upheld.`,
    { a: "Has", b: "Does not have" }, "a",
    "Complaint pathways to CE and OCR exist.", "mcq", { b: "Wrong." }),
];
