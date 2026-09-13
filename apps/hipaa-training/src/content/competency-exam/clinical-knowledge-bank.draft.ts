/**
 * DRAFT — Clinical Knowledge exam bank sample (NOT live-approved).
 *
 * Sub-areas: terminology · MA operations · recent advances.
 * Review owner: **Vayushi first** (especially recent advances). Not Sonu.
 * Recent-advances items need periodic re-review (6–12 months) — not one-time approval.
 *
 * AI-drafted sample for founder/Vayushi review. Do not treat as clinical sign-off.
 */
import type { Question } from "@/lib/types";

export type ClinicalKnowledgeSubArea = "terminology" | "ma_operations" | "recent_advances";

export type ClinicalKnowledgeDraftItem = Question & {
  subArea: ClinicalKnowledgeSubArea;
  /** Who must clear before live exam use */
  reviewOwner: "Vayushi";
  status: "draft_pending_vayushi";
  /**
   * Months between re-reviews. Set on recent_advances (staleness risk).
   * Terminology / ops may omit (stable until clinical changes the SOP).
   */
  reReviewMonths?: 6 | 12;
};

function q(
  partial: Omit<ClinicalKnowledgeDraftItem, "difficulty" | "type" | "moduleId" | "sourceRef" | "reviewOwner" | "status"> & {
    difficulty?: 1 | 2 | 3;
    reReviewMonths?: 6 | 12;
  },
): ClinicalKnowledgeDraftItem {
  return {
    moduleId: "clinical-knowledge-draft",
    sourceRef: `Clinical knowledge draft · ${partial.id}`,
    difficulty: partial.difficulty ?? 2,
    type: "mcq",
    reviewOwner: "Vayushi",
    status: "draft_pending_vayushi",
    ...partial,
  };
}

