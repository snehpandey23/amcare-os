/**
 * Aggregate STT accuracy study JSON downloads from staff sessions.
 *
 *   npx tsx scripts/aggregate-stt-study.ts ./study-logs/*.json
 */
import { readFileSync } from "node:fs";
import {
  mergeSttStudySessions,
  type SttStudySessionLog,
} from "../src/lib/patient-drill/spoken-stt-study.ts";

const paths = process.argv.slice(2);
if (!paths.length) {
  console.error("Usage: npx tsx scripts/aggregate-stt-study.ts <session.json>...");
  process.exit(1);
}

const sessions: SttStudySessionLog[] = paths.map((p) => {
  const raw = JSON.parse(readFileSync(p, "utf8")) as SttStudySessionLog;
  if (raw.kind !== "spoken-chat-sim-stt-accuracy") {
    throw new Error(`${p}: not an STT study session`);
  }
  return raw;
});

const agg = mergeSttStudySessions(sessions);
console.log(
  JSON.stringify(
    {
      sessions: agg.sessions,
      turns: agg.turns,
      eligible: agg.eligible,
      fair: agg.fair,
      unfair: agg.unfair,
      excludedHeavyEdit: agg.excludedHeavyEdit,
      fairPct: agg.fairPct,
      decisionBar: ">=90% fair among eligible turns → evidence to remove transcript review",
      passesDecisionBar: agg.fairPct != null && agg.fairPct >= 90,
      perSession: sessions.map((s) => ({
        staff: s.staffLabel,
        turns: s.turns.length,
        fair: s.turns.filter((t) => t.fairForScoring === "fair" && !t.heavilyEdited).length,
      })),
    },
    null,
    2,
  ),
);
