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
import { getPool, initDb } from "./db.js";
import { hashPassword, comparePassword, signToken } from "./auth.js";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware.js";

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
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));

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
    "SELECT id, email, password_hash, name, role FROM hipaa_training_users WHERE email = $1",
    [email.trim().toLowerCase()]
  );
  const row = result.rows[0];
  if (!row || !(await comparePassword(password, row.password_hash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
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
    "SELECT id, email, name, role, created_at FROM hipaa_training_users WHERE id = $1",
    [userId]
  );
  const row = r.rows[0];
  if (!row) return res.status(401).json({ error: "User not found" });
  return res.json({ id: row.id, email: row.email, name: row.name, role: row.role });
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

void start();
