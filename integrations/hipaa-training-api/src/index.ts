/**
 * HIPAA Training API — auth + per-user progress (Postgres JSON).
 * - POST /api/auth/login, POST /api/auth/register (if HIPAA_TRAINING_ALLOW_REGISTER=true)
 * - GET /api/auth/me
 * - GET /api/training/progress, PUT /api/training/progress
 * - GET /api/admin/training/summary, GET /api/admin/training/progress/:userId
 */

import "dotenv/config";
import cors from "cors";
import express from "express";
import type pg from "pg";
import { getPool, initDb } from "./db.js";
import { hashPassword, comparePassword, signToken } from "./auth.js";
import { requireAuth, requireAdmin, requireSopBuilderAccess, requireChatReviewAccess, type AuthRequest } from "./middleware.js";
import { summarizeTrainingProgress, summarizeLevelUpProgress, drillCount } from "./summarize-progress.js";
import {
  parseShiftStore,
  isSameCalendarDay,
  countPresenceSessions,
  normalizePresenceStatus,
  type ShiftStore,
  type ShiftMood,
  type PresenceStatus,
} from "./shift-store.js";
import { parseImportance, parseSource, insertMemory, searchMemory, listRecentMemory, buildWeekInReview } from "./memory-service.js";
import type { MemoryVisibility } from "./memory-store.js";
import {
  loadShiftStore,
  saveShiftStore,
  ensureActiveShift,
  logPresenceTransition,
  logShiftEnd,
} from "./shift-progress.js";
import {
  ensureShiftAttendanceTables,
  fetchAttendanceForCsv,
  attendanceRowsToCsv,
  logShiftAttendance,
} from "./shift-attendance.js";
import { buildShiftDashboard, opsDayBounds } from "./shift-dashboard.js";

const PORT = parseInt(process.env.HIPAA_TRAINING_API_PORT || "3012", 10);

function registerAllowed(): boolean {
  return process.env.HIPAA_TRAINING_ALLOW_REGISTER === "true";
}

function adminEmailMatch(email: string): boolean {
  const a = process.env.HIPAA_TRAINING_ADMIN_EMAIL?.trim().toLowerCase();
  return !!a && email.trim().toLowerCase() === a;
}

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((s) => s.trim()) : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));

let dbInit: Promise<void> | undefined;
app.use(async (_req, _res, next) => {
  if (getPool()) {
    if (!dbInit) {
      dbInit = initDb().catch((err) => {
        dbInit = undefined;
        console.error("[hipaa-training-api] Database init failed:", err);
        throw err;
      });
    }
    try {
      await dbInit;
    } catch {
      /* routes may return 503 */
    }
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hipaa-training-api",
    database: getPool() ? "configured" : "not configured",
    registerOpen: registerAllowed(),
  });
});

app.post("/api/auth/register", async (req: express.Request, res: express.Response) => {
  if (!registerAllowed()) {
    return res.status(403).json({
      error: "Self-registration is disabled. Contact your administrator for an account.",
    });
  }
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  }
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const em = email.trim().toLowerCase();
  const role = adminEmailMatch(em) ? "admin" : "trainee";
  try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO hipaa_training_users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [em, passwordHash, (name && typeof name === "string" ? name.trim() : null) || null, role]
    );
    const row = result.rows[0];
    const token = signToken({ userId: row.id, email: row.email, role: row.role });
    return res.status(201).json({
      token,
      user: { id: row.id, email: row.email, name: row.name, role: row.role },
    });
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (code === "23505") {
      return res.status(400).json({ error: "Email already registered. Sign in instead." });
    }
    console.error("[hipaa-training-api] Register error:", err);
    return res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/auth/login", async (req: express.Request, res: express.Response) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
  }
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password required" });
  }
  const result = await pool.query(
    "SELECT id, email, password_hash, name, role, deactivated_at FROM hipaa_training_users WHERE email = $1",
    [email.trim().toLowerCase()]
  );
  const row = result.rows[0];
  if (!row || !(await comparePassword(password, row.password_hash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (row.deactivated_at) {
    return res.status(403).json({ error: "This account has been deactivated. Contact an admin." });
  }
  try {
    await ensureActiveShift(pool, row.id as string, "morning", "login");
  } catch (err) {
    console.error("[hipaa-training-api] login shift start (non-fatal):", err);
  }
  await pool.query(`UPDATE hipaa_training_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`, [row.id]);
  const token = signToken({ userId: row.id, email: row.email, role: row.role });
  return res.json({
    token,
    user: { id: row.id, email: row.email, name: row.name, role: row.role },
  });
});

app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const r = await pool.query(
    "SELECT id, email, name, role, created_at, deactivated_at FROM hipaa_training_users WHERE id = $1",
    [userId]
  );
  const row = r.rows[0];
  if (!row) return res.status(401).json({ error: "User not found" });
  if (row.deactivated_at) {
    return res.status(403).json({ error: "Account deactivated" });
  }
  await pool.query(`UPDATE hipaa_training_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`, [userId]);
  return res.json({ id: row.id, email: row.email, name: row.name, role: row.role });
});

app.post("/api/auth/change-password", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "currentPassword and newPassword required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  const { userId } = req.user!;
  const r = await pool.query(`SELECT password_hash FROM hipaa_training_users WHERE id = $1`, [userId]);
  if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
  if (!(await comparePassword(currentPassword, r.rows[0].password_hash as string))) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  await pool.query(`UPDATE hipaa_training_users SET password_hash = $1 WHERE id = $2`, [
    await hashPassword(newPassword),
    userId,
  ]);
  return res.json({ ok: true });
});

app.get("/api/training/progress", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const r = await pool.query(
    "SELECT course_version, progress_json, updated_at FROM hipaa_training_progress WHERE user_id = $1",
    [userId]
  );
  const row = r.rows[0];
  if (!row) {
    return res.json({ progress: null });
  }
  return res.json({
    progress: row.progress_json,
    courseVersion: row.course_version,
    updatedAt: row.updated_at,
  });
});

app.put("/api/training/progress", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Progress body must be a JSON object" });
  }
  const progress = body as Record<string, unknown>;
  const courseVersion =
    typeof progress.courseVersion === "string" ? progress.courseVersion : "unknown";
  const json = JSON.stringify(progress);
  await pool.query(
    `INSERT INTO hipaa_training_progress (user_id, course_version, progress_json, updated_at)
     VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET
       course_version = EXCLUDED.course_version,
       progress_json = EXCLUDED.progress_json,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, courseVersion, json]
  );
  return res.json({ ok: true });
});

app.get("/api/level-up/progress", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const r = await pool.query(
    "SELECT level_up_json, updated_at FROM hipaa_training_progress WHERE user_id = $1",
    [userId],
  );
  const row = r.rows[0];
  if (!row) {
    return res.json({ progress: null });
  }
  return res.json({ progress: row.level_up_json, updatedAt: row.updated_at });
});

app.put("/api/level-up/progress", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Progress body must be a JSON object" });
  }
  const json = JSON.stringify(body);
  await pool.query(
    `INSERT INTO hipaa_training_progress (user_id, course_version, progress_json, level_up_json, updated_at)
     VALUES ($1, 'n/a', '{}'::jsonb, $2::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET
       level_up_json = EXCLUDED.level_up_json,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, json],
  );
  return res.json({ ok: true });
});

app.get("/api/portal/profile", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const r = await pool.query(
    "SELECT profile_json, updated_at FROM hipaa_training_progress WHERE user_id = $1",
    [userId],
  );
  const row = r.rows[0];
  if (!row?.profile_json || Object.keys(row.profile_json as object).length === 0) {
    return res.json({ profile: null });
  }
  return res.json({ profile: row.profile_json, updatedAt: row.updated_at });
});

