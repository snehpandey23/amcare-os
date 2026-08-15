import assert from "assert";
import { wantsFounderPortalSignals } from "../src/lib/siya-os/founder-chat-context";

const shouldPortal = [
  "what's flagged in Clinical this week?",
  "What's in the SOP review queue?",
  "What should I know from lead check-ins?",
  "what's my founder focus",
];
const shouldStop = [
  "how to get CAC sorted",
  "PRESIDENT OF USA",
  "why not this is supposed to train staff about current american culture",
  "you should escalate this as a knowledge lacunae",
  "best song by led zeppelin",
];

for (const m of shouldPortal) {
  assert.equal(wantsFounderPortalSignals(m), true, m);
  console.log("portal", m);
}
for (const m of shouldStop) {
  assert.equal(wantsFounderPortalSignals(m), false, m);
  console.log("stop", m);
}
console.log("founder-portal-gate-ok");
