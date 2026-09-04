/**
 * Tour must not appear from profile.startedAt alone — only after explicit startTour session flag.
 *   npx tsx apps/hipaa-training/scripts/smoke-tour-session-gate.ts
 */
import assert from "node:assert/strict";
import {
  defaultPortalTourState,
  hasUnfinishedTourRecord,
  isPortalTourInProgress,
  mergePortalTourState,
  markTourSessionActive,
  clearTourSessionFlags,
} from "../src/lib/portal-product-tour";
import { resolveDailyPhraseCard } from "../src/lib/level-up/sop-daily-cards";
import { phraseOfTheDay } from "../src/lib/level-up/catalog";

// jsdom-less: sessionStorage polyfill for Node
const store = new Map<string, string>();
(globalThis as { sessionStorage?: Storage }).sessionStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => {
    store.set(k, String(v));
  },
  removeItem: (k) => {
    store.delete(k);
  },
  clear: () => store.clear(),
  key: () => null,
  length: 0,
};

const stale = {
  productTour: { ...defaultPortalTourState(), startedAt: Date.now() - 60_000 },
};

clearTourSessionFlags();
assert.equal(isPortalTourInProgress(stale), false, "stale startedAt without session must be inactive");
assert.equal(hasUnfinishedTourRecord(stale), true);

markTourSessionActive();
assert.equal(isPortalTourInProgress(stale), true, "explicit session + startedAt → active");

clearTourSessionFlags();
assert.equal(isPortalTourInProgress(stale), false);

const localDismissed = {
  ...defaultPortalTourState(),
  startedAt: 1,
  dismissedAt: Date.now(),
};
const remoteInProgress = {
  ...defaultPortalTourState(),
  startedAt: Date.now(),
};
const merged = mergePortalTourState(localDismissed, remoteInProgress);
assert.ok(merged?.dismissedAt, "local Pause must win over remote in-progress");
assert.equal(Boolean(merged?.startedAt && !merged.finishedAt && !merged.dismissedAt), false);

const phrase = resolveDailyPhraseCard(
  [
    {
      id: "sop-1",
      title: "SOP: Obtaining Previous Medical Records Using Release of Information (ROI)",
      body: "Steps for ROI…",
      keywords: [],
      status: "live",
      department: "Clinical Operations",
    },
  ],
  ["Clinical Operations"],
);
const expected = phraseOfTheDay();
assert.equal(phrase.phrase, expected.phrase);
assert.equal(phrase.meaning, expected.meaning);
assert.doesNotMatch(phrase.phrase, /^SOP:/i);
assert.doesNotMatch(phrase.meaning, /team procedure/i);

console.log("smoke-tour-session-gate: OK");
