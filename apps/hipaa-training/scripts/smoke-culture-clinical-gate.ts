import assert from "assert";
import { isCasualOffTopic } from "../src/lib/siya-os/compose-answer";
import {
  asksDomainFlags,
  portalDomainFilter,
  wantsFounderPortalSignals,
} from "../src/lib/siya-os/founder-chat-context";

assert.equal(
  isCasualOffTopic("why not this is supposed to train staff about current american culture"),
  true,
);
assert.equal(isCasualOffTopic("PRESIDENT OF USA"), true);
assert.equal(isCasualOffTopic("do you know how to run google ads"), false);
assert.equal(portalDomainFilter("what's flagged in Clinical this week?"), "clinical");
assert.equal(asksDomainFlags("what's flagged in Clinical this week?"), true);
assert.equal(wantsFounderPortalSignals("what's flagged in Clinical this week?"), true);
console.log("culture-clinical-gate-ok");
