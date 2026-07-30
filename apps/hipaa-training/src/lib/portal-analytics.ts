import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export async function logToolLinkOpened(label: string, href: string): Promise<void> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) return;
  try {
    await fetch(`${base}/api/portal/tool-link-opened`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ label, href }),
    });
  } catch {
    /* non-blocking */
  }
}

export async function downloadShiftAttendanceCsv(date?: string): Promise<void> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  const res = await fetch(`${base}/api/admin/shift/attendance-log.csv${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const label = date ?? new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shift-attendance-${label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
