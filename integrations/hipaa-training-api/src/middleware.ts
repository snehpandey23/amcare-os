/**
 * JWT auth middleware.
 */

import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "./auth.js";
import { getPool } from "./db.js";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const pool = getPool();
  if (!pool) {
    req.user = payload;
    next();
    return;
  }

  void pool
    .query(`SELECT role, deactivated_at FROM hipaa_training_users WHERE id = $1`, [payload.userId])
    .then((r) => {
      if (!r.rows[0]) {
        res.status(401).json({ error: "Account not found" });
        return;
      }
      const row = r.rows[0] as { role: string; deactivated_at: Date | null };
      if (row.deactivated_at) {
        res.status(403).json({ error: "Account deactivated" });
        return;
      }
      req.user = { ...payload, role: row.role };
      next();
    })
    .catch((err) => {
      console.error("[hipaa-training-api] requireAuth db check:", err);
      // Do not block sign-in on transient DB blips; JWT still verified above.
      req.user = payload;
      next();
    });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
}