app.put("/api/portal/profile", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Profile must be a JSON object" });
  }
  const json = JSON.stringify(body);
  await pool.query(
    `INSERT INTO hipaa_training_progress (user_id, course_version, progress_json, profile_json, updated_at)
     VALUES ($1, 'n/a', '{}'::jsonb, $2::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET
       profile_json = EXCLUDED.profile_json,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, json],
  );
  return res.json({ ok: true });
});

app.post("/api/shift/ensure-active", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const workShift = req.body?.workShift;
  const shift =
    workShift === "evening" || workShift === "night" || workShift === "morning" ? workShift : "morning";
  const { store } = await ensureActiveShift(pool, userId, shift, "login");
  return res.json(store);
});

app.get("/api/shift/state", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const store = await loadShiftStore(pool, req.user!.userId);
  return res.json(store);
});

app.post("/api/shift/start", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const workShift = req.body?.workShift;
  const shift =
    workShift === "evening" || workShift === "night" || workShift === "morning" ? workShift : "morning";
  const { store } = await ensureActiveShift(pool, userId, shift, "staff_ui");
  return res.json(store);
});

app.post("/api/shift/end", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const mood = req.body?.mood as ShiftMood | undefined;
  const reflection = typeof req.body?.reflection === "string" ? req.body.reflection.slice(0, 2000) : undefined;
  const todayLearned = typeof req.body?.todayLearned === "string" ? req.body.todayLearned.slice(0, 500) : undefined;
  const accomplishments =
    typeof req.body?.accomplishments === "string" ? req.body.accomplishments.slice(0, 4000) : undefined;
  const memoryImportance = parseImportance(req.body?.memoryImportance);
  let store = await loadShiftStore(pool, userId);
  if (!store.active) {
    return res.json(store);
  }
  const { breakCount, focusSessionCount } = countPresenceSessions(store.active.presenceLog);
  const ended = {
    id: `sh-${Date.now()}`,
    startedAt: store.active.startedAt,
    endedAt: new Date().toISOString(),
    workShift: store.active.workShift,
    endMood: mood === "great" || mood === "okay" || mood === "difficult" ? mood : undefined,
    endReflection: reflection,
    todayLearned,
    accomplishments,
    breakCount,
    focusSessionCount,
  };
  const recent = [ended, ...store.recent].slice(0, 60);
  store = { active: null, recent };
  await saveShiftStore(pool, userId, store);
  const shiftEndEventId = await logShiftEnd(pool, userId, {
    workShift: ended.workShift,
    breakCount,
    focusSessionCount,
  });
  if (accomplishments?.trim()) {
    const { ingestShiftAccomplishment } = await import("./memory-service.js");
    await ingestShiftAccomplishment(pool, userId, accomplishments, memoryImportance);
  }
  return res.json({ ...store, shiftEndEventId });
});

app.post("/api/shift/presence", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const rawStatus = req.body?.status;
  const status = normalizePresenceStatus(rawStatus);
  if (rawStatus !== "working" && rawStatus !== "available" && rawStatus !== "break" && rawStatus !== "focus") {
    return res.status(400).json({ error: "status must be working, break, or focus" });
  }
  let store = await loadShiftStore(pool, userId);
  if (!store.active) {
    return res.status(400).json({ error: "No active shift. Start shift first." });
  }
  const now = new Date().toISOString();
  const prev = store.active.presence;
  const log = [...(store.active.presenceLog ?? []), { status, at: now }].slice(-40);
  store = {
    ...store,
    active: {
      ...store.active,
      presence: status,
      presenceSince: now,
      presenceLog: log,
    },
  };
  await saveShiftStore(pool, userId, store);
  if (prev !== status) {
    await logPresenceTransition(pool, userId, prev, status);
  }
  return res.json(store);
});

app.get("/api/team/pulse", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { buildTeamPulse } = await import("./team-pulse.js");
    const pulse = await buildTeamPulse(pool);
    return res.json(pulse);
  } catch (err) {
    console.error("[hipaa-training-api] team pulse:", err);
    return res.status(500).json({ error: "Could not load team pulse." });
  }
});

app.get("/api/executive/briefing", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const userId = req.user!.userId;
    const r = await pool.query(
      `SELECT email, name, role FROM hipaa_training_users WHERE id = $1 AND deactivated_at IS NULL`,
      [userId],
    );
    const row = r.rows[0];
    if (!row) return res.status(401).json({ error: "User not found" });
    const { buildExecutiveBriefing, isExecutiveUser } = await import("./executive-briefing.js");
    if (!isExecutiveUser(row.email as string, row.role as string)) {
      return res.status(403).json({ error: "Executive briefing is not enabled for this account." });
    }
    const briefing = await buildExecutiveBriefing(pool, {
      email: row.email as string,
      name: row.name as string | null,
    });
    return res.json(briefing);
  } catch (err) {
    console.error("[hipaa-training-api] executive briefing:", err);
    return res.status(500).json({ error: "Could not load executive briefing." });
  }
});

/** Founder Decision Coach Phase 1 — team-visible weekly brief + founder-only plan edit */
app.get("/api/founder-coach/brief", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const userId = req.user!.userId;
    const r = await pool.query(`SELECT email, role FROM hipaa_training_users WHERE id = $1`, [userId]);
    if (!r.rows[0]) return res.status(401).json({ error: "User not found" });
    const { buildFounderCoachBrief } = await import("./founder-coach-service.js");
    const brief = await buildFounderCoachBrief(pool, {
      email: r.rows[0].email as string,
      role: r.rows[0].role as string,
    });
    return res.json(brief);
  } catch (err) {
    console.error("[founder-coach/brief]", err);
    return res.status(500).json({ error: "Could not load founder coach brief." });
  }
});

app.put("/api/founder-coach/monthly", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = req.user!.userId;
  const u = await pool.query(`SELECT email, role FROM hipaa_training_users WHERE id = $1`, [userId]);
  if (!u.rows[0]) return res.status(401).json({ error: "User not found" });
  const { isExecutiveUser } = await import("./executive-briefing.js");
  if (!isExecutiveUser(u.rows[0].email as string, u.rows[0].role as string)) {
    return res.status(403).json({ error: "Founder only" });
  }
  const { upsertMonthlyPlan, istDateLabel } = await import("./founder-coach-service.js");
  try {
    const monthKey = typeof req.body?.monthKey === "string" ? req.body.monthKey : istDateLabel(new Date()).slice(0, 7);
    const plan = await upsertMonthlyPlan(pool, userId, {
      monthKey,
      northStar: typeof req.body?.northStar === "string" ? req.body.northStar : "",
      timeBudget: req.body?.timeBudget ?? {},
      outcomes: Array.isArray(req.body?.outcomes) ? req.body.outcomes : [],
      notDoing: Array.isArray(req.body?.notDoing) ? req.body.notDoing : [],
      reviewTriggers: Array.isArray(req.body?.reviewTriggers) ? req.body.reviewTriggers : [],
    });
    return res.json({ plan });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Save failed" });
  }
});

app.put("/api/founder-coach/weekly", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = req.user!.userId;
  const u = await pool.query(`SELECT email, role FROM hipaa_training_users WHERE id = $1`, [userId]);
  if (!u.rows[0]) return res.status(401).json({ error: "User not found" });
  const { isExecutiveUser } = await import("./executive-briefing.js");
  if (!isExecutiveUser(u.rows[0].email as string, u.rows[0].role as string)) {
    return res.status(403).json({ error: "Founder only" });
  }
  const { upsertWeeklyPlan, istWeekStart } = await import("./founder-coach-service.js");
  try {
    const weekStart = typeof req.body?.weekStart === "string" ? req.body.weekStart : istWeekStart();
    const plan = await upsertWeeklyPlan(pool, userId, {
      weekStart,
      monthKey: typeof req.body?.monthKey === "string" ? req.body.monthKey : undefined,
      founderFocus: typeof req.body?.founderFocus === "string" ? req.body.founderFocus : "",
      canWait: Array.isArray(req.body?.canWait) ? req.body.canWait : [],
      delegate: Array.isArray(req.body?.delegate) ? req.body.delegate : [],
      observeOnly: Array.isArray(req.body?.observeOnly) ? req.body.observeOnly : [],
    });
    return res.json({ plan });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Save failed" });
  }
});

app.put("/api/founder-coach/actuals", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = req.user!.userId;
  const u = await pool.query(`SELECT email, role FROM hipaa_training_users WHERE id = $1`, [userId]);
  if (!u.rows[0]) return res.status(401).json({ error: "User not found" });
  const { isExecutiveUser } = await import("./executive-briefing.js");
  if (!isExecutiveUser(u.rows[0].email as string, u.rows[0].role as string)) {
    return res.status(403).json({ error: "Founder only" });
  }
  const { upsertWeeklyActuals, istWeekStart } = await import("./founder-coach-service.js");
  const weekStart = typeof req.body?.weekStart === "string" ? req.body.weekStart : istWeekStart();
  const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
  try {
    const actuals = await upsertWeeklyActuals(pool, userId, weekStart, {
      adsTxCpa: num(req.body?.adsTxCpa),
      adsTxConversions: num(req.body?.adsTxConversions),
      adsCampaignEdits: num(req.body?.adsCampaignEdits) ?? undefined,
      indiaGrantsIdentified: num(req.body?.indiaGrantsIdentified),
      indiaApplicationsSubmitted: num(req.body?.indiaApplicationsSubmitted),
      usIntroContacted: num(req.body?.usIntroContacted),
      usIntroReplied: num(req.body?.usIntroReplied),
      usIntroMeetings: num(req.body?.usIntroMeetings),
      notes: typeof req.body?.notes === "string" ? req.body.notes : undefined,
    });
    return res.json({ actuals });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Save failed" });
  }
});

app.post("/api/founder-coach/observe-events", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const observeId = typeof req.body?.observeId === "string" ? req.body.observeId : "";
  if (!observeId) return res.status(400).json({ error: "observeId required" });
  const { logObserveEvent, istWeekStart } = await import("./founder-coach-service.js");
  const weekStart = typeof req.body?.weekStart === "string" ? req.body.weekStart : istWeekStart();
  await logObserveEvent(
    pool,
    req.user!.userId,
    weekStart,
    observeId,
    typeof req.body?.note === "string" ? req.body.note : "",
  );
  return res.status(201).json({ ok: true });
});

app.post("/api/assist/gaps", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const id = typeof req.body?.id === "string" ? req.body.id.slice(0, 64) : `gap-${Date.now()}`;
  const department = typeof req.body?.department === "string" ? req.body.department : "General";
  const task = typeof req.body?.task === "string" ? req.body.task : "Missing approved policy";
  try {
    const { insertAssistGap } = await import("./assist-telemetry.js");
    await insertAssistGap(pool, { id, department, task });
    return res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("[assist/gaps]", err);
    return res.status(500).json({ error: "Could not record gap." });
  }
});

app.post("/api/assist/feedback", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const helpful = req.body?.helpful === true;
  const failureType = typeof req.body?.failureType === "string" ? req.body.failureType : undefined;
  const department = typeof req.body?.department === "string" ? req.body.department : undefined;
  const knowledgeGap = req.body?.knowledgeGap === true;
  try {
    const { insertAssistFeedback } = await import("./assist-telemetry.js");
    await insertAssistFeedback(pool, { helpful, failureType, department, knowledgeGap });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[assist/feedback]", err);
    return res.status(500).json({ error: "Could not record feedback." });
  }
});

app.get("/api/admin/shift/today", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const r = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, p.shift_json
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     ORDER BY u.created_at ASC`,
  );
  const members = r.rows.map((row) => {
    const store = parseShiftStore(row.shift_json);
    const todayRecord = store.recent.find((rec) => isSameCalendarDay(rec.startedAt));
    const onShift = Boolean(store.active);
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      portalRole: row.role,
      shiftStartedAt: store.active?.startedAt ?? todayRecord?.startedAt ?? null,
      shiftEndedAt: onShift ? null : todayRecord?.endedAt ?? null,
      onShift,
      presence: store.active?.presence ?? (onShift ? "working" : null),
      endMood: todayRecord?.endMood ?? null,
      todayLearned: todayRecord?.todayLearned ?? null,
    };
  });
  const expected = members.length;
  const onShift = members.filter((m) => m.onShift).length;
  const onBreak = members.filter((m) => m.onShift && m.presence === "break").length;
  const inFocus = members.filter((m) => m.onShift && m.presence === "focus").length;
  const working = members.filter((m) => m.onShift && m.presence === "working").length;
  const offShift = expected - onShift;
  const ended = members.filter((m) => !m.onShift && m.shiftEndedAt && isSameCalendarDay(m.shiftEndedAt)).length;
  const started = members.filter((m) => m.shiftStartedAt && isSameCalendarDay(m.shiftStartedAt)).length;
  const notStarted = expected - started;
  return res.json({
    expected,
    started,
    onShift,
    ended,
    notStarted,
    working,
    onBreak,
    inFocus,
    offShift,
    /** @deprecated use `working` */
    available: working,
    members,
  });
});

