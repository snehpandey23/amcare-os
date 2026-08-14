/**
 * Verify SOP Refine: quality gate + multi-step draft→refine→refine (checklist + prose).
 * Run: cd apps/hipaa-training && npx tsx --env-file=.env.local scripts/verify-sop-refine.ts
 */
import { assessRefineInstruction, refinePromptPreamble } from "../src/lib/sop-refine";
import { generateChecklistDraft } from "../src/lib/sop-builder-assist";
import { generateSopDraftFromAnswers } from "../src/lib/sop-draft-assist";
import { workforceLlmConfigured } from "../src/lib/siya-os/model";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function stepBlob(items: { label: string }[]) {
  return items.map((s, i) => `${i + 1}. ${s.label}`).join("\n");
}

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      console.warn(`${label} attempt ${i}/${attempts} failed:`, err instanceof Error ? err.message : err);
    }
  }
  throw last;
}

async function main() {
  console.log("=== quality gate ===");
  const junk = await assessRefineInstruction("asdf");
  assert(!junk.ok, "gibberish refine should fail");
  console.log("junk rejected:", junk.layer);

  const thin = await assessRefineInstruction("make better");
  assert(!thin.ok, "vague refine should fail");
  console.log("vague rejected:", thin.layer);

  const good = await assessRefineInstruction(
    "Make step 3 more specific about who to notify and by when.",
  );
  assert(good.ok, "substantive refine should pass");
  console.log("good accepted:", good.layer);

  const preamble = refinePromptPreamble("Add an escalation timeline of 24 hours.");
  assert(preamble.includes("REFINING AN EXISTING DRAFT"), "preamble mode");
  assert(preamble.includes("escalation timeline"), "preamble carries instruction");

  if (!workforceLlmConfigured()) {
    console.log("SKIP LLM multi-step — workforce LLM not configured");
    process.exit(0);
  }

  const transcript = [
    { role: "assistant" as const, content: "What is this daily checklist for?" },
    {
      role: "user" as const,
      content:
        "Front-desk morning open: unlock clinic systems, confirm telehealth rooms, check no-show list before 9am.",
    },
    { role: "assistant" as const, content: "Who owns each step?" },
    {
      role: "user" as const,
      content:
        "Medical assistant opens rooms; front desk lead confirms schedule and flags no-shows to the provider.",
    },
    { role: "assistant" as const, content: "What happens if something fails?" },
    {
      role: "user" as const,
      content: "If Zoom rooms fail, page IT; if a provider is late, text the care coordinator within 10 minutes.",
    },
    { role: "assistant" as const, content: "Any exceptions?" },
    {
      role: "user" as const,
      content: "Holidays skip room open; weekend telehealth uses the on-call checklist instead.",
    },
  ];

  console.log("\n=== checklist: draft ===");
  const d0 = await withRetry("checklist draft", () =>
    generateChecklistDraft({
      topic: "Front desk morning open checklist",
      sourceRefs: { sops: [], kb: [] },
      transcript,
    }),
  );
  assert(d0?.title && d0.checklistItems.length >= 3, "initial checklist draft");
  console.log("TITLE0:", d0.title);
  console.log(stepBlob(d0.checklistItems));

  console.log("\n=== checklist: refine 1 (new IT escalation step) ===");
  const d1 = await withRetry("checklist refine1", () =>
    generateChecklistDraft({
      topic: "Front desk morning open checklist",
      sourceRefs: { sops: [], kb: [] },
      transcript,
      currentDraft: d0,
      refineInstruction:
        "Insert a NEW checklist step that says: Page IT within 15 minutes if any Zoom room fails audio or video, and write the ticket number in the open log.",
    }),
  );
  assert(d1?.checklistItems.length, "refine1 checklist");
  const d1Steps = stepBlob(d1.checklistItems);
  console.log("TITLE1:", d1.title);
  console.log(d1Steps);
  const hasEscalation = /15\s*min|ticket number|open log|page IT/i.test(d1Steps);
  assert(hasEscalation, "refine1 must add IT/15min/ticket/open-log markers");

  console.log("\n=== checklist: refine 2 (title change, keep escalation) ===");
  const d2 = await withRetry("checklist refine2", () =>
    generateChecklistDraft({
      topic: "Front desk morning open checklist",
      sourceRefs: { sops: [], kb: [] },
      transcript,
      currentDraft: d1,
      refineInstruction:
        "Rename the title to include 'CA clinics' and keep every existing checklist step including the IT escalation.",
    }),
  );
  assert(d2?.checklistItems.length, "refine2 checklist");
  console.log("TITLE2:", d2.title);
  console.log(stepBlob(d2.checklistItems));
  assert(/CA/i.test(d2.title), "refine2 should change title to mention CA");
  assert(
    /15\s*min|ticket number|open log|page IT/i.test(stepBlob(d2.checklistItems)),
    "refine2 must retain escalation from refine1",
  );

  const answers = {
    purpose: "Standardize how Marketing closes the weekly content tracker every Friday.",
    appliesTo: "Marketing lead and content contractor on Fridays before 5pm PT.",
    steps:
      "1. Export tracker CSV. 2. Mark shipped vs WIP. 3. File blockers in the weekly ops note. 4. Ping CMO if any Insight-ID is missing captions.",
    exceptions: "Skip when company holiday falls on Friday; do Monday instead.",
    escalateTo: "CMO within one business day if tracker is incomplete.",
  };

  console.log("\n=== prose: draft ===");
  const p0 = await withRetry("prose draft", () =>
    generateSopDraftFromAnswers({
      department: "Marketing",
      answers,
      styleSamples: [],
    }),
  );
  assert("draft" in p0, "prose draft ok");
  if (!("draft" in p0)) throw new Error("no draft");
  console.log("TITLE0:", p0.draft.title);
  console.log("BODY0:\n", p0.draft.body.slice(0, 900));

  console.log("\n=== prose: refine 1 (24-hour escalation) ===");
  const p1 = await withRetry("prose refine1", () =>
    generateSopDraftFromAnswers({
      department: "Marketing",
      answers,
      styleSamples: [],
      currentDraft: p0.draft,
      refineInstruction:
        "In the Escalation section, require notifying the CMO within 24 hours (not one business day) when captions are missing.",
    }),
  );
  assert("draft" in p1, "prose refine1");
  if (!("draft" in p1)) throw new Error("no p1");
  console.log("BODY1 (escalation excerpt):\n", (p1.draft.body.match(/Escalat[\s\S]{0,500}/i) || ["(none)"])[0]);
  assert(/24\s*hours?/i.test(p1.draft.body), "prose refine1 must say 24 hours");

  console.log("\n=== prose: refine 2 (archive step; keep 24h) ===");
  const p2 = await withRetry("prose refine2", () =>
    generateSopDraftFromAnswers({
      department: "Marketing",
      answers,
      styleSamples: [],
      currentDraft: p1.draft,
      refineInstruction:
        "Add a final step: archive the Friday CSV into the Marketing WorkDrive weekly folder before signing off.",
    }),
  );
  assert("draft" in p2, "prose refine2");
  if (!("draft" in p2)) throw new Error("no p2");
  console.log("BODY2 (steps excerpt):\n", (p2.draft.body.match(/Steps[\s\S]{0,900}/i) || ["(none)"])[0]);
  assert(/WorkDrive|archive/i.test(p2.draft.body), "prose refine2 must add archive/WorkDrive");
  assert(/24\s*hours?/i.test(p2.draft.body), "prose refine2 must keep 24-hour escalation");

  console.log("\n=== prose: junk refine should reject ===");
  const junkRefine = await generateSopDraftFromAnswers({
    department: "Marketing",
    answers,
    styleSamples: [],
    currentDraft: p2.draft,
    refineInstruction: "asdfasdf",
  });
  assert("quality" in junkRefine, "junk refine blocked");

  console.log("\nPASS — SOP refine multi-step verified");
  console.log(
    JSON.stringify(
      {
        checklist: {
          title0: d0.title,
          title2: d2.title,
          escalateKept: true,
        },
        prose: {
          has24h: true,
          hasArchive: true,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
