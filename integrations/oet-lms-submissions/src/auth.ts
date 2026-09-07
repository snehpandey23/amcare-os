/**
 * Auth helpers: hash password, compare, JWT sign/verify.
 */

import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

const SALT_ROUNDS = 12
const JWT_SECRET = process.env.JWT_SECRET || process.env.OET_LMS_JWT_SECRET || 'oet-lms-dev-secret-change-in-production'
/** String form accepted by jsonwebtoken (e.g. `7d`, `12h`). */
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}
