import type pg from "pg";
import {
  CONSTITUTION_SEED,
  type ConstitutionCategory,
  type ConstitutionEntry,
} from "./constitution-store.js";

export async function ensureConstitutionTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_constitution_entries (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category VARCHAR(64) NOT NULL,
      half_life_days INT,
      confidence SMALLINT NOT NULL DEFAULT 95,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_siya_constitution_sort ON siya_constitution_entries(sort_order ASC);
  `);
}

function rowToConstitution(row: Record<string, unknown>): ConstitutionEntry {
  const days = row.half_life_days as number | null;
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    body: row.body as string,
    category: row.category as ConstitutionCategory,
    halfLife: days == null ? "forever" : days,
    confidence: Number(row.confidence),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export async function seedConstitutionIfEmpty(pool: pg.Pool): Promise<void> {
  for (const item of CONSTITUTION_SEED) {
    const id = `con-${item.slug}`;
    await pool.query(
      `INSERT INTO siya_constitution_entries (id, slug, title, body, category, half_life_days, confidence, sort_order)
       VALUES ($1, $2, $3, $4, $5, NULL, 97, $6)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         body = EXCLUDED.body,
         category = EXCLUDED.category,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [id, item.slug, item.title, item.body, item.category, item.sortOrder],
    );
  }
}

export async function listConstitution(pool: pg.Pool): Promise<ConstitutionEntry[]> {
  const r = await pool.query(`SELECT * FROM siya_constitution_entries ORDER BY sort_order ASC, title ASC`);
  return r.rows.map(rowToConstitution);
}

export async function getConstitutionById(pool: pg.Pool, id: string): Promise<ConstitutionEntry | null> {
  const r = await pool.query(`SELECT * FROM siya_constitution_entries WHERE id = $1`, [id]);
  if (!r.rows[0]) return null;
  return rowToConstitution(r.rows[0]);
}
