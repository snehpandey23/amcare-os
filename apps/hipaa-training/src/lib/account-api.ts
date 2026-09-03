import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}/api/auth/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not change password");
}

export async function requestForgotPassword(email: string): Promise<{ message: string }> {
  const base = getTrainingApiUrl();
  if (!base) throw new Error("Auth API is not configured.");
  const res = await fetch(`${base}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) throw new Error(data.error || "Could not start password reset");
  return {
    message: data.message || "If that account exists, we sent a link.",
  };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const base = getTrainingApiUrl();
  if (!base) throw new Error("Auth API is not configured.");
  const res = await fetch(`${base}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not reset password");
}