app.get("/api/admin/shift/dashboard", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const payload = await buildShiftDashboard(pool, req.query.date);
    return res.json(payload);
  } catch (err) {
    console.error("[hipaa-training-api] shift dashboard:", err);
    return res.status(500).json({ error: "Could not build shift dashboard." });
  }
});

function attendanceDayBounds(dateParam: unknown): { from: string; to: string; label: string } {
  const b = opsDayBounds(dateParam);
  return { from: b.from, to: b.to, label: b.label };
}

app.get("/api/admin/shift/attendance-log", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  await ensureShiftAttendanceTables(pool);
  const { from, to, label } = attendanceDayBounds(req.query.date);
  const rows = await fetchAttendanceForCsv(pool, from, to);
  return res.json({ date: label, count: rows.length, events: rows });
});

app.get("/api/admin/shift/attendance-log.csv", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  await ensureShiftAttendanceTables(pool);
  const { from, to, label } = attendanceDayBounds(req.query.date);
  const rows = await fetchAttendanceForCsv(pool, from, to);
  const csv = attendanceRowsToCsv(rows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="shift-attendance-${label}.csv"`);
  return res.send(csv);
});

app.post("/api/portal/tool-link-opened", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const label = typeof req.body?.label === "string" ? req.body.label.slice(0, 120) : "link";
  const href = typeof req.body?.href === "string" ? req.body.href.slice(0, 500) : "";
  let host = "";
  try {
    host = href ? new URL(href).host : "";
  } catch {
    host = "";
  }
  await ensureShiftAttendanceTables(pool);
  await logShiftAttendance(pool, req.user!.userId, "tool_link_opened", "staff_ui", { label, href, host });
  return res.json({ ok: true });
});

function aggregateShiftTrends(recent: ReturnType<typeof parseShiftStore>["recent"], days = 30) {
  const since = Date.now() - days * 86400000;
  const inWindow = recent.filter((r) => new Date(r.startedAt).getTime() >= since);
  const startedShifts = inWindow.length;
  const completedShifts = inWindow.filter((r) => r.endedAt).length;
  let focusTotal = 0;
  for (const r of inWindow) {
    focusTotal += r.focusSessionCount ?? 0;
  }
  const avgFocusSessionsPerShift = startedShifts ? Math.round((focusTotal / startedShifts) * 10) / 10 : 0;
  return { periodDays: days, startedShifts, completedShifts, avgFocusSessionsPerShift };
}

app.get("/api/shift/trends", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const store = await loadShiftStore(pool, req.user!.userId);
  return res.json(aggregateShiftTrends(store.recent, 30));
});

/** Chat review log — Clinical Operations lead + admin only */
app.get("/api/chat-reviews/access", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { canUseChatReview } = await import("./ops-coordination-service.js");
  const role = req.user!.role ?? "trainee";
  const canReview = await canUseChatReview(pool, req.user!.userId, role);
  return res.json({ canReview, isAdmin: role === "admin" });
});

app.get("/api/chat-reviews", requireAuth, requireChatReviewAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listChatReviewsForUser } = await import("./ops-coordination-service.js");
  const date = typeof req.query.date === "string" ? req.query.date : "today";
  const statusRaw = typeof req.query.status === "string" ? req.query.status : undefined;
  const status = statusRaw === "open" || statusRaw === "closed" ? statusRaw : undefined;
  const reviews = await listChatReviewsForUser(pool, req.user!.userId, date, status);
  return res.json({ reviews, date: reviews[0]?.reviewDate ?? date });
});

app.post("/api/chat-reviews", requireAuth, requireChatReviewAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const patientIdentifier =
    typeof req.body?.patientIdentifier === "string" ? req.body.patientIdentifier.trim() : "";
  if (!patientIdentifier) return res.status(400).json({ error: "patientIdentifier required" });
  const { createChatReview, parseReviewDate } = await import("./ops-coordination-service.js");
  const reviewDate =
    typeof req.body?.reviewDate === "string" ? parseReviewDate(req.body.reviewDate) : undefined;
  const status = req.body?.status === "closed" ? "closed" : "open";
  const review = await createChatReview(pool, req.user!.userId, {
    reviewDate,
    patientIdentifier,
    notes: typeof req.body?.notes === "string" ? req.body.notes : "",
    errorNotes: typeof req.body?.errorNotes === "string" ? req.body.errorNotes : "",
    status,
  });
  return res.status(201).json({ review });
});

app.patch("/api/chat-reviews/:id", requireAuth, requireChatReviewAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { updateChatReview } = await import("./ops-coordination-service.js");
  const status = req.body?.status === "closed" ? "closed" : req.body?.status === "open" ? "open" : undefined;
  const review = await updateChatReview(pool, req.user!.userId, req.params.id, {
    patientIdentifier: typeof req.body?.patientIdentifier === "string" ? req.body.patientIdentifier : undefined,
    notes: typeof req.body?.notes === "string" ? req.body.notes : undefined,
    errorNotes: typeof req.body?.errorNotes === "string" ? req.body.errorNotes : undefined,
    status,
  });
  if (!review) return res.status(404).json({ error: "Review not found" });
  return res.json({ review });
});

app.get("/api/admin/chat-reviews", requireAuth, requireChatReviewAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listChatReviewsAdmin } = await import("./ops-coordination-service.js");
  const date = typeof req.query.date === "string" ? req.query.date : "today";
  const statusRaw = typeof req.query.status === "string" ? req.query.status : undefined;
  const status = statusRaw === "open" || statusRaw === "closed" ? statusRaw : undefined;
  const reviews = await listChatReviewsAdmin(pool, {
    dateParam: date,
    status,
    viewerUserId: req.user!.userId,
    viewerRole: req.user!.role ?? "trainee",
  });
  return res.json({ reviews, date });
});

/** Shift handoff notes — team-visible coordination */
app.get("/api/shift-handoffs", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listShiftHandoffs } = await import("./ops-coordination-service.js");
  const date = typeof req.query.date === "string" ? req.query.date : "today";
  const handoffs = await listShiftHandoffs(pool, date);
  return res.json({ handoffs, date });
});

app.post("/api/shift-handoffs", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { createShiftHandoff, parseReviewDate } = await import("./ops-coordination-service.js");
  const followups = Array.isArray(req.body?.pendingFollowups) ? req.body.pendingFollowups : [];
  const handoff = await createShiftHandoff(pool, req.user!.userId, {
    shiftEndEventId: typeof req.body?.shiftEndEventId === "string" ? req.body.shiftEndEventId : null,
    handoffDate: typeof req.body?.handoffDate === "string" ? parseReviewDate(req.body.handoffDate) : undefined,
    chatsHandledCount:
      typeof req.body?.chatsHandledCount === "number" ? Math.max(0, Math.floor(req.body.chatsHandledCount)) : null,
    callsMadeCount:
      typeof req.body?.callsMadeCount === "number" ? Math.max(0, Math.floor(req.body.callsMadeCount)) : null,
    callsReceivedCount:
      typeof req.body?.callsReceivedCount === "number" ? Math.max(0, Math.floor(req.body.callsReceivedCount)) : null,
    pendingFollowups: followups,
    scheduledItemsToday: typeof req.body?.scheduledItemsToday === "string" ? req.body.scheduledItemsToday : undefined,
    generalNotes: typeof req.body?.generalNotes === "string" ? req.body.generalNotes : undefined,
  });
  return res.status(201).json({ handoff });
});

app.get("/api/admin/shift/trends", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const r = await pool.query(`SELECT shift_json FROM hipaa_training_progress`);
  let startedShifts = 0;
  let completedShifts = 0;
  let focusTotal = 0;
  const since = Date.now() - 30 * 86400000;
  for (const row of r.rows) {
    const store = parseShiftStore(row.shift_json);
    const t = aggregateShiftTrends(store.recent, 30);
    startedShifts += t.startedShifts;
    completedShifts += t.completedShifts;
    focusTotal += t.avgFocusSessionsPerShift * t.startedShifts;
  }
  const avgFocusSessionsPerShift =
    startedShifts > 0 ? Math.round((focusTotal / startedShifts) * 10) / 10 : 0;
  return res.json({
    periodDays: 30,
    startedShifts,
    completedShifts,
    avgFocusSessionsPerShift,
    note: "Team aggregates only — no per-person presence logs.",
  });
});

app.get("/api/memory/recent", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 50);
  const entries = await listRecentMemory(pool, req.user!.userId, limit);
  return res.json({ entries });
});

app.get("/api/memory/search", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const entries = await searchMemory(pool, req.user!.userId, q, 30);
  return res.json({ entries, q });
});

app.get("/api/memory/week-in-review", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const review = await buildWeekInReview(pool, req.user!.userId);
  return res.json(review);
});

app.post("/api/memory", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { userId } = req.user!;
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
  if (!title || !body) {
    return res.status(400).json({ error: "title and body required" });
  }
  const importance = parseImportance(req.body?.importance);
  const source = parseSource(req.body?.source);
  const visibility = req.body?.visibility === "private" ? "private" : ("org" as MemoryVisibility);
  const department = typeof req.body?.department === "string" ? req.body.department.slice(0, 128) : undefined;
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.filter((t: unknown) => typeof t === "string").slice(0, 12)
    : [];
  const entry = await insertMemory(pool, {
    userId,
    source,
    importance,
    title: title.slice(0, 500),
    body: body.slice(0, 12000),
    department,
    tags,
    visibility,
    metadata: typeof req.body?.metadata === "object" && req.body.metadata ? req.body.metadata : {},
  });
  return res.json({ entry });
});

app.get("/api/knowledge/constitution", requireAuth, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listConstitution } = await import("./constitution-service.js");
  const entries = await listConstitution(pool);
  return res.json({
    layer: 0,
    userFacingName: "The Siya Way",
    entries,
  });
});

/** Layer 1 — internal: Laws. User/API label: Policies & requirements. */
app.get("/api/policies/requirements", requireAuth, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listLaws } = await import("./law-service.js");
  const { POLICIES_REQUIREMENTS_LABEL } = await import("./law-store.js");
  const policies = await listLaws(pool);
  return res.json({
    layer: 1,
    label: POLICIES_REQUIREMENTS_LABEL,
    policies,
  });
});

app.get("/api/policies/requirements/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getLawById } = await import("./law-service.js");
  const { POLICIES_REQUIREMENTS_LABEL } = await import("./law-store.js");
  const policy = await getLawById(pool, req.params.id);
  if (!policy) return res.status(404).json({ error: "Policy not found" });
  return res.json({ layer: 1, label: POLICIES_REQUIREMENTS_LABEL, policy });
});

app.get("/api/knowledge/decisions", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const limit = Math.min(parseInt(String(req.query.limit ?? "30"), 10) || 30, 50);
  const { listDecisions } = await import("./knowledge-service.js");
  const decisions = await listDecisions(pool, limit);
  return res.json({ decisions });
});

app.get("/api/knowledge/decisions/:id/lineage", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getDecisionLineage } = await import("./knowledge-service.js");
  const lineage = await getDecisionLineage(pool, req.params.id);
  if (!lineage) return res.status(404).json({ error: "Decision not found" });
  return res.json(lineage);
});

app.get("/api/knowledge/decisions/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getDecision, linksForEntity } = await import("./knowledge-service.js");
  const decision = await getDecision(pool, req.params.id);
  if (!decision) return res.status(404).json({ error: "Decision not found" });
  const links = await linksForEntity(pool, decision.id);
  return res.json({ decision, links });
});

app.post("/api/knowledge/decisions", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const decisionText = typeof req.body?.decisionText === "string" ? req.body.decisionText.trim() : "";
  if (!title || !decisionText) {
    return res.status(400).json({ error: "title and decisionText required" });
  }
  const { createDecision } = await import("./knowledge-service.js");
  try {
    const decision = await createDecision(pool, req.user!.userId, {
      title,
      decisionText,
      reason: typeof req.body?.reason === "string" ? req.body.reason : undefined,
      whatChanged: typeof req.body?.whatChanged === "string" ? req.body.whatChanged : undefined,
      actionHook: typeof req.body?.actionHook === "string" ? req.body.actionHook : undefined,
      ownerName: typeof req.body?.ownerName === "string" ? req.body.ownerName : undefined,
      department: typeof req.body?.department === "string" ? req.body.department : undefined,
      decisionDate: typeof req.body?.decisionDate === "string" ? req.body.decisionDate : undefined,
      importance: req.body?.importance,
      confidence: req.body?.confidence,
      status: typeof req.body?.status === "string" ? req.body.status : undefined,
      supersedesId: typeof req.body?.supersedesId === "string" ? req.body.supersedesId : undefined,
      parentConstitutionId:
        typeof req.body?.parentConstitutionId === "string" ? req.body.parentConstitutionId : undefined,
      halfLifeDays:
        req.body?.halfLifeDays === null || req.body?.halfLifeDays === undefined
          ? undefined
          : Number(req.body.halfLifeDays),
      relatedIds: Array.isArray(req.body?.relatedIds)
        ? req.body.relatedIds.filter((x: unknown) => typeof x === "string")
        : undefined,
      evidence: typeof req.body?.evidence === "string" ? req.body.evidence : undefined,
    });
    return res.json({ decision });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create decision";
    return res.status(400).json({ error: msg });
  }
});

app.post("/api/knowledge/links", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const fromId = typeof req.body?.fromId === "string" ? req.body.fromId : "";
  const toId = typeof req.body?.toId === "string" ? req.body.toId : "";
  const relType = typeof req.body?.relType === "string" ? req.body.relType : "relates_to";
  if (!fromId || !toId) return res.status(400).json({ error: "fromId and toId required" });
  const allowed = ["supersedes", "relates_to", "implements", "evidence_for", "owned_by", "derived_from", "grounded_in", "parent_of", "child_of"];
  if (!allowed.includes(relType)) return res.status(400).json({ error: "invalid relType" });
  const { addLink } = await import("./knowledge-service.js");
  const link = await addLink(pool, { fromId, toId, relType: relType as import("./knowledge-store.js").KnowledgeLinkRel });
  return res.json({ link });
});

app.get("/api/admin/training/summary", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const r = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.created_at,
            p.course_version, p.updated_at AS progress_updated_at
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     ORDER BY u.created_at DESC`
  );
  return res.json(r.rows);
});

