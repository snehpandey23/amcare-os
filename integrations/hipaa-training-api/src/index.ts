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
import {
  countRecentEmployerInquiries,
  ensureEmployerInquiryTables,
  insertEmployerInquiry,
  listEmployerInquiries,
  markEmployerInquiryEmailSent,
  validateEmployerInquiryInput,
} from "./employer-inquiry-service.js";
import { sendEmployerInquiryEmail } from "./employer-inquiry-email.js";
import {
  countRecentSiyaCircleSignups,
  ensureSiyaCircleSignupTables,
  insertSiyaCircleSignup,
  markSiyaCircleSignupEmailSent,
  validateSiyaCircleSignupInput,
} from "./siya-circle-signup-service.js";
import {
  countRecentWebsiteCallbacks,
  ensureWebsiteCallbackTables,
  insertWebsiteCallback,
  markWebsiteCallbackEmailSent,
  validateWebsiteCallbackInput,
} from "./website-callback-service.js";
import {
  countRecentProviderCareersInquiries,
  ensureProviderCareersTables,
  insertProviderCareersInquiry,
  markProviderCareersEmailSent,
  validateProviderCareersInput,
} from "./provider-careers-service.js";
import {
  sendProviderCareersEmail,
  sendSiyaCircleSignupEmail,
  sendWebsiteCallbackEmail,
} from "./website-leads-email.js";

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
app.use(express.json({ limit: "5mb" }));

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

function clientIp(req: express.Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.trim()) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd[0]) return String(fwd[0]).trim();
  return req.socket?.remoteAddress || null;
}

/** Public — siya.health /employers partnership inquiry (store + email). */
app.post("/api/public/employer-inquiry", async (req: express.Request, res: express.Response) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured." });
  }
  const parsed = validateEmployerInquiryInput(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }
  const ip = clientIp(req);
  const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  try {
    await ensureEmployerInquiryTables(pool);
    const recent = await countRecentEmployerInquiries(pool, { clientIp: ip, email: parsed.data.email });
    if (recent >= 5) {
      return res.status(429).json({ error: "Too many submissions. Please try again later or email care@siya.health." });
    }
    const record = await insertEmployerInquiry(pool, parsed.data, { clientIp: ip, userAgent: ua });
    const emailResult = await sendEmployerInquiryEmail({
      id: record.id,
      companyName: record.companyName,
      contactName: record.contactName,
      email: record.email,
      phone: record.phone,
      employeeCount: record.employeeCount,
      states: record.states,
      message: record.message,
      sourceUrl: record.sourceUrl,
      createdAt: record.createdAt,
    });
    if (emailResult.sent && emailResult.resendId) {
      await markEmployerInquiryEmailSent(pool, record.id, emailResult.resendId);
    }
    return res.status(201).json({
      ok: true,
      id: record.id,
      emailSent: emailResult.sent,
    });
  } catch (err) {
    console.error("[employer-inquiry] submit failed", err);
    return res.status(500).json({ error: "Unable to submit inquiry. Please email care@siya.health." });
  }
});

