import type { Question } from "@/lib/types";
import { mcq, tf } from "./questionHelpers";

/** Questions 41–73 from HIPAA Test for Healthcare Providers (Gamma Compliance). */
export const QUESTIONS_PART_2: Question[] = [
  mcq(1, "security", ["security-rule-scope"], 41, `The Security Rule:`,
    {
      a: "Defines the permitted uses and disclosures of PHI",
      b: "Provides OCR the authority to enforce HIPAA",
      c: "Requires CEs to establish certain safeguards for the protection of ePHI",
      d: "Requires CEs and BAs to provide notification of breaches of PHI and ePHI",
    }, "c",
    "Security Rule is the ePHI safeguards rule; permitted uses are Privacy Rule; breach notification is separate.", "mcq", { a: "Privacy Rule focus.", b: "Enforcement is broader than this distractor.", d: "Breach Notification Rule." }),

  tf(1, "security", ["ephi-scope"], 42, `The Security Rule applies only to electronic Protected Health Information`, true,
    "Security Rule standards address electronic PHI (ePHI); Privacy Rule addresses PHI more broadly."),

  mcq(1, "security", ["flexibility"], 43, `Factors that CEs may consider when following the Security Rule include:`,
    {
      a: "Their size, complexity and services",
      b: "Their technical systems",
      c: "Potential costs of implementation",
      d: "All of the above",
    }, "d",
    "Flexible, scalable approach based on organizational facts — all listed factors appear in your materials.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete." }),

  tf(1, "security", ["risk-analysis"], 44, `Risk Assessment is intended to evaluate the probability and severity of potential risks to privacy and security of ePHI.`, true,
    "Risk analysis purpose as taught (consider org’s risk analysis policy for documentation detail)."),

  mcq(2, "security", ["risk-analysis"], 45, `Select the option that does not apply regarding Risk Assessments:`,
    {
      a: "HIPAA requires CEs to perform a Risk Assessment when initially coming into compliance with HIPAA",
      b: "Risk Assessments do not need to be documented",
      c: "HIPAA Risk Assessments determine risk level to the privacy and security of ePHI",
      d: "Risk Assessments should be reviewed annually",
    }, "b",
    "Assessments must be documented — the statement that documentation is unnecessary is the outlier.", "mcq", { a: "Applies.", c: "Applies.", d: "General practice in your training materials." }),

  tf(2, "security", ["preemption"], 46, `Federal law preempts State law with regards to the Security Rule unless HHS grants an exemption or the State law is more stringent than the Federal law.`, true,
    "Preemption framework parallel to Privacy Rule teaching in your packet."),

  tf(1, "safeguards", ["safeguard-types"], 47, `The types of Safeguards include Administrative, Physical, Technical, Organizational and Procedural.`, true,
    "Matches Security Rule structure in your outline and HHS Security Series."),

  tf(1, "safeguards", ["standards"], 48, `Standards are the requirements CEs must comply with and Implementation Specifications are the tasks that must be considered in order to comply with those requirements.`, true,
    "Teaching-level summary of standards vs implementation specifications (see Manual for precision)."),

  mcq(2, "safeguards", ["addressable"], 49, `Addressable specifications:`,
    {
      a: "Must be implemented",
      b: "Must be reviewed for applicability in a practice; if not reasonable and appropriate, it need not be implemented",
      c: "Are optional",
    }, "b",
    "Addressable means assess and document whether reasonable and appropriate — not ignore entirely.", "mcq", { a: "Describes required.", c: "Too weak — documentation/assessment still required." }),

  tf(1, "safeguards", ["admin-incident"], 50, `The Administrative Safeguards require policies to address security incidents should they occur.`, true,
    "Security incident procedures are part of administrative safeguards."),

  mcq(2, "safeguards", ["physical"], 51, `The Physical Safeguards require the following facility provisions:`,
    {
      a: "Protections such as locked doors, alarms, security cameras as necessary",
      b: "Maintain records of repairs and modifications to security related components of the facility",
      c: "Secure computer hardware that contain ePHI",
      d: "Dispose and re-use media containing ePHI in ways that prevent unauthorized access to ePHI",
      e: "All of the above",
    }, "e",
    "Physical safeguard themes are combined in the official test answer.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete.", d: "Incomplete." }),

  tf(1, "safeguards", ["unique-id"], 52, `Each employee that is accessing a system containing ePHI must have a unique ID.`, true,
    "Unique user identification is a technical safeguard requirement (required implementation specification)."),

  tf(1, "safeguards", ["policy-review"], 53, `It is recommended that HIPAA policies, procedures and other records be reviewed on an annual basis.`, true,
    "Annual review is standard organizational practice highlighted in your training."),

  mcq(1, "breach", ["breach-def"], 54, `A breach is`,
    {
      a: "An unauthorized use or disclosure of PHI",
      b: "An unauthorized use or disclosure of ePHI",
      c: "Compromises privacy and security",
      d: "All of the above",
    }, "d",
    "Composite definition used in your breach module/test.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete." }),

  tf(2, "breach", ["notification-exc"], 55, `Breach notification is required regardless of the circumstances of the breach.`, false,
    "False — low probability of compromise and other exceptions may apply per your Manual (document analysis)."),

  mcq(2, "breach", ["who-notify"], 56, `The party that is only required to be notified of a breach in certain cases is:`,
    {
      a: "The affected individuals",
      b: "The media",
      c: "The HHS Secretary",
    }, "c",
    "HHS notification follows thresholds/timing rules; individuals generally must be notified absent an exception; media only large-scale scenarios in your materials.", "mcq", { a: "Typically must be notified with limits.", b: "Media notification is situation-specific (e.g., >500 in jurisdiction)." }),

  mcq(2, "breach", ["timing"], 57, `Notice of a breach must be provided within _____ days.`,
    { a: "15", b: "30", c: "45", d: "60" }, "d",
    "Individual notification: without unreasonable delay and no later than 60 days per your training item.", "mcq", { a: "Not the test answer.", b: "Not the test answer.", c: "Not the test answer." }),

  mcq(2, "breach", ["hhs-timing"], 58, `In what type of breach must HHS be notified without unreasonable delay and no later than 60 days?`,
    {
      a: "If the breach affects fewer than 500 individuals",
      b: "If the breach affects more than 500 individuals",
    }, "b",
    "Large breaches trigger HHS notification on the shortened timeline in your teaching (verify current policy for aggregation nuances).", "mcq", { a: "Smaller breaches may be logged annually per handbook themes." }),

  mcq(3, "breach", ["burden-proof"], 59, `What is Breach Notification Burden of Proof?`,
    {
      a: "CEs or BAs must demonstrate and provide documentation that all required notices have been made.",
      b: "OCR must demonstrate and provide documentation that all required notices have been made.",
      c: "CEs or BAs must demonstrate and provide documentation that a breach did not occur.",
      d: "OCR must demonstrate and provide documentation that a breach did not occur.",
      e: "A and C",
      f: "All of the Above",
    }, "e",
    "Your official test uses the combined burden on regulated entities to show notifications occurred or that a reportable breach did not occur (see your answer key / compliance officer for exact letter match).", "mcq", { b: "OCR burden is incorrect here.", d: "OCR burden is incorrect here.", f: "Broader than keyed answer." }),

  mcq(2, "breach", ["breach-admin"], 60, `The Breach Notification Administrative Requirements include:`,
    {
      a: "Having written breach notification policies and procedures",
      b: "Training workforce members about breach notification",
      c: "Developing and applying sanctions for those not complying with breach notification policies and procedures",
      d: "All of the above",
    }, "d",
    "Administrative requirements bundle in your test.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete." }),

  mcq(2, "enforcement", ["ocr-role"], 61, `The Office for Civil Rights (OCR) enforces HIPAA through (select the option that does not apply):`,
    {
      a: "Investigating complaints",
      b: "Conducting compliance audits",
      c: "Conducting compliance reviews",
      d: "Criminal prosecution",
    }, "d",
    "Criminal enforcement is generally prosecuted through DOJ; OCR’s civil enforcement tools are listed in the other options.", "mcq", { a: "Civil enforcement tool.", b: "Civil enforcement tool.", c: "Civil enforcement tool." }),

  tf(2, "enforcement", ["complaints"], 62, `OCR reviews all complaints it receives but may only take action on certain complaints.`, true,
    "Triaging complaints is part of OCR practice as trained."),

  mcq(2, "enforcement", ["investigation"], 63, `OCR communicates with the following parties when investigating a complaint:`,
    {
      a: "The person who filed the complaint",
      b: "The CE and/or BA named",
      c: "The media",
      d: "A and B",
      e: "A, B and C",
    }, "d",
    "Complainant and regulated entity communications — not routine media contact.", "mcq", { e: "Includes inappropriate party." }),

  tf(1, "enforcement", ["audit-types"], 64, `The types of compliance audits include onsite or desk (electronic) audits.`, true,
    "Audit modalities per OCR guidance in your supporting materials."),

  mcq(2, "enforcement", ["audit-selection"], 65, `Which is true with regards to who may be selected for an audit?`,
    {
      a: "Any CE or BA may be audited",
      b: "Only CEs or BAs for which there has been a complaint may be audited",
      c: "If an entity has been audited, they will not be audited again",
    }, "a",
    "Selection is not limited solely to complained-of entities; prior audit does not permanently immunize.", "mcq", { b: "Too narrow.", c: "Incorrect permanence." }),

  tf(2, "enforcement", ["audit-scope"], 66, `The OCR audit program includes State specific rules.`, false,
    "Federal HIPAA audit program focuses on federal HIPAA standards; state law may add obligations separately."),

  mcq(3, "enforcement", ["compliance-review"], 67, `Compliance reviews may be initiated (select the option that does not apply):`,
    {
      a: "As a result of a complaint",
      b: "If a serious compliance issue is revealed during an audit",
      c: "At random",
    }, "c",
    "Reviews tied to complaints or serious findings — “at random” is the distractor per your item structure.", "mcq"),

  mcq(2, "enforcement", ["penalty-factors"], 68, `Money penalties may be instituted should CEs and BAs fail to comply with HIPAA based on the following:`,
    {
      a: "The severity of the violation",
      b: "Degree of neglect",
      c: "Date of the violation",
      d: "Repeat offenses",
      e: "All of the above",
    }, "e",
    "Penalty determinations consider multiple factors in your training.", "mcq", { a: "Incomplete.", b: "Incomplete.", c: "Incomplete.", d: "Incomplete." }),

  mcq(3, "enforcement", ["penalty-amounts"], 69, `The maximum annual civil penalty that may be applied for a HIPAA violation in which reasonable cause can be justified is:`,
    {
      a: "$100,000",
      b: "$250,000",
      c: "$500,000",
      d: "$1,500,000",
    }, "a",
    "General best practice: OCR penalty tiers and dollar caps change with federal rule updates. **Verify the figure in your current HIPAA Manual / printed answer key** and update this question when your kit updates.", "mcq", { b: "May apply under different tier/cap structure.", c: "Distractor.", d: "Often cited as higher-tier cap — confirm with current law for exact tier." }),

  mcq(3, "enforcement", ["criminal"], 70, `The criminal penalty for a knowledgeable disclosure of PHI with intent to use it for personal gain is up to _____ years imprisonment`,
    { a: "1", b: "2", c: "5", d: "10" }, "c",
    "Your training test uses the 5-year option for this criminal scenario (statutory tiers have multiple levels — confirm with Manual/counsel for exact provision).", "mcq", { a: "Lower than keyed answer.", b: "Lower than keyed answer.", d: "Higher tier may apply for different scienter facts." }),

  tf(1, "admin-simp", ["transactions"], 71, `CEs who conduct a standard transaction must use an adopted transaction standard appropriate for their type of practice.`, true,
    "Administrative Simplification transaction standard obligation."),

  tf(1, "admin-simp", ["code-sets"], 72, `HIPAA requires specific code sets to be used for all transactions based on the type of practice.`, true,
    "Code set requirements attach to covered electronic transactions."),

  tf(1, "admin-simp", ["npi"], 73, `All healthcare providers must identify themselves on standard transactions using a National Provider Identifier.`, true,
    "NPI use on applicable standard transactions as trained."),
];
