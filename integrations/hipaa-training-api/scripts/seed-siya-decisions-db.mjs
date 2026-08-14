/**
 * Idempotent seed via createDecision() (same lineage rules as POST).
 * Prefer this when SMOKE_* login is unavailable; uses DATABASE_URL.
 *
 * Usage: DATABASE_URL=... node scripts/seed-siya-decisions-db.mjs
 * Or:    node --env-file=.env.db scripts/seed-siya-decisions-db.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createDecision, ensureKnowledgeTables, listDecisions, syncMarkdownDecisionsSeed } from "../dist/knowledge-service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(
  __dirname,
  "../../../docs/siyaos-knowledge-base/decisions/siya-decisions-seed.json",
);

function importanceToNumber(raw) {
  const s = String(raw ?? "").toLowerCase();
  if (s === "high" || s === "3") return 3;
  if (s === "medium" || s === "2") return 2;
  return 1;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const items = seed.decisions ?? [];
  const pool = new pg.Pool({ connectionString: url });

  await ensureKnowledgeTables(pool);
  const md = await syncMarkdownDecisionsSeed(pool);
  console.log(`Markdown boot-sync: upserted=${md.upserted} skipped=${md.skipped}`);

  const admin = await pool.query(
    `SELECT id FROM hipaa_training_users WHERE role = 'admin' AND deactivated_at IS NULL ORDER BY created_at ASC LIMIT 1`,
  );
  if (!admin.rows[0]) {
    console.error("No admin user");
    process.exit(1);
  }
  const userId = admin.rows[0].id;

  let created = 0;
  let existed = 0;
  for (const item of items) {
    const parentSlug = item.parent_constitution_slug || "principle-never-ask-twice";
    const before = await pool.query(`SELECT id FROM siya_decisions WHERE id = $1`, [item.id]);
    const decision = await createDecision(pool, userId, {
      id: item.id,
      title: item.title,
      decisionText: item.decision_text,
      reason: item.reason,
      whatChanged: item.what_changed,
      importance: importanceToNumber(item.importance),
      status: item.status || "active",
      department: item.department || "Founder",
      decisionDate: (item.decision_date || "2026-08-01").slice(0, 10),
      parentConstitutionId: `con-${parentSlug}`,
      relatedIds: Array.isArray(item.related_ids) ? item.related_ids : [],
      evidence: `json-seed:siya-decisions-seed.json#${item.id}`,
      confidence: item.importance === "high" ? 88 : item.importance === "low" ? 70 : 80,
      ownerName: item.department || "Founder",
    });
    if (before.rows.length) {
      existed += 1;
      console.log(`= ${decision.id}`);
    } else if (decision.id === item.id) {
      created += 1;
      console.log(`+ ${decision.id}`);
    } else {
      existed += 1;
      console.log(`~ ${item.id} → ${decision.id}`);
    }
  }

  const all = await listDecisions(pool, 80);
  const ids = new Set(all.map((d) => d.id));
  console.log("\n--- Summary ---");
  console.log(`JSON: created=${created} existed=${existed}`);
  console.log(`Total in store: ${all.length}`);
  for (const id of [
    "homepage-cta-meet-and-greet",
    "marketing-os-v1-frozen",
    "agent-org-chart-deferred",
    "chat-review-admin-clinical-lead-only",
    "marketing-bigger-systems-paused",
  ]) {
    console.log(`  ${ids.has(id) ? "✓" : "✗"} ${id}`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
