import assert from "node:assert/strict";
import { nextOccurrenceDates, templateRunsOnDate } from "./task-recurrence.js";

assert.equal(templateRunsOnDate("daily", {}, "2026-07-28"), true);
assert.equal(templateRunsOnDate("weekly", { daysOfWeek: [1, 3] }, "2026-07-27"), true); // Mon
assert.equal(templateRunsOnDate("weekly", { daysOfWeek: [1, 3] }, "2026-07-28"), false); // Tue
assert.equal(templateRunsOnDate("monthly", { dayOfMonth: 1 }, "2026-08-01"), true);
assert.equal(templateRunsOnDate("monthly", { dayOfMonth: 1 }, "2026-08-02"), false);

const next = nextOccurrenceDates("daily", {}, "2026-07-28", 3);
assert.deepEqual(next, ["2026-07-28", "2026-07-29", "2026-07-30"]);

console.log("task-recurrence tests passed");
