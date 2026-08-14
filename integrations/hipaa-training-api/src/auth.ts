/**
 * Password hash and JWT (aligned with oet-lms-submissions).
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const SALT_ROUNDS = 12;
const JWT_SECRET =
  process.env.HIPAA_TRAINING_JWT_SECRET || process.env.JWT_SECRET || "hipaa-training-dev-secret-change-me";
/** Staff portal baseline: ~24h session, then re-login. Override with JWT_EXPIRES_IN. */
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "24h";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
