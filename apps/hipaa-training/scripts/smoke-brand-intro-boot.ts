/**
 * Regression tests — global branded splash boot state machine.
 * Run: npx tsx apps/hipaa-training/scripts/smoke-brand-intro-boot.ts
 */
import assert from "assert";
import { BRAND_INTRO_EXIT_MS, BRAND_INTRO_HOLD_MS } from "../src/lib/brand-intro";
import {
  resetBootSessionForTests,
  evaluateBootStart,
  remainingHoldMs,
  transitionBootPhase,
  isSplashDismissed,
  isBrandedSplashVisible,
  isBootTerminal,
  getBootSessionPhase,
  computeHoldMs,
} from "../src/lib/brand-intro-boot";

let timerId = 0;
const timers = new Map<number, { fn: () => void; at: number }>();
let now = 0;

function installFakeTimers() {
  now = 0;
  timerId = 0;
  timers.clear();
  (globalThis as { setTimeout?: typeof setTimeout }).setTimeout = ((fn: () => void, ms?: number) => {
    const id = ++timerId;
    timers.set(id, { fn, at: now + (ms ?? 0) });
    return id as unknown as ReturnType<typeof setTimeout>;
  }) as typeof setTimeout;
  (globalThis as { clearTimeout?: typeof clearTimeout }).clearTimeout = ((id: unknown) => {
    timers.delete(id as number);
  }) as typeof clearTimeout;
}

function advance(ms: number) {
  now += ms;
  const due = [...timers.entries()].filter(([, t]) => t.at <= now).sort((a, b) => a[1].at - b[1].at);
  for (const [id, t] of due) {
    timers.delete(id);
    t.fn();
  }
}

function runCase(name: string, fn: () => void) {
  try {
    resetBootSessionForTests();
    fn();
    console.log(`PASS\t${name}`);
  } catch (e) {
    console.error(`FAIL\t${name}`, e);
    process.exitCode = 1;
  }
}

installFakeTimers();

runCase("1-normal-startup", () => {
  const next = evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  assert.equal(next, "booting");
  assert.equal(getBootSessionPhase(), "booting");
  assert.equal(isBrandedSplashVisible("booting"), true);
  assert.equal(isSplashDismissed("booting"), false);
  const afterHold = transitionBootPhase("booting", { type: "hold_complete" });
  assert.equal(afterHold, "exiting");
  const ready = transitionBootPhase("exiting", { type: "exit_complete" });
  assert.equal(ready, "ready");
  assert.equal(isSplashDismissed("ready"), true);
  assert.equal(isBootTerminal("ready"), true);
});

runCase("2-slow-init-hold-from-start", () => {
  evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  const start = 1_000;
  const hold = BRAND_INTRO_HOLD_MS;
  assert.equal(remainingHoldMs(start, hold, start + 500), hold - 500);
  assert.equal(remainingHoldMs(start, hold, start + hold + 100), 0);
});

runCase("3-init-before-min-duration", () => {
  const start = Date.now();
  const hold = computeHoldMs();
  const remaining = remainingHoldMs(start, hold, start + 200);
  assert.ok(remaining > 0);
  assert.ok(remaining <= hold);
});

runCase("4-init-after-min-duration", () => {
  const start = Date.now();
  const hold = computeHoldMs();
  assert.equal(remainingHoldMs(start, hold, start + hold + 5000), 0);
});

runCase("5-strict-mode-idempotent-evaluate", () => {
  assert.equal(evaluateBootStart({ shouldShow: true, alreadyCommitted: false }), "booting");
  assert.equal(evaluateBootStart({ shouldShow: true, alreadyCommitted: false }), null);
  assert.equal(evaluateBootStart({ shouldShow: true, alreadyCommitted: true }), null);
});

runCase("6-rerender-does-not-reboot", () => {
  evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  transitionBootPhase("booting", { type: "hold_complete" });
  transitionBootPhase("exiting", { type: "exit_complete" });
  assert.equal(getBootSessionPhase(), "ready");
  assert.equal(evaluateBootStart({ shouldShow: true, alreadyCommitted: false }), null);
});

runCase("7-navigation-after-ready-stays-ready", () => {
  evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  transitionBootPhase("booting", { type: "user_skip" });
  transitionBootPhase("exiting", { type: "exit_complete" });
  assert.equal(getBootSessionPhase(), "ready");
  // simulate route change — session phase unchanged
  assert.equal(isSplashDismissed(getBootSessionPhase()), true);
});

runCase("8-duplicate-exit-complete", () => {
  evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  transitionBootPhase("booting", { type: "hold_complete" });
  assert.equal(transitionBootPhase("exiting", { type: "exit_complete" }), "ready");
  assert.equal(transitionBootPhase("ready", { type: "exit_complete" }), "ready");
});

runCase("9-failed-init-retry-skipped-path", () => {
  assert.equal(evaluateBootStart({ shouldShow: false, alreadyCommitted: false }), "skipped");
  assert.equal(isSplashDismissed("skipped"), true);
  assert.equal(evaluateBootStart({ shouldShow: true, alreadyCommitted: false }), null);
});

runCase("10-no-sequential-booting", () => {
  let visibleCount = 0;
  const first = evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  if (first === "booting") visibleCount++;
  const second = evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  if (second === "booting") visibleCount++;
  assert.equal(visibleCount, 1);
});

runCase("11-tour-skips-splash", () => {
  assert.equal(evaluateBootStart({ shouldShow: false, alreadyCommitted: false }), "skipped");
  assert.equal(isBrandedSplashVisible("skipped"), false);
});

runCase("11b-coach-bar-gated-until-splash-dismissed", () => {
  assert.equal(isSplashDismissed("booting"), false);
  assert.equal(isSplashDismissed("exiting"), false);
  assert.equal(isSplashDismissed("skipped"), true);
  assert.equal(isSplashDismissed("ready"), true);
});

runCase("12-single-timer-hold-sequence", () => {
  installFakeTimers();
  evaluateBootStart({ shouldShow: true, alreadyCommitted: false });
  const start = now;
  const hold = BRAND_INTRO_HOLD_MS;
  let phase: "booting" | "exiting" | "ready" = "booting";
  const delay = remainingHoldMs(start, hold, start);
  setTimeout(() => {
    phase = transitionBootPhase(phase, { type: "hold_complete" }) as typeof phase;
  }, delay);
  advance(delay);
  assert.equal(phase, "exiting");
  phase = transitionBootPhase(phase, { type: "exit_complete" }) as typeof phase;
  assert.equal(phase, "ready");
});

runCase("13-exit-ms-constant", () => {
  assert.equal(BRAND_INTRO_EXIT_MS, 300);
});

if (process.exitCode) {
  console.error("\nbrand-intro-boot smoke FAILED");
  process.exit(1);
}
console.log("\nbrand-intro-boot smoke: OK (14 cases)");
