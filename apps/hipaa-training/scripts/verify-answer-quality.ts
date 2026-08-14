/**
 * Local verification for answer-quality gate.
 * Run: cd apps/hipaa-training && npx tsx scripts/verify-answer-quality.ts
 */
import {
  assessAnswerSubstantiveness,
  assessMultiFieldAnswers,
  isHeuristicallyWeakAnswer,
} from "../src/lib/answer-quality";

type Case = {
  name: string;
  expectReject: boolean;
  run: () => Promise<{ ok: boolean; layer: string; reason?: string; followUp: string; weakFields?: string[] }>;
};

const PURPOSE_Q = "What is this SOP for, in one line?";
const STEPS_Q = "What are the steps, in order?";

const substantiveSteps = [
  "1. MA opens Klarity and filters today's appointments.",
  "2. For each visit, confirm invoice balance is $0 or payment plan noted.",
  "3. Confirm intake + consent forms are complete; if not, message patient and escalate to Billing if unpaid 24h before.",
  "4. Flag incomplete charts to the provider before the visit starts.",
].join(" ");

const cases: Case[] = [
  // --- Gibberish (must fail) ---
  {
    name: 'As.',
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: PURPOSE_Q, answer: "As." }),
  },
  {
    name: "This SOP applies to fas.",
    expectReject: true,
    run: () =>
      assessAnswerSubstantiveness({
        question: "Who does this apply to?",
        answer: "This SOP applies to fas.",
      }),
  },
  {
    name: "1. Afs. 2. Afs. 3. Afs.",
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: STEPS_Q, answer: "1. Afs. 2. Afs. 3. Afs." }),
  },
  {
    name: "ABCD",
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: PURPOSE_Q, answer: "ABCD" }),
  },
  {
    name: "test",
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: PURPOSE_Q, answer: "test" }),
  },
  {
    name: "it depends",
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: PURPOSE_Q, answer: "it depends" }),
  },
  {
    name: "we'll figure it out",
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: STEPS_Q, answer: "we'll figure it out" }),
  },
  {
    name: "not sure",
    expectReject: true,
    run: () => assessAnswerSubstantiveness({ question: PURPOSE_Q, answer: "not sure" }),
  },
  {
    name: "reproduction multi-field junk",
    expectReject: true,
    run: () =>
      assessMultiFieldAnswers([
        { field: "purpose", question: PURPOSE_Q, answer: "As." },
        { field: "appliesTo", question: "Who?", answer: "This SOP applies to fas." },
        { field: "steps", question: STEPS_Q, answer: "1. Afs. 2. Afs. 3. Afs." },
        { field: "exceptions", question: "Exceptions?", answer: "As." },
        { field: "escalateTo", question: "Escalate?", answer: "fas." },
      ]),
  },
  // --- Genuine (must pass) — including short one-line roles that used to false-reject ---
  {
    name: "short real appliesTo: Medical assistants",
    expectReject: false,
    run: () =>
      assessAnswerSubstantiveness({
        question: "Who does this apply to?",
        answer: "Medical assistants",
      }),
  },
  {
    name: "short real escalateTo: Billing lead",
    expectReject: false,
    run: () =>
      assessAnswerSubstantiveness({
        question: "Who should someone escalate to if they're stuck?",
        answer: "Billing lead",
      }),
  },
  {
    name: "short real exceptions: Card declines",
    expectReject: false,
    run: () =>
      assessAnswerSubstantiveness({
        question: "What commonly goes wrong?",
        answer: "Card declines",
      }),
  },
  {
    name: "realistic multi-field (was false-rejecting appliesTo/exceptions/escalateTo)",
    expectReject: false,
    run: () =>
      assessMultiFieldAnswers([
        {
          field: "purpose",
          question: PURPOSE_Q,
          answer: "Confirm Klarity payment and intake before visits go live.",
        },
        { field: "appliesTo", question: "Who?", answer: "Medical assistants" },
        {
          field: "steps",
          question: STEPS_Q,
          answer:
            "1. Open Klarity and filter today appointments. 2. Confirm invoice cleared or plan noted. 3. Confirm intake and consents complete. 4. Message patient if incomplete; escalate unpaid 24h cases to Billing.",
        },
        { field: "exceptions", question: "Exceptions?", answer: "Card declines" },
        { field: "escalateTo", question: "Escalate?", answer: "Billing lead" },
      ]),
  },
  {
    name: "substantive multi-field with empty optional exceptions",
    expectReject: false,
    run: () =>
      assessMultiFieldAnswers([
        {
          field: "purpose",
          question: PURPOSE_Q,
          answer:
            "Pre-visit readiness checklist so MAs confirm payment and intake forms before Klarity telehealth visits go live.",
        },
        {
          field: "appliesTo",
          question: "Who?",
          answer: "Medical assistants and concierge staff on morning shift before first visit.",
        },
        {
          field: "steps",
          question: STEPS_Q,
          answer: substantiveSteps,
        },
        {
          field: "escalateTo",
          question: "Escalate?",
          answer: "Escalate payment issues to Billing lead; clinical form gaps to the covering provider.",
        },
      ]),
  },
  {
    name: "substantive purpose+steps",
    expectReject: false,
    run: async () => {
      const purpose = await assessAnswerSubstantiveness({
        question: PURPOSE_Q,
        answer:
          "Pre-visit readiness checklist so MAs confirm payment and intake forms before Klarity telehealth visits go live.",
      });
      if (!purpose.ok) return purpose;
      return assessAnswerSubstantiveness({
        question: STEPS_Q,
        answer: substantiveSteps,
      });
    },
  },
];

async function main() {
  console.log("--- Heuristic smoke ---");
  const heuristicSamples: [string, boolean][] = [
    ["As.", true],
    ["fas.", true],
    ["Afs.", true],
    ["ABCD", true],
    ["test", true],
    ["it depends", true],
    ["This SOP applies to fas.", true],
    ["1. Afs. 2. Afs. 3. Afs.", true],
    ["Medical assistants", false],
    ["Billing lead", false],
    ["Card declines", false],
    [substantiveSteps, false],
  ];
  let hFail = 0;
  for (const [s, expectWeak] of heuristicSamples) {
    const weak = isHeuristicallyWeakAnswer(s);
    const ok = weak === expectWeak;
    if (!ok) hFail += 1;
    console.log(
      `${ok ? "PASS" : "FAIL"} | heuristic(${JSON.stringify(s).slice(0, 60)}) weak=${weak} expectWeak=${expectWeak}`,
    );
  }

  console.log("\n--- Full gate (heuristic → LLM) ---");
  let failed = hFail;
  for (const c of cases) {
    const v = await c.run();
    const rejected = !v.ok;
    const pass = rejected === c.expectReject;
    if (!pass) failed += 1;
    console.log(
      `${pass ? "PASS" : "FAIL"} | ${c.name} | expectReject=${c.expectReject} gotReject=${rejected} layer=${v.layer}` +
        (v.reason ? ` reason=${v.reason}` : "") +
        (v.weakFields?.length ? ` weak=${v.weakFields.join(",")}` : "") +
        (v.followUp ? ` | followUp=${v.followUp.slice(0, 80)}…` : ""),
    );
  }
  if (failed) {
    console.error(`\n${failed} case(s) failed`);
    process.exit(1);
  }
  console.log("\nAll cases passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