/** Public — siya.health /siya-circle newsletter signup. */
app.post("/api/public/siya-circle-signup", async (req: express.Request, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const parsed = validateSiyaCircleSignupInput(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const ip = clientIp(req);
  const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  try {
    await ensureSiyaCircleSignupTables(pool);
    const recent = await countRecentSiyaCircleSignups(pool, { clientIp: ip, email: parsed.data.email });
    if (recent >= 5) {
      return res.status(429).json({ error: "Too many submissions. Please try again later." });
    }
    const record = await insertSiyaCircleSignup(pool, parsed.data, { clientIp: ip, userAgent: ua });
    const emailResult = await sendSiyaCircleSignupEmail(record);
    if (emailResult.sent && emailResult.resendId) {
      await markSiyaCircleSignupEmailSent(pool, record.id, emailResult.resendId);
    }
    return res.status(201).json({ ok: true, id: record.id, emailSent: emailResult.sent });
  } catch (err) {
    console.error("[siya-circle-signup] submit failed", err);
    return res.status(500).json({ error: "Unable to submit signup. Please try again later." });
  }
});

/** Public — Siya Guide callback / contact-me requests. */
app.post("/api/public/website-callback", async (req: express.Request, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const parsed = validateWebsiteCallbackInput(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const ip = clientIp(req);
  const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  try {
    await ensureWebsiteCallbackTables(pool);
    const recent = await countRecentWebsiteCallbacks(pool, { clientIp: ip, email: parsed.data.email });
    if (recent >= 5) {
      return res.status(429).json({ error: "Too many submissions. Please try again later or call (215) 445-1244." });
    }
    const record = await insertWebsiteCallback(pool, parsed.data, { clientIp: ip, userAgent: ua });
    const emailResult = await sendWebsiteCallbackEmail({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      message: record.message,
      sourceUrl: record.sourceUrl,
      createdAt: record.createdAt,
    });
    if (emailResult.sent && emailResult.resendId) {
      await markWebsiteCallbackEmailSent(pool, record.id, emailResult.resendId);
    }
    return res.status(201).json({ ok: true, id: record.id, emailSent: emailResult.sent });
  } catch (err) {
    console.error("[website-callback] submit failed", err);
    return res.status(500).json({ error: "Unable to submit request. Please call (215) 445-1244." });
  }
});

/** Public — provider careers inquiry (siya.health /join-our-team). */
app.post("/api/public/provider-careers-inquiry", async (req: express.Request, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const parsed = validateProviderCareersInput(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const ip = clientIp(req);
  const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
  try {
    await ensureProviderCareersTables(pool);
    const recent = await countRecentProviderCareersInquiries(pool, { clientIp: ip, email: parsed.data.email });
    if (recent >= 5) {
      return res.status(429).json({ error: "Too many submissions. Please try again later." });
    }
    const record = await insertProviderCareersInquiry(pool, parsed.data, { clientIp: ip, userAgent: ua });
    const emailResult = await sendProviderCareersEmail(record);
    if (emailResult.sent && emailResult.resendId) {
      await markProviderCareersEmailSent(pool, record.id, emailResult.resendId);
    }
    return res.status(201).json({ ok: true, id: record.id, emailSent: emailResult.sent });
  } catch (err) {
    console.error("[provider-careers] submit failed", err);
    return res.status(500).json({ error: "Unable to submit inquiry. Please email care@siya.health." });
  }
});

app.get("/api/admin/employer-inquiries", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured." });
  }
  const limit = parseInt(String(req.query.limit || "50"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);
  try {
    await ensureEmployerInquiryTables(pool);
    const inquiries = await listEmployerInquiries(pool, { limit, offset });
    return res.json({ inquiries });
  } catch (err) {
    console.error("[employer-inquiry] admin list failed", err);
    return res.status(500).json({ error: "Unable to load inquiries." });
  }
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

/** Per-user clinic letterhead for prescription-generator (one profile per staff user). */
app.get("/api/clinic-profile", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getClinicProfile } = await import("./clinic-profile-service.js");
  const profile = await getClinicProfile(pool, req.user!.userId);
  return res.json({ profile });
});

app.put("/api/clinic-profile", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const body = req.body as Record<string, unknown>;
  try {
    const { upsertClinicProfile } = await import("./clinic-profile-service.js");
    const profile = await upsertClinicProfile(pool, req.user!.userId, {
      clinicName: typeof body.clinicName === "string" ? body.clinicName : undefined,
      doctorName: typeof body.doctorName === "string" ? body.doctorName : undefined,
      degree: typeof body.degree === "string" ? body.degree : undefined,
      regNo: typeof body.regNo === "string" ? body.regNo : undefined,
      clinicContact: typeof body.clinicContact === "string" ? body.clinicContact : undefined,
      clinicAddress: typeof body.clinicAddress === "string" ? body.clinicAddress : undefined,
      logoDataUrl:
        body.logoDataUrl === null
          ? null
          : typeof body.logoDataUrl === "string"
            ? body.logoDataUrl
            : undefined,
      signatureDataUrl:
        body.signatureDataUrl === null
          ? null
          : typeof body.signatureDataUrl === "string"
            ? body.signatureDataUrl
            : undefined,
      clearLogo: body.clearLogo === true,
      clearSignature: body.clearSignature === true,
    });
    return res.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save clinic profile";
    return res.status(400).json({ error: message });
  }
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
app.get("/api/founder-coach/brief", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
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

app.put("/api/founder-coach/monthly", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
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

app.put("/api/founder-coach/weekly", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
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
      prioritiesRaw: typeof req.body?.prioritiesRaw === "string" ? req.body.prioritiesRaw : undefined,
    });
    return res.json({ plan });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Save failed" });
  }
});

app.post("/api/founder-coach/weekly/lock", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = req.user!.userId;
  const u = await pool.query(`SELECT email, role FROM hipaa_training_users WHERE id = $1`, [userId]);
  if (!u.rows[0]) return res.status(401).json({ error: "User not found" });
  const { isExecutiveUser } = await import("./executive-briefing.js");
  if (!isExecutiveUser(u.rows[0].email as string, u.rows[0].role as string)) {
    return res.status(403).json({ error: "Founder only" });
  }
  const { lockWeeklyPlan, istWeekStart } = await import("./founder-coach-service.js");
  try {
    const weekStart = typeof req.body?.weekStart === "string" ? req.body.weekStart : istWeekStart();
    const plan = await lockWeeklyPlan(pool, userId, weekStart);
    return res.json({ plan });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Lock failed" });
  }
});

app.post("/api/founder-coach/weekly/unlock", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = req.user!.userId;
  const u = await pool.query(`SELECT email, role FROM hipaa_training_users WHERE id = $1`, [userId]);
  if (!u.rows[0]) return res.status(401).json({ error: "User not found" });
  const { isExecutiveUser } = await import("./executive-briefing.js");
  if (!isExecutiveUser(u.rows[0].email as string, u.rows[0].role as string)) {
    return res.status(403).json({ error: "Founder only" });
  }
  const { unlockWeeklyPlan, istWeekStart } = await import("./founder-coach-service.js");
  try {
    const weekStart = typeof req.body?.weekStart === "string" ? req.body.weekStart : istWeekStart();
    const plan = await unlockWeeklyPlan(pool, userId, weekStart);
    return res.json({ plan });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unlock failed" });
  }
});

app.put("/api/founder-coach/actuals", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
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

app.post("/api/founder-coach/observe-events", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
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
  const id = typeof req.body?.id === "string" ? req.body.id.slice(0, 80) : undefined;
  const department = typeof req.body?.department === "string" ? req.body.department : "General";
  const task = typeof req.body?.task === "string" ? req.body.task : "Missing approved policy";
  const phiRedacted = req.body?.phiRedacted === true;
  const signalRaw = typeof req.body?.signalType === "string" ? req.body.signalType : "no_match";
  try {
    const { insertAssistGap, newGapId, parseAssistGapSignalType } = await import("./assist-telemetry.js");
    const { gap, route, digestEligible } = await insertAssistGap(pool, {
      id: id || newGapId(),
      department,
      task,
      phiRedacted,
      signalType: parseAssistGapSignalType(signalRaw),
    });
    return res.status(201).json({
      ok: true,
      id: gap.id,
      gap,
      digestEligible,
      route: {
        mode: route.mode,
        departmentSlug: route.departmentSlug,
        departmentLabel: route.departmentLabel,
        reason: route.reason,
        leadName: route.leadName,
      },
    });
  } catch (err) {
    console.error("[assist/gaps]", err);
    return res.status(500).json({ error: "Could not record gap." });
  }
});

app.get("/api/assist/gaps", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { listOpenGapsForViewer } = await import("./assist-telemetry.js");
    const gaps = await listOpenGapsForViewer(pool, {
      userId: req.user!.userId,
      role: req.user!.role || "trainee",
    });
    return res.json({
      gaps,
      honestyNote:
        "Counts reflect Notify owner clicks in Ask — not every unanswered query. Category and task label only; question text is never stored.",
    });
  } catch (err) {
    console.error("[assist/gaps list]", err);
    return res.status(500).json({ error: "Could not list gaps." });
  }
});

