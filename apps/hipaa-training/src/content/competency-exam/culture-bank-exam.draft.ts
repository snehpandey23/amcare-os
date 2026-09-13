/**
 * DRAFT — Culture / language exam bank sample v1 (NOT live).
 *
 * Do not import into CULTURE_EXAM_APPROVED until Sonu marks items approved.
 * Daily Practice trivia pool is a separate bank — do not copy those stems here.
 *
 * Review: docs/reviews/CULTURE-EXAM-BANK-SAMPLE-v1-REVIEW.md → Sonu only (no clinical).
 */
export type CultureExamTopic =
  | "currency"
  | "units"
  | "holidays"
  | "idioms"
  | "cultural_refs";

export type DraftCultureExamItem = {
  id: string;
  topic: CultureExamTopic;
  prompt: string;
  choices: string[];
  /** 0-based index into choices — keyed answer */
  correctIndex: number;
  /** Short why — for reviewers / later explanation UI */
  rationale: string;
  /** Workplace relevance note for Sonu */
  whyUsefulForMa: string;
  status: "draft_pending_sonu";
};

/** 24 AI-draft sample items — genuine variants, not synonym swaps of daily trivia. */
export const CULTURE_EXAM_BANK_DRAFT_V1: DraftCultureExamItem[] = [
  // —— Currency / pricing (5) ——
  {
    id: "cult-draft-v1-001",
    topic: "currency",
    prompt:
      "A patient says the co-pay is “one ninety-nine.” In everyday US speech, they most likely mean:",
    choices: ["$199.00", "$1.99", "$19.90", "1.99 rupees"],
    correctIndex: 1,
    rationale: "Spoken “one ninety-nine” for a price usually means $1.99, not $199.",
    whyUsefulForMa: "Patients and staff quote small dollar amounts this way on calls.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-002",
    topic: "currency",
    prompt:
      "A patient asks if they can pay “in cash for fifty dollars even.” What do they mean?",
    choices: [
      "They will pay exactly $50.00 in cash",
      "They will pay $50 per installment forever",
      "They only accept checks",
      "They mean $50 in a foreign currency",
    ],
    correctIndex: 0,
    rationale: "“Fifty dollars even” = a round $50.00 with no cents.",
    whyUsefulForMa: "Cash / balance conversations at checkout and on billing callbacks.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-003",
    topic: "currency",
    prompt:
      "On a US price tag that shows $24.99, the “.99” is:",
    choices: [
      "Ninety-nine cents (almost $25)",
      "Ninety-nine dollars extra",
      "A tax code",
      "Always the tip amount",
    ],
    correctIndex: 0,
    rationale: "Cents are the two digits after the decimal; .99 is 99¢.",
    whyUsefulForMa: "Reading invoices, portal balances, and pharmacy cash prices.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-004",
    topic: "currency",
    prompt:
      "A front-desk coworker says “we’re waiting on a check to clear.” In US clinic billing talk, a “check” usually means:",
    choices: [
      "A paper bank check / cheque payment",
      "A medical exam checklist only",
      "A background check for the patient",
      "An insurance denial code",
    ],
    correctIndex: 0,
    rationale: "In payment context, “check” is a bank check (US spelling).",
    whyUsefulForMa: "Avoid confusing payment “check” with clinical checklists.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-005",
    topic: "currency",
    prompt:
      "A patient says “I only have a twenty.” In everyday US cash talk, they most likely mean:",
    choices: [
      "A $20 bill",
      "Twenty cents",
      "A 20% discount coupon",
      "Twenty appointments left",
    ],
    correctIndex: 0,
    rationale: "“A twenty” = a twenty-dollar bill.",
    whyUsefulForMa: "Cash payments and change-making language at the desk.",
    status: "draft_pending_sonu",
  },

  // —— Units (5) ——
  {
    id: "cult-draft-v1-006",
    topic: "units",
    prompt:
      "A patient says “it’s about 98.6 degrees.” In a US health context they almost always mean:",
    choices: ["Fahrenheit (normal oral temp ballpark)", "Celsius", "Kelvin", "Humidity percent"],
    correctIndex: 0,
    rationale: "US patients report body temperature in °F; ~98.6°F is the classic normal reference.",
    whyUsefulForMa: "Triage / nurse messages; don’t convert as if it were Celsius.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-007",
    topic: "units",
    prompt:
      "A patient texts that the outdoor temperature is “in the mid-70s.” They mean approximately:",
    choices: [
      "About 75°F (mild / warm for many US regions)",
      "75°C (dangerously hot)",
      "75% battery on their phone",
      "75 minutes of wait time",
    ],
    correctIndex: 0,
    rationale: "Weather “70s” in US speech = Fahrenheit decades.",
    whyUsefulForMa: "Small talk and “roads are icy / heat advisory” context on calls.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-008",
    topic: "units",
    prompt:
      "A patient says they bought “a gallon of milk.” A US gallon is closest to:",
    choices: [
      "About 3.8 liters (larger than a typical 1 L bottle)",
      "Exactly 1 liter",
      "A teaspoon",
      "A shipping container",
    ],
    correctIndex: 0,
    rationale: "US liquid gallon ≈ 3.785 L — everyday grocery unit.",
    whyUsefulForMa: "Nutrition / lifestyle chat; not a clinical conversion task, just fluency.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-009",
    topic: "units",
    prompt:
      "A patient says they lost “about five pounds.” In the US this usually means:",
    choices: [
      "Body weight (~5 lb, not 5 kilograms)",
      "Five British pounds sterling",
      "Five medications",
      "Five miles walked",
    ],
    correctIndex: 0,
    rationale: "US body weight is discussed in pounds (lb), not kg, in everyday speech.",
    whyUsefulForMa: "Intake / lifestyle updates — clarify only if clinical charting needs kg.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-010",
    topic: "units",
    prompt:
      "A patient says the clinic is “about two miles from my house.” Miles are:",
    choices: [
      "US customary distance (longer than a kilometer)",
      "The same as meters",
      "Only used for flight altitude",
      "A type of insurance plan",
    ],
    correctIndex: 0,
    rationale: "US driving / local distance is usually in miles.",
    whyUsefulForMa: "Directions, late/traffic excuses, home-visit logistics.",
    status: "draft_pending_sonu",
  },

  // —— Holidays / scheduling relevance (5) ——
  {
    id: "cult-draft-v1-011",
    topic: "holidays",
    prompt:
      "Thanksgiving week in the US is often hard for scheduling because:",
    choices: [
      "Many people travel or take time off around the fourth Thursday in November",
      "It always falls on July 4",
      "Banks are open extra hours that week only",
      "It is not a recognized US holiday",
    ],
    correctIndex: 0,
    rationale: "Thanksgiving = fourth Thursday in November; travel week affects availability.",
    whyUsefulForMa: "Offer alternate slots; expect no-shows / reschedules that week.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-012",
    topic: "holidays",
    prompt:
      "A patient says “we’re closed for the Fourth.” They most likely mean:",
    choices: [
      "July 4 (Independence Day) — many offices closed or short-staffed",
      "The fourth of every month",
      "April 15 tax day only",
      "The fourth Monday in January",
    ],
    correctIndex: 0,
    rationale: "“The Fourth” in US speech usually = July 4.",
    whyUsefulForMa: "Confirm holiday hours before promising same-day callbacks.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-013",
    topic: "holidays",
    prompt:
      "Between Christmas and New Year’s in the US, what should an MA generally expect?",
    choices: [
      "Slower responses from offices, pharmacies, and some patients (holiday week)",
      "No change ever — everything runs exactly as a normal week",
      "All medical offices are legally required to stay open 24/7",
      "Patients never travel then",
    ],
    correctIndex: 0,
    rationale: "Late December holiday week often means reduced staffing and travel.",
    whyUsefulForMa: "Set realistic follow-up expectations; don’t promise next-day everything.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-014",
    topic: "holidays",
    prompt:
      "A patient asks to avoid “Black Friday” for a morning appointment. Why might that matter?",
    choices: [
      "It’s the busy shopping day after Thanksgiving — traffic and family plans can make mornings unreliable",
      "It is a federal bank holiday when clinics must close",
      "It only exists in Canada",
      "It means Halloween",
    ],
    correctIndex: 0,
    rationale: "Black Friday = day after Thanksgiving; retail rush, not a federal clinic-closure day.",
    whyUsefulForMa: "Offer later slots; understand the cultural reference without over-promising closures.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-015",
    topic: "holidays",
    prompt:
      "Memorial Day weekend (late May) is a common time when:",
    choices: [
      "Patients travel or have cookouts — Monday may be a federal holiday with limited office hours",
      "Every US clinic is closed all of May",
      "It celebrates New Year only",
      "It is the same day as Christmas",
    ],
    correctIndex: 0,
    rationale: "Memorial Day = last Monday in May; long weekend travel is common.",
    whyUsefulForMa: "Not the same as “Memorial Day honors…” trivia — focus on ops impact.",
    status: "draft_pending_sonu",
  },

  // —— Idioms / everyday speech (5) ——
  {
    id: "cult-draft-v1-016",
    topic: "idioms",
    prompt:
      "A patient says “I’m a little under the weather.” They most likely mean:",
    choices: [
      "They feel mildly sick / unwell",
      "They are standing outside in rain only",
      "They want a weather forecast",
      "They are canceling because of a storm every time",
    ],
    correctIndex: 0,
    rationale: "“Under the weather” = feeling unwell.",
    whyUsefulForMa: "Common soft symptom language on calls — still follow triage rules.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-017",
    topic: "idioms",
    prompt:
      "A coworker says “can you hang tight for two minutes?” They want you to:",
    choices: [
      "Wait briefly",
      "Hang up the phone immediately",
      "Hold a physical rope",
      "Close the clinic",
    ],
    correctIndex: 0,
    rationale: "“Hang tight” = please wait a short time.",
    whyUsefulForMa: "Hold / transfer language with patients and teammates.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-018",
    topic: "idioms",
    prompt:
      "A patient says “I’ll take a rain check on that visit.” They most likely mean:",
    choices: [
      "They want to postpone / reschedule (not necessarily about weather)",
      "They will only come if it rains",
      "They want a paper check mailed",
      "They are confirming they will arrive early",
    ],
    correctIndex: 0,
    rationale: "“Rain check” = defer to another time.",
    whyUsefulForMa: "Hear cancel/reschedule intent even when weather isn’t mentioned.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-019",
    topic: "idioms",
    prompt:
      "A lead says “give me a ballpark on how many openings Friday.” They want:",
    choices: [
      "A rough estimate, not an exact audited count",
      "The address of a baseball stadium",
      "Only exact to-the-minute capacity with zero estimate",
      "A list of baseball scores",
    ],
    correctIndex: 0,
    rationale: "“Ballpark” = approximate figure.",
    whyUsefulForMa: "Internal ops language when scanning the schedule.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-020",
    topic: "idioms",
    prompt:
      "A patient asks “does 3 p.m. work for you all?” In US scheduling speech, “work for you” means:",
    choices: [
      "Is that time okay / available?",
      "Will you be employed at 3 p.m.?",
      "Can you do physical labor then?",
      "Is the Wi-Fi working?",
    ],
    correctIndex: 0,
    rationale: "“Does X work for you?” = is that convenient/available?",
    whyUsefulForMa: "Core booking phrase — answer with yes/no + alternate slots.",
    status: "draft_pending_sonu",
  },

  // —— Cultural / everyday references (4) ——
  {
    id: "cult-draft-v1-021",
    topic: "cultural_refs",
    prompt:
      "A patient says “I already called 911.” In the US, 911 is:",
    choices: [
      "The emergency services number (police / fire / ambulance)",
      "The clinic’s main appointment line",
      "IRS tax help",
      "A pharmacy refill code",
    ],
    correctIndex: 0,
    rationale: "911 = emergency; MA should not treat it as a routine clinic number.",
    whyUsefulForMa: "Safety triage — if emergency is active, do not delay with booking chat.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-022",
    topic: "cultural_refs",
    prompt:
      "When verifying identity, a US patient may be asked for their “ZIP code.” That means:",
    choices: [
      "Postal code for their address",
      "Their password for the patient portal",
      "Their insurance group number always",
      "Their shoe size",
    ],
    correctIndex: 0,
    rationale: "ZIP = US postal code.",
    whyUsefulForMa: "Identity / address verification on calls and forms.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-023",
    topic: "cultural_refs",
    prompt:
      "A patient says “football is on Sunday so I can’t do noon.” In everyday US speech, “football” usually means:",
    choices: [
      "American football (NFL) — often Sunday games",
      "Only soccer",
      "A type of CT scan",
      "A federal holiday every Sunday",
    ],
    correctIndex: 0,
    rationale: "In the US, “football” ≠ soccer; Sunday NFL is a common scheduling conflict.",
    whyUsefulForMa: "Offer non-game times without arguing sports.",
    status: "draft_pending_sonu",
  },
  {
    id: "cult-draft-v1-024",
    topic: "cultural_refs",
    prompt:
      "A patient mentions “my PCP.” In US healthcare talk this most often means:",
    choices: [
      "Primary care provider / physician",
      "Personal credit plan",
      "Pharmacy coupon program",
      "Patient complaint portal",
    ],
    correctIndex: 0,
    rationale: "PCP = primary care provider — common on intake and referral calls.",
    whyUsefulForMa: "Records / referral conversations; not a UK “GP” label but same idea.",
    status: "draft_pending_sonu",
  },
];
