/**
 * Pure unit checks for recurring-gap threshold (no DB).
 * Run: cd integrations/hipaa-training-api && npx tsx scripts/verify-recurring-gap-threshold-unit.ts
 */
import {
  normalizeGapTaskLabel,
  parseReportedByUserId,
} from "../src/assist-telemetry.js";
import { RETIRED_OPERATIONAL_PACK_IDS, OPERATIONAL_SOP_PACK } from "../src/lead-operational-pack.js";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

type Row = {
  departmentSlug: string;
  taskLabel: string;
  signalType: string;
  status: string;
  reportedByUserId: string | null;
  createdAt: Date;
};

function detectPatterns(
  rows: Row[],
  opts: { windowDays?: number; minOpen?: number; minPeople?: number } = {},
) {
  const windowDays = opts.windowDays ?? 30;
  const minOpen = opts.minOpen ?? 3;
  const minPeople = opts.minPeople ?? 2;
  const since = Date.now() - windowDays * 86400000;
  const eligible = rows.filter(
    (r) =>
      r.status === "open" &&
      r.signalType !== "thumbs_down" &&
      r.createdAt.getTime() >= since &&
      normalizeGapTaskLabel(r.taskLabel) !== "",
  );
  const map = new Map<string, Row[]>();
  for (const r of eligible) {
    const key = `${r.departmentSlug}::${normalizeGapTaskLabel(r.taskLabel)}`;
    const list = map.get(key) || [];
    list.push(r);
    map.set(key, list);
  }
  const out: { key: string; count: number; people: number; multiStaff: boolean }[] = [];
  for (const [key, list] of map) {
    const people = new Set(list.map((r) => r.reportedByUserId).filter(Boolean)).size;
    if (list.length >= minOpen && people >= minPeople) {
      out.push({ key, count: list.length, people, multiStaff: true });
    }
  }
  return out.sort((a, b) => b.people - a.people || b.count - a.count);
}

assert(normalizeGapTaskLabel("  Zocdoc  Listing  ") === "zocdoc listing", "normalize");
assert(parseReportedByUserId("not-a-uuid") === null, "reject non-uuid");
assert(
  parseReportedByUserId("550e8400-e29b-41d4-a716-446655440000") ===
    "550e8400-e29b-41d4-a716-446655440000",
  "accept uuid",
);

const u1 = "550e8400-e29b-41d4-a716-446655440001";
const u2 = "550e8400-e29b-41d4-a716-446655440002";
const now = new Date();

const multi = detectPatterns([
  { departmentSlug: "marketing", taskLabel: "Zocdoc listing", signalType: "notify_owner", status: "open", reportedByUserId: u1, createdAt: now },
  { departmentSlug: "marketing", taskLabel: "Zocdoc  listing", signalType: "no_match", status: "open", reportedByUserId: u1, createdAt: now },
  { departmentSlug: "marketing", taskLabel: "zocdoc listing", signalType: "notify_owner", status: "open", reportedByUserId: u2, createdAt: now },
  // thumbs_down ignored
  { departmentSlug: "marketing", taskLabel: "zocdoc listing", signalType: "thumbs_down", status: "open", reportedByUserId: u2, createdAt: now },
]);
assert(multi.length === 1 && multi[0]!.count === 3 && multi[0]!.people === 2, "3 gaps / 2 people");

const singlePersonSpam = detectPatterns([
  { departmentSlug: "marketing", taskLabel: "Spam", signalType: "notify_owner", status: "open", reportedByUserId: u1, createdAt: now },
  { departmentSlug: "marketing", taskLabel: "Spam", signalType: "notify_owner", status: "open", reportedByUserId: u1, createdAt: now },
  { departmentSlug: "marketing", taskLabel: "Spam", signalType: "notify_owner", status: "open", reportedByUserId: u1, createdAt: now },
]);
assert(singlePersonSpam.length === 0, "same person ×3 does not meet multi-staff threshold");

const unknownPeople = detectPatterns([
  { departmentSlug: "accounts", taskLabel: "Refunds", signalType: "no_match", status: "open", reportedByUserId: null, createdAt: now },
  { departmentSlug: "accounts", taskLabel: "Refunds", signalType: "no_match", status: "open", reportedByUserId: null, createdAt: now },
  { departmentSlug: "accounts", taskLabel: "Refunds", signalType: "no_match", status: "open", reportedByUserId: null, createdAt: now },
]);
assert(unknownPeople.length === 0, "null reporters do not meet ≥2 distinct people");

assert(
  RETIRED_OPERATIONAL_PACK_IDS.includes("task-pack-marketing-zocdoc-narrative"),
  "zocdoc retired",
);
assert(
  RETIRED_OPERATIONAL_PACK_IDS.includes("task-pack-accounts-chargeback-refunds"),
  "chargebacks retired",
);
assert(
  !OPERATIONAL_SOP_PACK.some((p) => RETIRED_OPERATIONAL_PACK_IDS.includes(p.id as (typeof RETIRED_OPERATIONAL_PACK_IDS)[number])),
  "retired packs not in active install list",
);
assert(
  OPERATIONAL_SOP_PACK.some((p) => p.id === "task-pack-clinical-scheduling-capacity"),
  "scheduling pack kept",
);
assert(
  !OPERATIONAL_SOP_PACK.some((p) => p.id === "task-pack-audit-expense-reimbursement"),
  "expense stays in audit pack (not meeting pack) — leave until live",
);

console.log("verify-recurring-gap-threshold-unit: OK");
