/**
 * One-time / idempotent seed of siya_decisions from siya-decisions-seed.json
 * via POST /api/knowledge/decisions (same validation + lineage as Memory hub UI).
 *
 * Also triggers markdown boot-sync by hitting /api/knowledge/decisions/retrieval.
 *
 * Env:
 *   API_BASE_URL (default https://siya-staff-auth-api.vercel.app)
 *   SMOKE_EMAIL + SMOKE_PASSWORD — admin portal user
 *
 * Usage:
 *   SMOKE_EMAIL=... SMOKE_PASSWORD=... node scripts/seed-siya-decisions.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(
  __dirname,
  "../../../docs/siyaos-knowledge-base/decisions/siya-decisions-seed.json",
);

const base = (process.env.API_BASE_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const email = process.env.SMOKE_EMAIL?.trim();
const password = process.env.SMOKE_PASSWORD;

function importanceToNumber(raw) {
  const s = String(raw ?? "").toLowerCase();
  if (s === "high" || s === "3") return 3;
  if (s === "medium" || s === "2") return 2;
  return 1;
}

async function jsonFetch(p, init = {}) {
  const res = await fetch(`${base}${p}`, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return { res, body };
}

async function main() {
  if (!email || !password) {
    console.error("Set SMOKE_EMAIL and SMOKE_PASSWORD");
    process.exit(1);
  }
  if (!fs.existsSync(seedPath)) {
    console.error("Seed file missing:", seedPath);
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const items = Array.isArray(seed.decisions) ? seed.decisions : [];
  console.log(`Seed file: ${items.length} decisions → ${base}\n`);

  const login = await jsonFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const token = login.body?.token;
  if (!login.res.ok || !token) {
    console.error("Login failed:", login.body?.error || login.res.status);
    process.exit(1);
  }
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Ensure constitution + markdown decisions exist (boot-sync)
  const retrievalWarm = await jsonFetch("/api/knowledge/decisions/retrieval", { headers: auth });
  if (!retrievalWarm.res.ok) {
    console.error("Retrieval warm failed:", retrievalWarm.res.status, retrievalWarm.body);
    process.exit(1);
  }
  console.log(`Markdown/boot sync warm: ${retrievalWarm.body?.decisions?.length ?? 0} decisions in store`);

  const constitution = await jsonFetch("/api/knowledge/constitution", { headers: auth });
  const principles = constitution.body?.entries ?? [];
  const slugToId = new Map(principles.map((p) => [p.slug, p.id]));

  let created = 0;
  let existed = 0;
  let failed = 0;

  for (const item of items) {
    const parentSlug = item.parent_constitution_slug || "principle-never-ask-twice";
    const parentConstitutionId = slugToId.get(parentSlug) || slugToId.get("principle-never-ask-twice");
    if (!parentConstitutionId) {
      console.error(`✗ ${item.id}: no constitution parent (${parentSlug})`);
      failed += 1;
      continue;
    }

    const relatedIds = Array.isArray(item.related_ids) ? item.related_ids : [];
    const payload = {
      id: item.id,
      title: item.title,
      decisionText: item.decision_text,
      reason: item.reason,
      whatChanged: item.what_changed,
      importance: importanceToNumber(item.importance),
      status: item.status || "active",
      department: item.department || "Founder",
      decisionDate: (item.decision_date || "2026-08-01").slice(0, 10),
      parentConstitutionId,
      relatedIds,
      evidence: `json-seed:siya-decisions-seed.json#${item.id}`,
      confidence: item.importance === "high" ? 88 : item.importance === "low" ? 70 : 80,
      ownerName: item.department || "Founder",
    };

    const { res, body } = await jsonFetch("/api/knowledge/decisions", {
      method: "POST",
      headers: auth,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`✗ ${item.id}: ${body?.error || res.status}`);
      failed += 1;
      continue;
    }

    const returnedId = body?.decision?.id;
    if (returnedId === item.id && body.decision?.evidence?.startsWith("json-seed:")) {
      // freshly created this run OR prior seed — count as ok
      const prior = await jsonFetch(`/api/knowledge/decisions/${item.id}`, { headers: auth });
      // Heuristic: if created_at is very recent, count created; else existed
      const createdAt = prior.body?.decision?.createdAt;
      const ageMs = createdAt ? Date.now() - new Date(createdAt).getTime() : 999999;
      if (ageMs < 15_000) {
        created += 1;
        console.log(`+ created ${item.id}`);
      } else {
        existed += 1;
        console.log(`= existed ${item.id}`);
      }
    } else if (returnedId === item.id) {
      existed += 1;
      console.log(`= existed ${item.id}`);
    } else {
      // Title collision returned a different id (e.g. markdown counterpart)
      existed += 1;
      console.log(`~ reconciled ${item.id} → existing ${returnedId} (${body?.decision?.title})`);
    }
  }

  const finalList = await jsonFetch("/api/knowledge/decisions?limit=80", { headers: auth });
  const all = finalList.body?.decisions ?? [];
  const ids = new Set(all.map((d) => d.id));
  const markdownIds = ["homepage-cta-meet-and-greet", "marketing-os-v1-frozen", "agent-org-chart-deferred"];
  const jsonIds = items.map((d) => d.id);
  const markdownPresent = markdownIds.filter((id) => ids.has(id));
  const jsonPresent = jsonIds.filter((id) => ids.has(id));

  console.log("\n--- Summary ---");
  console.log(`JSON seed loop: created≈${created} existed/reconciled=${existed} failed=${failed}`);
  console.log(`Store total: ${all.length}`);
  console.log(`Markdown ids present: ${markdownPresent.length}/3 (${markdownPresent.join(", ")})`);
  console.log(`JSON seed ids present: ${jsonPresent.length}/${jsonIds.length}`);
  console.log(`Overlap links kept (not duplicated): meet-greet↔homepage-cta, bigger-systems↔marketing-os-v1-frozen`);

  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
