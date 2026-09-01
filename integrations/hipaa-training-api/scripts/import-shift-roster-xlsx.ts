/**
 * Import MA shift roster from Zoho WorkDrive XLS into shift_roster.
 *
 * Default: September 2026 sheet only (Prompt 1).
 * --include-today: also import today's IST calendar date from any month sheet (for live verify).
 *
 * Usage:
 *   node --env-file=.env.db --import tsx scripts/import-shift-roster-xlsx.ts
 *   node --env-file=.env.db --import tsx scripts/import-shift-roster-xlsx.ts --include-today
 */
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import pg from "pg";
import { ensureShiftRosterTables } from "../src/shift-roster-service.js";

const DEFAULT_XLS =
  process.env.SHIFT_ROSTER_XLS ||
  "/Users/sp/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/New roster for MA .xlsx";

/** Column header (trimmed) → portal email + person_key */
export const PERSON_COLUMN_MAP: Record<
  string,
  { personKey: string; email: string; displayName: string }
> = {
  Sneha: { personKey: "sneha", email: "sneha@siya.health", displayName: "Sneha Bannerjee" },
  Anmol: { personKey: "anmol", email: "anmol@siya.health", displayName: "Anmol Makkar" },
  Sonu: { personKey: "sonu", email: "sonu@siya.health", displayName: "Sonu Pathak" },
  Bhavini: { personKey: "bhavini", email: "bhavini@siya.health", displayName: "Bhavini Pandey" },
  Isha: { personKey: "isha", email: "isha@siya.health", displayName: "Isha Chauhan" },
};

const RANGE_RE =
  /(\d{1,2}(?:\.\d{1,2})?)\s*(AM|PM|am|pm)\s*[-–]\s*(\d{1,2}(?:\.\d{1,2})?)\s*(AM|PM|am|pm)?/g;

function istToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseClockToMinutes(num: string, ampm: string): number {
  const n = Number(num);
  let h = Math.floor(n);
  const m = Math.round((n - h) * 100);
  const minutes = Number.isFinite(m) && m >= 0 && m < 60 ? m : Math.round((n % 1) * 60);
  let hour = h;
  const ap = ampm.toUpperCase();
  if (ap === "AM") {
    if (hour === 12) hour = 0;
  } else {
    if (hour !== 12) hour += 12;
  }
  return hour * 60 + minutes;
}

function istIsoFromDateMinutes(ymd: string, minutes: number): string {
  const dayOffset = Math.floor(minutes / (24 * 60));
  const mins = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const [y, m, d] = ymd.split("-").map(Number);
  const base = new Date(Date.UTC(y!, m! - 1, d!, 0, 0, 0));
  // IST = UTC+5:30
  const utcMs = base.getTime() + dayOffset * 86400000 + (hh * 60 + mm - 330) * 60000;
  return new Date(utcMs).toISOString();
}

export type ParsedSegment = {
  shiftStart: string;
  shiftEnd: string;
  shiftLabel: string;
};

