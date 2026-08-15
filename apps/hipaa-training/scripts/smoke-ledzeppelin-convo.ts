import { runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

const MSGS = [
  "best song by led zeppelin",
  "ac dc?",
  "how to get CAC sorted",
  "best song ever",
  "no i want a song by post malone",
  "whats my default background color as per marketing design brand system",
];

async function run(surface: "default" | "founder-coach") {
  console.log("\n====", surface, "====");
  const history: { role: string; content: string }[] = [];
  for (const msg of MSGS) {
    const r = await runSiyaAssistantAsync(msg, history, {
      surface: surface === "founder-coach" ? "founder-coach" : "default",
    });
    history.push({ role: "user", content: msg });
    history.push({ role: "assistant", content: r.message });
    const flags = {
      "1to5": /1\. \*\*Patient|reply with one line/i.test(r.message),
      youWrote: /You wrote/i.test(r.message),
      offTopic: /outside what I can help|don.?t pick songs/i.test(r.message),
      brandHex: /#fffdf6/i.test(r.message),
      marketingHijack:
        /content tracker|pre-publish QA|fear marketing/i.test(r.message) &&
        /song|malone|zeppelin/i.test(msg),
    };
    console.log("USER:", msg);
    console.log("ASSIST:", r.message.slice(0, 280).replace(/\n/g, " | "));
    console.log("flags", JSON.stringify(flags));
  }
}

async function main() {
  await run("default");
  await run("founder-coach");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