app.post("/api/assist/gaps/:id/resolve", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { resolveAssistGap } = await import("./assist-telemetry.js");
    const gap = await resolveAssistGap(pool, {
      id: req.params.id,
      userId: req.user!.userId,
      role: req.user!.role || "trainee",
    });
    return res.json({ gap });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Resolve failed" });
  }
});

app.get("/api/assist/gap-digests/preview", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { istWeekStart } = await import("./ops-coordination-service.js");
    const weekStart =
      typeof req.query.weekStart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.weekStart)
        ? req.query.weekStart
        : istWeekStart();
    const { buildLeadGapDigestPayloads } = await import("./assist-telemetry.js");
    const digests = await buildLeadGapDigestPayloads(pool, weekStart);
    const gaps = digests.flatMap((d) => d.gaps);
    return res.json({
      weekStart,
      digestCount: digests.length,
      totalGaps: gaps.length,
      gaps,
      wouldSend: digests.length > 0,
      emptyReason:
        digests.length === 0
          ? "Empty if there are no open Notify-owner gaps assigned to a non-admin department lead. Leadership/General and admin-as-lead go founder_instant, not the weekly digest."
          : null,
      honestyNote:
        "Category + task label only. Lead emails omitted. Same join the Monday cron uses (excluding already-sent weeks).",
    });
  } catch (err) {
    console.error("[assist/gap-digests preview]", err);
    return res.status(500).json({ error: "Could not preview digests." });
  }
});

app.get("/api/internal/lead-gap-digests", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { istWeekStart } = await import("./ops-coordination-service.js");
  const weekStart =
    typeof req.query.weekStart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.weekStart)
      ? req.query.weekStart
      : istWeekStart();
  const { buildLeadGapDigestPayloads } = await import("./assist-telemetry.js");
  const digests = await buildLeadGapDigestPayloads(pool, weekStart);
  return res.json({
    weekStart,
    digests,
    honestyNote:
      "Open Notify owner gaps only (category + task label). Not a full count of unanswered Ask turns.",
  });
});

app.post("/api/internal/lead-gap-digests/mark-sent", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const weekStart = typeof req.body?.weekStart === "string" ? req.body.weekStart : "";
  const gapCount = typeof req.body?.gapCount === "number" ? req.body.gapCount : 0;
  if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return res.status(400).json({ error: "userId and weekStart required" });
  }
  const { markLeadGapDigestSent } = await import("./assist-telemetry.js");
  await markLeadGapDigestSent(pool, { userId, weekStart, gapCount });
  return res.json({ ok: true });
});

/** Weekday team messages — usage + recipient payload for Mon–Fri Resend cron. */
app.get("/api/internal/weekday-messages", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const {
      istDateString,
      weekdayThemeForDate,
      listWeekdayRecipients,
      ALL_THEMES,
    } = await import("./team-weekday-service.js");
    const sendDate =
      typeof req.query.sendDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.sendDate)
        ? req.query.sendDate
        : istDateString();
    const themeRaw = typeof req.query.theme === "string" ? req.query.theme : "";
    const theme =
      ALL_THEMES.includes(themeRaw as (typeof ALL_THEMES)[number])
        ? (themeRaw as (typeof ALL_THEMES)[number])
        : weekdayThemeForDate(new Date());
    if (!theme) {
      return res.json({ sendDate, theme: null, recipients: [], note: "Weekend — no weekday theme (IST)." });
    }
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const includeAlreadySent = req.query.includeAlreadySent === "1";
    const recipients = await listWeekdayRecipients(pool, {
      sendDate,
      theme,
      userId,
      includeAlreadySent,
    });
    return res.json({
      sendDate,
      theme,
      recipientCount: recipients.length,
      recipients,
      note: "Segments from Ask message turns (14/30d) + level_up_json practice drills.",
    });
  } catch (err) {
    console.error("[internal/weekday-messages]", err);
    return res.status(500).json({ error: "Could not build weekday payload." });
  }
});

app.get("/api/internal/weekday-messages/usage", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  try {
    const { getUserUsageStats } = await import("./team-weekday-service.js");
    let uid = userId;
    if (!uid && email) {
      const r = await pool.query(`SELECT id FROM hipaa_training_users WHERE email = $1`, [email]);
      uid = r.rows[0]?.id as string;
    }
    if (!uid) return res.status(400).json({ error: "userId or email required" });
    const stats = await getUserUsageStats(pool, uid);
    const u = await pool.query(`SELECT email, name FROM hipaa_training_users WHERE id = $1`, [uid]);
    return res.json({
      userId: uid,
      email: u.rows[0]?.email,
      name: u.rows[0]?.name,
      ...stats,
    });
  } catch (err) {
    console.error("[internal/weekday-messages/usage]", err);
    return res.status(500).json({ error: "Could not load usage." });
  }
});

app.post("/api/internal/weekday-messages/mark-sent", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const sendDate = typeof req.body?.sendDate === "string" ? req.body.sendDate : "";
  const theme = typeof req.body?.theme === "string" ? req.body.theme : "";
  const segment = typeof req.body?.segment === "string" ? req.body.segment : "new_ask";
  const resendId = typeof req.body?.resendId === "string" ? req.body.resendId : null;
  if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(sendDate) || !theme) {
    return res.status(400).json({ error: "userId, sendDate, theme required" });
  }
  try {
    const { markWeekdayMessageSent, ALL_THEMES } = await import("./team-weekday-service.js");
    if (!ALL_THEMES.includes(theme as (typeof ALL_THEMES)[number])) {
      return res.status(400).json({ error: "Invalid theme" });
    }
    await markWeekdayMessageSent(pool, {
      userId,
      sendDate,
      theme: theme as (typeof ALL_THEMES)[number],
      segment: segment as "new_ask" | "regular_ask" | "practice_bridge",
      resendId,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[internal/weekday-messages/mark-sent]", err);
    return res.status(500).json({ error: "Could not mark sent." });
  }
});