app.get("/api/admin/team/roster", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const r = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at, u.deactivated_at,
            p.progress_json, p.level_up_json, p.updated_at AS progress_updated_at
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     ORDER BY u.deactivated_at NULLS FIRST, u.created_at DESC`,
  );
  const members = r.rows.map((row) => {
    const training = summarizeTrainingProgress(row.progress_json as Record<string, unknown>);
    const levelUp = summarizeLevelUpProgress(row.level_up_json as Record<string, unknown>);
    const drills = levelUp.lifetimeDrills;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      portalRole: row.role,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at as string).toISOString() : null,
      progressUpdatedAt: row.progress_updated_at,
      training,
      levelUp: {
        ...levelUp,
        chatPracticeSessions: drillCount(drills, ["typing"]),
        usCultureSessions: drillCount(drills, ["map", "timezone", "english"]),
        billingPracticeSessions: drillCount(drills, ["billing"]),
        dailyLearningSessions: drillCount(drills, [
          "trivia",
          "healthterm",
          "compliance",
          "documentation",
        ]),
      },
    };
  });
  return res.json({ members });
});

app.post("/api/admin/users", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { email, password, name, role } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
  };
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and temporary password required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const portalRole = role === "admin" ? "admin" : "trainee";
  const em = email.trim().toLowerCase();
  try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO hipaa_training_users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [em, passwordHash, typeof name === "string" ? name.trim() || null : null, portalRole],
    );
    return res.status(201).json({ user: result.rows[0] });
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (code === "23505") {
      return res.status(400).json({ error: "That email already has an account." });
    }
    console.error("[hipaa-training-api] Admin create user:", err);
    return res.status(500).json({ error: "Could not create user." });
  }
});

app.patch("/api/admin/users/:userId", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const targetId = req.params.userId;
  const { name, role, password } = req.body as {
    name?: string;
    role?: string;
    password?: string;
  };
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (typeof name === "string") {
    sets.push(`name = $${i++}`);
    vals.push(name.trim() || null);
  }
  if (role === "admin" || role === "trainee") {
    sets.push(`role = $${i++}`);
    vals.push(role);
  }
  if (typeof password === "string" && password.length >= 8) {
    sets.push(`password_hash = $${i++}`);
    vals.push(await hashPassword(password));
  }
  if (!sets.length) {
    return res.status(400).json({ error: "No updates provided (name, role, or password)." });
  }
  vals.push(targetId);
  const r = await pool.query(
    `UPDATE hipaa_training_users SET ${sets.join(", ")} WHERE id = $${i}
     RETURNING id, email, name, role, created_at, last_login_at, deactivated_at`,
    vals,
  );
  if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
  return res.json({ user: r.rows[0] });
});

app.get("/api/admin/users/:userId", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const targetId = req.params.userId;
  const r = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at, u.deactivated_at
     FROM hipaa_training_users u WHERE u.id = $1`,
    [targetId],
  );
  if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
  const row = r.rows[0];
  return res.json({
    member: {
      id: row.id,
      email: row.email,
      name: row.name,
      portalRole: row.role,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at as string).toISOString() : null,
      training: {
        workforceRole: "other",
        learnerName: row.name,
        modulesCompleted: 0,
        finalExamReady: false,
        secondsInCourse: 0,
        updatedAt: null,
      },
      levelUp: {
        totalXp: 0,
        streak: 0,
        lastActiveDate: "",
        chatPracticeSessions: 0,
        usCultureSessions: 0,
        billingPracticeSessions: 0,
        dailyLearningSessions: 0,
      },
    },
  });
});

