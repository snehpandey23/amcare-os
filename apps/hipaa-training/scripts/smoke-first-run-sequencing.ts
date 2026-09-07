/**
 * First-run sequencing: combined optional onboarding → tour continuum.
 *   npx tsx apps/hipaa-training/scripts/smoke-first-run-sequencing.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  shouldChainOnboardingToTour,
  shouldOfferProductTour,
  defaultPortalTourState,
  type PortalTourState,
} from "../src/lib/portal-product-tour";

const ROOT = join(__dirname, "..");

type MiniProfile = {
  onboardingComplete?: boolean;
  onboardingSkipped?: boolean;
  productTour?: PortalTourState;
};

// New user — proceed path chains into tour
assert.equal(shouldChainOnboardingToTour({} as MiniProfile), true);
assert.equal(shouldOfferProductTour({} as MiniProfile), true);

// Skip first-run — no force-chain on later Personalize; tour still offerable
assert.equal(shouldChainOnboardingToTour({ onboardingSkipped: true } as MiniProfile), false);
assert.equal(shouldOfferProductTour({ onboardingSkipped: true } as MiniProfile), true);

// Completed personalization earlier — Personalize revisit does not force tour
assert.equal(
  shouldChainOnboardingToTour({ onboardingComplete: true } as MiniProfile),
  false,
);
assert.equal(shouldOfferProductTour({ onboardingComplete: true } as MiniProfile), true);

// Tour finished — neither chain nor nudge
const toured = {
  onboardingComplete: true,
  productTour: { ...defaultPortalTourState(), finishedAt: Date.now(), startedAt: 1 },
} as MiniProfile;
assert.equal(shouldChainOnboardingToTour(toured), false);
assert.equal(shouldOfferProductTour(toured), false);

// Explicit skip forever (never started) — no offer
const skipped = {
  onboardingComplete: true,
  productTour: { ...defaultPortalTourState(), dismissedAt: Date.now() },
} as MiniProfile;
assert.equal(shouldOfferProductTour(skipped), false);

// Paused mid-tour — still offer resume from My day
const paused = {
  onboardingComplete: true,
  productTour: {
    ...defaultPortalTourState(),
    startedAt: 1,
    pausedAt: Date.now(),
    currentStepIndex: 2,
  },
} as MiniProfile;
assert.equal(shouldOfferProductTour(paused), true);

const wizard = readFileSync(join(ROOT, "src/components/onboarding/OnboardingWizard.tsx"), "utf8");
assert.match(wizard, /shouldChainOnboardingToTour/);
assert.match(wizard, /Continue to product tour/);
assert.match(wizard, /startTour\(/);
assert.doesNotMatch(wizard, /router\.replace\([^)]*product-tour/);
assert.match(wizard, /Skip for now — go to My day/);
assert.match(wizard, /Skipped first-run/);

const landing = readFileSync(join(ROOT, "src/components/onboarding/ProductTourLanding.tsx"), "utf8");
assert.match(landing, /Run through the tour/);
assert.match(landing, /Personalize/);
assert.match(landing, /Resume tour/);
assert.match(landing, /You completed this tour earlier/);
assert.match(landing, /You skipped this tour earlier/);

const nudge = readFileSync(join(ROOT, "src/components/onboarding/ProductTourNudgeBanner.tsx"), "utf8");
assert.match(nudge, /Run through the tour/);
assert.match(nudge, /Personalize/);
assert.match(nudge, /Resume tour/);

const coach = readFileSync(join(ROOT, "src/components/onboarding/TourCoachBar.tsx"), "utf8");
assert.match(coach, /pauseTour/);
assert.doesNotMatch(coach, /onClick=\{dismissTour\}/);

console.log("smoke-first-run-sequencing: OK");
