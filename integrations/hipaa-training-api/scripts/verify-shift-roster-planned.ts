/**
 * One-off verify: roster vs presence, me===team row identity, OFF check, coverage gaps.
 */
import pg from "pg";
import {
  buildScheduledVsActual,
  istDateString,
  isUserScheduledOff,
  findCoverageGaps,
  listRosterForDate,
} from "../src/shift-roster-service.js";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const today = istDateString();
  console.log("today IST", today);
  const roster = await listRosterForDate(pool, today);
  console.log(
    "roster rows today",
    roster.length,
    roster.map((r) => ({ p: r.personKey, raw: r.rawCell, off: r.isOff, start: r.shiftStart, label: r.shiftLabel })),
  );
  const active = await pool.query(
    `SELECT u.email, p.shift_json->'active' AS active
     FROM hipaa_training_progress p
     JOIN hipaa_training_users u ON u.id = p.user_id
     WHERE p.shift_json ? 'active'
       AND p.shift_json->'active' IS NOT NULL
       AND p.shift_json->>'active' != 'null'`,
  );
  console.log(
    "active shifts",
    active.rows.map((r) => ({
      email: r.email,
      startedAt: (r.active as { startedAt?: string })?.startedAt,
      presence: (r.active as { presence?: string })?.presence,
    })),
  );
  const planned = await buildScheduledVsActual(pool, { rosterDate: today });
  console.log(
    "planned outcomes",
    planned.map((p) => ({
      person: p.roster.personKey,
      outcome: p.outcome,
      detail: p.detail,
      started: p.shiftStartedAt,
      presence: p.presence,
    })),
  );
  const anmolId = "0a648fa3-22eb-432e-ac4f-b3628ae20607";
  const meAnmol = await buildScheduledVsActual(pool, { rosterDate: today, userId: anmolId });
  const teamAnmol = planned.filter((p) => p.roster.userId === anmolId);
  console.log(
    "identity check anmol me vs team",
    JSON.stringify(meAnmol) === JSON.stringify(teamAnmol),
    meAnmol.map((x) => x.outcome),
  );
  const off = await isUserScheduledOff(pool, "76f464aa-ba83-4131-9343-c132bdee5925", "2026-09-02");
  console.log("sonu OFF Sep2", off);
  const gaps = await findCoverageGaps(pool, { fromDate: today, toDate: "2026-09-07" });
  console.log("coverage gap count", gaps.length, "sample", gaps.slice(0, 3));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
