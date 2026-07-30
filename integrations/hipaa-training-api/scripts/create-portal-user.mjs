#!/usr/bin/env node
/**
 * Create an employee portal user (invite-only deployments).
 * Usage: node scripts/create-portal-user.mjs email password "Full Name" [trainee|admin]
 * Requires DATABASE_URL in env or .env (dotenv loaded from cwd).
 */
import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const [email, password, name, roleArg] = process.argv.slice(2);
const role = roleArg === "admin" ? "admin" : "trainee";

if (!email || !password) {
  console.error("Usage: node scripts/create-portal-user.mjs email password \"Full Name\" [admin|trainee]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL.");
  process.exit(1);
}

const em = email.trim().toLowerCase();
const hash = await bcrypt.hash(password, 12);
const pool = new pg.Pool({ connectionString: url });

try {
  const r = await pool.query(
    `INSERT INTO hipaa_training_users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = COALESCE(EXCLUDED.name, hipaa_training_users.name),
       role = EXCLUDED.role
     RETURNING id, email, name, role`,
    [em, hash, name?.trim() || null, role],
  );
  console.log("User ready:", r.rows[0]);
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await pool.end();
}
