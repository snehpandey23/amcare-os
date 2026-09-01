/** Staff auth API base — same JWT system as Siya staff portal. */

export const AUTH_TOKEN_STORAGE_KEY = "hipaa-training-jwt";

export function getStaffApiUrl(): string | null {
  const direct = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.trim() || null;
  if (!direct) return null;
  if (typeof window !== "undefined") {
    // Same-origin rewrite → auth API (avoids CORS for Amplify / local)
    return `${window.location.origin}/api/staff-auth`;
  }
  return direct.replace(/\/$/, "");
}

export function isStaffAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.trim());
}