app.delete("/api/admin/users/:userId", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const targetId = req.params.userId;
  if (targetId === req.user!.userId) {
    return res.status(400).json({ error: "You cannot delete your own account." });
  }
  const exists = await pool.query(`SELECT id, email FROM hipaa_training_users WHERE id = $1`, [targetId]);
  if (!exists.rows[0]) return res.status(404).json({ error: "User not found" });
  try {
    await pool.query(`UPDATE siya_tasks SET completed_by = NULL WHERE completed_by = $1`, [targetId]);
  } catch {
    /* task tables may not exist on older DBs */
  }
  try {
    await pool.query(`UPDATE siya_sops SET approved_by = NULL WHERE approved_by = $1`, [targetId]);
  } catch {
    /* knowledge tables optional */
  }
  const del = await pool.query(`DELETE FROM hipaa_training_users WHERE id = $1 RETURNING id, email`, [targetId]);
  if (!del.rows[0]) return res.status(404).json({ error: "User not found" });
  return res.json({ ok: true, deleted: { id: del.rows[0].id, email: del.rows[0].email } });
});

app.get("/api/knowledge/team-assignees", requireAuth, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const r = await pool.query(
    `SELECT id, name, email FROM hipaa_training_users ORDER BY COALESCE(name, email) ASC`,
  );
  return res.json({
    members: r.rows.map((row) => ({
      id: row.id as string,
      name: (row.name as string) ?? null,
      email: row.email as string,
    })),
  });
});

/** Layer 2 — department SOPs (Knowledge). */
app.get("/api/knowledge/sops/context", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getUserRole, listMyLeadDepartments, listDepartmentLeads } = await import("./sop-service.js");
  const { SOP_DEPARTMENTS } = await import("./sop-store.js");
  const userId = req.user!.userId;
  const role = await getUserRole(pool, userId);
  const myLeadSlugs = await listMyLeadDepartments(pool, userId);
  const isAdmin = role === "admin";
  return res.json({
    layer: 2,
    label: "Department SOPs",
    departments: SOP_DEPARTMENTS,
    isAdmin,
    myLeadSlugs,
    departmentLeads: isAdmin ? await listDepartmentLeads(pool) : [],
  });
});

/** Private: departments this user leads (no org-wide roster). */
app.get("/api/knowledge/sops/my-ownership", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listMyLeadDepartments } = await import("./sop-service.js");
  const { slugToDepartment } = await import("./sop-store.js");
  const slugs = await listMyLeadDepartments(pool, req.user!.userId);
  const departments = slugs.map((slug) => slugToDepartment(slug)).filter(Boolean);
  return res.json({ departments });
});

