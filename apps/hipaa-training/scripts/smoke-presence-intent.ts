import assert from "assert";
import { detectAdminOpsIntent } from "../src/lib/siya-os/admin-ops-coach";

const cases: [string, string | null][] = [
  ["who all are working right now", "team_pulse"],
  ["who is present today", "team_pulse"],
  ["on the clock", "team_pulse"],
  ["who's here", "team_pulse"],
  ["who's working right now", "team_pulse"],
  ["who is working right now", "team_pulse"],
  ["team pulse", "team_pulse"],
  ["best song by led zeppelin", null],
  ["how to get CAC sorted", null],
];

for (const [msg, want] of cases) {
  const kind = detectAdminOpsIntent(msg)?.kind ?? null;
  assert.equal(kind, want, `${msg} → ${kind} want ${want}`);
  console.log("OK", msg, "→", kind);
}
console.log("presence-intent-ok");
