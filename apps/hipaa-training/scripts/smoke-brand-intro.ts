/**
 * Once-per-day brand intro gate — My Day full reloads must not replay.
 * Run: npx tsx scripts/smoke-brand-intro.ts
 */
import assert from "assert";
import {
  BRAND_INTRO_TOTAL_MS,
  localDateKey,
  markBrandIntroShownToday,
  shouldShowBrandIntro,
  skipBrandIntroOnce,
} from "../src/lib/brand-intro";

const mem: Record<string, string> = {};
const session: Record<string, string> = {};

const store = (bag: Record<string, string>) => ({
  getItem: (k: string) => (k in bag ? bag[k] : null),
  setItem: (k: string, v: string) => {
    bag[k] = v;
  },
  removeItem: (k: string) => {
    delete bag[k];
  },
});

(globalThis as { window?: unknown }).window = globalThis;
(globalThis as { localStorage?: unknown }).localStorage = store(mem);
(globalThis as { sessionStorage?: unknown }).sessionStorage = store(session);

Object.defineProperty(globalThis, "location", {
  value: { search: "" },
  writable: true,
});

assert.equal(BRAND_INTRO_TOTAL_MS, 2200, "hold+exit must be 2.2s spec");

assert.equal(shouldShowBrandIntro(), true, "first visit today should show");
markBrandIntroShownToday();
assert.equal(mem["siya-brand-intro-shown-on"], localDateKey());
assert.equal(shouldShowBrandIntro(), false, "same day after mark must not show");

// Simulate My Day full page reload (PortalNavLink assign) — storage survives
for (const k of Object.keys(session)) delete session[k];
assert.equal(shouldShowBrandIntro(), false, "My Day reload same day must not show");

// Skip-once after login hop (even if date not marked — consume skip)
delete mem["siya-brand-intro-shown-on"];
skipBrandIntroOnce();
assert.equal(shouldShowBrandIntro(), false, "post-login skip-once");
assert.equal(shouldShowBrandIntro(), true, "skip-once is single use");

// Sign-out must not clear the date key (logout only drops JWT + profile binding)
markBrandIntroShownToday();
assert.equal(shouldShowBrandIntro(), false, "logout must still respect daily gate");

console.log("smoke-brand-intro: OK", BRAND_INTRO_TOTAL_MS, "ms", "date", localDateKey());