app.get("/api/knowledge/sops/retrieval", requireAuth, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSopsForRetrieval } = await import("./sop-service.js");
  const { sopRetrievalTitle } = await import("./sop-store.js");
  const sops = await listSopsForRetrieval(pool);
  return res.json({
    sops: sops.map((s) => ({
      id: s.id,
      department: s.department,
      title: sopRetrievalTitle(s),
      body: s.body,
      keywords: s.keywords,
      status: s.status,
      ownerName: s.ownerName,
      reviewDate: s.reviewDate,
    })),
  });
});

app.get("/api/knowledge/sops", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getUserRole, listMyLeadDepartments, listSops } = await import("./sop-service.js");
  const userId = req.user!.userId;
  const role = await getUserRole(pool, userId);
  const departmentSlug = typeof req.query.department === "string" ? req.query.department : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const leadSlugs = await listMyLeadDepartments(pool, userId);
  const { sopsForStaffApi, sopForStaffApi, departmentToSlug, slugToDepartment, SOP_DEPARTMENTS } = await import(
    "./sop-store.js"
  );
  let departmentSlugFilter = departmentSlug;
  if (departmentSlug && !slugToDepartment(departmentSlug)) {
    if ((SOP_DEPARTMENTS as readonly string[]).includes(departmentSlug)) {
      departmentSlugFilter = departmentToSlug(departmentSlug);
    }
  }
  if (role !== "admin") {
    if (departmentSlugFilter && !leadSlugs.includes(departmentSlugFilter)) {
      const publicOnly = await listSops(pool, { departmentSlug: departmentSlugFilter, status: status ?? undefined });
      const filtered = publicOnly.filter((s) => s.status !== "draft");
      return res.json({ sops: sopsForStaffApi(filtered) });
    }
    if (!departmentSlugFilter && !leadSlugs.length) {
      const all = await listSops(pool, {});
      return res.json({ sops: sopsForStaffApi(all.filter((s) => s.status !== "draft")) });
    }
    if (departmentSlugFilter && leadSlugs.includes(departmentSlugFilter)) {
      return res.json({
        sops: sopsForStaffApi(await listSops(pool, { departmentSlug: departmentSlugFilter, status })),
      });
    }
    const mine = await Promise.all(leadSlugs.map((slug) => listSops(pool, { departmentSlug: slug, status })));
    return res.json({ sops: sopsForStaffApi(mine.flat()) });
  }
  const sops = await listSops(pool, { departmentSlug: departmentSlugFilter, status });
  return res.json({ sops: sopsForStaffApi(sops) });
});

app.get("/api/knowledge/sops/live-samples", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const department = typeof req.query.department === "string" ? req.query.department : "";
  if (!department) return res.status(400).json({ error: "department required" });
  const { getUserRole, listMyLeadDepartments, listLiveSopStyleSamples } = await import("./sop-service.js");
  const { departmentToSlug, slugToDepartment, SOP_DEPARTMENTS } = await import("./sop-store.js");
  let dept = slugToDepartment(department);
  if (!dept && (SOP_DEPARTMENTS as readonly string[]).includes(department)) {
    dept = department as import("./sop-store.js").SopDepartment;
  }
  if (!dept) return res.status(400).json({ error: "Invalid department" });
  const slug = departmentToSlug(dept);
  const role = await getUserRole(pool, req.user!.userId);
  const leadSlugs = await listMyLeadDepartments(pool, req.user!.userId);
  if (role !== "admin" && !leadSlugs.includes(slug)) {
    return res.status(403).json({ error: "Department lead access required" });
  }
  const samples = await listLiveSopStyleSamples(pool, slug);
  return res.json({ samples });
});

app.get("/api/knowledge/sops/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getSop, getUserRole, listMyLeadDepartments } = await import("./sop-service.js");
  const { sopForStaffApi, departmentToSlug } = await import("./sop-store.js");
  const sop = await getSop(pool, req.params.id);
  if (!sop) return res.status(404).json({ error: "SOP not found" });
  const role = await getUserRole(pool, req.user!.userId);
  if (sop.status === "draft") {
    const slug = departmentToSlug(sop.department);
    const leads = await listMyLeadDepartments(pool, req.user!.userId);
    if (role !== "admin" && !leads.includes(slug)) {
      return res.status(404).json({ error: "SOP not found" });
    }
  }
  return res.json({ sop: sopForStaffApi(sop) });
});

app.post("/api/knowledge/sops", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const department = typeof req.body?.department === "string" ? req.body.department : "";
  if (!title || !department) return res.status(400).json({ error: "title and department required" });
  const { createSop, getUserRole } = await import("./sop-service.js");
  const { sopForStaffApi } = await import("./sop-store.js");
  try {
    const role = await getUserRole(pool, req.user!.userId);
    const sop = await createSop(pool, req.user!.userId, role, {
      department,
      title,
      body: typeof req.body?.body === "string" ? req.body.body : undefined,
      keywords: Array.isArray(req.body?.keywords)
        ? req.body.keywords.filter((k: unknown) => typeof k === "string")
        : undefined,
      reviewDate: typeof req.body?.reviewDate === "string" ? req.body.reviewDate : undefined,
      halfLifeDays: req.body?.halfLifeDays != null ? Number(req.body.halfLifeDays) : undefined,
      aiDrafted: req.body?.aiDrafted === true,
    });
    return res.json({ sop: sopForStaffApi(sop) });
  } catch (e) {
    return res.status(403).json({ error: e instanceof Error ? e.message : "Forbidden" });
  }
});

app.patch("/api/knowledge/sops/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { updateSop, getUserRole } = await import("./sop-service.js");
  const { sopForStaffApi } = await import("./sop-store.js");
  try {
    const role = await getUserRole(pool, req.user!.userId);
    const sop = await updateSop(pool, req.user!.userId, role, req.params.id, {
      title: typeof req.body?.title === "string" ? req.body.title : undefined,
      body: typeof req.body?.body === "string" ? req.body.body : undefined,
      keywords: Array.isArray(req.body?.keywords)
        ? req.body.keywords.filter((k: unknown) => typeof k === "string")
        : undefined,
      reviewDate: typeof req.body?.reviewDate === "string" ? req.body.reviewDate : undefined,
      halfLifeDays: req.body?.halfLifeDays != null ? Number(req.body.halfLifeDays) : undefined,
    });
    return res.json({ sop: sopForStaffApi(sop) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    const code = msg.includes("not found") ? 404 : msg.includes("required") || msg.includes("edited") ? 403 : 400;
    return res.status(code).json({ error: msg });
  }
});

app.post("/api/knowledge/sops/:id/submit", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { submitSopForReview, getUserRole } = await import("./sop-service.js");
  const { sopForStaffApi } = await import("./sop-store.js");
  try {
    const role = await getUserRole(pool, req.user!.userId);
    const sop = await submitSopForReview(pool, req.user!.userId, role, req.params.id);
    return res.json({ sop: sopForStaffApi(sop) });
  } catch (e) {
    return res.status(403).json({ error: e instanceof Error ? e.message : "Submit failed" });
  }
});

app.get("/api/knowledge/sop-tasks", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSopTasks, getUserRole, listMyLeadDepartments } = await import("./sop-service.js");
  const departmentSlug = typeof req.query.department === "string" ? req.query.department : undefined;
  const role = await getUserRole(pool, req.user!.userId);
  const leadSlugs = await listMyLeadDepartments(pool, req.user!.userId);
  if (departmentSlug && role !== "admin" && !leadSlugs.includes(departmentSlug)) {
    return res.status(403).json({ error: "Department lead access required" });
  }
  if (!departmentSlug && role !== "admin" && leadSlugs.length) {
    const batches = await Promise.all(leadSlugs.map((slug) => listSopTasks(pool, slug)));
    return res.json({ tasks: batches.flat() });
  }
  return res.json({ tasks: await listSopTasks(pool, departmentSlug) });
});

app.post("/api/knowledge/sop-tasks", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { createSopTask, getUserRole } = await import("./sop-service.js");
  const taskType = req.body?.taskType;
  if (taskType !== "create_sop" && taskType !== "update_sop") {
    return res.status(400).json({ error: "taskType must be create_sop or update_sop" });
  }
  try {
    const role = await getUserRole(pool, req.user!.userId);
    const task = await createSopTask(pool, req.user!.userId, role, {
      department: typeof req.body?.department === "string" ? req.body.department : "",
      taskType,
      title: typeof req.body?.title === "string" ? req.body.title : "",
      sopId: typeof req.body?.sopId === "string" ? req.body.sopId : undefined,
      assigneeUserId: typeof req.body?.assigneeUserId === "string" ? req.body.assigneeUserId : undefined,
      dueDate: typeof req.body?.dueDate === "string" ? req.body.dueDate : undefined,
    });
    return res.json({ task });
  } catch (e) {
    return res.status(403).json({ error: e instanceof Error ? e.message : "Forbidden" });
  }
});