export function parseShiftCell(raw: string, rosterDate: string): {
  isOff: boolean;
  segments: ParsedSegment[];
} {
  const cell = String(raw ?? "").trim();
  if (!cell) return { isOff: false, segments: [] };
  if (/^off\b/i.test(cell) || cell.toUpperCase() === "OFF") {
    return { isOff: true, segments: [] };
  }
  const segments: ParsedSegment[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(RANGE_RE.source, "gi");
  while ((match = re.exec(cell)) !== null) {
    const startAmpm = match[2]!;
    const endAmpm = match[4] || startAmpm;
    const startMin = parseClockToMinutes(match[1]!, startAmpm);
    let endMin = parseClockToMinutes(match[3]!, endAmpm);
    // Overnight / same-day end ≤ start → end next calendar day
    if (endMin <= startMin) endMin += 24 * 60;
    const shiftStart = istIsoFromDateMinutes(rosterDate, startMin);
    const shiftEnd = istIsoFromDateMinutes(rosterDate, endMin);
    const label = `${match[1]}${startAmpm.toUpperCase()}–${match[3]}${endAmpm.toUpperCase()}`;
    segments.push({ shiftStart, shiftEnd, shiftLabel: label });
  }
  return { isOff: false, segments };
}

function sheetDateYmd(val: unknown): string | null {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  return null;
}

type ImportRow = {
  id: string;
  rosterDate: string;
  personKey: string;
  userId: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  shiftLabel: string | null;
  rawCell: string;
  isOff: boolean;
  sourceFile: string;
  sourceSheet: string;
};

async function main() {
  const includeToday = process.argv.includes("--include-today");
  const xlsxPath = DEFAULT_XLS;
  if (!existsSync(xlsxPath)) {
    console.error("XLS not found:", xlsxPath);
    process.exit(1);
  }

  const py = spawnSync(
    "python3",
    [
      "-c",
      `
import json
from openpyxl import load_workbook
wb = load_workbook(${JSON.stringify(xlsxPath)}, data_only=True)
out = {"sheets": {}}
for name in wb.sheetnames:
    ws = wb[name]
    rows = []
    for r in range(1, ws.max_row+1):
        row = []
        for c in range(1, 8):
            v = ws.cell(r,c).value
            if hasattr(v, "isoformat"):
                row.append({"d": v.strftime("%Y-%m-%d")})
            else:
                row.append(v)
        rows.append(row)
    out["sheets"][name] = rows
print(json.dumps(out))
`,
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  if (py.status !== 0) {
    console.error(py.stderr || py.stdout);
    process.exit(1);
  }
  const book = JSON.parse(py.stdout) as {
    sheets: Record<string, unknown[][]>;
  };

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: url });
  await ensureShiftRosterTables(pool);

  const emailToId = new Map<string, string>();
  const users = await pool.query(
    `SELECT id, lower(email) AS email FROM hipaa_training_users WHERE deactivated_at IS NULL`,
  );
  for (const u of users.rows) {
    emailToId.set(u.email as string, u.id as string);
  }

  console.log("\n=== Column → staff mapping (from sheet headers) ===");
  for (const [header, meta] of Object.entries(PERSON_COLUMN_MAP)) {
    const uid = emailToId.get(meta.email.toLowerCase()) || null;
    console.log(
      `  ${header} → ${meta.displayName} · ${meta.email} · user_id=${uid ?? "NOT FOUND"} · person_key=${meta.personKey}`,
    );
  }

  const today = istToday();
  const targets: { sheetName: string; months: number[]; year: number; extraDates?: string[] }[] = [
    { sheetName: "September ", months: [9], year: 2026 },
  ];
  if (includeToday) {
    targets[0]!.extraDates = undefined;
    // Find which sheet has today
    for (const [name, rows] of Object.entries(book.sheets)) {
      for (const row of rows.slice(2)) {
        const cell = row[0];
        const ymd =
          cell && typeof cell === "object" && cell !== null && "d" in cell
            ? String((cell as { d: string }).d)
            : null;
        if (ymd === today) {
          targets.push({ sheetName: name, months: [], year: 2026, extraDates: [today] });
          break;
        }
      }
    }
    console.log(`\n--include-today: also importing ${today} if present in workbook`);
  }

  const toInsert: ImportRow[] = [];
  const sourceFile = "New roster for MA .xlsx";

  for (const target of targets) {
    const rows = book.sheets[target.sheetName];
    if (!rows?.length) {
      console.warn("Missing sheet:", JSON.stringify(target.sheetName));
      continue;
    }
    const header = rows[0] || [];
    const colMap: { col: number; meta: (typeof PERSON_COLUMN_MAP)[string] }[] = [];
    for (let c = 2; c < 7; c++) {
      const rawH = String(header[c] ?? "").trim();
      const key = Object.keys(PERSON_COLUMN_MAP).find((k) => rawH.toLowerCase().startsWith(k.toLowerCase()));
      if (key && PERSON_COLUMN_MAP[key]) {
        colMap.push({ col: c, meta: PERSON_COLUMN_MAP[key]! });
      }
    }
    if (!colMap.length) {
      console.warn("No person columns on", target.sheetName);
      continue;
    }

    for (let r = 2; r < rows.length; r++) {
      const row = rows[r]!;
      const dateCell = row[0];
      const ymd =
        dateCell && typeof dateCell === "object" && dateCell !== null && "d" in dateCell
          ? String((dateCell as { d: string }).d)
          : sheetDateYmd(dateCell);
      if (!ymd) continue;
      const [yy, mm] = ymd.split("-").map(Number);
      const inMonth = target.months.includes(mm!) && yy === target.year;
      const inExtra = target.extraDates?.includes(ymd);
      if (!inMonth && !inExtra) continue;

      for (const { col, meta } of colMap) {
        const rawCell = String(row[col] ?? "").trim();
        if (!rawCell) continue;
        const userId = emailToId.get(meta.email.toLowerCase()) || null;
        const parsed = parseShiftCell(rawCell, ymd);
        if (parsed.isOff) {
          toInsert.push({
            id: randomUUID(),
            rosterDate: ymd,
            personKey: meta.personKey,
            userId,
            shiftStart: null,
            shiftEnd: null,
            shiftLabel: "OFF",
            rawCell,
            isOff: true,
            sourceFile,
            sourceSheet: target.sheetName.trim(),
          });
          continue;
        }
        if (!parsed.segments.length) {
          toInsert.push({
            id: randomUUID(),
            rosterDate: ymd,
            personKey: meta.personKey,
            userId,
            shiftStart: null,
            shiftEnd: null,
            shiftLabel: null,
            rawCell,
            isOff: false,
            sourceFile,
            sourceSheet: target.sheetName.trim(),
          });
          continue;
        }
        for (const seg of parsed.segments) {
          toInsert.push({
            id: randomUUID(),
            rosterDate: ymd,
            personKey: meta.personKey,
            userId,
            shiftStart: seg.shiftStart,
            shiftEnd: seg.shiftEnd,
            shiftLabel: seg.shiftLabel,
            rawCell,
            isOff: false,
            sourceFile,
            sourceSheet: target.sheetName.trim(),
          });
        }
      }
    }
  }

  // Replace imported date range for these person keys
  const dates = [...new Set(toInsert.map((r) => r.rosterDate))].sort();
  const keys = Object.values(PERSON_COLUMN_MAP).map((m) => m.personKey);
  if (dates.length) {
    await pool.query(
      `DELETE FROM shift_roster
       WHERE person_key = ANY($1::text[])
         AND roster_date >= $2::date
         AND roster_date <= $3::date`,
      [keys, dates[0], dates[dates.length - 1]],
    );
  }

  for (const row of toInsert) {
    await pool.query(
      `INSERT INTO shift_roster (
         id, roster_date, person_key, user_id, shift_start, shift_end, shift_label,
         raw_cell, is_off, source_file, source_sheet
       ) VALUES ($1,$2::date,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        row.id,
        row.rosterDate,
        row.personKey,
        row.userId,
        row.shiftStart,
        row.shiftEnd,
        row.shiftLabel,
        row.rawCell,
        row.isOff,
        row.sourceFile,
        row.sourceSheet,
      ],
    );
  }

  console.log(`\nInserted ${toInsert.length} rows covering ${dates[0]} → ${dates[dates.length - 1]}`);

  // Sample verify vs XLS expectations
  const samples = [
    { date: "2026-09-01", person: "sneha", expectRaw: /8\.30\s*PM/i },
    { date: "2026-09-01", person: "anmol", expectRaw: /5\.30\s*AM/i },
    { date: "2026-09-02", person: "sonu", expectOff: true },
    { date: "2026-09-13", person: "anmol", expectOff: true },
    { date: "2026-09-30", person: "isha", expectRaw: /8\.30\s*PM/i },
  ];
  if (includeToday) {
    samples.unshift({ date: today, person: "anmol", expectRaw: /./ });
  }
  console.log("\n=== Sample verify ===");
  for (const s of samples) {
    const r = await pool.query(
      `SELECT raw_cell, is_off, shift_start, shift_end, shift_label
       FROM shift_roster WHERE roster_date = $1::date AND person_key = $2
       ORDER BY shift_start NULLS LAST`,
      [s.date, s.person],
    );
    const ok =
      s.expectOff != null
        ? r.rows.some((x) => x.is_off)
        : r.rows.some((x) => s.expectRaw!.test(String(x.raw_cell)));
    console.log(
      `${ok ? "OK" : "FAIL"} ${s.date} ${s.person}:`,
      r.rows.map((x) => ({
        raw: x.raw_cell,
        off: x.is_off,
        start: x.shift_start,
        end: x.shift_end,
        label: x.shift_label,
      })),
    );
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
