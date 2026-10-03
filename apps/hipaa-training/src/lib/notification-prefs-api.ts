import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type NotificationPrefKey = "late_start_observer" | "gap_digest";

export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

export type NotificationPrefCatalogItem = {
  key: NotificationPrefKey;
  label: string;
  description: string;
};

export type NotificationPrefsResponse = {
  prefs: NotificationPrefs;
  applicable: NotificationPrefKey[];
  catalog: NotificationPrefCatalogItem[];
  locked: { key: string; reason: string }[];
  deferred: { key: string; note: string }[];
};

async function authHeaders(): Promise<{ base: string; token: string }> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  return { base, token };
}

export async function fetchNotificationPreferences(): Promise<NotificationPrefsResponse> {
  const { base, token } = await authHeaders();
  const res = await fetch(`${base}/api/me/notification-preferences`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as NotificationPrefsResponse & { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not load notification preferences");
  return data;
}

export async function updateNotificationPreferences(
  patch: Partial<NotificationPrefs>,
): Promise<NotificationPrefsResponse> {
  const { base, token } = await authHeaders();
  const res = await fetch(`${base}/api/me/notification-preferences`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  const data = (await res.json().catch(() => ({}))) as NotificationPrefsResponse & { error?: string };
  if (!res.ok) throw new Error(data.error || "Could not save notification preferences");
  return data;
}
