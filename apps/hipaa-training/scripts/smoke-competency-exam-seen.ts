/**
 * Seen-set: unused first, honest repeat when the pool cannot fill the sitting.
 * Run: npx tsx scripts/smoke-competency-exam-seen.ts
 */
import { CULTURE_EXAM_APPROVED } from "../src/content/competency-exam/culture-bank";
import { drawUnseen, recordSeen, type SeenEntry } from "../src/lib/competency-exam/seen-set";

const pool = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

let seen: SeenEntry[] = [];
const first = drawUnseen(pool, seen, 2, 11, "demo");
assert(first.repeatedIds.length === 0, "first draw should be unseen");
assert(first.items.length === 2, "first draw count");
seen = recordSeen(seen, "demo", first.items.map((i) => i.id), first.repeatedIds, "att-1");

const second = drawUnseen(pool, seen, 2, 19, "demo");
assert(second.items.some((i) => !seen.slice(0, 2).some((s) => s.id === i.id) || second.repeatedIds.length > 0), "second draw uses remaining or marks repeat");
const unusedOnly = second.items.filter((i) => !first.items.some((p) => p.id === i.id));
assert(unusedOnly.length <= 1, "only one unused item left");
assert(second.repeatedIds.length >= 1, "must label a repeat when unused cannot fill 2");

const exhausted = drawUnseen(pool, recordSeen(seen, "demo", second.items.map((i) => i.id), second.repeatedIds, "att-2"), 2, 3, "demo");
assert(exhausted.repeatedIds.length === 2, "fully seen pool must report repeats");

assert(CULTURE_EXAM_APPROVED.length === 0, "culture exam must not draw from trivia or drafts");

console.log("smoke-competency-exam-seen: ok");