/** Admin — usage segments + pilot send payload (no CRON_SECRET required). */
app.get("/api/admin/weekday-messages/usage", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  try {
    const { getUserUsageStats } = await import("./team-weekday-service.js");
    let uid = userId;
    if (!uid && email) {
      const r = await pool.query(`SELECT id FROM hipaa_training_users WHERE email = $1`, [email]);
      uid = r.rows[0]?.id as string;
    }
    if (!uid) return res.status(400).json({ error: "userId or email required" });
    const stats = await getUserUsageStats(pool, uid);
    const u = await pool.query(`SELECT email, name FROM hipaa_training_users WHERE id = $1`, [uid]);
    return res.json({ userId: uid, email: u.rows[0]?.email, name: u.rows[0]?.name, ...stats });
  } catch (err) {
    console.error("[admin/weekday-messages/usage]", err);
    return res.status(500).json({ error: "Could not load usage." });
  }
});

app.get("/api/admin/weekday-messages/recipients", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const {
      istDateString,
      weekdayThemeForDate,
      listWeekdayRecipients,
      ALL_THEMES,
    } = await import("./team-weekday-service.js");
    const sendDate =
      typeof req.query.sendDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.sendDate)
        ? req.query.sendDate
        : istDateString();
    const themeRaw = typeof req.query.theme === "string" ? req.query.theme : "";
    const theme =
      ALL_THEMES.includes(themeRaw as (typeof ALL_THEMES)[number])
        ? (themeRaw as (typeof ALL_THEMES)[number])
        : weekdayThemeForDate(new Date());
    if (!theme) return res.json({ sendDate, theme: null, recipients: [] });
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const includeAlreadySent = req.query.includeAlreadySent === "1";
    const recipients = await listWeekdayRecipients(pool, {
      sendDate,
      theme,
      userId,
      includeAlreadySent,
    });
    return res.json({ sendDate, theme, recipients });
  } catch (err) {
    console.error("[admin/weekday-messages/recipients]", err);
    return res.status(500).json({ error: "Could not list recipients." });
  }
});

app.post("/api/admin/weekday-messages/mark-sent", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const sendDate = typeof req.body?.sendDate === "string" ? req.body.sendDate : "";
  const theme = typeof req.body?.theme === "string" ? req.body.theme : "";
  const segment = typeof req.body?.segment === "string" ? req.body.segment : "new_ask";
  const resendId = typeof req.body?.resendId === "string" ? req.body.resendId : null;
  if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(sendDate) || !theme) {
    return res.status(400).json({ error: "userId, sendDate, theme required" });
  }
  try {
    const { markWeekdayMessageSent, ALL_THEMES } = await import("./team-weekday-service.js");
    if (!ALL_THEMES.includes(theme as (typeof ALL_THEMES)[number])) {
      return res.status(400).json({ error: "Invalid theme" });
    }
    await markWeekdayMessageSent(pool, {
      userId,
      sendDate,
      theme: theme as (typeof ALL_THEMES)[number],
      segment: segment as "new_ask" | "regular_ask" | "practice_bridge",
      resendId,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[admin/weekday-messages/mark-sent]", err);
    return res.status(500).json({ error: "Could not mark sent." });
  }
});

app.post("/api/assist/feedback", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const helpful = req.body?.helpful === true;
  const failureType = typeof req.body?.failureType === "string" ? req.body.failureType : undefined;
  const department = typeof req.body?.department === "string" ? req.body.department : undefined;
  const knowledgeGap = req.body?.knowledgeGap === true;
  const threadId = typeof req.body?.threadId === "string" ? req.body.threadId : undefined;
  const taskLabel = typeof req.body?.taskLabel === "string" ? req.body.taskLabel : undefined;
  try {
    const { insertAssistFeedback, insertAssistGap, newGapId } = await import("./assist-telemetry.js");
    await insertAssistFeedback(pool, {
      helpful,
      failureType,
      department,
      knowledgeGap,
      threadId,
      taskLabel,
    });
    // Thumbs-down also lands in aggregate gap table (distinct from no_match).
    if (!helpful) {
      const task =
        (taskLabel && taskLabel.trim()) ||
        (failureType ? `Thumbs-down: ${failureType}` : "Thumbs-down: unhelpful answer");
      await insertAssistGap(pool, {
        id: newGapId(),
        department: department || "General",
        task,
        phiRedacted: true,
        signalType: "thumbs_down",
      });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("[assist/feedback]", err);
    return res.status(500).json({ error: "Could not record feedback." });
  }
});

/** Assist v2 — per-user chat threads */
app.get("/api/assist/threads", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const { listAssistThreads } = await import("./assist-chat-service.js");
  return res.json({ threads: await listAssistThreads(pool, req.user!.userId, { q }) });
});

app.post("/api/assist/threads", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const title = typeof req.body?.title === "string" ? req.body.title : undefined;
  const { createAssistThread } = await import("./assist-chat-service.js");
  const thread = await createAssistThread(pool, req.user!.userId, title);
  return res.status(201).json({ thread });
});

app.get("/api/assist/threads/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getAssistThread, listAssistMessages } = await import("./assist-chat-service.js");
  const thread = await getAssistThread(pool, req.user!.userId, req.params.id);
  if (!thread) return res.status(404).json({ error: "Thread not found" });
  const messages = await listAssistMessages(pool, req.user!.userId, req.params.id);
  return res.json({ thread, messages });
});

app.patch("/api/assist/threads/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const title = typeof req.body?.title === "string" ? req.body.title : "";
  const { renameAssistThread } = await import("./assist-chat-service.js");
  const thread = await renameAssistThread(pool, req.user!.userId, req.params.id, title);
  if (!thread) return res.status(404).json({ error: "Thread not found" });
  return res.json({ thread });
});

app.post("/api/assist/threads/:id/archive", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { archiveAssistThread } = await import("./assist-chat-service.js");
  const ok = await archiveAssistThread(pool, req.user!.userId, req.params.id);
  if (!ok) return res.status(404).json({ error: "Thread not found" });
  return res.json({ ok: true });
});

