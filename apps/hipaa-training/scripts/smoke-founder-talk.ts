import { isVagueUserMessage } from "../src/lib/siya-os/compose-answer";
import { runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

async function main() {
  const q = "What is flagged in Clinical this week from lead check-ins?";
  console.log("vague?", isVagueUserMessage(q));
  console.log("confused?", isVagueUserMessage("what are you saying"));
  console.log("hi?", isVagueUserMessage("hi"));

  const r = await runSiyaAssistantAsync(q, [], { surface: "founder-coach" });
  console.log("--- reply ---");
  console.log(r.message.slice(0, 1200));
  console.log("--- meta ---");
  console.log(
    JSON.stringify(
      {
        has1to5Menu: /1\. \*\*Patient|reply with one line/.test(r.message),
        claimsWrotePlan: /draft applied|I (updated|wrote|saved).*Focus/i.test(r.message),
        pendingTask: r.pendingTask ?? null,
        isVaguePrompt: /What do you want to talk through/.test(r.message),
        llmUsed: r.llmUsed ?? false,
        routing: r.routing?.task ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
