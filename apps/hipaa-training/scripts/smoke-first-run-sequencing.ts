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

// Tour dismissed (Pause) — treated as finished for offer
const dismissed = {
  onboardingComplete: true,
  productTour: { ...defaultPortalTourState(), dismissedAt: Date.now(), startedAt: 1 },
} as MiniProfile;
assert.equal(shouldOfferProductTour(dismissed), false);

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

const nudge = readFileSync(join(ROOT, "src/components/onboarding/ProductTourNudgeBanner.tsx"), "utf8");
assert.match(nudge, /Run through the tour/);
assert.match(nudge, /Personalize/);

console.log("smoke-first-run-sequencing: OK");