app.get("/api/assist/threads/:id/history", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const limit = req.query.limit != null ? Number(req.query.limit) : 24;
  const { listAssistHistoryForLlm, getAssistThread } = await import("./assist-chat-service.js");
  const thread = await getAssistThread(pool, req.user!.userId, req.params.id);
  if (!thread) return res.status(404).json({ error: "Thread not found" });
  const history = await listAssistHistoryForLlm(pool, req.user!.userId, req.params.id, limit);
  return res.json({ history });
});

app.post("/api/assist/threads/:id/messages", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const role = req.body?.role === "assistant" ? "assistant" : req.body?.role === "user" ? "user" : null;
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  if (!role || !content.trim()) return res.status(400).json({ error: "role and content required" });
  const { appendAssistMessage } = await import("./assist-chat-service.js");
  const message = await appendAssistMessage(pool, req.user!.userId, req.params.id, role, content, req.body?.meta);
  if (!message) return res.status(404).json({ error: "Thread not found" });
  return res.status(201).json({ message });
});

app.post("/api/assist/threads/:id/turns", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const userContent = typeof req.body?.userContent === "string" ? req.body.userContent : "";
  const assistantContent = typeof req.body?.assistantContent === "string" ? req.body.assistantContent : "";
  if (!userContent.trim() || !assistantContent.trim()) {
    return res.status(400).json({ error: "userContent and assistantContent required" });
  }
  const { appendAssistTurn } = await import("./assist-chat-service.js");
  const turn = await appendAssistTurn(
    pool,
    req.user!.userId,
    req.params.id,
    userContent,
    assistantContent,
    typeof req.body?.meta === "object" && req.body.meta ? req.body.meta : undefined,
  );
  if (!turn) return res.status(404).json({ error: "Thread not found" });
  return res.status(201).json(turn);
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

/** Weekly lead check-ins — Marketing / Clinical Operations / Compliance (Team feed). */
app.get("/api/weekly-checkins/access", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { weeklyCheckInAccess } = await import("./ops-coordination-service.js");
  const access = await weeklyCheckInAccess(pool, req.user!.userId, req.user!.role ?? "trainee");
  return res.json(access);
});

app.get("/api/weekly-checkins", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listWeeklyLeadCheckIns } = await import("./ops-coordination-service.js");
  const week = typeof req.query.week === "string" ? req.query.week : "current";
  const checkins = await listWeeklyLeadCheckIns(pool, week);
  return res.json({ checkins, week });
});

/**
 * Ops dashboard — Section A (staff engagement, admin) + Section B (lead responsiveness).
 * Reuses existing tables only. Leads see their own Section B row; admins see all.
 */
app.get("/api/ops/dashboard", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { buildOpsDashboard } = await import("./ops-dashboard-service.js");
    const data = await buildOpsDashboard(pool, {
      viewerUserId: req.user!.userId,
      viewerRole: req.user!.role ?? "trainee",
    });
    return res.json(data);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Ops dashboard is for admins and department leads." });
    }
    console.error("[ops/dashboard]", e);
    return res.status(500).json({ error: "Could not load ops dashboard." });
  }
});

/**
 * Scheduled vs actual presence — same payload shape for ops (admin/all) and My day (self).
 * GET /api/shift-roster/planned?date=YYYY-MM-DD&scope=me|team
 */
app.get("/api/shift-roster/planned", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { buildScheduledVsActual, istDateString } = await import("./shift-roster-service.js");
    const rosterDate =
      typeof req.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
        ? req.query.date
        : istDateString();
    const scope = typeof req.query.scope === "string" ? req.query.scope : "me";
    const role = req.user!.role ?? "trainee";
    if (scope === "team") {
      if (role !== "admin") {
        return res.status(403).json({ error: "Team planned view is admin-only." });
      }
      const rows = await buildScheduledVsActual(pool, { rosterDate });
      return res.json({ rosterDate, scope: "team", rows });
    }
    const rows = await buildScheduledVsActual(pool, {
      rosterDate,
      userId: req.user!.userId,
    });
    return res.json({ rosterDate, scope: "me", rows });
  } catch (e) {
    console.error("[shift-roster/planned]", e);
    return res.status(500).json({ error: "Could not load planned vs actual." });
  }
});

/**
 * Signed-in user's imported MA schedule — deterministic list for Ask "my shifts".
 * GET /api/shift-roster/me?from=YYYY-MM-DD&to=YYYY-MM-DD
 * GET /api/shift-roster/me?month=9&year=2026  (month 1–12 or name)
 */
app.get("/api/shift-roster/me", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { listRosterForUserRange, monthEndDate, istDateString } = await import(
      "./shift-roster-service.js"
    );
    let fromDate: string | null =
      typeof req.query.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.from)
        ? req.query.from
        : null;
    let toDate: string | null =
      typeof req.query.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.to)
        ? req.query.to
        : null;

    if (!fromDate || !toDate) {
      const monthRaw = typeof req.query.month === "string" ? req.query.month.trim().toLowerCase() : "";
      const yearRaw = typeof req.query.year === "string" ? req.query.year.trim() : "";
      const monthNames: Record<string, number> = {
        january: 1,
        jan: 1,
        february: 2,
        feb: 2,
        march: 3,
        mar: 3,
        april: 4,
        apr: 4,
        may: 5,
        june: 6,
        jun: 6,
        july: 7,
        jul: 7,
        august: 8,
        aug: 8,
        september: 9,
        sep: 9,
        sept: 9,
        october: 10,
        oct: 10,
        november: 11,
        nov: 11,
        december: 12,
        dec: 12,
      };
      let monthNum = /^\d{1,2}$/.test(monthRaw) ? Number(monthRaw) : monthNames[monthRaw];
      if (!monthNum || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: "from/to (YYYY-MM-DD) or month (+ optional year) required" });
      }
      const yearNum = /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : Number(istDateString().slice(0, 4));
      fromDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
      toDate = monthEndDate(yearNum, monthNum);
    }

    const rows = await listRosterForUserRange(pool, req.user!.userId, fromDate, toDate);
    return res.json({
      from: fromDate,
      to: toDate,
      count: rows.length,
      rows,
      timezone: "Asia/Kolkata",
      source: "shift_roster",
    });
  } catch (e) {
    console.error("[shift-roster/me]", e);
    return res.status(500).json({ error: "Could not load your schedule." });
  }
});

