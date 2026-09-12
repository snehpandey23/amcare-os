/**
 * Clinical documentation + escalation Writing bank (two-part).
 *
 * DRAFT — clinical rules locked from Vayushi decision log (2026-09-12).
 * Still pending Sonu MA-clarity pass and founder ship for official scoring.
 * Patient-communication prompts remain in writing-prompts.draft.ts (supplement, not replace).
 */
export type ClinicalWritingFamily =
  | "pill-count"
  | "dose-mismatch"
  | "missed-doses"
  | "early-refill"
  | "side-effect";

export type ClinicalWritingPrompt = {
  id: string;
  title: string;
  family: ClinicalWritingFamily;
  /** Shown to the person taking the exercise */
  scenario: string;
  /** Short Part A reminder (chart note) */
  chartHint: string;
  /** Short Part B reminder — must include an explicit ask to the provider */
  escalationHint: string;
  /** When true, expected-remaining pill math applies (controlled only) */
  controlledSubstance: boolean;
  reviewStatus: "draft_pending_vayushi" | "draft_pending_sonu";
  reviewer: "Vayushi" | "Sonu";
};

/**
 * Language audit (decision #17): stems use neutral factual framing only.
 * Avoided: non-compliant, abusing, diverting, "wrong dose" as proven fact, similar labels.
 */
export const WRITING_CLINICAL_PROMPTS: ClinicalWritingPrompt[] = [
  {
    id: "write-clin-pill-count-v1",
    title: "Pill count — controlled med",
    family: "pill-count",
    controlledSubstance: true,
    scenario: [
      "You are coordinating a refill for a controlled medication (once-daily tablets, 30-day supply).",
      "Last fill: 18 days ago. Patient reports counting 21 tablets remaining today.",
      "Patient called about pharmacy timing. They are not asking for an early refill on this call and do not report distress.",
      "Expected remaining for day 18 of a 30-day once-daily fill is about 12 tablets (30 − 18).",
      "Patient count (21) is higher than expected for this day in the cycle.",
      "You have checked and verified with the pharmacy. Pend any refill order only if your workflow requires it before the provider reviews.",
    ].join(" "),
    chartHint:
      "Write a chart note with: last fill timing, patient-reported count, expected remaining for a 30-day once-daily controlled fill, and that they are not requesting an early refill on this call. Facts only — no judgment labels.",
    escalationHint:
      "Message the provider with the count outcome (higher / lower / same vs expected), that pharmacy was checked and verified, and whether an order was pended. If the patient were missing more than 3 days’ supply, mark urgent — here the count is higher than expected, so use the usual timeline. End with a clear ask (for example: please review and advise next steps).",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-clin-dose-mismatch-v1",
    title: "Reported dose differs from order",
    family: "dose-mismatch",
    controlledSubstance: false,
    scenario: [
      "Patient messages: “I’ve been taking the 25 mg tablet every morning like we talked about.”",
      "The last signed order on file is 50 mg once daily. Visit was two weeks ago; you did not personally counsel a dose change.",
      "Patient says they feel fine and report no side effects.",
      "Before escalating, you verified the bottle label / tablet imprint and it matches what the patient says they are taking (25 mg).",
    ].join(" "),
    chartHint:
      "Document patient-reported dose, dose on the signed order, that bottle/imprint was verified, and that they report feeling fine with no side effects. Do not label this as a dosing error — report what they said and what the order shows.",
    escalationHint:
      "Escalate the dose difference (patient reports 25 mg; order is 50 mg; bottle/imprint verified). Note you told the patient not to change their dose until the provider replies. End with a clear ask (for example: please advise whether the order or the patient’s regimen should be clarified, and if we should call the patient).",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-clin-missed-doses-v1",
    title: "Missed evening doses",
    family: "missed-doses",
    controlledSubstance: false,
    scenario: [
      "At a check-in, the patient says they sometimes forget their evening blood pressure medication.",
      "For the past week they report missing 3 of the last 7 evening doses. They report taking morning doses.",
      "They share home blood pressure readings: 138/86 (sitting, left arm, after 5 minutes rest, this morning) and 142/90 (sitting, left arm, after 5 minutes rest, yesterday evening).",
      "You are not interpreting the readings. The patient asks if missing doses is “a big deal.”",
    ].join(" "),
    chartHint:
      "Document the patient-reported missed evening doses (3 of last 7), that mornings were taken as reported, the home BP numbers with measurement environment details, and that you deferred their question about how significant the misses are. Numbers and facts only — no judgment labels.",
    escalationHint:
      "Escalate the missed-evening-dose pattern and that the patient asked about significance (deferred to provider). Include the home BP numbers and environment. End with a clear ask (for example: please review and advise on follow-up or counseling).",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-clin-early-refill-v1",
    title: "Early refill — second request",
    family: "early-refill",
    controlledSubstance: false,
    scenario: [
      "Patient requests a refill about 10 days before the due date. This applies to any medication under clinic refill timing rules.",
      "This is the second early refill request in the last 60 days (flag the pattern).",
      "Patient says they are traveling soon and do not want to run out. They are polite. They do not report acute distress on this message.",
    ].join(" "),
    chartHint:
      "Document the early request timing, that this is the second early request in 60 days, the travel reason as stated, and that no acute distress was reported. Facts only — no judgment labels about motive.",
    escalationHint:
      "Escalate the early refill request and flag the second-request-in-60-days pattern, including the travel reason. You may tell the patient you will ask the provider and that non-urgent replies are usually within 1–2 working days. End with a clear ask (for example: please advise whether to approve, adjust quantity, or counsel the patient).",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-clin-side-effect-v1",
    title: "New rash on recent start",
    family: "side-effect",
    controlledSubstance: false,
    scenario: [
      "Patient started a new medication 5 days ago per chart. They message: “I’ve had a rash on my arms since yesterday. It’s itchy but I’m breathing fine. Should I stop the medicine?”",
      "You asked red-flag questions. Patient reports: no fever, no trouble breathing, no swelling of lips/tongue/face, no chest pain, no throat tightness.",
      "This is routed as a non-urgent portal message with the usual timeline, and the patient should go to ER or urgent care if symptoms worsen or change while waiting for the provider.",
      "Tell the patient not to make any medication changes until the provider says so.",
    ].join(" "),
    chartHint:
      "Document med start timing, rash and itch onset, red-flag answers (negatives as reported), that the patient asked about stopping, and that you advised no changes until the provider replies plus ER/urgent care if worsening. Facts only.",
    escalationHint:
      "Escalate the new rash after recent start, red-flag screen results, and that the patient asked about stopping. Note non-urgent routing plus ER/urgent-care guidance if worsening. End with a clear ask (for example: please review and advise on next steps and whether we should call the patient).",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
];
