/**
 * Verify exam countdown urgency thresholds + format (no browser).
 * Run: npx tsx apps/hipaa-training/scripts/verify-exam-countdown.ts
 */
import assert from "node:assert/strict";
import {
  COMPETENCY_EXAM_TIMERS,
  examTimerShellClass,
  examTimerUrgency,
  formatExamCountdown,
} from "../src/lib/competency-exam/exam-timer";

assert.equal(examTimerUrgency(120, 120), "normal");
assert.equal(examTimerUrgency(31, 120), "normal"); // just above 25%
assert.equal(examTimerUrgency(30, 120), "warn"); // 25% of 120
assert.equal(examTimerUrgency(13, 120), "warn");
assert.equal(examTimerUrgency(12, 120), "urgent"); // 10% of 120
assert.equal(examTimerUrgency(0, 120), "urgent");

assert.equal(examTimerUrgency(181, COMPETENCY_EXAM_TIMERS.hipaa), "normal");
assert.equal(examTimerUrgency(180, COMPETENCY_EXAM_TIMERS.hipaa), "warn"); // 25% of 720
assert.equal(examTimerUrgency(72, COMPETENCY_EXAM_TIMERS.hipaa), "urgent"); // 10% of 720

assert.equal(examTimerUrgency(150, COMPETENCY_EXAM_TIMERS.writing), "warn");
assert.equal(examTimerUrgency(60, COMPETENCY_EXAM_TIMERS.writing), "urgent");
assert.equal(examTimerUrgency(150, COMPETENCY_EXAM_TIMERS.chat), "warn");
assert.equal(examTimerUrgency(60, COMPETENCY_EXAM_TIMERS.chat), "urgent");

assert.ok(examTimerShellClass("warn").includes("amber"));
assert.ok(examTimerShellClass("urgent").includes("rose"));
assert.ok(examTimerShellClass("urgent").includes("exam-timer-urgent"));
assert.ok(!examTimerShellClass("normal").includes("amber"));
assert.ok(!examTimerShellClass("normal").includes("rose"));

assert.equal(formatExamCountdown(125), "2:05");
assert.equal(formatExamCountdown(0), "0:00");
assert.equal(formatExamCountdown(59.2), "1:00"); // ceil

assert.equal(COMPETENCY_EXAM_TIMERS.typing, 120);
assert.equal(COMPETENCY_EXAM_TIMERS.hipaa, 12 * 60);
assert.equal(COMPETENCY_EXAM_TIMERS.writing, 10 * 60);
assert.equal(COMPETENCY_EXAM_TIMERS.chat, 10 * 60);

console.log("verify-exam-countdown: ok");