/** Soft check: assignee scheduled OFF on due date (task assign warning). */
app.get("/api/shift-roster/assignment-check", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const assigneeId = typeof req.query.assigneeId === "string" ? req.query.assigneeId : "";
  const date =
    typeof req.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : null;
  if (!assigneeId || !date) {
    return res.status(400).json({ error: "assigneeId and date (YYYY-MM-DD) required" });
  }
  const role = req.user!.role ?? "trainee";
  if (role !== "admin" && assigneeId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { isUserScheduledOff } = await import("./shift-roster-service.js");
    const result = await isUserScheduledOff(pool, assigneeId, date);
    return res.json({
      assigneeId,
      date,
      scheduledOff: result.scheduledOff,
      rawCells: result.rawCells,
      warning: result.scheduledOff
        ? `This person is scheduled OFF on ${date} (roster: ${result.rawCells.join("; ") || "OFF"}). You can still assign — soft warning only.`
        : null,
    });
  } catch (e) {
    console.error("[shift-roster/assignment-check]", e);
    return res.status(500).json({ error: "Check failed" });
  }
});

/** Internal cron: shift-start reminder candidates + mark-sent. */
app.get("/api/internal/shift-roster-reminders", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { listShiftReminderCandidates, reminderSendBucket } = await import("./shift-roster-service.js");
    const candidates = await listShiftReminderCandidates(pool);
    return res.json({
      at: new Date().toISOString(),
      candidates: candidates.map((c) => ({
        ...c,
        sendBucket: c.shiftStart ? reminderSendBucket(c.shiftStart) : null,
      })),
    });
  } catch (e) {
    console.error("[internal/shift-roster-reminders]", e);
    return res.status(500).json({ error: "Failed" });
  }
});

app.post("/api/internal/shift-roster-reminders/mark-sent", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const rosterRowId = typeof req.body?.rosterRowId === "string" ? req.body.rosterRowId : "";
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const sendBucket = typeof req.body?.sendBucket === "string" ? req.body.sendBucket : "";
  const resendId = typeof req.body?.resendId === "string" ? req.body.resendId : null;
  if (!rosterRowId || !userId || !sendBucket) {
    return res.status(400).json({ error: "rosterRowId, userId, sendBucket required" });
  }
  const { markShiftReminderSent } = await import("./shift-roster-service.js");
  await markShiftReminderSent(pool, { rosterRowId, userId, sendBucket, resendId });
  return res.json({ ok: true });
});

app.post("/api/weekly-checkins", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { createWeeklyLeadCheckIn } = await import("./ops-coordination-service.js");
    const checkin = await createWeeklyLeadCheckIn(pool, req.user!.userId, req.user!.role ?? "trainee", {
      department: typeof req.body?.department === "string" ? req.body.department : "",
      weekStart: typeof req.body?.weekStart === "string" ? req.body.weekStart : undefined,
      whatChanged: typeof req.body?.whatChanged === "string" ? req.body.whatChanged : "",
      keyNumbersStatus: typeof req.body?.keyNumbersStatus === "string" ? req.body.keyNumbersStatus : "",
      blockers: typeof req.body?.blockers === "string" ? req.body.blockers : "",
      founderShouldKnow: typeof req.body?.founderShouldKnow === "string" ? req.body.founderShouldKnow : "",
    });
    return res.status(201).json({ checkin });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Could not save check-in" });
  }
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
  const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 80);
  const { listDecisions } = await import("./knowledge-service.js");
  const decisions = await listDecisions(pool, limit);
  return res.json({ decisions });
});

/** Lean decision log for Ask Layer 2 (same pattern as /api/knowledge/sops/retrieval). */
app.get("/api/knowledge/decisions/retrieval", requireAuth, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { ensureKnowledgeTables, listDecisionsForRetrieval, syncMarkdownDecisionsSeed } = await import(
    "./knowledge-service.js"
  );
  await ensureKnowledgeTables(pool);
  await syncMarkdownDecisionsSeed(pool);
  const decisions = await listDecisionsForRetrieval(pool);
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
  const { createDecision, ensureKnowledgeTables } = await import("./knowledge-service.js");
  try {
    await ensureKnowledgeTables(pool);
    const decision = await createDecision(pool, req.user!.userId, {
      id: typeof req.body?.id === "string" ? req.body.id.trim() : undefined,
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

/** Feedback Friday — peer/lead notes with per-submission anonymity. */
app.get("/api/team-feedback/directory", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { listFeedbackDirectory } = await import("./team-feedback-service.js");
    const dir = await listFeedbackDirectory(pool, req.user!.userId);
    return res.json(dir);
  } catch (err) {
    console.error("[team-feedback directory]", err);
    return res.status(500).json({ error: "Could not load directory." });
  }
});

app.get("/api/team-feedback/inbox", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  try {
    const { listInboxForRecipient } = await import("./team-feedback-service.js");
    const items = await listInboxForRecipient(pool, req.user!.userId);
    return res.json({
      items,
      note: "Anonymous notes show no name, email, or team of the giver.",
    });
  } catch (err) {
    console.error("[team-feedback inbox]", err);
    return res.status(500).json({ error: "Could not load inbox." });
  }
});

app.post("/api/team-feedback", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const recipientUserId = typeof req.body?.recipientUserId === "string" ? req.body.recipientUserId : "";
  const body = typeof req.body?.body === "string" ? req.body.body : "";
  const targetKind = req.body?.targetKind === "lead" ? "lead" : "peer";
  const anonymous = req.body?.anonymous === true;
  try {
    const { submitTeamFeedback } = await import("./team-feedback-service.js");
    const result = await submitTeamFeedback(pool, {
      giverUserId: req.user!.userId,
      recipientUserId,
      targetKind,
      body,
      anonymous,
    });
    if (!result.ok) {
      return res.status(400).json({ error: result.reason, status: result.status });
    }
    return res.status(201).json({
      ok: true,
      status: result.status,
      /** Exact payload the recipient will see — never includes giver id when anonymous. */
      recipientFacing: result.feedback,
    });
  } catch (err) {
    console.error("[team-feedback submit]", err);
    return res.status(500).json({ error: "Could not send feedback." });
  }
});

