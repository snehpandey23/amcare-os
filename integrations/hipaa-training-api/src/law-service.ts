import type pg from "pg";
import { LAWS_V0_SEED, parseLawStatus, type LawRecord } from "./law-store.js";

export async function ensureLawTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_laws (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      owner_name TEXT NOT NULL,
      owner_contact TEXT,
      review_date DATE NOT NULL,
      half_life_days INT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      supersedes_id TEXT REFERENCES siya_laws(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_siya_laws_status ON siya_laws(status);
    CREATE INDEX IF NOT EXISTS idx_siya_laws_review ON siya_laws(review_date ASC);
  `);
  await pool.query(`ALTER TABLE siya_laws ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT ''`);
}

function rowToLaw(row: Record<string, unknown>): LawRecord {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    summary: (row.summary as string) ?? "",
    body: (row.body as string) ?? "",
    ownerName: row.owner_name as string,
    ownerContact: (row.owner_contact as string) ?? null,
    reviewDate: new Date(row.review_date as string).toISOString().slice(0, 10),
    halfLifeDays: Number(row.half_life_days),
    status: parseLawStatus(row.status),
    supersedesId: (row.supersedes_id as string) ?? null,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

/** Upsert seed so existing DBs pick up real policy text (not only empty-table seed). */
export async function syncLawsSeed(pool: pg.Pool): Promise<void> {
  for (const item of LAWS_V0_SEED) {
    const id = `law-${item.slug}`;
    await pool.query(
      `INSERT INTO siya_laws
        (id, slug, title, summary, body, owner_name, owner_contact, review_date, half_life_days, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         body = EXCLUDED.body,
         owner_name = EXCLUDED.owner_name,
         owner_contact = EXCLUDED.owner_contact,
         half_life_days = EXCLUDED.half_life_days,
         status = EXCLUDED.status,
         updated_at = NOW()`,
      [
        id,
        item.slug,
        item.title,
        item.summary,
        item.body,
        item.ownerName,
        item.ownerContact,
        item.reviewDate,
        item.halfLifeDays,
        item.status,
      ],
    );
  }
}

/** @deprecated use syncLawsSeed */
export async function seedLawsIfEmpty(pool: pg.Pool): Promise<void> {
  await syncLawsSeed(pool);
}

export async function listLaws(pool: pg.Pool): Promise<LawRecord[]> {
  const r = await pool.query(`SELECT * FROM siya_laws WHERE status <> 'superseded' ORDER BY title ASC`);
  return r.rows.map(rowToLaw);
}

export async function getLawById(pool: pg.Pool, id: string): Promise<LawRecord | null> {
  const r = await pool.query(`SELECT * FROM siya_laws WHERE id = $1 OR slug = $1`, [id]);
  if (!r.rows[0]) return null;
  return rowToLaw(r.rows[0]);
}