app.patch("/api/knowledge/sop-tasks/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { patchSopTask, getUserRole } = await import("./sop-service.js");
  try {
    const role = await getUserRole(pool, req.user!.userId);
    const task = await patchSopTask(pool, req.user!.userId, role, req.params.id, {
      assigneeUserId:
        req.body?.assigneeUserId === null
          ? null
          : typeof req.body?.assigneeUserId === "string"
            ? req.body.assigneeUserId
            : undefined,
      dueDate:
        req.body?.dueDate === null ? null : typeof req.body?.dueDate === "string" ? req.body.dueDate : undefined,
      status: req.body?.status === "done" || req.body?.status === "open" ? req.body.status : undefined,
    });
    return res.json({ task });
  } catch (e) {
    return res.status(403).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

app.get("/api/admin/sops/review-queue", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSops } = await import("./sop-service.js");
  const sops = await listSops(pool, { status: "pending_review" });
  return res.json({ sops });
});

app.post("/api/admin/sops/:id/approve", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { approveSop } = await import("./sop-service.js");
  try {
    const sop = await approveSop(pool, req.user!.userId, req.params.id);
    return res.json({ sop });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Approve failed" });
  }
});

app.post("/api/admin/sops/:id/send-back", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  if (!comment) return res.status(400).json({ error: "comment required" });
  const { sendBackSop } = await import("./sop-service.js");
  try {
    const sop = await sendBackSop(pool, req.params.id, comment);
    return res.json({ sop });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Send back failed" });
  }
});

app.get("/api/admin/department-leads", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listDepartmentLeads, syncOpenSopTasksToAllLeads } = await import("./sop-service.js");
  const assigned = await syncOpenSopTasksToAllLeads(pool);
  const leads = await listDepartmentLeads(pool);
  return res.json({ leads, sopTasksAssigned: assigned });
});

app.put("/api/admin/department-leads/:slug", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { setDepartmentLead, listDepartmentLeads } = await import("./sop-service.js");
  const userId =
    req.body?.userId === null || req.body?.userId === ""
      ? null
      : typeof req.body?.userId === "string"
        ? req.body.userId
        : undefined;
  if (userId === undefined) return res.status(400).json({ error: "userId required (or null to clear)" });
  try {
    await setDepartmentLead(pool, req.params.slug, userId);
    const { syncOpenSopTasksToAllLeads } = await import("./sop-service.js");
    const sopTasksAssigned = await syncOpenSopTasksToAllLeads(pool);
    const { maybeSyncKnowledgeWorkToDailyBoard } = await import("./knowledge-sync-throttle.js");
    const { istDateLabel } = await import("./shift-dashboard.js");
    const dailyTasksSynced = await maybeSyncKnowledgeWorkToDailyBoard(pool, istDateLabel(new Date()), {
      force: true,
    });
    const leads = await listDepartmentLeads(pool);
    return res.json({ leads, sopTasksAssigned, dailyTasksSynced });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

function uiActivitySource(role: string): import("./task-activity-events.js").ActivitySource {
  return role === "admin" ? "admin_ui" : "staff_ui";
}

function cronAuthorized(req: express.Request): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.authorization;
  if (header === `Bearer ${secret}`) return true;
  return req.headers["x-cron-secret"] === secret;
}

app.post("/api/cron/generate-daily-tasks", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const date =
    typeof req.query.date === "string" && req.query.date !== "today"
      ? req.query.date
      : undefined;
  const { istDateLabel } = await import("./shift-dashboard.js");
  const opsDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : istDateLabel(new Date());
  const { generateTasksFromTemplates, markOverdueTasks, materializeTasksForDateRange } = await import(
    "./task-service.js"
  );
  await materializeTasksForDateRange(pool, opsDate, opsDate);
  const { created, skipped } = await generateTasksFromTemplates(pool, opsDate);
  const overdue = await markOverdueTasks(pool);
  return res.json({ ok: true, date: opsDate, created, skipped, overdueMarked: overdue });
});

app.get("/api/tasks/me", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const dateParam = typeof req.query.date === "string" ? req.query.date : "today";
  const { getMyTasks, resolveOpsTaskDate } = await import("./task-service.js");
  const date = resolveOpsTaskDate(dateParam);
  const tasks = await getMyTasks(pool, req.user!.userId, date);
  const sop = tasks.filter((t) => t.type === "sop");
  const adhoc = tasks.filter((t) => t.type === "adhoc");
  return res.json({ date, tasks, sop, adhoc });
});

app.get("/api/tasks/board", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getTaskBoard } = await import("./task-service.js");
  const tasks = await getTaskBoard(pool, {
    assigneeId: typeof req.query.assignee === "string" ? req.query.assignee : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    type: typeof req.query.type === "string" ? req.query.type : undefined,
    priority: typeof req.query.priority === "string" ? req.query.priority : undefined,
    from: typeof req.query.from === "string" ? req.query.from : undefined,
    to: typeof req.query.to === "string" ? req.query.to : undefined,
    overdue: req.query.overdue === "1" || req.query.overdue === "true",
  });
  return res.json({ tasks });
});

app.post("/api/tasks", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const role = req.user!.role;
  const assigneeId = typeof req.body?.assigneeId === "string" ? req.body.assigneeId : req.user!.userId;
  if (assigneeId !== req.user!.userId && role !== "admin") {
    return res.status(403).json({ error: "Only admins can assign tasks to others" });
  }
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const dueDate = typeof req.body?.dueDate === "string" ? req.body.dueDate : new Date().toISOString().slice(0, 10);
  if (!title) return res.status(400).json({ error: "title required" });
  const { createAdhocTask } = await import("./task-service.js");
  const { parseTaskPriority } = await import("./task-store.js");
  try {
    const task = await createAdhocTask(
      pool,
      req.user!.userId,
      {
        title,
        description: typeof req.body?.description === "string" ? req.body.description : undefined,
        assigneeId,
        priority: parseTaskPriority(req.body?.priority),
        dueDate,
        dueTime: typeof req.body?.dueTime === "string" ? req.body.dueTime : undefined,
        checklistItems: Array.isArray(req.body?.checklistItems) ? req.body.checklistItems : undefined,
      },
      uiActivitySource(role),
    );
    return res.status(201).json({ task });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.get("/api/tasks/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getTask } = await import("./task-service.js");
  const task = await getTask(pool, req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (req.user!.role !== "admin" && task.assigneeId !== req.user!.userId) {
    return res.status(404).json({ error: "Task not found" });
  }
  return res.json({ task });
});

app.patch("/api/tasks/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { updateTask } = await import("./task-service.js");
  const { parseTaskStatus, parseTaskPriority } = await import("./task-store.js");
  try {
    const task = await updateTask(pool, req.user!.userId, req.user!.role, req.params.id, {
      status: req.body?.status != null ? parseTaskStatus(req.body.status) : undefined,
      assigneeId: typeof req.body?.assigneeId === "string" ? req.body.assigneeId : undefined,
      dueDate: typeof req.body?.dueDate === "string" ? req.body.dueDate : undefined,
      dueTime:
        req.body?.dueTime === null || typeof req.body?.dueTime === "string" ? req.body.dueTime : undefined,
      priority: req.body?.priority != null ? parseTaskPriority(req.body.priority) : undefined,
    }, uiActivitySource(req.user!.role));
    return res.json({ task });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return res.status(msg.includes("admin") || msg.includes("own") ? 403 : 404).json({ error: msg });
  }
});

app.patch("/api/tasks/:id/checklist-item/:itemId", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { toggleChecklistItem } = await import("./task-service.js");
  try {
    const task = await toggleChecklistItem(pool, req.user!.userId, req.user!.role, req.params.id, req.params.itemId, {
      checked: typeof req.body?.checked === "boolean" ? req.body.checked : undefined,
    }, uiActivitySource(req.user!.role));
    return res.json({ task });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return res.status(msg.includes("own") ? 403 : 400).json({ error: msg });
  }
});

