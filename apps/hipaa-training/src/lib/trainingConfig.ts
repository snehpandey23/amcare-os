/** Client-side training API configuration (public env only). */

export function getTrainingApiUrl(): string | null {
  if (typeof window === "undefined") {
    const u = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.trim();
    return u || null;
  }
  const u = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.trim();
  return u || null;
}

/** When set, users must sign in; progress syncs to the API. */
export function isTrainingAuthRequired(): boolean {
  return !!getTrainingApiUrl();
}

export function isPublicRegistrationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HIPAA_TRAINING_ALLOW_REGISTER === "true";
}

export const AUTH_TOKEN_STORAGE_KEY = "hipaa-training-jwt";