/** 12 AI-draft sample items across terminology / MA ops / recent advances. */
export const CLINICAL_KNOWLEDGE_BANK_DRAFT_V1: ClinicalKnowledgeDraftItem[] = [
  // —— Terminology (4) ——
  q({
    id: "clin-draft-v1-001",
    subArea: "terminology",
    tags: ["clinical-knowledge", "terminology"],
    prompt: "In a patient chart, “PRN” most nearly means:",
    options: [
      { key: "A", text: "As needed" },
      { key: "B", text: "Every morning" },
      { key: "C", text: "By mouth only" },
      { key: "D", text: "Provider review needed" },
    ],
    correctKey: "A",
    explanation: "PRN (pro re nata) = as needed — common on med lists and after-visit instructions.",
  }),
  q({
    id: "clin-draft-v1-002",
    subArea: "terminology",
    tags: ["clinical-knowledge", "terminology"],
    prompt: "A note says the patient is “NPO after midnight.” NPO means:",
    options: [
      { key: "A", text: "Nothing by mouth" },
      { key: "B", text: "New patient only" },
      { key: "C", text: "Needs prior authorization" },
      { key: "D", text: "No phone outreach" },
    ],
    correctKey: "A",
    explanation: "NPO = nil per os — nothing by mouth (often before procedures).",
  }),
  q({
    id: "clin-draft-v1-003",
    subArea: "terminology",
    tags: ["clinical-knowledge", "terminology"],
    prompt: "“HTN” in a problem list most commonly stands for:",
    options: [
      { key: "A", text: "Hypertension" },
      { key: "B", text: "Hyperthyroidism" },
      { key: "C", text: "Hearing test normal" },
      { key: "D", text: "Home therapy needed" },
    ],
    correctKey: "A",
    explanation: "HTN is the standard abbreviation for hypertension.",
  }),
  q({
    id: "clin-draft-v1-004",
    subArea: "terminology",
    tags: ["clinical-knowledge", "terminology"],
    prompt: "A vitals note shows SpO₂ 98% on room air. SpO₂ refers to:",
    options: [
      { key: "A", text: "Oxygen saturation (pulse oximetry)" },
      { key: "B", text: "Systolic blood pressure only" },
      { key: "C", text: "Serum potassium" },
      { key: "D", text: "Speech clarity score" },
    ],
    correctKey: "A",
    explanation: "SpO₂ is peripheral oxygen saturation from pulse oximetry.",
  }),

  // —— MA operations (4) ——
  q({
    id: "clin-draft-v1-005",
    subArea: "ma_operations",
    tags: ["clinical-knowledge", "ma-operations"],
    prompt: "Before a telehealth ADHD follow-up, the MA’s best first check is usually:",
    options: [
      { key: "A", text: "Confirm identity, appointment time, and that intake/forms needed for the visit are complete" },
      { key: "B", text: "Decide whether the patient’s dose should increase" },
      { key: "C", text: "Promise a same-day controlled-substance refill on the call" },
      { key: "D", text: "Skip vitals documentation because it is telehealth" },
    ],
    correctKey: "A",
    explanation: "MAs prepare process (ID, timing, forms). Dose and refill decisions stay with the licensed clinician.",
  }),
  q({
    id: "clin-draft-v1-006",
    subArea: "ma_operations",
    tags: ["clinical-knowledge", "ma-operations"],
    prompt: "When documenting blood pressure for an adult intake, which practice is most appropriate?",
    options: [
      { key: "A", text: "Record the reading with cuff size/position notes as your clinic SOP requires; flag extremes to the clinician" },
      { key: "B", text: "Tell the patient their diagnosis based on one reading" },
      { key: "C", text: "Average three readings silently and only chart if “normal”" },
      { key: "D", text: "Never chart BP if the patient feels fine" },
    ],
    correctKey: "A",
    explanation: "MAs measure and document accurately and escalate extremes; they do not diagnose from a single reading.",
  }),
  q({
    id: "clin-draft-v1-007",
    subArea: "ma_operations",
    tags: ["clinical-knowledge", "ma-operations"],
    prompt: "A patient asks the MA which SSRI is “best.” The correct MA response is:",
    options: [
      { key: "A", text: "Explain you cannot recommend or choose medications; offer to send the question to the provider" },
      { key: "B", text: "Name the medication you personally prefer" },
      { key: "C", text: "Say all SSRIs are identical so it does not matter" },
      { key: "D", text: "Tell them to stop their current med and switch today" },
    ],
    correctKey: "A",
    explanation: "Medication selection is clinical decision-making — process redirect / escalate, do not prescribe by chat.",
  }),
  q({
    id: "clin-draft-v1-008",
    subArea: "ma_operations",
    tags: ["clinical-knowledge", "ma-operations"],
    prompt: "For many stimulant refill workflows, which statement is most accurate for an MA?",
    options: [
      { key: "A", text: "Follow clinic controlled-substance process; do not authorize or promise a refill yourself" },
      { key: "B", text: "MAs may verbally approve a 90-day stimulant fill on portal chat" },
      { key: "C", text: "If the pharmacy asks, the MA can change the written dose" },
      { key: "D", text: "Personal Venmo payment can speed a refill when the provider is busy" },
    ],
    correctKey: "A",
    explanation: "Controlled-substance refills follow policy and licensed clinicians — never personal payment or MA self-authorization.",
  }),

  // —— Recent advances (4) — Vayushi + periodic re-review ——
  q({
    id: "clin-draft-v1-009",
    subArea: "recent_advances",
    tags: ["clinical-knowledge", "recent-advances"],
    reReviewMonths: 12,
    prompt:
      "Regarding digital mental-health tools used alongside clinic care (apps, remote monitoring), which statement is most accurate for MA scope?",
    options: [
      { key: "A", text: "They may support care plans the clinician ordered; MAs still do not diagnose or replace clinician judgment" },
      { key: "B", text: "Any wellness app is an official ADHD diagnosis" },
      { key: "C", text: "MAs should tell patients to stop meds if an app score improves" },
      { key: "D", text: "Remote tools mean emergency symptoms can wait for portal reply" },
    ],
    correctKey: "A",
    explanation:
      "Tools can support ordered care; diagnosis, med changes, and emergencies still follow clinician/safety process. Re-review periodically — tooling landscape changes.",
  }),
  q({
    id: "clin-draft-v1-010",
    subArea: "recent_advances",
    tags: ["clinical-knowledge", "recent-advances"],
    reReviewMonths: 12,
    prompt:
      "When a patient mentions a new long-acting stimulant formulation they saw advertised, the MA should:",
    options: [
      { key: "A", text: "Avoid product claims; document the question and route to the provider for clinical discussion" },
      { key: "B", text: "Confirm the ad and promise that formulation today" },
      { key: "C", text: "Say brand ads are always more accurate than the clinic" },
      { key: "D", text: "Order the new formulation without a visit" },
    ],
    correctKey: "A",
    explanation: "Marketing claims change quickly — MAs document and escalate; clinicians decide therapy. Flag for 6–12 month content review.",
  }),
  q({
    id: "clin-draft-v1-011",
    subArea: "recent_advances",
    tags: ["clinical-knowledge", "recent-advances"],
    reReviewMonths: 6,
    prompt:
      "AI scribes / ambient documentation tools in clinic workflows — which is the safest MA-facing framing?",
    options: [
      { key: "A", text: "They may draft notes for clinician review; staff still verify PHI routing and do not treat drafts as final without process" },
      { key: "B", text: "AI notes never need human review" },
      { key: "C", text: "MAs may paste AI text into patient chat as medical advice" },
      { key: "D", text: "AI tools replace HIPAA obligations" },
    ],
    correctKey: "A",
    explanation: "Ambient AI is evolving — keep human review + PHI discipline. Re-review every ~6 months as policies shift.",
  }),
  q({
    id: "clin-draft-v1-012",
    subArea: "recent_advances",
    tags: ["clinical-knowledge", "recent-advances"],
    reReviewMonths: 12,
    prompt:
      "A patient asks whether a new over-the-counter “ADHD supplement stack” replaces prescription stimulants. Best MA response:",
    options: [
      { key: "A", text: "Do not endorse or compare treatments; offer to forward the question to the provider and avoid stopping prescribed meds without clinician guidance" },
      { key: "B", text: "Agree that supplements are always safer and equivalent" },
      { key: "C", text: "Instruct them to stop stimulants immediately" },
      { key: "D", text: "Sell them a supplement link from personal social media" },
    ],
    correctKey: "A",
    explanation: "Supplement claims change and can be unsafe with meds — escalate; never substitute clinical advice. Periodic re-review required.",
  }),
];

export function clinicalKnowledgeDraftAsQuestions(): Question[] {
  return CLINICAL_KNOWLEDGE_BANK_DRAFT_V1.map(
    ({ subArea: _s, reviewOwner: _r, status: _st, reReviewMonths: _m, ...q }) => q,
  );
}