app.post("/api/tasks/:id/comments", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "text required" });
  const { addTaskComment } = await import("./task-service.js");
  try {
    const task = await addTaskComment(pool, req.user!.userId, req.user!.role, req.params.id, text);
    return res.json({ task });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Comment failed";
    return res.status(msg.includes("own") ? 403 : 400).json({ error: msg });
  }
});

app.get("/api/admin/sop-templates", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSopTemplates } = await import("./task-service.js");
  return res.json({ templates: await listSopTemplates(pool) });
});

app.post("/api/admin/sop-templates", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { createSopTemplate } = await import("./task-service.js");
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const assignedToUserId = typeof req.body?.assignedToUserId === "string" ? req.body.assignedToUserId : "";
  if (!title || !assignedToUserId) return res.status(400).json({ error: "title and assignedToUserId required" });
  const recurrence = req.body?.recurrence;
  if (recurrence !== "daily" && recurrence !== "weekly" && recurrence !== "monthly" && recurrence !== "custom_cron") {
    return res.status(400).json({ error: "valid recurrence required" });
  }
  try {
    const template = await createSopTemplate(pool, req.user!.userId, {
      title,
      description: typeof req.body?.description === "string" ? req.body.description : undefined,
      recurrence,
      recurrenceConfig: req.body?.recurrenceConfig ?? {},
      checklistItems: Array.isArray(req.body?.checklistItems) ? req.body.checklistItems : [],
      assignedToUserId,
      active: req.body?.active !== false,
    });
    return res.status(201).json({ template });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Create failed" });
  }
});

app.get("/api/admin/sop-templates/:id/preview", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getSopTemplate, nextOccurrenceDates } = await import("./task-service.js");
  const t = await getSopTemplate(pool, req.params.id);
  if (!t) return res.status(404).json({ error: "Template not found" });
  const from = new Date().toISOString().slice(0, 10);
  const dates = nextOccurrenceDates(t.recurrence, t.recurrenceConfig, from, 5);
  return res.json({ dates });
});

app.patch("/api/admin/sop-templates/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { updateSopTemplate } = await import("./task-service.js");
  try {
    const template = await updateSopTemplate(pool, req.params.id, {
      title: typeof req.body?.title === "string" ? req.body.title : undefined,
      description: typeof req.body?.description === "string" ? req.body.description : undefined,
      recurrence: req.body?.recurrence,
      recurrenceConfig: req.body?.recurrenceConfig,
      checklistItems: Array.isArray(req.body?.checklistItems) ? req.body.checklistItems : undefined,
      assignedToUserId: typeof req.body?.assignedToUserId === "string" ? req.body.assignedToUserId : undefined,
      active: typeof req.body?.active === "boolean" ? req.body.active : undefined,
    }, req.user!.userId, "admin_ui");
    return res.json({ template });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

/** AI-assisted operational SOP builder — sessions + checklist feedback */
app.get("/api/sop-builder/access", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { canUseSopBuilder } = await import("./sop-builder-service.js");
  const role = req.user!.role ?? "trainee";
  const canBuild = await canUseSopBuilder(pool, req.user!.userId, role);
  return res.json({ canBuild, isAdmin: role === "admin" });
});

app.get("/api/sop-builder/sessions", requireAuth, requireSopBuilderAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSopBuilderSessionsForUser } = await import("./sop-builder-service.js");
  const sessions = await listSopBuilderSessionsForUser(pool, req.user!.userId);
  return res.json({ sessions });
});

app.get("/api/sop-builder/sessions/:id", requireAuth, requireSopBuilderAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getSopBuilderSession } = await import("./sop-builder-service.js");
  const session = await getSopBuilderSession(pool, req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });
  const role = req.user!.role ?? "trainee";
  if (role !== "admin" && session.userId !== req.user!.userId) {
    return res.status(404).json({ error: "Session not found" });
  }
  return res.json({ session });
});

app.post("/api/sop-builder/sessions", requireAuth, requireSopBuilderAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
  if (!topic) return res.status(400).json({ error: "topic required" });
  const { createSopBuilderSession } = await import("./sop-builder-service.js");
  const sourceMaterialRefs =
    req.body?.sourceMaterialRefs && typeof req.body.sourceMaterialRefs === "object"
      ? req.body.sourceMaterialRefs
      : {};
  const initialTranscript = Array.isArray(req.body?.transcript) ? req.body.transcript : [];
  const session = await createSopBuilderSession(pool, req.user!.userId, topic, sourceMaterialRefs, initialTranscript);
  return res.status(201).json({ session });
});

app.patch("/api/sop-builder/sessions/:id", requireAuth, requireSopBuilderAccess, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getSopBuilderSession, updateSopBuilderSession } = await import("./sop-builder-service.js");
  const existing = await getSopBuilderSession(pool, req.params.id);
  if (!existing) return res.status(404).json({ error: "Session not found" });
  const role = req.user!.role ?? "trainee";
  if (role !== "admin" && existing.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Not your session" });
  }
  const rawStatus = req.body?.status;
  const status =
    rawStatus === "in_progress" || rawStatus === "draft_ready" || rawStatus === "submitted"
      ? rawStatus
      : undefined;
  try {
    const session = await updateSopBuilderSession(pool, req.params.id, {
      transcript: Array.isArray(req.body?.transcript) ? req.body.transcript : undefined,
      draftJson: req.body?.draftJson !== undefined ? req.body.draftJson : undefined,
      status,
      sourceMaterialRefs:
        req.body?.sourceMaterialRefs && typeof req.body.sourceMaterialRefs === "object"
          ? req.body.sourceMaterialRefs
          : undefined,
    });
    return res.json({ session });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Update failed" });
  }
});

app.get("/api/admin/sop-builder/submitted", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSubmittedSopBuilderSessions } = await import("./sop-builder-service.js");
  return res.json({ sessions: await listSubmittedSopBuilderSessions(pool) });
});

app.post("/api/sop-feedback", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const sopTemplateId = typeof req.body?.sopTemplateId === "string" ? req.body.sopTemplateId : "";
  const checklistItemId = typeof req.body?.checklistItemId === "string" ? req.body.checklistItemId : "";
  const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
  if (!sopTemplateId || !checklistItemId) {
    return res.status(400).json({ error: "sopTemplateId and checklistItemId required" });
  }
  const { createSopFeedback } = await import("./sop-builder-service.js");
  try {
    const feedback = await createSopFeedback(pool, req.user!.userId, { sopTemplateId, checklistItemId, note });
    return res.status(201).json({ feedback });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Feedback failed" });
  }
});

app.get("/api/admin/sop-feedback", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listUnresolvedSopFeedback } = await import("./sop-builder-service.js");
  return res.json({ feedback: await listUnresolvedSopFeedback(pool) });
});

app.patch("/api/admin/sop-feedback/:id/resolve", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { resolveSopFeedback } = await import("./sop-builder-service.js");
  const feedback = await resolveSopFeedback(pool, req.params.id, req.user!.userId);
  if (!feedback) return res.status(404).json({ error: "Feedback not found" });
  return res.json({ feedback });
});

app.get(
  "/api/admin/training/progress/:userId",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: express.Response) => {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: "Database not configured." });
    const targetId = req.params.userId;
    const u = await pool.query("SELECT id, email, name, role FROM hipaa_training_users WHERE id = $1", [targetId]);
    if (!u.rows[0]) return res.status(404).json({ error: "User not found" });
    const p = await pool.query(
      "SELECT course_version, progress_json, updated_at FROM hipaa_training_progress WHERE user_id = $1",
      [targetId]
    );
    return res.json({
      user: u.rows[0],
      progress: p.rows[0]?.progress_json ?? null,
      updatedAt: p.rows[0]?.updated_at ?? null,
    });
  }
);

async function start() {
  if (getPool()) {
    try {
      await initDb();
      console.log("[hipaa-training-api] Database initialized");
    } catch (err) {
      console.error("[hipaa-training-api] Database init failed:", err);
    }
  } else {
    console.warn("[hipaa-training-api] DATABASE_URL not set");
  }
  app.listen(PORT, () => {
    console.log(`[hipaa-training-api] http://localhost:${PORT}`);
    console.log(`[hipaa-training-api] ALLOW_REGISTER=${registerAllowed()}`);
  });
}

export default app;

const onVercel = !!process.env.VERCEL;
if (!onVercel) {
  void start();
}
