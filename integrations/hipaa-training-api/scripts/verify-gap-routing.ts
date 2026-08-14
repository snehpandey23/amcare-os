/**
 * Pure routing rules for knowledge-gap notify (no DB).
 * Run: cd integrations/hipaa-training-api && npx tsx scripts/verify-gap-routing.ts
 */
import { FOUNDER_INSTANT_DEPARTMENTS } from "../src/assist-telemetry.js";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function decideMode(opts: {
  departmentLabel: string;
  leadUserId: string | null;
  leadRole: string | null;
}): "lead_digest" | "founder_instant" {
  if (FOUNDER_INSTANT_DEPARTMENTS.has(opts.departmentLabel)) return "founder_instant";
  if (!opts.leadUserId) return "founder_instant";
  if (opts.leadRole === "admin") return "founder_instant";
  return "lead_digest";
}

assert(decideMode({ departmentLabel: "Leadership", leadUserId: "u1", leadRole: "trainee" }) === "founder_instant", "Leadership");
assert(decideMode({ departmentLabel: "General", leadUserId: "u1", leadRole: "trainee" }) === "founder_instant", "General");
assert(decideMode({ departmentLabel: "Marketing", leadUserId: null, leadRole: null }) === "founder_instant", "unassigned");
assert(decideMode({ departmentLabel: "Marketing", leadUserId: "u1", leadRole: "admin" }) === "founder_instant", "admin lead");
assert(decideMode({ departmentLabel: "Marketing", leadUserId: "u1", leadRole: "trainee" }) === "lead_digest", "real lead");
assert(decideMode({ departmentLabel: "Clinical Operations", leadUserId: "u1", leadRole: "trainee" }) === "lead_digest", "clinical lead");

console.log("verify-gap-routing: OK");
console.log(
  JSON.stringify(
    {
      selfApprovingDigestDeptsExample: ["Accounts", "HR", "Marketing", "Clinical Operations", "Compliance", "Technology"].filter(
        (d) => !FOUNDER_INSTANT_DEPARTMENTS.has(d),
      ),
      alwaysFounderInstant: [...FOUNDER_INSTANT_DEPARTMENTS],
    },
    null,
    2,
  ),
);
