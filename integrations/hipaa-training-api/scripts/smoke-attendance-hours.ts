/**
 * Smoke: IST attendance hours + founder payroll rules.
 * Run: cd integrations/hipaa-training-api && npx tsx scripts/smoke-attendance-hours.ts
 */
import assert from "assert";
import {
  attributeIntervalToShiftStartDay,
  buildAttendanceDayRecord,
  buildAttendanceDayRecordsFromEvents,
  computePayrollEligibility,
  splitIntervalAcrossIstDays,
} from "../src/attendance-hours.js";
import { isSameCalendarDay, istDateString } from "../src/shift-store.js";

function main() {
  // --- 1. isSameCalendarDay is IST, not UTC ---
  const lateUtc = "2026-09-05T20:30:00.000Z";
  assert.equal(istDateString(lateUtc), "2026-09-06");
  assert.equal(isSameCalendarDay(lateUtc, new Date("2026-09-05T22:00:00.000Z")), true);
  assert.equal(isSameCalendarDay(lateUtc, new Date("2026-09-05T10:00:00.000Z")), false);

  // --- 2. Overnight: entire duration on shift-start IST day (founder D4) ---
  // 22:00 IST Sep 4 → 02:00 IST Sep 5 = 4h all on Sep 4
  const start = new Date("2026-09-04T16:30:00.000Z"); // Sep 4 22:00 IST
  const end = new Date("2026-09-04T20:30:00.000Z"); // Sep 5 02:00 IST
  const attributed = attributeIntervalToShiftStartDay(start, start, end, "working", true);
  assert.equal(attributed.length, 1);
  assert.equal(attributed[0].attendanceDate, "2026-09-04");
  assert.equal(attributed[0].minutes, 240);

  // Legacy splitter still available for comparison
  const parts = splitIntervalAcrossIstDays(start, end, "working", true);
  assert.equal(parts.length, 2);

  const events = [
    { eventType: "shift_start", createdAt: "2026-09-04T16:30:00.000Z" }, // 22:00 IST
    { eventType: "break_start", createdAt: "2026-09-04T18:00:00.000Z" }, // 23:30 IST
    { eventType: "break_end", createdAt: "2026-09-04T18:30:00.000Z" }, // 00:00 IST Sep 5
    { eventType: "shift_end", createdAt: "2026-09-04T20:30:00.000Z" }, // 02:00 IST Sep 5
  ];
  // Manual: working 90m + break 30m + working 120m = 240m all on Sep 4
  const { days, stats } = buildAttendanceDayRecordsFromEvents({
    userId: "u1",
    subjectLabel: "Test",
    events,
    fromDate: "2026-09-04",
    toDate: "2026-09-05",
  });
  assert.equal(days.length, 1, `expected 1 start-day record, got ${days.length}`);
  const d4 = days.find((d) => d.attendanceDate === "2026-09-04")!;
  assert.ok(d4);
  assert.equal(d4.workingMinutes, 210, `working got ${d4.workingMinutes}`);
  assert.equal(d4.breakMinutes, 30, `break got ${d4.breakMinutes}`);
  assert.equal(d4.focusMinutes, 0);
  assert.equal(d4.totalMinutes, 240);
  assert.equal(d4.derivation.quality, "clean");
  assert.equal(d4.payroll.eligible, true);
  assert.equal(d4.payroll.workingMinutes, 210); // focus folded in (0)
  assert.equal(d4.payroll.breakMinutes, 30);
  assert.equal(d4.payroll.eligibleMinutes, 240);
  assert.equal(stats.cleanDays, 1);
  assert.equal(stats.payrollEligibleMinutes, 240);

  // Focus counts as Working for payroll
  const focusPay = computePayrollEligibility({
    workingMinutes: 100,
    breakMinutes: 20,
    focusMinutes: 40,
    quality: "clean",
    disputeStatus: "none",
  });
  assert.equal(focusPay.workingMinutes, 140);
  assert.equal(focusPay.breakMinutes, 20);
  assert.equal(focusPay.eligibleMinutes, 160);

  // --- 3. Fingerprint identical when subjectLabel differs ---
  const rStaff = buildAttendanceDayRecord({
    userId: "u1",
    subjectLabel: "You",
    attendanceDate: "2026-09-04",
    segmentsForDay: d4.segments,
    derivationNotes: [],
    provisional: false,
  });
  const rHr = buildAttendanceDayRecord({
    userId: "u1",
    subjectLabel: "Alex Staff",
    attendanceDate: "2026-09-04",
    segmentsForDay: d4.segments,
    derivationNotes: [],
    provisional: false,
  });
  assert.equal(rStaff.contentFingerprint, rHr.contentFingerprint);
  assert.equal(rStaff.payroll.eligibleMinutes, rHr.payroll.eligibleMinutes);

  // --- 4. under_review / stale / ambiguous exclude from payroll ---
  const disputed = buildAttendanceDayRecord({
    userId: "u1",
    subjectLabel: "Alex",
    attendanceDate: "2026-09-04",
    segmentsForDay: d4.segments,
    derivationNotes: [],
    provisional: false,
    dispute: {
      status: "under_review",
      staffNote: "Break was longer",
      flaggedAt: new Date().toISOString(),
    },
  });
  assert.equal(disputed.payroll.eligible, false);
  assert.equal(disputed.payroll.eligibleMinutes, 0);
  assert.equal(disputed.payroll.excludedReason, "under_review");
  assert.equal(disputed.workingMinutes, d4.workingMinutes); // raw still shown

  const corrected = buildAttendanceDayRecord({
    userId: "u1",
    subjectLabel: "Alex",
    attendanceDate: "2026-09-04",
    segmentsForDay: d4.segments,
    derivationNotes: [],
    provisional: false,
    dispute: {
      status: "resolved_corrected",
      staffNote: "Break was longer",
      resolutionNote: "Adjusted break",
      resolvedAt: new Date().toISOString(),
    },
    correction: { workingMinutes: 60, breakMinutes: 60, focusMinutes: 30 },
  });
  assert.equal(corrected.payroll.eligible, true);
  assert.equal(corrected.payroll.workingMinutes, 90); // 60+30 focus
  assert.equal(corrected.payroll.breakMinutes, 60);
  assert.equal(corrected.payroll.eligibleMinutes, 150);

  const open = buildAttendanceDayRecordsFromEvents({
    userId: "u1",
    subjectLabel: "Open",
    events: [{ eventType: "shift_start", createdAt: "2026-09-05T04:00:00.000Z" }],
    now: new Date("2026-09-05T06:00:00.000Z"),
    fromDate: "2026-09-05",
    toDate: "2026-09-05",
  });
  assert.equal(open.days[0].derivation.quality, "provisional");
  assert.equal(open.days[0].payroll.eligible, false);
  assert.equal(open.days[0].payroll.eligibleMinutes, 0);

  // --- 5. Stale auto-close — start day only ---
  const staleEvents = [
    { eventType: "shift_start", createdAt: "2026-07-29T04:00:00.000Z" },
    {
      eventType: "shift_end",
      createdAt: "2026-09-05T12:00:00.000Z",
      metadata: {
        source: "system",
        reason: "stale_open_shift",
        autoClosed: true,
        staleThresholdHours: 24,
      },
    },
  ];
  const stale = buildAttendanceDayRecordsFromEvents({
    userId: "u1",
    subjectLabel: "Stale",
    events: staleEvents,
    fromDate: "2026-07-29",
    toDate: "2026-09-06",
  });
  assert.equal(stale.stats.staleAffectedDays, 1, `expected 1 stale day, got ${stale.stats.staleAffectedDays}`);
  assert.equal(stale.days.length, 1);
  assert.equal(stale.days[0].attendanceDate, "2026-07-29");
  assert.equal(stale.days[0].derivation.quality, "stale_affected");
  assert.equal(stale.days[0].payroll.eligible, false);
  assert.equal(stale.days[0].payroll.eligibleMinutes, 0);
  assert.equal(stale.days[0].totalMinutes, 24 * 60);
  assert.equal(stale.stats.payrollEligibleMinutes, 0);

  // --- 6. Fingerprint identity under frozen now ---
  const frozenNow = new Date("2026-09-06T10:00:00.000Z");
  const openEvents = [{ eventType: "shift_start", createdAt: "2026-09-06T04:00:00.000Z" }];
  const staffView = buildAttendanceDayRecordsFromEvents({
    userId: "u1",
    subjectLabel: "You",
    events: openEvents,
    fromDate: "2026-09-06",
    toDate: "2026-09-06",
    now: frozenNow,
  }).days[0];
  const adminView = buildAttendanceDayRecordsFromEvents({
    userId: "u1",
    subjectLabel: "Alex Staff",
    events: openEvents,
    fromDate: "2026-09-06",
    toDate: "2026-09-06",
    now: frozenNow,
  }).days[0];
  assert.equal(staffView.contentFingerprint, adminView.contentFingerprint);
  assert.equal(staffView.payroll.eligibleMinutes, adminView.payroll.eligibleMinutes);

  console.log("smoke-attendance-hours: OK", {
    overnightStartDay: { date: d4.attendanceDate, total: d4.totalMinutes, payroll: d4.payroll },
    stalePayrollExcluded: stale.days[0].payroll,
    fingerprint: rStaff.contentFingerprint,
  });
}

main();
