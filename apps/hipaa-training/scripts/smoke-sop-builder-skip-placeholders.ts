/**
 * Smoke: SOP Builder skip-advance, one-pushback cap, placeholders, publish gate.
 * Run: npx tsx scripts/smoke-sop-builder-skip-placeholders.ts
 */
import assert from "node:assert/strict";
import {
  collectInterviewGaps,
  draftHasUnresolvedPlaceholders,
  formatGapPlaceholder,
  generateInterviewNext,
  PLACEHOLDER_PREFIX,
  questionForCoverage,
  type SopBuilderTranscriptEntry,
} from "../src/lib/sop-builder-assist";

function pass(name: string, detail?: string) {
  console.log(`PASS ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const topic = "Telehealth Visit Technical-Failure Contingency SOP";
  const emptyRefs = { sops: [], kb: [] };

  // --- Skip advances to a new coverage tag (does not re-ask same slot) ---
  {
    const transcript: SopBuilderTranscriptEntry[] = [
      { role: "assistant", content: questionForCoverage("prep", topic), coverageTag: "prep" },
      { role: "user", content: "", skipped: true },
    ];
    const next = await generateInterviewNext({ topic, sourceRefs: emptyRefs, transcript });
    assert.equal(next.nextQuestionMeta?.isPushback, false);
    assert.equal(next.nextQuestionMeta?.coverageTag, "live_troubleshoot");
    assert.ok(next.question && !/prepar/i.test(next.question) || next.nextQuestionMeta?.coverageTag !== "prep");
    assert.notEqual(next.nextQuestionMeta?.coverageTag, "prep");
    pass("skip-advances-coverage", `next=${next.nextQuestionMeta?.coverageTag}`);
  }

  // --- One pushback, then gap-flag + advance on second thin answer ---
  {
    const q1 = questionForCoverage("live_troubleshoot", topic);
    const transcript: SopBuilderTranscriptEntry[] = [
      { role: "assistant", content: q1, coverageTag: "live_troubleshoot", isPushback: false },
      { role: "user", content: "ok sure" },
    ];
    const push = await generateInterviewNext({ topic, sourceRefs: emptyRefs, transcript });
    assert.equal(push.nextQuestionMeta?.isPushback, true);
    assert.equal(push.nextQuestionMeta?.coverageTag, "live_troubleshoot");
    assert.ok(push.question);
    pass("thin-gets-one-pushback");

    const afterPush: SopBuilderTranscriptEntry[] = [
      ...transcript,
      {
        role: "assistant",
        content: push.question!,
        coverageTag: "live_troubleshoot",
        isPushback: true,
      },
      { role: "user", content: "idk" }, // will be treated... wait idk is dont know - for thin use "fas."
    ];
    // Second thin (not dont-know): use ultra-thin token
    afterPush[afterPush.length - 1] = { role: "user", content: "fas." };
    const advance = await generateInterviewNext({
      topic,
      sourceRefs: emptyRefs,
      transcript: afterPush,
    });
    assert.equal(advance.markLastUserAsGap, true);
    assert.notEqual(advance.nextQuestionMeta?.coverageTag, "live_troubleshoot");
    assert.equal(advance.nextQuestionMeta?.isPushback, false);
    pass("second-thin-gap-and-advance", `next=${advance.nextQuestionMeta?.coverageTag}`);
  }

  // --- Gaps → placeholders with tagged owners ---
  {
    const transcript: SopBuilderTranscriptEntry[] = [
      { role: "assistant", content: questionForCoverage("tech_escalation", topic), coverageTag: "tech_escalation" },
      { role: "user", content: "", skipped: true },
      { role: "assistant", content: questionForCoverage("prep", topic), coverageTag: "prep" },
      { role: "user", content: "Email Zoom link 5 minutes before; ask patient to download Zoom.", skipped: false },
    ];
    const gaps = collectInterviewGaps(transcript);
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0]!.coverageTag, "tech_escalation");
    assert.ok(gaps[0]!.placeholder.includes(PLACEHOLDER_PREFIX));
    assert.ok(gaps[0]!.placeholder.includes("Engineering / IT"));
    assert.ok(!gaps[0]!.placeholder.toLowerCase().includes("will resolve promptly"));
    pass("placeholder-owner-from-tag", gaps[0]!.placeholder.slice(0, 100));
  }

  // --- Publish gate ---
  {
    const withPh = {
      description: "x",
      checklistItems: [{ label: formatGapPlaceholder("reschedule") }],
      gaps: [formatGapPlaceholder("reschedule")],
    };
    assert.equal(draftHasUnresolvedPlaceholders(withPh), true);
    assert.equal(
      draftHasUnresolvedPlaceholders({
        description: "ok",
        checklistItems: [{ label: "Call patient with the Zoom link" }],
        gaps: [],
      }),
      false,
    );
    pass("publish-gate-detects-placeholders");
  }

  // --- Coverage completion → readyToDraft ---
  {
    const transcript: SopBuilderTranscriptEntry[] = [];
    for (const tag of [
      "prep",
      "live_troubleshoot",
      "tech_escalation",
      "clinical_continue",
      "reschedule",
      "owner",
    ] as const) {
      transcript.push({
        role: "assistant",
        content: questionForCoverage(tag, topic),
        coverageTag: tag,
      });
      transcript.push({
        role: "user",
        content:
          tag === "prep"
            ? "Send Zoom link and ask patients to join five minutes early after downloading Zoom."
            : "",
        skipped: tag !== "prep",
      });
    }
    const next = await generateInterviewNext({ topic, sourceRefs: emptyRefs, transcript });
    assert.equal(next.readyToDraft, true);
    assert.equal(next.question, null);
    const gaps = collectInterviewGaps(transcript);
    assert.ok(gaps.length >= 5);
    pass("full-coverage-ready-to-draft", `gaps=${gaps.length}`);
  }

  console.log("\nALL PASS — sop-builder skip / pushback / placeholders");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