/**
 * Abuse investigation only — includes giver identity.
 * Not used by recipient inbox or normal admin “view their feedback” UIs.
 */
app.get(
  "/api/admin/team-feedback/moderation/:id",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: express.Response) => {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: "Database not configured." });
    try {
      const { getFeedbackForModeration } = await import("./team-feedback-service.js");
      const row = await getFeedbackForModeration(pool, req.params.id);
      if (!row) return res.status(404).json({ error: "Not found" });
      return res.json({
        investigation: row,
        warning: "Abuse-investigation path only. Do not surface giver identity in recipient UIs.",
      });
    } catch (err) {
      console.error("[team-feedback moderation]", err);
      return res.status(500).json({ error: "Could not load moderation record." });
    }
  },
);

/** Layer 2 — department SOPs (Knowledge). */
app.get("/api/knowledge/sops/context", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getUserRole, listMyLeadDepartments, listDepartmentLeads, resolveSopApprovalRoute } = await import(
    "./sop-service.js"
  );
  const { SOP_DEPARTMENTS, departmentToSlug } = await import("./sop-store.js");
  const userId = req.user!.userId;
  const role = await getUserRole(pool, userId);
  const myLeadSlugs = await listMyLeadDepartments(pool, userId);
  const isAdmin = role === "admin";
  const departmentLeads = await listDepartmentLeads(pool);
  const approvalRoutes = [];
  for (const dept of SOP_DEPARTMENTS) {
    const route = await resolveSopApprovalRoute(pool, departmentToSlug(dept));
    approvalRoutes.push({
      department: dept,
      departmentSlug: route.departmentSlug,
      approvalMode: route.mode,
      reason: route.reason,
      reviewerLabel:
        route.mode === "lead_self"
          ? route.leadName
            ? `Department lead: ${route.leadName}${route.leadEmail ? ` (${route.leadEmail})` : ""}`
            : "Department lead (assigned)"
          : route.reason === "cross_cutting_department"
            ? "Founder / admin review queue (Leadership & General)"
            : route.reason === "lead_is_founder_admin"
              ? "Founder / admin review queue (lead is an admin)"
              : "Founder / admin review queue (no department lead assigned)",
      leadName: route.leadName,
      leadEmail: route.leadEmail,
    });
  }
  return res.json({
    layer: 2,
    label: "Department SOPs",
    departments: SOP_DEPARTMENTS,
    isAdmin,
    myLeadSlugs,
    departmentLeads,
    approvalRoutes,
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
  const { listSops } = await import("./sop-service.js");
  const departmentSlug = typeof req.query.department === "string" ? req.query.department : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const { sopsForStaffApi, departmentToSlug, slugToDepartment, SOP_DEPARTMENTS } = await import("./sop-store.js");
  let departmentSlugFilter = departmentSlug;
  if (departmentSlug && !slugToDepartment(departmentSlug)) {
    if ((SOP_DEPARTMENTS as readonly string[]).includes(departmentSlug)) {
      departmentSlugFilter = departmentToSlug(departmentSlug);
    }
  }
  // Temporary: all signed-in staff see the full department SOP library (including drafts).
  const sops = await listSops(pool, { departmentSlug: departmentSlugFilter, status });
  return res.json({ sops: sopsForStaffApi(sops) });
});

app.get("/api/knowledge/sops/live-samples", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const department = typeof req.query.department === "string" ? req.query.department : "";
  if (!department) return res.status(400).json({ error: "department required" });
  const { listLiveSopStyleSamples } = await import("./sop-service.js");
  const { departmentToSlug, slugToDepartment, SOP_DEPARTMENTS } = await import("./sop-store.js");
  let dept = slugToDepartment(department);
  if (!dept && (SOP_DEPARTMENTS as readonly string[]).includes(department)) {
    dept = department as import("./sop-store.js").SopDepartment;
  }
  if (!dept) return res.status(400).json({ error: "Invalid department" });
  const slug = departmentToSlug(dept);
  const samples = await listLiveSopStyleSamples(pool, slug);
  return res.json({ samples });
});

app.get("/api/knowledge/sops/:id", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { getSop } = await import("./sop-service.js");
  const { sopForStaffApi } = await import("./sop-store.js");
  const sop = await getSop(pool, req.params.id);
  if (!sop) return res.status(404).json({ error: "SOP not found" });
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
  const { submitSopForReview, getUserRole, buildSopReviewNotifyMeta } = await import("./sop-service.js");
  const { sopForStaffApi } = await import("./sop-store.js");
  try {
    const role = await getUserRole(pool, req.user!.userId);
    const sop = await submitSopForReview(pool, req.user!.userId, role, req.params.id);
    const notify = await buildSopReviewNotifyMeta(pool, sop);
    return res.json({ sop: sopForStaffApi(sop), notify });
  } catch (e) {
    return res.status(403).json({ error: e instanceof Error ? e.message : "Submit failed" });
  }
});

app.get("/api/knowledge/sop-tasks", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSopTasks } = await import("./sop-service.js");
  const departmentSlug = typeof req.query.department === "string" ? req.query.department : undefined;
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

app.get("/api/admin/sops/review-queue", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listSopReviewQueueForViewer } = await import("./sop-service.js");
  const sops = await listSopReviewQueueForViewer(pool, {
    userId: req.user!.userId,
    role: req.user!.role || "trainee",
  });
  return res.json({ sops });
});

