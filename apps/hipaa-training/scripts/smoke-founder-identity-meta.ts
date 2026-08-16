import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";

const cases: { msg: string; must: RegExp; mustNot: RegExp }[] = [
  {
    msg: "why not arent u AI",
    must: /Siya Assist|AI help desk/i,
    mustNot: /approved staff guide/i,
  },
  {
    msg: "are you human",
    must: /not a human|AI help desk/i,
    mustNot: /approved staff guide/i,
  },
  {
    msg: "who is your boss",
    must: /don.?t have a personal boss|Notify owner/i,
    mustNot: /approved staff guide/i,
  },
  {
    msg: "can you escalate to your boss",
    must: /Notify owner|Siya Assist/i,
    mustNot: /HIPAA certification course|approved staff guide/i,
  },
  {
    msg: "who is the president of USA",
    must: /outside what I can help|civics/i,
    mustNot: /approved staff guide for that/i,
  },
];

for (const c of cases) {
  const r = runSiyaAssistant(c.msg, []);
  console.log("\n===", c.msg, "===\n" + r.message.slice(0, 260));
  assert.ok(r.ruleFinal, c.msg);
  assert.ok(c.must.test(r.message), "must match: " + c.msg);
  assert.ok(!c.mustNot.test(r.message), "mustNot: " + c.msg + " got " + r.message.slice(0, 120));
}

console.log("\nfounder-identity-meta-ok");