app.post("/api/admin/sops/:id/approve", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { approveSop, buildSopReviewNotifyMeta } = await import("./sop-service.js");
  try {
    const sop = await approveSop(pool, req.user!.userId, req.params.id);
    const notify = await buildSopReviewNotifyMeta(pool, sop);
    return res.json({ sop, notify });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Approve failed";
    const status = msg.includes("Not authorized") ? 403 : 400;
    return res.status(status).json({ error: msg });
  }
});

app.post("/api/admin/sops/:id/send-back", requireAuth, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  if (!comment) return res.status(400).json({ error: "comment required" });
  const { sendBackSop, buildSopReviewNotifyMeta } = await import("./sop-service.js");
  try {
    const sop = await sendBackSop(pool, {
      id: req.params.id,
      comment,
      userId: req.user!.userId,
      role: req.user!.role || "trainee",
    });
    const notify = await buildSopReviewNotifyMeta(pool, sop);
    return res.json({ sop, notify });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Send back failed";
    const status = msg.includes("Not authorized") ? 403 : 400;
    return res.status(status).json({ error: msg });
  }
});

app.get("/api/admin/department-leads/approval-map", requireAuth, requireAdmin, async (_req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listDepartmentLeads, resolveSopApprovalRoute } = await import("./sop-service.js");
  const { SOP_DEPARTMENTS, departmentToSlug } = await import("./sop-store.js");
  const leads = await listDepartmentLeads(pool);
  const map = [];
  for (const dept of SOP_DEPARTMENTS) {
    const route = await resolveSopApprovalRoute(pool, departmentToSlug(dept));
    const lead = leads.find((l) => l.departmentSlug === route.departmentSlug);
    map.push({
      department: dept,
      departmentSlug: route.departmentSlug,
      approvalMode: route.mode,
      reason: route.reason,
      leadUserId: route.leadUserId,
      leadName: route.leadName,
      leadEmail: route.leadEmail,
      assignedLeadName: lead?.userName ?? null,
    });
  }
  return res.json({ map });
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

/** Re-run decision seeds + report store counts (CRON_SECRET). */
app.post("/api/cron/seed-decisions", async (req, res) => {
  if (!cronAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const {
    ensureKnowledgeTables,
    syncMarkdownDecisionsSeed,
    syncJsonDecisionsSeed,
    listDecisions,
  } = await import("./knowledge-service.js");
  await ensureKnowledgeTables(pool);
  const markdown = await syncMarkdownDecisionsSeed(pool);
  const json = await syncJsonDecisionsSeed(pool);
  const decisions = await listDecisions(pool, 80);
  const ids = new Set(decisions.map((d) => d.id));
  return res.json({
    ok: true,
    total: decisions.length,
    markdown,
    json,
    requiredPresent: {
      homepageCta: ids.has("homepage-cta-meet-and-greet"),
      marketingOsFrozen: ids.has("marketing-os-v1-frozen"),
      agentOrgDeferred: ids.has("agent-org-chart-deferred"),
      chatReviewAdminOnly: ids.has("chat-review-admin-clinical-lead-only"),
      marketingBiggerSystems: ids.has("marketing-bigger-systems-paused"),
    },
  });
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
    let assignmentWarning: string | null = null;
    try {
      const { isUserScheduledOff } = await import("./shift-roster-service.js");
      const off = await isUserScheduledOff(pool, assigneeId, dueDate);
      if (off.scheduledOff) {
        assignmentWarning = `Assignee is scheduled OFF on ${dueDate} (roster: ${off.rawCells.join("; ") || "OFF"}). Assignment still created — soft warning only.`;
      }
    } catch {
      /* roster optional */
    }
    return res.status(201).json({ task, assignmentWarning });
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
    let assignmentWarning: string | null = null;
    if (typeof req.body?.assigneeId === "string" || typeof req.body?.dueDate === "string") {
      try {
        const { isUserScheduledOff } = await import("./shift-roster-service.js");
        const off = await isUserScheduledOff(pool, task.assigneeId, task.dueDate);
        if (off.scheduledOff) {
          assignmentWarning = `Assignee is scheduled OFF on ${task.dueDate} (roster: ${off.rawCells.join("; ") || "OFF"}). Update saved — soft warning only.`;
        }
      } catch {
        /* optional */
      }
    }
    return res.json({ task, assignmentWarning });
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
  const { getUserContact, listActiveAdminContacts } = await import("./sop-service.js");
  const existing = await getSopBuilderSession(pool, req.params.id);
  if (!existing) return res.status(404).json({ error: "Session not found" });
  const role = req.user!.role ?? "trainee";
  if (role !== "admin" && existing.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Not your session" });
  }
  const rawStatus = req.body?.status;
  const status =
    rawStatus === "in_progress" ||
    rawStatus === "draft_ready" ||
    rawStatus === "submitted" ||
    rawStatus === "published"
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
    if (!session) return res.status(404).json({ error: "Session not found" });
    let notify:
      | {
          kind: "builder_submitted" | "builder_published";
          ownerEmail: string | null;
          ownerName: string | null;
          adminEmails: string[];
          title: string;
        }
      | undefined;
    if (status === "submitted" && existing.status !== "submitted") {
      const owner = await getUserContact(pool, session.userId);
      const admins = await listActiveAdminContacts(pool);
      notify = {
        kind: "builder_submitted",
        ownerEmail: owner?.email ?? null,
        ownerName: owner?.name ?? null,
        adminEmails: admins.map((a) => a.email),
        title: session.draftJson?.title || session.topic,
      };
    } else if (status === "published" && existing.status !== "published") {
      const owner = await getUserContact(pool, session.userId);
      const admins = await listActiveAdminContacts(pool);
      notify = {
        kind: "builder_published",
        ownerEmail: owner?.email ?? null,
        ownerName: owner?.name ?? null,
        adminEmails: admins.map((a) => a.email),
        title: session.draftJson?.title || session.topic,
      };
    }
    return res.json({ session, notify });
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

app.get("/api/admin/sop-builder/sessions", requireAuth, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const { listAdminSopBuilderSessions } = await import("./sop-builder-service.js");
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  return res.json({ sessions: await listAdminSopBuilderSessions(pool, { q }) });
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
